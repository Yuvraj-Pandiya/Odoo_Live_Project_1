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
    PENDING:               { text: 'hsl(215 20% 65%)',  label: 'Pending' },
    SPLIT_PENDING:         { text: 'hsl(38 92% 65%)',   label: 'Split Pending' },
    PARTIALLY_FULFILLED:   { text: 'hsl(262 83% 72%)', label: 'Partial' },
    FULFILLED:             { text: 'hsl(142 70% 60%)', label: 'Fulfilled' },
    BACKORDER:             { text: 'hsl(0 84% 70%)',   label: 'Backorder' },
  };

  if ((forbidden || !hasAccess) && !loading) {
    return (
      <AppLayout>
        <div className="p-8 max-w-4xl mx-auto space-y-6">
          <div className="glass-card p-8 text-center space-y-4 border border-blue-500/30">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-xl font-bold text-white">Warehouse & Fulfillment Operations</h2>
            <p className="text-sm text-slate-300 max-w-lg mx-auto">
              You are signed in as <strong className="text-blue-400">{user.fullName || user.email || 'User'}</strong> ({userRole}).
              Warehouse inventory allocation and fulfillment order execution is restricted to <strong>Sales Managers</strong> and <strong>System Admins</strong>.
            </p>
            <div className="pt-4 flex items-center justify-center gap-4">
              <Link href="/quotations" className="btn-primary">
                View Quotations
              </Link>
              <Link href="/dashboard" className="btn-secondary">
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="df-page-container flex flex-col" style={{ gap: 'var(--space-xl)' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-heading-1 text-slate-900">Fulfillment & Stock Allocation</h1>
              <span className="badge badge-primary">
                ROLE: {userRole}
              </span>
            </div>
            <p className="text-body-lg text-slate-600 mt-1">Warehouse split recommendations, multi-node routing, and stock availability</p>
          </div>
        </div>

        {msg && <div className="p-4 rounded-xl text-body-base font-medium bg-emerald-50 border border-emerald-200 text-emerald-800">{msg}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-heading-3 text-slate-900">Orders Awaiting Fulfillment ({orders.length})</h2>
              <button onClick={loadData} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer">
                Refresh
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-6 text-center text-body-base text-slate-500">Loading fulfillment records…</div>
              ) : orders.map((o: any) => {
                const sc = STATUS_COLOR[o.status] || STATUS_COLOR.PENDING;
                return (
                  <div
                    key={o.id}
                    onClick={() => setSelected(o)}
                    className={`p-4 cursor-pointer transition-all ${selected?.id === o.id ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-subheading font-mono font-bold text-slate-900">
                        {o.quotation?.quoteNumber || `FO-${o.id}`}
                      </span>
                      <span className="badge badge-outline">{sc.label}</span>
                    </div>
                    <p className="text-body-base font-semibold text-slate-800">{o.quotation?.customer?.name || '—'}</p>
                    <p className="text-caption text-slate-500 mt-1">
                      {o.totalShipments || 1} shipment(s) · ₹{Number(o.totalShippingCost || 0).toLocaleString()} cost
                    </p>
                  </div>
                );
              })}
              {orders.length === 0 && !loading && (
                <div className="p-8 text-center text-body-base text-slate-500">No pending fulfillment orders</div>
              )}
            </div>
          </div>

          {/* Detail */}
          <div className="lg:col-span-2 space-y-6">
            {!selected ? (
              <div className="rounded-xl p-12 text-center bg-white border border-slate-200 shadow-xs">
                <Truck size={28} className="mx-auto mb-3 text-slate-400" />
                <p className="text-heading-3 text-slate-800">Select a fulfillment order to inspect warehouse split</p>
                <p className="text-body-base text-slate-500 mt-1">Review stock allocation across regional warehouses</p>
              </div>
            ) : (
              <div className="rounded-xl p-6 bg-white border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-heading-3 text-slate-900">{selected.quotation?.quoteNumber || `FO-${selected.id}`}</h3>
                    <p className="text-body-base text-slate-600">{selected.quotation?.customer?.name}</p>
                  </div>
                  <div className="text-right text-caption text-slate-500">
                    <p>{selected.totalShipments || 1} warehouse(s) · ₹{Number(selected.totalShippingCost || 0).toLocaleString()} est. cost</p>
                    {selected.status === 'PARTIALLY_FULFILLED' && (
                      <p className="mt-1 text-xs px-2 py-1 rounded font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        ⚠ Consolidate Remaining Backorder prompt active
                      </p>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
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
                      {(selected.lines || selected.fulfillmentLines || []).map((line: any) => (
                        <tr key={line.id}>
                          <td className="font-medium text-slate-900">{line.product?.name || `Product #${line.productId}`}</td>
                          <td className="text-slate-600">{line.warehouse?.name || 'Regional Depot'}</td>
                          <td><span>{line.quantityAllocated}</span></td>
                          <td><span>{line.quantityFulfilled}</span></td>
                          <td><span>₹{Number(line.shippingCost || 0).toFixed(2)}</span></td>
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

                <div className="flex gap-3 pt-2">
                  <button onClick={() => acceptSplit(selected.id)} className="btn-primary text-body-base">
                    <CheckCircle size={15} /> Accept Suggested Split
                  </button>
                </div>
              </div>
            )}

            {/* Warehouse Stock Summary */}
            <div className="rounded-xl p-6 bg-white border border-slate-200 shadow-xs">
              <h3 className="text-heading-3 text-slate-900 mb-4">Regional Warehouse Nodes & Weight</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {warehouses.map((w: any) => (
                  <div key={w.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-subheading font-bold text-slate-900">{w.name}</p>
                    <p className="text-body-base text-slate-600 mt-0.5">{w.city}, {w.state || 'IN'}</p>
                    <p className="text-caption text-slate-500 mt-1">
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
