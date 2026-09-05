'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

export default function SubscriptionDetailPage() {
  const params = useParams();
  const subId = (params?.id as string) || 'SUB-9804-ACME';
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyNotes, setModifyNotes] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce">
            <span className="material-symbols-outlined">check_circle</span>
            <span className="text-sm font-semibold">{toastMsg}</span>
          </div>
        )}

        {/* Breadcrumb & Status */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/subscriptions" className="hover:text-white flex items-center gap-1">
              <span className="material-symbols-outlined text-base">sync_saved_locally</span>
              <span>Subscriptions</span>
            </Link>
            <span>/</span>
            <span className="text-slate-300">Acme Corp</span>
            <span>/</span>
            <span className="text-indigo-400 font-semibold">{subId}</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ACTIVE CONTRACT
            </span>
            <span className="font-mono text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">
              ORD-2024-8841
            </span>
          </div>
        </div>

        {/* Header Title & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              <span>Recurring Governance & Cadence</span>
              <span>•</span>
              <span className="text-slate-400">Originating Quote #QT-2024-4091-R2</span>
            </div>
            <h1 className="text-3xl font-black text-white mt-1">Billing Detail: Acme Corp - Care Plan 2yr</h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Originating contract breakdown, one-time procurement lines, and active recurring cadence schedule with proration support.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModifyModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-lg transition flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span>Modify Subscription</span>
            </button>
            <button
              onClick={() => triggerToast('Statement PDF downloaded to desktop.')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>Statement PDF</span>
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Total Contract Value</span>
              <span className="material-symbols-outlined text-indigo-400">account_balance_wallet</span>
            </div>
            <div className="text-3xl font-black text-white">$2,730.00 <span className="text-xs font-bold text-emerald-400">USD</span></div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-emerald-400">verified</span>
              Includes one-time CapEx + MRR
            </div>
          </div>

          <div className="glass-card p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Recurring MRR</span>
              <span className="material-symbols-outlined text-emerald-400">autorenew</span>
            </div>
            <div className="text-3xl font-black text-white">$46.00 <span className="text-sm text-slate-400">/ mo</span></div>
            <div className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">add_chart</span>
              +$300/qtr SLA SLA Tier
            </div>
          </div>

          <div className="glass-card p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Next Charge Date</span>
              <span className="material-symbols-outlined text-purple-400">calendar_month</span>
            </div>
            <div className="text-2xl font-bold text-white">Sep 15, 2026</div>
            <div className="text-xs text-indigo-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
              Auto-debit in 10 days
            </div>
          </div>

          <div className="glass-card p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Payment Method</span>
              <span className="material-symbols-outlined text-slate-400">credit_card</span>
            </div>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-xs text-indigo-400 border border-slate-700">ACH</span>
              Direct Debit (•••• 8821)
            </div>
            <div className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">check_circle</span>
              Pre-authorized Mandate Active
            </div>
          </div>
        </div>

        {/* Customer Context Card */}
        <div className="glass-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-xl">
              AC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Acme Corporation Inc.</h3>
                <span className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300 border border-slate-700">ACM-88402</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Enterprise Tier • Managed Accounts Portfolio • AE: Sarah Lin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400">
              Contract Term: <strong className="text-white font-mono">24 Months</strong> (Expires Sep 2028)
            </div>
          </div>
        </div>

        {/* Contract Line Segregation (One-Time CapEx vs Recurring OpEx) */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400">layers</span>
                Contract Line Segregation (Hybrid Engine)
              </h3>
              <p className="text-xs text-slate-400">One-time procurement lines vs monthly/quarterly recurring subscriptions</p>
            </div>
            <span className="text-xs px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-500/20 font-semibold">
              Proration Active
            </span>
          </div>

          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-wider text-slate-400 bg-slate-900/60 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Line item</th>
                <th className="px-4 py-3 text-center">Type</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-center">Cadence</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-800/30">
                <td className="px-4 py-3 font-semibold text-white">Hardware: Industrial Gateway Gen-3</td>
                <td className="px-4 py-3 text-center">
                  <span className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300 border border-slate-700">One-Time</span>
                </td>
                <td className="px-4 py-3 text-right font-mono">2</td>
                <td className="px-4 py-3 text-right font-mono">$1,200.00</td>
                <td className="px-4 py-3 text-center text-xs text-slate-500">—</td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-white">$2,400.00</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="px-4 py-3 font-semibold text-white">Cloud IoT Platform Enterprise License</td>
                <td className="px-4 py-3 text-center">
                  <span className="px-2 py-0.5 text-xs rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Recurring</span>
                </td>
                <td className="px-4 py-3 text-right font-mono">1</td>
                <td className="px-4 py-3 text-right font-mono">$46.00</td>
                <td className="px-4 py-3 text-center font-semibold text-indigo-400">Monthly</td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-400">$46.00 / mo</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="px-4 py-3 font-semibold text-white">24/7 Platinum SLA & Dedicated CSM</td>
                <td className="px-4 py-3 text-center">
                  <span className="px-2 py-0.5 text-xs rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Recurring</span>
                </td>
                <td className="px-4 py-3 text-right font-mono">1</td>
                <td className="px-4 py-3 text-right font-mono">$300.00</td>
                <td className="px-4 py-3 text-center font-semibold text-purple-400">Quarterly</td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-400">$300.00 / qtr</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Proration Timeline */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400">timeline</span>
            Upcoming Billing & Renewal Schedule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400 uppercase font-semibold">Sep 15, 2026</div>
              <div className="text-lg font-bold text-white">$46.00 USD</div>
              <div className="text-xs text-slate-400">Monthly Cloud License charge</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400 uppercase font-semibold">Oct 15, 2026</div>
              <div className="text-lg font-bold text-white">$346.00 USD</div>
              <div className="text-xs text-slate-400">Monthly Cloud ($46) + Quarterly SLA ($300)</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400 uppercase font-semibold">Nov 15, 2026</div>
              <div className="text-lg font-bold text-white">$46.00 USD</div>
              <div className="text-xs text-slate-400">Monthly Cloud License charge</div>
            </div>
          </div>
        </div>

        {/* Modify Modal */}
        {showModifyModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-card max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white">Modify Subscription Plan</h3>
                <button onClick={() => setShowModifyModal(false)} className="text-slate-400 hover:text-white">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Adjustment Action</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none">
                    <option>Add Seats (+10 users @ $15/mo)</option>
                    <option>Upgrade to Platinum SLA</option>
                    <option>Pause Recurring Billing (Temporary 30 Days)</option>
                    <option>Cancel Subscription at Term End</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Proration Effective Date</label>
                  <input type="date" defaultValue="2026-09-15" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Notes / Reason for Amendment</label>
                  <textarea
                    rows={3}
                    value={modifyNotes}
                    onChange={(e) => setModifyNotes(e.target.value)}
                    placeholder="Provide details for deal desk audit log..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white placeholder-slate-500 focus:outline-none"
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-800 pt-3">
                <button
                  onClick={() => setShowModifyModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowModifyModal(false);
                    triggerToast('Subscription amendment recorded and proration applied.');
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
                >
                  Confirm Amendment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
