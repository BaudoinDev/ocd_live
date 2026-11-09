-- The studio hosts one live at a time: two occupied sessions can never overlap, even under concurrent requests.
-- Drizzle's schema builder cannot express EXCLUDE constraints, hence this hand-written migration.
CREATE EXTENSION IF NOT EXISTS btree_gist;--> statement-breakpoint
ALTER TABLE "booking_sessions"
  ADD CONSTRAINT "booking_sessions_no_overlap"
  EXCLUDE USING gist ("date" WITH =, int4range("start_hour", "start_hour" + "duration_hours") WITH &&)
  WHERE ("occupies_slot");
