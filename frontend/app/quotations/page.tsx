'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { quotationApi } from '@/lib/api';

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'badge-draft',
  PENDING_APPROVAL: 'badge-pending',
  APPROVED: 'badge-approved',
  REJECTED: 'badge-rejected',
  NEGOTIATION: 'badge-negotiation',
  CONFIRMED: 'badge-confirmed',
  FULFILLED: 'badge-approved',
  CANCELLED: 'badge-rejected',
};
const RISK_BADGE: Record<string, string> = {
  HIGH: 'risk-high',
  MEDIUM: 'risk-medium',
  LOW: 'risk-low',
};
const TIER_COLOR: Record<string, string> = {
  GOLD: '#ffc85a',
  SILVER: 'var(--color-on-surface-variant)',
  BRONZE: '#cd7f32',
};

const MOCK_QUOTATIONS = [
  { id: 1, quoteNumber: 'Q-1042', status: 'PENDING_APPROVAL', grandTotal: 2581.00, riskLevel: 'HIGH', blendedRiskScore: 8.5, customer: { name: 'Acme Corp', tier: 'GOLD' }, salesRep: { fullName: 'J. Rao' }, lastActivityAt: '2026-09-03T10:00:00Z' },
  { id: 2, quoteNumber: 'Q-1039', status: 'PENDING_APPROVAL', grandTotal: 1974.00, riskLevel: 'MEDIUM', blendedRiskScore: 5.2, customer: { name: 'Beta Industries', tier: 'SILVER' }, salesRep: { fullName: 'J. Rao' }, lastActivityAt: '2026-09-01T09:00:00Z' },
  { id: 3, quoteNumber: 'Q-1035', status: 'APPROVED', grandTotal: 413.00, riskLevel: 'LOW', blendedRiskScore: 0, customer: { name: 'Nova Retail', tier: 'BRONZE' }, salesRep: { fullName: 'S. Kumar' }, lastActivityAt: '2026-09-02T14:00:00Z' },
  { id: 4, quoteNumber: 'Q-1030', status: 'CONFIRMED', grandTotal: 16854.00, riskLevel: 'LOW', blendedRiskScore: 2.1, customer: { name: 'Zenith Co', tier: 'GOLD' }, salesRep: { fullName: 'S. Kumar' }, lastActivityAt: '2026-08-26T11:00:00Z' },
];

const STATUS_GROUPS = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'NEGOTIATION', 'CONFIRMED', 'FULFILLED'];

export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<any[]>(MOCK_QUOTATIONS);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('dealflow_token')) {
      router.push('/login'); return;
    }
    quotationApi.list().then((r) => {
      if (r.data && r.data.length) setQuotations(r.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  const filtered = quotations.filter((q) => {
    const matchStatus = filter === 'ALL' || q.status === filter;
    const matchSearch = !search || q.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.customer?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts: Record<string, number> = {};
  quotations.forEach((q) => { counts[q.status] = (counts[q.status] || 0) + 1; });

  return (
    <AppLayout>
      <div className="df-page-container flex flex-col" style={{ gap: 'var(--space-xl)' }}>
        {/* ── Page Header ───────────────────────────────────────── */}
        <div
          className="w-full"
          style={{
            background: 'var(--color-surface-container-lowest)',
            margin: 'calc(-1 * var(--space-xl)) calc(-1 * var(--space-lg)) 0',
            padding: 'var(--space-lg) var(--space-lg)',
            borderBottom: '1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)',
            width: 'calc(100% + 2 * var(--space-lg))',
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-headline-lg" style={{ color: 'var(--color-on-surface)' }}>Quotations</h1>
                <span className="badge badge-primary">CPQ CORE</span>
              </div>
              <p className="text-body-md mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
                Every quotation in the system — click a row to open it
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3" style={{ color: 'var(--color-outline)', fontSize: '18px' }}>search</span>
                <input
                  type="text"
                  placeholder="Search quotations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="df-input pl-9"
                  style={{ width: '220px' }}
                />
              </div>
              <Link href="/quotations/new" className="btn-primary">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                New Quotation
              </Link>
            </div>
          </div>
        </div>

        {/* ── Status Filter Tabs ─────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilter('ALL')}
            className="px-4 py-2 rounded-lg text-label-md transition-all cursor-pointer"
            style={filter === 'ALL'
              ? { background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)', border: '1px solid var(--color-outline-variant)', fontWeight: 700 }
              : { background: 'transparent', color: 'var(--color-on-surface-variant)', border: '1px solid transparent' }}
          >
            All <span className="ml-1 text-label-sm" style={{ color: 'var(--color-outline)' }}>({quotations.length})</span>
          </button>
          {STATUS_GROUPS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="px-4 py-2 rounded-lg text-label-md transition-all cursor-pointer"
              style={filter === s
                ? { background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)', border: '1px solid var(--color-outline-variant)', fontWeight: 700 }
                : { background: 'transparent', color: 'var(--color-on-surface-variant)', border: '1px solid transparent' }}
            >
              {s.replace(/_/g, ' ')} {counts[s] ? <span className="ml-1 text-label-sm" style={{ color: 'var(--color-outline)' }}>({counts[s]})</span> : null}
            </button>
          ))}
        </div>

        {/* ── Table ─────────────────────────────────────────────── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'var(--color-surface-container-low)',
            border: '1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)',
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="material-symbols-outlined animate-spin text-headline-lg" style={{ color: 'var(--color-primary)' }}>refresh</span>
            </div>
          ) : (
            <table className="df-table">
              <thead>
                <tr>
                  <th>Quote #</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Risk</th>
                  <th>Total</th>
                  <th>Sales Rep</th>
                  <th>Last Activity</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => (
                  <tr key={q.id} onClick={() => router.push(`/quotations/${q.id}`)}>
                    <td>
                      <span className="text-meta-numeric" style={{ color: 'var(--color-primary)' }}>{q.quoteNumber}</span>
                    </td>
                    <td>
                      <div className="flex flex-col gap-0.5">
                        <span style={{ color: 'var(--color-on-surface)' }}>{q.customer?.name || q.customerName}</span>
                        {(q.customer?.tier || q.customerTier) && (
                          <span className="text-label-sm" style={{ color: TIER_COLOR[q.customer?.tier || q.customerTier] }}>
                            {q.customer?.tier || q.customerTier}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[q.status] || 'badge-outline'}`}>
                        {q.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      {q.riskLevel && (
                        <span className={`badge ${RISK_BADGE[q.riskLevel] || 'badge-outline'}`}>
                          {q.riskLevel}
                          {q.blendedRiskScore > 0 && <span className="ml-1 opacity-70">({q.blendedRiskScore})</span>}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="text-meta-numeric" style={{ color: 'var(--color-on-surface)' }}>
                        ${(q.grandTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--color-on-surface-variant)' }}>
                        {q.salesRep?.fullName || q.salesRepName || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="text-body-sm" style={{ color: 'var(--color-outline)' }}>
                        {q.lastActivityAt ? new Date(q.lastActivityAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </span>
                    </td>
                    <td>
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)', fontSize: '18px' }}>chevron_right</span>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-on-surface-variant)' }}>
                      <span className="material-symbols-outlined text-headline-lg block mb-2" style={{ color: 'var(--color-outline)' }}>receipt_long</span>
                      No quotations match the current filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
