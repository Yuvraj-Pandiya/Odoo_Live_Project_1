'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { quotationApi, customerApi, productApi } from '@/lib/api';
import { Plus, X, ChevronDown, TrendingUp, TrendingDown, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const STATUS_BADGE: any = {
  DRAFT:            { bg: 'hsl(215 15% 45% / 0.15)', text: 'hsl(215 20% 65%)' },
  PENDING_APPROVAL: { bg: 'hsl(38 92% 50% / 0.15)',  text: 'hsl(38 92% 65%)' },
  APPROVED:         { bg: 'hsl(142 70% 45% / 0.15)', text: 'hsl(142 70% 60%)' },
  REJECTED:         { bg: 'hsl(0 84% 60% / 0.15)',   text: 'hsl(0 84% 70%)' },
  CONFIRMED:        { bg: 'hsl(220 90% 56% / 0.15)', text: 'hsl(220 90% 70%)' },
  NEGOTIATION:      { bg: 'hsl(262 83% 58% / 0.15)', text: 'hsl(262 83% 72%)' },
};

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [customers, setCustomers]   = useState<any[]>([]);
  const [products, setProducts]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showNew, setShowNew]       = useState(false);
  const [selCustomer, setSelCustomer] = useState('');
  const [activeQ, setActiveQ]       = useState<any>(null);
  const [newLine, setNewLine]       = useState({ productId: '', quantity: 1, discountPct: 0 });
  const [upsellSuggestions, setUpsellSuggestions] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg]               = useState('');

  const load = async () => {
    setLoading(true);
    const [q, c, p] = await Promise.all([quotationApi.list(), customerApi.list(), productApi.list()]);
    setQuotations(q.data); setCustomers(c.data); setProducts(p.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const createQuotation = async () => {
    if (!selCustomer) return;
    const res = await quotationApi.create(Number(selCustomer));
    setActiveQ(res.data);
    setQuotations(prev => [res.data, ...prev]);
    setShowNew(false);
  };

  const addLine = async () => {
    if (!activeQ || !newLine.productId) return;
    const res = await quotationApi.addLine(activeQ.id, newLine);
    setActiveQ(res.data);
    // Refresh upsell suggestions based on cart
    const lineProductIds = res.data.lines?.map((l: any) => l.product?.id).filter(Boolean) || [];
    if (lineProductIds.length > 0) {
      const us = await productApi.upsell(lineProductIds);
      setUpsellSuggestions(us.data.slice(0, 3));
    }
    setMsg('Line added successfully');
    setTimeout(() => setMsg(''), 2000);
  };

  const addUpsell = async (suggestProductId: number) => {
    if (!activeQ) return;
    await quotationApi.addLine(activeQ.id, { productId: suggestProductId, quantity: 1, discountPct: 0 });
    const res = await quotationApi.get(activeQ.id);
    setActiveQ(res.data);
    setUpsellSuggestions(prev => prev.filter(u => u.suggestProduct?.id !== suggestProductId));
    setMsg('Upsell added! Margin updated.');
    setTimeout(() => setMsg(''), 2500);
  };

  const submitForApproval = async () => {
    if (!activeQ) return;
    setSubmitting(true);
    try {
      const res = await quotationApi.submit(activeQ.id);
      setActiveQ(res.data);
      setQuotations(prev => prev.map(q => q.id === res.data.id ? res.data : q));
      setMsg(res.data.status === 'APPROVED' ? '✓ Auto-approved — moving to fulfillment' : '→ Submitted for manager approval');
    } catch (e: any) {
      setMsg(e.response?.data?.message || 'Error submitting');
    }
    setSubmitting(false);
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Quotations</h1>
            <p className="text-sm mt-1" style={{ color: 'hsl(215 20% 65%)' }}>Build, manage, and track all deal quotations</p>
          </div>
          <button onClick={() => setShowNew(true)} className="btn-primary">
            <Plus size={15} /> New Quotation
          </button>
        </div>

        {/* New Quotation Modal */}
        {showNew && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'hsl(222 47% 7% / 0.8)', backdropFilter: 'blur(4px)' }}>
            <div className="glass-card p-6 w-full max-w-md animate-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Create New Quotation</h3>
                <button onClick={() => setShowNew(false)}><X size={16} style={{ color: 'hsl(215 20% 65%)' }} /></button>
              </div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'hsl(215 20% 65%)' }}>Select Customer</label>
              <select className="input mb-4" value={selCustomer} onChange={e => setSelCustomer(e.target.value)}>
                <option value="">— Choose customer —</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.tier})</option>
                ))}
              </select>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowNew(false)} className="btn-secondary">Cancel</button>
                <button onClick={createQuotation} className="btn-primary" disabled={!selCustomer}>Create</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quotation List */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b" style={{ borderColor: 'hsl(222 47% 22%)' }}>
              <h2 className="font-semibold text-white text-sm">All Quotations</h2>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 260px)' }}>
              {loading ? (
                <div className="p-6 text-center text-sm" style={{ color: 'hsl(215 20% 65%)' }}>Loading…</div>
              ) : quotations.map((q: any) => {
                const sc = STATUS_BADGE[q.status] || STATUS_BADGE.DRAFT;
                const isActive = activeQ?.id === q.id;
                return (
                  <div key={q.id} onClick={() => setActiveQ(q)}
                       className="p-4 cursor-pointer transition-all border-b"
                       style={{
                         borderColor: 'hsl(222 47% 22%)',
                         background: isActive ? 'hsl(220 90% 56% / 0.08)' : 'transparent',
                         borderLeft: isActive ? '3px solid hsl(220 90% 56%)' : '3px solid transparent',
                       }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold" style={{ color: 'hsl(220 90% 70%)' }}>{q.quoteNumber}</span>
                      <span className="badge text-[10px]" style={sc}>{q.status?.replace(/_/g,' ')}</span>
                    </div>
                    <p className="text-sm font-medium text-white">{q.customer?.name || '—'}</p>
                    <p className="text-xs font-semibold mt-1" style={{ color: 'hsl(142 70% 60%)' }}>
                      ${Number(q.grandTotal || 0).toLocaleString()}
                    </p>
                  </div>
                );
              })}
              {quotations.length === 0 && !loading && (
                <div className="p-8 text-center text-sm" style={{ color: 'hsl(215 15% 45%)' }}>
                  No quotations yet.<br />Click "New Quotation" to start.
                </div>
              )}
            </div>
          </div>

          {/* Quotation Builder */}
          <div className="lg:col-span-2 space-y-4">
            {!activeQ ? (
              <div className="glass-card p-12 text-center">
                <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'hsl(220 90% 56% / 0.15)' }}>
                  <Zap size={20} style={{ color: 'hsl(220 90% 70%)' }} />
                </div>
                <p className="text-white font-medium">Select or create a quotation</p>
                <p className="text-sm mt-2" style={{ color: 'hsl(215 20% 65%)' }}>Click a quotation from the list or create a new one</p>
              </div>
            ) : (
              <>
                {/* Quote Header */}
                <div className="glass-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-lg font-bold text-white">{activeQ.quoteNumber}</h2>
                      <p className="text-sm" style={{ color: 'hsl(215 20% 65%)' }}>{activeQ.customer?.name || '—'} · {activeQ.customer?.tier}</p>
                    </div>
                    <div className="text-right">
                      {activeQ.riskLevel && (
                        <div className="badge mb-1"
                             style={{ background: activeQ.riskLevel === 'HIGH' ? 'hsl(0 84% 60% / 0.15)' : activeQ.riskLevel === 'MEDIUM' ? 'hsl(38 92% 50% / 0.15)' : 'hsl(142 70% 45% / 0.15)',
                                      color: activeQ.riskLevel === 'HIGH' ? 'hsl(0 84% 70%)' : activeQ.riskLevel === 'MEDIUM' ? 'hsl(38 92% 65%)' : 'hsl(142 70% 60%)' }}>
                          Risk: {activeQ.riskLevel}
                        </div>
                      )}
                      <p className="text-xl font-bold text-white">${Number(activeQ.grandTotal || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  {activeQ.blendedRiskScore != null && (
                    <div className="text-xs px-3 py-1.5 rounded-lg inline-block" style={{ background: 'hsl(222 47% 15%)', color: 'hsl(215 20% 65%)' }}>
                      Blended Risk Score: <strong style={{ color: 'hsl(38 92% 65%)' }}>{Number(activeQ.blendedRiskScore).toFixed(2)}</strong>
                    </div>
                  )}
                </div>

                {/* Line Items */}
                <div className="glass-card overflow-hidden">
                  <div className="p-4 border-b" style={{ borderColor: 'hsl(222 47% 22%)' }}>
                    <h3 className="font-semibold text-white text-sm">Line Items</h3>
                  </div>
                  {activeQ.lines?.length > 0 ? (
                    <table className="df-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Type</th>
                          <th>Qty</th>
                          <th>Unit Price</th>
                          <th>Discount</th>
                          <th>Limit</th>
                          <th>Total</th>
                          <th>Margin</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeQ.lines?.map((line: any) => {
                          const over = Number(line.discountPct) > Number(line.discountAllowed);
                          return (
                            <tr key={line.id}>
                              <td className="font-medium text-white">{line.product?.name || '—'}</td>
                              <td><span className="badge badge-muted">{line.lineType}</span></td>
                              <td>{line.quantity}</td>
                              <td>${Number(line.unitPrice).toLocaleString()}</td>
                              <td className="font-semibold" style={{ color: over ? 'hsl(0 84% 70%)' : 'hsl(142 70% 60%)' }}>{Number(line.discountPct).toFixed(1)}%</td>
                              <td style={{ color: 'hsl(215 20% 65%)' }}>{Number(line.discountAllowed).toFixed(1)}%</td>
                              <td className="font-semibold text-white">${Number(line.lineTotal).toLocaleString()}</td>
                              <td style={{ color: 'hsl(142 70% 60%)' }}>{Number(line.marginPct || 0).toFixed(1)}%</td>
                              <td>
                                {over
                                  ? <span className="badge badge-danger">OVER +{(Number(line.discountPct) - Number(line.discountAllowed)).toFixed(0)}pt</span>
                                  : <span className="badge badge-success">OK</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <p className="p-6 text-sm text-center" style={{ color: 'hsl(215 15% 45%)' }}>No lines yet. Add products below.</p>
                  )}
                </div>

                {/* Add Line Form */}
                {(activeQ.status === 'DRAFT' || activeQ.status === 'NEGOTIATION') && (
                  <div className="glass-card p-5">
                    <h3 className="font-semibold text-white text-sm mb-4">Add Product Line</h3>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="col-span-1">
                        <label className="block text-xs mb-1" style={{ color: 'hsl(215 20% 65%)' }}>Product</label>
                        <select className="input text-sm" value={newLine.productId} onChange={e => setNewLine(p => ({ ...p, productId: e.target.value }))}>
                          <option value="">Select product</option>
                          {products.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.name} — ${p.basePrice}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs mb-1" style={{ color: 'hsl(215 20% 65%)' }}>Quantity</label>
                        <input type="number" min={1} className="input text-sm" value={newLine.quantity}
                               onChange={e => setNewLine(p => ({ ...p, quantity: Number(e.target.value) }))} />
                      </div>
                      <div>
                        <label className="block text-xs mb-1" style={{ color: 'hsl(215 20% 65%)' }}>Discount %</label>
                        <input type="number" min={0} max={100} step={0.5} className="input text-sm" value={newLine.discountPct}
                               onChange={e => setNewLine(p => ({ ...p, discountPct: Number(e.target.value) }))} />
                      </div>
                    </div>
                    <button onClick={addLine} className="btn-primary text-sm" disabled={!newLine.productId}>
                      <Plus size={14} /> Add Line
                    </button>
                  </div>
                )}

                {/* Upsell Panel */}
                {upsellSuggestions.length > 0 && (
                  <div className="glass-card p-5" style={{ border: '1px solid hsl(262 83% 58% / 0.3)' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <Zap size={14} style={{ color: 'hsl(262 83% 72%)' }} />
                      <h3 className="font-semibold text-sm text-white">Upsell & Cross-Sell Suggestions</h3>
                    </div>
                    <div className="space-y-3">
                      {upsellSuggestions.map((u: any) => (
                        <div key={u.id} className="flex items-center justify-between p-3 rounded-lg"
                             style={{ background: 'hsl(262 83% 58% / 0.08)', border: '1px solid hsl(262 83% 58% / 0.2)' }}>
                          <div>
                            <p className="text-sm font-medium text-white">{u.suggestProduct?.name}</p>
                            <p className="text-xs" style={{ color: 'hsl(215 20% 65%)' }}>
                              ${u.suggestProduct?.basePrice}
                              {u.isPromoted && <span className="ml-2 badge" style={{ background: 'hsl(262 83% 58% / 0.2)', color: 'hsl(262 83% 72%)' }}>PROMO</span>}
                            </p>
                          </div>
                          <button onClick={() => addUpsell(u.suggestProduct?.id)} className="btn-primary text-xs py-1.5 px-3">
                            Add to Quote
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Totals + Actions */}
                {activeQ.lines?.length > 0 && (
                  <div className="glass-card p-5">
                    <div className="grid grid-cols-3 gap-4 mb-5 text-center">
                      <div>
                        <p className="text-xs" style={{ color: 'hsl(215 20% 65%)' }}>Subtotal</p>
                        <p className="font-semibold text-white">${Number(activeQ.subtotal || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: 'hsl(215 20% 65%)' }}>Tax</p>
                        <p className="font-semibold text-white">${Number(activeQ.taxTotal || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: 'hsl(215 20% 65%)' }}>Grand Total</p>
                        <p className="text-lg font-bold text-white">${Number(activeQ.grandTotal || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {activeQ.status === 'DRAFT' && (
                        <button onClick={submitForApproval} className="btn-primary flex-1 justify-center" disabled={submitting}>
                          {submitting ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <CheckCircle size={14} />}
                          Submit for Approval
                        </button>
                      )}
                      <Link href={`/quotations/${activeQ.id}`} className="btn-secondary flex-1 justify-center text-center">
                        View Full Details
                      </Link>
                    </div>
                    {msg && (
                      <div className="mt-3 p-2 rounded-lg text-center text-sm" style={{ background: 'hsl(220 90% 56% / 0.1)', color: 'hsl(220 90% 70%)' }}>
                        {msg}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
