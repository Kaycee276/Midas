# Midas

A micro-investment platform that connects university students with verified campus merchants. Students invest small amounts in local businesses they use and trust, while merchants raise capital through a KYC-verified onboarding process.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Reference](#api-reference)
- [User Workflows](#user-workflows)
- [Security](#security)

## Features

**For Students (Investors)**

- Browse verified merchants near campus with filters (business type, proximity, search)
- Invest in merchants with amounts from $10 to $1,000,000
- Track portfolio performance with aggregated summaries
- View transaction history and withdraw investments

**For Merchants (Business Owners)**

- Register a business with detailed profile information
- Submit KYC documents (identity, business registration, proof of address)
- View investor activity and capital raised once verified
- Manage business profile and track account status

**For Admins (KYC Reviewers)**

- Review pending KYC submissions with uploaded documents
- Approve, reject, or request resubmission with notes
- Full audit trail of submission history

## Tech Stack

### Backend

- **Runtime**: Node.js with Express 5
- **Database**: PostgreSQL via Supabase
- **Auth**: JWT with bcrypt password hashing
- **Validation**: Joi schema validation
- **File Storage**: Supabase Storage (private bucket with signed URLs)
- **Logging**: Winston
- **Security**: Helmet, CORS, express-rate-limit

### Frontend

- **Framework**: React 19 with TypeScript (strict mode)
- **Bundler**: Vite 7
- **Routing**: React Router DOM 7
- **State Management**: Zustand
- **Styling**: Tailwind CSS 4 with CSS custom properties for theming
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Project Structure

```
Midas/
├── backend/
│   ├── src/
│   │   ├── config/          # Express app setup, Supabase client
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/       # Auth, validation, file upload, error handling
│   │   ├── models/          # Database access layer
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   ├── types/           # Enums and constants
│   │   ├── validators/      # Joi validation schemas
│   │   └── utils/           # Error classes, logger, formatters
│   ├── database/            # SQL schema files and setup guide
│   ├── uploads/             # Temporary file storage (multer)
│   ├── server.js            # Entry point
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client and API modules
│   │   ├── components/      # Layout and reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components (merchant, student, admin, public)
│   │   ├── stores/          # Zustand state stores (auth, theme)
│   │   └── types/           # TypeScript interfaces and enums
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) project

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd Midas

# Install backend dependencies
cd backend
cp .env.example .env    # then fill in your values
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the App

```bash
# Start the backend (from /backend)
npm run dev        # uses nodemon for auto-reload

# Start the frontend (from /frontend)
npm run dev        # Vite dev server on http://localhost:5173
```

## Environment Variables

### Backend (`backend/.env`)

| Variable                    | Description                       | Example                   |
| --------------------------- | --------------------------------- | ------------------------- |
| `NODE_ENV`                  | Environment                       | `development`             |
| `PORT`                      | Server port                       | `3000`                    |
| `SUPABASE_URL`              | Supabase project URL              | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY`         | Supabase anonymous key            | `eyJ...`                  |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key         | `eyJ...`                  |
| `JWT_SECRET`                | JWT signing secret (min 32 chars) | `your-secret-key`         |
| `JWT_EXPIRES_IN`            | Token expiry                      | `7d`                      |
| `ALLOWED_ORIGINS`           | CORS origins (comma-separated)    | `http://localhost:5173`   |
| `RATE_LIMIT_WINDOW_MS`      | Rate limit window                 | `900000`                  |
| `RATE_LIMIT_MAX_REQUESTS`   | Max requests per window           | `100`                     |

### Frontend (`frontend/.env`)

| Variable       | Description          | Example                     |
| -------------- | -------------------- | --------------------------- |
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000/api` |

## Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema files in the Supabase SQL Editor in order:
   - `backend/database/schema.sql` — merchants, admins, KYC tables
   - `backend/database/students-schema.sql` — students table
   - `backend/database/investments-schema.sql` — investments and transactions tables
3. Create a **private** storage bucket named `kyc-documents`
4. Copy your Supabase credentials into `backend/.env`

The schema includes triggers for auto-updating `updated_at` timestamps, syncing KYC status to merchant account status, and auto-creating transaction records on investment.

**Default admin account**: `admin@midas.com` / `Admin@123`

See `backend/database/SETUP.md` for detailed instructions.

## API Reference

All endpoints are prefixed with `/api`.

### Public

| Method | Endpoint                 | Description                                                                                           |
| ------ | ------------------------ | ----------------------------------------------------------------------------------------------------- |
| `GET`  | `/public/merchants`      | List active merchants (supports `page`, `limit`, `business_type`, `proximity`, `search` query params) |
| `GET`  | `/public/merchants/:id`  | Get merchant details                                                                                  |
| `GET`  | `/public/business-types` | List business type options                                                                            |
| `GET`  | `/health`                | API health check                                                                                      |

### Authentication — Merchants

| Method  | Endpoint         | Auth | Description                  |
| ------- | ---------------- | ---- | ---------------------------- |
| `POST`  | `/auth/register` | No   | Register merchant            |
| `POST`  | `/auth/login`    | No   | Login merchant               |
| `GET`   | `/auth/me`       | Yes  | Get current merchant profile |
| `PATCH` | `/auth/profile`  | Yes  | Update merchant profile      |

### Authentication — Students

| Method  | Endpoint             | Auth | Description                 |
| ------- | -------------------- | ---- | --------------------------- |
| `POST`  | `/students/register` | No   | Register student            |
| `POST`  | `/students/login`    | No   | Login student               |
| `GET`   | `/students/me`       | Yes  | Get current student profile |
| `PATCH` | `/students/profile`  | Yes  | Update student profile      |

### KYC (Merchant only)

| Method   | Endpoint               | Auth     | Description                                |
| -------- | ---------------------- | -------- | ------------------------------------------ |
| `POST`   | `/kyc/submit`          | Merchant | Submit KYC documents (multipart/form-data) |
| `GET`    | `/kyc/status`          | Merchant | Get KYC submission status                  |
| `GET`    | `/kyc/documents/:type` | Merchant | Get signed URL for a document              |
| `DELETE` | `/kyc/document/:type`  | Merchant | Delete a document                          |

### Investments (Student only)

| Method | Endpoint                             | Auth    | Description                       |
| ------ | ------------------------------------ | ------- | --------------------------------- |
| `POST` | `/investments`                       | Student | Create investment                 |
| `GET`  | `/investments/portfolio`             | Student | Get portfolio with summary        |
| `GET`  | `/investments/history`               | Student | Transaction history (paginated)   |
| `GET`  | `/investments/:id`                   | Student | Get investment details            |
| `POST` | `/investments/:id/withdraw`          | Student | Withdraw investment               |
| `GET`  | `/investments/merchants/:merchantId` | No      | Get merchant's investment summary |

### Admin

| Method | Endpoint                 | Auth  | Description                    |
| ------ | ------------------------ | ----- | ------------------------------ |
| `POST` | `/admin/login`           | No    | Admin login                    |
| `GET`  | `/admin/kyc/pending`     | Admin | List pending KYC submissions   |
| `GET`  | `/admin/kyc/:id`         | Admin | Get KYC submission details     |
| `POST` | `/admin/kyc/:id/approve` | Admin | Approve KYC                    |
| `POST` | `/admin/kyc/:id/reject`  | Admin | Reject or request resubmission |

### Authentication

All authenticated endpoints require a `Authorization: Bearer <token>` header. Tokens are returned by the login/register endpoints and expire after 7 days by default.

## User Workflows

### Merchant Onboarding

1. Register with business details (name, type, address, proximity to campus)
2. Submit KYC documents (identity docs, business registration, proof of address)
3. Admin reviews and approves the submission
4. Account becomes **active** and visible to student investors

### Student Investment Flow

1. Register with university information
2. Browse verified merchants with filters
3. Select a merchant and invest an amount ($10 minimum)
4. Monitor portfolio value and returns on the dashboard
5. Withdraw investments when desired

### Admin Review

1. Log in to the admin dashboard
2. View queue of pending KYC submissions
3. Review uploaded documents and merchant information
4. Approve, reject, or request resubmission with notes

## Security

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Signed, expiring tokens with role-based claims
- **Rate Limiting**: Registration (5/hour), login (10/15min), general (100/15min)
- **Input Validation**: Joi schemas on all endpoints
- **File Validation**: MIME type and size checks (5MB max, JPEG/PNG/PDF only)
- **Security Headers**: Helmet middleware
- **CORS**: Configurable origin whitelist
- **Private Storage**: KYC documents stored in a private Supabase bucket with time-limited signed URLs
- **Role-Based Access Control**: Separate middleware guards for merchant, student, and admin routes

## Frontend Routes

| Path                       | Component         | Access   |
| -------------------------- | ----------------- | -------- |
| `/`                        | Landing           | Public   |
| `/merchants`               | MerchantList      | Public   |
| `/merchants/:id`           | MerchantDetail    | Public   |
| `/merchant/login`          | MerchantLogin     | Public   |
| `/merchant/register`       | MerchantRegister  | Public   |
| `/merchant/dashboard`      | MerchantDashboard | Merchant |
| `/merchant/profile`        | MerchantProfile   | Merchant |
| `/merchant/kyc`            | KYCSubmission     | Merchant |
| `/student/login`           | StudentLogin      | Public   |
| `/student/register`        | StudentRegister   | Public   |
| `/student/dashboard`       | StudentDashboard  | Student  |
| `/student/profile`         | StudentProfile    | Student  |
| `/student/portfolio`       | Portfolio         | Student  |
| `/student/investments/:id` | InvestmentDetail  | Student  |
| `/admin/login`             | AdminLogin        | Public   |
| `/admin/dashboard`         | AdminDashboard    | Admin    |
| `/admin/kyc/:id`           | KYCReview         | Admin    |

## Data Model

```
merchants ──────── merchant_kyc (1:1)
    │                    │
    │                    └── reviewed_by ──── admins
    │
    ├── kyc_submission_history (1:many, audit trail)
    │
    └── investments (1:many) ──── students (many:1)
              │
              └── investment_transactions (1:many)
```

### Key Entities

| Entity          | Description                                                             |
| --------------- | ----------------------------------------------------------------------- |
| **Merchant**    | Business owner with profile, KYC status, and account status             |
| **Student**     | Investor with university info and portfolio                             |
| **Admin**       | KYC reviewer (roles: `reviewer`, `super_admin`)                         |
| **Investment**  | A student's investment in a merchant (amount, shares, status)           |
| **Transaction** | Audit record for investment events (invest, withdraw, dividend, return) |
| **KYC**         | Merchant verification submission with document URLs and review history  |

### Business Types

restaurant, cafe, food_truck, retail, bookstore, laundry, salon, gym, tutoring, printing, electronics, clothing, other

### Proximity Options

on_campus, within_1km, within_2km, within_5km, more_than_5km
