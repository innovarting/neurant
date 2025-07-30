# NeurAnt - Resumen de Arquitectura del Sistema

## Resumen Ejecutivo

NeurAnt es una plataforma SaaS multi-tenant que permite a las empresas crear, desplegar y administrar chatbots con inteligencia artificial a través de múltiples canales de mensajería. El sistema está construido sobre un patrón de **Base de Datos Compartida Multi-tenant** con **Row Level Security (RLS)** para aislamiento de datos y un enfoque de **Dominio Único + Contexto** para identificación de tenants.

## Principios Arquitectónicos

### 1. **Multi-tenancy Primero**
- Cada componente diseñado con aislamiento de tenant en mente
- Código base único sirviendo múltiples clientes
- Infraestructura compartida con separación lógica

### 2. **Seguridad por Diseño**
- Row Level Security (RLS) en la capa de base de datos
- Control de acceso basado en roles (RBAC) en todo el sistema
- Arquitectura de confianza cero para componentes internos

### 3. **Escalabilidad y Rendimiento**
- Capacidades de escalado horizontal
- Compartimiento eficiente de recursos entre tenants
- Aislamiento de rendimiento para prevenir problemas de vecino ruidoso

### 4. **Experiencia del Desarrollador**
- Clara separación de responsabilidades
- Interfaces y contratos con tipado seguro
- Estrategias integrales de testing

## Modelo de Arquitectura C4

### Nivel 1: Diagrama de Contexto del Sistema

```mermaid
C4Context
    title Diagrama de Contexto del Sistema - NeurAnt

    Person(owner, "Owner", "Propietario con control total de la empresa")
    Person(admin, "Admin", "Administrador con gestión completa excepto facturación")
    Person(supervisor, "Supervisor", "Supervisor de chatbots específicos asignados")
    Person(operator, "Operador", "Operador HITL para sesiones asignadas")
    Person(enduser, "Usuarios Finales", "Clientes que interactúan con chatbots")

    System(neurant, "Plataforma NeurAnt", "SaaS multi-tenant para gestión de chatbots con IA")

    System_Ext(whatsapp, "WhatsApp Business API", "Plataforma de mensajería")
    System_Ext(telegram, "Telegram Bot API", "Plataforma de mensajería") 
    System_Ext(slack, "Slack API", "Plataforma de mensajería")
    System_Ext(n8n, "n8n Automation", "Plataforma de automatización de flujos")
    System_Ext(openai, "OpenAI API", "Servicios de IA/ML para respuestas de chat")
    System_Ext(email, "Servicio de Email", "Entrega de emails transaccionales")

    Rel(owner, neurant, "Gestiona empresa completa, facturación y roles")
    Rel(admin, neurant, "Gestiona chatbots, usuarios y configuraciones")
    Rel(supervisor, neurant, "Configura chatbots asignados y gestiona operadores")
    Rel(operator, neurant, "Atiende sesiones HITL asignadas")
    
    Rel(enduser, whatsapp, "Envía mensajes")
    Rel(enduser, telegram, "Envía mensajes") 
    Rel(enduser, slack, "Envía mensajes")
    
    Rel(neurant, whatsapp, "Recibe/envía mensajes", "HTTPS/Webhooks")
    Rel(neurant, telegram, "Recibe/envía mensajes", "HTTPS/Webhooks")
    Rel(neurant, slack, "Recibe/envía mensajes", "HTTPS/Webhooks")
    Rel(neurant, n8n, "Activa automatizaciones", "HTTPS/API")
    Rel(neurant, openai, "Genera respuestas de IA", "HTTPS/API")
    Rel(neurant, email, "Envía notificaciones", "SMTP/API")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="2")
```

### Nivel 2: Diagrama de Contenedores

```mermaid
C4Container
    title Diagrama de Contenedores - Plataforma NeurAnt

    Person(users, "Usuarios de la Plataforma", "Owner, Admins, Supervisores, Operadores con roles jerárquicos")
    Person(endusers, "Usuarios Finales", "Clientes que usan chatbots")

    System_Boundary(neurant, "Plataforma NeurAnt") {
        Container(webapp, "Aplicación Web", "Next.js/React", "Interfaz web multi-tenant para gestión de chatbots")
        Container(api, "Gateway API", "Next.js API Routes", "Maneja todas las peticiones API con contexto de tenant")
        Container(auth, "Servicio de Autenticación", "Supabase Auth", "Autenticación de usuarios y gestión de sesiones")
        Container(db, "Base de Datos", "PostgreSQL/Supabase", "Almacena todos los datos de aplicación con RLS")
        Container(storage, "Almacenamiento de Archivos", "Supabase Storage", "Almacena documentos y medios de chatbots")
        Container(realtime, "Motor en Tiempo Real", "Supabase Realtime", "Actualizaciones en vivo para conversaciones y notificaciones")
        Container(webhook, "Manejador de Webhooks", "Next.js API", "Procesa mensajes entrantes de canales")
        Container(ai, "Servicio de Procesamiento IA", "Background Jobs", "Maneja generación de respuestas IA y procesamiento de documentos")
    }

    System_Ext(channels, "Canales de Mensajería", "WhatsApp, Telegram, Slack")
    System_Ext(external, "Servicios Externos", "OpenAI, n8n, Email")

    Rel(users, webapp, "Usa", "HTTPS")
    Rel(webapp, api, "Hace llamadas API", "HTTPS/JSON")
    Rel(webapp, auth, "Se autentica", "HTTPS")
    Rel(webapp, realtime, "Se suscribe", "WebSocket")
    
    Rel(api, db, "Lee/escribe datos", "SQL with RLS")
    Rel(api, storage, "Gestiona archivos", "HTTPS")
    Rel(api, ai, "Encola trabajos", "Background Queue")
    
    Rel(channels, webhook, "Envía mensajes", "HTTPS/Webhooks")
    Rel(webhook, api, "Procesa mensajes", "Internal API")
    Rel(ai, external, "Peticiones IA", "HTTPS/API")
    
    Rel(endusers, channels, "Interactúa", "Apps Nativas")

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

### Nivel 3: Diagrama de Componentes - API Principal

```mermaid
C4Component
    title Diagrama de Componentes - Capa API Principal

    Container(webapp, "Aplicación Web", "Next.js/React", "Interfaz frontend")
    Container(db, "Base de Datos", "PostgreSQL", "Persistencia de datos")
    Container(external, "Servicios Externos", "OpenAI, Canales", "Integraciones terceros")

    System_Boundary(api, "Gateway API") {
        Component(auth_mw, "Middleware Autenticación", "Next.js Middleware", "Valida tokens JWT y sesiones de usuario")
        Component(tenant_mw, "Middleware Contexto Tenant", "Custom Middleware", "Carga contexto de tenant desde usuario autenticado")
        Component(rbac_mw, "Middleware RBAC", "Custom Middleware", "Aplica control de acceso basado en roles")
        
        Component(chatbot_api, "API Chatbots", "API Routes", "Operaciones CRUD para chatbots")
        Component(conversation_api, "API Conversaciones", "API Routes", "Gestiona conversaciones y mensajes")
        Component(user_api, "API Gestión Usuarios", "API Routes", "Gestión de usuarios e invitaciones")
        Component(company_api, "API Empresa", "API Routes", "Configuración y ajustes de empresa")
        Component(integration_api, "API Integraciones", "API Routes", "Integraciones con servicios externos")
        
        Component(message_processor, "Procesador Mensajes", "Service Layer", "Procesa mensajes entrantes")
        Component(ai_service, "Servicio IA", "Service Layer", "Maneja generación de respuestas IA")
        Component(permission_service, "Servicio Permisos", "Service Layer", "Calcula permisos de usuario")
        Component(audit_service, "Servicio Auditoría", "Service Layer", "Registra eventos de seguridad")
    }

    Rel(webapp, auth_mw, "Petición API", "HTTPS")
    Rel(auth_mw, tenant_mw, "Petición Autenticada")
    Rel(tenant_mw, rbac_mw, "Petición + Contexto Tenant")
    
    Rel(rbac_mw, chatbot_api, "Petición Autorizada")
    Rel(rbac_mw, conversation_api, "Petición Autorizada")
    Rel(rbac_mw, user_api, "Petición Autorizada")
    Rel(rbac_mw, company_api, "Petición Autorizada")
    Rel(rbac_mw, integration_api, "Petición Autorizada")
    
    Rel(chatbot_api, db, "Consultas SQL")
    Rel(conversation_api, message_processor, "Procesar Mensaje")
    Rel(message_processor, ai_service, "Generar Respuesta")
    Rel(ai_service, external, "Llamadas API IA")
    
    Rel(user_api, permission_service, "Calcular Permisos")
    Rel(permission_service, audit_service, "Registrar Eventos")
    Rel(audit_service, db, "Almacenar Logs Auditoría")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

## Capacidades del Sistema

### 1. **Gestión Multi-Tenant**
- **Aislamiento de Tenants**: Segregación completa de datos usando PostgreSQL RLS
- **Compartimiento de Recursos**: Utilización eficiente de infraestructura entre tenants
- **Contexto de Tenant**: Identificación automática de tenant a través de contexto de usuario autenticado

### 2. **Gestión del Ciclo de Vida de Chatbots**
- **Creación y Configuración**: Configuración de chatbots basada en plantillas con presets específicos por industria
- **Entrenamiento y Base de Conocimiento**: Carga y procesamiento de documentos para respuestas basadas en RAG
- **Integración de Canales**: Despliegue multi-canal (WhatsApp, Telegram, Slack)
- **Monitoreo de Rendimiento**: Analíticas en tiempo real y seguimiento de conversaciones

### 3. **Gestión de Conversaciones**
- **Respuestas IA-First**: Manejo inteligente de conversaciones potenciado por OpenAI
- **Humano-en-el-Bucle (HITL)**: Escalación transparente a operadores humanos
- **Preservación de Contexto**: Gestión de estado de conversación a través de interacciones entre canales
- **Actualizaciones en Tiempo Real**: Monitoreo en vivo de conversaciones y notificaciones

### 4. **Gestión de Usuarios y Acceso**
- **Control de Acceso Basado en Roles**: Jerarquía Propietario → Administrador → Supervisor → Operador
- **Onboarding Auto-servicio**: Configuración de empresa y registro de usuario sin fricción
- **Colaboración de Equipo**: Sistema de invitación de usuarios con límites basados en plan
- **Gestión de Permisos**: Permisos granulares basados en roles de usuario

### 5. **Integración y Automatización**
- **Integraciones Externas**: Automatización de flujos de trabajo n8n para integración de procesos de negocio
- **Diseño API-First**: APIs RESTful para integración con sistemas de terceros
- **Gestión de Webhooks**: Procesamiento de eventos en tiempo real desde plataformas de mensajería
- **Sincronización de Datos**: Flujo de datos bidireccional con sistemas externos

## Atributos de Calidad

### 1. **Escalabilidad**
- **Escalado Horizontal**: Diseño de aplicación sin estado para distribución con balanceador de carga
- **Optimización de Base de Datos**: Indexación eficiente y patrones de consulta para datos multi-tenant
- **Estrategia de Caché**: Caché multi-capa para datos de tenant frecuentemente accedidos
- **Procesamiento en Background**: Procesamiento asíncrono de trabajos para operaciones de IA y documentos

### 2. **Seguridad**
- **Aislamiento de Datos**: Row Level Security asegurando cero acceso de datos entre tenants
- **Autenticación**: Autenticación basada en JWT con integración Supabase Auth
- **Autorización**: RBAC fino con permisos conscientes del contexto
- **Rastro de Auditoría**: Registro completo de todos los eventos relevantes para seguridad

### 3. **Confiabilidad**
- **Manejo de Errores**: Degradación elegante y límites de error integrales
- **Consistencia de Datos**: Transacciones ACID para operaciones críticas del negocio
- **Estrategia de Backup**: Backups automatizados con recuperación point-in-time
- **Monitoreo**: Verificaciones de salud, métricas y alertas para todos los componentes del sistema

### 4. **Rendimiento**
- **Tiempo de Respuesta**: < 200ms tiempos de respuesta API para operaciones estándar
- **Throughput**: Soporte para 1000+ conversaciones concurrentes por tenant
- **Eficiencia de Recursos**: Consultas de base de datos optimizadas con indexación apropiada
- **Integración CDN**: Optimización de entrega de assets estáticos

### 5. **Usabilidad**
- **Interfaz Intuitiva**: Interfaz web limpia y responsiva con patrones UX modernos
- **Capacidades de Auto-servicio**: Curva de aprendizaje mínima para nuevos usuarios
- **Revelación Progresiva**: Complejidad de características revelada basada en necesidades del usuario
- **Responsividad Móvil**: Funcionalidad completa en todos los tipos de dispositivos

## Stack Tecnológico

### **Capa Frontend**
- **Framework**: Next.js 14 con App Router
- **Librería UI**: React 18 con TypeScript
- **Estilos**: Tailwind CSS con componentes shadcn/ui
- **Gestión de Estado**: React Context + TanStack Query
- **Formularios**: React Hook Form con validación Zod

### **Capa Backend**
- **Runtime**: Node.js con Next.js API Routes
- **Base de Datos**: PostgreSQL con Supabase
- **Autenticación**: Supabase Auth (basado en JWT)
- **Tiempo Real**: Supabase Realtime (WebSocket)
- **Almacenamiento de Archivos**: Supabase Storage

### **Capa de Integración**
- **IA/ML**: OpenAI GPT-4 API
- **Mensajería**: WhatsApp Business API, Telegram Bot API, Slack API
- **Automatización**: n8n para integraciones de flujo de trabajo
- **Email**: Servicio de email transaccional (Resend/SendGrid)
- **Monitoreo**: Monitoreo de rendimiento de aplicación

### **Capa de Infraestructura**
- **Hosting**: Vercel para hosting de aplicación
- **Base de Datos**: PostgreSQL gestionado por Supabase
- **CDN**: Vercel Edge Network
- **Seguridad**: Características de seguridad integradas de Supabase
- **Monitoreo**: Stack de observabilidad integrado

## Arquitectura de Despliegue

### **Ambiente de Producción**
```mermaid
graph TB
    subgraph "Capa Edge"
        CDN[Vercel Edge Network]
        LB[Balanceador de Carga]
    end
    
    subgraph "Capa de Aplicación"
        APP1[Instancia Next.js 1]
        APP2[Instancia Next.js 2]
        APP3[Instancia Next.js N]
    end
    
    subgraph "Capa de Datos"
        DB[(Supabase PostgreSQL)]
        STORAGE[(Supabase Storage)]
        CACHE[(Redis Cache)]
    end
    
    subgraph "Servicios Externos"
        OPENAI[OpenAI API]
        CHANNELS[Canales de Mensajería]
        EMAIL[Servicio de Email]
    end
    
    CDN --> LB
    LB --> APP1
    LB --> APP2
    LB --> APP3
    
    APP1 --> DB
    APP1 --> STORAGE
    APP1 --> CACHE
    
    APP2 --> DB
    APP2 --> STORAGE  
    APP2 --> CACHE
    
    APP3 --> DB
    APP3 --> STORAGE
    APP3 --> CACHE
    
    APP1 --> OPENAI
    APP1 --> CHANNELS
    APP1 --> EMAIL
```

## Objetivos de Rendimiento

### **Objetivos de Tiempo de Respuesta**
- **Interfaz Web**: < 100ms para cargas de página, < 50ms para llamadas API
- **Respuestas de Chatbot**: < 2 segundos end-to-end (incluyendo procesamiento IA)
- **Actualizaciones en Tiempo Real**: < 500ms para actualizaciones de conversación
- **Carga de Archivos**: < 5 segundos para procesamiento de documentos

### **Objetivos de Throughput**
- **Usuarios Concurrentes**: 1,000+ usuarios web simultáneos
- **Peticiones API**: 10,000+ peticiones por minuto
- **Procesamiento de Mensajes**: 100+ mensajes por segundo
- **Peticiones IA**: 50+ llamadas API IA concurrentes

### **Objetivos de Disponibilidad**
- **Uptime del Sistema**: 99.9% disponibilidad (< 8.77 horas downtime/año)
- **Disponibilidad de Base de Datos**: 99.95% con failover automático
- **Tolerancia a Servicios Externos**: Degradación elegante cuando servicios no disponibles

## Sistema RBAC Avanzado con HITL Integrado

### **Jerarquía de Roles**
NeurAnt implementa un sistema de Control de Acceso Basado en Roles (RBAC) jerárquico con cuatro niveles:

```mermaid
graph TB
    Owner[Owner] --> Admin[Admin]
    Admin --> Supervisor[Supervisor]  
    Supervisor --> Operador[Operador]
    
    subgraph "Permisos y Scope"
        O_Scope[Empresa Completa + Facturación]
        A_Scope[Empresa Completa - Facturación]
        S_Scope[Chatbots Asignados]
        Op_Scope[Sesiones HITL Asignadas]
    end
    
    Owner -.-> O_Scope
    Admin -.-> A_Scope
    Supervisor -.-> S_Scope
    Operador -.-> Op_Scope
```

### **Principios RBAC**
1. **Herencia Jerárquica**: Roles superiores heredan permisos de inferiores
2. **Mínimo Privilegio**: Cada rol tiene exactamente los permisos necesarios
3. **Separación de Responsabilidades**: Tareas críticas limitadas a Owner/Admin
4. **Asignación Granular**: Control específico de acceso por recurso

### **Flujo de Transferencias HITL**
El sistema permite escalamiento estructurado de sesiones entre roles:

```mermaid
stateDiagram-v2
    [*] --> BotActivo
    BotActivo --> HITLOperador: Usuario solicita humano
    HITLOperador --> HITLSupervisor: Operador transfiere
    HITLSupervisor --> HITLAdmin: Supervisor escala
    HITLAdmin --> HITLOwner: Admin escala
    
    HITLOperador --> Resuelto: Operador resuelve
    HITLSupervisor --> Resuelto: Supervisor resuelve
    HITLAdmin --> Resuelto: Admin resuelve
    HITLOwner --> Resuelto: Owner resuelve
    
    Resuelto --> BotActivo: Handoff exitoso
    Resuelto --> [*]: Conversación terminada
```

### **Asignaciones y Scope**
- **Un Supervisor por Chatbot**: Asignación única para responsabilidad clara
- **Múltiples Operadores por Supervisor**: Escalabilidad del equipo
- **Transferencias Solo Hacia Arriba**: Escalamiento controlado en jerarquía
- **Auditoría Completa**: Tracking de todas las asignaciones y transferencias

## Resumen de Arquitectura de Seguridad

### **Modelo de Seguridad Multi-Capa**
1. **Seguridad de Red**: Encriptación HTTPS/TLS para todas las comunicaciones
2. **Seguridad de Aplicación**: RBAC jerárquico con herencia de permisos
3. **Seguridad de Datos**: Row Level Security con aislamiento de tenant y scope por rol
4. **Seguridad de Integración**: Gestión de API keys y validación de webhooks
5. **Seguridad de Auditoría**: Registro inmutable de eventos RBAC y HITL

### **Consideraciones de Cumplimiento**
- **Privacidad de Datos**: Manejo de datos compatible con GDPR y derechos de usuario
- **Residencia de Datos**: Ubicaciones de almacenamiento de datos configurables
- **Controles de Acceso**: RBAC alineado con SOC 2 Type II y ISO 27001
- **Rastro de Auditoría**: Registro completo para reportes de cumplimiento y forensics
- **Separation of Duties**: Prevención de conflictos de roles y responsabilidades

## Próximos Pasos

1. **Arquitectura de Componentes**: Interfaces detalladas de componentes y contratos
2. **Arquitectura de Base de Datos**: Modelo de datos conceptual y relaciones  
3. **Arquitectura de Seguridad**: Deep-dive en patrones de seguridad y RLS
4. **Arquitectura de API**: Especificaciones OpenAPI y patrones de integración
5. **Guías de Implementación**: Estándares de desarrollo y mejores prácticas

---

*Este documento proporciona el resumen de arquitectura del sistema fundamental. Las especificaciones detalladas de componentes y guías de implementación se cubren en documentos de arquitectura subsecuentes.*