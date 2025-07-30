# NeurAnt - Diseño de Base de Datos Multi-Tenant

## Estrategia Multi-Tenant

### Patrón Elegido: **Shared Database, Isolated by Row Level Security (RLS)**

- **Base de datos única** con `tenant_id` en todas las tablas principales
- **Row Level Security (RLS)** de PostgreSQL para aislamiento automático
- **Políticas de seguridad** configuradas a nivel de base de datos
- **Escalabilidad** optimizada para 100+ tenants

## Schema Principal

### 1. Entidades Core del Negocio

```sql
-- ===========================================
-- CORE BUSINESS ENTITIES
-- ===========================================

-- Companies (Tenants)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- neurant-empresa
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    industry VARCHAR(100),
    website VARCHAR(255),
    logo_url TEXT,
    
    -- Subscription & Billing
    subscription_plan subscription_plan_enum NOT NULL DEFAULT 'free',
    subscription_status subscription_status_enum NOT NULL DEFAULT 'active',
    subscription_started_at TIMESTAMPTZ,
    subscription_ends_at TIMESTAMPTZ,
    
    -- Usage Tracking
    monthly_message_limit INTEGER NOT NULL DEFAULT 500,
    monthly_message_count INTEGER NOT NULL DEFAULT 0,
    monthly_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Limits per plan (actualizado según planes refinados)
    max_chatbots INTEGER NOT NULL DEFAULT 1,
    max_users INTEGER NOT NULL DEFAULT 2, -- Owner + 1 adicional en Free
    max_integrations INTEGER NOT NULL DEFAULT 0,
    max_document_characters INTEGER NOT NULL DEFAULT 0,
    max_storage_mb INTEGER NOT NULL DEFAULT 0,
    max_hitl_concurrent INTEGER NOT NULL DEFAULT 0,
    
    -- Current usage counters
    current_user_count INTEGER NOT NULL DEFAULT 1, -- Count actual users
    current_chatbot_count INTEGER NOT NULL DEFAULT 0,
    current_integration_count INTEGER NOT NULL DEFAULT 0,
    
    -- Plan management
    plan_changed_at TIMESTAMPTZ,
    plan_change_scheduled_at TIMESTAMPTZ,
    next_plan subscription_plan_enum, -- Para cambios programados
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    CONSTRAINT companies_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Users (Multi-role per company)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Auth (Supabase Auth integration)
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Profile
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(50),
    
    -- Role & Permissions (Refined)
    role user_role_enum NOT NULL DEFAULT 'operador',
    is_owner BOOLEAN NOT NULL DEFAULT false,
    permissions JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Invitation System
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMPTZ,
    accepted_invitation_at TIMESTAMPTZ,
    invitation_token VARCHAR(255) UNIQUE,
    invitation_expires_at TIMESTAMPTZ,
    
    -- Activity
    last_login_at TIMESTAMPTZ,
    last_seen_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    -- Constraints
    UNIQUE(company_id, email),
    -- Solo un owner por empresa
    EXCLUDE (company_id WITH =) WHERE (is_owner = true),
    -- Owner siempre debe tener rol 'owner'
    CHECK ((is_owner = true AND role = 'owner') OR (is_owner = false))
);

-- User Invitations (Para gestión de invitaciones por email)
CREATE TABLE user_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Invitation Details
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role user_role_enum NOT NULL DEFAULT 'operador',
    
    -- Invitation Metadata  
    invited_by UUID NOT NULL REFERENCES users(id),
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    
    -- Status Tracking
    status invitation_status_enum NOT NULL DEFAULT 'pending',
    accepted_at TIMESTAMPTZ,
    accepted_by_user_id UUID REFERENCES users(id),
    
    -- Email Tracking
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reminder_sent_at TIMESTAMPTZ,
    reminder_count INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(company_id, email),
    CHECK (expires_at > created_at),
    CHECK (reminder_count >= 0)
);

-- Chatbots (AI Agents)
CREATE TABLE chatbots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    avatar_url TEXT,
    
    -- AI Configuration
    system_prompt TEXT NOT NULL,
    template_id UUID REFERENCES chatbot_templates(id),
    personality_traits JSONB DEFAULT '{}', -- {"tone": "friendly", "style": "professional"}
    
    -- Behavior Settings
    response_delay_ms INTEGER DEFAULT 1000,
    max_context_messages INTEGER DEFAULT 10,
    fallback_message TEXT DEFAULT 'No puedo ayudarte con eso. ¿Te gustaría hablar con un operador?',
    
    -- Channel Configuration
    channels JSONB NOT NULL DEFAULT '[]', -- ["whatsapp", "telegram", "slack"]
    channel_configs JSONB DEFAULT '{}', -- Channel-specific settings
    
    -- Operational Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_training BOOLEAN NOT NULL DEFAULT false,
    training_progress INTEGER DEFAULT 0,
    
    -- Working Hours (opcional)
    working_hours JSONB DEFAULT '{}', -- {"monday": {"start": "09:00", "end": "18:00"}}
    timezone VARCHAR(50) DEFAULT 'America/Bogota',
    
    -- HITL Configuration
    hitl_enabled BOOLEAN NOT NULL DEFAULT true,
    hitl_triggers JSONB DEFAULT '[]', -- ["no_answer", "user_request", "keywords"]
    hitl_trigger_keywords TEXT[] DEFAULT '{}',
    auto_escalate_after_minutes INTEGER DEFAULT 5,
    
    -- Performance Metrics (cached)
    total_conversations INTEGER NOT NULL DEFAULT 0,
    total_messages INTEGER NOT NULL DEFAULT 0,
    avg_response_time_ms INTEGER DEFAULT 0,
    satisfaction_score DECIMAL(3,2) DEFAULT 0.0,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    
    UNIQUE(company_id, name)
);

-- Chatbot Templates (Industry-specific prompts)
CREATE TABLE chatbot_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template Info
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    industry VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL, -- "customer_service", "sales", "support"
    
    -- Template Content
    system_prompt_template TEXT NOT NULL,
    default_personality JSONB DEFAULT '{}',
    recommended_settings JSONB DEFAULT '{}',
    
    -- Usage & Popularity
    usage_count INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Examples for UI
    example_conversations JSONB DEFAULT '[]'
);

-- Chatbot Operators (Asignación de operadores a chatbots específicos)
CREATE TABLE chatbot_operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    chatbot_id UUID NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Assignment metadata
    assigned_by UUID NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Constraints
    UNIQUE(chatbot_id, operator_id),
    -- Solo operadores pueden ser asignados
    CHECK ((SELECT role FROM users WHERE id = operator_id) = 'operador')
);
```

### 2. Conversaciones y Mensajería

```sql
-- ===========================================
-- CONVERSATIONS & MESSAGING
-- ===========================================

-- Conversations (Chat sessions)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    chatbot_id UUID NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    
    -- End User Info
    end_user_id VARCHAR(255) NOT NULL, -- WhatsApp/Telegram/Slack user ID
    end_user_name VARCHAR(255),
    end_user_avatar TEXT,
    channel conversation_channel_enum NOT NULL, -- whatsapp, telegram, slack
    
    -- Conversation State
    status conversation_status_enum NOT NULL DEFAULT 'active',
    is_hitl_active BOOLEAN NOT NULL DEFAULT false,
    assigned_operator_id UUID REFERENCES users(id),
    hitl_activated_at TIMESTAMPTZ,
    hitl_reason TEXT,
    
    -- Conversation Metrics
    message_count INTEGER NOT NULL DEFAULT 0,
    bot_message_count INTEGER NOT NULL DEFAULT 0,
    human_message_count INTEGER NOT NULL DEFAULT 0,
    avg_response_time_ms INTEGER DEFAULT 0,
    
    -- Session Info
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    session_duration_minutes INTEGER,
    
    -- Satisfaction & Quality
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
    satisfaction_comment TEXT,
    
    -- Context & State
    context_data JSONB DEFAULT '{}', -- User context, preferences, history
    conversation_summary TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(company_id, chatbot_id, end_user_id, channel)
);

-- Messages (Individual messages in conversations)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    
    -- Message Content
    content TEXT NOT NULL,
    message_type message_type_enum NOT NULL DEFAULT 'text',
    media_url TEXT,
    media_type VARCHAR(50),
    
    -- Message Source
    sender_type sender_type_enum NOT NULL, -- bot, human, end_user
    sender_id UUID, -- user.id for human, null for bot/end_user
    
    -- n8n Integration
    n8n_message_id VARCHAR(255),
    n8n_workflow_id VARCHAR(255),
    external_message_id VARCHAR(255), -- WhatsApp/Telegram message ID
    
    -- Processing Info
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    model_used VARCHAR(100),
    
    -- Message Status
    status message_status_enum NOT NULL DEFAULT 'sent',
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    
    -- AI Context (for RAG)
    used_knowledge_base BOOLEAN DEFAULT false,
    knowledge_sources JSONB DEFAULT '[]', -- References to documents used
    confidence_score DECIMAL(3,2),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Message Reactions & Feedback
CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    
    -- Reaction
    reaction_type reaction_type_enum NOT NULL, -- thumbs_up, thumbs_down, helpful, not_helpful
    comment TEXT,
    
    -- Source
    reacted_by_user_id UUID REFERENCES users(id), -- Internal user
    reacted_by_end_user BOOLEAN DEFAULT false, -- End user reaction
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(message_id, reaction_type, reacted_by_user_id)
);
```

### 3. Knowledge Base y RAG

```sql
-- ===========================================
-- KNOWLEDGE BASE & RAG
-- ===========================================

-- Documents (Knowledge base files)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE, -- NULL = shared across company
    
    -- File Info
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- pdf, docx, txt
    file_size_bytes BIGINT NOT NULL,
    file_url TEXT NOT NULL, -- Supabase Storage URL
    
    -- Content Processing
    extracted_text TEXT,
    character_count INTEGER,
    chunk_count INTEGER DEFAULT 0,
    processing_status processing_status_enum NOT NULL DEFAULT 'pending',
    processing_error TEXT,
    
    -- Document Metadata
    title VARCHAR(500),
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    category VARCHAR(100),
    language VARCHAR(10) DEFAULT 'es',
    
    -- Usage Stats
    query_count INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    uploaded_by UUID NOT NULL REFERENCES users(id)
);

-- Document Chunks (Vector embeddings)
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    
    -- Chunk Content
    content TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    character_count INTEGER NOT NULL,
    
    -- Vector Embedding
    embedding vector(1536), -- OpenAI ada-002 dimensions
    
    -- Chunk Metadata
    page_number INTEGER,
    section_title VARCHAR(500),
    context_before TEXT,
    context_after TEXT,
    
    -- Usage Stats
    match_count INTEGER NOT NULL DEFAULT 0,
    last_matched_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(document_id, chunk_index)
);

-- Create vector similarity index
CREATE INDEX document_chunks_embedding_idx ON document_chunks 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Knowledge Base Queries (for analytics)
CREATE TABLE knowledge_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id),
    message_id UUID REFERENCES messages(id),
    
    -- Query Info
    query_text TEXT NOT NULL,
    query_embedding vector(1536),
    
    -- Results
    results_count INTEGER NOT NULL DEFAULT 0,
    top_similarity_score DECIMAL(5,4),
    
    -- Performance
    processing_time_ms INTEGER,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4. Integraciones Externas

```sql
-- ===========================================
-- EXTERNAL INTEGRATIONS
-- ===========================================

-- External Integrations
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Integration Info
    name VARCHAR(255) NOT NULL,
    integration_type integration_type_enum NOT NULL,
    description TEXT,
    
    -- Configuration
    config JSONB NOT NULL DEFAULT '{}', -- API keys, endpoints, etc (encrypted)
    settings JSONB DEFAULT '{}', -- Non-sensitive settings
    
    -- Auth Info
    auth_type auth_type_enum NOT NULL DEFAULT 'api_key',
    oauth_token_encrypted TEXT, -- Encrypted OAuth tokens
    api_key_encrypted TEXT, -- Encrypted API keys
    expires_at TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    last_error TEXT,
    sync_status sync_status_enum NOT NULL DEFAULT 'pending',
    
    -- Usage Stats
    total_requests INTEGER NOT NULL DEFAULT 0,
    successful_requests INTEGER NOT NULL DEFAULT 0,
    failed_requests INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    
    UNIQUE(company_id, name)
);

-- Integration Logs (for debugging and monitoring)
CREATE TABLE integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    
    -- Request Info
    request_type VARCHAR(50) NOT NULL, -- GET, POST, PUT, DELETE
    endpoint VARCHAR(500) NOT NULL,
    request_data JSONB,
    
    -- Response Info
    response_status INTEGER,
    response_data JSONB,
    response_time_ms INTEGER,
    
    -- Context
    triggered_by_message_id UUID REFERENCES messages(id),
    triggered_by_user_id UUID REFERENCES users(id),
    
    -- Status
    status integration_log_status_enum NOT NULL DEFAULT 'success',
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 5. Analytics y Auditoría

```sql
-- ===========================================
-- ANALYTICS & AUDIT
-- ===========================================

-- Analytics Summary (Daily aggregations)
CREATE TABLE analytics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE,
    
    -- Date
    date DATE NOT NULL,
    
    -- Message Metrics
    total_messages INTEGER NOT NULL DEFAULT 0,
    bot_messages INTEGER NOT NULL DEFAULT 0,
    human_messages INTEGER NOT NULL DEFAULT 0,
    end_user_messages INTEGER NOT NULL DEFAULT 0,
    
    -- Conversation Metrics
    new_conversations INTEGER NOT NULL DEFAULT 0,
    active_conversations INTEGER NOT NULL DEFAULT 0,
    resolved_conversations INTEGER NOT NULL DEFAULT 0,
    avg_conversation_duration_minutes DECIMAL(10,2),
    
    -- HITL Metrics
    hitl_escalations INTEGER NOT NULL DEFAULT 0,
    hitl_resolution_time_minutes DECIMAL(10,2),
    hitl_satisfaction_avg DECIMAL(3,2),
    
    -- Performance Metrics
    avg_response_time_ms INTEGER,
    total_tokens_used INTEGER NOT NULL DEFAULT 0,
    
    -- Quality Metrics
    satisfaction_ratings INTEGER NOT NULL DEFAULT 0,
    satisfaction_avg DECIMAL(3,2),
    thumbs_up INTEGER NOT NULL DEFAULT 0,
    thumbs_down INTEGER NOT NULL DEFAULT 0,
    
    -- Knowledge Base
    knowledge_queries INTEGER NOT NULL DEFAULT 0,
    knowledge_hits INTEGER NOT NULL DEFAULT 0,
    knowledge_hit_rate DECIMAL(5,2),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(company_id, chatbot_id, date)
);

-- Audit Log (Security and compliance)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Actor
    user_id UUID REFERENCES users(id),
    user_email VARCHAR(255),
    user_role user_role_enum,
    
    -- Action
    action audit_action_enum NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    
    -- Details
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    
    -- Context
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System Health Metrics
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamp
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metric_type VARCHAR(100) NOT NULL,
    
    -- Values
    value DECIMAL(15,6) NOT NULL,
    unit VARCHAR(50),
    labels JSONB DEFAULT '{}',
    
    -- Context
    company_id UUID REFERENCES companies(id),
    chatbot_id UUID REFERENCES chatbots(id)
);
```

## Enumeraciones (ENUMs)

```sql
-- ===========================================
-- ENUMERATIONS
-- ===========================================

CREATE TYPE subscription_plan_enum AS ENUM (
    'free', 'starter', 'professional', 'business', 'enterprise'
);

CREATE TYPE subscription_status_enum AS ENUM (
    'active', 'inactive', 'cancelled', 'past_due', 'trialing'
);

CREATE TYPE user_role_enum AS ENUM (
    'owner', 'administrador', 'supervisor', 'operador'
);

CREATE TYPE invitation_status_enum AS ENUM (
    'pending', 'accepted', 'expired', 'cancelled'
);

CREATE TYPE conversation_channel_enum AS ENUM (
    'whatsapp', 'telegram', 'slack'
);

CREATE TYPE conversation_status_enum AS ENUM (
    'active', 'resolved', 'abandoned', 'archived'
);

CREATE TYPE message_type_enum AS ENUM (
    'text', 'image', 'audio', 'video', 'document', 'location', 'contact'
);

CREATE TYPE sender_type_enum AS ENUM (
    'bot', 'human', 'end_user'
);

CREATE TYPE message_status_enum AS ENUM (
    'pending', 'sent', 'delivered', 'read', 'failed'
);

CREATE TYPE reaction_type_enum AS ENUM (
    'thumbs_up', 'thumbs_down', 'helpful', 'not_helpful'
);

CREATE TYPE processing_status_enum AS ENUM (
    'pending', 'processing', 'completed', 'failed'
);

CREATE TYPE integration_type_enum AS ENUM (
    'google_docs', 'google_sheets', 'google_calendar', 'google_gmail',
    'airtable', 'mysql', 'postgresql', 'api_webhook'
);

CREATE TYPE auth_type_enum AS ENUM (
    'api_key', 'oauth2', 'basic_auth', 'bearer_token'
);

CREATE TYPE sync_status_enum AS ENUM (
    'pending', 'syncing', 'success', 'error'
);

CREATE TYPE integration_log_status_enum AS ENUM (
    'success', 'error', 'timeout', 'rate_limited'
);

CREATE TYPE audit_action_enum AS ENUM (
    'login', 'logout', 'create', 'read', 'update', 'delete',
    'escalate_hitl', 'resolve_hitl', 'upload_document', 'integration_sync'
);
```

## Índices para Performance

```sql
-- ===========================================
-- PERFORMANCE INDEXES
-- ===========================================

-- Company-based partitioning indexes
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_chatbots_company_id ON chatbots(company_id);
CREATE INDEX idx_conversations_company_id ON conversations(company_id);
CREATE INDEX idx_messages_company_id ON messages(company_id);
CREATE INDEX idx_documents_company_id ON documents(company_id);

-- Conversation performance
CREATE INDEX idx_conversations_status_active ON conversations(company_id, status) WHERE status = 'active';
CREATE INDEX idx_conversations_hitl_active ON conversations(company_id, is_hitl_active) WHERE is_hitl_active = true;
CREATE INDEX idx_conversations_chatbot_date ON conversations(chatbot_id, created_at DESC);

-- Message performance
CREATE INDEX idx_messages_conversation_date ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender_type ON messages(company_id, sender_type, created_at DESC);

-- Analytics performance
CREATE INDEX idx_analytics_company_date ON analytics_daily(company_id, date DESC);
CREATE INDEX idx_analytics_chatbot_date ON analytics_daily(chatbot_id, date DESC);

-- Full-text search
CREATE INDEX idx_documents_search ON documents USING gin(to_tsvector('spanish', title || ' ' || description));
CREATE INDEX idx_chatbots_search ON chatbots USING gin(to_tsvector('spanish', name || ' ' || description));

-- Audit and compliance
CREATE INDEX idx_audit_logs_company_date ON audit_logs(company_id, created_at DESC);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action, created_at DESC);
```

## Row Level Security (RLS) Policies

```sql
-- ===========================================
-- ROW LEVEL SECURITY POLICIES
-- ===========================================

-- Enable RLS on all tenant tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS policies
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT company_id 
        FROM users 
        WHERE auth_user_id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role_enum AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM users 
        WHERE auth_user_id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id 
        FROM users 
        WHERE auth_user_id = auth.uid()
        LIMIT 1
    );  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Companies: Users can only see their own company
CREATE POLICY companies_isolation ON companies
    FOR ALL USING (id = get_user_company_id());

-- Users: Role-based access to user management
CREATE POLICY users_role_based_access ON users
    FOR ALL USING (
        company_id = get_user_company_id() AND
        CASE get_user_role()
            WHEN 'owner' THEN true
            WHEN 'administrador' THEN true  
            WHEN 'supervisor' THEN role IN ('supervisor', 'operador')
            WHEN 'operador' THEN id = get_current_user_id()
        END
    );

-- User Invitations: Only Owner and Admins can manage invitations
CREATE POLICY invitations_management ON user_invitations
    FOR ALL USING (
        company_id = get_user_company_id() AND
        get_user_role() IN ('owner', 'administrador')
    );

-- Chatbots: Role-based chatbot access
CREATE POLICY chatbots_role_based_access ON chatbots
    FOR SELECT USING (
        company_id = get_user_company_id() AND
        CASE get_user_role()
            WHEN 'owner' THEN true
            WHEN 'administrador' THEN true
            WHEN 'supervisor' THEN true
            WHEN 'operador' THEN id IN (
                SELECT chatbot_id FROM chatbot_operators 
                WHERE operator_id = get_current_user_id()
            )
        END
    );

-- Chatbots: Management permissions (Create/Update/Delete)
CREATE POLICY chatbots_management ON chatbots
    FOR INSERT, UPDATE, DELETE USING (
        company_id = get_user_company_id() AND
        get_user_role() IN ('owner', 'administrador', 'supervisor')
    );

-- Chatbot Operators: Supervisor and above can manage assignments
CREATE POLICY chatbot_operators_management ON chatbot_operators
    FOR ALL USING (
        company_id = get_user_company_id() AND
        get_user_role() IN ('owner', 'administrador', 'supervisor')
    );

-- Conversations: Role-based conversation access
CREATE POLICY conversations_role_based_access ON conversations
    FOR ALL USING (
        company_id = get_user_company_id() AND
        CASE get_user_role()
            WHEN 'owner' THEN true
            WHEN 'administrador' THEN true
            WHEN 'supervisor' THEN true
            WHEN 'operador' THEN (
                chatbot_id IN (
                    SELECT chatbot_id FROM chatbot_operators 
                    WHERE operator_id = get_current_user_id()
                ) OR 
                assigned_operator_id = get_current_user_id()
            )
        END
    );

-- Messages: Follow conversation access rules
CREATE POLICY messages_conversation_access ON messages
    FOR ALL USING (
        company_id = get_user_company_id() AND
        conversation_id IN (
            SELECT id FROM conversations 
            WHERE company_id = get_user_company_id()
        )
    );

-- Documents: Role-based document management
CREATE POLICY documents_role_based_access ON documents
    FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY documents_management ON documents
    FOR INSERT, UPDATE, DELETE USING (
        company_id = get_user_company_id() AND
        get_user_role() IN ('owner', 'administrador', 'supervisor')
    );

-- Document chunks: Follow document access rules  
CREATE POLICY document_chunks_access ON document_chunks
    FOR ALL USING (
        company_id = get_user_company_id() AND
        document_id IN (
            SELECT id FROM documents 
            WHERE company_id = get_user_company_id()
        )
    );

-- Integrations: Owner and Admin only
CREATE POLICY integrations_management ON integrations
    FOR ALL USING (
        company_id = get_user_company_id() AND
        get_user_role() IN ('owner', 'administrador')
    );

-- Analytics: Role-based analytics access
CREATE POLICY analytics_role_based_access ON analytics_daily
    FOR SELECT USING (
        company_id = get_user_company_id() AND
        CASE get_user_role()
            WHEN 'owner' THEN true
            WHEN 'administrador' THEN true
            WHEN 'supervisor' THEN chatbot_id IN (
                SELECT id FROM chatbots 
                WHERE company_id = get_user_company_id()
            )
            WHEN 'operador' THEN chatbot_id IN (
                SELECT chatbot_id FROM chatbot_operators 
                WHERE operator_id = get_current_user_id()
            )
        END
    );

-- Audit logs: Owner and Admin only
CREATE POLICY audit_logs_management ON audit_logs
    FOR SELECT USING (
        company_id = get_user_company_id() AND
        get_user_role() IN ('owner', 'administrador')
    );
```

## Triggers y Funciones

```sql
-- ===========================================
-- TRIGGERS & FUNCTIONS
-- ===========================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbots_updated_at BEFORE UPDATE ON chatbots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Message count triggers
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE conversations 
        SET 
            message_count = message_count + 1,
            last_message_at = NOW(),
            bot_message_count = CASE WHEN NEW.sender_type = 'bot' THEN bot_message_count + 1 ELSE bot_message_count END,
            human_message_count = CASE WHEN NEW.sender_type = 'human' THEN human_message_count + 1 ELSE human_message_count END
        WHERE id = NEW.conversation_id;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_message_count_trigger
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_message_count();

-- Monthly message count reset
CREATE OR REPLACE FUNCTION reset_monthly_message_count()
RETURNS void AS $$
BEGIN
    UPDATE companies 
    SET 
        monthly_message_count = 0,
        monthly_reset_date = CURRENT_DATE
    WHERE monthly_reset_date <= CURRENT_DATE - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql;

-- Usage tracking trigger
CREATE OR REPLACE FUNCTION track_message_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Only count messages sent by bots towards company limits
    IF NEW.sender_type = 'bot' THEN
        UPDATE companies 
        SET monthly_message_count = monthly_message_count + 1
        WHERE id = NEW.company_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_message_usage_trigger
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION track_message_usage();
```

## Estrategia de Backup y Archivado

```sql
-- ===========================================
-- DATA RETENTION & ARCHIVAL
-- ===========================================

-- Archived conversations (moved after 1 year)
CREATE TABLE conversations_archived (
    LIKE conversations INCLUDING ALL
);

-- Archived messages (moved after 1 year)
CREATE TABLE messages_archived (
    LIKE messages INCLUDING ALL
);

-- Archive function (to be run monthly)
CREATE OR REPLACE FUNCTION archive_old_data()
RETURNS void AS $$
BEGIN
    -- Archive conversations older than 1 year
    WITH archived_conversations AS (
        DELETE FROM conversations 
        WHERE created_at < NOW() - INTERVAL '1 year'
        AND status IN ('resolved', 'abandoned')
        RETURNING *
    )
    INSERT INTO conversations_archived 
    SELECT * FROM archived_conversations;
    
    -- Archive messages from archived conversations
    WITH archived_messages AS (
        DELETE FROM messages m
        WHERE conversation_id IN (
            SELECT id FROM conversations_archived
        )
        RETURNING *
    )
    INSERT INTO messages_archived 
    SELECT * FROM archived_messages;
END;
$$ LANGUAGE plpgsql;
```

## Consideraciones de Escalabilidad

### 1. **Particionado por Company ID**
- Considerar particionado horizontal cuando se superen 1M+ registros
- Particiones por `company_id` para queries más eficientes

### 2. **Read Replicas**
- Analytics queries pueden ejecutarse en read replicas
- Separar carga de escritura vs lectura

### 3. **Connection Pooling**
- Supabase maneja connection pooling automáticamente
- Configurar límites por tenant si es necesario

### 4. **Caching Strategy**
- Cache frecuente de configuraciones de chatbots
- Cache de embeddings para RAG queries comunes
- Cache de métricas de dashboard

## Próximos Pasos

1. ✅ Schema de base de datos completado
2. ⏳ Documentación de stack tecnológico
3. ⏳ ADRs para decisiones críticas
4. ⏳ APIs y contratos de servicios
5. ⏳ Plan de implementación detallado