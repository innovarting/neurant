-- ============================================
-- SUPABASE CLOUD - STORAGE CONFIGURATION
-- ============================================
-- Ejecutar DESPUÉS de 02-initial-schema.sql
-- Este script configura Storage buckets y políticas
-- ============================================

-- ============================================
-- STORAGE BUCKET: documents
-- ============================================
-- Bucket para documentos de chatbots (PDFs, DOCs, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false, -- privado
    52428800, -- 50MB
    ARRAY[
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'text/markdown'
    ]
) ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- STORAGE BUCKET: avatars
-- ============================================
-- Bucket para avatars de usuarios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true, -- público
    2097152, -- 2MB
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif'
    ]
) ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- STORAGE BUCKET: company-assets
-- ============================================
-- Bucket para logos y assets de empresas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'company-assets',
    'company-assets',
    true, -- público
    5242880, -- 5MB
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml'
    ]
) ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Policies para bucket 'documents'
CREATE POLICY "Authenticated users can upload documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'documents' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can view own company documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own company documents"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own company documents"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policies para bucket 'avatars'
CREATE POLICY "Anyone can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policies para bucket 'company-assets'
CREATE POLICY "Anyone can view company assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'company-assets');

CREATE POLICY "Company users can upload assets"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'company-assets' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Company users can update assets"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'company-assets' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Company users can delete assets"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'company-assets' 
        AND auth.role() = 'authenticated'
    );

-- ============================================
-- VERIFICACIÓN DEL STORAGE SETUP
-- ============================================

-- Verificar buckets creados
SELECT 
    id as "Bucket ID",
    name as "Bucket Name",
    public as "Is Public",
    file_size_limit as "Size Limit (bytes)",
    array_length(allowed_mime_types, 1) as "Allowed Types Count"
FROM storage.buckets 
WHERE id IN ('documents', 'avatars', 'company-assets')
ORDER BY id;

-- Contar policies de storage
SELECT 
    COUNT(*) as "Storage Policies Created"
FROM pg_policies 
WHERE schemaname = 'storage';

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Storage configurado correctamente';
    RAISE NOTICE '📁 Buckets: documents, avatars, company-assets';
    RAISE NOTICE '🔐 Políticas de acceso configuradas';
    RAISE NOTICE '📦 Listo para subir archivos';
END $$;