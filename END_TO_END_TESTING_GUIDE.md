# 🧪 DealFlow360 — End-to-End Role-Based Testing Guide

This guide walks you through verifying the complete **Quotation-to-Cash & Governance lifecycle** across all **5 distinct user perspectives**:
1. 👨‍💼 **Sales Representative** (`rep1@dealflow360.com`)
2. 👔 **Sales Operations Manager** (`manager@dealflow360.com`)
3. 🌐 **B2B Customer (External Portal)** (Token-based link)
4. 📦 **Fulfillment & Operations Officer** (`admin@dealflow360.com`)
5. 💰 **Finance Officer** (`finance@dealflow360.com`)

---

## 🔑 Demo Credentials Matrix

> **Default Password for all demo accounts:** `Password123!`

| Role | Email | Password | Primary Testing Focus |
|---|---|---|---|
| **Sales Rep** | `rep1@dealflow360.com` | `Password123!` | Quote Builder, Live Upsell, Margin Calculation, Approval Submission |
| **Sales Manager** | `manager@dealflow360.com` | `Password123!` | Governance Queue, Risk Scoring, Discount Approvals, Audit Logs |
| **Customer** | *(No login required)* | *Via Portal Token* | Live Review, Line Counter-Offers, Negotiation Chat, Order Confirmation |
| **Operations** | `admin@dealflow360.com` | `Password123!` | Warehouse Splitting, Backorder Management, Shipping Allocation |
| **Finance** | `finance@dealflow360.com` | `Password123!` | Hybrid Billing, Invoicing, Recurring Subscriptions, Payment Ledger |

---

## 🚀 Pre-requisite: Start the Application

1. Make sure your PostgreSQL database `dealflow360` is running.
2. Launch the full stack:
   ```cmd
   .\start-all.bat
   ```
3. Open **Frontend:** `http://localhost:3000` (Backend runs on `http://localhost:8080/api`).

---

# 🔄 Step-by-Step End-to-End Testing Workflow

```
┌─────────────────────────┐
│ 1. Sales Rep            │ ──► Creates Quote, adds Products, tests Live Upsell,
│ (rep1@dealflow360.com)  │     sets high discount (>15%), submits for Approval
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 2. Sales Manager        │ ──► Inspects Risk Score (Medium/High), reviews discount
│ (manager@dealflow360.com│     thresholds, adds decision note & APPROVES quote
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 3. External Customer    │ ──► Opens Portal Token link, chats/negotiates discount,
│ (Public Customer Portal)│     clicks "Accept & Confirm Order"
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 4. Operations           │ ──► Reviews automated Multi-Warehouse Split (East/West),
│ (admin@dealflow360.com) │     verifies Backorder detection, approves fulfillment
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 5. Finance              │ ──► Inspects Hybrid Invoice (One-time + Subscription),
│ (finance@dealflow360.com│     records payment, tracks active Subscription schedule
└─────────────────────────┘
```

---

## 📍 Scenario 1: Sales Representative (`rep1@dealflow360.com`)

### Objective: Build a hybrid quotation, trigger discount governance, test upsell engine, and submit for approval.

1. **Log In:**
   - Go to `http://localhost:3000/login`.
   - Enter `rep1@dealflow360.com` / `Password123!`.
   - You land on the **Dashboard** showing personal pipeline metrics.

2. **Create a New Quotation:**
   - Click **Quotations** in the sidebar (or top navigation).
   - Click **+ New Quotation**.
   - Select Customer: **Acme Corp** (Tier: `GOLD`, Min Margin Floor: `25%`).

3. **Add Line Items:**
   - **Line 1 (Hardware):** Select `Laptop Pro 14` | Quantity: `10` | Unit Price: `$1,200`.
   - **Line 2 (Recurring Subscription):** Select `Cloud Backup Enterprise` | Quantity: `10` | Billing: `Monthly` | Unit Price: `$45/mo`.
   - **Line 3 (Service):** Select `On-Site Implementation` | Quantity: `1` | Unit Price: `$2,500`.

4. **Verify Live Upsell Recommendations:**
   - Look at the **Upsell & Cross-Sell Drawer / Banner** on the right side.
   - You will see recommended add-ons (e.g. *3-Year Extended Warranty* or *USB-C Thunderbolt Dock*).
   - Click **Add to Quote** — observe the item added with special promotional bundle discount.

5. **Test Discount Governance & Risk Scoring:**
   - On the `Laptop Pro 14` line item, set **Discount % to 22%** (Category ceiling is 15%).
   - **Observation:**
     - A warning badge appears: *"Exceeds Hardware Category Discount Cap (15%)"*.
     - The **Blended Risk Score** indicator updates to **MEDIUM / HIGH** (Amber/Red).
     - Margin calculation updates in real time.

6. **Submit for Governance Approval:**
   - Click **Submit for Approval**.
   - Notice the status updates to `PENDING_APPROVAL`.
   - Log out (click profile in top right ➔ Logout).

---

## 📍 Scenario 2: Sales Manager (`manager@dealflow360.com`)

### Objective: Review governance queue, analyze risk breakdown, and approve the deal.

1. **Log In:**
   - Go to `http://localhost:3000/login`.
   - Enter `manager@dealflow360.com` / `Password123!`.

2. **Review Pending Approvals:**
   - Click **Approvals** in the sidebar.
   - You will see the pending quotation submitted by `rep1` at the top of the queue.
   - Click on the quotation row to view details.

3. **Inspect Governance & Risk Breakdown:**
   - Verify the **Risk Score card**:
     - Highlights line item discount violation (22% vs 15% limit).
     - Displays Customer Tier: Gold, Total Deal Value, and Deal Margin %.

4. **Take Governance Action:**
   - Click **Approve**.
   - In the modal, add note: *"Approved 22% hardware discount for Gold Tier annual volume commitment"*.
   - Click **Confirm Decision**.
   - **Observation:**
     - Quotation status transitions to `APPROVED`.
     - An immutable entry is appended to the **Approval Audit Log** with timestamp and manager name.

---

## 📍 Scenario 3: B2B Customer (External Negotiation Portal)

### Objective: Test the token-based customer negotiation interface without logging in.

1. **Access Customer Portal:**
   - In the Quotation detail view (or from database `portal_token`), copy the portal link.
   - Example format: `http://localhost:3000/portal/token-acme-1001` (or click **Copy Portal Link**).
   - Open this link in an **Incognito Window** or separate browser.

2. **Customer Review Experience:**
   - Notice the clean customer-facing branded view.
   - Shows line items (Hardware, Implementation, Subscription).
   - Highlights approved discounts and payment terms.

3. **Post Negotiation Feedback / Counter-Offer:**
   - In the **Negotiation Chat / Comments** section:
     - Type: *"Can we get net-45 payment terms instead of net-30?"*
     - Enter Counter-Discount (Optional): `5%` on implementation.
     - Click **Send Message**.
   - The message immediately appears on the discussion timeline.

4. **Accept & Confirm Order:**
   - Click **Accept Quotation & Confirm Order**.
   - Confirm in the dialog.
   - **Observation:**
     - Status updates to `CONFIRMED`.
     - Order is locked and automatically sent to Fulfillment & Invoicing.

---

## 📍 Scenario 4: Operations & Fulfillment (`admin@dealflow360.com`)

### Objective: Verify multi-warehouse splitting, stock reservation, and backorder detection.

1. **Log In:**
   - Log in as `admin@dealflow360.com` / `Password123!`.
   - Go to **Fulfillment** in the sidebar (`/fulfillment`).

2. **Inspect Warehouse Split Order:**
   - Find the confirmed quote.
   - Notice the **Multi-Warehouse Allocation Plan**:
     - **Warehouse East (US-East):** Allocates 6 units of Laptop Pro (available stock).
     - **Warehouse West (US-West):** Allocates 4 units of Laptop Pro.
     - **Backorder Detection:** If quantity requested exceeds total inventory, an alert card marks remaining units with `is_backorder = true` and shows estimated restock date.

3. **Accept Fulfillment Plan:**
   - Review the calculated shipping costs and split allocations.
   - Click **Accept Fulfillment Split** (or test manual override).
   - Status transitions to `SPLIT_PENDING` / `FULFILLED`.

---

## 📍 Scenario 5: Finance Officer (`finance@dealflow360.com`)

### Objective: Verify hybrid invoicing, recurring subscription schedule, and payment recording.

1. **Log In:**
   - Log in as `finance@dealflow360.com` / `Password123!`.

2. **Inspect Hybrid Invoices (`/invoices`):**
   - Navigate to **Invoices**.
   - Open the newly generated invoice for Acme Corp.
   - Verify breakdown:
     - **One-Time Line Items:** Laptops + Implementation fee.
     - **Recurring Line Items:** Cloud Backup Enterprise subscription.

3. **Record Customer Payment:**
   - Click **Record Payment**.
   - Enter Amount: Full or partial (e.g. `$5,000`).
   - Payment Method: `BANK_TRANSFER` | Reference: `WIRE-2026-9812`.
   - Click **Submit Payment**.
   - **Observation:** `amount_paid` updates, and invoice status shifts from `UNPAID` to `PARTIAL` or `PAID`.

4. **Verify Active Subscriptions (`/subscriptions`):**
   - Navigate to **Subscriptions**.
   - Verify that Acme Corp's **Cloud Backup Enterprise** subscription is created with status `ACTIVE`, billing cycle `MONTHLY`, start date, and next billing date.

---

## 📍 Scenario 6: Deal Health & Anomaly Monitoring (`/deal-health`)

### Objective: Test AI-driven/rule-based deal health flags and proactive intervention.

1. **Log In:**
   - Log in as `manager@dealflow360.com` or `admin@dealflow360.com`.
   - Go to **Deal Health** (`/deal-health`).

2. **Review Real-Time Anomaly Cards:**
   - **Stalled Deals:** Quotes with no activity for > 7 days.
   - **Discount Outliers:** Deals with abnormal discounts compared to customer history.
   - **Delivery Slippage:** Backordered orders nearing SLA fulfillment deadline.

3. **Take Action:**
   - Click **Nudge Rep** on a stalled deal ➔ Sends notification / logs intervention.
   - Click **Resolve Alert** ➔ Records resolution action taken in `deal_health_alerts` table.

---

## ✅ Summary Verification Checklist

| Test Step | Expected Result | Pass/Fail |
|---|---|:---:|
| **1. Auth & JWT** | Login succeeds with role-specific navigation | [ ] |
| **2. Quote Builder** | Calculates margin, subtotal, tax, and total accurately | [ ] |
| **3. Live Upsell** | Suggests valid complementary items with bundled margin impact | [ ] |
| **4. Discount Governance** | Flags violations > category/tier thresholds and calculates risk score | [ ] |
| **5. Approval Routing** | Routes to Manager/Finance; logs immutable decision audit trail | [ ] |
| **6. Customer Portal** | Token access works without login; allows comment and counter-offers | [ ] |
| **7. Order Confirmation** | Locks quote and transitions to `CONFIRMED` | [ ] |
| **8. Multi-Warehouse Split** | Allocates stock across regional warehouses and flags backorders | [ ] |
| **9. Hybrid Invoicing** | Separates one-time from recurring subscription periods | [ ] |
| **10. Payment Ledger** | Records payment and reconciles amount due | [ ] |
| **11. Deal Health Alerts** | Flags stalled quotes and anomaly conditions with resolution actions | [ ] |
