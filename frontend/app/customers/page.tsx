'use client';
import AppLayout from '@/components/AppLayout';
import { useEffect, useState } from 'react';
import { customerApi } from '@/lib/api';
import { Users, Plus } from 'lucide-react';

const TIER_COLOR: any = {
  GOLD:   { bg: 'hsl(38 92% 50% / 0.15)',  text: 'hsl(38 92% 65%)' },
  SILVER: { bg: 'hsl(215 20% 65% / 0.15)', text: 'hsl(215 20% 75%)' },
  BRONZE: { bg: 'hsl(25 70% 50% / 0.15)',  text: 'hsl(25 70% 65%)' },
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<any>(null);

  useEffect(() => {
    customerApi.list().then(r => { setCustomers(r.data); setLoading(false); });
  }, []);

  return (
    <AppLayout>
      <div className="df-page-container flex flex-col" style={{ gap: 'var(--space-xl)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-1 text-slate-900">Customers</h1>
            <p className="text-body-lg text-slate-600 mt-1">Manage your customer accounts and commercial tiers</p>
          </div>
          <button className="btn-primary text-body-base"><Plus size={15} /> Add Customer</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xs">
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
                  <tr><td colSpan={6} className="py-8 text-center text-body-base text-slate-500">Loading customer accounts…</td></tr>
                ) : customers.map((c: any) => {
                  return (
                    <tr key={c.id} onClick={() => setSelected(c)}>
                      <td className="font-semibold text-slate-900">{c.name}</td>
                      <td className="text-slate-600">{c.company || '—'}</td>
                      <td className="text-slate-600">{c.email}</td>
                      <td>
                        <span className={`badge ${c.tier === 'GOLD' ? 'badge-warning' : c.tier === 'SILVER' ? 'badge-outline' : 'badge-muted'}`}>
                          {c.tier}
                        </span>
                      </td>
                      <td className="text-slate-600 font-mono">{c.currency}</td>
                      <td><span className={`badge ${c.isActive ? 'badge-success' : 'badge-muted'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div>
            {!selected ? (
              <div className="rounded-xl p-10 text-center bg-white border border-slate-200 shadow-xs">
                <Users size={28} className="mx-auto mb-3 text-slate-400" />
                <p className="text-heading-3 text-slate-800">Select a customer</p>
                <p className="text-body-base text-slate-500 mt-1">View account profile and direct portal token</p>
              </div>
            ) : (
              <div className="rounded-xl p-6 bg-white border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-heading-3 text-slate-900">{selected.name}</h3>
                  <span className={`badge ${selected.tier === 'GOLD' ? 'badge-warning' : selected.tier === 'SILVER' ? 'badge-outline' : 'badge-muted'}`}>{selected.tier}</span>
                </div>
                <div className="space-y-2.5 text-body-base">
                  {[
                    ['Company',  selected.company || '—'],
                    ['Email',    selected.email],
                    ['Phone',    selected.phone || '—'],
                    ['City',     selected.city || '—'],
                    ['Country',  selected.country || '—'],
                    ['Currency', selected.currency],
                  ].map(([l, v]) => (
                    <div key={l as string} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                      <span className="text-slate-500">{l}</span>
                      <span className="font-medium text-slate-900">{v as string}</span>
                    </div>
                  ))}
                </div>
                {selected.portalToken && (
                  <div className="pt-2">
                    <p className="text-caption font-bold text-slate-500 uppercase tracking-wider mb-2">CUSTOMER PORTAL LINK</p>
                    <a href={`/portal/${selected.portalToken}`} target="_blank"
                       className="text-xs block p-2.5 rounded-lg font-mono break-all bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition">
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
