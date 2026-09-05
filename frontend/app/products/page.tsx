'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { productApi } from '@/lib/api';
import { Plus, Package, Search } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts]     = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, c] = await Promise.all([productApi.list(), productApi.categories()]);
        setProducts(p.data || []); 
        setCategories(c.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="page-heading">Product Catalog</h1>
            <p className="body-text mt-1">Manage enterprise products, configurable variants, pricing tiers, and tax rates</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            <span>New Product</span>
          </button>
        </div>

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
