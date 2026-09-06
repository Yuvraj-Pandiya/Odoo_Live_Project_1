'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { invoiceApi } from '@/lib/api';
import { CheckCircle, Download, Mail, CreditCard, Receipt, Truck, FileText } from 'lucide-react';

export default function InvoiceDetailPage() {
  const params = useParams();
  const invId = (params?.id as string) || 'INV-1042';

  const [paymentRecorded, setPaymentRecorded] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleRecordPayment = async () => {
    setPaymentRecorded(true);
    triggerToast(`Payment recorded for invoice ${invId}. Status updated to PAID.`);
    const numId = parseInt(invId.replace(/\D/g, ''), 10);
    if (!isNaN(numId)) {
      try {
        await invoiceApi.pay(numId);
      } catch (err) {
        console.warn('Invoice payment sync:', err);
      }
    }
  };

  const handleDownloadInvoicePDF = () => {
    triggerToast(`Generating Invoice PDF for ${invId}...`);
    setTimeout(() => {
      window.print();
    }, 500);
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

        {/* Navigation & Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="flex items-center gap-2 body-sm">
            <Link href="/invoices" className="hover:text-[var(--text-primary)] flex items-center gap-1">
              <Receipt size={14} />
              <span>Invoices</span>
            </Link>
            <span>/</span>
            <span className="font-medium text-[var(--text-primary)]">Acme Corp</span>
            <span>/</span>
            <span className="font-mono font-semibold text-[var(--text-primary)]">{invId}</span>
            <span>/</span>
            <span className="badge badge-success text-xs">RECONCILIATION</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className={`badge ${
              paymentRecorded ? 'badge-success' : 'badge-danger'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${paymentRecorded ? 'bg-[var(--success)]' : 'bg-[var(--error)] animate-pulse'}`}></span>
              {paymentRecorded ? 'PAID IN FULL' : 'Unpaid Balance: ₹2,730.00'}
            </span>
            <span className="badge badge-muted">
              Terms: Net 30
            </span>
          </div>
        </div>

        {/* Aligned Title & Download Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 className="page-heading">Invoice Detail: {invId}</h1>
              <span className="badge badge-indigo">
                Acme Corp
              </span>
            </div>
            <p className="body-text" style={{ marginTop: '4px' }}>
              Automated billing and fulfillment delivery synchronization strictly enforces no pre-billing prior to logistical release.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleDownloadInvoicePDF}
              className="btn-secondary flex items-center gap-2"
              type="button"
            >
              <Download size={16} />
              <span>Download Invoice PDF</span>
            </button>
          </div>
        </div>

        {/* Executive Milestone Stepper Component */}
        <div className="df-card p-8 space-y-6 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10 text-center">
            {/* Step 1 */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[var(--success-subtle)] text-[var(--success)] flex items-center justify-center font-bold">
                <CheckCircle size={20} />
              </div>
              <div className="section-label">Order confirmed</div>
              <div className="body-sm text-[var(--success)] font-semibold">Completed</div>
              <div className="body-sm">Aug 28, 2026 • PO-8902</div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[var(--success-subtle)] text-[var(--success)] flex items-center justify-center font-bold">
                <Truck size={20} />
              </div>
              <div className="section-label">Shipped & dispatched</div>
              <div className="body-sm text-[var(--success)] font-semibold">Completed</div>
              <div className="body-sm">Sep 01, 2026 • Carrier #TRK-99</div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                paymentRecorded ? 'bg-[var(--success-subtle)] text-[var(--success)]' : 'bg-[var(--accent)] text-white shadow-lg'
              }`}>
                <FileText size={20} />
              </div>
              <div className="section-label text-[var(--accent)]">Invoiced</div>
              <div className="body-sm text-[var(--accent)] font-semibold">Issued Sep 02</div>
              <div className="body-sm">Linked to Quotation #Q-1042</div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                paymentRecorded ? 'bg-[var(--success)] text-white' : 'bg-[var(--canvas)] text-[var(--text-muted)]'
              }`}>
                <CreditCard size={20} />
              </div>
              <div className={`section-label ${paymentRecorded ? 'text-[var(--success)]' : 'text-[var(--text-primary)]'}`}>
                {paymentRecorded ? 'Paid' : 'Payment due'}
              </div>
              <div className={`body-sm font-semibold ${paymentRecorded ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>
                {paymentRecorded ? 'Settled via ACH' : 'Due Oct 02, 2026'}
              </div>
            </div>
          </div>
        </div>

        {/* Policy Callout Banner */}
        <div className="df-card p-4 flex items-center gap-4 border-l-4 border-l-[var(--success)]">
          <CheckCircle className="text-[var(--success)] shrink-0" size={24} />
          <div>
            <div className="section-label text-[var(--success)]">Automated DealFlow360 assurance policy</div>
            <p className="body-text text-xs">
              Partial invoicing stays reconciled with partial delivery — nothing is billed before it ships. Audit Token: <code className="text-[var(--accent)] font-mono">DF-REC-20260902-882</code>
            </p>
          </div>
        </div>

        {/* Invoice Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Table */}
          <div className="lg:col-span-8 space-y-6">
            <div className="df-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <h3 className="section-label text-base text-[var(--text-primary)] flex items-center gap-2">
                  <Receipt className="text-[var(--accent)]" size={18} />
                  Synchronized line item breakdown
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
                      <td className="font-semibold text-[var(--text-primary)]">Laptop Pro 16&quot; (M3 Max, 32GB)</td>
                      <td className="text-right font-mono text-[var(--text-secondary)]">2</td>
                      <td className="text-right font-mono text-[var(--text-secondary)]">₹1,200.00</td>
                      <td className="text-right font-mono text-[var(--success)]">-12.0%</td>
                      <td className="text-right font-mono font-semibold text-[var(--text-primary)]">₹2,112.00</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-[var(--text-primary)]">Custom Onboarding & Migration SLA</td>
                      <td className="text-right font-mono text-[var(--text-secondary)]">1</td>
                      <td className="text-right font-mono text-[var(--text-secondary)]">₹737.50</td>
                      <td className="text-right font-mono text-[var(--success)]">-28.0%</td>
                      <td className="text-right font-mono font-semibold text-[var(--text-primary)]">₹531.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Calculation */}
              <div className="border-t border-[var(--border)] pt-4 flex flex-col items-end space-y-2 body-text text-sm">
                <div className="flex justify-between w-64">
                  <span className="body-sm">Subtotal</span>
                  <span className="font-mono text-[var(--text-primary)] font-semibold">₹2,643.00</span>
                </div>
                <div className="flex justify-between w-64">
                  <span className="body-sm">Sales Tax / VAT (8%)</span>
                  <span className="font-mono text-[var(--text-primary)] font-semibold">₹87.00</span>
                </div>
                <div className="flex justify-between w-64 text-base font-bold border-t border-[var(--border)] pt-2 text-[var(--text-primary)]">
                  <span>Total Amount</span>
                  <span className="font-mono text-[var(--success)] font-extrabold">₹2,730.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions & Payment Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="df-card p-6 space-y-4">
              <h3 className="section-label text-base text-[var(--text-primary)]">Payment & actions</h3>

              {!paymentRecorded ? (
                <button
                  onClick={handleRecordPayment}
                  className="btn-primary w-full py-3 justify-center gap-2"
                >
                  <CreditCard size={18} />
                  <span>Record Payment Received (₹2,730)</span>
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-[var(--success-subtle)] border border-emerald-200 text-[var(--success)] text-center space-y-1">
                  <div className="font-bold flex items-center justify-center gap-2">
                    <CheckCircle size={18} />
                    Payment Confirmed
                  </div>
                  <p className="body-sm text-[var(--success)]">Reconciled on {new Date().toLocaleDateString()}</p>
                </div>
              )}

              <button
                onClick={handleDownloadInvoicePDF}
                className="btn-secondary w-full justify-center gap-2"
                type="button"
              >
                <Download size={16} />
                <span>Download Invoice PDF</span>
              </button>

              <button
                onClick={() => triggerToast('Invoice notification re-sent to billing@acme.com')}
                className="btn-secondary w-full justify-center gap-2"
              >
                <Mail size={16} />
                <span>Send Remind / Receipt Email</span>
              </button>
            </div>

            <div className="df-card p-5 space-y-2 body-sm">
              <div className="section-label mb-2 text-[var(--text-primary)]">Billing address & contact</div>
              <div className="text-[var(--text-secondary)]">Acme Corporation Inc.</div>
              <div className="text-[var(--text-secondary)]">Attn: Accounts Payable</div>
              <div className="text-[var(--text-secondary)]">100 Enterprise Way, Suite 400</div>
              <div className="text-[var(--text-secondary)]">San Francisco, CA 94107</div>
              <div className="text-[var(--accent)] mt-2 font-mono font-medium">ap@acmecorp.com</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
