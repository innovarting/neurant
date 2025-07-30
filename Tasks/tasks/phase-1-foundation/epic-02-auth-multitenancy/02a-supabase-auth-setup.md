# TASK-P1E2-02A: Supabase Authentication Setup

## Identificación
- **ID:** TASK-P1E2-02A
- **Título:** Supabase Authentication Setup
- **Type:** Database
- **Phase:** 1 - Foundation
- **Epic:** Auth & Multi-tenancy
- **Sprint:** Sprint 1.2 (Semanas 3-4, Febrero 2025)
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 4 horas
- **Prioridad:** Crítica - Bloquea todo el sistema de auth

## Definición Técnica
Configurar sistema de autenticación completo en Supabase con roles personalizados, email verification, password reset, y estructura de base de datos para multi-tenancy con companies y users.

## Referencias de Documentación NeurAnt
- **Auth System:** `docs/architecture/04-tech-stack.md:124-133` (Supabase Auth)
- **Multi-tenant Strategy:** `docs/architecture/03-database-design.md:3-11` (Shared DB + RLS)
- **RBAC Model:** `docs/architecture/10-modelo-datos-rbac-extendido.md:32-89` (Jerarquía de roles)
- **Sprint Context:** `docs/architecture/05-implementation-roadmap.md:91-149` (Sprint 1.2 Auth System)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E1-01B ✅ (Supabase PostgreSQL configurado)
- **Bloquea:**
  - [ ] TASK-P1E2-02B (Auth API Endpoints)
  - [ ] TASK-P1E2-02C (Login/Signup Pages)
  - [ ] TASK-P1E2-02E (Auth Context Provider)
  - [ ] Todo el sistema de autenticación y autorización

## Criterios de Aceptación Específicos
### Supabase Auth Configuration
- [ ] Email/password authentication habilitado
- [ ] Email confirmation configurado
- [ ] Password reset functionality activado
- [ ] Custom email templates configurados
- [ ] Rate limiting configurado para auth endpoints

### Database Schema para Auth
- [ ] `auth.users` tabla native de Supabase funcionando
- [ ] `companies` tabla creada con RLS
- [ ] `user_profiles` tabla creada vinculada a auth.users
- [ ] Roles enum creado: owner, admin, supervisor, operador
- [ ] User invitations tabla para onboarding

### Row Level Security (RLS)
- [ ] RLS habilitado en todas las tablas multi-tenant
- [ ] Policies creadas para aislamiento por company_id
- [ ] Functions helper para role-based authorization
- [ ] Testing de isolation entre companies

## Archivos a Crear/Modificar
```
supabase/migrations/002_auth_setup.sql
supabase/migrations/003_companies_users.sql
supabase/migrations/004_rbac_policies.sql
lib/supabase/auth-helpers.ts
types/auth.ts
__tests__/auth/auth-setup.test.sql
```

## Migration Scripts

### Migration 002: Auth Configuration
```sql
-- supabase/migrations/002_auth_setup.sql
BEGIN;

-- Enable necessary extensions for auth
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom role enum for RBAC
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'supervisor', 'operador');

-- Companies table (tenant isolation)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT companies_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  CONSTRAINT companies_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT companies_email_format CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$')
);

-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role NOT NULL DEFAULT 'operador',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT user_profiles_email_format CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$'),
  CONSTRAINT user_profiles_name_length CHECK (
    (first_name IS NULL OR char_length(first_name) >= 1) AND
    (last_name IS NULL OR char_length(last_name) >= 1)
  )
);

-- User invitations for onboarding
CREATE TABLE IF NOT EXISTS public.user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'operador',
  invitation_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64'),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT user_invitations_email_format CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$'),
  CONSTRAINT user_invitations_token_length CHECK (char_length(invitation_token) >= 16)
);

COMMIT;
```

### Migration 003: RLS Policies
```sql
-- supabase/migrations/003_rbac_policies.sql
BEGIN;

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's company_id
CREATE OR REPLACE FUNCTION public.get_current_user_company_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  company_uuid UUID;
BEGIN
  SELECT company_id INTO company_uuid
  FROM public.user_profiles
  WHERE id = auth.uid();
  
  RETURN company_uuid;
END;
$$;

-- Helper function to check if user has role
CREATE OR REPLACE FUNCTION public.user_has_role(required_role user_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role_val user_role;
BEGIN
  SELECT role INTO user_role_val
  FROM public.user_profiles
  WHERE id = auth.uid();
  
  -- Role hierarchy: owner > admin > supervisor > operador
  CASE required_role
    WHEN 'operador' THEN
      RETURN user_role_val IN ('owner', 'admin', 'supervisor', 'operador');
    WHEN 'supervisor' THEN
      RETURN user_role_val IN ('owner', 'admin', 'supervisor');
    WHEN 'admin' THEN
      RETURN user_role_val IN ('owner', 'admin');
    WHEN 'owner' THEN
      RETURN user_role_val = 'owner';
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$;

-- Companies policies (owners and admins can manage)
CREATE POLICY "Users can view own company"
ON public.companies FOR SELECT
USING (id = get_current_user_company_id());

CREATE POLICY "Owners and admins can update company"
ON public.companies FOR UPDATE
USING (
  id = get_current_user_company_id() AND
  user_has_role('admin')
);

-- User profiles policies
CREATE POLICY "Users can view profiles in own company"
ON public.user_profiles FOR SELECT
USING (company_id = get_current_user_company_id());

CREATE POLICY "Users can view own profile"
ON public.user_profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Admins can manage user profiles in company"
ON public.user_profiles FOR ALL
USING (
  company_id = get_current_user_company_id() AND
  user_has_role('admin')
);

-- User invitations policies
CREATE POLICY "Users can view invitations for own company"
ON public.user_invitations FOR SELECT
USING (company_id = get_current_user_company_id());

CREATE POLICY "Admins can manage invitations"
ON public.user_invitations FOR ALL
USING (
  company_id = get_current_user_company_id() AND
  user_has_role('admin')
);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_company_id ON public.user_profiles(company_id);
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_invitations_company_id ON public.user_invitations(company_id);
CREATE INDEX idx_user_invitations_email ON public.user_invitations(email);
CREATE INDEX idx_user_invitations_token ON public.user_invitations(invitation_token);
CREATE INDEX idx_companies_slug ON public.companies(slug);

COMMIT;
```

### Migration 004: Auth Triggers
```sql
-- supabase/migrations/004_auth_triggers.sql
BEGIN;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  company_uuid UUID;
  is_first_user BOOLEAN;
  user_role_val user_role;
BEGIN
  -- Check if this is from an invitation
  SELECT company_id, role INTO company_uuid, user_role_val
  FROM public.user_invitations
  WHERE email = NEW.email
    AND accepted_at IS NULL
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  -- If from invitation, use that company and role
  IF company_uuid IS NOT NULL THEN
    -- Mark invitation as accepted
    UPDATE public.user_invitations
    SET accepted_at = NOW()
    WHERE email = NEW.email AND company_id = company_uuid;
  ELSE
    -- Create new company for first user (owner)
    INSERT INTO public.companies (name, slug)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'company_name', 'New Company'),
      LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'company_name', 'company-' || SUBSTRING(NEW.id::TEXT, 1, 8)), ' ', '-'))
    )
    RETURNING id INTO company_uuid;
    
    user_role_val := 'owner';
  END IF;

  -- Create user profile
  INSERT INTO public.user_profiles (
    id,
    company_id,
    email,
    first_name,
    last_name,
    role
  )
  VALUES (
    NEW.id,
    company_uuid,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    user_role_val
  );

  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER handle_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMIT;
```

## Auth Helper Functions
```typescript
// lib/supabase/auth-helpers.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export type UserRole = 'owner' | 'admin' | 'supervisor' | 'operador'

export interface UserProfile {
  id: string
  company_id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  last_login_at: string | null
}

export interface Company {
  id: string
  name: string
  slug: string
  email: string | null
  logo_url: string | null
  is_active: boolean
}

// Get current user with profile and company
export async function getCurrentUser() {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return null

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('id', user.id)
    .single()

  if (profileError || !profile) return null

  return {
    user,
    profile,
    company: profile.company
  }
}

// Check if user has required role
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    'owner': 4,
    'admin': 3,
    'supervisor': 2,
    'operador': 1
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// Check if user can access company
export async function canAccessCompany(companyId: string): Promise<boolean> {
  const currentUser = await getCurrentUser()
  return currentUser?.profile.company_id === companyId
}

// Create invitation
export async function createInvitation(
  email: string,
  role: UserRole,
  companyId: string
) {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  const { data, error } = await supabase
    .from('user_invitations')
    .insert({
      email,
      role,
      company_id: companyId,
      invited_by: (await getCurrentUser())?.user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Accept invitation
export async function acceptInvitation(token: string) {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  const { data: invitation, error } = await supabase
    .from('user_invitations')
    .select('*')
    .eq('invitation_token', token)
    .eq('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !invitation) {
    throw new Error('Invalid or expired invitation')
  }

  return invitation
}
```

## TypeScript Types
```typescript
// types/auth.ts
import type { User } from '@supabase/supabase-js'

export type UserRole = 'owner' | 'admin' | 'supervisor' | 'operador'

export interface UserProfile {
  id: string
  company_id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  slug: string
  email: string | null
  logo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserInvitation {
  id: string
  company_id: string
  invited_by: string
  email: string
  role: UserRole
  invitation_token: string
  accepted_at: string | null
  expires_at: string
  created_at: string
}

export interface AuthUser {
  user: User
  profile: UserProfile
  company: Company
}

export interface SignUpData {
  email: string
  password: string
  first_name: string
  last_name: string
  company_name?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface InvitationData {
  email: string
  role: UserRole
  message?: string
}
```

## Validation Queries
```sql
-- __tests__/auth/auth-setup.test.sql
-- Test 1: Verify tables exist
SELECT 
  tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('companies', 'user_profiles', 'user_invitations');

-- Test 2: Verify RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename IN ('companies', 'user_profiles', 'user_invitations')
  AND rowsecurity = true;

-- Test 3: Verify policies exist
SELECT 
  policyname, 
  tablename 
FROM pg_policies 
WHERE tablename IN ('companies', 'user_profiles', 'user_invitations');

-- Test 4: Verify functions exist
SELECT 
  routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_current_user_company_id', 'user_has_role', 'handle_new_user');

-- Test 5: Verify triggers exist
SELECT 
  trigger_name, 
  event_object_table 
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'handle_companies_updated_at');

-- Test 6: Test company isolation
-- (This would be run in a test environment with test users)
-- SET role authenticated;
-- SET request.jwt.claims TO '{"sub": "user1-uuid", "email": "user1@company1.com"}';
-- SELECT * FROM companies; -- Should only return company1 data
```

## Email Templates Configuration
```html
<!-- Email verification template -->
<h2>Verify your email address</h2>
<p>Click the link below to verify your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Email</a></p>

<!-- Password reset template -->
<h2>Reset your password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>

<!-- Invitation email template -->
<h2>You've been invited to join {{ .CompanyName }}</h2>
<p>Click the link below to accept the invitation:</p>
<p><a href="{{ .InvitationURL }}">Accept Invitation</a></p>
```

## Performance y Security Optimizations
```sql
-- Additional security configurations
-- Limit sign-ups if needed
-- ALTER DATABASE postgres SET app.jwt_secret TO 'your-jwt-secret';

-- Rate limiting configuration (set in Supabase dashboard)
-- Auth rate limit: 30 requests per hour per IP
-- Password reset rate limit: 6 requests per hour per IP

-- Database performance settings
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET pg_stat_statements.track = all;

-- Connection pooling settings (configure in Supabase)
-- Max connections: 100
-- Pool size: 15
-- Pool timeout: 10s
```

## Testing RLS Isolation
```sql
-- Test multi-tenant isolation
BEGIN;

-- Create test companies
INSERT INTO public.companies (id, name, slug) VALUES 
  ('company1-uuid', 'Company 1', 'company-1'),
  ('company2-uuid', 'Company 2', 'company-2');

-- Create test users (simulate auth.users inserts)
-- This would trigger the handle_new_user function

-- Test that user1 can only see company1 data
SET LOCAL role authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "user1-uuid"}';

-- Should return only Company 1
SELECT name FROM public.companies;

-- Switch to user2
SET LOCAL request.jwt.claims TO '{"sub": "user2-uuid"}';

-- Should return only Company 2
SELECT name FROM public.companies;

ROLLBACK;
```

## Métricas de Éxito
- **Security:** RLS isolation working 100% - no data leaks
- **Performance:** Auth queries < 50ms p95
- **Reliability:** User signup success rate > 99%
- **Scalability:** Support for 1000+ companies without performance degradation

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md al completar:
- Auth System: ✅ Supabase configured with custom schema
- Multi-tenancy: ✅ RLS policies enforcing company isolation
- RBAC: ✅ 4-tier role hierarchy (owner → admin → supervisor → operador)
- Database: ✅ Companies, user_profiles, invitations tables created
- Security: ✅ Row Level Security tested and working
- Siguiente tarea: TASK-P1E2-02B (Auth API Endpoints)
- Auth ready for: API endpoints, frontend integration, user flows
```

## Troubleshooting Auth
### Common Issues
- **RLS Policy Errors:** Check JWT claims and role hierarchy
- **Signup Failures:** Verify email templates and confirmation settings
- **Permission Denied:** Ensure user has proper role for operation
- **Company Isolation Breaks:** Check RLS policies and helper functions

### Debugging Commands
```bash
# Check Supabase auth config
supabase projects api-keys --project-ref your-project-ref

# Test database connections
supabase db reset --linked
supabase start

# Check RLS policies
psql -h localhost -p 54322 -U postgres -d postgres
\dp public.*

# Test auth functions
SELECT public.get_current_user_company_id();
SELECT public.user_has_role('admin');
```

---
*Esta tarea establece la base de autenticación y multi-tenancy para todo el proyecto NeurAnt. Es crítica para seguridad, aislamiento de datos y RBAC.*