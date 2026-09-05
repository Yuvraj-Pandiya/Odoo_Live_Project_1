'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { dashboardApi, quotationApi } from '@/lib/api';
import {
  FileText, CheckSquare, TrendingUp, AlertTriangle,
  ArrowRight, Clock, Zap, Activity, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

const STATUS_COLORS: any = {
  DRAFT:            { bg: 'hsl(215 15% 45% / 0.15)', text: 'hsl(215 20% 65%)', label: 'Draft' },
  PENDING_APPROVAL: { bg: 'hsl(38 92% 50% / 0.15)',  text: 'hsl(38 92% 65%)',  label: 'Pending Approval' },
  APPROVED:         { bg: 'hsl(142 70% 45% / 0.15)', text: 'hsl(142 70% 60%)', label: 'Approved' },
  REJECTED:         { bg: 'hsl(0 84% 60% / 0.15)',   text: 'hsl(0 84% 70%)',   label: 'Rejected' },
  CONFIRMED:        { bg: 'hsl(220 90% 56% / 0.15)', text: 'hsl(220 90% 70%)', label: 'Confirmed' },
  NEGOTIATION:      { bg: 'hsl(262 83% 58% / 0.15)', text: 'hsl(262 83% 72%)', label: 'Negotiation' },
};

const RISK_COLORS: any = {
  HIGH:   { bg: 'hsl(0 84% 60% / 0.15)',   text: 'hsl(0 84% 70%)' },
  MEDIUM: { bg: 'hsl(38 92% 50% / 0.15)',  text: 'hsl(38 92% 65%)' },
  LOW:    { bg: 'hsl(142 70% 45% / 0.15)', text: 'hsl(142 70% 60%)' },
};

export default function DashboardPage() {
  const [stats, setStats]         = useState<any>(null);
  const [alerts, setAlerts]       = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, a, q] = await Promise.all([
        dashboardApi.stats(),
        dashboardApi.alerts(),
        quotationApi.list(),
      ]);
      setStats(s.data);
      setAlerts(a.data.slice(0, 5));
      setQuotations(q.data.slice(0, 6));
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resolveAlert = async (id: number) => {
    try {
      await dashboardApi.resolveAlert(id, 'Nudge sent via dashboard');
      setAlerts(a => a.filter(x => x.id !== id));
    } catch {}
  };

  const KPICard = ({ label, value, icon: Icon, color, sub }: any) => (
    <div className="glass-card p-5 flex flex-col gap-3 animate-in">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: 'hsl(215 20% 65%)' }}>{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{loading ? '—' : value}</p>
      {sub && <p className="text-xs" style={{ color: 'hsl(215 15% 45%)' }}>{sub}</p>}
    </div>
  );

  return (
    <AppLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Sales Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: 'hsl(215 20% 65%)' }}>
              Real-time deal intelligence and pipeline overview
            </p>
          </div>
          <button onClick={load} className="btn-secondary gap-2">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard label="Open Quotations"   value={stats?.openQuotations ?? 0}   icon={FileText}      color="hsl(220 90% 70%)"  sub="Active drafts" />
          <KPICard label="Pending Approvals" value={stats?.pendingApprovals ?? 0} icon={CheckSquare}   color="hsl(38 92% 65%)"   sub="Awaiting review" />
          <KPICard label="Active Deals"      value={stats?.activeQuotes ?? 0}     icon={Activity}      color="hsl(262 83% 72%)"  sub="Total quotations" />
          <KPICard label="Deal Alerts"       value={stats?.activeAlerts ?? 0}     icon={AlertTriangle} color="hsl(0 84% 70%)"    sub="Unresolved" />
          <KPICard label="Confirmed"         value={stats?.confirmedThisMonth ?? 0} icon={TrendingUp}  color="hsl(142 70% 60%)"  sub="Confirmed deals" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Quotations */}
          <div className="lg:col-span-2 glass-card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'hsl(222 47% 22%)' }}>
              <h2 className="font-semibold text-white">Recent Quotations</h2>
              <Link href="/quotations" className="flex items-center gap-1 text-xs font-medium" style={{ color: 'hsl(220 90% 70%)' }}>
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center" style={{ color: 'hsl(215 20% 65%)' }}>Loading…</div>
              ) : (
                <table className="df-table">
                  <thead>
                    <tr>
                      <th>Quote #</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Risk</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.map((q: any) => {
                      const sc = STATUS_COLORS[q.status] || STATUS_COLORS.DRAFT;
                      const rc = q.riskLevel ? RISK_COLORS[q.riskLevel] : null;
                      return (
                        <tr key={q.id} onClick={() => window.location.href = `/quotations/${q.id}`}>
                          <td className="font-mono text-xs font-semibold" style={{ color: 'hsl(220 90% 70%)' }}>{q.quoteNumber}</td>
                          <td className="font-medium text-white">{q.customer?.name || q.customerName || '—'}</td>
                          <td className="font-semibold text-white">${Number(q.grandTotal || 0).toLocaleString()}</td>
                          <td>{rc ? <span className="badge" style={{ background: rc.bg, color: rc.text }}>{q.riskLevel}</span> : <span className="badge badge-muted">—</span>}</td>
                          <td><span className="badge" style={{ background: sc.bg, color: sc.text }}>{sc.label}</span></td>
                        </tr>
                      );
                    })}
                    {quotations.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-8" style={{ color: 'hsl(215 15% 45%)' }}>No quotations yet</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Deal Health Alerts */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'hsl(222 47% 22%)' }}>
              <h2 className="font-semibold text-white flex items-center gap-2">
                <AlertTriangle size={14} style={{ color: 'hsl(38 92% 65%)' }} />
                Deal Health Alerts
              </h2>
              <Link href="/deal-health" className="text-xs" style={{ color: 'hsl(220 90% 70%)' }}>View all</Link>
            </div>
            <div className="p-3 space-y-2">
              {loading ? (
                <div className="p-4 text-center text-sm" style={{ color: 'hsl(215 20% 65%)' }}>Loading…</div>
              ) : alerts.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'hsl(142 70% 45% / 0.15)' }}>
                    <Zap size={18} style={{ color: 'hsl(142 70% 60%)' }} />
                  </div>
                  <p className="text-sm font-medium text-white">All clear!</p>
                  <p className="text-xs mt-1" style={{ color: 'hsl(215 15% 45%)' }}>No active deal alerts</p>
                </div>
              ) : alerts.map((alert: any) => {
                const ALERT_COLOR: any = {
                  STALLED_DEAL:      'hsl(38 92% 65%)',
                  DISCOUNT_ANOMALY:  'hsl(0 84% 70%)',
                  DELIVERY_SLIPPAGE: 'hsl(262 83% 72%)',
                };
                const color = ALERT_COLOR[alert.alertType] || 'hsl(215 20% 65%)';
                return (
                  <div key={alert.id} className="p-3 rounded-lg" style={{ background: 'hsl(222 47% 15%)', border: '1px solid hsl(222 47% 22%)' }}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={12} style={{ color, marginTop: 2, flexShrink: 0 }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium" style={{ color }}>{alert.alertType?.replace(/_/g,' ')}</p>
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'hsl(215 20% 65%)' }}>{alert.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => resolveAlert(alert.id)}
                              className="text-xs px-2 py-1 rounded" style={{ background: 'hsl(142 70% 45% / 0.15)', color: 'hsl(142 70% 60%)' }}>
                        Nudge
                      </button>
                      <Link href="/deal-health" className="text-xs px-2 py-1 rounded" style={{ background: 'hsl(222 47% 22%)', color: 'hsl(215 20% 65%)' }}>
                        View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
