-- ============================================================
-- DealFlow360 - PostgreSQL Sequence Synchronization Migration
-- ============================================================

SELECT setval(pg_get_serial_sequence('dealflow.users', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.users));
SELECT setval(pg_get_serial_sequence('dealflow.customers', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.customers));
SELECT setval(pg_get_serial_sequence('dealflow.quotations', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.quotations));
SELECT setval(pg_get_serial_sequence('dealflow.quotation_lines', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.quotation_lines));
SELECT setval(pg_get_serial_sequence('dealflow.approvals', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.approvals));
SELECT setval(pg_get_serial_sequence('dealflow.approval_audit_logs', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.approval_audit_logs));
SELECT setval(pg_get_serial_sequence('dealflow.products', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.products));
SELECT setval(pg_get_serial_sequence('dealflow.product_variants', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.product_variants));
SELECT setval(pg_get_serial_sequence('dealflow.product_categories', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.product_categories));
SELECT setval(pg_get_serial_sequence('dealflow.price_lists', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.price_lists));
SELECT setval(pg_get_serial_sequence('dealflow.discount_tiers', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.discount_tiers));
SELECT setval(pg_get_serial_sequence('dealflow.approval_chains', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.approval_chains));
SELECT setval(pg_get_serial_sequence('dealflow.warehouses', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.warehouses));
SELECT setval(pg_get_serial_sequence('dealflow.warehouse_stock', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.warehouse_stock));
SELECT setval(pg_get_serial_sequence('dealflow.fulfillment_orders', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.fulfillment_orders));
SELECT setval(pg_get_serial_sequence('dealflow.fulfillment_lines', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.fulfillment_lines));
SELECT setval(pg_get_serial_sequence('dealflow.subscriptions', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.subscriptions));
SELECT setval(pg_get_serial_sequence('dealflow.subscription_lines', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.subscription_lines));
SELECT setval(pg_get_serial_sequence('dealflow.invoices', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.invoices));
SELECT setval(pg_get_serial_sequence('dealflow.invoice_lines', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.invoice_lines));
SELECT setval(pg_get_serial_sequence('dealflow.payments', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.payments));
SELECT setval(pg_get_serial_sequence('dealflow.negotiation_comments', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.negotiation_comments));
SELECT setval(pg_get_serial_sequence('dealflow.deal_health_alerts', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.deal_health_alerts));
SELECT setval(pg_get_serial_sequence('dealflow.upsell_rules', 'id'), (SELECT COALESCE(MAX(id), 1) FROM dealflow.upsell_rules));
