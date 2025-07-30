# Template: Frontend Integration Task

## Identificación
- **ID:** TASK-P{phase}E{epic}-{subtask}
- **Título:** [Integración específica Frontend ↔ Backend]
- **Type:** Frontend Integration
- **Phase:** {1-4} - {Nombre de Phase}
- **Epic:** {Nombre de Epic}
- **Sprint:** {Número de Sprint}
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** {X} horas
- **Prioridad:** {Crítica|Alta|Media|Baja}

## Definición Técnica
[Descripción específica de la integración entre frontend y backend: APIs, real-time, webhooks, etc.]

## Referencias de Documentación NeurAnt
- **API Contracts:** `docs/architecture/11-interfaces-contratos-rbac.md:{línea-inicio}-{línea-fin}` (contratos específicos)
- **Integration Patterns:** `docs/architecture/{documento}.md:{línea-inicio}-{línea-fin}` (patrones de integración)
- **Real-time Requirements:** `docs/architecture/{documento}.md:{línea-inicio}-{línea-fin}` (specs tiempo real)
- **Tech Stack:** `docs/architecture/04-tech-stack.md:{línea-inicio}-{línea-fin}` (integration tools)

## Dependencias Técnicas
- **Requiere:**
  - [ ] TASK-ID-X ✅ (API endpoints implementados)
  - [ ] TASK-ID-Y ✅ (database schema ready)
  - [ ] TASK-ID-Z ✅ (authentication working)
  - [ ] TASK-ID-W ✅ (frontend components created)
- **Bloquea:**
  - [ ] TASK-ID-V (features que requieren esta integración)
  - [ ] TASK-ID-U (testing E2E que depende de esta integración)

## Integration Specifications
### Communication Pattern
- **Type:** {REST API | GraphQL | WebSockets | SSE | Webhook}
- **Authentication:** {JWT | Session | API Key}
- **Data Format:** {JSON | FormData | Binary}
- **Error Handling:** {Standard HTTP codes | Custom error format}

### Real-time Requirements (si aplica)
- **Protocol:** {WebSockets | Supabase Realtime | SSE}
- **Events:** [Lista de eventos que se manejan]
- **Reconnection:** {Automatic | Manual | Exponential backoff}
- **Offline Support:** {Queue | Sync | Disable}

### Data Flow Architecture
```tsx
// Integration flow structure
interface IntegrationFlow {
  // Input from UI
  userAction: UserActionType
  
  // Frontend processing
  validation: ValidationResult
  optimisticUpdate: OptimisticState
  
  // Backend communication
  apiCall: APIRequest
  response: APIResponse
  
  // State synchronization
  stateUpdate: StateUpdate
  uiUpdate: UIUpdate
  
  // Error recovery
  errorHandling: ErrorRecovery
  rollback: RollbackState
}
```

## Criterios de Aceptación Específicos
### API Integration
- [ ] All API endpoints properly consumed
- [ ] Request/response serialization working
- [ ] Authentication headers included automatically
- [ ] Error responses mapped to user-friendly messages

### Real-time Features
- [ ] WebSocket/SSE connections established
- [ ] Real-time events properly handled
- [ ] Connection recovery implemented
- [ ] Graceful degradation for offline scenarios

### Data Synchronization
- [ ] Optimistic updates working correctly
- [ ] Conflict resolution implemented
- [ ] Cache invalidation strategies working
- [ ] State consistency maintained across components

### Performance & UX
- [ ] Loading states displayed appropriately
- [ ] Progressive enhancement implemented
- [ ] Request debouncing/throttling where needed
- [ ] Graceful error handling with retry mechanisms

## Archivos a Crear/Modificar
```
lib/api/{domain}-api.ts
lib/services/{integration-name}.ts
lib/utils/api-client.ts
lib/utils/websocket-client.ts
hooks/use{Integration}.ts
hooks/use{Integration}Realtime.ts
components/{domain}/{integration-component}.tsx
types/api/{domain}.ts
__tests__/integration/{integration-name}.test.ts
```

## API Client Implementation

### Base API Client
```tsx
// lib/utils/api-client.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

class APIClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '/api'
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    }
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data: { session } } = await supabase.auth.getSession()
    
    return session?.access_token 
      ? { Authorization: `Bearer ${session.access_token}` }
      : {}
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const authHeaders = await this.getAuthHeaders()
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...authHeaders,
        ...options.headers
      }
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config)
      
      if (!response.ok) {
        throw new APIError(
          response.status,
          response.statusText,
          await this.parseErrorResponse(response)
        )
      }

      const data = await response.json()
      return {
        data,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      }
    } catch (error) {
      if (error instanceof APIError) throw error
      
      throw new APIError(
        0,
        'Network Error',
        { message: 'Failed to connect to server' }
      )
    }
  }

  private async parseErrorResponse(response: Response) {
    try {
      return await response.json()
    } catch {
      return { message: response.statusText }
    }
  }

  // HTTP method helpers
  get<T>(endpoint: string, params?: Record<string, any>) {
    const url = params 
      ? `${endpoint}?${new URLSearchParams(params)}`
      : endpoint
      
    return this.request<T>(url, { method: 'GET' })
  }

  post<T>(endpoint: string, data?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  put<T>(endpoint: string, data?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // File upload helper
  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, any>) {
    const formData = new FormData()
    formData.append('file', file)
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    const authHeaders = await this.getAuthHeaders()
    
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        ...authHeaders
        // Don't set Content-Type for FormData, let browser set it
      }
    })
  }
}

// API Response types
interface APIResponse<T> {
  data: T
  status: number
  headers: Record<string, string>
}

class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public details?: any
  ) {
    super(`API Error ${status}: ${statusText}`)
    this.name = 'APIError'
  }
}

export const apiClient = new APIClient()
export { APIError }
export type { APIResponse }
```

### Domain-specific API Service
```tsx
// lib/api/{domain}-api.ts
import { apiClient, APIError } from '@/lib/utils/api-client'
import type { 
  {DataType}, 
  Create{DataType}, 
  Update{DataType},
  {DataType}ListResponse,
  {DataType}Response 
} from '@/types/api/{domain}'

export class {Domain}API {
  private static endpoint = '/{endpoint}'

  // List with pagination and filters
  static async list(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<{DataType}ListResponse> {
    const response = await apiClient.get<{DataType}ListResponse>(
      this.endpoint,
      params
    )
    return response.data
  }

  // Get single item
  static async get(id: string): Promise<{DataType}> {
    const response = await apiClient.get<{DataType}Response>(
      `${this.endpoint}/${id}`
    )
    return response.data.data
  }

  // Create new item
  static async create(data: Create{DataType}): Promise<{DataType}> {
    const response = await apiClient.post<{DataType}Response>(
      this.endpoint,
      data
    )
    return response.data.data
  }

  // Update existing item
  static async update(id: string, data: Update{DataType}): Promise<{DataType}> {
    const response = await apiClient.put<{DataType}Response>(
      `${this.endpoint}/${id}`,
      data
    )
    return response.data.data
  }

  // Delete item
  static async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`)
  }

  // Batch operations
  static async batchUpdate(updates: Array<{ id: string; data: Update{DataType} }>): Promise<{DataType}[]> {
    const response = await apiClient.post<{DataType}ListResponse>(
      `${this.endpoint}/batch-update`,
      { updates }
    )
    return response.data.data
  }

  // File upload (if applicable)
  static async uploadDocument(
    id: string, 
    file: File, 
    metadata?: Record<string, any>
  ): Promise<{ url: string; fileId: string }> {
    const response = await apiClient.upload<{ data: { url: string; fileId: string } }>(
      `${this.endpoint}/${id}/upload`,
      file,
      metadata
    )
    return response.data.data
  }

  // Search with advanced filters
  static async search(query: {
    q: string
    filters?: Record<string, any>
    facets?: string[]
    pagination?: { page: number; limit: number }
  }): Promise<{
    results: {DataType}[]
    facets: Record<string, Array<{ value: string; count: number }>>
    total: number
  }> {
    const response = await apiClient.post<any>(
      `${this.endpoint}/search`,
      query
    )
    return response.data.data
  }
}
```

### Real-time Integration
```tsx
// lib/services/realtime-service.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { toast } from 'sonner'

class RealtimeService {
  private supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  private channels = new Map<string, any>()
  private reconnectAttempts = new Map<string, number>()
  private maxReconnectAttempts = 5

  // Subscribe to table changes
  subscribeToTable<T>(
    table: string,
    filter: string,
    callback: (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE'
      new: T | null
      old: T | null
    }) => void,
    channelId?: string
  ) {
    const id = channelId || `${table}-${filter}`
    
    if (this.channels.has(id)) {
      console.warn(`Channel ${id} already exists`)
      return id
    }

    const channel = this.supabase
      .channel(id)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table,
        filter
      }, callback)
      .subscribe((status) => {
        console.log(`Channel ${id} status:`, status)
        
        if (status === 'SUBSCRIBED') {
          this.reconnectAttempts.set(id, 0)
          toast.success('Real-time connection established')
        } else if (status === 'CHANNEL_ERROR') {
          this.handleReconnection(id)
        }
      })

    this.channels.set(id, channel)
    return id
  }

  // Subscribe to presence (user online/offline)
  subscribeToPresence(
    room: string,
    userId: string,
    userMetadata: Record<string, any>,
    callbacks: {
      onJoin: (users: Array<{ userId: string; metadata: any }>) => void
      onLeave: (users: Array<{ userId: string; metadata: any }>) => void
      onSync: () => void
    }
  ) {
    const channelId = `presence-${room}`
    
    if (this.channels.has(channelId)) {
      return channelId
    }

    const channel = this.supabase
      .channel(channelId)
      .on('presence', { event: 'sync' }, callbacks.onSync)
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        callbacks.onJoin(newPresences)
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        callbacks.onLeave(leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId,
            ...userMetadata,
            onlineAt: new Date().toISOString()
          })
        }
      })

    this.channels.set(channelId, channel)
    return channelId
  }

  // Send broadcast message
  async broadcast(channelId: string, event: string, payload: any) {
    const channel = this.channels.get(channelId)
    if (!channel) {
      throw new Error(`Channel ${channelId} not found`)
    }

    await channel.send({
      type: 'broadcast',
      event,
      payload
    })
  }

  // Unsubscribe from channel
  unsubscribe(channelId: string) {
    const channel = this.channels.get(channelId)
    if (channel) {
      this.supabase.removeChannel(channel)
      this.channels.delete(channelId)
      this.reconnectAttempts.delete(channelId)
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    for (const [channelId] of this.channels) {
      this.unsubscribe(channelId)
    }
  }

  // Handle reconnection with exponential backoff
  private handleReconnection(channelId: string) {
    const attempts = this.reconnectAttempts.get(channelId) || 0
    
    if (attempts >= this.maxReconnectAttempts) {
      toast.error('Failed to reconnect. Please refresh the page.')
      return
    }

    const delay = Math.min(1000 * Math.pow(2, attempts), 30000) // Max 30 seconds
    
    setTimeout(() => {
      console.log(`Attempting to reconnect channel ${channelId} (attempt ${attempts + 1})`)
      this.reconnectAttempts.set(channelId, attempts + 1)
      
      // Re-subscribe logic would go here
      // This is simplified - in practice you'd store the original subscription params
    }, delay)
  }

  // Get connection status
  getConnectionStatus() {
    return this.supabase.realtime.status
  }

  // Get active channels
  getActiveChannels() {
    return Array.from(this.channels.keys())
  }
}

export const realtimeService = new RealtimeService()
```

### Integration Hook
```tsx
// hooks/use{Integration}.ts
import { useState, useEffect, useCallback, useRef } from 'react'
import { {Domain}API } from '@/lib/api/{domain}-api'
import { realtimeService } from '@/lib/services/realtime-service'
import { toast } from 'sonner'
import type { {DataType} } from '@/types/{domain}'

interface Use{Integration}Options {
  autoFetch?: boolean
  realtime?: boolean
  retryOnError?: boolean
  optimisticUpdates?: boolean
}

export const use{Integration} = (
  companyId: string,
  options: Use{Integration}Options = {}
) => {
  const {
    autoFetch = true,
    realtime = false,
    retryOnError = true,
    optimisticUpdates = true
  } = options

  // State
  const [data, setData] = useState<{DataType}[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  // Refs for cleanup
  const channelRef = useRef<string | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch data from API
  const fetchData = useCallback(async () => {
    if (!companyId) return

    setLoading(true)
    setError(null)

    try {
      const response = await {Domain}API.list({ 
        companyId,
        limit: 100 // Adjust as needed
      })
      
      setData(response.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data'
      setError(message)
      
      if (retryOnError) {
        retryTimeoutRef.current = setTimeout(() => {
          fetchData()
        }, 3000)
      }
    } finally {
      setLoading(false)
    }
  }, [companyId, retryOnError])

  // Create item with optimistic update
  const createItem = useCallback(async (newItem: Omit<{DataType}, 'id' | 'created_at' | 'updated_at'>) => {
    const tempId = `temp-${Date.now()}`
    const optimisticItem: {DataType} = {
      ...newItem,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as {DataType}

    // Optimistic update
    if (optimisticUpdates) {
      setData(prev => [...prev, optimisticItem])
    }

    try {
      const createdItem = await {Domain}API.create(newItem)
      
      if (optimisticUpdates) {
        // Replace optimistic item with real one
        setData(prev => prev.map(item => 
          item.id === tempId ? createdItem : item
        ))
      } else {
        setData(prev => [...prev, createdItem])
      }
      
      toast.success('Item created successfully')
      return createdItem
    } catch (err) {
      // Rollback optimistic update
      if (optimisticUpdates) {
        setData(prev => prev.filter(item => item.id !== tempId))
      }
      
      const message = err instanceof Error ? err.message : 'Failed to create item'
      toast.error(message)
      throw err
    }
  }, [optimisticUpdates])

  // Update item with optimistic update
  const updateItem = useCallback(async (
    id: string, 
    updates: Partial<{DataType}>
  ) => {
    let originalItem: {DataType} | undefined

    // Optimistic update
    if (optimisticUpdates) {
      setData(prev => prev.map(item => {
        if (item.id === id) {
          originalItem = item
          return { ...item, ...updates, updated_at: new Date().toISOString() }
        }
        return item
      }))
    }

    try {
      const updatedItem = await {Domain}API.update(id, updates)
      
      if (!optimisticUpdates) {
        setData(prev => prev.map(item => 
          item.id === id ? updatedItem : item
        ))
      }
      
      toast.success('Item updated successfully')
      return updatedItem
    } catch (err) {
      // Rollback optimistic update
      if (optimisticUpdates && originalItem) {
        setData(prev => prev.map(item => 
          item.id === id ? originalItem : item
        ))
      }
      
      const message = err instanceof Error ? err.message : 'Failed to update item'
      toast.error(message)
      throw err
    }
  }, [optimisticUpdates])

  // Delete item with optimistic update
  const deleteItem = useCallback(async (id: string) => {
    let originalData: {DataType}[]

    // Optimistic update
    if (optimisticUpdates) {
      setData(prev => {
        originalData = prev
        return prev.filter(item => item.id !== id)
      })
    }

    try {
      await {Domain}API.delete(id)
      
      if (!optimisticUpdates) {
        setData(prev => prev.filter(item => item.id !== id))
      }
      
      toast.success('Item deleted successfully')
    } catch (err) {
      // Rollback optimistic update
      if (optimisticUpdates) {
        setData(originalData!)
      }
      
      const message = err instanceof Error ? err.message : 'Failed to delete item'
      toast.error(message)
      throw err
    }
  }, [optimisticUpdates])

  // Setup real-time subscription
  useEffect(() => {
    if (!realtime || !companyId) return

    setSyncing(true)

    channelRef.current = realtimeService.subscribeToTable(
      '{table_name}',
      `company_id=eq.${companyId}`,
      (payload) => {
        console.log('Real-time update:', payload)

        switch (payload.eventType) {
          case 'INSERT':
            if (payload.new) {
              setData(prev => {
                // Check if item already exists (avoid duplicates)
                const exists = prev.some(item => item.id === payload.new!.id)
                return exists ? prev : [...prev, payload.new as {DataType}]
              })
            }
            break

          case 'UPDATE':
            if (payload.new) {
              setData(prev => prev.map(item => 
                item.id === payload.new!.id ? payload.new as {DataType} : item
              ))
            }
            break

          case 'DELETE':
            if (payload.old) {
              setData(prev => prev.filter(item => item.id !== payload.old!.id))
            }
            break
        }

        setSyncing(false)
      }
    )

    return () => {
      if (channelRef.current) {
        realtimeService.unsubscribe(channelRef.current)
      }
    }
  }, [realtime, companyId])

  // Initial data fetch
  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [autoFetch, fetchData])

  // Cleanup
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  return {
    // Data
    data,
    loading,
    error,
    syncing,
    
    // Actions
    refetch: fetchData,
    createItem,
    updateItem,
    deleteItem,
    
    // Utilities
    clearError: () => setError(null),
    isConnected: channelRef.current !== null
  }
}
```

## Error Handling & Recovery
```tsx
// lib/utils/error-recovery.ts
import { toast } from 'sonner'

interface RetryOptions {
  maxAttempts: number
  backoffMs: number
  shouldRetry?: (error: any) => boolean
}

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {
    maxAttempts: 3,
    backoffMs: 1000
  }
): Promise<T> => {
  let lastError: any
  
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (attempt === options.maxAttempts) {
        break
      }
      
      if (options.shouldRetry && !options.shouldRetry(error)) {
        break
      }
      
      const delay = options.backoffMs * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

export const handleAPIError = (error: any) => {
  if (error.status === 401) {
    toast.error('Session expired. Please login again.')
    // Redirect to login
    window.location.href = '/login'
    return
  }
  
  if (error.status === 403) {
    toast.error('You don\'t have permission for this action.')
    return
  }
  
  if (error.status >= 500) {
    toast.error('Server error. Please try again later.')
    return
  }
  
  const message = error.details?.message || error.message || 'An error occurred'
  toast.error(message)
}
```

## Testing Integration
```tsx
// __tests__/integration/{integration-name}.test.ts
import { renderHook, act } from '@testing-library/react'
import { use{Integration} } from '../hooks/use{Integration}'
import { {Domain}API } from '../lib/api/{domain}-api'

// Mock API
jest.mock('../lib/api/{domain}-api')
const mock{Domain}API = {Domain}API as jest.Mocked<typeof {Domain}API>

describe('use{Integration}', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch data on mount', async () => {
    const mockData = [{ id: '1', name: 'Test Item' }]
    mock{Domain}API.list.mockResolvedValue({ data: mockData, total: 1 })

    const { result } = renderHook(() => use{Integration}('company-1'))

    expect(result.current.loading).toBe(true)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(mock{Domain}API.list).toHaveBeenCalledWith({ 
      companyId: 'company-1', 
      limit: 100 
    })
    expect(result.current.data).toEqual(mockData)
    expect(result.current.loading).toBe(false)
  })

  it('should handle optimistic updates correctly', async () => {
    const newItem = { name: 'New Item' }
    const createdItem = { id: '2', ...newItem, created_at: '2023-01-01', updated_at: '2023-01-01' }
    
    mock{Domain}API.list.mockResolvedValue({ data: [], total: 0 })
    mock{Domain}API.create.mockResolvedValue(createdItem)

    const { result } = renderHook(() => use{Integration}('company-1', { 
      optimisticUpdates: true 
    }))

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      await result.current.createItem(newItem)
    })

    expect(result.current.data).toContainEqual(createdItem)
    expect(mock{Domain}API.create).toHaveBeenCalledWith(newItem)
  })

  it('should rollback optimistic updates on error', async () => {
    const newItem = { name: 'New Item' }
    
    mock{Domain}API.list.mockResolvedValue({ data: [], total: 0 })
    mock{Domain}API.create.mockRejectedValue(new Error('Create failed'))

    const { result } = renderHook(() => use{Integration}('company-1', { 
      optimisticUpdates: true 
    }))

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await act(async () => {
      try {
        await result.current.createItem(newItem)
      } catch (error) {
        // Expected error
      }
    })

    expect(result.current.data).toEqual([])
  })
})
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- Integration implemented: {Domain} ↔ {Backend Service}
- API endpoints: ✅ All CRUD operations working
- Real-time: ✅ Supabase subscriptions active
- Optimistic updates: ✅ UI responsiveness improved
- Error handling: ✅ Retry logic and user feedback
- Testing: ✅ Integration tests passing
- Next integration task: TASK-ID-NEXT
- Ready for E2E testing: ✅ Full flow working
```

## Troubleshooting Integration
### Common Issues
- **CORS Errors:** [Frontend/Backend domain mismatch]
- **Authentication Failures:** [Token expiry, permissions]
- **Real-time Disconnections:** [Network issues, Supabase limits]
- **Race Conditions:** [Optimistic updates vs real-time events]

### Debugging Tools
```bash
# API testing
curl -X GET http://localhost:3000/api/{endpoint} \
  -H "Authorization: Bearer {token}"

# WebSocket debugging
window.addEventListener('beforeunload', () => {
  console.log('Active channels:', realtimeService.getActiveChannels())
})

# Network monitoring
npm run dev -- --inspect
```

---
*Template específico para tareas de Frontend Integration: conectar UI con APIs, real-time, webhooks, y toda la comunicación Frontend ↔ Backend.*