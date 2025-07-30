-- ============================================
-- SUPABASE CLOUD - HABILITAR EXTENSIONES
-- ============================================
-- Ejecutar este script en el SQL Editor de ambos proyectos:
-- 1. Proyecto DEV: https://wydcmmsxdhentmoxthnu.supabase.co
-- 2. Proyecto PROD: https://ewyyekypuzgurwgnouxp.supabase.co
--
-- Instrucciones:
-- 1. Ir a SQL Editor en el dashboard de Supabase
-- 2. Copiar y pegar este script completo
-- 3. Ejecutar (RUN)
-- 4. Verificar que no hay errores
-- ============================================

-- Habilitar extensión UUID para identificadores únicos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar extensión pgvector para funcionalidades RAG/AI
CREATE EXTENSION IF NOT EXISTS "vector";

-- Habilitar extensión btree_gin para indexación avanzada
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Verificar que las extensiones se instalaron correctamente
SELECT 
    extname as "Extension",
    extversion as "Version",
    'Instalada correctamente' as "Status"
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'vector', 'btree_gin')
ORDER BY extname;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Extensiones habilitadas correctamente para NeurAnt';
    RAISE NOTICE '📊 pgvector: Listo para funcionalidades RAG';
    RAISE NOTICE '🔑 uuid-ossp: Listo para IDs únicos';
    RAISE NOTICE '📈 btree_gin: Listo para indexación avanzada';
END $$;