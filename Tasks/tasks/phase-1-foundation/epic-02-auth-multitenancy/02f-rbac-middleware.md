# TASK-P1E2-02F: RBAC Middleware

## Identificación
- **ID:** TASK-P1E2-02F
- **Título:** RBAC Middleware
- **Type:** API
- **Phase:** 1 - Foundation
- **Epic:** Auth & Multi-tenancy
- **Sprint:** Sprint 1.2 (Semanas 3-4, Febrero 2025)
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 4 horas
- **Prioridad:** Crítica - Seguridad de todas las rutas

## Definición Técnica
Implementar middleware de Next.js para proteger rutas según roles RBAC, redirect automático según estado de auth, y validación de permisos en API routes.

## Referencias de Documentación NeurAnt
- **RBAC Model:** `docs/architecture/10-modelo-datos-rbac-extendido.md:32-89` (Jerarquía y permisos)
- **Route Protection:** `docs/architecture/04-tech-stack.md:412-429` (Security patterns)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E2-02E ✅ (Auth Context Provider)
- **Bloquea:**
  - [ ] Todas las rutas protegidas del dashboard

## Criterios de Aceptación Específicos
- [ ] Middleware protege rutas /dashboard/*
- [ ] Auto-redirect a /login si no autenticado
- [ ] Role-based access a rutas específicas
- [ ] API protection con role validation

## Archivos a Crear/Modificar
```
middleware.ts
lib/middleware/rbac.ts
lib/auth/route-guards.ts
```

## Implementation Structure
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  // Redirect to dashboard if already authenticated
  if (req.nextUrl.pathname.startsWith('/login') || 
      req.nextUrl.pathname.startsWith('/signup')) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup', '/api/protected/:path*']
}
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md al completar:
- Route Protection: ✅ Middleware protegiendo rutas
- RBAC: ✅ Role-based access control
- Auto-redirect: ✅ Auth state management
- Siguiente tarea: TASK-P1E3-03A (Epic 3 - Chatbot CRUD)
```