import axios from 'axios';

export function decodeJwtToken(token: string | null): any {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getStoredUser(): any {
  if (typeof window === 'undefined') return {};
  try {
    const token = localStorage.getItem('dealflow_token');
    const decoded = decodeJwtToken(token);
    const raw = localStorage.getItem('dealflow_user');
    const stored = raw && raw !== 'undefined' && raw !== 'null' ? JSON.parse(raw) : {};

    // Prioritize claims decoded server-side from JWT session token
    if (decoded && decoded.role) {
      return {
        ...stored,
        userId: decoded.userId || stored.id || stored.userId,
        id: decoded.userId || stored.id || stored.userId,
        email: decoded.email || decoded.sub || stored.email,
        role: decoded.role || stored.role,
        fullName: decoded.fullName || stored.fullName,
        department: decoded.department || stored.department,
      };
    }
    return stored;
  } catch {
    return {};
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  const t = localStorage.getItem('dealflow_token');
  if (!t || t === 'undefined' || t === 'null') return null;
  return t;
}

export function setStoredAuth(token: string, user: any): void {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('dealflow_token', token);
  if (user) localStorage.setItem('dealflow_user', JSON.stringify(user));
}

export function clearStoredAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('dealflow_token');
  localStorage.removeItem('dealflow_user');
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getStoredToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — redirect to root login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      clearStoredAuth();
      if (!window.location.pathname.startsWith('/portal/login')) {
        window.location.href = '/';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ────────────────────────────────────────────────────
export const authApi = {
  login:          (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  register:       (data: any) => api.post('/api/auth/register', data),
  session:        () => api.get('/api/auth/session'),
  me:             () => api.get('/api/auth/me'),
  changePassword: (data: { currentPassword?: string; newPassword: string }) =>
    api.post('/api/auth/change-password', data),
};

// ── Setup Wizard (First-Admin Bootstrap) ───────────────────
export const setupApi = {
  checkAdminStatus: () => api.get('/api/setup/admin'),
  bootstrapAdmin:   (data: any) => api.post('/api/setup/admin', data),
};

// ── Admin User Governance ───────────────────────────────────
export const adminUsersApi = {
  list:          () => api.get('/api/admin/users'),
  get:           (id: number) => api.get(`/api/admin/users/${id}`),
  create:        (data: any) => api.post('/api/admin/users', data),
  update:        (id: number, data: any) => api.put(`/api/admin/users/${id}`, data),
  deactivate:    (id: number) => api.delete(`/api/admin/users/${id}`),
  reactivate:    (id: number) => api.post(`/api/admin/users/${id}/reactivate`),
  getAuditLogs:  () => api.get('/api/admin/users/audit-logs'),
};

// ── Discount Tier Configuration (Bounded Dataset - Client-Side Paginated) ──
export const discountTierApi = {
  list:   () => api.get('/api/admin/discount-tiers'),
  update: (id: number, data: { maxDiscount?: number; description?: string }) =>
    api.put(`/api/admin/discount-tiers/${id}`, data),
};

// ── Subscription Plan Catalog (Bounded Dataset - Client-Side Paginated) ────
export const subscriptionPlanApi = {
  list: () => api.get('/api/subscriptions/plans'),
};

// ── Quotations ──────────────────────────────────────────────
export const quotationApi = {
  list:       () => api.get('/api/quotations'),
  get:        (id: number) => api.get(`/api/quotations/${id}`),
  create:     (customerId: number) => api.post('/api/quotations', { customerId }),
  addLine:    (id: number, data: any) => api.post(`/api/quotations/${id}/lines`, data),
  submit:     (id: number) => api.post(`/api/quotations/${id}/submit`),
  approve:    (id: number, level: string, decision: string, notes: string) =>
    api.post(`/api/quotations/${id}/approve?level=${level}`, { decision, notes }),
  stats:      () => api.get('/api/quotations/stats'),
};

// ── Products ────────────────────────────────────────────────
export const productApi = {
  list:       () => api.get('/api/products'),
  get:        (id: number) => api.get(`/api/products/${id}`),
  create:     (data: any) => api.post('/api/products', data),
  update:     (id: number, data: any) => api.put(`/api/products/${id}`, data),
  categories: () => api.get('/api/products/categories'),
  upsell:     (productIds: number[]) =>
    api.get('/api/products/upsell', { params: { productIds } }),
};

// ── Customers ───────────────────────────────────────────────
export const customerApi = {
  list:   () => api.get('/api/customers'),
  get:    (id: number) => api.get(`/api/customers/${id}`),
  create: (data: any) => api.post('/api/customers', data),
  update: (id: number, data: any) => api.put(`/api/customers/${id}`, data),
};

// ── Dashboard ───────────────────────────────────────────────
export const dashboardApi = {
  stats:            () => api.get('/api/dashboard/stats'),
  alerts:           () => api.get('/api/dashboard/alerts'),
  resolveAlert:     (id: number, action: string) =>
    api.post(`/api/dashboard/alerts/${id}/resolve?action=${encodeURIComponent(action)}`),
  pendingApprovals: () => api.get('/api/dashboard/approvals/pending'),
  invoices:         () => api.get('/api/dashboard/invoices'),
};

// ── Fulfillment ─────────────────────────────────────────────
export const fulfillmentApi = {
  list:        () => api.get('/api/fulfillment'),
  byQuotation: (qid: number) => api.get(`/api/fulfillment/quotation/${qid}`),
  warehouses:  () => api.get('/api/fulfillment/warehouses'),
  stock:       (wid: number) => api.get(`/api/fulfillment/stock/${wid}`),
  acceptSplit: (id: number) => api.put(`/api/fulfillment/${id}/accept`),
};

// ── Invoices ────────────────────────────────────────────────
export const invoiceApi = {
  list:         () => api.get('/api/dashboard/invoices'),
  byCustomer:   (customerId: number) => api.get(`/api/invoices/customer/${customerId}`),
  byQuotation:  (quotationId: number) => api.get(`/api/invoices/quotation/${quotationId}`),
};

// ── Subscriptions ────────────────────────────────────────────
export const subscriptionApi = {
  listByCustomer: (customerId: number) => api.get(`/api/customers/${customerId}`),
};

// ── Customer Portal ─────────────────────────────────────────
export const portalApi = {
  myQuotations:     () => api.get('/api/portal/my-quotations'),
  myProfile:        () => api.get('/api/portal/my-profile'),
  view:             (token: string) => api.get(`/api/portal/${token}`),
  comments:         (token: string) => api.get(`/api/portal/${token}/comments`),
  negotiate:        (token: string, data: any) => api.post(`/api/portal/${token}/negotiate`, data),
  confirm:          (token: string) => api.post(`/api/portal/${token}/confirm`),
  requestMagicLink: (email: string) => api.post('/api/portal/magic-link', { email }),
};
