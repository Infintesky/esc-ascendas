"use client";

import { useEffect, useState } from "react";
import { SiteShell } from "@/app/_components/site-shell";
import { PointsChart, type PointsHistoryItem } from "@/app/_components/points-chart";
import { DeleteAccountButton } from "@/app/_components/delete-account-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [history, setHistory] = useState<PointsHistoryItem[]>([]);
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
