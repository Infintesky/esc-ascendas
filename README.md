# esc-ascendas

A white-labelled hotel booking platform inspired by [Ascenda Loyalty](https://www.ascenda.com/) — text-based autocomplete destination search, multi-supplier hotel/price aggregation, live rate polling, and Stripe-backed booking with a points-loyalty data model.

## Project Context

Ascenda Loyalty provides white-labelled hotel booking platforms on behalf of banks, airlines and loyalty programs worldwide. Global customers can earn & redeem hotel night stays in these platforms using accumulated points from their spendings. Some features in these platforms include text-based autocomplete search, aggregating hotel / destination searches from multiple suppliers, storage of booking data, etc. These features could serve as a challenging project topic which tests students' knowledge on data abstraction, good software design, scalability, and security.

## Project Objectives

Provide students with a real-world example of a scalable and secure software system in the tech industry. Challenge students to come up with a good software design & practice when recreating (or even improving) Ascenda's current features.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Runtime / package manager | [Bun](https://bun.sh) |
| Framework / Routing / Data Fetching | [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev) |
| ORM | [Drizzle ORM](https://orm.drizzle.team) + [postgres.js](https://github.com/porsager/postgres) |
| Database | [Supabase Postgres](https://supabase.com) |
| Payments | [Stripe](https://stripe.com) (Elements, server-side PaymentIntents) |
| UI | [shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS v4](https://tailwindcss.com) |
| Animation / Theming | [Framer Motion](https://www.framer.com/motion/) + [next-themes](https://github.com/pacocoursey/next-themes) (light/dark) |
| Search | [MiniSearch](https://lucaong.github.io/minisearch/) (client-side fuzzy autocomplete) |
| Validation | [Zod 4](https://zod.dev) |
| Icons | [Lucide](https://lucide.dev) |
| Testing | [Vitest](https://vitest.dev) + Testing Library; [Playwright](https://playwright.dev) for browser verification |

## Features

| Status | Feature |
| --- | --- |
| ✅ | **Destination autocomplete** — fuzzy, city-token-ranked search over ~70k destinations, built into a client index at build time |
| ✅ | **Search form** — past-date graying, auto check-out from check-in, room/guest caps, top-match auto-select |
| ✅ | **Results page** (`/search`) — supplier hotel list joined with live prices, polling until prices settle, filter + sort, list virtualization, Suspense streaming |
| ✅ | **Hotel detail** (`/hotels/[id]`) — images, amenities, fresh per-room rates |
| ✅ | **Booking + payment** (`/book`) — guest/billing form, Stripe Elements (card data never touches our server), PaymentIntent confirmation, masked-card confirmation page |
| ✅ | **Theming** — emerald brand, light/dark mode across all pages |
| 🚧 | **Accounts, points & GDPR** — DB schema (`users`, `points_ledger`) exists; auth, points earn/redeem, account pages and GDPR export/delete are not yet wired |

## Architecture Notes

- **BFF proxy routes** under `app/api/*` wrap the upstream Ascenda Hotel API (`hotelapi.loyalty.dev`) so the browser never calls it directly — params are validated, responses normalized, and the upstream is kept server-side.
- **Abstraction seam**: all upstream payloads pass through `lib/ascenda/mappers.ts` into Zod-validated internal types (`lib/ascenda/types.ts`), decoupling the UI from supplier shapes.
- **Live pricing**: Ascenda returns prices incrementally (`completed: false`), so `hooks/use-hotel-prices.ts` polls and merges results by hotel id.

## Local Development

This repo runs on **Bun** for installs/scripts, but Next.js dev/build needs **Node ≥ 20.9** (the build and `next start` are run under Node).

```sh
bun install
cp .env.example .env          # fill in Supabase + Stripe values
bun --bun run dev             # http://localhost:3000
```

> The destination search index is generated automatically before each build
> (`prebuild` → `scripts/build-destination-index.ts`). Run `bun run build:index`
> to regenerate it on demand.

## Commands

```sh
bun --bun run dev          # dev server (next dev)
bun --bun run build        # production build (regenerates search index first)
bun --bun run start        # serve the production build
bun --bun run lint         # eslint (flat config)
bun --bun run test         # run all tests (vitest)
bun --bun run test:watch   # watch mode
bun --bun run build:index  # rebuild the destination autocomplete index
bun --bun run db:generate  # generate Drizzle migrations
bun --bun run db:migrate   # apply migrations
bun --bun run db:push      # push schema directly (dev shortcut)
```

## Environment Variables

Copy `.env.example` → `.env` and fill in:

```
DATABASE_URL                       # Supabase Postgres connection string (server-only)
NEXT_PUBLIC_SUPABASE_URL           # public, browser-safe
NEXT_PUBLIC_SUPABASE_ANON_KEY      # public, browser-safe
SUPABASE_SERVICE_ROLE_KEY          # server-only, never prefix with NEXT_PUBLIC_
STRIPE_SECRET_KEY                  # server-only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY # public, browser-safe
```

Browser-exposed variables **must** use the `NEXT_PUBLIC_` prefix (Next.js
convention). Secrets (`DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`STRIPE_SECRET_KEY`) must never carry that prefix. `.env` is git-ignored — only
`.env.example` is committed.
