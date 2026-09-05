'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { dashboardApi, quotationApi, getStoredUser } from '@/lib/api';
import { CheckCircle, XCircle, RotateCcw, AlertTriangle, Clock, ShieldAlert } from 'lucide-react';

export default function ApprovalsPage() {
  const [approvals, setApprovals]   = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [selected, setSelected]     = useState<any>(null);
  const [notes, setNotes]           = useState('');
  const [loading, setLoading]       = useState(true);
  const [msg, setMsg]               = useState('');
  const [user, setUser]             = useState<any>({});
  const [selectedLevel, setSelectedLevel] = useState<string>('MANAGER');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = getStoredUser();
      setUser(u);
      if (u.role === 'FINANCE') setSelectedLevel('FINANCE');
      else if (u.role === 'MANAGER') setSelectedLevel('MANAGER');
    }
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [a, q] = await Promise.all([
        dashboardApi.pendingApprovals(),
        quotationApi.list()
      ]);
      setApprovals(a.data || []);
      const pending = (q.data || []).filter((item: any) => item.status === 'PENDING_APPROVAL');
      setQuotations(pending);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setMsg('Access Restricted: Sales Rep role cannot view or execute governance approvals.');
      } else {
        setMsg(err.response?.data?.message || 'Error loading pending approvals.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const userRole = user.role || 'SALES_REP';
  const canApprove = ['ADMIN', 'MANAGER', 'FINANCE'].includes(userRole);

  const decide = async (decision: string, levelParam?: string) => {
    if (!selected) return;
    const levelToUse = levelParam || selectedLevel || (userRole === 'FINANCE' ? 'FINANCE' : 'MANAGER');
    try {
      await quotationApi.approve(selected.id, levelToUse, decision, notes);
      setMsg(`${decision} successfully at ${levelToUse} level`);
      setSelected(null);
      setNotes('');
      load();
    } catch (e: any) {
      setMsg(e.response?.data?.message || 'Error performing approval decision');
    }
    setTimeout(() => setMsg(''), 4000);
  };

  const getRiskColor = (risk: string) => ({
    HIGH:   { bg: 'hsl(0 84% 60% / 0.15)',   text: 'hsl(0 84% 70%)' },
    MEDIUM: { bg: 'hsl(38 92% 50% / 0.15)',  text: 'hsl(38 92% 65%)' },
    LOW:    { bg: 'hsl(142 70% 45% / 0.15)', text: 'hsl(142 70% 60%)' },
  } as any)[risk] || { bg: 'hsl(215 15% 45% / 0.15)', text: 'hsl(215 20% 65%)' };

  if (!canApprove && !loading) {
    return (
      <AppLayout>
        <div className="p-8 max-w-4xl mx-auto space-y-6">
          <div className="glass-card p-8 text-center space-y-4 border border-amber-500/30">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-xl font-bold text-white">Approvals Governance Queue</h2>
            <p className="text-sm text-slate-300 max-w-lg mx-auto">
              You are currently signed in as <strong className="text-amber-400">{user.fullName || user.email || 'Sales Rep'}</strong> ({userRole}).
              The approval workflow is restricted to <strong>Managers</strong>, <strong>Finance Leads</strong>, and <strong>System Admins</strong>.
            </p>
            <div className="pt-4 flex items-center justify-center gap-4">
              <Link href="/quotations" className="btn-primary">
                View My Quotations
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
      <div className="p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">Governance Approvals</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ROLE: {userRole}
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: 'hsl(215 20% 65%)' }}>
              Multi-tiered discount approval chain (Manager & Finance sign-offs)
            </p>
          </div>
        </div>

        {msg && (
          <div
            className="p-3.5 rounded-xl text-sm font-medium text-center transition-all animate-in fade-in"
            style={{
              background: msg.includes('Error') || msg.includes('Restricted') ? 'hsl(0 84% 60% / 0.15)' : 'hsl(142 70% 45% / 0.15)',
              border: `1px solid ${msg.includes('Error') || msg.includes('Restricted') ? 'hsl(0 84% 60% / 0.3)' : 'hsl(142 70% 45% / 0.3)'}`,
              color: msg.includes('Error') || msg.includes('Restricted') ? 'hsl(0 84% 70%)' : 'hsl(142 70% 60%)',
            }}
          >
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'hsl(222 47% 22%)' }}>
              <div className="flex items-center gap-2">
                <Clock size={16} style={{ color: 'hsl(38 92% 65%)' }} />
                <h2 className="font-semibold text-white text-sm">Pending Approvals ({quotations.length})</h2>
              </div>
              <button onClick={load} className="text-xs text-indigo-400 hover:text-indigo-300 transition">
                Refresh
              </button>
            </div>
            <div className="divide-y" style={{ borderColor: 'hsl(222 47% 22%)' }}>
              {loading ? (
                <div className="p-8 text-center text-sm" style={{ color: 'hsl(215 20% 65%)' }}>Loading approval items…</div>
              ) : quotations.map((q: any) => {
                const rc = getRiskColor(q.riskLevel);
                const pendingLevels = (q.approvals || []).filter((a: any) => a.status === 'PENDING').map((a: any) => a.level);
                return (
                  <div
                    key={q.id}
                    onClick={() => {
                      setSelected(q);
                      setNotes('');
                      if (userRole === 'FINANCE') setSelectedLevel('FINANCE');
                      else if (userRole === 'MANAGER') setSelectedLevel('MANAGER');
                      else if (pendingLevels.includes('MANAGER')) setSelectedLevel('MANAGER');
                      else if (pendingLevels.includes('FINANCE')) setSelectedLevel('FINANCE');
                    }}
                    className="p-4 cursor-pointer transition-all"
                    style={{ background: selected?.id === q.id ? 'hsl(220 90% 56% / 0.12)' : 'transparent' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono font-bold" style={{ color: 'hsl(220 90% 70%)' }}>{q.quoteNumber}</span>
                      <span className="badge text-[10px]" style={rc}>RISK: {q.riskLevel}</span>
                    </div>
                    <p className="text-sm font-medium text-white">{q.customer?.name || '—'}</p>
                    <p className="text-xs mt-1" style={{ color: 'hsl(215 20% 65%)' }}>
                      ${Number(q.grandTotal || 0).toLocaleString()} · Blended Score: {Number(q.blendedRiskScore || 0).toFixed(2)}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {(q.approvals || []).map((a: any) => (
                        <span
                          key={a.id || a.level}
                          className="badge text-[10px] uppercase font-bold"
                          style={{
                            background: a.status === 'PENDING' ? 'hsl(38 92% 50% / 0.15)' : 'hsl(142 70% 45% / 0.15)',
                            color:      a.status === 'PENDING' ? 'hsl(38 92% 65%)' : 'hsl(142 70% 60%)',
                            border:     `1px solid ${a.status === 'PENDING' ? 'hsl(38 92% 50% / 0.3)' : 'hsl(142 70% 45% / 0.3)'}`,
                          }}
                        >
                          {a.level}: {a.status}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
              {quotations.length === 0 && !loading && (
                <div className="p-8 text-center">
                  <CheckCircle size={28} className="mx-auto mb-2" style={{ color: 'hsl(142 70% 60%)' }} />
                  <p className="text-sm font-medium text-white">All pending approvals are cleared</p>
                  <p className="text-xs mt-1" style={{ color: 'hsl(215 20% 65%)' }}>No quotes requiring review at this time</p>
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          <div>
            {!selected ? (
              <div className="glass-card p-12 text-center">
                <AlertTriangle size={28} className="mx-auto mb-3" style={{ color: 'hsl(215 15% 45%)' }} />
                <p className="text-sm font-medium text-white">Select a quotation from the list</p>
                <p className="text-xs mt-1" style={{ color: 'hsl(215 20% 65%)' }}>Inspect flagged discount items and execute approval decision</p>
              </div>
            ) : (
              <div className="glass-card p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-lg">{selected.quoteNumber}</h3>
                    <p className="text-sm" style={{ color: 'hsl(215 20% 65%)' }}>{selected.customer?.name} · {selected.customer?.tier} tier</p>
                  </div>
                  <Link href={`/quotations/${selected.id}`} className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                    Full Quotation <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </Link>
                </div>

                {/* Why flagged */}
                <div className="p-4 rounded-xl space-y-3" style={{ background: 'hsl(0 84% 60% / 0.08)', border: '1px solid hsl(0 84% 60% / 0.25)' }}>
                  <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'hsl(0 84% 70%)' }}>Why This Quote Was Flagged</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          {['Line Item', 'Discount Given', 'Limit Allowed', 'Delta'].map(h => (
                            <th key={h} className="text-left py-1 pr-4" style={{ color: 'hsl(215 15% 45%)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(selected.lines || selected.quotationLines || []).map((line: any) => {
                          const over = Math.max(0, Number(line.discountPct || 0) - Number(line.discountAllowed || 0));
                          return (
                            <tr key={line.id} className="border-t border-white/5">
                              <td className="py-1.5 pr-4 text-white font-medium">{line.product?.name || line.description}</td>
                              <td className="py-1.5 pr-4" style={{ color: over > 0 ? 'hsl(0 84% 70%)' : 'hsl(142 70% 60%)' }}>
                                {Number(line.discountPct || 0).toFixed(1)}%
                              </td>
                              <td className="py-1.5 pr-4" style={{ color: 'hsl(215 20% 65%)' }}>
                                {Number(line.discountAllowed || 0).toFixed(1)}%
                              </td>
                              <td className="py-1.5" style={{ color: over > 0 ? 'hsl(0 84% 70%)' : 'hsl(142 70% 60%)' }}>
                                {over > 0 ? `+${over.toFixed(1)} pt OVER` : '0 pt — OK'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs" style={{ color: 'hsl(215 15% 45%)' }}>
                    Blended Risk Score: <strong style={{ color: 'hsl(38 92% 65%)' }}>{Number(selected.blendedRiskScore || 0).toFixed(2)}</strong>
                  </p>
                </div>

                {/* Level selection for Admin */}
                {userRole === 'ADMIN' && (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">Approval Level Execution (Admin Override)</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedLevel('MANAGER')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${selectedLevel === 'MANAGER' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                      >
                        Manager Level
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedLevel('FINANCE')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${selectedLevel === 'FINANCE' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                      >
                        Finance Level
                      </button>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'hsl(215 20% 65%)' }}>Decision Justification & Notes</label>
                  <textarea
                    className="input text-sm w-full"
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Provide justification or mitigation conditions for this decision…"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => decide('APPROVED')}
                    className="btn-primary flex-1 justify-center py-2.5"
                  >
                    <CheckCircle size={15} /> Approve ({userRole === 'ADMIN' ? selectedLevel : userRole === 'FINANCE' ? 'Finance' : 'Manager'})
                  </button>
                  <button
                    type="button"
                    onClick={() => decide('RETURNED')}
                    className="btn-secondary flex-1 justify-center py-2.5"
                  >
                    <RotateCcw size={15} /> Return for Re-edit
                  </button>
                  <button
                    type="button"
                    onClick={() => decide('REJECTED')}
                    className="btn-danger flex-1 justify-center py-2.5"
                  >
                    <XCircle size={15} /> Reject
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
