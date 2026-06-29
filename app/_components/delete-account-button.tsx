"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteAccountButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Permanently delete your account and personal data? This cannot be undone.")) {
      return;
    }
    setBusy(true);
    const res = await fetch("/api/account", { method: "DELETE" });
    if (res.ok) {
      router.push("/");
      return;
    }
    setBusy(false);
    window.alert("Could not delete account. Please try again.");
  }

  return (
    <Button type="button" variant="destructive" onClick={handleDelete} disabled={busy}>
      Delete account
    </Button>
  );
}
