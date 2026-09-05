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
    <div className="min-h-screen bg-[#0f131c] text-[#dfe2ee] font-sans">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-lg">
            DF
          </div>
          <div>
            <div className="font-bold text-white tracking-tight text-lg">DealFlow360 Customer Portal</div>
            <div className="text-xs text-slate-400">Secure Direct Negotiation • Token: <code className="text-indigo-400">{token}</code></div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            STATUS: UNDER NEGOTIATION
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-6xl mx-auto space-y-8">
        {/* Banner */}
        <div className="glass-card p-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Acme Corporation Inc.</div>
              <h1 className="text-3xl font-black text-white mt-1">Quotation Review: #DF-88301-B</h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Review your commercial proposal below. You can accept directly or submit counter-terms to your dedicated Account Executive.
              </p>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 shrink-0 text-right">
              <div className="text-xs text-slate-400 uppercase font-semibold">Current Proposal Total</div>
              <div className="text-3xl font-black text-white">$2,730.00</div>
              <div className="text-xs text-emerald-400 font-semibold">Includes 2yr Platinum SLA</div>
            </div>
          </div>
        </div>

        {/* Confirmed Notice */}
        {confirmed && (
          <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 space-y-2">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">verified</span>
              Quotation Confirmed & Order Created!
            </h3>
            <p className="text-sm text-emerald-400/80">
              Thank you for confirming Order #DF-88301-B. Fulfillment pick tickets have been dispatched to our logistics team.
            </p>
          </div>
        )}

        {/* Counter Submitted Notice */}
        {counterSubmitted && !confirmed && (
          <div className="p-6 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-300 space-y-2">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">pending</span>
              Counter-Offer Submitted to Deal Desk
            </h3>
            <p className="text-sm text-amber-400/80">
              Your requested counter-terms ({counterDiscount}% discount, {counterTerm}) have been sent to Sarah Lin (AE). You will receive an updated link shortly.
            </p>
          </div>
        )}

        {/* Line Items Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400">inventory</span>
                Quotation Line Items & Feedback
              </h3>

              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase tracking-wider text-slate-400 bg-slate-900/60">
                  <tr>
                    <th className="px-4 py-3">Line Description</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3">Customer Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-semibold text-white">Laptop Pro 16" (M3 Max, 32GB)</td>
                    <td className="px-4 py-3 text-right font-mono">2</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white">$2,112.00</td>
                    <td className="px-4 py-3 text-xs text-slate-400">Accepted as priced</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-semibold text-white">Cloud IoT Platform Enterprise License</td>
                    <td className="px-4 py-3 text-right font-mono">1</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white">$46.00 / mo</td>
                    <td className="px-4 py-3 text-xs text-amber-300">"Requesting 15% bundle discount"</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-semibold text-white">Custom Onboarding & Migration SLA</td>
                    <td className="px-4 py-3 text-right font-mono">1</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white">$572.00</td>
                    <td className="px-4 py-3 text-xs text-purple-300">"Can engineer dispatch move to Q4?"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Commercial Actions</h3>

              {!confirmed && (
                <>
                  <button
                    onClick={handleConfirmOrder}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-lg shadow-xl transition flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    Accept Proposal & Confirm Order
                  </button>

                  <div className="border-t border-slate-800 pt-4 space-y-3">
                    <div className="text-xs font-bold text-slate-300 uppercase">Submit Counter-Offer</div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Target Discount %</label>
                      <input
                        type="number"
                        value={counterDiscount}
                        onChange={(e) => setCounterDiscount(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Requested Payment Terms</label>
                      <select
                        value={counterTerm}
                        onChange={(e) => setCounterTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white"
                      >
                        <option>Net 30</option>
                        <option>Net 60</option>
                        <option>50% Upfront, 50% Delivery</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Notes to AE</label>
                      <textarea
                        rows={3}
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder="Add comments on timeline or scope..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white placeholder-slate-500"
                      ></textarea>
                    </div>

                    <button
                      onClick={handleSubmitCounter}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow transition"
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
