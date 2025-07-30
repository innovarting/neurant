# ADR-001: Multi-Tenant Architecture Strategy

## Status
**ACCEPTED** - 2025-01-28  
**REFINED** - 2025-01-28

## Context

NeurAnt es una plataforma SaaS que servirá a múltiples empresas (tenants) simultáneamente. Como startup con un equipo de 3 desarrolladores, necesitamos una estrategia de multi-tenancy que balancee:

- **Aislamiento de datos** completo entre empresas
- **Escalabilidad** para 100+ empresas en el primer año  
- **Costo-efectividad** operacional y de infraestructura
- **Simplicidad** de desarrollo y mantenimiento
- **Performance** adecuado para 24K-45K mensajes/día por empresa

## Decision

Adoptamos **Shared Database with Row Level Security (RLS)** como patrón principal de multi-tenancy con las siguientes decisiones arquitectónicas específicas:

### 1. Database Architecture Pattern
**Pattern**: Shared Database, Isolated by Row Level Security
- **Rationale**: Maximiza eficiencia de recursos mientras garantiza aislamiento de datos
- **Implementation**: PostgreSQL con RLS nativo via Supabase
- **Trade-off**: Menor aislamiento físico a cambio de simplicidad operacional

### 2. Tenant Identification Strategy  
**Strategy**: Single Domain + Context (`neurant.app`)
- **Rationale**: Minimiza complejidad de routing y SSL management
- **Implementation**: Tenant determinado por usuario autenticado, no por URL
- **Trade-off**: Tenant no visible en URL, requiere autenticación para identificación

### 3. User Role Hierarchy & Ownership Model
**Model**: Owner-centric role hierarchy
```
Owner (1 per company) → Administrator → Supervisor → Operator
```
- **Rationale**: Clear ownership establishes accountability and reduces support overhead
- **Implementation**: Self-service onboarding donde primer usuario se convierte en Owner
- **Trade-off**: Menos control inicial vs mayor velocidad de adopción

### 4. Onboarding & User Management Strategy
**Strategy**: Self-service with plan-based limits
- **Rationale**: Minimiza friction de adopción para maximizar conversión
- **Implementation**: Creación simultánea de usuario + empresa durante registro
- **Enforcement**: Límites de invitación basados en plan de suscripción

### 5. Multi-tenant Context Management
**Pattern**: React Context + Server-side middleware
- **Rationale**: Consistent tenant context across client and server
- **Implementation**: TenantProvider para client-side, middleware para API routes
- **Benefits**: Type-safe tenant access with automatic context loading

## Alternatives Considered

### Multi-tenant Database Strategies

#### 1. Separate Databases per Tenant
- **Pros**: Máximo aislamiento de datos, backup granular por tenant, scaling independiente
- **Cons**: Complejidad operacional extrema, costos de infraestructura altos, analytics cross-tenant complejos
- **Decision**: Rechazado por complejidad operacional prohibitiva para equipo de 3 desarrolladores

#### 2. Separate Schemas per Tenant  
- **Pros**: Buen balance aislamiento/recursos, flexibilidad per-tenant, migrations granulares
- **Cons**: Complejidad de conexiones, not natively supported by Supabase, schema management overhead
- **Decision**: Rechazado por incompatibilidad con Supabase y over-engineering para needs actuales

#### 3. Application-level Filtering (WHERE tenant_id = ?)
- **Pros**: Simplicidad inicial de implementación, máxima flexibilidad de queries
- **Cons**: Alto riesgo de data leakage, performance degradation, complejidad en queries complejas
- **Decision**: Rechazado por riesgo de seguridad inaceptable

### Tenant Identification Strategies

#### 1. Subdomain-based (`{tenant}.neurant.app`)
- **Pros**: Clear visual tenant separation, easy per-tenant branding, SEO benefits
- **Cons**: SSL certificate management, DNS complexity, subdomain provisioning overhead
- **Decision**: Rechazado por complexity vs value trade-off desfavorable

#### 2. Path-based (`neurant.app/{tenant}/dashboard`)
- **Pros**: Single domain, URL-based tenant identification, no SSL complexity
- **Cons**: URL structure complexity, routing overhead, suboptimal UX for bookmarking
- **Decision**: Rechazado por UX degradation y routing complexity innecesaria

#### 3. Single Domain + Context (`neurant.app`)
- **Pros**: Máxima simplicidad operacional, clean UX, no infrastructure overhead
- **Cons**: Tenant not visible in URL, requires authentication for tenant identification
- **Decision**: Seleccionado por simplicidad máxima y mejor developer experience

### User Role & Onboarding Strategies

#### 1. Admin-controlled Onboarding
- **Pros**: Centralized control, curated onboarding experience, quality control
- **Cons**: Friction en adoption, no self-service, requires manual intervention
- **Decision**: Rechazado por friction que reduce conversion rates

#### 2. Self-service + Owner Role
- **Pros**: Zero friction adoption, fastest time-to-value, clear ownership model
- **Cons**: Less initial control, requires robust default configurations
- **Decision**: Seleccionado para optimizar adoption speed y user conversion

## Consecuencias Arquitectónicas

### Impactos Positivos
- ✅ **Simplicidad Operacional**: Despliegue único, base de datos e infraestructura unificada
- ✅ **Eficiencia de Costos**: Recursos compartidos maximizan utilización de hardware y minimizan overhead
- ✅ **Velocidad de Desarrollo**: Aprovecha características nativas de Supabase, reduce código de infraestructura personalizado
- ✅ **Predictibilidad de Rendimiento**: Índices compartidos y connection pooling optimizan rendimiento de consultas
- ✅ **Capacidades Analíticas**: Insights cross-tenant y reportes sin complejidad de federación de datos
- ✅ **Backup y Recuperación**: Estrategia de backup unificada con recuperación point-in-time
- ✅ **Experiencia de Usuario**: URLs limpias y simples sin complejidad de routing de tenant
- ✅ **Velocidad de Entrada al Mercado**: Onboarding self-service maximiza velocidad de adquisición de usuarios
- ✅ **Modelo de Responsabilidad**: Jerarquía de ownership clara reduce overhead de soporte
- ✅ **Gestión de Ingresos**: Enforcement de cuotas integrado alineado con tiers de suscripción

### Impactos Negativos  
- ❌ **Riesgo de Contención de Recursos**: Potencial para efectos de vecino ruidoso bajo alta carga
- ❌ **Dependencias de Schema Global**: Migraciones de base de datos impactan todos los tenants simultáneamente
- ❌ **Complejidad de Índices**: Todas las consultas deben incluir filtrado de tenant para rendimiento óptimo
- ❌ **Lock-in de Plataforma**: Fuerte dependencia en PostgreSQL RLS y ecosistema Supabase
- ❌ **Limitaciones de URL**: Contexto de tenant no persistente en URLs, afecta bookmarking y sharing
- ❌ **Dependencia de Autenticación**: Identificación de tenant requiere sesión autenticada
- ❌ **Complejidad de Políticas de Seguridad**: Políticas RLS granulares requieren diseño y testing cuidadoso

### Trade-offs Aceptados
- 🔄 **Techo de Escalabilidad**: Eventualmente requerirá estrategias de sharding o particionado
- 🔄 **Restricciones de Cumplimiento**: Algunos clientes enterprise pueden requerir aislamiento físico de datos
- 🔄 **Complejidad de Integración**: Flujos multi-paso de invitación de usuarios y gestión de roles
- 🔄 **Overhead de Gestión de Contexto**: Requiere gestión robusta de estado entre cliente y servidor

## Estrategia de Implementación

### Fase 1: Arquitectura Fundamental (Sprints 1.1-1.2)
**Objetivo**: Establecer infraestructura multi-tenant central y aislamiento de datos

**Entregables Clave**:
- Schema de base de datos multi-tenant con políticas RLS
- Jerarquía de roles de usuario con designación Owner  
- Flujo de trabajo atómico de creación usuario + empresa
- Gestión básica de contexto de tenant

**Criterios de Éxito**: 
- Aislamiento completo de datos entre tenants verificado
- Creación self-service de empresa funcional
- Asignación de rol Owner automatizada

### Fase 2: Gestión de Contexto y Acceso (Sprints 1.3-1.4)  
**Objetivo**: Implementar gestión de contexto de tenant y sistema de invitación de usuarios

**Entregables Clave**:
- Proveedor de contexto de tenant del lado cliente
- Middleware de tenant del lado servidor
- Flujo de trabajo seguro de invitación de usuarios con tokens de email
- Permisos UI basados en roles

**Criterios de Éxito**:
- Contexto de tenant consistente a través de todas las capas de aplicación
- Límites de invitación de usuarios basados en plan aplicados
- Renderizado de interfaz consciente de permisos

### Fase 3: Seguridad Avanzada y Rendimiento (Sprint 2.1)
**Objetivo**: Optimizar políticas RLS y rendimiento del sistema  

**Entregables Clave**:
- Políticas RLS granulares para todos los tipos de entidad
- Restricciones de acceso específicas de operador 
- Optimización de rendimiento de base de datos
- Análisis de consultas y estrategia de indexación

**Criterios de Éxito**:
- Rendimiento de consulta sub-100ms para operaciones filtradas por tenant
- Acceso de operador limitado solo a chatbots asignados
- Cero filtración de datos cross-tenant en auditoría de seguridad

### Fase 4: Monitoreo y Lógica de Negocio (Sprint 2.2)
**Objetivo**: Implementar seguimiento de uso y enforcement de plan

**Entregables Clave**:
- Seguimiento de uso en tiempo real por tenant
- Enforcement automatizado de límites de plan
- Alertas basadas en uso y prompts de upgrade
- Dashboard de analíticas para utilización de recursos

**Criterios de Éxito**:
- Medición precisa de uso a través de todas las dimensiones de plan  
- Enforcement automatizado de cuotas previene excesos
- Rutas claras de upgrade cuando se aproximan límites

## Métricas de Éxito y Monitoreo

### Seguridad y Aislamiento
- **Integridad de Datos**: Cero incidentes de acceso de datos cross-tenant
- **Control de Acceso**: 100% cumplimiento de políticas de acceso basadas en roles  
- **Cobertura de Auditoría**: Registro completo de eventos de seguridad con atribución de tenant
- **Gobernanza de Owner**: Restricción de owner único por empresa mantenida

### Rendimiento y Escalabilidad
- **Rendimiento de Consultas**: < 100ms p95 para operaciones de base de datos filtradas por tenant
- **Equidad de Recursos**: Ningún tenant individual consumiendo > 50% de recursos compartidos
- **Capacidad Concurrente**: Soporte para 100+ tenants con tiempos de respuesta consistentes
- **Eficiencia de Contexto**: Resolución de contexto de tenant < 500ms en autenticación

### Excelencia Operacional
- **Simplicidad de Despliegue**: Artefacto de despliegue único sirviendo todos los tenants
- **Seguridad de Migración**: Migraciones de schema sin downtime a través de todos los tenants
- **Granularidad de Monitoreo**: Visibilidad de utilización de recursos por tenant
- **Éxito de Self-Service**: > 90% completación de onboarding sin intervención manual

### Resultados de Negocio
- **Velocidad de Adopción**: > 95% tasa de éxito de creación self-service de empresa
- **Cumplimiento de Plan**: > 99% adherencia de tenant a límites de suscripción
- **Crecimiento de Equipo**: Promedio 2.5+ usuarios por empresa dentro de 90 días
- **Engagement de Owner**: > 90% retención de owner a los 30 días

## Mitigación de Riesgos

### Riesgos de Alto Impacto
- **Filtración de Datos**: Mitigado a través de testing integral de políticas RLS y auditorías de seguridad
- **Degradación de Rendimiento**: Abordado vía optimización de base de datos y monitoreo de recursos de tenant  
- **Cuellos de Botella de Escalabilidad**: Estrategia planificada de particionado de base de datos para crecimiento futuro
- **Vendor Lock-in**: Ruta de migración documentada de Supabase a PostgreSQL auto-hospedado

### Riesgos de Impacto Medio  
- **Migraciones Complejas**: Estrategia de despliegue por etapas con capacidades de rollback
- **Bugs de Gestión de Contexto**: Testing integral de integración de flujos de contexto de tenant
- **Errores de Permisos de Rol**: Suite de testing automatizado para todos los escenarios de acceso basado en roles

## Historial de Revisiones

| Fecha | Cambio | Razón |
|------|--------|--------|
| 2025-01-28 | Decisión arquitectónica inicial | Definición de estrategia multi-tenant |
| 2025-01-28 | Enfoque refinado de identificación de tenant | Clarificación de dominio único + contexto |
| 2025-01-28 | Agregado rol owner y modelo self-service | Alineación de requerimientos de negocio |
| 2025-01-28 | Refactorización arquitectónica | Removidos detalles de implementación, enfoque en decisiones |

## Decisiones de Arquitectura Relacionadas
- **ADR-002**: Selección de Proveedor de Base de Datos (Supabase vs Alternativas)
- **ADR-003**: Estrategia de Autenticación y Autorización  
- **ADR-004**: Arquitectura de Comunicación en Tiempo Real
- **ADR-005**: Patrones de Integración Externa

---

*Este ADR establece las decisiones fundamentales de arquitectura multi-tenant. Los detalles de implementación y especificaciones técnicas se cubren en los documentos de arquitectura correspondientes.*