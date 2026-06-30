import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookingSummary } from "@/app/book/confirmation/[reference]/page";

describe("BookingSummary", () => {
  it("shows the reference and masked card", () => {
    render(
      <BookingSummary
        booking={{
          reference: "BK-20261001-ABC123", hotelId: "QDaO", destinationId: "RsBU",
          roomType: "Deluxe", checkin: "2026-10-01", checkout: "2026-10-07",
          nights: 6, adults: 2, children: 0, price: "1200", currency: "SGD",
          status: "confirmed", cardLast4: "4242", cardBrand: "visa",
          guestName: "Ada Lovelace", guestEmail: "ada@example.com",
          guestPhone: "+6512345678", messageToHotel: "High floor please",
          billingAddress: "1 Road, Singapore, 123456, SG",
        }}
      />,
    );
    expect(screen.getByText(/BK-20261001-ABC123/)).toBeInTheDocument();
    expect(screen.getByText(/•••• 4242/)).toBeInTheDocument();
    expect(screen.getByText(/confirmed/i)).toBeInTheDocument();
    expect(screen.getByText(/Ada Lovelace/)).toBeInTheDocument();
    expect(screen.getByText(/ada@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/High floor please/)).toBeInTheDocument();
    expect(screen.getByText(/1 Road, Singapore/)).toBeInTheDocument();
  });
});
