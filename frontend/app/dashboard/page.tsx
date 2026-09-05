'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { dashboardApi, getStoredUser, getStoredToken } from '@/lib/api';
import Link from 'next/link';

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
  { label: 'Quotations', desc: 'CPQ Core — pipeline velocity', icon: 'receipt_long', href: '/quotations', badge: 'LIVE', badgeColor: '#22c55e' },
  { label: 'Approvals', desc: 'Governance Engine — SLA queue', icon: 'approval', href: '/approvals', badge: '4 PENDING', badgeColor: '#ff4d4f' },
  { label: 'Invoices', desc: 'Invoice register — A/R tracking', icon: 'payments', href: '/invoices', badge: 'SYNC', badgeColor: '#e0e0e0' },
  { label: 'Fulfillment', desc: 'Warehouse split — backorder mgmt', icon: 'local_shipping', href: '/fulfillment', badge: 'LIVE', badgeColor: '#22c55e' },
  { label: 'Subscriptions', desc: 'Recurring revenue — MRR/ARR', icon: 'autorenew', href: '/subscriptions', badge: 'ACTIVE', badgeColor: '#22c55e' },
  { label: 'Deal Health', desc: 'Anomaly alerts — risk monitoring', icon: 'health_metrics', href: '/deal-health', badge: '3 ALERTS', badgeColor: '#ff4d4f' },
  { label: 'Customer Portal', desc: 'Live negotiation — self-service', icon: 'group', href: '/portal/demo', badge: 'PORTAL', badgeColor: '#a78bfa' },
  { label: 'Reports', desc: 'Admin analytics — audit trail', icon: 'bar_chart', href: '/reports', badge: 'ADMIN', badgeColor: '#e0e0e0' },
];

const ALERT_ICON: Record<string, string> = {
  STALLED_DEAL: 'hourglass_empty',
  DISCOUNT_ANOMALY: 'trending_down',
  DELIVERY_SLIPPAGE: 'local_shipping',
  BACKORDER_RESOLVED: 'check_circle',
};
const ALERT_COLOR: Record<string, string> = {
  STALLED_DEAL: '#ff4d4f',
  DISCOUNT_ANOMALY: '#ff4d4f',
  DELIVERY_SLIPPAGE: '#e0e0e0',
  BACKORDER_RESOLVED: '#22c55e',
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(MOCK_STATS);
  const [alerts, setAlerts] = useState<any[]>(MOCK_ALERTS);
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = getStoredToken();
      const u = getStoredUser();
      if (!token || !u.email) {
        router.push('/login');
        return;
      }
      setUser(u);
    }
    dashboardApi.stats().then((r) => setStats(r.data)).catch(() => {});
    dashboardApi.alerts().then((r) => setAlerts(r.data?.slice(0, 5) || MOCK_ALERTS)).catch(() => {});
  }, [router]);

  const firstName = user.fullName?.split(' ')[0] || 'there';

  return (
    <AppLayout>
      <div className="df-page-container flex flex-col" style={{ gap: '3rem' }}>


        {/* ── Executive Greeting ────────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-xl p-6 sm:p-8"
          style={{
            background: 'linear-gradient(135deg, #111111 0%, #141414 100%)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            boxShadow: '0 4px 40px rgba(0,0,0,0.6)',
          }}
        >
          {/* Subtle top-right glow */}
          <div
            className="absolute top-0 right-0 pointer-events-none"
            style={{
              width: '300px', height: '200px',
              background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.03) 0%, transparent 70%)',
            }}
          />
          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div style={{ maxWidth: '42rem' }}>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontSize: '12px', fontWeight: 600,
                  color: '#888888',
                }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#e0e0e0' }} />
                Q3 FY26 Live Cycle
                <span style={{ color: '#555555' }}>•</span>
                <span style={{ color: '#888888' }}>Day 67 of 90</span>
              </div>
              <h1 className="text-heading-1 mb-2" style={{ color: '#f0f0f0' }}>
                Welcome back, {firstName}
              </h1>
              <p className="text-body-lg" style={{ color: '#888888' }}>
                Central command hub linking active pipeline velocity, governance bottlenecks, and cross-tier fulfillment handoffs.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
              {/* Quota capsule */}
              <div
                className="rounded-xl flex items-center gap-4 p-4"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-6 mb-2">
                    <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#555555' }}>Quota Attainment</span>
                    <span className="text-subheading" style={{ color: '#22c55e', fontWeight: 700 }}>84.2%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden w-44" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: '84.2%', background: 'linear-gradient(90deg, #16a34a, #22c55e)' }} />
                  </div>
                  <div className="flex justify-between mt-1.5" style={{ fontSize: '11px', color: '#555555' }}>
                    <span>$2.1M closed</span>
                    <span>Target $2.5M</span>
                  </div>
                </div>
              </div>
              {/* CTAs */}
              <div className="flex items-center gap-3">
                <Link href="/approvals" className="btn-secondary relative text-body-base">
                  View Approvals
                  {stats.pendingApprovals > 0 && (
                    <span
                      style={{
                        marginLeft: '6px', fontSize: '11px',
                        padding: '1px 6px', borderRadius: '9999px',
                        fontWeight: 700, background: 'rgba(255,77,79,0.15)',
                        color: '#ff4d4f', border: '1px solid rgba(255,77,79,0.3)',
                      }}
                    >
                      {stats.pendingApprovals}
                    </span>
                  )}
                </Link>
                <Link href="/quotations" className="btn-primary text-body-base">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                  New Quotation
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI Metric Cards ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Pending Approvals', value: stats.pendingApprovals, icon: 'gavel', color: '#ff4d4f', link: '/approvals', sub: 'Awaiting decision' },
            { label: 'Active Quotations', value: stats.activeQuotes, icon: 'receipt_long', color: '#e0e0e0', link: '/quotations', sub: 'In pipeline' },
            { label: 'Deal Health Alerts', value: stats.activeAlerts, icon: 'warning', color: '#e0e0e0', link: '/deal-health', sub: 'Require action' },

          ].map((card) => (
            <Link
              key={card.label}
              href={card.link}
              className="df-card flex items-start gap-4 transition-all cursor-pointer group"
              style={{ textDecoration: 'none' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 32px rgba(0,0,0,0.8)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.4)';
              }}
            >
              <div
                className="rounded-lg flex items-center justify-center shrink-0 w-11 h-11"
                style={{
                  background: `rgba(${card.color === '#ff4d4f' ? '255,77,79' : card.color === '#e0e0e0' ? '255,255,255' : '234,179,8'}, 0.08)`,
                  border: `1px solid rgba(${card.color === '#ff4d4f' ? '255,77,79' : card.color === '#e0e0e0' ? '255,255,255' : '234,179,8'}, 0.14)`,
                }}
              >
                <span className="material-symbols-outlined" style={{ color: card.color, fontSize: '22px' }}>{card.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-display" style={{ color: card.color }}>
                  {card.value}
                </div>
                <div className="text-heading-3 mt-1" style={{ color: '#e0e0e0' }}>{card.label}</div>
                <div className="text-caption mt-0.5">{card.sub}</div>
              </div>
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1" style={{ fontSize: '18px', marginTop: '2px', color: '#444444' }}>arrow_forward</span>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ── Recent Activity / Alerts ───────────────────────── */}
          <div className="xl:col-span-2">
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: '#111111',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 2px 20px rgba(0,0,0,0.6)',
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div>
                  <h2 className="text-heading-2" style={{ color: '#f0f0f0' }}>Recent Activity</h2>
                  <p className="text-body-base mt-0.5" style={{ color: '#555555' }}>Live deal health alerts requiring attention</p>
                </div>
                <Link href="/deal-health" className="btn-ghost" style={{ padding: '0.25rem 0.75rem' }}>
                  View all
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                </Link>
              </div>
              <div className="p-4 flex flex-col gap-2">
                {(alerts.length ? alerts : MOCK_ALERTS).map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 rounded-lg transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div
                      className="rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        width: '32px', height: '32px',
                        background: `rgba(${ALERT_COLOR[alert.alertType] === '#ff4d4f' ? '255,77,79' : ALERT_COLOR[alert.alertType] === '#e0e0e0' ? '255,255,255' : '34,197,94'}, 0.10)`,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ color: ALERT_COLOR[alert.alertType] || '#888888', fontSize: '16px' }}>
                        {ALERT_ICON[alert.alertType] || 'warning'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-base" style={{ color: '#d0d0d0' }}>{alert.description}</p>
                      <span
                        className="badge mt-1"
                        style={{
                          background: `rgba(${ALERT_COLOR[alert.alertType] === '#ff4d4f' ? '255,77,79' : ALERT_COLOR[alert.alertType] === '#e0e0e0' ? '255,255,255' : '34,197,94'}, 0.08)`,
                          color: ALERT_COLOR[alert.alertType] || '#888888',
                          border: `1px solid rgba(${ALERT_COLOR[alert.alertType] === '#ff4d4f' ? '255,77,79' : ALERT_COLOR[alert.alertType] === '#e0e0e0' ? '255,255,255' : '34,197,94'}, 0.18)`,
                        }}
                      >
                        {alert.alertType.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
                {!alerts.length && (
                  <p className="text-body-base text-center py-6" style={{ color: '#555555' }}>
                    No active alerts — deal health looks good!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Quick Stats ─────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div
              className="rounded-xl p-5"
              style={{
                background: '#111111',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 2px 20px rgba(0,0,0,0.6)',
              }}
            >
              <h2 className="text-heading-2 mb-4" style={{ color: '#f0f0f0' }}>Pipeline Snapshot</h2>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Open Quotations', value: stats.openQuotations, color: '#f0f0f0' },
                  { label: 'Confirmed This Month', value: stats.confirmedThisMonth, color: '#22c55e' },
                  { label: 'Pending Approvals', value: stats.pendingApprovals, color: '#e0e0e0' },
                  { label: 'Active Alerts', value: stats.activeAlerts, color: '#ff4d4f' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-body-base" style={{ color: '#888888' }}>{item.label}</span>
                    <span className="text-heading-3" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-xl p-4"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#e0e0e0' }}>bolt</span>
                <span className="text-heading-3" style={{ color: '#f0f0f0' }}>Quick Actions</span>
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/quotations" className="btn-primary w-full justify-center" style={{ padding: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                  New Quotation
                </Link>
                <Link href="/approvals" className="btn-secondary w-full justify-center" style={{ padding: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>approval</span>
                  Review Approvals
                </Link>
                <Link href="/deal-health" className="btn-ghost w-full justify-center" style={{ padding: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>health_metrics</span>
                  Deal Health
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Enterprise Modules Grid ────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-heading-2" style={{ color: '#f0f0f0' }}>Enterprise Modules</h2>
            <span className="badge badge-primary">8 ACTIVE</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ENTERPRISE_MODULES.map((mod) => (
              <Link
                key={mod.label}
                href={mod.href}
                className="rounded-xl p-4 flex flex-col gap-3 transition-all cursor-pointer group"
                style={{
                  background: '#111111',
                  border: '1px solid rgba(255,255,255,0.07)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#161616';
                  (e.currentTarget as HTMLElement).style.borderColor = `rgba(${mod.badgeColor === '#22c55e' ? '34,197,94' : mod.badgeColor === '#ff4d4f' ? '255,77,79' : mod.badgeColor === '#e0e0e0' ? '255,255,255' : '167,139,250'}, 0.20)`;
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.7)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#111111';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <span className="material-symbols-outlined" style={{ color: mod.badgeColor, fontSize: '24px' }}>{mod.icon}</span>
                <div>
                  <div className="text-label-md mb-0.5" style={{ color: '#e0e0e0' }}>{mod.label}</div>
                  <div className="text-body-sm" style={{ color: '#555555' }}>{mod.desc}</div>
                </div>
                <span className="badge" style={{
                  background: `rgba(${mod.badgeColor === '#22c55e' ? '34,197,94' : mod.badgeColor === '#ff4d4f' ? '255,77,79' : mod.badgeColor === '#e0e0e0' ? '255,255,255' : '167,139,250'}, 0.08)`,
                  color: mod.badgeColor,
                  border: `1px solid rgba(${mod.badgeColor === '#22c55e' ? '34,197,94' : mod.badgeColor === '#ff4d4f' ? '255,77,79' : mod.badgeColor === '#e0e0e0' ? '255,255,255' : '167,139,250'}, 0.18)`,
                  fontSize: '10px',
                  alignSelf: 'flex-start',
                }}>
                  {mod.badge}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
