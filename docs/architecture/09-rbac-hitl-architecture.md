# NeurAnt - Arquitectura RBAC-HITL Integrada

## Resumen

Este documento especifica la arquitectura integrada del sistema RBAC (Control de Acceso Basado en Roles) con el módulo HITL (Human-in-the-Loop) de NeurAnt. Define la estructura jerárquica de roles, patrones de autorización, y flujos de transferencia de sesiones entre roles.

## Arquitectura de Componentes C4

### 1. Diagrama de Contexto - RBAC-HITL

```mermaid
C4Context
    title Diagrama de Contexto - Sistema RBAC-HITL NeurAnt

    Person(owner, "Owner", "Propietario de la empresa")
    Person(admin, "Admin", "Administrador de la empresa")
    Person(supervisor, "Supervisor", "Supervisor de chatbots específicos")
    Person(operador, "Operador", "Operador HITL asignado")
    Person(customer, "Cliente Final", "Usuario que interactúa con chatbots")

    System(neurAnt, "NeurAnt Platform", "Plataforma de chatbots con IA y RBAC-HITL integrado")

    System_Ext(supabase, "Supabase", "Autenticación y base de datos")
    System_Ext(n8n, "n8n", "Orquestación de workflows")
    System_Ext(ai, "OpenAI/Claude", "Servicios de IA")

    Rel(owner, neurAnt, "Gestiona empresa completa", "HTTPS")
    Rel(admin, neurAnt, "Administra usuarios y chatbots", "HTTPS")
    Rel(supervisor, neurAnt, "Configura chatbots asignados", "HTTPS")
    Rel(operador, neurAnt, "Atiende sesiones HITL", "HTTPS")
    Rel(customer, neurAnt, "Interactúa con chatbots", "HTTPS/WebSocket")

    Rel(neurAnt, supabase, "Autenticación y datos", "HTTPS")
    Rel(neurAnt, n8n, "Workflows de mensajería", "HTTPS")
    Rel(neurAnt, ai, "Procesamiento de IA", "HTTPS")
```

### 2. Diagrama de Contenedores - RBAC-HITL

```mermaid
C4Container
    title Diagrama de Contenedores - Arquitectura RBAC-HITL

    Person(users, "Usuarios", "Owner, Admin, Supervisor, Operador")
    Person(customers, "Clientes", "Usuarios finales de chatbots")

    Container_Boundary(c1, "NeurAnt Platform") {
        Container(webapp, "Web Application", "Next.js", "Interfaz de usuario con control de acceso por roles")
        Container(api, "API Gateway", "Next.js API Routes", "Gateway de APIs con middleware RBAC")
        Container(rbac, "RBAC Service", "TypeScript", "Servicio de autorización y gestión de permisos")
        Container(hitl, "HITL Service", "TypeScript", "Servicio de gestión de sesiones humanas")
        Container(transfer, "Transfer Service", "TypeScript", "Servicio de transferencias entre roles")
        Container(realtime, "Real-time Engine", "Supabase Realtime", "Motor de tiempo real para HITL")
        Container(audit, "Audit Service", "TypeScript", "Servicio de auditoría y logging")
    }

    ContainerDb(db, "Database", "PostgreSQL", "Base de datos con RLS para multi-tenancy")
    Container_Ext(auth, "Auth Service", "Supabase Auth", "Autenticación y gestión de sesiones")
    Container_Ext(n8n, "n8n Workflows", "Node.js", "Orquestación de mensajería externa")

    Rel(users, webapp, "Administra sistema según rol", "HTTPS")
    Rel(customers, webapp, "Inicia conversaciones", "HTTPS")
    
    Rel(webapp, api, "Llamadas API autenticadas", "HTTPS")
    Rel(api, rbac, "Verifica permisos", "Internal")
    Rel(api, hitl, "Gestiona sesiones HITL", "Internal")
    Rel(api, transfer, "Procesa transferencias", "Internal")
    
    Rel(rbac, db, "Consulta permisos y asignaciones", "SQL")
    Rel(hitl, realtime, "Notificaciones tiempo real", "WebSocket")
    Rel(transfer, audit, "Registra transferencias", "Internal")
    Rel(audit, db, "Persiste logs de auditoría", "SQL")
    
    Rel(api, auth, "Valida tokens JWT", "HTTPS")
    Rel(hitl, n8n, "Envía mensajes a canales externos", "HTTPS")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

### 3. Diagrama de Componentes - Servicio RBAC

```mermaid
C4Component
    title Diagrama de Componentes - Servicio RBAC

    Container_Boundary(c1, "RBAC Service") {
        Component(authz, "Authorization Engine", "TypeScript", "Motor principal de autorización")
        Component(hierarchy, "Role Hierarchy Manager", "TypeScript", "Gestión de jerarquía de roles")
        Component(permissions, "Permission Calculator", "TypeScript", "Cálculo de permisos por rol")
        Component(assignments, "Assignment Manager", "TypeScript", "Gestión de asignaciones supervisor-chatbot")
        Component(cache, "Permission Cache", "Redis/Memory", "Cache de permisos para rendimiento")
        Component(validator, "Policy Validator", "TypeScript", "Validación de políticas de acceso")
    }

    Container_Boundary(c2, "HITL Transfer Service") {
        Component(transfer_mgr, "Transfer Manager", "TypeScript", "Gestión de transferencias HITL")
        Component(notification, "Notification Engine", "TypeScript", "Notificaciones de transferencias")
        Component(workflow, "Transfer Workflow", "TypeScript", "Estado y flujo de transferencias")
    }

    ContainerDb(db, "Database", "PostgreSQL", "Datos de usuarios, roles y sesiones")
    Container(realtime, "Realtime Service", "Supabase", "Notificaciones tiempo real")
    Container(audit, "Audit Service", "TypeScript", "Registro de auditoría")

    Rel(authz, hierarchy, "Consulta jerarquía", "Internal")
    Rel(authz, permissions, "Calcula permisos", "Internal")
    Rel(authz, cache, "Cache/recupera permisos", "Internal")
    Rel(permissions, assignments, "Verifica asignaciones", "Internal")
    Rel(validator, db, "Valida políticas RLS", "SQL")

    Rel(transfer_mgr, workflow, "Gestiona estado", "Internal")
    Rel(transfer_mgr, notification, "Envía notificaciones", "Internal")
    Rel(notification, realtime, "Push notifications", "WebSocket")
    
    Rel(authz, audit, "Log decisiones autorización", "Internal")
    Rel(transfer_mgr, audit, "Log transferencias", "Internal")

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

## Flujos de Transferencia HITL por Roles

### 1. Flujo Completo de Escalamiento HITL

```mermaid
sequenceDiagram
    participant Cliente as Cliente Final
    participant Bot as Chatbot IA
    participant Operador as Operador
    participant Supervisor as Supervisor
    participant Admin as Admin
    participant Sistema as Sistema RBAC-HITL

    Cliente->>Bot: Mensaje "Quiero hablar con un humano"
    Bot->>Sistema: Activar escalamiento HITL
    Sistema->>Sistema: Buscar operador disponible (chatbot asignado)
    
    alt Operador disponible
        Sistema->>Operador: Notificación nueva sesión
        Operador->>Sistema: Acepta sesión
        Sistema->>Cliente: "Te conectamos con un operador"
        
        loop Conversación HITL
            Cliente->>Operador: Mensaje
            Operador->>Cliente: Respuesta
        end
        
        alt Operador puede resolver
            Operador->>Sistema: Marcar como resuelto
            Sistema->>Cliente: "Sesión resuelta, bot reactivado"
        else Operador necesita escalamiento
            Operador->>Sistema: Solicitar transferencia a Supervisor
            Sistema->>Supervisor: Notificación transferencia pendiente
            
            alt Supervisor acepta
                Supervisor->>Sistema: Acepta transferencia
                Sistema->>Operador: Transferencia confirmada
                Sistema->>Cliente: "Te hemos conectado con un supervisor"
                
                loop Conversación con Supervisor
                    Cliente->>Supervisor: Mensaje
                    Supervisor->>Cliente: Respuesta
                end
                
                alt Supervisor resuelve
                    Supervisor->>Sistema: Marcar como resuelto
                else Supervisor escala a Admin
                    Supervisor->>Sistema: Transferir a Admin
                    Sistema->>Admin: Notificación transferencia
                    Admin->>Sistema: Acepta/Rechaza transferencia
                end
            else Supervisor rechaza
                Sistema->>Operador: Transferencia rechazada
                Sistema->>Operador: Continuar atendiendo o buscar Admin
            end
        end
    else No hay operador disponible
        Sistema->>Sistema: Buscar Supervisor disponible
        alt Supervisor disponible
            Sistema->>Supervisor: Asignar sesión directamente
        else No hay Supervisor
            Sistema->>Admin: Asignar a Admin disponible
        end
    end
```

### 2. Matriz de Transferencias Permitidas

```mermaid
graph LR
    subgraph "Roles NeurAnt"
        Operador[Operador]
        Supervisor[Supervisor]
        Admin[Admin]
        Owner[Owner]
    end
    
    subgraph "Transferencias Permitidas"
        Operador -->|"Puede transferir a"| Supervisor
        Operador -->|"Puede transferir a"| Admin
        Operador -->|"Puede transferir a"| Owner
        
        Supervisor -->|"Puede transferir a"| Admin
        Supervisor -->|"Puede transferir a"| Owner
        
        Admin -->|"Puede transferir a"| Owner
    end
    
    subgraph "Resolución de Transferencias"
        Supervisor -->|"Puede aceptar/rechazar de"| Operador
        Admin -->|"Puede aceptar/rechazar de"| Operador
        Admin -->|"Puede aceptar/rechazar de"| Supervisor
        Owner -->|"Puede aceptar/rechazar de"| Admin
    end
```

### 3. Estados de Sesión HITL Extendidos

```mermaid
stateDiagram-v2
    [*] --> BotActivo: Conversación iniciada
    BotActivo --> HITLPendiente: Usuario solicita humano
    
    HITLPendiente --> HITLAsignado: Operador acepta sesión
    HITLPendiente --> HITLSupervisor: No hay operador, supervisor acepta
    HITLPendiente --> HITLAdmin: No hay supervisor, admin acepta
    
    HITLAsignado --> TransferenciaPendiente: Operador solicita transferencia
    TransferenciaPendiente --> HITLSupervisor: Supervisor acepta
    TransferenciaPendiente --> HITLAdmin: Admin acepta
    TransferenciaPendiente --> HITLAsignado: Transferencia rechazada
    
    HITLSupervisor --> TransferenciaPendiente: Supervisor solicita escalamiento
    HITLAdmin --> TransferenciaPendiente: Admin solicita escalamiento a Owner
    
    HITLAsignado --> Resuelto: Operador resuelve
    HITLSupervisor --> Resuelto: Supervisor resuelve
    HITLAdmin --> Resuelto: Admin resuelve
    
    Resuelto --> BotActivo: Handoff exitoso a bot
    Resuelto --> [*]: Conversación terminada
    
    HITLAsignado --> Abandonado: Timeout sin respuesta
    HITLSupervisor --> Abandonado: Timeout sin respuesta
    TransferenciaPendiente --> Abandonado: Timeout sin resolución
    
    Abandonado --> BotActivo: Reactivación automática
    Abandonado --> [*]: Conversación perdida
```

## Arquitectura de Asignaciones y Scope

### 1. Modelo de Asignación Jerárquica

```mermaid
erDiagram
    COMPANIES ||--o{ USERS : "employs"
    COMPANIES ||--o{ CHATBOTS : "owns"
    
    USERS ||--o{ CHATBOT_SUPERVISORS : "supervises"
    CHATBOT_SUPERVISORS ||--|| CHATBOTS : "assigned_to"
    
    USERS ||--o{ CHATBOT_OPERATORS : "operates"
    CHATBOT_OPERATORS ||--|| CHATBOTS : "assigned_to"
    CHATBOT_OPERATORS ||--|| USERS : "assigned_by_supervisor"
    
    CHATBOTS ||--o{ CONVERSATIONS : "handles"
    CONVERSATIONS ||--o{ HITL_SESSIONS : "escalates_to"
    HITL_SESSIONS ||--o{ HITL_TRANSFERS : "generates"
    
    COMPANIES {
        uuid id PK
        string name
        enum subscription_plan
    }
    
    USERS {
        uuid id PK
        uuid company_id FK
        enum role
        boolean is_owner
        boolean is_active
    }
    
    CHATBOTS {
        uuid id PK
        uuid company_id FK
        string name
        boolean is_active
    }
    
    CHATBOT_SUPERVISORS {
        uuid id PK
        uuid chatbot_id FK "UNIQUE - Un supervisor por chatbot"
        uuid supervisor_id FK
        uuid assigned_by FK
        timestamp assigned_at
    }
    
    CHATBOT_OPERATORS {
        uuid id PK
        uuid chatbot_id FK
        uuid operator_id FK
        uuid assigned_by_supervisor FK
        timestamp assigned_at
        boolean is_active
    }
    
    CONVERSATIONS {
        uuid id PK
        uuid company_id FK
        uuid chatbot_id FK
        string end_user_id
        boolean is_hitl_active
        uuid assigned_operator_id FK
    }
    
    HITL_SESSIONS {
        uuid id PK
        uuid conversation_id FK
        uuid assigned_operator_id FK
        uuid current_handler_id FK
        boolean transfer_pending
        enum status
    }
    
    HITL_TRANSFERS {
        uuid id PK
        uuid session_id FK
        uuid from_user_id FK
        uuid to_user_id FK
        enum status
        text transfer_reason
        timestamp requested_at
        timestamp resolved_at
    }
```

### 2. Scope de Acceso por Rol

```mermaid
graph TB
    subgraph "Owner Scope"
        Owner[Owner] --> OwnerScope[Empresa Completa]
        OwnerScope --> AllChatbots[Todos los Chatbots]
        OwnerScope --> AllUsers[Todos los Usuarios]
        OwnerScope --> AllHITL[Todas las Sesiones HITL]
        OwnerScope --> Billing[Facturación y Planes]
    end
    
    subgraph "Admin Scope"
        Admin[Admin] --> AdminScope[Empresa Completa - Facturación]
        AdminScope --> AllChatbotsAdmin[Todos los Chatbots]
        AdminScope --> AllUsersAdmin[Todos los Usuarios - Owner]
        AdminScope --> AllHITLAdmin[Todas las Sesiones HITL]
    end
    
    subgraph "Supervisor Scope"
        Supervisor[Supervisor] --> SupervisorScope[Chatbots Asignados]
        SupervisorScope --> AssignedChatbots[Solo Chatbots Asignados]
        SupervisorScope --> AssignedOperators[Operadores de sus Chatbots]
        SupervisorScope --> AssignedHITL[HITL de Chatbots Asignados]
    end
    
    subgraph "Operador Scope"
        Operador[Operador] --> OperadorScope[Sesiones Asignadas]
        OperadorScope --> HITLSessions[Solo Sesiones HITL Asignadas]
        OperadorScope --> ReadOnlyChatbots[Vista Lectura Chatbots Asignados]
    end
```

## Patrones de Autorización

### 1. Patrón de Herencia Jerárquica

```mermaid
graph TD
    subgraph "Herencia de Permisos"
        OwnerPerms[Owner Permissions] --> AdminPerms[Admin Permissions]
        AdminPerms --> SupervisorPerms[Supervisor Permissions]
        SupervisorPerms --> OperadorPerms[Operador Permissions]
    end
    
    subgraph "Permisos Únicos por Rol"
        OwnerOnly[Gestión Facturación<br/>Asignación Admins<br/>Auditoría Global]
        AdminOnly[Creación Chatbots<br/>Gestión Supervisores<br/>Configuración Empresa]
        SupervisorOnly[Configuración Chatbots Asignados<br/>Asignación Operadores<br/>Gestión Documentos]
        OperadorOnly[Atención HITL<br/>Transferencias a Superior]
    end
    
    OwnerPerms -.-> OwnerOnly
    AdminPerms -.-> AdminOnly
    SupervisorPerms -.-> SupervisorOnly
    OperadorPerms -.-> OperadorOnly
```

### 2. Patrón de Verificación de Permisos

```mermaid
graph LR
    Request[API Request] --> AuthCheck{Usuario Autenticado?}
    AuthCheck -->|No| Deny[403 Forbidden]
    AuthCheck -->|Sí| RoleCheck{Rol Válido?}
    
    RoleCheck -->|No| Deny
    RoleCheck -->|Sí| ScopeCheck{Dentro del Scope?}
    
    ScopeCheck -->|No| Deny
    ScopeCheck -->|Sí| PermissionCheck{Permiso Específico?}
    
    PermissionCheck -->|No| Deny
    PermissionCheck -->|Sí| ResourceCheck{Acceso al Recurso?}
    
    ResourceCheck -->|No| Deny
    ResourceCheck -->|Sí| Allow[200 OK + Action]
    
    Allow --> AuditLog[Log Auditoría]
    Deny --> AuditLog
```

## Políticas de Seguridad RLS Extendidas

### 1. Política de Acceso a Chatbots por Rol

```sql
-- Política conceptual para acceso a chatbots
CREATE POLICY chatbot_access_by_role ON chatbots
FOR ALL USING (
  CASE get_user_role(auth.uid())
    WHEN 'owner' THEN company_id = get_user_company_id(auth.uid())
    WHEN 'administrador' THEN company_id = get_user_company_id(auth.uid())
    WHEN 'supervisor' THEN 
      id IN (
        SELECT chatbot_id FROM chatbot_supervisors 
        WHERE supervisor_id = get_current_user_id(auth.uid())
      )
    WHEN 'operador' THEN 
      id IN (
        SELECT chatbot_id FROM chatbot_operators 
        WHERE operator_id = get_current_user_id(auth.uid()) 
        AND is_active = true
      )
    ELSE false
  END
);
```

### 2. Política de Transferencias HITL

```sql
-- Política conceptual para transferencias HITL
CREATE POLICY hitl_transfer_access ON hitl_transfers
FOR ALL USING (
  CASE get_user_role(auth.uid())
    WHEN 'owner' THEN 
      session_id IN (
        SELECT id FROM hitl_sessions 
        WHERE company_id = get_user_company_id(auth.uid())
      )
    WHEN 'administrador' THEN 
      session_id IN (
        SELECT id FROM hitl_sessions 
        WHERE company_id = get_user_company_id(auth.uid())
      )
    WHEN 'supervisor' THEN 
      (from_user_id = get_current_user_id(auth.uid()) OR 
       to_user_id = get_current_user_id(auth.uid()) OR
       session_id IN (
         SELECT hs.id FROM hitl_sessions hs
         JOIN conversations c ON hs.conversation_id = c.id
         JOIN chatbot_supervisors cs ON c.chatbot_id = cs.chatbot_id
         WHERE cs.supervisor_id = get_current_user_id(auth.uid())
       ))
    WHEN 'operador' THEN 
      (from_user_id = get_current_user_id(auth.uid()) OR 
       to_user_id = get_current_user_id(auth.uid()))
    ELSE false
  END
);
```

## Métricas y Observabilidad RBAC-HITL

### 1. Dashboard de Métricas por Rol

```mermaid
graph TB
    subgraph "Métricas Owner/Admin"
        TotalUsers[Total Usuarios por Rol]
        TotalChatbots[Total Chatbots Activos]
        HITLVolume[Volumen HITL Global]
        TransferRate[Tasa de Transferencias]
        ResolutionTime[Tiempo Resolución Promedio]
        SecurityEvents[Eventos de Seguridad]
    end
    
    subgraph "Métricas Supervisor"
        AssignedBots[Chatbots Asignados]
        TeamOperators[Operadores en Equipo]
        HITLAssigned[HITL de Chatbots Asignados]
        TransferIn[Transferencias Recibidas]
        TransferOut[Transferencias Enviadas]
        TeamPerformance[Performance del Equipo]
    end
    
    subgraph "Métricas Operador"
        ActiveSessions[Sesiones Activas]
        QueuePosition[Posición en Cola]
        ResponseTime[Tiempo de Respuesta]
        TransfersMade[Transferencias Realizadas]
        SessionsResolved[Sesiones Resueltas]
        CustomerSat[Satisfacción Cliente]
    end
```

### 2. Alertas de Seguridad RBAC

```mermaid
graph LR
    subgraph "Eventos de Seguridad"
        FailedAuth[Intentos Fallidos<br/>de Autenticación]
        PrivEscalation[Intentos de Escalación<br/>de Privilegios]
        UnauthorizedAccess[Acceso No Autorizado<br/>a Recursos]
        SuspiciousTransfer[Transferencias<br/>Sospechosas]
        RoleViolation[Violaciones de<br/>Separación de Roles]
    end
    
    subgraph "Respuestas Automáticas"
        Alert[Alerta Inmediata]
        Block[Bloqueo Temporal]
        Log[Log Detallado]
        Escalate[Escalamiento a Admin]
    end
    
    FailedAuth --> Alert
    PrivEscalation --> Block
    UnauthorizedAccess --> Log
    SuspiciousTransfer --> Escalate
    RoleViolation --> Alert
```

## Integración con Módulos Existentes

### 1. Integración con Sistema de Invitaciones

```mermaid
sequenceDiagram
    participant Owner as Owner/Admin
    participant Sistema as Sistema RBAC
    participant InviteService as Servicio Invitaciones
    participant NewUser as Nuevo Usuario
    participant EmailService as Servicio Email

    Owner->>Sistema: Invitar nuevo usuario con rol específico
    Sistema->>Sistema: Validar permisos para crear rol
    Sistema->>InviteService: Crear invitación con rol asignado
    InviteService->>EmailService: Enviar email de invitación
    EmailService->>NewUser: Email con link y rol asignado
    
    NewUser->>InviteService: Acepta invitación
    InviteService->>Sistema: Activar usuario con rol específico
    Sistema->>Sistema: Asignar permisos según rol
    
    alt Rol es Supervisor
        Sistema->>Owner: Solicitar asignación de chatbots
        Owner->>Sistema: Asignar chatbots específicos
    else Rol es Operador
        Sistema->>Sistema: Awaiting supervisor assignment
    end
```

### 2. Integración con Analytics y Reportes

```mermaid
graph TB
    subgraph "Fuentes de Datos RBAC"
        UserActions[Acciones de Usuario]
        HITLSessions[Sesiones HITL]
        Transfers[Transferencias]
        PermissionChecks[Verificaciones de Permisos]
        SecurityEvents[Eventos de Seguridad]
    end
    
    subgraph "Analytics Engine"
        DataAggregator[Agregador de Datos]
        RoleAnalytics[Analytics por Rol]
        PerformanceMetrics[Métricas de Performance]
        SecurityAnalytics[Analytics de Seguridad]
    end
    
    subgraph "Reportes por Rol"
        OwnerReports[Reportes Owner:<br/>- Seguridad Global<br/>- Performance General<br/>- Uso de Roles]
        AdminReports[Reportes Admin:<br/>- Gestión Equipos<br/>- HITL Analytics<br/>- Asignaciones]
        SupervisorReports[Reportes Supervisor:<br/>- Performance Equipo<br/>- HITL Chatbots<br/>- Transferencias]
        OperatorReports[Reportes Operador:<br/>- Performance Personal<br/>- Sesiones Atendidas<br/>- Métricas HITL]
    end
    
    UserActions --> DataAggregator
    HITLSessions --> DataAggregator
    Transfers --> DataAggregator
    PermissionChecks --> DataAggregator
    SecurityEvents --> DataAggregator
    
    DataAggregator --> RoleAnalytics
    DataAggregator --> PerformanceMetrics
    DataAggregator --> SecurityAnalytics
    
    RoleAnalytics --> OwnerReports
    PerformanceMetrics --> AdminReports
    SecurityAnalytics --> SupervisorReports
    RoleAnalytics --> OperatorReports
```

## Próximos Pasos de Implementación

### Fase 1: Foundation (Sprint 1-2)
1. ✅ Implementar jerarquía de roles en base de datos
2. ✅ Crear motor de permisos jerárquico
3. ✅ Actualizar políticas RLS para nuevos flujos
4. ✅ Sistema básico de auditoría RBAC

### Fase 2: Asignaciones (Sprint 3)
1. ⏳ Tabla `chatbot_supervisors` con constraint único
2. ⏳ API de gestión de asignaciones supervisor-chatbot
3. ⏳ API de gestión de asignaciones operador por supervisor
4. ⏳ Validaciones de scope en todas las operaciones

### Fase 3: Transferencias HITL (Sprint 4-5)
1. ⏳ Sistema completo de transferencias entre roles
2. ⏳ Notificaciones real-time de transferencias
3. ⏳ Estados de sesión extendidos para transferencias
4. ⏳ Dashboard de gestión de transferencias

### Fase 4: UI y Optimización (Sprint 6)
1. ⏳ Interfaces de usuario adaptadas por rol
2. ⏳ Cache de permisos para optimización
3. ⏳ Testing exhaustivo de seguridad
4. ⏳ Documentación de usuario final

---

*Esta arquitectura RBAC-HITL integrada proporciona la base para un control de acceso granular y flujos de escalamiento humano eficientes en la plataforma NeurAnt.*