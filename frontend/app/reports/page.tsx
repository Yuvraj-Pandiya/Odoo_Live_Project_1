'use client';
import { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';

export default function ReportsPage() {
  const [period, setPeriod] = useState('last30');
  const [team, setTeam] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

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

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 type-subheading text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
              BI & AUDIT ENGINE • v4.18 REAL-TIME SYNC
            </div>
            <h1 className="text-heading-1 font-bold text-slate-900 dark:text-white mt-1">Admin & Reporting Analytics</h1>
            <p className="type-body-base text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              High-precision deal velocity, approval cycle bottlenecks, discount margin compliance, and governance audit logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => triggerToast('Generating Executive BI PDF Report... Download started.')}
              className="btn-secondary flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base text-rose-500">picture_as_pdf</span>
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => triggerToast('Exporting CSV raw dataset...')}
              className="btn-secondary flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base text-emerald-500">table_chart</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="df-card p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="type-subheading block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Time Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="df-input w-full text-sm"
            >
              <option value="last30">Last 30 Days (Rolling)</option>
              <option value="q3">Current Quarter (Q3 FY26)</option>
              <option value="ytd">Year-to-Date (FY26)</option>
            </select>
          </div>

          <div>
            <label className="type-subheading block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Sales Team Segment</label>
            <select
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="df-input w-full text-sm"
            >
              <option value="all">All Global Teams</option>
              <option value="enterprise">Enterprise NA (Tier 1)</option>
              <option value="emea">EMEA Corporate</option>
              <option value="apac">APAC Strategic</option>
            </select>
          </div>

          <div>
            <label className="type-subheading block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Approval Governance Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="df-input w-full text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved & Executed</option>
              <option value="pending">Pending Tier-2 Sign-off</option>
              <option value="escalated">Escalated to CFO Desk</option>
            </select>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="df-card p-5 space-y-1">
            <div className="type-subheading text-slate-500 dark:text-slate-400">Total Quotes Created</div>
            <div className="text-display font-bold text-slate-900 dark:text-white">148</div>
            <div className="type-body-base text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-xs">trending_up</span> +18.4% vs last cycle
            </div>
          </div>

          <div className="df-card p-5 space-y-1">
            <div className="type-subheading text-slate-500 dark:text-slate-400">Pipeline Deal Volume</div>
            <div className="text-display font-bold text-slate-900 dark:text-white">$4.85M</div>
            <div className="type-body-base text-xs text-indigo-600 dark:text-indigo-400 font-medium">76.2% Win conversion probability</div>
          </div>

          <div className="df-card p-5 space-y-1">
            <div className="type-subheading text-slate-500 dark:text-slate-400">Avg Approval Turnaround</div>
            <div className="text-display font-bold text-emerald-600 dark:text-emerald-400">4.2 hours</div>
            <div className="type-body-base text-xs text-emerald-600 dark:text-emerald-400 font-medium">-35% SLA bottleneck reduction</div>
          </div>

          <div className="df-card p-5 space-y-1">
            <div className="type-subheading text-slate-500 dark:text-slate-400">Blended Discount Leakage</div>
            <div className="text-display font-bold text-rose-600 dark:text-rose-400">11.4%</div>
            <div className="type-body-base text-xs text-slate-500 dark:text-slate-400">Target limit &le; 12.0%</div>
          </div>
        </div>

        {/* Bottleneck Analysis Table & Audit Feed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Approval Bottleneck Analysis */}
          <div className="lg:col-span-7 space-y-4">
            <div className="df-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-heading-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">speed</span>
                    Approval Cycle Bottleneck Analysis
                  </h3>
                  <p className="type-body-base text-xs text-slate-500 dark:text-slate-400">Turnaround latency breakdown across sequential approval tiers</p>
                </div>
                <span className="badge badge-success">
                  SLA Target: 8h Max
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="df-table">
                  <thead>
                    <tr>
                      <th>Approval Level / Role</th>
                      <th className="text-right">Avg Time</th>
                      <th className="text-right">Pending Quotes</th>
                      <th className="text-right">Pass Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-semibold text-slate-900 dark:text-white">Level 1: Sales Manager</td>
                      <td className="text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">1.2 hours</td>
                      <td className="text-right font-mono text-slate-700 dark:text-slate-300">3</td>
                      <td className="text-right font-mono text-slate-700 dark:text-slate-300">94.2%</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-slate-900 dark:text-white">Level 2: VP Deal Desk</td>
                      <td className="text-right font-mono text-amber-600 dark:text-amber-400 font-bold">3.8 hours</td>
                      <td className="text-right font-mono font-bold text-amber-600 dark:text-amber-400">5</td>
                      <td className="text-right font-mono text-slate-700 dark:text-slate-300">82.0%</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-slate-900 dark:text-white">Level 3: CFO / Finance Desk</td>
                      <td className="text-right font-mono text-rose-600 dark:text-rose-400 font-bold">6.5 hours</td>
                      <td className="text-right font-mono text-slate-700 dark:text-slate-300">2</td>
                      <td className="text-right font-mono text-slate-700 dark:text-slate-300">68.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* System Governance Audit Log */}
          <div className="lg:col-span-5 space-y-4">
            <div className="df-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-heading-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">policy</span>
                  System Governance Audit Trail
                </h3>
                <span className="badge badge-muted">Live Stream</span>
              </div>

              <div className="space-y-3 type-body-base text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-900 dark:text-white">Sarah Lin (Sales Rep)</span>
                    <span className="font-mono text-[11px]">10 mins ago</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">Submitted quote <strong className="text-indigo-600 dark:text-indigo-400 font-mono">Q-1042</strong> for approval (Services discount: 28%)</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Marcus Vance (VP Deal Desk)</span>
                    <span className="font-mono text-[11px]">45 mins ago</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">Approved discount exception for <strong className="text-indigo-600 dark:text-indigo-400 font-mono">Q-1039</strong> (Global Logix)</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-amber-600 dark:text-amber-400">Automated Policy Engine</span>
                    <span className="font-mono text-[11px]">2 hours ago</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">Flagged anomaly <strong className="text-amber-600 dark:text-amber-400 font-mono">ANOM-102</strong>: Margin leakage breach on Delta LLC</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
