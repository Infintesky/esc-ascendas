# End-to-end tests (Playwright)

Browser-driven tests that exercise the real app. Complements the Vitest suites
under `test/` (unit + route-handler/component integration) — these drive a real
Chromium against a running server.

## Layout

| File | Covers | Needs secrets? |
| --- | --- | --- |
| `home.spec.ts` | Landing shell, destination autocomplete (client index + fuzzy), empty-destination validation | No |
| `search-and-browse.spec.ts` | Form → `/search` → progressive price polling → hotel detail (real BFF routes + upstream API) | No |
| `booking.spec.ts` | Full search → hotel → room → booking form → confirmation (writes a booking) | **Yes** — gated by `RUN_BOOKING_E2E` |
| `helpers.ts` | Shared flows (`futureStay`, `pickDestination`, `pickStayDates`) | — |

## Running

```sh
bun run test:e2e            # headless; auto-starts `build:index && dev` on :3000
bun run test:e2e:ui        # Playwright UI mode
bun run test:e2e:report    # open the last HTML report
```

The `webServer` in `playwright.config.ts` boots the app for you and reuses an
already-running dev server locally. To target a deployed URL instead (e.g. a
Vercel preview), skip the local server:

```sh
PLAYWRIGHT_BASE_URL=https://<preview>.vercel.app bun run test:e2e
```

First run only, install the browser binary if missing:

```sh
bunx playwright install chromium
```

## The booking test

`booking.spec.ts` writes a real booking, so it is **skipped unless
`RUN_BOOKING_E2E=1`** and these are configured in `.env`:

- `DATABASE_URL` (booking insert)
- `STRIPE_SECRET_KEY` (test mode) + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`

It uses the reserved demo email `demo@ascenda.test` (skips the OTP challenge, see
`lib/auth/test-email.ts`) and the Stripe test card `4242 4242 4242 4242`.

```sh
RUN_BOOKING_E2E=1 bun run test:e2e booking.spec.ts
```
