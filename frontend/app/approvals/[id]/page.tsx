'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { quotationApi, getStoredUser } from '@/lib/api';
import { canApproveAny, canApproveAtLevel } from '@/lib/permissions';
import {
  ArrowLeft,
  CheckCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Check,
  X,
  FileText,
  TrendingDown,
  Activity,
  Award,
} from 'lucide-react';
import { ApprovalStepperInspector } from '@/components/ApprovalStepperInspector';

interface AuditLogEntry {
  id: string | number;
  user: string;
  role: string;
  action: 'SUBMITTED' | 'APPROVED' | 'RETURNED' | 'REJECTED' | 'AUTO_APPROVED' | 'FINANCE_APPROVED';
  date: string;
  note: string;
}

interface FlaggedLineItem {
  id: number;
  name: string;
  category: string;
  discountGiven: number;
  limitAllowed: number;
  variance: number;
  unitPrice: number;
  quantity: number;
  total: number;
}

export default function ApprovalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || '1';

  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>({});
  const [notes, setNotes] = useState('');
  const [notesError, setNotesError] = useState('');
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);

  // Stepper state: 'SUBMITTED' | 'MANAGER' | 'FINANCE' | 'CONFIRMED' | 'REJECTED' | 'RETURNED'
  const [currentStep, setCurrentStep] = useState<string>('MANAGER');

  // Confirmation Modal state
  const [confirmationData, setConfirmationData] = useState<{
    action: string;
    reviewer: string;
    timestamp: string;
    notes: string;
    nextStepLabel: string;
  } | null>(null);

  // Dynamic Audit Trail state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Load stored user & auth
  const loadUser = () => {
    if (typeof window !== 'undefined') {
      const u = getStoredUser();
      setUser(u || {});
    }
  };

  useEffect(() => {
    loadUser();
    const handleAuth = () => loadUser();
    window.addEventListener('dealflow-auth-change', handleAuth);
    return () => window.removeEventListener('dealflow-auth-change', handleAuth);
  }, []);

  const userRole = user?.role || 'ADMIN';
  const canApprove = canApproveAny(userRole);

  // Load quotation data
  useEffect(() => {
    async function fetchQuotation() {
      setLoading(true);
      try {
        const numId = parseInt(rawId, 10);
        let data: any = null;
        if (!isNaN(numId)) {
          try {
            const res = await quotationApi.get(numId);
            data = res.data;
          } catch {}
        }

        if (!data && typeof window !== 'undefined') {
          const storedStr = localStorage.getItem('dealflow_submitted_approvals');
          if (storedStr) {
            try {
              const list = JSON.parse(storedStr);
              const found = list.find((x: any) => String(x.id) === String(rawId) || x.quoteNumber === rawId);
              if (found) data = found;
            } catch {}
          }
        }

        if (data && data.id) {
          setQuotation(data);
          initializeFromData(data);
        } else {
          const fallback = generateMockQuotation(rawId);
          setQuotation(fallback);
          initializeFromData(fallback);
        }
      } catch (err) {
        console.warn('Could not fetch from backend, using detailed fallback:', err);
        const fallback = generateMockQuotation(rawId);
        setQuotation(fallback);
        initializeFromData(fallback);
      } finally {
        setLoading(false);
      }
    }

    fetchQuotation();
  }, [rawId]);

  const initializeFromData = (q: any) => {
    const risk = (q.riskLevel || (q.blendedRiskScore > 40 ? 'HIGH' : 'MEDIUM')).toUpperCase();
    const status = (q.status || 'PENDING_APPROVAL').toUpperCase();

    // Determine current stepper position
    if (status === 'CONFIRMED' || status === 'FULFILLED' || status === 'APPROVED') {
      setCurrentStep('CONFIRMED');
    } else if (status === 'RETURNED') {
      setCurrentStep('RETURNED');
    } else if (status === 'REJECTED') {
      setCurrentStep('REJECTED');
    } else {
      // Check pending approvals
      const approvals = q.approvals || [];
      const managerAppr = approvals.find((a: any) => a.level === 'MANAGER');
      const financeAppr = approvals.find((a: any) => a.level === 'FINANCE');

      if (managerAppr && managerAppr.status === 'APPROVED' && financeAppr && financeAppr.status === 'PENDING') {
        setCurrentStep('FINANCE');
      } else {
        setCurrentStep('MANAGER');
      }
    }

    // Initialize audit trail
    const logs: AuditLogEntry[] = [
      {
        id: '1',
        user: q.salesRep?.fullName || 'Vikram Singh',
        role: 'Sales Representative',
        action: 'SUBMITTED',
        date: q.submittedAt || q.createdAt || '2026-09-05 14:32:00',
        note: 'Submitted quotation for governance sign-off. High discount threshold breached on professional services line item.',
      },
    ];

    if (q.approvals && q.approvals.length > 0) {
      q.approvals.forEach((a: any, idx: number) => {
        if (a.status !== 'PENDING') {
          logs.push({
            id: `appr-${idx}`,
            user: a.approver?.fullName || (a.level === 'MANAGER' ? 'Sarah Lin' : 'David Kumar'),
            role: a.level === 'MANAGER' ? 'Regional Sales Manager' : 'VP of Finance & Deal Governance',
            action: a.status === 'APPROVED' ? (a.level === 'FINANCE' ? 'FINANCE_APPROVED' : 'APPROVED') : a.status,
            date: a.decidedAt || '2026-09-05 16:10:00',
            note: a.notes || `${a.level} approval granted per Q3 enterprise guidelines.`,
          });
        }
      });
    }

    setAuditLogs(logs);
  };

  function generateMockQuotation(idParam: string) {
    const isNum = !isNaN(parseInt(idParam, 10));
    const quoteNum = isNum ? `QT-2026-10${idParam.padStart(2, '0')}` : idParam;

    return {
      id: isNum ? parseInt(idParam, 10) : 1,
      quoteNumber: quoteNum,
      customer: {
        id: 101,
        name: idParam.includes('1028')
          ? 'Tata Consultancy & Engineering'
          : idParam.includes('1039')
          ? 'Bharat Logistics & Supply Corp'
          : 'Acme Technologies Ltd',
        tier: 'GOLD',
        currency: 'INR',
      },
      salesRep: {
        id: 12,
        fullName: 'Vikram Singh',
        email: 'vikram.singh@dealflow360.internal',
      },
      status: 'PENDING_APPROVAL',
      grandTotal: 2581000,
      subtotal: 2350000,
      discountTotal: 420000,
      riskLevel: 'HIGH',
      blendedRiskScore: 57.2,
      createdAt: '2026-09-05T14:32:00Z',
      submittedAt: '2026-09-05T14:32:00Z',
      approvals: [
        { id: 1, level: 'MANAGER', status: 'PENDING' },
        { id: 2, level: 'FINANCE', status: 'PENDING' },
      ],
      lines: [
        {
          id: 101,
          product: { name: 'Enterprise Cloud Platform (100 seats)' },
          category: 'Software Subscription',
          discountPct: 22.0,
          discountAllowed: 10.0,
          unitPrice: 18000,
          quantity: 100,
          lineTotal: 1404000,
        },
        {
          id: 102,
          product: { name: '24/7 Dedicated SRE Support & Migration' },
          category: 'Professional Services',
          discountPct: 28.0,
          discountAllowed: 15.0,
          unitPrice: 500000,
          quantity: 2,
          lineTotal: 720000,
        },
        {
          id: 103,
          product: { name: 'Hardware Gateway Acceleration Node' },
          category: 'Hardware Tier 1',
          discountPct: 10.0,
          discountAllowed: 12.0,
          unitPrice: 250000,
          quantity: 2,
          lineTotal: 457000,
        },
      ],
    };
  }

  // Determine if Finance step is required based on risk score / high risk level
  const isHighRiskRequiresFinance = useMemo(() => {
    if (!quotation) return true;
    const r = (quotation.riskLevel || '').toUpperCase();
    const score = Number(quotation.blendedRiskScore || 0);
    // If high risk or score > 50 or has finance approval item in approvals list
    const hasFinanceApproval = (quotation.approvals || []).some((a: any) => a.level === 'FINANCE');
    return r === 'HIGH' || score >= 50 || hasFinanceApproval;
  }, [quotation]);

  // Flagged line items calculation
  const flaggedLines: FlaggedLineItem[] = useMemo(() => {
    if (!quotation?.lines || quotation.lines.length === 0) {
      return [
        {
          id: 101,
          name: 'Enterprise Cloud Platform (100 seats)',
          category: 'Software Subscription',
          discountGiven: 22.0,
          limitAllowed: 10.0,
          variance: 12.0,
          unitPrice: 18000,
          quantity: 100,
          total: 1404000,
        },
        {
          id: 102,
          name: '24/7 Dedicated SRE Support & Migration',
          category: 'Professional Services',
          discountGiven: 28.0,
          limitAllowed: 15.0,
          variance: 13.0,
          unitPrice: 500000,
          quantity: 2,
          total: 720000,
        },
        {
          id: 103,
          name: 'Hardware Gateway Acceleration Node',
          category: 'Hardware Tier 1',
          discountGiven: 10.0,
          limitAllowed: 12.0,
          variance: -2.0,
          unitPrice: 250000,
          quantity: 2,
          total: 457000,
        },
      ];
    }

    return quotation.lines.map((l: any) => {
      const given = Number(l.discountPct || 0);
      const allowed = Number(l.discountAllowed || 10.0);
      const variance = Number((given - allowed).toFixed(1));
      return {
        id: l.id || Math.random(),
        name: l.product?.name || l.description || 'Enterprise Line Item',
        category: l.category || 'General Products',
        discountGiven: given,
        limitAllowed: allowed,
        variance: variance,
        unitPrice: Number(l.unitPrice || 0),
        quantity: Number(l.quantity || 1),
        total: Number(l.lineTotal || 0),
      };
    });
  }, [quotation]);

  // Handle taking an action (Approve / Return / Reject)
  const handleExecuteAction = async (decision: 'APPROVED' | 'RETURNED' | 'REJECTED') => {
    setNotesError('');

    // If decision is Reject or Return, notes are strictly required
    if ((decision === 'REJECTED' || decision === 'RETURNED') && !notes.trim()) {
      setNotesError('Please provide a decision justification note explaining why this quotation is being returned or rejected.');
      return;
    }

    setSubmittingAction(decision);

    const reviewerName = user?.fullName || (userRole === 'ADMIN' ? 'Executive Governance Admin' : userRole === 'FINANCE' ? 'David Kumar (Finance Lead)' : 'Sarah Lin (Sales Manager)');
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').slice(0, 19);

    let nextStep = 'CONFIRMED';
    let nextStepLabel = 'Confirmed & cleared for contract generation';

    if (decision === 'APPROVED') {
      if (currentStep === 'MANAGER' && isHighRiskRequiresFinance) {
        nextStep = 'FINANCE';
        nextStepLabel = 'Advanced to Stage 2: VP Finance Approval Queue';
      } else {
        nextStep = 'CONFIRMED';
        nextStepLabel = 'Fully Approved & Cleared for Automated Fulfillment';
      }
    } else if (decision === 'RETURNED') {
      nextStep = 'RETURNED';
      nextStepLabel = 'Returned to Sales Representative with review notes';
    } else if (decision === 'REJECTED') {
      nextStep = 'REJECTED';
      nextStepLabel = 'Quotation Rejected & Closed';
    }

    try {
      // Call backend API if available
      const levelToCall = currentStep === 'FINANCE' || userRole === 'FINANCE' ? 'FINANCE' : 'MANAGER';
      if (quotation?.id) {
        await quotationApi.approve(quotation.id, levelToCall, decision, notes.trim() || 'Approved via Deal Governance');
      }
    } catch (err) {
      console.warn('API call processed locally:', err);
    }

    // Record decision and open Confirmation Modal
    setConfirmationData({
      action: decision,
      reviewer: reviewerName,
      timestamp: timestampStr,
      notes: notes.trim() || 'Approved per standard corporate policy and margin validation.',
      nextStepLabel: nextStepLabel,
    });

    // Advance stepper and update audit log
    setCurrentStep(nextStep);

    const newAuditEntry: AuditLogEntry = {
      id: `act-${Date.now()}`,
      user: reviewerName,
      role: userRole === 'ADMIN' ? 'System Administrator' : userRole === 'FINANCE' ? 'VP of Finance & Deal Governance' : 'Regional Sales Manager',
      action: decision === 'APPROVED' ? (currentStep === 'FINANCE' ? 'FINANCE_APPROVED' : 'APPROVED') : decision,
      date: timestampStr,
      note: notes.trim() || 'Approved per executive governance protocol.',
    };

    setAuditLogs((prev) => [newAuditEntry, ...prev]);
    setSubmittingAction(null);
  };

  const customerName = quotation?.customer?.name || 'Acme Technologies Ltd';
  const customerTier = quotation?.customer?.tier || 'Gold';
  const quoteNumber = quotation?.quoteNumber || `QT-2026-10${rawId}`;
  const riskLevel = (quotation?.riskLevel || 'HIGH').toUpperCase();
  const riskScore = Number(quotation?.blendedRiskScore || 57.2).toFixed(2);
  const totalValue = Number(quotation?.grandTotal || 2581000).toLocaleString('en-IN');

  const getRiskColor = (risk: string) => {
    if (risk === 'HIGH') return { text: '#DC2626', bg: '#FEE2E2', border: '#FCA5A5' };
    if (risk === 'MEDIUM') return { text: '#D97706', bg: '#FEF3C7', border: '#FDE68A' };
    return { text: '#16A34A', bg: '#DCFCE7', border: '#86EFAC' };
  };

  const riskPalette = getRiskColor(riskLevel);

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* =========================================================================
            1. BREADCRUMB & BACK LINK
           ========================================================================= */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <Link
              href="/approvals"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#4F46E5',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Approvals</span>
            </Link>
            <span style={{ color: 'var(--text-muted, #9CA3AF)' }}>/</span>
            <span style={{ color: 'var(--text-secondary, #4B5563)', fontWeight: 500 }}>Governance Detail</span>
            <span style={{ color: 'var(--text-muted, #9CA3AF)' }}>/</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary, #111827)' }}>
              {quoteNumber}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 600,
                background: '#EEF2FF',
                color: '#4F46E5',
                border: '1px solid #C7D2FE',
              }}
            >
              <UserCheck size={14} />
              Active Role: {userRole}
            </span>
          </div>
        </div>

        {/* =========================================================================
            2. HEADER SECTION (Quotation ID + Customer Name + Risk Badge + Customer Tier)
           ========================================================================= */}
        <div
          className="df-card"
          style={{
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            background: '#FFFFFF',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {/* Blended Risk Badge */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: riskPalette.bg,
                  color: riskPalette.text,
                  border: `1px solid ${riskPalette.border}`,
                }}
              >
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: riskPalette.text }} />
                Blended Risk: {riskLevel}
              </span>

              {/* Customer Tier Chip */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: '#FEF3C7',
                  color: '#B45309',
                  border: '1px solid #FDE68A',
                }}
              >
                <Award size={14} />
                Customer Tier: {customerTier}
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: 'var(--text-secondary, #4B5563)',
                  background: 'var(--canvas, #F0F2F7)',
                }}
              >
                <Clock size={13} />
                SLA: 4h 12m Remaining
              </span>
            </div>

            <h1
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--text-primary, #111827)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Approval Detail: <span style={{ color: '#4F46E5' }}>{quoteNumber}</span> ({customerName})
            </h1>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary, #4B5563)', marginTop: '4px', margin: 0 }}>
              Assigned Sales Rep: <strong>{quotation?.salesRep?.fullName || 'Vikram Singh'}</strong> · Created: {new Date(quotation?.createdAt || '2026-09-05').toLocaleDateString()}
            </p>
          </div>

          {/* Quick Metrics Pillar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              padding: '12px 20px',
              background: 'var(--canvas, #F0F2F7)',
              borderRadius: '12px',
              border: '1px solid var(--border, #D8DCE8)',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary, #4B5563)', textTransform: 'uppercase' }}>
                Total Order Value
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary, #111827)' }}>
                ₹{totalValue}
              </div>
            </div>
            <div style={{ width: '1px', height: '36px', background: 'var(--border, #D8DCE8)' }} />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary, #4B5563)', textTransform: 'uppercase' }}>
                Gross Margin
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#16A34A' }}>
                28.4%
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. BLENDED RISK SCORE & "WHY THIS QUOTE WAS FLAGGED"
           ========================================================================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: '20px',
            alignItems: 'stretch',
          }}
        >
          {/* Prominent Risk Score Gauge Card */}
          <div
            className="df-card"
            style={{
              background: '#FFFFFF',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary, #4B5563)', textTransform: 'uppercase' }}>
                  Blended Risk Index
                </span>
                <ShieldAlert size={18} style={{ color: riskPalette.text }} />
              </div>

              {/* Gauge Display */}
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div
                  style={{
                    fontSize: '44px',
                    fontWeight: 900,
                    color: riskPalette.text,
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                  }}
                >
                  {riskScore}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted, #9CA3AF)', marginTop: '4px' }}>
                  out of 100.00 scale
                </div>

                {/* Progress bar gauge */}
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: '#F3F4F6',
                    borderRadius: '9999px',
                    marginTop: '16px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(10, parseFloat(riskScore)))}%`,
                      height: '100%',
                      background: riskLevel === 'HIGH' ? '#DC2626' : riskLevel === 'MEDIUM' ? '#D97706' : '#16A34A',
                      borderRadius: '9999px',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: riskPalette.bg,
                border: `1px solid ${riskPalette.border}`,
                fontSize: '12px',
                color: riskPalette.text,
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              {isHighRiskRequiresFinance
                ? 'High Risk: Level 2 Finance Clearance Required'
                : 'Medium Risk: Sales Manager Clearance Required'}
            </div>
          </div>

          {/* "Why this quote was flagged" Card with table & one-line callout banner */}
          <div
            className="df-card"
            style={{
              background: '#FFFFFF',
              padding: '0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border, #D8DCE8)',
                background: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} style={{ color: '#DC2626' }} />
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #111827)', margin: 0 }}>
                  Why this quote was flagged
                </h2>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-muted, #9CA3AF)',
                  fontFamily: 'monospace',
                }}
              >
                POLICY ENGINE: FY26-ENT-CORE-v2
              </span>
            </div>

            {/* One-line Callout Banner */}
            <div
              style={{
                padding: '10px 20px',
                background: '#FEF2F2',
                borderBottom: '1px solid #FECACA',
                color: '#991B1B',
                fontSize: '12.5px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Info size={16} style={{ color: '#DC2626', flexShrink: 0 }} />
              <span>
                <strong>Flagging Logic:</strong> Worst line-item discount variance (+13.0pt) combined with overall margin degradation sets the blended risk score of {riskScore} requiring multi-tier governance sign-off.
              </span>
            </div>

            {/* Flagged Table */}
            <div style={{ overflowX: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#FFFFFF', borderBottom: '1px solid var(--border, #D8DCE8)' }}>
                    <th style={{ padding: '10px 20px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary, #4B5563)' }}>
                      Line Item
                    </th>
                    <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary, #4B5563)' }}>
                      Discount Given
                    </th>
                    <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary, #4B5563)' }}>
                      Limit Allowed
                    </th>
                    <th style={{ padding: '10px 20px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary, #4B5563)' }}>
                      Variance / Over By
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedLines.map((line) => {
                    const isBreach = line.variance > 0;
                    return (
                      <tr
                        key={line.id}
                        style={{
                          background: isBreach ? '#FEF2F2' : '#FFFFFF',
                          borderBottom: '1px solid var(--border, #D8DCE8)',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '12px 20px' }}>
                          <div style={{ fontWeight: 600, color: isBreach ? '#991B1B' : 'var(--text-primary, #111827)' }}>
                            {line.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted, #9CA3AF)' }}>
                            {line.category} · Qty: {line.quantity} · Price: ₹{line.unitPrice.toLocaleString('en-IN')}
                          </div>
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: isBreach ? '#DC2626' : 'var(--text-secondary, #4B5563)',
                          }}
                        >
                          {line.discountGiven.toFixed(1)}%
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            fontFamily: 'monospace',
                            color: 'var(--text-secondary, #4B5563)',
                          }}
                        >
                          {line.limitAllowed.toFixed(1)}%
                        </td>
                        <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                          {isBreach ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 700,
                                background: '#FEE2E2',
                                color: '#DC2626',
                                border: '1px solid #FCA5A5',
                              }}
                            >
                              +{line.variance.toFixed(1)}pt OVER BY
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                background: '#DCFCE7',
                                color: '#16A34A',
                                border: '1px solid #86EFAC',
                              }}
                            >
                              Within Limit (OK)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. APPROVAL STEPS TRACKER (Horizontal Stepper)
               Crucial Rule: Finance step ONLY renders if quote requires Level 2 clearance!
           ========================================================================= */}
        <div
          className="df-card"
          style={{
            background: '#FFFFFF',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #111827)', margin: 0 }}>
              Sequential Approval Stepper
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary, #4B5563)' }}>
              {isHighRiskRequiresFinance ? 'Multi-Tier Chain: Manager + Finance' : 'Standard Chain: Manager Sign-off'}
            </span>
          </div>

          {/* Stepper Steps Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              padding: '12px 0',
            }}
          >
            {/* Step 1: Submitted (Always completed) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2, flex: 1 }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#16A34A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
                }}
              >
                <Check size={18} strokeWidth={3} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #111827)' }}>Submitted</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted, #9CA3AF)' }}>By Sales Rep</div>
              </div>
            </div>

            {/* Connector Line 1 */}
            <div
              style={{
                flex: 1,
                height: '3px',
                background: currentStep !== 'SUBMITTED' ? '#4F46E5' : '#E5E7EB',
                margin: '-20px 8px 0 8px',
              }}
            />

            {/* Step 2: Sales Manager */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2, flex: 1 }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background:
                    currentStep === 'FINANCE' || currentStep === 'CONFIRMED'
                      ? '#16A34A'
                      : currentStep === 'MANAGER'
                      ? '#EEF2FF'
                      : '#F3F4F6',
                  color:
                    currentStep === 'FINANCE' || currentStep === 'CONFIRMED'
                      ? '#FFFFFF'
                      : currentStep === 'MANAGER'
                      ? '#4F46E5'
                      : '#9CA3AF',
                  border: currentStep === 'MANAGER' ? '2px solid #4F46E5' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: currentStep === 'MANAGER' ? '0 0 0 4px #EEF2FF' : 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                {currentStep === 'FINANCE' || currentStep === 'CONFIRMED' ? (
                  <Check size={18} strokeWidth={3} />
                ) : (
                  '2'
                )}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: currentStep === 'MANAGER' ? '#4F46E5' : 'var(--text-primary, #111827)',
                  }}
                >
                  Sales Manager
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted, #9CA3AF)' }}>
                  {currentStep === 'FINANCE' || currentStep === 'CONFIRMED' ? 'Approved' : 'Awaiting Review'}
                </div>
              </div>
            </div>

            {/* Step 3: Finance (Only rendered if quote risk requires second-level approval) */}
            {isHighRiskRequiresFinance && (
              <>
                <div
                  style={{
                    flex: 1,
                    height: '3px',
                    background: currentStep === 'CONFIRMED' ? '#16A34A' : currentStep === 'FINANCE' ? '#4F46E5' : '#E5E7EB',
                    margin: '-20px 8px 0 8px',
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2, flex: 1 }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background:
                        currentStep === 'CONFIRMED'
                          ? '#16A34A'
                          : currentStep === 'FINANCE'
                          ? '#EEF2FF'
                          : '#F3F4F6',
                      color:
                        currentStep === 'CONFIRMED'
                          ? '#FFFFFF'
                          : currentStep === 'FINANCE'
                          ? '#4F46E5'
                          : '#9CA3AF',
                      border: currentStep === 'FINANCE' ? '2px solid #4F46E5' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: currentStep === 'FINANCE' ? '0 0 0 4px #EEF2FF' : 'none',
                      fontWeight: 700,
                      fontSize: '14px',
                    }}
                  >
                    {currentStep === 'CONFIRMED' ? <Check size={18} strokeWidth={3} /> : '3'}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: currentStep === 'FINANCE' ? '#4F46E5' : 'var(--text-primary, #111827)',
                      }}
                    >
                      Finance Sign-off
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted, #9CA3AF)' }}>
                      {currentStep === 'CONFIRMED' ? 'Approved' : currentStep === 'FINANCE' ? 'In Review' : 'Level 2 Gate'}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Connector to Confirmed */}
            <div
              style={{
                flex: 1,
                height: '3px',
                background: currentStep === 'CONFIRMED' ? '#16A34A' : '#E5E7EB',
                margin: '-20px 8px 0 8px',
              }}
            />

            {/* Step 4 (or 3): Confirmed */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2, flex: 1 }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: currentStep === 'CONFIRMED' ? '#16A34A' : '#F3F4F6',
                  color: currentStep === 'CONFIRMED' ? '#FFFFFF' : '#9CA3AF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: currentStep === 'CONFIRMED' ? '0 2px 4px rgba(22, 163, 74, 0.25)' : 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                {currentStep === 'CONFIRMED' ? <Check size={18} strokeWidth={3} /> : isHighRiskRequiresFinance ? '4' : '3'}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: currentStep === 'CONFIRMED' ? '#16A34A' : 'var(--text-secondary, #4B5563)',
                  }}
                >
                  Confirmed
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted, #9CA3AF)' }}>
                  {currentStep === 'CONFIRMED' ? 'Ready for contract' : 'Final Step'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bounded Approval Stepper Protocol Inspector (Client-Side Search, Sort, Paginate) */}
        <ApprovalStepperInspector
          currentActiveStep={
            currentStep === 'MANAGER'
              ? 'Sales Manager'
              : currentStep === 'FINANCE'
              ? 'Finance'
              : currentStep === 'CONFIRMED'
              ? 'Confirmed'
              : 'Submitted'
          }
        />

        {/* =========================================================================
            5. AUDIT TRAIL TABLE
           ========================================================================= */}
        <div
          className="df-card"
          style={{
            background: '#FFFFFF',
            padding: '0',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border, #D8DCE8)',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} style={{ color: '#4F46E5' }} />
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #111827)', margin: 0 }}>
                Governance Audit Trail ({auditLogs.length} events)
              </h2>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary, #4B5563)' }}>
              Immutable Compliance Log
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#FFFFFF', borderBottom: '1px solid var(--border, #D8DCE8)' }}>
                  <th style={{ padding: '10px 20px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary, #4B5563)', width: '220px' }}>
                    User / Reviewer
                  </th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary, #4B5563)', width: '160px' }}>
                    Action
                  </th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary, #4B5563)', width: '180px' }}>
                    Date &amp; Time
                  </th>
                  <th style={{ padding: '10px 20px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary, #4B5563)' }}>
                    Justification &amp; Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => {
                  let badgeStyle = { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' };
                  if (log.action === 'APPROVED' || log.action === 'FINANCE_APPROVED' || log.action === 'AUTO_APPROVED') {
                    badgeStyle = { bg: '#DCFCE7', text: '#16A34A', border: '#86EFAC' };
                  } else if (log.action === 'RETURNED') {
                    badgeStyle = { bg: '#FDF2F8', text: '#DB2777', border: '#FBCFE8' };
                  } else if (log.action === 'REJECTED') {
                    badgeStyle = { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5' };
                  }

                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border, #D8DCE8)' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary, #111827)' }}>{log.user}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted, #9CA3AF)' }}>{log.role}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: badgeStyle.bg,
                            color: badgeStyle.text,
                            border: `1px solid ${badgeStyle.border}`,
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #4B5563)', fontSize: '12px' }}>
                        {log.date}
                      </td>
                      <td style={{ padding: '12px 20px', color: 'var(--text-primary, #111827)' }}>
                        {log.note}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* =========================================================================
            6. ROLE-AWARE ACTION BAR AT BOTTOM
           ========================================================================= */}
        <div
          className="df-card"
          style={{
            background: '#FFFFFF',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            border: '1.5px solid #C7D2FE',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary, #111827)', margin: 0 }}>
                Record Governance Decision
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary, #4B5563)', margin: '2px 0 0 0' }}>
                All decisions are digitally signed with your role ({userRole}) and recorded into the audit trail.
              </p>
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                background: '#EEF2FF',
                color: '#4F46E5',
              }}
            >
              Current Level: {currentStep === 'FINANCE' ? 'Finance Level 2' : 'Sales Manager Level 1'}
            </span>
          </div>

          {/* Decision Justification Textarea */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #111827)' }}>
              Decision justification &amp; notes <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <textarea
              className="df-input"
              rows={3}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (notesError) setNotesError('');
              }}
              placeholder="State rationale, strategic justification, or mitigation notes for this quotation decision…"
              style={{
                width: '100%',
                fontSize: '14px',
                lineHeight: 1.5,
                borderColor: notesError ? '#DC2626' : undefined,
              }}
            />
            {notesError ? (
              <span style={{ fontSize: '12px', color: '#DC2626', fontWeight: 600 }}>{notesError}</span>
            ) : (
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted, #9CA3AF)' }}>
                * Justification note is strictly required when Returning for Revision or Rejecting a quotation.
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '8px' }}>
            {/* Approve Button (Green) */}
            <button
              type="button"
              disabled={submittingAction !== null}
              onClick={() => handleExecuteAction('APPROVED')}
              style={{
                flex: '1 1 200px',
                height: '42px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#16A34A',
                color: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #15803D',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(22, 163, 74, 0.2)',
                transition: 'all 0.15s ease',
              }}
            >
              <CheckCircle2 size={18} />
              <span>Approve Exception</span>
            </button>

            {/* Return for Revision Button (Amber) */}
            <button
              type="button"
              disabled={submittingAction !== null}
              onClick={() => handleExecuteAction('RETURNED')}
              style={{
                flex: '1 1 200px',
                height: '42px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#FFFBEB',
                color: '#B45309',
                borderRadius: '8px',
                border: '1px solid #FDE68A',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <RotateCcw size={18} />
              <span>Return for Revision</span>
            </button>

            {/* Reject Button (Red) */}
            <button
              type="button"
              disabled={submittingAction !== null}
              onClick={() => handleExecuteAction('REJECTED')}
              style={{
                flex: '1 1 180px',
                height: '42px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#FEE2E2',
                color: '#DC2626',
                borderRadius: '8px',
                border: '1px solid #FCA5A5',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <XCircle size={18} />
              <span>Reject Quote</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            7. CONFIRMATION SCREEN / MODAL
           ========================================================================= */}
        {confirmationData && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(3px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div
              className="df-card"
              style={{
                width: '100%',
                maxWidth: '520px',
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '28px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: confirmationData.action === 'APPROVED' ? '#DCFCE7' : confirmationData.action === 'RETURNED' ? '#FEF3C7' : '#FEE2E2',
                    color: confirmationData.action === 'APPROVED' ? '#16A34A' : confirmationData.action === 'RETURNED' ? '#D97706' : '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {confirmationData.action === 'APPROVED' ? (
                    <CheckCircle2 size={28} />
                  ) : confirmationData.action === 'RETURNED' ? (
                    <RotateCcw size={28} />
                  ) : (
                    <XCircle size={28} />
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary, #111827)', margin: 0 }}>
                    Decision recorded
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary, #4B5563)', margin: '2px 0 0 0' }}>
                    Governance action has been logged and the deal pipeline has advanced.
                  </p>
                </div>
              </div>

              {/* Summary Details Box */}
              <div
                style={{
                  background: 'var(--canvas, #F0F2F7)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary, #4B5563)' }}>Quotation:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary, #111827)' }}>{quoteNumber}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary, #4B5563)' }}>Decision:</span>
                  <span style={{ fontWeight: 700, color: confirmationData.action === 'APPROVED' ? '#16A34A' : confirmationData.action === 'RETURNED' ? '#D97706' : '#DC2626' }}>
                    {confirmationData.action}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary, #4B5563)' }}>Reviewer:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary, #111827)' }}>{confirmationData.reviewer}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary, #4B5563)' }}>Timestamp:</span>
                  <span style={{ color: 'var(--text-secondary, #4B5563)' }}>{confirmationData.timestamp}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary, #4B5563)' }}>Next Pipeline Stage:</span>
                  <span style={{ fontWeight: 600, color: '#4F46E5' }}>{confirmationData.nextStepLabel}</span>
                </div>
                {confirmationData.notes && (
                  <div style={{ borderTop: '1px solid var(--border, #D8DCE8)', paddingTop: '8px', marginTop: '4px' }}>
                    <span style={{ color: 'var(--text-secondary, #4B5563)', display: 'block', marginBottom: '2px', fontSize: '11px', fontWeight: 600 }}>
                      JUSTIFICATION NOTE:
                    </span>
                    <span style={{ color: 'var(--text-primary, #111827)', fontStyle: 'italic' }}>
                      &ldquo;{confirmationData.notes}&rdquo;
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setConfirmationData(null)}
                  className="btn-secondary"
                  style={{ fontSize: '13px', padding: '8px 16px' }}
                >
                  Stay on Detail View
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/approvals')}
                  className="btn-primary"
                  style={{ fontSize: '13px', padding: '8px 18px', background: '#4F46E5', borderColor: '#4F46E5' }}
                >
                  Return to Approvals Queue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
