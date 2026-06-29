-- Enable Row-Level Security so each user can read only their own data.
alter table users enable row level security;
alter table bookings enable row level security;
alter table points_ledger enable row level security;

-- Users can read/update only their own profile row.
create policy "users_select_own" on users
  for select using (auth.uid() = id);
create policy "users_update_own" on users
  for update using (auth.uid() = id);

-- Bookings: a user reads only their own; de-identified bookings (user_id null) are not readable by clients.
create policy "bookings_select_own" on bookings
  for select using (auth.uid() = user_id);

-- Points ledger: read-only to the owning user; writes happen server-side via the service role.
create policy "points_select_own" on points_ledger
  for select using (auth.uid() = user_id);
