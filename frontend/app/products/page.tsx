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
      const [p, c] = await Promise.all([productApi.list(), productApi.categories()]);
      setProducts(p.data); setCategories(c.data);
      setLoading(false);
    })();
  }, []);

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-heading-1 font-bold text-slate-900 dark:text-white">Product Catalog</h1>
            <p className="type-body-base text-slate-500 dark:text-slate-400 mt-1">Manage enterprise products, configurable variants, pricing tiers, and tax rates</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            <span>New Product</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Products', value: products.length, desc: 'Active in catalog' },
            { label: 'Categories',     value: categories.length, desc: 'Pricing rule groups' },
            { label: 'Subscriptions',  value: products.filter(p => p.isSubscription).length, desc: 'Recurring recurring plans' },
          ].map(s => (
            <div key={s.label} className="df-card p-5">
              <p className="type-subheading text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className="text-display font-bold text-slate-900 dark:text-white mt-1">{loading ? '—' : s.value}</p>
              <p className="type-body-base text-xs text-slate-400 dark:text-slate-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2 df-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="df-input w-full pl-10 text-sm"
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
                      <td colSpan={7} className="text-center py-12 text-slate-400 dark:text-slate-500">
                        Loading products catalog…
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 dark:text-slate-500">
                        No products found matching &ldquo;{search}&rdquo;
                      </td>
                    </tr>
                  ) : filtered.map((p: any) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className={`cursor-pointer transition-colors ${selected?.id === p.id ? 'bg-indigo-50/60 dark:bg-indigo-950/30' : ''}`}
                    >
                      <td className="font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Package size={16} className="text-indigo-500 flex-shrink-0" />
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td className="font-mono text-xs text-slate-500 dark:text-slate-400">{p.sku || '—'}</td>
                      <td className="text-slate-600 dark:text-slate-300">{p.category?.name || '—'}</td>
                      <td className="font-bold text-slate-900 dark:text-white">
                        ${Number(p.basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-slate-600 dark:text-slate-300">{Number(p.taxPercentage || 0).toFixed(0)}%</td>
                      <td>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.isSubscription
                            ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800'
                            : 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
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
                <Package size={32} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <h3 className="text-heading-3 font-semibold text-slate-700 dark:text-slate-300">Product Inspector</h3>
                <p className="type-body-base text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Select any row from the product catalog table to inspect cost, stock, and variant configurations.
                </p>
              </div>
            ) : (
              <div className="df-card p-5 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-heading-3 font-bold text-slate-900 dark:text-white">{selected.name}</h3>
                    <p className="type-body-base text-xs font-mono text-slate-400 dark:text-slate-500 mt-0.5">{selected.sku}</p>
                  </div>
                  {selected.isPromoted && (
                    <span className="badge badge-warning">PROMO</span>
                  )}
                </div>

                {selected.description && (
                  <p className="type-body-base text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    {selected.description}
                  </p>
                )}

                <div className="space-y-3 type-body-base">
                  {[
                    ['Category',   selected.category?.name || '—'],
                    ['Base Price', `$${Number(selected.basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
                    ['Cost Price', selected.costPrice ? `$${Number(selected.costPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'],
                    ['Tax Rate',   `${Number(selected.taxPercentage || 0).toFixed(1)}%`],
                    ['Unit of Measure', selected.unit || 'Units'],
                    ['Quantity on Hand', selected.quantityOnHand ?? '—'],
                  ].map(([label, val]) => (
                    <div key={label as string} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <span className="text-slate-500 dark:text-slate-400">{label}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{val as string}</span>
                    </div>
                  ))}
                  {selected.isSubscription && (
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Billing Cycle</span>
                      <span className="badge badge-indigo">{selected.billingCycle}</span>
                    </div>
                  )}
                </div>

                {/* Variants */}
                {selected.variants?.length > 0 && (
                  <div>
                    <p className="type-subheading text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                      Configured Variants
                    </p>
                    <div className="space-y-1.5">
                      {selected.variants.map((v: any) => (
                        <div key={v.id} className="flex justify-between items-center text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">{v.attributeName}: <strong className="text-slate-900 dark:text-white">{v.attributeValue}</strong></span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{v.extraPrice > 0 ? `+$${v.extraPrice}` : 'Base'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Categories Panel */}
            <div className="df-card p-5">
              <h3 className="text-heading-3 font-semibold text-slate-900 dark:text-white mb-3">Category Discount Ceilings</h3>
              <div className="space-y-2.5">
                {categories.map((c: any) => (
                  <div key={c.id} className="flex justify-between items-center type-body-base p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{c.name}</span>
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
