import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import { DeleteAccountButton } from "@/app/_components/delete-account-button";

describe("DeleteAccountButton", () => {
  beforeEach(() => {
    push.mockClear();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ deleted: true }), { status: 200 })));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("calls DELETE /api/account and redirects home", async () => {
    render(<DeleteAccountButton />);
    fireEvent.click(screen.getByRole("button", { name: /delete account/i }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/"));
    const [url, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/account");
    expect(init.method).toBe("DELETE");
  });
});
