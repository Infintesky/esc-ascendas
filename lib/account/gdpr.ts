import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { bookings, pointsLedger, users } from "@/lib/db/schema";
import { createClient } from "@supabase/supabase-js";

type Ops = {
  nullBookings?: (userId: string) => Promise<unknown>;
  deleteLedger?: (userId: string) => Promise<unknown>;
  deleteUser?: (userId: string) => Promise<unknown>;
  deleteAuthUser?: (userId: string) => Promise<unknown>;
};

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function deleteUserData(
  userId: string,
  ops: Ops = {},
): Promise<{ deletedUser: boolean }> {
  const nullBookings =
    ops.nullBookings ??
    ((id: string) => db.update(bookings).set({ userId: null }).where(eq(bookings.userId, id)));
  const deleteLedger =
    ops.deleteLedger ?? ((id: string) => db.delete(pointsLedger).where(eq(pointsLedger.userId, id)));
  const deleteUser =
    ops.deleteUser ?? ((id: string) => db.delete(users).where(eq(users.id, id)));
  const deleteAuthUser =
    ops.deleteAuthUser ?? ((id: string) => adminClient().auth.admin.deleteUser(id));

  // Order matters: de-identify bookings, then ledger, then user, then auth user.
  await nullBookings(userId);
  await deleteLedger(userId);
  await deleteUser(userId);
  await deleteAuthUser(userId);

  return { deletedUser: true };
}
