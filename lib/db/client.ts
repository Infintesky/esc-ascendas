import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = PostgresJsDatabase<typeof schema>;

let cached: Db | null = null;

// Lazily construct the client so that merely importing `db` never requires
// DATABASE_URL — only an actual query does. This keeps services that take an
// injectable `insert`/`select` unit-testable without a live database.
function getDb(): Db {
  if (cached) return cached;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const queryClient = postgres(connectionString, { prepare: false });
  cached = drizzle(queryClient, { schema });
  return cached;
}

export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(real) : value;
  },
});
