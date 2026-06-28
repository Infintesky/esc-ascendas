import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import { SearchForm } from "@/app/_components/search-form";

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
    expect(await screen.findByText(/select a destination/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("navigates to /search with params on valid submit", async () => {
    render(<SearchForm />);
    const input = await screen.findByPlaceholderText(/city or hotel/i);
    fireEvent.change(input, { target: { value: "singa" } });
    fireEvent.click(await screen.findByText(/Singapore, Singapore/));
    fireEvent.change(screen.getByLabelText(/check-in/i), { target: { value: "2026-10-01" } });
    fireEvent.change(screen.getByLabelText(/check-out/i), { target: { value: "2026-10-07" } });
    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    await waitFor(() => expect(push).toHaveBeenCalled());
    const dest = push.mock.calls[0][0] as string;
    expect(dest).toContain("destination_id=RsBU");
    expect(dest).toContain("checkin=2026-10-01");
  });
});
