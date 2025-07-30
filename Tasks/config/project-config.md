# Configuración del Proyecto NeurAnt

## Stack Tecnológico Confirmado

### Frontend
- **Framework:** Next.js 14.0+
- **Features:** App Router, Server Components, Server Actions, Streaming SSR
- **Lenguaje:** TypeScript 5.0+
- **UI:** shadcn/ui + Tailwind CSS 3.3+
- **Estado:** TanStack Query (server state) + Zustand (client state)
- **Formularios:** React Hook Form + Zod validation
- **Íconos:** Lucide React
- **Charts:** Recharts
- **Animaciones:** Framer Motion

### Backend
- **Runtime:** Next.js API Routes + Vercel Edge Functions
- **Node Version:** 18+
- **Database:** Supabase PostgreSQL 15+
- **ORM:** Prisma ORM + Supabase JavaScript Client
- **Vector DB:** pgvector extension
- **Auth:** Supabase Auth con RBAC personalizado
- **Storage:** Supabase Storage

### External Services
- **AI:** OpenAI GPT-4-turbo + text-embedding-ada-002
- **Workflows:** n8n Cloud
- **Deployment:** Vercel
- **Monitoring:** Vercel Analytics + Sentry
- **Email:** Supabase Auth emails

## Estructura de IDs de Tareas

### Formato de IDs
- **Phase 1:** TASK-P1E{epic}-{task} (ej: TASK-P1E1-01A)
- **Phase 2:** TASK-P2E{epic}-{task} (ej: TASK-P2E1-01A)
- **Phase 3:** TASK-P3E{epic}-{task} (ej: TASK-P3E1-01A)
- **Phase 4:** TASK-P4E{epic}-{task} (ej: TASK-P4E1-01A)

### Épicas por Phase
#### Phase 1 - Foundation
- **E1:** Infrastructure Setup
- **E2:** Auth & Multi-tenancy
- **E3:** Chatbot CRUD & n8n
- **E4:** Conversations & Analytics

#### Phase 2 - RAG & Features
- **E1:** RAG Foundation
- **E2:** Knowledge Integration
- **E3:** Multi-Channel Support
- **E4:** Templates & Configuration

#### Phase 3 - HITL & Analytics
- **E1:** HITL Foundation
- **E2:** HITL Real-time Interface
- **E3:** Advanced Analytics
- **E4:** Notifications & Optimization

#### Phase 4 - Integration & Launch
- **E1:** External Integrations
- **E2:** Billing & Usage Management
- **E3:** Testing & Quality Assurance
- **E4:** Launch Preparation

## Estados de Tareas
- ⏳ **Pendiente:** No iniciada, posibles dependencias pendientes
- 🔄 **En Progreso:** Trabajando activamente
- ✅ **Completada:** Todos los criterios de aceptación cumplidos
- 🚫 **Bloqueada:** Dependencia crítica faltante
- ❌ **Cancelada:** Descartada o reemplazada

## Estructura de Directorios del Proyecto
```
neurant/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route groups para auth
│   ├── dashboard/                # Dashboard principal
│   ├── api/                      # API routes
│   └── globals.css               # Estilos globales
├── components/                   # Componentes reutilizables
│   ├── ui/                       # shadcn/ui components
│   ├── auth/                     # Componentes de autenticación
│   ├── dashboard/                # Componentes del dashboard
│   └── forms/                    # Formularios específicos
├── lib/                          # Utilidades y configuración
│   ├── supabase/                 # Cliente Supabase
│   ├── openai/                   # Cliente OpenAI
│   ├── utils.ts                  # Utilidades generales
│   └── validations.ts            # Esquemas Zod
├── types/                        # Definiciones TypeScript
├── hooks/                        # Custom React hooks
├── stores/                       # Zustand stores
└── docs/                         # Documentación del proyecto
```

## Variables de Entorno Requeridas
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# n8n
N8N_WEBHOOK_URL=

# Vercel (automáticas)
VERCEL_URL=
VERCEL_ENV=

# Next.js
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

## Convenciones de Código

### TypeScript
- Strict mode habilitado
- No any types permitidos
- Interfaces para objetos, Types para unions
- Nomenclatura: PascalCase para tipos, camelCase para variables

### React
- Componentes funcionales únicamente
- Hooks personalizados con prefijo 'use'
- Props interfaces definidas explícitamente
- Componentes en archivos separados

### Estilos
- Tailwind CSS para styling
- CSS Modules para casos específicos
- Variables CSS para theming
- Responsive design mobile-first

### Base de Datos
- Nomenclatura snake_case para tablas y columnas
- UUIDs como primary keys
- Timestamps con zona horaria (timestamptz)
- RLS habilitado en todas las tablas tenant

## Métricas de Calidad
- **TypeScript Coverage:** 100%
- **Test Coverage:** 80%+ para lógica crítica
- **Bundle Size:** < 1MB gzipped
- **Lighthouse Score:** 90+ en todas las métricas
- **API Response Time:** < 200ms p95

## Herramientas de Desarrollo
- **Package Manager:** npm
- **Linting:** ESLint + Prettier
- **Git Hooks:** Husky + lint-staged
- **Testing:** Jest + Testing Library + Playwright
- **Build:** Next.js built-in
- **Deploy:** Vercel Git integration