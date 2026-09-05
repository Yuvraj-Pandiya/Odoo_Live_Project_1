'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { portalApi } from '@/lib/api';
import { MessageSquare, CheckCircle, TrendingUp, Send } from 'lucide-react';

export default function CustomerPortalPage() {
  const params = useParams();
  const token  = params?.token as string;

  const [quotation, setQuotation]   = useState<any>(null);
  const [comments, setComments]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [message, setMessage]       = useState('');
  const [counterDiscount, setCounter] = useState('');
  const [lineId, setLineId]         = useState('');
  const [msg, setMsg]               = useState('');
  const [confirmed, setConfirmed]   = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [q, c] = await Promise.all([portalApi.view(token), portalApi.comments(token)]);
        setQuotation(q.data); setComments(c.data);
      } catch { setMsg('Quotation not found or link has expired.'); }
      setLoading(false);
    })();
  }, [token]);

  const submitRequest = async () => {
    if (!message.trim()) return;
    try {
      const res = await portalApi.negotiate(token, {
        message,
        lineId: lineId ? Number(lineId) : null,
        counterDiscount: counterDiscount ? Number(counterDiscount) : null,
      });
      setComments(prev => [...prev, res.data]);
      setMessage(''); setCounter(''); setLineId('');
      setMsg('Request submitted successfully');
    } catch { setMsg('Failed to submit request'); }
    setTimeout(() => setMsg(''), 3000);
  };

  const confirmQuotation = async () => {
    try {
      const res = await portalApi.confirm(token);
      setQuotation(res.data);
      setConfirmed(true);
      setMsg(res.data.status === 'PENDING_APPROVAL'
        ? '⟳ Terms require re-approval — submitted for review'
        : '✓ Quotation confirmed! Order is being processed.');
    } catch { setMsg('Failed to confirm'); }
  };

  const STATUS_LABEL: any = {
    DRAFT: 'Draft', PENDING_APPROVAL: 'Under Review', APPROVED: 'Approved',
    NEGOTIATION: 'Under Negotiation', CONFIRMED: 'Confirmed', FULFILLED: 'Fulfilled',
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(222 47% 7%)' }}>
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!quotation) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(222 47% 7%)' }}>
      <div className="glass-card p-8 text-center max-w-md">
        <p className="text-white font-medium">Quotation not found</p>
        <p className="text-sm mt-2" style={{ color: 'hsl(215 20% 65%)' }}>{msg}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'hsl(222 47% 7%)' }}>
      {/* Header */}
      <header className="border-b p-5 flex items-center justify-between" style={{ background: 'hsl(222 47% 11%)', borderColor: 'hsl(222 47% 22%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(220 90% 56%), hsl(262 83% 58%))' }}>
            <TrendingUp size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white">DealFlow<span style={{ color: 'hsl(262 83% 72%)' }}>360</span> Customer Portal</p>
            <p className="text-xs" style={{ color: 'hsl(215 15% 45%)' }}>Secure quotation view</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-mono font-bold" style={{ color: 'hsl(220 90% 70%)' }}>{quotation.quoteNumber}</p>
          <p className="text-xs px-2 py-0.5 rounded mt-1 inline-block" style={{ background: 'hsl(220 90% 56% / 0.15)', color: 'hsl(220 90% 70%)' }}>
            {STATUS_LABEL[quotation.status] || quotation.status}
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {msg && (
          <div className="p-3 rounded-lg text-sm text-center" style={{ background: 'hsl(220 90% 56% / 0.1)', border: '1px solid hsl(220 90% 56% / 0.2)', color: 'hsl(220 90% 70%)' }}>
            {msg}
          </div>
        )}

        {confirmed && quotation.status === 'CONFIRMED' && (
          <div className="glass-card p-8 text-center" style={{ border: '1px solid hsl(142 70% 45% / 0.3)' }}>
            <CheckCircle size={40} className="mx-auto mb-4" style={{ color: 'hsl(142 70% 60%)' }} />
            <h2 className="text-xl font-bold text-white">Order Confirmed!</h2>
            <p className="mt-2" style={{ color: 'hsl(215 20% 65%)' }}>Your order is now being processed. You will receive updates shortly.</p>
          </div>
        )}

        {/* Quotation Summary */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-4">Quotation Summary</h2>
          <div className="grid grid-cols-3 gap-4 mb-5 text-center">
            <div>
              <p className="text-xs" style={{ color: 'hsl(215 20% 65%)' }}>Customer</p>
              <p className="font-semibold text-white">{quotation.customer?.name || '—'}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'hsl(215 20% 65%)' }}>Valid Until</p>
              <p className="font-semibold text-white">{quotation.validUntil || '30 days'}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'hsl(215 20% 65%)' }}>Grand Total</p>
              <p className="text-xl font-bold text-white">${Number(quotation.grandTotal || 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Line Items */}
          <table className="df-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {quotation.lines?.map((line: any) => (
                <tr key={line.id}>
                  <td className="font-medium text-white">{line.product?.name}</td>
                  <td><span className="badge badge-muted">{line.lineType}</span></td>
                  <td>{line.quantity}</td>
                  <td>${Number(line.unitPrice).toLocaleString()}</td>
                  <td>{Number(line.discountPct).toFixed(1)}%</td>
                  <td className="font-semibold text-white">${Number(line.lineTotal).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Negotiation Panel */}
          {!confirmed && (quotation.status === 'APPROVED' || quotation.status === 'NEGOTIATION' || quotation.status === 'DRAFT') && (
            <div className="glass-card p-6">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare size={14} style={{ color: 'hsl(262 83% 72%)' }} />
                Request Changes / Counter Proposal
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'hsl(215 20% 65%)' }}>Line Item (optional)</label>
                  <select className="input text-sm" value={lineId} onChange={e => setLineId(e.target.value)}>
                    <option value="">General quotation comment</option>
                    {quotation.lines?.map((l: any) => (
                      <option key={l.id} value={l.id}>{l.product?.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'hsl(215 20% 65%)' }}>Counter Discount % (optional)</label>
                  <input type="number" className="input text-sm" min={0} max={50} step={0.5}
                         placeholder="e.g. 20" value={counterDiscount} onChange={e => setCounter(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'hsl(215 20% 65%)' }}>Message</label>
                  <textarea className="input text-sm" rows={3} value={message} onChange={e => setMessage(e.target.value)}
                            placeholder="Describe your request or question…" />
                </div>
                <button onClick={submitRequest} className="btn-primary w-full justify-center" disabled={!message.trim()}>
                  <Send size={14} /> Submit Request
                </button>
              </div>
            </div>
          )}

          {/* Comments Thread */}
          <div className="glass-card p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare size={14} style={{ color: 'hsl(220 90% 70%)' }} />
              Negotiation History
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: 'hsl(215 15% 45%)' }}>No messages yet</p>
              ) : comments.map((c: any) => (
                <div key={c.id} className="p-3 rounded-lg" style={{ background: 'hsl(222 47% 15%)', border: '1px solid hsl(222 47% 22%)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold" style={{ color: 'hsl(220 90% 70%)' }}>{c.authorType}</span>
                    <span className="text-xs" style={{ color: 'hsl(215 15% 45%)' }}>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm" style={{ color: 'hsl(215 20% 65%)' }}>{c.message}</p>
                  {c.counterDiscount && (
                    <p className="text-xs mt-1 font-semibold" style={{ color: 'hsl(38 92% 65%)' }}>
                      Counter discount: {c.counterDiscount}%
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        {!confirmed && (quotation.status === 'APPROVED' || quotation.status === 'NEGOTIATION') && (
          <div className="glass-card p-5 text-center">
            <p className="text-sm mb-4" style={{ color: 'hsl(215 20% 65%)' }}>
              Happy with the terms? Confirm the quotation to proceed with your order.
            </p>
            <button onClick={confirmQuotation} className="btn-primary px-8 py-3">
              <CheckCircle size={16} /> Confirm Quotation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
