# TASK-P1E1-01A: Next.js 14 Project Setup con App Router

## Identificación
- **ID:** TASK-P1E1-01A
- **Título:** Next.js 14 Project Setup con App Router
- **Type:** Infrastructure
- **Phase:** 1 - Foundation
- **Epic:** Infrastructure Setup
- **Sprint:** Sprint 1.1 (Semanas 1-2, Enero 2025)
- **Status:** ✅ COMPLETADA - 2025-07-30
- **Tiempo Estimado:** 4 horas
- **Prioridad:** Crítica - Bloquea todo desarrollo posterior

## Definición Técnica
Inicializar proyecto Next.js 14 con App Router, TypeScript, configuración de ESLint/Prettier, estructura de directorios según arquitectura NeurAnt, y dependencias core del stack tecnológico.

## Referencias de Documentación NeurAnt
- **Framework Principal:** `docs/architecture/04-tech-stack.md:17-35` (Next.js 14+ con App Router)
- **Dependencies Core:** `docs/architecture/04-tech-stack.md:445-471` (package.json dependencies)
- **Development Environment:** `docs/architecture/04-tech-stack.md:237-246` (Node.js, TypeScript, tooling)
- **Git Workflow:** `docs/architecture/04-tech-stack.md:412-429` (GitHub Flow, quality gates)
- **Sprint Context:** `docs/architecture/05-implementation-roadmap.md:33-88` (Sprint 1.1 deliverables)

## Dependencias Técnicas
- **Requiere:** ✅ Ninguna (Tarea inicial del proyecto)
- **Bloquea:**
  - [ ] TASK-P1E1-01B (Supabase Configuration)
  - [ ] TASK-P1E1-01C (Vercel Deployment Setup)
  - [ ] TASK-P1E1-01D (Environment Configuration)
  - [ ] Todo el desarrollo posterior del proyecto

## Criterios de Aceptación Específicos
### Setup y Configuración
- [x] Proyecto Next.js 14 inicializado con `create-next-app@latest`
- [x] App Router habilitado (no Pages Router)
- [x] TypeScript 5.0+ configurado con strict mode
- [x] Tailwind CSS 3.3+ configurado
- [x] ESLint + Prettier configurados según estándares

### Dependencias Core Instaladas
- [x] @supabase/supabase-js ^2.38.0
- [x] @tanstack/react-query ^5.0.0
- [x] zustand ^4.4.0
- [x] react-hook-form ^7.47.0
- [x] zod ^3.22.0
- [x] lucide-react ^0.288.0
- [x] framer-motion ^10.16.0

### Estructura de Directorios
- [x] /app (App Router structure)
- [x] /components/ui (shadcn/ui components)
- [x] /lib (utilities, configs)
- [x] /types (TypeScript definitions)
- [x] /hooks (custom React hooks)
- [x] /stores (Zustand stores)

### Tooling y Quality Gates
- [x] Husky + lint-staged configurado para pre-commit hooks
- [x] Package.json scripts configurados (dev, build, lint, typecheck)
- [x] tsconfig.json con configuración strict
- [x] next.config.js con configuraciones necesarias

### Validación Técnica
- [x] `npm run build` ejecuta sin errores
- [x] `npm run dev` sirve aplicación en http://localhost:3000
- [x] `npm run lint` pasa sin errores
- [x] `npx tsc --noEmit` no muestra errores TypeScript

## Archivos a Crear/Modificar
```
/package.json
/next.config.js
/tsconfig.json
/eslint.config.js
/.prettierrc
/.husky/pre-commit
/app/layout.tsx
/app/page.tsx
/app/globals.css
/components/ui/ (directorio)
/lib/utils.ts
/lib/cn.ts
/types/index.ts
/tailwind.config.ts
```

## Comandos de Implementación
```bash
# 1. Inicializar proyecto Next.js 14
npx create-next-app@latest neurant --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

cd neurant

# 2. Instalar dependencias core según tech stack
npm install @supabase/supabase-js@^2.38.0
npm install @tanstack/react-query@^5.0.0
npm install zustand@^4.4.0
npm install react-hook-form@^7.47.0
npm install zod@^3.22.0
npm install lucide-react@^0.288.0
npm install framer-motion@^10.16.0

# 3. Instalar dev dependencies
npm install -D @types/node@^20.8.0
npm install -D prettier@^3.0.0
npm install -D husky@^8.0.0
npm install -D lint-staged@^15.0.0

# 4. Configurar git hooks
npm run prepare
npx husky add .husky/pre-commit "npx lint-staged"

# 5. Configurar shadcn/ui base
npx shadcn-ui@latest init --yes --defaults
```

## Configuraciones Específicas

### package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "prepare": "husky install"
  }
}
```

### tsconfig.json (Configuración Strict)
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### .lintstagedrc.js
```javascript
module.exports = {
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,css,md}": ["prettier --write"]
}
```

### Estructura de Directorios Inicial
```
neurant/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
├── lib/
│   ├── utils.ts
│   └── cn.ts
├── types/
│   └── index.ts
├── hooks/
├── stores/
├── public/
└── docs/
```

## Validación Técnica
### Build Validation
```bash
# Verificar que el proyecto compila correctamente
npm run build

# Verificar TypeScript sin errores
npm run typecheck

# Verificar linting
npm run lint

# Verificar formatting
npm run format
```

### Functional Validation
```bash
# Iniciar servidor de desarrollo
npm run dev

# Verificar en navegador
# http://localhost:3000 debe mostrar página inicial de Next.js

# Verificar hot reload
# Modificar app/page.tsx y verificar actualización automática
```

### Git Hooks Validation
```bash
# Hacer un commit para probar pre-commit hooks
git add .
git commit -m "feat: initialize Next.js 14 project with TypeScript"

# Debe ejecutar lint-staged automáticamente
```

## Métricas de Éxito
- **Performance:** Build time < 30 segundos
- **Reliability:** 0 errores en TypeScript compilation
- **Quality:** ESLint pasa sin warnings
- **Developer Experience:** Hot reload < 1 segundo

## Configuración Post-Implementación
### Verificaciones Finales
- [x] `localhost:3000` carga correctamente
- [x] TypeScript strict mode habilitado
- [x] Pre-commit hooks funcionando
- [x] Estructura de directorios creada
- [x] Dependencias core instaladas

### Next Steps Preparados
- [ ] Configuración Supabase (siguiente tarea)
- [ ] Variables de entorno template
- [ ] Deployment Vercel preparado

## Troubleshooting
### Common Issues
- **Node Version:** Verificar Node.js 18+ instalado
- **NPM Cache:** `npm cache clean --force` si hay problemas
- **TypeScript Errors:** Verificar versión TypeScript 5.0+
- **Hot Reload Issues:** Reiniciar servidor dev

### Debugging Commands
```bash
# Verificar versiones
node --version  # Debe ser 18+
npm --version
npx next --version  # Debe ser 14+

# Limpiar y reinstalar si hay problemas
rm -rf node_modules package-lock.json
npm install

# Verificar configuración
cat package.json | grep "next"
cat tsconfig.json | grep "strict"
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md al completar:
- Branch: feature/project-setup
- Último commit: "feat: initialize Next.js 14 project with TypeScript"
- Project root: /neurant
- Next.js version: 14.0+
- TypeScript: enabled (strict mode)
- Siguiente tarea: TASK-P1E1-01B (Supabase Configuration)
- Archivos clave creados: [package.json, tsconfig.json, next.config.js]
- Dependencias instaladas: Next.js, TypeScript, Tailwind, core libs
```

## Rollback Plan
En caso de problemas críticos:
1. Eliminar directorio `neurant/` completamente
2. Verificar versiones de Node.js/npm
3. Reiniciar desde `npx create-next-app@latest`
4. Documentar problema encontrado

---
*Esta tarea es el foundation crítico del proyecto NeurAnt. Sin completar exitosamente esta tarea, ningún desarrollo posterior es posible.*