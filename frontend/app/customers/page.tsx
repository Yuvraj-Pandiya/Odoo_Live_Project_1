'use client';
import AppLayout from '@/components/AppLayout';
import { useEffect, useState } from 'react';
import { customerApi } from '@/lib/api';
import { Users, Plus } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<any>(null);

  useEffect(() => {
    customerApi.list().then(r => { setCustomers(r.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-heading">Customers</h1>
            <p className="body-text mt-1">Manage your customer accounts and commercial tiers</p>
          </div>
          <button className="btn-primary"><Plus size={16} /> Add Customer</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 df-card overflow-hidden !p-0">
            <table className="df-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Tier</th>
                  <th>Currency</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-8 text-center body-sm">Loading customer accounts…</td></tr>
                ) : customers.map((c: any) => {
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className={`cursor-pointer transition-colors ${selected?.id === c.id ? 'bg-[var(--accent-subtle)]' : ''}`}
                    >
                      <td className="font-semibold text-[var(--text-primary)]">{c.name}</td>
                      <td className="body-text">{c.company || '—'}</td>
                      <td className="body-text">{c.email}</td>
                      <td>
                        <span className={`badge ${c.tier === 'GOLD' ? 'badge-warning' : c.tier === 'SILVER' ? 'badge-outline' : 'badge-muted'}`}>
                          {c.tier}
                        </span>
                      </td>
                      <td className="body-text font-mono">{c.currency}</td>
                      <td><span className={`badge ${c.isActive ? 'badge-success' : 'badge-muted'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                    </tr>
                  );
                })}
                {customers.length === 0 && !loading && (
                  <tr><td colSpan={6} className="py-8 text-center body-sm">No customer accounts found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div>
            {!selected ? (
              <div className="df-card p-8 text-center">
                <Users size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
                <p className="section-label mb-1">Select a customer</p>
                <p className="body-sm">View account profile and direct portal token</p>
              </div>
            ) : (
              <div className="df-card p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="section-label text-base text-[var(--text-primary)]">{selected.name}</h3>
                  <span className={`badge ${selected.tier === 'GOLD' ? 'badge-warning' : selected.tier === 'SILVER' ? 'badge-outline' : 'badge-muted'}`}>{selected.tier}</span>
                </div>
                <div className="space-y-2.5 body-sm">
                  {[
                    ['Company',  selected.company || '—'],
                    ['Email',    selected.email],
                    ['Phone',    selected.phone || '—'],
                    ['City',     selected.city || '—'],
                    ['Country',  selected.country || '—'],
                    ['Currency', selected.currency],
                  ].map(([l, v]) => (
                    <div key={l as string} className="flex justify-between py-1 border-b border-[var(--border)] last:border-0">
                      <span className="body-sm">{l}</span>
                      <span className="font-semibold text-[var(--text-primary)]">{v as string}</span>
                    </div>
                  ))}
                </div>
                {selected.portalToken && (
                  <div className="pt-2">
                    <p className="section-label mb-2">Customer portal link</p>
                    <a href={`/portal/${selected.portalToken}`} target="_blank"
                       className="text-xs block p-2.5 rounded-lg font-mono break-all bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--border)] hover:underline">
                      /portal/{selected.portalToken?.substring(0,20)}…
                    </a>
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
