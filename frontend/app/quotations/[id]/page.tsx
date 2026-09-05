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
            <nav className="flex items-center gap-2 text-label-md mb-2" style={{ color: 'var(--color-outline)' }}>
              <Link href="/quotations" className="flex items-center gap-1 hover:text-[var(--color-on-surface)] transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>receipt_long</span>
                Quotations
              </Link>
              <span style={{ color: 'var(--color-outline-variant)' }}>/</span>
              <span style={{ color: 'var(--color-primary)' }} className="text-headline-sm">{q.quoteNumber}</span>
              <span style={{ color: 'var(--color-outline-variant)' }}>/</span>
              <span style={{ color: 'var(--color-on-surface)' }}>{q.customer?.name}</span>
            </nav>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-headline-lg" style={{ color: 'var(--color-on-surface)' }}>
                Quotation Detail: {q.quoteNumber}
              </h1>
              <span className={`badge ${STATUS_BADGE[q.status] || 'badge-outline'}`}>{q.status?.replace(/_/g, ' ')}</span>
              {q.riskLevel && <span className={`badge ${RISK_BADGE[q.riskLevel]}`}>RISK: {q.riskLevel} ({q.blendedRiskScore})</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {q.portalToken && (
              <Link href={`/portal/${q.portalToken}`} className="btn-ghost">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
                Customer Portal
              </Link>
            )}
            {q.status === 'DRAFT' && (
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
                {submitting ? 'Submitting...' : 'Submit for Approval'}
              </button>
            )}
            {(q.status === 'PENDING_APPROVAL') && (
              <Link href="/approvals" className="btn-secondary">
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
              className="rounded-xl p-5"
              style={{
                background: 'var(--color-surface-container-low)',
                border: '1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)',
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-label-md mb-2" style={{ color: 'var(--color-outline)' }}>CUSTOMER</h3>
                  <p className="text-headline-sm" style={{ color: 'var(--color-on-surface)' }}>{q.customer?.name}</p>
                  <p className="text-body-sm mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>{q.customer?.company}</p>
                  <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{q.customer?.email}</p>
                  <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{q.customer?.phone}</p>
                  {q.customer?.tier && (
                    <span className={`badge mt-2 ${q.customer.tier === 'GOLD' ? 'badge-warning' : q.customer.tier === 'SILVER' ? 'badge-outline' : 'badge-muted'}`}>
                      {q.customer.tier}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-label-md mb-2" style={{ color: 'var(--color-outline)' }}>SALES REP</h3>
                  <p className="text-headline-sm" style={{ color: 'var(--color-on-surface)' }}>{q.salesRep?.fullName}</p>
                  <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{q.salesRep?.email}</p>
                  {q.validUntil && (
                    <div className="mt-3">
                      <h3 className="text-label-md mb-1" style={{ color: 'var(--color-outline)' }}>VALID UNTIL</h3>
                      <p className="text-body-sm" style={{ color: 'var(--color-on-surface)' }}>
                        {new Date(q.validUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-label-md mb-2" style={{ color: 'var(--color-outline)' }}>FINANCIALS</h3>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { label: 'Subtotal', value: q.subtotal },
                      { label: 'Discount', value: -q.discountTotal },
                      { label: 'Tax', value: q.taxTotal },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between">
                        <span className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{item.label}</span>
                        <span className="text-body-sm" style={{ color: item.value < 0 ? 'var(--color-error)' : 'var(--color-on-surface)' }}>
                          {item.value < 0 ? '-' : ''}${Math.abs(item.value || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div style={{ height: '1px', background: 'var(--color-outline-variant)', margin: '0.25rem 0' }} />
                    <div className="flex justify-between">
                      <span className="text-headline-sm" style={{ color: 'var(--color-on-surface)' }}>Grand Total</span>
                      <span className="text-meta-numeric" style={{ color: 'var(--color-primary)' }}>
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
                className="rounded-xl p-4 flex items-start gap-3"
                style={{
                  background: 'color-mix(in srgb, var(--color-error) 10%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--color-error) 30%, transparent)',
                }}
              >
                <span className="material-symbols-outlined" style={{ color: 'var(--color-error)', fontSize: '22px', marginTop: '2px' }}>warning</span>
                <div>
                  <p className="text-headline-sm" style={{ color: 'var(--color-error)' }}>High Risk — Dual Approval Required</p>
                  <p className="text-body-sm mt-0.5" style={{ color: 'var(--color-on-surface-variant)' }}>
                    Blended risk score {q.blendedRiskScore} ≥ 8. Both Manager and Finance approval required before confirmation.
                  </p>
                </div>
              </div>
            )}

            {/* Line Items */}
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: 'var(--color-surface-container-low)',
                border: '1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)',
              }}
            >
              <div className="px-5 py-4" style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)' }}>
                <h2 className="text-headline-sm" style={{ color: 'var(--color-on-surface)' }}>Product Line Items</h2>
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
                            <span style={{ color: 'var(--color-on-surface)' }}>{line.description || `Product #${line.productId}`}</span>
                          </td>
                          <td>
                            <span className={`badge ${line.lineType === 'RECURRING' ? 'badge-confirmed' : 'badge-outline'}`}>
                              {line.lineType === 'RECURRING' ? '🔄 Recurring' : 'One-time'}
                            </span>
                          </td>
                          <td><span className="text-meta-numeric">{line.quantity}</span></td>
                          <td><span className="text-meta-numeric">${line.unitPrice?.toFixed(2)}</span></td>
                          <td>
                            <span className={`badge ${overLimit ? 'badge-error' : 'badge-outline'}`}>
                              {line.discountPct}%
                              {overLimit && <span className="ml-1">⚠</span>}
                            </span>
                            <div className="text-label-sm mt-0.5" style={{ color: 'var(--color-outline)' }}>
                              Allowed: {line.discountAllowed}%
                            </div>
                          </td>
                          <td><span>{line.taxPct}%</span></td>
                          <td>
                            <span className="text-meta-numeric" style={{ color: 'var(--color-on-surface)' }}>
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
              className="rounded-xl p-4"
              style={{
                background: 'var(--color-surface-container-low)',
                border: '1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)',
              }}
            >
              <h3 className="text-headline-sm mb-4" style={{ color: 'var(--color-on-surface)' }}>Approval Chain</h3>
              <div className="flex flex-col gap-3">
                {(q.approvals || []).map((approval: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: approval.status === 'APPROVED' ? 'color-mix(in srgb, var(--color-tertiary) 20%, transparent)' :
                          approval.status === 'REJECTED' ? 'color-mix(in srgb, var(--color-error) 20%, transparent)' :
                          'var(--color-surface-container-high)',
                        color: approval.status === 'APPROVED' ? 'var(--color-tertiary)' :
                          approval.status === 'REJECTED' ? 'var(--color-error)' : 'var(--color-outline)',
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-label-md" style={{ color: 'var(--color-on-surface)' }}>{approval.level}</p>
                      <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                        {approval.approver?.fullName || 'Unassigned'}
                      </p>
                    </div>
                    <span className={`badge ${approval.status === 'APPROVED' ? 'badge-approved' : approval.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending'}`}>
                      {approval.status}
                    </span>
                  </div>
                ))}
                {!(q.approvals?.length) && (
                  <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>No approval chain assigned yet.</p>
                )}
              </div>
              {q.status === 'PENDING_APPROVAL' && (
                <Link href="/approvals" className="btn-secondary w-full justify-center mt-4" style={{ padding: '0.5rem' }}>
                  Go to Approval Queue
                </Link>
              )}
            </div>

            {/* Upsell Recommendations */}
            {upsells.length > 0 && (
              <div
                className="rounded-xl p-4"
                style={{
                  background: 'color-mix(in srgb, var(--color-primary-container) 8%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '18px' }}>auto_awesome</span>
                  <h3 className="text-headline-sm" style={{ color: 'var(--color-primary)' }}>Upsell Recommendations</h3>
                </div>
                {upsells.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-outline-variant) 20%, transparent)' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)', fontSize: '18px' }}>add_shopping_cart</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm" style={{ color: 'var(--color-on-surface)' }}>{item.suggestProduct?.name || `Product #${item.suggestProductId}`}</p>
                      <p className="text-label-sm" style={{ color: 'var(--color-outline)' }}>
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
                className="rounded-xl p-4"
                style={{
                  background: 'color-mix(in srgb, var(--color-tertiary) 8%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--color-tertiary) 20%, transparent)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary)', fontSize: '18px' }}>group</span>
                  <h3 className="text-headline-sm" style={{ color: 'var(--color-tertiary)' }}>Customer Portal</h3>
                </div>
                <p className="text-body-sm mb-3" style={{ color: 'var(--color-on-surface-variant)' }}>
                  Customer can view and negotiate this quotation in real-time.
                </p>
                <Link href={`/portal/${q.portalToken}`} className="btn-ghost w-full justify-center" style={{ padding: '0.5rem', color: 'var(--color-tertiary)', border: '1px solid color-mix(in srgb, var(--color-tertiary) 30%, transparent)' }}>
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
