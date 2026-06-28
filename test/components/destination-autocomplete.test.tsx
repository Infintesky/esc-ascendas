import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DestinationAutocomplete } from "@/app/_components/destination-autocomplete";

const entries = [
  { uid: "1", term: "Singapore, Singapore", lat: 1.3, lng: 103.8, state: "", type: "city" },
];

describe("DestinationAutocomplete", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify(entries), { status: 200 }),
    ));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("suggests and selects a destination", async () => {
    const onSelect = vi.fn();
    render(<DestinationAutocomplete value="" onSelect={onSelect} />);
    const input = await screen.findByPlaceholderText(/city or hotel/i);
    fireEvent.change(input, { target: { value: "singa" } });
    const option = await screen.findByText(/Singapore, Singapore/);
    fireEvent.click(option);
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ uid: "1" })));
  });
});
