-- ============================================
-- SUPABASE CLOUD - SCHEMA INICIAL
-- ============================================
-- Ejecutar DESPUÉS de 01-enable-extensions.sql
-- Este script crea la estructura básica de tablas y RLS policies
-- ============================================

-- Habilitar Row Level Security globalmente
ALTER DATABASE postgres SET row_security = on;

-- ============================================
-- TABLA: user_profiles
-- ============================================
-- Extiende la tabla auth.users con información adicional
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'agent', 'user')),
    company_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON public.user_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- ============================================
-- TABLA: companies
-- ============================================
-- Multi-tenancy: Empresas que usan el sistema
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    domain TEXT,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para companies
CREATE INDEX IF NOT EXISTS idx_companies_slug ON public.companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_domain ON public.companies(domain);

-- ============================================
-- TABLA: chatbots (básica para testing)
-- ============================================
-- Tabla básica de chatbots para pruebas de conexión
CREATE TABLE IF NOT EXISTS public.chatbots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    system_prompt TEXT,
    model TEXT DEFAULT 'gpt-3.5-turbo',
    temperature DECIMAL DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 1000,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para chatbots
CREATE INDEX IF NOT EXISTS idx_chatbots_company_id ON public.chatbots(company_id);
CREATE INDEX IF NOT EXISTS idx_chatbots_created_by ON public.chatbots(created_by);
CREATE INDEX IF NOT EXISTS idx_chatbots_is_active ON public.chatbots(is_active);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;

-- Policies para user_profiles
CREATE POLICY "Users can view own profile" 
    ON public.user_profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.user_profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles"
    ON public.user_profiles FOR ALL
    USING (auth.role() = 'service_role');

-- Policies para companies (básicas)
CREATE POLICY "Users can view own company" 
    ON public.companies FOR SELECT 
    USING (
        id IN (
            SELECT company_id 
            FROM public.user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage all companies"
    ON public.companies FOR ALL
    USING (auth.role() = 'service_role');

-- Policies para chatbots (básicas)
CREATE POLICY "Users can view company chatbots" 
    ON public.chatbots FOR SELECT 
    USING (
        company_id IN (
            SELECT company_id 
            FROM public.user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage company chatbots" 
    ON public.chatbots FOR ALL 
    USING (
        company_id IN (
            SELECT company_id 
            FROM public.user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage all chatbots"
    ON public.chatbots FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- FUNCTIONS Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER set_updated_at_user_profiles
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_companies
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_chatbots
    BEFORE UPDATE ON public.chatbots
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- DATOS DE PRUEBA (solo para development)
-- ============================================
-- Descomentar la siguiente sección SOLO en el proyecto DEV

/*
-- Insertar empresa de prueba
INSERT INTO public.companies (id, name, slug, domain) 
VALUES (
    uuid_generate_v4(),
    'NeurAnt Demo Company',
    'neurant-demo',
    'demo.neurant.com'
) ON CONFLICT (slug) DO NOTHING;
*/

-- ============================================
-- VERIFICACIÓN DEL SETUP
-- ============================================

-- Verificar tablas creadas
SELECT 
    schemaname,
    tablename,
    'Creada' as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('user_profiles', 'companies', 'chatbots')
ORDER BY tablename;

-- Verificar RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('user_profiles', 'companies', 'chatbots')
ORDER BY tablename;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Schema inicial creado correctamente';
    RAISE NOTICE '🔐 RLS habilitado en todas las tablas';
    RAISE NOTICE '📊 Tablas: user_profiles, companies, chatbots';
    RAISE NOTICE '🎯 Listo para tests de conexión';
END $$;