'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { fulfillmentApi } from '@/lib/api';
import { CheckCircle, Truck, Clock, DollarSign, Package, Calendar, Route, Edit, RefreshCw } from 'lucide-react';

export default function FulfillmentDetailPage() {
  const params = useParams();
  const qid = (params?.id as string) || 'Q-1042';

  const [accepted, setAccepted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAcceptSplit = async () => {
    setAccepted(true);
    triggerToast(`Split allocation for ${qid} confirmed. Warehouse pick lists generated.`);
    const numId = parseInt(qid.replace(/\D/g, ''), 10);
    if (!isNaN(numId)) {
      try {
        await fulfillmentApi.acceptSplit(numId);
      } catch (err) {
        console.warn('Split acceptance backend sync:', err);
      }
    }
  };

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

        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <nav className="flex items-center gap-2 body-sm">
            <Link href="/fulfillment" className="hover:text-[var(--text-primary)] flex items-center gap-1">
              <Truck size={14} />
              <span>Fulfillment queue</span>
            </Link>
            <span>/</span>
            <span className="font-medium text-[var(--text-primary)]">{qid} (Acme Corp)</span>
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
              <h1 className="page-heading">Fulfillment Detail: {qid} (Acme Corp)</h1>
              <span className="badge badge-indigo">B2B ENTERPRISE</span>
            </div>
            <p className="body-text mt-1 max-w-3xl">
              Multi-node greedy warehouse allocation algorithm optimizes transit times and prevents stockout delays.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[var(--canvas)] p-3 rounded-xl border border-[var(--border)]">
            <Clock className="text-[var(--accent)]" size={20} />
            <div>
              <div className="section-label">Split SLA target</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">1h 42m remaining</div>
            </div>
          </div>
        </div>

        {/* Key Order Stats Container */}
        <div className="df-card p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="section-label flex items-center gap-1">
              <DollarSign className="text-[var(--accent)]" size={14} />
              Total order value
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">₹2,643.00</div>
            <div className="body-sm text-[var(--success)] font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle size={12} />
              Payment Pre-Authorized
            </div>
          </div>

          <div>
            <div className="section-label flex items-center gap-1">
              <Package className="text-[var(--accent)]" size={14} />
              Total units
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">24 units</div>
            <div className="body-sm mt-0.5">3 line items</div>
          </div>

          <div>
            <div className="section-label flex items-center gap-1">
              <Calendar className="text-[var(--accent)]" size={14} />
              Delivery target
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mt-1">Sep 10, 2026</div>
            <div className="body-sm mt-0.5">Firm Window: EST</div>
          </div>

          <div>
            <div className="section-label flex items-center gap-1">
              <Route className="text-[var(--accent)]" size={14} />
              Route optimization
            </div>
            <div className="mt-1">
              <span className="badge badge-success">
                Auto Multi-Hub Split
              </span>
            </div>
            <div className="body-sm text-[var(--success)] font-medium mt-0.5">Cuts transit by 41h</div>
          </div>
        </div>

        {/* Multi-Warehouse Split Allocation Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="df-card p-6 space-y-4 !p-0 overflow-hidden">
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="section-label text-base text-[var(--text-primary)] flex items-center gap-2">
                  <Route className="text-[var(--accent)]" size={18} />
                  Optimized warehouse allocation matrix
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
                        <div className="font-semibold text-[var(--text-primary)]">Laptop Pro 16&quot;</div>
                        <div className="body-sm">SKU: HW-LP16-01</div>
                      </td>
                      <td className="text-right font-mono font-bold text-[var(--text-primary)]">2</td>
                      <td>
                        <span className="badge badge-indigo">
                          Main Warehouse (2 units)
                        </span>
                      </td>
                      <td className="body-sm">— None (Full Stock)</td>
                      <td className="text-right font-mono text-[var(--text-secondary)]">₹45.00</td>
                    </tr>

                    <tr>
                      <td>
                        <div className="font-semibold text-[var(--text-primary)]">Industrial IoT Gateway</div>
                        <div className="body-sm">SKU: HW-GW-99</div>
                      </td>
                      <td className="text-right font-mono font-bold text-[var(--text-primary)]">22</td>
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
                      <td className="text-right font-mono text-[var(--text-secondary)]">₹128.50</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Allocation Actions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="df-card p-6 space-y-4">
              <h3 className="section-label text-base text-[var(--text-primary)]">Fulfillment controls</h3>

              {!accepted ? (
                <button
                  onClick={handleAcceptSplit}
                  className="btn-primary w-full py-3 justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  <span>Accept & Confirm Split Allocation</span>
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-[var(--success-subtle)] border border-emerald-200 text-[var(--success)] text-center space-y-1">
                  <div className="font-bold flex items-center justify-center gap-2">
                    <CheckCircle size={18} />
                    Split Allocation Confirmed
                  </div>
                  <p className="body-sm text-[var(--success)]">Pick tickets dispatched to Main & East warehouses.</p>
                </div>
              )}

              <button
                onClick={() => triggerToast('Manual warehouse override modal launched.')}
                className="btn-secondary w-full justify-center gap-2"
              >
                <Edit size={16} />
                <span>Manual Warehouse Override</span>
              </button>

              <button
                onClick={() => triggerToast('Re-running route optimizer algorithm...')}
                className="btn-secondary w-full justify-center gap-2"
              >
                <RefreshCw size={16} />
                <span>Re-calculate Freight & Routing</span>
              </button>
            </div>

            <div className="df-card p-5 space-y-2 body-sm">
              <div className="section-label mb-2 text-[var(--text-primary)]">Transit & freight summary</div>
              <div className="flex justify-between py-1 border-b border-[var(--border)]">
                <span className="body-sm">Estimated Freight Cost</span>
                <span className="text-[var(--text-primary)] font-mono font-semibold">₹173.50</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border)]">
                <span className="body-sm">Total Shipment Weight</span>
                <span className="text-[var(--text-primary)] font-mono font-semibold">48.2 lbs</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="body-sm">Estimated Delivery</span>
                <span className="text-[var(--success)] font-semibold">Sep 08 - Sep 10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
