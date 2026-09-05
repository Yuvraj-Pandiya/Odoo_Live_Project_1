'use client';
import AppLayout from '@/components/AppLayout';
import { dashboardApi, getStoredUser } from '@/lib/api';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Receipt, ShieldAlert, RefreshCw } from 'lucide-react';

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
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="df-card p-8 text-center space-y-4 border border-[var(--border)]">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldAlert size={32} />
            </div>
            <h2 className="page-heading">Accounts Receivable & Invoicing</h2>
            <p className="body-text max-w-lg mx-auto">
              You are signed in as <strong className="text-[var(--text-primary)]">{user.fullName || user.email || 'User'}</strong> ({userRole}).
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
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="page-heading">Invoices & Billing Register</h1>
              <span className="badge badge-indigo">
                ROLE: {userRole}
              </span>
            </div>
            <p className="body-text mt-1">Billing records for one-time and recurring contracts with fulfillment linkage</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 df-card overflow-hidden !p-0">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="section-label">Active Invoices ({invoices.length})</h2>
              <button onClick={loadInvoices} className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1">
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
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
                    <tr>
                      <td colSpan={6} className="py-12 text-center body-sm">
                        Loading invoice records…
                      </td>
                    </tr>
                  ) : invoices.map((inv: any) => {
                    return (
                      <tr
                        key={inv.id}
                        onClick={() => setSelected(inv)}
                        className={`cursor-pointer transition-colors ${selected?.id === inv.id ? 'bg-[var(--accent-subtle)]' : ''}`}
                      >
                        <td className="font-mono text-xs font-bold text-[var(--accent)]">
                          <Link href={`/invoices/${inv.invoiceNumber || inv.id}`} className="hover:underline">
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td className="font-semibold text-[var(--text-primary)]">{inv.customer?.name || '—'}</td>
                        <td className="font-bold text-[var(--text-primary)]">₹{Number(inv.totalAmount || 0).toLocaleString()}</td>
                        <td className="text-[var(--text-secondary)] font-mono text-xs">{inv.dueDate || '—'}</td>
                        <td><span className="badge badge-muted">{inv.isRecurring ? 'Recurring' : 'One-Time'}</span></td>
                        <td>
                          <span className={`badge ${
                            inv.status === 'PAID' ? 'badge-success' :
                            inv.status === 'UNPAID' || inv.status === 'OVERDUE' ? 'badge-danger' :
                            inv.status === 'PARTIAL' ? 'badge-warning' :
                            'badge-muted'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {invoices.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center body-sm">
                        No unpaid invoices found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            {!selected ? (
              <div className="df-card p-8 text-center">
                <Receipt size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
                <p className="section-label mb-1">Invoice inspector</p>
                <p className="body-sm">Select an invoice from the ledger to inspect line items, tax breakdowns, and record payments.</p>
              </div>
            ) : (
              <div className="df-card p-5 space-y-4">
                <div>
                  <h3 className="section-label text-lg text-[var(--text-primary)]">{selected.invoiceNumber}</h3>
                  <p className="body-sm mt-0.5">{selected.customer?.name}</p>
                </div>
                <div className="space-y-2.5 body-text text-sm">
                  {[
                    ['Subtotal',    `₹${Number(selected.subtotal || 0).toLocaleString()}`],
                    ['Tax Total',   `₹${Number(selected.taxTotal || 0).toLocaleString()}`],
                    ['Grand Total', `₹${Number(selected.totalAmount || 0).toLocaleString()}`],
                    ['Paid Amount', `₹${Number(selected.amountPaid || 0).toLocaleString()}`],
                    ['Amount Due',  `₹${Number(selected.amountDue || 0).toLocaleString()}`],
                    ['Due Date',    selected.dueDate || '—'],
                  ].map(([l, v]) => (
                    <div key={l as string} className="flex justify-between items-center border-b border-[var(--border)] py-1.5 last:border-0">
                      <span className="body-sm">{l}</span>
                      <span className="font-semibold text-[var(--text-primary)]">{v as string}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <Link href={`/invoices/${selected.invoiceNumber || selected.id}`} className="btn-primary flex-1 justify-center text-xs py-2 text-center">
                    Full Detail
                  </Link>
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
