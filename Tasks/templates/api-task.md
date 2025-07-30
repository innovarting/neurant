# Template: API Task

## Identificación
- **ID:** TASK-P{phase}E{epic}-{subtask}
- **Título:** [Endpoint o servicio específico]
- **Type:** API
- **Phase:** {1-4} - {Nombre de Phase}
- **Epic:** {Nombre de Epic}
- **Sprint:** {Número de Sprint}
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** {X} horas
- **Prioridad:** {Crítica|Alta|Media|Baja}

## Definición Técnica
[Descripción específica del endpoint, servicio o API que se implementará]

## Referencias de Documentación NeurAnt
- **API Contracts:** `docs/architecture/11-interfaces-contratos-rbac.md:{línea-inicio}-{línea-fin}` (interfaces específicas)
- **Database Schema:** `docs/architecture/13-diagrama-entidad-relacion.md:{línea-inicio}-{línea-fin}` (entidades relacionadas)
- **Implementation Guide:** `docs/architecture/12-guias-implementacion-rbac.md:{línea-inicio}-{línea-fin}` (patrones)
- **Tech Stack:** `docs/architecture/04-tech-stack.md:{línea-inicio}-{línea-fin}` (framework context)

## Dependencias Técnicas
- **Requiere:**
  - [ ] TASK-ID-X ✅ (database schema implementado)
  - [ ] TASK-ID-Y ✅ (auth middleware configurado)
- **Bloquea:**
  - [ ] TASK-ID-Z (frontend components que consumen este API)
  - [ ] TASK-ID-W (otras APIs que dependen de este servicio)

## API Specification
### Endpoints
```
Method: {GET|POST|PUT|DELETE}
Path: /api/{resource}[/{id}]
Auth: Required/Optional
RBAC: {owner|admin|supervisor|operador}
```

### Request Schema
```typescript
interface {RequestName} {
  // Request body structure
  field1: string
  field2: number
  field3?: boolean // optional
}
```

### Response Schema
```typescript
interface {ResponseName} {
  // Success response structure
  data: {DataType}
  message?: string
}

interface {ErrorResponse} {
  error: string
  code: string
  details?: Record<string, any>
}
```

## Criterios de Aceptación Específicos
### API Implementation
- [ ] Endpoint implementado en Next.js API Routes
- [ ] Request validation con Zod schemas
- [ ] Response format consistente con spec
- [ ] Error handling apropiado (4xx, 5xx)

### Security & Authorization
- [ ] Authentication verificada (JWT/session)
- [ ] RBAC authorization implementada según jerarquía
- [ ] Input sanitization para prevenir injections
- [ ] Rate limiting aplicado si necesario

### Database Integration
- [ ] Queries optimizadas con índices apropiados
- [ ] RLS policies respetadas (multi-tenant isolation)
- [ ] Transactions manejadas correctamente
- [ ] Error handling para database failures

### API Quality
- [ ] Response times < 200ms p95
- [ ] Proper HTTP status codes
- [ ] OpenAPI/Swagger documentation
- [ ] Unit tests covering happy & error paths

## Archivos a Crear/Modificar
```
app/api/{resource}/route.ts           # Next.js API route
lib/services/{service-name}.ts        # Business logic service
lib/validations/{resource}.ts         # Zod schemas
types/{resource}.ts                   # TypeScript interfaces
__tests__/api/{resource}.test.ts      # API tests
```

## Implementation Structure
### API Route (Next.js 13+ App Router)
```typescript
// app/api/{resource}/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/middleware/auth'
import { {ResourceService} } from '@/lib/services/{resource}'
import { {RequestSchema} } from '@/lib/validations/{resource}'

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const user = await validateRequest(request)
    
    // 2. Authorization (RBAC)
    if (!user || !canAccess(user.role, '{required_permission}')) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 403 }
      )
    }
    
    // 3. Parse & validate input
    const params = Object.fromEntries(request.nextUrl.searchParams)
    const validated = {ParamsSchema}.parse(params)
    
    // 4. Business logic
    const result = await {ResourceService}.{method}(validated, user.company_id)
    
    // 5. Response
    return NextResponse.json({ data: result })
    
  } catch (error) {
    // Error handling
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  // Similar structure for POST/PUT/DELETE
}
```

### Service Layer
```typescript
// lib/services/{resource}.ts
import { supabase } from '@/lib/supabase/client'
import type { {ResourceType} } from '@/types/{resource}'

export class {ResourceService} {
  static async {method}(
    input: {InputType},
    companyId: string
  ): Promise<{ReturnType}> {
    
    // 1. Database query with RLS
    const { data, error } = await supabase
      .from('{table_name}')
      .select('*')
      .eq('company_id', companyId)
      .{additional_filters}
    
    if (error) throw new DatabaseError(error.message)
    
    // 2. Business logic processing
    const processed = this.processData(data)
    
    // 3. Return structured result
    return processed
  }
  
  private static processData(data: any[]): {ReturnType} {
    // Business logic transformations
    return data.map(item => ({
      // Transform database records to API response format
    }))
  }
}
```

### Validation Schemas
```typescript
// lib/validations/{resource}.ts
import { z } from 'zod'

export const {CreateSchema} = z.object({
  field1: z.string().min(1).max(255),
  field2: z.number().positive(),
  field3: z.boolean().optional(),
})

export const {UpdateSchema} = {CreateSchema}.partial()

export const {ParamsSchema} = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.enum(['created_at', 'updated_at', 'name']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export type {CreateRequest} = z.infer<typeof {CreateSchema}>
export type {UpdateRequest} = z.infer<typeof {UpdateSchema}>
export type {QueryParams} = z.infer<typeof {ParamsSchema}>
```

## Testing Implementation
### Unit Tests
```typescript
// __tests__/api/{resource}.test.ts
import { testApiHandler } from 'next-test-api-route-handler'
import * as handler from '@/app/api/{resource}/route'

describe('/api/{resource}', () => {
  it('should return {resource} list for authorized user', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
          headers: {
            authorization: 'Bearer {valid_token}',
          },
        })
        
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.data).toBeDefined()
        expect(Array.isArray(json.data)).toBe(true)
      },
    })
  })
  
  it('should return 403 for unauthorized user', async () => {
    // Test authorization failure
  })
  
  it('should return 400 for invalid input', async () => {
    // Test validation failure
  })
})
```

### API Documentation
```yaml
# openapi.yml (excerpt)
paths:
  /api/{resource}:
    get:
      summary: Get {resource} list
      security:
        - bearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            minimum: 1
            default: 1
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/{Resource}'
        '403':
          $ref: '#/components/responses/Unauthorized'
```

## Performance Validation
```typescript
// Performance test
describe('API Performance', () => {
  it('should respond within 200ms for typical query', async () => {
    const start = Date.now()
    const response = await testEndpoint()
    const duration = Date.now() - start
    
    expect(response.status).toBe(200)
    expect(duration).toBeLessThan(200)
  })
})
```

## Security Validation
### RBAC Testing
```typescript
const testRBAC = async () => {
  // Test cada rol puede acceder a lo apropiado
  const roles = ['owner', 'admin', 'supervisor', 'operador']
  
  for (const role of roles) {
    const token = generateTokenForRole(role)
    const response = await callAPI(token)
    
    // Verificar response según permisos del rol
    if (role === 'operador' && isAdminOnlyEndpoint) {
      expect(response.status).toBe(403)
    } else {
      expect(response.status).toBe(200)
    }
  }
}
```

### Input Validation Testing
```typescript
const testInputValidation = async () => {
  const maliciousInputs = [
    { field1: "'; DROP TABLE users; --" }, // SQL injection
    { field1: "<script>alert('xss')</script>" }, // XSS
    { field2: -1 }, // Invalid number
    { field1: "a".repeat(1000) }, // Too long string
  ]
  
  for (const input of maliciousInputs) {
    const response = await callAPI(input)
    expect(response.status).toBe(400) // Should reject invalid input
  }
}
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- API implemented: {endpoint_path}
- Methods: {GET|POST|PUT|DELETE}
- RBAC: {roles_allowed}
- Tests: {passed_count}/{total_count}
- Performance: {average_response_time}ms
- Next API task: TASK-ID-NEXT
```

## Troubleshooting API
### Common Issues
- **CORS Errors:** [Configuration for Next.js API]
- **Authentication Failures:** [Debug JWT/session issues]
- **Database Connection:** [Supabase connection troubleshooting]
- **RLS Policy Errors:** [Debug multi-tenant isolation]

### Debugging Commands
```bash
# Test endpoint locally
curl -X GET http://localhost:3000/api/{resource} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"

# Database query debugging
supabase logs api
supabase logs db

# Performance profiling
npm run build:analyze
```

---
*Template específico para tareas de API: endpoints, servicios, validación, autorización, etc.*