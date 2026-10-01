# Midas Backend API

Production Express.js REST API and WebSocket service powering the Midas student micro-investment platform and merchant KYC onboarding system.

## Features

- **Merchant Registration & Authentication**: Secure onboarding with bcrypt password hashing and JWT token issuance.
- **Student Investor Portal**: Registration, university credentials, profile management, and wallet services.
- **Merchant KYC Verification**: Document uploads with MIME/size validation and multi-document compliance auditing.
- **Admin Review System**: KYC application queue, document inspection, approval/rejection workflows, and audit history.
- **Investment Management**: Student investment creation, portfolio aggregation, and return tracking.
- **Wallet & Transactions**: Student and merchant wallet management with transaction ledger.
- **Automated Dividend Distributions**: Scheduled node-cron background job for dividend distribution.
- **Testing Suite**: 39 Jest unit tests covering Joi validators, middleware, Prisma models, and Supertest route endpoints.
- **Security & Reliability**: Helmet headers, configurable CORS, Winston logging, and express-rate-limit protection.

---

## Tech Stack

- **Runtime**: Node.js (`>= 22.13`)
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL (hosted on [Neon](https://neon.tech))
- **ORM**: [Prisma ORM](https://www.prisma.io/) v6.19.3
- **Unit Testing**: Jest + Supertest
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcrypt`
- **Validation**: Joi schema validators
- **File Storage**: Local filesystem document repository served via `/api/documents`
- **Background Jobs**: `node-cron`
- **Logging**: Winston logger with daily rotation and JSON formatting
- **Code Quality**: ESLint & Prettier

---

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma        # Prisma data models and Neon PostgreSQL config
├── src/
│   ├── config/              # Express app setup and Prisma singleton
│   ├── controllers/         # Request handling & HTTP response coordination
│   ├── middleware/          # JWT auth, Joi validation, upload, error handling
│   ├── models/              # Prisma database queries and mutations
│   ├── routes/              # Express router definitions
│   ├── services/            # Business logic and transaction orchestration
│   ├── validators/          # Joi request validation schemas
│   ├── utils/               # AppError classes, logger, responseFormatter
│   ├── jobs/                # Scheduled background tasks (cron)
│   └── types/               # System enums and constants
├── tests/                   # Jest unit & integration test suites
│   ├── setup.js             # Test environment variables
│   ├── validators.test.js   # Joi validator schemas test
│   ├── middleware.test.js   # Auth, validate, and error handling middleware tests
│   ├── models.test.js       # Prisma models with mocked database
│   └── routes.test.js       # Supertest HTTP endpoint integration tests
├── uploads/                 # Storage for KYC verification documents
├── jest.config.js           # Jest configuration
└── package.json
```

---

## Getting Started

### 1. Prerequisites

- Node.js `>= 22.13`
- `pnpm`
- A PostgreSQL database on [Neon](https://neon.tech)

### 2. Environment Variables

Create `.env` in `backend/` (or copy `.env.example`):

```env
NODE_ENV=development
PORT=3000

# Database (Neon PostgreSQL via Prisma)
DATABASE_URL="postgresql://neondb_owner:***@ep-xyz-pooler.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:***@ep-xyz.region.aws.neon.tech/neondb?sslmode=require"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Database Migration with Prisma

Generate the Prisma Client and push your schema to Neon:

```bash
pnpm run prisma:generate
pnpm run prisma:push
```

To view and edit database records in Prisma Studio:

```bash
pnpm run prisma:studio
```

### 4. Running the Server

```bash
# Development mode with nodemon auto-reload
pnpm run dev

# Production mode
pnpm start
```

---

## Testing & Quality Scripts

| Script                   | Command                  | Description                         |
| ------------------------ | ------------------------ | ----------------------------------- |
| `pnpm run test`          | `jest --passWithNoTests` | Runs all 39 Jest unit tests         |
| `pnpm run test:watch`    | `jest --watch`           | Runs Jest in interactive watch mode |
| `pnpm run test:coverage` | `jest --coverage`        | Generates coverage report           |
| `pnpm run lint`          | `eslint .`               | Runs ESLint on backend source code  |
| `pnpm run lint:fix`      | `eslint . --fix`         | Automatically fixes lint warnings   |
| `pnpm run format`        | `prettier --write .`     | Formats all files with Prettier     |
| `pnpm run format:check`  | `prettier --check .`     | Checks formatting without modifying |

---

## API Overview

Base URL: `http://localhost:3000/api`

### Health Checks

- `GET /health` — Application health status
- `GET /api/health` — API router health status

### Public Directory

- `GET /api/public/merchants` — List verified merchants with filtering & pagination
- `GET /api/public/merchants/:id` — Get single merchant public profile
- `GET /api/public/business-types` — Available merchant business categories

### Authentication

- `POST /api/auth/register` — Merchant registration
- `POST /api/auth/login` — Merchant login
- `GET /api/auth/me` — Merchant current profile (Bearer token required)
- `POST /api/students/register` — Student registration
- `POST /api/students/login` — Student login
- `GET /api/students/me` — Student current profile (Bearer token required)
- `POST /api/admin/login` — Admin reviewer login

### KYC (Know Your Customer)

- `POST /api/kyc/submit` — Submit KYC documents (`multipart/form-data`)
- `GET /api/kyc/status` — Current merchant verification status
- `GET /api/documents/:filename` — Static secure KYC document serving

### Admin Review

- `GET /api/admin/kyc/pending` — List pending KYC submissions
- `GET /api/admin/kyc/:id` — Detail view for submission audit
- `POST /api/admin/kyc/:id/approve` — Approve KYC and activate merchant
- `POST /api/admin/kyc/:id/reject` — Reject or request resubmission

### Investments & Wallets

- `POST /api/investments` — Student invests in verified merchant
- `GET /api/investments/portfolio` — Student portfolio summary and holdings
- `GET /api/wallet/balance` — Student wallet balance
- `POST /api/wallet/fund` — Fund student wallet
- `POST /api/wallet/withdraw` — Withdraw from student wallet
