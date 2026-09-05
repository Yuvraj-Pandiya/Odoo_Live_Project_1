# DealFlow360 — Intelligent Sales Operations Platform

> **Hackathon MVP** | Java Spring Boot + Next.js + PostgreSQL

## Overview
DealFlow360 is a self-governing B2B sales platform covering the full quotation-to-cash lifecycle:
- Multi-tier discount governance with automated approval routing
- Live upsell/cross-sell recommendations with real-time margin impact
- Multi-warehouse fulfillment splitting with backorder handling
- Hybrid billing (one-time + recurring subscription lines)
- Deal health monitoring and anomaly alerts
- Customer-facing portal for live quotation negotiation

---

## Architecture

```
┌──────────────────┐    REST API     ┌─────────────────────┐
│  Next.js 14      │◄───────────────►│  Spring Boot 3.3.5  │
│  (Port 3000)     │                 │  (Port 8080)        │
│                  │                 │                     │
│  Pages:          │                 │  Modules:           │
│  /dashboard      │                 │  /api/auth          │
│  /quotations     │                 │  /api/quotations    │
│  /approvals      │                 │  /api/products      │
│  /fulfillment    │                 │  /api/customers     │
│  /deal-health    │                 │  /api/fulfillment   │
│  /customers      │                 │  /api/dashboard     │
│  /products       │                 │  /api/portal        │
│  /portal/[token] │                 └────────┬────────────┘
└──────────────────┘                          │ JPA/JDBC
                                              ▼
                                   ┌─────────────────────┐
                                   │  PostgreSQL 18       │
                                   │  Schema: dealflow    │
                                   │                     │
                                   │  Tables: 24         │
                                   │  ENUMs:  14         │
                                   │  Views:  2          │
                                   └─────────────────────┘
```

---

## Quick Start

### 1. Prerequisites
- Java 21 (JDK)
- Maven 3.9+ (or use `mvnw.cmd`)
- PostgreSQL 18 (running locally)
- Node.js 22+

### 2. Database Setup
```powershell
# Set PG password
$env:PGPASSWORD = "YOUR_PG_PASSWORD"
$pg = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

# Create DB
& $pg -U postgres -c "CREATE DATABASE dealflow360;"

# Run schema + 300-row seed
& $pg -U postgres -d dealflow360 -f "database\schema.sql"
& $pg -U postgres -d dealflow360 -f "database\seed_300.sql"

# Or seed programmatically using Python:
python database/generate_seed_300.py
```

### 3. Backend
```powershell
cd backend
$env:DB_PASSWORD = "YOUR_PG_PASSWORD"
$env:DB_URL = "jdbc:postgresql://localhost:5432/dealflow360"
$env:DB_USERNAME = "postgres"
$env:JWT_SECRET = "dealflow360-super-secret-key-at-least-32-chars!"
.\mvnw.cmd spring-boot:run
```

### 4. Frontend
```powershell
cd frontend
npm run dev
```

Open **http://localhost:3000**

---

## Demo Accounts

| Email | Password | Role |
|---|---|---|
| `admin@dealflow360.com` | `Password123!` | Admin |
| `manager@dealflow360.com` | `Password123!` | Sales Manager |
| `finance@dealflow360.com` | `Password123!` | Finance |
| `rep1@dealflow360.com` | `Password123!` | Sales Rep |

---

## Key Business Logic

### Blended Risk Score
```
score = worstLinePeak + (totalOverLimit × 0.5)
score ≥ 8  → HIGH    → Manager + Finance approval
score ≥ 5  → MEDIUM  → Manager only
score > 0  → LOW     → Manager only
score = 0  → AUTO-APPROVED
```

### Warehouse Split Algorithm
Greedy allocation: picks warehouse with highest available stock first,
weighted by `shipping_cost_weight` to minimize number of shipments.
Remaining quantity becomes a backorder with 7-day estimate.

### Portal Confirmation Re-entry
When customer confirms negotiated terms, system re-checks the blended
risk score. If it exceeds thresholds, the quotation auto-routes back
into the approval workflow before confirming the order.

---

## Project Structure
```
DealFlow360/
├── backend/          Java Spring Boot API
│   ├── src/main/java/com/dealflow360/
│   │   ├── entity/       JPA entities (24 tables)
│   │   ├── repository/   Spring Data JPA repos
│   │   ├── service/      Business logic + scoring
│   │   ├── controller/   REST endpoints
│   │   ├── security/     JWT auth
│   │   └── config/       Spring Security
│   └── pom.xml
├── frontend/         Next.js 14 App Router
│   ├── app/          Pages (dashboard, quotations, portal...)
│   ├── components/   Sidebar, AppLayout
│   └── lib/api.ts    Axios client
├── database/
│   ├── schema.sql    Full PostgreSQL schema with ENUMs
│   ├── seed.sql      Sample data
│   └── fix_passwords.sql
├── .env              Backend env template
├── MANUAL_SETUP.md   Setup instructions
└── README.md
```

---

## Security & User Governance

### 1. One-Time First-Admin Setup Wizard (`/setup`, `/api/setup/admin`)
On fresh deployments with zero administrators in `dealflow.users`:
1. Navigate to `/setup`.
2. Fill in the root Administrator details (Name, Work Email, Department, Password).
3. On submission, the backend atomically creates the primary `ADMIN` user, issues server-signed JWT session credentials, and logs the administrator into `/dashboard`.
4. **Permanent Lockout**: Once an administrator exists, `GET/POST /api/setup/admin` strictly returns `403 Forbidden` and `/setup` automatically redirects to `/login`.

### 2. Admin User Governance (`/admin/users`, `/api/admin/users`)
- **Internal Staff Provisioning**: Accessible strictly to users with `ADMIN` role. Provision Sales Representatives, Sales Managers, and Finance staff.
- **Temporary Passwords & Forced Password Change**: Provisioned users are assigned secure temporary credentials with `must_change_password = true`. Upon first login, users are required to establish their personal permanent password before accessing `/dashboard`.
- **Role Reassignment Guards**:
  - Administrators cannot alter their own role (prevents self-lockout or privilege escalation bypass).
  - The last active Administrator cannot be demoted or deactivated.
- **Audit Logging**: All administrative actions (`USER_CREATED`, `USER_UPDATED`, `ROLE_CHANGED`, `USER_DEACTIVATED`, `USER_REACTIVATED`, `PASSWORD_CHANGED`) are recorded in `dealflow.user_audit_logs`.

---

## What We'd Build Next
- Email notifications via SMTP (approval decisions, customer portal link)
- Swagger / OpenAPI documentation
- Docker Compose for one-command startup
- Full reports API with JPA Criteria filtering
- Mobile-responsive customer portal
- Multi-currency support with live FX rates
- Comprehensive unit + integration test suite
- Audit trail export (PDF/XLS)
- WebSocket live updates on approval status changes
