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
          <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
            <span className="material-symbols-outlined">check_circle</span>
            <span className="text-sm font-semibold">{toastMsg}</span>
          </div>
        )}

        {/* Back Link & Header */}
        <div className="flex items-center justify-between gap-4">
          <nav className="flex items-center gap-2 type-body-base text-slate-500 dark:text-slate-400">
            <Link href="/approvals" className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Approvals Queue</span>
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-mono font-semibold">{qid}</span>
            <span>/</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">Deep Inspection</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="badge badge-warning flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs">history</span>
              SLA Target: 4h 12m Remaining
            </span>
          </div>
        </div>

        {/* Executive Banner */}
        <div className="df-card p-8 space-y-6 relative overflow-hidden">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="badge badge-danger">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping mr-1"></span>
                  Blended Risk: HIGH
                </span>
                <span className="badge badge-indigo">
                  Customer Tier: Gold
                </span>
                <span className="badge badge-muted">
                  Rev 03 • Fast-Track Governance
                </span>
              </div>
              <h1 className="text-heading-1 font-bold text-slate-900 dark:text-white">
                Approval Detail: {qid} <span className="text-indigo-600 dark:text-indigo-400">(Acme Corp)</span>
              </h1>
              <p className="type-body-base text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                Deep inspection of line-item discount breaches, policy thresholds, multi-tier governance status, and audit trail.
              </p>
            </div>

            {/* High Impact Callout Group */}
            <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
              <div>
                <div className="type-subheading text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Order Value</div>
                <div className="text-display font-bold text-slate-900 dark:text-white">$2,643.00</div>
                <div className="type-body-base text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Gross Margin: 28.4%</div>
              </div>
              <div className="h-10 w-px bg-slate-200 dark:bg-slate-800"></div>
              <div>
                <div className="type-subheading text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Max Threshold Breach</div>
                <div className="text-display font-bold text-rose-600 dark:text-rose-400">+8.0<span className="text-sm">pt</span></div>
                <div className="type-body-base text-xs text-rose-600 dark:text-rose-400 font-semibold">Services Cap Limit</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Diagnostics */}
          <div className="lg:col-span-8 space-y-8">
            {/* Why This Quote Was Flagged */}
            <div className="df-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                    <span className="material-symbols-outlined">warning</span>
                  </div>
                  <div>
                    <h3 className="text-heading-3 font-bold text-slate-900 dark:text-white">Why This Quote Was Flagged</h3>
                    <p className="type-body-base text-xs text-slate-500 dark:text-slate-400">Automated policy engine detected 1 severe line-item discount threshold breach.</p>
                  </div>
                </div>
                <span className="badge badge-muted font-mono">
                  Rule Set: FY26-ENT-CORE-v2
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="df-table">
                  <thead>
                    <tr>
                      <th>Line Item & Category</th>
                      <th className="text-right">Discount Given</th>
                      <th className="text-right">Limit Allowed</th>
                      <th className="text-right">Variance / Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="font-semibold text-slate-900 dark:text-white">Laptop Pro 16&quot;</div>
                        <div className="type-body-base text-xs text-slate-500 dark:text-slate-400">Hardware Tier 1 • Qty 2</div>
                      </td>
                      <td className="text-right font-mono text-slate-700 dark:text-slate-300">12.0%</td>
                      <td className="text-right font-mono text-slate-400 dark:text-slate-500">15.0%</td>
                      <td className="text-right">
                        <span className="badge badge-success">
                          Compliant (-3.0pt)
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-rose-50/50 dark:bg-rose-950/20">
                      <td>
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          Custom Onboarding & Migration SLA
                          <span className="badge badge-danger text-[10px]">Breach</span>
                        </div>
                        <div className="type-body-base text-xs text-slate-500 dark:text-slate-400">Professional Services Tier 3 • Qty 1</div>
                      </td>
                      <td className="text-right font-mono font-bold text-rose-600 dark:text-rose-400">28.0%</td>
                      <td className="text-right font-mono text-slate-400 dark:text-slate-500">20.0%</td>
                      <td className="text-right">
                        <span className="badge badge-danger font-bold">
                          EXCEEDS LIMIT (+8.0pt)
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sequential Approval Chain Status */}
            <div className="df-card p-6 space-y-4">
              <h3 className="text-heading-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">account_tree</span>
                Sequential Approval Governance Chain
              </h3>

              <div className="space-y-4">
                {/* Level 1: Sales Manager */}
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">1</span>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Level 1: Regional Sales Manager</div>
                      <div className="type-body-base text-xs text-emerald-600 dark:text-emerald-400">Approved by Sarah Lin • 2026-09-04 14:22</div>
                    </div>
                  </div>
                  <span className="badge badge-success">APPROVED</span>
                </div>

                {/* Level 2: VP Deal Desk (Current) */}
                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold animate-pulse">2</span>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">Level 2: VP of Deal Desk (You)</div>
                      <div className="type-body-base text-xs text-indigo-600 dark:text-indigo-300">Pending your decision • Flagged due to +8pt Services discount</div>
                    </div>
                  </div>
                  <span className="badge badge-indigo font-bold">
                    PENDING YOUR ACTION
                  </span>
                </div>

                {/* Level 3: CFO Final Signoff */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold">3</span>
                    <div>
                      <div className="font-bold text-slate-700 dark:text-slate-300">Level 3: Finance / CFO Final Signoff</div>
                      <div className="type-body-base text-xs text-slate-400 dark:text-slate-500">Awaiting Level 2 approval completion</div>
                    </div>
                  </div>
                  <span className="badge badge-muted">QUEUED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Decision Actions & History */}
          <div className="lg:col-span-4 space-y-6">
            {/* Decision Actions Card */}
            <div className="df-card p-6 space-y-4">
              <h3 className="text-heading-3 font-bold text-slate-900 dark:text-white">Record Your Decision</h3>
              <p className="type-body-base text-xs text-slate-500 dark:text-slate-400">Choose an action to advance or return this quotation to the deal desk pipeline.</p>

              {decisionState ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm space-y-2">
                  <div className="font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    Action Recorded: {decisionState}
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400/80">Quotation has been updated in the sequential approval chain.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => setDecisionModal('Approve')}
                    className="btn-primary w-full py-3 justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>Approve Quotation Exception</span>
                  </button>

                  <button
                    onClick={() => setDecisionModal('Return')}
                    className="btn-secondary w-full py-3 justify-center gap-2 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  >
                    <span className="material-symbols-outlined">assignment_return</span>
                    <span>Return for Revision with Notes</span>
                  </button>

                  <button
                    onClick={() => setDecisionModal('Reject')}
                    className="btn-secondary w-full py-3 justify-center gap-2 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <span className="material-symbols-outlined">cancel</span>
                    <span>Reject Quotation</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Context & Customer Stats */}
            <div className="df-card p-5 space-y-3 type-body-base text-xs text-slate-500 dark:text-slate-400">
              <div className="font-bold text-slate-900 dark:text-white text-sm">Customer Historical Performance</div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Lifetime Value (LTV)</span>
                <span className="text-slate-900 dark:text-white font-mono font-semibold">$148,500.00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Payment Reliability</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100% On-Time</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Previous Discount Avg</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono">14.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal for Decision Confirmation */}
        {decisionModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="df-card max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-heading-3 font-bold text-slate-900 dark:text-white">
                  Confirm Decision: <span className="text-indigo-600 dark:text-indigo-400">{decisionModal}</span>
                </h3>
                <button onClick={() => setDecisionModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div>
                <label className="type-subheading block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Manager Rationale & Audit Log Notes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={`State reason for ${decisionModal.toLowerCase()}ing this discount exception...`}
                  className="df-input w-full text-sm"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
                <button
                  onClick={() => setDecisionModal(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteDecision}
                  className={`btn-primary ${
                    decisionModal === 'Return' ? 'bg-amber-600 hover:bg-amber-500' :
                    decisionModal === 'Reject' ? 'bg-rose-600 hover:bg-rose-500' : ''
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
