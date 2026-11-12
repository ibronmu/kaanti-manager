markdown
# Kaanti Manager

**Manage. Grow. Prosper.**

A modern, secure SME financial management and financial inclusion platform for Nigerian businesses.
Built with Next.js (frontend), Express (backend), Prisma, and PostgreSQL.

## Repository Layout
kaanti-manager/
├── apps/
│ ├── web/ # Next.js frontend
│ └── api/ # Express backend + Prisma schema
├── packages/
│ └── shared/ # Shared types & constants
├── package.json # npm workspaces root
└── README.md

text

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (running locally or managed)
- npm 10+

## Local setup

```bash
# 1. Install dependencies (from repo root)
npm install

# 2. Copy env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

# 3. Edit apps/api/.env — set DATABASE_URL and JWT secrets.

# 4. Create the database + run migrations + seed demo data
cd apps/api
npx prisma migrate dev --name init
npx prisma db seed
cd ../..

# 5. Start both apps
npm run dev
Frontend: http://localhost:3000

Backend: http://localhost:4000

API docs: http://localhost:4000/api/docs

Demo login: demo@kaanti.app / Password123!

Phase 1 — Foundation (this milestone)
Deliverable	Status
Monorepo structure	✅
Next.js frontend	✅
Express backend	✅
PostgreSQL via Prisma	✅
Initial schema + migrations	✅
Registration + login	✅
Business onboarding	✅
Responsive dashboard shell	✅
Swagger API docs	✅
README + env examples	✅
API Endpoints (Phase 1)
All endpoints under /api/v1.

Method	Path	Auth	Description
POST	/auth/register	❌	Create account
POST	/auth/login	❌	Log in (sets cookies)
POST	/auth/refresh	🔑	Rotate refresh token
POST	/auth/logout	❌	Revoke refresh token
GET	/businesses	✅	List businesses I belong to
POST	/businesses	✅	Create business (onboarding)
GET	/businesses/:businessId	✅	Get business
PATCH	/businesses/:businessId	✅	Update business
✅ = JWT required (Bearer or cookie) · 🔑 = refresh token required

Database models (Phase 1)
User, RefreshToken, Business, BusinessMember,
IncomeCategory, ExpenseCategory, Transaction,
InventoryItem, Customer, FinancialReport,
PartnerInstitution, FinancingProduct, InvestmentProduct,
FinancingInterest, ConsentRecord, AuditLog.

All models use UUID primary keys, Decimal(18,2) for money,
createdAt/updatedAt timestamps and ON DELETE CASCADE where appropriate.

Security summary
Passwords hashed with bcrypt (12 rounds).

JWT access tokens (15 min) + rotating refresh tokens (30 days).

Refresh tokens are stored hashed (SHA-256), revocable.

HTTP-only cookies + bearer header support.

Helmet, CORS restricted to the configured client origin.

Rate limiting on auth endpoints (20 req / 15 min) and API (300 req / min).

Zod validation on every input.

Business-level access control via requireBusinessAccess.

Environment variables
apps/api/.env
text
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kaanti?schema=public
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d
CLIENT_ORIGIN=http://localhost:3000
apps/web/.env.local
text
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
Not yet implemented (planned)
Phase 2: income/expense recording, transaction history, dashboard calculations, reports (PDF/CSV), inventory, customers.

Phase 3: financing discovery, investment discovery, Kaanti Learn, English/Hausa localisation, financial readiness summary.

Phase 4: full testing suite, performance tuning, accessibility audit, deployment.

Compliance notes
All financing/investment products in the database are seeded with isDemo=true and clearly marked [DEMO].

Kaanti Manager does not approve credit, custody investments, or act as an intermediary; users are directed to authorised providers.

No personal financial data is shared without consent (ConsentRecord).

text

---

## Step 5 — Running Locally (Verification Checklist)

Once you've created the files above:

```bash
# From repo root
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
# edit apps/api/.env with your DATABASE_URL & JWT secrets

cd apps/api
npx prisma migrate dev --name init
npx prisma db seed
cd ../..
npm run dev
Then confirm:

Frontend loads → http://localhost:3000 shows the landing page.

Swagger loads → http://localhost:4000/api/docs shows all endpoints.

Register → /register creates a user (check the Prisma Studio to verify).

Login → /login succeeds and redirects to /dashboard.

Onboarding → first visit to /dashboard bounces to /onboarding; submitting creates a Business + BusinessMember + default categories.

Dashboard renders with the new business name after onboarding.

Auth guard works → visiting /dashboard after clearing cookies redirects to /login.

API tests → cd apps/api && npm test passes the three auth tests.

Notes, Trade-offs & What Was Deferred
Auth on the client uses credentials: "include" so the HTTP-only cookies are used directly. Bearer token also works, so the frontend can be swapped to a non-cookie model later without backend changes.

Business selection is single-business for now — useBusinesses reads all memberships, but the dashboard uses businesses[0]. A proper business switcher lands in Phase 2, backed by a X-Business-Id header or URL parameter.

Email verification is modelled in the schema (emailVerifyTok, emailVerified) but the send-email integration is deferred — wiring to a transactional email provider (e.g. Resend/Postmark) is a Phase 1.5 task.

AuditLog is modelled but writes will be added alongside Phase 2 transactions.

PDF/CSV exports, chart rendering (Recharts), and the fuller dashboard are deferred to Phase 2 to keep Phase 1 shippable and reviewable.

The @kaanti/shared package is used by both apps for shared enums (BUSINESS_CATEGORIES, NIGERIAN_STATES, UserRole) — it prevents drift between frontend validation and backend enums.



