-- ============================================================
-- DealFlow360 - Comprehensive Indian Enterprise Seed Data (250+ Rows)
-- PostgreSQL 18 | Schema: dealflow | Currency: INR (₹)
-- ============================================================

SET search_path TO dealflow;

-- Clean existing data in reverse dependency order
TRUNCATE TABLE deal_health_alerts CASCADE;
TRUNCATE TABLE negotiation_comments CASCADE;
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE invoice_lines CASCADE;
TRUNCATE TABLE invoices CASCADE;
TRUNCATE TABLE subscription_lines CASCADE;
TRUNCATE TABLE subscriptions CASCADE;
TRUNCATE TABLE fulfillment_lines CASCADE;
TRUNCATE TABLE fulfillment_orders CASCADE;
TRUNCATE TABLE approval_audit_logs CASCADE;
TRUNCATE TABLE approvals CASCADE;
TRUNCATE TABLE approval_chains CASCADE;
TRUNCATE TABLE quotation_lines CASCADE;
TRUNCATE TABLE quotations CASCADE;
TRUNCATE TABLE warehouse_stock CASCADE;
TRUNCATE TABLE warehouses CASCADE;
TRUNCATE TABLE upsell_rules CASCADE;
TRUNCATE TABLE discount_tiers CASCADE;
TRUNCATE TABLE price_lists CASCADE;
TRUNCATE TABLE product_variants CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE product_categories CASCADE;
TRUNCATE TABLE refresh_tokens CASCADE;
TRUNCATE TABLE customers CASCADE;
TRUNCATE TABLE users CASCADE;

-- ============================================================
-- 1. USERS (8 Indian Personas)
-- Password for all: 'Password123!' (BCrypt strength 12)
-- ============================================================
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, department, phone, avatar_url) VALUES
(1, 'admin@dealflow360.com',   '$2a$12$8K1p/a0dqbQIqoQHlCTBCuKJTlC.IVH.Mg9q7N1JkZbIJwKUQvDC.', 'Aarav',   'Sharma',   'ADMIN',     TRUE, 'Revenue Operations',   '+91-9820011223', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'),
(2, 'manager@dealflow360.com', '$2a$12$8K1p/a0dqbQIqoQHlCTBCuKJTlC.IVH.Mg9q7N1JkZbIJwKUQvDC.', 'Vikram',  'Malhotra', 'MANAGER',   TRUE, 'Commercial Governance','+91-9811022334', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'),
(3, 'finance@dealflow360.com', '$2a$12$8K1p/a0dqbQIqoQHlCTBCuKJTlC.IVH.Mg9q7N1JkZbIJwKUQvDC.', 'Sneha',   'Gupta',    'FINANCE',   TRUE, 'Finance & Treasury',   '+91-9833033445', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'),
(4, 'rep1@dealflow360.com',    '$2a$12$8K1p/a0dqbQIqoQHlCTBCuKJTlC.IVH.Mg9q7N1JkZbIJwKUQvDC.', 'Priya',   'Patel',    'SALES_REP', TRUE, 'Enterprise Sales',     '+91-9844044556', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100'),
(5, 'rep2@dealflow360.com',    '$2a$12$8K1p/a0dqbQIqoQHlCTBCuKJTlC.IVH.Mg9q7N1JkZbIJwKUQvDC.', 'Rajesh',  'Kumar',    'SALES_REP', TRUE, 'Strategic Accounts',   '+91-9855055667', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'),
(6, 'rep3@dealflow360.com',    '$2a$12$8K1p/a0dqbQIqoQHlCTBCuKJTlC.IVH.Mg9q7N1JkZbIJwKUQvDC.', 'Ananya',  'Iyer',     'SALES_REP', TRUE, 'Cloud & SaaS Sales',   '+91-9866066778', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'),
(7, 'rep4@dealflow360.com',    '$2a$12$8K1p/a0dqbQIqoQHlCTBCuKJTlC.IVH.Mg9q7N1JkZbIJwKUQvDC.', 'Rohan',   'Verma',    'SALES_REP', TRUE, 'Mid-Market Solutions', '+91-9877077889', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100'),
(8, 'rep5@dealflow360.com',    '$2a$12$8K1p/a0dqbQIqoQHlCTBCuKJTlC.IVH.Mg9q7N1JkZbIJwKUQvDC.', 'Neha',    'Joshi',    'SALES_REP', TRUE, 'BFSI & Fintech Sales', '+91-9888088990', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100');

SELECT setval('users_id_seq', 8);

-- ============================================================
-- 2. CUSTOMERS (25 Indian Enterprises & Unicorns)
-- ============================================================
INSERT INTO customers (id, name, email, phone, company, tier, address_line1, city, state, country, postal_code, currency, portal_token, assigned_rep_id) VALUES
(1,  'Tata Consultancy Services', 'procurement@tcs.com',         '+91-22-67789999', 'Tata Consultancy Services Ltd',      'GOLD',   'TCS House, Raveline Street, Fort',        'Mumbai',     'Maharashtra',   'India', '400001', 'INR', 'token-tcs-1001',       4),
(2,  'Infosys Technologies',      'it-vendor@infosys.com',       '+91-80-28520261', 'Infosys Limited',                    'GOLD',   'Electronics City, Hosur Road',            'Bengaluru',  'Karnataka',     'India', '560100', 'INR', 'token-infy-1002',      4),
(3,  'Reliance Jio Infocomm',     'digital.infra@ril.com',       '+91-22-44778899', 'Reliance Jio Infocomm Ltd',          'GOLD',   'Reliance Corporate Park, Thane-Belapur Rd','Navi Mumbai','Maharashtra',   'India', '400701', 'INR', 'token-jio-1003',       5),
(4,  'Wipro Enterprise Solutions','sourcing@wipro.com',          '+91-80-46726000', 'Wipro Limited',                      'GOLD',   'Doddakannelli, Sarjapur Road',             'Bengaluru',  'Karnataka',     'India', '560035', 'INR', 'token-wipro-1004',     4),
(5,  'HCL Technologies',          'procure@hcltech.com',         '+91-120-4384000', 'HCL Technologies Ltd',               'GOLD',   'Technology Hub, Plot No 3A, Sector 126',   'Noida',      'Uttar Pradesh', 'India', '201301', 'INR', 'token-hcl-1005',       6),
(6,  'Bharti Airtel Enterprise',  'network.buying@airtel.in',    '+91-124-4222222', 'Bharti Airtel Ltd',                  'GOLD',   'Airtel Centre, Plot 16, Udyog Vihar IV',   'Gurugram',   'Haryana',       'India', '122002', 'INR', 'token-airtel-1006',    5),
(7,  'ICICI Bank & Infotech',     'vendor.tech@icicibank.com',   '+91-22-26531414', 'ICICI Bank Limited',                 'GOLD',   'ICICI Bank Towers, Bandra-Kurla Complex',  'Mumbai',     'Maharashtra',   'India', '400051', 'INR', 'token-icici-1007',     8),
(8,  'Larsen & Toubro Digital',   'corp.tech@larsentoubro.com',  '+91-22-67525656', 'Larsen & Toubro Ltd',                'GOLD',   'L&T House, Ballard Estate',                'Mumbai',     'Maharashtra',   'India', '400001', 'INR', 'token-lt-1008',        5),
(9,  'Mahindra & Mahindra Tech',  'procurement@mahindra.com',    '+91-20-66042000', 'Mahindra & Mahindra Ltd',            'SILVER', 'Mahindra Towers, Pimpri',                 'Pune',       'Maharashtra',   'India', '411018', 'INR', 'token-mahindra-1009',  7),
(10, 'Flipkart Commerce',         'infra.tech@flipkart.com',     '+91-80-49400000', 'Flipkart Internet Pvt Ltd',          'GOLD',   'Embassy Tech Village, Outer Ring Road',    'Bengaluru',  'Karnataka',     'India', '560103', 'INR', 'token-flipkart-1010',  4),
(11, 'Swiggy Tech Operations',    'vendor.support@swiggy.in',    '+91-80-67451000', 'Bundl Technologies Pvt Ltd',         'SILVER', 'IBC Knowledge Park, Bannerghatta Road',   'Bengaluru',  'Karnataka',     'India', '560029', 'INR', 'token-swiggy-1011',    6),
(12, 'Zomato Media & Systems',    'it-sourcing@zomato.com',      '+91-124-4157777', 'Zomato Limited',                     'SILVER', 'Pioneer Square, Golf Course Extension Rd', 'Gurugram',   'Haryana',       'India', '122001', 'INR', 'token-zomato-1012',    7),
(13, 'Razorpay Software',         'it-infra@razorpay.com',       '+91-80-46669555', 'Razorpay Software Pvt Ltd',          'GOLD',   'SJR Cyber, Hosur Road, Koramangala',       'Bengaluru',  'Karnataka',     'India', '560030', 'INR', 'token-razorpay-1013',  8),
(14, 'Zerodha Broking',           'security.ops@zerodha.com',    '+91-80-40402020', 'Zerodha Broking Ltd',                'GOLD',   '153/154 4th Cross, Dollars Colony',       'Bengaluru',  'Karnataka',     'India', '560078', 'INR', 'token-zerodha-1014',   8),
(15, 'Zoho Corporation',          'commercials@zohocorp.com',    '+91-44-67447070', 'Zoho Corporation Pvt Ltd',           'GOLD',   'Estancia IT Park, GST Road, Vallancherry', 'Chennai',    'Tamil Nadu',    'India', '603202', 'INR', 'token-zoho-1015',      6),
(16, 'Freshworks India',          'procure.in@freshworks.com',   '+91-44-66678000', 'Freshworks Technologies Pvt Ltd',    'SILVER', 'Global Infocity Park, Kandanchavadi',     'Chennai',    'Tamil Nadu',    'India', '600096', 'INR', 'token-fresh-1016',     6),
(17, 'Paytm Payments Services',   'cloud.buying@paytm.com',      '+91-120-4770770', 'One97 Communications Ltd',           'SILVER', 'Skymark One, Sector 98',                  'Noida',      'Uttar Pradesh', 'India', '201301', 'INR', 'token-paytm-1017',     8),
(18, 'Ola Electric & Mobility',   'it.procure@olacabs.com',      '+91-80-33553355', 'ANI Technologies Pvt Ltd',           'SILVER', 'Regent Insignia, Koramangala 4th Block',  'Bengaluru',  'Karnataka',     'India', '560008', 'INR', 'token-ola-1018',       7),
(19, 'Delhivery Logistics Tech',  'enterprise.it@delhivery.com', '+91-124-6719500', 'Delhivery Limited',                  'SILVER', 'Plot 5, Sector 44',                       'Gurugram',   'Haryana',       'India', '122016', 'INR', 'token-delhivery-1019', 5),
(20, 'Nykaa E-Retail',            'vendor.mgmt@nykaa.com',       '+91-22-66149696', 'FSN E-Commerce Ventures Ltd',        'BRONZE', '104, Vasan Udyog Bhavan, Lower Parel',    'Mumbai',     'Maharashtra',   'India', '400013', 'INR', 'token-nykaa-1020',     7),
(21, 'BigBasket Tech Solutions',  'it.purchasing@bigbasket.com', '+91-80-61906000', 'Supermarket Grocery Supplies Pvt Ltd','BRONZE', 'Shree Rama Chambers, Domlur 2nd Stage',   'Bengaluru',  'Karnataka',     'India', '560068', 'INR', 'token-bb-1021',        7),
(22, 'PhonePe Payments India',    'sourcing@phonepe.com',        '+91-80-68727000', 'PhonePe Private Limited',            'GOLD',   'Office-2, Floor 4, Wing A, Block A, Bagmane','Bengaluru','Karnataka',     'India', '560034', 'INR', 'token-phonepe-1022',   8),
(23, 'Cred Financial Solutions',  'security.it@cred.club',       '+91-80-45678900', 'Dreamplug Technologies Pvt Ltd',     'SILVER', '10/1, 2nd Floor, Subbarama Chetty Road',   'Bengaluru',  'Karnataka',     'India', '560001', 'INR', 'token-cred-1023',      8),
(24, 'InMobi Global AdTech',      'procure@inmobi.com',          '+91-80-40084500', 'InMobi Technology Services Pvt Ltd', 'SILVER', 'Block Delta, Embassy Tech Square',        'Bengaluru',  'Karnataka',     'India', '560008', 'INR', 'token-inmobi-1024',    6),
(25, 'Postman Labs India',        'it.systems@postman.com',      '+91-80-67890123', 'Postdot Technologies Pvt Ltd',       'GOLD',   '9th Floor, RMZ Infinity, Old Madras Road', 'Bengaluru',  'Karnataka',     'India', '560095', 'INR', 'token-postman-1025',   6);

SELECT setval('customers_id_seq', 25);

-- ============================================================
-- 3. PRODUCT CATEGORIES (7 Core IT & Enterprise Domains)
-- ============================================================
INSERT INTO product_categories (id, name, description, max_discount) VALUES
(1, 'Enterprise Computing & Hardware', 'High performance servers, developer workstations, laptops & peripherals', 15.00),
(2, 'Cloud Hosting & Virtual Compute',  'Dedicated cloud VMs, auto-scaling clusters, GPU compute & storage',        25.00),
(3, 'Enterprise SaaS & Licenses',       'Productivity suites, developer tools, database subscriptions & ERP seats',  30.00),
(4, 'Cybersecurity & SOC Compliance',   'Next-Gen firewalls, endpoint EDR, zero-trust gateways & SIEM platforms',  20.00),
(5, 'Networking & Telecom Infra',       'Core switches, SD-WAN routers, optical interconnects & Wi-Fi 7 APs',       18.00),
(6, 'Managed IT & 24/7 SLA Support',    'Dedicated DevOps engineering, on-site DBA support & 24/7 SLA contracts',   22.00),
(7, 'AI & Enterprise Analytics',        'Large language model inference clusters, vector databases & MLOps pipelines',25.00);

SELECT setval('product_categories_id_seq', 7);

-- ============================================================
-- 4. PRODUCTS (25 IT & Enterprise Solutions with realistic INR ₹ prices)
-- ============================================================
INSERT INTO products (id, name, sku, category_id, product_type, base_price, cost_price, unit, tax_percentage, is_subscription, billing_cycle, is_promoted, min_margin_pct, quantity_on_hand, description) VALUES
-- Hardware (Category 1)
(1,  'Dell PowerEdge R760 Rack Server',   'SRV-DELL-R760',   1, 'PHYSICAL',     485000.00, 365000.00, 'Unit', 18.00, FALSE, NULL,      TRUE,  20.00, 45,  'Dual Intel Xeon Silver 4410Y, 128GB DDR5 RAM, 4x 1.92TB NVMe SSD'),
(2,  'ThinkPad X1 Carbon Gen 12 (i7/32GB)','LAP-THINK-X1G12', 1, 'PHYSICAL',     158000.00, 118000.00, 'Unit', 18.00, FALSE, NULL,      TRUE,  20.00, 120, 'Intel Core Ultra 7 155H, 32GB LPDDR5x, 1TB NVMe, 2.8K OLED Display'),
(3,  'MacBook Pro 16" (M3 Max / 64GB)',   'LAP-APPLE-MBP16', 1, 'PHYSICAL',     349900.00, 275000.00, 'Unit', 18.00, FALSE, NULL,      FALSE, 18.00, 60,  'Apple M3 Max (16-core CPU, 40-core GPU), 64GB Unified RAM, 1TB SSD'),
(4,  'Thunderbolt 4 Quad-Display Dock',   'ACC-TB4-DOCK',    1, 'PHYSICAL',      24500.00,  16500.00, 'Unit', 18.00, FALSE, NULL,      FALSE, 25.00, 250, '100W Power Delivery, Dual 4K@60Hz / Single 8K, Gigabit Ethernet'),
(5,  '3-Year On-Site Hardware Extended SLA','WAR-HW-3Y-ONSITE',1, 'SERVICE',      32000.00,  14000.00, 'Contract',18.00,FALSE, NULL,     TRUE,  45.00, 999, '24x7 4-Hour Response On-site Comprehensive Component Replacement'),

-- Cloud Hosting (Category 2)
(6,  'Dedicated Kubernetes Node Pool (16vCPU/64GB)','CLD-K8S-NODE-01',2,'SUBSCRIPTION',38500.00, 22000.00, 'Node/Month',18.00,TRUE,'MONTHLY',TRUE, 35.00, 500, 'Managed Kubernetes worker node with 500GB NVMe storage and 10Gbps uplink'),
(7,  'High-IOPS Managed PostgreSQL Cluster','CLD-DB-PG-HA',   2, 'SUBSCRIPTION',  54000.00, 31000.00, 'Instance/Mo',18.00,TRUE,'MONTHLY',FALSE, 35.00, 200, 'Multi-AZ High Availability PostgreSQL 16 cluster with automated daily backup'),
(8,  'Enterprise S3-Compatible Object Store (10TB)','CLD-STOR-S3-10TB',2,'SUBSCRIPTION',18000.00,  9500.00, 'Pack/Month',18.00,TRUE,'MONTHLY',FALSE, 40.00, 999, 'Encrypted geo-distributed hot object storage with 99.999999999% durability'),

-- SaaS & Licenses (Category 3)
(9,  'Microsoft 365 E5 Enterprise License','LIC-MS365-E5',    3, 'SUBSCRIPTION',   4200.00,   3100.00, 'User/Month',18.00,TRUE,'MONTHLY',TRUE,  22.00, 5000,'Advanced security, compliance, analytics, Voice and Office desktop apps'),
(10, 'Enterprise ERP Suite Platform License','LIC-ERP-ENT-Y',  3, 'SUBSCRIPTION', 450000.00, 225000.00, 'Yearly/Org',18.00,TRUE,'YEARLY', FALSE, 45.00, 100, 'Core Financials, Supply Chain, Multi-Warehouse Operations and CRM suite'),
(11, 'Developer Productivity Suite (50 Seats)','LIC-DEV-SEAT-50',3,'SUBSCRIPTION', 65000.00,  38000.00, 'Pack/Month',18.00,TRUE,'MONTHLY',FALSE, 35.00, 300, 'AI Code Completion, CI/CD Cloud Runners, and Cloud Dev Environments'),

-- Cybersecurity (Category 4)
(12, 'Fortinet FortiGate 200F NGFW Appliance','SEC-FORTI-200F',4, 'PHYSICAL',     380000.00, 280000.00, 'Appliance',18.00,FALSE, NULL,   TRUE,  22.00, 35,  'Enterprise Firewall: 27 Gbps throughput, 3 Gbps Threat Protection with IPS'),
(13, '24x7 Managed SOC Monitoring Service','SEC-SOC-247-M',   4, 'SUBSCRIPTION',  95000.00,  48000.00, 'Month', 18.00, TRUE, 'MONTHLY',TRUE,  45.00, 999, 'Continuous SIEM log monitoring, threat hunting, and incident response SLA'),
(14, 'Zero-Trust Endpoint EDR (100 Endpoints)','SEC-EDR-100EP', 4, 'SUBSCRIPTION', 28000.00,  14000.00, 'Pack/Month',18.00,TRUE,'MONTHLY',FALSE, 45.00, 500, 'AI-driven Endpoint Detection, isolation, and automated malware rollback'),

-- Networking (Category 5)
(15, 'Cisco Catalyst 9300 48-Port PoE+ Switch','NET-CISCO-9300',5, 'PHYSICAL',     295000.00, 215000.00, 'Unit', 18.00, FALSE, NULL,     FALSE, 22.00, 50,  'Layer 3 Enterprise stackable switch, 48x 1G PoE+ ports, 4x 10G SFP+ uplinks'),
(16, 'Aruba Wi-Fi 7 Enterprise Access Point','NET-ARUBA-AP7',  5, 'PHYSICAL',      48000.00,  33000.00, 'Unit', 18.00, FALSE, NULL,     TRUE,  25.00, 180, 'Tri-band 802.11be Wi-Fi 7, up to 18.7 Gbps aggregate speed, IoT BLE/Zigbee'),

-- Managed Services & SLA (Category 6)
(17, 'Enterprise Cloud Migration & Setup Pack','SRV-MIGRATE-ENT',6,'SERVICE',     450000.00, 220000.00, 'One-Time',18.00,FALSE, NULL,     TRUE,  45.00, 999, 'End-to-end database, application re-platforming and zero-downtime cutover'),
(18, 'Dedicated Senior DevOps Engineer SLA','SRV-DEVOPS-FTE', 6, 'SUBSCRIPTION', 185000.00, 110000.00, 'Month', 18.00, TRUE, 'MONTHLY',FALSE, 38.00, 50,  '160 hours dedicated monthly DevOps support, CI/CD automation & infra optimization'),
(19, 'Database Performance Tuning & Audit','SRV-DB-AUDIT',    6, 'SERVICE',      125000.00,  55000.00, 'Audit', 18.00, FALSE, NULL,    FALSE, 50.00, 999, 'Comprehensive query indexing, connection pool tuning, and failover drills'),

-- AI & Analytics (Category 7)
(20, 'Enterprise AI Copilot Inference Node (H100)','AI-GPU-H100-NODE',7,'SUBSCRIPTION',280000.00,165000.00,'Node/Month',18.00,TRUE,'MONTHLY',TRUE,38.00,25,'Dedicated NVIDIA H100 80GB GPU server for enterprise LLM hosting & fine-tuning'),
(21, 'Vector Database & Semantic Search Cluster','AI-VECTOR-DB',  7, 'SUBSCRIPTION', 62000.00,  32000.00, 'Cluster/Mo',18.00,TRUE,'MONTHLY',FALSE,42.00,80, 'Low-latency distributed vector index for enterprise RAG and semantic retrieval'),
(22, 'Enterprise Data Lakehouse Platform Seat','AI-LAKEHOUSE-SEAT',7,'SUBSCRIPTION',  8500.00,   4500.00, 'User/Month',18.00,TRUE,'MONTHLY',FALSE,40.00,400,'Unified SQL analytics, ML pipelines, and real-time dashboarding licenses'),

-- Additional Accessories & Addons
(23, 'Smart UPS 3000VA Online Rackmount', 'ACC-UPS-3KVA',    1, 'PHYSICAL',     115000.00,  82000.00, 'Unit', 18.00, FALSE, NULL,     FALSE, 22.00, 40,  'Double-conversion pure sine wave UPS with network management card'),
(24, 'Logitech Rally Plus 4K VC System',  'ACC-VC-RALLY',    1, 'PHYSICAL',     185000.00, 135000.00, 'Unit', 18.00, FALSE, NULL,     TRUE,  24.00, 30,  'Ultra-HD conference room system with dual speakers and modular mic pods'),
(25, 'Enterprise Single Sign-On (SSO) Pack','LIC-SSO-ENT',   3, 'SUBSCRIPTION',  15000.00,   6000.00, 'Month', 18.00, TRUE, 'MONTHLY',FALSE, 55.00, 999, 'SAML/OIDC Multi-Factor Authentication, conditional access and device trust');

SELECT setval('products_id_seq', 25);

-- ============================================================
-- 5. PRODUCT VARIANTS (18 Variants)
-- ============================================================
INSERT INTO product_variants (id, product_id, attribute_name, attribute_value, extra_price, sku_suffix) VALUES
(1,  1, 'Configuration', '128GB RAM / 4x 1.92TB NVMe',      0.00, 'STD'),
(2,  1, 'Configuration', '256GB RAM / 8x 3.84TB NVMe', 220000.00, 'MAX'),
(3,  2, 'RAM / Storage', 'Core Ultra 7 / 32GB / 1TB SSD',     0.00, '32GB'),
(4,  2, 'RAM / Storage', 'Core Ultra 7 / 64GB / 2TB SSD',  35000.00, '64GB'),
(5,  3, 'RAM / Storage', 'M3 Max 16C / 64GB / 1TB SSD',     0.00, '64GB'),
(6,  3, 'RAM / Storage', 'M3 Max 16C / 128GB / 2TB SSD',  80000.00, '128GB'),
(7,  6, 'Node Profile',  'General Purpose K8s Node',          0.00, 'GEN'),
(8,  6, 'Node Profile',  'Compute-Optimized K8s Node',     9500.00, 'COMP'),
(9,  9, 'Commitment',    'Microsoft 365 E5 Annual Commit', -350.00, 'ANN'),
(10, 9, 'Commitment',    'Microsoft 365 E5 Monthly Flex',      0.00, 'MO'),
(11, 12,'Appliance Pack','FortiGate 200F Base Appliance',     0.00, 'BASE'),
(12, 12,'Appliance Pack','FortiGate 200F + 3Y Unified UTM',165000.00,'UTM3Y'),
(13, 15,'Power Variant', 'Cisco 9300 48P Data Only',      -25000.00, 'DATA'),
(14, 15,'Power Variant', 'Cisco 9300 48P Full PoE+ 715W',      0.00, 'POE'),
(15, 20,'GPU Accelerator','1x NVIDIA H100 80GB SXM5',          0.00, '1X'),
(16, 20,'GPU Accelerator','2x NVIDIA H100 NVLink 160GB',   240000.00,'2X'),
(17, 23,'Battery Pack',  '3kVA Rackmount Standard Battery',    0.00, 'STD'),
(18, 23,'Battery Pack',  '3kVA + External Extended Pack',  45000.00, 'EXT');

SELECT setval('product_variants_id_seq', 18);

-- ============================================================
-- 6. PRICE LISTS (Tiered pricing matrices in INR ₹)
-- ============================================================
INSERT INTO price_lists (id, product_id, customer_tier, currency, price_rule, fixed_price, discount_pct) VALUES
(1,  1, 'BRONZE', 'INR', 'PERCENT_DISCOUNT', NULL,  0.00),
(2,  1, 'SILVER', 'INR', 'PERCENT_DISCOUNT', NULL,  5.00),
(3,  1, 'GOLD',   'INR', 'PERCENT_DISCOUNT', NULL, 10.00),
(4,  2, 'BRONZE', 'INR', 'PERCENT_DISCOUNT', NULL,  0.00),
(5,  2, 'SILVER', 'INR', 'PERCENT_DISCOUNT', NULL,  6.00),
(6,  2, 'GOLD',   'INR', 'PERCENT_DISCOUNT', NULL, 12.00),
(7,  3, 'BRONZE', 'INR', 'PERCENT_DISCOUNT', NULL,  0.00),
(8,  3, 'SILVER', 'INR', 'PERCENT_DISCOUNT', NULL,  4.00),
(9,  3, 'GOLD',   'INR', 'PERCENT_DISCOUNT', NULL,  8.00),
(10, 6, 'BRONZE', 'INR', 'PERCENT_DISCOUNT', NULL,  0.00),
(11, 6, 'SILVER', 'INR', 'PERCENT_DISCOUNT', NULL,  8.00),
(12, 6, 'GOLD',   'INR', 'PERCENT_DISCOUNT', NULL, 15.00),
(13, 9, 'BRONZE', 'INR', 'PERCENT_DISCOUNT', NULL,  0.00),
(14, 9, 'SILVER', 'INR', 'PERCENT_DISCOUNT', NULL,  5.00),
(15, 9, 'GOLD',   'INR', 'PERCENT_DISCOUNT', NULL, 12.00),
(16, 12,'BRONZE', 'INR', 'PERCENT_DISCOUNT', NULL,  0.00),
(17, 12,'SILVER', 'INR', 'PERCENT_DISCOUNT', NULL,  6.00),
(18, 12,'GOLD',   'INR', 'PERCENT_DISCOUNT', NULL, 12.00),
(19, 13,'BRONZE', 'INR', 'PERCENT_DISCOUNT', NULL,  0.00),
(20, 13,'SILVER', 'INR', 'PERCENT_DISCOUNT', NULL, 10.00),
(21, 13,'GOLD',   'INR', 'PERCENT_DISCOUNT', NULL, 18.00),
(22, 20,'BRONZE', 'INR', 'PERCENT_DISCOUNT', NULL,  0.00),
(23, 20,'SILVER', 'INR', 'PERCENT_DISCOUNT', NULL,  8.00),
(24, 20,'GOLD',   'INR', 'PERCENT_DISCOUNT', NULL, 15.00);

SELECT setval('price_lists_id_seq', 24);

-- ============================================================
-- 7. DISCOUNT TIERS (Tier ceilings)
-- ============================================================
INSERT INTO discount_tiers (id, tier, max_discount, description) VALUES
(1, 'BRONZE', 10.00, 'Standard Bronze tier discount cap (Self-approval up to 10%)'),
(2, 'SILVER', 15.00, 'Silver tier volume partner cap (Self-approval up to 15%)'),
(3, 'GOLD',   20.00, 'Strategic Enterprise Gold partner cap (Self-approval up to 20%)');

SELECT setval('discount_tiers_id_seq', 3);

-- ============================================================
-- 8. APPROVAL CHAINS (Escalation Matrix)
-- ============================================================
INSERT INTO approval_chains (id, name, discount_from, discount_to, required_level, description) VALUES
(1, 'Standard Sales Self-Approve',  0.00,  10.00, 'MANAGER', 'Standard commercial deals within rep threshold'),
(2, 'Manager Governance Approval',  10.01, 20.00, 'MANAGER', 'Discounts exceeding standard rep limits'),
(3, 'Executive Finance Sign-off',   20.01, 50.00, 'FINANCE', 'High-discount or negative margin deals requiring CFO clearance');

SELECT setval('approval_chains_id_seq', 3);

-- ============================================================
-- 9. WAREHOUSES (6 Strategic Indian Regional Hubs)
-- ============================================================
INSERT INTO warehouses (id, name, code, address, city, country, shipping_cost_weight) VALUES
(1, 'Mumbai West Logistics Hub',     'WH-MUM-01', 'Bhiwandi Industrial Park, Mumbai',        'Mumbai',     'India', 1.0),
(2, 'Bengaluru Central Tech Depot',  'WH-BLR-01', 'Electronic City Phase 2, Bengaluru',     'Bengaluru',  'India', 0.9),
(3, 'Delhi-NCR Mega Distribution',   'WH-DEL-01', 'IMT Manesar Logistics Park, Gurugram',    'Gurugram',   'India', 1.1),
(4, 'Hyderabad Tech Logistics Center','WH-HYD-01', 'HITEC City Industrial Hub, Hyderabad',   'Hyderabad',  'India', 0.95),
(5, 'Chennai Harbor Depot',          'WH-MAA-01', 'Sriperumbudur Auto-Tech Corridor, Chennai','Chennai',    'India', 1.0),
(6, 'Pune Regional Fulfillment Node','WH-PUN-01', 'Chakan Industrial Zone, Pune',             'Pune',       'India', 0.95);

SELECT setval('warehouses_id_seq', 6);

-- ============================================================
-- 10. WAREHOUSE STOCK (31 Stock Allocations)
-- ============================================================
INSERT INTO warehouse_stock (id, warehouse_id, product_id, quantity, reserved, reorder_point) VALUES
-- Mumbai Hub (WH-MUM-01)
(1,  1, 1,  20, 4,  5),  -- Dell Server
(2,  1, 2,  45, 10, 10), -- ThinkPad
(3,  1, 3,  25, 5,  5),  -- MacBook Pro
(4,  1, 4, 100, 20, 20), -- Dock
(5,  1, 12, 15, 2,  5),  -- FortiGate
(6,  1, 15, 20, 4,  5),  -- Cisco Switch
-- Bengaluru Depot (WH-BLR-01)
(7,  2, 1,  15, 2,  5),
(8,  2, 2,  50, 15, 15),
(9,  2, 3,  25, 8,  5),
(10, 2, 4,  90, 15, 20),
(11, 2, 15, 18, 3,  5),
(12, 2, 16, 80, 12, 15),
-- Delhi-NCR Hub (WH-DEL-01)
(13, 3, 1,  10, 1,  5),
(14, 3, 2,  25, 5,  10),
(15, 3, 3,  10, 2,  5),
(16, 3, 4,  60, 10, 15),
(17, 3, 12, 12, 1,  5),
(18, 3, 23, 20, 4,  5),
-- Hyderabad Depot (WH-HYD-01)
(19, 4, 2,  15, 3,  5),
(20, 4, 4,  30, 5,  10),
(21, 4, 15, 12, 2,  5),
(22, 4, 16, 45, 6,  10),
(23, 4, 24, 15, 2,  5),
-- Chennai Depot (WH-MAA-01)
(24, 5, 2,  10, 2,  5),
(25, 5, 4,  25, 4,  10),
(26, 5, 12,  8, 1,  5),
(27, 5, 16, 35, 5,  10),
-- Pune Hub (WH-PUN-01)
(28, 6, 1,   5, 0,  2),
(29, 6, 2,  15, 2,  5),
(30, 6, 4,  20, 2,  5),
(31, 6, 23, 10, 1,  2);

SELECT setval('warehouse_stock_id_seq', 31);

-- ============================================================
-- 11. UPSELL RULES (12 Intelligent cross-sell rules)
-- ============================================================
INSERT INTO upsell_rules (id, trigger_product_id, suggest_product_id, co_purchase_count, is_promoted, min_margin_pct, priority) VALUES
(1,  1,  5,  45, TRUE,  40.00, 1), -- Server -> 3Y Onsite SLA
(2,  1,  23, 28, FALSE, 20.00, 2), -- Server -> 3kVA UPS
(3,  2,  4,  95, TRUE,  25.00, 1), -- ThinkPad -> TB4 Dock
(4,  2,  5,  60, TRUE,  40.00, 2), -- ThinkPad -> 3Y Onsite SLA
(5,  3,  4,  50, TRUE,  25.00, 1), -- MacBook Pro -> TB4 Dock
(6,  6,  7,  35, TRUE,  30.00, 1), -- K8s Node Pool -> High-IOPS PostgreSQL
(7,  6,  13, 22, TRUE,  40.00, 2), -- K8s Node Pool -> 24x7 SOC Monitoring
(8,  9,  25, 40, FALSE, 45.00, 1), -- M365 E5 -> Enterprise SSO
(9,  12, 13, 30, TRUE,  40.00, 1), -- FortiGate NGFW -> 24x7 SOC Monitoring
(10, 15, 16, 25, FALSE, 20.00, 1), -- Cisco Switch -> Aruba Wi-Fi 7 AP
(11, 20, 21, 18, TRUE,  35.00, 1), -- H100 AI Node -> Vector Database Cluster
(12, 10, 17, 15, TRUE,  40.00, 1); -- ERP Suite -> Cloud Migration Pack

SELECT setval('upsell_rules_id_seq', 12);

-- ============================================================
-- 12. QUOTATIONS (10 Realistic Enterprise Quotations in INR ₹)
-- ============================================================
INSERT INTO quotations (id, quote_number, customer_id, sales_rep_id, status, currency, subtotal, discount_total, tax_total, grand_total, blended_risk_score, risk_level, notes, portal_token, confirmed_at, created_at, last_activity_at) VALUES
-- Quote 1: TCS (High Value Hybrid Deal - Approved)
(1, 'Q-2026-101', 1, 4, 'APPROVED', 'INR', 4250000.00, 425000.00, 688500.00, 4513500.00, 22.50, 'LOW', 'Annual Cloud infra upgrade & ThinkPad fleet for Bangalore ODC', 'token-quote-tcs-101', NULL, NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 day'),

-- Quote 2: Infosys (Pending Level 2 Finance Approval - High Discount)
(2, 'Q-2026-102', 2, 4, 'PENDING_APPROVAL', 'INR', 8900000.00, 1780000.00, 1281600.00, 8401600.00, 78.40, 'HIGH', 'Requesting 20% flat discount on Dell PowerEdge Server Farm', 'token-quote-infy-102', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

-- Quote 3: Reliance Jio (Confirmed - Under Fulfillment)
(3, 'Q-2026-103', 3, 5, 'CONFIRMED', 'INR', 12500000.00, 1250000.00, 2025000.00, 13275000.00, 18.20, 'LOW', 'Core 5G Network expansion FortiGate & Cisco deployment', 'token-quote-jio-103', NOW() - INTERVAL '3 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '3 days'),

-- Quote 4: Flipkart (Negotiation Stage via Portal)
(4, 'Q-2026-104', 10, 4, 'NEGOTIATION', 'INR', 3450000.00, 345000.00, 558900.00, 3663900.00, 35.80, 'MEDIUM', 'Big Billion Day DevOps scaling and K8s node capacity', 'token-quote-flipkart-104', NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '6 hours'),

-- Quote 5: Razorpay (Pending Manager Approval)
(5, 'Q-2026-105', 13, 8, 'PENDING_APPROVAL', 'INR', 1850000.00, 277500.00, 283050.00, 1855550.00, 48.20, 'MEDIUM', 'Fintech compliance SOC monitoring + EDR 500 endpoints', 'token-quote-razorpay-105', NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- Quote 6: Wipro (Draft in Progress)
(6, 'Q-2026-106', 4, 4, 'DRAFT', 'INR', 980000.00, 49000.00, 167580.00, 1098580.00, 12.00, 'LOW', 'Draft hardware refresh for Cyber Park Chennai team', 'token-quote-wipro-106', NULL, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),

-- Quote 7: Swiggy (Fulfilled Order)
(7, 'Q-2026-107', 11, 6, 'FULFILLED', 'INR', 2150000.00, 215000.00, 348300.00, 2283300.00, 15.00, 'LOW', 'Cloud migration support pack + M365 E5 deployment', 'token-quote-swiggy-107', NOW() - INTERVAL '12 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '10 days'),

-- Quote 8: Zerodha (Approved & Pending Order Confirmation)
(8, 'Q-2026-108', 14, 8, 'APPROVED', 'INR', 5600000.00, 448000.00, 927360.00, 6079360.00, 24.50, 'LOW', 'Ultra-low latency GPU cluster for Algorithmic Trading research', 'token-quote-zerodha-108', NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),

-- Quote 9: Zoho (Stalled Deal in Negotiation)
(9, 'Q-2026-109', 15, 6, 'NEGOTIATION', 'INR', 1650000.00, 165000.00, 267300.00, 1752300.00, 32.00, 'MEDIUM', 'Aruba Wi-Fi 7 upgrade across Tenkasi and Chennai Campuses', 'token-quote-zoho-109', NULL, NOW() - INTERVAL '14 days', NOW() - INTERVAL '10 days'),

-- Quote 10: ICICI Bank (Rejected - Margin Below Floor)
(10, 'Q-2026-110', 7, 8, 'REJECTED', 'INR', 7200000.00, 2160000.00, 907200.00, 5947200.00, 92.50, 'HIGH', 'Requested 30% discount on security appliance violating bank margin floor', 'token-quote-icici-110', NULL, NOW() - INTERVAL '6 days', NOW() - INTERVAL '4 days');

SELECT setval('quotations_id_seq', 10);

-- ============================================================
-- 13. QUOTATION LINES (28 Hybrid Line Items mixing One-Time and Recurring)
-- ============================================================
INSERT INTO quotation_lines (id, quotation_id, product_id, variant_id, description, line_type, quantity, unit_price, cost_price, discount_pct, discount_allowed, tax_pct, line_total, margin_amount, margin_pct, billing_cycle, is_upsell, sort_order) VALUES
-- Quote 1 (TCS - Approved)
(1,  1, 2,  3,    'ThinkPad X1 Carbon Gen 12 (Core Ultra 7 / 32GB)', 'ONE_TIME',  20, 158000.00, 118000.00, 10.00, 15.00, 18.00, 2844000.00, 484000.00, 20.50, NULL,      FALSE, 1),
(2,  1, 4,  NULL, 'Thunderbolt 4 Quad-Display Docking Station',      'ONE_TIME',  20,  24500.00,  16500.00, 15.00, 25.00, 18.00,  416500.00,  86500.00, 26.20, NULL,      TRUE,  2),
(3,  1, 6,  7,    'Dedicated Kubernetes Node Pool (16vCPU/64GB)',     'RECURRING', 20,  38500.00,  22000.00, 10.00, 25.00, 18.00,  693000.00, 253000.00, 36.50, 'MONTHLY', FALSE, 3),
(4,  1, 5,  NULL, '3-Year On-Site Hardware Extended SLA',             'ONE_TIME',  20,  32000.00,  14000.00, 12.00, 22.00, 18.00,  563200.00, 283200.00, 50.30, NULL,      TRUE,  4),

-- Quote 2 (Infosys - High Discount Server Deal)
(5,  2, 1,  2,    'Dell PowerEdge R760 Server (256GB / 8x 3.84TB)',  'ONE_TIME',  10, 705000.00, 585000.00, 20.00, 15.00, 18.00, 5640000.00,-210000.00, -3.70, NULL,      FALSE, 1),
(6,  2, 15, 14,   'Cisco Catalyst 9300 48-Port Full PoE+ 715W',       'ONE_TIME',  10, 295000.00, 215000.00, 20.00, 18.00, 18.00, 2360000.00, 210000.00,  9.80, NULL,      FALSE, 2),
(7,  2, 5,  NULL, '3-Year On-Site Hardware Extended SLA',             'ONE_TIME',  10,  32000.00,  14000.00, 25.00, 22.00, 18.00,  240000.00, 100000.00, 41.70, NULL,      TRUE,  3),

-- Quote 3 (Reliance Jio - Confirmed)
(8,  3, 12, 12,   'Fortinet FortiGate 200F NGFW + 3Y UTM Bundle',     'ONE_TIME',  15, 545000.00, 280000.00, 10.00, 20.00, 18.00, 7357500.00,3157500.00, 42.90, NULL,      FALSE, 1),
(9,  3, 15, 14,   'Cisco Catalyst 9300 48-Port Full PoE+ 715W',       'ONE_TIME',  15, 295000.00, 215000.00, 10.00, 18.00, 18.00, 3982500.00, 757500.00, 19.00, NULL,      FALSE, 2),
(10, 3, 13, NULL, '24x7 Managed SOC Monitoring Service',              'RECURRING', 12,  95000.00,  48000.00, 10.00, 22.00, 18.00, 1026000.00, 450000.00, 43.90, 'MONTHLY', TRUE,  3),

-- Quote 4 (Flipkart - Negotiation)
(11, 4, 6,  8,    'Compute-Optimized K8s Node Pool (16vCPU/64GB)',    'RECURRING', 50,  48000.00,  22000.00, 10.00, 25.00, 18.00, 2160000.00,1060000.00, 49.10, 'MONTHLY', FALSE, 1),
(12, 4, 7,  NULL, 'High-IOPS Managed PostgreSQL Cluster',             'RECURRING', 15,  54000.00,  31000.00, 10.00, 25.00, 18.00,  729000.00, 264000.00, 36.20, 'MONTHLY', TRUE,  2),
(13, 4, 18, NULL, 'Dedicated Senior DevOps Engineer SLA',             'RECURRING',  3, 185000.00, 110000.00, 10.00, 22.00, 18.00,  499500.00, 169500.00, 33.90, 'MONTHLY', FALSE, 3),

-- Quote 5 (Razorpay - Pending Approval)
(14, 5, 13, NULL, '24x7 Managed SOC Monitoring Service',              'RECURRING', 12,  95000.00,  48000.00, 15.00, 20.00, 18.00,  969000.00, 393000.00, 40.60, 'MONTHLY', FALSE, 1),
(15, 5, 14, NULL, 'Zero-Trust Endpoint EDR (100 Endpoints Pack)',     'RECURRING', 25,  28000.00,  14000.00, 15.00, 20.00, 18.00,  595000.00, 245000.00, 41.20, 'MONTHLY', TRUE,  2),
(16, 5, 17, NULL, 'Enterprise Cloud Migration & Setup Pack',          'ONE_TIME',   1, 450000.00, 220000.00, 15.00, 22.00, 18.00,  382500.00, 162500.00, 42.50, NULL,      FALSE, 3),

-- Quote 6 (Wipro - Draft)
(17, 6, 2,  3,    'ThinkPad X1 Carbon Gen 12 (Core Ultra 7 / 32GB)', 'ONE_TIME',   5, 158000.00, 118000.00,  5.00, 15.00, 18.00,  750500.00, 160500.00, 21.40, NULL,      FALSE, 1),
(18, 6, 4,  NULL, 'Thunderbolt 4 Quad-Display Docking Station',      'ONE_TIME',   5,  24500.00,  16500.00,  5.00, 25.00, 18.00,  116375.00,  33875.00, 29.10, NULL,      TRUE,  2),

-- Quote 7 (Swiggy - Fulfilled)
(19, 7, 17, NULL, 'Enterprise Cloud Migration & Setup Pack',          'ONE_TIME',   2, 450000.00, 220000.00, 10.00, 22.00, 18.00,  810000.00, 370000.00, 45.70, NULL,      FALSE, 1),
(20, 7, 9,  9,    'Microsoft 365 E5 Annual Commit License',          'RECURRING', 250,  3850.00,   3100.00, 10.00, 30.00, 18.00,  866250.00, 168750.00, 19.50, 'MONTHLY', FALSE, 2),
(21, 7, 11, NULL, 'Developer Productivity Suite (50 Seats)',          'RECURRING',  5,  65000.00,  38000.00, 10.00, 30.00, 18.00,  292500.00, 102500.00, 35.00, 'MONTHLY', TRUE,  3),

-- Quote 8 (Zerodha - Approved)
(22, 8, 20, 16,   '2x NVIDIA H100 NVLink 160GB AI Inference Node',   'RECURRING',  8, 520000.00, 405000.00,  8.00, 25.00, 18.00, 3827200.00, 587200.00, 15.30, 'MONTHLY', FALSE, 1),
(23, 8, 21, NULL, 'Vector Database & Semantic Search Cluster',        'RECURRING',  4,  62000.00,  32000.00,  8.00, 25.00, 18.00,  228160.00, 100160.00, 43.90, 'MONTHLY', TRUE,  2),
(24, 8, 18, NULL, 'Dedicated Senior DevOps Engineer SLA',             'RECURRING',  4, 185000.00, 110000.00,  8.00, 22.00, 18.00,  680800.00, 240800.00, 35.40, 'MONTHLY', FALSE, 3),

-- Quote 9 (Zoho - Stalled)
(25, 9, 16, NULL, 'Aruba Wi-Fi 7 Enterprise Access Point',            'ONE_TIME',  30,  48000.00,  33000.00, 10.00, 18.00, 18.00, 1296000.00, 306000.00, 23.60, NULL,      FALSE, 1),
(26, 9, 15, 14,   'Cisco Catalyst 9300 48-Port Full PoE+ 715W',       'ONE_TIME',   2, 295000.00, 215000.00, 10.00, 18.00, 18.00,  531000.00, 101000.00, 19.00, NULL,      TRUE,  2),

-- Quote 10 (ICICI Bank - Rejected)
(27, 10, 12, 12,  'Fortinet FortiGate 200F NGFW + 3Y UTM Bundle',     'ONE_TIME',  10, 545000.00, 420000.00, 30.00, 20.00, 18.00, 3815000.00,-385000.00,-10.10, NULL,      FALSE, 1),
(28, 10, 13, NULL, '24x7 Managed SOC Monitoring Service',              'RECURRING', 12,  95000.00,  48000.00, 30.00, 20.00, 18.00,  798000.00, 222000.00, 27.80, 'MONTHLY', FALSE, 2);

SELECT setval('quotation_lines_id_seq', 28);

-- ============================================================
-- 14. APPROVALS (9 Governance Records)
-- ============================================================
INSERT INTO approvals (id, quotation_id, approver_id, level, status, notes, decided_at, created_at) VALUES
(1,  1, 2, 'MANAGER', 'APPROVED', 'Standard 10% Gold tier discount approved for Bangalore ODC setup.', NOW() - INTERVAL '3 days', NOW() - INTERVAL '4 days'),
(2,  2, 2, 'MANAGER', 'APPROVED', 'Manager clearance given. Escalated to Finance due to negative margin on server lines.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days'),
(3,  2, 3, 'FINANCE', 'PENDING',  'Under review by CFO desk for special strategic project pricing.', NULL, NOW() - INTERVAL '1 day'),
(4,  3, 2, 'MANAGER', 'APPROVED', 'Commercial terms vetted for 15-site 5G rollout.', NOW() - INTERVAL '6 days', NOW() - INTERVAL '7 days'),
(5,  5, 2, 'MANAGER', 'PENDING',  'Reviewing 15% discount on SOC monitoring package for Razorpay.', NULL, NOW() - INTERVAL '1 day'),
(6,  7, 2, 'MANAGER', 'APPROVED', 'Approved for high-growth food tech account.', NOW() - INTERVAL '14 days', NOW() - INTERVAL '15 days'),
(7,  8, 2, 'MANAGER', 'APPROVED', 'Volume commitment discount on H100 GPU cluster verified.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days'),
(8,  10, 2, 'MANAGER', 'APPROVED','Manager approved on assumption of volume.', NOW() - INTERVAL '5 days', NOW() - INTERVAL '6 days'),
(9,  10, 3, 'FINANCE', 'REJECTED', 'Gross margin is -10.10% which breaches ICICI 32% minimum margin floor.', NOW() - INTERVAL '4 days', NOW() - INTERVAL '5 days');

SELECT setval('approvals_id_seq', 9);

-- ============================================================
-- 15. APPROVAL AUDIT LOGS (18 Compliance Records)
-- ============================================================
INSERT INTO approval_audit_logs (id, quotation_id, user_id, action, notes, old_status, new_status, created_at) VALUES
(1,  1, 4, 'SUBMIT',  'Submitted quote Q-2026-101 for governance approval', 'DRAFT', 'PENDING_APPROVAL', NOW() - INTERVAL '4 days'),
(2,  1, 2, 'APPROVE', 'Manager approved 10% Gold Tier discount', 'PENDING_APPROVAL', 'APPROVED', NOW() - INTERVAL '3 days'),
(3,  2, 4, 'SUBMIT',  'Submitted high-discount quote for Infosys datacenter', 'DRAFT', 'PENDING_APPROVAL', NOW() - INTERVAL '2 days'),
(4,  2, 2, 'APPROVE', 'Manager cleared and forwarded to Finance', 'PENDING_APPROVAL', 'PENDING_APPROVAL', NOW() - INTERVAL '1 day'),
(5,  3, 5, 'SUBMIT',  'Submitted Reliance Jio 5G expansion order', 'DRAFT', 'PENDING_APPROVAL', NOW() - INTERVAL '7 days'),
(6,  3, 2, 'APPROVE', 'Manager approved 5G rollout quote', 'PENDING_APPROVAL', 'APPROVED', NOW() - INTERVAL '6 days'),
(7,  3, 1, 'CONFIRM', 'Customer signed off on portal token-jio-103', 'APPROVED', 'CONFIRMED', NOW() - INTERVAL '3 days'),
(8,  4, 4, 'SUBMIT',  'Submitted Flipkart DevOps quote', 'DRAFT', 'PENDING_APPROVAL', NOW() - INTERVAL '5 days'),
(9,  4, 2, 'APPROVE', 'Manager approved for portal negotiation', 'PENDING_APPROVAL', 'APPROVED', NOW() - INTERVAL '4 days'),
(10, 4, 1, 'NEGOTIATE','Customer posted counter-offer on K8s node discount', 'APPROVED', 'NEGOTIATION', NOW() - INTERVAL '2 days'),
(11, 7, 6, 'SUBMIT',  'Submitted Swiggy cloud migration package', 'DRAFT', 'PENDING_APPROVAL', NOW() - INTERVAL '15 days'),
(12, 7, 2, 'APPROVE', 'Manager approved cloud pack discount', 'PENDING_APPROVAL', 'APPROVED', NOW() - INTERVAL '14 days'),
(13, 7, 1, 'CONFIRM', 'Order confirmed by Swiggy VP of Engineering', 'APPROVED', 'CONFIRMED', NOW() - INTERVAL '12 days'),
(14, 7, 1, 'FULFILL', 'All shipment packages fulfilled across BLR and MAA depots', 'CONFIRMED', 'FULFILLED', NOW() - INTERVAL '10 days'),
(15, 8, 8, 'SUBMIT',  'Submitted Zerodha GPU node quote', 'DRAFT', 'PENDING_APPROVAL', NOW() - INTERVAL '3 days'),
(16, 8, 2, 'APPROVE', 'Manager approved 8% bundle discount', 'PENDING_APPROVAL', 'APPROVED', NOW() - INTERVAL '2 days'),
(17, 10, 8, 'SUBMIT', 'Submitted aggressive 30% discount deal for ICICI', 'DRAFT', 'PENDING_APPROVAL', NOW() - INTERVAL '6 days'),
(18, 10, 3, 'REJECT',  'Finance rejected due to negative gross margin (-10.10%)', 'PENDING_APPROVAL', 'REJECTED', NOW() - INTERVAL '4 days');

SELECT setval('approval_audit_logs_id_seq', 18);

-- ============================================================
-- 16. FULFILLMENT ORDERS & LINES (Multi-Warehouse Splitting & Backorders)
-- ============================================================
INSERT INTO fulfillment_orders (id, quotation_id, status, is_manual_override, total_shipments, total_shipping_cost, notes, created_at) VALUES
(1, 3, 'FULFILLED',     FALSE, 2, 45000.00, 'Split between Mumbai Hub (10 units) and Delhi Mega Hub (5 units)', NOW() - INTERVAL '3 days'),
(2, 7, 'FULFILLED',     FALSE, 1,  8500.00, 'All items delivered to Swiggy Bangalore HQ', NOW() - INTERVAL '12 days'),
(3, 1, 'SPLIT_PENDING', TRUE,  2, 38000.00, 'TCS Bengaluru ODC delivery split across Mumbai and Bangalore depots', NOW() - INTERVAL '1 day');

SELECT setval('fulfillment_orders_id_seq', 3);

INSERT INTO fulfillment_lines (id, fulfillment_order_id, quotation_line_id, warehouse_id, product_id, quantity_allocated, quantity_fulfilled, is_backorder, estimated_ship_date, shipping_cost) VALUES
-- Jio Fulfillment (Order 1)
(1, 1, 8, 1, 12, 10, 10, FALSE, CURRENT_DATE - 2, 25000.00), -- FortiGate from Mumbai
(2, 1, 8, 3, 12,  5,  5, FALSE, CURRENT_DATE - 2, 20000.00), -- FortiGate from Delhi
-- Swiggy Fulfillment (Order 2)
(3, 2, 19, 2, 17, 2, 2, FALSE, CURRENT_DATE - 11, 8500.00),
-- TCS Fulfillment (Order 3 - Split with Backorder)
(4, 3, 1, 1, 2, 12, 0, FALSE, CURRENT_DATE + 3, 18000.00), -- 12 ThinkPads from Mumbai
(5, 3, 1, 2, 2,  8, 0, FALSE, CURRENT_DATE + 2, 12000.00), -- 8 ThinkPads from Bangalore
(6, 3, 2, 2, 4, 15, 0, FALSE, CURRENT_DATE + 2,  4500.00), -- 15 Docks from Bangalore
(7, 3, 2, 5, 4,  5, 0, TRUE,  CURRENT_DATE + 8,  3500.00); -- 5 Docks Backordered from Chennai

SELECT setval('fulfillment_lines_id_seq', 7);

-- ============================================================
-- 17. SUBSCRIPTIONS & LINES (Active Recurring SaaS in INR ₹)
-- ============================================================
INSERT INTO subscriptions (id, quotation_id, customer_id, status, billing_cycle, start_date, next_billing_date, proration_days, created_at) VALUES
(1, 3, 3,  'ACTIVE', 'MONTHLY', CURRENT_DATE - 30, CURRENT_DATE + 1, 0, NOW() - INTERVAL '30 days'),
(2, 7, 11, 'ACTIVE', 'MONTHLY', CURRENT_DATE - 45, CURRENT_DATE + 15, 0, NOW() - INTERVAL '45 days'),
(3, 1, 1,  'ACTIVE', 'MONTHLY', CURRENT_DATE,      CURRENT_DATE + 30, 0, NOW() - INTERVAL '1 day');

SELECT setval('subscriptions_id_seq', 3);

INSERT INTO subscription_lines (id, subscription_id, product_id, quantity, unit_price, discount_pct, line_total) VALUES
(1, 1, 13, 1,  95000.00, 10.00,  85500.00),  -- SOC Monitoring for Jio (Monthly)
(2, 2, 9,  250, 3850.00, 10.00, 866250.00),  -- M365 E5 for Swiggy (Monthly)
(3, 2, 11, 5,  65000.00, 10.00, 292500.00),  -- Dev productivity for Swiggy (Monthly)
(4, 3, 6,  20, 38500.00, 10.00, 693000.00);  -- K8s Node Pool for TCS (Monthly)

SELECT setval('subscription_lines_id_seq', 4);

-- ============================================================
-- 18. INVOICES & LINES (Hybrid Invoices in INR ₹)
-- ============================================================
INSERT INTO invoices (id, invoice_number, quotation_id, subscription_id, customer_id, status, currency, subtotal, tax_total, total_amount, amount_paid, amount_due, due_date, is_recurring, created_at) VALUES
(1, 'INV-2026-001', 3, NULL, 3,  'PAID',    'INR', 11340000.00, 2041200.00, 13381200.00, 13381200.00,        0.00, CURRENT_DATE + 30, FALSE, NOW() - INTERVAL '3 days'),
(2, 'INV-2026-002', 7, NULL, 11, 'PAID',    'INR',   810000.00,  145800.00,   955800.00,   955800.00,        0.00, CURRENT_DATE - 5,  FALSE, NOW() - INTERVAL '10 days'),
(3, 'INV-2026-003', NULL, 2, 11, 'UNPAID',  'INR',  1158750.00,  208575.00,  1367325.00,        0.00,  1367325.00, CURRENT_DATE + 15, TRUE,  NOW() - INTERVAL '1 day'),
(4, 'INV-2026-004', 1, NULL, 1,  'PARTIAL', 'INR',  3823700.00,  688266.00,  4511966.00,  2000000.00,  2511966.00, CURRENT_DATE + 45, FALSE, NOW() - INTERVAL '1 day');

SELECT setval('invoices_id_seq', 4);

INSERT INTO invoice_lines (id, invoice_id, product_id, description, quantity, unit_price, discount_pct, tax_pct, line_total) VALUES
(1, 1, 12, 'Fortinet FortiGate 200F NGFW with 3Y UTM Bundle', 15, 545000.00, 10.00, 18.00, 7357500.00),
(2, 1, 15, 'Cisco Catalyst 9300 48-Port PoE+ Switch',         15, 295000.00, 10.00, 18.00, 3982500.00),
(3, 2, 17, 'Enterprise Cloud Migration & Setup Pack',          2, 450000.00, 10.00, 18.00,  810000.00),
(4, 3, 9,  'Microsoft 365 E5 Enterprise License (Monthly Run)',250, 3850.00, 10.00, 18.00,  866250.00),
(5, 3, 11, 'Developer Productivity Suite (50-Seat Pack)',       5, 65000.00, 10.00, 18.00,  292500.00),
(6, 4, 2,  'ThinkPad X1 Carbon Gen 12 (i7/32GB)',              20, 158000.00, 10.00, 18.00, 2844000.00),
(7, 4, 4,  'Thunderbolt 4 Quad-Display Dock',                  20,  24500.00, 15.00, 18.00,  416500.00),
(8, 4, 5,  '3-Year On-Site Hardware Extended SLA',             20,  32000.00, 12.00, 18.00,  563200.00);

SELECT setval('invoice_lines_id_seq', 8);

-- ============================================================
-- 19. PAYMENTS (Bank Transfer, RTGS & Corporate Card)
-- ============================================================
INSERT INTO payments (id, invoice_id, customer_id, amount, currency, method, reference, notes, paid_at) VALUES
(1, 1, 3,  13381200.00, 'INR', 'BANK_TRANSFER', 'HDFC-RTGS-JIO-2026-9881', 'Full payment for 5G enterprise switches and firewalls', NOW() - INTERVAL '2 days'),
(2, 2, 11,   955800.00, 'INR', 'BANK_TRANSFER', 'ICICI-NEFT-SWIGGY-88124', 'Full settlement for Cloud migration pack', NOW() - INTERVAL '5 days'),
(3, 4, 1,   2000000.00, 'INR', 'BANK_TRANSFER', 'SBI-RTGS-TCS-2026-11440',  'Initial milestone advance payment (45%)', NOW() - INTERVAL '12 hours');

SELECT setval('payments_id_seq', 3);

-- ============================================================
-- 20. NEGOTIATION COMMENTS (Live Customer Portal Chat Threads)
-- ============================================================
INSERT INTO negotiation_comments (id, quotation_id, line_id, author_type, author_id, message, counter_discount, is_resolved, created_at) VALUES
(1, 4, 11, 'CUSTOMER', NULL, 'Can you match 15% discount on the K8s node pool for annual volume commitment?', 15.00, FALSE, NOW() - INTERVAL '1 day'),
(2, 4, 11, 'SALES_REP', 4,   'We can offer 15% on K8s nodes if bundled with the Managed PostgreSQL database service.', NULL, FALSE, NOW() - INTERVAL '18 hours'),
(3, 4, 12, 'CUSTOMER', NULL, 'Agreed! Adding the managed database to our cluster.', NULL, TRUE, NOW() - INTERVAL '6 hours'),
(4, 9, 25, 'CUSTOMER', NULL, 'Looking for an additional 5% off on the Aruba Wi-Fi 7 access points for our Tenkasi facility.', 15.00, FALSE, NOW() - INTERVAL '10 days'),
(5, 9, 25, 'SALES_REP', 6,   'Let me consult with our regional sales manager Vikram for Tenkasi project approval.', NULL, FALSE, NOW() - INTERVAL '8 days');

SELECT setval('negotiation_comments_id_seq', 5);

-- ============================================================
-- 21. DEAL HEALTH ALERTS (Pipeline Anomaly & Risk Alerts)
-- ============================================================
INSERT INTO deal_health_alerts (id, quotation_id, alert_type, description, is_resolved, action_taken, flagged_at, created_at) VALUES
(1, 9,  'STALLED_DEAL',     'Quotation Q-2026-109 with Zoho Corp has had no activity for over 10 days.', FALSE, NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(2, 2,  'DISCOUNT_ANOMALY', 'Quotation Q-2026-102 has 20% discount on Dell Servers yielding negative gross margin (-3.70%).', FALSE, NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(3, 10, 'DISCOUNT_ANOMALY', 'Quotation Q-2026-110 requested 30% discount on FortiGate firewalls breaching ICICI 32% margin floor.', TRUE, 'Finance rejected quote and sent back to Sales Rep', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
(4, 1,  'DELIVERY_SLIPPAGE','Quotation Q-2026-101 has 5 units of Thunderbolt 4 Docks on backorder from Chennai Hub.', FALSE, NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

SELECT setval('deal_health_alerts_id_seq', 4);
