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
          <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
            <span className="material-symbols-outlined">check_circle</span>
            <span className="text-sm font-semibold">{toastMsg}</span>
          </div>
        )}

        {/* Breadcrumb & Status */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="flex items-center gap-2 type-body-base text-slate-500 dark:text-slate-400">
            <Link href="/subscriptions" className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
              <span className="material-symbols-outlined text-base">sync_saved_locally</span>
              <span>Subscriptions</span>
            </Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Acme Corp</span>
            <span>/</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{subId}</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="badge badge-success">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
              ACTIVE CONTRACT
            </span>
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 font-medium">
              ORD-2024-8841
            </span>
          </div>
        </div>

        {/* Header Title & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 type-subheading text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <span>Recurring Governance & Cadence</span>
              <span>•</span>
              <span className="text-slate-500 dark:text-slate-400">Originating Quote #QT-2024-4091-R2</span>
            </div>
            <h1 className="text-heading-1 font-bold text-slate-900 dark:text-white mt-1">Billing Detail: Acme Corp - Care Plan 2yr</h1>
            <p className="type-body-base text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              Originating contract breakdown, one-time procurement lines, and active recurring cadence schedule with proration support.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModifyModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span>Modify Subscription</span>
            </button>
            <button
              onClick={() => triggerToast('Statement PDF downloaded to desktop.')}
              className="btn-secondary flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>Statement PDF</span>
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="df-card p-5 space-y-2">
            <div className="flex items-center justify-between type-subheading text-slate-500 dark:text-slate-400">
              <span>Total Contract Value</span>
              <span className="material-symbols-outlined text-indigo-500">account_balance_wallet</span>
            </div>
            <div className="text-display font-bold text-slate-900 dark:text-white">$2,730.00 <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">USD</span></div>
            <div className="type-body-base text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-emerald-600 dark:text-emerald-400">verified</span>
              Includes one-time CapEx + MRR
            </div>
          </div>

          <div className="df-card p-5 space-y-2">
            <div className="flex items-center justify-between type-subheading text-slate-500 dark:text-slate-400">
              <span>Recurring MRR</span>
              <span className="material-symbols-outlined text-emerald-500">autorenew</span>
            </div>
            <div className="text-display font-bold text-slate-900 dark:text-white">$46.00 <span className="text-sm font-normal text-slate-400">/ mo</span></div>
            <div className="type-body-base text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-xs">add_chart</span>
              +$300/qtr SLA Tier
            </div>
          </div>

          <div className="df-card p-5 space-y-2">
            <div className="flex items-center justify-between type-subheading text-slate-500 dark:text-slate-400">
              <span>Next Charge Date</span>
              <span className="material-symbols-outlined text-purple-500">calendar_month</span>
            </div>
            <div className="text-display font-bold text-slate-900 dark:text-white text-2xl">Sep 15, 2026</div>
            <div className="type-body-base text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
              Auto-debit in 10 days
            </div>
          </div>

          <div className="df-card p-5 space-y-2">
            <div className="flex items-center justify-between type-subheading text-slate-500 dark:text-slate-400">
              <span>Payment Method</span>
              <span className="material-symbols-outlined text-slate-400">credit_card</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 font-semibold">ACH</span>
              Direct Debit (•••• 8821)
            </div>
            <div className="type-body-base text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-xs">check_circle</span>
              Pre-authorized Mandate Active
            </div>
          </div>
        </div>

        {/* Customer Context Card */}
        <div className="df-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-300 text-xl">
              AC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-heading-3 font-bold text-slate-900 dark:text-white">Acme Corporation Inc.</h3>
                <span className="px-2.5 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">ACM-88402</span>
              </div>
              <p className="type-body-base text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enterprise Tier • Managed Accounts Portfolio • AE: Sarah Lin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="type-body-base text-xs text-slate-500 dark:text-slate-400">
              Contract Term: <strong className="text-slate-900 dark:text-white font-mono">24 Months</strong> (Expires Sep 2028)
            </div>
          </div>
        </div>

        {/* Contract Line Segregation (One-Time CapEx vs Recurring OpEx) */}
        <div className="df-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-heading-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">layers</span>
                Contract Line Segregation (Hybrid Engine)
              </h3>
              <p className="type-body-base text-xs text-slate-500 dark:text-slate-400">One-time procurement lines vs monthly/quarterly recurring subscriptions</p>
            </div>
            <span className="badge badge-indigo">
              Proration Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="df-table">
              <thead>
                <tr>
                  <th>Line item</th>
                  <th className="text-center">Type</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Unit Price</th>
                  <th className="text-center">Cadence</th>
                  <th className="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-semibold text-slate-900 dark:text-white">Hardware: Industrial Gateway Gen-3</td>
                  <td className="text-center">
                    <span className="badge badge-muted">One-Time</span>
                  </td>
                  <td className="text-right font-mono text-slate-700 dark:text-slate-300">2</td>
                  <td className="text-right font-mono text-slate-700 dark:text-slate-300">$1,200.00</td>
                  <td className="text-center text-xs text-slate-400">—</td>
                  <td className="text-right font-mono font-semibold text-slate-900 dark:text-white">$2,400.00</td>
                </tr>
                <tr>
                  <td className="font-semibold text-slate-900 dark:text-white">Cloud IoT Platform Enterprise License</td>
                  <td className="text-center">
                    <span className="badge badge-success">Recurring</span>
                  </td>
                  <td className="text-right font-mono text-slate-700 dark:text-slate-300">1</td>
                  <td className="text-right font-mono text-slate-700 dark:text-slate-300">$46.00</td>
                  <td className="text-center font-semibold text-indigo-600 dark:text-indigo-400">Monthly</td>
                  <td className="text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">$46.00 / mo</td>
                </tr>
                <tr>
                  <td className="font-semibold text-slate-900 dark:text-white">24/7 Platinum SLA & Dedicated CSM</td>
                  <td className="text-center">
                    <span className="badge badge-success">Recurring</span>
                  </td>
                  <td className="text-right font-mono text-slate-700 dark:text-slate-300">1</td>
                  <td className="text-right font-mono text-slate-700 dark:text-slate-300">$300.00</td>
                  <td className="text-center font-semibold text-purple-600 dark:text-purple-400">Quarterly</td>
                  <td className="text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">$300.00 / qtr</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Proration Timeline */}
        <div className="df-card p-6 space-y-4">
          <h3 className="text-heading-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500">timeline</span>
            Upcoming Billing & Renewal Schedule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="type-subheading text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Sep 15, 2026</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">$46.00 USD</div>
              <div className="type-body-base text-xs text-slate-500 dark:text-slate-400">Monthly Cloud License charge</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="type-subheading text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Oct 15, 2026</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">$346.00 USD</div>
              <div className="type-body-base text-xs text-slate-500 dark:text-slate-400">Monthly Cloud ($46) + Quarterly SLA ($300)</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="type-subheading text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Nov 15, 2026</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">$46.00 USD</div>
              <div className="type-body-base text-xs text-slate-500 dark:text-slate-400">Monthly Cloud License charge</div>
            </div>
          </div>
        </div>

        {/* Modify Modal */}
        {showModifyModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="df-card max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-heading-3 font-bold text-slate-900 dark:text-white">Modify Subscription Plan</h3>
                <button onClick={() => setShowModifyModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="type-subheading block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Adjustment Action</label>
                  <select className="df-input w-full text-sm">
                    <option>Add Seats (+10 users @ $15/mo)</option>
                    <option>Upgrade to Platinum SLA</option>
                    <option>Pause Recurring Billing (Temporary 30 Days)</option>
                    <option>Cancel Subscription at Term End</option>
                  </select>
                </div>
                <div>
                  <label className="type-subheading block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Proration Effective Date</label>
                  <input type="date" defaultValue="2026-09-15" className="df-input w-full text-sm" />
                </div>
                <div>
                  <label className="type-subheading block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Notes / Reason for Amendment</label>
                  <textarea
                    rows={3}
                    value={modifyNotes}
                    onChange={(e) => setModifyNotes(e.target.value)}
                    placeholder="Provide details for deal desk audit log..."
                    className="df-input w-full text-sm"
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  onClick={() => setShowModifyModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowModifyModal(false);
                    triggerToast('Subscription amendment recorded and proration applied.');
                  }}
                  className="btn-primary"
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
