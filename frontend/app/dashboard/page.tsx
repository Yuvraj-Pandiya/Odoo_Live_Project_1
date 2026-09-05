'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { dashboardApi, getStoredUser, getStoredToken } from '@/lib/api';
import { canAccessRoute, canCreateQuotation, canApproveAny } from '@/lib/permissions';
import Link from 'next/link';

/* ─── Workspace Design Tokens ────────────────────────────────────────────── */
const t = {
  surface: '#FFFFFF',
  canvas: '#F0F2F7',
  border: '#D8DCE8',
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  accent: '#2D6A4F',
  accentHover: '#1E4D39',
  accentSubtle: '#E8F5EE',
  success: '#16A34A',
  successSubtle: '#DCFCE7',
  error: '#DC2626',
  errorSubtle: '#FEE2E2',
  panelBg: '#1A3D2B',
  panelText: '#FFFFFF',
  panelSubtext: '#86C5A3',
};

const MOCK_STATS = {
  openQuotations: 7,
  pendingApprovals: 4,
  activeQuotes: 23,
  activeAlerts: 3,
  confirmedThisMonth: 11,
};

const MOCK_ALERTS = [
  { id: 1, alertType: 'STALLED_DEAL', description: 'Q-1039 has been idle for 5 days without action', quotationId: 2 },
  { id: 2, alertType: 'DISCOUNT_ANOMALY', description: 'Discount at 22% vs rep average of 8%', quotationId: 4 },
  { id: 3, alertType: 'DELIVERY_SLIPPAGE', description: 'East Depot backorder may delay promise date by 3+ days', quotationId: 4 },
];

const ENTERPRISE_MODULES = [
  { label: 'Quotations', desc: 'CPQ Core — pipeline velocity', icon: 'receipt_long', href: '/quotations', badge: 'Live', style: { bg: t.successSubtle, color: t.success, border: '#86EFAC' } },
  { label: 'Approvals', desc: 'Governance Engine — SLA queue', icon: 'approval', href: '/approvals', badge: '4 pending', style: { bg: t.errorSubtle, color: t.error, border: '#FCA5A5' } },
  { label: 'Invoices', desc: 'Invoice register — A/R tracking', icon: 'payments', href: '/invoices', badge: 'Sync', style: { bg: t.accentSubtle, color: t.accent, border: '#BFDBFE' } },
  { label: 'Fulfillment', desc: 'Warehouse split — backorder mgmt', icon: 'local_shipping', href: '/fulfillment', badge: 'Live', style: { bg: t.successSubtle, color: t.success, border: '#86EFAC' } },
  { label: 'Subscriptions', desc: 'Recurring revenue — MRR/ARR', icon: 'autorenew', href: '/subscriptions', badge: 'Active', style: { bg: t.successSubtle, color: t.success, border: '#86EFAC' } },
  { label: 'Deal Health', desc: 'Anomaly alerts — risk monitoring', icon: 'health_metrics', href: '/deal-health', badge: '3 alerts', style: { bg: t.errorSubtle, color: t.error, border: '#FCA5A5' } },
  { label: 'Customer Portal', desc: 'Live negotiation — self-service', icon: 'group', href: '/portal/login', badge: 'Portal', style: { bg: t.accentSubtle, color: t.accent, border: '#BFDBFE' } },
  { label: 'Reports', desc: 'Admin analytics — audit trail', icon: 'bar_chart', href: '/reports', badge: 'Admin', style: { bg: t.accentSubtle, color: t.accent, border: '#BFDBFE' } },
];

const ALERT_META: Record<string, { icon: string; bg: string; color: string; border: string }> = {
  STALLED_DEAL: { icon: 'hourglass_empty', bg: t.errorSubtle, color: t.error, border: '#FCA5A5' },
  DISCOUNT_ANOMALY: { icon: 'trending_down', bg: t.errorSubtle, color: t.error, border: '#FCA5A5' },
  DELIVERY_SLIPPAGE: { icon: 'local_shipping', bg: t.accentSubtle, color: t.accent, border: '#BFDBFE' },
  BACKORDER_RESOLVED: { icon: 'check_circle', bg: t.successSubtle, color: t.success, border: '#86EFAC' },
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(MOCK_STATS);
  const [alerts, setAlerts] = useState<any[]>(MOCK_ALERTS);
  const [user, setUser] = useState<any>({});

  const loadUser = () => {
    if (typeof window !== 'undefined') {
      const token = getStoredToken();
      const u = getStoredUser();
      if (!token || !u?.email) {
        router.push('/login');
        return;
      }
      setUser(u || {});
    }
  };

  useEffect(() => {
    loadUser();
    const handleAuth = () => loadUser();
    window.addEventListener('dealflow-auth-change', handleAuth);
    return () => window.removeEventListener('dealflow-auth-change', handleAuth);
  }, [router]);

  useEffect(() => {
    dashboardApi.stats().then((r) => setStats(r.data)).catch(() => {});
    dashboardApi.alerts().then((r) => setAlerts(r.data?.slice(0, 5) || MOCK_ALERTS)).catch(() => {});
  }, []);

  const userRole = user?.role || 'SALES_REP';
  const showNewQuote = canCreateQuotation(userRole);
  const showApprovals = canApproveAny(userRole);
  const visibleModules = ENTERPRISE_MODULES.filter((mod) => canAccessRoute(userRole, mod.href));
  const firstName = user.fullName?.split(' ')[0] || 'there';

  return (
    <AppLayout>
      <div
        style={{
          background: t.canvas,
          minHeight: 'calc(100vh - 72px)',
          padding: '32px 48px 48px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* ── 1. Executive Hero Welcome Band ────────────────────────────────── */}
        <div
          style={{
            background: t.panelBg,
            borderRadius: '16px',
            padding: '32px 48px',
            color: t.panelText,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '32px',
            boxShadow: '0 4px 20px rgba(30, 58, 138, 0.15)',
          }}
        >
          <div style={{ maxWidth: '640px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.12)',
                fontSize: '13px',
                fontWeight: 500,
                color: t.panelSubtext,
                marginBottom: '12px',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#86C5A3',

                }}
              />
              <span>Q3 FY26 live cycle</span>
              <span style={{ opacity: 0.5 }}>•</span>
              <span>Day 67 of 90</span>
            </div>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                lineHeight: 1.2,
                color: '#FFFFFF',
                margin: '0 0 8px 0',
                letterSpacing: '-0.4px',
              }}
            >
              <span style={{ color: '#FFFFFF' }}>
                Welcome back, {firstName}
              </span>
            </h1>
            <p
              style={{
                fontSize: '15px',
                fontWeight: 400,
                lineHeight: 1.6,
                color: t.panelSubtext,
                margin: 0,
              }}
            >
              Central command hub linking active pipeline velocity, governance bottlenecks, and cross-tier fulfillment handoffs.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0 }}>
            {/* Quota attainment capsule */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '16px 24px',
                minWidth: '220px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: t.panelSubtext }}>
                  Quota attainment
                </span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#34D399' }}>
                  84.2%
                </span>
              </div>
              <div
                style={{
                  height: '6px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  overflow: 'hidden',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: '84.2%',
                    background: '#34D399',
                    borderRadius: '9999px',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px', color: t.panelSubtext }}>
                <span>$2.1M closed</span>
                <span>Target $2.5M</span>
              </div>
            </div>

            {/* Hero CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {showNewQuote && (
                <Link
                  href="/quotations"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '40px',
                    padding: '0 24px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    color: t.accent,
                    fontSize: '14px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'background 0.15s',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                  <span>New quotation</span>
                </Link>
              )}

              {userRole === 'FINANCE' && (
                <Link
                  href="/invoices"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '40px',
                    padding: '0 24px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    color: t.accent,
                    fontSize: '14px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'background 0.15s',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>payments</span>
                  <span>Manage Invoices</span>
                </Link>
              )}

              {showApprovals && (
                <Link
                  href="/approvals"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '40px',
                    padding: '0 24px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'background 0.15s',
                  }}
                >
                  <span>View approvals</span>
                  {stats.pendingApprovals > 0 && (
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: '#EF4444',
                        color: '#FFFFFF',
                      }}
                    >
                      {stats.pendingApprovals}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── 2. KPI Metric Cards ───────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { label: 'Pending approvals', value: stats.pendingApprovals, icon: 'gavel', link: '/approvals', sub: 'Awaiting SLA decision' },
            { label: 'Active quotations', value: stats.activeQuotes, icon: 'receipt_long', link: '/quotations', sub: 'In active negotiation' },
            { label: 'Deal health alerts', value: stats.activeAlerts, icon: 'warning', link: '/deal-health', sub: 'Requires immediate action', isUrgent: true },
          ].map((card) => (
            <Link
              key={card.label}
              href={card.link}
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: '12px',
                padding: '24px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                transition: 'box-shadow 0.15s, border-color 0.15s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = t.accent;
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(45, 106, 79, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = t.border;
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: t.textSecondary }}>
                  {card.label}
                </span>
                <span
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: card.isUrgent ? t.error : t.textPrimary,
                  }}
                >
                  {card.value}
                </span>
                <span style={{ fontSize: '13px', color: t.textMuted }}>
                  {card.sub}
                </span>
              </div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: card.isUrgent ? t.errorSubtle : t.accentSubtle,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: '20px',
                    color: card.isUrgent ? t.error : t.accent,
                  }}
                >
                  {card.icon}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* ── 3. Recent Activity + Pipeline Snapshot Grid ──────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Recent Activity Card */}
          <div
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '14px', fontWeight: 600, color: t.textPrimary, margin: 0 }}>
                  Recent activity
                </h2>
                <p style={{ fontSize: '13px', color: t.textMuted, margin: '4px 0 0 0' }}>
                  Live deal health alerts requiring team attention
                </p>
              </div>
              <Link
                href="/deal-health"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: t.accent,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>View all</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(alerts.length ? alerts : MOCK_ALERTS).map((alert) => {
                const meta = ALERT_META[alert.alertType] || ALERT_META.DELIVERY_SLIPPAGE;
                return (
                  <div
                    key={alert.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: t.canvas,
                      border: `1px solid ${t.border}`,
                      gap: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: meta.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: meta.color }}>
                          {meta.icon}
                        </span>
                      </div>
                      <span style={{ fontSize: '15px', color: t.textPrimary, lineHeight: 1.5 }}>
                        {alert.description}
                      </span>
                    </div>

                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        background: meta.bg,
                        color: meta.color,
                        border: `1px solid ${meta.border}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {alert.alertType.toLowerCase().replace(/_/g, ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pipeline Snapshot + Quick Actions Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Pipeline Snapshot Card */}
            <div
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: t.textPrimary, margin: 0 }}>
                Pipeline snapshot
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Open quotations', value: stats.openQuotations, isUrgent: false },
                  { label: 'Confirmed this month', value: stats.confirmedThisMonth, isSuccess: true },
                  { label: 'Pending approvals', value: stats.pendingApprovals, isUrgent: false },
                  { label: 'Active alerts', value: stats.activeAlerts, isUrgent: true },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: '8px',
                      borderBottom: `1px solid ${t.border}`,
                    }}
                  >
                    <span style={{ fontSize: '14px', color: t.textSecondary }}>
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: item.isUrgent ? t.error : item.isSuccess ? t.success : t.textPrimary,
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: t.textPrimary, margin: 0 }}>
                Quick actions
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {showNewQuote && (
                  <Link
                    href="/quotations"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      height: '40px',
                      borderRadius: '8px',
                      background: t.accent,
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'background 0.15s',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                    <span>New quotation</span>
                  </Link>
                )}

                {showApprovals && (
                  <Link
                    href="/approvals"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      height: '40px',
                      borderRadius: '8px',
                      background: t.accentSubtle,
                      color: t.accent,
                      fontSize: '14px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      border: `1px solid ${t.border}`,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>approval</span>
                    <span>Review approvals</span>
                  </Link>
                )}

                {canAccessRoute(userRole, '/fulfillment') && (
                  <Link
                    href="/fulfillment"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      height: '40px',
                      borderRadius: '8px',
                      background: t.canvas,
                      color: t.textPrimary,
                      fontSize: '14px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      border: `1px solid ${t.border}`,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>local_shipping</span>
                    <span>Fulfillment orders</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. Enterprise Modules Grid ───────────────────────────────────── */}
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: t.textPrimary, margin: 0 }}>
              Enterprise modules
            </h2>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                background: t.accentSubtle,
                color: t.accent,
                border: `1px solid ${t.border}`,
              }}
            >
              {visibleModules.length} active
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {visibleModules.map((mod) => (
              <Link
                key={mod.label}
                href={mod.href}
                style={{
                  background: t.canvas,
                  border: `1px solid ${t.border}`,
                  borderRadius: '10px',
                  padding: '16px',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = t.accent;
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(46, 81, 214, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = t.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', color: t.accent }}>
                    {mod.icon}
                  </span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: 600,
                      background: mod.style.bg,
                      color: mod.style.color,
                      border: `1px solid ${mod.style.border}`,
                    }}
                  >
                    {mod.badge}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: t.textPrimary, marginBottom: '4px' }}>
                    {mod.label}
                  </div>
                  <div style={{ fontSize: '13px', color: t.textMuted, lineHeight: 1.4 }}>
                    {mod.desc}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
