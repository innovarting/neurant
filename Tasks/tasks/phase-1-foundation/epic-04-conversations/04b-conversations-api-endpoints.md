# TASK-P1E4-04b: Conversations API Endpoints

## Identificación
- **ID:** TASK-P1E4-04b
- **Título:** Conversations & Messages API Endpoints
- **Type:** API
- **Phase:** 1 - Foundation
- **Epic:** Epic 4 - Conversations
- **Sprint:** Sprint 1.2
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 10 horas
- **Prioridad:** Media

## Definición Técnica
Implementar API REST completa para gestión de conversaciones y mensajes, incluyendo endpoints CRUD, búsqueda full-text, real-time subscriptions con Supabase, webhooks para channels externos, y analytics básicos con optimizaciones de performance.

## Referencias de Documentación NeurAnt
- **API Contracts:** `docs/architecture/11-interfaces-contratos-rbac.md:400-450` (RBAC conversation permissions)
- **Database Schema:** `docs/architecture/13-diagrama-entidad-relacion.md:227-280` (entidades CONVERSATIONS y MESSAGES)
- **Implementation Guide:** `docs/architecture/12-guias-implementacion-rbac.md:100-150` (patrones API)
- **Tech Stack:** `docs/architecture/04-tech-stack.md:50-100` (Next.js API Routes + real-time)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E4-04a ✅ (conversations database schema)
  - [x] TASK-P1E3-03b ✅ (chatbot API endpoints)
  - [x] TASK-P1E2-02f ✅ (RBAC middleware)
- **Bloquea:**
  - [ ] TASK-P1E4-04c (conversation history UI)
  - [ ] TASK-P1E4-04d (basic analytics dashboard)

## API Specification
### Endpoints
```
// Conversations Management
GET    /api/conversations                 # List conversations with pagination
GET    /api/conversations/:id             # Get conversation with messages
POST   /api/conversations                 # Create new conversation
PUT    /api/conversations/:id             # Update conversation
DELETE /api/conversations/:id             # Delete conversation
PUT    /api/conversations/:id/status      # Update conversation status
PUT    /api/conversations/:id/assign      # Assign to operator

// Messages Management  
GET    /api/conversations/:id/messages    # Get conversation messages
POST   /api/conversations/:id/messages    # Send new message
PUT    /api/messages/:id                  # Update message
DELETE /api/messages/:id                  # Delete message
POST   /api/messages/:id/reactions        # Add reaction to message

// Search & Analytics
GET    /api/conversations/search          # Search conversations/messages
GET    /api/conversations/analytics       # Basic analytics
POST   /api/conversations/bulk-update     # Bulk operations

// External Webhooks
POST   /api/webhooks/conversations        # External channel webhooks
GET    /api/webhooks/conversations/health # Health check

// Real-time subscriptions (Supabase)
WebSocket: conversations:company_id       # Real-time conversation updates
WebSocket: messages:conversation_id       # Real-time message updates
```

### Authentication & Authorization
- **Authentication:** Supabase JWT required for all endpoints
- **RBAC Permissions:**
  - `owner/admin`: Full access to all conversations
  - `supervisor`: Access to assigned conversations + team conversations
  - `operador`: Access only to assigned conversations
- **Webhook Auth:** HMAC signature verification for external webhooks

## Request/Response Schemas

### Conversation Schemas
```typescript
interface ConversationListParams {
  page?: number
  limit?: number
  status?: 'active' | 'ended' | 'transferred' | 'abandoned' | 'waiting_human'
  chatbot_id?: string
  assigned_operator_id?: string
  start_date?: string
  end_date?: string
  search?: string
  sort?: 'started_at' | 'last_message_at' | 'message_count'
  order?: 'asc' | 'desc'
}

interface CreateConversationRequest {
  chatbot_id: string
  end_user_id: string
  end_user_name?: string
  end_user_avatar?: string
  channel: string
  context_data?: Record<string, any>
}

interface UpdateConversationRequest {
  status?: 'active' | 'ended' | 'transferred' | 'abandoned' | 'waiting_human'
  assigned_operator_id?: string
  satisfaction_rating?: number
  satisfaction_comment?: string
  context_data?: Record<string, any>
  conversation_summary?: string
}

interface ConversationResponse {
  id: string
  company_id: string
  chatbot_id: string
  chatbot?: {
    name: string
    avatar_url?: string
  }
  end_user_id: string
  end_user_name?: string
  end_user_avatar?: string
  channel: string
  status: string
  is_hitl_active: boolean
  assigned_operator?: {
    id: string
    first_name: string
    last_name: string
  }
  hitl_activated_at?: string
  hitl_reason?: string
  message_count: number
  bot_message_count: number
  human_message_count: number
  avg_response_time_ms: number
  started_at: string
  last_message_at: string
  ended_at?: string
  session_duration_minutes?: number
  satisfaction_rating?: number
  satisfaction_comment?: string
  context_data: Record<string, any>
  conversation_summary?: string
  created_at: string
  updated_at: string
}
```

### Message Schemas
```typescript
interface MessageListParams {
  page?: number
  limit?: number
  before?: string // Cursor-based pagination for real-time
  after?: string
  sender_type?: 'bot' | 'human' | 'end_user' | 'system'
  message_type?: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'system'
}

interface CreateMessageRequest {
  content: string
  message_type?: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'system'
  media_url?: string
  media_type?: string
  sender_type: 'bot' | 'human' | 'end_user' | 'system'
  external_message_id?: string
  processing_time_ms?: number
  tokens_used?: number
  model_used?: string
  used_knowledge_base?: boolean
  knowledge_sources?: Array<any>
  confidence_score?: number
}

interface MessageResponse {
  id: string
  conversation_id: string
  content: string
  message_type: string
  media_url?: string
  media_type?: string
  sender_type: string
  sender?: {
    id: string
    first_name?: string
    last_name?: string
    avatar_url?: string
  }
  n8n_message_id?: string
  n8n_workflow_id?: string
  external_message_id?: string
  processing_time_ms: number
  tokens_used: number
  model_used?: string
  status: string
  delivered_at?: string
  read_at?: string
  used_knowledge_base: boolean
  knowledge_sources: Array<any>
  confidence_score?: number
  reactions: MessageReactionResponse[]
  created_at: string
  updated_at: string
}

interface MessageReactionRequest {
  reaction_type: 'thumbs_up' | 'thumbs_down' | 'helpful' | 'not_helpful' | 'love' | 'confused'
  feedback_text?: string
}
```

## Criterios de Aceptación Específicos
### API Implementation
- [ ] Todos los endpoints implementados en Next.js API Routes
- [ ] Request/response validation con Zod schemas
- [ ] Paginación eficiente (offset-based + cursor-based para messages)
- [ ] Error handling apropiado con códigos HTTP estándar

### Security & Authorization
- [ ] Authentication verificada en todos los endpoints
- [ ] RBAC authorization según permisos de rol
- [ ] RLS policies respetadas en queries de database
- [ ] Input sanitization y rate limiting implementado

### Real-time Features
- [ ] Supabase real-time subscriptions configuradas
- [ ] WebSocket events para nuevos messages y status updates
- [ ] Graceful handling de connection drops
- [ ] Optimistic updates con conflict resolution

### Performance & Scalability
- [ ] Response times < 200ms p95 para GET operations
- [ ] Response times < 500ms p95 para POST/PUT operations
- [ ] Database queries optimizadas con índices apropiados
- [ ] Caching strategies para conversation lists

## Archivos a Crear/Modificar
```
// Conversation endpoints
app/api/conversations/route.ts                    # GET, POST /api/conversations
app/api/conversations/[id]/route.ts               # GET, PUT, DELETE /api/conversations/:id
app/api/conversations/[id]/status/route.ts        # PUT status updates
app/api/conversations/[id]/assign/route.ts        # PUT operator assignment
app/api/conversations/[id]/messages/route.ts      # GET, POST messages
app/api/conversations/search/route.ts             # GET search
app/api/conversations/analytics/route.ts          # GET analytics
app/api/conversations/bulk-update/route.ts        # POST bulk operations

// Message endpoints  
app/api/messages/[id]/route.ts                    # PUT, DELETE /api/messages/:id
app/api/messages/[id]/reactions/route.ts          # POST reactions

// Webhook endpoints
app/api/webhooks/conversations/route.ts           # POST external webhooks
app/api/webhooks/conversations/health/route.ts    # GET health check

// Services and utilities
lib/services/conversation-service.ts              # Business logic
lib/services/message-service.ts                   # Message operations
lib/services/real-time-service.ts                 # Real-time management
lib/validations/conversation.ts                   # Zod schemas
lib/validations/message.ts                        # Message schemas
lib/utils/pagination.ts                           # Pagination helpers
types/conversation-api.ts                         # API type definitions

// Tests
__tests__/api/conversations.test.ts               # API integration tests
__tests__/api/messages.test.ts                    # Message API tests
__tests__/services/conversation-service.test.ts   # Service unit tests
```

## Implementation

### Conversation List Endpoint
```tsx
// app/api/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/middleware/auth'
import { requirePermission } from '@/lib/middleware/rbac'
import { ConversationService } from '@/lib/services/conversation-service'
import { ConversationListSchema } from '@/lib/validations/conversation'

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const user = await validateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Authorization
    if (!requirePermission(user.role, 'conversation', 'read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // 3. Parse and validate query parameters
    const params = Object.fromEntries(request.nextUrl.searchParams)
    const validated = ConversationListSchema.parse(params)

    // 4. Apply role-based filtering
    const roleFilter = {
      owner: {}, // Can see all conversations
      admin: {}, // Can see all conversations
      supervisor: {
        // Can see conversations assigned to them or their team
        or: [
          { assigned_operator_id: user.id },
          { assigned_operator_id: null }, // Unassigned conversations
        ]
      },
      operador: {
        // Can only see conversations assigned to them
        assigned_operator_id: user.id
      }
    }

    const filters = {
      ...validated,
      ...roleFilter[user.role as keyof typeof roleFilter]
    }

    // 5. Get conversations
    const result = await ConversationService.list(filters, user.company_id)

    return NextResponse.json(result)

  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await validateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!requirePermission(user.role, 'conversation', 'create')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validated = CreateConversationSchema.parse(body)

    // Ensure the chatbot belongs to the user's company
    const chatbotAccess = await ConversationService.verifyChatbotAccess(
      validated.chatbot_id, 
      user.company_id
    )
    
    if (!chatbotAccess) {
      return NextResponse.json({ error: 'Chatbot not found or access denied' }, { status: 404 })
    }

    const conversation = await ConversationService.create(validated, user.company_id)

    return NextResponse.json({ data: conversation }, { status: 201 })

  } catch (error) {
    return handleApiError(error)
  }
}
```

### Individual Conversation Endpoint
```tsx
// app/api/conversations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/middleware/auth'
import { requireScope } from '@/lib/middleware/rbac'
import { ConversationService } from '@/lib/services/conversation-service'
import { UpdateConversationSchema } from '@/lib/validations/conversation'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await validateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access to this specific conversation
    const hasAccess = await requireScope(user, 'conversation', params.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to this conversation' }, { status: 403 })
    }

    // Parse query parameters for message pagination
    const messagesBefore = request.nextUrl.searchParams.get('messages_before')
    const messagesLimit = parseInt(request.nextUrl.searchParams.get('messages_limit') || '50')

    const result = await ConversationService.getWithMessages(
      params.id,
      user.company_id,
      {
        messagesBefore,
        messagesLimit: Math.min(messagesLimit, 100) // Cap at 100
      }
    )

    if (!result.conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        conversation: result.conversation,
        messages: result.messages,
        pagination: result.pagination
      }
    })

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

    const hasAccess = await requireScope(user, 'conversation', params.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to this conversation' }, { status: 403 })
    }

    const body = await request.json()
    const validated = UpdateConversationSchema.parse(body)

    // Special authorization for certain updates
    if (validated.assigned_operator_id && !requirePermission(user.role, 'conversation', 'assign')) {
      return NextResponse.json({ error: 'Insufficient permissions to assign operators' }, { status: 403 })
    }

    const conversation = await ConversationService.update(
      params.id,
      validated,
      user.company_id,
      user.id
    )

    return NextResponse.json({ data: conversation })

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

    if (!requirePermission(user.role, 'conversation', 'delete')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const hasAccess = await requireScope(user, 'conversation', params.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to this conversation' }, { status: 403 })
    }

    await ConversationService.delete(params.id, user.company_id, user.id)

    return NextResponse.json({ message: 'Conversation deleted successfully' })

  } catch (error) {
    return handleApiError(error)
  }
}
```

### Messages Endpoint
```tsx
// app/api/conversations/[id]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/middleware/auth'
import { requireScope } from '@/lib/middleware/rbac'
import { MessageService } from '@/lib/services/message-service'
import { CreateMessageSchema, MessageListSchema } from '@/lib/validations/message'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await validateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAccess = await requireScope(user, 'conversation', params.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to this conversation' }, { status: 403 })
    }

    const queryParams = Object.fromEntries(request.nextUrl.searchParams)
    const validated = MessageListSchema.parse(queryParams)

    const result = await MessageService.list(
      params.id,
      validated,
      user.company_id
    )

    return NextResponse.json({
      data: result.messages,
      pagination: result.pagination
    })

  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await validateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAccess = await requireScope(user, 'conversation', params.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to this conversation' }, { status: 403 })
    }

    const body = await request.json()
    const validated = CreateMessageSchema.parse(body)

    // Set sender_id for human messages
    if (validated.sender_type === 'human') {
      validated.sender_id = user.id
    }

    const message = await MessageService.create(
      params.id,
      validated,
      user.company_id
    )

    // Trigger real-time update
    await MessageService.broadcastMessage(message)

    // Trigger n8n workflow if needed
    if (validated.sender_type === 'end_user') {
      await MessageService.triggerWorkflow(params.id, message)
    }

    return NextResponse.json({ data: message }, { status: 201 })

  } catch (error) {
    return handleApiError(error)
  }
}
```

### Search Endpoint
```tsx
// app/api/conversations/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/middleware/auth'
import { ConversationService } from '@/lib/services/conversation-service'
import { SearchSchema } from '@/lib/validations/conversation'

export async function GET(request: NextRequest) {
  try {
    const user = await validateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = Object.fromEntries(request.nextUrl.searchParams)
    const validated = SearchSchema.parse(params)

    if (!validated.q || validated.q.length < 2) {
      return NextResponse.json({ 
        error: 'Search query must be at least 2 characters' 
      }, { status: 400 })
    }

    // Apply role-based filtering
    const filters = {
      companyId: user.company_id,
      query: validated.q,
      chatbotId: validated.chatbot_id,
      limit: Math.min(validated.limit || 20, 100),
      userRole: user.role,
      userId: user.id
    }

    const result = await ConversationService.search(filters)

    return NextResponse.json({
      data: {
        conversations: result.conversations,
        messages: result.messages,
        total: result.total
      }
    })

  } catch (error) {
    return handleApiError(error)
  }
}
```

### Analytics Endpoint
```tsx
// app/api/conversations/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/middleware/auth'
import { requirePermission } from '@/lib/middleware/rbac'
import { ConversationService } from '@/lib/services/conversation-service'
import { AnalyticsSchema } from '@/lib/validations/conversation'

export async function GET(request: NextRequest) {
  try {
    const user = await validateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!requirePermission(user.role, 'analytics', 'read')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const params = Object.fromEntries(request.nextUrl.searchParams)
    const validated = AnalyticsSchema.parse(params)

    const analytics = await ConversationService.getAnalytics({
      companyId: user.company_id,
      chatbotId: validated.chatbot_id,
      startDate: validated.start_date,
      endDate: validated.end_date,
      userRole: user.role,
      userId: user.id
    })

    return NextResponse.json({
      data: analytics
    })

  } catch (error) {
    return handleApiError(error)
  }
}
```

### Webhook Endpoint
```tsx
// app/api/webhooks/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateWebhookSignature } from '@/lib/utils/webhook-validation'
import { ConversationService } from '@/lib/services/conversation-service'
import { MessageService } from '@/lib/services/message-service'

interface WebhookPayload {
  type: 'message_received' | 'conversation_started' | 'conversation_ended'
  channel: string
  conversation_id?: string
  end_user_id: string
  end_user_name?: string
  message?: {
    content: string
    type: 'text' | 'image' | 'file' | 'audio'
    media_url?: string
    timestamp: string
  }
  metadata?: Record<string, any>
  signature: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const payload: WebhookPayload = JSON.parse(body)

    // 1. Validate webhook signature
    const expectedSignature = validateWebhookSignature(body, payload.channel)
    if (payload.signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 2. Handle different webhook types
    switch (payload.type) {
      case 'conversation_started':
        await handleConversationStarted(payload)
        break
      case 'message_received':
        await handleMessageReceived(payload)
        break
      case 'conversation_ended':
        await handleConversationEnded(payload)
        break
      default:
        return NextResponse.json({ error: 'Unknown webhook type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ 
      error: 'Webhook processing failed' 
    }, { status: 500 })
  }
}

async function handleMessageReceived(payload: WebhookPayload) {
  if (!payload.conversation_id || !payload.message) {
    throw new Error('Missing required fields for message_received')
  }

  // Create message
  const message = await MessageService.createFromWebhook({
    conversationId: payload.conversation_id,
    content: payload.message.content,
    messageType: payload.message.type,
    mediaUrl: payload.message.media_url,
    senderType: 'end_user',
    externalMessageId: payload.metadata?.external_id,
    timestamp: payload.message.timestamp
  })

  // Trigger chatbot response workflow
  await MessageService.triggerWorkflow(payload.conversation_id, message)
}

async function handleConversationStarted(payload: WebhookPayload) {
  // Find or create conversation
  const conversation = await ConversationService.findOrCreate({
    endUserId: payload.end_user_id,
    endUserName: payload.end_user_name,
    channel: payload.channel,
    contextData: payload.metadata
  })

  return conversation
}

async function handleConversationEnded(payload: WebhookPayload) {
  if (!payload.conversation_id) {
    throw new Error('Missing conversation_id for conversation_ended')
  }

  await ConversationService.end(
    payload.conversation_id,
    payload.metadata?.reason || 'ended_by_channel'
  )
}

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
}
```

### Service Implementation
```tsx
// lib/services/conversation-service.ts
import { supabase } from '@/lib/supabase/client'
import { ConversationQueries } from '@/lib/database/conversation-queries'
import { realtimeService } from '@/lib/services/real-time-service'
import type { 
  ConversationListParams,
  CreateConversationRequest,
  UpdateConversationRequest,
  ConversationResponse 
} from '@/types/conversation-api'

export class ConversationService {
  static async list(
    params: ConversationListParams & { userRole?: string; userId?: string },
    companyId: string
  ) {
    const { userRole, userId, ...filters } = params

    // Apply role-based access control
    let accessFilter = {}
    if (userRole === 'operador') {
      accessFilter = { assigned_operator_id: userId }
    } else if (userRole === 'supervisor') {
      // Supervisors can see unassigned + assigned to them
      accessFilter = { 
        or: [
          { assigned_operator_id: userId },
          { assigned_operator_id: null }
        ]
      }
    }

    const result = await ConversationQueries.getConversations({
      companyId,
      ...filters,
      ...accessFilter
    })

    if (result.error) {
      throw new Error(`Failed to fetch conversations: ${result.error.message}`)
    }

    return {
      data: result.data || [],
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total: result.count || 0,
        pages: Math.ceil((result.count || 0) / (filters.limit || 20))
      }
    }
  }

  static async getWithMessages(
    conversationId: string,
    companyId: string,
    options: {
      messagesBefore?: string | null
      messagesLimit?: number
    } = {}
  ) {
    const result = await ConversationQueries.getConversationWithMessages(
      conversationId,
      options
    )

    if (result.error) {
      throw new Error(`Failed to fetch conversation: ${result.error.message}`)
    }

    // Verify company access
    if (result.conversation?.company_id !== companyId) {
      throw new Error('Access denied to this conversation')
    }

    return {
      conversation: result.conversation,
      messages: result.messages,
      pagination: {
        has_more: result.messages.length === (options.messagesLimit || 50),
        oldest_message_id: result.messages[0]?.id,
        newest_message_id: result.messages[result.messages.length - 1]?.id
      }
    }
  }

  static async create(
    data: CreateConversationRequest,
    companyId: string
  ): Promise<ConversationResponse> {
    const conversationData = {
      ...data,
      company_id: companyId,
      status: 'active' as const,
      message_count: 0,
      bot_message_count: 0,
      human_message_count: 0,
      context_data: data.context_data || {}
    }

    const result = await ConversationQueries.createConversation(conversationData)

    if (result.error) {
      throw new Error(`Failed to create conversation: ${result.error.message}`)
    }

    // Broadcast real-time update
    await this.broadcastConversationUpdate(result.data, 'created')

    return result.data
  }

  static async update(
    conversationId: string,
    data: UpdateConversationRequest,
    companyId: string,
    updatedBy: string
  ): Promise<ConversationResponse> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
      // Add HITL activation tracking
      ...(data.assigned_operator_id && {
        is_hitl_active: true,
        hitl_activated_at: new Date().toISOString()
      })
    }

    const { data: conversation, error } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', conversationId)
      .eq('company_id', companyId)
      .select(`
        *,
        chatbots(name, avatar_url),
        users(first_name, last_name)
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Conversation not found')
      }
      throw new Error(`Failed to update conversation: ${error.message}`)
    }

    // Broadcast real-time update
    await this.broadcastConversationUpdate(conversation, 'updated')

    return conversation
  }

  static async delete(
    conversationId: string,
    companyId: string,
    deletedBy: string
  ): Promise<void> {
    // Soft delete by setting status to 'ended'
    const { error } = await supabase
      .from('conversations')
      .update({ 
        status: 'ended',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .eq('company_id', companyId)

    if (error) {
      throw new Error(`Failed to delete conversation: ${error.message}`)
    }

    // Broadcast real-time update
    await this.broadcastConversationUpdate({ 
      id: conversationId, 
      status: 'ended' 
    }, 'deleted')
  }

  static async search(filters: {
    companyId: string
    query: string
    chatbotId?: string
    limit: number
    userRole: string
    userId: string
  }) {
    // Apply role-based filtering for search
    let roleFilter = ''
    if (filters.userRole === 'operador') {
      roleFilter = `AND c.assigned_operator_id = '${filters.userId}'`
    }

    const searchQuery = `
      SELECT 
        c.id, c.end_user_name, c.status, c.started_at,
        cb.name as chatbot_name,
        ts_rank(to_tsvector('spanish', c.conversation_summary), plainto_tsquery('spanish', $1)) as rank
      FROM conversations c
      JOIN chatbots cb ON c.chatbot_id = cb.id
      WHERE c.company_id = $2
        AND (
          to_tsvector('spanish', COALESCE(c.conversation_summary, '')) @@ plainto_tsquery('spanish', $1)
          OR c.end_user_name ILIKE '%' || $1 || '%'
          OR c.end_user_id ILIKE '%' || $1 || '%'
        )
        ${filters.chatbotId ? `AND c.chatbot_id = '${filters.chatbotId}'` : ''}
        ${roleFilter}
      ORDER BY rank DESC, c.started_at DESC
      LIMIT $3
    `

    const { data: conversations, error: convError } = await supabase.rpc('exec_sql', {
      query: searchQuery,
      params: [filters.query, filters.companyId, filters.limit]
    })

    // Also search messages
    const { data: messages, error: msgError } = await supabase.rpc('search_messages', {
      company_uuid: filters.companyId,
      search_query: filters.query,
      limit_count: filters.limit
    })

    if (convError || msgError) {
      throw new Error('Search failed')
    }

    return {
      conversations: conversations || [],
      messages: messages || [],
      total: (conversations?.length || 0) + (messages?.length || 0)
    }
  }

  static async getAnalytics(options: {
    companyId: string
    chatbotId?: string
    startDate?: string
    endDate?: string
    userRole: string
    userId: string
  }) {
    const { companyId, chatbotId, startDate, endDate, userRole, userId } = options

    // Base query with role-based filtering
    let query = supabase
      .from('conversations')
      .select('status, message_count, session_duration_minutes, satisfaction_rating, created_at')
      .eq('company_id', companyId)

    if (chatbotId) query = query.eq('chatbot_id', chatbotId)
    if (startDate) query = query.gte('created_at', startDate)
    if (endDate) query = query.lte('created_at', endDate)

    // Apply role-based filtering
    if (userRole === 'operador') {
      query = query.eq('assigned_operator_id', userId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch analytics: ${error.message}`)
    }

    // Calculate metrics
    const total = data.length
    const active = data.filter(c => c.status === 'active').length
    const ended = data.filter(c => c.status === 'ended').length
    const avgDuration = data
      .filter(c => c.session_duration_minutes)
      .reduce((sum, c) => sum + (c.session_duration_minutes || 0), 0) / 
      data.filter(c => c.session_duration_minutes).length

    const avgMessages = data.reduce((sum, c) => sum + c.message_count, 0) / total
    const avgSatisfaction = data
      .filter(c => c.satisfaction_rating)
      .reduce((sum, c) => sum + (c.satisfaction_rating || 0), 0) /
      data.filter(c => c.satisfaction_rating).length

    return {
      total_conversations: total,
      active_conversations: active,
      ended_conversations: ended,
      avg_session_duration_minutes: Math.round(avgDuration || 0),
      avg_messages_per_conversation: Math.round(avgMessages || 0),
      avg_satisfaction_rating: Math.round((avgSatisfaction || 0) * 10) / 10,
      satisfaction_responses: data.filter(c => c.satisfaction_rating).length
    }
  }

  static async verifyChatbotAccess(chatbotId: string, companyId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('chatbots')
      .select('id')
      .eq('id', chatbotId)
      .eq('company_id', companyId)
      .single()

    return !error && !!data
  }

  private static async broadcastConversationUpdate(
    conversation: any,
    eventType: 'created' | 'updated' | 'deleted'
  ) {
    try {
      await realtimeService.broadcast(`conversations:${conversation.company_id}`, {
        type: 'conversation_updated',
        event_type: eventType,
        conversation
      })
    } catch (error) {
      console.error('Failed to broadcast conversation update:', error)
    }
  }
}
```

## Testing Implementation
```tsx
// __tests__/api/conversations.test.ts
import { testApiHandler } from 'next-test-api-route-handler'
import * as conversationsHandler from '@/app/api/conversations/route'
import * as conversationHandler from '@/app/api/conversations/[id]/route'

const mockConversations = [
  {
    id: 'conv-1',
    company_id: 'company-1',
    chatbot_id: 'bot-1',
    end_user_id: 'user-1',
    channel: 'web',
    status: 'active',
    message_count: 5,
    created_at: '2024-01-01T00:00:00Z'
  }
]

describe('/api/conversations', () => {
  it('should return conversation list for authorized user', async () => {
    await testApiHandler({
      handler: conversationsHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
          headers: {
            authorization: 'Bearer valid_admin_token',
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

  it('should create conversation with valid data', async () => {
    const conversationData = {
      chatbot_id: 'bot-1',
      end_user_id: 'user-123',
      end_user_name: 'John Doe',
      channel: 'web'
    }
    
    await testApiHandler({
      handler: conversationsHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            authorization: 'Bearer valid_admin_token',
            'content-type': 'application/json',
          },
          body: JSON.stringify(conversationData),
        })
        
        expect(res.status).toBe(201)
        const json = await res.json()
        expect(json.data.end_user_id).toBe(conversationData.end_user_id)
        expect(json.data.channel).toBe(conversationData.channel)
      },
    })
  })

  it('should filter conversations by role (operador)', async () => {
    await testApiHandler({
      handler: conversationsHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
          headers: {
            authorization: 'Bearer valid_operador_token', // Role: operador
          },
        })
        
        expect(res.status).toBe(200)
        const json = await res.json()
        // Should only return conversations assigned to this operator
        expect(json.data.every((conv: any) => 
          conv.assigned_operator_id === 'operador-user-id' || 
          conv.assigned_operator_id === null
        )).toBe(true)
      },
    })
  })
})

describe('/api/conversations/:id', () => {
  it('should return conversation with messages', async () => {
    await testApiHandler({
      handler: conversationHandler,
      paramsPatcher: (params) => {
        params.id = 'conv-1'
      },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
          headers: {
            authorization: 'Bearer valid_admin_token',
          },
        })
        
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.data.conversation).toBeDefined()
        expect(json.data.messages).toBeDefined()
        expect(Array.isArray(json.data.messages)).toBe(true)
      },
    })
  })

  it('should update conversation status', async () => {
    const updateData = {
      status: 'ended',
      satisfaction_rating: 5,
      satisfaction_comment: 'Great service!'
    }
    
    await testApiHandler({
      handler: conversationHandler,
      paramsPatcher: (params) => {
        params.id = 'conv-1'
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
        expect(json.data.status).toBe('ended')
        expect(json.data.satisfaction_rating).toBe(5)
      },
    })
  })
})
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- API implemented: Conversations & Messages REST API completa
- Endpoints: 12 endpoints principales + webhooks + real-time
- RBAC: Role-based filtering (owner/admin/supervisor/operador)
- Features: CRUD, search, analytics, bulk operations, real-time updates
- Performance: Optimized queries, pagination, caching strategies
- Testing: Comprehensive API integration tests
- Integration: n8n workflow triggers, Supabase real-time
- Next UI task: TASK-P1E4-04c (conversation history UI)
- Ready for frontend integration: ✅ Complete API available
```

## Troubleshooting API
### Common Issues
- **RLS Policy Violations:** Verificar company_id en JWT claims y queries
- **Real-time Connection Drops:** Implementar reconnection logic en cliente
- **Search Performance:** Optimizar índices GIN para full-text search
- **Message Ordering:** Asegurar timestamp consistency entre timezone

### Debugging Commands
```bash
# Test API endpoints locally
curl -X GET http://localhost:3000/api/conversations \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json"

# Test webhook endpoint
curl -X POST http://localhost:3000/api/webhooks/conversations \
  -H "Content-Type: application/json" \
  -d '{"type":"message_received","channel":"web",...}'

# Monitor real-time subscriptions
supabase logs realtime --level info

# Performance monitoring
npm run build:analyze
npm run test:load-test
```

---
*Tarea específica para implementar API REST completa de conversaciones y mensajes con real-time updates, search, analytics, webhooks y optimizaciones de performance.*