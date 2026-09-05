-- ============================================================
-- DealFlow360 - Seed Data
-- Run AFTER schema.sql
-- ============================================================

SET search_path TO dealflow;

-- ============================================================
-- USERS (password = 'Password123!' for all, BCrypt hash below)
-- ============================================================

INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@dealflow360.com',     '$2a$12$LQv3c1yqBwEHXp1ZS7q5IOgq5i6w5JvS2R9u9W1Y3X5BaK2L7uqmS', 'Admin',   'System',   'ADMIN'),
('manager@dealflow360.com',   '$2a$12$LQv3c1yqBwEHXp1ZS7q5IOgq5i6w5JvS2R9u9W1Y3X5BaK2L7uqmS', 'M.',       'Shah',     'MANAGER'),
('finance@dealflow360.com',   '$2a$12$LQv3c1yqBwEHXp1ZS7q5IOgq5i6w5JvS2R9u9W1Y3X5BaK2L7uqmS', 'R.',       'Iyer',     'FINANCE'),
('rep1@dealflow360.com',      '$2a$12$LQv3c1yqBwEHXp1ZS7q5IOgq5i6w5JvS2R9u9W1Y3X5BaK2L7uqmS', 'J.',       'Rao',      'SALES_REP'),
('rep2@dealflow360.com',      '$2a$12$LQv3c1yqBwEHXp1ZS7q5IOgq5i6w5JvS2R9u9W1Y3X5BaK2L7uqmS', 'S.',       'Kumar',    'SALES_REP');

-- ============================================================
-- PRODUCT CATEGORIES
-- ============================================================

INSERT INTO product_categories (name, description, max_discount) VALUES
('Hardware',      'Physical hardware products',           15.00),
('Services',      'Professional and consulting services', 10.00),
('Subscriptions', 'Software and support subscriptions',  20.00),
('Accessories',   'Hardware accessories and peripherals', 15.00);

-- ============================================================
-- DISCOUNT TIERS
-- ============================================================

INSERT INTO discount_tiers (tier, max_discount, description) VALUES
('BRONZE', 5.00,  'Bronze customers: up to 5% discount'),
('SILVER', 10.00, 'Silver customers: up to 10% discount'),
('GOLD',   15.00, 'Gold customers: up to 15% discount');

-- ============================================================
-- APPROVAL CHAINS
-- ============================================================

INSERT INTO approval_chains (name, discount_from, discount_to, required_level, description) VALUES
('Manager Approval',         5.01,  15.00, 'MANAGER', 'Requires Sales Manager review'),
('Manager + Finance Dual',  15.01, 100.00, 'FINANCE',  'Requires Sales Manager then Finance');

-- ============================================================
-- WAREHOUSES
-- ============================================================

INSERT INTO warehouses (name, code, address, city, country, shipping_cost_weight) VALUES
('Main Warehouse', 'MAIN', '100 Industrial Blvd', 'Mumbai',   'India', 1.0),
('East Depot',     'EAST', '55 Depot Road',        'Kolkata',  'India', 1.3),
('West Hub',       'WEST', '22 Logistics Park',    'Ahmedabad','India', 1.2);

-- ============================================================
-- CUSTOMERS
-- ============================================================

INSERT INTO customers (name, email, phone, company, tier, city, country, currency, portal_password, assigned_rep_id) VALUES
('Acme Corp',        'portal@acmecorp.com',     '+91-9876543210', 'Acme Corp Ltd',         'GOLD',   'Mumbai',    'India', 'USD', '$2a$12$LQv3c1yqBwEHXp1ZS7q5IOgq5i6w5JvS2R9u9W1Y3X5BaK2L7uqmS', 4),
('Beta Industries',  'portal@betaind.com',      '+91-9876543211', 'Beta Industries Pvt',   'SILVER', 'Delhi',     'India', 'USD', '$2a$12$LQv3c1yqBwEHXp1ZS7q5IOgq5i6w5JvS2R9u9W1Y3X5BaK2L7uqmS', 4),
('Zenith Co',        'portal@zenithco.com',     '+91-9876543212', 'Zenith Technologies',   'GOLD',   'Bangalore', 'India', 'USD', '$2a$12$LQv3c1yqBwEHXp1ZS7q5IOgq5i6w5JvS2R9u9W1Y3X5BaK2L7uqmS', 5),
('Orion Ltd',        'portal@orionltd.com',     '+91-9876543213', 'Orion Global Ltd',      'SILVER', 'Hyderabad', 'India', 'USD', '$2a$12$LQv3c1yqBwEHXp1ZS7q5IOgq5i6w5JvS2R9u9W1Y3X5BaK2L7uqmS', 5),
('Nova Retail',      'portal@novaretail.com',   '+91-9876543214', 'Nova Retail Chain',     'BRONZE', 'Chennai',   'India', 'USD', '$2a$12$LQv3c1yqBwEHXp1ZS7q5IOgq5i6w5JvS2R9u9W1Y3X5BaK2L7uqmS', 4),
('Delta LLC',        'portal@deltallc.com',     '+91-9876543215', 'Delta Enterprises LLC', 'BRONZE', 'Pune',      'India', 'USD', '$2a$12$LQv3c1yqBwEHXp1ZS7q5IOgq5i6w5JvS2R9u9W1Y3X5BaK2L7uqmS', 5);

-- ============================================================
-- PRODUCTS
-- ============================================================

INSERT INTO products (name, sku, category_id, product_type, base_price, cost_price, unit, tax_percentage, description, is_subscription, is_promoted, min_margin_pct) VALUES
('Laptop Pro 14',        'LP14-001',  1, 'PHYSICAL',      1200.00,  750.00,  'Each',  15.00, '14-inch professional laptop, 16GB RAM, 512GB SSD',        FALSE, TRUE,  20.00),
('Onsite Setup Service', 'SRV-001',   2, 'SERVICE',        450.00,   50.00,  'Hour',  18.00, 'Professional onsite setup and configuration service',       FALSE, FALSE, 30.00),
('Docking Station',      'DS-001',    4, 'PHYSICAL',       180.00,   80.00,  'Each',  15.00, 'USB-C multi-port docking station with 4K support',         FALSE, TRUE,  25.00),
('Care Plan 2yr',        'CP2Y-001',  3, 'SUBSCRIPTION',    40.00,    5.00, 'Month', 18.00, '2-year comprehensive care and support plan',                TRUE,  TRUE,  50.00),
('Wireless Mouse',       'WM-001',    4, 'PHYSICAL',        35.00,   12.00,  'Each',  15.00, 'Ergonomic wireless optical mouse',                         FALSE, TRUE,  30.00),
('Extended Warranty',    'EW-001',    3, 'SUBSCRIPTION',    20.00,    3.00, 'Month', 18.00, '1-year hardware warranty extension plan',                   TRUE,  FALSE, 40.00),
('Cloud Backup 1TB',     'CB1T-001',  3, 'SUBSCRIPTION',    15.00,    2.00, 'Month', 18.00, '1TB cloud backup and recovery service',                    TRUE,  FALSE, 60.00),
('Monitor 27" 4K',       'MON27-001', 1, 'PHYSICAL',       650.00,  380.00,  'Each',  15.00, '27-inch 4K IPS display with USB-C',                       FALSE, FALSE, 20.00),
('Network Switch 24P',   'NS24-001',  1, 'PHYSICAL',       320.00,  180.00,  'Each',  15.00, '24-port managed gigabit network switch',                   FALSE, FALSE, 22.00),
('IT Consulting',        'ITC-001',   2, 'SERVICE',        200.00,   30.00,  'Hour',  18.00, 'Senior IT consulting and architecture advisory',            FALSE, FALSE, 40.00);

-- Set billing cycles for subscriptions
UPDATE products SET billing_cycle = 'MONTHLY' WHERE is_subscription = TRUE;

-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================

INSERT INTO product_variants (product_id, attribute_name, attribute_value, extra_price) VALUES
(1, 'RAM',          '16GB',  0),
(1, 'RAM',          '32GB',  200.00),
(1, 'Color',        'Silver', 0),
(1, 'Color',        'Black',  0),
(1, 'Manufacturer', 'Dell',   10.00),
(1, 'Manufacturer', 'HP',     0),
(3, 'Color',        'Black',  0),
(3, 'Color',        'White',  0),
(3, 'Color',        'Silver', 5.00);

-- ============================================================
-- PRICE LISTS
-- ============================================================

INSERT INTO price_lists (product_id, customer_tier, currency, price_rule, discount_pct) VALUES
(1, 'BRONZE', 'USD', 'BASE',             0),
(1, 'SILVER', 'USD', 'PERCENT_DISCOUNT', 5.00),
(1, 'GOLD',   'USD', 'PERCENT_DISCOUNT', 10.00),
(2, 'BRONZE', 'USD', 'BASE',             0),
(2, 'SILVER', 'USD', 'PERCENT_DISCOUNT', 5.00),
(2, 'GOLD',   'USD', 'PERCENT_DISCOUNT', 8.00),
(3, 'BRONZE', 'USD', 'BASE',             0),
(3, 'SILVER', 'USD', 'PERCENT_DISCOUNT', 5.00),
(3, 'GOLD',   'USD', 'PERCENT_DISCOUNT', 10.00);

-- ============================================================
-- WAREHOUSE STOCK
-- ============================================================

INSERT INTO warehouse_stock (warehouse_id, product_id, quantity, reserved, reorder_point) VALUES
-- Main Warehouse
(1, 1, 40, 0, 10),
(1, 3, 65, 0,  5),
(1, 5, 80, 0, 10),
(1, 8, 12, 0,  5),
(1, 9,  8, 0,  3),
-- East Depot
(2, 1, 18, 0, 5),
(2, 3,  6, 0, 3),
(2, 5, 30, 0, 5),
(2, 8,  6, 0, 3),
-- West Hub
(3, 1, 10, 0, 5),
(3, 3, 20, 0, 5),
(3, 5, 15, 0, 5);

-- ============================================================
-- UPSELL RULES
-- ============================================================

INSERT INTO upsell_rules (trigger_product_id, suggest_product_id, co_purchase_count, is_promoted, min_margin_pct, priority) VALUES
(1, 3, 145, TRUE,  25.00, 3),  -- Laptop → Docking Station
(1, 4, 112, TRUE,  50.00, 2),  -- Laptop → Care Plan 2yr
(1, 5, 198, FALSE, 30.00, 1),  -- Laptop → Wireless Mouse
(1, 6,  67, FALSE, 40.00, 0),  -- Laptop → Extended Warranty
(3, 5,  89, FALSE, 30.00, 1);  -- Docking Station → Wireless Mouse

-- ============================================================
-- SAMPLE QUOTATIONS (for demo purposes)
-- ============================================================

-- Q-1042 (Acme Corp - GOLD - HIGH risk - needs MANAGER + FINANCE)
INSERT INTO quotations (quote_number, customer_id, sales_rep_id, status, currency, subtotal, tax_total, discount_total, grand_total, blended_risk_score, risk_level, last_activity_at, submitted_at)
VALUES ('Q-1042', 1, 4, 'PENDING_APPROVAL', 'USD', 2450.00, 441.00, 310.00, 2581.00, 8.50, 'HIGH', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

INSERT INTO quotation_lines (quotation_id, product_id, line_type, quantity, unit_price, cost_price, discount_pct, discount_allowed, tax_pct, line_total, margin_amount, margin_pct)
VALUES
(1, 1, 'ONE_TIME',  2, 1200.00, 750.00,  12.00, 15.00, 15.00, 2112.00,  660.00, 31.25),
(1, 2, 'ONE_TIME',  1,  450.00,  50.00,  18.00, 10.00, 18.00,  369.00,  319.00, 86.45),
(1, 6, 'RECURRING', 1,   20.00,   3.00,  10.00, 15.00, 18.00,   18.00,   15.00, 83.33);

-- Q-1039 (Beta Industries - SILVER - MEDIUM risk)
INSERT INTO quotations (quote_number, customer_id, sales_rep_id, status, currency, subtotal, tax_total, discount_total, grand_total, blended_risk_score, risk_level, last_activity_at, submitted_at)
VALUES ('Q-1039', 2, 4, 'PENDING_APPROVAL', 'USD', 1800.00, 324.00, 150.00, 1974.00, 5.20, 'MEDIUM', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

INSERT INTO quotation_lines (quotation_id, product_id, line_type, quantity, unit_price, cost_price, discount_pct, discount_allowed, tax_pct, line_total, margin_amount, margin_pct)
VALUES
(2, 1, 'ONE_TIME', 1, 1200.00, 750.00, 8.00, 10.00, 15.00, 1104.00, 354.00, 32.07),
(2, 3, 'ONE_TIME', 4,  180.00,  80.00, 7.00, 10.00, 15.00,  669.60, 269.60, 40.26);

-- Q-1035 (Nova Retail - BRONZE - LOW / Auto-approved)
INSERT INTO quotations (quote_number, customer_id, sales_rep_id, status, currency, subtotal, tax_total, discount_total, grand_total, blended_risk_score, risk_level, last_activity_at, submitted_at, approved_at)
VALUES ('Q-1035', 5, 5, 'APPROVED', 'USD', 350.00, 63.00, 0.00, 413.00, 0.00, 'LOW', NOW() - INTERVAL '3 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days');

INSERT INTO quotation_lines (quotation_id, product_id, line_type, quantity, unit_price, cost_price, discount_pct, discount_allowed, tax_pct, line_total, margin_amount, margin_pct)
VALUES
(3, 5, 'ONE_TIME', 10, 35.00, 12.00, 0.00, 5.00, 15.00, 402.50, 230.00, 65.71);

-- Q-1030 (Zenith Co - GOLD - Confirmed + Backorder)
INSERT INTO quotations (quote_number, customer_id, sales_rep_id, status, currency, subtotal, tax_total, discount_total, grand_total, blended_risk_score, risk_level, last_activity_at, confirmed_at)
VALUES ('Q-1030', 3, 5, 'CONFIRMED', 'USD', 15300.00, 2754.00, 1200.00, 16854.00, 2.10, 'LOW', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days');

INSERT INTO quotation_lines (quotation_id, product_id, line_type, quantity, unit_price, cost_price, discount_pct, discount_allowed, tax_pct, line_total, margin_amount, margin_pct)
VALUES
(4, 8, 'ONE_TIME', 20, 650.00, 380.00, 7.00, 15.00, 15.00, 13923.00, 4940.00, 35.48);

-- ============================================================
-- APPROVALS
-- ============================================================

INSERT INTO approvals (quotation_id, level, status) VALUES
(1, 'MANAGER', 'PENDING'),
(1, 'FINANCE',  'PENDING'),
(2, 'MANAGER', 'PENDING');

-- ============================================================
-- APPROVAL AUDIT LOGS
-- ============================================================

INSERT INTO approval_audit_logs (quotation_id, user_id, action, notes, old_status, new_status) VALUES
(1, 4, 'SUBMITTED',  'Initial submission with 12% and 18% discounts', NULL,      'PENDING_APPROVAL'),
(1, 2, 'RETURNED',   'Requested justification for service line discount', 'PENDING_APPROVAL', 'PENDING_APPROVAL'),
(1, 4, 'RESUBMITTED','Added margin justification note', 'PENDING_APPROVAL', 'PENDING_APPROVAL');

-- ============================================================
-- FULFILLMENT ORDERS
-- ============================================================

INSERT INTO fulfillment_orders (quotation_id, status, total_shipments, total_shipping_cost)
VALUES (4, 'PARTIALLY_FULFILLED', 2, 71.00);

-- Q-1030 has 1 line; quotation_lines IDs: Q-1042(3 lines)=1,2,3; Q-1039(2)=4,5; Q-1035(1)=6; Q-1030(1)=7
INSERT INTO fulfillment_lines (fulfillment_order_id, quotation_line_id, warehouse_id, product_id, quantity_allocated, quantity_fulfilled, is_backorder, shipping_cost)
VALUES
(1, 7, 1, 8, 12, 12, FALSE, 42.00),
(1, 7, 2, 8,  6,  0, TRUE,  29.00);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================

INSERT INTO subscriptions (quotation_id, customer_id, status, billing_cycle, start_date, next_billing_date)
VALUES (1, 1, 'ACTIVE', 'MONTHLY', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month');

INSERT INTO subscription_lines (subscription_id, product_id, quantity, unit_price, discount_pct, line_total)
VALUES (1, 6, 1, 20.00, 10.00, 18.00);

-- ============================================================
-- INVOICES & PAYMENTS
-- ============================================================

INSERT INTO invoices (invoice_number, quotation_id, customer_id, status, currency, subtotal, tax_total, total_amount, amount_paid, amount_due, due_date, is_recurring)
VALUES
('INV-1042', 1, 1, 'UNPAID',  'USD', 2450.00, 441.00, 2581.00,    0.00, 2581.00, CURRENT_DATE + 10, FALSE),
('INV-1043', 1, 1, 'PAID',    'USD',   18.00,   3.24,   21.24,   21.24,    0.00, CURRENT_DATE + 15, TRUE),
('INV-1035', 3, 5, 'PAID',    'USD',  350.00,  63.00,  413.00,  413.00,    0.00, CURRENT_DATE - 5,  FALSE);

INSERT INTO payments (invoice_id, customer_id, amount, currency, method, reference, paid_at)
VALUES
(2, 1, 21.24, 'USD', 'BANK_TRANSFER', 'REF-SUB-001', NOW() - INTERVAL '1 day'),
(3, 5, 413.00, 'USD', 'ONLINE',       'REF-ORD-035', NOW() - INTERVAL '2 days');

-- ============================================================
-- DEAL HEALTH ALERTS
-- ============================================================

INSERT INTO deal_health_alerts (quotation_id, alert_type, description, flagged_at) VALUES
(2, 'STALLED_DEAL',      'Quote Q-1039 has been idle for 5 days without action', NOW() - INTERVAL '2 days'),
(4, 'DISCOUNT_ANOMALY',  'Delta LLC discount at 22% vs rep average of 8%',        NOW() - INTERVAL '1 day'),
(4, 'DELIVERY_SLIPPAGE', 'East Depot backorder may delay promise date by 3+ days', NOW());
