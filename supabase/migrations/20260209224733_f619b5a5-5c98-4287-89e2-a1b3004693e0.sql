
-- Make photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'photos';

-- Drop overly permissive storage policies
DROP POLICY IF EXISTS "Users can view couple photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;

-- Restrictive SELECT: only user's own uploads or partner's uploads
CREATE POLICY "Users can view couple photos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'photos' AND
  auth.uid() IS NOT NULL AND
  (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    (storage.foldername(name))[1] = (SELECT get_partner_id(auth.uid()))::text
  )
);

-- Upload: only to own folder
CREATE POLICY "Users can upload photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'photos' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Delete: only own uploads or partner's uploads (couple-scoped)
CREATE POLICY "Users can delete couple photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'photos' AND
  auth.uid() IS NOT NULL AND
  (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    (storage.foldername(name))[1] = (SELECT get_partner_id(auth.uid()))::text
  )
);
