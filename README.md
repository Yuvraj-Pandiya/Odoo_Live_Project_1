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

# Run schema + seed
& $pg -U postgres -d dealflow360 -f "database\schema.sql"
& $pg -U postgres -d dealflow360 -f "database\seed.sql"
& $pg -U postgres -d dealflow360 -f "database\fix_passwords.sql"
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
