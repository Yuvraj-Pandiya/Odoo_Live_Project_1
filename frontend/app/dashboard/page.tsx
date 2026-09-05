'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { dashboardApi } from '@/lib/api';
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
  { label: 'Quotations', desc: 'CPQ Core — pipeline velocity', icon: 'receipt_long', href: '/quotations', badge: 'LIVE', badgeColor: 'var(--color-tertiary)' },
  { label: 'Approvals', desc: 'Governance Engine — SLA queue', icon: 'approval', href: '/approvals', badge: '4 PENDING', badgeColor: 'var(--color-error)' },
  { label: 'Invoices', desc: 'Invoice register — A/R tracking', icon: 'payments', href: '/invoices', badge: 'SYNC', badgeColor: 'var(--color-primary)' },
  { label: 'Fulfillment', desc: 'Warehouse split — backorder mgmt', icon: 'local_shipping', href: '/fulfillment', badge: 'LIVE', badgeColor: 'var(--color-tertiary)' },
  { label: 'Subscriptions', desc: 'Recurring revenue — MRR/ARR', icon: 'autorenew', href: '/subscriptions', badge: 'ACTIVE', badgeColor: 'var(--color-tertiary)' },
  { label: 'Deal Health', desc: 'Anomaly alerts — risk monitoring', icon: 'health_metrics', href: '/deal-health', badge: '3 ALERTS', badgeColor: 'var(--color-error)' },
  { label: 'Customer Portal', desc: 'Live negotiation — self-service', icon: 'group', href: '/portal/demo', badge: 'PORTAL', badgeColor: 'var(--color-secondary)' },
  { label: 'Reports', desc: 'Admin analytics — audit trail', icon: 'bar_chart', href: '/reports', badge: 'ADMIN', badgeColor: 'var(--color-primary)' },
];

const ALERT_ICON: Record<string, string> = {
  STALLED_DEAL: 'hourglass_empty',
  DISCOUNT_ANOMALY: 'trending_down',
  DELIVERY_SLIPPAGE: 'local_shipping',
  BACKORDER_RESOLVED: 'check_circle',
};
const ALERT_COLOR: Record<string, string> = {
  STALLED_DEAL: 'var(--color-error)',
  DISCOUNT_ANOMALY: 'var(--color-error)',
  DELIVERY_SLIPPAGE: '#ffc85a',
  BACKORDER_RESOLVED: 'var(--color-tertiary)',
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(MOCK_STATS);
  const [alerts, setAlerts] = useState<any[]>(MOCK_ALERTS);
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = JSON.parse(localStorage.getItem('dealflow_user') || '{}');
      if (!u.email) { router.push('/login'); return; }
      setUser(u);
    }
    dashboardApi.stats().then((r) => setStats(r.data)).catch(() => {});
    dashboardApi.alerts().then((r) => setAlerts(r.data?.slice(0, 5) || MOCK_ALERTS)).catch(() => {});
  }, [router]);

  const firstName = user.fullName?.split(' ')[0] || 'there';

  return (
    <AppLayout>
      <div className="df-page-container flex flex-col" style={{ gap: 'var(--space-xl)' }}>
        {/* ── Executive Greeting ────────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-xl p-6 sm:p-8"
          style={{
            background: 'color-mix(in srgb, var(--color-surface-container-low) 70%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          {/* Ambient glows */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'color-mix(in srgb, var(--color-primary-container) 10%, transparent)' }} />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'color-mix(in srgb, var(--color-tertiary) 8%, transparent)' }} />
          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div style={{ maxWidth: '42rem' }}>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 text-label-sm"
                style={{ background: 'var(--color-surface-container-highest)', color: 'var(--color-tertiary)' }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-tertiary)' }} />
                Q3 FY26 Live Cycle
                <span style={{ color: 'var(--color-outline)' }}>•</span>
                <span style={{ color: 'var(--color-on-surface-variant)' }}>Day 67 of 90</span>
              </div>
              <h1 className="text-display-xl mb-2" style={{ color: 'var(--color-on-surface)' }}>
                Welcome back, {firstName}
              </h1>
              <p className="text-body-lg" style={{ color: 'var(--color-on-surface-variant)' }}>
                Central command hub linking active pipeline velocity, governance bottlenecks, and cross-tier fulfillment handoffs.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
              {/* Quota capsule */}
              <div
                className="rounded-xl flex items-center gap-4 shadow-inner"
                style={{ background: 'color-mix(in srgb, var(--color-surface-container) 90%, transparent)', padding: '0.75rem 1rem' }}
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="text-label-sm uppercase tracking-wider" style={{ color: 'var(--color-outline)' }}>Quota Attainment</span>
                    <span className="text-meta-numeric" style={{ color: 'var(--color-tertiary)' }}>84.2%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ width: '160px', background: 'var(--color-surface-container-highest)' }}>
                    <div className="h-full rounded-full" style={{ width: '84.2%', background: 'var(--color-tertiary)' }} />
                  </div>
                  <div className="flex justify-between mt-1 text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                    <span>$2.1M closed</span>
                    <span style={{ color: 'var(--color-outline)' }}>Target $2.5M</span>
                  </div>
                </div>
              </div>
              {/* CTAs */}
              <div className="flex items-center gap-3">
                <Link href="/approvals" className="btn-secondary relative">
                  View Approvals
                  {stats.pendingApprovals > 0 && (
                    <span
                      className="ml-2 text-label-sm px-1.5 py-0.5 rounded-full font-bold"
                      style={{
                        background: 'color-mix(in srgb, var(--color-error-container) 30%, transparent)',
                        color: 'var(--color-error)',
                      }}
                    >
                      {stats.pendingApprovals}
                    </span>
                  )}
                </Link>
                <Link href="/quotations" className="btn-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                  New Quotation
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI Metric Cards ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 df-stagger">
          {[
            { label: 'Pending Approvals', value: stats.pendingApprovals, icon: 'gavel', color: 'var(--color-error)', link: '/approvals', sub: 'Awaiting decision' },
            { label: 'Active Quotations', value: stats.activeQuotes, icon: 'receipt_long', color: 'var(--color-primary)', link: '/quotations', sub: 'In pipeline' },
            { label: 'Deal Health Alerts', value: stats.activeAlerts, icon: 'warning', color: '#ffc85a', link: '/deal-health', sub: 'Require action' },
          ].map((card) => (
            <Link
              key={card.label}
              href={card.link}
              className="rounded-xl p-5 flex items-start gap-4 animate-df-in transition-all cursor-pointer group"
              style={{
                background: 'color-mix(in srgb, var(--color-surface-container-low) 80%, transparent)',
                border: '1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = `color-mix(in srgb, ${card.color} 40%, transparent)`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 24px color-mix(in srgb, ${card.color} 15%, transparent)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'color-mix(in srgb, var(--color-outline-variant) 30%, transparent)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <div
                className="rounded-lg flex items-center justify-center shrink-0"
                style={{
                  width: '44px', height: '44px',
                  background: `color-mix(in srgb, ${card.color} 15%, transparent)`,
                }}
              >
                <span className="material-symbols-outlined" style={{ color: card.color, fontSize: '22px' }}>{card.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-display-xl" style={{ color: card.color, lineHeight: 1.1, fontSize: '2.5rem', fontWeight: 900 }}>
                  {card.value}
                </div>
                <div className="text-label-md mt-1" style={{ color: 'var(--color-on-surface)' }}>{card.label}</div>
                <div className="text-body-sm mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>{card.sub}</div>
              </div>
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1" style={{ color: 'var(--color-outline)', fontSize: '18px', marginTop: '2px' }}>arrow_forward</span>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ── Recent Activity / Alerts ───────────────────────── */}
          <div className="xl:col-span-2">
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: 'var(--color-surface-container-low)',
                border: '1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)',
              }}
            >
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)' }}>
                <div>
                  <h2 className="text-headline-sm" style={{ color: 'var(--color-on-surface)' }}>Recent Activity</h2>
                  <p className="text-body-sm mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>Live deal health alerts requiring attention</p>
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
                    style={{ background: 'var(--color-surface-container)' }}
                  >
                    <div
                      className="rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        width: '32px', height: '32px',
                        background: `color-mix(in srgb, ${ALERT_COLOR[alert.alertType] || 'var(--color-outline)'} 15%, transparent)`,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ color: ALERT_COLOR[alert.alertType] || 'var(--color-outline)', fontSize: '16px' }}>
                        {ALERT_ICON[alert.alertType] || 'warning'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm" style={{ color: 'var(--color-on-surface)' }}>{alert.description}</p>
                      <span
                        className="badge mt-1"
                        style={{
                          background: `color-mix(in srgb, ${ALERT_COLOR[alert.alertType] || 'var(--color-outline)'} 12%, transparent)`,
                          color: ALERT_COLOR[alert.alertType] || 'var(--color-outline)',
                          border: `1px solid color-mix(in srgb, ${ALERT_COLOR[alert.alertType] || 'var(--color-outline)'} 25%, transparent)`,
                        }}
                      >
                        {alert.alertType.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
                {!alerts.length && (
                  <p className="text-body-md text-center py-6" style={{ color: 'var(--color-on-surface-variant)' }}>
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
                background: 'var(--color-surface-container-low)',
                border: '1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)',
              }}
            >
              <h2 className="text-headline-sm mb-4" style={{ color: 'var(--color-on-surface)' }}>Pipeline Snapshot</h2>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Open Quotations', value: stats.openQuotations, color: 'var(--color-primary)' },
                  { label: 'Confirmed This Month', value: stats.confirmedThisMonth, color: 'var(--color-tertiary)' },
                  { label: 'Pending Approvals', value: stats.pendingApprovals, color: '#ffc85a' },
                  { label: 'Active Alerts', value: stats.activeAlerts, color: 'var(--color-error)' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{item.label}</span>
                    <span className="text-meta-numeric" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-xl p-4"
              style={{
                background: 'color-mix(in srgb, var(--color-primary-container) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '18px' }}>bolt</span>
                <span className="text-headline-sm" style={{ color: 'var(--color-primary)' }}>Quick Actions</span>
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
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-headline-md" style={{ color: 'var(--color-on-surface)' }}>Enterprise Modules</h2>
            <span className="badge badge-primary">8 ACTIVE</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ENTERPRISE_MODULES.map((mod) => (
              <Link
                key={mod.label}
                href={mod.href}
                className="rounded-xl p-4 flex flex-col gap-3 transition-all cursor-pointer group"
                style={{
                  background: 'var(--color-surface-container)',
                  border: '1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-container-high)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'color-mix(in srgb, var(--color-outline-variant) 60%, transparent)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-container)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'color-mix(in srgb, var(--color-outline-variant) 30%, transparent)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <span className="material-symbols-outlined text-headline-md" style={{ color: mod.badgeColor }}>{mod.icon}</span>
                <div>
                  <div className="text-label-md mb-0.5" style={{ color: 'var(--color-on-surface)' }}>{mod.label}</div>
                  <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{mod.desc}</div>
                </div>
                <span className="badge" style={{
                  background: `color-mix(in srgb, ${mod.badgeColor} 12%, transparent)`,
                  color: mod.badgeColor,
                  border: `1px solid color-mix(in srgb, ${mod.badgeColor} 25%, transparent)`,
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
