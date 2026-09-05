'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye, EyeOff, ArrowRight, CheckCircle2,
  AlertCircle, Loader2, Shield,
} from 'lucide-react';
import { authApi } from '@/lib/api';

/* ─── Constants ─────────────────────────────────────────────── */
const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4';
const SENSITIVITY = 0.8;

const DEMO_ACCOUNTS = [
  { label: 'Admin',         email: 'admin@dealflow360.com',   role: 'ADMIN',     desc: 'Full access' },
  { label: 'Sales Manager', email: 'manager@dealflow360.com', role: 'MANAGER',   desc: 'Level-1 approvals' },
  { label: 'Finance',       email: 'finance@dealflow360.com', role: 'FINANCE',   desc: 'Level-2 approvals' },
  { label: 'Sales Rep',     email: 'sales@dealflow360.com',   role: 'SALES_REP', desc: 'Quotes & deals' },
];

/* ─── Glass Input ─────────────────────────────────────────────── */
function GlassField({
  label, type = 'text', value, onChange, placeholder, error, suffix, autoFocus,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  error?: string; suffix?: React.ReactNode; autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            height: 42,
            padding: suffix ? '0 44px 0 14px' : '0 14px',
            borderRadius: 10,
            border: error
              ? '1.5px solid rgba(248,113,113,0.8)'
              : focused
              ? '1.5px solid rgba(255,255,255,0.7)'
              : '1.5px solid rgba(255,255,255,0.2)',
            background: error
              ? 'rgba(220,38,38,0.12)'
              : focused
              ? 'rgba(255,255,255,0.18)'
              : 'rgba(255,255,255,0.1)',
            fontSize: 14,
            color: '#fff',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'all 0.15s',
            fontFamily: 'Inter, sans-serif',
            backdropFilter: 'blur(4px)',
          }}
        />
        {suffix && (
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)', display: 'flex', cursor: 'pointer' }}>
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#FCA5A5', fontWeight: 500 }}>
          <AlertCircle size={12} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */
export default function MainframePage() {
  const router = useRouter();

  /* ── Auth redirect if already logged in */
  useEffect(() => {
    const token = localStorage.getItem('dealflow_token');
    const rawUser = localStorage.getItem('dealflow_user');
    if (token) {
      try {
        const u = rawUser ? JSON.parse(rawUser) : {};
        if ((u.role || '').toUpperCase() === 'CUSTOMER') {
          router.replace('/portal');
        } else {
          router.replace('/dashboard');
        }
      } catch {
        router.replace('/dashboard');
      }
    }
  }, [router]);

  /* ── Video scrub */
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevXRef = useRef<number | null>(null);
  const targetTimeRef = useRef(0);
  const seekingRef = useRef(false);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onSeeked = () => {
      seekingRef.current = false;
      const target = Math.max(0, Math.min(targetTimeRef.current, video.duration || 0));
      if (Math.abs(video.currentTime - target) > 0.01) {
        seekingRef.current = true;
        video.currentTime = target;
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      if (prevXRef.current === null) { prevXRef.current = e.clientX; return; }
      const delta = e.clientX - prevXRef.current;
      prevXRef.current = e.clientX;
      if (!video.duration) return;
      const offset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      targetTimeRef.current = Math.max(0, Math.min(targetTimeRef.current + offset, video.duration));
      if (!seekingRef.current) {
        seekingRef.current = true;
        video.currentTime = Math.max(0, Math.min(targetTimeRef.current, video.duration));
      }
    };
    video.addEventListener('seeked', onSeeked);
    window.addEventListener('mousemove', onMouseMove);
    return () => { video.removeEventListener('seeked', onSeeked); window.removeEventListener('mousemove', onMouseMove); };
  }, []);

  /* ── Login form state */
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [forgotNote, setForgotNote] = useState(false);

  const clearFieldError = (k: string) => setFieldErrors(prev => ({ ...prev, [k]: '' }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Min 8 characters';
    if (mode === 'register') {
      if (!firstName.trim()) e.firstName = 'First name required';
      if (!lastName.trim()) e.lastName = 'Last name required';
      if (password && confirmPassword && password !== confirmPassword) e.confirmPassword = 'Passwords don\'t match';
    }
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const persistAuth = (data: any) => {
    const { accessToken, role, email: ue, fullName, userId } = data;
    localStorage.setItem('dealflow_token', accessToken);
    localStorage.setItem('dealflow_user', JSON.stringify({ id: userId, email: ue, fullName, role }));
    const normalizedRole = (role || '').toUpperCase();
    if (normalizedRole === 'CUSTOMER') {
      router.push('/portal');
    } else {
      router.push('/dashboard');
    }
  };

  const handleLogin = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(null); setSuccess(null); setForgotNote(false); setFieldErrors({});
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authApi.login(email.trim(), password);
      persistAuth(res.data);
    } catch (err: any) {
      const data = err.response?.data;
      const status = err.response?.status;
      if (!err.response) setError('Cannot connect to the server. Make sure the backend is running.');
      else if (status === 401 || status === 403) setError(data?.message ?? 'Incorrect email or password.');
      else if (data?.fields) setFieldErrors({ email: data.fields.email ?? '', password: data.fields.password ?? '' });
      else setError(data?.message ?? 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(null); setSuccess(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.register({ email: email.trim(), password, firstName: firstName.trim(), lastName: lastName.trim() });
      setSuccess('Account created. An admin will assign your access level.');
      setMode('login');
      setPassword(''); setConfirmPassword('');
    } catch (err: any) {
      const data = err.response?.data;
      const status = err.response?.status;
      if (!err.response) setError('Cannot connect to the server.');
      else if (status === 409) setFieldErrors(prev => ({ ...prev, email: 'Email already registered. Sign in instead.' }));
      else if (data?.fields) setFieldErrors({ email: data.fields.email ?? '', password: data.fields.password ?? '', firstName: data.fields.firstName ?? '', lastName: data.fields.lastName ?? '' });
      else setError(data?.message ?? 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleDemo = async (acc: typeof DEMO_ACCOUNTS[0]) => {
    setError(null); setDemoLoading(acc.email);
    try {
      const res = await authApi.login(acc.email, 'Password123!');
      persistAuth(res.data);
    } catch {
      localStorage.setItem('dealflow_token', 'demo-token');
      localStorage.setItem('dealflow_user', JSON.stringify({ id: 1, email: acc.email, fullName: acc.label + ' User', role: acc.role }));
      router.push('/dashboard');
    } finally { setDemoLoading(null); }
  };

  const switchMode = (m: 'login' | 'register') => {
    setMode(m); setError(null); setSuccess(null); setFieldErrors({});
  };

  /* ────────────────────────────────────────────────────────── */
  return (
    <div style={{ fontFamily: 'var(--font-body-mainframe)', background: '#fff', color: '#000', minHeight: '100vh', overflow: 'hidden' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::placeholder { color: rgba(255,255,255,0.35) !important; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 40px rgba(255,255,255,0.12) inset !important; -webkit-text-fill-color: #fff !important; }
      `}</style>

      {/* ── Background Video ──────────────────────────────────── */}
      <video
        ref={videoRef}
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
        style={{ position: 'fixed', inset: 0, zIndex: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '70% center' }}
      />

      {/* ── Subtle dark overlay for readability ───────────────── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'rgba(0,0,0,0.18)' }} />

      {/* ── Top-center label ─────────────────────────────────── */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '18px 0 16px',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontSize: 23,
            color: '#000',
            fontFamily: 'var(--font-body-mainframe)',
            letterSpacing: '-0.01em',
          }}
        >
          DealFlow360 — Intelligent Sales Operations Platform
        </span>
      </div>


      {/* ── Centered login panel ─────────────────────────────── */}
      <div
        className="relative min-h-screen flex items-center justify-start px-5 sm:px-8 md:px-10 lg:px-16 py-12"
        style={{ zIndex: 2 }}
      >

        {/* Login Panel */}
        <div
          id="login-panel"
          style={{
            width: '100%',
            maxWidth: 420,
            flexShrink: 0,
            background: 'rgba(255,255,255,0.10)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.22)',
            borderRadius: 20,
            padding: '36px 32px',
            boxShadow: '0 8px 48px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.12)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Heading */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.4px', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 6, lineHeight: 1.5 }}>
              {mode === 'login' ? 'Welcome back — enter your credentials to continue.' : 'Register your internal employee account.'}
            </p>
          </div>

          {/* Error / success banners */}
          {error && (
            <div style={{ display: 'flex', gap: 8, padding: '10px 12px', borderRadius: 10, marginBottom: 16, background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(248,113,113,0.5)', color: '#FCA5A5', fontSize: 13 }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontWeight: 500, lineHeight: 1.5 }}>{error}</span>
            </div>
          )}
          {success && (
            <div style={{ display: 'flex', gap: 8, padding: '10px 12px', borderRadius: 10, marginBottom: 16, background: 'rgba(22,163,74,0.2)', border: '1px solid rgba(134,239,172,0.5)', color: '#86EFAC', fontSize: 13 }}>
              <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontWeight: 500, lineHeight: 1.5 }}>{success}</span>
            </div>
          )}
          {forgotNote && (
            <div style={{ display: 'flex', gap: 8, padding: '10px 12px', borderRadius: 10, marginBottom: 16, background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(147,197,253,0.5)', color: '#BFDBFE', fontSize: 13 }}>
              <Shield size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontWeight: 500, lineHeight: 1.5 }}>Contact your admin at <strong>admin@dealflow360.com</strong> to reset your password.</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <GlassField label="First name" value={firstName} onChange={v => { setFirstName(v); clearFieldError('firstName'); }} placeholder="Rahul" error={fieldErrors.firstName} />
                <GlassField label="Last name" value={lastName} onChange={v => { setLastName(v); clearFieldError('lastName'); }} placeholder="Sharma" error={fieldErrors.lastName} />
              </div>
            )}

            <GlassField label="Email" type="email" value={email}
              onChange={v => { setEmail(v); clearFieldError('email'); }}
              placeholder="you@company.com" error={fieldErrors.email} autoFocus={mode === 'login'} />

            <GlassField label="Password" type={showPw ? 'text' : 'password'} value={password}
              onChange={v => { setPassword(v); clearFieldError('password'); }}
              placeholder={mode === 'register' ? 'Minimum 8 characters' : ''}
              error={fieldErrors.password}
              suffix={<span onClick={() => setShowPw(p => !p)}>{showPw ? <EyeOff size={17} /> : <Eye size={17} />}</span>} />

            {mode === 'register' && (
              <GlassField label="Confirm password" type={showCpw ? 'text' : 'password'} value={confirmPassword}
                onChange={v => { setConfirmPassword(v); clearFieldError('confirmPassword'); }}
                placeholder="Re-enter password" error={fieldErrors.confirmPassword}
                suffix={<span onClick={() => setShowCpw(p => !p)}>{showCpw ? <EyeOff size={17} /> : <Eye size={17} />}</span>} />
            )}

            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginTop: -4 }}>
                <button type="button" onClick={() => setForgotNote(true)}
                  style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit button */}
            <div style={{ marginTop: 4 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', height: 44, borderRadius: 10,
                  background: loading ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.95)',
                  color: '#111827', fontSize: 14, fontWeight: 700,
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: loading ? 0.8 : 1, transition: 'all 0.15s',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                }}
                onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
                onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.95)'; }}
              >
                {loading
                  ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  : (mode === 'login' ? 'Sign in' : 'Create account')}
              </button>
            </div>
          </form>

          {/* Toggle mode */}
          <div style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
            {mode === 'login' ? (
              <>Don&apos;t have an account?{' '}
                <button onClick={() => switchMode('register')} style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Register</button>
              </>
            ) : (
              <>Already registered?{' '}
                <button onClick={() => switchMode('login')} style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign in</button>
              </>
            )}
          </div>

          {/* Demo accounts */}
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, textAlign: 'center' }}>
              Jump to a demo account
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {DEMO_ACCOUNTS.map(acc => {
                const busy = demoLoading === acc.email;
                return (
                  <button key={acc.role} type="button" onClick={() => handleDemo(acc)} disabled={!!demoLoading}
                    style={{
                      padding: '9px 11px', borderRadius: 9, textAlign: 'left',
                      border: '1px solid rgba(255,255,255,0.18)',
                      background: 'rgba(255,255,255,0.08)',
                      cursor: 'pointer', transition: 'all 0.15s',
                      fontFamily: 'Inter, sans-serif',
                      opacity: demoLoading && !busy ? 0.4 : 1,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.18)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.4)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.18)'; }}>
                    {busy ? (
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Loader2 size={15} style={{ animation: 'spin 1s linear infinite', color: '#fff' }} />
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{acc.label}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>{acc.desc}</div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer portal CTA */}
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <Link href="/portal/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 12, color: 'rgba(255,255,255,0.45)', textDecoration: 'none',
              padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
              transition: 'color 0.15s, border-color 0.15s',
              background: 'rgba(255,255,255,0.05)',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.35)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.45)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.15)'; }}
            >
              Looking for your quotation?
              <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>Open Customer Portal</span>
              <ArrowRight size={12} color="rgba(255,255,255,0.85)" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
