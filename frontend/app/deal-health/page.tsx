'use client';
import { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';

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
    impact: '$480,000 ARR at risk',
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
    impact: '-$218,000 Margin Leakage',
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
    impact: 'Missed SLA penalty risk ($12k)',
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
    impact: '$210,000 ARR stalled',
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
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
            <span className="material-symbols-outlined">check_circle</span>
            <span className="text-sm font-semibold">{toastMsg}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 type-subheading text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              LIVE AUDIT MONITOR • ANOMALY DETECTOR v4.2
            </div>
            <h1 className="text-heading-1 font-bold text-slate-900 dark:text-white mt-1">Deal Health & Anomaly Dashboard</h1>
            <p className="type-body-base text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              Real-time automated diagnostic flags for stalled pipeline deals, discount margin leaks, and delivery SLA risks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => triggerToast('Full pipeline rescan completed. 0 new anomalies detected.')}
              className="btn-primary flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">autorenew</span>
              <span>Force Rescan</span>
            </button>
          </div>
        </div>

        {/* 3 Bento Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Stalled Deals */}
          <div className="df-card p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <div className="type-subheading text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">pause_circle</span>
                  Velocity Bottleneck
                </div>
                <h3 className="text-heading-3 font-bold text-slate-900 dark:text-white mt-1">Stalled Deals</h3>
              </div>
              <span className="text-display font-bold text-amber-500 dark:text-amber-400">05</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between type-body-base text-xs text-slate-500 dark:text-slate-400">
                <span>Quotes idle &gt; 7 days</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">$1.42M ARR at risk</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-2/3 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Card 2: Discount Anomalies */}
          <div className="df-card p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <div className="type-subheading text-xs text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">percent</span>
                  Margin Leakage
                </div>
                <h3 className="text-heading-3 font-bold text-slate-900 dark:text-white mt-1">Discount Anomalies</h3>
              </div>
              <span className="text-display font-bold text-rose-500 dark:text-rose-400">02</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between type-body-base text-xs text-slate-500 dark:text-slate-400">
                <span>Exceeds peer limit &gt; 14%</span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold">-$218k Gross Margin</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-[84%] rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Card 3: Delivery Slippage */}
          <div className="df-card p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <div className="type-subheading text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">local_shipping</span>
                  SLA Commitment Risk
                </div>
                <h3 className="text-heading-3 font-bold text-slate-900 dark:text-white mt-1">Delivery Slippage</h3>
              </div>
              <span className="text-display font-bold text-purple-500 dark:text-purple-400">03</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between type-body-base text-xs text-slate-500 dark:text-slate-400">
                <span>Warehouse transit delays</span>
                <span className="text-purple-600 dark:text-purple-400 font-semibold">3 Enterprise Accounts</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-[45%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Ribbon */}
        <div className="df-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="type-subheading text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2">Filter Pillar:</span>
            {['All', 'Stalled Deal', 'Discount Anomaly', 'Delivery Slippage'].map((p) => (
              <button
                key={p}
                onClick={() => setPillarFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  pillarFilter === p
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="type-body-base text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="text-slate-900 dark:text-white font-semibold">{filtered.length}</span> active anomalies
          </div>
        </div>

        {/* Active Anomalies Table */}
        <div className="df-card overflow-hidden">
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
                    <td className="font-mono font-medium text-indigo-600 dark:text-indigo-400">{a.id}</td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        a.pillar === 'Stalled Deal' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800' :
                        a.pillar === 'Discount Anomaly' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800' :
                        'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800'
                      }`}>
                        {a.pillar}
                      </span>
                    </td>
                    <td>
                      <div className="font-semibold text-slate-900 dark:text-white">{a.account}</div>
                      <div className="type-body-base text-xs text-slate-500 dark:text-slate-400 font-mono">Ref: {a.quotationRef} • Owner: {a.owner}</div>
                    </td>
                    <td className="type-body-base text-xs text-slate-600 dark:text-slate-300 max-w-xs">{a.metric}</td>
                    <td className="font-mono font-bold text-rose-600 dark:text-rose-400 text-xs">{a.impact}</td>
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
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-xs">check_circle</span> Resolved
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
