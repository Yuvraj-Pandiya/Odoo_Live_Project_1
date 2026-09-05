'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

export default function ApprovalDetailPage() {
  const params = useParams();
  const qid = (params?.id as string) || 'Q-1042';

  const [decisionModal, setDecisionModal] = useState<'Approve' | 'Reject' | 'Return' | null>(null);
  const [comments, setComments] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [decisionState, setDecisionState] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleExecuteDecision = () => {
    if (!decisionModal) return;
    setDecisionState(decisionModal);
    triggerToast(`Quotation ${qid} action recorded: ${decisionModal} with notes.`);
    setDecisionModal(null);
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

        {/* Back Link & Header */}
        <div className="flex items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/approvals" className="hover:text-white flex items-center gap-1">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Approvals Queue</span>
            </Link>
            <span>/</span>
            <span className="text-white font-mono font-semibold">{qid}</span>
            <span>/</span>
            <span className="text-indigo-400">Deep Inspection</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700">
              <span className="material-symbols-outlined text-xs text-amber-400">history</span>
              SLA Target: 4h 12m Remaining
            </span>
          </div>
        </div>

        {/* Executive Banner */}
        <div className="glass-card p-8 space-y-6 relative overflow-hidden">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                  Blended Risk: HIGH
                </span>
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase">
                  Customer Tier: Gold
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs uppercase font-semibold">
                  Rev 03 • Fast-Track Governance
                </span>
              </div>
              <h1 className="text-3xl font-black text-white">
                Approval Detail: {qid} <span className="text-indigo-400">(Acme Corp)</span>
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Deep inspection of line-item discount breaches, policy thresholds, multi-tier governance status, and audit trail.
              </p>
            </div>

            {/* High Impact Callout Group */}
            <div className="flex items-center gap-6 bg-slate-900/90 p-4 rounded-xl border border-slate-800 shrink-0">
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold">Order Value</div>
                <div className="text-3xl font-black text-white">$2,643.00</div>
                <div className="text-xs text-emerald-400 font-semibold">Gross Margin: 28.4%</div>
              </div>
              <div className="h-10 w-px bg-slate-800"></div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold">Max Threshold Breach</div>
                <div className="text-3xl font-black text-red-400">+8.0<span className="text-sm">pt</span></div>
                <div className="text-xs text-red-400 font-semibold">Services Cap Limit</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Diagnostics */}
          <div className="lg:col-span-8 space-y-8">
            {/* Why This Quote Was Flagged */}
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                    <span className="material-symbols-outlined">warning</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Why This Quote Was Flagged</h3>
                    <p className="text-xs text-slate-400">Automated policy engine detected 1 severe line-item discount threshold breach.</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-md border border-slate-700">
                  Rule Set: FY26-ENT-CORE-v2
                </span>
              </div>

              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase tracking-wider text-slate-400 bg-slate-900/60">
                  <tr>
                    <th className="px-4 py-3">Line Item & Category</th>
                    <th className="px-4 py-3 text-right">Discount Given</th>
                    <th className="px-4 py-3 text-right">Limit Allowed</th>
                    <th className="px-4 py-3 text-right">Variance / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">Laptop Pro 16"</div>
                      <div className="text-xs text-slate-400">Hardware Tier 1 • Qty 2</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-200">12.0%</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-400">15.0%</td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Compliant (-3.0pt)
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 bg-red-950/20">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white flex items-center gap-2">
                        Custom Onboarding & Migration SLA
                        <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-red-500/20 text-red-400 rounded">Breach</span>
                      </div>
                      <div className="text-xs text-slate-400">Professional Services Tier 3 • Qty 1</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-red-400">28.0%</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-400">20.0%</td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        EXCEEDS LIMIT (+8.0pt)
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Sequential Approval Chain Status */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400">account_tree</span>
                Sequential Approval Governance Chain
              </h3>

              <div className="space-y-4">
                {/* Level 1: Sales Manager */}
                <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">1</span>
                    <div>
                      <div className="font-bold text-white">Level 1: Regional Sales Manager</div>
                      <div className="text-xs text-emerald-400">Approved by Sarah Lin • 2026-09-04 14:22</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-bold rounded bg-emerald-500/20 text-emerald-400">APPROVED</span>
                </div>

                {/* Level 2: VP Deal Desk (Current) */}
                <div className="p-4 rounded-lg bg-indigo-950/40 border border-indigo-500/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold animate-pulse">2</span>
                    <div>
                      <div className="font-bold text-white">Level 2: VP of Deal Desk (You)</div>
                      <div className="text-xs text-indigo-300">Pending your decision • Flagged due to +8pt Services discount</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-bold rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                    PENDING YOUR ACTION
                  </span>
                </div>

                {/* Level 3: CFO Final Signoff */}
                <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold">3</span>
                    <div>
                      <div className="font-bold text-slate-300">Level 3: Finance / CFO Final Signoff</div>
                      <div className="text-xs text-slate-500">Awaiting Level 2 approval completion</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-bold rounded bg-slate-800 text-slate-400">QUEUED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Decision Actions & History */}
          <div className="lg:col-span-4 space-y-6">
            {/* Decision Actions Card */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Record Your Decision</h3>
              <p className="text-xs text-slate-400">Choose an action to advance or return this quotation to the deal desk pipeline.</p>

              {decisionState ? (
                <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-sm space-y-2">
                  <div className="font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    Action Recorded: {decisionState}
                  </div>
                  <p className="text-xs text-emerald-400/80">Quotation has been updated in the sequential approval chain.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => setDecisionModal('Approve')}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-lg shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    Approve Quotation Exception
                  </button>

                  <button
                    onClick={() => setDecisionModal('Return')}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-lg shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">assignment_return</span>
                    Return for Revision with Notes
                  </button>

                  <button
                    onClick={() => setDecisionModal('Reject')}
                    className="w-full py-3 bg-red-600/80 hover:bg-red-600 text-white font-bold text-sm rounded-lg shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">cancel</span>
                    Reject Quotation
                  </button>
                </div>
              )}
            </div>

            {/* Quick Context & Customer Stats */}
            <div className="glass-card p-5 space-y-3 text-xs text-slate-400">
              <div className="font-bold text-white text-sm">Customer Historical Performance</div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Lifetime Value (LTV)</span>
                <span className="text-white font-mono font-semibold">$148,500.00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Payment Reliability</span>
                <span className="text-emerald-400 font-semibold">100% On-Time</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Previous Discount Avg</span>
                <span className="text-slate-300 font-mono">14.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal for Decision Confirmation */}
        {decisionModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-card max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white">
                  Confirm Decision: <span className="text-indigo-400">{decisionModal}</span>
                </h3>
                <button onClick={() => setDecisionModal(null)} className="text-slate-400 hover:text-white">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Manager Rationale & Audit Log Notes <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={`State reason for ${decisionModal.toLowerCase()}ing this discount exception...`}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-800 pt-3">
                <button
                  onClick={() => setDecisionModal(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteDecision}
                  className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow ${
                    decisionModal === 'Approve' ? 'bg-emerald-600 hover:bg-emerald-500' :
                    decisionModal === 'Return' ? 'bg-amber-600 hover:bg-amber-500' :
                    'bg-red-600 hover:bg-red-500'
                  }`}
                >
                  Execute {decisionModal}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
