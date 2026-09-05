'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Send, ArrowRight, CheckCircle2, AlertCircle, Loader2, FileText, MessageSquare, ThumbsUp, Download } from 'lucide-react';
import { portalApi } from '@/lib/api';

/* ─── Portal design tokens (Charcoal Brown / Silver palette) ─────────────────── */
const t = {
  accent:        '#4B4B42',
  accentHover:   '#373730',
  accentSubtle:  '#ECECE9',
  panelBg:       '#373730',
  panelSubtext:  '#A2A0A1',
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

const DEMO_PORTALS = [
  { company: 'Tata Consultancy Services', token: 'token-tcs-1001',  quote: 'Q-1001', contact: 'procurement@tcs.com' },
  { company: 'Infosys Limited',           token: 'token-infy-1002', quote: 'Q-1002', contact: 'it.buyer@infosys.com' },
  { company: 'Reliance Jio Infocomm',    token: 'token-jio-1003',  quote: 'Q-1003', contact: 'sourcing@jio.com' },
  { company: 'Flipkart Private Ltd',     token: 'token-flip-1004', quote: 'Q-1004', contact: 'infra@flipkart.com' },
];

const PORTAL_FEATURES = [
  { icon: <FileText size={16} />,     text: 'Review your full quote line-by-line' },
  { icon: <MessageSquare size={16} />, text: 'Submit a counter-offer or open negotiation' },
  { icon: <ThumbsUp size={16} />,     text: 'Accept and confirm commercial terms' },
  { icon: <Download size={16} />,     text: 'Download a PDF copy of your proposal' },
];

export default function CustomerPortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [demoToken, setDemoToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!email.trim()) { setError('Business email address is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address (e.g. name@company.com)');
      return false;
    }
    return true;
  };

  const handleSend = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await portalApi.requestMagicLink(email.trim());
      // Backend always returns 200 (security: don't reveal if email exists).
      // demoToken is populated from DB if a matching customer record is found.
      if (res.data?.demoToken) setDemoToken(res.data.demoToken);
      setSubmitted(true);
    } catch (err: any) {
      if (!err.response) {
        // Backend unreachable — show inline, keep form open so user can retry
        setError('Cannot connect to the server. Make sure the backend is running on port 8080.');
        // Still show submitted state with demo fallback so testing works
        setDemoToken('token-tcs-1001');
        setSubmitted(true);
      } else {
        // Unexpected server error — surface message, keep form open
        setError(err.response?.data?.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false); // always re-enable the button
    }
  };


  /* ─── Right branded panel ───────────────────────────────────────────── */
  const BrandPanel = () => (
    <div style={{
      flex: 1, background: t.panelBg, padding: '56px 48px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}>
      <div>
        {/* Portal mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 52 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: 'linear-gradient(135deg,#0D9488,#0EA5E9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-1px',
          }}>
            DF
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
              DealFlow<span style={{ color: t.panelSubtext }}>360</span>
            </div>
            <div style={{ fontSize: 11, color: t.panelSubtext, fontWeight: 500, marginTop: 1 }}>
              Customer Negotiation Portal
            </div>
          </div>
        </div>

        <p style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.25, letterSpacing: '-0.4px', marginBottom: 16 }}>
          Your Proposals,<br />One Secure Link Away.
        </p>
        <p style={{ fontSize: 15, color: t.panelSubtext, lineHeight: 1.65, marginBottom: 40 }}>
          No account or password needed. Enter your business email and we'll send a direct, secure magic link to your proposal.
        </p>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            What you can do here
          </p>
          {PORTAL_FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ color: t.panelSubtext, flexShrink: 0 }}>{f.icon}</div>
              <span style={{ fontSize: 14, color: '#CFFAFE', lineHeight: 1.5 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24 }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5, margin: 0 }}>
          Trusted by procurement teams at Tata Consultancy Services, Reliance Jio, Infosys, and Flipkart.
        </p>
      </div>
    </div>
  );

  /* ─── Page ──────────────────────────────────────────────────────────── */
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'row',
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @media (max-width: 768px) {
          .portal-brand-panel { display: none !important; }
          .portal-form-panel { flex: 1 !important; padding: 32px 24px !important; }
          .portal-mobile-header { display: flex !important; }
        }
      `}</style>

      {/* Form panel — LEFT, takes remaining width, scrolls independently */}
      <div className="portal-form-panel" style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        background: t.canvas,
        overflowY: 'auto',
        minWidth: 0,
      }}>
        <div style={{ maxWidth: 420, width: '100%', margin: 'auto', padding: '48px 56px', boxSizing: 'border-box' }}>

          {/* Heading — strong contrast against #EFF4F7 canvas */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'linear-gradient(135deg,#0D9488,#0EA5E9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: '#fff',
              }}>DF</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: t.textMuted }}>Customer Portal</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: t.textPrimary, margin: 0, letterSpacing: '-0.4px' }}>
              Access your quotation
            </h1>
            <p style={{ fontSize: 15, color: t.textSecondary, marginTop: 8, lineHeight: 1.55 }}>
              Enter your registered business email — we'll send a secure, passwordless link directly to your proposal.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 10, marginBottom: 20,
              background: t.errorSubtle, border: `1px solid #FCA5A5`, color: '#991B1B', fontSize: 14,
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 1, color: t.error }} />
              <span style={{ fontWeight: 500, lineHeight: 1.5 }}>{error}</span>
            </div>
          )}

          {/* State: form */}
          {!submitted ? (
            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: t.textPrimary }}>
                  Business email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (error) setError(null); }}
                  placeholder="procurement@company.com"
                  autoFocus
                  style={{
                    height: 44, padding: '0 14px', borderRadius: 10,
                    border: `1.5px solid ${t.border}`, background: t.surface,
                    fontSize: 15, color: t.textPrimary, outline: 'none',
                    boxSizing: 'border-box', width: '100%',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = t.accent;
                    e.target.style.boxShadow = '0 0 0 3px rgba(13,122,107,0.18)';
                    e.target.style.background = t.accentSubtle;
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = t.border;
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = t.surface;
                  }}
                />
              </div>

              <div style={{ marginTop: 4 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', height: 44, borderRadius: 10,
                    background: t.accent, color: '#fff',
                    fontSize: 14, fontWeight: 600, border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: loading ? 0.7 : 1, transition: 'background 0.15s',
                    fontFamily: 'Inter, sans-serif',
                    boxShadow: '0 1px 3px rgba(13,122,107,0.3)',
                  }}
                  onMouseEnter={e => !loading && ((e.currentTarget as HTMLButtonElement).style.background = t.accentHover)}
                  onMouseLeave={e => !loading && ((e.currentTarget as HTMLButtonElement).style.background = t.accent)}
                  onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13,122,107,0.22)'; }}
                  onBlur={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(13,122,107,0.3)'; }}
                >
                  {loading
                    ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    : <><Send size={15} /><span>Send magic link</span></>
                  }
                </button>
              </div>

              <p style={{ fontSize: 13, color: t.textMuted, textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
                We'll never share your email or reveal whether it matches an existing account.
              </p>
            </form>
          ) : (
            /* State: confirmation */
            <div style={{ animation: 'fadeIn 0.25s ease forwards', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                padding: '20px 18px', borderRadius: 12, textAlign: 'center',
                background: t.successSubtle, border: `1.5px solid #86EFAC`,
              }}>
                <CheckCircle2 size={32} color={t.success} style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: '#14532D', marginBottom: 6 }}>Check your inbox</div>
                <p style={{ fontSize: 13, color: '#166534', lineHeight: 1.55, margin: 0 }}>
                  If an active quotation exists for <strong>{email}</strong>, a secure one-click access link has been dispatched.
                </p>
              </div>

              {/* Demo direct open — for testing */}
              <div style={{
                padding: '14px 16px', borderRadius: 10, background: t.surface,
                border: `1px solid ${t.border}`, textAlign: 'center',
              }}>
                <p style={{ fontSize: 12, color: t.textMuted, marginBottom: 10, fontWeight: 500 }}>
                  Demo mode — open directly:
                </p>
                <button
                  type="button"
                  onClick={() => router.push(`/portal/${demoToken || 'token-tcs-1001'}`)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '9px 18px', borderRadius: 8,
                    background: t.accent, color: '#fff', fontSize: 13, fontWeight: 600,
                    border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Open portal <ArrowRight size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => { setSubmitted(false); setEmail(''); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, color: t.textMuted, fontFamily: 'Inter, sans-serif',
                  textAlign: 'center', padding: '4px 0',
                }}
              >
                ← Try a different email address
              </button>
            </div>
          )}

          {/* Demo portal chips — separated by divider */}
          <div style={{ marginTop: 36, paddingTop: 28, borderTop: `1px solid ${t.border}` }}>
            <p style={{
              fontSize: 12, color: t.textMuted, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: 12, textAlign: 'center',
            }}>
              Jump to a demo quotation
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DEMO_PORTALS.map(p => (
                <button key={p.token} type="button"
                  onClick={() => router.push(`/portal/${p.token}`)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 9,
                    border: `1.5px solid ${t.border}`, background: t.surface,
                    cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = t.accent;
                    e.currentTarget.style.background = t.accentSubtle;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = t.border;
                    e.currentTarget.style.background = t.surface;
                  }}
                  onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13,122,107,0.18)'; }}
                  onBlur={e => { e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>{p.company}</div>
                    <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
                      {p.quote} · {p.contact}
                    </div>
                  </div>
                  <ArrowRight size={14} color={t.textMuted} style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>

          {/* Staff login link */}
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <Link href="/" style={{
              fontSize: 13, color: t.textMuted, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              Are you a staff member?{' '}
              <span style={{ color: t.accent, fontWeight: 600 }}>Staff sign-in</span>
              <ArrowRight size={13} color={t.accent} />
            </Link>
          </div>
        </div>
      </div>

      {/* Brand panel — RIGHT, full height, flush to right edge */}
      <div className="portal-brand-panel" style={{
        flex: '0 0 42%',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>
        <BrandPanel />
      </div>
    </div>
  );
}
