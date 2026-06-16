
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- storage policies for medical-records bucket (per-user folders)
CREATE POLICY "user upload own medical records"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'medical-records' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "user read own medical records"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'medical-records' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "user delete own medical records"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'medical-records' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "user update own medical records"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'medical-records' AND (storage.foldername(name))[1] = auth.uid()::text);
