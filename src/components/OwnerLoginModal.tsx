import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useOwnerAuth } from '../context/OwnerAuthContext';

interface OwnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifiedSuccess: () => void;
}

export const OwnerLoginModal: React.FC<OwnerLoginModalProps> = ({
  isOpen,
  onClose,
  onVerifiedSuccess,
}) => {
  const {
    isOwnerVerified,
    ownerEmail: verifiedEmail,
    serverStatus,
    loginWithPasscode,
    requestOtp,
    verifyOtp,
    logout,
    refreshStatus,
  } = useOwnerAuth();

  const [mode, setMode] = useState<'passcode' | 'otp'>('passcode');
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setInfoMsg(null);
      void refreshStatus();
    }
  }, [isOpen, refreshStatus]);

  if (!isOpen) return null;

  const passcodeReady = serverStatus?.configuredMethods.passcode ?? false;
  const otpReady =
    (serverStatus?.configuredMethods.emailOtp ?? false) ||
    (serverStatus?.configuredMethods.whatsappOtp ?? false);
  const neitherConfigured = serverStatus !== null && !passcodeReady && !otpReady;

  const handlePasscodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);
    const res = await loginWithPasscode(email, passcode);
    setSubmitting(false);

    if (!res.ok) {
      setErrorMsg(res.error || 'Owner credentials could not be verified.');
      return;
    }

    setPasscode('');
    onClose();
    onVerifiedSuccess();
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);
    const res = await requestOtp(email);
    setSubmitting(false);

    if (!res.ok) {
      setErrorMsg(res.error || 'Unable to send verification code.');
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
      setErrorMsg(res.error || 'Invalid or expired verification code.');
      return;
    }

    setOtpCode('');
    setOtpSent(false);
    onClose();
    onVerifiedSuccess();
  };

  const handleSignOut = async () => {
    setSubmitting(true);
    await logout();
    setSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183923]/65 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="owner-login-modal-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md rounded-3xl bg-[#FDF9F4] text-[#183923] border border-[#A8B18F] shadow-2xl p-6 sm:p-8 space-y-5 max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close owner login modal"
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center border border-[#A8B18F]/60 text-[#183923] hover:bg-[#EFE4D3] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {isOwnerVerified ? (
          <div className="space-y-5 pt-1">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#183923] text-[#A8B18F] flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="script-accent text-2xl text-[#CF6C87]">Active Studio Session</p>
              <h2
                id="owner-login-modal-title"
                className="font-display text-3xl font-semibold text-[#183923]"
              >
                Verified Studio Owner
              </h2>
              <p className="text-[13.5px] text-[#183923]/75">
                Signed in as <strong className="text-[#183923]">{verifiedEmail}</strong>. Your
                protected session is active for updating products, offers, and collections.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onVerifiedSuccess();
                }}
                className="w-full py-3 rounded-full bg-[#183923] text-[#F8F0E4] font-display text-[17px] font-semibold hover:bg-[#2d4a3b] transition-colors cursor-pointer"
              >
                Open Studio Manager
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleSignOut}
                className="w-full py-2.5 rounded-full border border-[#CF6C87]/60 text-[#CF6C87] text-[13.5px] font-medium hover:bg-[#F9E4E7] transition-colors cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <LogOut className="w-4 h-4" />
                <span>{submitting ? 'Signing out...' : 'Lock & Sign Out'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-center space-y-1.5 pr-4">
              <div className="w-11 h-11 rounded-full bg-[#183923] text-[#E9A9AA] flex items-center justify-center mx-auto">
                <Lock className="w-5 h-5" />
              </div>
              <p className="script-accent text-2xl text-[#CF6C87]">Protected Studio Access</p>
              <h2
                id="owner-login-modal-title"
                className="font-display text-3xl font-semibold text-[#183923]"
              >
                Owner Sign-In
              </h2>
              <p className="text-[13px] text-[#183923]/75 leading-relaxed">
                Validate your credentials against{' '}
                <span className="font-mono text-[11.5px] text-[#183923]">
                  {serverStatus?.ownerEmailHint || 'registered owner'}
                </span>{' '}
                to unlock the Studio Manager.
              </p>
            </div>

            {neitherConfigured && (
              <div className="rounded-2xl bg-[#EFE4D3] border border-[#B69A64] p-3.5 space-y-1.5 text-[12.5px] text-[#183923]">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-[#CF6C87] shrink-0" />
                  <span>Server Passcode Not Configured</span>
                </div>
                <p className="text-[#183923]/80 leading-relaxed">
                  Set <code className="px-1 rounded bg-[#FDF9F4] font-mono">OWNER_EMAIL</code> and{' '}
                  <code className="px-1 rounded bg-[#FDF9F4] font-mono">OWNER_PASSCODE</code> in
                  your environment Secrets so only the owner can unlock updates.
                </p>
              </div>
            )}

            {/* Method Switcher */}
            <div
              className="grid grid-cols-2 gap-1.5 p-1 rounded-full bg-[#EFE4D3] border border-[#A8B18F]/50"
              role="tablist"
              aria-label="Verification method"
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
                className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-[12.5px] font-medium transition-colors cursor-pointer ${
                  mode === 'passcode'
                    ? 'bg-[#183923] text-[#F8F0E4]'
                    : 'text-[#183923]/75 hover:text-[#183923]'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Passcode</span>
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
                className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-[12.5px] font-medium transition-colors cursor-pointer ${
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
                className="p-3 rounded-xl bg-[#F9E4E7] border border-[#CF6C87] text-[12.5px] text-[#183923]"
              >
                {errorMsg}
              </div>
            )}

            {infoMsg && (
              <div
                role="status"
                className="p-3 rounded-xl bg-[#EFE4D3] border border-[#2F7A56]/50 text-[12.5px] text-[#183923] flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#2F7A56] shrink-0" />
                <span>{infoMsg}</span>
              </div>
            )}

            {mode === 'passcode' ? (
              <form onSubmit={handlePasscodeLogin} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label htmlFor="header-owner-email" className="block text-[12.5px] font-medium">
                    Owner Email *
                  </label>
                  <input
                    id="header-owner-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Matches OWNER_EMAIL"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/70 text-[14px] focus:outline-none focus:border-[#CF6C87]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="header-owner-passcode"
                    className="block text-[12.5px] font-medium"
                  >
                    Owner Passcode *
                  </label>
                  <div className="relative">
                    <input
                      id="header-owner-passcode"
                      type={showPasscode ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Matches OWNER_PASSCODE"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/70 text-[14px] focus:outline-none focus:border-[#CF6C87]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode((prev) => !prev)}
                      aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#183923]/60 hover:text-[#183923] cursor-pointer"
                    >
                      {showPasscode ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-full bg-[#183923] text-[#F8F0E4] font-display text-[17px] font-semibold hover:bg-[#2d4a3b] transition-colors cursor-pointer disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#E9A9AA]" />
                  <span>{submitting ? 'Verifying Credentials...' : 'Verify & Open Studio Manager'}</span>
                </button>
              </form>
            ) : (
              <div className="space-y-3.5">
                {!otpReady && (
                  <p className="rounded-xl bg-[#EFE4D3] border border-[#B69A64]/60 p-3 text-[12px] text-[#183923]/80 leading-relaxed">
                    Automated Email/WhatsApp OTP delivery is not configured yet. Configure{' '}
                    <code className="px-1 rounded bg-[#FDF9F4] font-mono">RESEND_API_KEY</code> or
                    SMTP secrets, or switch to the <strong>Passcode</strong> tab.
                  </p>
                )}
                <form onSubmit={handleRequestOtp} className="space-y-2">
                  <label htmlFor="header-otp-email" className="block text-[12.5px] font-medium">
                    Owner Email *
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="header-otp-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Matches OWNER_EMAIL"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/70 text-[13.5px] focus:outline-none focus:border-[#CF6C87]"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2.5 rounded-xl bg-[#183923] text-[#F8F0E4] text-[12.5px] font-medium hover:bg-[#2d4a3b] cursor-pointer disabled:opacity-60 whitespace-nowrap"
                    >
                      {otpSent ? 'Resend' : 'Send Code'}
                    </button>
                  </div>
                </form>

                {otpSent && (
                  <form
                    onSubmit={handleVerifyOtp}
                    className="space-y-3 pt-2 border-t border-[#A8B18F]/35"
                  >
                    <div className="space-y-1.5">
                      <label htmlFor="header-otp-code" className="block text-[12.5px] font-medium">
                        6-Digit Verification Code *
                      </label>
                      <input
                        id="header-otp-code"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^\d]/g, ''))}
                        placeholder="000000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F0E4] border border-[#A8B18F]/70 text-[16px] tracking-[0.3em] font-mono text-center focus:outline-none focus:border-[#CF6C87]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || otpCode.length !== 6}
                      className="w-full py-3 rounded-full bg-[#183923] text-[#F8F0E4] font-display text-[17px] font-semibold hover:bg-[#2d4a3b] transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {submitting ? 'Verifying...' : 'Confirm & Open Studio Manager'}
                    </button>
                  </form>
                )}
              </div>
            )}

            <p className="text-[11.5px] text-center text-[#183923]/60 pt-2 border-t border-[#A8B18F]/30">
              Verified sessions issue a signed 4-hour server token for Studio Manager edits.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
