'use client';
import { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';

interface Subscription {
  id: string;
  contractId: string;
  customer: string;
  plan: string;
  mrr: number;
  arr: number;
  cadence: 'Monthly' | 'Annual';
  status: 'Active' | 'Pending Renewal' | 'Paused' | 'Cancelled';
  nextBilling: string;
  autoRenew: boolean;
}

const initialSubscriptions: Subscription[] = [
  { id: 'SUB-9021', contractId: 'ORD-1042', customer: 'Acme Corp', plan: 'Enterprise Cloud Platform (100 seats)', mrr: 2500, arr: 30000, cadence: 'Monthly', status: 'Active', nextBilling: '2026-10-01', autoRenew: true },
  { id: 'SUB-9022', contractId: 'ORD-1039', customer: 'Global Logix', plan: 'Warehouse Management Pro & Logistics AI', mrr: 4800, arr: 57600, cadence: 'Annual', status: 'Active', nextBilling: '2027-01-15', autoRenew: true },
  { id: 'SUB-9023', contractId: 'ORD-1035', customer: 'Apex Dynamics', plan: 'CRM Pro Tier (45 users) + SLA 99.9%', mrr: 1200, arr: 14400, cadence: 'Monthly', status: 'Pending Renewal', nextBilling: '2026-09-15', autoRenew: false },
  { id: 'SUB-9024', contractId: 'ORD-1030', customer: 'Starlight Tech', plan: 'Analytics Engine Enterprise', mrr: 3100, arr: 37200, cadence: 'Annual', status: 'Active', nextBilling: '2026-11-30', autoRenew: true },
  { id: 'SUB-9025', contractId: 'ORD-1022', customer: 'Vanguard Systems', plan: 'Developer Support Tier + Dedicated CSM', mrr: 850, arr: 10200, cadence: 'Monthly', status: 'Paused', nextBilling: '2026-10-01', autoRenew: false },
];

export default function SubscriptionsPage() {
  const [filterCadence, setFilterCadence] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredSubs = initialSubscriptions.filter(sub => {
    const matchesCadence = filterCadence === 'All' || sub.cadence === filterCadence;
    const matchesSearch = sub.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sub.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sub.plan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCadence && matchesSearch;
  });

  const totalARR = initialSubscriptions.reduce((acc, s) => acc + s.arr, 0);
  const totalMRR = initialSubscriptions.reduce((acc, s) => acc + s.mrr, 0);
  const activeCount = initialSubscriptions.filter(s => s.status === 'Active').length;

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Subscriptions & Recurring Contracts</h1>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Hybrid Billing Engine
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: 'hsl(215 20% 65%)' }}>
              Manage active subscription lifecycles, MRR/ARR distributions, proration schedules, and contract renewals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium text-white rounded-lg glass-card hover:border-slate-600 transition flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">file_download</span> Export ARR Report
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 space-y-1">
            <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'hsl(215 20% 60%)' }}>Total ARR</div>
            <div className="text-2xl font-black text-white">${totalARR.toLocaleString()}</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span> +14.2% YoY growth
            </div>
          </div>
          <div className="glass-card p-5 space-y-1">
            <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'hsl(215 20% 60%)' }}>Total MRR</div>
            <div className="text-2xl font-black text-white">${totalMRR.toLocaleString()}</div>
            <div className="text-xs" style={{ color: 'hsl(215 20% 65%)' }}>Avg. contract: ${(totalMRR / initialSubscriptions.length).toFixed(0)}/mo</div>
          </div>
          <div className="glass-card p-5 space-y-1">
            <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'hsl(215 20% 60%)' }}>Active Subscriptions</div>
            <div className="text-2xl font-black text-white">{activeCount} / {initialSubscriptions.length}</div>
            <div className="text-xs text-emerald-400">96.5% Net Retention</div>
          </div>
          <div className="glass-card p-5 space-y-1">
            <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'hsl(215 20% 60%)' }}>Upcoming Renewals (30 Days)</div>
            <div className="text-2xl font-black text-amber-400">1 Contract</div>
            <div className="text-xs text-amber-300">Apex Dynamics (Apex-9023)</div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
              <input
                type="text"
                placeholder="Search subscription, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900/60 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex rounded-lg bg-slate-900/60 p-1 border border-slate-700/80 text-xs font-semibold">
              {['All', 'Monthly', 'Annual'].map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterCadence(c)}
                  className={`px-3 py-1.5 rounded-md transition ${filterCadence === c ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-400">
            Showing <span className="text-white font-semibold">{filteredSubs.length}</span> active subscription schedules
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Subscription ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Plan & Software</th>
                <th className="px-6 py-4 text-right">MRR</th>
                <th className="px-6 py-4 text-right">ARR</th>
                <th className="px-6 py-4 text-center">Cadence</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Next Billing</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSubs.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-6 py-4 font-mono font-medium text-indigo-400">
                    <Link href={`/subscriptions/${sub.id}`} className="hover:underline">
                      {sub.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-semibold text-white">{sub.customer}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{sub.plan}</td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-emerald-400">${sub.mrr.toLocaleString()}/mo</td>
                  <td className="px-6 py-4 text-right font-mono text-slate-300">${sub.arr.toLocaleString()}/yr</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 text-xs rounded-full border ${sub.cadence === 'Monthly' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-purple-500/10 text-purple-300 border-purple-500/20'}`}>
                      {sub.cadence}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                      sub.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      sub.status === 'Pending Renewal' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-slate-700/30 text-slate-400 border-slate-700/50'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-400">{sub.nextBilling}</td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/subscriptions/${sub.id}`}
                      className="px-3 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-700 transition"
                    >
                      Manage
                    </Link>
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
