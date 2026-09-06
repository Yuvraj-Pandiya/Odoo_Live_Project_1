'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { useClientTable, ClientSortHeader, ClientPaginationBar, ClientSearchBar } from '@/hooks/useClientTable';
import { RefreshCw, Download, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

/**
 * ============================================================================
 * ARCHITECTURE NOTICE: CLIENT-SIDE DATA MANAGEMENT (BOUNDED SUBSCRIPTION PLANS)
 * ============================================================================
 * The recurring subscription plans and active plan contract list represents a
 * small, fixed, config-like catalog dataset (typically bounded under ~100 items).
 * Because the organization offers a defined set of fixed plans and contract tiers,
 * the entire list is fetched/loaded once on mount.
 *
 * Searching (300ms debounced), column sorting (ID, Customer, MRR, ARR, Billing Date),
 * and pagination execute entirely in-memory on the client (filter first -> sort second -> paginate last).
 *
 * UNBOUNDED BUSINESS DATASETS (Invoices ledger, quotations transactions) remain
 * backend-paginated to prevent heavy database loads.
 * ============================================================================
 */

export interface SubscriptionItem {
  id: string;
  contractId: string;
  customer: string;
  plan: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD';
  mrr: number;
  arr: number;
  cadence: 'Monthly' | 'Annual';
  status: 'Active' | 'Pending Renewal' | 'Paused' | 'Cancelled';
  nextBilling: string;
  autoRenew: boolean;
}

const INITIAL_SUBSCRIPTIONS: SubscriptionItem[] = [
  { id: 'SUB-9021', contractId: 'ORD-1042', customer: 'Acme Corp', plan: 'Enterprise Cloud Platform (100 seats)', tier: 'GOLD', mrr: 2500, arr: 30000, cadence: 'Monthly', status: 'Active', nextBilling: '2026-10-01', autoRenew: true },
  { id: 'SUB-9022', contractId: 'ORD-1039', customer: 'Global Logix', plan: 'Warehouse Management Pro & Logistics AI', tier: 'GOLD', mrr: 4800, arr: 57600, cadence: 'Annual', status: 'Active', nextBilling: '2027-01-15', autoRenew: true },
  { id: 'SUB-9023', contractId: 'ORD-1035', customer: 'Apex Dynamics', plan: 'CRM Pro Tier (45 users) + SLA 99.9%', tier: 'SILVER', mrr: 1200, arr: 14400, cadence: 'Monthly', status: 'Pending Renewal', nextBilling: '2026-09-15', autoRenew: false },
  { id: 'SUB-9024', contractId: 'ORD-1030', customer: 'Starlight Tech', plan: 'Analytics Engine Enterprise', tier: 'GOLD', mrr: 3100, arr: 37200, cadence: 'Annual', status: 'Active', nextBilling: '2026-11-30', autoRenew: true },
  { id: 'SUB-9025', contractId: 'ORD-1022', customer: 'Vanguard Systems', plan: 'Developer Support Tier + Dedicated CSM', tier: 'BRONZE', mrr: 850, arr: 10200, cadence: 'Monthly', status: 'Paused', nextBilling: '2026-10-01', autoRenew: false },
  { id: 'SUB-9026', contractId: 'ORD-1018', customer: 'Reliance Digital', plan: 'Enterprise Cloud Platform (50 seats)', tier: 'SILVER', mrr: 1750, arr: 21000, cadence: 'Monthly', status: 'Active', nextBilling: '2026-10-15', autoRenew: true },
  { id: 'SUB-9027', contractId: 'ORD-1015', customer: 'Infosys BPM', plan: 'Autonomous Deal Desk & AI Orchestrator', tier: 'GOLD', mrr: 3900, arr: 46800, cadence: 'Annual', status: 'Active', nextBilling: '2027-03-01', autoRenew: true },
  { id: 'SUB-9028', contractId: 'ORD-1012', customer: 'Tata Motors', plan: 'Supply Chain & Multi-Depot Fleet AI', tier: 'GOLD', mrr: 5200, arr: 62400, cadence: 'Annual', status: 'Active', nextBilling: '2027-02-28', autoRenew: true },
];

export default function SubscriptionsPage() {
  const [filterCadence, setFilterCadence] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Composition: First filter by cadence/status, then pass to useClientTable for debounced search, sorting, and pagination
  const baseFilteredData = useMemo(() => {
    return INITIAL_SUBSCRIPTIONS.filter((sub) => {
      const matchesCadence = filterCadence === 'All' || sub.cadence === filterCadence;
      const matchesStatus = filterStatus === 'All' || sub.status === filterStatus;
      return matchesCadence && matchesStatus;
    });
  }, [filterCadence, filterStatus]);

  // ── Client-Side Table State (Composition: Filter -> Sort -> Paginate) ──────
  const {
    paginatedData,
    totalRawCount,
    totalFilteredCount,
    totalPages,
    searchQuery,
    setSearchQuery,
    isSearching,
    sortConfig,
    toggleSort,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    pageSizeOptions,
  } = useClientTable<SubscriptionItem>({
    data: baseFilteredData,
    searchFields: (item) => [item.id, item.customer, item.plan, item.contractId, item.cadence, item.status, item.nextBilling],
    initialSort: { key: 'mrr', direction: 'desc' },
    sortExtractors: {
      mrr: (item) => item.mrr,
      arr: (item) => item.arr,
      id: (item) => item.id,
      customer: (item) => item.customer,
      plan: (item) => item.plan,
      nextBilling: (item) => new Date(item.nextBilling).getTime(),
    },
    initialPageSize: 5,
    pageSizeOptions: [5, 10, 25],
    debounceMs: 300,
  });

  const totalARR = INITIAL_SUBSCRIPTIONS.reduce((acc, s) => acc + s.arr, 0);
  const totalMRR = INITIAL_SUBSCRIPTIONS.reduce((acc, s) => acc + s.mrr, 0);
  const activeCount = INITIAL_SUBSCRIPTIONS.filter((s) => s.status === 'Active').length;

  const handleExportARR = () => {
    const headers = ['Subscription ID', 'Contract ID', 'Customer', 'Plan', 'Tier', 'MRR', 'ARR', 'Cadence', 'Status', 'Next Billing Date', 'Auto Renew'];
    const rows = INITIAL_SUBSCRIPTIONS.map(sub => [
      sub.id,
      sub.contractId,
      `"${sub.customer.replace(/"/g, '""')}"`,
      `"${sub.plan.replace(/"/g, '""')}"`,
      sub.tier,
      sub.mrr,
      sub.arr,
      sub.cadence,
      sub.status,
      sub.nextBilling,
      sub.autoRenew ? 'Yes' : 'No'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ARR_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 className="page-heading">Subscriptions & Recurring Plans</h1>
              <span className="badge badge-success">
                Hybrid Billing Engine
              </span>
              <span className="badge badge-indigo">
                Bounded Catalog
              </span>
            </div>
            <p className="body-text" style={{ marginTop: '4px' }}>
              Manage active subscription lifecycles, fixed plan catalogs, MRR/ARR distributions, and renewals.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn-secondary" type="button" onClick={handleExportARR}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>file_download</span>
              <span>Export ARR Report</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div className="df-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total ARR</span>
            <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>₹{totalARR.toLocaleString()}</span>
            <span className="body-sm" style={{ color: 'var(--success)', fontWeight: 500 }}>+18.4% YoY growth</span>
          </div>
          <div className="df-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total MRR</span>
            <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>₹{totalMRR.toLocaleString()}</span>
            <span className="body-sm">Avg. contract: ₹{(totalMRR / INITIAL_SUBSCRIPTIONS.length).toFixed(0)}/mo</span>
          </div>
          <div className="df-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Plans</span>
            <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>{activeCount} / {INITIAL_SUBSCRIPTIONS.length}</span>
            <span className="body-sm" style={{ color: 'var(--success)', fontWeight: 500 }}>98.2% Net Retention</span>
          </div>
          <div className="df-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Upcoming Renewals (30d)</span>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#D97706' }}>1 Contract</span>
            <span className="body-sm" style={{ color: '#D97706', fontWeight: 500 }}>Apex Dynamics (SUB-9023)</span>
          </div>
        </div>

        {/* ── Client-Side Search, Filters & Sorting Toolbar ──────────────────── */}
        <div className="df-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {/* 300ms Debounced Client Search */}
            <ClientSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search plan, customer, contract ID..."
              isSearching={isSearching}
              totalCount={totalRawCount}
              filteredCount={totalFilteredCount}
            />

            {/* Cadence Pills */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--canvas)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              {['All', 'Monthly', 'Annual'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilterCadence(c)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: filterCadence === c ? 'var(--surface)' : 'transparent',
                    color: filterCadence === c ? '#4F46E5' : 'var(--text-secondary)',
                    border: 'none',
                    boxShadow: filterCadence === c ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Status Pills */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--canvas)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              {['All', 'Active', 'Pending Renewal'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterStatus(s)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: filterStatus === s ? 'var(--surface)' : 'transparent',
                    color: filterStatus === s ? '#4F46E5' : 'var(--text-secondary)',
                    border: 'none',
                    boxShadow: filterStatus === s ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="body-sm" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Sorted by: <strong style={{ color: 'var(--text-primary)' }}>{String(sortConfig.key || 'Default')} ({sortConfig.direction.toUpperCase()})</strong>
          </div>
        </div>

        {/* Table View */}
        <div className="df-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border, #DCDCD9)' }}>
                  <ClientSortHeader label="Plan ID" sortKey="id" currentSortKey={sortConfig.key as string} currentDirection={sortConfig.direction} onSort={toggleSort} />
                  <ClientSortHeader label="Enterprise Client" sortKey="customer" currentSortKey={sortConfig.key as string} currentDirection={sortConfig.direction} onSort={toggleSort} />
                  <ClientSortHeader label="Subscription Plan Tier" sortKey="plan" currentSortKey={sortConfig.key as string} currentDirection={sortConfig.direction} onSort={toggleSort} />
                  <ClientSortHeader label="MRR" sortKey="mrr" currentSortKey={sortConfig.key as string} currentDirection={sortConfig.direction} onSort={toggleSort} align="right" />
                  <ClientSortHeader label="ARR" sortKey="arr" currentSortKey={sortConfig.key as string} currentDirection={sortConfig.direction} onSort={toggleSort} align="right" />
                  <ClientSortHeader label="Cadence" sortKey="cadence" currentSortKey={sortConfig.key as string} currentDirection={sortConfig.direction} onSort={toggleSort} align="center" />
                  <ClientSortHeader label="Status" sortKey="status" currentSortKey={sortConfig.key as string} currentDirection={sortConfig.direction} onSort={toggleSort} />
                  <ClientSortHeader label="Next Billing" sortKey="nextBilling" currentSortKey={sortConfig.key as string} currentDirection={sortConfig.direction} onSort={toggleSort} align="right" />
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <AlertCircle size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>No subscription plans match your search and filter criteria.</p>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Try adjusting your cadence filter or search term.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((sub) => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid var(--border, #DCDCD9)' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <Link href={`/subscriptions/${sub.id}`} style={{ fontWeight: 700, color: '#4F46E5', textDecoration: 'none' }}>
                          {sub.id}
                        </Link>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{sub.contractId}</div>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {sub.customer}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sub.plan}</div>
                        <span style={{ fontSize: '11px', background: sub.tier === 'GOLD' ? '#FEF3C7' : '#F1F5F9', color: sub.tier === 'GOLD' ? '#B45309' : '#475569', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          Tier: {sub.tier}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: '#15803D' }}>
                        ₹{sub.mrr.toLocaleString()}/mo
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>
                        ₹{sub.arr.toLocaleString()}/yr
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <span className="badge badge-primary">
                          {sub.cadence}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span className={`badge ${
                          sub.status === 'Active' ? 'badge-success' :
                          sub.status === 'Pending Renewal' ? 'badge-warning' :
                          'badge-muted'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {sub.nextBilling}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <Link
                          href={`/subscriptions/${sub.id}`}
                          className="btn-secondary"
                          style={{ height: '30px', padding: '0 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                        >
                          Inspect <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Client-Side Pagination Controls */}
          <ClientPaginationBar
            pageIndex={pageIndex}
            pageSize={pageSize}
            totalItems={totalFilteredCount}
            totalPages={totalPages}
            onPageChange={setPageIndex}
            onPageSizeChange={setPageSize}
            pageSizeOptions={pageSizeOptions}
            entityName="subscription plans"
          />
        </div>
      </div>
    </AppLayout>
  );
}
