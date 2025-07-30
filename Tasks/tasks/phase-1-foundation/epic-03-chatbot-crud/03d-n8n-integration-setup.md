# TASK-P1E3-03d: n8n Integration Setup

## Identificación
- **ID:** TASK-P1E3-03d
- **Título:** n8n Workflow Integration Setup
- **Type:** Frontend Integration
- **Phase:** 1 - Foundation
- **Epic:** Epic 3 - Chatbot CRUD
- **Sprint:** Sprint 1.2
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 10 horas
- **Prioridad:** Alta

## Definición Técnica
Implementar integración bidireccional entre NeurAnt y n8n Cloud para automatización de workflows de chatbots. Incluye configuración de webhooks, gestión de estados de workflow, monitoreo de ejecuciones y manejo de errores con reintentos automáticos.

## Referencias de Documentación NeurAnt
- **API Contracts:** `docs/architecture/11-interfaces-contratos-rbac.md:400-450` (webhook authentication)
- **Integration Patterns:** `docs/architecture/04-tech-stack.md:150-180` (n8n Cloud architecture)
- **Real-time Requirements:** `docs/architecture/adrs/002-messaging-architecture.md:50-100` (async messaging)
- **Tech Stack:** `docs/architecture/04-tech-stack.md:50-75` (integration tools)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E3-03b ✅ (chatbot API endpoints)
  - [x] TASK-P1E3-03c ✅ (chatbot management UI)
  - [x] TASK-P1E2-02e ✅ (auth context provider)
  - [x] TASK-P1E1-01b ✅ (Supabase configuration)
- **Bloquea:**
  - [ ] TASK-P1E4-04b (conversation APIs que usan workflows)
  - [ ] TASK-P2E1-05a (RAG integration workflows)

## Integration Specifications
### Communication Pattern
- **Type:** Webhook bidireccional + REST API calls
- **Authentication:** API Key + HMAC signature verification
- **Data Format:** JSON with structured payload schemas
- **Error Handling:** Exponential backoff retry with dead letter queue

### Real-time Requirements
- **Protocol:** HTTP webhooks para eventos críticos
- **Events:** workflow_started, workflow_completed, workflow_failed, step_completed
- **Reconnection:** Automatic retry con circuit breaker pattern
- **Offline Support:** Queue de eventos con sincronización diferida

### Data Flow Architecture
```tsx
// n8n Integration flow structure
interface N8nIntegrationFlow {
  // Input from NeurAnt
  trigger: {
    type: 'chatbot_created' | 'conversation_started' | 'message_received'
    payload: ChatbotTriggerPayload
    timestamp: string
    signature: string
  }
  
  // n8n processing
  workflow: {
    id: string
    execution_id: string
    status: 'running' | 'completed' | 'failed' | 'waiting'
    steps: WorkflowStep[]
    progress: number
  }
  
  // Response back to NeurAnt
  result: {
    success: boolean
    data?: any
    error?: {
      code: string
      message: string
      details: Record<string, any>
    }
    execution_time_ms: number
  }
  
  // State synchronization
  stateUpdate: {
    chatbot_id: string
    workflow_status: WorkflowStatus
    last_execution: string
    next_scheduled?: string
  }
}
```

## Criterios de Aceptación Específicos
### Webhook Integration
- [ ] Webhooks salientes configurados para eventos de chatbot
- [ ] Webhooks entrantes para recibir resultados de n8n
- [ ] Signature verification implementada (HMAC-SHA256)
- [ ] Rate limiting y circuit breaker patterns

### Workflow Management
- [ ] Trigger automático de workflows al crear chatbots
- [ ] Monitoreo de estado de ejecución en tiempo real
- [ ] Reintentos automáticos para fallos transitorios
- [ ] Dashboard de workflows con métricas

### Data Synchronization
- [ ] Estado de workflows sincronizado con Supabase
- [ ] Cache de resultados para mejorar performance
- [ ] Conflict resolution para estados inconsistentes
- [ ] Audit log de todas las interacciones n8n

### Performance & UX
- [ ] Loading states para operaciones asíncronas
- [ ] Progress tracking con porcentaje de completitud
- [ ] Error notifications con acciones de recovery
- [ ] Timeout handling con fallback graceful

## Archivos a Crear/Modificar
```
lib/integrations/n8n-client.ts
lib/integrations/n8n-webhooks.ts
lib/services/workflow-service.ts
lib/utils/signature-validation.ts
hooks/use-workflows.ts
hooks/use-workflow-status.ts
components/workflow/workflow-status.tsx
components/workflow/workflow-monitor.tsx
components/workflow/workflow-logs.tsx
types/workflow.ts
types/n8n.ts
app/api/webhooks/n8n/route.ts
app/dashboard/workflows/page.tsx
__tests__/integrations/n8n-client.test.ts
__tests__/api/webhooks/n8n.test.ts
```

## Implementation

### n8n API Client
```tsx
// lib/integrations/n8n-client.ts
import { apiClient } from '@/lib/utils/api-client'
import { createHmac } from 'crypto'

interface N8nConfig {
  baseUrl: string
  apiKey: string
  webhookSecret: string
}

interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'running' | 'success' | 'failed' | 'waiting'
  data: any
  startedAt: string
  finishedAt?: string
  executionTime?: number
}

interface WorkflowTrigger {
  chatbotId: string
  event: string
  payload: Record<string, any>
  timestamp: string
}

export class N8nClient {
  private config: N8nConfig
  private baseHeaders: Record<string, string>

  constructor() {
    this.config = {
      baseUrl: process.env.N8N_BASE_URL!,
      apiKey: process.env.N8N_API_KEY!,
      webhookSecret: process.env.N8N_WEBHOOK_SECRET!
    }

    this.baseHeaders = {
      'X-N8N-API-KEY': this.config.apiKey,
      'Content-Type': 'application/json'
    }
  }

  // Trigger workflow execution
  async triggerWorkflow(
    workflowId: string, 
    data: WorkflowTrigger
  ): Promise<{ executionId: string; status: string }> {
    const timestamp = new Date().toISOString()
    const payload = {
      ...data,
      timestamp,
      source: 'neurant'
    }

    const signature = this.generateSignature(JSON.stringify(payload))

    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          ...this.baseHeaders,
          'X-N8N-Signature': signature
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new N8nError(
          response.status,
          `Failed to trigger workflow: ${response.statusText}`,
          await response.json().catch(() => ({}))
        )
      }

      const result = await response.json()
      return {
        executionId: result.data.executionId,
        status: result.data.status
      }
    } catch (error) {
      if (error instanceof N8nError) throw error
      throw new N8nError(0, 'Network error triggering workflow', { originalError: error })
    }
  }

  // Get workflow execution status
  async getExecutionStatus(executionId: string): Promise<WorkflowExecution> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/executions/${executionId}`, {
        headers: this.baseHeaders
      })

      if (!response.ok) {
        throw new N8nError(
          response.status,
          `Failed to get execution status: ${response.statusText}`
        )
      }

      const result = await response.json()
      return this.mapExecutionResponse(result.data)
    } catch (error) {
      if (error instanceof N8nError) throw error
      throw new N8nError(0, 'Network error getting execution status', { originalError: error })
    }
  }

  // Get workflow executions history
  async getExecutionHistory(
    workflowId: string,
    options: {
      limit?: number
      status?: string
      startedAfter?: string
      startedBefore?: string
    } = {}
  ): Promise<WorkflowExecution[]> {
    const searchParams = new URLSearchParams({
      workflowId,
      limit: String(options.limit || 50),
      ...(options.status && { status: options.status }),
      ...(options.startedAfter && { startedAfter: options.startedAfter }),
      ...(options.startedBefore && { startedBefore: options.startedBefore })
    })

    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/executions?${searchParams}`,
        { headers: this.baseHeaders }
      )

      if (!response.ok) {
        throw new N8nError(
          response.status,
          `Failed to get execution history: ${response.statusText}`
        )
      }

      const result = await response.json()
      return result.data.map(this.mapExecutionResponse)
    } catch (error) {
      if (error instanceof N8nError) throw error
      throw new N8nError(0, 'Network error getting execution history', { originalError: error })
    }
  }

  // Cancel workflow execution
  async cancelExecution(executionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/executions/${executionId}/stop`, {
        method: 'POST',
        headers: this.baseHeaders
      })

      if (!response.ok) {
        throw new N8nError(
          response.status,
          `Failed to cancel execution: ${response.statusText}`
        )
      }
    } catch (error) {
      if (error instanceof N8nError) throw error
      throw new N8nError(0, 'Network error canceling execution', { originalError: error })
    }
  }

  // Validate workflow exists and is active
  async validateWorkflow(workflowId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/workflows/${workflowId}`, {
        headers: this.baseHeaders
      })

      if (response.status === 404) return false
      if (!response.ok) {
        throw new N8nError(
          response.status,
          `Failed to validate workflow: ${response.statusText}`
        )
      }

      const workflow = await response.json()
      return workflow.data.active === true
    } catch (error) {
      if (error instanceof N8nError) throw error
      throw new N8nError(0, 'Network error validating workflow', { originalError: error })
    }
  }

  // Generate HMAC signature for payload verification
  private generateSignature(payload: string): string {
    return createHmac('sha256', this.config.webhookSecret)
      .update(payload)
      .digest('hex')
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = this.generateSignature(payload)
    return signature === expectedSignature
  }

  // Map n8n execution response to our format
  private mapExecutionResponse(execution: any): WorkflowExecution {
    return {
      id: execution.id,
      workflowId: execution.workflowId,
      status: execution.finished ? (execution.success ? 'success' : 'failed') : 'running',
      data: execution.data,
      startedAt: execution.startedAt,
      finishedAt: execution.stoppedAt,
      executionTime: execution.stoppedAt 
        ? new Date(execution.stoppedAt).getTime() - new Date(execution.startedAt).getTime()
        : undefined
    }
  }
}

// Custom error class for n8n operations
export class N8nError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'N8nError'
  }
}

export const n8nClient = new N8nClient()
```

### Webhook Handler
```tsx
// app/api/webhooks/n8n/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { n8nClient } from '@/lib/integrations/n8n-client'
import { WorkflowService } from '@/lib/services/workflow-service'
import { supabase } from '@/lib/supabase/client'

interface N8nWebhookPayload {
  executionId: string
  workflowId: string
  status: 'success' | 'failed' | 'completed'
  data: any
  error?: {
    message: string
    details: any
  }
  timestamp: string
  executionTime: number
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify webhook signature
    const body = await request.text()
    const signature = request.headers.get('x-n8n-signature')
    
    if (!signature || !n8nClient.verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    // 2. Parse webhook payload
    const payload: N8nWebhookPayload = JSON.parse(body)
    
    // 3. Validate required fields
    if (!payload.executionId || !payload.workflowId || !payload.status) {
      return NextResponse.json(
        { error: 'Missing required webhook fields' },
        { status: 400 }
      )
    }

    // 4. Update workflow execution in database
    await WorkflowService.updateExecution({
      execution_id: payload.executionId,
      workflow_id: payload.workflowId,
      status: payload.status,
      result_data: payload.data,
      error_message: payload.error?.message,
      error_details: payload.error?.details,
      completed_at: payload.status === 'success' || payload.status === 'failed' 
        ? new Date().toISOString() 
        : null,
      execution_time_ms: payload.executionTime
    })

    // 5. Handle specific workflow completion actions
    await handleWorkflowCompletion(payload)

    // 6. Send real-time notification to frontend
    const { error: realtimeError } = await supabase
      .channel('workflow-updates')
      .send({
        type: 'broadcast',
        event: 'workflow_updated',
        payload: {
          executionId: payload.executionId,
          workflowId: payload.workflowId,
          status: payload.status,
          timestamp: payload.timestamp
        }
      })

    if (realtimeError) {
      console.error('Failed to send real-time update:', realtimeError)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed successfully'
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Handle specific actions based on workflow completion
async function handleWorkflowCompletion(payload: N8nWebhookPayload) {
  try {
    switch (payload.status) {
      case 'success':
        await handleSuccessfulWorkflow(payload)
        break
      case 'failed':
        await handleFailedWorkflow(payload)
        break
    }
  } catch (error) {
    console.error('Error handling workflow completion:', error)
    // Don't throw here to avoid webhook retry loops
  }
}

async function handleSuccessfulWorkflow(payload: N8nWebhookPayload) {
  // Example: Update chatbot status if this was a setup workflow
  if (payload.workflowId === process.env.N8N_CHATBOT_SETUP_WORKFLOW_ID) {
    const chatbotId = payload.data?.chatbotId
    
    if (chatbotId) {
      await supabase
        .from('chatbots')
        .update({ 
          is_training: false,
          training_progress: 100,
          updated_at: new Date().toISOString()
        })
        .eq('id', chatbotId)
    }
  }
}

async function handleFailedWorkflow(payload: N8nWebhookPayload) {
  // Example: Mark chatbot as failed setup and notify admins
  if (payload.workflowId === process.env.N8N_CHATBOT_SETUP_WORKFLOW_ID) {
    const chatbotId = payload.data?.chatbotId
    
    if (chatbotId) {
      await supabase
        .from('chatbots')
        .update({ 
          is_training: false,
          training_progress: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', chatbotId)

      // TODO: Send notification to admins about failed setup
    }
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
}
```

### Workflow Service
```tsx
// lib/services/workflow-service.ts
import { supabase } from '@/lib/supabase/client'
import { n8nClient, N8nError } from '@/lib/integrations/n8n-client'
import { withRetry } from '@/lib/utils/error-recovery'
import type { 
  WorkflowExecution, 
  WorkflowTriggerRequest,
  WorkflowExecutionUpdate 
} from '@/types/workflow'

export class WorkflowService {
  // Trigger chatbot setup workflow
  static async triggerChatbotSetup(chatbotId: string): Promise<string> {
    const workflowId = process.env.N8N_CHATBOT_SETUP_WORKFLOW_ID!
    
    // 1. Get chatbot data
    const { data: chatbot, error } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', chatbotId)
      .single()

    if (error || !chatbot) {
      throw new Error(`Chatbot not found: ${error?.message}`)
    }

    // 2. Update chatbot to training state
    await supabase
      .from('chatbots')
      .update({ 
        is_training: true,
        training_progress: 10,
        updated_at: new Date().toISOString()
      })
      .eq('id', chatbotId)

    // 3. Prepare workflow payload
    const triggerData = {
      chatbotId: chatbot.id,
      event: 'chatbot_setup',
      payload: {
        name: chatbot.name,
        systemPrompt: chatbot.system_prompt,
        personalityTraits: chatbot.personality_traits,
        channels: chatbot.channels,
        hitlEnabled: chatbot.hitl_enabled,
        companyId: chatbot.company_id
      },
      timestamp: new Date().toISOString()
    }

    // 4. Trigger n8n workflow with retry
    const result = await withRetry(
      () => n8nClient.triggerWorkflow(workflowId, triggerData),
      {
        maxAttempts: 3,
        backoffMs: 1000,
        shouldRetry: (error) => {
          // Retry on network errors, not on validation errors
          return error instanceof N8nError && error.status >= 500
        }
      }
    )

    // 5. Store execution record
    await this.createExecutionRecord({
      execution_id: result.executionId,
      workflow_id: workflowId,
      chatbot_id: chatbotId,
      trigger_data: triggerData,
      status: 'running',
      started_at: new Date().toISOString()
    })

    return result.executionId
  }

  // Trigger conversation workflow
  static async triggerConversationWorkflow(
    chatbotId: string,
    conversationId: string,
    messageData: any
  ): Promise<string> {
    const workflowId = process.env.N8N_CONVERSATION_WORKFLOW_ID!
    
    const triggerData = {
      chatbotId,
      event: 'message_received',
      payload: {
        conversationId,
        message: messageData.content,
        userId: messageData.user_id,
        timestamp: messageData.timestamp,
        metadata: messageData.metadata
      },
      timestamp: new Date().toISOString()
    }

    const result = await withRetry(
      () => n8nClient.triggerWorkflow(workflowId, triggerData),
      { maxAttempts: 2, backoffMs: 500 }
    )

    await this.createExecutionRecord({
      execution_id: result.executionId,
      workflow_id: workflowId,
      chatbot_id: chatbotId,
      conversation_id: conversationId,
      trigger_data: triggerData,
      status: 'running',
      started_at: new Date().toISOString()
    })

    return result.executionId
  }

  // Get execution status with caching
  static async getExecutionStatus(
    executionId: string,
    useCache: boolean = true
  ): Promise<WorkflowExecution | null> {
    
    // 1. Try to get from database first (faster)
    if (useCache) {
      const { data: cached } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('execution_id', executionId)
        .single()

      if (cached && cached.status !== 'running') {
        return this.mapDbExecution(cached)
      }
    }

    // 2. Get fresh status from n8n for running executions
    try {
      const execution = await n8nClient.getExecutionStatus(executionId)
      
      // 3. Update database with fresh status
      await this.updateExecution({
        execution_id: executionId,
        status: execution.status,
        result_data: execution.data,
        completed_at: execution.finishedAt,
        execution_time_ms: execution.executionTime
      })

      return execution
    } catch (error) {
      console.error('Failed to get execution status from n8n:', error)
      
      // Fallback to database if n8n is unavailable
      const { data: fallback } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('execution_id', executionId)
        .single()

      return fallback ? this.mapDbExecution(fallback) : null
    }
  }

  // List executions with pagination
  static async listExecutions(options: {
    chatbotId?: string
    status?: string
    page?: number
    limit?: number
  } = {}): Promise<{
    data: WorkflowExecution[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> {
    const { chatbotId, status, page = 1, limit = 20 } = options
    const offset = (page - 1) * limit

    let query = supabase
      .from('workflow_executions')
      .select('*', { count: 'exact' })
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (chatbotId) {
      query = query.eq('chatbot_id', chatbotId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Failed to list executions: ${error.message}`)
    }

    return {
      data: (data || []).map(this.mapDbExecution),
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    }
  }

  // Cancel execution
  static async cancelExecution(executionId: string): Promise<void> {
    // 1. Cancel in n8n
    await n8nClient.cancelExecution(executionId)

    // 2. Update database
    await this.updateExecution({
      execution_id: executionId,
      status: 'failed',
      error_message: 'Execution cancelled by user',
      completed_at: new Date().toISOString()
    })
  }

  // Retry failed execution
  static async retryExecution(executionId: string): Promise<string> {
    // 1. Get original execution data
    const { data: execution, error } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('execution_id', executionId)
      .single()

    if (error || !execution) {
      throw new Error(`Execution not found: ${error?.message}`)
    }

    // 2. Trigger new execution with same data
    const result = await n8nClient.triggerWorkflow(
      execution.workflow_id,
      execution.trigger_data
    )

    // 3. Create new execution record
    await this.createExecutionRecord({
      execution_id: result.executionId,
      workflow_id: execution.workflow_id,
      chatbot_id: execution.chatbot_id,
      conversation_id: execution.conversation_id,
      trigger_data: execution.trigger_data,
      status: 'running',
      started_at: new Date().toISOString(),
      parent_execution_id: executionId
    })

    return result.executionId
  }

  // Database operations
  private static async createExecutionRecord(data: any): Promise<void> {
    const { error } = await supabase
      .from('workflow_executions')
      .insert(data)

    if (error) {
      throw new Error(`Failed to create execution record: ${error.message}`)
    }
  }

  static async updateExecution(update: WorkflowExecutionUpdate): Promise<void> {
    const { error } = await supabase
      .from('workflow_executions')
      .update({
        ...update,
        updated_at: new Date().toISOString()
      })
      .eq('execution_id', update.execution_id)

    if (error) {
      throw new Error(`Failed to update execution: ${error.message}`)
    }
  }

  private static mapDbExecution(dbExecution: any): WorkflowExecution {
    return {
      id: dbExecution.execution_id,
      workflowId: dbExecution.workflow_id,
      status: dbExecution.status,
      data: dbExecution.result_data,
      startedAt: dbExecution.started_at,
      finishedAt: dbExecution.completed_at,
      executionTime: dbExecution.execution_time_ms,
      error: dbExecution.error_message ? {
        message: dbExecution.error_message,
        details: dbExecution.error_details
      } : undefined,
      chatbotId: dbExecution.chatbot_id,
      conversationId: dbExecution.conversation_id
    }
  }
}
```

### Workflow Status Hook
```tsx
// hooks/use-workflow-status.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { WorkflowService } from '@/lib/services/workflow-service'
import { realtimeService } from '@/lib/services/realtime-service'
import { toast } from 'sonner'
import type { WorkflowExecution } from '@/types/workflow'

interface UseWorkflowStatusOptions {
  pollInterval?: number
  realtime?: boolean
  autoRefresh?: boolean
}

export const useWorkflowStatus = (
  executionId: string | null,
  options: UseWorkflowStatusOptions = {}
) => {
  const {
    pollInterval = 2000,
    realtime = true,
    autoRefresh = true
  } = options

  const [execution, setExecution] = useState<WorkflowExecution | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch execution status
  const fetchStatus = useCallback(async (useCache = true) => {
    if (!executionId) return

    setLoading(true)
    setError(null)

    try {
      const result = await WorkflowService.getExecutionStatus(executionId, useCache)
      setExecution(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch execution status'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [executionId])

  // Cancel execution
  const cancelExecution = useCallback(async () => {
    if (!executionId) return

    try {
      await WorkflowService.cancelExecution(executionId)
      toast.success('Execution cancelled successfully')
      await fetchStatus(false) // Refresh status
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel execution'
      toast.error(message)
      throw err
    }
  }, [executionId, fetchStatus])

  // Retry execution
  const retryExecution = useCallback(async () => {
    if (!executionId) return

    try {
      const newExecutionId = await WorkflowService.retryExecution(executionId)
      toast.success('Execution restarted successfully')
      return newExecutionId
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to retry execution'
      toast.error(message)
      throw err
    }
  }, [executionId])

  // Real-time updates
  useEffect(() => {
    if (!realtime || !executionId) return

    const channelId = realtimeService.subscribeToTable(
      'workflow_executions',
      `execution_id=eq.${executionId}`,
      (payload) => {
        if (payload.eventType === 'UPDATE' && payload.new) {
          const updatedExecution = WorkflowService.mapDbExecution(payload.new)
          setExecution(updatedExecution)

          // Show completion notification
          if (updatedExecution.status === 'success') {
            toast.success('Workflow completed successfully')
          } else if (updatedExecution.status === 'failed') {
            toast.error('Workflow execution failed')
          }
        }
      }
    )

    return () => {
      realtimeService.unsubscribe(channelId)
    }
  }, [realtime, executionId])

  // Polling for running executions
  useEffect(() => {
    if (!autoRefresh || !executionId || !execution) return
    if (execution.status !== 'running' && execution.status !== 'waiting') return

    const interval = setInterval(() => {
      fetchStatus(false) // Fresh fetch for running executions
    }, pollInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, executionId, execution, pollInterval, fetchStatus])

  // Initial fetch
  useEffect(() => {
    if (executionId) {
      fetchStatus()
    }
  }, [executionId, fetchStatus])

  // Computed properties
  const isRunning = execution?.status === 'running' || execution?.status === 'waiting'
  const isCompleted = execution?.status === 'success'
  const isFailed = execution?.status === 'failed'
  const canCancel = isRunning
  const canRetry = isFailed

  return {
    // Data
    execution,
    loading,
    error,
    
    // State flags
    isRunning,
    isCompleted,
    isFailed,
    canCancel,
    canRetry,
    
    // Actions
    refetch: () => fetchStatus(false),
    cancelExecution,
    retryExecution,
    
    // Utilities
    clearError: () => setError(null)
  }
}
```

### Workflow Status Component
```tsx
// components/workflow/workflow-status.tsx
'use client'

import { useState } from 'react'
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useWorkflowStatus } from '@/hooks/use-workflow-status'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface WorkflowStatusProps {
  executionId: string | null
  title?: string
  showActions?: boolean
  onRetrySuccess?: (newExecutionId: string) => void
}

export const WorkflowStatus: React.FC<WorkflowStatusProps> = ({
  executionId,
  title = 'Workflow Status',
  showActions = true,
  onRetrySuccess
}) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  const {
    execution,
    loading,
    error,
    isRunning,
    isCompleted,
    isFailed,
    canCancel,
    canRetry,
    cancelExecution,
    retryExecution
  } = useWorkflowStatus(executionId)

  const handleCancel = async () => {
    setActionLoading('cancel')
    try {
      await cancelExecution()
    } finally {
      setActionLoading(null)
    }
  }

  const handleRetry = async () => {
    setActionLoading('retry')
    try {
      const newExecutionId = await retryExecution()
      onRetrySuccess?.(newExecutionId)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusIcon = () => {
    if (loading) return <Clock className="h-4 w-4 animate-pulse" />
    if (isRunning) return <Play className="h-4 w-4 text-blue-600 animate-pulse" />
    if (isCompleted) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (isFailed) return <XCircle className="h-4 w-4 text-red-600" />
    return <Clock className="h-4 w-4 text-gray-400" />
  }

  const getStatusVariant = () => {
    if (isRunning) return 'default'
    if (isCompleted) return 'success'
    if (isFailed) return 'destructive'
    return 'secondary'
  }

  const getStatusText = () => {
    if (loading) return 'Checking status...'
    if (!execution) return 'Not started'
    
    switch (execution.status) {
      case 'running': return 'Running'
      case 'waiting': return 'Waiting'
      case 'success': return 'Completed'
      case 'failed': return 'Failed'
      default: return execution.status
    }
  }

  // Calculate progress for running workflows (simplified)
  const getProgress = () => {
    if (!execution) return 0
    if (isCompleted) return 100
    if (isFailed) return 0
    if (isRunning) {
      // Simple time-based progress estimation
      const elapsed = Date.now() - new Date(execution.startedAt).getTime()
      const estimatedDuration = 30000 // 30 seconds estimation
      return Math.min((elapsed / estimatedDuration) * 100, 90)
    }
    return 0
  }

  if (!executionId) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No workflow execution
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <Badge variant={getStatusVariant()}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          {(isRunning || isCompleted) && (
            <div className="space-y-2">
              <Progress value={getProgress()} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(getProgress())}%</span>
              </div>
            </div>
          )}

          {/* Execution Details */}
          {execution && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Started</p>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(execution.startedAt), {
                    addSuffix: true,
                    locale: es
                  })}
                </p>
              </div>
              
              {execution.finishedAt && (
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {execution.executionTime 
                      ? `${Math.round(execution.executionTime / 1000)}s`
                      : 'N/A'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start space-x-2 p-3 bg-destructive/10 rounded-md">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Error</p>
                <p className="text-destructive/80">{error}</p>
              </div>
            </div>
          )}

          {/* Execution Error */}
          {execution?.error && (
            <div className="flex items-start space-x-2 p-3 bg-destructive/10 rounded-md">
              <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Execution Failed</p>
                <p className="text-destructive/80">{execution.error.message}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex space-x-2 pt-2">
              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={actionLoading === 'cancel'}
                >
                  {actionLoading === 'cancel' ? (
                    <Pause className="h-4 w-4 mr-2 animate-pulse" />
                  ) : (
                    <Square className="h-4 w-4 mr-2" />
                  )}
                  Cancel
                </Button>
              )}
              
              {canRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  disabled={actionLoading === 'retry'}
                >
                  {actionLoading === 'retry' ? (
                    <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  Retry
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### Type Definitions
```tsx
// types/workflow.ts
export interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'running' | 'waiting' | 'success' | 'failed'
  data?: any
  startedAt: string
  finishedAt?: string
  executionTime?: number
  error?: {
    message: string
    details?: any
  }
  chatbotId?: string
  conversationId?: string
}

export interface WorkflowTriggerRequest {
  chatbotId: string
  event: string
  payload: Record<string, any>
  timestamp: string
}

export interface WorkflowExecutionUpdate {
  execution_id: string
  status?: string
  result_data?: any
  error_message?: string
  error_details?: any
  completed_at?: string | null
  execution_time_ms?: number
}

// n8n specific types
export interface N8nWebhookEvent {
  executionId: string
  workflowId: string
  status: 'success' | 'failed' | 'completed'
  data: any
  error?: {
    message: string
    details: any
  }
  timestamp: string
  executionTime: number
}
```

## Testing Implementation
```tsx
// __tests__/integrations/n8n-client.test.ts
import { n8nClient, N8nError } from '@/lib/integrations/n8n-client'

// Mock fetch
global.fetch = jest.fn()

describe('N8nClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.N8N_BASE_URL = 'https://test.n8n.cloud'
    process.env.N8N_API_KEY = 'test-api-key'
    process.env.N8N_WEBHOOK_SECRET = 'test-secret'
  })

  describe('triggerWorkflow', () => {
    it('should trigger workflow successfully', async () => {
      const mockResponse = {
        data: {
          executionId: 'exec-123',
          status: 'running'
        }
      }

      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await n8nClient.triggerWorkflow('workflow-1', {
        chatbotId: 'bot-1',
        event: 'test_event',
        payload: { test: 'data' },
        timestamp: '2023-01-01T00:00:00Z'
      })

      expect(result.executionId).toBe('exec-123')
      expect(result.status).toBe('running')
    })

    it('should handle API errors correctly', async () => {
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({ error: 'Invalid payload' })
      })

      await expect(
        n8nClient.triggerWorkflow('workflow-1', {
          chatbotId: 'bot-1',
          event: 'test_event',
          payload: {},
          timestamp: '2023-01-01T00:00:00Z'
        })
      ).rejects.toThrow(N8nError)
    })
  })

  describe('verifyWebhookSignature', () => {
    it('should verify valid signature', () => {
      const payload = '{"test":"data"}'
      const signature = n8nClient.generateSignature(payload)
      
      expect(n8nClient.verifyWebhookSignature(payload, signature)).toBe(true)
    })

    it('should reject invalid signature', () => {
      const payload = '{"test":"data"}'
      const invalidSignature = 'invalid-signature'
      
      expect(n8nClient.verifyWebhookSignature(payload, invalidSignature)).toBe(false)
    })
  })
})
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- Integration implemented: NeurAnt ↔ n8n Cloud
- API endpoints: ✅ Webhook handlers working (/api/webhooks/n8n)
- Workflow triggers: ✅ Chatbot setup, conversation processing
- Real-time: ✅ Status updates via Supabase realtime
- Error handling: ✅ Retry logic, circuit breaker, dead letter queue
- Monitoring: ✅ Dashboard components for workflow status
- Testing: ✅ Integration tests with mocked n8n API
- Next integration: TASK-P1E4-04a (conversations database schema)
- Ready for workflow automation: ✅ Full n8n integration functional
```

## Troubleshooting Integration
### Common Issues
- **Webhook Signature Failures:** Verificar HMAC secret consistency
- **n8n API Timeouts:** Configurar timeout apropiados y retry logic
- **Workflow Execution Stalled:** Implementar heartbeat monitoring
- **Real-time Updates Missing:** Verificar Supabase channel subscriptions

### Debugging Tools
```bash
# Test webhook endpoint locally
curl -X POST http://localhost:3000/api/webhooks/n8n \
  -H "Content-Type: application/json" \
  -H "X-N8N-Signature: test-signature" \
  -d '{"executionId":"test","workflowId":"test","status":"success"}'

# Monitor workflow executions
supabase logs realtime --level info
supabase logs api --filter 'webhooks/n8n'

# Test n8n API connectivity
node -e "
  const client = require('./lib/integrations/n8n-client');
  client.n8nClient.validateWorkflow('test-workflow-id')
    .then(console.log)
    .catch(console.error);
"
```

---
*Tarea específica para integración completa con n8n Cloud: webhooks bidireccionales, gestión de workflows, monitoreo de ejecuciones y manejo robusto de errores.*