# TASK-P1E2-02D: Dashboard Layout

## Identificación
- **ID:** TASK-P1E2-02D
- **Título:** Dashboard Layout
- **Type:** Frontend UI
- **Phase:** 1 - Foundation
- **Epic:** Auth & Multi-tenancy
- **Sprint:** Sprint 1.2 (Semanas 3-4, Febrero 2025)
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 6 horas
- **Prioridad:** Crítica - Base para todas las páginas del dashboard

## Definición Técnica
Implementar layout principal del dashboard con sidebar navigation, header con user menu, breadcrumbs, y estructura responsive que funcione en todos los dispositivos.

## Referencias de Documentación NeurAnt
- **Dashboard Structure:** `docs/architecture/05-implementation-roadmap.md:129-142` (Dashboard Layout con navigation)
- **User Context:** `docs/architecture/06-tenant-context-management.md:45-78` (Tenant context provider)

## Referencias de Diseño Visual (GUIA_DISENO_VISUAL_NEURANT.md)
- **Navegación:** `GUIA_DISENO_VISUAL_NEURANT.md:423-470` (Sidebar Navigation, Top Navigation, User Menu)
- **Tipografía:** `GUIA_DISENO_VISUAL_NEURANT.md:116-149` (Jerarquías de headings, body text, captions)
- **Colores:** `GUIA_DISENO_VISUAL_NEURANT.md:53-114` (Paleta completa, grises para backgrounds)
- **Espaciado:** `GUIA_DISENO_VISUAL_NEURANT.md:185-217` (Sistema de espaciado, contenedores, grids)
- **Responsive Design:** `GUIA_DISENO_VISUAL_NEURANT.md:824-867` (Breakpoints, mobile navigation, hamburger menu)
- **Modo Oscuro:** `GUIA_DISENO_VISUAL_NEURANT.md:782-822` (Elementos que cambian, backgrounds, borders)
- **Iconografía:** `GUIA_DISENO_VISUAL_NEURANT.md:151-183` (Estilo outline, categorías para configuración)
- **Recomendaciones Técnicas:** `GUIA_DISENO_VISUAL_NEURANT.md:1219-1235` (shadcn/ui componentes navigation)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E2-02C ✅ (Login/Signup Pages)
- **Bloquea:**
  - [ ] TASK-P1E2-02E (Auth Context Provider)
  - [ ] Todo el desarrollo del dashboard

## Criterios de Aceptación Específicos
- [ ] Layout responsive con sidebar colapsable
- [ ] Navigation menu con rutas principales
- [ ] Header con user profile dropdown
- [ ] Breadcrumb navigation
- [ ] Mobile-friendly navigation drawer

## Archivos a Crear/Modificar
```
app/(dashboard)/layout.tsx
components/layout/dashboard-layout.tsx
components/layout/sidebar.tsx
components/layout/header.tsx
components/layout/breadcrumbs.tsx
components/layout/user-menu.tsx
```

## Implementation Structure
```tsx
// app/(dashboard)/layout.tsx
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { getCurrentUser } from '@/lib/supabase/auth-helpers'
import { redirect } from 'next/navigation'

export default async function Layout({
  children
}: {
  children: React.ReactNode
}) {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    redirect('/login')
  }

  return (
    <DashboardLayout user={currentUser}>
      {children}
    </DashboardLayout>
  )
}
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md al completar:
- Dashboard Layout: ✅ Sidebar, header, navigation implementados
- Responsive: ✅ Mobile y desktop layouts
- User Context: ✅ User info disponible en layout
- Siguiente tarea: TASK-P1E2-02E (Auth Context Provider)
```