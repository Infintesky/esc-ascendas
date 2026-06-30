"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SiteShell } from "@/app/_components/site-shell";
import { PointsChart, type PointsHistoryItem } from "@/app/_components/points-chart";
import { DeleteAccountButton } from "@/app/_components/delete-account-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BookingItem = {
  reference: string;
  roomType: string;
  checkin: string;
  checkout: string;
  nights: number;
  price: string;
  currency: string;
  status: string;
  cardLast4: string | null;
  cardBrand: string | null;
};

export default function AccountPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [history, setHistory] = useState<PointsHistoryItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[] | null>(null);
  const [unauth, setUnauth] = useState(false);

  useEffect(() => {
    fetch("/api/account/points").then(async (res) => {
      if (res.status === 401) {
        setUnauth(true);
        return;
      }
      const data = await res.json();
      setBalance(data.balance);
      setHistory(data.history);
    });
    fetch("/api/account/bookings").then(async (res) => {
      if (!res.ok) return;
      const data = await res.json();
      setBookings(data.bookings);
    });
  }, []);

  if (unauth) {
    return (
      <SiteShell width="sm">
        <p className="text-muted-foreground">Please sign in to view your account.</p>
      </SiteShell>
    );
  }

  return (
    <SiteShell width="md">
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">Your account</h1>
      <p className="mb-8 text-lg text-muted-foreground">
        Points balance:{" "}
        <strong className="text-primary">{balance ?? "…"}</strong>
      </p>

      <Card className="bg-card/80 backdrop-blur [--card-spacing:--spacing(5)]">
        <CardHeader>
          <CardTitle className="font-medium">Points history</CardTitle>
        </CardHeader>
        <CardContent>
          <PointsChart history={history} />
        </CardContent>
      </Card>

      <Card className="mt-8 bg-card/80 backdrop-blur [--card-spacing:--spacing(5)]">
        <CardHeader>
          <CardTitle className="font-medium">Your bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings === null ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {bookings.map((b) => (
                <li key={b.reference} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{b.roomType}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.checkin} → {b.checkout} · {b.nights} nights
                    </p>
                    <Link
                      href={`/book/confirmation/${b.reference}`}
                      className="text-xs text-primary hover:underline"
                    >
                      {b.reference}
                    </Link>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="font-medium text-foreground">
                      {b.currency} {b.price}
                    </span>
                    <Badge
                      variant="secondary"
                      className="h-auto py-0.5 text-xs capitalize text-emerald-700 dark:text-emerald-400"
                    >
                      {b.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 border-t border-border/50 pt-5">
        <p className="mb-2 text-sm font-medium text-foreground">Danger zone</p>
        <p className="mb-3 text-sm text-muted-foreground">
          Deleting your account removes your personal data and points. Past bookings are kept for
          audit but no longer linked to you.
        </p>
        <DeleteAccountButton />
      </div>
    </SiteShell>
  );
}
