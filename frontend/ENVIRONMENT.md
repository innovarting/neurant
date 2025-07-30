# Environment Configuration - NeurAnt

## Overview

NeurAnt uses a sophisticated environment management system that supports multiple environments with proper validation, debugging tools, and security best practices.

## Supported Environments

- **Development**: Local development with DEV database
- **Preview**: Branch deployments with DEV database  
- **Production**: Main deployment with PROD database

## Quick Start

### 1. Setup Environment Variables

```bash
# Copy example file
npm run env:setup

# Edit .env.local with your actual values
# Get Supabase credentials from: https://supabase.com/dashboard
```

### 2. Validate Configuration

```bash
# Validate all environment variables
npm run env:validate

# Debug environment information
npm run env:debug

# Start development with validation
npm run dev:clean
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIs...` |
| `NEXT_PUBLIC_APP_ENV` | Application environment | `development` \| `preview` \| `production` |
| `NEXT_PUBLIC_APP_URL` | Application base URL | `http://localhost:3000` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_NAME` | Application name | `NeurAnt` |
| `NEXT_PUBLIC_APP_VERSION` | Application version | `1.0.0` |
| `NODE_ENV` | Node environment | `development` |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | `undefined` |

### Future Integration Variables

| Variable | Description | Status |
|----------|-------------|--------|
| `OPENAI_API_KEY` | OpenAI API key for LLM features | Not required yet |
| `N8N_WEBHOOK_URL` | n8n webhook for automation | Not required yet |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Not required yet |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Not required yet |
| `SENTRY_DSN` | Sentry error tracking DSN | Not required yet |
| `NEXT_PUBLIC_ANALYTICS_ID` | Analytics tracking ID | Not required yet |

## Environment-Specific Configuration

### Development (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://wydcmmsxdhentmoxthnu.supabase.co
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Preview (Vercel)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://wydcmmsxdhentmoxthnu.supabase.co
NEXT_PUBLIC_APP_ENV=preview
NEXT_PUBLIC_APP_URL=https://neurant-git-dev-[user].vercel.app
```

### Production (Vercel)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ewyyekypuzgurwgnouxp.supabase.co
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://neurant.vercel.app
```

## Database Configuration

### Project Mapping

- **Development/Preview**: DEV database (`wydcmmsxdhentmoxthnu`)
- **Production**: PROD database (`ewyyekypuzgurwgnouxp`)

The system automatically validates that you're using the correct database for each environment.

## Scripts Reference

### Environment Management

```bash
# Setup from template
npm run env:setup

# Validate configuration
npm run env:validate

# Debug information
npm run env:debug

# Clean development start
npm run dev:clean
```

### Development Workflow

```bash
# Standard development
npm run dev

# Development with validation
npm run dev:clean

# Build with validation
npm run deploy:check
```

## Programmatic Usage

### Environment Detection

```typescript
import { getEnvironment, isDevelopment, isProduction } from '@/lib/environment'

const env = getEnvironment() // 'development' | 'preview' | 'production'
const isDev = isDevelopment() // boolean
const isProd = isProduction() // boolean
```

### Configuration Access

```typescript
import { appConfig } from '@/config/app'

// Environment-specific settings
console.log(appConfig.app.environment)
console.log(appConfig.features.showDebugInfo)
console.log(appConfig.supabase.url)
```

### Validation

```typescript
import { validateEnvironment, validateEnvironmentStrict } from '@/lib/validate-env'

// Soft validation (returns result object)
const result = validateEnvironment()
if (!result.isValid) {
  console.error('Environment issues:', result.errors)
}

// Strict validation (throws on error)
try {
  const env = validateEnvironmentStrict()
  // Environment is guaranteed to be valid
} catch (error) {
  console.error('Environment validation failed:', error.message)
}
```

## Feature Flags

Environment-based feature flags are automatically configured:

```typescript
// Development features
showDebugInfo: true (dev only)
enableHotReload: true (dev only)
showDetailedErrors: true (dev + preview)

// Preview features
enablePreviewBanner: true (preview only)
allowTestData: true (dev + preview)

// Production features
enableAnalytics: true (production only)
enableErrorReporting: true (production only)
```

## Security Best Practices

### Variable Naming

- `NEXT_PUBLIC_*`: Client-side accessible (never put secrets here)
- No prefix: Server-side only (safe for secrets)

### Validation

- All required variables are validated at startup
- JWT tokens are checked for minimum length
- URLs are validated for proper format
- Environment values are restricted to known options

### Masking

- Keys and secrets are automatically masked in logs
- Debug output never exposes sensitive information
- Validation scripts hide sensitive values

## Troubleshooting

### Common Issues

**"Missing required environment variable"**
```bash
# Run setup script
npm run env:setup

# Check which variables are missing
npm run env:validate
```

**"Invalid Supabase URL format"**
- Ensure URL starts with `https://` and ends with `.supabase.co`
- Check for typos in project ID

**"Database mismatch detected"**
- Development should use DEV database (`wydcmmsxdhentmoxthnu`)
- Production should use PROD database (`ewyyekypuzgurwgnouxp`)

**"Invalid JWT token format"**
- Ensure keys are copied completely from Supabase dashboard
- Keys should be very long (100+ characters)

### Debug Commands

```bash
# Full environment debug
npm run env:debug

# Validate specific environment
NEXT_PUBLIC_APP_ENV=production npm run env:validate

# Check file system
ls -la .env*
```

### Getting Help

1. Run `npm run env:debug` for detailed information
2. Check the console output for specific error messages
3. Verify credentials in Supabase dashboard
4. Ensure `.env.local` exists and has correct permissions

## Integration with Vercel

Environment variables are automatically configured in Vercel through:

1. **Vercel Dashboard**: Settings > Environment Variables
2. **Different environments**: Production vs Preview configurations
3. **Validation**: Build-time checks ensure all variables are present
4. **Health checks**: `/api/health` endpoint validates configuration

See `DEPLOYMENT.md` for detailed Vercel setup instructions.