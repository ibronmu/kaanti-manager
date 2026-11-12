GUIDE.md
Kaanti Manager — Team Development Guide

Read this before touching the codebase. It explains how we work, where things live, and what is expected from every commit.

Table of Contents
What We're Building

Team Ground Rules

First-Time Setup

Repository Map

Daily Development Workflow

Git & Pull Request Workflow

Coding Standards

Backend Guidelines

Frontend Guidelines

Database & Migrations

Authentication & Security Rules

Testing Requirements

Environments & Secrets

Common Tasks (Recipes)

Definition of Done

Troubleshooting

1. What We're Building
Kaanti Manager is an SME financial management and financial inclusion platform for Nigerian businesses.

Currency: ₦ (NGN) — always Decimal(18,2) in the DB, never float.

Primary market: Northern Nigeria; English + Hausa.

Core principle: we help businesses record, understand, and discover. We do not approve credit, hold funds, or provide financial advice.

The four modules (order of priority):

Module	Scope	Phase
A — Business Management	Transactions, dashboard, reports, inventory, customers	2
B — Financing Discovery	Directory of Shariah-compliant products from authorised partners	3
C — Investment Discovery	Informational directory only — no custody, no funds	3
D — Kaanti Learn	Financial education, English + Hausa	3
We are currently in Phase 1 (Foundation) — auth, onboarding, dashboard shell, DB.

2. Team Ground Rules
Never commit to main. All work goes through PRs.

Never commit secrets. All secrets live in .env (which is git-ignored) or your hosting provider's secret store.

Never push real customer data. All seed and test data must be [DEMO] marked.

Never build regulated features (lending decisions, custody, transfers) without written sign-off from the product owner and a compliance review.

Never mock a financial figure in the frontend. All totals, balances, and calculations are computed on the backend.

All display of financial products must carry the isDemo=true banner until a real partnership is signed.

Ask before adding a dependency to either workspace — surprise dependencies are a common source of bundle bloat and security risk.

When in doubt, prefer boring. We are building for low-bandwidth Android devices on 2G/3G. Every kilobyte matters.

3. First-Time Setup
Prerequisites
Node.js 20+ (node -v should show v20.x or later)

PostgreSQL 14+ (locally installed, Docker, or managed)

Git configured with your work email

VS Code recommended (see recommended extensions below)

One-time commands
bash
git clone <repo-url> kaanti-manager
cd kaanti-manager

# Install all workspaces
npm install

# Copy env templates
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

# Create a local Postgres database (example)
createdb kaanti

# Edit apps/api/.env → set DATABASE_URL and JWT secrets (any random string locally)
# Edit apps/web/.env.local → NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# Apply schema + seed demo data
cd apps/api
npx prisma migrate dev --name init
npx prisma db seed
cd ../..

# Run both apps
npm run dev
Sanity check
Frontend → http://localhost:3000 ✅

Backend → http://localhost:4000/health → {"success":true,"message":"ok"} ✅

Swagger → http://localhost:4000/api/docs ✅

Demo login → demo@kaanti.app / Password123! ✅

Recommended VS Code extensions
ESLint

Prettier

Prisma

Tailwind CSS IntelliSense

Error Lens

4. Repository Map
text
kaanti-manager/
├── apps/
│   ├── web/                       Next.js 14 (App Router)
│   │   ├── app/
│   │   │   ├── (auth)/            Register / Login / Reset routes
│   │   │   ├── (dashboard)/       Authenticated shell + module pages
│   │   │   ├── layout.tsx         Root layout
│   │   │   └── page.tsx           Marketing landing page
│   │   ├── lib/                   api.ts, session.ts, utils
│   │   ├── components/            Reusable UI
│   │   └── .env.local             (git-ignored)
│   │
│   └── api/                       Express + Prisma
│       ├── src/
│       │   ├── config/env.ts      Env validation
│       │   ├── controllers/       HTTP layer only
│       │   ├── middleware/        auth, validate, error, rateLimit
│       │   ├── routes/            Route registration
│       │   ├── services/          Business logic (no req/res)
│       │   ├── validators/        Zod schemas
│       │   ├── utils/             prisma, tokens, errors
│       │   ├── docs/              OpenAPI spec
│       │   ├── app.ts             Express app factory
│       │   └── server.ts          Entry point
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       ├── tests/                 Jest + Supertest
│       └── .env                   (git-ignored)
│
├── packages/
│   └── shared/                    Types & constants shared by both apps
│
├── package.json                   Root workspace scripts
├── README.md
└── GUIDE.md                       This file
Golden rule of file placement:

New API endpoint → routes/ → controllers/ → services/ → validators/

New UI page → app/(dashboard)/<name>/page.tsx

New reusable UI → components/<area>/<Component>.tsx

New shared type → packages/shared/src/index.ts

5. Daily Development Workflow
bash
# 1. Pull latest main
git checkout main
git pull

# 2. Create a feature branch
git checkout -b feat/transactions-list

# 3. Start dev servers (both in one terminal)
npm run dev

# 4. Work. Commit small and often with conventional messages.

# 5. Before pushing, run the check suite:
npm run lint --workspaces
cd apps/api && npm test && cd ../..
cd apps/web && npm run build && cd ../..

# 6. Push and open a PR
git push -u origin feat/transactions-list
Useful root scripts
Command	What it does
npm run dev	Starts web + api together
npm run dev:web	Frontend only
npm run dev:api	Backend only
npm run build	Builds all workspaces
npm run lint	Lint all workspaces
6. Git & Pull Request Workflow
Branch naming
Type	Pattern	Example
Feature	feat/<scope>	feat/transactions-list
Bug fix	fix/<scope>	fix/login-redirect
Refactor	refactor/<scope>	refactor/auth-service
Docs	docs/<scope>	docs/api-endpoints
Chore	chore/<scope>	chore/bump-prisma
Commit messages (Conventional Commits)
text
feat(transactions): add list endpoint with filters
fix(auth): rotate refresh token on 401
refactor(api): extract business membership check
docs(guide): add migration workflow
First line ≤ 72 characters, imperative present tense.

Body (optional) explains the why, not the what.

Never commit .env, .next, node_modules, or dist.

PR rules
One logical change per PR. No "while I was here" edits.

PR description template:

text
## What
Short summary of what changed.

## Why
The problem this solves. Link issue if applicable.

## How to test
Steps a reviewer can follow.

## Screenshots (UI only)
Before / after.

## Checklist
- [ ] Types pass (tsc)
- [ ] Lint passes
- [ ] Tests added/updated
- [ ] No console.log or debug code
- [ ] Env changes documented
Review SLA: a reviewer responds within one working day.

Squash merge into main. No merge commits from feature branches.

7. Coding Standards
General
TypeScript everywhere. No any unless you've thought hard about it. Prefer unknown + a narrowing function.

No floating point for money. Use Prisma.Decimal in the backend and format to a string in the frontend. Never 0.1 + 0.2.

No hardcoded URLs — always use process.env.NEXT_PUBLIC_API_URL / env.clientOrigin.

No console.log in committed code. Use a structured logger when we add one; until then, delete your debug lines.

No dead code, commented-out blocks, or TODOs without an issue number. // TODO(#123): ...

Naming
Files: kebab-case.ts / PascalCase.tsx for React components.

DB tables: PascalCase model names, camelCase fields, per Prisma convention.

Env vars: UPPER_SNAKE_CASE.

API paths: plural, kebab-case (/financing-products, /businesses/:businessId).

API fields: camelCase on the wire (preferredLanguage, not preferred_language).

File headers
Every service and controller file starts with a one-line JSDoc describing its responsibility. Example:

ts
/**
 * Auth service — handles user registration, login, refresh rotation, logout.
 * Pure business logic. Must not import Express types.
 */
Error handling
Backend: throw AppError(message, status) from utils/errors.ts. Never throw new Error from a controller.

Frontend: catch ApiError (from lib/api.ts) and surface a friendly message.

8. Backend Guidelines
Layer responsibilities
Layer	May do	May NOT do
routes/	Register paths, attach middleware	Contain logic
controllers/	Read req, call service, set response	Query the DB directly
services/	All DB access, all business rules	Import Express (Request, Response)
validators/	Zod schemas	Perform side-effects
middleware/	Cross-cutting concerns	Contain domain logic
Standard response shape
json
{ "success": true,  "message": "Transaction recorded", "data": { } }
{ "success": false, "message": "Validation failed", "errors": { "amount": ["Required"] } }
Status codes we use
Code	When
200	Successful read / update / delete
201	Successful create
400	Bad input shape / missing param
401	No token, expired token, invalid credentials
403	Authenticated but not allowed (other business)
404	Resource not found
409	Conflict (duplicate email, etc.)
422	Zod validation failure
429	Rate limited
500	Unhandled — will always be logged
Adding a new endpoint — checklist
Create/update validators/<resource>.validators.ts (Zod).

Add the service function in services/<resource>.service.ts.

Add a controller function in controllers/<resource>.controller.ts.

Register the route in routes/<resource>.routes.ts with requireAuth + validate + requireBusinessAccess as needed.

Update docs/openapi.ts with the new path.

Add a Supertest in tests/<resource>.test.ts.

Business isolation (non-negotiable)
Every business-scoped endpoint must go through requireBusinessAccess. If you find yourself writing prisma.transaction.findMany({ where: { businessId } }) without first checking membership, stop. That's a data-leak bug.

9. Frontend Guidelines
Structure rules
App Router only. No pages/ directory. No getServerSideProps.

Client components (with "use client") are the exception, not the rule. Use them when you need state, effects, or browser APIs.

Fetching data: use the api helper from lib/api.ts. Never raw fetch outside that file.

No API secrets in the frontend. Only NEXT_PUBLIC_* env vars reach the browser.

Component conventions
Compose small. A page should be under ~150 lines. Extract sections into components/.

Every async action has four states: idle → loading → success/error. Show a spinner, disable the button, and display a friendly error. No silent failures.

Forms use react-hook-form + zodResolver. Server-side Zod is the source of truth; mirror it on the client for good UX.

Icons from lucide-react only — no emoji in production UI.

Charts from recharts only. All chart data is derived from backend responses — never computed client-side from raw lists.

Styling
Tailwind only. No CSS modules, no styled-components.

Design tokens (defined in tailwind.config.ts):

navy (primary), emerald (brand), teal (secondary), gold (highlight), offwhite (background).

Use the utility classes in globals.css: .btn-primary, .btn-secondary, .input, .label, .card. If you find yourself duplicating Tailwind strings, add a utility.

Mobile-first. Every new layout must be checked at 360×640 (small Android) before opening a PR.

Accessibility: inputs have <label>, buttons have text or aria-label, color contrast meets WCAG AA.

Data fetching pattern
tsx
const [data, setData] = useState<T | null>(null);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  api.get<T>("/resource")
    .then(setData)
    .catch((e) => setError(e instanceof ApiError ? e.message : "Something went wrong"));
}, []);

if (error) return <ErrorCard message={error} />;
if (!data) return <LoadingCard />;
return <ResourceView data={data} />;
10. Database & Migrations
The only way to change the schema
Edit apps/api/prisma/schema.prisma.

Run npx prisma migrate dev --name <descriptive_name> — this creates a new migration file and applies it locally.

Commit the migration folder (prisma/migrations/<timestamp>_<name>/). Never edit existing migrations after merge.

Update seed.ts if the change affects demo data.

Tell the team in #dev — everyone needs to run npx prisma migrate dev on their next pull.

Schema rules
UUID primary keys. @id @default(uuid()).

createdAt + updatedAt on every business model.

Money = Decimal @db.Decimal(18, 2). Never Float, never Int for currency.

Enums for closed sets (UserRole, TransactionType, Language).

Every FK has an index. Add @@index([foreignKey]) unless it's already in a unique constraint.

onDelete: Cascade for child records that cannot exist alone (transactions → business). onDelete: Restrict if the parent must not disappear (a customer with transactions).

Composite uniques for things like @@unique([businessId, name]) on categories.

Seed data rules
All partners and products must have isDemo: true and a [DEMO] prefix in their name.

Seed must be idempotent — use upsert with fixed UUIDs, not create.

npx prisma db seed should always result in the same final state.

Inspecting the DB
bash
cd apps/api
npx prisma studio     # opens http://localhost:5555
Reset locally (destroys your data)
bash
cd apps/api
npx prisma migrate reset
⚠️ Never run migrate reset against staging or production.

11. Authentication & Security Rules
How auth works here
Login → backend sets two HTTP-only cookies (access_token, refresh_token) and returns an accessToken in the body.

Refresh tokens are stored hashed (SHA-256) in the DB with an expiry. On refresh, the old token is revoked and a new one issued (rotation).

Logout revokes the refresh token server-side and clears cookies.

Business access is checked on every business-scoped request via BusinessMember.

Things you must never do
❌ Log a password, token, or full request body of /auth/*.

❌ Put a JWT in localStorage — we use HTTP-only cookies on purpose.

❌ Return the passwordHash or refreshToken field in any API response.

❌ Accept a userId from the client to select whose data to fetch. Always use req.user.id.

❌ Trust a businessId from the client without calling requireBusinessAccess.

❌ Add Access-Control-Allow-Origin: *.

❌ Send real user data to any third party (email provider, analytics, etc.) without a ConsentRecord entry.

When adding a new endpoint, ask yourself
Does it require a logged-in user? → attach requireAuth.

Does it touch business data? → attach requireBusinessAccess.

Does it accept a body? → attach validate(schema).

Is it sensitive (auth, password reset, payments)? → add a tighter rate limiter.

Will it be logged? → check what's in the log line (no PII, no tokens).

12. Testing Requirements
Backend (required)
Every new route gets at least one Supertest in apps/api/tests/.

Every new service function with non-trivial logic gets a unit test.

Every auth or permission change gets a test proving the negative case (wrong user → 403).

Frontend (required for logic)
Extract pure logic (calculations, formatters, guards) into lib/ so it's testable without a DOM.

Component tests are optional in Phase 1, required from Phase 2 for forms.

Running tests
bash
cd apps/api && npm test
Tests use the same database as local dev by default. Use a dedicated test database via DATABASE_URL_TEST when we add CI. For now: tests clean up after themselves (see tests/auth.test.ts).

13. Environments & Secrets
Environment	Frontend URL	API URL	DB
Local	http://localhost:3000	http://localhost:4000	Local Postgres
Staging	(TBD)	(TBD)	Managed Postgres
Production	(TBD)	(TBD)	Managed Postgres
Secrets policy
Local: .env files, git-ignored.

Staging/Prod: managed by the hosting provider (Vercel env vars / backend host secrets).

Never paste a real secret into Slack, a PR description, or a screenshot.

If a secret is accidentally committed: rotate it immediately, then notify the team.

Required env vars
Backend (apps/api/.env)

text
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public
JWT_ACCESS_SECRET=<32+ random chars>
JWT_REFRESH_SECRET=<32+ random chars, DIFFERENT from access>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d
CLIENT_ORIGIN=http://localhost:3000
Frontend (apps/web/.env.local)

text
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
Generate random secrets with:

bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
14. Common Tasks (Recipes)
Add a new business-scoped resource (e.g. suppliers)
Add Supplier model to schema.prisma with businessId FK + index.

npx prisma migrate dev --name add_suppliers.

validators/supplier.validators.ts — create + update Zod schemas.

services/supplier.service.ts — create, list, get, update, delete, each taking businessId.

controllers/supplier.controller.ts — thin wrappers.

routes/supplier.routes.ts — router.use(requireAuth) then per-route requireBusinessAccess.

Register the router in app.ts under /api/v1/suppliers.

Add to docs/openapi.ts.

Test in tests/supplier.test.ts.

Frontend page in app/(dashboard)/suppliers/page.tsx.

Add a new field to an existing model
Edit schema.prisma.

npx prisma migrate dev --name add_<field>_to_<model>.

Update the Zod validator.

Update the DTO in packages/shared if the frontend uses it.

Update the seed if demo data needs the field.

Update the UI forms that touch this model.

Debug a failing auth request
Check the browser devtools → Network → cookies for access_token.

Check the API logs (terminal). A 401 means the token is missing, expired, or signed with a different secret.

If the JWT secret was rotated, everyone is logged out — expected.

Confirm CLIENT_ORIGIN in .env matches the frontend URL exactly (no trailing slash).

Add a new shared type
Edit packages/shared/src/index.ts.

Both apps pick it up automatically (via transpilePackages for web, and workspace resolution for api).

15. Definition of Done
A PR is only ready to merge when all of these are true:

□ Code compiles (tsc passes for both apps).
□ Lint passes (npm run lint).
□ New tests exist and pass.
□ No console.log, no commented-out code, no TODOs without an issue number.
□ All new env vars documented in .env.example and in this guide if relevant.
□ All new endpoints documented in docs/openapi.ts.
□ New DB migrations committed.
□ UI changes tested at 360px width.
□ Error, loading, and empty states are visible on any new page.
□ Reviewer approved.
□ PR description filled in.
16. Troubleshooting
Symptom	Likely cause	Fix
Missing env var: DATABASE_URL	.env not copied	cp apps/api/.env.example apps/api/.env
P1001: Can't reach database server	Postgres not running	Start Postgres or check DATABASE_URL
P2002 Unique constraint failed	Re-running seed with different IDs	Use upsert; check seed is idempotent
401 on every request after fresh pull	JWT secrets changed	Update .env with the new secrets
CORS error in browser	CLIENT_ORIGIN mismatch	Must exactly equal http://localhost:3000 (no trailing slash)
Cookies not being sent	Frontend fetch missing credentials: "include"	Use the api helper from lib/api.ts
next build fails on shared types	transpilePackages missing	Add the package to next.config.mjs
prisma generate out of sync	Schema changed without generating	npx prisma generate
Dashboard redirects to /login repeatedly	Cookies blocked or API unreachable	Check network tab; confirm API is running
Getting Help
Code questions: open a draft PR or ask in #dev.

Product questions: tag the product owner, don't guess.

Compliance / regulated feature questions: stop and ask before writing code.

Security concern: report privately, do not open a public issue.

Welcome to the team. Ship carefully. 🚀