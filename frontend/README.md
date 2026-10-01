# Midas Frontend

Modern React application for Midas — a campus micro-investment and merchant KYC platform connecting university students with verified local campus merchants.

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 7](https://vite.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with CSS variables and dark/light mode
- **Routing**: [React Router DOM 7](https://reactrouter.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (persistent auth & theme stores)
- **HTTP Client**: [Axios](https://axios-http.com/) with bearer token authorization interceptors
- **Icons & UI Feedback**: [Lucide React](https://lucide.dev/) & [React Hot Toast](https://react-hot-toast.com/)
- **Unit Testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) + `@testing-library/jest-dom`
- **Code Quality**: ESLint 9 (flat config) & Prettier

---

## Project Structure

```
frontend/
├── src/
│   ├── api/                   # Typed API service clients
│   │   ├── client.ts          # Axios instance with request/response interceptors
│   │   ├── auth.ts            # Merchant auth API
│   │   ├── student.ts         # Student auth & profile API
│   │   ├── investments.ts     # Investments & portfolio API
│   │   ├── kyc.ts             # Merchant KYC submission API
│   │   ├── admin.ts           # Admin review API
│   │   ├── wallet.ts          # Student wallet API
│   │   ├── merchant-wallet.ts # Merchant wallet API
│   │   ├── revenue.ts         # Merchant revenue reports API
│   │   └── public.ts          # Public merchants directory API
│   ├── components/            # Reusable UI & Layout components
│   │   ├── ui/                # Button, Input, Badge, Card, Modal, Select, FileUpload, Spinner
│   │   ├── layout/            # Navbar, Footer, MerchantLayout, StudentLayout, AdminLayout
│   │   └── ProtectedRoute.tsx # Role-based route guard (merchant, student, admin)
│   ├── pages/                 # Route page components
│   │   ├── Landing.tsx        # Public landing & marketplace hero
│   │   ├── public/            # Merchant directory & merchant profile view
│   │   ├── merchant/          # Merchant dashboard, KYC, revenue, wallet, profile
│   │   ├── student/           # Student dashboard, marketplace invest, portfolio, wallet
│   │   └── admin/             # Admin KYC review dashboard & detail audit
│   ├── stores/                # Zustand persistent stores
│   │   ├── useAuthStore.ts    # User session, JWT tokens, roles, and profile
│   │   └── useThemeStore.ts   # Dark / light theme toggle and DOM sync
│   ├── test/                  # Vitest unit tests & setup
│   │   ├── setup.ts           # jest-dom Vitest matcher extensions
│   │   ├── Button.test.tsx    # Button rendering, loading, click tests
│   │   ├── Badge.test.tsx     # Badge variant styling tests
│   │   ├── Input.test.tsx     # Input typing and error message tests
│   │   ├── Card.test.tsx      # Card layout & padding tests
│   │   ├── useAuthStore.test.ts # Auth session persistence tests
│   │   └── useThemeStore.test.ts# Theme toggling tests
│   ├── types/                 # TypeScript interfaces and entity types
│   ├── App.tsx                # Application routes and Toast provider
│   └── main.tsx               # DOM entry point
├── vitest.config.ts           # Vitest configuration (jsdom environment)
├── vite.config.ts             # Vite configuration with Tailwind CSS 4
└── package.json
```

---

## Getting Started

### 1. Prerequisites

- Node.js `>= 22.13`
- `pnpm` (`npm install -g pnpm`)

### 2. Environment Variables

Create a `.env` file in `frontend/` (or copy `.env.example`):

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Development

From the monorepo root or inside `frontend/`:

```bash
# Start Vite development server (http://localhost:5173)
pnpm run dev
```

---

## Available Scripts

| Script                   | Command                 | Description                                          |
| ------------------------ | ----------------------- | ---------------------------------------------------- |
| `pnpm run dev`           | `vite`                  | Starts Vite HMR dev server                           |
| `pnpm run build`         | `tsc -b && vite build`  | Typechecks and builds production bundle to `dist/`   |
| `pnpm run preview`       | `vite preview`          | Previews production build locally                    |
| `pnpm run test`          | `vitest run`            | Runs all 18 Vitest unit tests                        |
| `pnpm run test:watch`    | `vitest`                | Runs Vitest in interactive watch mode                |
| `pnpm run test:coverage` | `vitest run --coverage` | Generates unit test code coverage report             |
| `pnpm run typecheck`     | `tsc -b`                | Checks TypeScript compilation without emitting files |
| `pnpm run lint`          | `eslint .`              | Runs ESLint                                          |
| `pnpm run lint:fix`      | `eslint . --fix`        | Automatically fixes autofixable ESLint warnings      |
| `pnpm run format`        | `prettier --write .`    | Formats all source files with Prettier               |
| `pnpm run format:check`  | `prettier --check .`    | Verifies code style compliance                       |

---

## Deployment (Vercel)

The frontend is ready for zero-config Vercel deployment:

- Rewrites configured in [`vercel.json`](file:///home/kaycee/Desktop/Personal/Midas/frontend/vercel.json) to support client-side routing.
- Synchronized [`pnpm-lock.yaml`](file:///home/kaycee/Desktop/Personal/Midas/frontend/pnpm-lock.yaml) enables `--frozen-lockfile` installations in Vercel CI.
