'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

export default function InvoiceDetailPage() {
  const params = useParams();
  const invId = (params?.id as string) || 'INV-1042';

  const [paymentRecorded, setPaymentRecorded] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleRecordPayment = () => {
    setPaymentRecorded(true);
    triggerToast(`Payment of $2,730.00 recorded for invoice ${invId}. Status updated to PAID.`);
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

        {/* Navigation & Status Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <nav className="flex items-center gap-2 type-body-base text-slate-500 dark:text-slate-400">
            <Link href="/invoices" className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
              <span className="material-symbols-outlined text-base">receipt_long</span>
              <span>Invoices</span>
            </Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Acme Corp</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-mono font-semibold">{invId}</span>
            <span>/</span>
            <span className="badge badge-success text-xs">RECONCILIATION</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className={`badge ${
              paymentRecorded ? 'badge-success' : 'badge-danger'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${paymentRecorded ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
              {paymentRecorded ? 'PAID IN FULL' : 'Unpaid Balance: $2,730.00'}
            </span>
            <span className="badge badge-muted">
              Terms: Net 30
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-heading-1 font-bold text-slate-900 dark:text-white">Invoice Detail: {invId} <span className="text-indigo-600 dark:text-indigo-400">(Acme Corp)</span></h1>
          <p className="type-body-base text-slate-500 dark:text-slate-400 mt-1 max-w-4xl">
            Automated billing and fulfillment delivery synchronization strictly enforces no pre-billing prior to logistical release.
          </p>
        </div>

        {/* Executive Milestone Stepper Component */}
        <div className="df-card p-8 space-y-6 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10 text-center">
            {/* Step 1 */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Order Confirmed</div>
              <div className="type-subheading text-xs text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Completed</div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500">Aug 28, 2026 • PO-8902</div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Shipped & Dispatched</div>
              <div className="type-subheading text-xs text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Completed</div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500">Sep 01, 2026 • Carrier #TRK-99</div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                paymentRecorded ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-500/20'
              }`}>
                <span className="material-symbols-outlined">receipt</span>
              </div>
              <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Invoiced</div>
              <div className="type-subheading text-xs text-indigo-600 dark:text-indigo-400 uppercase font-semibold">Issued Sep 02</div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500">Linked to Quotation #Q-1042</div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                paymentRecorded ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
              }`}>
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div className={`text-sm font-bold ${paymentRecorded ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {paymentRecorded ? 'Paid' : 'Payment Due'}
              </div>
              <div className={`type-subheading text-xs uppercase font-semibold ${paymentRecorded ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {paymentRecorded ? 'Settled via ACH' : 'Due Oct 02, 2026'}
              </div>
            </div>
          </div>
        </div>

        {/* Policy Callout Banner */}
        <div className="df-card p-4 flex items-center gap-4 border-l-4 border-l-emerald-500">
          <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">verified_user</span>
          <div>
            <div className="type-subheading text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Automated DealFlow360 Assurance Policy</div>
            <p className="type-body-base text-xs text-slate-600 dark:text-slate-300">
              Partial invoicing stays reconciled with partial delivery — nothing is billed before it ships. Audit Token: <code className="text-indigo-600 dark:text-indigo-400 font-mono">DF-REC-20260902-882</code>
            </p>
          </div>
        </div>

        {/* Invoice Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Table */}
          <div className="lg:col-span-8 space-y-6">
            <div className="df-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-heading-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">table_chart</span>
                  Synchronized Line Item Breakdown
                </h3>
                <span className="badge badge-muted">2 Line Items</span>
              </div>

              <div className="overflow-x-auto">
                <table className="df-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th className="text-right">Qty</th>
                      <th className="text-right">Unit Price</th>
                      <th className="text-right">Discount</th>
                      <th className="text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-semibold text-slate-900 dark:text-white">Laptop Pro 16&quot; (M3 Max, 32GB)</td>
                      <td className="text-right font-mono text-slate-700 dark:text-slate-300">2</td>
                      <td className="text-right font-mono text-slate-700 dark:text-slate-300">$1,200.00</td>
                      <td className="text-right font-mono text-emerald-600 dark:text-emerald-400">-12.0%</td>
                      <td className="text-right font-mono font-semibold text-slate-900 dark:text-white">$2,112.00</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-slate-900 dark:text-white">Custom Onboarding & Migration SLA</td>
                      <td className="text-right font-mono text-slate-700 dark:text-slate-300">1</td>
                      <td className="text-right font-mono text-slate-700 dark:text-slate-300">$737.50</td>
                      <td className="text-right font-mono text-emerald-600 dark:text-emerald-400">-28.0%</td>
                      <td className="text-right font-mono font-semibold text-slate-900 dark:text-white">$531.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Calculation */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-col items-end space-y-2 type-body-base text-sm">
                <div className="flex justify-between w-64 text-slate-500 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold">$2,643.00</span>
                </div>
                <div className="flex justify-between w-64 text-slate-500 dark:text-slate-400">
                  <span>Sales Tax / VAT (8%)</span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold">$87.00</span>
                </div>
                <div className="flex justify-between w-64 text-lg font-bold border-t border-slate-200 dark:border-slate-800 pt-2 text-slate-900 dark:text-white">
                  <span>Total Amount</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">$2,730.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions & Payment Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="df-card p-6 space-y-4">
              <h3 className="text-heading-3 font-bold text-slate-900 dark:text-white">Payment & Actions</h3>

              {!paymentRecorded ? (
                <button
                  onClick={handleRecordPayment}
                  className="btn-primary w-full py-3 justify-center gap-2"
                >
                  <span className="material-symbols-outlined">payments</span>
                  <span>Record Payment Received ($2,730)</span>
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-center space-y-1">
                  <div className="font-bold flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    Payment Confirmed
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Reconciled on {new Date().toLocaleDateString()}</p>
                </div>
              )}

              <button
                onClick={() => triggerToast('Invoice PDF downloaded to desktop.')}
                className="btn-secondary w-full justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">download</span>
                <span>Download Invoice PDF</span>
              </button>

              <button
                onClick={() => triggerToast('Invoice notification re-sent to billing@acme.com')}
                className="btn-secondary w-full justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">mail</span>
                <span>Send Remind / Receipt Email</span>
              </button>
            </div>

            <div className="df-card p-5 space-y-2 type-body-base text-xs text-slate-500 dark:text-slate-400">
              <div className="font-bold text-slate-900 dark:text-white text-sm mb-2">Billing Address & Contact</div>
              <div>Acme Corporation Inc.</div>
              <div>Attn: Accounts Payable</div>
              <div>100 Enterprise Way, Suite 400</div>
              <div>San Francisco, CA 94107</div>
              <div className="text-indigo-600 dark:text-indigo-400 mt-2 font-mono font-medium">ap@acmecorp.com</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
