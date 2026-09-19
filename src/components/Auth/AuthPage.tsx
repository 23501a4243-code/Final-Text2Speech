import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Clock, 
  RotateCw,
  Sparkles,
  KeyRound,
  User,
  LogIn,
  UserPlus
} from 'lucide-react';
import { 
  sendOtpApi, 
  verifyOtpApi, 
  registerApi, 
  loginApi 
} from '../../services/authApi';
import { useAuth } from '../../context/AuthContext';

interface AuthPageProps {
  onSuccess: () => void;
  onCancel?: () => void;
  initialMode?: 'signin' | 'signup' | 'otp';
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export const AuthPage: React.FC<AuthPageProps> = ({ 
  onSuccess, 
  onCancel, 
  initialMode = 'signin' 
}) => {
  const { login } = useAuth();

  // Active Auth Mode: 'signin' | 'signup' | 'otp'
  const [mode, setMode] = useState<'signin' | 'signup' | 'otp'>(initialMode);

  // OTP Sub-Step: 'email' or 'otp' (only used when mode === 'otp')
  const [otpStep, setOtpStep] = useState<'email' | 'otp'>('email');

  // Shared / Sign In Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up Specific Fields
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation Error States for Registration
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Touched states to only show inline errors when user interacted or submitted
  const [touched, setTouched] = useState<{
    name?: boolean;
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});

  // 6-digit OTP fields
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpirySeconds, setOtpExpirySeconds] = useState(600);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
    isExistingUser?: boolean;
  } | null>(null);

  // Resend Cooldown Countdown for OTP
  useEffect(() => {
    let interval: any = null;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCooldown]);

  // Expiry Countdown for OTP
  useEffect(() => {
    let interval: any = null;
    if (mode === 'otp' && otpStep === 'otp' && otpExpirySeconds > 0) {
      interval = setInterval(() => {
        setOtpExpirySeconds((prev) => {
          if (prev <= 1) {
            setStatusMessage({
              type: 'error',
              text: 'OTP expired. Please request a new code.',
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, otpStep, otpExpirySeconds]);

  // Format timer into MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Switch Mode & Clear State
  const switchMode = (newMode: 'signin' | 'signup' | 'otp') => {
    setMode(newMode);
    setStatusMessage(null);
    setFieldErrors({});
    setTouched({});
    if (newMode !== 'otp') {
      setOtpStep('email');
    }
  };

  // Validate Sign Up Fields
  const validateSignUp = (): boolean => {
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!fullName.trim()) {
      errors.name = 'Full Name cannot be empty.';
    } else if (fullName.trim().length < 2) {
      errors.name = 'Full Name must be at least 2 characters long.';
    }

    if (!email.trim()) {
      errors.email = 'Email address cannot be empty.';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email format (e.g. user@example.com).';
    }

    if (!password) {
      errors.password = 'Password cannot be empty.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm Password cannot be empty.';
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Confirm Password must match Password.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Sign In Submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!email.trim() || !isValidEmail(email)) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    if (!password) {
      setStatusMessage({ type: 'error', text: 'Please enter your password.' });
      return;
    }

    setIsLoading(true);
    setLoadingText('Signing in...');
    setStatusMessage(null);

    try {
      const response = await loginApi({
        email: email.trim(),
        password: password,
      });

      if (response.success && response.token && response.user) {
        setStatusMessage({
          type: 'success',
          text: 'Signed in successfully! Redirecting...',
        });

        login(response.token, response.user);

        setTimeout(() => {
          onSuccess();
        }, 500);
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Invalid email or password.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up (Registration) Submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // Run client-side validation
    const isValid = validateSignUp();
    if (!isValid) {
      return;
    }

    setIsLoading(true);
    setLoadingText('Creating account...');
    setStatusMessage(null);

    try {
      const response = await registerApi({
        name: fullName.trim(),
        email: email.trim(),
        password: password,
        confirmPassword: confirmPassword,
      });

      if (response.success) {
        setStatusMessage({
          type: 'success',
          text: 'Account created successfully! Please sign in.',
        });
        // Clear sensitive inputs
        setPassword('');
        setConfirmPassword('');
        // Switch to signin mode with email retained
        setTimeout(() => {
          setMode('signin');
        }, 1200);
      }
    } catch (err: any) {
      if (err.code === 'USER_EXISTS' || err.status === 409) {
        setStatusMessage({
          type: 'error',
          text: 'User already exists. Please sign in.',
          isExistingUser: true,
        });
      } else if (err.field) {
        setFieldErrors((prev) => ({
          ...prev,
          [err.field]: err.message,
        }));
        setStatusMessage({
          type: 'error',
          text: err.message || 'Registration validation failed.',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: err.message || 'Failed to create account. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Send OTP (Preserving OTP Mode)
  const handleSendOtp = async (isResend = false) => {
    if (isLoading) return;
    if (!email || !isValidEmail(email)) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setIsLoading(true);
    setLoadingText(isResend ? 'Resending code...' : 'Sending code...');
    setStatusMessage(null);

    try {
      const response = await sendOtpApi({
        email: email.trim(),
      });

      if (response.success) {
        setOtpStep('otp');
        setResendCooldown(response.cooldownSeconds || 60);
        setOtpExpirySeconds((response.expiresInMinutes || 10) * 60);
        setStatusMessage({
          type: 'success',
          text: 'Verification code sent! Please check your inbox.',
        });

        // Focus first OTP box
        setTimeout(() => {
          if (otpInputRefs.current[0]) {
            otpInputRefs.current[0].focus();
          }
        }, 100);
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to send verification code. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle individual OTP digit change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const chars = value.replace(/\D/g, '').split('').slice(0, 6);
      const newDigits = [...otpDigits];
      chars.forEach((c, idx) => {
        newDigits[idx] = c;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(chars.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    const char = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim().replace(/\D/g, '');
    if (!pastedData) return;

    const chars = pastedData.slice(0, 6).split('');
    const newDigits = [...otpDigits];
    chars.forEach((c, idx) => {
      newDigits[idx] = c;
    });
    setOtpDigits(newDigits);

    const nextFocus = Math.min(chars.length, 5);
    otpInputRefs.current[nextFocus]?.focus();
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length !== 6) {
      setStatusMessage({ type: 'error', text: 'Please enter all 6 digits of the code.' });
      return;
    }

    if (otpExpirySeconds <= 0) {
      setStatusMessage({ type: 'error', text: 'Verification code expired. Please request a new code.' });
      return;
    }

    setIsLoading(true);
    setLoadingText('Verifying code...');
    setStatusMessage(null);

    try {
      const response = await verifyOtpApi({
        email: email.trim(),
        otp: enteredOtp,
      });

      if (response.success && response.token && response.user) {
        setStatusMessage({
          type: 'success',
          text: 'Verified successfully! Redirecting...',
        });

        login(response.token, response.user);

        setTimeout(() => {
          onSuccess();
        }, 500);
      }
    } catch (err: any) {
      const remaining = err.attemptsRemaining;
      let msg = err.message || 'Invalid verification code.';
      if (remaining === 0) {
        msg = 'Too many failed attempts. Code invalidated.';
      }
      setStatusMessage({
        type: 'error',
        text: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        
        {/* Main Glass Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-purple-200/90 bg-white shadow-xl relative overflow-hidden">
          
          {/* Subtle decorative purple glow background */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-200/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Icon & Mode Header */}
          <div className="text-center mb-6 relative">
            <div className="w-13 h-13 mx-auto mb-3.5 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-600 p-[1px] shadow-lg shadow-purple-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[15px] flex items-center justify-center">
                {mode === 'signup' ? (
                  <UserPlus className="w-6 h-6 text-purple-600" />
                ) : mode === 'signin' ? (
                  <LogIn className="w-6 h-6 text-purple-600" />
                ) : (
                  <KeyRound className="w-6 h-6 text-purple-600" />
                )}
              </div>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {mode === 'signup' 
                ? 'Create Your Account' 
                : mode === 'signin' 
                ? 'Welcome Back' 
                : 'Email Verification Code'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              {mode === 'signup'
                ? 'Join SpeechFlow AI to craft authentic, stage-ready speeches'
                : mode === 'signin'
                ? 'Sign in to access your speeches, cue cards & rehearsal studio'
                : 'Enter the 6-digit code dispatched to your email'}
            </p>
          </div>

          {/* Mode Navigation Tabs (Sign In / Sign Up) */}
          {mode !== 'otp' && (
            <div className="flex rounded-xl bg-purple-50/80 p-1 border border-purple-100 mb-6">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'signin'
                    ? 'bg-white text-purple-700 shadow-sm border border-purple-200/80 font-bold'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'signup'
                    ? 'bg-white text-purple-700 shadow-sm border border-purple-200/80 font-bold'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {/* Status / Error Banner */}
          {statusMessage && (
            <div
              className={`mb-5 p-3.5 rounded-xl text-xs font-medium flex flex-col gap-2 transition-all animate-fadeIn ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-purple-50 text-purple-800 border border-purple-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : statusMessage.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                )}
                <span className="flex-1 font-semibold">{statusMessage.text}</span>
              </div>

              {/* Requirement 2: Existing User Detection action button */}
              {statusMessage.isExistingUser && (
                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      switchMode('signin');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Sign In Now</span>
                  </button>
                  <span className="text-[11px] text-slate-500">
                    Use your registered credentials
                  </span>
                </div>
              )}

              {/* Requirement 3: New User Flow direct Sign In button after registration */}
              {statusMessage.type === 'success' && mode === 'signup' && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Proceed to Sign In</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* MODE 1: SIGN IN FORM                                      */}
          {/* ========================================================= */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              
              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-purple-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm text-slate-800 placeholder-slate-400 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password <span className="text-purple-600">*</span>
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm text-slate-800 placeholder-slate-400 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Sign In Button */}
              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{loadingText}</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Requirement 5: Clear distinction between Sign In & Sign Up */}
              <div className="pt-3 border-t border-slate-100 flex flex-col items-center gap-2 text-xs text-slate-500">
                <p>
                  New user?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="font-bold text-purple-600 hover:text-purple-800 hover:underline"
                  >
                    Sign Up
                  </button>
                </p>

                {/* Retain OTP sign in option */}
                <button
                  type="button"
                  onClick={() => switchMode('otp')}
                  className="text-slate-400 hover:text-purple-600 transition-colors flex items-center gap-1 text-[11px]"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Sign in with Email OTP code</span>
                </button>
              </div>

            </form>
          )}

          {/* ========================================================= */}
          {/* MODE 2: SIGN UP / REGISTRATION FORM                       */}
          {/* ========================================================= */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              
              {/* Field 1: Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-purple-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (touched.name) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          name: !e.target.value.trim() 
                            ? 'Full Name cannot be empty.' 
                            : e.target.value.trim().length < 2 
                            ? 'Full Name must be at least 2 characters.' 
                            : undefined
                        }));
                      }
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, name: true }));
                      if (!fullName.trim()) {
                        setFieldErrors((prev) => ({ ...prev, name: 'Full Name cannot be empty.' }));
                      } else if (fullName.trim().length < 2) {
                        setFieldErrors((prev) => ({ ...prev, name: 'Full Name must be at least 2 characters.' }));
                      } else {
                        setFieldErrors((prev) => ({ ...prev, name: undefined }));
                      }
                    }}
                    placeholder="e.g. Eleanor Vance"
                    autoFocus
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none text-sm transition-all font-sans ${
                      touched.name && fieldErrors.name
                        ? 'border-rose-300 bg-rose-50/50 text-rose-900 focus:ring-2 focus:ring-rose-200'
                        : 'border-slate-200 bg-slate-50/80 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-slate-800'
                    }`}
                  />
                </div>
                {/* Field-level validation error */}
                {touched.name && fieldErrors.name && (
                  <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1 animate-fadeIn">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.name}</span>
                  </p>
                )}
              </div>

              {/* Field 2: Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address <span className="text-purple-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched.email) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          email: !e.target.value.trim()
                            ? 'Email address cannot be empty.'
                            : !isValidEmail(e.target.value)
                            ? 'Please provide a valid email address.'
                            : undefined
                        }));
                      }
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, email: true }));
                      if (!email.trim()) {
                        setFieldErrors((prev) => ({ ...prev, email: 'Email address cannot be empty.' }));
                      } else if (!isValidEmail(email)) {
                        setFieldErrors((prev) => ({ ...prev, email: 'Please provide a valid email address.' }));
                      } else {
                        setFieldErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none text-sm transition-all font-sans ${
                      touched.email && fieldErrors.email
                        ? 'border-rose-300 bg-rose-50/50 text-rose-900 focus:ring-2 focus:ring-rose-200'
                        : 'border-slate-200 bg-slate-50/80 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-slate-800'
                    }`}
                  />
                </div>
                {/* Field-level validation error */}
                {touched.email && fieldErrors.email && (
                  <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1 animate-fadeIn">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.email}</span>
                  </p>
                )}
              </div>

              {/* Field 3: Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password <span className="text-purple-600">*</span> <span className="text-slate-400 font-normal lowercase">(min 6 chars)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          password: !e.target.value
                            ? 'Password cannot be empty.'
                            : e.target.value.length < 6
                            ? 'Password must be at least 6 characters long.'
                            : undefined
                        }));
                      }
                      if (touched.confirmPassword && confirmPassword) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value !== confirmPassword
                            ? 'Confirm Password must match Password.'
                            : undefined
                        }));
                      }
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, password: true }));
                      if (!password) {
                        setFieldErrors((prev) => ({ ...prev, password: 'Password cannot be empty.' }));
                      } else if (password.length < 6) {
                        setFieldErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters long.' }));
                      } else {
                        setFieldErrors((prev) => ({ ...prev, password: undefined }));
                      }
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border outline-none text-sm transition-all font-sans ${
                      touched.password && fieldErrors.password
                        ? 'border-rose-300 bg-rose-50/50 text-rose-900 focus:ring-2 focus:ring-rose-200'
                        : 'border-slate-200 bg-slate-50/80 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-slate-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Field-level validation error */}
                {touched.password && fieldErrors.password && (
                  <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1 animate-fadeIn">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.password}</span>
                  </p>
                )}
              </div>

              {/* Field 4: Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password <span className="text-purple-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (touched.confirmPassword) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          confirmPassword: !e.target.value
                            ? 'Confirm Password cannot be empty.'
                            : e.target.value !== password
                            ? 'Confirm Password must match Password.'
                            : undefined
                        }));
                      }
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, confirmPassword: true }));
                      if (!confirmPassword) {
                        setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Confirm Password cannot be empty.' }));
                      } else if (confirmPassword !== password) {
                        setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Confirm Password must match Password.' }));
                      } else {
                        setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                      }
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border outline-none text-sm transition-all font-sans ${
                      touched.confirmPassword && fieldErrors.confirmPassword
                        ? 'border-rose-300 bg-rose-50/50 text-rose-900 focus:ring-2 focus:ring-rose-200'
                        : 'border-slate-200 bg-slate-50/80 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-slate-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Field-level validation error */}
                {touched.confirmPassword && fieldErrors.confirmPassword && (
                  <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1 animate-fadeIn">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.confirmPassword}</span>
                  </p>
                )}
              </div>

              {/* Submit Sign Up Button */}
              <button
                type="submit"
                disabled={
                  isLoading || 
                  !fullName.trim() || 
                  !email.trim() || 
                  !password || 
                  !confirmPassword || 
                  Boolean(fieldErrors.name || fieldErrors.email || fieldErrors.password || fieldErrors.confirmPassword)
                }
                className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{loadingText}</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Requirement 5: Already have an account? Sign In */}
              <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
                <span>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="font-bold text-purple-600 hover:text-purple-800 hover:underline"
                >
                  Sign In
                </button>
              </div>

            </form>
          )}

          {/* ========================================================= */}
          {/* MODE 3: EMAIL OTP CODE (Preserved from original feature)   */}
          {/* ========================================================= */}
          {mode === 'otp' && (
            <div>
              {otpStep === 'email' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendOtp(false);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Email Address <span className="text-purple-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoFocus
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm text-slate-800 placeholder-slate-400 transition-all font-sans"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{loadingText}</span>
                      </>
                    ) : (
                      <>
                        <span>Send 6-Digit Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="text-xs text-purple-700 hover:text-purple-900 font-semibold inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Password Sign In</span>
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs">
                    <div className="flex items-center gap-2 truncate text-slate-700">
                      <Mail className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="truncate font-semibold">{email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('email');
                        setStatusMessage(null);
                      }}
                      className="text-purple-700 hover:text-purple-900 font-semibold underline shrink-0 text-xs ml-2"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 text-center">
                      6-Digit Verification Code
                    </label>
                    <div 
                      onPaste={handlePaste}
                      className="flex items-center justify-center gap-2 sm:gap-2.5"
                    >
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-2xl font-bold font-mono rounded-xl border outline-none transition-all ${
                            digit
                              ? 'border-purple-600 bg-purple-50/40 text-purple-900 shadow-sm ring-2 ring-purple-500/20'
                              : 'border-slate-200 bg-slate-50/80 text-slate-800 focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs px-1">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      <span>
                        Expires in: <strong className={otpExpirySeconds < 60 ? 'text-rose-600' : 'text-slate-800'}>{formatTimer(otpExpirySeconds)}</strong>
                      </span>
                    </div>

                    <div>
                      {resendCooldown > 0 ? (
                        <span className="text-slate-400">
                          Resend in {resendCooldown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleSendOtp(true)}
                          className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 hover:underline"
                        >
                          <RotateCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                          <span>Resend OTP</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpDigits.some((d) => !d) || otpExpirySeconds <= 0}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{loadingText}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify & Continue</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="text-xs text-slate-500 hover:text-purple-700 inline-flex items-center gap-1 font-medium transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Cancel button if provided */}
          {onCancel && (
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Cancel and return to app
              </button>
            </div>
          )}

        </div>

        {/* Security Trust Badge */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Bcrypt Password Encryption • Secure Session Authentication</span>
        </div>

      </div>
    </div>
  );
};
