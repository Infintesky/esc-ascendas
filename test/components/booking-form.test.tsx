import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

// Stripe hooks/components are mocked: CardElement renders a marker, createPaymentMethod returns a token.
const createPaymentMethod = vi.fn(async () => ({ paymentMethod: { id: "pm_test_xyz" } }));
vi.mock("@stripe/react-stripe-js", () => ({
  useStripe: () => ({ createPaymentMethod }),
  useElements: () => ({ getElement: () => ({}) }),
  CardElement: () => <div data-testid="card-element" />,
  Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { BookingForm } from "@/app/_components/booking-form";

const prefill = {
  destination_id: "RsBU", hotel_id: "QDaO", room_key: "k1", room_type: "Deluxe",
  checkin: "2026-10-01", checkout: "2026-10-07", guests: "2", rooms: "1", price: "1200", currency: "SGD",
};

describe("BookingForm", () => {
  beforeEach(() => {
    push.mockClear();
    createPaymentMethod.mockClear();
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({ reference: "BK-20261001-ABC123", status: "confirmed" }), { status: 201 }),
    ));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("has no raw card-number input in our own DOM", () => {
    render(<BookingForm prefill={prefill} />);
    expect(screen.queryByLabelText(/card number/i)).toBeNull();
    expect(screen.getByTestId("card-element")).toBeInTheDocument();
  });

  it("submits a payment method id and redirects to confirmation", async () => {
    render(<BookingForm prefill={prefill} />);
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "Ada" } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "Lovelace" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "ada@example.com" } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: "+6512345678" } });
    fireEvent.change(screen.getByLabelText(/address/i), { target: { value: "1 Road" } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: "Singapore" } });
    fireEvent.change(screen.getByLabelText(/postal/i), { target: { value: "123456" } });
    fireEvent.change(screen.getByLabelText(/country/i), { target: { value: "SG" } });
    fireEvent.click(screen.getByRole("button", { name: /pay/i }));

    await waitFor(() => expect(createPaymentMethod).toHaveBeenCalled());
    await waitFor(() => expect(push).toHaveBeenCalledWith("/book/confirmation/BK-20261001-ABC123"));
    const body = JSON.parse((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(body.paymentMethodId).toBe("pm_test_xyz");
    expect(body).not.toHaveProperty("cardNumber");
  });
});
