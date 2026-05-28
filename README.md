# D Product Selling — AI SaaS Platform

Production-ready Next.js App Router architecture for AI-powered digital product generation and automated Instagram selling.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth + DB | Supabase |
| State | Zustand |
| Server State | TanStack React Query |
| Validation | Zod + React Hook Form |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in your Supabase credentials in .env.local

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Folder Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Auth route group (login, signup)
│   ├── (dashboard)/          # Protected dashboard shell
│   │   └── dashboard/        # Dashboard page + loading/error
│   ├── api/                  # API Route Handlers
│   │   ├── auth/callback/    # Supabase OAuth callback
│   │   └── products/         # Products CRUD endpoints
│   ├── layout.tsx            # Root layout + providers
│   ├── page.tsx              # Landing page
│   └── not-found.tsx         # Global 404
│
├── components/
│   ├── common/               # Logo, ThemeToggle, LoadingSpinner
│   ├── layout/               # Sidebar, Navbar
│   └── ui/                   # shadcn/ui primitives
│
├── hooks/                    # useAuth, useSidebar
├── lib/                      # utils, constants, validations, supabase clients
├── providers/                # ThemeProvider, QueryProvider, AuthProvider
├── store/                    # Zustand stores (auth, ui)
└── types/                    # TypeScript types (auth, product, api, supabase)
```

## Environment Variables

See `.env.example` for all required variables.

## Development Phases

- **Phase 1 (current)** — Architecture scaffold ✅
- **Phase 2** — Auth flows (login, signup, OAuth) + Supabase tables
- **Phase 3** — AI product generation (OpenAI / Replicate)
- **Phase 4** — Instagram automation (Instagram Graph API)
- **Phase 5** — Payments (Stripe)
