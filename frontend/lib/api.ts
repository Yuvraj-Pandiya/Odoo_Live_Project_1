import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('dealflow_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('dealflow_token');
      localStorage.removeItem('dealflow_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ────────────────────────────────────────────────────
export const authApi = {
  login:    (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  register: (data: any) => api.post('/api/auth/register', data),
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
// Note: No dedicated backend controller yet — uses quotation & dashboard endpoints
// New: subscriptionApi added to support Subscriptions List & Billing Detail pages
export const subscriptionApi = {
  // Backend stub — returns subscription data from quotation lines
  listByCustomer: (customerId: number) => api.get(`/api/customers/${customerId}`),
  // Subscription data is embedded in quotation invoice lines for now
  // Future: GET /api/subscriptions once a dedicated controller is created
};

// ── Customer Portal ─────────────────────────────────────────
export const portalApi = {
  view:      (token: string) => api.get(`/api/portal/${token}`),
  comments:  (token: string) => api.get(`/api/portal/${token}/comments`),
  negotiate: (token: string, data: any) => api.post(`/api/portal/${token}/negotiate`, data),
  confirm:   (token: string) => api.post(`/api/portal/${token}/confirm`),
};
