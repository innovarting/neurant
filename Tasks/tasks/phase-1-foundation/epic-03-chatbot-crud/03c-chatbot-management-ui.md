# TASK-P1E3-03c: Chatbot Management UI

## Identificación
- **ID:** TASK-P1E3-03c
- **Título:** Chatbot Management UI Components
- **Type:** Frontend UI
- **Phase:** 1 - Foundation
- **Epic:** Epic 3 - Chatbot CRUD
- **Sprint:** Sprint 1.2
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 12 horas
- **Prioridad:** Alta

## Definición Técnica
Implementar interface completa de gestión de chatbots incluyendo listado, creación, edición y configuración. Componentes responsive con TanStack Query para server state, React Hook Form para formularios, y shadcn/ui para design system consistente.

## Referencias de Documentación NeurAnt
- **UI/UX Requirements:** `docs/architecture/08-onboarding-flow.md:50-100` (dashboard layout)
- **Component Specs:** `docs/architecture/13-diagrama-entidad-relacion.md:118-149` (entidad CHATBOTS)
- **User Flow:** `docs/architecture/12-guias-implementacion-rbac.md:15-47` (permisos UI)
- **Tech Stack:** `docs/architecture/04-tech-stack.md:50-75` (frontend frameworks)

## Referencias de Diseño Visual (GUIA_DISENO_VISUAL_NEURANT.md)
- **Cards y Layouts:** `GUIA_DISENO_VISUAL_NEURANT.md:698-738` (Dashboard Analytics - KPIs Principales, Gráficos)
- **Formularios:** `GUIA_DISENO_VISUAL_NEURANT.md:277-342` (Input Fields, Labels, Validación, Select Dropdowns)
- **Botones:** `GUIA_DISENO_VISUAL_NEURANT.md:223-275` (Botón Primario, Secundario, Estados, Loading)
- **Estados y Feedback:** `GUIA_DISENO_VISUAL_NEURANT.md:472-532` (Loading States, Toast notifications, Progress bars)
- **Navegación:** `GUIA_DISENO_VISUAL_NEURANT.md:423-470` (Sidebar Navigation, breadcrumbs)
- **Iconografía:** `GUIA_DISENO_VISUAL_NEURANT.md:151-183` (IA y Automatización: Bot, Brain, Zap, Configuración: Settings)
- **Estados Vacío/Error:** `GUIA_DISENO_VISUAL_NEURANT.md:978-1039` (Empty states, Error states, Tono empático)
- **Responsive Design:** `GUIA_DISENO_VISUAL_NEURANT.md:824-867` (Mobile-first, breakpoints, componentes móviles)
- **Accesibilidad:** `GUIA_DISENO_VISUAL_NEURANT.md:869-923` (WCAG 2.1 AA, contraste, navegación por teclado)
- **Recomendaciones Técnicas:** `GUIA_DISENO_VISUAL_NEURANT.md:1219-1235` (shadcn/ui componentes), `GUIA_DISENO_VISUAL_NEURANT.md:1367-1380` (React Hook Form + Zod)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E3-03b ✅ (chatbot API endpoints)
  - [x] TASK-P1E2-02d ✅ (dashboard layout base)
  - [x] TASK-P1E2-02e ✅ (auth context provider)
- **Bloquea:**
  - [ ] TASK-P1E3-03d (n8n integration setup)
  - [ ] TASK-P1E4-04c (conversation history UI)

## UI/UX Specifications
### Design Requirements
- **Layout:** Dashboard sidebar navigation con content area responsive
- **Responsive:** Mobile-first, breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)
- **Theme:** Support para light/dark mode con shadcn/ui
- **Accessibility:** WCAG 2.1 AA compliance con keyboard navigation

### Component Structure
```tsx
// Estructura de componentes principales
interface ChatbotListProps {
  searchQuery?: string
  statusFilter?: 'all' | 'active' | 'inactive'
  onChatbotSelect?: (chatbot: Chatbot) => void
}

interface ChatbotFormProps {
  chatbot?: Partial<Chatbot>
  mode: 'create' | 'edit'
  onSubmit: (data: ChatbotFormData) => Promise<void>
  onCancel: () => void
}

interface ChatbotCardProps {
  chatbot: Chatbot
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, status: boolean) => void
}
```

## Criterios de Aceptación Específicos
### Functional Requirements
- [ ] Lista de chatbots con paginación, búsqueda y filtros
- [ ] Formulario de creación con validación client-side
- [ ] Formulario de edición con pre-carga de datos
- [ ] Activación/desactivación de chatbots con confirmación
- [ ] Eliminación con confirmación modal
- [ ] Estados loading, error y success manejados

### Visual Requirements
- [ ] Design system shadcn/ui aplicado consistentemente
- [ ] Cards responsivas con información clave del chatbot
- [ ] Modal forms con UX intuitivo
- [ ] Toast notifications para feedback de acciones
- [ ] Dark/light mode completamente funcional

### Accessibility Requirements
- [ ] Semantic HTML con roles ARIA apropiados
- [ ] Keyboard navigation completa (Tab, Enter, Escape)
- [ ] Focus management en modals y forms
- [ ] Screen reader friendly con labels descriptivos
- [ ] Color contrast ratio >4.5:1

### Performance Requirements
- [ ] Lazy loading de componentes pesados
- [ ] Optimistic updates con TanStack Query
- [ ] Debounced search con 300ms delay
- [ ] Virtual scrolling para listas grandes (>100 items)
- [ ] Bundle impact <50KB gzipped

## Archivos a Crear/Modificar
```
components/chatbot/chatbot-list.tsx
components/chatbot/chatbot-card.tsx
components/chatbot/chatbot-form.tsx
components/chatbot/chatbot-form-modal.tsx
components/chatbot/chatbot-delete-dialog.tsx
components/chatbot/chatbot-status-toggle.tsx
components/chatbot/index.ts
hooks/use-chatbots.ts
hooks/use-chatbot-form.ts
types/chatbot.ts
lib/validations/chatbot-form.ts
app/dashboard/chatbots/page.tsx
app/dashboard/chatbots/[id]/page.tsx
app/dashboard/chatbots/create/page.tsx
__tests__/components/chatbot/chatbot-list.test.tsx
__tests__/components/chatbot/chatbot-form.test.tsx
```

## Component Implementation

### Main Page - Chatbot List
```tsx
// app/dashboard/chatbots/page.tsx
'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChatbotList } from '@/components/chatbot/chatbot-list'
import { ChatbotFormModal } from '@/components/chatbot/chatbot-form-modal'
import { useChatbots } from '@/hooks/use-chatbots'
import { useDebounce } from '@/hooks/use-debounce'

export default function ChatbotsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  const debouncedSearch = useDebounce(searchQuery, 300)
  
  const {
    data: chatbots,
    isLoading,
    error,
    refetch
  } = useChatbots({
    search: debouncedSearch,
    is_active: statusFilter === 'all' ? undefined : statusFilter === 'active'
  })

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chatbots</h1>
          <p className="text-muted-foreground">
            Gestiona tus asistentes virtuales y configura su comportamiento
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Crear Chatbot
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar chatbots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Chatbot List */}
      <ChatbotList
        chatbots={chatbots?.data || []}
        isLoading={isLoading}
        error={error}
        onRefetch={refetch}
      />

      {/* Create Modal */}
      <ChatbotFormModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
        onSuccess={() => {
          setIsCreateModalOpen(false)
          refetch()
        }}
      />
    </div>
  )
}
```

### Chatbot List Component
```tsx
// components/chatbot/chatbot-list.tsx
'use client'

import { useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ChatbotCard } from './chatbot-card'
import { ChatbotFormModal } from './chatbot-form-modal'
import { ChatbotDeleteDialog } from './chatbot-delete-dialog'
import type { Chatbot } from '@/types/chatbot'

interface ChatbotListProps {
  chatbots: Chatbot[]
  isLoading: boolean
  error: string | null
  onRefetch: () => void
}

export const ChatbotList: React.FC<ChatbotListProps> = ({
  chatbots,
  isLoading,
  error,
  onRefetch
}) => {
  const [editingChatbot, setEditingChatbot] = useState<Chatbot | null>(null)
  const [deletingChatbot, setDeletingChatbot] = useState<Chatbot | null>(null)

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Cargando chatbots...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={onRefetch}>
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  // Empty state
  if (chatbots.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
          <div className="w-12 h-12 bg-muted-foreground/20 rounded-full" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">No hay chatbots</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Comienza creando tu primer chatbot para automatizar conversaciones con tus clientes.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Chatbot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chatbots.map((chatbot) => (
          <ChatbotCard
            key={chatbot.id}
            chatbot={chatbot}
            onEdit={(id) => setEditingChatbot(chatbot)}
            onDelete={(id) => setDeletingChatbot(chatbot)}
          />
        ))}
      </div>

      {/* Edit Modal */}
      <ChatbotFormModal
        open={!!editingChatbot}
        onOpenChange={(open) => !open && setEditingChatbot(null)}
        mode="edit"
        chatbot={editingChatbot}
        onSuccess={() => {
          setEditingChatbot(null)
          onRefetch()
        }}
      />

      {/* Delete Dialog */}
      <ChatbotDeleteDialog
        open={!!deletingChatbot}
        onOpenChange={(open) => !open && setDeletingChatbot(null)}
        chatbot={deletingChatbot}
        onSuccess={() => {
          setDeletingChatbot(null)
          onRefetch()
        }}
      />
    </>
  )
}
```

### Chatbot Card Component
```tsx
// components/chatbot/chatbot-card.tsx
'use client'

import { useState } from 'react'
import { MoreVertical, MessageCircle, Settings, Trash2, Power, PowerOff } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChatbotStatusToggle } from './chatbot-status-toggle'
import type { Chatbot } from '@/types/chatbot'

interface ChatbotCardProps {
  chatbot: Chatbot
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export const ChatbotCard: React.FC<ChatbotCardProps> = ({
  chatbot,
  onEdit,
  onDelete
}) => {
  const [isToggling, setIsToggling] = useState(false)

  const handleStatusToggle = async () => {
    setIsToggling(true)
    try {
      // Implementation handled by parent component
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated API call
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={chatbot.avatar_url} alt={chatbot.name} />
              <AvatarFallback>
                {chatbot.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm leading-none">{chatbot.name}</h3>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={chatbot.is_active ? "default" : "secondary"}
                  className="text-xs"
                >
                  {chatbot.is_active ? "Activo" : "Inactivo"}
                </Badge>
                {chatbot.hitl_enabled && (
                  <Badge variant="outline" className="text-xs">
                    HITL
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(chatbot.id)}>
                <Settings className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageCircle className="mr-2 h-4 w-4" />
                Ver Conversaciones
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleStatusToggle} disabled={isToggling}>
                {chatbot.is_active ? (
                  <PowerOff className="mr-2 h-4 w-4" />
                ) : (
                  <Power className="mr-2 h-4 w-4" />
                )}
                {chatbot.is_active ? "Desactivar" : "Activar"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(chatbot.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Description */}
        {chatbot.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {chatbot.description}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-2xl font-bold">{chatbot.total_conversations}</p>
            <p className="text-xs text-muted-foreground">Conversaciones</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{chatbot.total_messages}</p>
            <p className="text-xs text-muted-foreground">Mensajes</p>
          </div>
        </div>

        {/* Last activity */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            {chatbot.last_conversation_at ? (
              <>
                Última actividad:{" "}
                {formatDistanceToNow(new Date(chatbot.last_conversation_at), {
                  addSuffix: true,
                  locale: es
                })}
              </>
            ) : (
              "Sin actividad reciente"
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Chatbot Form Component
```tsx
// components/chatbot/chatbot-form.tsx
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Bot, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChatbotFormSchema, type ChatbotFormData } from '@/lib/validations/chatbot-form'
import type { Chatbot } from '@/types/chatbot'

interface ChatbotFormProps {
  chatbot?: Partial<Chatbot>
  mode: 'create' | 'edit'
  onSubmit: (data: ChatbotFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export const ChatbotForm: React.FC<ChatbotFormProps> = ({
  chatbot,
  mode,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const form = useForm<ChatbotFormData>({
    resolver: zodResolver(ChatbotFormSchema),
    defaultValues: {
      name: chatbot?.name || '',
      description: chatbot?.description || '',
      system_prompt: chatbot?.system_prompt || '',
      response_delay_ms: chatbot?.response_delay_ms || 1000,
      max_context_messages: chatbot?.max_context_messages || 10,
      fallback_message: chatbot?.fallback_message || '',
      hitl_enabled: chatbot?.hitl_enabled || false,
      auto_escalate_after_minutes: chatbot?.auto_escalate_after_minutes || 30,
      requires_supervisor: chatbot?.requires_supervisor || false,
      operator_assignment_strategy: chatbot?.operator_assignment_strategy || 'round_robin',
      max_concurrent_hitl: chatbot?.max_concurrent_hitl || 5,
    }
  })

  const handleSubmit = async (data: ChatbotFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      // Error handling is managed by parent component
      console.error('Form submission error:', error)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">
          {mode === 'create' ? 'Crear Nuevo Chatbot' : 'Editar Chatbot'}
        </h2>
        <p className="text-muted-foreground">
          {mode === 'create' 
            ? 'Configura tu asistente virtual personalizado'
            : 'Modifica la configuración de tu chatbot'
          }
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Básica</CardTitle>
              <CardDescription>
                Configuración general de tu chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Chatbot</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Asistente de Ventas" {...field} />
                    </FormControl>
                    <FormDescription>
                      Este nombre aparecerá en las conversaciones
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input placeholder="Breve descripción del propósito del chatbot" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="system_prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt del Sistema</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Eres un asistente útil que ayuda a los clientes con..."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Instrucciones que definen la personalidad y comportamiento del chatbot
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Behavior Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración de Comportamiento</CardTitle>
              <CardDescription>
                Ajusta cómo responde tu chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="response_delay_ms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delay de Respuesta (ms)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="10000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Tiempo de espera antes de responder
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_context_messages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensajes de Contexto</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="50"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Máximo de mensajes previos a recordar
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="fallback_message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensaje de Fallback</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Lo siento, no entendí tu mensaje. ¿Podrías reformularlo?"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Mensaje cuando el chatbot no puede generar una respuesta
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* HITL Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Human-in-the-Loop (HITL)
              </CardTitle>
              <CardDescription>
                Configuración para escalamiento a operadores humanos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="hitl_enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Habilitar HITL</FormLabel>
                      <FormDescription>
                        Permite escalamiento a operadores humanos
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch('hitl_enabled') && (
                <div className="space-y-4 ml-4 border-l-2 border-muted pl-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="auto_escalate_after_minutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Auto-escalamiento (minutos)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="1440"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="max_concurrent_hitl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>HITL Concurrentes</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="operator_assignment_strategy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estrategia de Asignación</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una estrategia" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="round_robin">Round Robin</SelectItem>
                            <SelectItem value="least_busy">Menos Ocupado</SelectItem>
                            <SelectItem value="random">Aleatorio</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requires_supervisor"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Requiere Supervisor</FormLabel>
                          <FormDescription>
                            Las conversaciones HITL requieren aprobación de supervisor
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Crear Chatbot' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
```

### Custom Hooks
```tsx
// hooks/use-chatbots.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Chatbot, ChatbotQueryParams, CreateChatbotRequest, UpdateChatbotRequest } from '@/types/chatbot'

const CHATBOTS_QUERY_KEY = ['chatbots']

// Fetch chatbots list
export const useChatbots = (params?: ChatbotQueryParams) => {
  return useQuery({
    queryKey: [...CHATBOTS_QUERY_KEY, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, String(value))
          }
        })
      }

      const response = await fetch(`/api/chatbots?${searchParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch chatbots')
      }
      return response.json()
    },
    staleTime: 30000, // 30 seconds
  })
}

// Create chatbot mutation
export const useCreateChatbot = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateChatbotRequest) => {
      const response = await fetch('/api/chatbots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create chatbot')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Invalidate and refetch chatbots
      queryClient.invalidateQueries({ queryKey: CHATBOTS_QUERY_KEY })
      toast.success('Chatbot creado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al crear el chatbot')
    },
  })
}

// Update chatbot mutation
export const useUpdateChatbot = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateChatbotRequest }) => {
      const response = await fetch(`/api/chatbots/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update chatbot')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // Update specific chatbot in cache
      queryClient.setQueryData([...CHATBOTS_QUERY_KEY, variables.id], data)
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: CHATBOTS_QUERY_KEY })
      toast.success('Chatbot actualizado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar el chatbot')
    },
  })
}

// Delete chatbot mutation
export const useDeleteChatbot = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/chatbots/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete chatbot')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHATBOTS_QUERY_KEY })
      toast.success('Chatbot eliminado exitosamente')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar el chatbot')
    },
  })
}
```

### Form Validation Schema
```tsx
// lib/validations/chatbot-form.ts
import { z } from 'zod'

export const ChatbotFormSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(255, 'El nombre es muy largo'),
  
  description: z.string()
    .max(1000, 'La descripción es muy larga')
    .optional(),
  
  system_prompt: z.string()
    .min(10, 'El prompt debe tener al menos 10 caracteres')
    .max(5000, 'El prompt es muy largo'),
  
  response_delay_ms: z.number()
    .min(0, 'El delay no puede ser negativo')
    .max(10000, 'El delay máximo es 10 segundos')
    .default(1000),
  
  max_context_messages: z.number()
    .min(1, 'Debe recordar al menos 1 mensaje')
    .max(50, 'Máximo 50 mensajes de contexto')
    .default(10),
  
  fallback_message: z.string()
    .max(1000, 'El mensaje de fallback es muy largo')
    .optional(),
  
  hitl_enabled: z.boolean().default(false),
  
  auto_escalate_after_minutes: z.number()
    .min(1, 'Mínimo 1 minuto para escalamiento')
    .max(1440, 'Máximo 24 horas para escalamiento')
    .default(30),
  
  requires_supervisor: z.boolean().default(false),
  
  operator_assignment_strategy: z.enum(['round_robin', 'least_busy', 'random'])
    .default('round_robin'),
  
  max_concurrent_hitl: z.number()
    .min(1, 'Mínimo 1 conversación HITL concurrente')
    .max(100, 'Máximo 100 conversaciones HITL concurrentes')
    .default(5),
})

export type ChatbotFormData = z.infer<typeof ChatbotFormSchema>
```

## Testing Implementation
```tsx
// __tests__/components/chatbot/chatbot-list.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChatbotList } from '@/components/chatbot/chatbot-list'

const mockChatbots = [
  {
    id: '1',
    name: 'Test Bot 1',
    description: 'Test description',
    is_active: true,
    hitl_enabled: true,
    total_conversations: 10,
    total_messages: 50,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Test Bot 2',
    description: 'Another test bot',
    is_active: false,
    hitl_enabled: false,
    total_conversations: 5,
    total_messages: 20,
    created_at: '2024-01-02T00:00:00Z',
  },
]

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('ChatbotList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders chatbot list correctly', () => {
    render(
      <ChatbotList
        chatbots={mockChatbots}
        isLoading={false}
        error={null}
        onRefetch={jest.fn()}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Test Bot 1')).toBeInTheDocument()
    expect(screen.getByText('Test Bot 2')).toBeInTheDocument()
    expect(screen.getByText('Activo')).toBeInTheDocument()
    expect(screen.getByText('Inactivo')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(
      <ChatbotList
        chatbots={[]}
        isLoading={true}
        error={null}
        onRefetch={jest.fn()}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Cargando chatbots...')).toBeInTheDocument()
  })

  it('shows error state with retry button', async () => {
    const onRefetch = jest.fn()
    render(
      <ChatbotList
        chatbots={[]}
        isLoading={false}
        error="Error loading chatbots"
        onRefetch={onRefetch}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Error loading chatbots')).toBeInTheDocument()
    
    const retryButton = screen.getByText('Reintentar')
    await userEvent.click(retryButton)
    
    expect(onRefetch).toHaveBeenCalledTimes(1)
  })

  it('shows empty state when no chatbots', () => {
    render(
      <ChatbotList
        chatbots={[]}
        isLoading={false}
        error={null}
        onRefetch={jest.fn()}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('No hay chatbots')).toBeInTheDocument()
    expect(screen.getByText(/Comienza creando tu primer chatbot/)).toBeInTheDocument()
  })

  it('handles chatbot card interactions', async () => {
    render(
      <ChatbotList
        chatbots={mockChatbots}
        isLoading={false}
        error={null}
        onRefetch={jest.fn()}
      />,
      { wrapper: createWrapper() }
    )

    // Click on dropdown menu
    const dropdownTriggers = screen.getAllByRole('button', { name: 'Abrir menú' })
    await userEvent.click(dropdownTriggers[0])

    // Check if menu items are visible
    expect(screen.getByText('Editar')).toBeInTheDocument()
    expect(screen.getByText('Ver Conversaciones')).toBeInTheDocument()
    expect(screen.getByText('Eliminar')).toBeInTheDocument()
  })
})
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- UI Components implemented: ChatbotList, ChatbotCard, ChatbotForm, ChatbotFormModal
- Pages created: /dashboard/chatbots (list), /dashboard/chatbots/create, /dashboard/chatbots/[id]
- Responsive design: ✅ Mobile-first con breakpoints sm/md/lg/xl
- Accessibility: ✅ WCAG 2.1 AA con keyboard navigation y ARIA
- Testing: ✅ Unit tests para componentes principales
- State management: ✅ TanStack Query + React Hook Form + Zod
- Next UI task: TASK-P1E3-03d (n8n integration setup)
- Integration ready for: Chatbot CRUD APIs, Auth context, Dashboard layout
```

## Troubleshooting Frontend
### Common Issues
- **Hydration Errors:** Verificar SSR/client state consistency
- **Form Validation:** Asegurar schemas Zod alineados con API
- **TanStack Query:** Verificar invalidation keys consistency
- **Responsive Layout:** Probar en todos los breakpoints

### Debugging Commands
```bash
# Next.js development
npm run dev
npm run build
npm run analyze

# Testing
npm run test
npm run test:coverage
npm run test:watch

# Type checking
npm run type-check
```

---
*Tarea específica para implementar UI completa de gestión de chatbots con React, Next.js, shadcn/ui, TanStack Query y validación con React Hook Form + Zod.*