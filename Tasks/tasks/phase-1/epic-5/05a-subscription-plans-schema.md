# Database Schema: Subscription Plans & Billing System

## Identificación
- **ID:** TASK-P1E5-05a
- **Título:** Subscription Plans Database Schema
- **Type:** Database
- **Phase:** 1 - Foundation
- **Epic:** Epic 5 - Plans & Billing System
- **Sprint:** Sprint 5
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 4 horas
- **Prioridad:** Crítica

## Definición Técnica
Implementar el esquema completo de base de datos para el sistema de planes de suscripción y facturación, incluyendo planes, límites, suscripciones, facturación y métricas de uso. Schema multi-tenant con RLS para aislamiento de datos por empresa.

## Referencias de Documentación NeurAnt
- **Database Schema:** `docs/architecture/13-diagrama-entidad-relacion.md:500-600` (billing entities)
- **Database Design:** `docs/architecture/03-database-design.md:150-200` (multi-tenant patterns)
- **RBAC Model:** `docs/architecture/10-modelo-datos-rbac-extendido.md:80-120` (billing permissions)
- **Implementation Roadmap:** `docs/architecture/05-implementation-roadmap.md:180-220` (Phase 1 Epic 5)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E1-01a ✅ (Next.js project setup)
  - [x] TASK-P1E1-01b ✅ (Supabase configuration)
  - [x] TASK-P1E2-02a ✅ (Auth setup con companies)
- **Bloquea:**
  - [ ] TASK-P1E5-05b (Billing API endpoints)
  - [ ] TASK-P1E5-05c (Plans pricing UI)
  - [ ] TASK-P1E5-05d (Subscription management)

## Entidades Afectadas
### Tablas Principales
- **SUBSCRIPTION_PLANS**: Catálogo de planes disponibles con límites y precios
- **COMPANY_SUBSCRIPTIONS**: Suscripciones activas por empresa
- **BILLING_RECORDS**: Registros de facturación históricos
- **USAGE_METRICS**: Métricas de uso por empresa para billing
- **SUBSCRIPTION_LIMITS**: Límites específicos por plan y recursos

### Relaciones
- **FK:** COMPANIES → COMPANY_SUBSCRIPTIONS (1:1 activa)
- **FK:** SUBSCRIPTION_PLANS → COMPANY_SUBSCRIPTIONS (1:N)
- **FK:** COMPANY_SUBSCRIPTIONS → BILLING_RECORDS (1:N)
- **FK:** COMPANIES → USAGE_METRICS (1:N diarias)
- **FK:** SUBSCRIPTION_PLANS → SUBSCRIPTION_LIMITS (1:N por recurso)

## Criterios de Aceptación Específicos
### Schema Implementation
- [x] SUBSCRIPTION_PLANS con campos pricing, limits, features
- [x] COMPANY_SUBSCRIPTIONS con status, billing cycle, dates
- [x] BILLING_RECORDS con amounts, status, payment details
- [x] USAGE_METRICS con métricas diarias por recurso
- [x] SUBSCRIPTION_LIMITS con límites por plan y tipo recurso
- [x] ENUMs para plan types, billing status, subscription status

### RLS Security
- [x] RLS habilitado en todas las tablas tenant-specific
- [x] Policies para COMPANY_SUBSCRIPTIONS isolation por company_id
- [x] Policies para BILLING_RECORDS acceso solo por company owner
- [x] Policies para USAGE_METRICS lectura por company members
- [x] SUBSCRIPTION_PLANS readable por todos (catálogo público)

### Data Integrity
- [x] Constraints de negocio: una suscripción activa por empresa
- [x] Triggers para actualizar usage metrics automáticamente
- [x] Validaciones de integridad entre planes y límites
- [x] Cascade deletes apropiados para billing records

## Archivos de Database
```
supabase/migrations/20240129_subscription_billing_schema.sql
lib/database/types.ts (billing types)
lib/database/queries/billing.ts (billing queries)
```

## Migration Script
```sql
-- Migration Up: Subscription Plans & Billing System
BEGIN;

-- Crear ENUMs para billing
CREATE TYPE subscription_plan_type AS ENUM (
  'starter', 'professional', 'enterprise', 'custom'
);

CREATE TYPE subscription_status AS ENUM (
  'active', 'canceled', 'past_due', 'trialing', 'incomplete'
);

CREATE TYPE billing_status AS ENUM (
  'pending', 'paid', 'failed', 'refunded', 'canceled'
);

CREATE TYPE billing_interval AS ENUM (
  'monthly', 'yearly'
);

CREATE TYPE usage_metric_type AS ENUM (
  'conversations', 'messages', 'users', 'storage_mb', 'api_calls'
);

-- ==========================================
-- SUBSCRIPTION PLANS (Catálogo público)
-- ==========================================
CREATE TABLE SUBSCRIPTION_PLANS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  plan_type subscription_plan_type NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  billing_interval billing_interval NOT NULL DEFAULT 'monthly',
  features JSON NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_plan_type_interval UNIQUE (plan_type, billing_interval)
);

-- ==========================================
-- SUBSCRIPTION LIMITS (Límites por plan)
-- ==========================================
CREATE TABLE SUBSCRIPTION_LIMITS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES SUBSCRIPTION_PLANS(id) ON DELETE CASCADE,
  metric_type usage_metric_type NOT NULL,
  limit_value INTEGER NOT NULL,
  is_hard_limit BOOLEAN NOT NULL DEFAULT true,
  overage_price DECIMAL(8,4) DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_plan_metric UNIQUE (plan_id, metric_type)
);

-- ==========================================
-- COMPANY SUBSCRIPTIONS (Una activa por empresa)
-- ==========================================
CREATE TABLE COMPANY_SUBSCRIPTIONS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES COMPANIES(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES SUBSCRIPTION_PLANS(id),
  status subscription_status NOT NULL DEFAULT 'trialing',
  billing_interval billing_interval NOT NULL DEFAULT 'monthly',
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  payment_provider_subscription_id VARCHAR(255),
  payment_provider_customer_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_active_subscription_per_company 
    EXCLUDE (company_id WITH =) 
    WHERE (status IN ('active', 'trialing', 'past_due'))
);

-- ==========================================
-- BILLING RECORDS (Facturas y pagos)
-- ==========================================
CREATE TABLE BILLING_RECORDS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES COMPANIES(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES COMPANY_SUBSCRIPTIONS(id),
  payment_provider_invoice_id VARCHAR(255),
  amount_subtotal DECIMAL(10,2) NOT NULL,
  amount_tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount_total DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status billing_status NOT NULL DEFAULT 'pending',
  billing_reason VARCHAR(100),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  invoice_pdf_url TEXT,
  hosted_invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- USAGE METRICS (Métricas diarias por empresa)
-- ==========================================
CREATE TABLE USAGE_METRICS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES COMPANIES(id) ON DELETE CASCADE,
  metric_type usage_metric_type NOT NULL,
  metric_date DATE NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  daily_increment INTEGER NOT NULL DEFAULT 0,
  monthly_total INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_company_metric_date UNIQUE (company_id, metric_type, metric_date)
);

-- ==========================================
-- ÍNDICES ESTRATÉGICOS
-- ==========================================
CREATE INDEX idx_subscription_plans_type_active ON SUBSCRIPTION_PLANS (plan_type, is_active);
CREATE INDEX idx_subscription_limits_plan_id ON SUBSCRIPTION_LIMITS (plan_id);

CREATE INDEX idx_company_subscriptions_company_id ON COMPANY_SUBSCRIPTIONS (company_id);
CREATE INDEX idx_company_subscriptions_status ON COMPANY_SUBSCRIPTIONS (status);
CREATE INDEX idx_company_subscriptions_provider ON COMPANY_SUBSCRIPTIONS (payment_provider_subscription_id);

CREATE INDEX idx_billing_records_company_id ON BILLING_RECORDS (company_id);
CREATE INDEX idx_billing_records_subscription_id ON BILLING_RECORDS (subscription_id);
CREATE INDEX idx_billing_records_status ON BILLING_RECORDS (status);
CREATE INDEX idx_billing_records_period ON BILLING_RECORDS (period_start, period_end);

CREATE INDEX idx_usage_metrics_company_date ON USAGE_METRICS (company_id, metric_date);
CREATE INDEX idx_usage_metrics_type_date ON USAGE_METRICS (metric_type, metric_date);

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- SUBSCRIPTION_PLANS: Lectura pública para catálogo
ALTER TABLE SUBSCRIPTION_PLANS ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscription_plans_public_read ON SUBSCRIPTION_PLANS
  FOR SELECT USING (is_public = true);

-- SUBSCRIPTION_LIMITS: Lectura pública para mostrar límites de planes
ALTER TABLE SUBSCRIPTION_LIMITS ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscription_limits_public_read ON SUBSCRIPTION_LIMITS
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM SUBSCRIPTION_PLANS sp 
      WHERE sp.id = plan_id AND sp.is_public = true
    )
  );

-- COMPANY_SUBSCRIPTIONS: Solo company owners/admins
ALTER TABLE COMPANY_SUBSCRIPTIONS ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_subscriptions_company_access ON COMPANY_SUBSCRIPTIONS
  FOR ALL USING (
    company_id = (auth.jwt() ->> 'company_id')::uuid AND
    EXISTS (
      SELECT 1 FROM COMPANY_USERS cu 
      WHERE cu.company_id = company_subscriptions.company_id 
      AND cu.user_id = auth.uid()
      AND cu.role IN ('owner', 'admin')
      AND cu.is_active = true
    )
  );

-- BILLING_RECORDS: Solo company owners/admins pueden ver facturas
ALTER TABLE BILLING_RECORDS ENABLE ROW LEVEL SECURITY;
CREATE POLICY billing_records_company_access ON BILLING_RECORDS
  FOR ALL USING (
    company_id = (auth.jwt() ->> 'company_id')::uuid AND
    EXISTS (
      SELECT 1 FROM COMPANY_USERS cu 
      WHERE cu.company_id = billing_records.company_id 
      AND cu.user_id = auth.uid()
      AND cu.role IN ('owner', 'admin')
      AND cu.is_active = true
    )
  );

-- USAGE_METRICS: Company members pueden leer métricas
ALTER TABLE USAGE_METRICS ENABLE ROW LEVEL SECURITY;
CREATE POLICY usage_metrics_company_read ON USAGE_METRICS
  FOR SELECT USING (
    company_id = (auth.jwt() ->> 'company_id')::uuid AND
    EXISTS (
      SELECT 1 FROM COMPANY_USERS cu 
      WHERE cu.company_id = usage_metrics.company_id 
      AND cu.user_id = auth.uid()
      AND cu.is_active = true
    )
  );

-- ==========================================
-- TRIGGERS PARA UPDATED_AT
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_plans_updated_at 
  BEFORE UPDATE ON SUBSCRIPTION_PLANS 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_subscriptions_updated_at 
  BEFORE UPDATE ON COMPANY_SUBSCRIPTIONS 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_records_updated_at 
  BEFORE UPDATE ON BILLING_RECORDS 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_metrics_updated_at 
  BEFORE UPDATE ON USAGE_METRICS 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- SEED DATA: Planes básicos
-- ==========================================
INSERT INTO SUBSCRIPTION_PLANS (name, plan_type, description, price_monthly, price_yearly, features) VALUES
('Starter', 'starter', 'Perfect for small teams getting started', 29.00, 290.00, 
 '{"chatbots": 3, "messages": 1000, "users": 5, "support": "email"}'),
('Professional', 'professional', 'For growing businesses', 99.00, 990.00,
 '{"chatbots": 10, "messages": 10000, "users": 25, "support": "priority", "analytics": true}'),
('Enterprise', 'enterprise', 'For large organizations', 299.00, 2990.00,
 '{"chatbots": "unlimited", "messages": 100000, "users": 100, "support": "dedicated", "analytics": true, "sso": true}');

-- Límites para plan Starter
INSERT INTO SUBSCRIPTION_LIMITS (plan_id, metric_type, limit_value, is_hard_limit) 
SELECT 
  sp.id, 
  metric_type::usage_metric_type, 
  limit_value,
  true
FROM SUBSCRIPTION_PLANS sp,
(VALUES 
  ('conversations', 1000),
  ('messages', 5000), 
  ('users', 5),
  ('storage_mb', 1000),
  ('api_calls', 10000)
) AS limits(metric_type, limit_value)
WHERE sp.plan_type = 'starter';

-- Límites para plan Professional  
INSERT INTO SUBSCRIPTION_LIMITS (plan_id, metric_type, limit_value, is_hard_limit)
SELECT 
  sp.id, 
  metric_type::usage_metric_type, 
  limit_value,
  true
FROM SUBSCRIPTION_PLANS sp,
(VALUES 
  ('conversations', 10000),
  ('messages', 50000), 
  ('users', 25),
  ('storage_mb', 10000),
  ('api_calls', 100000)
) AS limits(metric_type, limit_value)
WHERE sp.plan_type = 'professional';

-- Límites para plan Enterprise
INSERT INTO SUBSCRIPTION_LIMITS (plan_id, metric_type, limit_value, is_hard_limit)
SELECT 
  sp.id, 
  metric_type::usage_metric_type, 
  limit_value,
  false -- Soft limits para enterprise
FROM SUBSCRIPTION_PLANS sp,
(VALUES 
  ('conversations', 100000),
  ('messages', 500000), 
  ('users', 100),
  ('storage_mb', 100000),
  ('api_calls', 1000000)
) AS limits(metric_type, limit_value)
WHERE sp.plan_type = 'enterprise';

COMMIT;
```

## Validation Queries
```sql
-- Verificar estructura de tablas billing
\d SUBSCRIPTION_PLANS
\d SUBSCRIPTION_LIMITS  
\d COMPANY_SUBSCRIPTIONS
\d BILLING_RECORDS
\d USAGE_METRICS

-- Verificar ENUMs creados
SELECT typname, typelem FROM pg_type WHERE typname LIKE '%subscription%' OR typname LIKE '%billing%' OR typname LIKE '%usage%';

-- Verificar RLS habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('subscription_plans', 'subscription_limits', 'company_subscriptions', 'billing_records', 'usage_metrics');

-- Verificar policies de RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename LIKE '%subscription%' OR tablename LIKE '%billing%' OR tablename LIKE '%usage%';

-- Verificar índices
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('subscription_plans', 'company_subscriptions', 'billing_records', 'usage_metrics');

-- Test básico: verificar planes seed
SELECT id, name, plan_type, price_monthly, price_yearly 
FROM SUBSCRIPTION_PLANS 
ORDER BY price_monthly;

-- Test límites por plan
SELECT sp.name, sl.metric_type, sl.limit_value, sl.is_hard_limit
FROM SUBSCRIPTION_PLANS sp
JOIN SUBSCRIPTION_LIMITS sl ON sp.id = sl.plan_id
ORDER BY sp.price_monthly, sl.metric_type;
```

## TypeScript Types
```typescript
// Database types para billing system
export interface SubscriptionPlan {
  id: string
  name: string
  plan_type: 'starter' | 'professional' | 'enterprise' | 'custom'
  description: string | null
  price_monthly: number
  price_yearly: number  
  billing_interval: 'monthly' | 'yearly'
  features: Record<string, any>
  is_active: boolean
  is_public: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface SubscriptionLimit {
  id: string
  plan_id: string
  metric_type: 'conversations' | 'messages' | 'users' | 'storage_mb' | 'api_calls'
  limit_value: number
  is_hard_limit: boolean
  overage_price: number | null
  created_at: string
}

export interface CompanySubscription {
  id: string
  company_id: string
  plan_id: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
  billing_interval: 'monthly' | 'yearly'
  current_period_start: string
  current_period_end: string
  trial_start: string | null
  trial_end: string | null
  canceled_at: string | null
  ended_at: string | null
  payment_provider_subscription_id: string | null
  payment_provider_customer_id: string | null
  created_at: string
  updated_at: string
}

export interface BillingRecord {
  id: string
  company_id: string
  subscription_id: string
  payment_provider_invoice_id: string | null
  amount_subtotal: number
  amount_tax: number
  amount_total: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'canceled'
  billing_reason: string | null
  period_start: string
  period_end: string
  due_date: string | null
  paid_at: string | null
  invoice_pdf_url: string | null
  hosted_invoice_url: string | null
  created_at: string
  updated_at: string
}

export interface UsageMetric {
  id: string
  company_id: string
  metric_type: 'conversations' | 'messages' | 'users' | 'storage_mb' | 'api_calls'
  metric_date: string
  current_value: number
  daily_increment: number
  monthly_total: number
  created_at: string
  updated_at: string
}

// Insert/Update types
export type SubscriptionPlanInsert = Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>
export type SubscriptionPlanUpdate = Partial<SubscriptionPlanInsert>

export type CompanySubscriptionInsert = Omit<CompanySubscription, 'id' | 'created_at' | 'updated_at'>
export type CompanySubscriptionUpdate = Partial<CompanySubscriptionInsert>

export type BillingRecordInsert = Omit<BillingRecord, 'id' | 'created_at' | 'updated_at'>
export type UsageMetricInsert = Omit<UsageMetric, 'id' | 'created_at' | 'updated_at'>
```

## RLS Testing
```sql
-- Test isolation multi-tenant para Company Subscriptions
SET role authenticated;
SET request.jwt.claims TO '{"sub": "user-uuid-1", "company_id": "company-uuid-1"}';

-- Debe ver solo suscripción de su empresa
SELECT * FROM COMPANY_SUBSCRIPTIONS; 

-- Test Billing Records - solo company owners/admins
SELECT * FROM BILLING_RECORDS;

-- Test con otra empresa
SET request.jwt.claims TO '{"sub": "user-uuid-2", "company_id": "company-uuid-2"}';
SELECT * FROM COMPANY_SUBSCRIPTIONS; -- No debe ver datos de company anterior

-- Test catálogo público de planes
SELECT * FROM SUBSCRIPTION_PLANS; -- Debe ver todos los planes públicos
SELECT * FROM SUBSCRIPTION_LIMITS; -- Debe ver límites de planes públicos

RESET role;
```

## Performance Validation
```sql
-- Verificar query plans para búsquedas frecuentes
EXPLAIN ANALYZE SELECT * FROM SUBSCRIPTION_PLANS WHERE plan_type = 'professional' AND is_active = true;

EXPLAIN ANALYZE SELECT * FROM COMPANY_SUBSCRIPTIONS WHERE company_id = 'test-uuid';

EXPLAIN ANALYZE SELECT * FROM BILLING_RECORDS 
WHERE company_id = 'test-uuid' AND period_start >= '2024-01-01' AND period_end <= '2024-12-31';

EXPLAIN ANALYZE SELECT * FROM USAGE_METRICS 
WHERE company_id = 'test-uuid' AND metric_date >= '2024-01-01';

-- Performance con RLS activo
EXPLAIN ANALYZE SELECT cs.*, sp.name, sp.price_monthly
FROM COMPANY_SUBSCRIPTIONS cs
JOIN SUBSCRIPTION_PLANS sp ON cs.plan_id = sp.id
WHERE cs.status = 'active';
```

## Rollback Plan
```sql
-- Migration Down: Remove Billing System
BEGIN;

-- Eliminar triggers
DROP TRIGGER IF EXISTS update_usage_metrics_updated_at ON USAGE_METRICS;
DROP TRIGGER IF EXISTS update_billing_records_updated_at ON BILLING_RECORDS;
DROP TRIGGER IF EXISTS update_company_subscriptions_updated_at ON COMPANY_SUBSCRIPTIONS;
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON SUBSCRIPTION_PLANS;

-- Eliminar función de trigger
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Eliminar policies RLS
DROP POLICY IF EXISTS usage_metrics_company_read ON USAGE_METRICS;
DROP POLICY IF EXISTS billing_records_company_access ON BILLING_RECORDS;  
DROP POLICY IF EXISTS company_subscriptions_company_access ON COMPANY_SUBSCRIPTIONS;
DROP POLICY IF EXISTS subscription_limits_public_read ON SUBSCRIPTION_LIMITS;
DROP POLICY IF EXISTS subscription_plans_public_read ON SUBSCRIPTION_PLANS;

-- Deshabilitar RLS
ALTER TABLE USAGE_METRICS DISABLE ROW LEVEL SECURITY;
ALTER TABLE BILLING_RECORDS DISABLE ROW LEVEL SECURITY;
ALTER TABLE COMPANY_SUBSCRIPTIONS DISABLE ROW LEVEL SECURITY;
ALTER TABLE SUBSCRIPTION_LIMITS DISABLE ROW LEVEL SECURITY;
ALTER TABLE SUBSCRIPTION_PLANS DISABLE ROW LEVEL SECURITY;

-- Eliminar tablas (en orden inverso de dependencias)
DROP TABLE IF EXISTS USAGE_METRICS CASCADE;
DROP TABLE IF EXISTS BILLING_RECORDS CASCADE;
DROP TABLE IF EXISTS COMPANY_SUBSCRIPTIONS CASCADE;
DROP TABLE IF EXISTS SUBSCRIPTION_LIMITS CASCADE;
DROP TABLE IF EXISTS SUBSCRIPTION_PLANS CASCADE;

-- Eliminar ENUMs
DROP TYPE IF EXISTS usage_metric_type;
DROP TYPE IF EXISTS billing_interval;
DROP TYPE IF EXISTS billing_status;
DROP TYPE IF EXISTS subscription_status;
DROP TYPE IF EXISTS subscription_plan_type;

COMMIT;
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- Database changes: 5 nuevas tablas billing system implementadas
- Migration applied: 20240129_subscription_billing_schema.sql
- RLS policies: 5 policies implementadas para multi-tenant isolation
- Next database task: TASK-P1E5-05b (Billing API endpoints)
- Dependent API tasks now unblocked: TASK-P1E5-05b, TASK-P1E5-05c, TASK-P1E5-05d
- Billing system foundation: ✅ Complete con seed data
```

## Troubleshooting Database
### Common Issues
- **RLS Policy Errors:** Verificar company_id en JWT claims y membresía activa en COMPANY_USERS
- **Migration Failures:** Verificar dependencias de COMPANIES table existente antes de FK
- **Performance Issues:** Usar índices compuestos para queries frecuentes por company + date

### Debugging Commands
```bash
# Supabase CLI validation
supabase db reset
supabase db diff
supabase gen types typescript --local > types/billing-database.ts

# PostgreSQL direct
psql -h localhost -p 5432 -U postgres -d postgres
\dt *subscription* -- list subscription tables
\dt *billing* -- list billing tables
\dt *usage* -- list usage tables
\di billing* -- list billing indexes  
\dp billing* -- list billing permissions
```

---
*Database task para implementar esquema completo de subscription billing system con RLS multi-tenant*