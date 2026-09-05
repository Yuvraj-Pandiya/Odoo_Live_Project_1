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
          <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce">
            <span className="material-symbols-outlined">check_circle</span>
            <span className="text-sm font-semibold">{toastMsg}</span>
          </div>
        )}

        {/* Navigation & Status Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/invoices" className="hover:text-white flex items-center gap-1">
              <span className="material-symbols-outlined text-base">receipt_long</span>
              <span>Invoices</span>
            </Link>
            <span>/</span>
            <span className="text-slate-300">Acme Corp</span>
            <span>/</span>
            <span className="text-white font-mono font-semibold">{invId}</span>
            <span>/</span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-xs">RECONCILIATION</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              paymentRecorded ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${paymentRecorded ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`}></span>
              {paymentRecorded ? 'PAID IN FULL' : 'Unpaid Balance: $2,730.00'}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
              Terms: Net 30
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-black text-white">Invoice Detail: {invId} <span className="text-indigo-400">(Acme Corp)</span></h1>
          <p className="text-sm text-slate-400 mt-1 max-w-4xl">
            Automated billing and fulfillment delivery synchronization strictly enforces no pre-billing prior to logistical release.
          </p>
        </div>

        {/* Executive Milestone Stepper Component */}
        <div className="glass-card p-8 space-y-6 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10 text-center">
            {/* Step 1 */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div className="text-sm font-bold text-white">Order Confirmed</div>
              <div className="text-xs text-emerald-400 uppercase font-semibold">Completed</div>
              <div className="text-[11px] text-slate-500">Aug 28, 2026 • PO-8902</div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <div className="text-sm font-bold text-white">Shipped & Dispatched</div>
              <div className="text-xs text-emerald-400 uppercase font-semibold">Completed</div>
              <div className="text-[11px] text-slate-500">Sep 01, 2026 • Carrier #TRK-99</div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                paymentRecorded ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-500/30'
              }`}>
                <span className="material-symbols-outlined">receipt</span>
              </div>
              <div className="text-sm font-bold text-indigo-300">Invoiced</div>
              <div className="text-xs text-indigo-400 uppercase font-semibold">Issued Sep 02</div>
              <div className="text-[11px] text-slate-400">Linked to Quotation #Q-1042</div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                paymentRecorded ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/30' : 'bg-slate-800 text-slate-500'
              }`}>
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div className={`text-sm font-bold ${paymentRecorded ? 'text-emerald-400' : 'text-slate-400'}`}>
                {paymentRecorded ? 'Paid' : 'Payment Due'}
              </div>
              <div className={`text-xs uppercase font-semibold ${paymentRecorded ? 'text-emerald-400' : 'text-slate-500'}`}>
                {paymentRecorded ? 'Settled via ACH' : 'Due Oct 02, 2026'}
              </div>
            </div>
          </div>
        </div>

        {/* Policy Callout Banner */}
        <div className="glass-card p-4 flex items-center gap-4 border-l-4 border-l-emerald-500">
          <span className="material-symbols-outlined text-emerald-400">verified_user</span>
          <div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Automated DealFlow360 Assurance Policy</div>
            <p className="text-xs text-slate-300">
              Partial invoicing stays reconciled with partial delivery — nothing is billed before it ships. Audit Token: <code className="text-indigo-300">DF-REC-20260902-882</code>
            </p>
          </div>
        </div>

        {/* Invoice Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Table */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-400">table_chart</span>
                  Synchronized Line Item Breakdown
                </h3>
                <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded">2 Line Items</span>
              </div>

              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase tracking-wider text-slate-400 bg-slate-900/60">
                  <tr>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-right">Discount</th>
                    <th className="px-4 py-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-semibold text-white">Laptop Pro 16" (M3 Max, 32GB)</td>
                    <td className="px-4 py-3 text-right font-mono">2</td>
                    <td className="px-4 py-3 text-right font-mono">$1,200.00</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400">-12.0%</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-white">$2,112.00</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-semibold text-white">Custom Onboarding & Migration SLA</td>
                    <td className="px-4 py-3 text-right font-mono">1</td>
                    <td className="px-4 py-3 text-right font-mono">$737.50</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400">-28.0%</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-white">$531.00</td>
                  </tr>
                </tbody>
              </table>

              {/* Total Calculation */}
              <div className="border-t border-slate-800 pt-4 flex flex-col items-end space-y-2 text-sm">
                <div className="flex justify-between w-64 text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">$2,643.00</span>
                </div>
                <div className="flex justify-between w-64 text-slate-400">
                  <span>Sales Tax / VAT (8%)</span>
                  <span className="font-mono text-white">$87.00</span>
                </div>
                <div className="flex justify-between w-64 text-lg font-bold border-t border-slate-800 pt-2 text-white">
                  <span>Total Amount</span>
                  <span className="font-mono text-emerald-400">$2,730.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions & Payment Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Payment & Actions</h3>

              {!paymentRecorded ? (
                <button
                  onClick={handleRecordPayment}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-lg shadow-lg transition flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">payments</span>
                  Record Payment Received ($2,730)
                </button>
              ) : (
                <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-center space-y-1">
                  <div className="font-bold flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    Payment Confirmed
                  </div>
                  <p className="text-xs text-emerald-400/80">Reconciled on {new Date().toLocaleDateString()}</p>
                </div>
              )}

              <button
                onClick={() => triggerToast('Invoice PDF downloaded to desktop.')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded-lg border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">download</span>
                Download Invoice PDF
              </button>

              <button
                onClick={() => triggerToast('Invoice notification re-sent to billing@acme.com')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded-lg border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">mail</span>
                Send Remind / Receipt Email
              </button>
            </div>

            <div className="glass-card p-5 space-y-2 text-xs text-slate-400">
              <div className="font-bold text-white text-sm mb-2">Billing Address & Contact</div>
              <div>Acme Corporation Inc.</div>
              <div>Attn: Accounts Payable</div>
              <div>100 Enterprise Way, Suite 400</div>
              <div>San Francisco, CA 94107</div>
              <div className="text-indigo-400 mt-2 font-mono">ap@acmecorp.com</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
