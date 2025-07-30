# NeurAnt - System Architecture Overview

## Resumen Ejecutivo

NeurAnt es una plataforma SaaS multi-tenant que permite a empresas crear, configurar y gestionar agentes de IA conversacional para WhatsApp, Telegram y Slack. La plataforma incluye funcionalidades avanzadas como Human-in-the-Loop (HITL), analytics detallados, base de conocimientos vectorial y integraciones con sistemas externos.

## Objetivos del Sistema

### Funcionales
- **Creación de Agentes IA**: Interfaz intuitiva para configurar chatbots con personalidades, knowledge base y flujos conversacionales
- **Multi-canal**: Soporte nativo para WhatsApp, Telegram y Slack
- **HITL (Human-in-the-Loop)**: Sistema de escalación a operadores humanos con chat en tiempo real
- **Analytics**: Métricas detalladas de conversaciones, rendimiento y calidad del servicio
- **Integraciones**: Conectores con Google Workspace, AirTable, MySQL, PostgreSQL
- **RAG (Retrieval-Augmented Generation)**: Sistema de knowledge base con documentos PDF

### No Funcionales
- **Escalabilidad**: Soporte para 100+ empresas en el primer año
- **Performance**: Respuesta de bots < 3 segundos
- **Disponibilidad**: 99.9% uptime (SLA)
- **Multi-tenancy**: Aislamiento completo de datos entre empresas
- **Seguridad**: Auditoría de accesos, encriptación en tránsito

## Arquitectura de Alto Nivel

### Patrón Arquitectónico Principal: **Serverless Multi-Tenant + Event-Driven**

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

## Componentes Clave

### 1. Frontend Layer
- **Next.js 14+** con App Router
- **TypeScript** para type safety
- **Tailwind CSS** para styling
- **Shadcn/UI** para componentes base
- **React Query** para state management y caching

### 2. Backend Layer
- **Next.js API Routes** para endpoints REST
- **Serverless Functions** para operaciones async
- **Supabase** como Backend-as-a-Service
- **Row Level Security (RLS)** para multi-tenancy

### 3. Data Layer
- **PostgreSQL** (Supabase) como base de datos principal
- **pgvector** para embeddings y RAG
- **Supabase Storage** para archivos PDF
- **Supabase Realtime** para HITL chat

### 4. Integration Layer
- **n8n** para workflows de mensajería
- **OpenAI API** para modelos de IA
- **Webhooks** para comunicación async
- **REST APIs** para integraciones externas

## Decisiones Arquitectónicas Clave

### Multi-Tenancy Strategy: **Shared Database, Isolated Schema**
- Single database con tenant_id en todas las tablas
- Row Level Security (RLS) para aislamiento automático
- Shared infrastructure para optimizar costos

### State Management: **Server-First + Client Hydration**
- Server-side rendering con Next.js
- Client-side state con React Query
- Real-time updates con Supabase subscriptions

### Messaging Architecture: **Event-Driven via n8n**
- n8n maneja toda la lógica de mensajería
- Webhooks bidireccionales para comunicación
- Queue-based processing para reliability

### RAG Implementation: **PostgreSQL + pgvector**
- Embeddings almacenados en PostgreSQL
- Semantic search con cosine similarity
- Chunk-based document processing

## Escalabilidad y Performance

### Horizontal Scaling
- Serverless functions auto-scale con demanda
- Supabase maneja database scaling automáticamente
- CDN global con Vercel Edge Network

### Caching Strategy
- Next.js Static Generation para páginas públicas
- React Query para client-side caching
- Supabase connection pooling

### Rate Limiting
- Per-tenant limits basados en plan de suscripción
- Circuit breakers para APIs externas
- Graceful degradation bajo alta carga

## Seguridad

### Authentication & Authorization
- Supabase Auth con JWT tokens
- Role-based access control (RBAC)
- Multi-factor authentication (opcional)

### Data Protection
- Encryption in transit (HTTPS/WSS)
- Row Level Security (RLS)
- API rate limiting y input validation

### Compliance
- Audit logs para todas las acciones
- GDPR compliance con data retention policies
- SOC 2 Type II através de Supabase

## Monitoring y Observabilidad

### Application Monitoring
- Vercel Analytics para performance
- Supabase Dashboard para database metrics
- Custom metrics con OpenTelemetry

### Error Tracking
- Sentry para error monitoring
- Structured logging con Winston
- Alerting via Slack/email

## Roadmap de Implementación

### Fase 1: Fundación (2 meses)
- Setup Next.js + Supabase
- Autenticación y multi-tenancy básico
- CRUD de empresas, usuarios, chatbots

### Fase 2: Core Features (2 meses)
- Integración n8n webhooks
- Sistema RAG con pgvector
- Dashboard básico por roles

### Fase 3: HITL & Analytics (2 meses)
- Sistema HITL con Supabase Realtime
- Analytics y métricas avanzadas
- Sistema de notificaciones

### Fase 4: Integraciones & Launch (2 meses)
- APIs externas (Google, AirTable, DB)
- Sistema de billing y quotas
- Testing, optimización y lanzamiento

## Estimación de Recursos

### Equipo de Desarrollo
- 3 desarrolladores full-stack
- 1 DevOps/Infrastructure (part-time)
- 1 QA/Testing (part-time)

### Costos Estimados (Mensual)
- Supabase Pro: $25/mes
- Vercel Pro: $20/mes
- n8n Cloud: $50/mes
- OpenAI API: Variable ($200-500/mes)
- **Total estimado**: $300-600/mes inicial

## Riesgos y Mitigaciones

### Riesgo Técnico
- **Riesgo**: Latencia alta en RAG queries
- **Mitigación**: Caching agresivo, índices optimizados

### Riesgo de Escalabilidad
- **Riesgo**: Database bottlenecks con alta concurrencia
- **Mitigación**: Connection pooling, read replicas

### Riesgo de Dependencias
- **Riesgo**: Vendor lock-in con Supabase
- **Mitigación**: Abstraction layer, migration plan

## Próximos Pasos

1. ✅ Completar análisis de requerimientos
2. 🔄 Crear diagramas C4 detallados
3. ⏳ Diseñar schema de base de datos
4. ⏳ Definir APIs y contratos
5. ⏳ Setup inicial del proyecto