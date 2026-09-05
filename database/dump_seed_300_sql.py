import psycopg2

def dump_sql():
    print("Generating database/seed_300.sql dump...")
    conn = psycopg2.connect(
        host="127.0.0.1", port=5432, dbname="dealflow360", user="postgres", password="1301"
    )
    cur = conn.cursor()
    cur.execute("SET search_path TO dealflow;")

    tables = [
        "users", "customers", "product_categories", "products", "product_variants",
        "price_lists", "discount_tiers", "approval_chains", "warehouses", "warehouse_stock",
        "upsell_rules", "quotations", "quotation_lines", "approvals", "approval_audit_logs",
        "fulfillment_orders", "fulfillment_lines", "subscriptions", "subscription_lines",
        "invoices", "invoice_lines", "payments", "negotiation_comments", "deal_health_alerts"
    ]

    with open("database/seed_300.sql", "w", encoding="utf-8") as f:
        f.write("-- DealFlow360 - 300 Rows Per Table Performance Test Seed Script\n")
        f.write("-- Generated for PostgreSQL dealflow360 database\n\n")
        f.write("SET search_path TO dealflow;\n\n")

        for t in reversed(tables):
            f.write(f"TRUNCATE TABLE {t} CASCADE;\n")
        f.write("\n")

        for t in tables:
            cur.execute(f"SELECT * FROM {t};")
            rows = cur.fetchall()
            col_names = [desc[0] for desc in cur.description]
            f.write(f"-- Table: {t} ({len(rows)} rows)\n")
            for r in rows:
                vals = []
                for val in r:
                    if val is None:
                        vals.append("NULL")
                    elif isinstance(val, bool):
                        vals.append("TRUE" if val else "FALSE")
                    elif isinstance(val, (int, float)):
                        vals.append(str(val))
                    else:
                        escaped = str(val).replace("'", "''")
                        vals.append(f"'{escaped}'")
                f.write(f"INSERT INTO {t} ({', '.join(col_names)}) VALUES ({', '.join(vals)});\n")
            f.write("\n")

    cur.close()
    conn.close()
    print("Dump complete: database/seed_300.sql created.")

if __name__ == "__main__":
    dump_sql()
