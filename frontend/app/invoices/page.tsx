'use client';
import AppLayout from '@/components/AppLayout';
import { dashboardApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { Receipt } from 'lucide-react';

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

  useEffect(() => {
    dashboardApi.invoices().then(r => { setInvoices(r.data); setLoading(false); });
  }, []);

  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-sm mt-1" style={{ color: 'hsl(215 20% 65%)' }}>Billing records for one-time and recurring orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card overflow-hidden">
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
                  <tr><td colSpan={6} className="py-8 text-center" style={{ color: 'hsl(215 15% 45%)' }}>Loading…</td></tr>
                ) : invoices.map((inv: any) => {
                  const sc = STATUS_COLOR[inv.status] || STATUS_COLOR.DRAFT;
                  return (
                    <tr key={inv.id} onClick={() => setSelected(inv)}>
                      <td className="font-mono text-xs font-bold" style={{ color: 'hsl(220 90% 70%)' }}>{inv.invoiceNumber}</td>
                      <td className="font-medium text-white">{inv.customer?.name || '—'}</td>
                      <td className="font-semibold text-white">${Number(inv.totalAmount || 0).toLocaleString()}</td>
                      <td style={{ color: 'hsl(215 20% 65%)' }}>{inv.dueDate || '—'}</td>
                      <td><span className="badge badge-muted">{inv.isRecurring ? 'Recurring' : 'One-Time'}</span></td>
                      <td><span className="badge" style={sc}>{inv.status}</span></td>
                    </tr>
                  );
                })}
                {invoices.length === 0 && !loading && (
                  <tr><td colSpan={6} className="py-8 text-center" style={{ color: 'hsl(215 15% 45%)' }}>No unpaid invoices</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div>
            {!selected ? (
              <div className="glass-card p-8 text-center">
                <Receipt size={24} className="mx-auto mb-3" style={{ color: 'hsl(215 15% 45%)' }} />
                <p className="text-sm" style={{ color: 'hsl(215 20% 65%)' }}>Select an invoice to view detail</p>
              </div>
            ) : (
              <div className="glass-card p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-white">{selected.invoiceNumber}</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'hsl(215 20% 65%)' }}>{selected.customer?.name}</p>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    ['Subtotal',    `$${Number(selected.subtotal || 0).toLocaleString()}`],
                    ['Tax',         `$${Number(selected.taxTotal || 0).toLocaleString()}`],
                    ['Total',       `$${Number(selected.totalAmount || 0).toLocaleString()}`],
                    ['Paid',        `$${Number(selected.amountPaid || 0).toLocaleString()}`],
                    ['Amount Due',  `$${Number(selected.amountDue || 0).toLocaleString()}`],
                    ['Due Date',    selected.dueDate || '—'],
                  ].map(([l, v]) => (
                    <div key={l as string} className="flex justify-between">
                      <span style={{ color: 'hsl(215 20% 65%)' }}>{l}</span>
                      <span className="font-medium text-white">{v as string}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button className="btn-primary flex-1 justify-center text-sm">Record Payment</button>
                  <button className="btn-secondary flex-1 justify-center text-sm">Download</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
