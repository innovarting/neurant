# Template: Frontend State Management Task

## Identificación
- **ID:** TASK-P{phase}E{epic}-{subtask}
- **Título:** [Store, context o estado específico]
- **Type:** Frontend State
- **Phase:** {1-4} - {Nombre de Phase}
- **Epic:** {Nombre de Epic}
- **Sprint:** {Número de Sprint}
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** {X} horas
- **Prioridad:** {Crítica|Alta|Media|Baja}

## Definición Técnica
[Descripción específica del estado global, context provider, store o data flow que se implementará]

## Referencias de Documentación NeurAnt
- **Data Flow:** `docs/architecture/{documento}.md:{línea-inicio}-{línea-fin}` (flujo de datos)
- **State Architecture:** `docs/architecture/{documento}.md:{línea-inicio}-{línea-fin}` (arquitectura estado)
- **Business Logic:** `docs/architecture/{documento}.md:{línea-inicio}-{línea-fin}` (lógica de negocio)
- **Tech Stack:** `docs/architecture/04-tech-stack.md:{línea-inicio}-{línea-fin}` (state management tools)

## Dependencias Técnicas
- **Requiere:**
  - [ ] TASK-ID-X ✅ (API endpoints que alimentan el estado)
  - [ ] TASK-ID-Y ✅ (types/interfaces definidos)
  - [ ] TASK-ID-Z ✅ (auth context si aplica)
- **Bloquea:**
  - [ ] TASK-ID-W (componentes que consumen este estado)
  - [ ] TASK-ID-V (páginas que dependen de este store)

## State Management Specifications
### Store Architecture
- **Pattern:** {Zustand Store | React Context | TanStack Query}
- **Scope:** {Global | Feature-specific | Component-local}
- **Persistence:** {LocalStorage | SessionStorage | None}
- **Sync:** {Real-time | Polling | Manual}

### Data Flow Design
```tsx
// State structure
interface {StoreName}State {
  // Core data
  data: {DataType}[]
  selectedItem: {DataType} | null
  
  // UI state
  loading: boolean
  error: string | null
  filters: {FilterType}
  pagination: PaginationState
  
  // Computed/derived state
  filteredData: {DataType}[]
  totalCount: number
  hasMore: boolean
}

// Actions interface
interface {StoreName}Actions {
  // Data mutations
  fetchData: (params?: FetchParams) => Promise<void>
  createItem: (item: Create{DataType}) => Promise<{DataType}>
  updateItem: (id: string, updates: Partial<{DataType}>) => Promise<{DataType}>
  deleteItem: (id: string) => Promise<void>
  
  // UI actions
  setSelected: (item: {DataType} | null) => void
  setFilters: (filters: Partial<{FilterType}>) => void
  clearError: () => void
  reset: () => void
}
```

## Criterios de Aceptación Específicos
### State Management
- [ ] Store creado con estado inicial correcto
- [ ] Actions implementadas para todas las operaciones CRUD
- [ ] Estado derivado/computed calculado correctamente
- [ ] Optimistic updates implementadas donde apropiado

### Data Synchronization
- [ ] Estado sincronizado con backend API
- [ ] Real-time updates funcionando (si aplica)
- [ ] Conflict resolution implementado
- [ ] Offline/online state handling (si aplica)

### Performance & Memory
- [ ] No memory leaks en subscripciones
- [ ] Estado normalizado para evitar duplicación
- [ ] Selective re-renders (solo componentes que necesitan updates)
- [ ] Lazy loading de data pesada

### Developer Experience
- [ ] TypeScript types completos y exactos
- [ ] DevTools integration funcional
- [ ] Error states bien manejados
- [ ] Loading states informativos

## Archivos a Crear/Modificar
```
stores/{domain}-store.ts (Zustand)
contexts/{domain}-context.tsx (React Context)
hooks/use{Domain}.ts (Custom hook)
hooks/use{Domain}Mutations.ts (Mutation hooks)
types/{domain}.ts (TypeScript types)
lib/utils/{domain}-utils.ts (Helper functions)
__tests__/stores/{domain}-store.test.ts
```

## Implementation Patterns

### Zustand Store Implementation
```tsx
// stores/{domain}-store.ts
import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { {StoreName}State, {StoreName}Actions } from '@/types/{domain}'

interface {StoreName}Store extends {StoreName}State, {StoreName}Actions {}

export const use{StoreName}Store = create<{StoreName}Store>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Initial state
          data: [],
          selectedItem: null,
          loading: false,
          error: null,
          filters: {
            search: '',
            status: 'all',
            sortBy: 'created_at',
            sortOrder: 'desc'
          },
          pagination: {
            page: 1,
            limit: 20,
            total: 0
          },

          // Computed state
          get filteredData() {
            const { data, filters } = get()
            return data.filter(item => {
              if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) {
                return false
              }
              if (filters.status !== 'all' && item.status !== filters.status) {
                return false
              }
              return true
            }).sort((a, b) => {
              const { sortBy, sortOrder } = filters
              const direction = sortOrder === 'asc' ? 1 : -1
              return (a[sortBy] > b[sortBy] ? 1 : -1) * direction
            })
          },

          get totalCount() {
            return get().filteredData.length
          },

          get hasMore() {
            const { pagination, totalCount } = get()
            return pagination.page * pagination.limit < totalCount
          },

          // Actions
          async fetchData(params) {
            set({ loading: true, error: null })
            
            try {
              const response = await fetch('/api/{endpoint}', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              })
              
              if (!response.ok) throw new Error('Failed to fetch data')
              
              const result = await response.json()
              
              set(state => {
                state.data = result.data
                state.pagination.total = result.total
                state.loading = false
              })
            } catch (error) {
              set({ 
                error: error instanceof Error ? error.message : 'An error occurred',
                loading: false 
              })
            }
          },

          async createItem(item) {
            set({ loading: true, error: null })
            
            try {
              const response = await fetch('/api/{endpoint}', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
              })
              
              if (!response.ok) throw new Error('Failed to create item')
              
              const newItem = await response.json()
              
              set(state => {
                state.data.push(newItem.data)
                state.loading = false
              })
              
              return newItem.data
            } catch (error) {
              set({ 
                error: error instanceof Error ? error.message : 'Create failed',
                loading: false 
              })
              throw error
            }
          },

          async updateItem(id, updates) {
            set({ loading: true, error: null })
            
            try {
              const response = await fetch(`/api/{endpoint}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
              })
              
              if (!response.ok) throw new Error('Failed to update item')
              
              const updatedItem = await response.json()
              
              set(state => {
                const index = state.data.findIndex(item => item.id === id)
                if (index !== -1) {
                  state.data[index] = updatedItem.data
                }
                state.loading = false
              })
              
              return updatedItem.data
            } catch (error) {
              set({ 
                error: error instanceof Error ? error.message : 'Update failed',
                loading: false 
              })
              throw error
            }
          },

          async deleteItem(id) {
            set({ loading: true, error: null })
            
            try {
              const response = await fetch(`/api/{endpoint}/${id}`, {
                method: 'DELETE'
              })
              
              if (!response.ok) throw new Error('Failed to delete item')
              
              set(state => {
                state.data = state.data.filter(item => item.id !== id)
                if (state.selectedItem?.id === id) {
                  state.selectedItem = null
                }
                state.loading = false
              })
            } catch (error) {
              set({ 
                error: error instanceof Error ? error.message : 'Delete failed',
                loading: false 
              })
              throw error
            }
          },

          setSelected(item) {
            set({ selectedItem: item })
          },

          setFilters(newFilters) {
            set(state => {
              Object.assign(state.filters, newFilters)
              state.pagination.page = 1 // Reset to first page
            })
          },

          clearError() {
            set({ error: null })
          },

          reset() {
            set({
              data: [],
              selectedItem: null,
              loading: false,
              error: null,
              filters: {
                search: '',
                status: 'all',
                sortBy: 'created_at',
                sortOrder: 'desc'
              },
              pagination: {
                page: 1,
                limit: 20,
                total: 0
              }
            })
          }
        }))
      ),
      {
        name: '{domain}-store',
        partialize: (state) => ({
          // Only persist specific parts of state
          filters: state.filters,
          pagination: state.pagination
        })
      }
    ),
    {
      name: '{StoreName}Store'
    }
  )
)

// Selectors for performance optimization
export const use{StoreName}Data = () => use{StoreName}Store(state => state.data)
export const use{StoreName}Loading = () => use{StoreName}Store(state => state.loading)
export const use{StoreName}Error = () => use{StoreName}Store(state => state.error)
export const use{StoreName}Selected = () => use{StoreName}Store(state => state.selectedItem)
export const use{StoreName}Filters = () => use{StoreName}Store(state => state.filters)
export const use{StoreName}Actions = () => use{StoreName}Store(state => ({
  fetchData: state.fetchData,
  createItem: state.createItem,
  updateItem: state.updateItem,
  deleteItem: state.deleteItem,
  setSelected: state.setSelected,
  setFilters: state.setFilters,
  clearError: state.clearError,
  reset: state.reset
}))
```

### React Context Implementation (Alternative)
```tsx
// contexts/{domain}-context.tsx
'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import type { {StoreName}State, {StoreName}Actions } from '@/types/{domain}'

// Context types
interface {StoreName}ContextType extends {StoreName}State {
  actions: {StoreName}Actions
}

// Action types for reducer
type {StoreName}Action = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATA'; payload: {DataType}[] }
  | { type: 'ADD_ITEM'; payload: {DataType} }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<{DataType}> } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SET_SELECTED'; payload: {DataType} | null }
  | { type: 'SET_FILTERS'; payload: Partial<{FilterType}> }
  | { type: 'RESET' }

// Initial state
const initialState: {StoreName}State = {
  data: [],
  selectedItem: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    status: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0
  }
}

// Reducer
const {domain}Reducer = (state: {StoreName}State, action: {StoreName}Action): {StoreName}State => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
      
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
      
    case 'SET_DATA':
      return { ...state, data: action.payload, loading: false, error: null }
      
    case 'ADD_ITEM':
      return { 
        ...state, 
        data: [...state.data, action.payload],
        loading: false,
        error: null
      }
      
    case 'UPDATE_ITEM':
      return {
        ...state,
        data: state.data.map(item => 
          item.id === action.payload.id 
            ? { ...item, ...action.payload.updates }
            : item
        ),
        loading: false,
        error: null
      }
      
    case 'REMOVE_ITEM':
      return {
        ...state,
        data: state.data.filter(item => item.id !== action.payload),
        selectedItem: state.selectedItem?.id === action.payload ? null : state.selectedItem,
        loading: false,
        error: null
      }
      
    case 'SET_SELECTED':
      return { ...state, selectedItem: action.payload }
      
    case 'SET_FILTERS':
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 }
      }
      
    case 'RESET':
      return initialState
      
    default:
      return state
  }
}

// Create context
const {StoreName}Context = createContext<{StoreName}ContextType | undefined>(undefined)

// Provider component
export const {StoreName}Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer({domain}Reducer, initialState)

  // Actions
  const actions: {StoreName}Actions = {
    async fetchData(params) {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      try {
        const response = await fetch('/api/{endpoint}')
        if (!response.ok) throw new Error('Failed to fetch data')
        
        const result = await response.json()
        dispatch({ type: 'SET_DATA', payload: result.data })
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error instanceof Error ? error.message : 'An error occurred'
        })
      }
    },

    async createItem(item) {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      try {
        const response = await fetch('/api/{endpoint}', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        })
        
        if (!response.ok) throw new Error('Failed to create item')
        
        const newItem = await response.json()
        dispatch({ type: 'ADD_ITEM', payload: newItem.data })
        
        return newItem.data
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error instanceof Error ? error.message : 'Create failed'
        })
        throw error
      }
    },

    async updateItem(id, updates) {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      try {
        const response = await fetch(`/api/{endpoint}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })
        
        if (!response.ok) throw new Error('Failed to update item')
        
        const updatedItem = await response.json()
        dispatch({ type: 'UPDATE_ITEM', payload: { id, updates: updatedItem.data } })
        
        return updatedItem.data
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error instanceof Error ? error.message : 'Update failed'
        })
        throw error
      }
    },

    async deleteItem(id) {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      try {
        const response = await fetch(`/api/{endpoint}/${id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) throw new Error('Failed to delete item')
        
        dispatch({ type: 'REMOVE_ITEM', payload: id })
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error instanceof Error ? error.message : 'Delete failed'
        })
      }
    },

    setSelected: useCallback((item) => {
      dispatch({ type: 'SET_SELECTED', payload: item })
    }, []),

    setFilters: useCallback((filters) => {
      dispatch({ type: 'SET_FILTERS', payload: filters })
    }, []),

    clearError: useCallback(() => {
      dispatch({ type: 'SET_ERROR', payload: null })
    }, []),

    reset: useCallback(() => {
      dispatch({ type: 'RESET' })
    }, [])
  }

  // Auto-fetch data on mount
  useEffect(() => {
    actions.fetchData()
  }, [])

  const value: {StoreName}ContextType = {
    ...state,
    actions
  }

  return (
    <{StoreName}Context.Provider value={value}>
      {children}
    </{StoreName}Context.Provider>
  )
}

// Custom hook to use context
export const use{StoreName} = (): {StoreName}ContextType => {
  const context = useContext({StoreName}Context)
  if (context === undefined) {
    throw new Error('use{StoreName} must be used within a {StoreName}Provider')
  }
  return context
}

// Selector hooks for performance
export const use{StoreName}Data = () => use{StoreName}().data
export const use{StoreName}Loading = () => use{StoreName}().loading
export const use{StoreName}Error = () => use{StoreName}().error
export const use{StoreName}Selected = () => use{StoreName}().selectedItem
export const use{StoreName}Actions = () => use{StoreName}().actions
```

### TanStack Query Integration
```tsx
// hooks/use{Domain}Queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { {DataType}, Create{DataType}, Update{DataType} } from '@/types/{domain}'

// Query keys
export const {domain}Keys = {
  all: ['{domain}'] as const,
  lists: () => [...{domain}Keys.all, 'list'] as const,
  list: (filters: string) => [...{domain}Keys.lists(), { filters }] as const,
  details: () => [...{domain}Keys.all, 'detail'] as const,
  detail: (id: string) => [...{domain}Keys.details(), id] as const,
}

// Fetch functions
const fetch{DataType}s = async (filters?: Record<string, any>): Promise<{DataType}[]> => {
  const params = new URLSearchParams(filters)
  const response = await fetch(`/api/{endpoint}?${params}`)
  if (!response.ok) throw new Error('Failed to fetch {domain}')
  const result = await response.json()
  return result.data
}

const fetch{DataType} = async (id: string): Promise<{DataType}> => {
  const response = await fetch(`/api/{endpoint}/${id}`)
  if (!response.ok) throw new Error('Failed to fetch {domain}')
  const result = await response.json()
  return result.data
}

const create{DataType} = async (data: Create{DataType}): Promise<{DataType}> => {
  const response = await fetch('/api/{endpoint}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to create {domain}')
  const result = await response.json()
  return result.data
}

const update{DataType} = async ({ id, ...data }: Update{DataType} & { id: string }): Promise<{DataType}> => {
  const response = await fetch(`/api/{endpoint}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to update {domain}')
  const result = await response.json()
  return result.data
}

const delete{DataType} = async (id: string): Promise<void> => {
  const response = await fetch(`/api/{endpoint}/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete {domain}')
}

// Query hooks
export const use{DataType}s = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: {domain}Keys.list(JSON.stringify(filters || {})),
    queryFn: () => fetch{DataType}s(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const use{DataType} = (id: string, enabled = true) => {
  return useQuery({
    queryKey: {domain}Keys.detail(id),
    queryFn: () => fetch{DataType}(id),
    enabled: !!id && enabled,
  })
}

// Mutation hooks
export const useCreate{DataType} = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: create{DataType},
    onSuccess: (newItem) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: {domain}Keys.lists() })
      
      // Optimistic update to lists
      queryClient.setQueryData(
        {domain}Keys.lists(),
        (old: {DataType}[] | undefined) => 
          old ? [...old, newItem] : [newItem]
      )
      
      toast.success('{DataType} created successfully')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create {domain}')
    }
  })
}

export const useUpdate{DataType} = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: update{DataType},
    onSuccess: (updatedItem, variables) => {
      // Update specific item
      queryClient.setQueryData(
        {domain}Keys.detail(variables.id),
        updatedItem
      )
      
      // Update in lists
      queryClient.setQueriesData(
        { queryKey: {domain}Keys.lists() },
        (old: {DataType}[] | undefined) =>
          old?.map(item => 
            item.id === variables.id ? updatedItem : item
          )
      )
      
      toast.success('{DataType} updated successfully')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update {domain}')
    }
  })
}

export const useDelete{DataType} = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: delete{DataType},
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: {domain}Keys.detail(deletedId) })
      
      // Remove from lists
      queryClient.setQueriesData(
        { queryKey: {domain}Keys.lists() },
        (old: {DataType}[] | undefined) =>
          old?.filter(item => item.id !== deletedId)
      )
      
      toast.success('{DataType} deleted successfully')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete {domain}')
    }
  })
}
```

## Real-time Synchronization
```tsx
// hooks/use{Domain}Realtime.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { {domain}Keys } from './use{Domain}Queries'
import type { {DataType} } from '@/types/{domain}'

export const use{Domain}Realtime = (companyId?: string) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!companyId) return

    const channel = supabase
      .channel(`{domain}-changes-${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: '{table_name}',
          filter: `company_id=eq.${companyId}`
        },
        (payload) => {
          console.log('Real-time update:', payload)

          switch (payload.eventType) {
            case 'INSERT':
              // Add new item to cache
              queryClient.setQueryData(
                {domain}Keys.lists(),
                (old: {DataType}[] | undefined) => 
                  old ? [...old, payload.new as {DataType}] : [payload.new as {DataType}]
              )
              break

            case 'UPDATE':
              const updatedItem = payload.new as {DataType}
              
              // Update specific item
              queryClient.setQueryData(
                {domain}Keys.detail(updatedItem.id),
                updatedItem
              )
              
              // Update in lists
              queryClient.setQueriesData(
                { queryKey: {domain}Keys.lists() },
                (old: {DataType}[] | undefined) =>
                  old?.map(item => 
                    item.id === updatedItem.id ? updatedItem : item
                  )
              )
              break

            case 'DELETE':
              const deletedId = payload.old.id as string
              
              // Remove from cache
              queryClient.removeQueries({ queryKey: {domain}Keys.detail(deletedId) })
              
              // Remove from lists
              queryClient.setQueriesData(
                { queryKey: {domain}Keys.lists() },
                (old: {DataType}[] | undefined) =>
                  old?.filter(item => item.id !== deletedId)
              )
              break
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [companyId, queryClient])
}
```

## Testing State Management
```tsx
// __tests__/stores/{domain}-store.test.ts
import { renderHook, act } from '@testing-library/react'
import { use{StoreName}Store } from '../stores/{domain}-store'

// Mock fetch
global.fetch = jest.fn()

describe('{StoreName}Store', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset store state
    const { result } = renderHook(() => use{StoreName}Store())
    act(() => {
      result.current.reset()
    })
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => use{StoreName}Store())
    
    expect(result.current.data).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.selectedItem).toBe(null)
  })

  it('should fetch data successfully', async () => {
    const mockData = [{ id: '1', name: 'Test Item' }]
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockData })
    })

    const { result } = renderHook(() => use{StoreName}Store())

    await act(async () => {
      await result.current.fetchData()
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should handle fetch errors', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => use{StoreName}Store())

    await act(async () => {
      await result.current.fetchData()
    })

    expect(result.current.data).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('Network error')
  })

  it('should create item optimistically', async () => {
    const newItem = { name: 'New Item' }
    const createdItem = { id: '2', ...newItem }
    
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: createdItem })
    })

    const { result } = renderHook(() => use{StoreName}Store())

    await act(async () => {
      const result = await result.current.createItem(newItem)
      expect(result).toEqual(createdItem)
    })

    expect(result.current.data).toContain(createdItem)
  })

  it('should update filters and reset pagination', () => {
    const { result } = renderHook(() => use{StoreName}Store())

    act(() => {
      result.current.setFilters({ search: 'test' })
    })

    expect(result.current.filters.search).toBe('test')
    expect(result.current.pagination.page).toBe(1)
  })

  it('should compute filtered data correctly', () => {
    const { result } = renderHook(() => use{StoreName}Store())
    
    const testData = [
      { id: '1', name: 'Apple', status: 'active' },
      { id: '2', name: 'Banana', status: 'inactive' },
      { id: '3', name: 'Cherry', status: 'active' }
    ]

    act(() => {
      result.current.data = testData
      result.current.setFilters({ search: 'a' })
    })

    expect(result.current.filteredData).toHaveLength(2) // Apple, Banana
    expect(result.current.filteredData.map(item => item.name)).toEqual(['Apple', 'Banana'])
  })
})
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- State Management implemented: {StoreName}Store
- Pattern used: {Zustand|Context|TanStack Query}
- Real-time sync: ✅ Supabase subscriptions working
- Persistence: ✅ LocalStorage configured
- TypeScript: ✅ Fully typed
- Testing: ✅ Store tests passing
- Next state task: TASK-ID-NEXT
- Ready for components: [lista de componentes que pueden usar este estado]
```

## Troubleshooting State
### Common Issues
- **Memory Leaks:** [Unsubscribed listeners, uncleaned effects]
- **Stale Closures:** [useCallback dependencies, state access in callbacks]
- **Race Conditions:** [Concurrent state updates, optimistic updates]
- **Performance:** [Unnecessary re-renders, large state objects]

### Debugging Tools
```bash
# Zustand DevTools
window.__ZUSTAND__

# React DevTools Profiler
npm run dev -- --inspect

# Performance monitoring
console.time('stateUpdate')
console.timeEnd('stateUpdate')
```

---
*Template específico para tareas de State Management: Zustand stores, React Context, TanStack Query, data flow y sincronización de estado.*