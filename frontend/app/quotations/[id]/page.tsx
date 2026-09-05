'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { quotationApi, productApi } from '@/lib/api';

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'badge-draft', PENDING_APPROVAL: 'badge-pending', APPROVED: 'badge-approved',
  REJECTED: 'badge-rejected', NEGOTIATION: 'badge-negotiation', CONFIRMED: 'badge-confirmed',
  FULFILLED: 'badge-approved', CANCELLED: 'badge-rejected',
};
const RISK_BADGE: Record<string, string> = { HIGH: 'risk-high', MEDIUM: 'risk-medium', LOW: 'risk-low' };

const MOCK_QUOTATION = {
  id: 1, quoteNumber: 'Q-1042', status: 'PENDING_APPROVAL',
  grandTotal: 2581.00, subtotal: 2450.00, taxTotal: 441.00, discountTotal: 310.00,
  currency: 'USD', blendedRiskScore: 8.5, riskLevel: 'HIGH', notes: '',
  validUntil: '2026-10-01',
  customer: { id: 1, name: 'Acme Corp', email: 'portal@acmecorp.com', tier: 'GOLD', company: 'Acme Corp Ltd', phone: '+91-9876543210' },
  salesRep: { id: 4, fullName: 'J. Rao', email: 'rep1@dealflow360.com' },
  lines: [
    { id: 1, productId: 1, description: 'Laptop Pro 14 — 14" professional laptop, 16GB RAM', lineType: 'ONE_TIME', quantity: 2, unitPrice: 1200.00, costPrice: 750.00, discountPct: 12, discountAllowed: 15, taxPct: 15, lineTotal: 2112.00, marginAmount: 660.00, marginPct: 31.25 },
    { id: 2, productId: 2, description: 'Onsite Setup Service', lineType: 'ONE_TIME', quantity: 1, unitPrice: 450.00, costPrice: 50.00, discountPct: 18, discountAllowed: 10, taxPct: 18, lineTotal: 369.00, marginAmount: 319.00, marginPct: 86.45 },
    { id: 3, productId: 6, description: 'Extended Warranty — 1-year hardware warranty', lineType: 'RECURRING', quantity: 1, unitPrice: 20.00, costPrice: 3.00, discountPct: 10, discountAllowed: 15, taxPct: 18, lineTotal: 18.00, marginAmount: 15.00, marginPct: 83.33 },
  ],
  approvals: [
    { level: 'MANAGER', status: 'PENDING', approver: null },
    { level: 'FINANCE', status: 'PENDING', approver: null },
  ],
  portalToken: 'demo-token-1042',
};

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [quotation, setQuotation] = useState<any>(MOCK_QUOTATION);
  const [upsells, setUpsells] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('dealflow_token')) {
      router.push('/login'); return;
    }
    if (!isNaN(id) && id !== 0) {
      quotationApi.get(id).then((r) => { if (r.data) setQuotation(r.data); }).catch(() => {});
      productApi.upsell([1, 3]).then((r) => setUpsells(r.data?.slice(0, 3) || [])).catch(() => {});
    }
    setLoading(false);
  }, [id, router]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try { await quotationApi.submit(id); setQuotation((q: any) => ({ ...q, status: 'PENDING_APPROVAL' })); }
    catch { } finally { setSubmitting(false); }
  };

  const q = quotation;
  if (loading) {
    return <AppLayout><div className="df-page-container flex items-center justify-center min-h-[50vh]">
      <span className="material-symbols-outlined animate-spin text-headline-lg" style={{ color: 'var(--color-primary)' }}>refresh</span>
    </div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="df-page-container flex flex-col" style={{ gap: 'var(--space-xl)' }}>
        {/* ── Breadcrumb + Header ────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-subheading mb-2 text-slate-500">
              <Link href="/quotations" className="flex items-center gap-1 hover:text-slate-900 transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>receipt_long</span>
                Quotations
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-indigo-600 font-semibold">{q.quoteNumber}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800">{q.customer?.name}</span>
            </nav>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-heading-1 text-slate-900">
                Quotation Detail: {q.quoteNumber}
              </h1>
              <span className={`badge ${STATUS_BADGE[q.status] || 'badge-outline'}`}>{q.status?.replace(/_/g, ' ')}</span>
              {q.riskLevel && <span className={`badge ${RISK_BADGE[q.riskLevel]}`}>RISK: {q.riskLevel} ({q.blendedRiskScore})</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {q.portalToken && (
              <Link href={`/portal/${q.portalToken}`} className="btn-ghost text-body-base">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
                Customer Portal
              </Link>
            )}
            {q.status === 'DRAFT' && (
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary text-body-base">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
                {submitting ? 'Submitting...' : 'Submit for Approval'}
              </button>
            )}
            {(q.status === 'PENDING_APPROVAL') && (
              <Link href="/approvals" className="btn-secondary text-body-base">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>approval</span>
                View Approval Queue
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* ── Main Content ───────────────────────────────────── */}
          <div className="xl:col-span-3 flex flex-col gap-6">
            {/* Customer + Financials Card */}
            <div
              className="rounded-xl p-6 bg-white border border-slate-200 shadow-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-subheading text-slate-500 mb-2 uppercase tracking-wider">CUSTOMER</h3>
                  <p className="text-heading-3 text-slate-900">{q.customer?.name}</p>
                  <p className="text-body-base text-slate-600 mt-0.5">{q.customer?.company}</p>
                  <p className="text-body-base text-slate-600">{q.customer?.email}</p>
                  <p className="text-body-base text-slate-600">{q.customer?.phone}</p>
                  {q.customer?.tier && (
                    <span className={`badge mt-2 ${q.customer.tier === 'GOLD' ? 'badge-warning' : q.customer.tier === 'SILVER' ? 'badge-outline' : 'badge-muted'}`}>
                      {q.customer.tier}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-subheading text-slate-500 mb-2 uppercase tracking-wider">SALES REP</h3>
                  <p className="text-heading-3 text-slate-900">{q.salesRep?.fullName}</p>
                  <p className="text-body-base text-slate-600">{q.salesRep?.email}</p>
                  {q.validUntil && (
                    <div className="mt-3">
                      <h3 className="text-subheading text-slate-500 mb-1 uppercase tracking-wider">VALID UNTIL</h3>
                      <p className="text-body-base text-slate-800">
                        {new Date(q.validUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-subheading text-slate-500 mb-2 uppercase tracking-wider">FINANCIALS</h3>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { label: 'Subtotal', value: q.subtotal },
                      { label: 'Discount', value: -q.discountTotal },
                      { label: 'Tax', value: q.taxTotal },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between">
                        <span className="text-body-base text-slate-600">{item.label}</span>
                        <span className="text-body-base" style={{ color: item.value < 0 ? '#dc2626' : '#0f172a' }}>
                          {item.value < 0 ? '-' : ''}${Math.abs(item.value || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="h-px bg-slate-200 my-1" />
                    <div className="flex justify-between items-center">
                      <span className="text-heading-3 text-slate-900">Grand Total</span>
                      <span className="text-display text-slate-900">
                        ${(q.grandTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Warning */}
            {q.riskLevel === 'HIGH' && (
              <div
                className="rounded-xl p-4 flex items-start gap-3 bg-red-50 border border-red-200"
              >
                <span className="material-symbols-outlined text-red-600 shrink-0 mt-0.5" style={{ fontSize: '22px' }}>warning</span>
                <div>
                  <p className="text-heading-3 text-red-700">High Risk — Dual Approval Required</p>
                  <p className="text-body-base text-red-600 mt-0.5">
                    Blended risk score {q.blendedRiskScore} ≥ 8. Both Manager and Finance approval required before confirmation.
                  </p>
                </div>
              </div>
            )}

            {/* Line Items */}
            <div
              className="rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xs"
            >
              <div className="px-5 py-4 border-b border-slate-200">
                <h2 className="text-heading-2 text-slate-900">Product Line Items</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="df-table">
                  <thead>
                    <tr>
                      <th>Product / Description</th>
                      <th>Type</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Discount</th>
                      <th>Tax</th>
                      <th>Line Total</th>
                      <th>Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(q.lines || q.quotationLines || []).map((line: any) => {
                      const overLimit = line.discountPct > line.discountAllowed;
                      return (
                        <tr key={line.id} style={{ cursor: 'default' }}>
                          <td style={{ minWidth: '200px' }}>
                            <span className="text-slate-900 font-medium">{line.description || `Product #${line.productId}`}</span>
                          </td>
                          <td>
                            <span className={`badge ${line.lineType === 'RECURRING' ? 'badge-confirmed' : 'badge-outline'}`}>
                              {line.lineType === 'RECURRING' ? '🔄 Recurring' : 'One-time'}
                            </span>
                          </td>
                          <td><span>{line.quantity}</span></td>
                          <td><span>${line.unitPrice?.toFixed(2)}</span></td>
                          <td>
                            <span className={`badge ${overLimit ? 'badge-error' : 'badge-outline'}`}>
                              {line.discountPct}%
                              {overLimit && <span className="ml-1">⚠</span>}
                            </span>
                            <div className="text-caption mt-0.5 text-slate-400">
                              Allowed: {line.discountAllowed}%
                            </div>
                          </td>
                          <td><span>{line.taxPct}%</span></td>
                          <td>
                            <span className="font-semibold text-slate-900">
                              ${line.lineTotal?.toFixed(2)}
                            </span>
                          </td>
                          <td>
                            {line.marginPct != null && (
                              <span className={`badge ${line.marginPct >= 30 ? 'badge-success' : line.marginPct >= 15 ? 'badge-pending' : 'badge-error'}`}>
                                {line.marginPct?.toFixed(1)}%
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Sidebar Panel ──────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {/* Approval Chain */}
            <div
              className="rounded-xl p-5 bg-white border border-slate-200 shadow-xs"
            >
              <h3 className="text-heading-3 text-slate-900 mb-4">Approval Chain</h3>
              <div className="flex flex-col gap-3">
                {(q.approvals || []).map((approval: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: approval.status === 'APPROVED' ? '#dcfce7' :
                          approval.status === 'REJECTED' ? '#fee2e2' :
                          '#f1f5f9',
                        color: approval.status === 'APPROVED' ? '#15803d' :
                          approval.status === 'REJECTED' ? '#b91c1c' : '#64748b',
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-subheading text-slate-900">{approval.level}</p>
                      <p className="text-body-base text-slate-500">
                        {approval.approver?.fullName || 'Unassigned'}
                      </p>
                    </div>
                    <span className={`badge ${approval.status === 'APPROVED' ? 'badge-approved' : approval.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending'}`}>
                      {approval.status}
                    </span>
                  </div>
                ))}
                {!(q.approvals?.length) && (
                  <p className="text-body-base text-slate-500">No approval chain assigned yet.</p>
                )}
              </div>
              {q.status === 'PENDING_APPROVAL' && (
                <Link href="/approvals" className="btn-secondary w-full justify-center mt-4 text-body-base" style={{ padding: '0.5rem' }}>
                  Go to Approval Queue
                </Link>
              )}
            </div>

            {/* Upsell Recommendations */}
            {upsells.length > 0 && (
              <div
                className="rounded-xl p-5 bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-indigo-600" style={{ fontSize: '18px' }}>auto_awesome</span>
                  <h3 className="text-heading-3 text-slate-900">Upsell Recommendations</h3>
                </div>
                {upsells.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-slate-200 last:border-0">
                    <span className="material-symbols-outlined text-slate-500" style={{ fontSize: '18px' }}>add_shopping_cart</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-base text-slate-900 font-medium">{item.suggestProduct?.name || `Product #${item.suggestProductId}`}</p>
                      <p className="text-caption text-slate-500">
                        ${item.suggestProduct?.basePrice?.toFixed(2) || '—'}/unit
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Portal Link */}
            {q.portalToken && (
              <div
                className="rounded-xl p-5 bg-emerald-50 border border-emerald-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-emerald-700" style={{ fontSize: '18px' }}>group</span>
                  <h3 className="text-heading-3 text-emerald-900">Customer Portal</h3>
                </div>
                <p className="text-body-base text-emerald-800 mb-3">
                  Customer can view and negotiate this quotation in real-time.
                </p>
                <Link href={`/portal/${q.portalToken}`} className="btn-ghost w-full justify-center text-emerald-700 border-emerald-300 hover:bg-emerald-100" style={{ padding: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
                  Open Portal
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
