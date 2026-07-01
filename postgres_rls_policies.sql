-- postgres_rls_policies.sql
-- Run this SQL in your Supabase SQL Editor to enforce Role-Based Access Control (RBAC) at the database level.

----------------------------------------------------
-- 1. Enforce RLS on Table: transfer_certificates
----------------------------------------------------
ALTER TABLE transfer_certificates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplication
DROP POLICY IF EXISTS "Allow public read access" ON transfer_certificates;
DROP POLICY IF EXISTS "Allow write access for admin and tc_operator" ON transfer_certificates;

-- Allow anyone (public) to view/search certificates
CREATE POLICY "Allow public read access" ON transfer_certificates
  FOR SELECT USING (true);

-- Allow both super_admin and tc_operator to insert, update, and delete certificates
CREATE POLICY "Allow write access for admin and tc_operator" ON transfer_certificates
  FOR ALL TO authenticated
  USING (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'super_admin') IN ('super_admin', 'tc_operator')
  )
  WITH CHECK (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'super_admin') IN ('super_admin', 'tc_operator')
  );


----------------------------------------------------
-- 2. Enforce RLS on other administrative tables (super_admin only)
----------------------------------------------------

-- PAGES TABLE
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read pages" ON pages;
DROP POLICY IF EXISTS "Allow write pages only for super_admin" ON pages;

CREATE POLICY "Allow public read pages" ON pages FOR SELECT USING (true);
CREATE POLICY "Allow write pages only for super_admin" ON pages
  FOR ALL TO authenticated
  USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'super_admin') = 'super_admin')
  WITH CHECK (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'super_admin') = 'super_admin');

-- BLOCKS TABLE
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read blocks" ON blocks;
DROP POLICY IF EXISTS "Allow write blocks only for super_admin" ON blocks;

CREATE POLICY "Allow public read blocks" ON blocks FOR SELECT USING (true);
CREATE POLICY "Allow write blocks only for super_admin" ON blocks
  FOR ALL TO authenticated
  USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'super_admin') = 'super_admin')
  WITH CHECK (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'super_admin') = 'super_admin');

-- SITE SETTINGS TABLE
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read settings" ON site_settings;
DROP POLICY IF EXISTS "Allow write settings only for super_admin" ON site_settings;

CREATE POLICY "Allow public read settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Allow write settings only for super_admin" ON site_settings
  FOR ALL TO authenticated
  USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'super_admin') = 'super_admin')
  WITH CHECK (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'super_admin') = 'super_admin');

-- HOMEPAGE SECTIONS TABLE
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read sections" ON homepage_sections;
DROP POLICY IF EXISTS "Allow write sections only for super_admin" ON homepage_sections;

CREATE POLICY "Allow public read sections" ON homepage_sections FOR SELECT USING (true);
CREATE POLICY "Allow write sections only for super_admin" ON homepage_sections
  FOR ALL TO authenticated
  USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'super_admin') = 'super_admin')
  WITH CHECK (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'super_admin') = 'super_admin');

-- CONTACT SUBMISSIONS TABLE
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow write contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Allow read/delete contact submissions only for super_admin" ON contact_submissions;

CREATE POLICY "Allow write contact submissions" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read/delete contact submissions only for super_admin" ON contact_submissions
  FOR ALL TO authenticated
  USING (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'super_admin') = 'super_admin');


----------------------------------------------------
-- 3. Enforce Storage Policies for "media" bucket
----------------------------------------------------
-- Enable Storage policies
-- Storage policies reside in storage.objects table

DROP POLICY IF EXISTS "Allow public read storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow write access for media storage" ON storage.objects;

-- Allow public read of all media
CREATE POLICY "Allow public read storage"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'media');

-- Enforce folder restrictions on write (insert, update, delete)
CREATE POLICY "Allow write access for media storage"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'media' AND (
    -- Admins have full access
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'super_admin') = 'super_admin'
    OR
    -- TC Operators can ONLY read/write inside the 'certificate' folder
    (
      coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'super_admin') = 'tc_operator' 
      AND (storage.foldername(name))[1] = 'certificate'
    )
  )
)
WITH CHECK (
  bucket_id = 'media' AND (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'super_admin') = 'super_admin'
    OR
    (
      coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'super_admin') = 'tc_operator' 
      AND (storage.foldername(name))[1] = 'certificate'
    )
  )
);
