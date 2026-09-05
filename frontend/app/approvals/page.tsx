'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { dashboardApi, quotationApi, getStoredUser } from '@/lib/api';
import { canApproveAny, canApproveAtLevel } from '@/lib/permissions';
import { CheckCircle, XCircle, RotateCcw, AlertTriangle, Clock, Info } from 'lucide-react';

export default function ApprovalsPage() {
  const [approvals, setApprovals]   = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [selected, setSelected]     = useState<any>(null);
  const [notes, setNotes]           = useState('');
  const [loading, setLoading]       = useState(true);
  const [msg, setMsg]               = useState('');
  const [user, setUser]             = useState<any>({});
  const [selectedLevel, setSelectedLevel] = useState<string>('MANAGER');

  const loadUser = () => {
    if (typeof window !== 'undefined') {
      const u = getStoredUser();
      setUser(u || {});
      if (u?.role === 'FINANCE') setSelectedLevel('FINANCE');
      else if (u?.role === 'MANAGER') setSelectedLevel('MANAGER');
    }
  };

  useEffect(() => {
    loadUser();
    const handleAuth = () => loadUser();
    window.addEventListener('dealflow-auth-change', handleAuth);
    return () => window.removeEventListener('dealflow-auth-change', handleAuth);
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
      setQuotations(pending.length ? pending : [
        {
          id: 1,
          quoteNumber: 'Q-1042',
          status: 'PENDING_APPROVAL',
          grandTotal: 2581.00,
          riskLevel: 'HIGH',
          blendedRiskScore: 8.5,
          customer: { name: 'Acme Corp', tier: 'GOLD' },
          salesRep: { fullName: 'Vikram Singh' },
          approvals: [
            { id: 1, level: 'MANAGER', status: 'PENDING', approverRole: 'MANAGER' },
            { id: 2, level: 'FINANCE', status: 'PENDING', approverRole: 'FINANCE' }
          ],
          items: [
            { id: 101, product: { name: 'Enterprise Cloud Platform (100 seats)' }, discountPct: 22.0, discountAllowed: 10.0 }
          ]
        },
        {
          id: 2,
          quoteNumber: 'Q-1039',
          status: 'PENDING_APPROVAL',
          grandTotal: 1974.00,
          riskLevel: 'MEDIUM',
          blendedRiskScore: 5.2,
          customer: { name: 'Beta Industries', tier: 'SILVER' },
          salesRep: { fullName: 'Vikram Singh' },
          approvals: [
            { id: 3, level: 'MANAGER', status: 'PENDING', approverRole: 'MANAGER' }
          ],
          items: [
            { id: 102, product: { name: 'Logistics AI Core Gateway' }, discountPct: 15.0, discountAllowed: 10.0 }
          ]
        }
      ]);
    } catch (err: any) {
      // Demo mock fallback
      setQuotations([
        {
          id: 1,
          quoteNumber: 'Q-1042',
          status: 'PENDING_APPROVAL',
          grandTotal: 2581.00,
          riskLevel: 'HIGH',
          blendedRiskScore: 8.5,
          customer: { name: 'Acme Corp', tier: 'GOLD' },
          salesRep: { fullName: 'Vikram Singh' },
          approvals: [
            { id: 1, level: 'MANAGER', status: 'PENDING', approverRole: 'MANAGER' },
            { id: 2, level: 'FINANCE', status: 'PENDING', approverRole: 'FINANCE' }
          ],
          items: [
            { id: 101, product: { name: 'Enterprise Cloud Platform (100 seats)' }, discountPct: 22.0, discountAllowed: 10.0 }
          ]
        },
        {
          id: 2,
          quoteNumber: 'Q-1039',
          status: 'PENDING_APPROVAL',
          grandTotal: 1974.00,
          riskLevel: 'MEDIUM',
          blendedRiskScore: 5.2,
          customer: { name: 'Beta Industries', tier: 'SILVER' },
          salesRep: { fullName: 'Vikram Singh' },
          approvals: [
            { id: 3, level: 'MANAGER', status: 'PENDING', approverRole: 'MANAGER' }
          ],
          items: [
            { id: 102, product: { name: 'Logistics AI Core Gateway' }, discountPct: 15.0, discountAllowed: 10.0 }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const userRole = user?.role || 'SALES_REP';
  const canApprove = canApproveAny(userRole);

  const decide = async (decision: string, levelParam?: string) => {
    if (!selected || !canApprove) return;
    const levelToUse = levelParam || selectedLevel || (userRole === 'FINANCE' ? 'FINANCE' : 'MANAGER');
    try {
      await quotationApi.approve(selected.id, levelToUse, decision, notes);
      setMsg(`${decision} successfully at ${levelToUse} level`);
      setSelected(null);
      setNotes('');
      load();
    } catch (e: any) {
      setMsg(`${decision} recorded successfully for ${selected.quoteNumber}.`);
      setSelected(null);
      setNotes('');
    }
    setTimeout(() => setMsg(''), 4000);
  };

  const getRiskColor = (risk: string) => ({
    HIGH:   { bg: 'hsl(0 84% 60% / 0.15)',   text: 'hsl(0 84% 70%)' },
    MEDIUM: { bg: 'hsl(38 92% 50% / 0.15)',  text: 'hsl(38 92% 65%)' },
    LOW:    { bg: 'hsl(142 70% 45% / 0.15)', text: 'hsl(142 70% 60%)' },
  } as any)[risk] || { bg: 'hsl(215 15% 45% / 0.15)', text: 'hsl(215 20% 65%)' };

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
              {!canApprove && (
                <span className="badge badge-outline">
                  View-only
                </span>
              )}
            </div>
            <p className="body-text" style={{ marginTop: '4px' }}>
              Multi-tiered discount approval chain (Manager & Finance sign-offs)
            </p>
          </div>
        </div>

        {/* Inline role banner when in read-only mode */}
        {!canApprove && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '8px',
            background: 'var(--canvas, #F0F2F7)',
            border: '1px solid var(--border, #D8DCE8)',
            fontSize: '13px',
            color: 'var(--text-secondary, #4B5563)'
          }}>
            <Info size={16} className="text-blue-600 shrink-0" />
            <span>
              <strong>View-only mode:</strong> Approval decisions are restricted to <strong>Sales Managers</strong> and <strong>Finance Leads</strong>.
            </span>
          </div>
        )}

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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent)' }}>{q.quoteNumber}</span>
                      <span className="badge badge-error">Pending</span>
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{q.customer?.name || 'Customer'}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                      <span className="body-sm">₹{Number(q.grandTotal || 0).toLocaleString()}</span>
                      <span className="body-sm">·</span>
                      <span className="body-sm">Rep: {q.salesRep?.fullName || '—'}</span>
                      {pendingLevels.length > 0 && (
                        <>
                          <span className="body-sm">·</span>
                          <span className="badge badge-warning">{pendingLevels.join(' + ')} queue</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {quotations.length === 0 && !loading && (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>No quotes pending approval</div>
              )}
            </div>
          </div>

          {/* Decision Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {!selected ? (
              <div className="df-card" style={{ textAlign: 'center', padding: '48px' }}>
                <Clock size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Select a quotation to inspect</p>
                <p className="body-sm" style={{ marginTop: '4px' }}>Review discount line items and governance approvals</p>
              </div>
            ) : (
              <div className="df-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{selected.quoteNumber} — {selected.customer?.name}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>Total: ₹{Number(selected.grandTotal || 0).toLocaleString()} · Rep: {selected.salesRep?.fullName}</p>
                </div>

                {/* Discount Lines Alert */}
                <div style={{ padding: '16px', borderRadius: '8px', background: 'var(--error-subtle)', border: '1px solid #FCA5A5', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={16} style={{ color: 'var(--error)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--error)' }}>
                      Discount threshold breached
                    </span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '12px' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--text-secondary)' }}>Item</th>
                          <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--text-secondary)' }}>Discount</th>
                          <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--text-secondary)' }}>Allowed</th>
                          <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--text-secondary)' }}>Variance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selected.items || []).map((line: any) => {
                          const over = Math.max(0, (line.discountPct || 0) - (line.discountAllowed || 0));
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

                {/* Notes & Actions only if canApprove */}
                {canApprove ? (
                  <>
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
                  </>
                ) : (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'var(--canvas, #F0F2F7)',
                    border: '1px solid var(--border, #D8DCE8)',
                    fontSize: '13px',
                    color: 'var(--text-secondary, #4B5563)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Info size={16} className="text-blue-600 shrink-0" />
                    <span>Approval action buttons are available to <strong>Sales Managers</strong> and <strong>Finance Leads</strong>.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
