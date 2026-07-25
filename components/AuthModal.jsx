'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import useAuthStore from '@/lib/authStore';

const RESEND_COOLDOWN = 30; // seconds
const OTP_LENGTH = 6;

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const { sendOtp, verifyOtp, isLoading } = useAuthStore();

  // Steps: 'gate' | 'identifier' | 'otp'
  const [step, setStep] = useState('gate');
  const [authType, setAuthType] = useState('email'); // 'email' | 'phone'
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const timerRef = useRef(null);
  const inputRefs = useRef([]);

  // Reset everything when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('gate');
        setIdentifier('');
        setName('');
        setOtpDigits(Array(OTP_LENGTH).fill(''));
        setError('');
        setSuccessMsg('');
        setResendTimer(0);
        setIsNewUser(false);
        setSending(false);
        setVerifying(false);
        clearInterval(timerRef.current);
      }, 300);
    }
  }, [isOpen]);

  // Countdown timer
  const startResendTimer = useCallback(() => {
    setResendTimer(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  }, []);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setSending(true);
    try {
      const result = await sendOtp(identifier.trim(), authType);
      if (result.success) {
        setStep('otp');
        startResendTimer();
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setError(result.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length < OTP_LENGTH) { setError('Please enter the complete 6-digit code.'); return; }
    setError('');
    setVerifying(true);
    try {
      const result = await verifyOtp(identifier.trim(), authType, otp, name.trim() || undefined);
      if (result.success) {
        setIsNewUser(result.isNewUser);
        setSuccessMsg(result.isNewUser ? '🎉 Welcome to Living Result!' : '✅ Welcome back!');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1200);
      } else {
        setError(result.message || 'Incorrect code. Please try again.');
        setOtpDigits(Array(OTP_LENGTH).fill(''));
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } finally {
      setVerifying(false);
    }
  };

  // OTP input handlers
  const handleOtpChange = (idx, val) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const next = [...otpDigits];
    next[idx] = digit;
    setOtpDigits(next);
    if (digit && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
    if (next.every(Boolean)) {
      // auto-submit when all digits filled
      const otp = next.join('');
      if (otp.length === OTP_LENGTH) setTimeout(() => handleVerifyOtpAuto(next.join('')), 100);
    }
  };

  const handleVerifyOtpAuto = async (otp) => {
    if (verifying) return;
    setError('');
    setVerifying(true);
    try {
      const result = await verifyOtp(identifier.trim(), authType, otp, name.trim() || undefined);
      if (result.success) {
        setSuccessMsg(result.isNewUser ? '🎉 Welcome to Living Result!' : '✅ Welcome back!');
        setTimeout(() => { onSuccess?.(); onClose(); }, 1200);
      } else {
        setError(result.message || 'Incorrect code. Please try again.');
        setOtpDigits(Array(OTP_LENGTH).fill(''));
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === 'Enter') handleVerifyOtp();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((d, i) => { next[i] = d; });
    setOtpDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="auth-modal-card">
        <button className="auth-modal-close" onClick={onClose} aria-label="Close">✕</button>

        {/* ── STEP: GATE ──────────────────────────────────────── */}
        {step === 'gate' && (
          <div className="auth-step">
            <div className="auth-modal-logo">
              <span className="auth-modal-brand">LIVING RESULT</span>
              <span className="auth-modal-tagline">Your Account</span>
            </div>
            <h2 className="auth-step-title">Welcome Back</h2>
            <p className="auth-step-subtitle">Sign in or create your account to access orders, wishlist &amp; exclusive features.</p>
            <div className="auth-gate-actions">
              <button className="auth-gate-primary" onClick={() => setStep('identifier')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Login / Create Account
              </button>
              <button className="auth-gate-secondary" onClick={onClose}>
                Continue as Guest →
              </button>
            </div>
            <p className="auth-gate-note">No password needed. We use secure OTP verification.</p>
          </div>
        )}

        {/* ── STEP: IDENTIFIER ────────────────────────────────── */}
        {step === 'identifier' && (
          <div className="auth-step">
            <button className="auth-back-btn" onClick={() => { setStep('gate'); setError(''); }}>← Back</button>
            <h2 className="auth-step-title">Enter Your Email</h2>
            <p className="auth-step-subtitle">We&apos;ll send a 6-digit verification code.</p>


            <form onSubmit={handleSendOtp} className="auth-form">
              <input
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoFocus
                autoComplete="email"
              />

              <input
                type="text"
                className="auth-input"
                placeholder="Your name (for new accounts)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="auth-submit-btn" disabled={sending || !identifier.trim()}>
                {sending ? (
                  <span className="auth-spinner" />
                ) : (
                  <>Send Verification Code <span className="auth-arrow">→</span></>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── STEP: OTP ───────────────────────────────────────── */}
        {step === 'otp' && (
          <div className="auth-step">
            <button className="auth-back-btn" onClick={() => { setStep('identifier'); setError(''); setOtpDigits(Array(OTP_LENGTH).fill('')); clearInterval(timerRef.current); }}>← Back</button>
            <h2 className="auth-step-title">Check Your Inbox</h2>
            <p className="auth-step-subtitle">
              We sent a 6-digit code to<br />
              <strong style={{ color: 'var(--accent)' }}>{identifier}</strong>
            </p>

            {successMsg ? (
              <div className="auth-success-msg">{successMsg}</div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="auth-form">
                {/* 6-digit OTP boxes */}
                <div className="otp-input-group" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className={`otp-box ${digit ? 'filled' : ''}`}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {error && <p className="auth-error">{error}</p>}

                <button type="submit" className="auth-submit-btn" disabled={verifying || otpDigits.some((d) => !d)}>
                  {verifying ? <span className="auth-spinner" /> : 'Verify & Continue'}
                </button>

                {/* Resend */}
                <div className="auth-resend-row">
                  {resendTimer > 0 ? (
                    <span className="auth-resend-timer">Resend code in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      className="auth-resend-btn"
                      onClick={() => { setOtpDigits(Array(OTP_LENGTH).fill('')); handleSendOtp(); }}
                      disabled={sending}
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </form>
            )}

            <p className="auth-gate-note">Code expires in 5 minutes. Max 5 attempts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
