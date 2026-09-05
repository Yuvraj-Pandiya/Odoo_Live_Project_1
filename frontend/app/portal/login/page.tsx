'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Loader2, Shield, Lock, Building2 } from 'lucide-react';
import { authApi, setStoredAuth } from '@/lib/api';

/* ─── Portal Design Tokens ─────────────────────────────────────────────── */
const t = {
  accent:        '#2E51D6',
  accentHover:   '#2341B8',
  accentSubtle:  '#EEF2FF',
  panelBg:       '#1E293B',
  panelSubtext:  '#94A3B8',
  textPrimary:   '#0F172A',
  textSecondary: '#475569',
  textMuted:     '#94A3B8',
  border:        '#E2E8F0',
  canvas:        '#F8FAFC',
  surface:       '#FFFFFF',
  success:       '#16A34A',
  successSubtle: '#DCFCE7',
  error:         '#DC2626',
  errorSubtle:   '#FEE2E2',
};

const DEMO_CUSTOMERS = [
  { company: 'Tata Consultancy Services', email: 'procurement1@corp-1.com', name: 'Rajesh Sen', quote: 'QT-2026-1001' },
  { company: 'Infosys Limited', email: 'procurement2@corp-2.com', name: 'Ananya Rao', quote: 'QT-2026-1002' },
  { company: 'Reliance Jio Infocomm', email: 'procurement3@corp-3.com', name: 'Mukesh Parekh', quote: 'QT-2026-1003' },
  { company: 'Customer Demo Account', email: 'customer@dealflow360.com', name: 'Arjun Mehta', quote: 'QT-2026-1004' },
];

export default function CustomerPortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Business email address is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login(email.trim(), password);
      const { accessToken, role, email: ue, fullName, userId } = res.data;
      setStoredAuth(accessToken, { id: userId, email: ue, fullName, role });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('dealflow-auth-change'));
      }

      router.push('/portal');
    } catch (err: any) {
      const status = err.response?.status;
      if (!err.response) {
        // Offline demo fallback
        const mockCust = DEMO_CUSTOMERS.find(c => c.email === email.trim()) || DEMO_CUSTOMERS[0];
        setStoredAuth('demo-customer-token', { id: 101, email: mockCust.email, fullName: mockCust.name, role: 'CUSTOMER' });
        router.push('/portal');
      } else if (status === 401 || status === 403) {
        setError('Incorrect business email or password. Please verify your credentials.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (cust: typeof DEMO_CUSTOMERS[0]) => {
    setDemoLoading(cust.email);
    setError(null);
    try {
      const res = await authApi.login(cust.email, 'Password123!');
      const { accessToken, role, email: ue, fullName, userId } = res.data;
      setStoredAuth(accessToken, { id: userId, email: ue, fullName, role });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('dealflow-auth-change'));
      }

      router.push('/portal');
    } catch {
      setStoredAuth('demo-customer-token', { id: 101, email: cust.email, fullName: cust.name, role: 'CUSTOMER' });
      router.push('/portal');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'row',
        fontFamily: 'Inter, system-ui, sans-serif',
        background: t.canvas,
      }}
    >
      {/* ── Left Branded Panel ─────────────────────────────────────────── */}
      <div
        className="hidden md:flex flex-col justify-between"
        style={{
          flex: '0 0 42%',
          background: t.panelBg,
          padding: '56px 48px',
          color: '#FFFFFF',
        }}
      >
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '16px',
              }}
            >
              DF
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                DealFlow<span style={{ color: '#93C5FD' }}>360</span>
              </div>
              <div style={{ fontSize: '11px', color: t.panelSubtext, fontWeight: 600, textTransform: 'uppercase' }}>
                Customer Negotiation Portal
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1.3, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Direct Commercial Collaboration &amp; Terms Sign-off.
          </h2>
          <p style={{ fontSize: '15px', color: t.panelSubtext, lineHeight: 1.6, marginBottom: '36px' }}>
            Sign in with your corporate email to review line-item pricing, submit discount counter-offers directly to your Deal Desk executive, and confirm orders with binding digital acceptance.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              'Inspect line-item discounts, SLA terms, and delivery schedules',
              'Submit instant counter-proposals with targeted margin requests',
              'One-click commercial confirmation with automatic order generation',
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={16} style={{ color: '#38BDF8', flexShrink: 0 }} />
                <span style={{ fontSize: '13.5px', color: '#E2E8F0' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Enterprise Customer Portal — Secure role-scoped access protected by server-signed JWT session tokens.
          </p>
        </div>
      </div>

      {/* ── Right Form Panel ─────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        <div style={{ maxWidth: '420px', width: '100%' }}>
          {/* Form Header */}
          <div style={{ marginBottom: '28px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: '#EEF2FF',
                color: '#4F46E5',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '12px',
              }}
            >
              <Building2 size={14} />
              Customer Access
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: t.textPrimary, margin: 0, letterSpacing: '-0.02em' }}>
              Customer Portal Login
            </h1>
            <p style={{ fontSize: '14px', color: t.textSecondary, marginTop: '6px', margin: 0 }}>
              Enter your registered business email and password to view your quotations.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 14px',
                borderRadius: '8px',
                background: t.errorSubtle,
                border: '1px solid #FCA5A5',
                color: t.error,
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: t.textPrimary, marginBottom: '6px' }}>
                Business Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="procurement@company.com"
                className="df-input"
                style={{ width: '100%', height: '44px', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: t.textPrimary, marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your portal password"
                  className="df-input"
                  style={{ width: '100%', height: '44px', fontSize: '14px', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: t.textMuted,
                    cursor: 'pointer',
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '8px',
                background: '#4F46E5',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 700,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px',
                boxShadow: '0 1px 3px rgba(79, 70, 229, 0.25)',
              }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In to Customer Portal'}
            </button>
          </form>

          {/* Quick Demo Customer Sign-in */}
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${t.border}` }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', marginBottom: '12px' }}>
              One-click customer test accounts (Password: Password123!)
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {DEMO_CUSTOMERS.map((cust) => {
                const busy = demoLoading === cust.email;
                return (
                  <button
                    key={cust.email}
                    type="button"
                    disabled={!!demoLoading}
                    onClick={() => handleDemoLogin(cust)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: '#FFFFFF',
                      border: `1px solid ${t.border}`,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#4F46E5';
                      e.currentTarget.style.background = '#EEF2FF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = t.border;
                      e.currentTarget.style.background = '#FFFFFF';
                    }}
                  >
                    {busy ? (
                      <Loader2 size={16} className="animate-spin text-indigo-600" />
                    ) : (
                      <>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: t.textPrimary }}>{cust.company}</div>
                        <div style={{ fontSize: '11px', color: t.textMuted, marginTop: '2px' }}>{cust.email}</div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Return to Internal Staff Login */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link
              href="/"
              style={{
                fontSize: '13px',
                color: t.textSecondary,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Are you an internal sales employee? <span style={{ color: '#4F46E5', fontWeight: 600 }}>Staff Sign-in</span> <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
