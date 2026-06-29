"use client";

import { useEffect, useState } from "react";
import { SiteShell } from "@/app/_components/site-shell";
import { PointsChart, type PointsHistoryItem } from "@/app/_components/points-chart";
import { DeleteAccountButton } from "@/app/_components/delete-account-button";

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

      <div className="rounded-xl bg-card/80 p-5 ring-1 ring-foreground/10 backdrop-blur">
        <h2 className="mb-3 font-medium text-foreground">Points history</h2>
        <PointsChart history={history} />
      </div>

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
