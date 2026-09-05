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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* ── Page Header ───────────────────────────────────────── */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 className="page-heading">Quotations</h1>
                <span className="badge badge-primary">CPQ core</span>
              </div>
              <p className="body-text" style={{ marginTop: '4px' }}>
                Every quotation in the system — click a row to open details
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Search */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', fontSize: '18px' }}>search</span>
                <input
                  type="text"
                  placeholder="Search quotations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="df-input"
                  style={{ width: '240px', paddingLeft: '36px' }}
                />
              </div>
              <Link href="/quotations/new" className="btn-primary">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                <span>New quotation</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Status Filter Tabs ─────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: filter === 'ALL' ? 600 : 500,
              cursor: 'pointer',
              background: filter === 'ALL' ? 'var(--accent-subtle)' : 'var(--surface)',
              color: filter === 'ALL' ? 'var(--accent)' : 'var(--text-secondary)',
              border: `1px solid ${filter === 'ALL' ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            All <span style={{ fontSize: '12px', opacity: 0.8 }}>({quotations.length})</span>
          </button>
          {STATUS_GROUPS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: filter === s ? 600 : 500,
                cursor: 'pointer',
                background: filter === s ? 'var(--accent-subtle)' : 'var(--surface)',
                color: filter === s ? 'var(--accent)' : 'var(--text-secondary)',
                border: `1px solid ${filter === s ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              {s.toLowerCase().replace(/_/g, ' ')} {counts[s] ? <span style={{ fontSize: '12px', opacity: 0.8 }}>({counts[s]})</span> : null}
            </button>
          ))}
        </div>

        {/* ── Table ─────────────────────────────────────────────── */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px' }}>
              <span className="material-symbols-outlined animate-spin" style={{ fontSize: '28px', color: 'var(--accent)' }}>refresh</span>
            </div>
          ) : (
            <table>
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
                  <tr key={q.id} onClick={() => router.push(`/quotations/${q.id}`)} style={{ cursor: 'pointer' }}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{q.quoteNumber}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{q.customer?.name || q.customerName}</span>
                        {(q.customer?.tier || q.customerTier) && (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {q.customer?.tier || q.customerTier} tier
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[q.status] || 'badge-outline'}`}>
                        {q.status.toLowerCase().replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      {q.riskLevel && (
                        <span className={`badge ${RISK_BADGE[q.riskLevel] || 'badge-outline'}`}>
                          {q.riskLevel.toLowerCase()}
                          {q.blendedRiskScore > 0 && <span style={{ marginLeft: '4px', opacity: 0.8 }}>({q.blendedRiskScore})</span>}
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        ${(q.grandTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {q.salesRep?.fullName || q.salesRepName || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="body-sm">
                        {q.lastActivityAt ? new Date(q.lastActivityAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </span>
                    </td>
                    <td>
                      <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)', fontSize: '18px' }}>chevron_right</span>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>receipt_long</span>
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
