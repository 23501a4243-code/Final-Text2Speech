import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '../services/emailService.js';
import { db } from '../db/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'toastcraft_super_secret_jwt_key_2026_dev_mode';

/**
 * Validate email format
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Clean up expired OTPs every 15 minutes using persistent db
 */
setInterval(() => {
  db.cleanupExpiredOtps(3600000).catch(err => {
    console.warn('Background OTP cleanup error:', err.message);
  });
}, 15 * 60 * 1000);

/**
 * POST /api/auth/send-otp
 * Generates and dispatches a 6-digit OTP to the user's real email
 */
export async function sendOtp(req, res) {
  try {
    const { email, password, name, purpose } = req.body;

    // 'signup' = new account registration OTP, 'login' = pre-existing passwordless OTP sign-in.
    // Defaults to 'login' so existing behaviour is untouched.
    const otpPurpose = purpose === 'signup' ? 'signup' : 'login';

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        field: 'email',
        message: 'Please provide a valid email address.' 
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // --- Registration-only validation & duplicate account guard ---
    if (otpPurpose === 'signup') {
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          field: 'name',
          message: 'Full Name must be at least 2 characters long.',
        });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({
          success: false,
          field: 'password',
          message: 'Password must be at least 6 characters long.',
        });
      }

      // Never send a registration OTP to an address that already has an account
      const existingUser = await db.findUserByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          code: 'USER_EXISTS',
          message: 'User already exists. Please sign in.',
        });
      }
    }

    // Check resend cooldown in persistent DB
    const existing = await db.getOtp(normalizedEmail);
    const now = Date.now();

    if (existing && !existing.used && now < existing.resendAvailableAt) {
      const waitSeconds = Math.ceil((existing.resendAvailableAt - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds}s before requesting a new code.`,
        cooldownRemaining: waitSeconds,
      });
    }

    // Check hourly limit (max 10 OTP requests per hour per email)
    const hourKey = `${normalizedEmail}_${Math.floor(now / 3600000)}`;
    const hourCount = await db.getRateLimit(hourKey);
    if (hourCount >= 10) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests for this email. Please try again in an hour.',
      });
    }
    await db.incrementRateLimit(hourKey);

    // Optional password validation (if provided)
    let passwordHash = null;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters.',
        });
      }
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Generate cryptographically secure 6-digit numeric OTP
    // 100000 to 999999 inclusive
    const otpNumber = crypto.randomInt(100000, 1000000);
    const otp = otpNumber.toString();

    // Set TTL: signup codes expire in 5 minutes, login codes keep the original 10.
    // 60 seconds resend cooldown, 5 attempts max.
    const expiresInMinutes = otpPurpose === 'signup' ? 5 : 10;
    const expiresAt = now + expiresInMinutes * 60 * 1000;
    const resendAvailableAt = now + 60 * 1000;

    await db.setOtp(normalizedEmail, {
      otp,
      expiresAt,
      resendAvailableAt,
      attemptsRemaining: 5,
      used: false,
      passwordHash,
      name: (name && name.trim()) || normalizedEmail.split('@')[0],
      createdAt: now,
      purpose: otpPurpose,
    });

    // Send real email
    const emailResult = await sendOtpEmail({
      email: normalizedEmail,
      otp,
      expirationMinutes: expiresInMinutes,
    });

    // Never log real verification codes outside local development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n======================================================`);
      console.log(`🔑 [OTP DISPATCH] 6-Digit Code for ${normalizedEmail}: >>> ${otp} <<<`);
      console.log(`======================================================\n`);
    } else {
      console.log(`[OTP DISPATCH] Verification code sent (purpose: ${otpPurpose}).`);
    }

    return res.json({
      success: true,
      message: 'Verification code sent successfully to ' + normalizedEmail,
      cooldownSeconds: 60,
      expiresInMinutes,
      email: normalizedEmail,
      deliveryProvider: emailResult.provider,
      purpose: otpPurpose,
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to dispatch verification email. Please check your email configuration.',
    });
  }
}

/**
 * POST /api/auth/verify-otp
 * Verifies the 6-digit OTP and generates an authenticated user session
 */
export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and 6-digit verification code are required.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const record = await db.getOtp(normalizedEmail);

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'No verification code was requested for this email. Please request a new code.',
      });
    }

    if (record.used) {
      return res.status(400).json({
        success: false,
        message: 'This verification code has already been used. Please request a new one.',
      });
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'This verification code has expired. Please request a new one.',
      });
    }

    if (record.attemptsRemaining <= 0) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed verification attempts. This code is invalidated. Please request a new code.',
      });
    }

    // Secure string comparison
    if (record.otp !== cleanOtp) {
      const remaining = record.attemptsRemaining - 1;
      await db.updateOtp(normalizedEmail, { attemptsRemaining: remaining });
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        attemptsRemaining: remaining,
      });
    }

    // Mark as verified and used in persistent storage
    await db.updateOtp(normalizedEmail, { used: true });

    // -----------------------------------------------------------------
    // SIGN UP / REGISTRATION FLOW
    // A signup OTP completes account creation. It never issues a session;
    // the user continues into the existing Sign In flow, exactly like the
    // direct /api/auth/register endpoint behaves.
    // -----------------------------------------------------------------
    if (record.purpose === 'signup') {
      const alreadyExists = await db.findUserByEmail(normalizedEmail);
      if (alreadyExists) {
        await db.deleteOtp(normalizedEmail);
        return res.status(409).json({
          success: false,
          code: 'USER_EXISTS',
          message: 'User already exists. Please sign in.',
        });
      }

      if (!record.passwordHash) {
        return res.status(400).json({
          success: false,
          message: 'Registration details are missing. Please start sign up again.',
        });
      }

      const newUser = await db.createUser({
        id: 'usr_' + crypto.randomBytes(8).toString('hex'),
        email: normalizedEmail,
        name: record.name || normalizedEmail.split('@')[0],
        passwordHash: record.passwordHash,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        verified: true,
      });

      // Invalidate the code immediately after successful registration
      await db.deleteOtp(normalizedEmail);

      return res.status(201).json({
        success: true,
        registered: true,
        message: 'Account created successfully! Please sign in.',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      });
    }

    // -----------------------------------------------------------------
    // EXISTING PASSWORDLESS OTP SIGN-IN FLOW (unchanged)
    // -----------------------------------------------------------------
    // Create or update user account in persistent storage
    let user = await db.findUserByEmail(normalizedEmail);
    if (!user) {
      user = await db.createUser({
        id: 'usr_' + crypto.randomBytes(8).toString('hex'),
        email: normalizedEmail,
        name: record.name || normalizedEmail.split('@')[0],
        passwordHash: record.passwordHash,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        verified: true,
      });
    } else {
      user = await db.updateUser(normalizedEmail, {
        lastLoginAt: new Date().toISOString(),
        verified: true,
        ...(record.passwordHash ? { passwordHash: record.passwordHash } : {}),
      });
    }

    // Generate JWT session token (valid 7 days)
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Email verified successfully! Welcome to SpeechFlow AI.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        verified: true,
        lastLoginAt: user.lastLoginAt,
      },
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({
      success: false,
      message: 'An internal error occurred during verification. Please try again.',
    });
  }
}

/**
 * GET /api/auth/me
 * Retrieves current authenticated user session from persistent database
 */
export async function getMe(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user from persistent database
    const user = await db.findUserByEmail(decoded.email);
    if (!user) {
      // In case user record not found, fallback to decoded JWT
      return res.json({
        success: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          verified: true,
        },
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        verified: user.verified,
        lastLoginAt: user.lastLoginAt,
      },
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid token.',
    });
  }
}

/**
 * POST /api/auth/logout
 * Terminates user session
 */
export async function logout(req, res) {
  return res.json({
    success: true,
    message: 'Logged out successfully.',
  });
}

/**
 * POST /api/auth/register
 * Direct user registration with full name, email, and password
 */
export async function register(req, res) {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        field: 'name',
        message: 'Full Name cannot be empty.',
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        field: 'name',
        message: 'Full Name must be at least 2 characters long.',
      });
    }

    // Validate email
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'Please provide a valid email address.',
      });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        field: 'password',
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Validate confirmPassword if provided
    if (confirmPassword !== undefined && confirmPassword !== null && confirmPassword !== password) {
      return res.status(400).json({
        success: false,
        field: 'confirmPassword',
        message: 'Confirm Password must match Password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await db.findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        code: 'USER_EXISTS',
        message: 'User already exists. Please sign in.',
      });
    }

    // Securely hash password with bcrypt (salt rounds: 10)
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in persistent database
    const newUser = await db.createUser({
      id: 'usr_' + crypto.randomBytes(8).toString('hex'),
      email: normalizedEmail,
      name: name.trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      verified: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Please sign in.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create account. Please try again.',
    });
  }
}

/**
 * POST /api/auth/login
 * Authenticates user credentials and issues JWT session token
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Lookup user in persistent database
    const user = await db.findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if user has a password set
    if (!user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'This account was registered via Email OTP. Please sign in using verification code.',
      });
    }

    // Secure bcrypt comparison
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Update lastLoginAt
    const updated = await db.updateUser(normalizedEmail, {
      lastLoginAt: new Date().toISOString(),
    });

    // Generate JWT session token (7 days)
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Signed in successfully! Welcome back.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        verified: user.verified ?? true,
        lastLoginAt: updated?.lastLoginAt || user.lastLoginAt,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An internal error occurred during sign-in. Please try again.',
    });
  }
}

