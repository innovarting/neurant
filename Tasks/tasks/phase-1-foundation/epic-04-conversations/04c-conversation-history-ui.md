# TASK-P1E4-04c: Conversation History UI

## Identificación
- **ID:** TASK-P1E4-04c
- **Título:** Conversation History UI Components
- **Type:** Frontend UI
- **Phase:** 1 - Foundation
- **Epic:** Epic 4 - Conversations
- **Sprint:** Sprint 1.2
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 14 horas
- **Prioridad:** Media

## Definición Técnica
Implementar interface completa para visualización y gestión de conversaciones, incluyendo lista de conversaciones, chat interface en tiempo real, búsqueda avanzada, filtros, asignación de operadores, y gestión de estados HITL con UI responsive y accesible.

## Referencias de Documentación NeurAnt
- **UI/UX Requirements:** `docs/architecture/08-onboarding-flow.md:100-150` (chat UI patterns)
- **Component Specs:** `docs/architecture/13-diagrama-entidad-relacion.md:227-280` (conversation entities)
- **User Flow:** `docs/architecture/12-guias-implementacion-rbac.md:50-100` (operator permissions)
- **Tech Stack:** `docs/architecture/04-tech-stack.md:50-75` (real-time + React patterns)

## Referencias de Diseño Visual (GUIA_DISENO_VISUAL_NEURANT.md)
- **Chat Interfaces:** `GUIA_DISENO_VISUAL_NEURANT.md:344-421` (Burbujas de chat, Estados conversación, Avatares)
- **Gestión Conversaciones:** `GUIA_DISENO_VISUAL_NEURANT.md:644-696` (Layout 3-column, Lista conversaciones, Estados tiempo real)
- **Formularios:** `GUIA_DISENO_VISUAL_NEURANT.md:277-342` (Input Fields, Labels, Validación para filtros/búsqueda)
- **Botones:** `GUIA_DISENO_VISUAL_NEURANT.md:223-275` (Botón Primario, Secundario para acciones HITL)
- **Estados y Feedback:** `GUIA_DISENO_VISUAL_NEURANT.md:472-532` (Loading States, Toast notifications para escalamientos)
- **Navegación:** `GUIA_DISENO_VISUAL_NEURANT.md:423-470` (Sidebar Navigation, breadcrumbs)
- **Iconografía:** `GUIA_DISENO_VISUAL_NEURANT.md:151-183` (Comunicación: Chat, Phone, Users para HITL)
- **Responsive Design:** `GUIA_DISENO_VISUAL_NEURANT.md:824-867` (Mobile chat interface, collapsible panels)
- **Accesibilidad:** `GUIA_DISENO_VISUAL_NEURANT.md:869-923` (WCAG 2.1 AA para interfaces de tiempo real)
- **Recomendaciones Técnicas:** `GUIA_DISENO_VISUAL_NEURANT.md:1219-1235` (shadcn/ui componentes), `GUIA_DISENO_VISUAL_NEURANT.md:1356-1363` (TanStack Query para real-time)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E4-04a ✅ (conversations database schema)
  - [x] TASK-P1E4-04b ✅ (conversations API endpoints)
  - [x] TASK-P1E2-02d ✅ (dashboard layout base)
  - [x] TASK-P1E2-02e ✅ (auth context provider)
- **Bloquea:**
  - [ ] TASK-P1E4-04d (analytics dashboard que usa conversation data)
  - [ ] TASK-P2E1-05a (RAG features que integran con conversations)

## UI/UX Specifications
### Design Requirements
- **Layout:** Sidebar con lista de conversaciones + panel principal de chat
- **Responsive:** Mobile-first con layout colapsible en pantallas pequeñas
- **Theme:** Support completo para light/dark mode
- **Accessibility:** WCAG 2.1 AA con keyboard navigation y screen reader support

### Component Structure
```tsx
// Estructura de componentes principales
interface ConversationListProps {
  filters: ConversationFilters
  onConversationSelect: (conversation: Conversation) => void
  selectedConversationId?: string
}

interface ChatInterfaceProps {
  conversation: Conversation | null
  messages: Message[]
  onSendMessage: (content: string) => Promise<void>
  onAssignOperator: (operatorId: string) => Promise<void>
  onUpdateStatus: (status: ConversationStatus) => Promise<void>
}

interface ConversationFiltersProps {
  filters: ConversationFilters
  onFiltersChange: (filters: ConversationFilters) => void
  availableOperators: User[]
  availableChatbots: Chatbot[]
}
```

## Criterios de Aceptación Específicos
### Functional Requirements
- [ ] Lista de conversaciones con paginación infinita
- [ ] Chat interface con scroll automático y lazy loading de mensajes
- [ ] Búsqueda en tiempo real con highlight de resultados
- [ ] Filtros avanzados (status, chatbot, operator, fecha)
- [ ] Asignación de operadores con permisos RBAC
- [ ] Estados HITL con indicadores visuales claros

### Real-time Features
- [ ] Actualizaciones en tiempo real de nuevos mensajes
- [ ] Indicadores de typing y presence
- [ ] Notificaciones de cambios de estado
- [ ] Auto-refresh de lista de conversaciones
- [ ] Connection status indicator

### Visual Requirements
- [ ] Design system shadcn/ui aplicado consistentemente
- [ ] Avatares de usuarios y chatbots
- [ ] Timestamps relativos (hace 2 minutos, ayer, etc.)
- [ ] Estados visuales claros (active, ended, waiting)
- [ ] Message reactions con feedback visual

### Accessibility Requirements
- [ ] Semantic HTML con roles ARIA apropiados
- [ ] Keyboard navigation completa (Tab, Enter, Escape, Arrow keys)
- [ ] Screen reader announcements para nuevos mensajes
- [ ] Focus management en modal operations
- [ ] High contrast mode support

### Performance Requirements
- [ ] Virtual scrolling para listas grandes de conversaciones/mensajes
- [ ] Lazy loading de imágenes y media
- [ ] Debounced search con 300ms delay
- [ ] Optimistic updates con rollback capability
- [ ] Message caching con smart invalidation

## Archivos a Crear/Modificar
```
// Main pages
app/dashboard/conversations/page.tsx
app/dashboard/conversations/[id]/page.tsx

// Core components
components/conversations/conversation-list.tsx
components/conversations/conversation-list-item.tsx
components/conversations/conversation-filters.tsx
components/conversations/chat-interface.tsx
components/conversations/message-list.tsx
components/conversations/message-item.tsx
components/conversations/message-input.tsx
components/conversations/conversation-header.tsx
components/conversations/operator-assignment.tsx
components/conversations/status-updater.tsx
components/conversations/search-bar.tsx
components/conversations/typing-indicator.tsx
components/conversations/index.ts

// Hooks
hooks/use-conversations.ts
hooks/use-conversation-messages.ts
hooks/use-real-time-conversations.ts
hooks/use-message-sender.ts
hooks/use-conversation-search.ts

// Utilities
lib/utils/conversation-helpers.ts
lib/utils/message-formatting.ts
lib/utils/time-formatting.ts

// Types
types/conversation-ui.ts

// Tests
__tests__/components/conversations/conversation-list.test.tsx
__tests__/components/conversations/chat-interface.test.tsx
__tests__/hooks/use-conversations.test.ts
```

## Component Implementation

### Main Conversations Page
```tsx
// app/dashboard/conversations/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { ConversationList } from '@/components/conversations/conversation-list'
import { ChatInterface } from '@/components/conversations/chat-interface'
import { ConversationFilters } from '@/components/conversations/conversation-filters'
import { useConversations } from '@/hooks/use-conversations'
import { useRealTimeConversations } from '@/hooks/use-real-time-conversations'
import type { ConversationFilters as ConversationFiltersType } from '@/types/conversation-ui'

export default function ConversationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedId = searchParams.get('id')

  const [filters, setFilters] = useState<ConversationFiltersType>({
    status: 'all',
    chatbot_id: '',
    assigned_operator_id: '',
    search: '',
    start_date: '',
    end_date: ''
  })

  const {
    conversations,
    loading,
    error,
    pagination,
    refetch,
    loadMore
  } = useConversations({ 
    filters,
    realtime: true
  })

  // Enable real-time updates
  useRealTimeConversations({
    onConversationUpdate: (conversation) => {
      // Updates are handled automatically by the hook
    },
    onNewMessage: (message) => {
      // Trigger notification if needed
      if (message.conversation_id !== selectedId) {
        // Show notification for new message in background conversation
      }
    }
  })

  const handleConversationSelect = (conversationId: string) => {
    router.push(`/dashboard/conversations?id=${conversationId}`)
  }

  const selectedConversation = conversations.find(conv => conv.id === selectedId)

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <h1 className="text-lg font-semibold">Conversaciones</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full"
        >
          {/* Conversation List Panel */}
          <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
            <div className="h-full flex flex-col">
              {/* Filters */}
              <div className="border-b p-4">
                <ConversationFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-hidden">
                <ConversationList
                  conversations={conversations}
                  loading={loading}
                  error={error}
                  selectedConversationId={selectedId}
                  onConversationSelect={handleConversationSelect}
                  onLoadMore={loadMore}
                  hasMore={pagination.has_more}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Chat Panel */}
          <ResizablePanel defaultSize={70}>
            <ChatInterface
              conversation={selectedConversation}
              onRefresh={refetch}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
```

### Conversation List Component
```tsx
// components/conversations/conversation-list.tsx
'use client'

import { useEffect, useRef, useCallback } from 'react'
import { Loader2, AlertCircle, Inbox } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ConversationListItem } from './conversation-list-item'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import type { Conversation } from '@/types/conversation'

interface ConversationListProps {
  conversations: Conversation[]
  loading: boolean
  error: string | null
  selectedConversationId?: string | null
  onConversationSelect: (conversationId: string) => void
  onLoadMore: () => Promise<void>
  hasMore: boolean
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  loading,
  error,
  selectedConversationId,
  onConversationSelect,
  onLoadMore,
  hasMore
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { isLoading: isLoadingMore } = useInfiniteScroll({
    hasMore,
    onLoadMore,
    rootMargin: '100px',
    threshold: 0.1
  })

  // Auto-scroll to selected conversation
  useEffect(() => {
    if (selectedConversationId && scrollAreaRef.current) {
      const selectedElement = scrollAreaRef.current.querySelector(
        `[data-conversation-id="${selectedConversationId}"]`
      )
      if (selectedElement) {
        selectedElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        })
      }
    }
  }, [selectedConversationId])

  // Loading state
  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Cargando conversaciones...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Empty state
  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4 max-w-sm mx-auto px-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Inbox className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No hay conversaciones</h3>
            <p className="text-muted-foreground text-sm">
              Las nuevas conversaciones aparecerán aquí cuando los usuarios interactúen con tus chatbots.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea ref={scrollAreaRef} className="h-full">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => (
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            isSelected={conversation.id === selectedConversationId}
            onClick={() => onConversationSelect(conversation.id)}
            data-conversation-id={conversation.id}
          />
        ))}

        {/* Loading more indicator */}
        {isLoadingMore && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Cargando más...</span>
          </div>
        )}

        {/* End of list indicator */}
        {!hasMore && conversations.length > 10 && (
          <div className="text-center py-4 text-sm text-muted-foreground border-t">
            Has visto todas las conversaciones
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
```

### Conversation List Item
```tsx
// components/conversations/conversation-list-item.tsx
'use client'

import { useState } from 'react'
import { MoreVertical, User, MessageCircle, Clock, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/types/conversation'

interface ConversationListItemProps {
  conversation: Conversation
  isSelected: boolean
  onClick: () => void
  'data-conversation-id'?: string
}

export const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  isSelected,
  onClick,
  ...props
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'waiting_human': return 'bg-yellow-500'
      case 'ended': return 'bg-gray-400'
      case 'abandoned': return 'bg-red-500'
      case 'transferred': return 'bg-blue-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa'
      case 'waiting_human': return 'Esperando'
      case 'ended': return 'Finalizada'
      case 'abandoned': return 'Abandonada'
      case 'transferred': return 'Transferida'
      default: return status
    }
  }

  const handleMenuAction = (action: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent conversation selection
    setIsMenuOpen(false)
    
    switch (action) {
      case 'assign':
        // Handle operator assignment
        break
      case 'close':
        // Handle closing conversation
        break
      case 'transfer':
        // Handle transfer
        break
    }
  }

  return (
    <div
      {...props}
      className={cn(
        'group relative flex items-start space-x-3 rounded-lg p-3 transition-all hover:bg-accent cursor-pointer',
        isSelected && 'bg-accent border-l-2 border-l-primary'
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={conversation.end_user_avatar} 
            alt={conversation.end_user_name || conversation.end_user_id}
          />
          <AvatarFallback>
            {conversation.end_user_name
              ? conversation.end_user_name.substring(0, 2).toUpperCase()
              : <User className="h-4 w-4" />
            }
          </AvatarFallback>
        </Avatar>
        
        {/* Status indicator */}
        <div 
          className={cn(
            'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background',
            getStatusColor(conversation.status)
          )}
          title={getStatusText(conversation.status)}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <h4 className="text-sm font-medium truncate">
              {conversation.end_user_name || conversation.end_user_id}
            </h4>
            {conversation.is_hitl_active && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                HITL
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3 w-3" />
                  <span className="sr-only">Opciones de conversación</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => handleMenuAction('assign', e)}>
                  <User className="mr-2 h-4 w-4" />
                  Asignar operador
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleMenuAction('close', e)}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Cerrar conversación
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleMenuAction('transfer', e)}>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Transferir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Channel and chatbot */}
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span className="capitalize">{conversation.channel}</span>
          <span>•</span>
          <span>{conversation.chatbot?.name}</span>
          {conversation.assigned_operator && (
            <>
              <span>•</span>
              <span>{conversation.assigned_operator.first_name}</span>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-3 w-3" />
              <span>{conversation.message_count}</span>
            </div>
            {conversation.session_duration_minutes && (
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{conversation.session_duration_minutes}m</span>
              </div>
            )}
          </div>
          
          <time 
            dateTime={conversation.last_message_at}
            title={new Date(conversation.last_message_at).toLocaleString()}
          >
            {formatDistanceToNow(new Date(conversation.last_message_at), {
              addSuffix: true,
              locale: es
            })}
          </time>
        </div>
      </div>
    </div>
  )
}
```

### Chat Interface Component
```tsx
// components/conversations/chat-interface.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, AlertCircle, Phone, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ConversationHeader } from './conversation-header'
import { MessageList } from './message-list'
import { MessageInput } from './message-input'
import { TypingIndicator } from './typing-indicator'
import { useConversationMessages } from '@/hooks/use-conversation-messages'
import { useMessageSender } from '@/hooks/use-message-sender'
import { useRealTimeMessages } from '@/hooks/use-real-time-messages'
import type { Conversation } from '@/types/conversation'

interface ChatInterfaceProps {
  conversation: Conversation | null
  onRefresh?: () => void
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversation,
  onRefresh
}) => {
  const [messageContent, setMessageContent] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    loading,
    error,
    loadMore,
    hasMore
  } = useConversationMessages(conversation?.id || null)

  const {
    sendMessage,
    sending,
    error: sendError
  } = useMessageSender(conversation?.id || null)

  const { 
    typing, 
    usersTyping 
  } = useRealTimeMessages(conversation?.id || null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSendMessage = async () => {
    if (!messageContent.trim() || sending || !conversation) return

    try {
      await sendMessage({
        content: messageContent.trim(),
        sender_type: 'human'
      })
      setMessageContent('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Empty state when no conversation selected
  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-4 max-w-sm mx-auto px-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Phone className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Selecciona una conversación</h3>
            <p className="text-muted-foreground text-sm">
              Elige una conversación de la lista para ver los mensajes y participar en el chat.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Conversation ended state
  const isConversationEnded = conversation.status === 'ended' || conversation.status === 'abandoned'

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <ConversationHeader 
        conversation={conversation}
        onRefresh={onRefresh}
      />

      {/* Messages Area */}
      <div className="flex-1 relative overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="px-4 py-2">
            {/* Error state */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Load more messages */}
            {hasMore && (
              <div className="text-center py-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Cargar mensajes anteriores
                </Button>
              </div>
            )}

            {/* Messages */}
            <MessageList 
              messages={messages}
              loading={loading && messages.length === 0}
            />

            {/* Typing indicator */}
            {typing && usersTyping.length > 0 && (
              <TypingIndicator users={usersTyping} />
            )}

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {isConversationEnded ? (
          <div className="p-4 text-center">
            <div className="inline-flex items-center space-x-2 text-muted-foreground text-sm">
              <UserX className="h-4 w-4" />
              <span>Esta conversación ha terminado</span>
            </div>
          </div>
        ) : (
          <div className="p-4">
            {sendError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{sendError}</AlertDescription>
              </Alert>
            )}
            
            <MessageInput
              value={messageContent}
              onChange={setMessageContent}
              onSend={handleSendMessage}
              onKeyPress={handleKeyPress}
              disabled={sending}
              placeholder="Escribe un mensaje..."
            />
          </div>
        )}
      </div>
    </div>
  )
}
```

### Message List Component
```tsx
// components/conversations/message-list.tsx
'use client'

import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { MessageItem } from './message-item'
import type { Message } from '@/types/conversation'

interface MessageListProps {
  messages: Message[]
  loading: boolean
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(({
  messages,
  loading
}, ref) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-4">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando mensajes...</p>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay mensajes en esta conversación</p>
      </div>
    )
  }

  return (
    <div ref={ref} className="space-y-4">
      {messages.map((message, index) => {
        const previousMessage = messages[index - 1]
        const showAvatar = !previousMessage || 
          previousMessage.sender_type !== message.sender_type ||
          previousMessage.sender_id !== message.sender_id

        return (
          <MessageItem
            key={message.id}
            message={message}
            showAvatar={showAvatar}
          />
        )
      })}
    </div>
  )
})

MessageList.displayName = 'MessageList'
```

### Message Item Component
```tsx
// components/conversations/message-item.tsx
'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  Bot, 
  User, 
  ThumbsUp, 
  ThumbsDown, 
  MoreVertical,
  Copy,
  Reply
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Message } from '@/types/conversation'

interface MessageItemProps {
  message: Message
  showAvatar: boolean
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  showAvatar
}) => {
  const [showReactions, setShowReactions] = useState(false)
  
  const isBot = message.sender_type === 'bot'
  const isSystem = message.sender_type === 'system'
  const isHuman = message.sender_type === 'human'
  const isEndUser = message.sender_type === 'end_user'

  const getSenderName = () => {
    if (isBot) return 'Chatbot'
    if (isSystem) return 'Sistema'
    if (isHuman && message.sender) {
      return `${message.sender.first_name} ${message.sender.last_name}`
    }
    return 'Usuario'
  }

  const getSenderAvatar = () => {
    if (isBot) return <Bot className="h-4 w-4" />
    if (isSystem) return <Bot className="h-4 w-4" />
    if (message.sender?.avatar_url) {
      return <AvatarImage src={message.sender.avatar_url} />
    }
    return <User className="h-4 w-4" />
  }

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content)
  }

  const handleReaction = (reactionType: string) => {
    // Implementation for adding reactions
    console.log('Add reaction:', reactionType, message.id)
  }

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        'group flex gap-3 max-w-4xl',
        (isHuman || isBot) ? 'ml-0' : 'ml-auto flex-row-reverse'
      )}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarFallback className={cn(
              isBot && 'bg-blue-100 text-blue-600',
              isHuman && 'bg-green-100 text-green-600',
              isEndUser && 'bg-gray-100 text-gray-600'
            )}>
              {getSenderAvatar()}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        'flex-1 space-y-1',
        !showAvatar && 'ml-11' // Align with avatar when hidden
      )}>
        {/* Header */}
        {showAvatar && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-foreground">
                {getSenderName()}
              </span>
              <time 
                className="text-xs text-muted-foreground"
                dateTime={message.created_at}
                title={new Date(message.created_at).toLocaleString()}
              >
                {formatDistanceToNow(new Date(message.created_at), {
                  addSuffix: true,
                  locale: es
                })}
              </time>
              {message.model_used && (
                <Badge variant="outline" className="text-xs">
                  {message.model_used}
                </Badge>
              )}
            </div>

            {/* Message Actions */}
            <div className={cn(
              'flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity',
              showReactions && 'opacity-100'
            )}>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleReaction('thumbs_up')}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleReaction('thumbs_down')}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleCopyMessage}>
                    <Copy className="mr-2 h-3 w-3" />
                    Copiar mensaje
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Reply className="mr-2 h-3 w-3" />
                    Responder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        {/* Message Body */}
        <div className={cn(
          'rounded-lg px-3 py-2 text-sm break-words',
          isBot && 'bg-muted',
          isHuman && 'bg-primary text-primary-foreground',
          isEndUser && 'bg-blue-50 border border-blue-200 text-blue-900'
        )}>
          <div className="whitespace-pre-wrap">{message.content}</div>
          
          {/* Media content */}
          {message.media_url && (
            <div className="mt-2">
              {message.media_type?.startsWith('image/') ? (
                <img 
                  src={message.media_url} 
                  alt="Message attachment"
                  className="max-w-sm rounded border"
                  loading="lazy"
                />
              ) : (
                <a 
                  href={message.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:underline"
                >
                  <span>📎 Archivo adjunto</span>
                </a>
              )}
            </div>
          )}

          {/* Knowledge base indicator */}
          {message.used_knowledge_base && (
            <div className="mt-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                📚 Base de conocimiento
              </Badge>
              {message.confidence_score && (
                <span className="ml-2">
                  Confianza: {Math.round(message.confidence_score * 100)}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Message Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex items-center space-x-2 mt-1">
            {message.reactions.map((reaction) => (
              <Button
                key={reaction.id}
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
              >
                {reaction.reaction_type === 'thumbs_up' && '👍'}
                {reaction.reaction_type === 'thumbs_down' && '👎'}
                {reaction.reaction_type === 'helpful' && '✅'}
                {reaction.reaction_type === 'not_helpful' && '❌'}
              </Button>
            ))}
          </div>
        )}

        {/* Processing info for debugging */}
        {process.env.NODE_ENV === 'development' && message.processing_time_ms > 0 && (
          <div className="text-xs text-muted-foreground">
            Procesado en {message.processing_time_ms}ms
            {message.tokens_used > 0 && ` • ${message.tokens_used} tokens`}
          </div>
        )}
      </div>
    </div>
  )
}
```

### Custom Hooks
```tsx
// hooks/use-conversations.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ConversationFilters } from '@/types/conversation-ui'
import type { Conversation } from '@/types/conversation'

const CONVERSATIONS_QUERY_KEY = ['conversations']

interface UseConversationsOptions {
  filters: ConversationFilters
  realtime?: boolean
  pageSize?: number
}

export const useConversations = (options: UseConversationsOptions) => {
  const { filters, realtime = false, pageSize = 20 } = options
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const queryKey = [...CONVERSATIONS_QUERY_KEY, filters, page]

  const {
    data,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.chatbot_id && { chatbot_id: filters.chatbot_id }),
        ...(filters.assigned_operator_id && { assigned_operator_id: filters.assigned_operator_id }),
        ...(filters.search && { search: filters.search }),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date })
      })

      const response = await fetch(`/api/conversations?${searchParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }
      return response.json()
    },
    staleTime: 30000, // 30 seconds
    keepPreviousData: true
  })

  // Load more conversations (infinite scroll)
  const loadMore = useCallback(async () => {
    if (data?.pagination?.pages && page < data.pagination.pages) {
      setPage(prev => prev + 1)
    }
  }, [data?.pagination?.pages, page])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [filters])

  // Real-time updates
  useEffect(() => {
    if (!realtime) return

    const handleConversationUpdate = (payload: any) => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
    }

    // Subscribe to real-time updates
    // Implementation depends on your real-time setup (Supabase, Socket.io, etc.)

    return () => {
      // Cleanup subscription
    }
  }, [realtime, queryClient])

  const conversations = data?.data || []
  const pagination = {
    has_more: page < (data?.pagination?.pages || 0),
    current_page: page,
    total_pages: data?.pagination?.pages || 0,
    total_count: data?.pagination?.total || 0
  }

  return {
    conversations,
    loading,
    error: error?.message || null,
    pagination,
    refetch,
    loadMore
  }
}
```

## Testing Implementation
```tsx
// __tests__/components/conversations/conversation-list.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConversationList } from '@/components/conversations/conversation-list'

const mockConversations = [
  {
    id: 'conv-1',
    end_user_name: 'John Doe',
    end_user_id: 'user-1',
    channel: 'web',
    status: 'active',
    message_count: 5,
    last_message_at: '2024-01-01T10:00:00Z',
    chatbot: { name: 'Support Bot' },
    created_at: '2024-01-01T09:00:00Z'
  },
  {
    id: 'conv-2',
    end_user_name: 'Jane Smith',
    end_user_id: 'user-2',
    channel: 'whatsapp',
    status: 'waiting_human',
    message_count: 3,
    last_message_at: '2024-01-01T09:30:00Z',
    chatbot: { name: 'Sales Bot' },
    created_at: '2024-01-01T09:15:00Z'
  }
]

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('ConversationList', () => {
  const defaultProps = {
    conversations: mockConversations,
    loading: false,
    error: null,
    selectedConversationId: null,
    onConversationSelect: jest.fn(),
    onLoadMore: jest.fn(),
    hasMore: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders conversation list correctly', () => {
    render(<ConversationList {...defaultProps} />, { wrapper: createWrapper() })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Support Bot')).toBeInTheDocument()
    expect(screen.getByText('Sales Bot')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(
      <ConversationList {...defaultProps} conversations={[]} loading={true} />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Cargando conversaciones...')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(
      <ConversationList {...defaultProps} error="Failed to load conversations" />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Failed to load conversations')).toBeInTheDocument()
    expect(screen.getByText('Reintentar')).toBeInTheDocument()
  })

  it('shows empty state', () => {
    render(
      <ConversationList {...defaultProps} conversations={[]} />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('No hay conversaciones')).toBeInTheDocument()
  })

  it('handles conversation selection', async () => {
    render(<ConversationList {...defaultProps} />, { wrapper: createWrapper() })

    const firstConversation = screen.getByText('John Doe').closest('[role="button"]')
    fireEvent.click(firstConversation!)

    expect(defaultProps.onConversationSelect).toHaveBeenCalledWith('conv-1')
  })

  it('highlights selected conversation', () => {
    render(
      <ConversationList {...defaultProps} selectedConversationId="conv-1" />,
      { wrapper: createWrapper() }
    )

    const selectedItem = screen.getByText('John Doe').closest('div')
    expect(selectedItem).toHaveClass('bg-accent')
  })

  it('handles keyboard navigation', async () => {
    render(<ConversationList {...defaultProps} />, { wrapper: createWrapper() })

    const firstConversation = screen.getByText('John Doe').closest('[role="button"]')
    fireEvent.keyDown(firstConversation!, { key: 'Enter' })

    expect(defaultProps.onConversationSelect).toHaveBeenCalledWith('conv-1')
  })

  it('shows HITL badge for conversations with human operators', () => {
    const conversationsWithHITL = [
      { ...mockConversations[0], is_hitl_active: true }
    ]

    render(
      <ConversationList {...defaultProps} conversations={conversationsWithHITL} />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('HITL')).toBeInTheDocument()
  })
})
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- UI Components implemented: ConversationList, ChatInterface, MessageList, MessageItem
- Pages created: /dashboard/conversations (main), /dashboard/conversations/[id] (individual)
- Real-time features: ✅ Supabase subscriptions for messages and conversation updates
- Responsive design: ✅ Resizable panels, mobile-friendly layout
- Accessibility: ✅ WCAG 2.1 AA with keyboard navigation and screen reader support
- Performance: ✅ Virtual scrolling, infinite scroll, optimistic updates
- Testing: ✅ Comprehensive component tests with React Testing Library
- Integration: ✅ Complete API integration with error handling and loading states
- Next UI task: TASK-P1E4-04d (basic analytics dashboard)
- Ready for operator workflow: ✅ Full conversation management UI available
```

## Troubleshooting Frontend
### Common Issues
- **Real-time Connection Drops:** Verificar Supabase connection status y implement reconnection
- **Message Ordering:** Asegurar timestamps consistency y scroll position
- **Performance con Large Lists:** Monitor virtual scrolling y pagination effectiveness
- **Mobile Layout Issues:** Probar responsive behavior en diferentes screen sizes

### Debugging Commands
```bash
# Development server
npm run dev

# Component testing
npm run test -- --watch conversations

# Bundle analysis
npm run build:analyze

# Accessibility testing
npm run test:a11y

# Performance profiling
npm run lighthouse
```

---
*Tarea específica para implementar UI completa de conversaciones con chat en tiempo real, lista responsive, filtros avanzados, y gestión de estados HITL con accesibilidad y performance optimizadas.*