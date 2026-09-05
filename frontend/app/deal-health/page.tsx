'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { CheckCircle, RefreshCw, AlertTriangle, Percent, Truck, PauseCircle } from 'lucide-react';

interface Anomaly {
  id: string;
  pillar: 'Stalled Deal' | 'Discount Anomaly' | 'Delivery Slippage';
  account: string;
  quotationRef: string;
  owner: string;
  severity: 'High' | 'Medium' | 'Low';
  metric: string;
  impact: string;
  suggestedAction: string;
  status: 'Open' | 'Resolved';
}

const initialAnomalies: Anomaly[] = [
  {
    id: 'ANOM-101',
    pillar: 'Stalled Deal',
    account: 'Apex Dynamics',
    quotationRef: 'Q-1035',
    owner: 'Marcus Vance',
    severity: 'High',
    metric: 'Idle for 12 days at Manager Approval stage',
    impact: '₹480,000 ARR at risk',
    suggestedAction: 'Auto-Nudge Approval Chain',
    status: 'Open',
  },
  {
    id: 'ANOM-102',
    pillar: 'Discount Anomaly',
    account: 'Delta Logistics LLC',
    quotationRef: 'Q-1048',
    owner: 'Sarah Lin',
    severity: 'High',
    metric: '22.0% hardware discount (Peer avg: 8.5%)',
    impact: '-₹218,000 Margin Leakage',
    suggestedAction: 'Require VP Exception Approval',
    status: 'Open',
  },
  {
    id: 'ANOM-103',
    pillar: 'Delivery Slippage',
    account: 'Starlight Tech Inc',
    quotationRef: 'Q-1030',
    owner: 'David Kim',
    severity: 'Medium',
    metric: 'East Depot stockout adds +4.2 days transit delay',
    impact: 'Missed SLA penalty risk (₹12k)',
    suggestedAction: 'Re-route to West Hub Split',
    status: 'Open',
  },
  {
    id: 'ANOM-104',
    pillar: 'Stalled Deal',
    account: 'Vanguard Systems',
    quotationRef: 'Q-1022',
    owner: 'Elena Rostova',
    severity: 'Medium',
    metric: 'Customer portal view inactive for 8 days',
    impact: '₹210,000 ARR stalled',
    suggestedAction: 'Send Counter-Offer Reminder',
    status: 'Open',
  },
];

export default function DealHealthPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>(initialAnomalies);
  const [pillarFilter, setPillarFilter] = useState<string>('All');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleResolve = (id: string) => {
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
    triggerToast(`Anomaly ${id} resolved successfully.`);
  };

  const filtered = anomalies.filter(a => pillarFilter === 'All' || a.pillar === pillarFilter);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-20 right-8 z-50 bg-[var(--success)] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
            <CheckCircle size={18} />
            <span className="text-sm font-semibold">{toastMsg}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 section-label text-[var(--error)]">
              <span className="w-2 h-2 rounded-full bg-[var(--error)] animate-ping"></span>
              Live audit monitor • Anomaly detector v4.2
            </div>
            <h1 className="page-heading mt-1">Deal Health & Anomaly Dashboard</h1>
            <p className="body-text mt-1 max-w-3xl">
              Real-time automated diagnostic flags for stalled pipeline deals, discount margin leaks, and delivery SLA risks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => triggerToast('Full pipeline rescan completed. 0 new anomalies detected.')}
              className="btn-primary flex items-center gap-2"
            >
              <RefreshCw size={16} />
              <span>Force Rescan</span>
            </button>
          </div>
        </div>

        {/* 3 Bento Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Stalled Deals */}
          <div className="df-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="section-label text-amber-700 flex items-center gap-1">
                  <PauseCircle size={14} />
                  Velocity bottleneck
                </div>
                <h3 className="section-label text-base text-[var(--text-primary)] mt-1">Stalled deals</h3>
              </div>
              <span className="text-3xl font-bold text-amber-600">05</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between body-sm">
                <span>Quotes idle &gt; 7 days</span>
                <span className="text-amber-700 font-semibold">₹1.42M ARR at risk</span>
              </div>
              <div className="w-full bg-[var(--canvas)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
                <div className="bg-amber-500 h-full w-2/3 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Card 2: Discount Anomalies */}
          <div className="df-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="section-label text-[var(--error)] flex items-center gap-1">
                  <Percent size={14} />
                  Margin leakage
                </div>
                <h3 className="section-label text-base text-[var(--text-primary)] mt-1">Discount anomalies</h3>
              </div>
              <span className="text-3xl font-bold text-[var(--error)]">02</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between body-sm">
                <span>Exceeds peer limit &gt; 14%</span>
                <span className="text-[var(--error)] font-semibold">-₹218k Gross margin</span>
              </div>
              <div className="w-full bg-[var(--canvas)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
                <div className="bg-[var(--error)] h-full w-[84%] rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Card 3: Delivery Slippage */}
          <div className="df-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="section-label text-purple-700 flex items-center gap-1">
                  <Truck size={14} />
                  SLA commitment risk
                </div>
                <h3 className="section-label text-base text-[var(--text-primary)] mt-1">Delivery slippage</h3>
              </div>
              <span className="text-3xl font-bold text-purple-600">03</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between body-sm">
                <span>Warehouse transit delays</span>
                <span className="text-purple-700 font-semibold">3 Enterprise accounts</span>
              </div>
              <div className="w-full bg-[var(--canvas)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
                <div className="bg-purple-500 h-full w-[45%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Ribbon */}
        <div className="df-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="section-label mr-2">Filter pillar:</span>
            {['All', 'Stalled Deal', 'Discount Anomaly', 'Delivery Slippage'].map((p) => (
              <button
                key={p}
                onClick={() => setPillarFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  pillarFilter === p
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--accent-subtle)] text-[var(--accent)] hover:bg-[#E0E7FF]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="body-sm">
            Showing <span className="text-[var(--text-primary)] font-semibold">{filtered.length}</span> active anomalies
          </div>
        </div>

        {/* Active Anomalies Table */}
        <div className="df-card overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="df-table">
              <thead>
                <tr>
                  <th>Anomaly ID</th>
                  <th>Pillar</th>
                  <th>Account / Quote</th>
                  <th>Metric Diagnostic</th>
                  <th>Impact</th>
                  <th>Severity</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className={`transition ${a.status === 'Resolved' ? 'opacity-40' : ''}`}>
                    <td className="font-mono font-bold text-[var(--accent)]">{a.id}</td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        a.pillar === 'Stalled Deal' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        a.pillar === 'Discount Anomaly' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        {a.pillar}
                      </span>
                    </td>
                    <td>
                      <div className="font-semibold text-[var(--text-primary)]">{a.account}</div>
                      <div className="body-sm font-mono">Ref: {a.quotationRef} • Owner: {a.owner}</div>
                    </td>
                    <td className="body-text text-xs max-w-xs">{a.metric}</td>
                    <td className="font-mono font-bold text-[var(--error)] text-xs">{a.impact}</td>
                    <td>
                      <span className={`badge ${
                        a.severity === 'High' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {a.severity}
                      </span>
                    </td>
                    <td className="text-center">
                      {a.status === 'Open' ? (
                        <button
                          onClick={() => handleResolve(a.id)}
                          className="btn-primary text-xs px-3 py-1.5"
                        >
                          {a.suggestedAction}
                        </button>
                      ) : (
                        <span className="text-xs text-[var(--success)] font-bold flex items-center justify-center gap-1">
                          <CheckCircle size={12} /> Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
