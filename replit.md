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
- **Auth**: Firebase Auth (project: `dukani-emq1m`) for customers, JWT for admin
- **AI**: Gemini 2.5 Flash via AI Integrations proxy (receipt verification, product description generation)
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
- **Admin Auth**: bcryptjs password hashing, JWT tokens (7-day expiry), admin middleware (`requireAdmin`)
- **Signup Toggle**: Admin can disable new admin registration from Settings
- **CMS**: `site_content` table stores all editable text (AR/EN) with content keys
- **Inline Editing**: When admin logged in, toggle "Edit Mode" to see pencil icons on editable text
- **Activity Logs**: All admin actions logged to `admin_activity_logs`
- **Homepage Ordering**: Drag-and-drop section reordering in admin dashboard

## Admin Dashboard Tabs

- **Overview**: Revenue, orders count, products count, low stock alerts, recent orders
- **Products**: Full CRUD with AI description generation, delivery mode (multi_code/single_code/whatsapp_manual), packages/tiers, inventory code management
- **Orders**: Table with receipt viewer, AI verification results, confirm/reject payment actions
- **Coupons**: Full CRUD (create/toggle/delete) with percentage/fixed discount types
- **Users**: Customer list derived from orders with total spent and order count
- **Loyalty Points**: Display loyalty system info (1 BHD = 1 point, auto-awarded)
- **Payment**: BenefitPay configuration display (name: ESMAIL ALMURISI, number: 34490039)
- **Homepage**: Drag-and-drop section ordering with visibility toggles
- **Content (CMS)**: Inline text editing for all site content (AR/EN)
- **Pages**: Page overview with sections breakdown
- **Activity**: Admin activity log
- **Settings**: Toggle admin signup, maintenance mode

## Payment & Delivery Flow

1. Customer creates order → status: `pending`
2. Customer transfers via BenefitPay to ESMAIL ALMURISI / 34490039
3. Customer uploads receipt image
4. AI (Gemini 2.5 Flash) verifies: name match, number match, amount match, fraud detection
5. If verified → auto-delivers codes, awards loyalty points, status: `paid`
6. If not verified → stays `pending`, admin can manually confirm/reject
7. Delivery modes:
   - `multi_code`: Unique code per purchase from inventory
   - `single_code`: Same code for all customers
   - `whatsapp_manual`: Manual delivery via WhatsApp

## Frontend Pages

```text
/                  → Homepage (hero, features, categories, products, CTA)
/shop              → Product grid with filters, search, categories
/product/:id       → Product detail page
/cart              → Cart with coupon support
/checkout          → BenefitPay payment + receipt upload
/login             → Customer Firebase auth
/account           → Account hub
/account/orders    → My Orders with delivery codes
/account/wishlist  → Wishlist
/account/settings  → Account settings
/about             → About page
/contact           → Contact page
/faq               → FAQ page
/terms             → Terms page
/Newflix-login      → Admin login
/Newflix-admin      → Admin dashboard
```

## API Routes (`artifacts/api-server/`)

All routes mounted at `/api`:
- `GET /api/healthz` — health check
- `GET/POST /api/products` — list/create products (admin: `?admin=true` shows inactive)
- `GET/PATCH/DELETE /api/products/:id` — single product CRUD
- `GET/POST /api/categories` — list/create categories
- `PATCH/DELETE /api/categories/:id` — single category CRUD
- `POST /api/orders` — create order
- `GET /api/orders` — list orders (admin)
- `GET /api/orders/:id` — single order
- `PATCH /api/orders/:id` — update order status
- `POST /api/orders/:id/confirm-payment` — confirm payment + deliver codes
- `GET /api/user/orders` — user's orders by firebaseUid
- `GET /api/user/orders/:id/delivery` — delivery data (codes) for paid order
- `POST /api/orders/:id/upload-receipt` — upload receipt image + AI verification
- `POST /api/orders/:id/admin-confirm` — admin confirm/reject payment (requires admin auth)
- `GET/POST/PATCH/DELETE /api/coupons` — coupons CRUD (requires admin auth)
- `POST /api/coupons/validate` — validate coupon code (public)
- `GET /api/loyalty/:firebaseUid` — loyalty points balance + history
- `POST /api/ai/generate-product-description` — AI product description generation
- `GET /api/admin/stats` — admin dashboard stats
- `GET/PUT /api/homepage/sections` — homepage sections management
- `GET/POST /api/popups` — popups management
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
- `GET /api/uploads/*` — static file serving for uploaded receipts

## Database Schema

Tables: `categories`, `products`, `orders`, `coupons`, `homepage_sections`, `popups`, `inventory_items`, `admin_users`, `site_content`, `admin_activity_logs`, `admin_settings`, `loyalty_points`

Key product columns: `deliveryMode` (multi_code/single_code/whatsapp_manual), `singleCodeValue`, `featuresAr`, `featuresEn`, `packages` (JSONB)
Key order columns: `receiptImage`, `receiptStatus` (pending/verified/rejected), `aiVerificationResult` (JSONB), `loyaltyPointsEarned`

## Key Configuration

- **Firebase**: apiKey `AIzaSyAQiWBcLbBVneGBSRmoTsFSsYJWUWX9_gQ`, project `dukani-emq1m`
- **BenefitPay**: Name: ESMAIL ALMURISI, Number: 34490039
- **WhatsApp**: `https://wa.me/97337127483`
- **Instagram**: `@NEWFLIX.ADS`
- **Coupon codes**: `WELCOME10` (10%), `NEWFLIX20` (20%)
- **Loyalty**: 1 BHD = 1 point, auto-awarded on payment confirmation
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
