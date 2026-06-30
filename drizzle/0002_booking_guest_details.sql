-- Persist guest contact details and billing address on each booking, so guest/
-- anonymous bookings (user_id null) still carry who to contact and where to bill.
-- New NOT NULL guest columns are added with a backfill default for existing rows,
-- then the default is dropped so future inserts must supply real values.

alter table bookings
  add column guest_salutation text,
  add column guest_first_name text not null default '',
  add column guest_last_name text not null default '',
  add column guest_email text not null default '',
  add column guest_phone text not null default '',
  add column billing_line1 text,
  add column billing_city text,
  add column billing_postal_code text,
  add column billing_country text;

alter table bookings
  alter column guest_first_name drop default,
  alter column guest_last_name drop default,
  alter column guest_email drop default,
  alter column guest_phone drop default;
