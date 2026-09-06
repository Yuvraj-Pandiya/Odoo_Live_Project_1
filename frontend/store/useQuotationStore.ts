import { create } from 'zustand';
import { quotationApi } from '@/lib/api';

export interface QuotationItem {
  id: number | string;
  quoteNumber: string;
  customer?: { id?: number; name?: string; tier?: string; email?: string; company?: string };
  customerName?: string;
  customerTier?: string;
  salesRep?: { id?: number; fullName?: string; email?: string };
  salesRepName?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'PENDING' | 'APPROVED' | 'NEGOTIATION' | 'CONFIRMED' | 'FULFILLED' | 'REJECTED' | 'CANCELLED';
  grandTotal: number;
  subtotal?: number;
  taxTotal?: number;
  discountTotal?: number;
  currency?: string;
  blendedRiskScore?: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  lastActivityAt?: string;
  createdAt?: string;
  lines?: any[];
  approvals?: any[];
  portalToken?: string;
  notes?: string;
}

const DEFAULT_MOCK_QUOTATIONS: QuotationItem[] = [
  { id: 1, quoteNumber: 'Q-1042', status: 'PENDING_APPROVAL', grandTotal: 2581.00, currency: 'INR', riskLevel: 'HIGH', blendedRiskScore: 8.5, customer: { name: 'Acme Corp', tier: 'GOLD' }, salesRep: { fullName: 'J. Rao' }, lastActivityAt: '2026-09-03T10:00:00Z', createdAt: '2026-09-03T10:00:00Z' },
  { id: 2, quoteNumber: 'Q-1039', status: 'PENDING_APPROVAL', grandTotal: 1974.00, currency: 'INR', riskLevel: 'MEDIUM', blendedRiskScore: 5.2, customer: { name: 'Beta Industries', tier: 'SILVER' }, salesRep: { fullName: 'J. Rao' }, lastActivityAt: '2026-09-01T09:00:00Z', createdAt: '2026-09-01T09:00:00Z' },
  { id: 3, quoteNumber: 'Q-1035', status: 'APPROVED', grandTotal: 413.00, currency: 'INR', riskLevel: 'LOW', blendedRiskScore: 0, customer: { name: 'Nova Retail', tier: 'BRONZE' }, salesRep: { fullName: 'S. Kumar' }, lastActivityAt: '2026-09-02T14:00:00Z', createdAt: '2026-09-02T14:00:00Z' },
  { id: 4, quoteNumber: 'Q-1030', status: 'CONFIRMED', grandTotal: 16854.00, currency: 'INR', riskLevel: 'LOW', blendedRiskScore: 2.1, customer: { name: 'Zenith Co', tier: 'GOLD' }, salesRep: { fullName: 'S. Kumar' }, lastActivityAt: '2026-08-26T11:00:00Z', createdAt: '2026-08-26T11:00:00Z' },
  { id: 5, quoteNumber: 'Q-1025', status: 'DRAFT', grandTotal: 1250.00, currency: 'INR', riskLevel: 'LOW', blendedRiskScore: 0, customer: { name: 'Tata Consultancy Services', tier: 'GOLD' }, salesRep: { fullName: 'Priya Patel' }, lastActivityAt: '2026-09-05T16:00:00Z', createdAt: '2026-09-05T16:00:00Z' },
  { id: 6, quoteNumber: 'Q-1020', status: 'NEGOTIATION', grandTotal: 3400.00, currency: 'INR', riskLevel: 'MEDIUM', blendedRiskScore: 4.0, customer: { name: 'Infosys Ltd', tier: 'GOLD' }, salesRep: { fullName: 'Vikram Singh' }, lastActivityAt: '2026-09-04T12:00:00Z', createdAt: '2026-09-04T12:00:00Z' },
  { id: 7, quoteNumber: 'Q-1018', status: 'FULFILLED', grandTotal: 8200.00, currency: 'INR', riskLevel: 'LOW', blendedRiskScore: 1.0, customer: { name: 'Reliance Jio', tier: 'GOLD' }, salesRep: { fullName: 'Ananya Sharma' }, lastActivityAt: '2026-09-02T18:00:00Z', createdAt: '2026-09-02T18:00:00Z' },
];

interface QuotationStoreState {
  quotations: QuotationItem[];
  loading: boolean;
  filter: string;
  search: string;
  viewMode: 'pipeline' | 'table';

  fetchQuotations: () => Promise<void>;
  addOrUpdateQuotation: (item: QuotationItem) => void;
  setFilter: (filter: string) => void;
  setSearch: (search: string) => void;
  setViewMode: (mode: 'pipeline' | 'table') => void;
}

export const useQuotationStore = create<QuotationStoreState>((set) => ({
  quotations: DEFAULT_MOCK_QUOTATIONS,
  loading: false,
  filter: 'ALL',
  search: '',
  viewMode: 'pipeline',

  fetchQuotations: async () => {
    set({ loading: true });
    try {
      let localDrafts: QuotationItem[] = [];
      let localSubmitted: QuotationItem[] = [];

      if (typeof window !== 'undefined') {
        const draftsStr = localStorage.getItem('dealflow_saved_drafts');
        if (draftsStr) {
          try {
            const parsed = JSON.parse(draftsStr);
            localDrafts = Object.values(parsed);
          } catch {}
        }
        const submittedStr = localStorage.getItem('dealflow_submitted_approvals');
        if (submittedStr) {
          try {
            localSubmitted = JSON.parse(submittedStr);
          } catch {}
        }
      }

      let apiList: QuotationItem[] = [];
      try {
        const res = await quotationApi.list();
        if (res.data && Array.isArray(res.data)) {
          apiList = res.data;
        }
      } catch (err) {
        console.warn('Backend quotationApi offline, using fallback mock dataset:', err);
      }

      const baseList = apiList.length > 0 ? apiList : DEFAULT_MOCK_QUOTATIONS;
      const map = new Map<string | number, QuotationItem>();
      
      baseList.forEach((q) => {
        const key = q.id || q.quoteNumber;
        map.set(key, q);
      });

      localDrafts.forEach((q) => {
        const key = q.id || q.quoteNumber;
        map.set(key, { ...q, status: q.status || 'DRAFT' });
      });

      localSubmitted.forEach((q) => {
        const key = q.id || q.quoteNumber;
        map.set(key, q);
      });

      const merged = Array.from(map.values()).sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : (typeof a.id === 'number' ? a.id : 0);
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : (typeof b.id === 'number' ? b.id : 0);
        return tB - tA;
      });

      set({ quotations: merged, loading: false });
    } catch (err) {
      console.error('Error fetching quotations:', err);
      set({ loading: false });
    }
  },

  addOrUpdateQuotation: (item: QuotationItem) => {
    set((state) => {
      const existing = state.quotations.filter((q) => q.id !== item.id && q.quoteNumber !== item.quoteNumber);
      const updated = [item, ...existing];

      if (typeof window !== 'undefined') {
        if (item.status === 'DRAFT') {
          try {
            const draftsStr = localStorage.getItem('dealflow_saved_drafts') || '{}';
            const drafts = JSON.parse(draftsStr);
            drafts[item.id] = item;
            localStorage.setItem('dealflow_saved_drafts', JSON.stringify(drafts));
          } catch {}
        } else if (item.status === 'PENDING_APPROVAL' || item.status === 'PENDING') {
          try {
            const subStr = localStorage.getItem('dealflow_submitted_approvals') || '[]';
            const submitted = JSON.parse(subStr);
            const filteredSubmitted = [item, ...submitted.filter((x: any) => x.id !== item.id && x.quoteNumber !== item.quoteNumber)];
            localStorage.setItem('dealflow_submitted_approvals', JSON.stringify(filteredSubmitted));
          } catch {}
        }
      }

      return { quotations: updated };
    });
  },

  setFilter: (filter: string) => set({ filter }),
  setSearch: (search: string) => set({ search }),
  setViewMode: (viewMode: 'pipeline' | 'table') => set({ viewMode }),
}));
