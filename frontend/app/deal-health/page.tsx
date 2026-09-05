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
          <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce">
            <span className="material-symbols-outlined">check_circle</span>
            <span className="text-sm font-semibold">{toastMsg}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
              LIVE AUDIT MONITOR • ANOMALY DETECTOR v4.2
            </div>
            <h1 className="text-3xl font-black text-white mt-1">Deal Health & Anomaly Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Real-time automated diagnostic flags for stalled pipeline deals, discount margin leaks, and delivery SLA risks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => triggerToast('Full pipeline rescan completed. 0 new anomalies detected.')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-lg transition flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">autorenew</span>
              <span>Force Rescan</span>
            </button>
          </div>
        </div>

        {/* 3 Bento Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Stalled Deals */}
          <div className="glass-card p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">pause_circle</span>
                  Velocity Bottleneck
                </div>
                <h3 className="text-xl font-bold text-white mt-1">Stalled Deals</h3>
              </div>
              <span className="text-4xl font-black text-amber-400">05</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Quotes idle &gt; 7 days</span>
                <span className="text-amber-300 font-semibold">$1.42M ARR at risk</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-2/3"></div>
              </div>
            </div>
          </div>

          {/* Card 2: Discount Anomalies */}
          <div className="glass-card p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">percent</span>
                  Margin Leakage
                </div>
                <h3 className="text-xl font-bold text-white mt-1">Discount Anomalies</h3>
              </div>
              <span className="text-4xl font-black text-red-400">02</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Exceeds peer limit &gt; 14%</span>
                <span className="text-red-300 font-semibold">-$218k Gross Margin</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-red-400 h-full w-[84%]"></div>
              </div>
            </div>
          </div>

          {/* Card 3: Delivery Slippage */}
          <div className="glass-card p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">local_shipping</span>
                  SLA Commitment Risk
                </div>
                <h3 className="text-xl font-bold text-white mt-1">Delivery Slippage</h3>
              </div>
              <span className="text-4xl font-black text-purple-400">03</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Warehouse transit delays</span>
                <span className="text-purple-300 font-semibold">3 Enterprise Accounts</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-400 h-full w-[45%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Ribbon */}
        <div className="glass-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-2">Filter Pillar:</span>
            {['All', 'Stalled Deal', 'Discount Anomaly', 'Delivery Slippage'].map((p) => (
              <button
                key={p}
                onClick={() => setPillarFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  pillarFilter === p ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-400">
            Showing <span className="text-white font-semibold">{filtered.length}</span> active anomalies
          </div>
        </div>

        {/* Active Anomalies Table */}
        <div className="glass-card overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Anomaly ID</th>
                <th className="px-6 py-4">Pillar</th>
                <th className="px-6 py-4">Account / Quote</th>
                <th className="px-6 py-4">Metric Diagnostic</th>
                <th className="px-6 py-4">Impact</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((a) => (
                <tr key={a.id} className={`hover:bg-slate-800/40 transition ${a.status === 'Resolved' ? 'opacity-40' : ''}`}>
                  <td className="px-6 py-4 font-mono font-medium text-indigo-400">{a.id}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                      a.pillar === 'Stalled Deal' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      a.pillar === 'Discount Anomaly' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-purple-500/10 text-purple-300 border-purple-500/20'
                    }`}>
                      {a.pillar}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{a.account}</div>
                    <div className="text-xs text-slate-400 font-mono">Ref: {a.quotationRef} • Owner: {a.owner}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-300 max-w-xs">{a.metric}</td>
                  <td className="px-6 py-4 text-xs font-mono font-bold text-red-400">{a.impact}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                      a.severity === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {a.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {a.status === 'Open' ? (
                      <button
                        onClick={() => handleResolve(a.id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow"
                      >
                        {a.suggestedAction}
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1">
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
    </AppLayout>
  );
}
