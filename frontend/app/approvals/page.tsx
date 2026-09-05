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
      <div className="df-page-container flex flex-col" style={{ gap: 'var(--space-xl)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-heading-1 text-slate-900">Governance Approvals</h1>
              <span className="badge badge-primary">
                ROLE: {userRole}
              </span>
            </div>
            <p className="text-body-lg text-slate-600 mt-1">
              Multi-tiered discount approval chain (Manager & Finance sign-offs)
            </p>
          </div>
        </div>

        {msg && (
          <div
            className="p-4 rounded-xl text-body-base font-medium text-center transition-all animate-in fade-in"
            style={{
              background: msg.includes('Error') || msg.includes('Restricted') ? '#fee2e2' : '#dcfce7',
              border: `1px solid ${msg.includes('Error') || msg.includes('Restricted') ? '#fca5a5' : '#bbf7d0'}`,
              color: msg.includes('Error') || msg.includes('Restricted') ? '#b91c1c' : '#15803d',
            }}
          >
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List */}
          <div className="rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-slate-700" />
                <h2 className="text-heading-3 text-slate-900">Pending Approvals ({quotations.length})</h2>
              </div>
              <button onClick={load} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer">
                Refresh
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-body-base text-slate-500">Loading approval items…</div>
              ) : quotations.map((q: any) => {
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
                    className={`p-4 cursor-pointer transition-all ${selected?.id === q.id ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-subheading font-mono font-bold text-slate-900">{q.quoteNumber}</span>
                      <span className={`badge ${q.riskLevel === 'HIGH' ? 'risk-high' : q.riskLevel === 'MEDIUM' ? 'risk-medium' : 'risk-low'}`}>RISK: {q.riskLevel}</span>
                    </div>
                    <p className="text-body-base font-semibold text-slate-800">{q.customer?.name || '—'}</p>
                    <p className="text-caption text-slate-500 mt-1">
                      ${Number(q.grandTotal || 0).toLocaleString()} · Blended Score: {Number(q.blendedRiskScore || 0).toFixed(2)}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {(q.approvals || []).map((a: any) => (
                        <span
                          key={a.id || a.level}
                          className={`badge ${a.status === 'PENDING' ? 'badge-pending' : a.status === 'APPROVED' ? 'badge-approved' : 'badge-rejected'}`}
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
                  <CheckCircle size={28} className="mx-auto mb-2 text-emerald-600" />
                  <p className="text-heading-3 text-slate-900">All pending approvals are cleared</p>
                  <p className="text-body-base text-slate-500 mt-1">No quotes requiring review at this time</p>
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          <div>
            {!selected ? (
              <div className="rounded-xl p-12 text-center bg-white border border-slate-200 shadow-xs">
                <AlertTriangle size={28} className="mx-auto mb-3 text-slate-400" />
                <p className="text-heading-3 text-slate-800">Select a quotation from the list</p>
                <p className="text-body-base text-slate-500 mt-1">Inspect flagged discount items and execute approval decision</p>
              </div>
            ) : (
              <div className="rounded-xl p-6 bg-white border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-heading-3 text-slate-900">{selected.quoteNumber}</h3>
                    <p className="text-body-base text-slate-600">{selected.customer?.name} · {selected.customer?.tier} tier</p>
                  </div>
                  <Link href={`/quotations/${selected.id}`} className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                    Full Quotation <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </Link>
                </div>

                {/* Why flagged */}
                <div className="p-4 rounded-xl space-y-3 bg-red-50 border border-red-200">
                  <h4 className="text-subheading font-bold uppercase tracking-wider text-red-700">Why This Quote Was Flagged</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-body-base">
                      <thead>
                        <tr className="border-b border-red-200">
                          {['Line Item', 'Discount Given', 'Limit Allowed', 'Delta'].map(h => (
                            <th key={h} className="text-left py-2 pr-4 text-slate-600 font-semibold text-xs uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(selected.lines || selected.quotationLines || []).map((line: any) => {
                          const over = Math.max(0, Number(line.discountPct || 0) - Number(line.discountAllowed || 0));
                          return (
                            <tr key={line.id} className="border-t border-red-100">
                              <td className="py-2 pr-4 text-slate-900 font-medium">{line.product?.name || line.description}</td>
                              <td className="py-2 pr-4" style={{ color: over > 0 ? '#dc2626' : '#059669' }}>
                                {Number(line.discountPct || 0).toFixed(1)}%
                              </td>
                              <td className="py-2 pr-4 text-slate-600">
                                {Number(line.discountAllowed || 0).toFixed(1)}%
                              </td>
                              <td className="py-2 font-semibold" style={{ color: over > 0 ? '#dc2626' : '#059669' }}>
                                {over > 0 ? `+${over.toFixed(1)} pt OVER` : '0 pt — OK'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-caption text-slate-600">
                    Blended Risk Score: <strong className="text-amber-700 font-bold">{Number(selected.blendedRiskScore || 0).toFixed(2)}</strong>
                  </p>
                </div>

                {/* Level selection for Admin */}
                {userRole === 'ADMIN' && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="block text-subheading font-semibold text-slate-800">Approval Level Execution (Admin Override)</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedLevel('MANAGER')}
                        className={`flex-1 py-2 text-body-base font-semibold rounded-lg transition cursor-pointer ${selectedLevel === 'MANAGER' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                      >
                        Manager Level
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedLevel('FINANCE')}
                        className={`flex-1 py-2 text-body-base font-semibold rounded-lg transition cursor-pointer ${selectedLevel === 'FINANCE' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                      >
                        Finance Level
                      </button>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-subheading font-medium mb-1.5 text-slate-700">Decision Justification & Notes</label>
                  <textarea
                    className="df-input text-body-base w-full"
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Provide justification or mitigation conditions for this decision…"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => decide('APPROVED')}
                    className="btn-primary flex-1 justify-center py-2.5 text-body-base"
                  >
                    <CheckCircle size={15} /> Approve ({userRole === 'ADMIN' ? selectedLevel : userRole === 'FINANCE' ? 'Finance' : 'Manager'})
                  </button>
                  <button
                    type="button"
                    onClick={() => decide('RETURNED')}
                    className="btn-secondary flex-1 justify-center py-2.5 text-body-base"
                  >
                    <RotateCcw size={15} /> Return for Re-edit
                  </button>
                  <button
                    type="button"
                    onClick={() => decide('REJECTED')}
                    className="btn-danger flex-1 justify-center py-2.5 text-body-base"
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
