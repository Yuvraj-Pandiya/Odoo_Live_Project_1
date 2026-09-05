'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { CheckCircle, RefreshCw, Sliders, Download, Wallet, Calendar, CreditCard, Layers, Clock, X } from 'lucide-react';

export default function SubscriptionDetailPage() {
  const params = useParams();
  const subId = (params?.id as string) || 'SUB-9804-ACME';
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyNotes, setModifyNotes] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed top-20 right-8 z-50 bg-[var(--success)] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
            <CheckCircle size={18} />
            <span className="text-sm font-semibold">{toastMsg}</span>
          </div>
        )}

        {/* Breadcrumb & Status */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="flex items-center gap-2 body-sm">
            <Link href="/subscriptions" className="hover:text-[var(--text-primary)] flex items-center gap-1">
              <RefreshCw size={14} />
              <span>Subscriptions</span>
            </Link>
            <span>/</span>
            <span className="font-medium text-[var(--text-primary)]">Acme Corp</span>
            <span>/</span>
            <span className="text-[var(--accent)] font-semibold">{subId}</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="badge badge-success">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse mr-1"></span>
              ACTIVE CONTRACT
            </span>
            <span className="font-mono text-xs text-[var(--text-secondary)] bg-[var(--canvas)] px-2.5 py-1 rounded-md border border-[var(--border)] font-medium">
              ORD-2024-8841
            </span>
          </div>
        </div>

        {/* Header Title & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 section-label text-[var(--accent)]">
              <span>Recurring Governance & Cadence</span>
              <span>•</span>
              <span className="text-[var(--text-muted)]">Originating Quote #QT-2024-4091-R2</span>
            </div>
            <h1 className="page-heading mt-1">Billing Detail: Acme Corp - Care Plan 2yr</h1>
            <p className="body-text mt-1 max-w-3xl">
              Originating contract breakdown, one-time procurement lines, and active recurring cadence schedule with proration support.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModifyModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Sliders size={16} />
              <span>Modify Subscription</span>
            </button>
            <button
              onClick={() => triggerToast('Statement PDF downloaded to desktop.')}
              className="btn-secondary flex items-center gap-2"
            >
              <Download size={16} />
              <span>Statement PDF</span>
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="df-card p-5 space-y-2">
            <div className="flex items-center justify-between section-label">
              <span>Total Contract Value</span>
              <Wallet className="text-[var(--accent)]" size={18} />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">₹2,730.00 <span className="text-xs font-semibold text-[var(--success)]">INR</span></div>
            <div className="body-sm text-[var(--text-muted)] flex items-center gap-1">
              <CheckCircle className="text-[var(--success)]" size={12} />
              Includes one-time CapEx + MRR
            </div>
          </div>

          <div className="df-card p-5 space-y-2">
            <div className="flex items-center justify-between section-label">
              <span>Recurring MRR</span>
              <RefreshCw className="text-[var(--success)]" size={18} />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">₹46.00 <span className="text-sm font-normal text-[var(--text-muted)]">/ mo</span></div>
            <div className="body-sm text-[var(--success)] flex items-center gap-1 font-medium">
              +₹300/qtr SLA Tier
            </div>
          </div>

          <div className="df-card p-5 space-y-2">
            <div className="flex items-center justify-between section-label">
              <span>Next Charge Date</span>
              <Calendar className="text-purple-600" size={18} />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">Sep 15, 2026</div>
            <div className="body-sm text-[var(--accent)] flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping"></span>
              Auto-debit in 10 days
            </div>
          </div>

          <div className="df-card p-5 space-y-2">
            <div className="flex items-center justify-between section-label">
              <span>Payment Method</span>
              <CreditCard className="text-[var(--text-muted)]" size={18} />
            </div>
            <div className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[var(--accent-subtle)] text-xs text-[var(--accent)] border border-[var(--border)] font-semibold">ACH</span>
              Direct Debit (•••• 8821)
            </div>
            <div className="body-sm text-[var(--success)] flex items-center gap-1 font-medium">
              <CheckCircle size={12} />
              Pre-authorized Mandate Active
            </div>
          </div>
        </div>

        {/* Customer Context Card */}
        <div className="df-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] border border-[var(--border)] flex items-center justify-center font-bold text-[var(--accent)] text-xl">
              AC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="section-label text-base text-[var(--text-primary)]">Acme Corporation Inc.</h3>
                <span className="badge badge-muted">ACM-88402</span>
              </div>
              <p className="body-sm mt-0.5">Enterprise Tier • Managed Accounts Portfolio • AE: Sarah Lin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="body-sm">
              Contract Term: <strong className="text-[var(--text-primary)] font-mono">24 Months</strong> (Expires Sep 2028)
            </div>
          </div>
        </div>

        {/* Contract Line Segregation (One-Time CapEx vs Recurring OpEx) */}
        <div className="df-card p-6 space-y-4 !p-0 overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <h3 className="section-label text-base text-[var(--text-primary)] flex items-center gap-2">
                <Layers className="text-[var(--accent)]" size={18} />
                Contract line segregation (Hybrid engine)
              </h3>
              <p className="body-sm">One-time procurement lines vs monthly/quarterly recurring subscriptions</p>
            </div>
            <span className="badge badge-indigo">
              Proration Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="df-table">
              <thead>
                <tr>
                  <th>Line item</th>
                  <th className="text-center">Type</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Unit Price</th>
                  <th className="text-center">Cadence</th>
                  <th className="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-semibold text-[var(--text-primary)]">Hardware: Industrial Gateway Gen-3</td>
                  <td className="text-center">
                    <span className="badge badge-muted">One-Time</span>
                  </td>
                  <td className="text-right font-mono text-[var(--text-secondary)]">2</td>
                  <td className="text-right font-mono text-[var(--text-secondary)]">₹1,200.00</td>
                  <td className="text-center body-sm">—</td>
                  <td className="text-right font-mono font-semibold text-[var(--text-primary)]">₹2,400.00</td>
                </tr>
                <tr>
                  <td className="font-semibold text-[var(--text-primary)]">Cloud IoT Platform Enterprise License</td>
                  <td className="text-center">
                    <span className="badge badge-success">Recurring</span>
                  </td>
                  <td className="text-right font-mono text-[var(--text-secondary)]">1</td>
                  <td className="text-right font-mono text-[var(--text-secondary)]">₹46.00</td>
                  <td className="text-center font-semibold text-[var(--accent)]">Monthly</td>
                  <td className="text-right font-mono font-semibold text-[var(--success)]">₹46.00 / mo</td>
                </tr>
                <tr>
                  <td className="font-semibold text-[var(--text-primary)]">24/7 Platinum SLA & Dedicated CSM</td>
                  <td className="text-center">
                    <span className="badge badge-success">Recurring</span>
                  </td>
                  <td className="text-right font-mono text-[var(--text-secondary)]">1</td>
                  <td className="text-right font-mono text-[var(--text-secondary)]">₹300.00</td>
                  <td className="text-center font-semibold text-purple-600">Quarterly</td>
                  <td className="text-right font-mono font-semibold text-[var(--success)]">₹300.00 / qtr</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Proration Timeline */}
        <div className="df-card p-6 space-y-4">
          <h3 className="section-label text-base text-[var(--text-primary)] flex items-center gap-2">
            <Clock className="text-[var(--success)]" size={18} />
            Upcoming billing & renewal schedule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[var(--canvas)] border border-[var(--border)] space-y-2">
              <div className="section-label text-xs">Sep 15, 2026</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">₹46.00 INR</div>
              <div className="body-sm">Monthly Cloud License charge</div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--canvas)] border border-[var(--border)] space-y-2">
              <div className="section-label text-xs">Oct 15, 2026</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">₹346.00 INR</div>
              <div className="body-sm">Monthly Cloud (₹46) + Quarterly SLA (₹300)</div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--canvas)] border border-[var(--border)] space-y-2">
              <div className="section-label text-xs">Nov 15, 2026</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">₹46.00 INR</div>
              <div className="body-sm">Monthly Cloud License charge</div>
            </div>
          </div>
        </div>

        {/* Modify Modal */}
        {showModifyModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="df-card max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h3 className="section-label text-lg text-[var(--text-primary)]">Modify subscription plan</h3>
                <button onClick={() => setShowModifyModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="section-label block mb-1.5">Adjustment action</label>
                  <select className="w-full text-sm p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)]">
                    <option>Add Seats (+10 users @ ₹15/mo)</option>
                    <option>Upgrade to Platinum SLA</option>
                    <option>Pause Recurring Billing (Temporary 30 Days)</option>
                    <option>Cancel Subscription at Term End</option>
                  </select>
                </div>
                <div>
                  <label className="section-label block mb-1.5">Proration effective date</label>
                  <input type="date" defaultValue="2026-09-15" className="w-full text-sm p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)]" />
                </div>
                <div>
                  <label className="section-label block mb-1.5">Notes / Reason for amendment</label>
                  <textarea
                    rows={3}
                    value={modifyNotes}
                    onChange={(e) => setModifyNotes(e.target.value)}
                    placeholder="Provide details for deal desk audit log..."
                    className="w-full text-sm p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4">
                <button
                  onClick={() => setShowModifyModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowModifyModal(false);
                    triggerToast('Subscription amendment recorded and proration applied.');
                  }}
                  className="btn-primary"
                >
                  Confirm Amendment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
