'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { dashboardApi } from '@/lib/api';
import { AlertTriangle, Clock, TrendingUp, Zap, CheckCircle } from 'lucide-react';

const ALERT_CONFIG: any = {
  STALLED_DEAL:      { color: 'hsl(38 92% 65%)',  icon: Clock,          label: 'Stalled Deal' },
  DISCOUNT_ANOMALY:  { color: 'hsl(0 84% 70%)',   icon: AlertTriangle,  label: 'Discount Anomaly' },
  DELIVERY_SLIPPAGE: { color: 'hsl(262 83% 72%)', icon: TrendingUp,     label: 'Delivery Slippage' },
  BACKORDER_RESOLVED:{ color: 'hsl(142 70% 60%)', icon: CheckCircle,    label: 'Backorder Resolved' },
};

export default function DealHealthPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await dashboardApi.alerts();
    setAlerts(res.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const resolve = async (id: number, action: string) => {
    await dashboardApi.resolveAlert(id, action);
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const summary = {
    stalled:   alerts.filter(a => a.alertType === 'STALLED_DEAL').length,
    anomalies: alerts.filter(a => a.alertType === 'DISCOUNT_ANOMALY').length,
    slippage:  alerts.filter(a => a.alertType === 'DELIVERY_SLIPPAGE').length,
  };

  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Deal Health & Anomaly Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(215 20% 65%)' }}>Real-time flags for stalled deals and unusual discount patterns</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Stalled Deals',    count: summary.stalled,   color: 'hsl(38 92% 65%)',  bg: 'hsl(38 92% 50% / 0.15)', sub: `idle ${7}+ days` },
            { label: 'Discount Anomalies',count: summary.anomalies, color: 'hsl(0 84% 70%)',   bg: 'hsl(0 84% 60% / 0.15)',  sub: 'above rep average' },
            { label: 'Delivery Slippage', count: summary.slippage,  color: 'hsl(262 83% 72%)', bg: 'hsl(262 83% 58% / 0.15)',sub: 'promise dates at risk' },
          ].map(s => (
            <div key={s.label} className="glass-card p-5">
              <p className="text-sm" style={{ color: 'hsl(215 20% 65%)' }}>{s.label}</p>
              <p className="text-3xl font-bold mt-2" style={{ color: s.color }}>{loading ? '—' : s.count}</p>
              <p className="text-xs mt-1" style={{ color: 'hsl(215 15% 45%)' }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Alert List */}
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'hsl(222 47% 22%)' }}>
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Zap size={14} style={{ color: 'hsl(38 92% 65%)' }} />
              Active Alerts ({alerts.length})
            </h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-sm" style={{ color: 'hsl(215 20% 65%)' }}>Loading…</div>
          ) : alerts.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle size={32} className="mx-auto mb-3" style={{ color: 'hsl(142 70% 60%)' }} />
              <p className="font-medium text-white">All deals healthy!</p>
              <p className="text-sm mt-1" style={{ color: 'hsl(215 20% 65%)' }}>No active alerts at this time</p>
            </div>
          ) : (
            <table className="df-table">
              <thead>
                <tr>
                  <th>Deal</th>
                  <th>Alert Type</th>
                  <th>Description</th>
                  <th>Flagged</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a: any) => {
                  const cfg = ALERT_CONFIG[a.alertType] || ALERT_CONFIG.STALLED_DEAL;
                  const Icon = cfg.icon;
                  return (
                    <tr key={a.id}>
                      <td className="font-mono text-xs font-bold" style={{ color: 'hsl(220 90% 70%)' }}>
                        {a.quotation?.quoteNumber || `Q-${a.quotation?.id}`}
                      </td>
                      <td>
                        <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: cfg.color }}>
                          <Icon size={12} /> {cfg.label}
                        </span>
                      </td>
                      <td className="text-sm" style={{ color: 'hsl(215 20% 65%)', maxWidth: 300 }}>{a.description}</td>
                      <td className="text-xs" style={{ color: 'hsl(215 15% 45%)' }}>
                        {a.flaggedAt ? new Date(a.flaggedAt).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => resolve(a.id, 'Nudge sent')}
                                  className="text-xs px-3 py-1 rounded" style={{ background: 'hsl(220 90% 56% / 0.15)', color: 'hsl(220 90% 70%)' }}>
                            Nudge Rep
                          </button>
                          <button onClick={() => resolve(a.id, 'Escalated to manager')}
                                  className="text-xs px-3 py-1 rounded" style={{ background: 'hsl(38 92% 50% / 0.15)', color: 'hsl(38 92% 65%)' }}>
                            Escalate
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
