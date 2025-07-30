# Contexto de Sesión Actual - NeurAnt

## 🚨 ACCIÓN INMEDIATA REQUERIDA AL REINICIAR SESIÓN
**MCP Supabase configurado - Scripts SQL pendientes de ejecutor**

### Configuración MCP Completada:
- ✅ **Archivo:** `.claude/mcp.json` 
- ✅ **Token:** `sbp_cd2db2fe8075d3cb266d6af441faec9aeb26461e`
- ✅ **Proyectos:** DEV (wydcmmsxdhentmoxthnu) + PROD (ewyyekypuzgurwgnouxp)

### Scripts SQL a Ejecutar vía MCP:
1. `supabase-setup/01-enable-extensions.sql` - Extensiones críticas
2. `supabase-setup/02-initial-schema.sql` - Tablas y RLS policies  
3. `supabase-setup/03-storage-setup.sql` - Storage buckets

**INSTRUCCIÓN:** Usar herramientas MCP para ejecutar scripts en ambos proyectos antes de continuar.

## Información de Desarrollo
- **Branch:** dev (actualizado con configuración Supabase)
- **Último Commit:** fe1abbe - feat: Implement Supabase Cloud configuration
- **Working Directory:** /home/kcifuentes/Documentos/Innovarting/projects/neurant
- **Environment:** Desarrollo con Supabase Cloud
- **Session Started:** 2025-07-30 (MCP configurado)

## Estado Mental del Proyecto
- **Decisión Reciente:** TaskManager implementado con estructura basada en documentación real
- **Próxima Decisión Crítica:** Inicializar proyecto Next.js 14 con configuración específica
- **Preocupación Actual:** Asegurar que el orden de dependencias se respete estrictamente
- **Confidence Level:** Alto - Documentación arquitectónica completa disponible

## Decisiones Técnicas Documentadas
### Stack Tecnológico Confirmado
- **Framework:** Next.js 14+ con App Router (no Pages Router)
- **Lenguaje:** TypeScript 5.0+ estricto
- **Database:** Supabase PostgreSQL con pgvector extension
- **Auth:** Supabase Auth con RBAC personalizado
- **State:** TanStack Query + Zustand (no Redux)
- **UI:** shadcn/ui + Tailwind CSS 3.3+
- **Deployment:** Vercel con Edge Functions
- **Workflows:** n8n Cloud para integraciones externas

### Patrones Arquitectónicos Adoptados
- **Multi-tenancy:** Row Level Security (RLS) en PostgreSQL
- **RBAC:** Jerarquía Owner → Admin → Supervisor → Operador
- **HITL:** State machine con transferencias jerárquicas
- **RAG:** pgvector con OpenAI embeddings
- **Real-time:** Supabase Realtime para notificaciones

## Archivos de Documentación Clave
- `docs/architecture/04-tech-stack.md` - Stack tecnológico completo
- `docs/architecture/05-implementation-roadmap.md` - Roadmap detallado 4 fases
- `docs/architecture/13-diagrama-entidad-relacion.md` - Schema completo BD
- `docs/architecture/09-rbac-hitl-architecture.md` - Diseño RBAC+HITL
- `docs/architecture/12-guias-implementacion-rbac.md` - Patrones implementación

## Dependencias de Orden Críticas
1. **Infrastructure Setup** → Auth System → Chatbot CRUD → Conversations
2. **Database Schema** → RLS Policies → RBAC Implementation → HITL System  
3. **Basic APIs** → n8n Integration → Multi-channel → RAG System
4. **Core Features** → Analytics → Integrations → Production Ready

## Comandos Preparados
```bash
# Project Initialization (Próxima tarea)
npx create-next-app@latest neurant --typescript --tailwind --eslint --app

# Supabase Setup
npx supabase init
npx supabase start

# Development
npm run dev
npm run build
npm run lint
```

## Alertas para Claude
- ⚠️ **Database:** Siempre verificar RLS policies antes de crear tablas
- 🔄 **En Progreso:** TaskManager completamente configurado  
- 📋 **Pendiente:** Inicializar proyecto Next.js según especificaciones exactas
- 🎯 **Meta:** Completar Phase 1 Epic 1 (Infrastructure) en 2 semanas

## Contexto de Continuidad
Si la sesión se interrumpe:
1. Leer `Tasks/current.md` para estado exacto
2. Consultar `tasks/phase-1-foundation/epic-01-infrastructure/01a-nextjs-project-setup.md`
3. Verificar que dependencias están resueltas antes de continuar
4. Actualizar progreso en current.md después de cualquier avance