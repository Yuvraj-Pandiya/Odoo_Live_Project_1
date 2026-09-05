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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Product Catalog</h1>
            <p className="text-sm mt-1" style={{ color: 'hsl(215 20% 65%)' }}>Manage products, variants, and price lists</p>
          </div>
          <button className="btn-primary"><Plus size={14} /> New Product</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Products', value: products.length },
            { label: 'Categories',     value: categories.length },
            { label: 'Subscriptions',  value: products.filter(p => p.isSubscription).length },
          ].map(s => (
            <div key={s.label} className="glass-card p-4">
              <p className="text-xs" style={{ color: 'hsl(215 20% 65%)' }}>{s.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{loading ? '—' : s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2 glass-card overflow-hidden">
            <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'hsl(222 47% 22%)' }}>
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(215 15% 45%)' }} />
                <input className="input text-sm" style={{ paddingLeft: '2rem' }} placeholder="Search products…"
                       value={search} onChange={e => setSearch(e.target.value)} />
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
                    <tr><td colSpan={7} className="text-center py-8" style={{ color: 'hsl(215 15% 45%)' }}>Loading…</td></tr>
                  ) : filtered.map((p: any) => (
                    <tr key={p.id} onClick={() => setSelected(p)}>
                      <td className="font-medium text-white">{p.name}</td>
                      <td className="font-mono text-xs" style={{ color: 'hsl(215 20% 65%)' }}>{p.sku || '—'}</td>
                      <td style={{ color: 'hsl(215 20% 65%)' }}>{p.category?.name || '—'}</td>
                      <td className="font-semibold" style={{ color: 'hsl(142 70% 60%)' }}>${Number(p.basePrice).toLocaleString()}</td>
                      <td>{Number(p.taxPercentage || 0).toFixed(0)}%</td>
                      <td>
                        <span className="badge" style={{
                          background: p.isSubscription ? 'hsl(262 83% 58% / 0.15)' : 'hsl(220 90% 56% / 0.15)',
                          color:      p.isSubscription ? 'hsl(262 83% 72%)' : 'hsl(220 90% 70%)',
                        }}>
                          {p.isSubscription ? 'Subscription' : p.productType}
                        </span>
                      </td>
                      <td><span className={`badge ${p.isActive ? 'badge-success' : 'badge-muted'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail */}
          <div>
            {!selected ? (
              <div className="glass-card p-8 text-center">
                <Package size={24} className="mx-auto mb-3" style={{ color: 'hsl(215 15% 45%)' }} />
                <p className="text-sm" style={{ color: 'hsl(215 20% 65%)' }}>Click a product to view details</p>
              </div>
            ) : (
              <div className="glass-card p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white">{selected.name}</h3>
                    <p className="text-xs mt-0.5 font-mono" style={{ color: 'hsl(215 15% 45%)' }}>{selected.sku}</p>
                  </div>
                  {selected.isPromoted && <span className="badge" style={{ background: 'hsl(38 92% 50% / 0.15)', color: 'hsl(38 92% 65%)' }}>PROMO</span>}
                </div>

                {selected.description && (
                  <p className="text-sm" style={{ color: 'hsl(215 20% 65%)' }}>{selected.description}</p>
                )}

                <div className="space-y-2 text-sm">
                  {[
                    ['Category',   selected.category?.name || '—'],
                    ['Base Price', `$${Number(selected.basePrice).toLocaleString()}`],
                    ['Cost Price', selected.costPrice ? `$${Number(selected.costPrice).toLocaleString()}` : '—'],
                    ['Tax',        `${Number(selected.taxPercentage || 0).toFixed(1)}%`],
                    ['Unit',       selected.unit],
                    ['In Stock',   selected.quantityOnHand],
                  ].map(([label, val]) => (
                    <div key={label as string} className="flex justify-between">
                      <span style={{ color: 'hsl(215 20% 65%)' }}>{label}</span>
                      <span className="font-medium text-white">{val as string}</span>
                    </div>
                  ))}
                  {selected.isSubscription && (
                    <div className="flex justify-between">
                      <span style={{ color: 'hsl(215 20% 65%)' }}>Billing</span>
                      <span className="badge" style={{ background: 'hsl(262 83% 58% / 0.15)', color: 'hsl(262 83% 72%)' }}>{selected.billingCycle}</span>
                    </div>
                  )}
                </div>

                {/* Variants */}
                {selected.variants?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'hsl(215 20% 65%)' }}>VARIANTS</p>
                    <div className="space-y-1">
                      {selected.variants.map((v: any) => (
                        <div key={v.id} className="flex justify-between text-xs px-3 py-1.5 rounded" style={{ background: 'hsl(222 47% 15%)' }}>
                          <span style={{ color: 'hsl(215 20% 65%)' }}>{v.attributeName}: {v.attributeValue}</span>
                          <span className="font-medium text-white">{v.extraPrice > 0 ? `+$${v.extraPrice}` : 'Base'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Categories Panel */}
            <div className="glass-card p-5 mt-4">
              <h3 className="font-semibold text-white text-sm mb-3">Category Discount Ceilings</h3>
              <div className="space-y-2">
                {categories.map((c: any) => (
                  <div key={c.id} className="flex justify-between items-center text-sm">
                    <span style={{ color: 'hsl(215 20% 65%)' }}>{c.name}</span>
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
