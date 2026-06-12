# esc-ascendas

## Project Context

Ascenda Loyalty provides white-labelled hotel booking platforms on behalf of banks, airlines and loyalty programs worldwide. Global customers can earn & redeem hotel night stays in these platforms using accumulated points from their spendings. Some features in these platforms include text-based autocomplete search, aggregating hotel / destination searches from multiple suppliers, storage of booking data, etc. These features could serve as a challenging project topic which tests students' knowledge on data abstraction, good software design, scalability, and security.

## Project Objectives

Provide students with a real-world example of a scalable and secure software system in the tech industry. Challenge students to come up with a good software design & practice when recreating (or even improving) Ascenda's current features.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Runtime | [Bun](https://bun.sh) |
| Framework / Routing / Data Fetching / Forms | [Next.js](https://nextjs.org) |
| ORM | [Drizzle ORM](https://orm.drizzle.team) |
| Database | [Supabase Postgres](https://supabase.com) |
| UI | [shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS v4](https://tailwindcss.com) |
| Icons | [Lucide](https://lucide.dev) |
| Charts | [Recharts](https://recharts.org) |

## Local Development

```sh
bun install
cp .env.example .env.local   # fill in Supabase values
bun --bun run dev            # http://localhost:3000
```

## Commands

```sh
bun --bun run dev          # dev server
bun --bun run build        # production build
bun --bun run test         # run all tests (vitest)
bun --bun run db:generate  # generate Drizzle migrations
bun --bun run db:migrate   # apply migrations
bun --bun run db:push      # push schema directly (dev shortcut)
```

## Environment Variables

Copy `.env.example` → `.env.local`:

```
DATABASE_URL                   # Supabase Postgres (server-only)
NEXT_PUBLIC_SUPABASE_URL       # public, browser-safe
NEXT_PUBLIC_SUPABASE_ANON_KEY  # public, browser-safe
SUPABASE_SERVICE_ROLE_KEY      # server-only, never prefix with NEXT_PUBLIC_
```
