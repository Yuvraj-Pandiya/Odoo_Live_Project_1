import psycopg2
import random
from datetime import datetime, timedelta

def generate_and_seed():
    print("Connecting to PostgreSQL dealflow360...")
    conn = psycopg2.connect(
        host="127.0.0.1",
        port=5432,
        dbname="dealflow360",
        user="postgres",
        password="1301"
    )
    conn.autocommit = False
    cur = conn.cursor()

    cur.execute("SET search_path TO dealflow;")

    print("Cleaning existing data...")
    tables_to_truncate = [
        "deal_health_alerts", "negotiation_comments", "payments",
        "invoice_lines", "invoices", "subscription_lines", "subscriptions",
        "fulfillment_lines", "fulfillment_orders", "approval_audit_logs",
        "approvals", "approval_chains", "quotation_lines", "quotations",
        "warehouse_stock", "warehouses", "upsell_rules", "discount_tiers",
        "price_lists", "product_variants", "products", "product_categories",
        "refresh_tokens", "customers", "users"
    ]
    for t in tables_to_truncate:
        cur.execute(f"TRUNCATE TABLE {t} CASCADE;")

    print("1. Seeding 300 Users...")
    first_names = ["Aarav", "Vikram", "Sneha", "Priya", "Rajesh", "Ananya", "Rohan", "Neha", "Amit", "Pooja", "Rahul", "Kavita", "Srikant", "Divya", "Arjun", "Meera", "Karan", "Siddharth", "Ishita", "Tarun"]
    last_names = ["Sharma", "Malhotra", "Gupta", "Patel", "Kumar", "Iyer", "Verma", "Joshi", "Singh", "Reddy", "Nair", "Chawla", "Deshmukh", "Choudhury", "Bose", "Mehta", "Shah", "Agarwal", "Rao", "Kapoor"]
    departments = ["Enterprise Sales", "Commercial Governance", "Finance & Treasury", "Revenue Operations", "Cloud & SaaS Sales", "Strategic Accounts", "Fintech & BFSI Sales", "Mid-Market Solutions"]
    roles = ["ADMIN", "MANAGER", "FINANCE", "SALES_REP", "SALES_REP", "SALES_REP", "SALES_REP", "SALES_REP"]

    # BCrypt hash for 'Password123!'
    pw_hash = "$2a$12$8K1p/a0dqbQIqoQHlCTBCuKJTlC.IVH.Mg9q7N1JkZbIJwKUQvDC."

    user_values = []
    # Seed 8 core demo accounts first for UI compatibility
    core_users = [
        (1, "admin@dealflow360.com", pw_hash, "Aarav", "Sharma", "ADMIN", True, "Revenue Operations", "+91-9820011223"),
        (2, "manager@dealflow360.com", pw_hash, "Vikram", "Malhotra", "MANAGER", True, "Commercial Governance", "+91-9811022334"),
        (3, "finance@dealflow360.com", pw_hash, "Sneha", "Gupta", "FINANCE", True, "Finance & Treasury", "+91-9833033445"),
        (4, "rep1@dealflow360.com", pw_hash, "Priya", "Patel", "SALES_REP", True, "Enterprise Sales", "+91-9844044556"),
        (301, "sales@dealflow360.com", pw_hash, "Priya", "Patel", "SALES_REP", True, "Enterprise Sales", "+91-9844044556"),
        (5, "rep2@dealflow360.com", pw_hash, "Rajesh", "Kumar", "SALES_REP", True, "Strategic Accounts", "+91-9855055667"),
        (6, "rep3@dealflow360.com", pw_hash, "Ananya", "Iyer", "SALES_REP", True, "Cloud & SaaS Sales", "+91-9866066778"),
        (7, "rep4@dealflow360.com", pw_hash, "Rohan", "Verma", "SALES_REP", True, "Mid-Market Solutions", "+91-9877077889"),
        (8, "rep5@dealflow360.com", pw_hash, "Neha", "Joshi", "SALES_REP", True, "BFSI & Fintech Sales", "+91-9888088990"),
    ]
    for u in core_users:
        cur.execute("""
            INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, department, phone)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, u)

    for i in range(9, 301):
        fn = random.choice(first_names)
        ln = random.choice(last_names)
        email = f"user{i}@dealflow360.com"
        role = random.choice(roles)
        dept = random.choice(departments)
        phone = f"+91-98{random.randint(10000000, 99999999)}"
        cur.execute("""
            INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, department, phone)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (i, email, pw_hash, fn, ln, role, True, dept, phone))
    
    cur.execute("SELECT setval('users_id_seq', 300);")

    print("2. Seeding 300 Customers...")
    corp_suffixes = ["Ltd", "Pvt Ltd", "Corporation", "Technologies", "Infotech", "Digital Solutions", "Enterprises", "Global", "Systems"]
    tech_cities = [("Bengaluru", "Karnataka", "5600"), ("Mumbai", "Maharashtra", "4000"), ("Gurugram", "Haryana", "1220"), ("Noida", "Uttar Pradesh", "2013"), ("Chennai", "Tamil Nadu", "6000"), ("Hyderabad", "Telangana", "5000"), ("Pune", "Maharashtra", "4110")]
    tiers = ["GOLD", "SILVER", "BRONZE"]

    company_bases = [
        "Tata Consultancy Services", "Infosys", "Reliance Jio", "Wipro", "HCL Tech", "Bharti Airtel",
        "ICICI Tech", "Larsen & Toubro", "Mahindra Digital", "Flipkart", "Swiggy", "Zomato", "Razorpay",
        "Zerodha", "Zoho", "Freshworks", "Paytm", "Ola Electric", "Delhivery", "Nykaa", "BigBasket",
        "PhonePe", "Cred", "InMobi", "Postman", "Adani Digital", "Asian Paints Tech", "Bajaj Finserv",
        "Titan Tech", "Dmart Digital", "MakeMyTrip", "PolicyBazaar", "Lenskart", "Meesho", "Unacademy",
        "BYJU'S Tech", "UpGrad", "Pine Labs", "BharatPe", "Groww", "Upstox", "Acko General", "Digit Insurance",
        "Cars24", "Spinny", "Urban Company", "Blinkit", "Zepto Cloud", "Porter Tech", "Shadowfax Logistics"
    ]

    for i in range(1, 301):
        if i <= len(company_bases):
            comp_name = company_bases[i-1]
        else:
            comp_name = f"{random.choice(company_bases)} {random.choice(corp_suffixes)} #{i}"
        
        c_email = f"procurement{i}@corp-{i}.com"
        c_phone = f"+91-{random.randint(10,99)}-{random.randint(10000000, 99999999)}"
        c_tier = random.choice(tiers)
        city, state, p_prefix = random.choice(tech_cities)
        p_code = f"{p_prefix}{random.randint(10, 99)}"
        token = f"token-cust-{1000 + i}"
        rep_id = random.randint(4, 300)

        cur.execute("""
            INSERT INTO customers (id, name, email, phone, company, tier, address_line1, city, state, country, postal_code, currency, portal_token, assigned_rep_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (i, comp_name, c_email, c_phone, comp_name + " Ltd", c_tier, f"Plot {i}, Tech Park Sector {i%20 + 1}", city, state, "India", p_code, "INR", token, rep_id))

    cur.execute("SELECT setval('customers_id_seq', 300);")

    print("3. Seeding 30 Product Categories...")
    cat_names = [
        "Enterprise Computing & Hardware", "Cloud Hosting & Virtual Compute", "Enterprise SaaS & Licenses",
        "Cybersecurity & SOC Compliance", "Networking & Telecom Infra", "Managed IT & 24/7 SLA Support",
        "AI & Enterprise Analytics", "Storage & SAN Infrastructure", "DevOps & CI/CD Pipelines",
        "Database Clusters & Data Lakes", "IoT & Edge Edge Devices", "API Management Gateways",
        "Low-Code Enterprise Automation", "Mainframe Modernization", "Virtual Desktop Infrastructure (VDI)",
        "Observability & APM Suites", "Container Orchestration & K8s", "Zero-Trust Access Control",
        "SIEM & Log Intelligence", "Disaster Recovery & Backup", "Quantum Dev Workstations",
        "Enterprise ERP Core", "CRM & Revenue Cloud", "HR Tech & Payroll Automation",
        "Supply Chain & WMS Tech", "Fintech Gateway & Payment Infrastructure", "Biometric Access Systems",
        "Industrial Automation & SCADA", "AR/VR Enterprise Simulation", "Satellite & High-Bandwidth Telecom"
    ]
    for idx, cname in enumerate(cat_names, 1):
        cur.execute("""
            INSERT INTO product_categories (id, name, description, max_discount)
            VALUES (%s, %s, %s, %s);
        """, (idx, cname, f"Category for {cname} solutions and licenses", round(random.uniform(10.0, 30.0), 2)))

    cur.execute("SELECT setval('product_categories_id_seq', 30);")

    print("4. Seeding 300 Products...")
    prod_prefixes = ["NVIDIA", "Dell PowerEdge", "Cisco Nexus", "Palo Alto", "Datadog", "Snowflake", "Salesforce", "AWS EC2", "SAP S/4HANA", "Microsoft 365", "CrowdStrike", "Kubernetes", "HashiCorp", "MongoDB Atlas", "Kafka Cloud", "Lenovo ThinkSystem", "Pure Storage", "NetApp AFF", "Juniper MX", "Fortinet FortiGate", "IBM Z Mainframe", "Oracle Autonomous", "Splunk Enterprise", "Google Cloud Vertex", "Red Hat OpenShift"]
    prod_types = ["PHYSICAL", "SERVICE", "SUBSCRIPTION"]
    units = ["Each", "Seat", "Instance/Mo", "Core/Yr", "GB/Mo", "License"]

    for i in range(1, 301):
        pname = f"{random.choice(prod_prefixes)} {random.choice(['Enterprise', 'Pro', 'Ultra', 'Cluster', 'Gateway', 'Suite', 'Node'])} v{i}"
        sku = f"SKU-PROD-{1000 + i}"
        cat_id = (i % 30) + 1
        ptype = random.choice(prod_types)
        bprice = round(random.uniform(15000.0, 2500000.0), 2)
        cprice = round(bprice * random.uniform(0.6, 0.8), 2)
        is_sub = (ptype == "SUBSCRIPTION" or random.choice([True, False]))
        bcycle = random.choice(["MONTHLY", "QUARTERLY", "YEARLY"]) if is_sub else None
        qty = random.randint(20, 2000)

        cur.execute("""
            INSERT INTO products (id, name, sku, category_id, product_type, base_price, cost_price, unit, tax_percentage, description, is_subscription, billing_cycle, is_promoted, min_margin_pct, quantity_on_hand)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (i, pname, sku, cat_id, ptype, bprice, cprice, random.choice(units), 18.00, f"High-performance {pname} for enterprise scale operations.", is_sub, bcycle, i % 5 == 0, 15.00, qty))

    cur.execute("SELECT setval('products_id_seq', 300);")

    print("5. Seeding Product Variants, Price Lists, Warehouses, Stock...")
    for i in range(1, 301):
        cur.execute("""
            INSERT INTO product_variants (id, product_id, attribute_name, attribute_value, extra_price, sku_suffix)
            VALUES (%s, %s, %s, %s, %s, %s);
        """, (i, i, "Tier", "Enterprise Ultra", round(random.uniform(5000, 50000), 2), f"-VAR-{i}"))

        cur.execute("""
            INSERT INTO price_lists (id, product_id, customer_tier, currency, price_rule, fixed_price, discount_pct)
            VALUES (%s, %s, %s, %s, %s, %s, %s);
        """, (i, i, random.choice(["GOLD", "SILVER", "BRONZE"]), "INR", "FIXED", round(random.uniform(10000, 2000000), 2), round(random.uniform(5.0, 20.0), 2)))

    cur.execute("SELECT setval('product_variants_id_seq', 300);")
    cur.execute("SELECT setval('price_lists_id_seq', 300);")

    # Discount tiers & Approval chains
    cur.execute("INSERT INTO discount_tiers (id, tier, max_discount, description) VALUES (1, 'BRONZE', 10.00, 'Standard discount for Bronze tier'), (2, 'SILVER', 20.00, 'Enhanced discount for Silver tier'), (3, 'GOLD', 35.00, 'Maximum discount tier for Gold customers');")
    cur.execute("SELECT setval('discount_tiers_id_seq', 3);")

    for i in range(1, 31):
        cur.execute("""
            INSERT INTO approval_chains (id, name, discount_from, discount_to, required_level, description)
            VALUES (%s, %s, %s, %s, %s, %s);
        """, (i, f"Rule Chain #{i}", round(float(i), 2), round(float(i + 5), 2), "MANAGER" if i % 2 == 1 else "FINANCE", f"Approval rule for discount tier {i}"))
    cur.execute("SELECT setval('approval_chains_id_seq', 30);")

    # Warehouses & Warehouse stock (300 rows)
    w_cities = ["Bengaluru Hub", "Mumbai Logistics", "NCR Gurgaon Center", "Hyderabad Tech Depot", "Chennai Port Hub", "Pune Storage Node", "Kolkata Fulfillment", "Ahmedabad Depot"]
    for i in range(1, 301):
        wname = f"{random.choice(w_cities)} #{i}"
        wcode = f"WH-{1000+i}"
        cur.execute("""
            INSERT INTO warehouses (id, name, code, address, city, country, shipping_cost_weight)
            VALUES (%s, %s, %s, %s, %s, %s, %s);
        """, (i, wname, wcode, f"Industrial Zone Sector {i}", wname.split()[0], "India", round(random.uniform(1.0, 5.0), 2)))

        cur.execute("""
            INSERT INTO warehouse_stock (id, warehouse_id, product_id, quantity, reserved, reorder_point)
            VALUES (%s, %s, %s, %s, %s, %s);
        """, (i, i, i, random.randint(100, 1000), random.randint(10, 50), 20))

    cur.execute("SELECT setval('warehouses_id_seq', 300);")
    cur.execute("SELECT setval('warehouse_stock_id_seq', 300);")

    # Upsell Rules (300 rows)
    for i in range(1, 301):
        trig = i
        sugg = (i % 300) + 1
        if trig != sugg:
            cur.execute("""
                INSERT INTO upsell_rules (id, trigger_product_id, suggest_product_id, co_purchase_count, is_promoted, min_margin_pct, priority)
                VALUES (%s, %s, %s, %s, %s, %s, %s);
            """, (i, trig, sugg, random.randint(10, 500), i % 3 == 0, 15.00, i % 5 + 1))
    cur.execute("SELECT setval('upsell_rules_id_seq', 300);")

    print("6. Seeding 300 Quotations & 600 Quotation Lines...")
    q_statuses = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED", "NEGOTIATION", "CONFIRMED", "FULFILLED", "CANCELLED"]
    risk_levels = ["LOW", "MEDIUM", "HIGH"]

    now = datetime.now()

    for i in range(1, 301):
        qnum = f"QT-2026-{1000 + i}"
        cid = random.randint(1, 300)
        repid = random.randint(4, 300)
        st = random.choice(q_statuses)
        subtotal = round(random.uniform(100000.0, 5000000.0), 2)
        taxtotal = round(subtotal * 0.18, 2)
        disctotal = round(subtotal * random.uniform(0.05, 0.25), 2)
        grandtotal = round(subtotal + taxtotal - disctotal, 2)
        rscore = round(random.uniform(10.0, 90.0), 2)
        rlevel = random.choice(risk_levels)
        ptoken = f"token-quote-{1000 + i}"

        cur.execute("""
            INSERT INTO quotations (id, quote_number, customer_id, sales_rep_id, status, currency, subtotal, tax_total, discount_total, grand_total, blended_risk_score, risk_level, notes, valid_until, portal_token, last_activity_at, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (i, qnum, cid, repid, st, "INR", subtotal, taxtotal, disctotal, grandtotal, rscore, rlevel, f"Commercial quote #{qnum} for enterprise deployment.", (now + timedelta(days=30)).date(), ptoken, now - timedelta(days=random.randint(1, 60)), now - timedelta(days=random.randint(60, 90)), now))

        # 2 quotation lines per quote -> 600 lines
        line_id1 = (i - 1) * 2 + 1
        line_id2 = (i - 1) * 2 + 2
        pid1 = random.randint(1, 300)
        pid2 = random.randint(1, 300)

        cur.execute("""
            INSERT INTO quotation_lines (id, quotation_id, product_id, variant_id, description, line_type, quantity, unit_price, cost_price, discount_pct, discount_allowed, tax_pct, line_total, margin_amount, margin_pct, sort_order)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (line_id1, i, pid1, pid1, f"Primary item line for Quote #{qnum}", "ONE_TIME", random.randint(1, 10), round(subtotal * 0.6, 2), round(subtotal * 0.4, 2), 10.00, 15.00, 18.00, round(subtotal * 0.6 * 1.08, 2), round(subtotal * 0.2, 2), 33.33, 1))

        cur.execute("""
            INSERT INTO quotation_lines (id, quotation_id, product_id, variant_id, description, line_type, quantity, unit_price, cost_price, discount_pct, discount_allowed, tax_pct, line_total, margin_amount, margin_pct, sort_order)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (line_id2, i, pid2, pid2, f"Secondary recurring license for Quote #{qnum}", "RECURRING", random.randint(1, 50), round(subtotal * 0.4, 2), round(subtotal * 0.25, 2), 12.00, 20.00, 18.00, round(subtotal * 0.4 * 1.06, 2), round(subtotal * 0.15, 2), 37.50, 2))

    cur.execute("SELECT setval('quotations_id_seq', 300);")
    cur.execute("SELECT setval('quotation_lines_id_seq', 600);")

    print("7. Seeding 300 Approvals & Audit Logs...")
    app_statuses = ["PENDING", "APPROVED", "REJECTED", "RETURNED"]
    for i in range(1, 301):
        cur.execute("""
            INSERT INTO approvals (id, quotation_id, approver_id, level, status, notes, decided_at, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
        """, (i, i, 2 if i % 2 == 1 else 3, "MANAGER" if i % 2 == 1 else "FINANCE", random.choice(app_statuses), f"Approval governance check for Quote #{i}", now - timedelta(days=random.randint(1, 10)), now - timedelta(days=random.randint(10, 20))))

        cur.execute("""
            INSERT INTO approval_audit_logs (id, quotation_id, user_id, action, notes, old_status, new_status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
        """, (i, i, random.randint(1, 8), "DECISION_SUBMITTED", f"Audit trail action for Quote #{i}", "DRAFT", "PENDING_APPROVAL", now))

    cur.execute("SELECT setval('approvals_id_seq', 300);")
    cur.execute("SELECT setval('approval_audit_logs_id_seq', 300);")

    print("8. Seeding 300 Fulfillment Orders & Lines...")
    f_statuses = ["PENDING", "SPLIT_PENDING", "PARTIALLY_FULFILLED", "FULFILLED", "BACKORDER"]
    for i in range(1, 301):
        cur.execute("""
            INSERT INTO fulfillment_orders (id, quotation_id, status, is_manual_override, total_shipments, total_shipping_cost, notes, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (i, i, random.choice(f_statuses), i % 10 == 0, random.randint(1, 4), round(random.uniform(500.0, 15000.0), 2), f"Fulfillment logistics tracking #{i}", now, now))

        cur.execute("""
            INSERT INTO fulfillment_lines (id, fulfillment_order_id, quotation_line_id, warehouse_id, product_id, quantity_allocated, quantity_fulfilled, is_backorder, estimated_ship_date, shipping_cost)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (i, i, (i - 1) * 2 + 1, i, i, 10, random.randint(0, 10), i % 7 == 0, (now + timedelta(days=5)).date(), round(random.uniform(200.0, 5000.0), 2)))

    cur.execute("SELECT setval('fulfillment_orders_id_seq', 300);")
    cur.execute("SELECT setval('fulfillment_lines_id_seq', 300);")

    print("9. Seeding 300 Subscriptions & Subscription Lines...")
    sub_statuses = ["ACTIVE", "PAUSED", "CANCELLED", "EXPIRED"]
    for i in range(1, 301):
        cur.execute("""
            INSERT INTO subscriptions (id, quotation_id, customer_id, status, billing_cycle, start_date, next_billing_date, end_date, proration_days, cancellation_reason, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (i, i, i, random.choice(sub_statuses), random.choice(["MONTHLY", "QUARTERLY", "YEARLY"]), (now - timedelta(days=60)).date(), (now + timedelta(days=30)).date(), (now + timedelta(days=365)).date(), 0, None, now, now))

        cur.execute("""
            INSERT INTO subscription_lines (id, subscription_id, product_id, quantity, unit_price, discount_pct, line_total)
            VALUES (%s, %s, %s, %s, %s, %s, %s);
        """, (i, i, i, random.randint(1, 100), round(random.uniform(5000.0, 100000.0), 2), 10.00, round(random.uniform(45000.0, 900000.0), 2)))

    cur.execute("SELECT setval('subscriptions_id_seq', 300);")
    cur.execute("SELECT setval('subscription_lines_id_seq', 300);")

    print("10. Seeding 300 Invoices, Invoice Lines & Payments...")
    inv_statuses = ["DRAFT", "SENT", "UNPAID", "PAID", "PARTIAL", "OVERDUE", "CANCELLED"]
    pay_methods = ["BANK_TRANSFER", "CREDIT_CARD", "CHECK", "ONLINE"]

    for i in range(1, 301):
        inum = f"INV-2026-{1000 + i}"
        tot = round(random.uniform(50000.0, 2000000.0), 2)
        istat = random.choice(inv_statuses)
        paid = tot if istat == "PAID" else (round(tot * 0.5, 2) if istat == "PARTIAL" else 0.0)
        due = round(tot - paid, 2)

        cur.execute("""
            INSERT INTO invoices (id, invoice_number, quotation_id, subscription_id, customer_id, status, currency, subtotal, tax_total, total_amount, amount_paid, amount_due, due_date, is_recurring, billing_period_start, billing_period_end, notes, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (i, inum, i, i, i, istat, "INR", round(tot * 0.82, 2), round(tot * 0.18, 2), tot, paid, due, (now + timedelta(days=30)).date(), i % 2 == 0, (now - timedelta(days=30)).date(), now.date(), f"Tax Invoice #{inum}", now, now))

        cur.execute("""
            INSERT INTO invoice_lines (id, invoice_id, product_id, description, quantity, unit_price, discount_pct, tax_pct, line_total)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (i, i, i, f"Tax invoice line item for #{inum}", random.randint(1, 20), round(tot * 0.8, 2), 5.00, 18.00, tot))

        cur.execute("""
            INSERT INTO payments (id, invoice_id, customer_id, amount, currency, method, reference, notes, paid_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (i, i, i, paid if paid > 0 else 10000.0, "INR", random.choice(pay_methods), f"PAY-REF-{1000+i}", f"Payment transaction for #{inum}", now))

    cur.execute("SELECT setval('invoices_id_seq', 300);")
    cur.execute("SELECT setval('invoice_lines_id_seq', 300);")
    cur.execute("SELECT setval('payments_id_seq', 300);")

    print("11. Seeding 300 Negotiation Comments & Deal Health Alerts...")
    alert_types = ["STALLED_DEAL", "DISCOUNT_ANOMALY", "DELIVERY_SLIPPAGE", "BACKORDER_RESOLVED"]

    for i in range(1, 301):
        cur.execute("""
            INSERT INTO negotiation_comments (id, quotation_id, line_id, author_type, author_id, message, counter_discount, is_resolved, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (i, i, (i - 1) * 2 + 1, "CUSTOMER" if i % 2 == 1 else "SALES_REP", i, f"Portal comment regarding pricing and terms on Quote #{i}", round(random.uniform(5.0, 15.0), 2), i % 3 == 0, now))

        cur.execute("""
            INSERT INTO deal_health_alerts (id, quotation_id, alert_type, description, is_resolved, action_taken, flagged_at, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
        """, (i, i, random.choice(alert_types), f"Deal health anomaly alert #{i} flagged for quote #{i}", i % 4 == 0, "Reviewed by Sales Governance" if i % 4 == 0 else None, now - timedelta(days=random.randint(1, 15)), now))

    cur.execute("SELECT setval('negotiation_comments_id_seq', 300);")
    cur.execute("SELECT setval('deal_health_alerts_id_seq', 300);")

    conn.commit()
    print("Database seeding completed successfully! 300 rows inserted into all primary tables.")
    cur.close()
    conn.close()

if __name__ == "__main__":
    generate_and_seed()
