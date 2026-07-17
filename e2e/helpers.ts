import { type Page, expect } from "@playwright/test";

/**
 * A stay comfortably in the future so every day is selectable (the form disables
 * days < 3 days out) and both dates land in the same calendar month grid.
 */
export function futureStay(daysAhead = 35, nights = 3) {
  const checkin = new Date();
  checkin.setDate(checkin.getDate() + daysAhead);
  const checkout = new Date(checkin);
  checkout.setDate(checkout.getDate() + nights);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const monthLabel = checkin.toLocaleString("en-US", { month: "long", year: "numeric" });
  return {
    checkin,
    checkout,
    checkinISO: iso(checkin),
    checkoutISO: iso(checkout),
    monthLabel, // e.g. "September 2026" — matches the calendar grid's accessible name
  };
}

/** Type into the destination autocomplete and pick the first suggestion. */
export async function pickDestination(page: Page, query: string) {
  const input = page.getByLabel("Destination");
  await input.click();
  await input.fill(query);
  const listbox = page.getByRole("listbox");
  await expect(listbox).toBeVisible();
  await listbox.getByRole("option").first().click();
}

/**
 * Drive the shadcn range Calendar popover: open it, advance to the target month,
 * then click check-in and check-out days within that month's grid.
 */
export async function pickStayDates(page: Page, stay: ReturnType<typeof futureStay>) {
  await page.getByRole("button", { name: "Check-in / Check-out" }).click();

  // The calendar shows two months; advance until the target month grid is visible.
  const grid = page.getByRole("grid", { name: new RegExp(stay.monthLabel, "i") });
  for (let i = 0; i < 12 && !(await grid.isVisible().catch(() => false)); i++) {
    await page.getByRole("button", { name: /next month/i }).click();
  }
  await expect(grid).toBeVisible();

  // Day buttons carry a full-date aria-label (react-day-picker), so match the
  // visible number instead. Mid-month days avoid adjacent-month duplicates.
  await grid.getByText(String(stay.checkin.getDate()), { exact: true }).click();
  await grid.getByText(String(stay.checkout.getDate()), { exact: true }).click();
}
