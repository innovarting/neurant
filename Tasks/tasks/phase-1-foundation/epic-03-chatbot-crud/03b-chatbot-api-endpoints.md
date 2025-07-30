# TASK-P1E3-03b: Chatbot API Endpoints

## Identificación
- **ID:** TASK-P1E3-03b
- **Título:** Chatbot CRUD API Endpoints
- **Type:** API
- **Phase:** 1 - Foundation
- **Epic:** Epic 3 - Chatbot CRUD
- **Sprint:** Sprint 1.2
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 8 horas
- **Prioridad:** Alta

## Definición Técnica
Implementar endpoints completos de API REST para el CRUD de chatbots, incluyendo autenticación, autorización RBAC, validación de datos y integración con Supabase. Los endpoints soportarán operaciones completas de gestión de chatbots con multi-tenancy.

## Referencias de Documentación NeurAnt
- **API Contracts:** `docs/architecture/11-interfaces-contratos-rbac.md:589-591` (RBAC chatbot permissions)
- **Database Schema:** `docs/architecture/13-diagrama-entidad-relacion.md:118-149` (entidad CHATBOTS)
- **Implementation Guide:** `docs/architecture/12-guias-implementacion-rbac.md:50-100` (patrones RBAC)
- **Tech Stack:** `docs/architecture/04-tech-stack.md:1-50` (Next.js API Routes)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E3-03a ✅ (chatbot database schema implementado)
  - [x] TASK-P1E2-02a ✅ (Supabase auth configurado)
  - [x] TASK-P1E2-02f ✅ (RBAC middleware implementado)
- **Bloquea:**
  - [ ] TASK-P1E3-03c (chatbot management UI)
  - [ ] TASK-P1E3-03d (n8n integration setup)

## API Specification
### Endpoints
```
Method: GET
Path: /api/chatbots
Auth: Required
RBAC: owner|admin|supervisor|operador

Method: GET
Path: /api/chatbots/:id
Auth: Required
RBAC: owner|admin|supervisor|operador (scope: chatbot access)

Method: POST
Path: /api/chatbots
Auth: Required
RBAC: owner|admin

Method: PUT
Path: /api/chatbots/:id
Auth: Required
RBAC: owner|admin|supervisor (scope: chatbot ownership)

Method: DELETE
Path: /api/chatbots/:id
Auth: Required
RBAC: owner|admin
```

### Request Schema
```typescript
interface CreateChatbotRequest {
  name: string
  description?: string
  avatar_url?: string
  system_prompt: string
  personality_traits?: Record<string, any>
  response_delay_ms?: number
  max_context_messages?: number
  fallback_message?: string
  channels?: Record<string, any>
  channel_configs?: Record<string, any>
  working_hours?: Record<string, any>
  timezone?: string
  hitl_enabled?: boolean
  hitl_triggers?: Record<string, any>
  hitl_trigger_keywords?: string
  auto_escalate_after_minutes?: number
  requires_supervisor?: boolean
  operator_assignment_strategy?: string
  max_concurrent_hitl?: number
  hitl_escalation_timeout_minutes?: number
}

interface UpdateChatbotRequest extends Partial<CreateChatbotRequest> {
  is_active?: boolean
  is_training?: boolean
  assigned_supervisor_id?: string
}

interface ChatbotQueryParams {
  page?: number
  limit?: number
  sort?: 'name' | 'created_at' | 'updated_at' | 'total_conversations'
  order?: 'asc' | 'desc'
  is_active?: boolean
  search?: string
}
```

### Response Schema
```typescript
interface ChatbotResponse {
  id: string
  company_id: string
  name: string
  description?: string
  avatar_url?: string
  system_prompt: string
  personality_traits?: Record<string, any>
  response_delay_ms: number
  max_context_messages: number
  fallback_message?: string
  channels?: Record<string, any>
  channel_configs?: Record<string, any>
  is_active: boolean
  is_training: boolean
  training_progress: number
  working_hours?: Record<string, any>
  timezone?: string
  hitl_enabled: boolean
  hitl_triggers?: Record<string, any>
  hitl_trigger_keywords?: string
  auto_escalate_after_minutes?: number
  assigned_supervisor_id?: string
  supervisor_assigned_by?: string
  supervisor_assigned_at?: string
  requires_supervisor: boolean
  operator_assignment_strategy?: string
  max_concurrent_hitl: number
  hitl_escalation_timeout_minutes: number
  total_conversations: number
  total_messages: number
  avg_response_time_seconds?: number
  satisfaction_score?: number
  last_conversation_at?: string
  created_at: string
  updated_at: string
}

interface ChatbotListResponse {
  data: ChatbotResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  message?: string
}

interface ChatbotErrorResponse {
  error: string
  code: string
  details?: Record<string, any>
}
```

## Criterios de Aceptación Específicos
### API Implementation
- [ ] Endpoints implementados en Next.js API Routes (App Router)
- [ ] Request validation con Zod schemas completos
- [ ] Response format consistente con especificación
- [ ] Error handling apropiado (400, 401, 403, 404, 422, 500)

### Security & Authorization
- [ ] Authentication verificada con Supabase Auth
- [ ] RBAC authorization implementada según jerarquía de roles
- [ ] Scope-based access control para chatbots específicos
- [ ] Input sanitization para prevenir SQL injection/XSS
- [ ] Rate limiting aplicado (100 req/min por usuario)

### Database Integration
- [ ] Queries optimizadas con índices en company_id, name, created_at
- [ ] RLS policies respetadas (multi-tenant isolation)
- [ ] Transactions manejadas correctamente en CREATE/UPDATE
- [ ] Soft delete implementado (is_active = false)
- [ ] Error handling para database constraint violations

### API Quality
- [ ] Response times < 200ms p95 para GET operations
- [ ] Response times < 500ms p95 para CREATE/UPDATE operations
- [ ] Proper HTTP status codes según RFC standards
- [ ] OpenAPI/Swagger documentation generada
- [ ] Unit tests covering happy & error paths (>90% coverage)

## Archivos a Crear/Modificar
```
app/api/chatbots/route.ts              # GET /api/chatbots, POST /api/chatbots
app/api/chatbots/[id]/route.ts         # GET/PUT/DELETE /api/chatbots/:id
lib/services/chatbot-service.ts        # Business logic service
lib/validations/chatbot.ts             # Zod schemas
types/chatbot.ts                       # TypeScript interfaces
__tests__/api/chatbots.test.ts         # API integration tests
__tests__/services/chatbot-service.test.ts # Service unit tests
```

## Implementation Structure
### API Route - List & Create (Next.js 13+ App Router)
```typescript
// app/api/chatbots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/middleware/auth'
import { requirePermission, requireScope } from '@/lib/middleware/rbac'
import { ChatbotService } from '@/lib/services/chatbot-service'
import { CreateChatbotSchema, ChatbotQuerySchema } from '@/lib/validations/chatbot'

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const user = await validateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // 2. Authorization (RBAC)
    if (!requirePermission(user.role, 'chatbot', 'read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    // 3. Parse & validate query parameters
    const params = Object.fromEntries(request.nextUrl.searchParams)
    const validated = ChatbotQuerySchema.parse(params)
    
    // 4. Business logic
    const result = await ChatbotService.list(validated, user.company_id, user.id)
    
    // 5. Response
    return NextResponse.json(result)
    
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const user = await validateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // 2. Authorization (RBAC) - only owner/admin can create
    if (!requirePermission(user.role, 'chatbot', 'create')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    // 3. Parse & validate request body
    const body = await request.json()
    const validated = CreateChatbotSchema.parse(body)
    
    // 4. Business logic
    const chatbot = await ChatbotService.create(validated, user.company_id, user.id)
    
    // 5. Response
    return NextResponse.json({ data: chatbot }, { status: 201 })
    
  } catch (error) {
    return handleApiError(error)
  }
}
```

### API Route - Individual Operations
```typescript
// app/api/chatbots/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/middleware/auth'
import { requirePermission, requireScope } from '@/lib/middleware/rbac'
import { ChatbotService } from '@/lib/services/chatbot-service'
import { UpdateChatbotSchema } from '@/lib/validations/chatbot'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await validateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!requirePermission(user.role, 'chatbot', 'read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    // Scope validation - can user access this specific chatbot?
    if (!await requireScope(user, 'chatbot', params.id)) {
      return NextResponse.json({ error: 'Access denied to this chatbot' }, { status: 403 })
    }
    
    const chatbot = await ChatbotService.getById(params.id, user.company_id)
    
    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
    }
    
    return NextResponse.json({ data: chatbot })
    
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await validateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!requirePermission(user.role, 'chatbot', 'update')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    if (!await requireScope(user, 'chatbot', params.id)) {
      return NextResponse.json({ error: 'Access denied to this chatbot' }, { status: 403 })
    }
    
    const body = await request.json()
    const validated = UpdateChatbotSchema.parse(body)
    
    const chatbot = await ChatbotService.update(params.id, validated, user.company_id, user.id)
    
    return NextResponse.json({ data: chatbot })
    
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await validateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!requirePermission(user.role, 'chatbot', 'delete')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    if (!await requireScope(user, 'chatbot', params.id)) {
      return NextResponse.json({ error: 'Access denied to this chatbot' }, { status: 403 })
    }
    
    await ChatbotService.delete(params.id, user.company_id, user.id)
    
    return NextResponse.json({ message: 'Chatbot deleted successfully' })
    
  } catch (error) {
    return handleApiError(error)
  }
}
```

### Service Layer
```typescript
// lib/services/chatbot-service.ts
import { supabase } from '@/lib/supabase/client'
import type { CreateChatbotRequest, UpdateChatbotRequest, ChatbotResponse, ChatbotQueryParams } from '@/types/chatbot'

export class ChatbotService {
  static async list(
    params: ChatbotQueryParams,
    companyId: string,
    userId: string
  ): Promise<{ data: ChatbotResponse[], pagination: any }> {
    
    const { page = 1, limit = 20, sort = 'created_at', order = 'desc', is_active, search } = params
    const offset = (page - 1) * limit
    
    let query = supabase
      .from('chatbots')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .order(sort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1)
    
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active)
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    const { data, error, count } = await query
    
    if (error) throw new DatabaseError(error.message)
    
    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    }
  }
  
  static async getById(
    id: string,
    companyId: string
  ): Promise<ChatbotResponse | null> {
    
    const { data, error } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', id)
      .eq('company_id', companyId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new DatabaseError(error.message)
    }
    
    return data
  }
  
  static async create(
    input: CreateChatbotRequest,
    companyId: string,
    createdBy: string
  ): Promise<ChatbotResponse> {
    
    const chatbotData = {
      ...input,
      company_id: companyId,
      created_by: createdBy,
      is_active: true,
      is_training: false,
      training_progress: 0,
      total_conversations: 0,
      total_messages: 0,
      max_concurrent_hitl: input.max_concurrent_hitl || 5,
      hitl_escalation_timeout_minutes: input.hitl_escalation_timeout_minutes || 30,
      response_delay_ms: input.response_delay_ms || 1000,
      max_context_messages: input.max_context_messages || 10
    }
    
    const { data, error } = await supabase
      .from('chatbots')
      .insert(chatbotData)
      .select()
      .single()
    
    if (error) throw new DatabaseError(error.message)
    
    return data
  }
  
  static async update(
    id: string,
    input: UpdateChatbotRequest,
    companyId: string,
    updatedBy: string
  ): Promise<ChatbotResponse> {
    
    const updateData = {
      ...input,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy
    }
    
    const { data, error } = await supabase
      .from('chatbots')
      .update(updateData)
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Chatbot not found')
      }
      throw new DatabaseError(error.message)
    }
    
    return data
  }
  
  static async delete(
    id: string,
    companyId: string,
    deletedBy: string
  ): Promise<void> {
    
    // Soft delete - set is_active = false
    const { error } = await supabase
      .from('chatbots')
      .update({ 
        is_active: false, 
        updated_at: new Date().toISOString(),
        updated_by: deletedBy
      })
      .eq('id', id)
      .eq('company_id', companyId)
    
    if (error) throw new DatabaseError(error.message)
  }
}
```

### Validation Schemas
```typescript
// lib/validations/chatbot.ts
import { z } from 'zod'

export const CreateChatbotSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  avatar_url: z.string().url().optional(),
  system_prompt: z.string().min(10).max(5000),
  personality_traits: z.record(z.any()).optional(),
  response_delay_ms: z.number().min(0).max(10000).optional(),
  max_context_messages: z.number().min(1).max(50).optional(),
  fallback_message: z.string().max(1000).optional(),
  channels: z.record(z.any()).optional(),
  channel_configs: z.record(z.any()).optional(),
  working_hours: z.record(z.any()).optional(),
  timezone: z.string().max(50).optional(),
  hitl_enabled: z.boolean().optional(),
  hitl_triggers: z.record(z.any()).optional(),
  hitl_trigger_keywords: z.string().max(1000).optional(),
  auto_escalate_after_minutes: z.number().min(1).max(1440).optional(),
  requires_supervisor: z.boolean().optional(),
  operator_assignment_strategy: z.enum(['round_robin', 'least_busy', 'random']).optional(),
  max_concurrent_hitl: z.number().min(1).max(100).optional(),
  hitl_escalation_timeout_minutes: z.number().min(1).max(1440).optional(),
})

export const UpdateChatbotSchema = CreateChatbotSchema.partial().extend({
  is_active: z.boolean().optional(),
  is_training: z.boolean().optional(),
  assigned_supervisor_id: z.string().uuid().optional(),
})

export const ChatbotQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.enum(['name', 'created_at', 'updated_at', 'total_conversations']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  is_active: z.coerce.boolean().optional(),
  search: z.string().max(255).optional(),
})

export type CreateChatbotRequest = z.infer<typeof CreateChatbotSchema>
export type UpdateChatbotRequest = z.infer<typeof UpdateChatbotSchema>
export type ChatbotQueryParams = z.infer<typeof ChatbotQuerySchema>
```

## Testing Implementation
### API Integration Tests
```typescript
// __tests__/api/chatbots.test.ts
import { testApiHandler } from 'next-test-api-route-handler'
import * as listHandler from '@/app/api/chatbots/route'
import * as itemHandler from '@/app/api/chatbots/[id]/route'

describe('/api/chatbots', () => {
  it('should return chatbot list for authorized user', async () => {
    await testApiHandler({
      handler: listHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
          headers: {
            authorization: 'Bearer valid_owner_token',
          },
        })
        
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.data).toBeDefined()
        expect(Array.isArray(json.data)).toBe(true)
        expect(json.pagination).toBeDefined()
      },
    })
  })
  
  it('should create chatbot with valid data', async () => {
    const chatbotData = {
      name: 'Test Chatbot',
      system_prompt: 'You are a helpful assistant.',
      hitl_enabled: true,
    }
    
    await testApiHandler({
      handler: listHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            authorization: 'Bearer valid_admin_token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(chatbotData),
        })
        
        expect(res.status).toBe(201)
        const json = await res.json()
        expect(json.data.name).toBe(chatbotData.name)
        expect(json.data.id).toBeDefined()
      },
    })
  })
  
  it('should return 403 for operador trying to create chatbot', async () => {
    await testApiHandler({
      handler: listHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            authorization: 'Bearer valid_operador_token',
            'content-type': 'application/json',
          },
          body: JSON.stringify({ name: 'Test', system_prompt: 'Test' }),
        })
        
        expect(res.status).toBe(403)
      },
    })
  })
  
  it('should return 400 for invalid chatbot data', async () => {
    const invalidData = {
      name: '', // Invalid: empty name
      system_prompt: 'short', // Invalid: too short
    }
    
    await testApiHandler({
      handler: listHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            authorization: 'Bearer valid_admin_token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(invalidData),
        })
        
        expect(res.status).toBe(400)
        const json = await res.json()
        expect(json.error).toBeDefined()
      },
    })
  })
})

describe('/api/chatbots/:id', () => {
  it('should return specific chatbot for authorized user', async () => {
    await testApiHandler({
      handler: itemHandler,
      paramsPatcher: (params) => {
        params.id = 'existing-chatbot-id'
      },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
          headers: {
            authorization: 'Bearer valid_supervisor_token',
          },
        })
        
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.data.id).toBe('existing-chatbot-id')
      },
    })
  })
  
  it('should update chatbot with valid data', async () => {
    const updateData = {
      name: 'Updated Chatbot Name',
      is_active: false,
    }
    
    await testApiHandler({
      handler: itemHandler,
      paramsPatcher: (params) => {
        params.id = 'existing-chatbot-id'
      },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'PUT',
          headers: {
            authorization: 'Bearer valid_admin_token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(updateData),
        })
        
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.data.name).toBe(updateData.name)
        expect(json.data.is_active).toBe(false)
      },
    })
  })
  
  it('should delete chatbot (soft delete)', async () => {
    await testApiHandler({
      handler: itemHandler,
      paramsPatcher: (params) => {
        params.id = 'existing-chatbot-id'
      },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'DELETE',
          headers: {
            authorization: 'Bearer valid_owner_token',
          },
        })
        
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.message).toContain('deleted successfully')
      },
    })
  })
})
```

### Service Unit Tests
```typescript
// __tests__/services/chatbot-service.test.ts
import { ChatbotService } from '@/lib/services/chatbot-service'
import { supabase } from '@/lib/supabase/client'

jest.mock('@/lib/supabase/client')

describe('ChatbotService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  describe('list', () => {
    it('should return paginated chatbots list', async () => {
      const mockData = [
        { id: '1', name: 'Chatbot 1', company_id: 'company-1' },
        { id: '2', name: 'Chatbot 2', company_id: 'company-1' },
      ]
      
      ;(supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: mockData,
                count: 2,
                error: null,
              }),
            }),
          }),
        }),
      })
      
      const result = await ChatbotService.list(
        { page: 1, limit: 20 },
        'company-1',
        'user-1'
      )
      
      expect(result.data).toEqual(mockData)
      expect(result.pagination.total).toBe(2)
      expect(result.pagination.pages).toBe(1)
    })
  })
  
  describe('create', () => {
    it('should create chatbot with default values', async () => {
      const inputData = {
        name: 'New Chatbot',
        system_prompt: 'You are helpful.',
      }
      
      const expectedData = {
        ...inputData,
        id: 'new-chatbot-id',
        company_id: 'company-1',
        is_active: true,
        total_conversations: 0,
      }
      
      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: expectedData,
              error: null,
            }),
          }),
        }),
      })
      
      const result = await ChatbotService.create(
        inputData,
        'company-1',
        'user-1'
      )
      
      expect(result).toEqual(expectedData)
    })
  })
})
```

## Performance Validation
```typescript
// Performance benchmarks
describe('API Performance', () => {
  it('should respond within 200ms for chatbot list', async () => {
    const start = Date.now()
    const response = await fetch('/api/chatbots', {
      headers: { authorization: 'Bearer valid_token' }
    })
    const duration = Date.now() - start
    
    expect(response.status).toBe(200)
    expect(duration).toBeLessThan(200)
  })
  
  it('should respond within 500ms for chatbot creation', async () => {
    const start = Date.now()
    const response = await fetch('/api/chatbots', {
      method: 'POST',
      headers: { 
        authorization: 'Bearer valid_token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Performance Test Bot',
        system_prompt: 'Performance testing chatbot.'
      })
    })
    const duration = Date.now() - start
    
    expect(response.status).toBe(201)
    expect(duration).toBeLessThan(500)
  })
})
```

## Security Validation
### RBAC Testing
```typescript
const testRBAC = async () => {
  const testCases = [
    { role: 'owner', endpoint: 'GET /api/chatbots', expected: 200 },
    { role: 'admin', endpoint: 'GET /api/chatbots', expected: 200 },
    { role: 'supervisor', endpoint: 'GET /api/chatbots', expected: 200 },
    { role: 'operador', endpoint: 'GET /api/chatbots', expected: 200 },
    { role: 'owner', endpoint: 'POST /api/chatbots', expected: 201 },
    { role: 'admin', endpoint: 'POST /api/chatbots', expected: 201 },
    { role: 'supervisor', endpoint: 'POST /api/chatbots', expected: 403 },
    { role: 'operador', endpoint: 'POST /api/chatbots', expected: 403 },
    { role: 'owner', endpoint: 'DELETE /api/chatbots/:id', expected: 200 },
    { role: 'admin', endpoint: 'DELETE /api/chatbots/:id', expected: 200 },
    { role: 'supervisor', endpoint: 'DELETE /api/chatbots/:id', expected: 403 },
    { role: 'operador', endpoint: 'DELETE /api/chatbots/:id', expected: 403 },
  ]
  
  for (const testCase of testCases) {
    const token = generateTokenForRole(testCase.role)
    const response = await callAPI(testCase.endpoint, token)
    expect(response.status).toBe(testCase.expected)
  }
}
```

### Input Validation Testing
```typescript
const testInputValidation = async () => {
  const maliciousInputs = [
    { name: "'; DROP TABLE chatbots; --" }, // SQL injection
    { system_prompt: "<script>alert('xss')</script>" }, // XSS
    { name: "a".repeat(300) }, // Too long string
    { response_delay_ms: -1 }, // Invalid number
    { max_context_messages: 1000 }, // Above maximum
  ]
  
  for (const input of maliciousInputs) {
    const response = await fetch('/api/chatbots', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid_token',
        'content-type': 'application/json'
      },
      body: JSON.stringify(input)
    })
    expect(response.status).toBe(400) // Should reject invalid input
  }
}
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- API implemented: /api/chatbots (GET, POST), /api/chatbots/:id (GET, PUT, DELETE)
- Methods: GET, POST, PUT, DELETE
- RBAC: owner/admin (full), supervisor (read/update), operador (read only)
- Tests: 25/25 passed
- Performance: 150ms avg response time
- Next task: TASK-P1E3-03c (chatbot management UI)
```

## Troubleshooting API
### Common Issues
- **CORS Errors:** Verificar Next.js middleware configuration
- **Authentication Failures:** Verificar Supabase JWT validation
- **Database Connection:** Verificar Supabase connection string y RLS policies
- **RLS Policy Errors:** Verificar que company_id esté incluido en todas las queries

### Debugging Commands
```bash
# Test endpoints locally
curl -X GET http://localhost:3000/api/chatbots \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json"

# Create chatbot
curl -X POST http://localhost:3000/api/chatbots \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Bot","system_prompt":"Test prompt"}'

# Database query debugging
supabase logs api --level error
supabase logs db --level error

# Performance profiling
npm run build:analyze
npm run test:performance
```

---
*Tarea específica para implementar API REST completa de chatbots con autenticación, autorización RBAC, validación y testing.*