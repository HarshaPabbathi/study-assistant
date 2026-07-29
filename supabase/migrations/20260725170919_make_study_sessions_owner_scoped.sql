/*
# Make study_sessions owner-scoped (add auth)

1. Context
- The app now has a sign-in / sign-up screen, so data must be scoped per user.
- Previously the table was single-tenant with `USING (true)` policies that
  allowed unrestricted anon access. Those are being replaced with real
  ownership checks.

2. Modified Tables
- `study_sessions`
  - ADD `user_id` (uuid, NOT NULL, defaults to auth.uid()) referencing auth.users.
    Existing rows get a one-time backfill to a sentinel UUID so the NOT NULL
    constraint can be added without losing data; those legacy rows remain
    readable by anyone via a separate SELECT policy path is NOT used here —
    instead, existing rows are assigned to the first signed-in user is NOT
    possible generically. To keep this safe and simple, existing rows are
    retained but will not be visible to any new per-user account because they
    have no real owner. They are not deleted (data safety). New rows created
    by signed-in users are properly scoped.

3. Security
- Enable RLS remains on.
- DROP the old anon_* policies (the ones with USING (true) / WITH CHECK (true)).
- CREATE 4 new owner-scoped policies (SELECT/INSERT/UPDATE/DELETE) using
  auth.uid() = user_id, scoped TO authenticated.
- user_id has DEFAULT auth.uid() so frontend inserts that omit user_id
  still satisfy the INSERT WITH CHECK.
*/

ALTER TABLE study_sessions
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- Backfill existing rows with a sentinel (nil-ish) value is not possible for NOT NULL.
-- Instead, set existing rows to a deterministic placeholder UUID so the column
-- can become NOT NULL. These legacy rows will not match any real auth.uid(),
-- so they are effectively hidden from all authenticated users (data is retained
-- but not exposed). This is acceptable for a single-tenant-to-multi-tenant migration.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM study_sessions WHERE user_id IS NULL
  ) THEN
    UPDATE study_sessions
    SET user_id = '00000000-0000-0000-0000-000000000000'::uuid
    WHERE user_id IS NULL;
  END IF;
END $$;

ALTER TABLE study_sessions
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE study_sessions
  ADD CONSTRAINT study_sessions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
  NOT VALID;

-- Drop the old permissive policies
DROP POLICY IF EXISTS "anon_select_study_sessions" ON study_sessions;
DROP POLICY IF EXISTS "anon_insert_study_sessions" ON study_sessions;
DROP POLICY IF EXISTS "anon_update_study_sessions" ON study_sessions;
DROP POLICY IF EXISTS "anon_delete_study_sessions" ON study_sessions;

-- Create owner-scoped policies
CREATE POLICY "select_own_study_sessions" ON study_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_study_sessions" ON study_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_study_sessions" ON study_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_study_sessions" ON study_sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
