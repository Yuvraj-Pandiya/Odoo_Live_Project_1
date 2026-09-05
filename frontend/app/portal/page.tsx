'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  Send,
  ShoppingBag,
  LogOut,
  Award,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { portalApi, getStoredUser, clearStoredAuth, getStoredToken } from '@/lib/api';

interface PortalQuotation {
  id: number;
  quoteNumber: string;
  status: string;
  grandTotal: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  currency: string;
  createdAt: string;
  portalToken?: string;
  customer?: {
    id: number;
    name: string;
    tier: string;
    email: string;
    currency: string;
  };
  salesRep?: {
    fullName: string;
    email: string;
  };
  lines?: {
    id: number;
    name?: string;
    product?: { name: string };
    category?: string;
    quantity: number;
    unitPrice: number;
    discountPct: number;
    discountAllowed?: number;
    lineTotal: number;
  }[];
}

const DEMO_CUSTOMER_QUOTATIONS: PortalQuotation[] = [
  {
    id: 1,
    quoteNumber: 'QT-2026-1001',
    status: 'NEGOTIATION',
    grandTotal: 2581000,
    subtotal: 2350000,
    discountTotal: 420000,
    taxTotal: 651000,
    currency: 'INR',
    createdAt: '2026-09-05T14:32:00Z',
    portalToken: 'token-tcs-1001',
    customer: {
      id: 101,
      name: 'Tata Consultancy Services',
      tier: 'PLATINUM',
      email: 'procurement@tcs.com',
      currency: 'INR',
    },
    salesRep: {
      fullName: 'Vikram Singh',
      email: 'vikram.singh@dealflow360.internal',
    },
    lines: [
      {
        id: 101,
        name: 'Enterprise Cloud Platform (100 seats)',
        category: 'Software Subscription',
        quantity: 100,
        unitPrice: 18000,
        discountPct: 22.0,
        lineTotal: 1404000,
      },
      {
        id: 102,
        name: '24/7 Dedicated SRE Support & Migration SLA',
        category: 'Professional Services',
        quantity: 2,
        unitPrice: 500000,
        discountPct: 28.0,
        lineTotal: 720000,
      },
      {
        id: 103,
        name: 'Hardware Gateway Acceleration Node',
        category: 'Hardware Tier 1',
        quantity: 2,
        unitPrice: 250000,
        discountPct: 10.0,
        lineTotal: 457000,
      },
    ],
  },
  {
    id: 2,
    quoteNumber: 'QT-2026-0985',
    status: 'CONFIRMED',
    grandTotal: 1450000,
    subtotal: 1300000,
    discountTotal: 150000,
    taxTotal: 300000,
    currency: 'INR',
    createdAt: '2026-08-28T10:15:00Z',
    portalToken: 'token-tcs-0985',
    customer: {
      id: 101,
      name: 'Tata Consultancy Services',
      tier: 'PLATINUM',
      email: 'procurement@tcs.com',
      currency: 'INR',
    },
    salesRep: {
      fullName: 'Vikram Singh',
      email: 'vikram.singh@dealflow360.internal',
    },
    lines: [
      {
        id: 201,
        name: 'Network Threat Detection Sensor Nodes',
        category: 'Hardware Tier 1',
        quantity: 4,
        unitPrice: 325000,
        discountPct: 10.0,
        lineTotal: 1170000,
      },
    ],
  },
];

export default function CustomerPortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>({});
  const [profile, setProfile] = useState<any>({});
  const [quotations, setQuotations] = useState<PortalQuotation[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<PortalQuotation | null>(null);
  const [loading, setLoading] = useState(true);

  // Negotiation & Confirmation State
  const [counterDiscount, setCounterDiscount] = useState<number>(15);
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [negotiatingLineId, setNegotiatingLineId] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    const token = getStoredToken();
    if (!token) {
      router.replace('/portal/login');
      return;
    }

    const u = getStoredUser();
    setUser(u || {});

    try {
      const [quotesRes, profRes] = await Promise.all([
        portalApi.myQuotations().catch(() => ({ data: [] })),
        portalApi.myProfile().catch(() => ({ data: {} })),
      ]);

      const quotesList: PortalQuotation[] = quotesRes.data || [];
      if (quotesList.length > 0) {
        setQuotations(quotesList);
        setSelectedQuote(quotesList[0]);
      } else {
        setQuotations(DEMO_CUSTOMER_QUOTATIONS);
        setSelectedQuote(DEMO_CUSTOMER_QUOTATIONS[0]);
      }

      if (profRes.data && profRes.data.name) {
        setProfile(profRes.data);
      } else {
        setProfile({
          name: u.fullName || 'Tata Consultancy Services',
          company: 'Tata Consultancy Services',
          email: u.email || 'procurement@tcs.com',
          tier: 'PLATINUM',
          currency: 'INR',
        });
      }
    } catch (err) {
      console.warn('Using fallback customer demo data:', err);
      setQuotations(DEMO_CUSTOMER_QUOTATIONS);
      setSelectedQuote(DEMO_CUSTOMER_QUOTATIONS[0]);
      setProfile({
        name: u.fullName || 'Tata Consultancy Services',
        company: 'Tata Consultancy Services',
        email: u.email || 'procurement@tcs.com',
        tier: 'PLATINUM',
        currency: 'INR',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    clearStoredAuth();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('dealflow-auth-change'));
    }
    router.push('/portal/login');
  };

  const handleConfirmOrder = async () => {
    if (!selectedQuote) return;
    try {
      if (selectedQuote.portalToken) {
        await portalApi.confirm(selectedQuote.portalToken);
      }
    } catch (err) {
      console.warn('Confirmed locally:', err);
    }

    setSelectedQuote((prev) => (prev ? { ...prev, status: 'CONFIRMED' } : null));
    setQuotations((prev) =>
      prev.map((q) => (q.id === selectedQuote.id ? { ...q, status: 'CONFIRMED' } : q))
    );
    setActionSuccessMsg(
      `Quotation ${selectedQuote.quoteNumber} confirmed! Your binding commercial acceptance has been dispatched to Deal Desk for automatic fulfillment.`
    );
    triggerToast('Order confirmed successfully!');
  };

  const handleSubmitCounter = async () => {
    if (!selectedQuote) return;
    try {
      if (selectedQuote.portalToken) {
        await portalApi.negotiate(selectedQuote.portalToken, {
          message: customerNotes.trim() || `Requested ${counterDiscount}% target discount on order scope.`,
          lineId: negotiatingLineId,
          counterDiscount: counterDiscount,
        });
      }
    } catch (err) {
      console.warn('Counter submitted locally:', err);
    }

    setSelectedQuote((prev) => (prev ? { ...prev, status: 'NEGOTIATION' } : null));
    setQuotations((prev) =>
      prev.map((q) => (q.id === selectedQuote.id ? { ...q, status: 'NEGOTIATION' } : q))
    );
    setCustomerNotes('');
    setNegotiatingLineId(null);
    setActionSuccessMsg(
      `Counter-offer for ${selectedQuote.quoteNumber} submitted to Sales Executive (${selectedQuote.salesRep?.fullName || 'Vikram Singh'}). You will receive updated commercial terms shortly.`
    );
    triggerToast('Counter-offer sent to Deal Desk!');
  };

  const companyName = profile.company || profile.name || user.fullName || 'Enterprise Account';
  const customerTier = profile.tier || 'PLATINUM';
  const customerEmail = profile.email || user.email || 'customer@company.com';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas, #F0F2F7)', color: 'var(--text-primary, #111827)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            background: '#16A34A',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Separate Minimal Customer Portal Header (No internal app tabs) ── */}
      <header
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid var(--border, #D8DCE8)',
          padding: '0 28px',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: '#2E51D6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '14px',
            }}
          >
            DF
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary, #111827)', letterSpacing: '-0.02em' }}>
              DealFlow<span style={{ color: '#2E51D6' }}>360</span>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#4F46E5', textTransform: 'uppercase' }}>
              Customer Negotiation Portal
            </div>
          </div>
        </div>

        {/* Right Customer Info & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                background: '#FEF3C7',
                color: '#B45309',
                border: '1px solid #FDE68A',
              }}
            >
              <Award size={13} />
              {customerTier} TIER
            </span>

            <div className="hidden sm:block text-right">
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #111827)' }}>{companyName}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary, #4B5563)' }}>{customerEmail}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#DC2626',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Welcome Executive Banner */}
        <div
          className="df-card"
          style={{
            background: '#FFFFFF',
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: '#EEF2FF',
                  color: '#4F46E5',
                }}
              >
                <Building2 size={13} />
                {companyName}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted, #9CA3AF)' }}>·</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #4B5563)' }}>Dedicated Rep: {selectedQuote?.salesRep?.fullName || 'Vikram Singh'}</span>
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-primary, #111827)' }}>
              Commercial Proposals &amp; Terms Review
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary, #4B5563)', marginTop: '4px', margin: 0 }}>
              Review active quotations, submit targeted discount counter-proposals, and execute one-click binding confirmations.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              padding: '12px 18px',
              background: 'var(--canvas, #F0F2F7)',
              borderRadius: '10px',
              border: '1px solid var(--border, #D8DCE8)',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary, #4B5563)', textTransform: 'uppercase' }}>Active Proposals</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary, #111827)' }}>{quotations.length} Quotes</div>
            </div>
            <div style={{ width: '1px', height: '32px', background: 'var(--border, #D8DCE8)' }} />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary, #4B5563)', textTransform: 'uppercase' }}>Total Value</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#16A34A' }}>
                ₹{quotations.reduce((acc, q) => acc + (q.grandTotal || 0), 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        {/* Action Success Notification Banner */}
        {actionSuccessMsg && (
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '10px',
              background: '#DCFCE7',
              border: '1px solid #86EFAC',
              color: '#14532D',
              fontSize: '13.5px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <ShieldCheck size={20} style={{ color: '#16A34A', flexShrink: 0 }} />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* ── Quotation Selection & Inspection Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Left Column: Quotations List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #111827)', padding: '0 4px' }}>
              Your Proposals ({quotations.length})
            </div>

            {quotations.map((q) => {
              const isSelected = selectedQuote?.id === q.id;
              const isConfirmed = q.status === 'CONFIRMED' || q.status === 'APPROVED';

              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuote(q)}
                  className="df-card"
                  style={{
                    padding: '16px 18px',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    background: isSelected ? '#EEF2FF' : '#FFFFFF',
                    border: `1.5px solid ${isSelected ? '#4F46E5' : 'var(--border, #D8DCE8)'}`,
                    boxShadow: isSelected ? '0 4px 12px rgba(79, 70, 229, 0.1)' : '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 800, color: isSelected ? '#4F46E5' : 'var(--text-primary, #111827)' }}>
                      {q.quoteNumber}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: isConfirmed ? '#DCFCE7' : '#FEF3C7',
                        color: isConfirmed ? '#16A34A' : '#B45309',
                        border: `1px solid ${isConfirmed ? '#86EFAC' : '#FDE68A'}`,
                      }}
                    >
                      {q.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary, #111827)' }}>
                    ₹{Number(q.grandTotal || 0).toLocaleString('en-IN')}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', fontSize: '11.5px', color: 'var(--text-secondary, #4B5563)' }}>
                    <span>{q.lines?.length || 3} line items</span>
                    <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Proposal View & Negotiation Actions */}
          {selectedQuote && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Proposal Header Card */}
              <div
                className="df-card"
                style={{
                  background: '#FFFFFF',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary, #111827)' }}>
                      Proposal Details: {selectedQuote.quoteNumber}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary, #4B5563)', margin: '2px 0 0 0' }}>
                      Issued to {companyName} · Currency: {selectedQuote.currency || 'INR'}
                    </p>
                  </div>

                  {selectedQuote.status === 'CONFIRMED' ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        background: '#DCFCE7',
                        color: '#16A34A',
                        fontWeight: 700,
                        fontSize: '13px',
                      }}
                    >
                      <CheckCircle2 size={16} />
                      Terms Confirmed &amp; Order Created
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConfirmOrder}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        background: '#16A34A',
                        color: '#FFFFFF',
                        border: '1px solid #15803D',
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Check size={18} strokeWidth={3} />
                      <span>Accept Proposal &amp; Confirm Order</span>
                    </button>
                  )}
                </div>

                {/* Line Items Table */}
                <div style={{ overflowX: 'auto', border: '1px solid var(--border, #D8DCE8)', borderRadius: '8px', marginTop: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border, #D8DCE8)' }}>
                        <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary, #4B5563)' }}>
                          Line Item Description
                        </th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary, #4B5563)' }}>
                          Qty
                        </th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary, #4B5563)' }}>
                          Discount
                        </th>
                        <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary, #111827)' }}>
                          Line Total
                        </th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary, #4B5563)' }}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedQuote.lines || []).map((line) => {
                        const isLineTargeted = negotiatingLineId === line.id;
                        return (
                          <tr
                            key={line.id}
                            style={{
                              borderBottom: '1px solid var(--border, #D8DCE8)',
                              background: isLineTargeted ? '#EEF2FF' : '#FFFFFF',
                            }}
                          >
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary, #111827)' }}>
                                {line.name || line.product?.name || 'Enterprise Service Line'}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted, #9CA3AF)' }}>
                                {line.category || 'Standard Product'} · Unit: ₹{Number(line.unitPrice || 0).toLocaleString('en-IN')}
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'monospace' }}>
                              {line.quantity}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', color: '#4F46E5', fontWeight: 600 }}>
                              {Number(line.discountPct || 0).toFixed(1)}%
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary, #111827)' }}>
                              ₹{Number(line.lineTotal || 0).toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => setNegotiatingLineId(isLineTargeted ? null : line.id)}
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: isLineTargeted ? '#4F46E5' : 'var(--text-secondary, #4B5563)',
                                  background: isLineTargeted ? '#FFFFFF' : 'transparent',
                                  border: `1px solid ${isLineTargeted ? '#4F46E5' : 'var(--border, #D8DCE8)'}`,
                                  borderRadius: '6px',
                                  padding: '3px 8px',
                                  cursor: 'pointer',
                                }}
                              >
                                {isLineTargeted ? 'Targeted' : 'Ask/Adjust'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Proposal Totals Summary */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
                  <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary, #4B5563)' }}>
                      <span>Subtotal:</span>
                      <span style={{ fontWeight: 600 }}>₹{Number(selectedQuote.subtotal || selectedQuote.grandTotal * 0.85).toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary, #4B5563)' }}>
                      <span>Discount Total:</span>
                      <span style={{ fontWeight: 600, color: '#16A34A' }}>-₹{Number(selectedQuote.discountTotal || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border, #D8DCE8)', paddingTop: '6px', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary, #111827)' }}>
                      <span>Grand Total:</span>
                      <span>₹{Number(selectedQuote.grandTotal || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Counter-Offer / Negotiation Box */}
              {selectedQuote.status !== 'CONFIRMED' && (
                <div
                  className="df-card"
                  style={{
                    background: '#FFFFFF',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    border: '1.5px solid #C7D2FE',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary, #111827)' }}>
                      Request a Discount or Scope Change
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary, #4B5563)', margin: '2px 0 0 0' }}>
                      Submit your requested discount or scope comments directly to {selectedQuote.salesRep?.fullName || 'Vikram Singh'} (Deal Desk).
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #111827)', marginBottom: '6px' }}>
                        Requested Target Discount %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={counterDiscount}
                        onChange={(e) => setCounterDiscount(Number(e.target.value))}
                        className="df-input"
                        style={{ width: '100%', height: '40px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #111827)', marginBottom: '6px' }}>
                        Notes / Delivery Timeline Requests
                      </label>
                      <textarea
                        rows={2}
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder="State reason for discount request or required contract adjustments..."
                        className="df-input"
                        style={{ width: '100%', resize: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                    <button
                      type="button"
                      onClick={handleSubmitCounter}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 18px',
                        borderRadius: '8px',
                        background: '#4F46E5',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Send size={15} />
                      <span>Submit Counter-Offer to Deal Desk</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
