# NeurAnt - Documentación Arquitectónica

## 📋 Resumen Ejecutivo

**NeurAnt** es una plataforma SaaS multi-tenant que permite a empresas crear, configurar y gestionar agentes de IA conversacional para WhatsApp, Telegram y Slack. La arquitectura está diseñada para ser **escalable, costo-efectiva y mantenible** por un equipo de 3 desarrolladores.

### Características Principales
- 🤖 **Agentes IA Configurables** con personalidades y knowledge bases personalizados
- 💬 **Multi-canal** (WhatsApp, Telegram, Slack) con workflows unificados
- 👥 **HITL (Human-in-the-Loop)** con sistema de transferencias jerárquicas
- 🔐 **RBAC Avanzado** con roles Owner → Admin → Supervisor → Operador
- 📊 **Analytics Avanzados** con métricas de rendimiento y satisfacción
- 🔗 **Integraciones Externas** (Google Workspace, AirTable, bases de datos)
- 🧠 **RAG (Retrieval-Augmented Generation)** con búsqueda vectorial en documentos

### Arquitectura Core
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase (PostgreSQL + Realtime)
- **AI**: OpenAI GPT + pgvector para RAG
- **Messaging**: n8n workflows para orquestación multi-canal
- **Deployment**: Vercel + Supabase Cloud

---

## 📁 Estructura de Documentación

### [01-system-overview.md](./01-system-overview.md)
**Visión general del sistema y decisiones arquitectónicas principales**
- Objetivos funcionales y no funcionales
- Patrón arquitectónico (Serverless Multi-Tenant + Event-Driven)
- Componentes clave y sus responsabilidades
- Estrategia de escalabilidad y costos estimados

### [02-c4-diagrams.md](./02-c4-diagrams.md)
**Diagramas C4 (Context, Containers, Components)**
- Diagrama de contexto con usuarios y sistemas externos
- Arquitectura de contenedores con Supabase y n8n
- Componentes detallados de la aplicación web
- Flujos de datos para conversaciones normales, HITL y RAG

### [03-database-design.md](./03-database-design.md)
**Diseño completo de base de datos multi-tenant**
- Schema PostgreSQL con Row Level Security (RLS)
- Entidades core: Companies, Users, Chatbots, Conversations, Messages
- Sistema RAG con embeddings vectoriales (pgvector)
- Índices, triggers y funciones para performance
- Estrategia de archivado y backup

### [04-tech-stack.md](./04-tech-stack.md)
**Stack tecnológico definitivo con justificaciones**
- Frameworks y librerías principales
- Servicios externos y sus configuraciones
- Estrategia de deployment y CI/CD
- Costos estimados y optimización de recursos
- Herramientas de monitoring y observabilidad

### [adrs/](./adrs/)
**Architectural Decision Records (ADRs) para decisiones críticas**

#### [ADR-001: Multi-Tenant Strategy](./adrs/001-multi-tenant-strategy.md)
- **Decisión**: Shared Database + Row Level Security (RLS)
- **Justificación**: Simplicidad operacional, costo-efectividad, Supabase native
- **Trade-offs**: Noisy neighbor potential vs operational simplicity

#### [ADR-002: Messaging Architecture](./adrs/002-messaging-architecture.md)
- **Decisión**: n8n Workflows como Message Orchestration Layer
- **Justificación**: Conectores pre-built, visual workflows, separation of concerns
- **Trade-offs**: Vendor dependency vs rapid development

#### [ADR-003: RAG Implementation](./adrs/003-rag-implementation.md)
- **Decisión**: pgvector + OpenAI Embeddings
- **Justificación**: Same database, cost-effective, data consistency
- **Trade-offs**: Performance limitations vs architectural simplicity

#### [ADR-004: HITL Real-time Architecture](./adrs/004-hitl-realtime-architecture.md)
- **Decisión**: Supabase Realtime + PostgreSQL subscriptions
- **Justificación**: Integrated solution, multi-tenant ready, cost-effective
- **Trade-offs**: Scaling limitations vs simplicity

#### [ADR-005: Sistema RBAC Avanzado con HITL](./adrs/005-rbac-avanzado-hitl.md)
- **Decisión**: RBAC Jerárquico con transferencias HITL integradas
- **Justificación**: Control granular, escalabilidad operacional, auditabilidad completa
- **Trade-offs**: Complejidad inicial vs seguridad y compliance

### [05-implementation-roadmap.md](./05-implementation-roadmap.md)
**Plan detallado de implementación en 4 fases (8 meses)**
- **Fase 1**: Fundación y MVP Core (Mes 1-2)
- **Fase 2**: Core Features & RAG (Mes 3-4)
- **Fase 3**: HITL & Analytics (Mes 5-6)
- **Fase 4**: Integraciones & Launch (Mes 7-8)
- Sprints detallados con deliverables y success criteria

---

## 🔐 Documentación RBAC-HITL Avanzado

### [09-rbac-hitl-architecture.md](./09-rbac-hitl-architecture.md)
**Arquitectura integrada RBAC-HITL con diagramas C4**
- Diagramas de contexto, contenedores y componentes RBAC
- Flujos completos de transferencia HITL entre roles
- Matriz de transferencias y estados de sesión
- Patrones de autorización jerárquica

### [10-modelo-datos-rbac-extendido.md](./10-modelo-datos-rbac-extendido.md)
**Modelo conceptual de datos para RBAC avanzado**
- Extensiones a entidades existentes (Users, Chatbots)
- Nuevas entidades (Chatbot_Supervisors, HITL_Transfers)
- Constraints de negocio y validaciones de integridad
- Estrategias de rendimiento e indexación

### [11-interfaces-contratos-rbac.md](./11-interfaces-contratos-rbac.md)
**Interfaces y contratos entre componentes RBAC-HITL**
- APIs de servicios de autorización y transferencias
- Eventos del sistema y protocolos de comunicación
- Patrones de integración y middleware
- SLAs y métricas de observabilidad

### [12-guias-implementacion-rbac.md](./12-guias-implementacion-rbac.md)
**Guías de implementación para el equipo de desarrollo**
- Patrones de desarrollo y principios arquitectónicos
- Estrategias de testing (seguridad, performance, resilencia)
- Roadmap de implementación por fases (6 sprints)
- Métricas de éxito y consideraciones de seguridad

---

## 🏗️ Arquitectura Visual

### Diagrama de Alto Nivel
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Client    │    │   Mobile Apps    │    │  External APIs  │
│   (Next.js)     │    │   (Future)       │    │  (n8n, OpenAI)  │
└─────────┬───────┘    └─────────┬────────┘    └─────────┬───────┘
          │                      │                       │
          └──────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼──────────────┐
                    │     API Gateway/Load      │
                    │     Balancer (Vercel)     │
                    └────────────┬──────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
    ┌─────────▼─────────┐ ┌─────▼─────┐ ┌────────▼────────┐
    │   Next.js App     │ │ Supabase  │ │   n8n Workflows │
    │  (API Routes +    │ │ (Database │ │  (Messaging +   │
    │   UI Components)  │ │ Realtime  │ │   AI Routing)   │
    └───────────────────┘ │ + Auth)   │ └─────────────────┘
                          └───────────┘
```

### Stack Tecnológico
```
Frontend:        Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
State:           TanStack Query + Zustand + React Hook Form + Zod
Backend:         Next.js API Routes + Supabase (Auth + DB + Storage + Realtime)
Database:        PostgreSQL + pgvector + Row Level Security
AI:              OpenAI GPT-4 + text-embedding-ada-002
Workflows:       n8n Cloud (WhatsApp + Telegram + Slack integration)
Deployment:      Vercel + Supabase Cloud
Monitoring:      Vercel Analytics + Sentry + Supabase Dashboard
```

---

## 🎯 Objetivos de Arquitectura

### ✅ Cumplidos
- **Multi-tenancy**: Aislamiento completo de datos entre empresas
- **Escalabilidad**: Support para 100+ empresas, 45K mensajes/día
- **Costo-efectividad**: ~$320-620/mes en costos de infraestructura
- **Simplicidad operacional**: Single database, managed services
- **Developer Experience**: TypeScript end-to-end, hot reload, modern tooling
- **Time-to-market**: 8 meses hasta lanzamiento

### 🎲 Trade-offs Principales
1. **Vendor Lock-in** (Supabase + Vercel) vs **Operational Simplicity**
2. **Performance Especializada** vs **Architectural Consistency** (pgvector vs Pinecone)
3. **Control Total** vs **Rapid Development** (n8n vs custom messaging)
4. **Feature Richness** vs **Bundle Size** (shadcn/ui vs Material-UI)

---

## 📊 Métricas de Éxito

### Technical KPIs
- **Performance**: API response time < 200ms p95 ✅
- **Uptime**: > 99.9% availability target ✅
- **Security**: 0 data breaches, RLS violations ✅
- **Scalability**: Support 100+ concurrent users ✅

### Product KPIs
- **Target**: 100+ empresas en primer año
- **Usage**: 24K-45K mensajes/día por empresa grande
- **Retention**: 70%+ monthly active companies
- **Satisfaction**: 4.0+ average user rating

### Business KPIs
- **Revenue Target**: $10K MRR by end of year
- **Infrastructure Costs**: < $600/month at scale
- **Team Efficiency**: 3 developers → full platform
- **Support Load**: < 5 tickets/week

---

## 🚀 Timeline y Próximos Pasos

### Cronograma
```
Enero-Febrero 2025:   Fase 1 - Fundación y MVP Core
Marzo-Abril 2025:     Fase 2 - Core Features & RAG  
Mayo-Junio 2025:      Fase 3 - HITL & Analytics
Julio-Agosto 2025:    Fase 4 - Integraciones & Launch
Septiembre 2025:      MVP Target (15 Sept)
Octubre 2025:         Public Launch
```

### Próximos Pasos Inmediatos
1. ✅ **Arquitectura completada y documentada**
2. 🔄 **Setup inicial del proyecto** (Sprint 1.1)
3. ⏳ **Team onboarding** en stack tecnológico
4. ⏳ **Prototipo inicial** de autenticación y multi-tenancy

### Hitos Críticos
- **15 Marzo 2025**: RAG system functional
- **15 Mayo 2025**: HITL system operational  
- **15 Julio 2025**: All integrations working
- **15 Septiembre 2025**: MVP ready for beta users
- **1 Octubre 2025**: Public launch

---

## 🛡️ Gestión de Riesgos

### Riesgos Alto Impacto
1. **n8n Integration Complexity** → Prototype early, fallback plan
2. **OpenAI API Rate Limits** → Usage monitoring, alternative providers
3. **Team Bandwidth** → Ruthless prioritization, external help if needed
4. **Supabase Scaling** → Performance testing, migration plan

### Estrategias de Mitigación
- **Incremental development** con validation temprana
- **Feature flags** para deployment gradual
- **Monitoring proactivo** de performance y usage
- **Documentation exhaustiva** para knowledge transfer

---

## 📞 Contacto y Contribución

### Equipo Arquitectónico
- **Arquitecto Senior**: Responsable de decisiones técnicas mayores
- **Tech Lead**: Implementation y código review
- **Senior Developer**: Features y integration development

### Proceso de Cambios Arquitectónicos
1. **Proposal**: RFC (Request for Comments) con justificación
2. **Review**: Análisis de impacto y alternatives
3. **Decision**: ADR documentation con reasoning
4. **Implementation**: Phased rollout con monitoring
5. **Retrospective**: Lessons learned y optimizations

### Documentación Viva
Esta documentación se actualiza continuamente durante el desarrollo. Cada cambio arquitectónico mayor requiere actualización de los documentos relevantes y creación de nuevos ADRs cuando sea necesario.

---

*Última actualización: 29 de Enero, 2025*  
*Versión: 1.1 - RBAC Avanzado con HITL Integrado*  
*Status: Approved for Implementation*