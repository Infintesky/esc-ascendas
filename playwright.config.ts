import { defineConfig, devices } from "@playwright/test";

// End-to-end tests drive the real app in a browser. They live under e2e/ and are
// kept out of the Vitest include (see vitest.config.ts). The webServer block boots
// the app for the run; set PLAYWRIGHT_BASE_URL to point at an already-running
// server (e.g. a Vercel preview) and the local server is skipped.
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const useExternalServer = Boolean(process.env.PLAYWRIGHT_BASE_URL);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  // Run the app the same way it is deployed — a production build then start.
  // `build` regenerates the autocomplete index via prebuild, and a prod build
  // avoids the Turbopack dev-only bundler quirks. Prices/hotels come from the
  // public upstream API and need no secrets, so search+browse runs without .env.
  // Set PLAYWRIGHT_BASE_URL (above) to reuse an already-running server instead.
  webServer: useExternalServer
    ? undefined
    : {
        command: "bun run build && bun run start",
        url: baseURL,
        timeout: 300_000,
        reuseExistingServer: !process.env.CI,
      },
});
