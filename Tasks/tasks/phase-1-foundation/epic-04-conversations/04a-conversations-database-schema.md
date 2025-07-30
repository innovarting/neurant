# TASK-P1E4-04a: Conversations Database Schema

## Identificación
- **ID:** TASK-P1E4-04a
- **Título:** Conversations & Messages Database Schema
- **Type:** Database
- **Phase:** 1 - Foundation
- **Epic:** Epic 4 - Conversations
- **Sprint:** Sprint 1.2
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 6 horas
- **Prioridad:** Media

## Definición Técnica
Implementar schema completo para gestión de conversaciones y mensajes, incluyendo tablas CONVERSATIONS, MESSAGES, MESSAGE_REACTIONS con índices optimizados, RLS policies para multi-tenancy, triggers para estadísticas automáticas y funciones helper para queries frecuentes.

## Referencias de Documentación NeurAnt
- **Database Schema:** `docs/architecture/13-diagrama-entidad-relacion.md:227-280` (entidades CONVERSATIONS y MESSAGES)
- **Database Design:** `docs/architecture/03-database-design.md:100-150` (patrones de messaging)
- **RBAC Model:** `docs/architecture/10-modelo-datos-rbac-extendido.md:200-250` (permisos de conversaciones)
- **Implementation Roadmap:** `docs/architecture/05-implementation-roadmap.md:70-90` (Sprint 1.2 context)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E1-01b ✅ (Supabase configuration)
  - [x] TASK-P1E3-03a ✅ (chatbots table exists)
  - [x] TASK-P1E2-02a ✅ (users table exists)
- **Bloquea:**
  - [ ] TASK-P1E4-04b (conversations API endpoints)
  - [ ] TASK-P1E4-04c (conversation history UI)
  - [ ] TASK-P1E4-04d (basic analytics dashboard)

## Entidades Afectadas
### Tablas Principales
- **conversations**: Tabla principal de conversaciones con metadatos de sesión
- **messages**: Mensajes individuales con contenido y metadatos de procesamiento
- **message_reactions**: Reacciones/feedback a mensajes (thumbs up/down)

### Relaciones
- **FK:** companies → conversations (1:N)
- **FK:** chatbots → conversations (1:N)
- **FK:** users → conversations (1:N) - assigned_operator_id
- **FK:** conversations → messages (1:N)
- **FK:** users → messages (1:N) - sender_id
- **FK:** messages → message_reactions (1:N)

## Criterios de Aceptación Específicos
### Schema Implementation
- [ ] Tablas creadas con todos los campos según ERD
- [ ] Primary keys UUID y foreign keys configuradas
- [ ] Índices estratégicos para performance (company_id, chatbot_id, timestamps)
- [ ] ENUMs creados (conversation_status, message_type, sender_type, reaction_type)

### RLS Security
- [ ] RLS habilitado en todas las tablas tenant
- [ ] Policies implementadas para isolation por company_id
- [ ] Functions helper para verificar ownership
- [ ] Isolation multi-tenant verificado con tests

### Data Integrity
- [ ] Constraints de negocio (message_count >= 0, timestamps válidos)
- [ ] Triggers para mantener estadísticas (message counts, timing)
- [ ] Cascade deletes configurados apropiadamente
- [ ] Validaciones de status transitions

### Performance Optimization
- [ ] Índices compuestos para queries frecuentes
- [ ] Partitioning por fecha considerado para messages
- [ ] GIN indexes para búsqueda full-text en content
- [ ] Query plans validados para operaciones críticas

## Archivos de Database
```
supabase/migrations/20241201000000_conversations_schema.sql
supabase/migrations/20241201000001_conversations_rls.sql
supabase/migrations/20241201000002_conversations_functions.sql
lib/database/types.ts (updated with new types)
lib/database/conversation-queries.ts (helper queries)
```

## Migration Script

### ENUMs Creation
```sql
-- Migration Up: Conversations Schema
BEGIN;

-- Create ENUMs for conversations
CREATE TYPE conversation_status AS ENUM (
  'active',
  'ended',
  'transferred',
  'abandoned',
  'waiting_human'
);

CREATE TYPE message_type AS ENUM (
  'text',
  'image',
  'file',
  'audio',
  'video',
  'location',
  'system'
);

CREATE TYPE sender_type AS ENUM (
  'bot',
  'human',
  'end_user',
  'system'
);

CREATE TYPE message_status AS ENUM (
  'sending',
  'sent',
  'delivered',
  'read',
  'failed'
);

CREATE TYPE reaction_type AS ENUM (
  'thumbs_up',
  'thumbs_down',
  'helpful',
  'not_helpful',
  'love',
  'confused'
);
```

### Main Tables
```sql
-- CONVERSATIONS table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  chatbot_id UUID NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
  
  -- End user information
  end_user_id VARCHAR(255) NOT NULL, -- External user ID from channel
  end_user_name VARCHAR(255),
  end_user_avatar TEXT,
  
  -- Channel and status
  channel VARCHAR(50) NOT NULL, -- 'web', 'whatsapp', 'telegram', etc.
  status conversation_status NOT NULL DEFAULT 'active',
  
  -- HITL (Human-in-the-Loop) fields
  is_hitl_active BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  hitl_activated_at TIMESTAMP WITH TIME ZONE,
  hitl_reason TEXT,
  
  -- Statistics
  message_count INTEGER NOT NULL DEFAULT 0,
  bot_message_count INTEGER NOT NULL DEFAULT 0,
  human_message_count INTEGER NOT NULL DEFAULT 0,
  avg_response_time_ms INTEGER DEFAULT 0,
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  session_duration_minutes INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN ended_at IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (ended_at - started_at)) / 60
      ELSE NULL 
    END
  ) STORED,
  
  -- Satisfaction and context
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  satisfaction_comment TEXT,
  context_data JSONB DEFAULT '{}',
  conversation_summary TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- MESSAGES table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  
  -- Message content
  content TEXT NOT NULL,
  message_type message_type NOT NULL DEFAULT 'text',
  media_url TEXT,
  media_type VARCHAR(50), -- 'image/jpeg', 'audio/mp3', etc.
  
  -- Sender information
  sender_type sender_type NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for bot/end_user messages
  
  -- Integration fields
  n8n_message_id VARCHAR(255), -- For n8n workflow tracking
  n8n_workflow_id VARCHAR(255), -- Which n8n workflow processed this
  external_message_id VARCHAR(255), -- Channel-specific message ID
  
  -- Processing metadata
  processing_time_ms INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  model_used VARCHAR(100), -- 'gpt-4-turbo', 'gpt-3.5-turbo', etc.
  status message_status NOT NULL DEFAULT 'sent',
  
  -- Delivery tracking
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Knowledge base integration
  used_knowledge_base BOOLEAN NOT NULL DEFAULT FALSE,
  knowledge_sources JSONB DEFAULT '[]',
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- MESSAGE_REACTIONS table
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  
  -- Reaction details
  reaction_type reaction_type NOT NULL,
  reactor_type sender_type NOT NULL, -- Who gave the reaction
  reactor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for end_user reactions
  
  -- Optional feedback
  feedback_text TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate reactions from same reactor
  UNIQUE(message_id, reactor_type, reactor_id)
);
```

### Indexes for Performance
```sql
-- Primary performance indexes
CREATE INDEX idx_conversations_company_id ON conversations(company_id);
CREATE INDEX idx_conversations_chatbot_id ON conversations(chatbot_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_started_at ON conversations(started_at DESC);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_conversations_company_chatbot_status ON conversations(company_id, chatbot_id, status);
CREATE INDEX idx_conversations_company_active ON conversations(company_id, status) WHERE status = 'active';
CREATE INDEX idx_conversations_hitl_active ON conversations(company_id, is_hitl_active, assigned_operator_id) WHERE is_hitl_active = TRUE;

-- Messages indexes
CREATE INDEX idx_messages_company_id ON messages(company_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_type, sender_id);

-- Composite indexes for messages
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_company_type ON messages(company_id, message_type);

-- Full-text search index for message content
CREATE INDEX idx_messages_content_search ON messages USING GIN (to_tsvector('spanish', content));

-- Reactions indexes
CREATE INDEX idx_reactions_message_id ON message_reactions(message_id);
CREATE INDEX idx_reactions_company_id ON message_reactions(company_id);
```

### RLS Policies
```sql
-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "conversations_tenant_isolation" ON conversations
    FOR ALL USING (company_id = auth.jwt() ->> 'company_id'::text);

CREATE POLICY "conversations_operator_access" ON conversations
    FOR ALL USING (
        company_id = auth.jwt() ->> 'company_id'::text 
        AND (
            assigned_operator_id = auth.uid()
            OR auth.jwt() ->> 'role' IN ('owner', 'admin', 'supervisor')
        )
    );

-- Messages policies
CREATE POLICY "messages_tenant_isolation" ON messages
    FOR ALL USING (company_id = auth.jwt() ->> 'company_id'::text);

CREATE POLICY "messages_conversation_access" ON messages
    FOR ALL USING (
        company_id = auth.jwt() ->> 'company_id'::text
        AND EXISTS (
            SELECT 1 FROM conversations c 
            WHERE c.id = messages.conversation_id 
            AND c.company_id = auth.jwt() ->> 'company_id'::text
        )
    );

-- Message reactions policies
CREATE POLICY "reactions_tenant_isolation" ON message_reactions
    FOR ALL USING (company_id = auth.jwt() ->> 'company_id'::text);
```

### Triggers and Functions
```sql
-- Function to update conversation statistics
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update message counts and timing
    IF TG_OP = 'INSERT' THEN
        UPDATE conversations SET
            message_count = message_count + 1,
            bot_message_count = CASE 
                WHEN NEW.sender_type = 'bot' THEN bot_message_count + 1 
                ELSE bot_message_count 
            END,
            human_message_count = CASE 
                WHEN NEW.sender_type = 'human' THEN human_message_count + 1 
                ELSE human_message_count 
            END,
            last_message_at = NEW.created_at,
            updated_at = NOW()
        WHERE id = NEW.conversation_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE conversations SET
            message_count = GREATEST(message_count - 1, 0),
            bot_message_count = CASE 
                WHEN OLD.sender_type = 'bot' THEN GREATEST(bot_message_count - 1, 0)
                ELSE bot_message_count 
            END,
            human_message_count = CASE 
                WHEN OLD.sender_type = 'human' THEN GREATEST(human_message_count - 1, 0)
                ELSE human_message_count 
            END,
            updated_at = NOW()
        WHERE id = OLD.conversation_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for message statistics
CREATE TRIGGER trigger_update_conversation_stats
    AFTER INSERT OR DELETE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_stats();

-- Function to auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_conversations_updated_at 
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_messages_updated_at 
    BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Helper Functions
```sql
-- Function to get conversation with latest message
CREATE OR REPLACE FUNCTION get_conversation_with_latest_message(conv_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'conversation', to_jsonb(c.*),
        'latest_message', to_jsonb(m.*),
        'message_count', c.message_count
    ) INTO result
    FROM conversations c
    LEFT JOIN LATERAL (
        SELECT * FROM messages 
        WHERE conversation_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
    ) m ON true
    WHERE c.id = conv_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search messages by content
CREATE OR REPLACE FUNCTION search_messages(
    company_uuid UUID,
    search_query TEXT,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    message_id UUID,
    conversation_id UUID,
    content TEXT,
    sender_type sender_type,
    created_at TIMESTAMP WITH TIME ZONE,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id as message_id,
        m.conversation_id,
        m.content,
        m.sender_type,
        m.created_at,
        ts_rank(to_tsvector('spanish', m.content), plainto_tsquery('spanish', search_query)) as rank
    FROM messages m
    WHERE m.company_id = company_uuid
    AND to_tsvector('spanish', m.content) @@ plainto_tsquery('spanish', search_query)
    ORDER BY rank DESC, m.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

COMMIT;
```

## Validation Queries
```sql
-- Verificar estructura de tablas
\d conversations
\d messages  
\d message_reactions

-- Verificar RLS habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('conversations', 'messages', 'message_reactions');

-- Verificar policies
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('conversations', 'messages', 'message_reactions');

-- Verificar índices
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('conversations', 'messages', 'message_reactions')
ORDER BY tablename, indexname;

-- Verificar ENUMs
SELECT typname, enumlabel 
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE typname IN ('conversation_status', 'message_type', 'sender_type', 'message_status', 'reaction_type')
ORDER BY typname, enumsortorder;

-- Test básico de inserción
INSERT INTO conversations (company_id, chatbot_id, end_user_id, channel) 
VALUES (
    '123e4567-e89b-12d3-a456-426614174000'::UUID,
    '123e4567-e89b-12d3-a456-426614174001'::UUID,
    'test_user_123',
    'web'
);

-- Verificar trigger de estadísticas
INSERT INTO messages (company_id, conversation_id, content, sender_type)
VALUES (
    '123e4567-e89b-12d3-a456-426614174000'::UUID,
    (SELECT id FROM conversations ORDER BY created_at DESC LIMIT 1),
    'Test message content',
    'bot'
);

-- Verificar que message_count se actualizó
SELECT id, message_count, bot_message_count FROM conversations 
ORDER BY created_at DESC LIMIT 1;
```

## TypeScript Types
```typescript
// lib/database/types.ts - Add to existing types

export type ConversationStatus = 'active' | 'ended' | 'transferred' | 'abandoned' | 'waiting_human'
export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'system'
export type SenderType = 'bot' | 'human' | 'end_user' | 'system'
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
export type ReactionType = 'thumbs_up' | 'thumbs_down' | 'helpful' | 'not_helpful' | 'love' | 'confused'

export interface Conversation {
  id: string
  company_id: string
  chatbot_id: string
  end_user_id: string
  end_user_name?: string
  end_user_avatar?: string
  channel: string
  status: ConversationStatus
  is_hitl_active: boolean
  assigned_operator_id?: string
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

export interface Message {
  id: string
  company_id: string
  conversation_id: string
  content: string
  message_type: MessageType
  media_url?: string
  media_type?: string
  sender_type: SenderType
  sender_id?: string
  n8n_message_id?: string
  n8n_workflow_id?: string
  external_message_id?: string
  processing_time_ms: number
  tokens_used: number
  model_used?: string
  status: MessageStatus
  delivered_at?: string
  read_at?: string
  used_knowledge_base: boolean
  knowledge_sources: Array<any>
  confidence_score?: number
  created_at: string
  updated_at: string
}

export interface MessageReaction {
  id: string
  company_id: string
  message_id: string
  reaction_type: ReactionType
  reactor_type: SenderType
  reactor_id?: string
  feedback_text?: string
  created_at: string
}

// Insert/Update types
export type ConversationInsert = Omit<Conversation, 'id' | 'created_at' | 'updated_at' | 'session_duration_minutes'>
export type ConversationUpdate = Partial<ConversationInsert>

export type MessageInsert = Omit<Message, 'id' | 'created_at' | 'updated_at'>
export type MessageUpdate = Partial<MessageInsert>

export type MessageReactionInsert = Omit<MessageReaction, 'id' | 'created_at'>
```

## RLS Testing
```sql
-- Test isolation multi-tenant
SET role authenticated;
SET request.jwt.claims TO '{"sub": "user-uuid-1", "company_id": "company-uuid-1", "role": "admin"}';

-- Insert test data for company 1
INSERT INTO conversations (company_id, chatbot_id, end_user_id, channel) 
VALUES ('company-uuid-1'::UUID, 'chatbot-uuid-1'::UUID, 'user-1', 'web');

-- Verificar que solo ve datos de su empresa
SELECT * FROM conversations; -- Debe retornar solo conversations de company-uuid-1

-- Test con otro company_id
SET request.jwt.claims TO '{"sub": "user-uuid-2", "company_id": "company-uuid-2", "role": "admin"}';

-- No debe ver conversations de company 1
SELECT * FROM conversations; -- Debe retornar vacío

-- Insert data for company 2
INSERT INTO conversations (company_id, chatbot_id, end_user_id, channel) 
VALUES ('company-uuid-2'::UUID, 'chatbot-uuid-2'::UUID, 'user-2', 'whatsapp');

SELECT * FROM conversations; -- Debe retornar solo conversations de company-uuid-2

-- Test operator access
SET request.jwt.claims TO '{"sub": "operator-uuid-1", "company_id": "company-uuid-1", "role": "operador"}';

-- Should only see conversations assigned to them
SELECT * FROM conversations WHERE assigned_operator_id = 'operator-uuid-1'::UUID;

RESET role;
```

## Performance Validation
```sql
-- Verificar query plans para índices principales
EXPLAIN ANALYZE 
SELECT * FROM conversations 
WHERE company_id = 'company-uuid-1'::UUID 
AND status = 'active' 
ORDER BY last_message_at DESC 
LIMIT 20;

-- Verificar performance de búsqueda full-text
EXPLAIN ANALYZE 
SELECT * FROM messages 
WHERE company_id = 'company-uuid-1'::UUID 
AND to_tsvector('spanish', content) @@ plainto_tsquery('spanish', 'help problem')
ORDER BY created_at DESC;

-- Verificar performance de RLS policies
EXPLAIN ANALYZE 
SELECT c.*, m.content as latest_message
FROM conversations c
LEFT JOIN LATERAL (
    SELECT content FROM messages 
    WHERE conversation_id = c.id 
    ORDER BY created_at DESC 
    LIMIT 1
) m ON true
WHERE c.company_id = 'company-uuid-1'::UUID;

-- Test de performance con volumen
-- (Solo en desarrollo - genera data de prueba)
DO $$
DECLARE
    i INTEGER;
    conv_id UUID;
BEGIN
    FOR i IN 1..100 LOOP
        INSERT INTO conversations (company_id, chatbot_id, end_user_id, channel) 
        VALUES ('company-uuid-1'::UUID, 'chatbot-uuid-1'::UUID, 'user-' || i, 'web')
        RETURNING id INTO conv_id;
        
        -- Insert 10 messages per conversation
        INSERT INTO messages (company_id, conversation_id, content, sender_type)
        SELECT 'company-uuid-1'::UUID, conv_id, 'Message ' || j, 
               CASE WHEN j % 2 = 0 THEN 'bot' ELSE 'end_user' END
        FROM generate_series(1, 10) j;
    END LOOP;
END $$;

-- Check performance with generated data
EXPLAIN ANALYZE 
SELECT COUNT(*) FROM conversations WHERE company_id = 'company-uuid-1'::UUID;

EXPLAIN ANALYZE 
SELECT COUNT(*) FROM messages WHERE company_id = 'company-uuid-1'::UUID;
```

## Rollback Plan
```sql
-- Migration Down: Remove Conversations Schema
BEGIN;

-- Remove triggers
DROP TRIGGER IF EXISTS trigger_update_conversation_stats ON messages;
DROP TRIGGER IF EXISTS trigger_conversations_updated_at ON conversations;
DROP TRIGGER IF EXISTS trigger_messages_updated_at ON messages;

-- Remove functions
DROP FUNCTION IF EXISTS update_conversation_stats();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS get_conversation_with_latest_message(UUID);
DROP FUNCTION IF EXISTS search_messages(UUID, TEXT, INTEGER);

-- Remove policies (cascade will handle this)
-- Remove tables (cascade will handle dependent data)
DROP TABLE IF EXISTS message_reactions CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Remove ENUMs
DROP TYPE IF EXISTS reaction_type;
DROP TYPE IF EXISTS message_status;
DROP TYPE IF EXISTS sender_type;
DROP TYPE IF EXISTS message_type;
DROP TYPE IF EXISTS conversation_status;

COMMIT;
```

## Helper Queries Implementation
```typescript
// lib/database/conversation-queries.ts
import { supabase } from '@/lib/supabase/client'
import type { 
  Conversation, 
  Message, 
  MessageReaction,
  ConversationInsert,
  MessageInsert 
} from './types'

export class ConversationQueries {
  // Get conversations with pagination and filters
  static async getConversations(options: {
    companyId: string
    chatbotId?: string
    status?: string
    page?: number
    limit?: number
    search?: string
  }) {
    const { companyId, chatbotId, status, page = 1, limit = 20, search } = options
    const offset = (page - 1) * limit

    let query = supabase
      .from('conversations')
      .select(`
        *,
        chatbots(name, avatar_url),
        users(first_name, last_name)
      `, { count: 'exact' })
      .eq('company_id', companyId)
      .order('last_message_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (chatbotId) query = query.eq('chatbot_id', chatbotId)
    if (status) query = query.eq('status', status)
    if (search) {
      query = query.or(`end_user_name.ilike.%${search}%,end_user_id.ilike.%${search}%`)
    }

    return query
  }

  // Get conversation with messages
  static async getConversationWithMessages(
    conversationId: string,
    options: { limit?: number; before?: string } = {}
  ) {
    const { limit = 50, before } = options

    // Get conversation
    const conversationQuery = supabase
      .from('conversations')
      .select(`
        *,
        chatbots(name, avatar_url),
        users(first_name, last_name)
      `)
      .eq('id', conversationId)
      .single()

    // Get messages
    let messagesQuery = supabase
      .from('messages')
      .select(`
        *,
        users(first_name, last_name, avatar_url),
        message_reactions(*)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (before) {
      messagesQuery = messagesQuery.lt('created_at', before)
    }

    const [conversationResult, messagesResult] = await Promise.all([
      conversationQuery,
      messagesQuery
    ])

    return {
      conversation: conversationResult.data,
      messages: messagesResult.data?.reverse() || [], // Reverse to show chronologically
      error: conversationResult.error || messagesResult.error
    }
  }

  // Create conversation
  static async createConversation(data: ConversationInsert) {
    return supabase
      .from('conversations')
      .insert(data)
      .select()
      .single()
  }

  // Add message to conversation
  static async addMessage(data: MessageInsert) {
    const result = await supabase
      .from('messages')
      .insert(data)
      .select(`
        *,
        users(first_name, last_name, avatar_url)
      `)
      .single()

    // The trigger will automatically update conversation stats
    return result
  }

  // Search messages across conversations
  static async searchMessages(options: {
    companyId: string
    query: string
    chatbotId?: string
    limit?: number
  }) {
    const { companyId, query, chatbotId, limit = 50 } = options

    const { data, error } = await supabase.rpc('search_messages', {
      company_uuid: companyId,
      search_query: query,
      limit_count: limit
    })

    if (error) return { data: null, error }

    // Enrich with conversation context if needed
    if (chatbotId && data) {
      const filteredData = data.filter((msg: any) => 
        // We'd need to join with conversations to filter by chatbot_id
        // For now, return all results and filter on client if needed
        true
      )
      return { data: filteredData, error: null }
    }

    return { data, error }
  }

  // Get conversation analytics
  static async getConversationAnalytics(options: {
    companyId: string
    chatbotId?: string
    startDate?: string
    endDate?: string
  }) {
    const { companyId, chatbotId, startDate, endDate } = options
    
    let query = supabase
      .from('conversations')
      .select('status, message_count, session_duration_minutes, satisfaction_rating, created_at')
      .eq('company_id', companyId)

    if (chatbotId) query = query.eq('chatbot_id', chatbotId)
    if (startDate) query = query.gte('created_at', startDate)
    if (endDate) query = query.lte('created_at', endDate)

    return query
  }

  // Update conversation status
  static async updateConversationStatus(
    conversationId: string, 
    status: string,
    metadata?: Record<string, any>
  ) {
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'ended') {
      updateData.ended_at = new Date().toISOString()
    }

    if (metadata) {
      updateData.context_data = metadata
    }

    return supabase
      .from('conversations')
      .update(updateData)
      .eq('id', conversationId)
      .select()
      .single()
  }
}
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- Database changes: conversations, messages, message_reactions tables created
- Migration applied: 20241201000000_conversations_schema.sql
- RLS policies: tenant isolation + operator-specific access implemented
- ENUMs created: conversation_status, message_type, sender_type, message_status, reaction_type
- Triggers: auto-update statistics and timestamps working
- Performance: strategic indexes for common queries implemented
- Helper functions: search_messages, get_conversation_with_latest_message available
- Next database task: None (Epic 4 database complete)
- Dependent API tasks now unblocked: TASK-P1E4-04b, TASK-P1E4-04c, TASK-P1E4-04d
```

## Troubleshooting Database
### Common Issues
- **RLS Policy Errors:** Verificar que company_id esté en JWT claims y coincida con auth.jwt()
- **Trigger Performance:** Monitor performance de triggers de statistics con gran volumen
- **Full-text Search:** Configurar diccionario español apropiado para to_tsvector
- **Message Ordering:** Cuidar timezone consistency entre created_at timestamps

### Debugging Commands
```bash
# Supabase CLI
supabase db reset --local
supabase db diff --local --schema public
supabase gen types typescript --local > lib/database/types.ts

# PostgreSQL direct queries
psql -h localhost -p 5432 -U postgres -d postgres
\dt -- list tables
\df -- list functions  
\dy -- list triggers
SELECT * FROM pg_stat_user_tables WHERE relname IN ('conversations', 'messages');

# Test full-text search configuration
SELECT to_tsvector('spanish', 'Hola necesito ayuda con mi problema');
SELECT plainto_tsquery('spanish', 'ayuda problema');

# Monitor trigger performance
SELECT * FROM pg_stat_user_functions WHERE funcname = 'update_conversation_stats';
```

---
*Tarea específica para implementar schema completo de conversaciones y mensajes con RLS policies, triggers de estadísticas, búsqueda full-text y optimizaciones de performance.*