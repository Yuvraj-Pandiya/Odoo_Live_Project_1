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
              <h1 className="text-heading-1 font-bold text-slate-900 dark:text-white">Subscriptions & Recurring Contracts</h1>
              <span className="badge badge-success">
                Hybrid Billing Engine
              </span>
            </div>
            <p className="type-body-base text-slate-500 dark:text-slate-400 mt-1">
              Manage active subscription lifecycles, MRR/ARR distributions, proration schedules, and contract renewals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="btn-secondary flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">file_download</span>
              <span>Export ARR Report</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="df-card p-5 space-y-1">
            <div className="type-subheading text-slate-500 dark:text-slate-400">Total ARR</div>
            <div className="text-display font-bold text-slate-900 dark:text-white">${totalARR.toLocaleString()}</div>
            <div className="type-body-base text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-xs">trending_up</span> +14.2% YoY growth
            </div>
          </div>
          <div className="df-card p-5 space-y-1">
            <div className="type-subheading text-slate-500 dark:text-slate-400">Total MRR</div>
            <div className="text-display font-bold text-slate-900 dark:text-white">${totalMRR.toLocaleString()}</div>
            <div className="type-body-base text-xs text-slate-500 dark:text-slate-400">Avg. contract: ${(totalMRR / initialSubscriptions.length).toFixed(0)}/mo</div>
          </div>
          <div className="df-card p-5 space-y-1">
            <div className="type-subheading text-slate-500 dark:text-slate-400">Active Subscriptions</div>
            <div className="text-display font-bold text-slate-900 dark:text-white">{activeCount} / {initialSubscriptions.length}</div>
            <div className="type-body-base text-xs text-emerald-600 dark:text-emerald-400 font-medium">96.5% Net Retention</div>
          </div>
          <div className="df-card p-5 space-y-1">
            <div className="type-subheading text-slate-500 dark:text-slate-400">Upcoming Renewals (30d)</div>
            <div className="text-display font-bold text-amber-600 dark:text-amber-400">1 Contract</div>
            <div className="type-body-base text-xs text-amber-600 dark:text-amber-400 font-medium truncate">Apex Dynamics (Apex-9023)</div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="df-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input
                type="text"
                placeholder="Search subscription, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="df-input w-full pl-9 pr-4 text-sm"
              />
            </div>
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 text-xs font-semibold w-full sm:w-auto">
              {['All', 'Monthly', 'Annual'].map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterCadence(c)}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md transition ${filterCadence === c ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="type-body-base text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="text-slate-900 dark:text-white font-semibold">{filteredSubs.length}</span> active subscription schedules
          </div>
        </div>

        {/* Table */}
        <div className="df-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="df-table">
              <thead>
                <tr>
                  <th>Subscription ID</th>
                  <th>Customer</th>
                  <th>Plan & Software</th>
                  <th className="text-right">MRR</th>
                  <th className="text-right">ARR</th>
                  <th className="text-center">Cadence</th>
                  <th>Status</th>
                  <th className="text-right">Next Billing</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.map((sub) => (
                  <tr key={sub.id}>
                    <td className="font-mono font-medium text-indigo-600 dark:text-indigo-400">
                      <Link href={`/subscriptions/${sub.id}`} className="hover:underline">
                        {sub.id}
                      </Link>
                    </td>
                    <td className="font-semibold text-slate-900 dark:text-white">{sub.customer}</td>
                    <td className="max-w-xs truncate text-slate-600 dark:text-slate-300">{sub.plan}</td>
                    <td className="text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">${sub.mrr.toLocaleString()}/mo</td>
                    <td className="text-right font-mono text-slate-700 dark:text-slate-300">${sub.arr.toLocaleString()}/yr</td>
                    <td className="text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        sub.cadence === 'Monthly'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800'
                          : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800'
                      }`}>
                        {sub.cadence}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        sub.status === 'Active' ? 'badge-success' :
                        sub.status === 'Pending Renewal' ? 'badge-warning' :
                        'badge-muted'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="text-right font-mono text-xs text-slate-500 dark:text-slate-400">{sub.nextBilling}</td>
                    <td className="text-center">
                      <Link
                        href={`/subscriptions/${sub.id}`}
                        className="btn-secondary text-xs px-2.5 py-1"
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
      </div>
    </AppLayout>
  );
}
