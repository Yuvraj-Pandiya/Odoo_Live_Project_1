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
        <div style={{ maxWidth: '768px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="df-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--error-subtle)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={32} />
            </div>
            <h2 className="page-heading">Approvals governance queue</h2>
            <p className="body-text">
              You are currently signed in as <strong>{user.fullName || user.email || 'Sales Rep'}</strong> ({userRole}).
              The approval workflow is restricted to <strong>Managers</strong>, <strong>Finance Leads</strong>, and <strong>System Admins</strong>.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <Link href="/quotations" className="btn-primary">
                View my quotations
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 className="page-heading">Governance approvals</h1>
              <span className="badge badge-primary">
                Role: {userRole}
              </span>
            </div>
            <p className="body-text" style={{ marginTop: '4px' }}>
              Multi-tiered discount approval chain (Manager & Finance sign-offs)
            </p>
          </div>
        </div>

        {msg && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              textAlign: 'center',
              background: msg.includes('Error') || msg.includes('Restricted') ? 'var(--error-subtle)' : 'var(--success-subtle)',
              border: `1px solid ${msg.includes('Error') || msg.includes('Restricted') ? '#FCA5A5' : '#86EFAC'}`,
              color: msg.includes('Error') || msg.includes('Restricted') ? 'var(--error)' : 'var(--success)',
            }}
          >
            {msg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* List */}
          <div className="df-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} style={{ color: 'var(--text-secondary)' }} />
                <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Pending approvals ({quotations.length})</h2>
              </div>
              <button onClick={load} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                Refresh
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {loading ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading approval items…</div>
              ) : quotations.map((q: any) => {
                const pendingLevels = (q.approvals || []).filter((a: any) => a.status === 'PENDING').map((a: any) => a.level);
                const isSel = selected?.id === q.id;
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
                    style={{
                      padding: '16px 20px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border)',
                      background: isSel ? 'var(--accent-subtle)' : 'var(--surface)',
                      borderLeft: isSel ? '4px solid var(--accent)' : '4px solid transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent)' }}>{q.quoteNumber}</span>
                      <span className={`badge ${q.riskLevel === 'HIGH' ? 'risk-high' : q.riskLevel === 'MEDIUM' ? 'risk-medium' : 'risk-low'}`}>Risk: {q.riskLevel.toLowerCase()}</span>
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{q.customer?.name || '—'}</p>
                    <p className="body-sm" style={{ marginTop: '4px' }}>
                      ${Number(q.grandTotal || 0).toLocaleString()} · Risk score: {Number(q.blendedRiskScore || 0).toFixed(2)}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      {(q.approvals || []).map((a: any) => (
                        <span
                          key={a.id || a.level}
                          className={`badge ${a.status === 'PENDING' ? 'badge-pending' : a.status === 'APPROVED' ? 'badge-approved' : 'badge-rejected'}`}
                        >
                          {a.level}: {a.status.toLowerCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
              {quotations.length === 0 && !loading && (
                <div style={{ padding: '48px', textAlign: 'center' }}>
                  <CheckCircle size={28} style={{ color: 'var(--success)', margin: '0 auto 8px auto' }} />
                  <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>All pending approvals are cleared</p>
                  <p className="body-sm" style={{ marginTop: '4px' }}>No quotes requiring review at this time</p>
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          <div>
            {!selected ? (
              <div className="df-card" style={{ textAlign: 'center', padding: '48px' }}>
                <AlertTriangle size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Select a quotation from the list</p>
                <p className="body-sm" style={{ marginTop: '4px' }}>Inspect flagged discount items and execute approval decision</p>
              </div>
            ) : (
              <div className="df-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{selected.quoteNumber}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>{selected.customer?.name} · {selected.customer?.tier} tier</p>
                  </div>
                  <Link href={`/quotations/${selected.id}`} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Full quotation</span> <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
                  </Link>
                </div>

                {/* Why flagged */}
                <div style={{ padding: '16px', borderRadius: '8px', background: 'var(--error-subtle)', border: '1px solid #FCA5A5', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--error)', textTransform: 'none', margin: 0 }}>Why this quote was flagged</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', background: 'transparent' }}>
                      <thead>
                        <tr>
                          {['Line item', 'Discount given', 'Limit allowed', 'Delta'].map(h => (
                            <th key={h} style={{ background: 'transparent', borderBottom: '1px solid #FCA5A5', color: 'var(--error)', padding: '6px 8px' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(selected.lines || selected.quotationLines || []).map((line: any) => {
                          const over = Math.max(0, Number(line.discountPct || 0) - Number(line.discountAllowed || 0));
                          return (
                            <tr key={line.id}>
                              <td style={{ padding: '8px', borderBottom: '1px solid #FEE2E2', fontWeight: 500 }}>{line.product?.name || line.description}</td>
                              <td style={{ padding: '8px', borderBottom: '1px solid #FEE2E2', color: over > 0 ? 'var(--error)' : 'var(--success)' }}>
                                {Number(line.discountPct || 0).toFixed(1)}%
                              </td>
                              <td style={{ padding: '8px', borderBottom: '1px solid #FEE2E2', color: 'var(--text-secondary)' }}>
                                {Number(line.discountAllowed || 0).toFixed(1)}%
                              </td>
                              <td style={{ padding: '8px', borderBottom: '1px solid #FEE2E2', fontWeight: 600, color: over > 0 ? 'var(--error)' : 'var(--success)' }}>
                                {over > 0 ? `+${over.toFixed(1)} pt over` : '0 pt — OK'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="body-sm" style={{ margin: 0, color: 'var(--text-primary)' }}>
                    Blended risk score: <strong>{Number(selected.blendedRiskScore || 0).toFixed(2)}</strong>
                  </p>
                </div>

                {/* Level selection for Admin */}
                {userRole === 'ADMIN' && (
                  <div style={{ padding: '16px', borderRadius: '8px', background: 'var(--canvas)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Approval level execution (Admin override)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedLevel('MANAGER')}
                        style={{
                          flex: 1, padding: '8px', fontSize: '13px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer',
                          background: selectedLevel === 'MANAGER' ? 'var(--accent)' : 'var(--surface)',
                          color: selectedLevel === 'MANAGER' ? '#FFFFFF' : 'var(--text-secondary)',
                          border: `1px solid ${selectedLevel === 'MANAGER' ? 'var(--accent)' : 'var(--border)'}`,
                        }}
                      >
                        Manager level
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedLevel('FINANCE')}
                        style={{
                          flex: 1, padding: '8px', fontSize: '13px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer',
                          background: selectedLevel === 'FINANCE' ? 'var(--accent)' : 'var(--surface)',
                          color: selectedLevel === 'FINANCE' ? '#FFFFFF' : 'var(--text-secondary)',
                          border: `1px solid ${selectedLevel === 'FINANCE' ? 'var(--accent)' : 'var(--border)'}`,
                        }}
                      >
                        Finance level
                      </button>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Decision justification & notes</label>
                  <textarea
                    className="df-input"
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Provide justification or mitigation conditions for this decision…"
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => decide('APPROVED')}
                    className="btn-primary"
                    style={{ flex: 1 }}
                  >
                    <CheckCircle size={15} /> Approve ({userRole === 'ADMIN' ? selectedLevel : userRole === 'FINANCE' ? 'Finance' : 'Manager'})
                  </button>
                  <button
                    type="button"
                    onClick={() => decide('RETURNED')}
                    className="btn-secondary"
                    style={{ flex: 1 }}
                  >
                    <RotateCcw size={15} /> Return for re-edit
                  </button>
                  <button
                    type="button"
                    onClick={() => decide('REJECTED')}
                    className="btn-danger"
                    style={{ flex: 1 }}
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
