import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useOwnerAuth } from '../context/OwnerAuthContext';
import { PageRoute } from '../types';

interface OwnerVerificationGateProps {
  onNavigate: (page: PageRoute) => void;
}

export const OwnerVerificationGate: React.FC<OwnerVerificationGateProps> = ({ onNavigate }) => {
  const { serverStatus, loginWithPasscode, requestOtp, verifyOtp } = useOwnerAuth();

  const passcodeReady = serverStatus?.configuredMethods.passcode ?? false;
  const otpReady =
    (serverStatus?.configuredMethods.emailOtp ?? false) ||
    (serverStatus?.configuredMethods.whatsappOtp ?? false);
  const neitherConfigured = serverStatus !== null && !passcodeReady && !otpReady;

  const [mode, setMode] = useState<'passcode' | 'otp'>('passcode');
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);
    const res = await loginWithPasscode(email, passcode);
    setSubmitting(false);
    if (!res.ok) {
      setErrorMsg(res.error || 'Owner verification failed.');
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);
    const res = await requestOtp(email);
    setSubmitting(false);
    if (!res.ok) {
      setErrorMsg(res.error || 'Could not send verification code.');
      return;
    }
    setOtpSent(true);
    setInfoMsg(res.detail || '6-digit verification code sent.');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    const res = await verifyOtp(email, otpCode);
    setSubmitting(false);
    if (!res.ok) {
      setErrorMsg(res.error || 'Invalid or expired code.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-14 lg:py-20 space-y-6">
      <button
        type="button"
        onClick={() => onNavigate('shop')}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#183923]/75 hover:text-[#183923] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Store</span>
      </button>

      <div className="rounded-3xl border border-[#A8B18F]/70 bg-[#FDF9F4] p-6 sm:p-10 shadow-sm space-y-6">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-full bg-[#183923] text-[#E9A9AA] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="script-accent text-2xl text-[#CF6C87]">Owner Access Only</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#183923]">
            Studio Owner Verification
          </h1>
          <p className="text-[14px] text-[#183923]/75 max-w-md mx-auto leading-relaxed">
            Products, offers, and collections can only be modified by the verified studio owner (
            <span className="font-mono text-[12.5px] text-[#183923]">
              {serverStatus?.ownerEmailHint || 'registered owner'}
            </span>
            ).
          </p>
        </div>

        {/* Configuration Notice if no server auth secret/OTP is configured yet */}
        {neitherConfigured && (
          <div className="rounded-2xl bg-[#EFE4D3] border border-[#B69A64] p-4 space-y-2 text-[13px] text-[#183923]">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-[#CF6C87] shrink-0" />
              <span>Owner Passcode Not Set Yet</span>
            </div>
            <p className="text-[#183923]/80 leading-relaxed">
              To keep visitors from making changes, editing stays locked until you set{' '}
              <code className="px-1.5 py-0.5 rounded bg-[#FDF9F4] font-mono text-[12px]">
                OWNER_PASSCODE
              </code>{' '}
              (6+ characters) and{' '}
              <code className="px-1.5 py-0.5 rounded bg-[#FDF9F4] font-mono text-[12px]">
                OWNER_EMAIL
              </code>{' '}
              in your environment variables / Secrets (or configure Resend/SMTP for 6-digit Email
              OTP).
            </p>
          </div>
        )}

        {/* Mode Toggle */}
        <div
          className="grid grid-cols-2 gap-2 p-1 rounded-full bg-[#EFE4D3] border border-[#A8B18F]/50"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'passcode'}
            onClick={() => {
              setMode('passcode');
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-[13px] font-medium transition-colors cursor-pointer ${
              mode === 'passcode'
                ? 'bg-[#183923] text-[#F8F0E4]'
                : 'text-[#183923]/75 hover:text-[#183923]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Studio Passcode</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === 'otp'}
            onClick={() => {
              setMode('otp');
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-[13px] font-medium transition-colors cursor-pointer ${
              mode === 'otp'
                ? 'bg-[#183923] text-[#F8F0E4]'
                : 'text-[#183923]/75 hover:text-[#183923]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>6-Digit OTP</span>
          </button>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-[#F9E4E7] border border-[#CF6C87] text-[13px] text-[#183923]"
          >
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div
            role="status"
            className="p-3.5 rounded-xl bg-[#EFE4D3] border border-[#2F7A56]/50 text-[13px] text-[#183923] flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#2F7A56] shrink-0" />
            <span>{infoMsg}</span>
          </div>
        )}

        {mode === 'passcode' ? (
          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="owner-email" className="block text-[13px] font-medium">
                Registered Owner Email *
              </label>
              <input
                id="owner-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter studio owner email"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/70 text-[14px] focus:outline-none focus:border-[#CF6C87]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="owner-passcode" className="block text-[13px] font-medium">
                Owner Passcode *
              </label>
              <input
                id="owner-passcode"
                type="password"
                required
                autoComplete="current-password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter OWNER_PASSCODE"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/70 text-[14px] focus:outline-none focus:border-[#CF6C87]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-full bg-[#183923] text-[#F8F0E4] font-display text-[17px] font-semibold hover:bg-[#2d4a3b] transition-colors cursor-pointer disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-[#E9A9AA]" />
              <span>{submitting ? 'Verifying Owner...' : 'Verify & Unlock Studio'}</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {!otpReady && (
              <p className="rounded-xl bg-[#EFE4D3] border border-[#B69A64]/60 p-3 text-[12.5px] text-[#183923]/80 leading-relaxed">
                Automated Email/WhatsApp OTP delivery is not configured yet. Configure{' '}
                <code className="px-1 rounded bg-[#FDF9F4] font-mono">RESEND_API_KEY</code> or SMTP
                secrets, or switch to the <strong>Studio Passcode</strong> tab.
              </p>
            )}
            <form onSubmit={handleRequestOtp} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="otp-owner-email" className="block text-[13px] font-medium">
                  Registered Owner Email *
                </label>
                <div className="flex gap-2">
                  <input
                    id="otp-owner-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter studio owner email"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/70 text-[14px] focus:outline-none focus:border-[#CF6C87]"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2.5 rounded-xl bg-[#183923] text-[#F8F0E4] text-[13px] font-medium hover:bg-[#2d4a3b] transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap"
                  >
                    {otpSent ? 'Resend Code' : 'Send OTP'}
                  </button>
                </div>
              </div>
            </form>

            {otpSent && (
              <form onSubmit={handleVerifyOtp} className="space-y-3 pt-2 border-t border-[#A8B18F]/35">
                <div className="space-y-1.5">
                  <label htmlFor="owner-otp-code" className="block text-[13px] font-medium">
                    6-Digit Verification Code *
                  </label>
                  <input
                    id="owner-otp-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^\d]/g, ''))}
                    placeholder="6-digit code"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/70 text-[16px] tracking-[0.3em] font-mono text-center focus:outline-none focus:border-[#CF6C87]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || otpCode.length !== 6}
                  className="w-full py-3 rounded-full bg-[#183923] text-[#F8F0E4] font-display text-[17px] font-semibold hover:bg-[#2d4a3b] transition-colors cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Verifying Code...' : 'Confirm Code & Unlock'}
                </button>
              </form>
            )}
          </div>
        )}

        <p className="text-[12px] text-center text-[#183923]/60 pt-2 border-t border-[#A8B18F]/30">
          Protected by server-side HMAC session tokens, strict schema validation &amp; brute-force lockout.
        </p>
      </div>
    </div>
  );
};
