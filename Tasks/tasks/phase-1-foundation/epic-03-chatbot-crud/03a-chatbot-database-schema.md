# TASK-P1E3-03A: Chatbot Database Schema

## Identificación
- **ID:** TASK-P1E3-03A
- **Título:** Chatbot Database Schema
- **Type:** Database
- **Phase:** 1 - Foundation
- **Epic:** Chatbot CRUD & n8n Integration
- **Sprint:** Sprint 1.3 (Semanas 5-6, Febrero 2025)
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 5 horas
- **Prioridad:** Crítica - Base para todo el sistema de chatbots

## Definición Técnica
Crear schema completo de base de datos para chatbots con configuraciones, templates, channels, y estructura para conversaciones con RLS apropiado.

## Referencias de Documentación NeurAnt
- **Chatbot Schema:** `docs/architecture/13-diagrama-entidad-relacion.md:89-156` (Chatbots table)
- **Templates:** `docs/architecture/13-diagrama-entidad-relacion.md:157-189` (Chatbot templates)
- **Channels:** `docs/architecture/13-diagrama-entidad-relacion.md:190-223` (Integration channels)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E2-02A ✅ (Supabase Auth Setup)
- **Bloquea:**
  - [ ] TASK-P1E3-03B (Chatbot API Endpoints)
  - [ ] TASK-P1E3-03C (Chatbot Management UI)

## Criterios de Aceptación Específicos
- [ ] Chatbots table con configuración completa
- [ ] Chatbot templates system
- [ ] Integration channels support
- [ ] RLS policies para multi-tenant isolation
- [ ] Indexes para performance

## Archivos a Crear/Modificar
```
supabase/migrations/005_chatbots_schema.sql
supabase/migrations/006_chatbot_templates.sql
supabase/migrations/007_chatbot_channels.sql
```

## Migration Implementation
```sql
-- supabase/migrations/005_chatbots_schema.sql
BEGIN;

-- Chatbot status enum
CREATE TYPE chatbot_status AS ENUM ('draft', 'training', 'active', 'paused', 'error');

-- Chatbot tables
CREATE TABLE IF NOT EXISTS public.chatbots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  status chatbot_status DEFAULT 'draft',
  is_active BOOLEAN DEFAULT FALSE,
  
  -- Configuration
  max_tokens INTEGER DEFAULT 500,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  response_delay_ms INTEGER DEFAULT 1000,
  max_context_messages INTEGER DEFAULT 10,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT chatbots_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  CONSTRAINT chatbots_prompt_length CHECK (char_length(system_prompt) >= 10),
  CONSTRAINT chatbots_temperature_range CHECK (temperature >= 0 AND temperature <= 2),
  CONSTRAINT chatbots_max_tokens_range CHECK (max_tokens > 0 AND max_tokens <= 4000)
);

-- Chatbot templates
CREATE TABLE IF NOT EXISTS public.chatbot_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  industry TEXT,
  description TEXT,
  system_prompt_template TEXT NOT NULL,
  default_config JSONB,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT templates_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 100)
);

-- Integration channels
CREATE TABLE IF NOT EXISTS public.chatbot_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID REFERENCES public.chatbots(id) ON DELETE CASCADE NOT NULL,
  channel_type TEXT NOT NULL, -- 'whatsapp', 'telegram', 'slack', etc.
  channel_config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT channels_type_check CHECK (channel_type IN ('whatsapp', 'telegram', 'slack', 'web')),
  UNIQUE(chatbot_id, channel_type)
);

-- Enable RLS
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_channels ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view chatbots in own company"
ON public.chatbots FOR SELECT
USING (company_id = get_current_user_company_id());

CREATE POLICY "Users can manage chatbots in own company"
ON public.chatbots FOR ALL
USING (company_id = get_current_user_company_id());

CREATE POLICY "Users can view channels for own chatbots"
ON public.chatbot_channels FOR SELECT
USING (
  chatbot_id IN (
    SELECT id FROM public.chatbots 
    WHERE company_id = get_current_user_company_id()
  )
);

CREATE POLICY "Users can manage channels for own chatbots"
ON public.chatbot_channels FOR ALL
USING (
  chatbot_id IN (
    SELECT id FROM public.chatbots 
    WHERE company_id = get_current_user_company_id()
  )
);

-- Indexes
CREATE INDEX idx_chatbots_company_id ON public.chatbots(company_id);
CREATE INDEX idx_chatbots_status ON public.chatbots(status);
CREATE INDEX idx_chatbots_active ON public.chatbots(is_active);
CREATE INDEX idx_chatbot_channels_chatbot_id ON public.chatbot_channels(chatbot_id);
CREATE INDEX idx_chatbot_channels_type ON public.chatbot_channels(channel_type);

-- Templates data
INSERT INTO public.chatbot_templates (name, category, industry, description, system_prompt_template, default_config) VALUES
('Customer Service', 'support', 'retail', 'Generic customer service chatbot', 
'You are a helpful customer service assistant for {{company_name}}. You should be polite, professional, and helpful.',
'{"max_tokens": 300, "temperature": 0.5}'),

('Sales Assistant', 'sales', 'retail', 'Sales-focused chatbot for lead generation',
'You are a sales assistant for {{company_name}}. Help customers find products and guide them through the sales process.',
'{"max_tokens": 400, "temperature": 0.7}'),

('Technical Support', 'support', 'technology', 'Technical support specialist',
'You are a technical support specialist. Help users troubleshoot technical issues step by step.',
'{"max_tokens": 500, "temperature": 0.3}');

COMMIT;
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md al completar:
- Chatbot Schema: ✅ Tables created with full configuration
- Templates: ✅ Template system implemented
- Channels: ✅ Multi-channel support ready
- RLS: ✅ Multi-tenant security enabled
- Siguiente tarea: TASK-P1E3-03B (Chatbot API Endpoints)
```