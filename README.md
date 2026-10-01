# Midas

[![CI](https://github.com/Kaycee276/Midas/actions/workflows/ci.yml/badge.svg)](https://github.com/Kaycee276/Midas/actions/workflows/ci.yml)
[![Latest Release](https://img.shields.io/github/v/release/Kaycee276/Midas)](https://github.com/Kaycee276/Midas/releases)

Midas is a campus micro-investment and merchant KYC platform connecting university students with verified local merchants. Students invest small amounts in campus businesses they frequent and trust, while merchants raise growth capital through a rigorous, KYC-verified onboarding pipeline.

---

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Monorepo Architecture](#monorepo-architecture)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Database Setup (Neon + Prisma)](#database-setup-neon--prisma)
- [Monorepo Scripts](#monorepo-scripts)
- [Testing](#testing)
- [CI/CD & Release Workflow](#cicd--release-workflow)
- [API Reference](#api-reference)
- [Frontend Routes](#frontend-routes)
- [Security](#security)

---

## Key Features

### For Students (Investors)
- **Merchant Directory**: Browse campus-verified merchants with real-time category, proximity, and keyword search filters.
- **Micro-Investments**: Invest in campus businesses with amounts from $10 up to $1,000,000.
- **Portfolio Tracking**: Real-time aggregated summaries, current value, returns, and transaction history.
- **Wallet System**: Deposit, withdraw, and track cash balance alongside investment holdings.

### For Merchants (Business Owners)
- **Business Profile**: Detailed registration including proximity to campus, business category, and contact details.
- **KYC Verification**: Single-step document upload (ID, business registration, proof of address, business photos).
- **Investor & Revenue Management**: View investor support, track capital raised, and submit periodic revenue reports.
- **Merchant Wallet**: Secure withdrawals and investment credit management.

### For Administrators (Compliance & Reviewers)
- **KYC Review Queue**: Inspect submitted identity and business verification documents.
- **Audit Controls**: Approve, reject, or request resubmission with detailed reviewer notes.
- **Full History**: Immutable audit log of all submission reviews and status transitions.

---

## Tech Stack

### Monorepo Tooling
- **Package Manager**: [pnpm v11](https://pnpm.io/) workspaces
- **Git Hooks**: [Husky](https://typicode.github.io/husky/) pre-commit runner
- **Code Formatting**: [Prettier](https://prettier.io/)
- **Linting**: [ESLint](https://eslint.org/) (Flat Config)
- **CI/CD**: GitHub Actions

### Backend
- **Runtime**: Node.js (`>= 22.13`)
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL hosted on [Neon](https://neon.tech)
- **ORM**: [Prisma ORM](https://www.prisma.io/) v6.19.3
- **Authentication**: JWT (`jsonwebtoken`) & `bcrypt` password hashing
- **Validation**: Joi schema validators
- **Document Storage**: Local secure filesystem storage served at `/api/documents`
- **Testing**: Jest & Supertest
- **Logging & Security**: Winston, Helmet, CORS, express-rate-limit

### Frontend
- **Framework**: React 19 + TypeScript (strict mode)
- **Build Tool**: Vite 7
- **Routing**: React Router DOM 7
- **Styling**: Tailwind CSS 4 with CSS custom properties (dark/light themes)
- **State Management**: Zustand (persistent auth & theme stores)
- **HTTP Client**: Axios with bearer token interceptors
- **Testing**: Vitest + React Testing Library + `@testing-library/jest-dom`
- **Deployment**: Vercel

---

## Monorepo Architecture

```
Midas/
├── .github/
│   └── workflows/
│       ├── ci.yml             # GitHub Actions CI (lint, format, typecheck, test, build)
│       └── release.yml        # Automated GitHub Release generation on git tags (v*)
├── .husky/
│   └── pre-commit             # Automated pre-commit checks hook
├── backend/                   # Express.js + Prisma API
│   ├── prisma/
│   │   └── schema.prisma      # Prisma ORM schema & Neon DB models
│   ├── src/
│   │   ├── config/            # Express app & Prisma singleton
│   │   ├── controllers/       # HTTP request handlers
│   │   ├── middleware/        # JWT auth, validation, upload, error handler
│   │   ├── models/            # Database access layer
│   │   ├── routes/            # Route modules (auth, student, kyc, investments, etc.)
│   │   ├── services/          # Business logic
│   │   └── validators/        # Joi schema definitions
│   ├── tests/                 # Jest unit tests (39 tests)
│   ├── uploads/               # KYC documents storage
│   └── jest.config.js
├── frontend/                  # React 19 + Vite + Tailwind 4 SPA
│   ├── src/
│   │   ├── api/               # Axios API clients
│   │   ├── components/        # UI components & layouts
│   │   ├── pages/             # Student, Merchant, Admin, and Public views
│   │   ├── stores/            # Zustand state stores (auth, theme)
│   │   └── test/              # Vitest unit tests (18 tests)
│   ├── vitest.config.ts       # Vitest configuration
│   └── vite.config.ts         # Vite configuration
├── package.json               # Root monorepo workspace configuration
├── pnpm-workspace.yaml        # Workspace package definitions
└── README.md
```

---

## Quick Start

### 1. Prerequisites
- **Node.js**: `>= 22.13.0` (required for pnpm 11 `node:sqlite` engine)
- **pnpm**: `npm install -g pnpm`
- **Neon Database**: A free serverless PostgreSQL instance on [neon.tech](https://neon.tech)

### 2. Installation
Clone the repository and install all dependencies across the entire monorepo:

```bash
git clone https://github.com/Kaycee276/Midas.git
cd Midas
pnpm install
```

### 3. Environment Configuration
Create the `.env` files for both backend and frontend:

**Backend (`backend/.env`)**:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://neondb_owner:***@ep-xyz-pooler.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:***@ep-xyz.region.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/jpeg,image/png,application/pdf"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (`frontend/.env`)**:
```env
VITE_API_URL="http://localhost:3000/api"
```

### 4. Database Initialization
Push your schema directly to Neon and generate the Prisma Client:

```bash
cd backend
pnpm run prisma:generate
pnpm run prisma:push
```

*(Optional) Launch Prisma Studio to visually manage your database:*
```bash
pnpm run prisma:studio
```

### 5. Running the Application
From the repository root:

```bash
# Start backend API (http://localhost:3000)
pnpm --filter backend run dev

# Start frontend application (http://localhost:5173)
pnpm --filter frontend run dev
```

---

## Monorepo Scripts

Run these commands from the root directory:

| Script | Command | Purpose |
|---|---|---|
| `pnpm test` | `pnpm -r run test` | Runs all 57 tests across backend and frontend |
| `pnpm run lint` | `pnpm -r run lint` | Runs ESLint across all projects |
| `pnpm run lint:fix` | `pnpm -r run lint:fix` | Automatically fixes autofixable lint issues |
| `pnpm run format` | `pnpm -r run format` | Formats the entire codebase using Prettier |
| `pnpm run format:check`| `pnpm -r run format:check` | Verifies formatting compliance |
| `pnpm run typecheck` | `pnpm --filter frontend run typecheck` | Runs TypeScript compiler verification (`tsc -b`) |
| `pnpm run pre-commit`| `pnpm run lint && pnpm run format:check && pnpm run typecheck` | Full pre-commit validation hook |

---

## Testing

The repository includes a comprehensive unit testing suite with **57 passing tests**:

- **Backend (39 tests)**: Powered by Jest and Supertest.
  - Joi validation schemas (Student, Merchant, KYC, Investment, Wallet).
  - Middleware (authentication token verification, role access guards, error handler).
  - Prisma Models (Merchant, Student, Investment with mocked database).
  - API Routes integration endpoints.
- **Frontend (18 tests)**: Powered by Vitest, React Testing Library, and jsdom.
  - UI Primitives: Button (loading/click/disabled), Badge variants, Input typing & errors, Card padding.
  - State Stores: Auth session lifecycle and Theme toggle persistence.

Run tests:
```bash
# Run all tests
pnpm test

# Run only backend tests
pnpm --filter backend run test

# Run only frontend tests
pnpm --filter frontend run test
```

---

## CI/CD & Release Workflow

### GitHub Actions CI
Every push and pull request to `master` triggers [`.github/workflows/ci.yml`](file:///home/kaycee/Desktop/Personal/Midas/.github/workflows/ci.yml):
1. Installs dependencies using `pnpm install --frozen-lockfile` on Node.js 22.
2. Generates Prisma Client.
3. Executes pre-commit checks (ESLint, Prettier check, TypeScript typecheck).
4. Runs full unit test suites (57 tests).
5. Compiles frontend production bundle.

### Releases & Tags
Releases are automated via [`.github/workflows/release.yml`](file:///home/kaycee/Desktop/Personal/Midas/.github/workflows/release.yml):
- Pushing any tag matching `v*` (e.g. `git tag -a v0.1.2 -m "..." && git push origin v0.1.2`) triggers GitHub Actions to automatically draft, generate changelogs, and publish the release.
- Current releases and tags are available at [github.com/Kaycee276/Midas/releases](https://github.com/Kaycee276/Midas/releases).

---

## API Reference

All backend endpoints are prefixed with `/api`.

### Public Endpoints
- `GET /health` — Server health status
- `GET /api/health` — API router health status
- `GET /api/public/merchants` — List verified merchants (supports `page`, `limit`, `business_type`, `proximity`, `search`)
- `GET /api/public/merchants/:id` — Merchant detail view
- `GET /api/public/business-types` — Available merchant business types

### Authentication
- `POST /api/auth/register` — Register merchant
- `POST /api/auth/login` — Login merchant
- `GET /api/auth/me` — Current merchant profile *(Merchant)*
- `PATCH /api/auth/profile` — Update merchant profile *(Merchant)*
- `POST /api/students/register` — Register student
- `POST /api/students/login` — Login student
- `GET /api/students/me` — Current student profile *(Student)*
- `PATCH /api/students/profile` — Update student profile *(Student)*
- `POST /api/admin/login` — Admin login

### KYC Verification
- `POST /api/kyc/submit` — Submit KYC documents *(Merchant, multipart/form-data)*
- `GET /api/kyc/status` — Get KYC status and file records *(Merchant)*
- `GET /api/documents/:filename` — Static secure document serving

### Admin Review
- `GET /api/admin/kyc/pending` — List pending KYC submissions *(Admin)*
- `GET /api/admin/kyc/:id` — Detail view of KYC submission *(Admin)*
- `POST /api/admin/kyc/:id/approve` — Approve KYC *(Admin)*
- `POST /api/admin/kyc/:id/reject` — Reject or request resubmission *(Admin)*

### Investments & Wallet
- `POST /api/investments` — Invest in a verified merchant *(Student)*
- `GET /api/investments/portfolio` — Portfolio summary and holdings *(Student)*
- `GET /api/investments/history` — Paginated investment transaction history *(Student)*
- `POST /api/wallet/fund` — Fund student wallet balance *(Student)*
- `POST /api/wallet/withdraw` — Withdraw from student wallet *(Student)*
- `GET /api/wallet/transactions` — View student wallet transactions *(Student)*

---

## Frontend Routes

| Path | Component | Description | Access |
|---|---|---|---|
| `/` | `Landing` | Marketplace landing page | Public |
| `/merchants` | `MerchantList` | Browse and filter campus merchants | Public |
| `/merchants/:id` | `MerchantDetail` | Merchant public profile and offerings | Public |
| `/merchant/register` | `MerchantRegister` | Merchant business registration | Public |
| `/merchant/login` | `MerchantLogin` | Merchant sign-in | Public |
| `/merchant/dashboard` | `MerchantDashboard` | Business performance & investors | Merchant |
| `/merchant/kyc` | `KYCSubmission` | KYC document upload | Merchant |
| `/merchant/wallet` | `MerchantWallet` | Capital balance & withdrawals | Merchant |
| `/student/register` | `StudentRegister` | Student investor registration | Public |
| `/student/login` | `StudentLogin` | Student sign-in | Public |
| `/student/dashboard` | `StudentDashboard` | Investment dashboard | Student |
| `/student/invest/:id` | `Invest` | Make investment in merchant | Student |
| `/student/portfolio` | `Portfolio` | Active holdings & returns | Student |
| `/student/wallet` | `Wallet` | Wallet deposits & withdrawals | Student |
| `/admin/login` | `AdminLogin` | Compliance reviewer login | Public |
| `/admin/dashboard` | `AdminDashboard` | KYC submissions review queue | Admin |
| `/admin/kyc/:id` | `KYCReview` | Document inspection & approval | Admin |

---

## Security

- **Password Hashing**: Strong bcrypt hashing with 12 salt rounds.
- **JWT Authorization**: Cryptographically signed tokens with strict expiration and role-based checks.
- **Data Integrity**: Enforced via Prisma ORM and PostgreSQL foreign key constraints on Neon.
- **Input Validation**: Joi validation schemas strip unknown properties and enforce format rules.
- **File Security**: MIME type verification, file size limits (5MB max), and secure local storage with restricted access.
- **Protection**: Helmet security headers, CORS origin whitelisting, and multi-tier rate limiting.
