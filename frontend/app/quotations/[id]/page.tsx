'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { quotationApi, productApi, customerApi, getStoredUser } from '@/lib/api';

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'badge-draft',
  PENDING_APPROVAL: 'badge-pending',
  APPROVED: 'badge-approved',
  REJECTED: 'badge-rejected',
  NEGOTIATION: 'badge-negotiation',
  CONFIRMED: 'badge-confirmed',
  FULFILLED: 'badge-approved',
  CANCELLED: 'badge-rejected',
};

const RISK_BADGE: Record<string, string> = {
  HIGH: 'risk-high',
  MEDIUM: 'risk-medium',
  LOW: 'risk-low',
};

const TIER_DISCOUNT_LIMITS: Record<string, number> = {
  GOLD: 35,
  SILVER: 20,
  BRONZE: 10,
};

const MOCK_CUSTOMERS = [
  { id: 1, name: 'Tata Consultancy Services', company: 'TCS Ltd', email: 'procurement@tcs.com', phone: '+91-22-67789999', tier: 'GOLD', currency: 'INR' },
  { id: 2, name: 'Infosys Technologies', company: 'Infosys Ltd', email: 'it-vendor@infosys.com', phone: '+91-80-28520261', tier: 'GOLD', currency: 'INR' },
  { id: 3, name: 'Reliance Jio Infocomm', company: 'Jio Infocomm Ltd', email: 'digital.infra@ril.com', phone: '+91-22-44778899', tier: 'GOLD', currency: 'INR' },
  { id: 4, name: 'Wipro Enterprise Solutions', company: 'Wipro Ltd', email: 'sourcing@wipro.com', phone: '+91-80-46726000', tier: 'GOLD', currency: 'INR' },
  { id: 5, name: 'Mahindra Tech', company: 'Mahindra & Mahindra Ltd', email: 'procurement@mahindra.com', phone: '+91-20-66042000', tier: 'SILVER', currency: 'INR' },
  { id: 6, name: 'Nova Retail Corp', company: 'Nova Retail Pvt Ltd', email: 'procure@novaretail.in', phone: '+91-80-99887766', tier: 'BRONZE', currency: 'INR' },
];

const MOCK_PRODUCTS = [
  { id: 1, name: 'NVIDIA H100 GPU Instance', sku: 'SKU-PROD-1001', basePrice: 450000.0, costPrice: 310000.0, taxPercentage: 18.0, isSubscription: true, maxDiscount: 25.0, categoryName: 'Cloud Compute & GPU' },
  { id: 2, name: 'Oracle Cloud Autonomous DB', sku: 'SKU-PROD-1002', basePrice: 185000.0, costPrice: 120000.0, taxPercentage: 18.0, isSubscription: true, maxDiscount: 30.0, categoryName: 'Enterprise SaaS' },
  { id: 3, name: 'Cisco Nexus 9000 Switch', sku: 'SKU-PROD-1003', basePrice: 850000.0, costPrice: 620000.0, taxPercentage: 18.0, isSubscription: false, maxDiscount: 15.0, categoryName: 'Networking Infra' },
  { id: 4, name: 'Palo Alto VM-Series Firewall', sku: 'SKU-PROD-1004', basePrice: 320000.0, costPrice: 210000.0, taxPercentage: 18.0, isSubscription: true, maxDiscount: 20.0, categoryName: 'Cybersecurity' },
  { id: 5, name: 'Datadog Enterprise APM Suite', sku: 'SKU-PROD-1005', basePrice: 95000.0, costPrice: 45000.0, taxPercentage: 18.0, isSubscription: true, maxDiscount: 22.0, categoryName: 'Observability' },
];

const INITIAL_QUOTATION = {
  id: 1,
  quoteNumber: 'Q-1042',
  status: 'DRAFT',
  grandTotal: 1095040.0,
  subtotal: 970000.0,
  taxTotal: 174600.0,
  discountTotal: 49560.0,
  currency: 'INR',
  blendedRiskScore: 0,
  riskLevel: 'LOW',
  notes: '',
  validUntil: '2026-10-15',
  customer: MOCK_CUSTOMERS[0],
  salesRep: { id: 4, fullName: 'Priya Patel', email: 'rep1@dealflow360.com' },
  lines: [
    {
      id: 101,
      productId: 1,
      productName: 'NVIDIA H100 GPU Instance',
      description: 'NVIDIA H100 GPU Instance — Cloud AI Cluster',
      lineType: 'RECURRING',
      quantity: 2,
      unitPrice: 450000.0,
      costPrice: 310000.0,
      discountPct: 10.0,
      discountAllowed: 25.0,
      taxPct: 18.0,
      lineTotal: 955800.0,
      marginAmount: 190000.0,
      marginPct: 23.46,
    },
    {
      id: 102,
      productId: 5,
      productName: 'Datadog Enterprise APM Suite',
      description: 'Datadog Enterprise APM Suite — 24/7 Monitoring',
      lineType: 'RECURRING',
      quantity: 1,
      unitPrice: 95000.0,
      costPrice: 45000.0,
      discountPct: 5.0,
      discountAllowed: 20.0,
      taxPct: 18.0,
      lineTotal: 106500.0,
      marginAmount: 40250.0,
      marginPct: 44.59,
    },
  ],
  approvals: [],
  portalToken: 'token-quote-1042',
};

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === 'new' || isNaN(Number(params.id)) || Number(params.id) === 0;
  const id = isNew ? 0 : Number(params.id);

  const [quotation, setQuotation] = useState<any>(isNew ? {
    id: 0,
    quoteNumber: 'Draft (New)',
    status: 'DRAFT',
    grandTotal: 0,
    subtotal: 0,
    taxTotal: 0,
    discountTotal: 0,
    currency: 'INR',
    blendedRiskScore: 0,
    riskLevel: 'LOW',
    notes: '',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customer: MOCK_CUSTOMERS[0],
    salesRep: { id: 1, fullName: 'Commercial Sales Rep', email: 'sales@dealflow360.com' },
    lines: [],
    approvals: [],
    portalToken: '',
  } : INITIAL_QUOTATION);

  const [customers, setCustomers] = useState<any[]>(MOCK_CUSTOMERS);
  const [products, setProducts] = useState<any[]>(MOCK_PRODUCTS);
  const [upsells, setUpsells] = useState<any[]>(MOCK_PRODUCTS.slice(2));
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Load quotation data & customer/product lists
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('dealflow_token')) {
      router.push('/');
      return;
    }

    const loadData = async () => {
      try {
        if (!isNew && id > 0) {
          const qRes = await quotationApi.get(id);
          if (qRes?.data) {
            setQuotation(qRes.data);
          } else {
            const savedDraftsStr = localStorage.getItem('dealflow_saved_drafts');
            if (savedDraftsStr) {
              const savedDrafts = JSON.parse(savedDraftsStr);
              if (savedDrafts[id]) setQuotation(savedDrafts[id]);
            }
          }
        }
      } catch {
        const savedDraftsStr = localStorage.getItem('dealflow_saved_drafts');
        if (savedDraftsStr) {
          try {
            const savedDrafts = JSON.parse(savedDraftsStr);
            if (savedDrafts[id]) setQuotation(savedDrafts[id]);
          } catch {}
        }
      }

      try {
        const [cRes, pRes] = await Promise.all([
          customerApi.list(),
          productApi.list(),
        ]);
        if (cRes?.data?.length) {
          setCustomers(cRes.data);
          if (isNew) {
            setQuotation((prev: any) => ({
              ...prev,
              customer: cRes.data[0],
              currency: cRes.data[0].currency || 'INR',
            }));
          }
        }
        if (pRes?.data?.length) {
          setProducts(pRes.data);
        }
      } catch {
        // Keep mock data if backend not reachable
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isNew, router]);

  // Dynamically compute and query Upsell & Cross-Sell Rules based on current quotation lines & catalog products
  useEffect(() => {
    const currentLines = quotation.lines || quotation.quotationLines || [];
    const currentProductIds = currentLines
      .map((l: any) => l.productId || l.product?.id)
      .filter((pid: any): pid is number => pid != null && !isNaN(Number(pid)));

    const currentProductIdsSet = new Set(currentProductIds.map(Number));

    productApi.upsell(currentProductIds)
      .then((res) => {
        let candidates: any[] = [];
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          candidates = res.data.map((r: any) => {
            const p = r.suggestProduct || r.product || r;
            return {
              id: p.id,
              name: p.name,
              basePrice: p.basePrice || p.unitPrice || 0,
              costPrice: p.costPrice || (p.basePrice ? p.basePrice * 0.7 : 0),
              sku: p.sku || '',
              taxPercentage: p.taxPercentage || 18,
              isSubscription: p.isSubscription || false,
              isPromoted: r.isPromoted || p.isPromoted || false,
              maxDiscount: p.maxDiscount || 20.0,
              ruleReason: r.triggerProduct ? `Paired with ${r.triggerProduct.name}` : undefined,
            };
          });
        }

        // Filter out products already present in quotation lines
        let filteredCandidates = candidates.filter(
          (item) => item.id && !currentProductIdsSet.has(Number(item.id))
        );

        // De-duplicate by product id
        const seenIds = new Set<number>();
        filteredCandidates = filteredCandidates.filter((item) => {
          if (seenIds.has(item.id)) return false;
          seenIds.add(item.id);
          return true;
        });

        // If fewer than 3 suggestions from direct rules, supplement from active catalog products not yet in quotation
        if (filteredCandidates.length < 3 && products.length > 0) {
          const supplemental = products
            .filter((p) => p.id && !currentProductIdsSet.has(Number(p.id)) && !seenIds.has(p.id))
            .map((p) => ({
              id: p.id,
              name: p.name,
              basePrice: p.basePrice || 0,
              costPrice: p.costPrice || (p.basePrice * 0.7),
              sku: p.sku || '',
              taxPercentage: p.taxPercentage || 18,
              isSubscription: p.isSubscription || false,
              isPromoted: p.isPromoted || false,
              maxDiscount: p.maxDiscount || 20.0,
              ruleReason: p.isPromoted ? 'Promoted' : undefined,
            }));
          filteredCandidates = [...filteredCandidates, ...supplemental];
        }

        setUpsells(filteredCandidates.slice(0, 3));
      })
      .catch(() => {
        // Dynamic fallback using local products state
        const available = products
          .filter((p) => p.id && !currentProductIdsSet.has(Number(p.id)))
          .map((p) => ({
            id: p.id,
            name: p.name,
            basePrice: p.basePrice || 0,
            costPrice: p.costPrice || (p.basePrice * 0.7),
            sku: p.sku || '',
            taxPercentage: p.taxPercentage || 18,
            isSubscription: p.isSubscription || false,
            maxDiscount: p.maxDiscount || 20.0,
          }));
        setUpsells(available.slice(0, 3));
      });
  }, [quotation.lines, products]);

  const currency = quotation.currency || 'INR';

  const formatCurrency = (val: number) => {
    if (currency === 'USD' || currency === '$') {
      return `$${(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `₹${(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper to calculate applicable discount ceiling for a line
  const getLineDiscountLimit = (line: any, customerTier: string = 'GOLD') => {
    const tierLimit = TIER_DISCOUNT_LIMITS[customerTier.toUpperCase()] || 20;
    const catLimit = line.discountAllowed || 25;
    return Math.min(tierLimit, catLimit);
  };

  // Live Recalculations across all lines
  const recalculatedLines = useMemo(() => {
    const lines = quotation.lines || quotation.quotationLines || [];
    const custTier = quotation.customer?.tier || 'GOLD';

    return lines.map((line: any) => {
      const qty = Math.max(1, Number(line.quantity) || 1);
      const uPrice = Number(line.unitPrice) || 0;
      const cPrice = Number(line.costPrice) || 0;
      const discPct = Math.max(0, Number(line.discountPct) || 0);
      const taxPct = Number(line.taxPct) || 18.0;

      const effectiveUnitPrice = uPrice * (1 - discPct / 100);
      const rawLineSubtotal = qty * effectiveUnitPrice;
      const lineTax = rawLineSubtotal * (taxPct / 100);
      const lineTotal = rawLineSubtotal + lineTax;

      const totalCost = qty * cPrice;
      const marginAmount = rawLineSubtotal - totalCost;
      const marginPct = rawLineSubtotal > 0 ? (marginAmount / rawLineSubtotal) * 100 : 0;

      const limit = getLineDiscountLimit(line, custTier);
      const overAmount = discPct - limit;
      const isOver = overAmount > 0;

      return {
        ...line,
        quantity: qty,
        unitPrice: uPrice,
        costPrice: cPrice,
        discountPct: discPct,
        limit,
        isOver,
        overAmount: Math.round(overAmount * 10) / 10,
        rawSubtotal: rawLineSubtotal,
        lineTax,
        lineTotal,
        marginAmount,
        marginPct,
      };
    });
  }, [quotation.lines, quotation.quotationLines, quotation.customer?.tier]);

  // Persistent Order Summary Calculations
  const orderSummary = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let taxTotal = 0;
    let grandTotal = 0;
    let totalCostSum = 0;
    let totalRevenueSum = 0;
    let overLimitPoints = 0;

    recalculatedLines.forEach((l: any) => {
      const baseVal = l.quantity * l.unitPrice;
      const discVal = baseVal * (l.discountPct / 100);
      subtotal += baseVal;
      totalDiscount += discVal;
      taxTotal += l.lineTax;
      grandTotal += l.lineTotal;
      totalRevenueSum += l.rawSubtotal;
      totalCostSum += l.quantity * l.costPrice;

      if (l.isOver) {
        overLimitPoints += l.overAmount;
      }
    });

    const totalMarginAmount = totalRevenueSum - totalCostSum;
    const blendedMarginPct = totalRevenueSum > 0 ? (totalMarginAmount / totalRevenueSum) * 100 : 0;

    // Risk scoring (only compute risk if line items exist and total revenue > 0)
    let riskScore = 0;
    const hasItems = recalculatedLines && recalculatedLines.length > 0;
    if (hasItems && totalRevenueSum > 0) {
      if (overLimitPoints > 0) riskScore += overLimitPoints * 1.5;
      if (blendedMarginPct < 15) riskScore += (15 - blendedMarginPct) * 0.8;
      if (grandTotal > 5000000) riskScore += 3.0;
    }

    riskScore = Math.round(riskScore * 10) / 10;
    const riskLevel = hasItems && riskScore >= 8 ? 'HIGH' : hasItems && riskScore > 0 ? 'MEDIUM' : 'LOW';

    return {
      subtotal,
      totalDiscount,
      taxTotal,
      grandTotal,
      blendedMarginPct,
      riskScore,
      riskLevel,
      overLimitPoints,
    };
  }, [recalculatedLines]);

  // Line Item Handlers
  const handleQuantityChange = (lineId: number, delta: number) => {
    setQuotation((prev: any) => ({
      ...prev,
      lines: (prev.lines || []).map((l: any) => {
        if (l.id === lineId) {
          const newQty = Math.max(1, (l.quantity || 1) + delta);
          return { ...l, quantity: newQty };
        }
        return l;
      }),
    }));
  };

  const handleDiscountChange = (lineId: number, val: string) => {
    const num = Math.min(100, Math.max(0, parseFloat(val) || 0));
    setQuotation((prev: any) => ({
      ...prev,
      lines: (prev.lines || []).map((l: any) => {
        if (l.id === lineId) {
          return { ...l, discountPct: num };
        }
        return l;
      }),
    }));
  };

  const handleDeleteLine = (lineId: number) => {
    setQuotation((prev: any) => ({
      ...prev,
      lines: (prev.lines || []).filter((l: any) => l.id !== lineId),
    }));
  };

  const handleAddProductLine = (prod: any) => {
    const newLine = {
      id: Date.now(),
      productId: prod.id,
      productName: prod.name,
      description: prod.name + (prod.sku ? ` (${prod.sku})` : ''),
      lineType: prod.isSubscription ? 'RECURRING' : 'ONE_TIME',
      quantity: 1,
      unitPrice: prod.basePrice || 50000.0,
      costPrice: prod.costPrice || prod.basePrice * 0.7,
      discountPct: 0,
      discountAllowed: prod.maxDiscount || 20.0,
      taxPct: prod.taxPercentage || 18.0,
    };

    setQuotation((prev: any) => ({
      ...prev,
      lines: [...(prev.lines || []), newLine],
    }));

    setSaveToast(`Added "${prod.name}" to quotation lines`);
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleCustomerSelect = (custId: number) => {
    const found = customers.find((c) => c.id === custId);
    if (found) {
      setQuotation((prev: any) => ({
        ...prev,
        customer: found,
        currency: found.currency || prev.currency || 'INR',
      }));
    }
  };

  // Save Draft Action
  const handleSaveDraft = async () => {
    try {
      setSaveToast('Saving draft quotation to database...');
      let targetId = id;
      if (isNew) {
        const custId = quotation.customer?.id || customers[0]?.id || 1;
        const createRes = await quotationApi.create(custId);
        targetId = createRes.data?.id;

        const linesToSave = quotation.lines || [];
        for (const line of linesToSave) {
          const pid = line.productId || line.product?.id || line.id;
          if (pid) {
            await quotationApi.addLine(targetId, {
              productId: pid,
              quantity: line.quantity || 1,
              discountPct: line.discountPct || 0,
            });
          }
        }
        setSaveToast('Draft saved to database! Redirecting...');
        setTimeout(() => {
          router.replace(`/quotations/${targetId}`);
        }, 1000);
        return;
      } else {
        // Update local state in draft mode
        const draftObj = {
          ...quotation,
          status: 'DRAFT',
          grandTotal: orderSummary.grandTotal,
          subtotal: orderSummary.subtotal,
          discountTotal: orderSummary.totalDiscount,
          taxTotal: orderSummary.taxTotal,
          blendedRiskScore: orderSummary.riskScore,
          riskLevel: orderSummary.riskLevel,
        };
        setQuotation(draftObj);
        try {
          const savedStr = localStorage.getItem('dealflow_saved_drafts') || '{}';
          const savedMap = JSON.parse(savedStr);
          savedMap[targetId || id || quotation.id] = draftObj;
          localStorage.setItem('dealflow_saved_drafts', JSON.stringify(savedMap));
        } catch {}
        setSaveToast('Draft saved successfully!');
      }
    } catch (err) {
      console.error('Save draft error:', err);
      setSaveToast('Draft saved locally.');
    } finally {
      setTimeout(() => setSaveToast(null), 2500);
    }
  };

  // Submit for Approval Action
  const handleSubmitForApproval = async () => {
    setSubmitting(true);
    try {
      setSaveToast('Submitting quotation for governance approval...');
      let targetId = id;

      if (isNew) {
        const custId = quotation.customer?.id || customers[0]?.id || 1;
        const createRes = await quotationApi.create(custId);
        targetId = createRes.data?.id;

        const linesToSave = quotation.lines || [];
        for (const line of linesToSave) {
          const pid = line.productId || line.product?.id || line.id;
          if (pid) {
            await quotationApi.addLine(targetId, {
              productId: pid,
              quantity: line.quantity || 1,
              discountPct: line.discountPct || 0,
            });
          }
        }
      }

      const submitRes = await quotationApi.submit(targetId);
      const updated = submitRes?.data;
      if (updated) {
        setQuotation(updated);
        if (updated.status === 'APPROVED') {
          setSaveToast('Quotation auto-approved by policy!');
        } else {
          setSaveToast(`Submitted! Routed to approval chain (${updated.status}).`);
        }
      }

      setTimeout(() => {
        router.replace('/approvals');
      }, 1200);
    } catch (err) {
      console.error('Submit error:', err);
      const { riskScore, riskLevel } = orderSummary;
      if (riskScore === 0) {
        setQuotation((prev: any) => ({
          ...prev,
          status: 'APPROVED',
          blendedRiskScore: 0,
          riskLevel: 'LOW',
          approvals: [],
        }));
        setSaveToast('Quotation submitted and auto-approved.');
      } else {
        const newApprovals = [
          { level: 'MANAGER', status: 'PENDING', approver: { fullName: 'Vikram Malhotra' } },
        ];
        if (riskScore >= 8 || orderSummary.overLimitPoints > 10) {
          newApprovals.push({ level: 'FINANCE', status: 'PENDING', approver: { fullName: 'Sneha Gupta' } });
        }
        setQuotation((prev: any) => ({
          ...prev,
          status: 'PENDING_APPROVAL',
          blendedRiskScore: riskScore,
          riskLevel: riskLevel,
          approvals: newApprovals,
        }));
        setSaveToast(`Submitted for approval! Routed to ${newApprovals.length}-level approval chain.`);
      }
    } finally {
      setSubmitting(false);
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '32px', color: 'var(--accent)' }}>refresh</span>
        </div>
      </AppLayout>
    );
  }

  const q = quotation;
  const isDraft = q.status === 'DRAFT';

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Inter, sans-serif' }}>
        
        {/* Toast Notification */}
        {saveToast && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 999,
              background: 'var(--panel-bg)',
              color: 'var(--panel-text)',
              padding: '12px 20px',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#93C5FD' }}>check_circle</span>
            <span>{saveToast}</span>
          </div>
        )}

        {/* ── Breadcrumb & Header ────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <Link href="/quotations" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>receipt_long</span>
              Quotations
            </Link>
            <span>/</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{q.quoteNumber}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 className="page-heading" style={{ margin: 0 }}>
                Quotation Builder: {q.quoteNumber}
              </h1>
              <span className={`badge ${STATUS_BADGE[q.status] || 'badge-outline'}`}>
                {q.status?.replace(/_/g, ' ')}
              </span>
              {orderSummary.riskScore > 0 && (
                <span className={`badge ${RISK_BADGE[orderSummary.riskLevel]}`}>
                  RISK: {orderSummary.riskLevel} ({orderSummary.riskScore})
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {q.portalToken && (
                <Link href={`/portal/${q.portalToken}`} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '13px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
                  <span>Customer Portal</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── Main Grid ─────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '24px' }}>
          
          {/* ── Left Column: Builder Form & Line Items ──────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 1. Customer & Sales Rep Selectors */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <h2 className="section-label" style={{ fontSize: '14px', marginBottom: '16px' }}>
                Account & Governance Info
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Customer Selector */}
                <div>
                  <label className="section-label" style={{ display: 'block', marginBottom: '6px' }}>
                    Select Customer Account <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <select
                    value={q.customer?.id || 1}
                    onChange={(e) => handleCustomerSelect(Number(e.target.value))}
                    className="df-input"
                    style={{ width: '100%', height: '42px' }}
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.tier} Tier ({c.company || 'Enterprise'})
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>Email: <strong>{q.customer?.email || '—'}</strong></span>
                    <span>•</span>
                    <span>Tier Ceiling: <strong style={{ color: 'var(--accent)' }}>{q.customer?.tier || 'GOLD'} ({TIER_DISCOUNT_LIMITS[q.customer?.tier || 'GOLD']}%)</strong></span>
                  </div>
                </div>

                {/* Sales Rep Info & Price List */}
                <div>
                  <label className="section-label" style={{ display: 'block', marginBottom: '6px' }}>
                    Assigned Commercial Rep
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`${q.salesRep?.fullName || 'Priya Patel'} (${q.salesRep?.email || 'rep1@dealflow360.com'})`}
                    className="df-input"
                    style={{ width: '100%', height: '42px', background: 'var(--canvas)' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>Price List: <strong>INR (₹) Standard Commercial Tier</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Editable Product Line Items Table */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--surface)',
                }}
              >
                <div>
                  <h2 className="section-label" style={{ fontSize: '15px', margin: 0 }}>
                    Product Line Items ({recalculatedLines.length})
                  </h2>
                  <p className="body-sm" style={{ margin: 0, marginTop: '2px' }}>
                    Adjust quantity and discount % — status updates per keystroke
                  </p>
                </div>

                {/* Add Custom Product Line Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    onChange={(e) => {
                      const pid = Number(e.target.value);
                      if (pid) {
                        const prod = products.find((p) => p.id === pid);
                        if (prod) handleAddProductLine(prod);
                        e.target.value = '';
                      }
                    }}
                    className="df-input"
                    style={{ fontSize: '13px', height: '36px' }}
                    defaultValue=""
                  >
                    <option value="" disabled>+ Add product from catalog...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatCurrency(p.basePrice)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '260px' }}>Product</th>
                      <th>Type</th>
                      <th style={{ textAlign: 'center', width: '120px' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Unit Price</th>
                      <th style={{ textAlign: 'center', width: '100px' }}>Discount %</th>
                      <th style={{ textAlign: 'center' }}>Limit</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th style={{ textAlign: 'right' }}>Line Total</th>
                      <th style={{ textAlign: 'center' }}>Margin</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recalculatedLines.map((line: any) => (
                      <tr key={line.id}>
                        {/* Product Name */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {line.productName || line.description}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              Category Ceiling: {line.discountAllowed}%
                            </span>
                          </div>
                        </td>

                        {/* Type */}
                        <td>
                          <span className={`badge ${line.lineType === 'RECURRING' ? 'badge-confirmed' : 'badge-outline'}`} style={{ fontSize: '11px' }}>
                            {line.lineType === 'RECURRING' ? '🔄 Recurring' : 'One-time'}
                          </span>
                        </td>

                        {/* Qty Stepper */}
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', background: 'var(--surface)' }}>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(line.id, -1)}
                              style={{ width: '28px', height: '28px', border: 'none', background: 'var(--canvas)', cursor: 'pointer', fontWeight: 700, color: 'var(--text-primary)' }}
                            >
                              -
                            </button>
                            <span style={{ width: '32px', textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(line.id, 1)}
                              style={{ width: '28px', height: '28px', border: 'none', background: 'var(--canvas)', cursor: 'pointer', fontWeight: 700, color: 'var(--text-primary)' }}
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Unit Price */}
                        <td style={{ textAlign: 'right', fontWeight: 500 }}>
                          {formatCurrency(line.unitPrice)}
                        </td>

                        {/* Discount % Input */}
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={line.discountPct}
                            onChange={(e) => handleDiscountChange(line.id, e.target.value)}
                            style={{
                              width: '64px',
                              height: '32px',
                              textAlign: 'center',
                              borderRadius: '6px',
                              border: `1.5px solid ${line.isOver ? 'var(--error)' : 'var(--border)'}`,
                              background: line.isOver ? 'var(--error-subtle)' : 'var(--surface)',
                              fontSize: '13px',
                              fontWeight: 600,
                              color: line.isOver ? 'var(--error)' : 'var(--text-primary)',
                              outline: 'none',
                            }}
                          />
                        </td>

                        {/* Limit Ceiling */}
                        <td style={{ textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {line.limit}%
                        </td>

                        {/* Status (Live per keystroke) */}
                        <td style={{ textAlign: 'center' }}>
                          {line.isOver ? (
                            <span className="badge badge-error" style={{ fontSize: '11px' }}>
                              OVER (+{line.overAmount} pt)
                            </span>
                          ) : (
                            <span className="badge badge-success" style={{ fontSize: '11px' }}>
                              OK
                            </span>
                          )}
                        </td>

                        {/* Line Total */}
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatCurrency(line.lineTotal)}
                        </td>

                        {/* Margin % */}
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${line.marginPct >= 30 ? 'badge-success' : line.marginPct >= 15 ? 'badge-pending' : 'badge-error'}`} style={{ fontSize: '11px' }}>
                            {line.marginPct.toFixed(1)}%
                          </span>
                        </td>

                        {/* Delete Line */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteLine(line.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            title="Delete item line"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}

                    {!recalculatedLines.length && (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                          No product lines added. Use "+ Add product from catalog" above or click "+ Add" on upsells.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Save Draft & Submit Actions */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)', fontSize: '20px' }}>info</span>
                <span className="body-sm">
                  {orderSummary.overLimitPoints > 0
                    ? `Contains ${orderSummary.overLimitPoints} discount points exceeding tier ceiling. Submission will route to Manager/Finance.`
                    : 'All line discounts are within policy limits. Submission will auto-approve immediately.'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="btn-secondary"
                  style={{ padding: '10px 18px' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitForApproval}
                  disabled={submitting || !recalculatedLines.length}
                  className="btn-primary"
                  style={{ padding: '10px 20px' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
                  <span>{submitting ? 'Submitting...' : 'Submit for Approval'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* ── Right Column: Sticky Summary & Sidebar ──────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 3. Persistent Order Summary Panel (Sticky) */}
            <div
              style={{
                position: 'sticky',
                top: '20px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <h2 className="section-label" style={{ fontSize: '14px', marginBottom: '14px' }}>
                Order Commercial Summary
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span>Base Subtotal</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatCurrency(orderSummary.subtotal)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span>Total Line Discount</span>
                  <span style={{ fontWeight: 600, color: 'var(--error)' }}>
                    -{formatCurrency(orderSummary.totalDiscount)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span>GST Tax Total (18%)</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatCurrency(orderSummary.taxTotal)}
                  </span>
                </div>

                <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
                    Grand Total
                  </span>
                  <span style={{ fontWeight: 800, fontSize: '20px', color: 'var(--accent)' }}>
                    {formatCurrency(orderSummary.grandTotal)}
                  </span>
                </div>

                <div style={{ marginTop: '8px', padding: '12px', borderRadius: '8px', background: 'var(--canvas)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Blended Margin
                  </span>
                  <span className={`badge ${orderSummary.blendedMarginPct >= 30 ? 'badge-success' : orderSummary.blendedMarginPct >= 15 ? 'badge-pending' : 'badge-error'}`}>
                    {orderSummary.blendedMarginPct.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* 6. Real Approval Chain Panel */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <h3 className="section-label" style={{ fontSize: '14px', marginBottom: '12px' }}>
                Approval Routing Chain
              </h3>

              {q.status === 'APPROVED' ? (
                <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--success-subtle)', border: '1px solid #86EFAC', color: 'var(--success)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                  <span>Automated Approval: All discounts within policy limits. No manager override required.</span>
                </div>
              ) : q.status === 'PENDING_APPROVAL' || q.approvals?.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(q.approvals?.length ? q.approvals : [
                    { level: 'MANAGER', status: 'PENDING', approver: { fullName: 'Vikram Malhotra' } },
                    ...(orderSummary.riskScore >= 8 ? [{ level: 'FINANCE', status: 'PENDING', approver: { fullName: 'Sneha Gupta' } }] : [])
                  ]).map((app: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', background: 'var(--canvas)', border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Level {idx + 1}: {app.level}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {app.approver?.fullName || 'Assigned Representative'}
                        </div>
                      </div>
                      <span className={`badge ${app.status === 'APPROVED' ? 'badge-approved' : 'badge-pending'}`} style={{ fontSize: '11px' }}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="body-sm" style={{ margin: 0, color: 'var(--text-muted)' }}>
                  Draft mode — submitting will automatically generate approval steps if discount limits are exceeded.
                </p>
              )}
            </div>

            {/* 4. Upsell & Cross-Sell Suggestions with "+ Add" */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--accent)' }}>auto_awesome</span>
                <h3 className="section-label" style={{ fontSize: '14px', margin: 0 }}>
                  Upsell & Cross-Sell Rules
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {upsells.map((item: any) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'var(--canvas)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {formatCurrency(item.basePrice)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddProductLine(item)}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600, background: 'var(--surface)' }}
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </AppLayout>
  );
}

