'use client';
import AppLayout from '@/components/AppLayout';
import { dashboardApi, getStoredUser } from '@/lib/api';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Receipt, ShieldAlert } from 'lucide-react';

const STATUS_COLOR: any = {
  DRAFT:     { bg: 'hsl(215 15% 45% / 0.15)', text: 'hsl(215 20% 65%)' },
  UNPAID:    { bg: 'hsl(0 84% 60% / 0.15)',   text: 'hsl(0 84% 70%)' },
  PAID:      { bg: 'hsl(142 70% 45% / 0.15)', text: 'hsl(142 70% 60%)' },
  PARTIAL:   { bg: 'hsl(38 92% 50% / 0.15)',  text: 'hsl(38 92% 65%)' },
  OVERDUE:   { bg: 'hsl(0 84% 60% / 0.15)',   text: 'hsl(0 84% 70%)' },
  CANCELLED: { bg: 'hsl(215 15% 45% / 0.15)', text: 'hsl(215 15% 45%)' },
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [user, setUser]         = useState<any>({});
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = getStoredUser();
      setUser(u);
    }
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    setForbidden(false);
    try {
      const r = await dashboardApi.invoices();
      setInvoices(r.data || []);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setForbidden(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const userRole = user.role || 'SALES_REP';
  const hasAccess = ['ADMIN', 'FINANCE'].includes(userRole);

  if ((forbidden || !hasAccess) && !loading) {
    return (
      <AppLayout>
        <div className="p-8 max-w-4xl mx-auto space-y-6">
          <div className="glass-card p-8 text-center space-y-4 border border-emerald-500/30">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-xl font-bold text-white">Accounts Receivable & Invoicing</h2>
            <p className="text-sm text-slate-300 max-w-lg mx-auto">
              You are signed in as <strong className="text-emerald-400">{user.fullName || user.email || 'User'}</strong> ({userRole}).
              Access to customer invoice ledgers and payment settlements is restricted to <strong>Finance Leads</strong> and <strong>System Admins</strong>.
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
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">Invoices & Billing Register</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ROLE: {userRole}
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: 'hsl(215 20% 65%)' }}>Billing records for one-time and recurring contracts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'hsl(222 47% 22%)' }}>
              <h2 className="font-semibold text-white text-sm">Active Invoices ({invoices.length})</h2>
              <button onClick={loadInvoices} className="text-xs text-indigo-400 hover:text-indigo-300 transition">
                Refresh
              </button>
            </div>
            <table className="df-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-8 text-center" style={{ color: 'hsl(215 15% 45%)' }}>Loading invoice records…</td></tr>
                ) : invoices.map((inv: any) => {
                  const sc = STATUS_COLOR[inv.status] || STATUS_COLOR.DRAFT;
                  return (
                    <tr key={inv.id} onClick={() => setSelected(inv)} className="cursor-pointer">
                      <td className="font-mono text-xs font-bold" style={{ color: 'hsl(220 90% 70%)' }}>{inv.invoiceNumber}</td>
                      <td className="font-medium text-white">{inv.customer?.name || '—'}</td>
                      <td className="font-semibold text-white">₹{Number(inv.totalAmount || 0).toLocaleString()}</td>
                      <td style={{ color: 'hsl(215 20% 65%)' }}>{inv.dueDate || '—'}</td>
                      <td><span className="badge badge-muted">{inv.isRecurring ? 'Recurring' : 'One-Time'}</span></td>
                      <td><span className="badge" style={sc}>{inv.status}</span></td>
                    </tr>
                  );
                })}
                {invoices.length === 0 && !loading && (
                  <tr><td colSpan={6} className="py-8 text-center" style={{ color: 'hsl(215 15% 45%)' }}>No unpaid invoices found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div>
            {!selected ? (
              <div className="glass-card p-8 text-center">
                <Receipt size={24} className="mx-auto mb-3" style={{ color: 'hsl(215 15% 45%)' }} />
                <p className="text-sm font-medium text-white">Select an invoice to view detail</p>
                <p className="text-xs mt-1" style={{ color: 'hsl(215 20% 65%)' }}>Inspect itemized breakdown and record payments</p>
              </div>
            ) : (
              <div className="glass-card p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-white text-lg">{selected.invoiceNumber}</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'hsl(215 20% 65%)' }}>{selected.customer?.name}</p>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    ['Subtotal',    `₹${Number(selected.subtotal || 0).toLocaleString()}`],
                    ['Tax Total',   `₹${Number(selected.taxTotal || 0).toLocaleString()}`],
                    ['Grand Total', `₹${Number(selected.totalAmount || 0).toLocaleString()}`],
                    ['Paid Amount', `₹${Number(selected.amountPaid || 0).toLocaleString()}`],
                    ['Amount Due',  `₹${Number(selected.amountDue || 0).toLocaleString()}`],
                    ['Due Date',    selected.dueDate || '—'],
                  ].map(([l, v]) => (
                    <div key={l as string} className="flex justify-between border-b border-white/5 py-1">
                      <span style={{ color: 'hsl(215 20% 65%)' }}>{l}</span>
                      <span className="font-medium text-white">{v as string}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button className="btn-primary flex-1 justify-center text-xs py-2">Record Payment</button>
                  <button className="btn-secondary flex-1 justify-center text-xs py-2">Download PDF</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
