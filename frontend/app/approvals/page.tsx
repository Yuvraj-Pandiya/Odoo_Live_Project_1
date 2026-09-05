'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { dashboardApi, quotationApi } from '@/lib/api';
import { CheckCircle, XCircle, RotateCcw, AlertTriangle, Clock } from 'lucide-react';

export default function ApprovalsPage() {
  const [approvals, setApprovals]   = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [selected, setSelected]     = useState<any>(null);
  const [notes, setNotes]           = useState('');
  const [loading, setLoading]       = useState(true);
  const [msg, setMsg]               = useState('');

  const load = async () => {
    setLoading(true);
    const [a, q] = await Promise.all([dashboardApi.pendingApprovals(), quotationApi.list()]);
    setApprovals(a.data);
    const pending = q.data.filter((q: any) => q.status === 'PENDING_APPROVAL');
    setQuotations(pending);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const decide = async (decision: string, level: string) => {
    if (!selected) return;
    try {
      await quotationApi.approve(selected.id, level, decision, notes);
      setMsg(`${decision} successfully`);
      setSelected(null); setNotes('');
      load();
    } catch (e: any) {
      setMsg(e.response?.data?.message || 'Error');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const getRiskColor = (risk: string) => ({
    HIGH:   { bg: 'hsl(0 84% 60% / 0.15)',   text: 'hsl(0 84% 70%)' },
    MEDIUM: { bg: 'hsl(38 92% 50% / 0.15)',  text: 'hsl(38 92% 65%)' },
    LOW:    { bg: 'hsl(142 70% 45% / 0.15)', text: 'hsl(142 70% 60%)' },
  } as any)[risk] || { bg: 'hsl(215 15% 45% / 0.15)', text: 'hsl(215 20% 65%)' };

  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Approvals</h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(215 20% 65%)' }}>Review and act on quotations requiring discount approval</p>
        </div>

        {msg && (
          <div className="p-3 rounded-lg text-sm text-center" style={{ background: 'hsl(220 90% 56% / 0.1)', border: '1px solid hsl(220 90% 56% / 0.2)', color: 'hsl(220 90% 70%)' }}>
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: 'hsl(222 47% 22%)' }}>
              <Clock size={14} style={{ color: 'hsl(38 92% 65%)' }} />
              <h2 className="font-semibold text-white text-sm">Pending Approvals ({quotations.length})</h2>
            </div>
            <div className="divide-y" style={{ borderColor: 'hsl(222 47% 22%)' }}>
              {loading ? (
                <div className="p-8 text-center text-sm" style={{ color: 'hsl(215 20% 65%)' }}>Loading…</div>
              ) : quotations.map((q: any) => {
                const rc = getRiskColor(q.riskLevel);
                return (
                  <div key={q.id} onClick={() => { setSelected(q); setNotes(''); }}
                       className="p-4 cursor-pointer transition-all"
                       style={{ background: selected?.id === q.id ? 'hsl(220 90% 56% / 0.08)' : 'transparent' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono font-bold" style={{ color: 'hsl(220 90% 70%)' }}>{q.quoteNumber}</span>
                      <span className="badge text-[10px]" style={rc}>RISK: {q.riskLevel}</span>
                    </div>
                    <p className="text-sm font-medium text-white">{q.customer?.name || '—'}</p>
                    <p className="text-xs mt-1" style={{ color: 'hsl(215 20% 65%)' }}>
                      ${Number(q.grandTotal || 0).toLocaleString()} · Score: {Number(q.blendedRiskScore || 0).toFixed(2)}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {q.approvals?.map((a: any) => (
                        <span key={a.id} className="badge text-[10px]" style={{
                          background: a.status === 'PENDING' ? 'hsl(38 92% 50% / 0.15)' : 'hsl(142 70% 45% / 0.15)',
                          color:      a.status === 'PENDING' ? 'hsl(38 92% 65%)' : 'hsl(142 70% 60%)',
                        }}>{a.level}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
              {quotations.length === 0 && !loading && (
                <div className="p-8 text-center">
                  <CheckCircle size={24} className="mx-auto mb-2" style={{ color: 'hsl(142 70% 60%)' }} />
                  <p className="text-sm" style={{ color: 'hsl(215 20% 65%)' }}>No pending approvals</p>
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          <div>
            {!selected ? (
              <div className="glass-card p-12 text-center">
                <AlertTriangle size={24} className="mx-auto mb-3" style={{ color: 'hsl(215 15% 45%)' }} />
                <p className="text-sm" style={{ color: 'hsl(215 20% 65%)' }}>Select a quotation to review</p>
              </div>
            ) : (
              <div className="glass-card p-6 space-y-5">
                <div>
                  <h3 className="font-bold text-white text-lg">{selected.quoteNumber}</h3>
                  <p className="text-sm" style={{ color: 'hsl(215 20% 65%)' }}>{selected.customer?.name} · {selected.customer?.tier} tier</p>
                </div>

                {/* Why flagged */}
                <div className="p-4 rounded-lg space-y-3" style={{ background: 'hsl(0 84% 60% / 0.06)', border: '1px solid hsl(0 84% 60% / 0.2)' }}>
                  <h4 className="text-sm font-semibold" style={{ color: 'hsl(0 84% 70%)' }}>Why This Quote Was Flagged</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          {['Line', 'Discount Given', 'Limit Allowed', 'Over By'].map(h => (
                            <th key={h} className="text-left py-1 pr-4" style={{ color: 'hsl(215 15% 45%)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selected.lines?.map((line: any) => {
                          const over = Math.max(0, Number(line.discountPct) - Number(line.discountAllowed));
                          return (
                            <tr key={line.id}>
                              <td className="py-1 pr-4 text-white font-medium">{line.product?.name}</td>
                              <td className="py-1 pr-4" style={{ color: over > 0 ? 'hsl(0 84% 70%)' : 'hsl(142 70% 60%)' }}>{Number(line.discountPct).toFixed(1)}%</td>
                              <td className="py-1 pr-4" style={{ color: 'hsl(215 20% 65%)' }}>{Number(line.discountAllowed).toFixed(1)}%</td>
                              <td className="py-1" style={{ color: over > 0 ? 'hsl(0 84% 70%)' : 'hsl(142 70% 60%)' }}>
                                {over > 0 ? `+${over.toFixed(1)} pt OVER` : '0 pt — OK'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs" style={{ color: 'hsl(215 15% 45%)' }}>
                    Blended score: <strong style={{ color: 'hsl(38 92% 65%)' }}>{Number(selected.blendedRiskScore || 0).toFixed(2)}</strong>
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'hsl(215 20% 65%)' }}>Decision Notes</label>
                  <textarea className="input text-sm" rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                            placeholder="Add justification or comments…" />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button onClick={() => decide('APPROVED', 'MANAGER')} className="btn-primary flex-1 justify-center">
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button onClick={() => decide('RETURNED', 'MANAGER')} className="btn-secondary flex-1 justify-center">
                    <RotateCcw size={14} /> Return
                  </button>
                  <button onClick={() => decide('REJECTED', 'MANAGER')} className="btn-danger flex-1 justify-center">
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
