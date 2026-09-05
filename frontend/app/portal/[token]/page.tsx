'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle, Clock, Send, ShoppingBag } from 'lucide-react';

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
    <div
      className="min-h-screen font-sans antialiased"
      style={{
        backgroundColor: '#F5F5F3',
        color: '#1F1F1C',
        ['--accent' as any]: '#4B4B42',
        ['--accent-hover' as any]: '#373730',
        ['--accent-subtle' as any]: '#ECECE9',
      }}
    >
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-8 z-50 bg-[#4B4B42] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle size={18} />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header Navbar */}
      <header className="bg-white border-b border-[#DCDCD9] px-8 h-16 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="DealFlow360 Logo" width={28} height={28} className="w-7 h-7" />
            <span className="font-bold text-lg tracking-tight text-[#1F1F1C]">
              DealFlow<span className="text-[#4B4B42]">360</span> <span className="text-xs font-semibold uppercase text-[#4B4B42] ml-1">Customer Portal</span>
            </span>
          </div>
          <span className="text-xs text-[#91918F]">|</span>
          <span className="body-sm font-mono">Token: <code className="text-[#4B4B42]">{token}</code></span>
        </div>

        <div className="flex items-center gap-3">
          <span className="badge badge-warning">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mr-1.5"></span>
            STATUS: UNDER NEGOTIATION
          </span>
        </div>
      </header>

      {/* Main Container matching AppLayout proportions */}
      <main className="w-full max-w-[1400px] mx-auto p-[32px] space-y-6">
        {/* Banner */}
        <div className="df-card p-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="section-label text-[#4B4B42]">Acme Corporation Inc.</div>
              <h1 className="page-heading mt-1">Quotation Review: #DF-88301-B</h1>
              <p className="body-text mt-1 max-w-2xl">
                Review your commercial proposal below. You can accept directly or submit counter-terms to your dedicated Account Executive.
              </p>
            </div>
            <div className="bg-[#ECECE9] p-5 rounded-xl border border-[#DCDCD9] shrink-0 text-right">
              <div className="section-label text-xs">Current proposal total</div>
              <div className="text-3xl font-bold text-[#1F1F1C] mt-0.5">₹2,730.00</div>
              <div className="body-sm text-[#2E6B4F] font-semibold mt-0.5">Includes 2yr Platinum SLA</div>
            </div>
          </div>
        </div>

        {/* Confirmed Notice */}
        {confirmed && (
          <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
            <h3 className="section-label text-base text-emerald-800 flex items-center gap-2">
              <CheckCircle size={20} className="text-[#2E6B4F]" />
              Quotation Confirmed & Order Created!
            </h3>
            <p className="body-text text-sm text-emerald-700">
              Thank you for confirming Order #DF-88301-B. Fulfillment pick tickets have been dispatched to our logistics team.
            </p>
          </div>
        )}

        {/* Counter Submitted Notice */}
        {counterSubmitted && !confirmed && (
          <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 space-y-2">
            <h3 className="section-label text-base text-amber-800 flex items-center gap-2">
              <Clock size={20} className="text-amber-600" />
              Counter-Offer Submitted to Deal Desk
            </h3>
            <p className="body-text text-sm text-amber-700">
              Your requested counter-terms ({counterDiscount}% discount, {counterTerm}) have been sent to Sarah Lin (AE). You will receive an updated link shortly.
            </p>
          </div>
        )}

        {/* Line Items Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="df-card p-6 space-y-4 !p-0 overflow-hidden">
              <div className="p-4 border-b border-[#DCDCD9]">
                <h3 className="section-label text-base text-[#1F1F1C] flex items-center gap-2">
                  <ShoppingBag className="text-[#4B4B42]" size={18} />
                  Quotation Line Items & Feedback
                </h3>
              </div>

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
                      <td className="font-semibold text-[#1F1F1C]">Laptop Pro 16&quot; (M3 Max, 32GB)</td>
                      <td className="text-right font-mono text-[#4B4B42]">2</td>
                      <td className="text-right font-mono font-bold text-[#1F1F1C]">₹2,112.00</td>
                      <td className="body-sm">Accepted as priced</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-[#1F1F1C]">Cloud IoT Platform Enterprise License</td>
                      <td className="text-right font-mono text-[#4B4B42]">1</td>
                      <td className="text-right font-mono font-bold text-[#1F1F1C]">₹46.00 / mo</td>
                      <td className="body-sm text-amber-700 font-medium">&ldquo;Requesting 15% bundle discount&rdquo;</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-[#1F1F1C]">Custom Onboarding & Migration SLA</td>
                      <td className="text-right font-mono text-[#4B4B42]">1</td>
                      <td className="text-right font-mono font-bold text-[#1F1F1C]">₹572.00</td>
                      <td className="body-sm text-[#4B4B42] font-medium">&ldquo;Can engineer dispatch move to Q4?&rdquo;</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Action Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="df-card p-6 space-y-4">
              <h3 className="section-label text-base text-[#1F1F1C]">Commercial actions</h3>

              {!confirmed && (
                <>
                  <button
                    onClick={handleConfirmOrder}
                    className="w-full h-10 px-4 rounded-lg bg-[#4B4B42] hover:bg-[#373730] text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
                  >
                    <CheckCircle size={18} />
                    <span>Accept Proposal & Confirm Order</span>
                  </button>

                  <div className="border-t border-[#DCDCD9] pt-4 space-y-3">
                    <div className="section-label">Submit counter-offer</div>

                    <div>
                      <label className="body-sm block mb-1">Target Discount %</label>
                      <input
                        type="number"
                        value={counterDiscount}
                        onChange={(e) => setCounterDiscount(Number(e.target.value))}
                        className="w-full text-sm p-2 rounded-lg border border-[#DCDCD9] bg-white text-[#1F1F1C]"
                      />
                    </div>

                    <div>
                      <label className="body-sm block mb-1">Requested Payment Terms</label>
                      <select
                        value={counterTerm}
                        onChange={(e) => setCounterTerm(e.target.value)}
                        className="w-full text-sm p-2 rounded-lg border border-[#DCDCD9] bg-white text-[#1F1F1C]"
                      >
                        <option>Net 30</option>
                        <option>Net 60</option>
                        <option>50% Upfront, 50% Delivery</option>
                      </select>
                    </div>

                    <div>
                      <label className="body-sm block mb-1">Notes to AE</label>
                      <textarea
                        rows={3}
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder="Add comments on timeline or scope..."
                        className="w-full text-sm p-3 rounded-lg border border-[#DCDCD9] bg-white text-[#1F1F1C] placeholder-[#91918F]"
                      ></textarea>
                    </div>

                    <button
                      onClick={handleSubmitCounter}
                      className="w-full h-10 px-4 rounded-lg bg-[#ECECE9] hover:bg-[#DCDCD9] text-[#4B4B42] border border-[#DCDCD9] font-semibold text-sm flex items-center justify-center gap-2 transition"
                    >
                      <Send size={16} />
                      <span>Submit Counter-Offer</span>
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
