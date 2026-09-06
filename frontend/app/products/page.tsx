'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { productApi, getStoredUser } from '@/lib/api';
import { Plus, Package, Search, X, CheckCircle, Loader2 } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts]     = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState<any>(null);

  // New Product Modal State
  const [showModal, setShowModal]   = useState(false);
  const [creating, setCreating]     = useState(false);
  const [toast, setToast]           = useState<string | null>(null);
  const [newProd, setNewProd]       = useState({
    name: '',
    sku: '',
    categoryId: 1,
    basePrice: '',
    costPrice: '',
    taxPercentage: '18',
    description: '',
    isSubscription: false,
    isPromoted: true,
  });

  const loadData = async () => {
    try {
      const [p, c] = await Promise.all([productApi.list(), productApi.categories()]);
      setProducts(p.data || []); 
      setCategories(c.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name.trim() || !newProd.basePrice) return;
    setCreating(true);

    try {
      const payload: any = {
        name: newProd.name.trim(),
        sku: newProd.sku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
        basePrice: parseFloat(newProd.basePrice) || 0,
        costPrice: parseFloat(newProd.costPrice) || (parseFloat(newProd.basePrice) * 0.7),
        taxPercentage: parseFloat(newProd.taxPercentage) || 18,
        description: newProd.description.trim() || newProd.name.trim(),
        isSubscription: newProd.isSubscription,
        isPromoted: newProd.isPromoted,
        productType: newProd.isSubscription ? 'SERVICE' : 'HARDWARE',
        quantityOnHand: 100,
        isActive: true,
      };

      if (newProd.categoryId) {
        payload.category = { id: Number(newProd.categoryId) };
      }

      const res = await productApi.create(payload);
      setToast(`Product "${res.data.name}" added & dynamic upsell rules activated!`);
      setTimeout(() => setToast(null), 3500);
      setShowModal(false);
      setNewProd({
        name: '',
        sku: '',
        categoryId: categories[0]?.id || 1,
        basePrice: '',
        costPrice: '',
        taxPercentage: '18',
        description: '',
        isSubscription: false,
        isPromoted: true,
      });
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating product. Ensure you have admin permissions.');
    } finally {
      setCreating(false);
    }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {toast && (
          <div className="fixed top-6 right-8 z-50 bg-[var(--accent)] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
            <CheckCircle size={18} />
            <span className="text-sm font-semibold">{toast}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="page-heading">Product Catalog</h1>
            <p className="body-text mt-1">Manage enterprise products, configurable variants, pricing tiers, and tax rates</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            <span>New Product</span>
          </button>
        </div>

        {/* Create Product Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2.5">
                  <Package className="text-[var(--accent)]" size={22} />
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">Add New Enterprise Product</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg hover:bg-[var(--canvas)] text-[var(--text-muted)]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div>
                  <label className="section-label block mb-1">Product Name *</label>
                  <input
                    required
                    type="text"
                    value={newProd.name}
                    onChange={e => setNewProd({ ...newProd, name: e.target.value })}
                    placeholder="e.g., CrowdStrike Falcon Complete v4"
                    className="w-full text-sm p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="section-label block mb-1">SKU</label>
                    <input
                      type="text"
                      value={newProd.sku}
                      onChange={e => setNewProd({ ...newProd, sku: e.target.value })}
                      placeholder="e.g., SEC-CS-9900"
                      className="w-full text-sm p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="section-label block mb-1">Category</label>
                    <select
                      value={newProd.categoryId}
                      onChange={e => setNewProd({ ...newProd, categoryId: Number(e.target.value) })}
                      className="w-full text-sm p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="section-label block mb-1">Base Price (₹) *</label>
                    <input
                      required
                      type="number"
                      step="any"
                      value={newProd.basePrice}
                      onChange={e => setNewProd({ ...newProd, basePrice: e.target.value })}
                      placeholder="150000"
                      className="w-full text-sm p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="section-label block mb-1">Cost Price (₹)</label>
                    <input
                      type="number"
                      step="any"
                      value={newProd.costPrice}
                      onChange={e => setNewProd({ ...newProd, costPrice: e.target.value })}
                      placeholder="95000"
                      className="w-full text-sm p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="section-label block mb-1">GST Tax %</label>
                    <input
                      type="number"
                      value={newProd.taxPercentage}
                      onChange={e => setNewProd({ ...newProd, taxPercentage: e.target.value })}
                      placeholder="18"
                      className="w-full text-sm p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[var(--text-primary)]">
                    <input
                      type="checkbox"
                      checked={newProd.isSubscription}
                      onChange={e => setNewProd({ ...newProd, isSubscription: e.target.checked })}
                      className="w-4 h-4 rounded text-[var(--accent)]"
                    />
                    <span>Subscription Plan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[var(--text-primary)]">
                    <input
                      type="checkbox"
                      checked={newProd.isPromoted}
                      onChange={e => setNewProd({ ...newProd, isPromoted: e.target.checked })}
                      className="w-4 h-4 rounded text-[var(--accent)]"
                    />
                    <span>Promote in Upsell Rules</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="btn-primary"
                  >
                    {creating ? <Loader2 size={16} className="animate-spin" /> : 'Save & Activate Rules'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total products', value: products.length, desc: 'Active in catalog' },
            { label: 'Categories',     value: categories.length, desc: 'Pricing rule groups' },
            { label: 'Subscriptions',  value: products.filter(p => p.isSubscription).length, desc: 'Recurring plans' },
          ].map(s => (
            <div key={s.label} className="df-card p-5">
              <p className="section-label">{s.label}</p>
              <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">{loading ? '—' : s.value}</p>
              <p className="body-sm mt-1">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2 df-card overflow-hidden !p-0">
            <div className="p-4 border-b border-[var(--border)] flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                  placeholder="Search products by SKU or name…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="df-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Base Price</th>
                    <th>Tax %</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 body-sm">
                        Loading products catalog…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 body-sm">
                        No products found matching &ldquo;{search}&rdquo;
                      </td>
                    </tr>
                  ) : filtered.map((p: any) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className={`cursor-pointer transition-colors ${selected?.id === p.id ? 'bg-[var(--accent-subtle)]' : ''}`}
                    >
                      <td className="font-semibold text-[var(--text-primary)]">
                        <div className="flex items-center gap-2">
                          <Package size={16} className="text-[var(--accent)] shrink-0" />
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td className="font-mono text-xs text-[var(--text-muted)]">{p.sku || '—'}</td>
                      <td className="body-text">{p.category?.name || '—'}</td>
                      <td className="font-bold text-[var(--text-primary)]">
                        ₹{Number(p.basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="body-text">{Number(p.taxPercentage || 0).toFixed(0)}%</td>
                      <td>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.isSubscription
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {p.isSubscription ? 'Subscription' : p.productType}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${p.isActive ? 'badge-success' : 'badge-muted'}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail */}
          <div className="space-y-6">
            {!selected ? (
              <div className="df-card p-8 text-center">
                <Package size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
                <h3 className="section-label mb-1">Product inspector</h3>
                <p className="body-sm">
                  Select any row from the product catalog table to inspect cost, stock, and variant configurations.
                </p>
              </div>
            ) : (
              <div className="df-card p-5 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="section-label text-base text-[var(--text-primary)]">{selected.name}</h3>
                    <p className="body-sm font-mono mt-0.5">{selected.sku}</p>
                  </div>
                  {selected.isPromoted && (
                    <span className="badge badge-warning">PROMO</span>
                  )}
                </div>

                {selected.description && (
                  <p className="body-text text-xs bg-[var(--canvas)] p-3 rounded-lg border border-[var(--border)]">
                    {selected.description}
                  </p>
                )}

                <div className="space-y-3 body-sm">
                  {[
                    ['Category',   selected.category?.name || '—'],
                    ['Base Price', `₹${Number(selected.basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
                    ['Cost Price', selected.costPrice ? `₹${Number(selected.costPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'],
                    ['Tax Rate',   `${Number(selected.taxPercentage || 0).toFixed(1)}%`],
                    ['Unit of Measure', selected.unit || 'Units'],
                    ['Quantity on Hand', selected.quantityOnHand ?? '—'],
                  ].map(([label, val]) => (
                    <div key={label as string} className="flex justify-between items-center py-1 border-b border-[var(--border)] last:border-0">
                      <span className="body-sm">{label}</span>
                      <span className="font-semibold text-[var(--text-primary)]">{val as string}</span>
                    </div>
                  ))}
                  {selected.isSubscription && (
                    <div className="flex justify-between items-center py-1 border-b border-[var(--border)]">
                      <span className="body-sm">Billing Cycle</span>
                      <span className="badge badge-indigo">{selected.billingCycle}</span>
                    </div>
                  )}
                </div>

                {/* Variants */}
                {selected.variants?.length > 0 && (
                  <div>
                    <p className="section-label mb-2">
                      Configured variants
                    </p>
                    <div className="space-y-1.5">
                      {selected.variants.map((v: any) => (
                        <div key={v.id} className="flex justify-between items-center text-xs px-3 py-2 rounded-lg bg-[var(--canvas)] border border-[var(--border)]">
                          <span className="body-sm">{v.attributeName}: <strong className="text-[var(--text-primary)]">{v.attributeValue}</strong></span>
                          <span className="font-semibold text-[var(--accent)]">{v.extraPrice > 0 ? `+₹${v.extraPrice}` : 'Base'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Categories Panel */}
            <div className="df-card p-5">
              <h3 className="section-label text-base text-[var(--text-primary)] mb-3">Category discount ceilings</h3>
              <div className="space-y-2.5">
                {categories.map((c: any) => (
                  <div key={c.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-[var(--canvas)] transition-colors">
                    <span className="body-text font-medium">{c.name}</span>
                    <span className="badge badge-warning">Max {Number(c.maxDiscount).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
