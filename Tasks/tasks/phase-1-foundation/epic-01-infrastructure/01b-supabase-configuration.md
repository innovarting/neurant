# TASK-P1E1-01B: Configuración de Supabase PostgreSQL

## Identificación
- **ID:** TASK-P1E1-01B
- **Título:** Configuración de Supabase PostgreSQL
- **Type:** Infrastructure
- **Phase:** 1 - Foundation
- **Epic:** Infrastructure Setup
- **Sprint:** Sprint 1.1 (Semanas 1-2, Enero 2025)
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 6 horas
- **Prioridad:** Crítica - Bloquea base de datos y auth

## Definición Técnica
Configurar proyecto Supabase con PostgreSQL 15+, habilitar extensiones necesarias (pgvector), configurar cliente JavaScript, establecer estructura inicial de base de datos y configurar autenticación básica.

## Referencias de Documentación NeurAnt
- **Database Provider:** `docs/architecture/04-tech-stack.md:89-108` (Supabase PostgreSQL)
- **Database Client:** `docs/architecture/04-tech-stack.md:111-123` (Prisma + Supabase Client)
- **Authentication:** `docs/architecture/04-tech-stack.md:124-133` (Supabase Auth)
- **Database Schema:** `docs/architecture/13-diagrama-entidad-relacion.md:32-607` (ERD completo)
- **Multi-tenant Strategy:** `docs/architecture/03-database-design.md:3-11` (Shared DB + RLS)
- **Sprint Context:** `docs/architecture/05-implementation-roadmap.md:45-54` (Supabase Configuration)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E1-01A ✅ (Next.js project setup)
- **Bloquea:**
  - [ ] TASK-P1E1-01C (Vercel Deployment Setup)
  - [ ] TASK-P1E2-02A (Supabase Auth Setup)
  - [ ] TASK-P1E3-03A (Database Schema - Chatbots)
  - [ ] Todo el sistema de datos y autenticación

## Criterios de Aceptación Específicos
### Supabase Project Setup
- [ ] Proyecto Supabase creado en supabase.com
- [ ] Base de datos PostgreSQL 15+ inicializada
- [ ] URL del proyecto y API keys obtenidas
- [ ] Supabase CLI instalado y configurado localmente

### Extensions y Configuración DB
- [ ] Extensión pgvector habilitada para RAG
- [ ] Extensión uuid-ossp habilitada
- [ ] Extensión btree_gin habilitada
- [ ] Connection pooling configurado

### Cliente JavaScript Configurado
- [ ] @supabase/supabase-js client configurado
- [ ] Environment variables configuradas
- [ ] TypeScript types básicos generados
- [ ] Conexión de prueba exitosa

### Storage y Auth Básico
- [ ] Supabase Storage bucket 'documents' creado
- [ ] Supabase Auth habilitado
- [ ] Email templates básicos configurados
- [ ] RLS habilitado a nivel global

### Desarrollo Local
- [ ] Supabase local development configurado
- [ ] Docker containers iniciando correctamente
- [ ] Migrations system preparado

## Archivos a Crear/Modificar
```
/lib/supabase/client.ts
/lib/supabase/server.ts
/lib/supabase/middleware.ts
/types/database.ts
/supabase/config.toml
/supabase/schema.sql
/.env.local.example
/.env.local
```

## Comandos de Implementación
```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Configurar proyecto local
supabase init

# 3. Configurar cliente Supabase (ya instalado en tarea anterior)
# @supabase/supabase-js ya está en package.json

# 4. Iniciar desarrollo local
supabase start

# 5. Generar types
supabase gen types typescript --local > types/database.ts
```

## Configuraciones Específicas

### .env.local Template
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Local Development
NEXT_PUBLIC_SUPABASE_URL_LOCAL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY_LOCAL=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY_LOCAL=your_local_service_role_key
```

### Supabase Client Configuration
```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

export const supabase = createClientComponentClient<Database>()
```

### Server-side Client
```typescript
// lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export const createServerSupabaseClient = () => {
  return createServerComponentClient<Database>({
    cookies
  })
}
```

### Middleware Configuration
```typescript
// lib/supabase/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  const supabase = createMiddlewareClient<Database>({ req, res })
  
  // Refresh session if expired
  await supabase.auth.getSession()
  
  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}
```

### Initial Schema Setup
```sql
-- supabase/schema.sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Enable Row Level Security globally
ALTER DATABASE postgres SET row_security = on;

-- Create initial user management table (basic)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy for user_profiles
CREATE POLICY "Users can view own profile" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = id);
```

### Storage Configuration
```sql
-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
);

-- Storage policies (basic)
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Validación Técnica
### Connection Testing
```typescript
// Test básico de conexión
import { supabase } from '@/lib/supabase/client'

export async function testSupabaseConnection() {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    return false
  }
}
```

### Extensions Verification
```sql
-- Verificar extensiones instaladas
SELECT * FROM pg_extension WHERE extname IN ('vector', 'uuid-ossp', 'btree_gin');

-- Verificar configuración de vector
SELECT * FROM pg_type WHERE typname = 'vector';
```

### Auth Configuration Test
```typescript
// Test configuración de auth
export async function testAuth() {
  try {
    const { data, error } = await supabase.auth.getSession()
    
    if (error) throw error
    
    console.log('✅ Auth configuration successful')
    return true
  } catch (error) {
    console.error('❌ Auth configuration failed:', error)
    return false
  }
}
```

## Performance y Security
### Database Configuration
```sql
-- Configuraciones de performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements,vector';
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_buffers = '256MB';

-- Security settings
ALTER SYSTEM SET log_statement = 'mod';
ALTER SYSTEM SET log_min_duration_statement = 1000;
```

### Environment Security
```typescript
// Verificar que variables de entorno estén configuradas
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
]

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`)
  }
})
```

## Métricas de Éxito
- **Connection Time:** < 100ms para conexión inicial
- **Query Performance:** < 50ms para queries básicas
- **Uptime:** 99.9% disponibilidad de Supabase
- **Security:** RLS habilitado y funcionando

## Configuración Post-Implementación
### Development Workflow
```bash
# Comandos para desarrollo diario
supabase start          # Iniciar servicios locales
supabase stop           # Detener servicios
supabase reset          # Reset base de datos local
supabase db diff        # Ver diferencias
supabase gen types typescript --local  # Regenerar types
```

### Monitoring Setup
- [ ] Supabase Dashboard configurado
- [ ] Alertas de uso configuradas
- [ ] Logs de errores habilitados
- [ ] Métricas de performance monitoreadas

## Troubleshooting
### Common Issues
- **Connection Timeout:** Verificar firewall y VPN
- **Auth Errors:** Verificar API keys y configuración
- **RLS Policy Errors:** Verificar sintaxis de policies
- **Vector Extension:** Verificar que pgvector esté disponible

### Debugging Commands
```bash
# Verificar status de Supabase local
supabase status

# Ver logs
supabase logs api
supabase logs db
supabase logs auth

# Reset si hay problemas
supabase stop
supabase reset --db
supabase start
```

### Emergency Procedures
```bash
# Backup antes de cambios importantes
supabase db dump --data-only > backup.sql

# Restore en caso de problemas
supabase db reset
psql -h localhost -p 54322 -U postgres -d postgres < backup.sql
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md al completar:
- Supabase Project: [project_id]
- Database URL: configured
- Extensions: pgvector, uuid-ossp, btree_gin ✅
- Storage: documents bucket created
- Auth: basic configuration ready
- Local Development: supabase CLI working
- Siguiente tarea: TASK-P1E1-01C (Vercel Deployment Setup)
- Database ready for: auth setup, schema creation
```

## Rollback Plan
En caso de problemas críticos:
1. `supabase stop` para detener servicios locales
2. Eliminar proyecto Supabase si es necesario
3. Limpiar archivos de configuración locales
4. Reinstalar Supabase CLI si hay problemas
5. Documentar problema específico encontrado

---
*Esta tarea establece la base de datos y infraestructura de datos para todo el proyecto NeurAnt. Es crítica para auth, storage y todas las features posteriores.*