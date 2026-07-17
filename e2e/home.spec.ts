import { test, expect } from "@playwright/test";
import { pickDestination } from "./helpers";

// Fast, deterministic checks that need no upstream/secret: the landing shell and
// the client-side destination index (public/destinations-index.json) + fuzzy search.
test.describe("Landing & autocomplete", () => {
  test("landing page renders the search form", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByLabel("Destination")).toBeVisible();
    await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  });

  test("destination autocomplete suggests and fills on select", async ({ page }) => {
    await page.goto("/");
    await pickDestination(page, "Singapore");
    await expect(page.getByLabel("Destination")).toHaveValue(/Singapore/i);
  });

  test("submitting without a destination shows an inline error", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Search" }).click();
    // Scope past Next's route-announcer (also role="alert") to the form's error.
    await expect(page.getByText(/enter and pick a destination/i)).toBeVisible();
  });
});
