'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { quotationApi, getStoredUser } from '@/lib/api';
import { canCreateQuotation } from '@/lib/permissions';

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

const KANBAN_STAGES = [
  { id: 'DRAFT', label: 'Draft', badgeClass: 'badge-draft' },
  { id: 'PENDING_APPROVAL', label: 'Pending Approval', badgeClass: 'badge-pending' },
  { id: 'APPROVED', label: 'Approved', badgeClass: 'badge-approved' },
  { id: 'NEGOTIATION', label: 'Negotiation', badgeClass: 'badge-negotiation' },
  { id: 'CONFIRMED', label: 'Confirmed', badgeClass: 'badge-confirmed' },
];

const MOCK_QUOTATIONS = [
  { id: 1, quoteNumber: 'Q-1042', status: 'PENDING_APPROVAL', grandTotal: 2581.00, currency: 'INR', riskLevel: 'HIGH', blendedRiskScore: 8.5, customer: { name: 'Acme Corp', tier: 'GOLD' }, salesRep: { fullName: 'J. Rao' }, lastActivityAt: '2026-09-03T10:00:00Z' },
  { id: 2, quoteNumber: 'Q-1039', status: 'PENDING_APPROVAL', grandTotal: 1974.00, currency: 'INR', riskLevel: 'MEDIUM', blendedRiskScore: 5.2, customer: { name: 'Beta Industries', tier: 'SILVER' }, salesRep: { fullName: 'J. Rao' }, lastActivityAt: '2026-09-01T09:00:00Z' },
  { id: 3, quoteNumber: 'Q-1035', status: 'APPROVED', grandTotal: 413.00, currency: 'INR', riskLevel: 'LOW', blendedRiskScore: 0, customer: { name: 'Nova Retail', tier: 'BRONZE' }, salesRep: { fullName: 'S. Kumar' }, lastActivityAt: '2026-09-02T14:00:00Z' },
  { id: 4, quoteNumber: 'Q-1030', status: 'CONFIRMED', grandTotal: 16854.00, currency: 'INR', riskLevel: 'LOW', blendedRiskScore: 2.1, customer: { name: 'Zenith Co', tier: 'GOLD' }, salesRep: { fullName: 'S. Kumar' }, lastActivityAt: '2026-08-26T11:00:00Z' },
];

const STATUS_GROUPS = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'NEGOTIATION', 'CONFIRMED', 'FULFILLED'];

export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<any[]>(MOCK_QUOTATIONS);
  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline');
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>({});

  const loadUser = () => {
    if (typeof window !== 'undefined') {
      const u = getStoredUser();
      setUser(u || {});
    }
  };

  useEffect(() => {
    loadUser();
    const handleAuth = () => loadUser();
    window.addEventListener('dealflow-auth-change', handleAuth);
    return () => window.removeEventListener('dealflow-auth-change', handleAuth);
  }, []);

  const userRole = user?.role || 'SALES_REP';
  const showCreate = canCreateQuotation(userRole);

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
      (q.customer?.name || q.customerName || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts: Record<string, number> = {};
  quotations.forEach((q) => { counts[q.status] = (counts[q.status] || 0) + 1; });

  const formatAmount = (val: number, cur: string = 'INR') => {
    if (cur === 'USD' || cur === '$') {
      return `$${(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `₹${(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                Manage deals across sales pipeline stages — click any quotation card to view details
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* View Switcher Toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--canvas)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '2px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setViewMode('pipeline')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    background: viewMode === 'pipeline' ? 'var(--surface)' : 'transparent',
                    color: viewMode === 'pipeline' ? 'var(--accent)' : 'var(--text-secondary)',
                    boxShadow: viewMode === 'pipeline' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>view_kanban</span>
                  <span>Pipeline</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    background: viewMode === 'table' ? 'var(--surface)' : 'transparent',
                    color: viewMode === 'table' ? 'var(--accent)' : 'var(--text-secondary)',
                    boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>table_rows</span>
                  <span>Table</span>
                </button>
              </div>

              {/* Search */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', fontSize: '18px' }}>search</span>
                <input
                  type="text"
                  placeholder="Search quotations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="df-input"
                  style={{ width: '220px', paddingLeft: '36px' }}
                />
              </div>

              {showCreate && (
                <Link href="/quotations/new" className="btn-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                  <span>New quotation</span>
                </Link>
              )}
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

        {/* ── Main View Content (Pipeline vs Table) ─────────────── */}
        {loading ? (
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '64px',
            }}
          >
            <span className="material-symbols-outlined animate-spin" style={{ fontSize: '28px', color: 'var(--accent)' }}>refresh</span>
          </div>
        ) : viewMode === 'pipeline' ? (
          /* ── Kanban Pipeline Board View ──────────────────────── */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(260px, 1fr))',
              gap: '16px',
              overflowX: 'auto',
              paddingBottom: '12px',
            }}
          >
            {KANBAN_STAGES.map((stage) => {
              const stageQuotes = filtered.filter((q) => q.status === stage.id);
              const stageTotal = stageQuotes.reduce((acc, q) => acc + (q.grandTotal || 0), 0);

              return (
                <div
                  key={stage.id}
                  style={{
                    background: 'var(--canvas)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: 'calc(100vh - 270px)',
                    minHeight: '400px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Column Header */}
                  <div
                    style={{
                      padding: '14px 16px',
                      background: 'var(--surface)',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="section-label" style={{ fontSize: '14px', margin: 0 }}>
                        {stage.label}
                      </span>
                      <span
                        className={`badge ${stage.badgeClass}`}
                        style={{ fontSize: '11px', padding: '2px 8px' }}
                      >
                        {counts[stage.id] || 0}
                      </span>
                    </div>
                    {stageTotal > 0 && (
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {formatAmount(stageTotal, stageQuotes[0]?.currency)}
                      </span>
                    )}
                  </div>

                  {/* Cards Container */}
                  <div
                    style={{
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      overflowY: 'auto',
                      flex: 1,
                    }}
                  >
                    {stageQuotes.map((q) => (
                      <div
                        key={q.id}
                        onClick={() => router.push(`/quotations/${q.id}`)}
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: '10px',
                          padding: '14px',
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                          transition: 'all 0.15s ease-in-out',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent)';
                          e.currentTarget.style.boxShadow = '0 3px 8px rgba(46,81,214,0.12)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                        }}
                      >
                        {/* Header: Quote # & Risk */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--accent)' }}>
                            {q.quoteNumber}
                          </span>
                          {q.riskLevel && (
                            <span className={`badge ${RISK_BADGE[q.riskLevel] || 'badge-outline'}`} style={{ fontSize: '11px' }}>
                              {q.riskLevel.toLowerCase()}
                            </span>
                          )}
                        </div>

                        {/* Customer Name & Amount */}
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                            {q.customer?.name || q.customerName || 'Direct Account'} —{' '}
                            <span style={{ color: 'var(--text-primary)' }}>
                              {formatAmount(q.grandTotal, q.currency)}
                            </span>
                          </div>
                          {(q.customer?.tier || q.customerTier) && (
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {q.customer?.tier || q.customerTier} Tier
                            </div>
                          )}
                        </div>

                        {/* Footer: Rep & Date */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>person</span>
                            {q.salesRep?.fullName || q.salesRepName || 'Sales Rep'}
                          </span>
                          {q.lastActivityAt && (
                            <span style={{ color: 'var(--text-muted)' }}>
                              {new Date(q.lastActivityAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {!stageQuotes.length && (
                      <div
                        style={{
                          border: '1px dashed var(--border)',
                          borderRadius: '8px',
                          padding: '24px 12px',
                          textAlign: 'center',
                          color: 'var(--text-muted)',
                          fontSize: '13px',
                        }}
                      >
                        No quotations
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Secondary Table View ────────────────────────────── */
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
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
                        {formatAmount(q.grandTotal, q.currency)}
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
          </div>
        )}
      </div>
    </AppLayout>
  );
}

