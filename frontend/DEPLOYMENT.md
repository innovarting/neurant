# Guía de Deployment - NeurAnt

## Setup de Vercel

### 1. Configuración Inicial

1. **Crear cuenta en Vercel** (si no existe)
   - Ir a https://vercel.com
   - Registrarse con GitHub

2. **Conectar repositorio**
   - Import Git Repository → Seleccionar este repo
   - Framework: Next.js (auto-detectado)
   - Root Directory: `frontend/`

### 2. Variables de Entorno

#### Configurar en Vercel Dashboard

**Environment Variables (Settings > Environment Variables)**

##### Production Environment:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ewyyekypuzgurwgnouxp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://neurant.vercel.app
```

##### Preview Environment (dev branch):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://wydcmmsxdhentmoxthnu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
NEXT_PUBLIC_APP_ENV=preview
NEXT_PUBLIC_APP_URL=https://neurant-preview.vercel.app
```

### 3. Build Settings

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "nodeVersion": "18.x"
}
```

### 4. Git Integration

- **Production**: Deploy desde branch `main`
- **Preview**: Deploy desde branch `dev`
- **Auto-deploy**: Habilitado en ambos branches

## Verificación Post-Deploy

### Checklist de Validación

- [ ] URL de producción carga sin errores
- [ ] API routes `/api/health` responde correctamente  
- [ ] Conexión a Supabase funcional
- [ ] Headers de seguridad configurados
- [ ] Performance Lighthouse > 90
- [ ] SSL certificate activo
- [ ] Preview deployments funcionando

### Comandos de Verificación

```bash
# 1. Test conectividad
curl -I https://neurant.vercel.app

# 2. Test API health
curl https://neurant.vercel.app/api/health

# 3. Test headers de seguridad
curl -I https://neurant.vercel.app | grep -E "(X-Content-Type|X-Frame|X-XSS)"
```

## URLs Esperadas

- **Production**: https://neurant.vercel.app
- **Preview**: https://neurant-git-dev-[username].vercel.app
- **Dashboard**: https://vercel.com/dashboard

## Solución de Problemas

### Build Failures

```bash
# Verificar build local
npm run build

# Check logs en Vercel Dashboard
# Functions > View Function Logs
```

### Variables de Entorno

```bash
# Test en local primero
npm run dev

# Verificar en Vercel:
# Settings > Environment Variables
```

### Performance Issues

```bash
# Analizar bundle
npm run build
npx @next/bundle-analyzer

# Vercel Analytics
# Analytics tab en dashboard
```

## Configuración Avanzada

### Custom Domain (Opcional)

1. **Domains** en Vercel Dashboard
2. Add Domain → neurant.app
3. Configure DNS records
4. Wait for SSL propagation

### Monitoring

- **Vercel Analytics**: Habilitado automáticamente
- **Function Logs**: Disponibles en dashboard
- **Web Vitals**: Tracking automático

## Security Headers

Configurados automáticamente via `vercel.json`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## Next Steps

Una vez completado el deployment:

1. Configurar dominio personalizado (opcional)
2. Setup monitoring alerts
3. Configure analytics tracking
4. Test en diferentes devices/networks
5. Performance optimization review