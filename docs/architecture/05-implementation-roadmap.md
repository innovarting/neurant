# NeurAnt - Roadmap Detallado de Implementación

## Resumen Ejecutivo

Roadmap de desarrollo para NeurAnt dividido en **4 fases incrementales** durante **8 meses**, desde el setup inicial hasta el lanzamiento público. Cada fase entrega valor funcional y establece las bases para la siguiente.

**Timeline**: Enero 2025 → Septiembre 2025  
**MVP Target**: 15 Septiembre 2025  
**Launch**: Octubre 2025  

## Metodología de Desarrollo

### Enfoque: **Incremental Development + Continuous Delivery**
- **Sprints de 2 semanas** con demos al final
- **Feature flags** para deployment gradual
- **User feedback loops** cada fase
- **Technical debt tracking** y resolución proactiva

### Team Allocation (3 Developers)
- **Dev 1 (Lead)**: Architecture, Backend API, Database
- **Dev 2 (Full-stack)**: Frontend, UI/UX, Integration
- **Dev 3 (Backend)**: n8n workflows, External APIs, DevOps

## Fase 1: Fundación y MVP Core (Mes 1-2)
*Enero - Febrero 2025*

### 🎯 Objetivos
- Establecer infraestructura base completa
- Sistema de autenticación y multi-tenancy funcional
- CRUD básico de entidades principales
- Primera versión de chatbot funcional

### 📋 Sprint 1.1: Infrastructure Setup (2 semanas)
**Responsable**: Dev 1 + Dev 3

#### Deliverables
- [ ] **Project Setup**
  - Next.js 14 project initialization
  - TypeScript configuration optimizada
  - ESLint, Prettier, Husky setup
  - Package.json con dependencias core

- [ ] **Supabase Configuration**
  - Database schema implementation (companies, users, chatbots)
  - Row Level Security (RLS) policies básicas
  - Authentication setup con roles
  - Storage buckets para archivos

- [ ] **Deployment Pipeline**
  - Vercel project connection
  - Environment variables configuration
  - Staging y production environments
  - Database migrations workflow

#### Technical Tasks
```typescript
// 1. Database Schema Creation
export const createInitialSchema = async () => {
  // Companies table
  await sql`CREATE TABLE companies (...)`
  
  // Users table with RLS
  await sql`CREATE TABLE users (...)`
  
  // Chatbots table
  await sql`CREATE TABLE chatbots (...)`
  
  // Initial RLS policies
  await sql`CREATE POLICY companies_isolation ON companies ...`
}

// 2. Authentication Setup
export const setupAuth = () => {
  return createMiddleware({
    routes: {
      public: ['/login', '/signup'],
      protected: ['/dashboard/*']
    }
  })
}
```

#### Success Criteria
- ✅ Project builds and deploys successfully
- ✅ Database schema created with RLS working
- ✅ Authentication flow functional (login/signup/logout)
- ✅ Multi-tenant isolation verified

---

### 📋 Sprint 1.2: Core Authentication & Multi-tenancy (2 semanas)
**Responsable**: Dev 1 + Dev 2

#### Deliverables
- [ ] **Authentication System**
  - Login/Signup pages con Supabase Auth
  - Email verification workflow
  - Password reset functionality
  - Role-based access control (RBAC)

- [ ] **Multi-tenant Foundation**
  - Company registration flow
  - User invitation system
  - Role management (admin, supervisor, operador)
  - Tenant context provider

- [ ] **Basic Dashboard**
  - Layout con navigation
  - User profile management
  - Company settings page
  - Empty states para próximas features

#### UI Components Implementation
```typescript
// Authentication Components
export const LoginForm = () => {
  const { signIn } = useAuth()
  
  return (
    <form onSubmit={handleLogin}>
      <Input type="email" placeholder="Email" />
      <Input type="password" placeholder="Password" />
      <Button type="submit">Iniciar Sesión</Button>
    </form>
  )
}

// Dashboard Layout
export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, company } = useAuth()
  
  if (!user || !company) return <AuthGuard />
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
```

#### Success Criteria
- ✅ Complete authentication flow working
- ✅ Multi-tenant user isolation verified
- ✅ Role-based permissions functional
- ✅ Dashboard accessible post-login

---

### 📋 Sprint 1.3: Chatbot CRUD & n8n Integration (2 semanas)
**Responsable**: Dev 2 + Dev 3

#### Deliverables
- [ ] **Chatbot Management**
  - Create/Edit/Delete chatbots
  - Basic configuration (name, description, system prompt)
  - Template selection system
  - Chatbot activation/deactivation

- [ ] **n8n Workflow Setup**
  - n8n Cloud account y basic workflows
  - WhatsApp webhook integration
  - Message routing n8n → NeurAnt
  - Basic bot response via n8n + OpenAI

- [ ] **API Endpoints**
  - RESTful APIs para chatbot management
  - Webhook endpoints para n8n integration
  - Basic message storage

#### n8n Workflow Implementation
```yaml
# Basic WhatsApp Bot Workflow
name: "WhatsApp Bot Handler"
nodes:
  - name: "Webhook"
    type: "n8n-nodes-base.webhook"
    parameters:
      path: "whatsapp-incoming"
      
  - name: "Check Bot Status"
    type: "n8n-nodes-base.httpRequest"
    parameters:
      url: "https://neurant.app/api/webhooks/bot-status"
      method: "POST"
      
  - name: "OpenAI Response"
    type: "n8n-nodes-base.openAi"
    parameters:
      model: "gpt-4-turbo"
      
  - name: "Send WhatsApp"
    type: "n8n-nodes-base.whatsApp"
    parameters:
      operation: "sendMessage"
```

#### Success Criteria
- ✅ Chatbots can be created and configured via UI
- ✅ Basic n8n workflow responds to WhatsApp messages
- ✅ Messages flow: WhatsApp → n8n → OpenAI → WhatsApp
- ✅ Conversation data stored in database

---

### 📋 Sprint 1.4: Conversations & Basic Analytics (2 semanas)
**Responsable**: Dev 1 + Dev 2

#### Deliverables
- [ ] **Conversation Management**
  - Conversation history display
  - Message threading y pagination
  - End-user identification
  - Conversation status tracking

- [ ] **Basic Analytics**
  - Message count dashboard
  - Active conversations counter
  - Basic usage metrics per chatbot
  - Simple charts con Recharts

- [ ] **UI Polish**
  - Responsive design implementation
  - Loading states y error handling
  - Basic notifications system
  - UX improvements based on testing

#### Analytics Implementation
```typescript
// Basic Analytics Queries
export const getBasicMetrics = async (companyId: string) => {
  const [
    totalMessages,
    activeConversations,
    totalChatbots
  ] = await Promise.all([
    supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId),
      
    supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'active'),
      
    supabase
      .from('chatbots')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_active', true)
  ])
  
  return {
    totalMessages: totalMessages.count || 0,
    activeConversations: activeConversations.count || 0,
    totalChatbots: totalChatbots.count || 0
  }
}
```

#### Success Criteria
- ✅ Conversation history viewable en dashboard
- ✅ Basic analytics functioning
- ✅ UI responsive en mobile y desktop
- ✅ End-to-end flow: WhatsApp → Bot → Response functional

---

## Fase 2: Core Features & RAG (Mes 3-4)
*Marzo - Abril 2025*

### 🎯 Objetivos
- Sistema RAG funcional con knowledge base
- Multi-canal support (Telegram, Slack)
- Configuración avanzada de chatbots
- Templates de industria implementados

### 📋 Sprint 2.1: RAG Foundation (2 semanas)
**Responsabile**: Dev 1 + Dev 3

#### Deliverables
- [ ] **Vector Database Setup**
  - pgvector extension configuration
  - Document storage con Supabase Storage
  - PDF text extraction pipeline
  - Chunking strategy implementation

- [ ] **Document Management**
  - Document upload interface
  - Processing status tracking
  - Document organization por chatbot
  - Error handling para processing failures

- [ ] **Embedding Generation**
  - OpenAI embedding integration
  - Batch processing para documents
  - Cost tracking para embeddings
  - Vector storage optimization

#### Document Processing Pipeline
```typescript
export class DocumentProcessor {
  async processDocument(file: File, companyId: string, chatbotId?: string) {
    // 1. Upload to storage
    const { data: upload } = await supabase.storage
      .from('documents')
      .upload(`${companyId}/${file.name}`, file)
    
    // 2. Extract text
    const extractedText = await this.extractTextFromPDF(upload.path)
    
    // 3. Create document record
    const { data: document } = await supabase
      .from('documents')
      .insert({
        company_id: companyId,
        chatbot_id: chatbotId,
        filename: file.name,
        extracted_text: extractedText,
        processing_status: 'processing'
      })
      .select()
      .single()
    
    // 4. Chunk and embed (background job)
    await this.processDocumentChunks(document.id, extractedText)
    
    return document
  }
  
  private async processDocumentChunks(documentId: string, text: string) {
    const chunks = this.chunkText(text)
    
    for (const chunk of chunks) {
      // Generate embedding
      const embedding = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: chunk.content
      })
      
      // Store chunk with embedding
      await supabase.from('document_chunks').insert({
        document_id: documentId,
        content: chunk.content,
        chunk_index: chunk.index,
        embedding: embedding.data[0].embedding
      })
    }
    
    // Update document status
    await supabase
      .from('documents')
      .update({ processing_status: 'completed' })
      .eq('id', documentId)
  }
}
```

#### Success Criteria
- ✅ Documents can be uploaded and processed
- ✅ Text extraction working para PDFs
- ✅ Vector embeddings generated y stored
- ✅ Basic vector similarity search functional

---

### 📋 Sprint 2.2: RAG Integration & Knowledge Search (2 semanas)
**Responsable**: Dev 1 + Dev 2

#### Deliverables
- [ ] **Knowledge Base Search**
  - Vector similarity search implementation
  - Hybrid search (vector + full-text)
  - Relevance scoring y ranking
  - Search result presentation

- [ ] **RAG Integration**
  - Context injection en chatbot prompts
  - Knowledge source attribution
  - Confidence scoring para responses
  - Fallback cuando no hay knowledge relevante

- [ ] **Knowledge Management UI**
  - Document library interface
  - Search testing interface
  - Knowledge base analytics
  - Document performance metrics

#### RAG Query Implementation
```typescript
export class RAGService {
  async enhancePrompt(
    query: string, 
    companyId: string, 
    chatbotId?: string
  ): Promise<string> {
    
    // 1. Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query)
    
    // 2. Search relevant chunks
    const relevantChunks = await supabase.rpc('search_documents', {
      query_embedding: queryEmbedding,
      company_id: companyId,
      chatbot_id: chatbotId,
      similarity_threshold: 0.75,
      match_count: 3
    })
    
    // 3. Build enhanced prompt
    if (relevantChunks.length === 0) {
      return query // No relevant context found
    }
    
    const contextSection = relevantChunks
      .map((chunk, idx) => `
**Fuente ${idx + 1}**: ${chunk.document_title}
${chunk.content}
---`)
      .join('\n')
    
    return `
${query}

CONTEXTO RELEVANTE:
${contextSection}

Instrucciones: Utiliza el contexto anterior para enriquecer tu respuesta. Si citas información del contexto, menciona la fuente.
`
  }
}
```

#### Success Criteria
- ✅ RAG search returns relevant document chunks
- ✅ Chatbot responses enhanced with knowledge base
- ✅ Source attribution working
- ✅ Performance acceptable (< 2s for enhanced responses)

---

### 📋 Sprint 2.3: Multi-Channel Support (2 semanas)
**Responsable**: Dev 3 + Dev 2

#### Deliverables
- [ ] **Telegram Integration**
  - Telegram Bot API setup
  - n8n workflow para Telegram
  - Message format adaptation
  - Telegram-specific features

- [ ] **Slack Integration**
  - Slack App creation y configuration
  - Slack Bot API integration
  - n8n workflow para Slack
  - Workspace installation flow

- [ ] **Channel Management**
  - Multi-channel configuration per chatbot
  - Channel-specific settings
  - Message routing logic
  - Cross-channel analytics

#### Multi-Channel n8n Workflows
```yaml
# Telegram Bot Workflow
telegram_workflow:
  trigger: "Telegram Webhook"
  nodes:
    - parse_telegram_message
    - check_bot_status
    - process_with_ai
    - send_telegram_response
    
# Slack Bot Workflow  
slack_workflow:
  trigger: "Slack Events API"
  nodes:
    - parse_slack_event
    - check_bot_status
    - process_with_ai
    - send_slack_message
    
# Universal Message Router
message_router:
  input: "Channel-agnostic message"
  logic: |
    switch (channel) {
      case 'whatsapp': return whatsapp_workflow
      case 'telegram': return telegram_workflow
      case 'slack': return slack_workflow
    }
```

#### Success Criteria
- ✅ Telegram bot responding to messages
- ✅ Slack bot functional en workspaces
- ✅ Single chatbot can handle multiple channels
- ✅ Message history unified across channels

---

### 📋 Sprint 2.4: Templates & Advanced Configuration (2 semanas)  
**Responsable**: Dev 2 + Dev 1

#### Deliverables
- [ ] **Chatbot Templates**
  - Industry-specific templates (retail, healthcare, finance)
  - Template library interface
  - Template customization workflow
  - Template marketplace foundation

- [ ] **Advanced Configuration**
  - Personality traits configuration
  - Response delay settings
  - Context window management
  - Fallback message customization

- [ ] **Testing & Validation**
  - Chatbot testing interface
  - Conversation simulation
  - A/B testing framework foundation
  - Performance monitoring setup

#### Template System Implementation
```typescript
interface ChatbotTemplate {
  id: string
  name: string
  industry: string
  category: 'customer_service' | 'sales' | 'support'
  system_prompt_template: string
  default_personality: PersonalityTraits
  recommended_settings: ChatbotSettings
  example_conversations: Conversation[]
}

export const templates: ChatbotTemplate[] = [
  {
    id: 'retail-customer-service',
    name: 'Atención al Cliente - Retail',
    industry: 'retail',
    category: 'customer_service',
    system_prompt_template: `
Eres un asistente de atención al cliente para {{company_name}}, una empresa de retail.

Tu personalidad es: {{personality_traits}}

Información de la empresa:
{{knowledge_base_context}}

Instrucciones:
- Sé amable y profesional en todo momento
- Ayuda con consultas sobre productos, pedidos y devoluciones
- Si no puedes resolver algo, ofrece escalación a un humano
- Siempre mantén el enfoque en la satisfacción del cliente
`,
    default_personality: {
      tone: 'friendly',
      formality: 'professional',
      empathy: 'high'
    }
  }
]
```

#### Success Criteria
- ✅ Templates available en chatbot creation
- ✅ Template customization working
- ✅ Advanced settings configurable
- ✅ Testing interface functional

---

## Fase 3: HITL & Analytics (Mes 5-6)  
*Mayo - Junio 2025*

### 🎯 Objetivos
- Sistema HITL completamente funcional
- Analytics avanzados y reporting
- Optimización de performance
- Sistema de notificaciones robusto

### 📋 Sprint 3.1: HITL Foundation (2 semanas)
**Responsable**: Dev 1 + Dev 3

#### Deliverables
- [ ] **HITL Database Schema**
  - HITL sessions tabla y relationships
  - State machine implementation
  - Operator assignment logic
  - Session metrics tracking

- [ ] **Escalation Triggers**
  - Keyword-based triggers
  - Confidence threshold triggers
  - Manual escalation by end users
  - Time-based escalation

- [ ] **Basic HITL Flow**
  - Escalation detection
  - Operator assignment (round-robin)
  - State transitions
  - Basic handoff back to bot

#### HITL State Machine
```typescript
export enum HITLStatus {
  BOT_ACTIVE = 'bot_active',
  HITL_PENDING = 'hitl_pending', 
  HITL_ACTIVE = 'hitl_active',
  HITL_RESOLVED = 'hitl_resolved',
  ABANDONED = 'abandoned'
}

export class HITLStateMachine {
  async escalateToHITL(
    conversationId: string,
    trigger: EscalationTrigger,
    reason?: string
  ): Promise<HITLSession> {
    
    // 1. Check current state
    const conversation = await this.getConversation(conversationId)
    if (conversation.is_hitl_active) {
      throw new Error('Conversation already in HITL mode')
    }
    
    // 2. Find available operator
    const operator = await this.findAvailableOperator(
      conversation.company_id,
      conversation.chatbot_id
    )
    
    if (!operator) {
      // Queue for next available operator
      return this.queueForHITL(conversationId, trigger, reason)
    }
    
    // 3. Create HITL session
    const session = await this.createHITLSession({
      conversation_id: conversationId,
      assigned_operator_id: operator.id,
      trigger,
      reason
    })
    
    // 4. Update conversation state
    await this.updateConversationState(conversationId, {
      is_hitl_active: true,
      assigned_operator_id: operator.id,
      hitl_activated_at: new Date()
    })
    
    // 5. Notify operator
    await this.notifyOperator(operator.id, session)
    
    return session
  }
}
```

#### Success Criteria
- ✅ HITL escalation triggers working
- ✅ Operator gets notified of new assignments
- ✅ State transitions function correctly
- ✅ Basic HITL session management operational

---

### 📋 Sprint 3.2: HITL Real-time Interface (2 semanas)
**Responsable**: Dev 2 + Dev 1

#### Deliverables
- [ ] **Operator Dashboard**
  - Real-time conversation list
  - Active HITL sessions display
  - Message threading interface
  - Operator status management

- [ ] **Real-time Chat Interface**
  - Bi-directional messaging
  - Typing indicators
  - Message status (sent, delivered, read)
  - File sharing support

- [ ] **Conversation Context**
  - Full conversation history display
  - Bot interaction summary
  - Customer context y metadata
  - Knowledge base references used

#### Real-time Chat Component
```typescript
export const HITLChatInterface: React.FC<{
  conversationId: string
  onResolve: () => void
}> = ({ conversationId, onResolve }) => {
  
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const { user } = useAuth()
  
  // Real-time message subscription
  useEffect(() => {
    const subscription = supabase
      .channel(`hitl-chat-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        const newMsg = payload.new as Message
        setMessages(prev => [...prev, newMsg])
        
        // Play notification sound for end user messages
        if (newMsg.sender_type === 'end_user') {
          playNotificationSound()
        }
      })
      .subscribe()
      
    return () => {
      supabase.removeChannel(subscription)
    }
  }, [conversationId])
  
  const sendMessage = async () => {
    if (!newMessage.trim()) return
    
    try {
      await hitlService.sendOperatorMessage(
        conversationId,
        newMessage,
        user.id
      )
      setNewMessage('')
    } catch (error) {
      toast.error('Failed to send message')
    }
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
      
      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe tu respuesta..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button onClick={sendMessage}>Enviar</Button>
          <Button variant="outline" onClick={onResolve}>
            Resolver
          </Button>
        </div>
      </div>
    </div>
  )
}
```

#### Success Criteria
- ✅ Operators can see and respond to HITL messages in real-time
- ✅ End users receive operator responses via original channel
- ✅ Conversation context fully visible to operators
- ✅ Message delivery confirmation working

---

### 📋 Sprint 3.3: Advanced Analytics (2 semanas)
**Responsable**: Dev 1 + Dev 2

#### Deliverables
- [ ] **Analytics Dashboard**
  - Multi-dimensional metrics visualization
  - Time-series charts con drill-down
  - Comparative analytics (bot vs HITL)
  - Real-time metrics updates

- [ ] **Performance Metrics**
  - Response time analytics
  - Resolution rate tracking
  - Customer satisfaction scoring
  - Operator performance metrics

- [ ] **Business Intelligence**
  - Usage trends analysis
  - Peak hours identification
  - Channel performance comparison
  - ROI calculations

#### Analytics Implementation
```typescript
export class AnalyticsService {
  async getDashboardMetrics(
    companyId: string,
    dateRange: DateRange,
    chatbotId?: string
  ): Promise<DashboardMetrics> {
    
    const baseQuery = supabase
      .from('analytics_daily')
      .select('*')
      .eq('company_id', companyId)
      .gte('date', dateRange.start)
      .lte('date', dateRange.end)
    
    if (chatbotId) {
      baseQuery.eq('chatbot_id', chatbotId)
    }
    
    const { data: dailyMetrics } = await baseQuery
    
    return {
      totalMessages: dailyMetrics.reduce((sum, day) => sum + day.total_messages, 0),
      avgResponseTime: this.calculateAverage(dailyMetrics, 'avg_response_time_ms'),
      satisfactionScore: this.calculateAverage(dailyMetrics, 'satisfaction_avg'),
      hitlEscalationRate: this.calculateEscalationRate(dailyMetrics),
      trends: this.calculateTrends(dailyMetrics),
      channelBreakdown: await this.getChannelBreakdown(companyId, dateRange)
    }
  }
  
  async generateReport(
    companyId: string,
    reportType: 'daily' | 'weekly' | 'monthly',
    options: ReportOptions
  ): Promise<Report> {
    
    const metrics = await this.getDashboardMetrics(
      companyId,
      this.getDateRangeForReport(reportType)
    )
    
    return {
      id: generateId(),
      type: reportType,
      company_id: companyId,
      metrics,
      insights: await this.generateInsights(metrics),
      recommendations: await this.generateRecommendations(metrics),
      generated_at: new Date()
    }
  }
}
```

#### Success Criteria
- ✅ Comprehensive analytics dashboard functional
- ✅ Real-time metrics updating
- ✅ Export functionality for reports
- ✅ Performance insights actionable

---

### 📋 Sprint 3.4: Notifications & Optimization (2 semanas)
**Responsable**: Dev 3 + Dev 2  

#### Deliverables
- [ ] **Notification System**
  - In-app notifications
  - Email notifications para key events
  - Push notifications (foundation)
  - Notification preferences management

- [ ] **Performance Optimization**
  - Database query optimization
  - Caching implementation
  - Bundle size optimization
  - Load time improvements

- [ ] **Monitoring & Alerting**
  - Error tracking con Sentry
  - Performance monitoring
  - Usage alerting
  - Health checks

#### Notification System
```typescript
export class NotificationService {
  async sendNotification(
    userId: string,
    type: NotificationType,
    data: NotificationData
  ): Promise<void> {
    
    // 1. Get user notification preferences
    const preferences = await this.getUserPreferences(userId)
    
    // 2. Send in-app notification
    if (preferences.in_app_enabled) {
      await this.sendInAppNotification(userId, {
        type,
        title: this.getNotificationTitle(type),
        message: this.getNotificationMessage(type, data),
        data
      })
    }
    
    // 3. Send email if enabled
    if (preferences.email_enabled && this.shouldSendEmail(type)) {
      await this.sendEmailNotification(userId, type, data)
    }
    
    // 4. Log notification for analytics
    await this.logNotification(userId, type, data)
  }
  
  private async sendInAppNotification(
    userId: string,
    notification: InAppNotification
  ): Promise<void> {
    
    // Store in database
    await supabase.from('notifications').insert({
      user_id: userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      read: false
    })
    
    // Send real-time update
    await supabase
      .channel(`notifications-${userId}`)
      .send({
        type: 'broadcast',
        event: 'new_notification',
        payload: notification
      })
  }
}
```

#### Success Criteria
- ✅ Operators receive notifications for new HITL assignments
- ✅ Email alerts working for critical events
- ✅ Performance improvements measurable
- ✅ Error monitoring operational

---

## Fase 4: Integraciones & Launch (Mes 7-8)
*Julio - Agosto 2025*

### 🎯 Objetivos
- Integraciones con sistemas externos
- Sistema de billing y quotas
- Optimización final y testing
- Preparación para lanzamiento público

### 📋 Sprint 4.1: External Integrations (2 semanas)
**Responsable**: Dev 3 + Dev 1

#### Deliverables
- [ ] **Google Workspace Integration**
  - OAuth 2.0 setup para Google APIs
  - Google Docs, Sheets, Calendar, Gmail connectors
  - Data sync workflows
  - Permission management

- [ ] **Database Connectors**  
  - MySQL connection setup
  - PostgreSQL connection setup
  - Query builder interface
  - Security y access control

- [ ] **AirTable Integration**
  - AirTable API connection
  - Base y table selection
  - Field mapping interface
  - Sync scheduling

#### Integration Implementation
```typescript
export class IntegrationService {
  async connectGoogleWorkspace(
    companyId: string,
    authCode: string
  ): Promise<Integration> {
    
    // 1. Exchange auth code for access token
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )
    
    const { tokens } = await oauth2Client.getToken(authCode)
    oauth2Client.setCredentials(tokens)
    
    // 2. Store encrypted tokens
    const integration = await supabase
      .from('integrations')
      .insert({
        company_id: companyId,
        integration_type: 'google_workspace',
        auth_type: 'oauth2',
        oauth_token_encrypted: await this.encrypt(JSON.stringify(tokens)),
        is_active: true
      })
      .select()
      .single()
    
    // 3. Test connection
    await this.testGoogleConnection(integration.id)
    
    return integration.data
  }
  
  async syncGoogleDocs(integrationId: string): Promise<SyncResult> {
    const integration = await this.getIntegration(integrationId)
    const tokens = JSON.parse(await this.decrypt(integration.oauth_token_encrypted))
    
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials(tokens)
    
    const docs = google.docs({ version: 'v1', auth: oauth2Client })
    
    // Get list of documents
    const drive = google.drive({ version: 'v3', auth: oauth2Client })
    const { data } = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.document'",
      fields: 'files(id, name, modifiedTime)'
    })
    
    const syncResults = []
    
    for (const file of data.files || []) {
      try {
        // Get document content
        const doc = await docs.documents.get({ documentId: file.id })
        const content = this.extractTextFromGoogleDoc(doc.data)
        
        // Store as knowledge base document
        await this.storeAsKnowledgeDocument({
          company_id: integration.company_id,
          title: file.name,
          content,
          source: 'google_docs',
          external_id: file.id
        })
        
        syncResults.push({ success: true, document: file.name })
      } catch (error) {
        syncResults.push({ success: false, document: file.name, error: error.message })
      }
    }
    
    return { results: syncResults }
  }
}
```

#### Success Criteria
- ✅ Google Workspace connection functional
- ✅ External database queries working
- ✅ AirTable integration operational
- ✅ Integration management UI complete

---

### 📋 Sprint 4.2: Billing & Usage Management (2 semanas)
**Responsable**: Dev 2 + Dev 1

#### Deliverables
- [ ] **Usage Tracking**
  - Message counting y quota enforcement
  - User limit enforcement
  - Storage usage tracking
  - Integration usage monitoring

- [ ] **Billing System Foundation**
  - Plan management interface
  - Usage alerts y notifications
  - Overage handling
  - Subscription status management

- [ ] **Admin Tools**
  - Company usage dashboard
  - Plan upgrade/downgrade flows
  - Usage analytics
  - Billing history

#### Usage Management System
```typescript
export class UsageService {
  async trackMessageUsage(companyId: string, messageType: 'bot' | 'human'): Promise<void> {
    // Only count bot messages towards limits
    if (messageType !== 'bot') return
    
    const company = await this.getCompany(companyId)
    
    // Check if monthly limit reached
    if (company.monthly_message_count >= company.monthly_message_limit) {
      throw new UsageLimitError('Monthly message limit reached')
    }
    
    // Increment counter
    await supabase
      .from('companies')
      .update({ 
        monthly_message_count: company.monthly_message_count + 1 
      })
      .eq('id', companyId)
    
    // Check for usage alerts
    await this.checkUsageAlerts(companyId, company.monthly_message_count + 1)
  }
  
  async checkUsageAlerts(companyId: string, currentUsage: number): Promise<void> {
    const company = await this.getCompany(companyId)
    const usagePercentage = (currentUsage / company.monthly_message_limit) * 100
    
    // Alert at 80% and 95% usage
    if (usagePercentage >= 80 && !company.alert_80_sent) {
      await this.sendUsageAlert(companyId, '80%', currentUsage, company.monthly_message_limit)
      await supabase
        .from('companies')
        .update({ alert_80_sent: true })
        .eq('id', companyId)
    }
    
    if (usagePercentage >= 95 && !company.alert_95_sent) {
      await this.sendUsageAlert(companyId, '95%', currentUsage, company.monthly_message_limit)
      await supabase
        .from('companies')
        .update({ alert_95_sent: true })
        .eq('id', companyId)
    }
  }
  
  async enforceHITLConcurrencyLimit(companyId: string): Promise<boolean> {
    const company = await this.getCompany(companyId)
    
    const { count: activeHITLSessions } = await supabase
      .from('hitl_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'active')
    
    return activeHITLSessions < company.max_hitl_concurrent
  }
}
```

#### Success Criteria
- ✅ Usage limits enforced correctly
- ✅ Usage alerts sent at appropriate thresholds
- ✅ Plan limitations working as designed
- ✅ Upgrade flows functional

---

### 📋 Sprint 4.3: Testing & Quality Assurance (2 semanas)
**Responsable**: Todo el equipo

#### Deliverables
- [ ] **Comprehensive Testing**
  - Unit tests para business logic crítica
  - Integration tests para APIs
  - E2E tests para user flows principales
  - Load testing para performance validation

- [ ] **Security Audit**
  - RLS policy validation
  - Input sanitization verification
  - Authentication flow security review
  - Data encryption verification

- [ ] **Performance Optimization**
  - Database query optimization
  - Frontend bundle optimization
  - API response time optimization
  - Memory usage optimization

#### Testing Implementation
```typescript
// E2E Test Example
describe('Complete Chatbot Flow', () => {
  test('should create chatbot and handle conversation', async () => {
    // 1. Login as company admin
    await page.goto('/login')
    await page.fill('[data-testid=email]', 'admin@testcompany.com')
    await page.fill('[data-testid=password]', 'password123')
    await page.click('[data-testid=login-button]')
    
    // 2. Create new chatbot
    await page.goto('/dashboard/chatbots')
    await page.click('[data-testid=create-chatbot]')
    await page.fill('[data-testid=chatbot-name]', 'Test Bot')
    await page.fill('[data-testid=system-prompt]', 'You are a helpful assistant')
    await page.click('[data-testid=save-chatbot]')
    
    // 3. Verify chatbot appears in list
    await expect(page.locator('[data-testid=chatbot-list]')).toContainText('Test Bot')
    
    // 4. Test conversation via API
    const response = await fetch('/api/webhooks/message-received', {
      method: 'POST',
      body: JSON.stringify({
        chatbot_id: 'test-bot-id',
        message: 'Hello',
        sender_id: 'test-user'
      })
    })
    
    expect(response.status).toBe(200)
  })
})

// Load Testing
describe('Load Testing', () => {
  test('should handle 100 concurrent users', async () => {
    const users = Array.from({ length: 100 }, (_, i) => i)
    
    const promises = users.map(async (userId) => {
      const response = await fetch('/api/dashboard/metrics', {
        headers: { Authorization: `Bearer ${getTestToken(userId)}` }
      })
      return response.status === 200
    })
    
    const results = await Promise.all(promises)
    const successRate = results.filter(Boolean).length / results.length
    
    expect(successRate).toBeGreaterThan(0.95) // 95% success rate
  })
})
```

#### Success Criteria
- ✅ Test coverage > 80% for critical paths
- ✅ All E2E tests passing
- ✅ Load testing shows acceptable performance
- ✅ Security audit issues resolved

---

### 📋 Sprint 4.4: Launch Preparation (2 semanas)
**Responsable**: Todo el equipo

#### Deliverables
- [ ] **Production Environment**
  - Production database setup y optimization
  - SSL certificates y domain configuration
  - Monitoring y alerting setup
  - Backup y recovery procedures

- [ ] **Documentation**
  - User documentation y tutorials
  - API documentation
  - Admin documentation
  - Troubleshooting guides

- [ ] **Launch Strategy**
  - Beta user onboarding process
  - Launch marketing materials
  - Support process setup
  - Feedback collection system

#### Production Checklist
```yaml
# Production Readiness Checklist
infrastructure:
  - [ ] Domain configured (neurant.app)
  - [ ] SSL certificates installed
  - [ ] CDN configured for assets
  - [ ] Database backups automated
  - [ ] Monitoring dashboards setup
  
security:
  - [ ] All secrets in environment variables
  - [ ] RLS policies tested and verified
  - [ ] Rate limiting implemented
  - [ ] Input validation comprehensive
  - [ ] Error messages don't leak sensitive info
  
performance:
  - [ ] Database indexes optimized
  - [ ] API response times < 200ms p95
  - [ ] Frontend bundle size < 1MB
  - [ ] Images optimized and compressed
  - [ ] Caching strategies implemented
  
compliance:
  - [ ] Privacy policy updated
  - [ ] Terms of service finalized
  - [ ] Data retention policies implemented
  - [ ] Audit logging comprehensive
  - [ ] GDPR compliance verified
```

#### Success Criteria
- ✅ Production environment stable y secure
- ✅ Documentation complete y accessible
- ✅ Launch plan approved y ready
- ✅ Beta users successfully onboarded

---

## Success Metrics & KPIs

### Technical Metrics
- **Performance**: API response time < 200ms p95
- **Uptime**: > 99.9% availability
- **Security**: 0 data breaches, RLS violations
- **Quality**: < 1% error rate en production

### Product Metrics  
- **User Adoption**: 50+ companies signed up by launch
- **Engagement**: 80%+ of companies create at least 1 chatbot
- **Satisfaction**: 4.0+ average rating from users
- **Retention**: 70%+ monthly active companies

### Business Metrics
- **Revenue**: Path to $10K MRR by end of year
- **Cost Efficiency**: < $500/month infrastructure costs at launch
- **Support Load**: < 5 support tickets per week
- **Conversion**: 20%+ trial to paid conversion rate

## Risk Management

### High Priority Risks
1. **n8n Integration Complexity**
   - **Mitigation**: Prototype early, fallback plan for direct API integration
   
2. **OpenAI API Rate Limits**
   - **Mitigation**: Usage monitoring, queue system, alternative providers
   
3. **Supabase Scaling Issues**
   - **Mitigation**: Performance testing, migration plan to dedicated PostgreSQL

4. **Team Bandwidth**
   - **Mitigation**: Prioritize ruthlessly, consider part-time contractor for testing

### Medium Priority Risks
1. **User Onboarding Complexity**
   - **Mitigation**: Comprehensive tutorials, in-app guidance
   
2. **Competition Launch**
   - **Mitigation**: Focus on unique value props, faster iteration

## Resource Allocation

### Development Time Distribution
- **Backend/API**: 40% (Dev 1 lead)
- **Frontend/UI**: 35% (Dev 2 lead)  
- **Integrations**: 20% (Dev 3 lead)
- **Testing/QA**: 5% (All team)

### Key Dependencies
- **External**: n8n availability, OpenAI API stability, Supabase uptime
- **Internal**: Design decisions, business requirements clarity
- **Team**: No single points of failure, knowledge sharing critical

## Post-Launch Roadmap (Months 9-12)

### Phase 5: Growth & Optimization
- Advanced analytics y machine learning
- Mobile app development
- Enterprise features (SSO, advanced security)
- International expansion (multi-language)

### Phase 6: Platform Expansion  
- Marketplace para third-party integrations
- White-label solution
- Advanced AI features (voice, video)
- Enterprise partnerships

---

## Conclusión

Este roadmap proporciona una ruta clara y ejecutable para llevar NeurAnt desde concepto hasta lanzamiento en 8 meses. Cada fase construye sobre la anterior, minimizando riesgos y maximizando el aprendizaje temprano.

**Próximos pasos inmediatos:**
1. ✅ Arquitectura completada
2. 🔄 Setup inicial del proyecto (Comenzar Sprint 1.1)
3. ⏳ Onboarding del equipo en tecnologías clave
4. ⏳ Establecimiento de procesos de desarrollo

El éxito de este roadmap depende de:
- **Ejecución disciplinada** de cada sprint
- **Comunicación constante** con stakeholders
- **Flexibilidad** para adaptar según aprendizajes
- **Foco en calidad** desde el primer sprint