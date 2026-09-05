'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

export default function FulfillmentDetailPage() {
  const params = useParams();
  const qid = (params?.id as string) || 'Q-1042';

  const [accepted, setAccepted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAcceptSplit = () => {
    setAccepted(true);
    triggerToast(`Split allocation for ${qid} confirmed. Warehouse pick lists generated.`);
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

        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <nav className="flex items-center gap-2 type-body-base text-slate-500 dark:text-slate-400">
            <Link href="/fulfillment" className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
              <span className="material-symbols-outlined text-base">local_shipping</span>
              <span>Fulfillment Queue</span>
            </Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">{qid} (Acme Corp)</span>
            <span>/</span>
            <span className="badge badge-indigo text-xs">WAREHOUSE ROUTING</span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="badge badge-muted font-mono">
              ID: SPLIT-ORD-88219
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-heading-1 font-bold text-slate-900 dark:text-white">Fulfillment Detail: {qid} (Acme Corp)</h1>
              <span className="badge badge-indigo">B2B ENTERPRISE</span>
            </div>
            <p className="type-body-base text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              Multi-node greedy warehouse allocation algorithm optimizes transit times and prevents stockout delays.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">schedule</span>
            <div>
              <div className="type-subheading text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Split SLA Target</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">1h 42m remaining</div>
            </div>
          </div>
        </div>

        {/* Key Order Stats Container */}
        <div className="df-card p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="type-subheading text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-indigo-600 dark:text-indigo-400">payments</span>
              Total Order Value
            </div>
            <div className="text-display font-bold text-slate-900 dark:text-white mt-1">$2,643.00</div>
            <div className="type-body-base text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-xs">verified</span>
              Payment Pre-Authorized
            </div>
          </div>

          <div>
            <div className="type-subheading text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-indigo-600 dark:text-indigo-400">inventory_2</span>
              Total Units
            </div>
            <div className="text-display font-bold text-slate-900 dark:text-white mt-1">24 units</div>
            <div className="type-body-base text-xs text-slate-500 dark:text-slate-400 mt-0.5">3 line items</div>
          </div>

          <div>
            <div className="type-subheading text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-indigo-600 dark:text-indigo-400">event_available</span>
              Delivery Target
            </div>
            <div className="text-display font-bold text-slate-900 dark:text-white text-2xl mt-1">Sep 10, 2026</div>
            <div className="type-body-base text-xs text-slate-500 dark:text-slate-400 mt-0.5">Firm Window: EST</div>
          </div>

          <div>
            <div className="type-subheading text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-indigo-600 dark:text-indigo-400">alt_route</span>
              Route Optimization
            </div>
            <div className="mt-1">
              <span className="badge badge-success">
                Auto Multi-Hub Split
              </span>
            </div>
            <div className="type-body-base text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Cuts transit by 41h</div>
          </div>
        </div>

        {/* Multi-Warehouse Split Allocation Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="df-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-heading-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">hub</span>
                  Optimized Warehouse Allocation Matrix
                </h3>
                <span className="badge badge-muted">Greedy Algorithm Output</span>
              </div>

              <div className="overflow-x-auto">
                <table className="df-table">
                  <thead>
                    <tr>
                      <th>Line Item SKU</th>
                      <th className="text-right">Qty</th>
                      <th>Primary Warehouse</th>
                      <th>Split Secondary Node</th>
                      <th className="text-right">Est. Freight</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="font-semibold text-slate-900 dark:text-white">Laptop Pro 16&quot;</div>
                        <div className="type-body-base text-xs text-slate-500 dark:text-slate-400">SKU: HW-LP16-01</div>
                      </td>
                      <td className="text-right font-mono font-bold text-slate-900 dark:text-white">2</td>
                      <td>
                        <span className="badge badge-indigo">
                          Main Warehouse (2 units)
                        </span>
                      </td>
                      <td className="type-body-base text-xs text-slate-400 dark:text-slate-500">— None (Full Stock)</td>
                      <td className="text-right font-mono text-slate-700 dark:text-slate-300">$45.00</td>
                    </tr>

                    <tr>
                      <td>
                        <div className="font-semibold text-slate-900 dark:text-white">Industrial IoT Gateway</div>
                        <div className="type-body-base text-xs text-slate-500 dark:text-slate-400">SKU: HW-GW-99</div>
                      </td>
                      <td className="text-right font-mono font-bold text-slate-900 dark:text-white">22</td>
                      <td>
                        <span className="badge badge-indigo">
                          Main Warehouse (15 units)
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-purple">
                          East Depot (7 units)
                        </span>
                      </td>
                      <td className="text-right font-mono text-slate-700 dark:text-slate-300">$128.50</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Allocation Actions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="df-card p-6 space-y-4">
              <h3 className="text-heading-3 font-bold text-slate-900 dark:text-white">Fulfillment Controls</h3>

              {!accepted ? (
                <button
                  onClick={handleAcceptSplit}
                  className="btn-primary w-full py-3 justify-center gap-2"
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>Accept & Confirm Split Allocation</span>
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-center space-y-1">
                  <div className="font-bold flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">verified</span>
                    Split Allocation Confirmed
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Pick tickets dispatched to Main & East warehouses.</p>
                </div>
              )}

              <button
                onClick={() => triggerToast('Manual warehouse override modal launched.')}
                className="btn-secondary w-full justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                <span>Manual Warehouse Override</span>
              </button>

              <button
                onClick={() => triggerToast('Re-running route optimizer algorithm...')}
                className="btn-secondary w-full justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                <span>Re-calculate Freight & Routing</span>
              </button>
            </div>

            <div className="df-card p-5 space-y-2 type-body-base text-xs text-slate-500 dark:text-slate-400">
              <div className="font-bold text-slate-900 dark:text-white text-sm mb-2">Transit & Freight Summary</div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Estimated Freight Cost</span>
                <span className="text-slate-900 dark:text-white font-mono font-semibold">$173.50</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Total Shipment Weight</span>
                <span className="text-slate-900 dark:text-white font-mono font-semibold">48.2 lbs</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Estimated Delivery</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Sep 08 - Sep 10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
