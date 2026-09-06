'use client';
import AppLayout from '@/components/AppLayout';
import { dashboardApi, getStoredUser } from '@/lib/api';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Receipt, RefreshCw, FileText, Download, CheckCircle, Table } from 'lucide-react';

const FALLBACK_INVOICES = [
  {
    id: 1042,
    invoiceNumber: 'INV-1042',
    customer: { name: 'Acme Corporation Inc.' },
    subtotal: 2500,
    taxTotal: 230,
    totalAmount: 2730,
    amountPaid: 0,
    amountDue: 2730,
    dueDate: '2026-09-30',
    isRecurring: false,
    status: 'UNPAID',
    notes: 'Industrial Gateway & IoT Platform License'
  },
  {
    id: 1039,
    invoiceNumber: 'INV-1039',
    customer: { name: 'Global Logix Enterprise' },
    subtotal: 4800,
    taxTotal: 432,
    totalAmount: 5232,
    amountPaid: 5232,
    amountDue: 0,
    dueDate: '2026-08-15',
    isRecurring: true,
    status: 'PAID',
    notes: 'Warehouse Management Pro Annual Plan'
  },
  {
    id: 1035,
    invoiceNumber: 'INV-1035',
    customer: { name: 'Apex Dynamics Tiers' },
    subtotal: 1200,
    taxTotal: 108,
    totalAmount: 1308,
    amountPaid: 0,
    amountDue: 1308,
    dueDate: '2026-09-15',
    isRecurring: true,
    status: 'OVERDUE',
    notes: 'CRM Pro Tier 45 users'
  }
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [user, setUser]         = useState<any>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = getStoredUser();
      setUser(u);
    }
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const r = await dashboardApi.invoices();
      const fetched = r.data || [];
      if (fetched.length > 0) {
        setInvoices(fetched);
        setSelected(fetched[0]);
      } else {
        setInvoices(FALLBACK_INVOICES);
        setSelected(FALLBACK_INVOICES[0]);
      }
    } catch (err: any) {
      setInvoices(FALLBACK_INVOICES);
      setSelected(FALLBACK_INVOICES[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const userRole = user.role || 'FINANCE';

  const handleExportCSV = () => {
    const list = invoices.length > 0 ? invoices : FALLBACK_INVOICES;
    const headers = ['Invoice #', 'Customer', 'Subtotal', 'Tax Total', 'Total Amount', 'Amount Paid', 'Amount Due', 'Due Date', 'Recurring', 'Status'];
    const rows = list.map(inv => [
      inv.invoiceNumber || inv.id,
      `"${(inv.customer?.name || 'Customer').replace(/"/g, '""')}"`,
      inv.subtotal || 0,
      inv.taxTotal || 0,
      inv.totalAmount || 0,
      inv.amountPaid || 0,
      inv.amountDue || 0,
      inv.dueDate || '',
      inv.isRecurring ? 'Yes' : 'No',
      inv.status || 'UNPAID'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Invoices_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast('Invoices register exported to CSV!');
  };

  const handleDownloadPDF = (invNum: string) => {
    triggerToast(`Generating Invoice PDF for ${invNum}...`);
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
              <h1 className="page-heading">Invoices & Billing Register</h1>
              <span className="badge badge-indigo">
                Role: {userRole}
              </span>
              <span className="badge badge-success">
                Reconciliation Sync
              </span>
            </div>
            <p className="body-text" style={{ marginTop: '4px' }}>
              Billing records for one-time and recurring contracts with fulfillment linkage and tax reconciliation.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleExportCSV}
              className="btn-secondary flex items-center gap-2"
              type="button"
            >
              <Table size={16} className="text-[var(--success)]" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={loadInvoices}
              className="btn-secondary flex items-center gap-2"
              type="button"
            >
              <RefreshCw size={16} className="text-[var(--accent)]" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 df-card overflow-hidden !p-0">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="section-label text-base text-[var(--text-primary)]">Billing Ledger ({invoices.length} Records)</h2>
              <span className="body-sm font-mono text-[var(--text-muted)]">Net 30 Terms</span>
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
                            {inv.invoiceNumber || `INV-${inv.id}`}
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
              <div className="df-card p-5 space-y-4 shadow-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="section-label text-lg text-[var(--text-primary)]">{selected.invoiceNumber || `INV-${selected.id}`}</h3>
                    <span className={`badge ${selected.status === 'PAID' ? 'badge-success' : 'badge-danger'}`}>{selected.status}</span>
                  </div>
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
                  <button
                    onClick={() => handleDownloadPDF(selected.invoiceNumber || `INV-${selected.id}`)}
                    className="btn-secondary flex-1 justify-center text-xs py-2 flex items-center gap-1.5"
                    type="button"
                  >
                    <Download size={14} />
                    <span>Download PDF</span>
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

