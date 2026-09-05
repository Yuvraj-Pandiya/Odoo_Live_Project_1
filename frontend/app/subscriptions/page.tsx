'use client';
import { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';

interface Subscription {
  id: string;
  contractId: string;
  customer: string;
  plan: string;
  mrr: number;
  arr: number;
  cadence: 'Monthly' | 'Annual';
  status: 'Active' | 'Pending Renewal' | 'Paused' | 'Cancelled';
  nextBilling: string;
  autoRenew: boolean;
}

const initialSubscriptions: Subscription[] = [
  { id: 'SUB-9021', contractId: 'ORD-1042', customer: 'Acme Corp', plan: 'Enterprise Cloud Platform (100 seats)', mrr: 2500, arr: 30000, cadence: 'Monthly', status: 'Active', nextBilling: '2026-10-01', autoRenew: true },
  { id: 'SUB-9022', contractId: 'ORD-1039', customer: 'Global Logix', plan: 'Warehouse Management Pro & Logistics AI', mrr: 4800, arr: 57600, cadence: 'Annual', status: 'Active', nextBilling: '2027-01-15', autoRenew: true },
  { id: 'SUB-9023', contractId: 'ORD-1035', customer: 'Apex Dynamics', plan: 'CRM Pro Tier (45 users) + SLA 99.9%', mrr: 1200, arr: 14400, cadence: 'Monthly', status: 'Pending Renewal', nextBilling: '2026-09-15', autoRenew: false },
  { id: 'SUB-9024', contractId: 'ORD-1030', customer: 'Starlight Tech', plan: 'Analytics Engine Enterprise', mrr: 3100, arr: 37200, cadence: 'Annual', status: 'Active', nextBilling: '2026-11-30', autoRenew: true },
  { id: 'SUB-9025', contractId: 'ORD-1022', customer: 'Vanguard Systems', plan: 'Developer Support Tier + Dedicated CSM', mrr: 850, arr: 10200, cadence: 'Monthly', status: 'Paused', nextBilling: '2026-10-01', autoRenew: false },
];

export default function SubscriptionsPage() {
  const [filterCadence, setFilterCadence] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredSubs = initialSubscriptions.filter(sub => {
    const matchesCadence = filterCadence === 'All' || sub.cadence === filterCadence;
    const matchesSearch = sub.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sub.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sub.plan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCadence && matchesSearch;
  });

  const totalARR = initialSubscriptions.reduce((acc, s) => acc + s.arr, 0);
  const totalMRR = initialSubscriptions.reduce((acc, s) => acc + s.mrr, 0);
  const activeCount = initialSubscriptions.filter(s => s.status === 'Active').length;

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 className="page-heading">Subscriptions & recurring contracts</h1>
              <span className="badge badge-success">
                Hybrid billing engine
              </span>
            </div>
            <p className="body-text" style={{ marginTop: '4px' }}>
              Manage active subscription lifecycles, MRR/ARR distributions, proration schedules, and contract renewals.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn-secondary">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>file_download</span>
              <span>Export ARR report</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div className="df-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total ARR</span>
            <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>${totalARR.toLocaleString()}</span>
            <span className="body-sm" style={{ color: 'var(--success)', fontWeight: 500 }}>+14.2% YoY growth</span>
          </div>
          <div className="df-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total MRR</span>
            <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>${totalMRR.toLocaleString()}</span>
            <span className="body-sm">Avg. contract: ${(totalMRR / initialSubscriptions.length).toFixed(0)}/mo</span>
          </div>
          <div className="df-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Active subscriptions</span>
            <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>{activeCount} / {initialSubscriptions.length}</span>
            <span className="body-sm" style={{ color: 'var(--success)', fontWeight: 500 }}>96.5% Net retention</span>
          </div>
          <div className="df-card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Upcoming renewals (30d)</span>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#D97706' }}>1 Contract</span>
            <span className="body-sm" style={{ color: '#D97706', fontWeight: 500 }}>Apex Dynamics (Apex-9023)</span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="df-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', fontSize: '18px' }}>search</span>
              <input
                type="text"
                placeholder="Search subscription, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="df-input"
                style={{ width: '280px', paddingLeft: '36px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '4px', background: 'var(--canvas)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              {['All', 'Monthly', 'Annual'].map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterCadence(c)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: filterCadence === c ? 'var(--surface)' : 'transparent',
                    color: filterCadence === c ? 'var(--accent)' : 'var(--text-secondary)',
                    border: 'none',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="body-sm">
            Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredSubs.length}</strong> active subscription schedules
          </div>
        </div>

        {/* Table */}
        <div className="df-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Subscription ID</th>
                  <th>Customer</th>
                  <th>Plan & software</th>
                  <th style={{ textAlign: 'right' }}>MRR</th>
                  <th style={{ textAlign: 'right' }}>ARR</th>
                  <th style={{ textAlign: 'center' }}>Cadence</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Next billing</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <Link href={`/subscriptions/${sub.id}`} style={{ fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>
                        {sub.id}
                      </Link>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sub.customer}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{sub.plan}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--success)' }}>${sub.mrr.toLocaleString()}/mo</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-primary)' }}>${sub.arr.toLocaleString()}/yr</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-primary">
                        {sub.cadence}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        sub.status === 'Active' ? 'badge-success' :
                        sub.status === 'Pending Renewal' ? 'badge-warning' :
                        'badge-muted'
                      }`}>
                        {sub.status.toLowerCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }} className="body-sm">{sub.nextBilling}</td>
                    <td style={{ textAlign: 'center' }}>
                      <Link
                        href={`/subscriptions/${sub.id}`}
                        className="btn-secondary"
                        style={{ height: '32px', padding: '0 12px', fontSize: '13px' }}
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
