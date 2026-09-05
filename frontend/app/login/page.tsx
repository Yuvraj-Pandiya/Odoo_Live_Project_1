'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Loader2, TrendingUp, Zap, Shield, Users } from 'lucide-react';
import { authApi } from '@/lib/api';

/* ─── Design tokens (Charcoal Brown / Silver palette) ────────────────────── */
const t = {
  accent:        '#4B4B42',
  accentHover:   '#373730',
  accentSubtle:  '#ECECE9',
  panelBg:       '#373730',
  textPrimary:   '#1F1F1C',
  textSecondary: '#4B4B42',
  textMuted:     '#91918F',
  border:        '#DCDCD9',
  canvas:        '#F5F5F3',
  surface:       '#FFFFFF',
  success:       '#2E6B4F',
  successSubtle: '#E8F5EE',
  error:         '#DC2626',
  errorSubtle:   '#FEE2E2',
};

/* ─── Demo accounts ─────────────────────────────────────────────────────── */
const DEMO_ACCOUNTS = [
  { label: 'Admin',         email: 'admin@dealflow360.com',   role: 'ADMIN',     desc: 'Full access' },
  { label: 'Sales Manager', email: 'manager@dealflow360.com', role: 'MANAGER',   desc: 'Level-1 approvals' },
  { label: 'Finance',       email: 'finance@dealflow360.com', role: 'FINANCE',   desc: 'Level-2 approvals' },
  { label: 'Sales Rep',     email: 'sales@dealflow360.com',   role: 'SALES_REP', desc: 'Quotes & deals' },
];

/* ─── Shared input component ─────────────────────────────────────────────── */
function Field({
  label, type = 'text', value, onChange, placeholder, error, suffix, autoFocus,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  error?: string; suffix?: React.ReactNode; autoFocus?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 14, fontWeight: 600, color: t.textPrimary, lineHeight: 1.4 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          style={{
            width: '100%',
            height: 44,
            padding: suffix ? '0 44px 0 14px' : '0 14px',
            borderRadius: 10,
            border: `1.5px solid ${error ? t.error : t.border}`,
            background: error ? '#FFF5F5' : t.surface,
            fontSize: 15,
            color: t.textPrimary,
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            fontFamily: 'Inter, sans-serif',
          }}
          onFocus={e => {
            e.target.style.borderColor = error ? t.error : t.accent;
            e.target.style.boxShadow = error
              ? '0 0 0 3px rgba(220,38,38,0.15)'
              : '0 0 0 3px rgba(46,81,214,0.18)';
            e.target.style.background = error ? '#FFF5F5' : t.accentSubtle;
          }}
          onBlur={e => {
            e.target.style.borderColor = error ? t.error : t.border;
            e.target.style.boxShadow = 'none';
            e.target.style.background = error ? '#FFF5F5' : t.surface;
          }}
        />
        {suffix && (
          <div style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            color: t.textMuted, display: 'flex', cursor: 'pointer',
          }}>
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: t.error, fontWeight: 500 }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}
    </div>
  );
}

/* ─── Primary button ─────────────────────────────────────────────────────── */
function PrimaryButton({ label, loading, onClick, type = 'submit' }: {
  label: string; loading?: boolean; onClick?: () => void; type?: 'submit' | 'button';
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type={type}
      disabled={loading}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', height: 44, borderRadius: 10,
        background: loading ? t.accentHover : hovered ? t.accentHover : t.accent,
        color: '#fff', fontSize: 14, fontWeight: 600,
        border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        opacity: loading ? 0.75 : 1,
        transition: 'background 0.15s',
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 1px 3px rgba(46,81,214,0.3)',
        outline: 'none',
      }}
      onFocus={e => {
        (e.target as HTMLButtonElement).style.boxShadow = '0 0 0 3px rgba(46,81,214,0.25)';
      }}
      onBlur={e => {
        (e.target as HTMLButtonElement).style.boxShadow = '0 1px 3px rgba(46,81,214,0.3)';
      }}
    >
      {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : label}
    </button>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

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

  const clearFieldError = (k: string) =>
    setFieldErrors(prev => ({ ...prev, [k]: '' }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Must be at least 8 characters';
    if (mode === 'register') {
      if (!firstName.trim()) e.firstName = 'First name is required';
      if (!lastName.trim()) e.lastName = 'Last name is required';
      if (password && confirmPassword && password !== confirmPassword)
        e.confirmPassword = 'Passwords do not match';
    }
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const persistAuth = (data: any) => {
    const { accessToken, role, email: ue, fullName, userId } = data;
    localStorage.setItem('dealflow_token', accessToken);
    localStorage.setItem('dealflow_user', JSON.stringify({ id: userId, email: ue, fullName, role }));
    // All internal roles land on the sales dashboard.
    // If somehow a CUSTOMER token arrives here, send them to the portal.
    if (role === 'CUSTOMER') {
      router.push('/portal/login');
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
      if (!err.response) {
        // Network / CORS / backend down
        setError('Cannot connect to the server. Make sure the backend is running on port 8080.');
      } else if (status === 401 || status === 403) {
        // Prefer the server message (e.g. "Incorrect email or password." or "Account deactivated.")
        setError(data?.message ?? 'Incorrect email or password. Please try again.');
      } else if (data?.fields) {
        // Bean-validation failure — surface inline
        setFieldErrors({
          email: data.fields.email ?? '',
          password: data.fields.password ?? '',
        });
      } else {
        setError(data?.message ?? 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(null); setSuccess(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.register({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setSuccess('Account created. An admin will assign your access level — you can sign in now.');
      setMode('login');
      setPassword(''); setConfirmPassword('');
    } catch (err: any) {
      const data = err.response?.data;
      const status = err.response?.status;
      if (!err.response) {
        setError('Cannot connect to the server. Make sure the backend is running on port 8080.');
      } else if (status === 409) {
        // Email already registered — surface inline on the email field
        setFieldErrors(prev => ({ ...prev, email: 'This email is already registered. Try signing in instead.' }));
      } else if (data?.fields) {
        // Bean-validation failure — surface each error near its field
        setFieldErrors({
          email:    data.fields.email    ?? '',
          password: data.fields.password ?? '',
          firstName: data.fields.firstName ?? '',
          lastName:  data.fields.lastName  ?? '',
        });
      } else {
        setError(data?.message ?? 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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

  /* ── Left branded panel ───────────────────────────────────────────────── */
  const BrandPanel = () => (
    <div style={{
      flex: 1, background: t.panelBg, padding: '56px 48px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 52 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: 'linear-gradient(135deg,#3B82F6,#6366F1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingUp size={18} color="#fff" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
            DealFlow<span style={{ color: '#93C5FD' }}>360</span>
          </span>
        </div>

        <p style={{ fontSize: 30, fontWeight: 700, color: '#fff', lineHeight: 1.25, letterSpacing: '-0.5px', marginBottom: 16 }}>
          Intelligent B2B Sales Operations.
        </p>
        <p style={{ fontSize: 16, color: '#93C5FD', lineHeight: 1.6, marginBottom: 44 }}>
          From quote to cash — with AI-driven deal health, multi-level discount governance, and real-time fulfillment intelligence.
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { icon: <Zap size={16} color="#93C5FD" />, text: 'Instant margin scoring on every line' },
            { icon: <Shield size={16} color="#93C5FD" />, text: 'Multi-tier approval chains with full audit trail' },
            { icon: <Users size={16} color="#93C5FD" />, text: 'Customer-facing negotiation portal included' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flexShrink: 0 }}>{s.icon}</div>
              <span style={{ fontSize: 14, color: '#BFDBFE', lineHeight: 1.5 }}>{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Client names */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 24 }}>
        <p style={{ fontSize: 12, color: '#64748B', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          Trusted by enterprise teams at
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['Tata Consultancy', 'Reliance Jio', 'Infosys', 'Flipkart', 'Wipro'].map(n => (
            <span key={n} style={{
              padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: 'rgba(255,255,255,0.08)', color: '#BFDBFE', border: '1px solid rgba(255,255,255,0.1)',
            }}>
              {n}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── Right form panel ─────────────────────────────────────────────────── */
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'row',
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .auth-brand-panel { display: none !important; }
          .auth-form-panel { flex: 1 !important; padding: 32px 24px !important; }
          .auth-mobile-header { display: flex !important; }
        }
      `}</style>

      {/* Brand panel — LEFT, full height, flush to left edge */}
      <div className="auth-brand-panel" style={{
        flex: '0 0 42%',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>
        <BrandPanel />
      </div>

      {/* Mobile header — shown only on small screens */}
      <div className="auth-mobile-header" style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10,
        background: t.panelBg, padding: '14px 20px',
        alignItems: 'center', gap: 8,
      }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#3B82F6,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TrendingUp size={14} color="#fff" />
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
          DealFlow<span style={{ color: '#93C5FD' }}>360</span>
        </span>
      </div>

      {/* Form panel */}
      <div className="auth-form-panel" style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: t.canvas,
        overflowY: 'auto',
        minWidth: 0,
      }}>
        <div style={{ maxWidth: 420, width: '100%', margin: 'auto', padding: '48px 56px', boxSizing: 'border-box' }}>

          {/* Page heading */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: t.textPrimary, margin: 0, letterSpacing: '-0.4px' }}>
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </h1>
            <p style={{ fontSize: 15, color: t.textSecondary, marginTop: 8, lineHeight: 1.5 }}>
              {mode === 'login'
                ? 'Welcome back — enter your credentials to continue.'
                : 'Register your internal employee account.'}
            </p>
          </div>

          {/* Error / success banners */}
          {error && (
            <div style={{
              display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 10, marginBottom: 20,
              background: t.errorSubtle, border: `1px solid #FCA5A5`, color: '#991B1B', fontSize: 14,
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 1, color: t.error }} />
              <span style={{ fontWeight: 500, lineHeight: 1.5 }}>{error}</span>
            </div>
          )}
          {success && (
            <div style={{
              display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 10, marginBottom: 20,
              background: t.successSubtle, border: `1px solid #86EFAC`, color: '#14532D', fontSize: 14,
            }}>
              <CheckCircle2 size={17} style={{ flexShrink: 0, marginTop: 1, color: t.success }} />
              <span style={{ fontWeight: 500, lineHeight: 1.5 }}>{success}</span>
            </div>
          )}
          {forgotNote && (
            <div style={{
              display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 10, marginBottom: 20,
              background: '#EFF6FF', border: `1px solid #BFDBFE`, color: '#1E3A8A', fontSize: 14,
            }}>
              <Shield size={17} style={{ flexShrink: 0, marginTop: 1, color: '#2E51D6' }} />
              <span style={{ fontWeight: 500, lineHeight: 1.5 }}>
                Contact your admin at <strong>admin@dealflow360.com</strong> to reset your password.
              </span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {mode === 'register' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="First name" value={firstName}
                  onChange={v => { setFirstName(v); clearFieldError('firstName'); }}
                  placeholder="Rahul" error={fieldErrors.firstName} />
                <Field label="Last name" value={lastName}
                  onChange={v => { setLastName(v); clearFieldError('lastName'); }}
                  placeholder="Sharma" error={fieldErrors.lastName} />
              </div>
            )}

            <Field label="Email" type="email" value={email}
              onChange={v => { setEmail(v); clearFieldError('email'); }}
              placeholder="you@company.com" error={fieldErrors.email}
              autoFocus={mode === 'login'} />

            <Field label="Password" type={showPw ? 'text' : 'password'} value={password}
              onChange={v => { setPassword(v); clearFieldError('password'); }}
              placeholder={mode === 'register' ? 'Minimum 8 characters' : ''}
              error={fieldErrors.password}
              suffix={
                <span onClick={() => setShowPw(p => !p)} style={{ color: t.textMuted }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              } />

            {mode === 'register' && (
              <Field label="Confirm password" type={showCpw ? 'text' : 'password'} value={confirmPassword}
                onChange={v => { setConfirmPassword(v); clearFieldError('confirmPassword'); }}
                placeholder="Re-enter password"
                error={fieldErrors.confirmPassword}
                suffix={
                  <span onClick={() => setShowCpw(p => !p)} style={{ color: t.textMuted }}>
                    {showCpw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                } />
            )}

            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginTop: -4 }}>
                <button type="button" onClick={() => setForgotNote(true)}
                  style={{ fontSize: 13, color: t.accent, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Forgot password?
                </button>
              </div>
            )}

            <div style={{ marginTop: 4 }}>
              <PrimaryButton label={mode === 'login' ? 'Sign in' : 'Create account'} loading={loading} />
            </div>

            {mode === 'register' && (
              <p style={{ fontSize: 13, color: t.textMuted, textAlign: 'center', margin: 0 }}>
                An admin will assign your access level.
              </p>
            )}
          </form>

          {/* Toggle mode */}
          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: t.textSecondary }}>
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button onClick={() => switchMode('register')}
                  style={{ color: t.accent, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Register
                </button>
              </>
            ) : (
              <>Already registered?{' '}
                <button onClick={() => switchMode('login')}
                  style={{ color: t.accent, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Sign in
                </button>
              </>
            )}
          </div>

          {/* Demo switcher — clearly secondary, separated by divider */}
          <div style={{ marginTop: 36, paddingTop: 28, borderTop: `1px solid ${t.border}` }}>
            <p style={{ fontSize: 12, color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, textAlign: 'center' }}>
              Jump to a demo account
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {DEMO_ACCOUNTS.map(acc => {
                const busy = demoLoading === acc.email;
                return (
                  <button key={acc.role} type="button" onClick={() => handleDemo(acc)}
                    disabled={!!demoLoading}
                    style={{
                      padding: '10px 12px', borderRadius: 8, textAlign: 'left',
                      border: `1.5px solid ${t.border}`, background: t.surface,
                      cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
                      opacity: demoLoading && !busy ? 0.5 : 1,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = t.accent;
                      (e.currentTarget as HTMLButtonElement).style.background = t.accentSubtle;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = t.border;
                      (e.currentTarget as HTMLButtonElement).style.background = t.surface;
                    }}
                    onFocus={e => {
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(46,81,214,0.18)';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                    {busy ? (
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: t.accent }} />
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>{acc.label}</div>
                        <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{acc.desc}</div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer portal CTA */}
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <Link href="/portal/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13, color: t.textMuted, textDecoration: 'none',
              padding: '8px 16px', borderRadius: 8, border: `1px solid ${t.border}`,
              transition: 'color 0.15s',
            }}>
              Looking for your quotation?
              <span style={{ color: t.accent, fontWeight: 600 }}>Open Customer Portal</span>
              <ArrowRight size={13} color={t.accent} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
