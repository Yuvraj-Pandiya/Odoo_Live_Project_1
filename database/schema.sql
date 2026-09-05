-- ============================================================
-- DealFlow360 - Complete Database Schema
-- PostgreSQL 18
-- ============================================================

-- Drop existing schema (for fresh install)
DROP SCHEMA IF EXISTS dealflow CASCADE;
CREATE SCHEMA dealflow;
SET search_path TO dealflow;

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'SALES_REP', 'MANAGER', 'FINANCE', 'CUSTOMER');
CREATE TYPE customer_tier AS ENUM ('BRONZE', 'SILVER', 'GOLD');
CREATE TYPE quotation_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'NEGOTIATION', 'CONFIRMED', 'FULFILLED', 'CANCELLED');
CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'RETURNED');
CREATE TYPE approval_level AS ENUM ('MANAGER', 'FINANCE');
CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE fulfillment_status AS ENUM ('PENDING', 'SPLIT_PENDING', 'PARTIALLY_FULFILLED', 'FULFILLED', 'BACKORDER');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED');
CREATE TYPE billing_cycle AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');
CREATE TYPE invoice_status AS ENUM ('DRAFT', 'SENT', 'UNPAID', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('BANK_TRANSFER', 'CREDIT_CARD', 'CHECK', 'ONLINE');
CREATE TYPE alert_type AS ENUM ('STALLED_DEAL', 'DISCOUNT_ANOMALY', 'DELIVERY_SLIPPAGE', 'BACKORDER_RESOLVED');
CREATE TYPE product_type AS ENUM ('PHYSICAL', 'SERVICE', 'SUBSCRIPTION');
CREATE TYPE line_type AS ENUM ('ONE_TIME', 'RECURRING');

-- ============================================================
-- CORE USER & AUTH TABLES
-- ============================================================

CREATE TABLE users (
    id                  BIGSERIAL PRIMARY KEY,
    email               VARCHAR(255) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    role                user_role NOT NULL DEFAULT 'SALES_REP',
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    avatar_url          VARCHAR(500),
    phone               VARCHAR(50),
    department          VARCHAR(100),
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_audit_logs (
    id                  BIGSERIAL PRIMARY KEY,
    actor_user_id       BIGINT,
    actor_email         VARCHAR(255) NOT NULL,
    target_user_id      BIGINT,
    target_email        VARCHAR(255) NOT NULL,
    action              VARCHAR(100) NOT NULL,
    old_value           TEXT,
    new_value           TEXT,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(500) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CUSTOMER TABLES
-- ============================================================

CREATE TABLE customers (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    phone           VARCHAR(50),
    company         VARCHAR(255),
    tier            customer_tier NOT NULL DEFAULT 'BRONZE',
    address_line1   VARCHAR(255),
    address_line2   VARCHAR(255),
    city            VARCHAR(100),
    state           VARCHAR(100),
    country         VARCHAR(100),
    postal_code     VARCHAR(20),
    currency        VARCHAR(10) NOT NULL DEFAULT 'INR',
    portal_password VARCHAR(255),
    portal_token    VARCHAR(500),
    assigned_rep_id BIGINT REFERENCES users(id),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRODUCT CATALOG
-- ============================================================

CREATE TABLE product_categories (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    max_discount    NUMERIC(5,2) NOT NULL DEFAULT 15.00,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    sku                 VARCHAR(100) UNIQUE,
    category_id         BIGINT REFERENCES product_categories(id),
    product_type        product_type NOT NULL DEFAULT 'PHYSICAL',
    base_price          NUMERIC(15,2) NOT NULL,
    cost_price          NUMERIC(15,2),
    unit                VARCHAR(50) NOT NULL DEFAULT 'Each',
    tax_percentage      NUMERIC(5,2) NOT NULL DEFAULT 0,
    description         TEXT,
    is_subscription     BOOLEAN NOT NULL DEFAULT FALSE,
    billing_cycle       billing_cycle,
    is_promoted         BOOLEAN NOT NULL DEFAULT FALSE,
    min_margin_pct      NUMERIC(5,2),
    quantity_on_hand    INTEGER NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_variants (
    id              BIGSERIAL PRIMARY KEY,
    product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    attribute_name  VARCHAR(100) NOT NULL,
    attribute_value VARCHAR(100) NOT NULL,
    extra_price     NUMERIC(15,2) NOT NULL DEFAULT 0,
    sku_suffix      VARCHAR(50),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE price_lists (
    id              BIGSERIAL PRIMARY KEY,
    product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_tier   customer_tier NOT NULL,
    currency        VARCHAR(10) NOT NULL DEFAULT 'INR',
    price_rule      VARCHAR(50) NOT NULL DEFAULT 'FIXED',
    fixed_price     NUMERIC(15,2),
    discount_pct    NUMERIC(5,2),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, customer_tier, currency)
);

-- ============================================================
-- DISCOUNT & APPROVAL CONFIGURATION
-- ============================================================

CREATE TABLE discount_tiers (
    id              BIGSERIAL PRIMARY KEY,
    tier            customer_tier NOT NULL UNIQUE,
    max_discount    NUMERIC(5,2) NOT NULL,
    description     VARCHAR(255),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE approval_chains (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    discount_from   NUMERIC(5,2) NOT NULL,
    discount_to     NUMERIC(5,2) NOT NULL,
    required_level  approval_level NOT NULL,
    description     VARCHAR(255),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- WAREHOUSE & FULFILLMENT CONFIGURATION
-- ============================================================

CREATE TABLE warehouses (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    code                VARCHAR(20) NOT NULL UNIQUE,
    address             VARCHAR(255),
    city                VARCHAR(100),
    country             VARCHAR(100),
    shipping_cost_weight NUMERIC(8,4) NOT NULL DEFAULT 1.0,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE warehouse_stock (
    id              BIGSERIAL PRIMARY KEY,
    warehouse_id    BIGINT NOT NULL REFERENCES warehouses(id),
    product_id      BIGINT NOT NULL REFERENCES products(id),
    quantity        INTEGER NOT NULL DEFAULT 0,
    reserved        INTEGER NOT NULL DEFAULT 0,
    reorder_point   INTEGER NOT NULL DEFAULT 10,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(warehouse_id, product_id)
);

-- ============================================================
-- UPSELL / CROSS-SELL RULES
-- ============================================================

CREATE TABLE upsell_rules (
    id                  BIGSERIAL PRIMARY KEY,
    trigger_product_id  BIGINT NOT NULL REFERENCES products(id),
    suggest_product_id  BIGINT NOT NULL REFERENCES products(id),
    co_purchase_count   INTEGER NOT NULL DEFAULT 0,
    is_promoted         BOOLEAN NOT NULL DEFAULT FALSE,
    min_margin_pct      NUMERIC(5,2),
    priority            INTEGER NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(trigger_product_id, suggest_product_id)
);

-- ============================================================
-- QUOTATIONS
-- ============================================================

CREATE TABLE quotations (
    id                  BIGSERIAL PRIMARY KEY,
    quote_number        VARCHAR(20) NOT NULL UNIQUE,
    customer_id         BIGINT NOT NULL REFERENCES customers(id),
    sales_rep_id        BIGINT NOT NULL REFERENCES users(id),
    status              quotation_status NOT NULL DEFAULT 'DRAFT',
    currency            VARCHAR(10) NOT NULL DEFAULT 'INR',
    subtotal            NUMERIC(15,2) NOT NULL DEFAULT 0,
    tax_total           NUMERIC(15,2) NOT NULL DEFAULT 0,
    discount_total      NUMERIC(15,2) NOT NULL DEFAULT 0,
    grand_total         NUMERIC(15,2) NOT NULL DEFAULT 0,
    blended_risk_score  NUMERIC(8,4),
    risk_level          risk_level,
    notes               TEXT,
    valid_until         DATE,
    portal_token        VARCHAR(500) UNIQUE,
    last_activity_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at        TIMESTAMPTZ,
    approved_at         TIMESTAMPTZ,
    confirmed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quotation_lines (
    id                  BIGSERIAL PRIMARY KEY,
    quotation_id        BIGINT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id          BIGINT NOT NULL REFERENCES products(id),
    variant_id          BIGINT REFERENCES product_variants(id),
    description         VARCHAR(500),
    line_type           line_type NOT NULL DEFAULT 'ONE_TIME',
    quantity            INTEGER NOT NULL DEFAULT 1,
    unit_price          NUMERIC(15,2) NOT NULL,
    cost_price          NUMERIC(15,2),
    discount_pct        NUMERIC(5,2) NOT NULL DEFAULT 0,
    discount_allowed    NUMERIC(5,2) NOT NULL DEFAULT 0,
    tax_pct             NUMERIC(5,2) NOT NULL DEFAULT 0,
    line_total          NUMERIC(15,2) NOT NULL,
    margin_amount       NUMERIC(15,2),
    margin_pct          NUMERIC(5,2),
    billing_cycle       billing_cycle,
    is_upsell           BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- APPROVALS & AUDIT
-- ============================================================

CREATE TABLE approvals (
    id              BIGSERIAL PRIMARY KEY,
    quotation_id    BIGINT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    approver_id     BIGINT REFERENCES users(id),
    level           approval_level NOT NULL,
    status          approval_status NOT NULL DEFAULT 'PENDING',
    notes           TEXT,
    decided_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE approval_audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    quotation_id    BIGINT NOT NULL REFERENCES quotations(id),
    user_id         BIGINT REFERENCES users(id),
    action          VARCHAR(100) NOT NULL,
    notes           TEXT,
    old_status      VARCHAR(50),
    new_status      VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FULFILLMENT
-- ============================================================

CREATE TABLE fulfillment_orders (
    id                  BIGSERIAL PRIMARY KEY,
    quotation_id        BIGINT NOT NULL REFERENCES quotations(id),
    status              fulfillment_status NOT NULL DEFAULT 'PENDING',
    is_manual_override  BOOLEAN NOT NULL DEFAULT FALSE,
    total_shipments     INTEGER NOT NULL DEFAULT 0,
    total_shipping_cost NUMERIC(15,2) NOT NULL DEFAULT 0,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE fulfillment_lines (
    id                      BIGSERIAL PRIMARY KEY,
    fulfillment_order_id    BIGINT NOT NULL REFERENCES fulfillment_orders(id) ON DELETE CASCADE,
    quotation_line_id       BIGINT NOT NULL REFERENCES quotation_lines(id),
    warehouse_id            BIGINT NOT NULL REFERENCES warehouses(id),
    product_id              BIGINT NOT NULL REFERENCES products(id),
    quantity_allocated      INTEGER NOT NULL DEFAULT 0,
    quantity_fulfilled      INTEGER NOT NULL DEFAULT 0,
    is_backorder            BOOLEAN NOT NULL DEFAULT FALSE,
    estimated_ship_date     DATE,
    shipping_cost           NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================

CREATE TABLE subscriptions (
    id                  BIGSERIAL PRIMARY KEY,
    quotation_id        BIGINT NOT NULL REFERENCES quotations(id),
    customer_id         BIGINT NOT NULL REFERENCES customers(id),
    status              subscription_status NOT NULL DEFAULT 'ACTIVE',
    billing_cycle       billing_cycle NOT NULL,
    start_date          DATE NOT NULL,
    next_billing_date   DATE,
    end_date            DATE,
    proration_days      INTEGER,
    cancellation_reason TEXT,
    cancelled_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscription_lines (
    id              BIGSERIAL PRIMARY KEY,
    subscription_id BIGINT NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    product_id      BIGINT NOT NULL REFERENCES products(id),
    quantity        INTEGER NOT NULL DEFAULT 1,
    unit_price      NUMERIC(15,2) NOT NULL,
    discount_pct    NUMERIC(5,2) NOT NULL DEFAULT 0,
    line_total      NUMERIC(15,2) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INVOICES & PAYMENTS
-- ============================================================

CREATE TABLE invoices (
    id                  BIGSERIAL PRIMARY KEY,
    invoice_number      VARCHAR(20) NOT NULL UNIQUE,
    quotation_id        BIGINT REFERENCES quotations(id),
    subscription_id     BIGINT REFERENCES subscriptions(id),
    customer_id         BIGINT NOT NULL REFERENCES customers(id),
    status              invoice_status NOT NULL DEFAULT 'DRAFT',
    currency            VARCHAR(10) NOT NULL DEFAULT 'INR',
    subtotal            NUMERIC(15,2) NOT NULL DEFAULT 0,
    tax_total           NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_amount        NUMERIC(15,2) NOT NULL DEFAULT 0,
    amount_paid         NUMERIC(15,2) NOT NULL DEFAULT 0,
    amount_due          NUMERIC(15,2) NOT NULL DEFAULT 0,
    due_date            DATE,
    is_recurring        BOOLEAN NOT NULL DEFAULT FALSE,
    billing_period_start DATE,
    billing_period_end  DATE,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoice_lines (
    id              BIGSERIAL PRIMARY KEY,
    invoice_id      BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id      BIGINT REFERENCES products(id),
    description     VARCHAR(500) NOT NULL,
    quantity        INTEGER NOT NULL DEFAULT 1,
    unit_price      NUMERIC(15,2) NOT NULL,
    discount_pct    NUMERIC(5,2) NOT NULL DEFAULT 0,
    tax_pct         NUMERIC(5,2) NOT NULL DEFAULT 0,
    line_total      NUMERIC(15,2) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
    id              BIGSERIAL PRIMARY KEY,
    invoice_id      BIGINT NOT NULL REFERENCES invoices(id),
    customer_id     BIGINT NOT NULL REFERENCES customers(id),
    amount          NUMERIC(15,2) NOT NULL,
    currency        VARCHAR(10) NOT NULL DEFAULT 'INR',
    method          payment_method NOT NULL DEFAULT 'BANK_TRANSFER',
    reference       VARCHAR(255),
    notes           TEXT,
    paid_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CUSTOMER PORTAL NEGOTIATION
-- ============================================================

CREATE TABLE negotiation_comments (
    id              BIGSERIAL PRIMARY KEY,
    quotation_id    BIGINT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    line_id         BIGINT REFERENCES quotation_lines(id),
    author_type     VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    author_id       BIGINT,
    message         TEXT NOT NULL,
    counter_discount NUMERIC(5,2),
    is_resolved     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DEAL HEALTH & ANOMALY ALERTS
-- ============================================================

CREATE TABLE deal_health_alerts (
    id              BIGSERIAL PRIMARY KEY,
    quotation_id    BIGINT NOT NULL REFERENCES quotations(id),
    alert_type      alert_type NOT NULL,
    description     TEXT NOT NULL,
    is_resolved     BOOLEAN NOT NULL DEFAULT FALSE,
    action_taken    VARCHAR(255),
    flagged_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_quotations_customer ON quotations(customer_id);
CREATE INDEX idx_quotations_rep ON quotations(sales_rep_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotation_lines_quote ON quotation_lines(quotation_id);
CREATE INDEX idx_approvals_quotation ON approvals(quotation_id);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_fulfillment_quotation ON fulfillment_orders(quotation_id);
CREATE INDEX idx_warehouse_stock_warehouse ON warehouse_stock(warehouse_id);
CREATE INDEX idx_warehouse_stock_product ON warehouse_stock(product_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_quotation ON invoices(quotation_id);
CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_deal_alerts_quotation ON deal_health_alerts(quotation_id);

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW v_quotation_summary AS
SELECT 
    q.id,
    q.quote_number,
    q.status,
    q.grand_total,
    q.risk_level,
    q.blended_risk_score,
    q.created_at,
    q.last_activity_at,
    c.name AS customer_name,
    c.tier AS customer_tier,
    c.email AS customer_email,
    u.first_name || ' ' || u.last_name AS sales_rep_name
FROM quotations q
JOIN customers c ON c.id = q.customer_id
JOIN users u ON u.id = q.sales_rep_id;

CREATE OR REPLACE VIEW v_warehouse_availability AS
SELECT 
    ws.warehouse_id,
    w.name AS warehouse_name,
    ws.product_id,
    p.name AS product_name,
    ws.quantity,
    ws.reserved,
    (ws.quantity - ws.reserved) AS available
FROM warehouse_stock ws
JOIN warehouses w ON w.id = ws.warehouse_id
JOIN products p ON p.id = ws.product_id;
