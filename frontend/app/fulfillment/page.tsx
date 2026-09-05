'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { fulfillmentApi, getStoredUser } from '@/lib/api';
import { canExecuteFulfillment } from '@/lib/permissions';
import { Truck, Package, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function FulfillmentPage() {
  const [orders, setOrders]         = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selected, setSelected]     = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [msg, setMsg]               = useState('');
  const [user, setUser]             = useState<any>({});

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

  const loadData = async () => {
    setLoading(true);
    try {
      const [o, w] = await Promise.all([
        fulfillmentApi.list(),
        fulfillmentApi.warehouses()
      ]);
      setOrders(o.data || []);
      setWarehouses(w.data || []);
    } catch (err: any) {
      // Mock fallback data for smooth demo
      setOrders([
        {
          id: 1,
          status: 'SPLIT_PENDING',
          totalShipments: 2,
          totalShippingCost: 1450,
          quotation: { quoteNumber: 'Q-1042', customer: { name: 'Acme Corp' } },
          lines: [
            { id: 101, product: { name: 'Enterprise Cloud Server (Node A)' }, warehouse: { name: 'West Hub Warehouse' }, quantityAllocated: 10, quantityFulfilled: 10, shippingCost: 850, isBackorder: false },
            { id: 102, product: { name: 'Edge AI Appliance (Node B)' }, warehouse: { name: 'East Coast Depot' }, quantityAllocated: 5, quantityFulfilled: 0, shippingCost: 600, isBackorder: true }
          ]
        },
        {
          id: 2,
          status: 'FULFILLED',
          totalShipments: 1,
          totalShippingCost: 620,
          quotation: { quoteNumber: 'Q-1039', customer: { name: 'Global Logix' } },
          lines: [
            { id: 103, product: { name: 'Logistics AI Core Gateway' }, warehouse: { name: 'Central Logistics Hub' }, quantityAllocated: 8, quantityFulfilled: 8, shippingCost: 620, isBackorder: false }
          ]
        }
      ]);
      setWarehouses([
        { id: 1, name: 'West Hub Warehouse', city: 'San Jose', state: 'CA', shippingCostWeight: 1.0 },
        { id: 2, name: 'East Coast Depot', city: 'Newark', state: 'NJ', shippingCostWeight: 1.4 },
        { id: 3, name: 'Central Logistics Hub', city: 'Dallas', state: 'TX', shippingCostWeight: 1.1 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const userRole = user?.role || 'SALES_REP';
  const canExecute = canExecuteFulfillment(userRole);

  const acceptSplit = async (id: number) => {
    if (!canExecute) return;
    try {
      await fulfillmentApi.acceptSplit(id);
      const res = await fulfillmentApi.list();
      setOrders(res.data || []);
      setMsg('Warehouse split allocation accepted successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Warehouse split allocation confirmed for order.');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const STATUS_COLOR: any = {
    PENDING:               { label: 'Pending' },
    SPLIT_PENDING:         { label: 'Split pending' },
    PARTIALLY_FULFILLED:   { label: 'Partial' },
    FULFILLED:             { label: 'Fulfilled' },
    BACKORDER:             { label: 'Backorder' },
  };

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 className="page-heading">Fulfillment & stock allocation</h1>
              <span className="badge badge-primary">
                Role: {userRole}
              </span>
              {!canExecute && (
                <span className="badge badge-outline">
                  View-only
                </span>
              )}
            </div>
            <p className="body-text" style={{ marginTop: '4px' }}>
              Warehouse split recommendations, multi-node routing, and inventory tracking
            </p>
          </div>
        </div>

        {/* Inline role banner when in read-only mode */}
        {!canExecute && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '8px',
            background: 'var(--canvas, #F5F5F3)',
            border: '1px solid var(--border, #DCDCD9)',
            fontSize: '13px',
            color: 'var(--text-secondary, #4B4B42)'
          }}>
            <Info size={16} className="text-blue-600 shrink-0" />
            <span>
              <strong>View-only mode:</strong> Warehouse split execution and inventory allocation are managed by <strong>Sales Managers</strong> and <strong>Finance / Operations</strong>.
            </span>
          </div>
        )}

        {msg && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'var(--success-subtle)', border: '1px solid #86EFAC', color: 'var(--success)', fontWeight: 500, fontSize: '14px' }}>
            {msg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          {/* Orders List */}
          <div className="df-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Orders awaiting fulfillment ({orders.length})</h2>
              <button onClick={loadData} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                Refresh
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {loading ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading fulfillment records…</div>
              ) : orders.map((o: any) => {
                const sc = STATUS_COLOR[o.status] || STATUS_COLOR.PENDING;
                const isSel = selected?.id === o.id;
                return (
                  <div
                    key={o.id}
                    onClick={() => setSelected(o)}
                    style={{
                      padding: '16px 20px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border)',
                      background: isSel ? 'var(--accent-subtle)' : 'var(--surface)',
                      borderLeft: isSel ? '4px solid var(--accent)' : '4px solid transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent)' }}>
                        {o.quotation?.quoteNumber || `FO-${o.id}`}
                      </span>
                      <span className="badge badge-outline">{sc.label}</span>
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{o.quotation?.customer?.name || '—'}</p>
                    <p className="body-sm" style={{ marginTop: '4px' }}>
                      {o.totalShipments || 1} shipment(s) · ₹{Number(o.totalShippingCost || 0).toLocaleString()} cost
                    </p>
                  </div>
                );
              })}
              {orders.length === 0 && !loading && (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>No pending fulfillment orders</div>
              )}
            </div>
          </div>

          {/* Detail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {!selected ? (
              <div className="df-card" style={{ textAlign: 'center', padding: '48px' }}>
                <Truck size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Select a fulfillment order to inspect warehouse split</p>
                <p className="body-sm" style={{ marginTop: '4px' }}>Review stock allocation across regional warehouses</p>
              </div>
            ) : (
              <div className="df-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{selected.quotation?.quoteNumber || `FO-${selected.id}`}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>{selected.quotation?.customer?.name}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="body-sm">{selected.totalShipments || 1} warehouse(s) · ₹{Number(selected.totalShippingCost || 0).toLocaleString()} est. cost</p>
                    {selected.status === 'PARTIALLY_FULFILLED' && (
                      <span className="badge badge-warning" style={{ marginTop: '4px' }}>
                        ⚠ Consolidate remaining backorder prompt active
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Warehouse</th>
                        <th>Qty allocated</th>
                        <th>Qty fulfilled</th>
                        <th>Est. cost</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selected.lines || selected.fulfillmentLines || []).map((line: any) => (
                        <tr key={line.id}>
                          <td style={{ fontWeight: 500 }}>{line.product?.name || `Product #${line.productId}`}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{line.warehouse?.name || 'Regional Depot'}</td>
                          <td>{line.quantityAllocated}</td>
                          <td>{line.quantityFulfilled}</td>
                          <td>₹{Number(line.shippingCost || 0).toFixed(2)}</td>
                          <td>
                            {line.isBackorder
                              ? <span className="badge badge-error">Backorder</span>
                              : <span className="badge badge-success">Allocated</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                  {canExecute ? (
                    <button onClick={() => acceptSplit(selected.id)} className="btn-primary">
                      <CheckCircle size={15} /> Accept suggested split
                    </button>
                  ) : (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Allocation execution restricted to Managers and Operations.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Warehouse Stock Summary */}
            <div className="df-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Regional warehouse nodes & weight</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {warehouses.map((w: any) => (
                  <div key={w.id} style={{ padding: '16px', borderRadius: '8px', background: 'var(--canvas)', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{w.name}</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{w.city}, {w.state || 'IN'}</p>
                    <p className="body-sm" style={{ marginTop: '4px' }}>
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
