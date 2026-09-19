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
  User
} from 'lucide-react';
import { sendOtpApi, verifyOtpApi } from '../../services/authApi';
import { useAuth } from '../../context/AuthContext';

interface AuthPageProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onCancel }) => {
  const { login } = useAuth();

  // Form Step: 'email' or 'otp'
  const [step, setStep] = useState<'email' | 'otp'>('email');

  // Input Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');

  // 6-digit OTP fields
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timers & Loading
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Sending OTP...');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpirySeconds, setOtpExpirySeconds] = useState(600); // 10 minutes
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const [deliveryProvider, setDeliveryProvider] = useState<string | null>(null);

  // Resend Cooldown Countdown
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

  // Expiry Countdown
  useEffect(() => {
    let interval: any = null;
    if (step === 'otp' && otpExpirySeconds > 0) {
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
  }, [step, otpExpirySeconds]);

  // Format timer into MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle Send OTP
  const handleSendOtp = async (isResend = false) => {
    if (!email || !email.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    if (!isResend && password && password.length < 6) {
      setStatusMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsLoading(true);
    setLoadingText(isResend ? 'Resending OTP...' : 'Sending OTP...');
    setStatusMessage(null);

    try {
      const response = await sendOtpApi({
        email: email.trim(),
        password: password ? password.trim() : undefined,
        name: name ? name.trim() : undefined,
      });

      if (response.success) {
        setStep('otp');
        setResendCooldown(response.cooldownSeconds || 60);
        setOtpExpirySeconds((response.expiresInMinutes || 10) * 60);
        setDeliveryProvider(response.deliveryProvider || null);
        setStatusMessage({
          type: 'success',
          text: 'OTP sent successfully! Please check your inbox.',
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
        text: err.message || 'Failed to send OTP. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle individual OTP digit change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle pasting into single box
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

    // Auto-advance to next box if char was entered
    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Paste event on OTP container
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

    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length !== 6) {
      setStatusMessage({ type: 'error', text: 'Please enter all 6 digits of the code.' });
      return;
    }

    if (otpExpirySeconds <= 0) {
      setStatusMessage({ type: 'error', text: 'OTP expired. Please request a new one.' });
      return;
    }

    setIsLoading(true);
    setLoadingText('Verifying OTP...');
    setStatusMessage(null);

    try {
      const response = await verifyOtpApi({
        email: email.trim(),
        otp: enteredOtp,
      });

      if (response.success && response.token && response.user) {
        setStatusMessage({
          type: 'success',
          text: 'Email verified successfully! Logging you in...',
        });

        login(response.token, response.user);

        setTimeout(() => {
          onSuccess();
        }, 800);
      }
    } catch (err: any) {
      const remaining = err.attemptsRemaining;
      let msg = err.message || 'Invalid OTP';
      if (remaining === 0) {
        msg = 'Too many attempts. This OTP has expired.';
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Main Card */}
        <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-purple-200/90 bg-white shadow-xl relative overflow-hidden">
          
          {/* Subtle decorative purple glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-200/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

          {/* Top Header */}
          <div className="text-center mb-8 relative">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-600 p-[1px] shadow-lg shadow-purple-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[15px] flex items-center justify-center">
                {step === 'email' ? (
                  <KeyRound className="w-7 h-7 text-purple-600" />
                ) : (
                  <ShieldCheck className="w-7 h-7 text-purple-600" />
                )}
              </div>
            </div>

            {step === 'email' ? (
              <>
                <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-sm text-slate-500 mt-1.5 font-medium">
                  Enter your email to continue
                </p>
              </>
            ) : (
              <>
                <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">
                  Verify Your Email
                </h2>
                <p className="text-sm text-slate-500 mt-1.5 font-medium">
                  Enter the 6-digit verification code sent to your email.
                </p>
              </>
            )}
          </div>

          {/* Status Message Banner */}
          {statusMessage && (
            <div
              className={`mb-6 p-3.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all animate-fadeIn ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-purple-50 text-purple-800 border border-purple-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              )}
              <span className="flex-1">{statusMessage.text}</span>
            </div>
          )}

          {/* STEP 1: Email & Password Form */}
          {step === 'email' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendOtp(false);
              }}
              className="space-y-5"
            >
              {/* Optional Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm text-slate-800 placeholder-slate-400 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Email Address */}
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
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm text-slate-800 placeholder-slate-400 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password <span className="text-slate-400 font-normal lowercase">(min 6 chars)</span>
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm text-slate-800 placeholder-slate-400 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit: Send OTP */}
              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{loadingText}</span>
                  </>
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                <span>We'll send a secure 6-digit one-time password to your email.</span>
              </div>
            </form>
          )}

          {/* STEP 2: OTP Verification Screen */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              
              {/* Recipient Email Chip */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs">
                <div className="flex items-center gap-2 truncate text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="truncate font-semibold">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setStatusMessage(null);
                  }}
                  className="text-purple-700 hover:text-purple-900 font-semibold underline shrink-0 text-xs ml-2"
                >
                  Change
                </button>
              </div>

              {/* 6-Digit Inputs Container */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 text-center">
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

              {/* Timer Bar: Expiry & Resend */}
              <div className="flex items-center justify-between text-xs px-1">
                {/* Expiry Timer */}
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>
                    Expires in: <strong className={otpExpirySeconds < 60 ? 'text-rose-600' : 'text-slate-800'}>{formatTimer(otpExpirySeconds)}</strong>
                  </span>
                </div>

                {/* Resend Option */}
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

              {/* Verify & Continue Button */}
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

              {/* Back to Email */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setStatusMessage(null);
                  }}
                  className="text-xs text-slate-500 hover:text-purple-700 inline-flex items-center gap-1 font-medium transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to email entry</span>
                </button>
              </div>

            </form>
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
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Real-time Email OTP Verification • Secure Session Auth</span>
        </div>

      </div>
    </div>
  );
};
