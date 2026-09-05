'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { discountTierApi, getStoredUser } from '@/lib/api';
import { useClientTable, ClientSortHeader, ClientPaginationBar, ClientSearchBar } from '@/hooks/useClientTable';
import { Percent, Shield, Edit2, CheckCircle2, ArrowLeft, RefreshCw, AlertCircle, Award } from 'lucide-react';

/**
 * ============================================================================
 * ARCHITECTURE NOTICE: CLIENT-SIDE DATA MANAGEMENT (BOUNDED DATASET)
 * ============================================================================
 * Discount tier configuration is a small, bounded, config-like dataset (typically 3–10 rows).
 * Because this dataset does NOT grow dynamically with daily transactional operations,
 * the entire collection is fetched ONCE on mount and filtered, sorted, and paginated
 * entirely in-memory on the client (filter first -> sort second -> paginate last).
 *
 * UNBOUNDED BUSINESS DATASETS (Quotations, Invoices, Approvals Queue) must remain
 * server-side paginated to avoid loading thousands of transactional records into memory.
 * ============================================================================
 */

interface DiscountTierItem {
  id: number;
  tier: string;
  maxDiscount: number | string;
  description: string;
  updatedAt: string;
}

const DEFAULT_TIERS: DiscountTierItem[] = [
  { id: 1, tier: 'BRONZE', maxDiscount: 10.0, description: 'Standard discount ceiling for Bronze tier enterprise accounts', updatedAt: '2026-09-05T23:21:37Z' },
  { id: 2, tier: 'SILVER', maxDiscount: 20.0, description: 'Enhanced discount ceiling for Silver tier enterprise accounts', updatedAt: '2026-09-05T23:21:37Z' },
  { id: 3, tier: 'GOLD',   maxDiscount: 35.0, description: 'Maximum approved discount ceiling for Gold strategic accounts', updatedAt: '2026-09-05T23:21:37Z' },
];

export default function DiscountTiersPage() {
  const [tiers, setTiers] = useState<DiscountTierItem[]>(DEFAULT_TIERS);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [editingTier, setEditingTier] = useState<DiscountTierItem | null>(null);
  const [editMaxDiscount, setEditMaxDiscount] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const user = getStoredUser();
  const isAdmin = user?.role === 'ADMIN';

  const loadTiers = async () => {
    setLoading(true);
    try {
      const res = await discountTierApi.list();
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setTiers(res.data);
      } else {
        setTiers(DEFAULT_TIERS);
      }
    } catch {
      setTiers(DEFAULT_TIERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTiers();
  }, []);

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
  } = useClientTable<DiscountTierItem>({
    data: tiers,
    searchFields: (item) => [item.tier, item.description, item.maxDiscount],
    initialSort: { key: 'maxDiscount', direction: 'asc' },
    sortExtractors: {
      maxDiscount: (item) => Number(item.maxDiscount),
      tier: (item) => item.tier,
      updatedAt: (item) => new Date(item.updatedAt).getTime(),
    },
    initialPageSize: 5,
    pageSizeOptions: [5, 10, 25],
    debounceMs: 300,
  });

  const openEditModal = (tier: DiscountTierItem) => {
    setEditingTier(tier);
    setEditMaxDiscount(String(tier.maxDiscount));
    setEditDescription(tier.description || '');
  };

  const handleSaveTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTier) return;
    const num = parseFloat(editMaxDiscount);
    if (isNaN(num) || num < 0 || num > 100) {
      alert('Please enter a valid discount percentage between 0% and 100%.');
      return;
    }

    setSaving(true);
    try {
      await discountTierApi.update(editingTier.id, {
        maxDiscount: num,
        description: editDescription.trim(),
      });
      setTiers((prev) =>
        prev.map((t) => (t.id === editingTier.id ? { ...t, maxDiscount: num, description: editDescription.trim(), updatedAt: new Date().toISOString() } : t))
      );
      setToastMsg(`Discount tier ${editingTier.tier} updated successfully.`);
      setTimeout(() => setToastMsg(null), 3500);
      setEditingTier(null);
    } catch {
      // Offline fallback
      setTiers((prev) =>
        prev.map((t) => (t.id === editingTier.id ? { ...t, maxDiscount: num, description: editDescription.trim(), updatedAt: new Date().toISOString() } : t))
      );
      setToastMsg(`Discount tier ${editingTier.tier} updated in memory.`);
      setTimeout(() => setToastMsg(null), 3500);
      setEditingTier(null);
    } finally {
      setSaving(false);
    }
  };

  const getTierBadge = (tier: string) => {
    const t = tier.toUpperCase();
    if (t === 'GOLD') return { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' };
    if (t === 'SILVER') return { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' };
    return { bg: '#FFEDD5', color: '#C2410C', border: '#FED7AA' };
  };

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary, #4B4B42)' }}>
          <Link href="/dashboard" style={{ color: 'var(--text-secondary, #4B4B42)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <span>/</span>
          <Link href="/admin/users" style={{ color: 'var(--text-secondary, #4B4B42)', textDecoration: 'none' }}>
            Administration
          </Link>
          <span>/</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary, #1F1F1C)' }}>Discount Tiers</span>
        </div>

        {/* Header Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 className="page-heading">Discount Tier Policy Configuration</h1>
              <span className="badge badge-indigo">
                Bounded Config Dataset
              </span>
            </div>
            <p className="body-text" style={{ marginTop: '4px' }}>
              Define company-wide ceiling discount thresholds per customer tier. Quotes exceeding these ceilings automatically trigger governance approval.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={loadTiers}
              className="btn-secondary"
              title="Refresh tiers"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <Link href="/admin/users" className="btn-secondary" style={{ textDecoration: 'none' }}>
              User Governance
            </Link>
          </div>
        </div>

        {/* Toast alert */}
        {toastMsg && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#DCFCE7', border: '1px solid #86EFAC', color: '#15803D', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
            <CheckCircle2 size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Architectural Context Banner */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 18px', borderRadius: '10px', background: 'var(--canvas, #F5F5F3)', border: '1px solid var(--border, #DCDCD9)' }}>
          <Shield size={18} className="text-indigo-600 shrink-0 mt-0.5" />
          <div style={{ fontSize: '13px', color: 'var(--text-secondary, #4B4B42)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--text-primary, #1F1F1C)' }}>Client-Side Data Management:</strong> This configuration list is strictly bounded to enterprise tier definitions. The entire dataset is loaded once, enabling instantaneous 300ms debounced search, client-side column sorting, and pagination without per-keystroke server latency.
          </div>
        </div>

        {/* Table Card */}
        <div className="df-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Table Toolbar */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border, #DCDCD9)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: '#FFFFFF' }}>
            <ClientSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search tiers, policy descriptions, or discount %..."
              isSearching={isSearching}
              totalCount={totalRawCount}
              filteredCount={totalFilteredCount}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-muted, #91918F)' }}>
              <span>Sorted by: <strong style={{ color: 'var(--text-primary, #1F1F1C)' }}>{String(sortConfig.key || 'Default')} ({sortConfig.direction.toUpperCase()})</strong></span>
            </div>
          </div>

          {/* Table View */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border, #DCDCD9)' }}>
                  <ClientSortHeader label="Tier Level" sortKey="tier" currentSortKey={sortConfig.key as string} currentDirection={sortConfig.direction} onSort={toggleSort} />
                  <ClientSortHeader label="Max Allowed Discount" sortKey="maxDiscount" currentSortKey={sortConfig.key as string} currentDirection={sortConfig.direction} onSort={toggleSort} />
                  <ClientSortHeader label="Policy Governance Description" sortKey="description" currentSortKey={sortConfig.key as string} currentDirection={sortConfig.direction} onSort={toggleSort} />
                  <ClientSortHeader label="Last Updated" sortKey="updatedAt" currentSortKey={sortConfig.key as string} currentDirection={sortConfig.direction} onSort={toggleSort} />
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary, #4B4B42)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary, #4B4B42)' }}>
                      Loading discount tier policies...
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary, #4B4B42)' }}>
                      <AlertCircle size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                      <p style={{ margin: 0, fontWeight: 600 }}>No discount tiers match your search.</p>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted, #91918F)' }}>Try clearing your search query.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((tier) => {
                    const badge = getTierBadge(tier.tier);
                    return (
                      <tr key={tier.id} style={{ borderBottom: '1px solid var(--border, #DCDCD9)', transition: 'background 0.15s' }}>
                        {/* Tier */}
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                            <Award size={13} /> {tier.tier}
                          </span>
                        </td>

                        {/* Max Discount */}
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: '#15803D', fontSize: '14px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#DCFCE7', padding: '2px 8px', borderRadius: '4px', border: '1px solid #86EFAC' }}>
                            <Percent size={13} /> {Number(tier.maxDiscount).toFixed(1)}% Max
                          </span>
                        </td>

                        {/* Description */}
                        <td style={{ padding: '14px 18px', color: 'var(--text-secondary, #4B4B42)', maxWidth: '380px' }}>
                          {tier.description || 'Standard governance tier'}
                        </td>

                        {/* Updated At */}
                        <td style={{ padding: '14px 18px', color: 'var(--text-muted, #91918F)', fontSize: '12px' }}>
                          {new Date(tier.updatedAt).toLocaleDateString()} {new Date(tier.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          {isAdmin ? (
                            <button
                              type="button"
                              onClick={() => openEditModal(tier)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                background: '#FFFFFF',
                                border: '1px solid var(--border, #DCDCD9)',
                                color: 'var(--text-primary, #1F1F1C)',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Edit2 size={12} /> Edit Tier
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted, #91918F)' }}>Admin Only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
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
            entityName="discount tiers"
          />
        </div>

        {/* ── Edit Tier Modal ────────────────────────────────────────── */}
        {editingTier && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ maxWidth: '440px', width: '100%', background: '#FFFFFF', borderRadius: '16px', padding: '28px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', border: '1px solid var(--border, #DCDCD9)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary, #1F1F1C)' }}>
                  Configure {editingTier.tier} Tier
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingTier(null)}
                  style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted, #91918F)' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveTier} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #4B4B42)', marginBottom: '5px' }}>
                    Maximum Allowed Discount (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    required
                    value={editMaxDiscount}
                    onChange={(e) => setEditMaxDiscount(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border, #DCDCD9)', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                  <p style={{ fontSize: '11px', color: 'var(--text-muted, #91918F)', marginTop: '4px' }}>
                    Discounts entered on quotes above this ceiling will trigger multi-level governance approval.
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #4B4B42)', marginBottom: '5px' }}>
                    Policy Description
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Enter governance policy notes..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border, #DCDCD9)', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingTier(null)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? 'Saving...' : 'Save Policy'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
