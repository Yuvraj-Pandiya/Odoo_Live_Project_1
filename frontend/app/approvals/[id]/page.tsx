'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { CheckCircle, ArrowLeft, AlertTriangle, GitPullRequest, Clock, X, RotateCcw } from 'lucide-react';

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
      <div className="space-y-6">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-20 right-8 z-50 bg-[var(--success)] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
            <CheckCircle size={18} />
            <span className="text-sm font-semibold">{toastMsg}</span>
          </div>
        )}

        {/* Back Link & Header */}
        <div className="flex items-center justify-between gap-4">
          <nav className="flex items-center gap-2 body-sm">
            <Link href="/approvals" className="hover:text-[var(--text-primary)] flex items-center gap-1">
              <ArrowLeft size={14} />
              <span>Approvals queue</span>
            </Link>
            <span>/</span>
            <span className="font-mono font-semibold text-[var(--text-primary)]">{qid}</span>
            <span>/</span>
            <span className="text-[var(--accent)] font-medium">Deep inspection</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="badge badge-warning flex items-center gap-1.5">
              <Clock size={12} />
              SLA Target: 4h 12m Remaining
            </span>
          </div>
        </div>

        {/* Executive Banner */}
        <div className="df-card p-8 space-y-6">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="badge badge-danger">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--error)] animate-ping mr-1"></span>
                  Blended Risk: HIGH
                </span>
                <span className="badge badge-indigo">
                  Customer Tier: Gold
                </span>
                <span className="badge badge-muted">
                  Rev 03 • Fast-Track Governance
                </span>
              </div>
              <h1 className="page-heading">
                Approval Detail: {qid} <span className="text-[var(--accent)]">(Acme Corp)</span>
              </h1>
              <p className="body-text mt-1 max-w-2xl">
                Deep inspection of line-item discount breaches, policy thresholds, multi-tier governance status, and audit trail.
              </p>
            </div>

            {/* High Impact Callout Group */}
            <div className="flex items-center gap-6 bg-[var(--canvas)] p-4 rounded-xl border border-[var(--border)] shrink-0">
              <div>
                <div className="section-label">Order value</div>
                <div className="text-3xl font-bold text-[var(--text-primary)]">₹2,643.00</div>
                <div className="body-sm text-[var(--success)] font-semibold">Gross margin: 28.4%</div>
              </div>
              <div className="h-10 w-px bg-[var(--border)]"></div>
              <div>
                <div className="section-label">Max threshold breach</div>
                <div className="text-3xl font-bold text-[var(--error)]">+8.0<span className="text-sm">pt</span></div>
                <div className="body-sm text-[var(--error)] font-semibold">Services Cap Limit</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Diagnostics */}
          <div className="lg:col-span-8 space-y-8">
            {/* Why This Quote Was Flagged */}
            <div className="df-card p-6 space-y-4 !p-0 overflow-hidden">
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--error-subtle)] text-[var(--error)]">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h3 className="section-label text-base text-[var(--text-primary)]">Why this quote was flagged</h3>
                    <p className="body-sm">Automated policy engine detected 1 severe line-item discount threshold breach.</p>
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
                        <div className="font-semibold text-[var(--text-primary)]">Laptop Pro 16&quot;</div>
                        <div className="body-sm">Hardware Tier 1 • Qty 2</div>
                      </td>
                      <td className="text-right font-mono text-[var(--text-secondary)]">12.0%</td>
                      <td className="text-right font-mono text-[var(--text-muted)]">15.0%</td>
                      <td className="text-right">
                        <span className="badge badge-success">
                          Compliant (-3.0pt)
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-[var(--error-subtle)]">
                      <td>
                        <div className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                          Custom Onboarding & Migration SLA
                          <span className="badge badge-danger text-[10px]">Breach</span>
                        </div>
                        <div className="body-sm">Professional Services Tier 3 • Qty 1</div>
                      </td>
                      <td className="text-right font-mono font-bold text-[var(--error)]">28.0%</td>
                      <td className="text-right font-mono text-[var(--text-muted)]">20.0%</td>
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
              <h3 className="section-label text-base text-[var(--text-primary)] flex items-center gap-2">
                <GitPullRequest className="text-[var(--accent)]" size={18} />
                Sequential approval governance chain
              </h3>

              <div className="space-y-4">
                {/* Level 1: Sales Manager */}
                <div className="p-4 rounded-xl bg-[var(--success-subtle)] border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[var(--success)] text-white flex items-center justify-center font-bold">1</span>
                    <div>
                      <div className="font-bold text-[var(--text-primary)]">Level 1: Regional Sales Manager</div>
                      <div className="body-sm text-[var(--success)] font-semibold">Approved by Sarah Lin • 2026-09-04 14:22</div>
                    </div>
                  </div>
                  <span className="badge badge-success">APPROVED</span>
                </div>

                {/* Level 2: VP Deal Desk (Current) */}
                <div className="p-4 rounded-xl bg-[var(--accent-subtle)] border border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold">2</span>
                    <div>
                      <div className="font-bold text-[var(--text-primary)]">Level 2: VP of Deal Desk (You)</div>
                      <div className="body-sm text-[var(--accent)] font-semibold">Pending your decision • Flagged due to +8pt Services discount</div>
                    </div>
                  </div>
                  <span className="badge badge-indigo font-bold">
                    PENDING YOUR ACTION
                  </span>
                </div>

                {/* Level 3: CFO Final Signoff */}
                <div className="p-4 rounded-xl bg-[var(--canvas)] border border-[var(--border)] flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] flex items-center justify-center font-bold">3</span>
                    <div>
                      <div className="font-bold text-[var(--text-primary)]">Level 3: Finance / CFO Final Signoff</div>
                      <div className="body-sm">Awaiting Level 2 approval completion</div>
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
              <h3 className="section-label text-base text-[var(--text-primary)]">Record your decision</h3>
              <p className="body-sm">Choose an action to advance or return this quotation to the deal desk pipeline.</p>

              {decisionState ? (
                <div className="p-4 rounded-xl bg-[var(--success-subtle)] border border-emerald-200 text-[var(--success)] text-sm space-y-2">
                  <div className="font-bold flex items-center gap-2">
                    <CheckCircle size={18} />
                    Action Recorded: {decisionState}
                  </div>
                  <p className="body-sm text-[var(--success)]">Quotation has been updated in the sequential approval chain.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => setDecisionModal('Approve')}
                    className="btn-primary w-full py-3 justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    <span>Approve Quotation Exception</span>
                  </button>

                  <button
                    onClick={() => setDecisionModal('Return')}
                    className="btn-secondary w-full py-3 justify-center gap-2 text-amber-700 border-amber-300 hover:bg-amber-50"
                  >
                    <RotateCcw size={18} />
                    <span>Return for Revision with Notes</span>
                  </button>

                  <button
                    onClick={() => setDecisionModal('Reject')}
                    className="btn-danger w-full py-3 justify-center gap-2"
                  >
                    <X size={18} />
                    <span>Reject Quotation</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Context & Customer Stats */}
            <div className="df-card p-5 space-y-3 body-sm">
              <div className="section-label mb-2 text-[var(--text-primary)]">Customer historical performance</div>
              <div className="flex justify-between py-1 border-b border-[var(--border)]">
                <span className="body-sm">Lifetime Value (LTV)</span>
                <span className="text-[var(--text-primary)] font-mono font-semibold">₹148,500.00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border)]">
                <span className="body-sm">Payment Reliability</span>
                <span className="text-[var(--success)] font-semibold">100% On-Time</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="body-sm">Previous Discount Avg</span>
                <span className="text-[var(--text-primary)] font-mono">14.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal for Decision Confirmation */}
        {decisionModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="df-card max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h3 className="section-label text-lg text-[var(--text-primary)]">
                  Confirm decision: <span className="text-[var(--accent)]">{decisionModal}</span>
                </h3>
                <button onClick={() => setDecisionModal(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <X size={18} />
                </button>
              </div>

              <div>
                <label className="section-label block mb-1.5">
                  Manager Rationale & Audit Log Notes <span className="text-[var(--error)]">*</span>
                </label>
                <textarea
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={`State reason for ${decisionModal.toLowerCase()}ing this discount exception...`}
                  className="w-full text-sm p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
                <button
                  onClick={() => setDecisionModal(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteDecision}
                  className={`btn-primary ${
                    decisionModal === 'Return' ? 'bg-amber-600 border-amber-600 hover:bg-amber-700' :
                    decisionModal === 'Reject' ? 'btn-danger' : ''
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
