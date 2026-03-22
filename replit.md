# Workspace

## Overview

**NEWFLIX STORE | نيوفلكس ستور** — Arabic-first bilingual digital e-commerce web app for Bahrain. pnpm workspace monorepo using TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React 19 + Vite + Tailwind CSS v4
- **Auth**: Firebase Auth (project: `dukani-emq1m`)
- **UI**: shadcn/ui components, Lucide icons, Framer Motion animations
- **Routing**: wouter
- **State**: React Query for API, React Context for cart/auth/language
- **Theme**: next-themes (dark/light), CSS custom properties
- **Fonts**: Noto Kufi Arabic (headings), Tajawal (body), Inter (English)
- **Brand Colors**: Primary dark `#173E52`, Accent teal `#1FB5AC`, Success `#4BB874`

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080)
│   ├── mockup-sandbox/     # Component preview server
│   └── web/                # NEWFLIX STORE React+Vite frontend (port 22333)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Admin System

- **Admin Login**: `/Newflix-login` — separate from customer auth, JWT-based sessions
- **Invite Code**: Server-validated via `ADMIN_INVITE_CODE` env var (`Almurisi34490039@`)
- **Admin Auth**: bcryptjs password hashing, JWT tokens (7-day expiry), admin middleware
- **Signup Toggle**: Admin can disable new admin registration from Settings
- **CMS**: `site_content` table stores all editable text (AR/EN) with content keys
- **Inline Editing**: When admin logged in, toggle "Edit Mode" to see pencil icons on editable text; supports text, color, font-size, font-weight editing
- **Activity Logs**: All admin actions (login, content edits, setting changes) logged to `admin_activity_logs`
- **Homepage Ordering**: Drag-and-drop section reordering in admin dashboard
- **Admin Dashboard Tabs**: Overview, Page Management, Homepage Sections, Content (CMS), Products, Orders, Activity Log, Settings

## Frontend Architecture (`artifacts/web/`)

```text
src/
├── App.tsx                 # Root with providers: Theme, QueryClient, Language, Auth, Cart
├── index.css               # Tailwind + brand CSS variables (light/dark)
├── main.tsx                # ReactDOM entry
├── components/
│   ├── Navbar.tsx           # Sticky header with RTL support, mobile drawer
│   ├── Footer.tsx           # 4-column footer
│   ├── ProductCard.tsx      # Product card with hover animation
│   ├── CartDrawer.tsx       # Slide-out cart panel
│   ├── LanguageSwitcher.tsx # AR/EN toggle
│   ├── ThemeToggle.tsx      # Dark/light toggle (next-themes)
│   ├── WhatsAppButton.tsx   # Floating WhatsApp button
│   └── ui/                  # shadcn/ui primitives
├── contexts/
│   ├── LanguageContext.tsx   # AR/EN with translations, dir, localStorage
│   ├── CartContext.tsx       # Cart items, quantities, localStorage persistence
│   ├── AuthContext.tsx       # Firebase Auth state (customer)
│   ├── AdminAuthContext.tsx  # Admin JWT auth (login/register/me)
│   ├── SiteContentContext.tsx # CMS content provider (loads all site text)
│   └── EditModeContext.tsx   # Inline editing toggle for admins
├── lib/
│   ├── firebase.ts          # Firebase app initialization
│   └── utils.ts             # cn() utility
└── pages/
    ├── Home.tsx              # Hero, features, categories, featured products, CTA
    ├── Shop.tsx              # Product grid with sidebar filters, search
    ├── ProductDetail.tsx     # Full product page with gallery, quantity selector
    ├── Cart.tsx              # Cart page with coupon code support
    ├── Checkout.tsx          # Checkout form with order summary
    ├── Auth.tsx              # Login/register with Firebase (customers)
    ├── AdminLogin.tsx        # Admin login/register at /Newflix-login
    ├── AdminDashboard.tsx    # Full admin dashboard with sidebar + tabs
    └── not-found.tsx         # 404 page
```

## API Routes (`artifacts/api-server/`)

All routes mounted at `/api`:
- `GET /api/healthz` — health check
- `GET/POST /api/products` — list/create products
- `GET/PATCH/DELETE /api/products/:id` — single product CRUD
- `GET/POST /api/categories` — list/create categories
- `PATCH/DELETE /api/categories/:id` — single category CRUD
- `POST /api/orders` — create order (with digital delivery)
- `GET /api/orders` — list orders (admin)
- `GET /api/orders/:id` — single order
- `PATCH /api/orders/:id/status` — update order status
- `POST /api/orders/:id/confirm-payment` — confirm payment
- `GET /api/orders/user/:firebaseUid` — user's orders
- `GET /api/orders/:id/delivery` — get delivery items
- `POST /api/coupons/validate` — validate coupon code
- `GET/POST /api/coupons` — list/create coupons
- `GET /api/admin/stats` — admin dashboard stats
- `GET/PUT /api/homepage-sections` — homepage sections CRUD
- `GET/POST /api/popups` — popups management
- `PATCH /api/popups/:id` — update popup
- `GET /api/inventory/:productId` — inventory items
- `POST /api/inventory/:productId` — add inventory items
- `POST /api/admin-auth/register` — register admin (requires invite code)
- `POST /api/admin-auth/login` — admin login (returns JWT)
- `GET /api/admin-auth/me` — verify admin token
- `GET/POST /api/site-content` — list/create site content
- `GET/PUT /api/site-content/:key` — get/update content by key
- `POST /api/site-content/bulk` — bulk update content
- `GET/PUT /api/admin-settings/:key` — get/update admin settings
- `GET /api/admin-activity-logs` — list admin activity logs
- `POST /api/seed` — seed demo data

## Database Schema

Tables: `categories`, `products`, `orders`, `coupons`, `homepage_sections`, `popups`, `inventory_items`, `admin_users`, `site_content`, `admin_activity_logs`, `admin_settings`

## Key Configuration

- **Firebase**: apiKey `AIzaSyAQiWBcLbBVneGBSRmoTsFSsYJWUWX9_gQ`, project `dukani-emq1m`
- **Admin check**: `email.includes('@newflix.com') || email === 'admin@admin.com'`
- **WhatsApp**: `https://wa.me/97337127483`
- **Instagram**: `@NEWFLIX.ADS`
- **Coupon codes**: `WELCOME10` (10%), `NEWFLIX20` (20%)
- **Default language**: Arabic (RTL)
- **Default theme**: Light

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`

## Codegen

- Run codegen: `pnpm --filter @workspace/api-spec run codegen`
- Generates React Query hooks → `lib/api-client-react/src/generated/`
- Generates Zod schemas → `lib/api-zod/src/generated/`

## Seed Data

Run `curl -X POST http://localhost:8080/api/seed` to populate demo data (8 products, 6 categories, coupons, homepage sections, popup).
