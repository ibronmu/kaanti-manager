GUIDE.md — Kaanti Manager Team Development Guide
Version 2.0 · reflects the actual state of the codebase after Phase 3 completion
Audience: every engineer touching this repo
Read this before your first commit

Table of Contents
What We're Building

Current Project Status

Prerequisites

First-Time Setup (fresh machine, start to finish)

Daily Development Workflow

Repository Map (actual state)

Backend Architecture

Frontend Architecture

Database & Migrations

Seeds (two scripts, no prisma.seed)

Authentication & Security Rules

i18n — English + Hausa

Known Code Quirks — read before editing

Git & PR Workflow

Coding Standards

Testing

Environments & Secrets

Common Tasks (recipes)

Windows-Specific Gotchas — READ THIS

Definition of Done

What's Left to Build

1. What We're Building
Kaanti Manager — an SME financial management and financial inclusion platform for Nigerian businesses.

Currency: NGN (₦), always Decimal(18,2) in the DB. Never floating point for money.

Market: Northern Nigeria first. Languages: English + Hausa.

Mission: help SMEs record, understand, and discover financial opportunities.

What we do not do:

Approve credit

Hold or custody funds

Provide personalised financial advice

Guarantee investment returns

What we do:

Bookkeeping (income/expense/inventory/customers)

Descriptive business insights

Directory of financing products offered by authorised partners

Informational directory of Shariah-compliant investment products

Financial education in English and Hausa

2. Current Project Status
Phase	Scope	Status
Phase 1 — Foundation	Auth, business onboarding, dashboard shell, DB	✅ Complete
Phase 2 — Business Management	Transactions, inventory, customers, reports	⚠️ Backend exists, UI stubs only
Phase 3 — Financial Inclusion	Financing, investments, Kaanti Learn, i18n, readiness	✅ Complete
Phase 4 — Testing & Deployment	Full test suite, performance, deployment	❌ Not started
What's fully working:

Registration, login, refresh, logout

Business onboarding (create + update)

Financing discovery (7 seeded products, all [DEMO])

Investment discovery (4 seeded products)

Kaanti Learn (9 lessons, EN + HA)

Financial readiness summary (5 indicators, honest, non-scoring)

Language switcher (EN / HA)

Dashboard shell + sidebar nav

What's stubbed:

Transactions, Inventory, Customers, Reports UIs are placeholder pages (backends exist)

Email verification (schema supports it, send-email not wired)

AuditLog writes (model exists, not being written yet)

Demo credentials: demo@kaanti.app / Password123!

3. Prerequisites
Everyone on the team must have:

Tool	Version	Install
Node.js	20+	https://nodejs.org or fnm/nvm
pnpm	9+ (we use 10.x)	corepack enable && corepack prepare pnpm@9 --activate
PostgreSQL	14+ (we test on 18)	https://www.postgresql.org/download/
Git	any recent	https://git-scm.com
Recommended:

VS Code + extensions: ESLint, Prettier, Prisma, Tailwind CSS IntelliSense, Error Lens

Windows: enable Developer Mode (Settings → Privacy & Security → For developers) — required for pnpm symlinks

Verify your setup:

powershell
node -v          # v20.x or higher
pnpm -v          # 9.x or 10.x
psql --version   # psql (PostgreSQL) 14+ (add bin to PATH — see §4.2)
4. First-Time Setup
Follow this exactly. Every step exists because we hit a bug skipping it.

4.1 Clone + install
powershell
git clone <repo-url> kaanti_manager
cd kaanti_manager
Before running pnpm install, confirm pnpm-workspace.yaml exists at the repo root:

powershell
Test-Path pnpm-workspace.yaml
True → proceed

False → create it. Contents exactly:

yaml
packages:
  - "apps/*"
  - "packages/*"

onlyBuiltDependencies:
  - "@prisma/client"
  - "@prisma/engines"
  - "prisma"
  - "bcrypt"
The onlyBuiltDependencies block is not optional. pnpm v10 blocks postinstall scripts by default. Without it, prisma generate produces a broken client and bcrypt won't compile its native binding.

Now install:

powershell
pnpm install
What success looks like:

text
Scope: all 4 workspace projects
.../node_modules/@prisma/engines postinstall$ node scripts/postinstall.js
.../node_modules/bcrypt install$ node-pre-gyp install --fallback-to-build
Done in ...
If it says "Scope: all 1 workspace projects" → pnpm-workspace.yaml isn't being read. See §19 (Windows Gotchas).

4.2 PostgreSQL setup
Find your Postgres install:

powershell
Get-ChildItem "C:\Program Files\PostgreSQL" -Directory -ErrorAction SilentlyContinue | Select-Object Name
You'll see a version folder (e.g. 18). Note it — replace 18 below with your actual version.

Add Postgres to your PATH (once, permanent):

powershell
[Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path", "User") + ";C:\Program Files\PostgreSQL\18\bin", "User")
Close and reopen PowerShell, then verify:

powershell
psql --version
Should print psql (PostgreSQL) 18.x.

Find or reset your Postgres password:

The password is whatever you set during installation. Test candidates:

powershell
$env:PGPASSWORD="postgres"; psql -U postgres -h localhost -c "SELECT 1;"
Try postgres, admin, password, root, 123456. The one that returns 1 is yours.

If none work → reset it:

Locate pg_hba.conf:

powershell
Get-ChildItem "C:\Program Files\PostgreSQL\18\data" -Filter "pg_hba.conf"
Open with notepad, find the two host all all ... scram-sha-256 lines, change scram-sha-256 → trust on both. Save.

Restart: Restart-Service postgresql-x64-18 (use your actual service name from Get-Service postgresql*)

Reset:

powershell
psql -U postgres -h localhost -c "ALTER USER postgres WITH PASSWORD 'kaanti_dev';"
Revert pg_hba.conf (trust → scram-sha-256). Save.

Restart again: Restart-Service postgresql-x64-18

If you don't have Postgres installed at all — Docker is 30 seconds:

powershell
docker run --name kaanti-pg -e POSTGRES_PASSWORD=kaanti_dev -e POSTGRES_DB=kaanti -p 5432:5432 -d postgres:16
4.3 Create the kaanti database
Using your real password (say kaanti_dev):

powershell
$env:PGPASSWORD="kaanti_dev"; psql -U postgres -h localhost -c "CREATE DATABASE kaanti;"
Expected: CREATE DATABASE

Verify:

powershell
$env:PGPASSWORD="kaanti_dev"; psql -U postgres -h localhost -P pager=off -c "\l"
Look for kaanti in the list. If you hit -- More --, press q.

4.4 Environment files
powershell
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.local.example apps\web\.env.local
Open apps\api\.env and set DATABASE_URL:

text
DATABASE_URL="postgresql://postgres:kaanti_dev@localhost:5432/kaanti?schema=public"
Also generate two random secrets and set them:

powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
Paste that into both JWT_ACCESS_SECRET and JWT_REFRESH_SECRET — run the command twice so they're different.

Warning — special-character passwords: if your Postgres password contains @ : / # ? % &, URL-encode inside DATABASE_URL:

Char	Encode
@	%40
:	%3A
/	%2F
#	%23
?	%3F
%	%25
&	%26
Open apps\web\.env.local — it should already have:

text
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
4.5 Migrate + seed
You must cd into apps\api first — this is a pnpm-on-Windows workaround (§19.2):

powershell
cd apps\api
powershell
pnpm exec prisma migrate dev --name init_clean
Expected:

text
Applying migration ...
Your database is now in sync with your schema.
✔ Generated Prisma Client
Verify all 18 tables + _prisma_migrations exist:

powershell
$env:PGPASSWORD="kaanti_dev"; psql -U postgres -h localhost -d kaanti -P pager=off -c "\dt"
You should see: AuditLog, Business, BusinessMember, ConsentRecord, Customer, ExpenseCategory, FinancialReport, FinancingInterest, FinancingProduct, IncomeCategory, InventoryItem, InvestmentProduct, Lesson, LessonTranslation, PartnerInstitution, RefreshToken, Transaction, User, plus _prisma_migrations.

If you only see 6 tables → the migration is stale. Do §9.4 (reset).

Now run the seeds (two scripts — see §10):

powershell
pnpm exec ts-node prisma\seed.ts
Expected: Seed complete. Demo user: demo@kaanti.app / Password123!

powershell
pnpm exec ts-node prisma\seed-phase3.ts
Expected:

text
Phase 3 seed complete:
  2 partners
  6 financing products
  4 investment products
  9 lessons (EN + HA)
4.6 Run
powershell
cd ..\..
powershell
pnpm dev
Expected:

text
apps/api dev:  API listening on http://localhost:4000
apps/api dev:  Swagger docs: http://localhost:4000/api/docs
apps/web dev:  ✓ Ready in Xs
4.7 Smoke test
In a second terminal:

powershell
$body = @{ email = "demo@kaanti.app"; password = "Password123!" } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri "http://localhost:4000/api/v1/auth/login" -ContentType "application/json" -Body $body
$token = $login.data.accessToken
Write-Host "Token: $($token.Substring(0,20))..."
Should print Token: eyJhbGci...

Then in the browser (use an incognito window to avoid extension noise):

URL	Expected
http://localhost:3000	Marketing landing page
http://localhost:3000/login	Login form
Login with demo creds → /dashboard	Dashboard loads, sidebar shows 9 nav items
http://localhost:3000/financing	7 demo products with [DEMO] badges
http://localhost:3000/investments	4 demo products
http://localhost:3000/learn	9 lessons
http://localhost:3000/readiness	5 indicators + disclaimer
Click HA in header	Page reloads with Hausa nav
If all 8 pass, your environment is correct. You can start contributing.

5. Daily Development Workflow
powershell
# Every morning
git checkout main
git pull
pnpm install                    # only needed if lockfile changed

# Feature branch
git checkout -b feat/my-feature

# Start
pnpm dev                        # runs web + api together

# Before pushing
pnpm lint
cd apps\api; pnpm test; cd ..\..
cd apps\web; pnpm exec tsc --noEmit; cd ..\..

# Push
git push -u origin feat/my-feature
Root scripts:

Command	Effect
pnpm dev	Runs web + api in parallel
pnpm dev:web	Web only
pnpm dev:api	API only
pnpm build	Builds all workspaces
pnpm lint	Lint all workspaces
pnpm test	Runs API tests
6. Repository Map
text
kaanti_manager/
├── apps/
│   ├── api/                       Express + Prisma backend
│   │   ├── src/
│   │   │   ├── app.ts             Express app factory
│   │   │   ├── server.ts          Entry point
│   │   │   ├── config/env.ts      Env validation (throws on missing)
│   │   │   ├── controllers/       HTTP layer only (req/res, no DB)
│   │   │   ├── services/          Business logic, all Prisma calls
│   │   │   ├── routes/            Route registration + middleware
│   │   │   ├── middleware/        auth, validate, error, rateLimit, businessAccess
│   │   │   ├── validators/        Zod schemas
│   │   │   ├── utils/             prisma.ts, errors.ts, tokens.ts
│   │   │   └── docs/openapi.ts    Swagger spec
│   │   ├── prisma/
│   │   │   ├── schema.prisma      18 models
│   │   │   ├── migrations/
│   │   │   ├── seed.ts            Phase 1/2 seed (demo user + business)
│   │   │   └── seed-phase3.ts     Phase 3 seed (financing/investments/lessons)
│   │   └── tests/                 Jest + Supertest
│   │
│   └── web/                       Next.js 14 (App Router)
│       ├── app/
│       │   ├── page.tsx           /  (marketing)
│       │   ├── layout.tsx         Root layout
│       │   ├── globals.css        Tailwind + utility classes
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx
│       │   │   ├── register/page.tsx
│       │   │   └── layout.tsx
│       │   ├── (dashboard)/       Auth-required shell
│       │   │   ├── layout.tsx     Sidebar + header + language switcher
│       │   │   ├── dashboard/page.tsx
│       │   │   ├── financing/page.tsx
│       │   │   ├── financing/[id]/page.tsx
│       │   │   ├── investments/page.tsx
│       │   │   ├── investments/[id]/page.tsx
│       │   │   ├── learn/page.tsx
│       │   │   ├── learn/[slug]/page.tsx
│       │   │   ├── readiness/page.tsx
│       │   │   └── (transactions|inventory|customers|reports)/page.tsx  (stubs)
│       │   └── (onboarding)/
│       │       └── onboarding/page.tsx
│       ├── lib/
│       │   ├── api.ts             fetch wrapper, ApiError
│       │   ├── session.ts         business helpers
│       │   └── i18n.ts            EN/HA dictionary + getLang/setLang/t
│       └── .env.local
│
├── packages/
│   └── shared/                    @kaanti/shared (types + constants)
│       ├── package.json           private, main → src/index.ts
│       └── src/index.ts
│
├── package.json                   Root workspace scripts + packageManager
├── pnpm-workspace.yaml            MUST contain onlyBuiltDependencies block
├── pnpm-lock.yaml                 COMMIT THIS
├── README.md
└── GUIDE.md                       This file
File placement rules:

New endpoint → validators/ → services/ → controllers/ → routes/

New UI page → app/(dashboard)/<name>/page.tsx

New reusable UI → components/<area>/<Name>.tsx

Shared types → packages/shared/src/index.ts

7. Backend Architecture
Layered, one direction only:

text
route → controller → service → prisma
        (req/res)   (business)  (DB)
Layer	May	May NOT
routes/	Register paths, attach middleware	Contain logic
controllers/	Read req, call service, send response	Import prisma
services/	All DB access, all business rules	Import Request/Response
validators/	Zod schemas	Side effects
middleware/	Cross-cutting concerns	Domain logic
Standard response shape:

json
{ "success": true,  "message": "Transaction recorded", "data": {} }
{ "success": false, "message": "Validation failed", "errors": { "amount": ["Required"] } }
Status codes:

Code	Use
200	Successful read/update
201	Successful create
400	Bad input shape
401	No/expired token, invalid creds
403	Authenticated but not authorised
404	Not found
409	Conflict (duplicate email)
422	Zod validation failure
429	Rate limited
500	Unhandled (logged)
Business isolation (non-negotiable):

Every business-scoped endpoint must go through requireBusinessAccess. Never query where: { businessId } from user input without verifying membership first.

8. Frontend Architecture
App Router only. No pages/.

Client components ("use client") — only when you need state/effects.

All fetches go through lib/api.ts — never raw fetch outside it.

No secrets in the frontend. Only NEXT_PUBLIC_* reaches the browser.

Charts from recharts only — all chart data comes from the backend.

Tailwind design tokens (from tailwind.config.ts):

navy (primary), emerald (brand), teal (secondary), gold (highlight), offwhite (background)

Utility classes (from globals.css):

.btn-primary, .btn-secondary, .input, .label, .card

Async state pattern — always 4 states:

tsx
const [data, setData] = useState<T | null>(null);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  api.get<T>("/resource")
    .then(setData)
    .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
}, []);

if (error) return <ErrorCard message={error} />;
if (!data) return <LoadingCard />;
return <ResourceView data={data} />;
Mobile-first. Every new layout tested at 360×640 before PR.

9. Database & Migrations
9.1 Schema rules
UUID primary keys (@id @default(uuid()))

createdAt + updatedAt on every business model

Money = Decimal @db.Decimal(18, 2) — never Float, never Int

Enums for closed sets (UserRole, TransactionType, Language)

Every FK has an index (@@index([field]))

onDelete: Cascade for children (transactions → business)

Composite uniques for natural keys (@@unique([businessId, name]))

9.2 The only way to change the schema
powershell
cd apps\api
powershell
pnpm exec prisma migrate dev --name <descriptive_name>
This creates a migration and applies it. Commit the migration folder. Never edit an applied migration.

9.3 Inspect the DB
powershell
cd apps\api
pnpm exec prisma studio   # http://localhost:5555
Or:

powershell
$env:PGPASSWORD="kaanti_dev"; psql -U postgres -h localhost -d kaanti -P pager=off -c "\dt"
9.4 Nuclear reset (local only)
powershell
$env:PGPASSWORD="kaanti_dev"; psql -U postgres -h localhost -c "DROP DATABASE IF EXISTS kaanti;"
$env:PGPASSWORD="kaanti_dev"; psql -U postgres -h localhost -c "CREATE DATABASE kaanti;"
powershell
cd apps\api
Remove-Item -Recurse -Force prisma\migrations -ErrorAction SilentlyContinue
pnpm exec prisma migrate dev --name init_clean
pnpm exec ts-node prisma\seed.ts
pnpm exec ts-node prisma\seed-phase3.ts
Never run this against staging or production.

10. Seeds
We have two seed scripts. Both are idempotent.

File	Contents
prisma/seed.ts	Demo user (demo@kaanti.app / Password123!) + demo business + default income/expense categories + one demo financing product
prisma/seed-phase3.ts	2 partner institutions, 6 financing products, 4 investment products, 9 lessons in EN + HA
Why two? Phase 1/2 seed was written before Phase 3 models existed. Keeping them separate means the Phase 3 seed can be re-run independently without disturbing Phase 1/2 data. Future phases should follow the same pattern (seed-phaseN.ts).

How to run:

powershell
cd apps\api
pnpm exec ts-node prisma\seed.ts
pnpm exec ts-node prisma\seed-phase3.ts
prisma db seed does not work — we never added a "prisma": { "seed": ... } block to apps/api/package.json. Use the ts-node form above.

Seed data rules:

All demo partner institutions and products have isDemo: true and [DEMO] prefix

Never seed real user financial records

Use fixed UUIDs and upsert so re-running has no side effects

11. Authentication & Security Rules
How it works:

Login → sets two HTTP-only cookies (access_token 15min, refresh_token 30 days) + returns accessToken in the body

Refresh tokens stored SHA-256 hashed in DB with expiry — rotated on use, old ones revoked

Logout revokes refresh token server-side + clears cookies

Business access checked on every business-scoped request via BusinessMember lookup

Never do:

❌ Log a password, token, or full /auth/* request body

❌ Put a JWT in localStorage — use HTTP-only cookies (we set them on the response)

❌ Return passwordHash or refreshToken in any API response

❌ Accept userId from the client to select whose data — always req.user.id

❌ Trust businessId from the client without requireBusinessAccess

❌ Set Access-Control-Allow-Origin: *

❌ Send user data to a third party without a ConsentRecord

For every new endpoint, ask:

Requires login? → requireAuth

Touches business data? → requireBusinessAccess

Accepts a body? → validate(schema)

Sensitive (auth, reset, payment)? → tighter rate limiter

Logged? → check for PII / tokens in the log line

12. i18n — English + Hausa
Implemented in apps/web/lib/i18n.ts — a client-side dictionary + localStorage persistence. Not next-intl, intentionally: keeps the bundle small for low-bandwidth Android.

API:

ts
import { getLang, setLang, t, type Lang } from "@/lib/i18n";

const lang = getLang();                          // "en" | "ha"
t("nav_financing", lang);                        // "Financing" | "Kuɗi"
setLang("ha");                                   // persists + reloads page
Backend lesson content:

LessonTranslation stores title/summary/content per language. The API picks:

requested language (?lang=ha) →

English fallback →

any available

Frontend lesson pages use the language from getLang() and re-fetch on toggle.

Adding a new translated string:

Add key to DICT.en in lib/i18n.ts

Add same key to DICT.ha

Use t("your_key", lang) in the component

Never hardcode user-facing strings in EN-only — the guide says Hausa is a first-class language for our market.

Adding a new lesson translation (backend): edit seed-phase3.ts LESSONS array, add titleXx / summaryXx / contentXx, and add the language row to the [language, title, summary, content] loop. Then re-run pnpm exec ts-node prisma\seed-phase3.ts.

13. Known Code Quirks — read before editing
The repo has some leftover files from earlier development that you'll encounter. Do not delete these without understanding:

File	Why it exists	What to know
services/bussiness.services.ts (typo)	Old file from Phase 1	Orphan. Not imported anywhere. Can be deleted, but confirm nothing imports it first. The canonical file is services/business.service.ts
controllers/bussiness.contoller.ts (typo)	Old file from Phase 1	Same — orphan. Canonical is controllers/business.controller.ts
routes/bussiness.route.ts (typo)	Old file from Phase 1	Orphan. Canonical is routes/business.routes.ts
middleware/bussinessAcess.ts (typo)	Old file from Phase 1	Orphan. Canonical is middleware/businessAccess.ts
utils/error.ts (singular)	Old import path	Re-exports from utils/errors.ts — keep it, some files still import from ../utils/error
utils/token.ts (singular)	Old import path	Re-exports from utils/tokens.ts — keep it
config/config.ts	Possibly orphan	Not imported anywhere as far as we know. Delete if confirmed unused
Before deleting any of the above, run:

powershell
Select-String -Path apps\api\src\**\*.ts -Pattern "bussiness|utils/error\"|utils/token\""
If nothing imports it, delete. If something does, update the import first, then delete.

A cleanup PR is welcome — task someone with removing the orphans and standardising on the canonical names.

14. Git & PR Workflow
Branch names:

Type	Pattern
Feature	feat/<scope>
Bugfix	fix/<scope>
Refactor	refactor/<scope>
Docs	docs/<scope>
Chore	chore/<scope>
Commit messages (Conventional Commits):

text
feat(financing): add structure filter
fix(auth): rotate refresh token on 401
refactor(api): extract business membership check
chore(deps): bump prisma to 5.22
PR rules:

One logical change per PR — no "while I was here" edits

Fill in the PR template (What / Why / How to test / Checklist)

Squash merge into main

Reviewer responds within 1 working day

Never hand-edit pnpm-lock.yaml. If there's a conflict, take main's version, run pnpm install, commit the result

Never commit:
.env, .next/, node_modules/, dist/, package-lock.json, yarn.lock

15. Coding Standards
General:

TypeScript everywhere — no any without justification; prefer unknown + narrowing

No floating point for money — Prisma.Decimal in backend, format to string in frontend

No hardcoded URLs — process.env.NEXT_PUBLIC_API_URL / env.clientOrigin

No console.log in committed code

No dead code, no commented blocks — // TODO(#issue) if you must leave something

Naming:

Files: kebab-case.ts, PascalCase.tsx for components

DB: PascalCase models, camelCase fields

Env vars: UPPER_SNAKE_CASE

API paths: plural, kebab-case

API fields: camelCase (wire format)

File headers — every service and controller starts with a one-line JSDoc:

ts
/**
 * Auth service — registration, login, refresh rotation, logout.
 * Pure business logic. Must not import Express types.
 */
Error handling:

Backend: throw AppError(message, status) — never throw new Error from a controller

Frontend: catch ApiError from lib/api.ts

16. Testing
Backend (required):

Every new route → at least one Supertest in apps/api/tests/

Every service function with non-trivial logic → unit test

Every auth/permission change → negative test (wrong user → 403)

Run tests:

powershell
cd apps\api
pnpm test
Tests currently use the same DB as dev. They clean up their own data via deleteMany in beforeAll/afterAll. Do not point tests at a production database.

Frontend: extract pure logic to lib/ (testable without DOM). Component tests optional in Phase 1/3, required from Phase 4 for forms.

17. Environments & Secrets
Env	Frontend	API	DB
Local	http://localhost:3000	http://localhost:4000	Local Postgres
Staging	(TBD)	(TBD)	Managed Postgres
Production	(TBD)	(TBD)	Managed Postgres
Secrets policy:

Local: .env files (git-ignored)

Staging/Prod: hosting provider's secret store (Vercel env vars, etc.)

Never paste real secrets into Slack, a PR, or a screenshot

If a secret is accidentally committed: rotate immediately, then notify #dev

Required env vars:

Backend (apps/api/.env)

text
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/kaanti?schema=public
JWT_ACCESS_SECRET=<48 hex chars>
JWT_REFRESH_SECRET=<48 hex chars, DIFFERENT from access>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d
CLIENT_ORIGIN=http://localhost:3000
Frontend (apps/web/.env.local)

text
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
Generate secrets:

powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
18. Common Tasks
18.1 Add a new business-scoped resource
Add model to schema.prisma with businessId + @@index([businessId])

cd apps\api; pnpm exec prisma migrate dev --name add_<resource>

validators/<resource>.validators.ts — Zod create + update schemas

services/<resource>.service.ts — CRUD functions, each takes businessId

controllers/<resource>.controller.ts — thin req/res wrappers

routes/<resource>.routes.ts — router.use(requireAuth) then per-route requireBusinessAccess

Register in app.ts under /api/v1/<resource>

Add paths to docs/openapi.ts

Test in tests/<resource>.test.ts

Frontend page in app/(dashboard)/<resource>/page.tsx

18.2 Add a field to an existing model
Edit schema.prisma

pnpm exec prisma migrate dev --name add_<field>_to_<model>

Update Zod validator

Update DTO in packages/shared if frontend uses it

Update seed if demo data needs it

Update UI forms

Update docs/openapi.ts schema

18.3 Install a dependency
powershell
# Frontend
pnpm --filter @kaanti/web add recharts

# Backend
pnpm --filter @kaanti/api add nanoid

# Root (dev tool)
pnpm add -Dw concurrently
Commit both package.json and pnpm-lock.yaml.

18.4 Debug a failing auth request
Browser devtools → Application → Cookies → localhost:3000

Missing access_token? Login failed or cookie blocked

pnpm dev terminal — any error line after the failing request?

GET /api/v1/auth/login — check the response body

Confirm CLIENT_ORIGIN=http://localhost:3000 (no trailing slash)

Confirm both JWT secrets are set and different

18.5 Recover from a failed install
powershell
Remove-Item -Recurse -Force node_modules, apps\web\node_modules, apps\api\node_modules, packages\shared\node_modules -ErrorAction SilentlyContinue
Remove-Item -Force pnpm-lock.yaml -ErrorAction SilentlyContinue
pnpm install
Never hand-edit the lockfile.

19. Windows-Specific Gotchas — READ THIS
We burned three days on Windows-specific issues during Phase 1. Every one of them is documented here so you never hit it.

19.1 PowerShell corrupts long multi-line pastes
Symptom: you paste a block of commands, some lines vanish or get merged, and you get "command not found" or "unexpected token" errors that make no sense.

Cause: Windows Terminal + PowerShell silently drop short lines or merge wrapped ones when pasting multi-line blocks.

Rule:

One command per paste. Under ~120 characters. Wait for the prompt, then paste the next.

No foreach, if, or { ... } blocks pasted as multiple lines — split into single commands.

For writing code files, use notepad <path> and paste into the editor — never into the shell.

19.2 pnpm --filter <ws> exec <bin> fails on Windows
Symptom:

powershell
pnpm --filter @kaanti/api exec prisma migrate dev
# ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "prisma" not found
...even though apps\api\node_modules\.bin\prisma.cmd exists.

Fix — pick one:

powershell
# Option A — cd into the workspace first (recommended)
cd apps\api
pnpm exec prisma migrate dev

# Option B — call the shim directly
apps\api\node_modules\.bin\prisma.cmd migrate dev

# Option C — from inside apps\api
.\node_modules\.bin\prisma.cmd migrate dev
Add to your shell profile for convenience:

powershell
function kapi { Set-Location apps\api; pnpm exec @args }
Then kapi prisma migrate dev from the repo root.

19.3 psql -c '...' strips embedded double-quotes
Symptom:

powershell
psql -c 'SELECT COUNT(*) FROM "FinancingProduct";'
# ERROR: relation "financingproduct" does not exist
Notice the query in the error is lowercase and unquoted — PowerShell stripped the " before passing to .exe.

Fix — use --% stop-parsing:

powershell
$env:PGPASSWORD="kaanti_dev"; psql -U postgres -h localhost -d kaanti --% -c "SELECT COUNT(*) FROM \"FinancingProduct\";"
Or for diagnostics use \dt (no quotes needed) and interactive psql:

powershell
$env:PGPASSWORD="kaanti_dev"; psql -U postgres -h localhost -d kaanti
Then inside psql: \dt, then SQL, then \q.

19.4 -- More -- in psql
Add -P pager=off to every psql command:

powershell
psql -U postgres -h localhost -P pager=off -c "\l"
Or press q to escape the pager.

19.5 pnpm install says "Scope: all 1 workspace projects"
Cause: pnpm-workspace.yaml isn't being read.

Checklist:

Test-Path pnpm-workspace.yaml → True

Get-Content pnpm-workspace.yaml → must start with packages: (not package:, not markdown code fences)

Format-Hex pnpm-workspace.yaml | Select-Object -First 1 → first two bytes should be 70 61 (pa), not EF BB BF (BOM)

Fix:

powershell
Set-Content -Path pnpm-workspace.yaml -Value "packages:`n  - `"apps/*`"`n  - `"packages/*`"`n`nonlyBuiltDependencies:`n  - `"@prisma/client`"`n  - `"@prisma/engines`"`n  - `"prisma`"`n  - `"bcrypt`"" -Encoding ASCII
pnpm install --force

Look for Scope: all 4 workspace projects

19.6 @kaanti/shared not resolving — falls back to npm registry
Symptom: ERR_PNPM_FETCH_404 GET https://registry.npmjs.org/@kaanti%2Fshared

Cause: either packages/shared/package.json missing, or consumer uses "*" instead of "workspace:*".

Fix:

Confirm packages/shared/package.json exists with "private": true

In apps/web/package.json, change "@kaanti/shared": "*" to "@kaanti/shared": "workspace:*"

pnpm install (not --force)

19.7 ts-node-dev / next not found after "successful" install
Look further up in the pnpm install output — the install probably failed partway. Fix the real error, then:

powershell
Remove-Item -Recurse -Force node_modules, apps\web\node_modules, apps\api\node_modules, packages\shared\node_modules
pnpm install
19.8 Case sensitivity gotcha — folder renames
Windows filesystems are case-insensitive. Renaming logIn → login fails silently:

powershell
Rename-Item apps\web\app\(auth)\logIn apps\web\app\(auth)\login   # ❌ silent no-op
Two-step rename:

powershell
Rename-Item apps\web\app\(auth)\logIn apps\web\app\(auth)\logIn-tmp
Rename-Item apps\web\app\(auth)\logIn-tmp apps\web\app\(auth)\login
19.9 Duplicate / route pages
Symptom:

text
You cannot have two parallel pages that resolve to the same path.
Please check /(dashboard)/page and /(onboarding)/page.
Route groups (...) don't affect the URL — they only affect layouts. Every page must live at a unique URL path. app/page.tsx, app/(dashboard)/page.tsx, and app/(onboarding)/page.tsx all claim /.

Fix — every page in its own named folder:

text
app/page.tsx                          → /
app/(auth)/login/page.tsx             → /login
app/(auth)/register/page.tsx          → /register
app/(dashboard)/dashboard/page.tsx    → /dashboard
app/(onboarding)/onboarding/page.tsx  → /onboarding
19.10 MetaMask console noise
Symptom:

text
file=chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/scripts/inpage.js
errorMessage=i: Failed to connect to MetaMask
Cause: the MetaMask browser extension injecting into every page. Unrelated to our app.

Fix: ignore it, or open Kaanti pages in an incognito window (extensions disabled), or toggle MetaMask off in chrome://extensions.

19.11 Google Fonts timeouts on slow networks
next/font/google fetches fonts at build time and times out on Nigerian ISPs during dev.

Fix: we removed Google Fonts entirely. app/layout.tsx uses the system font stack. If you need to add a custom font, use next/font/local with a bundled .woff2 — never next/font/google.

20. Definition of Done
A PR is only ready to merge when all of these are true:

□ TypeScript compiles for both apps (pnpm exec tsc --noEmit)
□ Lint passes (pnpm lint)
□ New tests exist and pass (cd apps\api; pnpm test)
□ No console.log, no commented-out code, no TODOs without an issue number
□ New env vars documented in .env.example and in this guide
□ New endpoints added to docs/openapi.ts
□ New DB migrations committed (never edited after merge)
□ pnpm-lock.yaml committed iff any package.json changed
□ No package-lock.json or yarn.lock in the diff
□ UI changes tested at 360px width (Chrome DevTools device toolbar)
□ Error / loading / empty / success states visible on any new page
□ Reviewer approved
□ PR template filled in
21. What's Left to Build
Phase 2 UI — the highest priority now
Backend exists, UI is stubbed. The team needs to build:

app/(dashboard)/transactions/page.tsx — list, filters, create/edit/delete

app/(dashboard)/inventory/page.tsx — product list, low-stock indicator

app/(dashboard)/customers/page.tsx — customer list, contact, balances

app/(dashboard)/reports/page.tsx — generate, list, download CSV

app/(dashboard)/dashboard/page.tsx — real stats (currently shows ₦0.00)

Phase 1 completions
Email verification — wire to a transactional email provider (Resend/Postmark)

AuditLog — write on sensitive operations (login, business create, transaction create)

Phase 4 — hardening
Full test suite (backend routes, critical frontend forms)

Performance audit (bundle size, DB query efficiency)

Accessibility audit (WCAG AA minimum)

Deployment to staging + production

Nice-to-haves (not blocking)
PWA manifest + offline shell

Cleanup PR: remove bussiness* orphans (§13)

Extract packages/shared DTOs into a proper type module

Getting Help
Code questions → draft PR or #dev

Product questions → tag the product owner, don't guess

Compliance / regulated feature questions → stop and ask before writing code

Security concern → report privately, do not open a public issue

pnpm / Windows tooling → see §19 first, then #dev

Welcome to the team. Ship carefully. 🚀