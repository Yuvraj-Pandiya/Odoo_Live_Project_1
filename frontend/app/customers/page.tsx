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
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Customers</h1>
            <p className="text-sm mt-1" style={{ color: 'hsl(215 20% 65%)' }}>Manage your customer accounts and tiers</p>
          </div>
          <button className="btn-primary"><Plus size={14} /> Add Customer</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card overflow-hidden">
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
                  <tr><td colSpan={6} className="py-8 text-center" style={{ color: 'hsl(215 15% 45%)' }}>Loading…</td></tr>
                ) : customers.map((c: any) => {
                  const tc = TIER_COLOR[c.tier] || TIER_COLOR.BRONZE;
                  return (
                    <tr key={c.id} onClick={() => setSelected(c)}>
                      <td className="font-medium text-white">{c.name}</td>
                      <td style={{ color: 'hsl(215 20% 65%)' }}>{c.company || '—'}</td>
                      <td style={{ color: 'hsl(215 20% 65%)' }}>{c.email}</td>
                      <td><span className="badge" style={tc}>{c.tier}</span></td>
                      <td style={{ color: 'hsl(215 20% 65%)' }}>{c.currency}</td>
                      <td><span className={`badge ${c.isActive ? 'badge-success' : 'badge-muted'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div>
            {!selected ? (
              <div className="glass-card p-8 text-center">
                <Users size={24} className="mx-auto mb-3" style={{ color: 'hsl(215 15% 45%)' }} />
                <p className="text-sm" style={{ color: 'hsl(215 20% 65%)' }}>Select a customer to view</p>
              </div>
            ) : (
              <div className="glass-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">{selected.name}</h3>
                  <span className="badge" style={TIER_COLOR[selected.tier]}>{selected.tier}</span>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    ['Company',  selected.company || '—'],
                    ['Email',    selected.email],
                    ['Phone',    selected.phone || '—'],
                    ['City',     selected.city || '—'],
                    ['Country',  selected.country || '—'],
                    ['Currency', selected.currency],
                  ].map(([l, v]) => (
                    <div key={l as string} className="flex justify-between">
                      <span style={{ color: 'hsl(215 20% 65%)' }}>{l}</span>
                      <span className="font-medium text-white">{v as string}</span>
                    </div>
                  ))}
                </div>
                {selected.portalToken && (
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'hsl(215 20% 65%)' }}>PORTAL LINK</p>
                    <a href={`/portal/${selected.portalToken}`} target="_blank"
                       className="text-xs block p-2 rounded font-mono break-all"
                       style={{ background: 'hsl(222 47% 15%)', color: 'hsl(220 90% 70%)' }}>
                      /portal/{selected.portalToken?.substring(0,16)}…
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
