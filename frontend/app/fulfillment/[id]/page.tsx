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
          <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce">
            <span className="material-symbols-outlined">check_circle</span>
            <span className="text-sm font-semibold">{toastMsg}</span>
          </div>
        )}

        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/fulfillment" className="hover:text-white flex items-center gap-1">
              <span className="material-symbols-outlined text-base">local_shipping</span>
              <span>Fulfillment Queue</span>
            </Link>
            <span>/</span>
            <span className="text-slate-300">{qid} (Acme Corp)</span>
            <span>/</span>
            <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded text-xs">WAREHOUSE ROUTING</span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
              ID: SPLIT-ORD-88219
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-white">Fulfillment Detail: {qid} (Acme Corp)</h1>
              <span className="px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">B2B ENTERPRISE</span>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Multi-node greedy warehouse allocation algorithm optimizes transit times and prevents stockout delays.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <span className="material-symbols-outlined text-indigo-400">schedule</span>
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold">Split SLA Target</div>
              <div className="text-sm font-bold text-white">1h 42m remaining</div>
            </div>
          </div>
        </div>

        {/* Key Order Stats Container */}
        <div className="glass-card p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-indigo-400">payments</span>
              Total Order Value
            </div>
            <div className="text-2xl font-black text-white mt-1">$2,643.00</div>
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-xs">verified</span>
              Payment Pre-Authorized
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-indigo-400">inventory_2</span>
              Total Units
            </div>
            <div className="text-2xl font-black text-white mt-1">24 units</div>
            <div className="text-xs text-slate-400 mt-0.5">3 line items</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-indigo-400">event_available</span>
              Delivery Target
            </div>
            <div className="text-xl font-bold text-white mt-1">Sep 10, 2026</div>
            <div className="text-xs text-slate-400 mt-0.5">Firm Window: EST</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-indigo-400">alt_route</span>
              Route Optimization
            </div>
            <div className="mt-1">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Auto Multi-Hub Split
              </span>
            </div>
            <div className="text-xs text-emerald-400 mt-0.5">Cuts transit by 41h</div>
          </div>
        </div>

        {/* Multi-Warehouse Split Allocation Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-400">hub</span>
                  Optimized Warehouse Allocation Matrix
                </h3>
                <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded">Greedy Algorithm Output</span>
              </div>

              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase tracking-wider text-slate-400 bg-slate-900/60">
                  <tr>
                    <th className="px-4 py-3">Line Item SKU</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3">Primary Warehouse</th>
                    <th className="px-4 py-3">Split Secondary Node</th>
                    <th className="px-4 py-3 text-right">Est. Freight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">Laptop Pro 16"</div>
                      <div className="text-xs text-slate-400">SKU: HW-LP16-01</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white">2</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 text-xs rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                        Main Warehouse (2 units)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">— None (Full Stock)</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">$45.00</td>
                  </tr>

                  <tr className="hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">Industrial IoT Gateway</div>
                      <div className="text-xs text-slate-400">SKU: HW-GW-99</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white">22</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 text-xs rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                        Main Warehouse (15 units)
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 text-xs rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold">
                        East Depot (7 units)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">$128.50</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Allocation Actions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Fulfillment Controls</h3>

              {!accepted ? (
                <button
                  onClick={handleAcceptSplit}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-lg shadow-lg transition flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  Accept & Confirm Split Allocation
                </button>
              ) : (
                <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-center space-y-1">
                  <div className="font-bold flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">verified</span>
                    Split Allocation Confirmed
                  </div>
                  <p className="text-xs text-emerald-400/80">Pick tickets dispatched to Main & East warehouses.</p>
                </div>
              )}

              <button
                onClick={() => triggerToast('Manual warehouse override modal launched.')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded-lg border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                Manual Warehouse Override
              </button>

              <button
                onClick={() => triggerToast('Re-running route optimizer algorithm...')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded-lg border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                Re-calculate Freight & Routing
              </button>
            </div>

            <div className="glass-card p-5 space-y-2 text-xs text-slate-400">
              <div className="font-bold text-white text-sm mb-2">Transit & Freight Summary</div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Estimated Freight Cost</span>
                <span className="text-white font-mono">$173.50</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Total Shipment Weight</span>
                <span className="text-white font-mono">48.2 lbs</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Estimated Delivery</span>
                <span className="text-emerald-400 font-semibold">Sep 08 - Sep 10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
