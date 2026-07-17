import { test, expect } from "@playwright/test";
import { futureStay, pickDestination, pickStayDates } from "./helpers";

// Full form-driven happy path through the read-only journey:
//   landing -> search -> streamed results -> hotel detail.
// Exercises the real BFF proxy routes, progressive price polling, and the detail
// page. Hotels/prices come from the public upstream API, so no secrets are needed.
// (Booking/payment continues in booking.spec.ts, which is env-gated.)
test("search a destination and open a hotel", async ({ page }) => {
  const stay = futureStay();

  await page.goto("/");
  await pickDestination(page, "Singapore");
  await pickStayDates(page, stay);
  await page.getByRole("button", { name: "Search" }).click();

  // Landed on the results page with the query in the URL.
  await expect(page).toHaveURL(/\/search\?.*destination_id=/);

  // Prices stream in progressively; the first "Select" appears once a hotel is ready.
  const firstSelect = page.getByRole("link", { name: "Select" }).first();
  await expect(firstSelect).toBeVisible({ timeout: 45_000 });

  await firstSelect.click();

  // On the hotel detail page: URL carries the hotel id and the carried-through query.
  await expect(page).toHaveURL(/\/hotels\/[^/?]+\?.*checkin=/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
