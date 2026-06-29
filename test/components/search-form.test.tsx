import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

// Pin the earliest selectable check-in so the calendar always opens on a known
// month (Oct 2026), independent of the real system clock.
vi.mock("@/lib/search/params", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/search/params")>();
  return { ...actual, minCheckinDate: () => "2026-10-10" };
});

import { SearchForm } from "@/app/_components/search-form";

/** Click an enabled day cell in the currently-open calendar popover. */
async function pickDay(localeDate: string) {
  const day = await waitFor(() => {
    const el = document.querySelector(`[data-day="${localeDate}"]`);
    if (!el) throw new Error(`day ${localeDate} not rendered`);
    return el as HTMLElement;
  });
  fireEvent.click(day);
}

describe("SearchForm", () => {
  beforeEach(() => {
    push.mockClear();
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify([
        { uid: "RsBU", term: "Singapore, Singapore", lat: 1.3, lng: 103.8, state: "", type: "city" },
      ]), { status: 200 }),
    ));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("shows an error when no destination is selected", async () => {
    render(<SearchForm />);
    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    expect(await screen.findByText(/pick a destination/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("navigates to /search with params on valid submit", async () => {
    render(<SearchForm />);
    const input = await screen.findByPlaceholderText(/city or hotel/i);
    fireEvent.change(input, { target: { value: "singa" } });
    fireEvent.click(await screen.findByText(/Singapore, Singapore/));

    // Pick the stay as a range in the shadcn Calendar popover: first click sets
    // the start, second click sets the end and closes the popover.
    fireEvent.click(screen.getByRole("button", { name: /check-in/i }));
    await pickDay("10/15/2026");
    await pickDay("10/20/2026");

    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    await waitFor(() => expect(push).toHaveBeenCalled());
    const dest = push.mock.calls[0][0] as string;
    expect(dest).toContain("destination_id=RsBU");
    expect(dest).toContain("checkin=2026-10-15");
    expect(dest).toContain("checkout=2026-10-20");
  });
});
