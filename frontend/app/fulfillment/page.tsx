'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { fulfillmentApi } from '@/lib/api';
import { Truck, Package, AlertTriangle, CheckCircle } from 'lucide-react';

export default function FulfillmentPage() {
  const [orders, setOrders]         = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selected, setSelected]     = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [msg, setMsg]               = useState('');

  useEffect(() => {
    (async () => {
      const [o, w] = await Promise.all([fulfillmentApi.list(), fulfillmentApi.warehouses()]);
      setOrders(o.data); setWarehouses(w.data);
      setLoading(false);
    })();
  }, []);

  const acceptSplit = async (id: number) => {
    await fulfillmentApi.acceptSplit(id);
    const res = await fulfillmentApi.list();
    setOrders(res.data);
    setMsg('Split accepted!');
    setTimeout(() => setMsg(''), 2000);
  };

  const STATUS_COLOR: any = {
    PENDING:               { text: 'hsl(215 20% 65%)',  label: 'Pending' },
    SPLIT_PENDING:         { text: 'hsl(38 92% 65%)',   label: 'Split Pending' },
    PARTIALLY_FULFILLED:   { text: 'hsl(262 83% 72%)', label: 'Partial' },
    FULFILLED:             { text: 'hsl(142 70% 60%)', label: 'Fulfilled' },
    BACKORDER:             { text: 'hsl(0 84% 70%)',   label: 'Backorder' },
  };

  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Fulfillment & Stock</h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(215 20% 65%)' }}>Warehouse split recommendations and stock availability</p>
        </div>

        {msg && <div className="p-3 rounded-lg text-sm" style={{ background: 'hsl(142 70% 45% / 0.1)', color: 'hsl(142 70% 60%)' }}>{msg}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b" style={{ borderColor: 'hsl(222 47% 22%)' }}>
              <h2 className="font-semibold text-white text-sm">Orders Awaiting Fulfillment</h2>
            </div>
            <div className="divide-y" style={{ borderColor: 'hsl(222 47% 22%)' }}>
              {loading ? (
                <div className="p-6 text-center text-sm" style={{ color: 'hsl(215 20% 65%)' }}>Loading…</div>
              ) : orders.map((o: any) => {
                const sc = STATUS_COLOR[o.status] || STATUS_COLOR.PENDING;
                return (
                  <div key={o.id} onClick={() => setSelected(o)} className="p-4 cursor-pointer transition-all"
                       style={{ background: selected?.id === o.id ? 'hsl(220 90% 56% / 0.08)' : 'transparent' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold" style={{ color: 'hsl(220 90% 70%)' }}>
                        {o.quotation?.quoteNumber || `FO-${o.id}`}
                      </span>
                      <span className="text-xs font-medium" style={{ color: sc.text }}>{sc.label}</span>
                    </div>
                    <p className="text-sm font-medium text-white">{o.quotation?.customer?.name || '—'}</p>
                    <p className="text-xs mt-1" style={{ color: 'hsl(215 20% 65%)' }}>
                      {o.totalShipments} shipments · ${Number(o.totalShippingCost || 0).toLocaleString()} cost
                    </p>
                  </div>
                );
              })}
              {orders.length === 0 && !loading && (
                <div className="p-8 text-center text-sm" style={{ color: 'hsl(215 15% 45%)' }}>No fulfillment orders</div>
              )}
            </div>
          </div>

          {/* Detail */}
          <div className="lg:col-span-2">
            {!selected ? (
              <div className="glass-card p-12 text-center">
                <Truck size={28} className="mx-auto mb-3" style={{ color: 'hsl(215 15% 45%)' }} />
                <p className="text-sm" style={{ color: 'hsl(215 20% 65%)' }}>Select an order to see the warehouse split</p>
              </div>
            ) : (
              <div className="glass-card p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white">{selected.quotation?.quoteNumber}</h3>
                    <p className="text-sm" style={{ color: 'hsl(215 20% 65%)' }}>{selected.quotation?.customer?.name}</p>
                  </div>
                  <div className="text-right text-xs" style={{ color: 'hsl(215 20% 65%)' }}>
                    <p>{selected.totalShipments} warehouses · ${Number(selected.totalShippingCost || 0).toLocaleString()} est. cost</p>
                    {selected.status === 'PARTIALLY_FULFILLED' && (
                      <p className="mt-1 text-xs px-2 py-1 rounded" style={{ background: 'hsl(38 92% 50% / 0.1)', color: 'hsl(38 92% 65%)' }}>
                        ⚠ Consolidate Remaining Backorder prompt active
                      </p>
                    )}
                  </div>
                </div>

                <table className="df-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Warehouse</th>
                      <th>Qty Allocated</th>
                      <th>Qty Fulfilled</th>
                      <th>Est. Cost</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.lines?.map((line: any) => (
                      <tr key={line.id}>
                        <td className="font-medium text-white">{line.product?.name}</td>
                        <td style={{ color: 'hsl(215 20% 65%)' }}>{line.warehouse?.name}</td>
                        <td>{line.quantityAllocated}</td>
                        <td>{line.quantityFulfilled}</td>
                        <td>${Number(line.shippingCost || 0).toFixed(2)}</td>
                        <td>
                          {line.isBackorder
                            ? <span className="badge badge-danger">Backorder</span>
                            : <span className="badge badge-success">Allocated</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex gap-3">
                  <button onClick={() => acceptSplit(selected.id)} className="btn-primary">
                    <CheckCircle size={14} /> Accept Suggested Split
                  </button>
                  <button className="btn-secondary">
                    <Package size={14} /> Manual Override
                  </button>
                </div>
              </div>
            )}

            {/* Warehouse Stock Summary */}
            <div className="glass-card p-5 mt-4">
              <h3 className="font-semibold text-white text-sm mb-4">Warehouse Inventory</h3>
              <div className="grid grid-cols-3 gap-3">
                {warehouses.map((w: any) => (
                  <div key={w.id} className="p-3 rounded-lg" style={{ background: 'hsl(222 47% 15%)', border: '1px solid hsl(222 47% 22%)' }}>
                    <p className="text-xs font-semibold text-white">{w.name}</p>
                    <p className="text-xs mt-1" style={{ color: 'hsl(215 20% 65%)' }}>{w.city}</p>
                    <p className="text-xs mt-1" style={{ color: 'hsl(215 15% 45%)' }}>
                      Weight: {Number(w.shippingCostWeight || 1).toFixed(1)}x
                    </p>
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
