'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { fulfillmentApi, getStoredUser } from '@/lib/api';
import { Truck, Package, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export default function FulfillmentPage() {
  const [orders, setOrders]         = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selected, setSelected]     = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [msg, setMsg]               = useState('');
  const [user, setUser]             = useState<any>({});
  const [forbidden, setForbidden]   = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = getStoredUser();
      setUser(u);
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    setForbidden(false);
    try {
      const [o, w] = await Promise.all([
        fulfillmentApi.list(),
        fulfillmentApi.warehouses()
      ]);
      setOrders(o.data || []);
      setWarehouses(w.data || []);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setForbidden(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const userRole = user.role || 'SALES_REP';
  const hasAccess = ['ADMIN', 'MANAGER'].includes(userRole);

  const acceptSplit = async (id: number) => {
    try {
      await fulfillmentApi.acceptSplit(id);
      const res = await fulfillmentApi.list();
      setOrders(res.data || []);
      setMsg('Warehouse split allocation accepted successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Failed to accept split allocation');
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

  if ((forbidden || !hasAccess) && !loading) {
    return (
      <AppLayout>
        <div style={{ maxWidth: '768px', margin: '0 auto' }}>
          <div className="df-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={32} />
            </div>
            <h2 className="page-heading">Warehouse & fulfillment operations</h2>
            <p className="body-text">
              You are signed in as <strong>{user.fullName || user.email || 'User'}</strong> ({userRole}).
              Warehouse inventory allocation and fulfillment order execution is restricted to <strong>Sales Managers</strong> and <strong>System Admins</strong>.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <Link href="/quotations" className="btn-primary">
                View quotations
              </Link>
              <Link href="/dashboard" className="btn-secondary">
                Return to dashboard
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

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
            </div>
            <p className="body-text" style={{ marginTop: '4px' }}>Warehouse split recommendations, multi-node routing, and stock availability</p>
          </div>
        </div>

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
                  <button onClick={() => acceptSplit(selected.id)} className="btn-primary">
                    <CheckCircle size={15} /> Accept suggested split
                  </button>
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
