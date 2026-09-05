'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function CustomerPortalNegotiationPage() {
  const params = useParams();
  const token = (params?.token as string) || 'demo-token-1042';

  const [counterDiscount, setCounterDiscount] = useState<number>(15);
  const [counterTerm, setCounterTerm] = useState<string>('Net 30');
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [counterSubmitted, setCounterSubmitted] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleConfirmOrder = () => {
    setConfirmed(true);
    triggerToast('Order confirmed! Deal desk has received your binding acceptance.');
  };

  const handleSubmitCounter = () => {
    setCounterSubmitted(true);
    triggerToast('Counter-offer submitted to Deal Desk for review.');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-8 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-sm">
            DF
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white tracking-tight text-lg">DealFlow360 Customer Portal</div>
            <div className="type-body-base text-xs text-slate-500 dark:text-slate-400">Secure Direct Negotiation • Token: <code className="text-indigo-600 dark:text-indigo-400 font-mono">{token}</code></div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="badge badge-warning">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mr-1"></span>
            STATUS: UNDER NEGOTIATION
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-6xl mx-auto space-y-8">
        {/* Banner */}
        <div className="df-card p-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="type-subheading text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Acme Corporation Inc.</div>
              <h1 className="text-heading-1 font-bold text-slate-900 dark:text-white mt-1">Quotation Review: #DF-88301-B</h1>
              <p className="type-body-base text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                Review your commercial proposal below. You can accept directly or submit counter-terms to your dedicated Account Executive.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/90 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 text-right">
              <div className="type-subheading text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Current Proposal Total</div>
              <div className="text-display font-bold text-slate-900 dark:text-white mt-0.5">$2,730.00</div>
              <div className="type-body-base text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Includes 2yr Platinum SLA</div>
            </div>
          </div>
        </div>

        {/* Confirmed Notice */}
        {confirmed && (
          <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 space-y-2">
            <h3 className="text-heading-3 font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">verified</span>
              Quotation Confirmed & Order Created!
            </h3>
            <p className="type-body-base text-sm text-emerald-700 dark:text-emerald-400">
              Thank you for confirming Order #DF-88301-B. Fulfillment pick tickets have been dispatched to our logistics team.
            </p>
          </div>
        )}

        {/* Counter Submitted Notice */}
        {counterSubmitted && !confirmed && (
          <div className="p-6 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 space-y-2">
            <h3 className="text-heading-3 font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">pending</span>
              Counter-Offer Submitted to Deal Desk
            </h3>
            <p className="type-body-base text-sm text-amber-700 dark:text-amber-400">
              Your requested counter-terms ({counterDiscount}% discount, {counterTerm}) have been sent to Sarah Lin (AE). You will receive an updated link shortly.
            </p>
          </div>
        )}

        {/* Line Items Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="df-card p-6 space-y-4">
              <h3 className="text-heading-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">inventory</span>
                Quotation Line Items & Feedback
              </h3>

              <div className="overflow-x-auto">
                <table className="df-table">
                  <thead>
                    <tr>
                      <th>Line Description</th>
                      <th className="text-right">Qty</th>
                      <th className="text-right">Price</th>
                      <th>Customer Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-semibold text-slate-900 dark:text-white">Laptop Pro 16&quot; (M3 Max, 32GB)</td>
                      <td className="text-right font-mono text-slate-700 dark:text-slate-300">2</td>
                      <td className="text-right font-mono font-bold text-slate-900 dark:text-white">$2,112.00</td>
                      <td className="type-body-base text-xs text-slate-500 dark:text-slate-400">Accepted as priced</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-slate-900 dark:text-white">Cloud IoT Platform Enterprise License</td>
                      <td className="text-right font-mono text-slate-700 dark:text-slate-300">1</td>
                      <td className="text-right font-mono font-bold text-slate-900 dark:text-white">$46.00 / mo</td>
                      <td className="type-body-base text-xs text-amber-600 dark:text-amber-400 font-medium">&ldquo;Requesting 15% bundle discount&rdquo;</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-slate-900 dark:text-white">Custom Onboarding & Migration SLA</td>
                      <td className="text-right font-mono text-slate-700 dark:text-slate-300">1</td>
                      <td className="text-right font-mono font-bold text-slate-900 dark:text-white">$572.00</td>
                      <td className="type-body-base text-xs text-purple-600 dark:text-purple-400 font-medium">&ldquo;Can engineer dispatch move to Q4?&rdquo;</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Action Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="df-card p-6 space-y-4">
              <h3 className="text-heading-3 font-bold text-slate-900 dark:text-white">Commercial Actions</h3>

              {!confirmed && (
                <>
                  <button
                    onClick={handleConfirmOrder}
                    className="btn-primary w-full py-3.5 justify-center gap-2 shadow-lg"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>Accept Proposal & Confirm Order</span>
                  </button>

                  <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
                    <div className="type-subheading text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Submit Counter-Offer</div>

                    <div>
                      <label className="type-subheading block text-xs text-slate-600 dark:text-slate-400 mb-1">Target Discount %</label>
                      <input
                        type="number"
                        value={counterDiscount}
                        onChange={(e) => setCounterDiscount(Number(e.target.value))}
                        className="df-input w-full text-sm"
                      />
                    </div>

                    <div>
                      <label className="type-subheading block text-xs text-slate-600 dark:text-slate-400 mb-1">Requested Payment Terms</label>
                      <select
                        value={counterTerm}
                        onChange={(e) => setCounterTerm(e.target.value)}
                        className="df-input w-full text-sm"
                      >
                        <option>Net 30</option>
                        <option>Net 60</option>
                        <option>50% Upfront, 50% Delivery</option>
                      </select>
                    </div>

                    <div>
                      <label className="type-subheading block text-xs text-slate-600 dark:text-slate-400 mb-1">Notes to AE</label>
                      <textarea
                        rows={3}
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder="Add comments on timeline or scope..."
                        className="df-input w-full text-sm"
                      ></textarea>
                    </div>

                    <button
                      onClick={handleSubmitCounter}
                      className="btn-primary w-full py-2.5 justify-center gap-2"
                    >
                      Submit Counter-Offer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
