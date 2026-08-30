import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, User as UserIcon, ArrowRight, ArrowLeft, KeyRound, CheckCircle2, Shield, Info } from 'lucide-react';

interface AuthPageProps {
  onBackToHome?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBackToHome }) => {
  const { login, register, sendOTP, verifyOTP } = useAuth();
  const [authStep, setAuthStep] = useState<'form' | 'otp'>('form');
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [tier, setTier] = useState('pro');
  
  // OTP state
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpPreview, setOtpPreview] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(60);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval: any;
    if (authStep === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [authStep, timer]);

  const handleSendOTPDirect = async () => {
    if (!email) {
      setError('Please enter your institutional email to receive an OTP code.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await sendOTP(email, isRegister ? 'register' : 'login');
      setOtpPreview(res.otp_preview);
      setAuthStep('otp');
      setTimer(60);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await verifyOTP(email, code, fullName, tier);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, fullName, tier);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val.charAt(val.length - 1);
    }
    const newArr = [...otpCode];
    newArr[index] = val;
    setOtpCode(newArr);

    // Auto-advance focus to next input box
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleAutoFillPreviewOTP = () => {
    if (otpPreview) {
      const digits = otpPreview.split('');
      setOtpCode(digits);
    }
  };

  const handleFillCredentials = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setIsRegister(false);
  };

  return (
    <div className="min-h-screen bg-[#FFFBE9] paper-grain flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E3CAA5]/40 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#CEAB93]/30 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 space-y-6">
        {onBackToHome && (
          <div className="text-center">
            <button
              onClick={onBackToHome}
              className="text-xs font-sans font-semibold text-[#8C705B] hover:text-[#3F2E22] transition-colors flex items-center justify-center space-x-1.5 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Product Overview</span>
            </button>
          </div>
        )}

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#E3CAA5] border border-[#AD8B73]/30 shadow-warm-sm mb-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6 stroke-[#5C4433]"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 20V10a8 8 0 0 1 16 0v10" />
              <path d="M8 20v-6a4 4 0 0 1 8 0v6" />
              <circle cx="12" cy="7" r="1.5" fill="#AD8B73" stroke="none" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#3F2E22] tracking-tight">
            MarketPulse Pro Terminal
          </h1>
          <p className="text-xs text-[#8C705B] font-sans">
            Strict Institutional Multi-Tenant Authentication
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#F5EFE0] border border-[#AD8B73]/30 rounded-2xl p-7 shadow-warm-lg space-y-6">
          {error && (
            <div className="p-3 bg-[#A84236]/15 border border-[#A84236]/30 rounded-xl text-xs text-[#A84236] font-sans">
              {error}
            </div>
          )}

          {authStep === 'form' ? (
            <>
              <div className="flex border-b border-[#AD8B73]/20 pb-1">
                <button
                  onClick={() => { setIsRegister(false); setError(null); }}
                  className={`flex-1 pb-3 text-xs font-serif font-bold uppercase tracking-wider transition-all border-b-2 ${
                    !isRegister ? 'border-[#AD8B73] text-[#3F2E22]' : 'border-transparent text-[#8C705B] hover:text-[#5C4433]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setIsRegister(true); setError(null); }}
                  className={`flex-1 pb-3 text-xs font-serif font-bold uppercase tracking-wider transition-all border-b-2 ${
                    isRegister ? 'border-[#AD8B73] text-[#3F2E22]' : 'border-transparent text-[#8C705B] hover:text-[#5C4433]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                  <div>
                    <label className="block text-xs font-sans text-[#5C4433] mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-[#8C705B] absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#3F2E22] placeholder-[#8C705B]/60 focus:outline-none focus:border-[#AD8B73] shadow-warm-sm"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-sans text-[#5C4433] mb-1">Institutional Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8C705B] absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="trader@fund.com"
                      className="w-full bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#3F2E22] placeholder-[#8C705B]/60 focus:outline-none focus:border-[#AD8B73] shadow-warm-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans text-[#5C4433] mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8C705B] absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#3F2E22] placeholder-[#8C705B]/60 focus:outline-none focus:border-[#AD8B73] shadow-warm-sm"
                    />
                  </div>
                </div>

                {isRegister && (
                  <div>
                    <label className="block text-xs font-sans text-[#5C4433] mb-1">Subscription Tier</label>
                    <select
                      value={tier}
                      onChange={(e) => setTier(e.target.value)}
                      className="w-full bg-[#FFFBE9] border border-[#AD8B73]/30 rounded-xl px-3 py-2.5 text-xs text-[#3F2E22] focus:outline-none focus:border-[#AD8B73] shadow-warm-sm"
                    >
                      <option value="pro">Pro Trader ($29/mo)</option>
                      <option value="enterprise">Institutional Enterprise ($299/mo)</option>
                      <option value="free">Free Explorer</option>
                    </select>
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-liquid w-full bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] text-xs font-semibold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-warm-md disabled:opacity-50"
                  >
                    <span>{loading ? 'Authenticating...' : isRegister ? 'Launch Account' : 'Authenticate Session'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSendOTPDirect}
                    className="w-full py-2 text-xs font-sans text-[#8C705B] hover:text-[#3F2E22] flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#AD8B73]" />
                    <span>Or Sign in with 6-Digit OTP</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* OTP VERIFICATION VIEW */
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#3F2E22]">
                  Two-Factor Security Verification
                </h3>
                <p className="text-xs text-[#8C705B] font-sans">
                  Enter the 6-digit one-time passcode sent to <strong className="text-[#3F2E22]">{email}</strong>
                </p>
              </div>

              {otpPreview && (
                <div className="p-3 bg-[#E3CAA5]/40 border border-[#AD8B73]/30 rounded-xl text-xs font-mono text-center space-y-1">
                  <span className="text-[10px] text-[#8C705B] uppercase block">Security Passcode:</span>
                  <div className="flex items-center justify-center space-x-2">
                    <strong className="text-base tracking-widest text-[#3F2E22]">{otpPreview}</strong>
                    <button
                      type="button"
                      onClick={handleAutoFillPreviewOTP}
                      className="px-2 py-0.5 rounded bg-[#AD8B73] text-[#FFFBE9] text-[10px] font-sans hover:bg-[#96755E]"
                    >
                      Auto-Fill
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleVerifyOTP} className="space-y-5">
                {/* 6 Digit Input Boxes */}
                <div className="flex justify-center space-x-2">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      className="w-11 h-12 text-center text-lg font-mono font-bold bg-[#FFFBE9] border border-[#AD8B73]/40 rounded-xl focus:outline-none focus:border-[#AD8B73] focus:ring-2 focus:ring-[#AD8B73]/30 shadow-warm-sm text-[#3F2E22]"
                    />
                  ))}
                </div>

                <div className="text-center text-xs font-mono text-[#8C705B]">
                  {timer > 0 ? (
                    <span>Code expires in: <strong>{timer}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOTPDirect}
                      className="text-[#AD8B73] font-bold hover:underline"
                    >
                      Resend New OTP Code
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={loading || otpCode.join('').length < 6}
                    className="btn-liquid w-full bg-[#AD8B73] hover:bg-[#96755E] text-[#FFFBE9] text-xs font-semibold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-warm-md disabled:opacity-50"
                  >
                    <span>{loading ? 'Verifying...' : 'Verify Code & Enter Terminal'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => { setAuthStep('form'); setError(null); }}
                    className="w-full py-2 text-xs font-sans text-[#8C705B] hover:text-[#3F2E22]"
                  >
                    ← Back to Password Login
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security & Compliance Footer */}
          <div className="pt-4 border-t border-[#AD8B73]/20 text-center">
            <p className="text-[11px] text-[#8C705B] font-sans">
              Protected by 256-bit institutional encryption and SOC-2 security protocols.
            </p>
          </div>
        </div>

        {/* Security Badges */}
        <div className="flex items-center justify-center space-x-4 text-[11px] text-[#8C705B] font-sans">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2D8A68]" /> Strict 256-Bit Sessions
          </span>
          <span>•</span>
          <span>SOC-2 &amp; Persistent Storage</span>
        </div>
      </div>
    </div>
  );
};
