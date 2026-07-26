import { test, expect } from "@playwright/test";
import { futureStay, pickDestination, pickStayDates } from "./helpers";

// Full happy path: search -> hotel -> room -> booking form -> confirmation.
//
// Unlike the browse spec, this one WRITES a booking, so it needs live services:
//   - DATABASE_URL                        (booking insert)
//   - STRIPE_SECRET_KEY (test mode)       (PaymentIntent confirm)
//   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  (Stripe Elements tokenization)
//   - NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY(auth client for the email step)
// It uses the reserved demo email (skips the OTP challenge) and a Stripe test card.
// Opt in with RUN_BOOKING_E2E=1 once those are configured; skipped by default so
// the suite stays green without secrets.
const TEST_EMAIL = "demo@ascenda.test"; // must match lib/auth/test-email.ts

test.describe("Booking + payment", () => {
  test.skip(!process.env.RUN_BOOKING_E2E, "set RUN_BOOKING_E2E=1 with live Stripe/DB/Supabase env");

  test("book a hotel through to the confirmation page", async ({ page }) => {
    const stay = futureStay();

    // --- Search -> results -> hotel -> room ---
    await page.goto("/");
    await pickDestination(page, "Singapore");
    await pickStayDates(page, stay);
    await page.getByRole("button", { name: "Search" }).click();

    await page.getByRole("button", { name: "Select" }).first().click({ timeout: 45_000 });
    await expect(page).toHaveURL(/\/hotels\//);

    await page.getByRole("button", { name: "Select room" }).first().click({ timeout: 45_000 });
    await expect(page).toHaveURL(/\/book\?/);

    // --- Guest details (reserved email skips OTP) ---
    await page.getByLabel("First name").fill("Ada");
    await page.getByLabel("Last name").fill("Lovelace");
    await page.getByLabel("Phone").fill("91234567");
    await page.getByLabel("Email").fill(TEST_EMAIL);
    await page.getByRole("button", { name: /^Verify$/ }).click();
    await expect(page.getByText(/Verified/i)).toBeVisible();

    // --- Billing address ---
    await page.getByLabel("Address").fill("1 Marina Blvd");
    await page.getByLabel("City").fill("Singapore");
    await page.getByLabel("Postal code").fill("018989");
    await page.getByLabel("Country").click();
    await page.getByRole("option", { name: "Singapore" }).click();

    // --- Card (Stripe Elements iframe) — test card 4242… ---
    const card = page.frameLocator('iframe[title="Secure card payment input frame"]');
    await card.getByPlaceholder("Card number").fill("4242424242424242");
    await card.getByPlaceholder("MM / YY").fill("12 / 34");
    await card.getByPlaceholder("CVC").fill("123");

    // --- Pay & book -> confirmation ---
    await page.getByRole("button", { name: /book/i }).click();
    await expect(page).toHaveURL(/\/book\/confirmation\//, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: /thank you/i })).toBeVisible();
    await expect(page.getByText(/Reference/i)).toBeVisible();
  });
});
