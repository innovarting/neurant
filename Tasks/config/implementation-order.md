# Orden de Implementación Obligatorio - NeurAnt

## Dependencias Técnicas Críticas

### 🚨 **REGLAS INQUEBRANTABLES**
1. **NO** implementar una tarea hasta que todas sus dependencias estén ✅ Completadas
2. **NO** saltar épicas o fases sin completar la anterior
3. **NO** modificar el orden sin justificación técnica documentada
4. **SIEMPRE** verificar este archivo antes de iniciar cualquier tarea

## Phase 1: Foundation (Mes 1-2)

### Epic 1: Infrastructure Setup
```
TASK-P1E1-01A: Next.js Project Setup
├── Dependencias: Ninguna (INICIAL)
├── Bloquea: TODO lo demás
└── Duración: 4h

TASK-P1E1-01B: Supabase Configuration  
├── Dependencias: TASK-P1E1-01A ✅
├── Bloquea: Base de datos, Auth, Storage
└── Duración: 6h

TASK-P1E1-01C: Vercel Deployment Setup
├── Dependencias: TASK-P1E1-01A ✅, TASK-P1E1-01B ✅  
├── Bloquea: Production deployment
└── Duración: 3h

TASK-P1E1-01D: Environment Configuration
├── Dependencias: TASK-P1E1-01B ✅, TASK-P1E1-01C ✅
├── Bloquea: Development workflow
└── Duración: 2h
```

### Epic 2: Auth & Multi-tenancy
```
TASK-P1E2-02A: Supabase Auth Setup
├── Dependencias: Epic 1 COMPLETO ✅
├── Bloquea: User management, sessions
└── Duración: 4h

TASK-P1E2-02B: RLS Policies - Companies
├── Dependencias: TASK-P1E2-02A ✅
├── Bloquea: Multi-tenant isolation
└── Duración: 5h

TASK-P1E2-02C: User Registration Flow
├── Dependencias: TASK-P1E2-02B ✅
├── Bloquea: User onboarding
└── Duración: 6h

TASK-P1E2-02D: RBAC Middleware
├── Dependencias: TASK-P1E2-02C ✅
├── Bloquea: Authorization en APIs
└── Duración: 4h
```

### Epic 3: Chatbot CRUD & n8n
```
TASK-P1E3-03A: Database Schema - Chatbots
├── Dependencias: Epic 2 COMPLETO ✅
├── Bloquea: Chatbot functionality
└── Duración: 4h

TASK-P1E3-03B: Chatbot CRUD APIs
├── Dependencias: TASK-P1E3-03A ✅
├── Bloquea: Chatbot management
└── Duración: 6h

TASK-P1E3-03C: n8n Webhook Integration
├── Dependencias: TASK-P1E3-03B ✅
├── Bloquea: External messaging
└── Duración: 8h

TASK-P1E3-03D: Basic OpenAI Integration
├── Dependencias: TASK-P1E3-03C ✅
├── Bloquea: AI responses
└── Duración: 5h
```

### Epic 4: Conversations & Analytics
```
TASK-P1E4-04A: Conversations Schema
├── Dependencias: Epic 3 COMPLETO ✅
├── Bloquea: Message storage
└── Duración: 4h

TASK-P1E4-04B: Message Storage & Processing
├── Dependencias: TASK-P1E4-04A ✅
├── Bloquea: Chat functionality
└── Duración: 6h

TASK-P1E4-04C: Basic Analytics Implementation
├── Dependencias: TASK-P1E4-04B ✅
├── Bloquea: Dashboard metrics
└── Duración: 5h

TASK-P1E4-04D: Dashboard UI Implementation
├── Dependencias: TASK-P1E4-04C ✅
├── Bloquea: User interface
└── Duración: 8h
```

## Phase 2: RAG & Features (Mes 3-4)

### 🔒 **PREREQUISITO ABSOLUTO:** Phase 1 100% Completada

### Epic 1: RAG Foundation
```
TASK-P2E1-01A: pgvector Extension Setup
├── Dependencias: Phase 1 ✅
├── Bloquea: Vector operations
└── Duración: 3h

TASK-P2E1-01B: Document Upload System
├── Dependencias: TASK-P2E1-01A ✅
├── Bloquea: Knowledge base
└── Duración: 6h

TASK-P2E1-01C: Text Extraction Pipeline
├── Dependencias: TASK-P2E1-01B ✅
├── Bloquea: Document processing
└── Duración: 8h

TASK-P2E1-01D: Embedding Generation
├── Dependencias: TASK-P2E1-01C ✅
├── Bloquea: Vector search
└── Duración: 6h
```

### Epic 2: Knowledge Integration
```
TASK-P2E2-02A: Vector Similarity Search
├── Dependencias: Epic 1 (Phase 2) ✅
├── Bloquea: RAG queries
└── Duración: 5h

TASK-P2E2-02B: Context Injection System
├── Dependencias: TASK-P2E2-02A ✅
├── Bloquea: Enhanced responses
└── Duración: 6h

TASK-P2E2-02C: Knowledge UI Management
├── Dependencias: TASK-P2E2-02B ✅
├── Bloquea: Knowledge management
└── Duración: 7h
```

## Phase 3: HITL & Analytics (Mes 5-6)

### 🔒 **PREREQUISITO ABSOLUTO:** Phase 2 100% Completada

### Epic 1: HITL Foundation
```
TASK-P3E1-01A: HITL Schema & State Machine
├── Dependencias: Phase 2 ✅
├── Bloquea: Human handoff
└── Duración: 6h

TASK-P3E1-01B: Escalation Triggers
├── Dependencias: TASK-P3E1-01A ✅
├── Bloquea: Automatic escalation
└── Duración: 5h

TASK-P3E1-01C: Operator Assignment Logic
├── Dependencias: TASK-P3E1-01B ✅
├── Bloquea: HITL distribution
└── Duración: 6h
```

## Phase 4: Integration & Launch (Mes 7-8)

### 🔒 **PREREQUISITO ABSOLUTO:** Phase 3 100% Completada

## Validation Matrix

### Antes de Iniciar Cualquier Tarea:
```bash
# 1. Verificar dependencias
grep -A 5 "TASK-ID" Tasks/config/implementation-order.md

# 2. Confirmar estado en current.md
cat Tasks/current.md | grep "Estado.*Completada"

# 3. Validar orden de epic
# Epic N solo si Epic N-1 está 100% completada
```

### Criterios de "Completada"
Una tarea solo está ✅ **Completada** cuando:
- [ ] Todos los criterios de aceptación cumplidos
- [ ] Validación técnica ejecutada exitosamente  
- [ ] Tests específicos pasando (si aplica)
- [ ] Documentación actualizada
- [ ] current.md actualizado con nueva tarea activa

## Riesgos de No Seguir el Orden

### ❌ **Consecuencias de Saltar Dependencias:**
1. **Database Schema Incompleto** → RLS policies no funcionan
2. **Auth Sin Configurar** → Multi-tenancy roto
3. **APIs Sin Base de Datos** → Funcionalidad no operativa
4. **Frontend Sin Backend** → Componentes sin datos
5. **Integrations Sin Core** → Features dependientes fallan

### ✅ **Beneficios de Seguir el Orden:**
1. **Builds Siempre Funcionales** → No broken states
2. **Testing Incremental** → Validación continua
3. **Debugging Simplificado** → Scope limitado por tarea
4. **Progress Visible** → Features trabajando paso a paso
5. **Team Coordination** → Clear handoffs entre desarrolladores

## Emergency Procedures

### Si Una Tarea se Bloquea:
1. **NO** saltar a la siguiente tarea
2. **Documentar** el bloqueador específico en current.md
3. **Resolver** el bloqueador o encontrar workaround
4. **Actualizar** dependencies.md si el orden debe cambiar
5. **Justificar** cualquier cambio con razón técnica

### Si el Orden Debe Cambiar:
1. **Documentar** la razón técnica específica
2. **Actualizar** este archivo con el nuevo orden
3. **Validar** que las nuevas dependencias son correctas
4. **Comunicar** el cambio al equipo
5. **Monitorear** efectos del cambio en tareas posteriores