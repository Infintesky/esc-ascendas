import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("RLS migration", () => {
  const sql = readFileSync(join(process.cwd(), "drizzle/0001_rls_policies.sql"), "utf-8");

  it("enables RLS on the three tables", () => {
    expect(sql).toMatch(/alter table "?users"? enable row level security/i);
    expect(sql).toMatch(/alter table "?bookings"? enable row level security/i);
    expect(sql).toMatch(/alter table "?points_ledger"? enable row level security/i);
  });

  it("scopes reads to the authenticated user via auth.uid()", () => {
    expect(sql).toMatch(/auth\.uid\(\)/);
  });
});
