# TASK-P1E1-01D: Environment Configuration

**Status:** 🔄 EN PROGRESO
**Epic:** P1E1 - Infrastructure Setup  
**Estimación:** 2 horas
**Prioridad:** Alta

## Descripción
Configurar la gestión completa de variables de entorno para diferentes environments (development, preview, production), establecer validación de configuraciones, y crear herramientas para debugging de environment issues. Esta tarea asegura un workflow de desarrollo robusto y deployments seguros.

## Contexto Técnico
Según `docs/architecture/04-tech-stack.md:272-286`, necesitamos configuración diferenciada por environment:
- **Development**: Variables locales con base de datos DEV
- **Preview**: Deployments de branch con base de datos DEV  
- **Production**: Deployment principal con base de datos PROD
- **Validation**: Verificación automática de variables críticas

## Dependencias
### Requeridas Completadas ✅
- [x] **TASK-P1E1-01A**: Next.js Project Setup
- [x] **TASK-P1E1-01B**: Supabase Configuration  
- [x] **TASK-P1E1-01C**: Vercel Deployment Setup

### Archivos de Referencia
- `docs/architecture/04-tech-stack.md:272-286` - Environment Configuration
- `frontend/.env.local` - Variables de desarrollo existentes
- `frontend/DEPLOYMENT.md` - Configuración de Vercel
- `frontend/src/lib/supabase/` - Clientes que usan variables

## Objetivos Específicos

### 1. Environment Variables Management
- [ ] Crear `.env.example` con todas las variables requeridas
- [ ] Documentar variables por environment (dev/preview/prod)
- [ ] Establecer naming conventions claras
- [ ] Configurar validación de variables críticas

### 2. Development Workflow
- [ ] Configurar variables para desarrollo local
- [ ] Establecer scripts de environment validation
- [ ] Crear helpers para environment detection
- [ ] Configurar debugging de environment issues

### 3. Production Security
- [ ] Separar variables públicas vs privadas
- [ ] Establecer rotation strategy para secrets
- [ ] Configurar fallbacks para variables opcionales
- [ ] Implementar environment health checks

### 4. Deployment Integration
- [ ] Variables configuradas en Vercel Dashboard
- [ ] Diferentes configuraciones por branch
- [ ] Validation en build time
- [ ] Runtime environment detection

## Variables de Entorno por Environment

### Development (.env.local)
```bash
# Supabase - DEV Database
NEXT_PUBLIC_SUPABASE_URL=https://wydcmmsxdhentmoxthnu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Application
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=NeurAnt
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development Tools
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1

# Future Integrations (placeholder)
OPENAI_API_KEY=sk-dev-placeholder
N8N_WEBHOOK_URL=https://dev-webhook-placeholder
```

### Preview (Vercel Environment)
```bash
# Supabase - DEV Database (same as development)
NEXT_PUBLIC_SUPABASE_URL=https://wydcmmsxdhentmoxthnu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Application - Preview
NEXT_PUBLIC_APP_ENV=preview
NEXT_PUBLIC_APP_URL=https://neurant-git-dev-[user].vercel.app
NEXT_PUBLIC_APP_NAME=NeurAnt (Preview)
NEXT_PUBLIC_APP_VERSION=1.0.0-preview

# Node Environment
NODE_ENV=production
```

### Production (Vercel Environment)
```bash
# Supabase - PROD Database
NEXT_PUBLIC_SUPABASE_URL=https://ewyyekypuzgurwgnouxp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Application - Production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://neurant.vercel.app
NEXT_PUBLIC_APP_NAME=NeurAnt
NEXT_PUBLIC_APP_VERSION=1.0.0

# Node Environment
NODE_ENV=production

# Production Services
OPENAI_API_KEY=sk-prod-...
N8N_WEBHOOK_URL=https://neurant.app.n8n.cloud/webhook/
```

## Implementación Técnica

### Environment Detection Helper
```typescript
// src/lib/environment.ts
export type Environment = 'development' | 'preview' | 'production'

export const getEnvironment = (): Environment => {
  const env = process.env.NEXT_PUBLIC_APP_ENV as Environment
  if (['development', 'preview', 'production'].includes(env)) {
    return env
  }
  return 'development' // fallback
}

export const isDevelopment = () => getEnvironment() === 'development'
export const isPreview = () => getEnvironment() === 'preview'  
export const isProduction = () => getEnvironment() === 'production'
export const isServer = () => typeof window === 'undefined'
```

### Environment Validation
```typescript
// src/lib/validate-env.ts
interface RequiredEnvVars {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  NEXT_PUBLIC_APP_ENV: string
  NEXT_PUBLIC_APP_URL: string
}

export function validateEnvironment(): RequiredEnvVars {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_APP_ENV',
    'NEXT_PUBLIC_APP_URL'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
  
  return process.env as RequiredEnvVars
}
```

### Environment-specific Configuration
```typescript
// src/config/app.ts  
import { getEnvironment } from '@/lib/environment'

const baseConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'NeurAnt',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

const environmentConfigs = {
  development: {
    ...baseConfig,
    debug: true,
    apiTimeout: 30000,
    logLevel: 'debug'
  },
  preview: {
    ...baseConfig,
    debug: true,
    apiTimeout: 15000,
    logLevel: 'info'
  },
  production: {
    ...baseConfig,
    debug: false,
    apiTimeout: 10000,
    logLevel: 'error'
  }
}

export const appConfig = environmentConfigs[getEnvironment()]
```

## Criterios de Aceptación Específicos

### Environment Management
- [ ] `.env.example` creado con todas las variables documentadas
- [ ] Variables separadas correctamente por environment
- [ ] Naming conventions consistentes aplicadas
- [ ] Documentación clara de cada variable

### Development Experience  
- [ ] `npm run dev` funciona sin configuración adicional
- [ ] Environment validation ejecutándose en startup
- [ ] Scripts de debugging de environment funcionando
- [ ] Error messages claros para variables faltantes

### Production Security
- [ ] Variables públicas vs privadas correctamente segregadas
- [ ] Secrets no expuestos en client bundle
- [ ] Fallbacks configurados para variables opcionales
- [ ] Health checks validando configuration

### Integration Validation
- [ ] Vercel environments configurados correctamente
- [ ] Build time validation funcionando
- [ ] Runtime environment detection precisa
- [ ] Different database connections por environment

## Validación Técnica

### Comandos de Validación
```bash
# 1. Validar environment local
npm run env:validate

# 2. Test different environments
NEXT_PUBLIC_APP_ENV=development npm run build
NEXT_PUBLIC_APP_ENV=preview npm run build  
NEXT_PUBLIC_APP_ENV=production npm run build

# 3. Verificar variables en runtime
curl http://localhost:3000/api/health
curl https://neurant-preview.vercel.app/api/health
curl https://neurant.vercel.app/api/health

# 4. Debug environment issues
npm run env:debug
```

### Scripts de Package.json
```json
{
  "scripts": {
    "env:validate": "node scripts/validate-env.js",
    "env:debug": "node scripts/debug-env.js", 
    "env:setup": "cp .env.example .env.local",
    "dev:clean": "npm run env:validate && npm run dev"
  }
}
```

### Checklist de Validación Post-Implementation
- [ ] Todas las variables documentadas en `.env.example`
- [ ] Environment detection funcionando correctamente
- [ ] Validation scripts ejecutándose sin errores
- [ ] Different database connections por environment
- [ ] Health check returning correct environment info
- [ ] Build successful en todos los environments
- [ ] No secrets leaked en client bundle

## Dependencias Técnicas (Desbloquea)
Una vez completada esta tarea:
- [ ] **TASK-P1E2-02A**: Supabase Auth Setup
- [ ] **Development workflow** completamente configurado
- [ ] **Environment management** listo para el equipo
- [ ] **Production deployment** con configuración correcta

## Next Steps Preparados
- Setup de monitoring por environment
- Configuration management para secrets rotation
- Advanced debugging tools para environment issues
- Documentation para onboarding de nuevos developers

## Referencias Técnicas
- **Stack**: `docs/architecture/04-tech-stack.md:272-286`
- **Security**: `docs/architecture/04-tech-stack.md:330-350`
- **Deployment**: `frontend/DEPLOYMENT.md`
- **Health Check**: `frontend/src/app/api/health/route.ts`

## Riesgos y Mitigaciones
### Riesgo: Variables expuestas accidentalmente
- **Mitigación**: Validation scripts + naming conventions
- **Monitoring**: Build-time checks para variables públicas

### Riesgo: Environment mismatch en deployment  
- **Mitigación**: Health checks + environment detection
- **Validation**: Automatic verification en cada deploy

### Riesgo: Missing variables en production
- **Mitigación**: Required variables validation + fallbacks
- **Recovery**: Clear error messages + debugging tools

## Bloquea
- TASK-P1E2-02A: Supabase Auth Setup
- TASK-P1E2-02B: RLS Policies - Companies
- Todo el desarrollo que requiere environment-specific configuration

---
**Arquitecto:** Esta tarea establecerá un environment management robusto que soportará todo el desarrollo futuro del proyecto, asegurando deployments seguros y workflow de desarrollo eficiente.