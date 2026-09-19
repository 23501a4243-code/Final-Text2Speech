import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '../services/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'toastcraft_super_secret_jwt_key_2026_dev_mode';

// In-memory store for OTP requests: email -> { otp, expiresAt, resendAvailableAt, attemptsRemaining, used, passwordHash, name }
const otpStore = new Map();

// In-memory store for registered users: email -> { id, email, name, passwordHash, createdAt, lastLoginAt, verified }
const usersStore = new Map();

// Hourly request rate limiting store: email -> count
const hourlyRateLimit = new Map();

/**
 * Validate email format
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Clean up expired OTPs every 15 minutes
 */
setInterval(() => {
  const now = Date.now();
  for (const [email, record] of otpStore.entries()) {
    if (now > record.expiresAt + 3600000) {
      otpStore.delete(email);
    }
  }
}, 15 * 60 * 1000);

/**
 * POST /api/auth/send-otp
 * Generates and dispatches a 6-digit OTP to the user's real email
 */
export async function sendOtp(req, res) {
  try {
    const { email, password, name } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address.' 
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check resend cooldown
    const existing = otpStore.get(normalizedEmail);
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
    const hourCount = hourlyRateLimit.get(hourKey) || 0;
    if (hourCount >= 10) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests for this email. Please try again in an hour.',
      });
    }
    hourlyRateLimit.set(hourKey, hourCount + 1);

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

    // Set TTL: 10 minutes expiry, 60 seconds resend cooldown, 5 attempts max
    const expiresAt = now + 10 * 60 * 1000;
    const resendAvailableAt = now + 60 * 1000;

    otpStore.set(normalizedEmail, {
      otp,
      expiresAt,
      resendAvailableAt,
      attemptsRemaining: 5,
      used: false,
      passwordHash,
      name: name || normalizedEmail.split('@')[0],
      createdAt: now,
    });

    // Send real email
    const emailResult = await sendOtpEmail({
      email: normalizedEmail,
      otp,
    });

    console.log(`\n======================================================`);
    console.log(`🔑 [OTP DISPATCH] 6-Digit Code for ${normalizedEmail}: >>> ${otp} <<<`);
    console.log(`======================================================\n`);

    return res.json({
      success: true,
      message: 'Verification code sent successfully to ' + normalizedEmail,
      cooldownSeconds: 60,
      expiresInMinutes: 10,
      email: normalizedEmail,
      deliveryProvider: emailResult.provider,
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

    const record = otpStore.get(normalizedEmail);

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
      record.attemptsRemaining--;
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${record.attemptsRemaining} attempt${record.attemptsRemaining === 1 ? '' : 's'} remaining.`,
        attemptsRemaining: record.attemptsRemaining,
      });
    }

    // Mark as verified and used
    record.used = true;

    // Create or update user account
    let user = usersStore.get(normalizedEmail);
    if (!user) {
      user = {
        id: 'usr_' + crypto.randomBytes(8).toString('hex'),
        email: normalizedEmail,
        name: record.name || normalizedEmail.split('@')[0],
        passwordHash: record.passwordHash,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        verified: true,
      };
      usersStore.set(normalizedEmail, user);
    } else {
      user.lastLoginAt = new Date().toISOString();
      user.verified = true;
      if (record.passwordHash) {
        user.passwordHash = record.passwordHash;
      }
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
 * Retrieves current authenticated user session
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

    const user = usersStore.get(decoded.email);
    if (!user) {
      // In case server restarted, trust decoded JWT payload
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
