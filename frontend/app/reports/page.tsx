'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { CheckCircle, FileText, Table, TrendingUp, Zap, ShieldCheck } from 'lucide-react';

export default function ReportsPage() {
  const [period, setPeriod] = useState('last30');
  const [team, setTeam] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleExportCSV = () => {
    const headers = ['Report Category', 'Metric / Item', 'Value / Level', 'Status / SLA', 'Timestamp / Notes'];
    const rows = [
      ['Approval Bottlenecks', 'Level 1: Sales Manager', '1.2 hours turnaround', '94.2% Pass Rate', '3 Pending Quotes'],
      ['Approval Bottlenecks', 'Level 2: VP Deal Desk', '3.8 hours turnaround', '82.0% Pass Rate', '5 Pending Quotes (Warning SLA)'],
      ['Approval Bottlenecks', 'Level 3: CFO / Finance Desk', '6.5 hours turnaround', '68.0% Pass Rate', '2 Pending Quotes (Critical Risk)'],
      ['Governance Audit', 'Sarah Lin (Sales Rep)', 'Quote Q-1042', 'Submitted for approval', 'Services discount: 28%'],
      ['Governance Audit', 'Marcus Vance (VP Deal Desk)', 'Quote Q-1039', 'Approved exception', 'Global Logix account'],
      ['Governance Audit', 'Automated Policy Engine', 'Anomaly ANOM-102', 'Flagged risk', 'Margin leakage breach on Delta LLC']
    ];

    const csvContent = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Analytics_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast('Report dataset exported as CSV successfully!');
  };

  const handleExportPDF = () => {
    triggerToast('Preparing Executive PDF Print Report...');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-20 right-8 z-50 bg-[var(--success)] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
            <CheckCircle size={18} />
            <span className="text-sm font-semibold">{toastMsg}</span>
          </div>
        )}

        {/* Aligned Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 className="page-heading">Admin & Reporting Analytics</h1>
              <span className="badge badge-indigo">
                BI & Audit Engine
              </span>
              <span className="badge badge-success">
                v4.18 Real-Time Sync
              </span>
            </div>
            <p className="body-text" style={{ marginTop: '4px' }}>
              High-precision deal velocity, approval cycle bottlenecks, discount margin compliance, and governance audit logs.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleExportPDF}
              className="btn-secondary flex items-center gap-2"
              type="button"
            >
              <FileText size={16} className="text-[var(--error)]" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="btn-secondary flex items-center gap-2"
              type="button"
            >
              <Table size={16} className="text-[var(--success)]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="df-card p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="section-label block mb-1.5">Time period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full text-sm p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)]"
            >
              <option value="last30">Last 30 Days (Rolling)</option>
              <option value="q3">Current Quarter (Q3 FY26)</option>
              <option value="ytd">Year-to-Date (FY26)</option>
            </select>
          </div>

          <div>
            <label className="section-label block mb-1.5">Sales team segment</label>
            <select
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="w-full text-sm p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)]"
            >
              <option value="all">All Global Teams</option>
              <option value="enterprise">Enterprise NA (Tier 1)</option>
              <option value="emea">EMEA Corporate</option>
              <option value="apac">APAC Strategic</option>
            </select>
          </div>

          <div>
            <label className="section-label block mb-1.5">Approval governance status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-sm p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)]"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved & Executed</option>
              <option value="pending">Pending Tier-2 Sign-off</option>
              <option value="escalated">Escalated to CFO Desk</option>
            </select>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="df-card p-5 space-y-1">
            <div className="section-label text-[var(--text-secondary)]">Total quotes created</div>
            <div className="text-3xl font-bold text-[var(--text-primary)]">148</div>
            <div className="body-sm text-[var(--success)] flex items-center gap-1 font-medium">
              <TrendingUp size={14} /> +18.4% vs last cycle
            </div>
          </div>

          <div className="df-card p-5 space-y-1">
            <div className="section-label text-[var(--text-secondary)]">Pipeline deal volume</div>
            <div className="text-3xl font-bold text-[var(--text-primary)]">₹4.85M</div>
            <div className="body-sm text-[var(--accent)] font-medium">76.2% Win conversion probability</div>
          </div>

          <div className="df-card p-5 space-y-1">
            <div className="section-label text-[var(--text-secondary)]">Avg approval turnaround</div>
            <div className="text-3xl font-bold text-[var(--success)]">4.2 hours</div>
            <div className="body-sm text-[var(--success)] font-medium">-35% SLA bottleneck reduction</div>
          </div>

          <div className="df-card p-5 space-y-1">
            <div className="section-label text-[var(--text-secondary)]">Blended discount leakage</div>
            <div className="text-3xl font-bold text-[var(--error)]">11.4%</div>
            <div className="body-sm">Target limit &le; 12.0%</div>
          </div>
        </div>

        {/* Bottleneck Analysis Table & Audit Feed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Approval Bottleneck Analysis */}
          <div className="lg:col-span-7 space-y-4">
            <div className="df-card p-6 space-y-4 !p-0 overflow-hidden">
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <div>
                  <h3 className="section-label text-base text-[var(--text-primary)] flex items-center gap-2">
                    <Zap className="text-[var(--accent)]" size={18} />
                    Approval cycle bottleneck analysis
                  </h3>
                  <p className="body-sm">Turnaround latency breakdown across sequential approval tiers</p>
                </div>
                <span className="badge badge-success">
                  SLA Target: 8h Max
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="df-table">
                  <thead>
                    <tr>
                      <th>Approval Level / Role</th>
                      <th className="text-right">Avg Time</th>
                      <th className="text-right">Pending Quotes</th>
                      <th className="text-right">Pass Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-semibold text-[var(--text-primary)]">Level 1: Sales Manager</td>
                      <td className="text-right font-mono text-[var(--success)] font-bold">1.2 hours</td>
                      <td className="text-right font-mono text-[var(--text-secondary)]">3</td>
                      <td className="text-right font-mono text-[var(--text-secondary)]">94.2%</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-[var(--text-primary)]">Level 2: VP Deal Desk</td>
                      <td className="text-right font-mono font-bold" style={{ color: '#D97706' }}>3.8 hours</td>
                      <td className="text-right font-mono font-bold" style={{ color: '#D97706' }}>5</td>
                      <td className="text-right font-mono text-[var(--text-secondary)]">82.0%</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-[var(--text-primary)]">Level 3: CFO / Finance Desk</td>
                      <td className="text-right font-mono text-[var(--error)] font-bold">6.5 hours</td>
                      <td className="text-right font-mono text-[var(--text-secondary)]">2</td>
                      <td className="text-right font-mono text-[var(--text-secondary)]">68.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* System Governance Audit Log */}
          <div className="lg:col-span-5 space-y-4">
            <div className="df-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <h3 className="section-label text-base text-[var(--text-primary)] flex items-center gap-2">
                  <ShieldCheck className="text-[var(--accent)]" size={18} />
                  System governance audit trail
                </h3>
                <span className="badge badge-muted">Live Stream</span>
              </div>

              <div className="space-y-3 body-sm">
                <div className="p-3.5 rounded-xl bg-[var(--canvas)] border border-[var(--border)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--text-primary)]">Sarah Lin (Sales Rep)</span>
                    <span className="font-mono text-xs text-[var(--text-muted)]">10 mins ago</span>
                  </div>
                  <p className="text-[var(--text-secondary)]">Submitted quote <strong className="text-[var(--accent)] font-mono">Q-1042</strong> for approval (Services discount: 28%)</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--canvas)] border border-[var(--border)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--success)]">Marcus Vance (VP Deal Desk)</span>
                    <span className="font-mono text-xs text-[var(--text-muted)]">45 mins ago</span>
                  </div>
                  <p className="text-[var(--text-secondary)]">Approved discount exception for <strong className="text-[var(--accent)] font-mono">Q-1039</strong> (Global Logix)</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--canvas)] border border-[var(--border)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold" style={{ color: '#D97706' }}>Automated Policy Engine</span>
                    <span className="font-mono text-xs text-[var(--text-muted)]">2 hours ago</span>
                  </div>
                  <p className="text-[var(--text-secondary)]">Flagged anomaly <strong className="font-mono" style={{ color: '#D97706' }}>ANOM-102</strong>: Margin leakage breach on Delta LLC</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

