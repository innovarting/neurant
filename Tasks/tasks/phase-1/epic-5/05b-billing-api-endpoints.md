# API Endpoints: Billing & Subscription Management

## Identificación
- **ID:** TASK-P1E5-05b
- **Título:** Billing & Subscription API Endpoints
- **Type:** API
- **Phase:** 1 - Foundation
- **Epic:** Epic 5 - Plans & Billing System
- **Sprint:** Sprint 5
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 6 horas
- **Prioridad:** Crítica

## Definición Técnica
Implementar endpoints completos para gestión de suscripciones, facturación y métricas de uso. APIs preparadas para integración con pasarela de pagos (por definir), gestión de ciclos de facturación, y consulta de usage metrics con RBAC multi-tenant.

## Referencias de Documentación NeurAnt
- **API Contracts:** `docs/architecture/11-interfaces-contratos-rbac.md:150-200` (billing interfaces)
- **Database Schema:** `docs/architecture/13-diagrama-entidad-relacion.md:500-600` (billing entities)
- **Implementation Guide:** `docs/architecture/12-guias-implementacion-rbac.md:100-150` (auth patterns)
- **Tech Stack:** `docs/architecture/04-tech-stack.md:80-120` (Next.js API routes)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E5-05a ✅ (subscription billing database schema)
  - [x] TASK-P1E2-02a ✅ (Supabase auth setup)
  - [x] TASK-P1E2-02f ✅ (RBAC middleware)
- **Bloquea:**
  - [ ] TASK-P1E5-05c (Plans pricing UI)
  - [ ] TASK-P1E5-05d (Subscription management frontend)

## API Specification
### Endpoints Overview
```
# Subscription Plans (Public)
GET    /api/billing/plans                    # List available plans
GET    /api/billing/plans/[id]               # Get plan details with limits

# Company Subscriptions (Protected)
GET    /api/billing/subscription             # Get current company subscription  
POST   /api/billing/subscription/create      # Create/upgrade subscription
PUT    /api/billing/subscription/update      # Update billing details
POST   /api/billing/subscription/cancel      # Cancel subscription

# Billing & Invoices (Protected)
GET    /api/billing/invoices                 # List company invoices
GET    /api/billing/invoices/[id]            # Get invoice details
POST   /api/billing/invoices/[id]/download   # Download invoice PDF

# Usage Metrics (Protected)
GET    /api/billing/usage                    # Get current usage metrics
GET    /api/billing/usage/history            # Get usage history
POST   /api/billing/usage/increment          # Internal: increment usage

# Payment Provider Webhooks (Internal)
POST   /api/billing/webhooks/payment         # Handle payment provider events
```

### Authentication & RBAC
```
Auth: JWT required (except public plan endpoints)
RBAC Levels:
- owner: Full billing access, can change plans, view invoices
- admin: Full billing access, can change plans, view invoices  
- supervisor: Read-only billing, can view usage metrics
- operador: No billing access
```

## Request/Response Schemas

### GET /api/billing/plans
```typescript
// Response
interface PlansResponse {
  data: {
    id: string
    name: string
    plan_type: 'starter' | 'professional' | 'enterprise' | 'custom'
    description: string | null
    price_monthly: number
    price_yearly: number
    features: Record<string, any>
    limits: {
      metric_type: string
      limit_value: number
      is_hard_limit: boolean
    }[]
  }[]
}
```

### GET /api/billing/subscription
```typescript
// Response
interface SubscriptionResponse {
  data: {
    id: string
    plan: {
      id: string
      name: string
      plan_type: string
      price_monthly: number
      price_yearly: number
    }
    status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
    billing_interval: 'monthly' | 'yearly'
    current_period_start: string
    current_period_end: string
    trial_end: string | null
    canceled_at: string | null
    usage: {
      metric_type: string
      current_value: number
      limit_value: number
      percentage_used: number
    }[]
  } | null
}
```

### POST /api/billing/subscription/create
```typescript
// Request
interface CreateSubscriptionRequest {
  plan_id: string
  billing_interval: 'monthly' | 'yearly'
  payment_method_id?: string
  trial_days?: number
}

// Response
interface CreateSubscriptionResponse {
  data: {
    subscription_id: string
    client_secret: string | null // for 3D Secure
    status: 'active' | 'incomplete' | 'trialing'
    redirect_to_stripe?: string
  }
}
```

### GET /api/billing/usage
```typescript
// Response
interface UsageResponse {
  data: {
    current_period: {
      start: string
      end: string
    }
    metrics: {
      metric_type: 'conversations' | 'messages' | 'users' | 'storage_mb' | 'api_calls'
      current_value: number
      monthly_total: number
      limit_value: number
      percentage_used: number
      is_hard_limit: boolean
      overage_cost?: number
    }[]
    projected_overage?: {
      metric_type: string
      projected_value: number
      overage_units: number
      overage_cost: number
    }[]
  }
}
```

### GET /api/billing/invoices
```typescript
// Query params
interface InvoicesQuery {
  limit?: number
  offset?: number
  status?: 'pending' | 'paid' | 'failed' | 'refunded'
  from_date?: string
  to_date?: string
}

// Response
interface InvoicesResponse {
  data: {
    id: string
    amount_total: number
    currency: string
    status: 'pending' | 'paid' | 'failed' | 'refunded' | 'canceled'
    period_start: string
    period_end: string
    due_date: string | null
    paid_at: string | null
    hosted_invoice_url: string | null
    created_at: string
  }[]
  pagination: {
    total: number
    limit: number
    offset: number
    has_more: boolean
  }
}
```

## Criterios de Aceptación Específicos
### API Implementation
- [x] 8 endpoints implementados en Next.js API Routes
- [x] Request validation con Zod schemas para todos inputs
- [x] Response format consistente con interfaces definidas
- [x] Error handling apropiado (400, 401, 403, 404, 500)

### Security & Authorization
- [x] JWT authentication verificada en endpoints protegidos
- [x] RBAC authorization: solo owner/admin para billing operations
- [x] Multi-tenant isolation via company_id en JWT
- [x] Input sanitization para prevenir SQL injection

### Payment Provider Integration
- [x] APIs preparadas para integración con pasarela de pagos
- [x] Subscription creation con payment methods genéricos
- [x] Invoice generation y webhook handling abstracto
- [x] Support para múltiples métodos de pago

### Database Integration
- [x] Queries optimizadas con índices de billing schema
- [x] RLS policies respetadas para multi-tenant isolation
- [x] Transactions para operaciones críticas (create subscription)
- [x] Usage metrics tracking con atomic increments

### API Quality
- [x] Response times < 300ms p95 (billing puede ser más lento)
- [x] Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- [x] Error messages descriptivos para debugging
- [x] Unit tests covering happy paths y edge cases

## Archivos a Crear/Modificar
```
# API Routes (Next.js App Router)
app/api/billing/plans/route.ts                    # Public plans catalog
app/api/billing/plans/[id]/route.ts               # Single plan details
app/api/billing/subscription/route.ts             # Current subscription
app/api/billing/subscription/create/route.ts      # Create subscription
app/api/billing/subscription/update/route.ts      # Update subscription
app/api/billing/subscription/cancel/route.ts      # Cancel subscription
app/api/billing/invoices/route.ts                 # List invoices
app/api/billing/invoices/[id]/route.ts            # Invoice details
app/api/billing/invoices/[id]/download/route.ts   # Download PDF
app/api/billing/usage/route.ts                    # Current usage
app/api/billing/usage/history/route.ts            # Usage history
app/api/billing/usage/increment/route.ts          # Internal increment
app/api/billing/webhooks/payment/route.ts         # Payment provider webhooks

# Services & Business Logic
lib/services/billing-service.ts                   # Core billing logic
lib/services/payment-provider-service.ts          # Payment provider integration
lib/services/usage-service.ts                     # Usage tracking
lib/services/subscription-service.ts              # Subscription management

# Validations & Types
lib/validations/billing.ts                        # Zod schemas
types/billing.ts                                  # TypeScript interfaces

# Tests
__tests__/api/billing/plans.test.ts               # Plans API tests
__tests__/api/billing/subscription.test.ts        # Subscription tests
__tests__/api/billing/usage.test.ts               # Usage API tests
__tests__/services/billing-service.test.ts        # Service tests
```

## Implementation Structure

### Main API Route: Subscription Management
```typescript
// app/api/billing/subscription/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { verifyAuth, requireAuth } from '@/lib/auth/middleware'
import { BillingService } from '@/lib/services/billing-service'

export async function GET(request: NextRequest) {
  try {
    const { user, company_id } = await verifyAuth(request)
    const supabase = createClient()
    
    // Verify RBAC: owner/admin/supervisor can view subscription
    const { data: companyUser } = await supabase
      .from('COMPANY_USERS')
      .select('role')
      .eq('company_id', company_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()
    
    if (!companyUser || !['owner', 'admin', 'supervisor'].includes(companyUser.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view billing' },
        { status: 403 }
      )
    }

    const billingService = new BillingService(supabase)
    const subscription = await billingService.getCurrentSubscription(company_id)
    
    return NextResponse.json({ data: subscription })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}
```

### Billing Service Implementation
```typescript
// lib/services/billing-service.ts
import { SupabaseClient } from '@supabase/supabase-js'
import { PaymentProviderService } from './payment-provider-service'
import { UsageService } from './usage-service'

export class BillingService {
  constructor(
    private supabase: SupabaseClient,
    private paymentService = new PaymentProviderService(),
    private usageService = new UsageService(supabase)
  ) {}

  async getCurrentSubscription(companyId: string) {
    // Get active subscription with plan details
    const { data: subscription, error } = await this.supabase
      .from('COMPANY_SUBSCRIPTIONS')
      .select(`
        *,
        plan:SUBSCRIPTION_PLANS(*)
      `)
      .eq('company_id', companyId)
      .in('status', ['active', 'trialing', 'past_due'])
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch subscription: ${error.message}`)
    }

    if (!subscription) {
      return null
    }

    // Get current usage metrics
    const usage = await this.usageService.getCurrentUsage(companyId)
    
    // Get plan limits for comparison
    const { data: limits } = await this.supabase
      .from('SUBSCRIPTION_LIMITS')
      .select('*')
      .eq('plan_id', subscription.plan_id)

    // Combine usage with limits
    const usageWithLimits = usage.map(metric => {
      const limit = limits?.find(l => l.metric_type === metric.metric_type)
      return {
        ...metric,
        limit_value: limit?.limit_value || 0,
        percentage_used: limit ? (metric.current_value / limit.limit_value) * 100 : 0
      }
    })

    return {
      ...subscription,
      usage: usageWithLimits
    }
  }

  async createSubscription(companyId: string, planId: string, billingInterval: 'monthly' | 'yearly', paymentMethodId?: string) {
    const supabase = this.supabase
    
    // Start transaction
    const { data: company, error: companyError } = await supabase
      .from('COMPANIES')
      .select('payment_provider_customer_id, name, email')
      .eq('id', companyId)
      .single()

    if (companyError) {
      throw new Error(`Company not found: ${companyError.message}`)
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('SUBSCRIPTION_PLANS')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError) {
      throw new Error(`Plan not found: ${planError.message}`)
    }

    // Create or get payment provider customer
    let customerProviderId = company.payment_provider_customer_id
    if (!customerProviderId) {
      const customer = await this.paymentService.createCustomer({
        name: company.name,
        email: company.email
      })
      customerProviderId = customer.id

      // Update company with payment provider customer ID
      await supabase
        .from('COMPANIES')
        .update({ payment_provider_customer_id: customerProviderId })
        .eq('id', companyId)
    }

    // Create subscription via payment provider
    const providerSubscription = await this.paymentService.createSubscription({
      customer_id: customerProviderId,
      plan_id: planId,
      billing_interval: billingInterval,
      payment_method_id: paymentMethodId
    })

    // Create subscription record in database
    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + (billingInterval === 'monthly' ? 1 : 12))

    const { data: subscription, error: subError } = await supabase
      .from('COMPANY_SUBSCRIPTIONS')
      .insert({
        company_id: companyId,
        plan_id: planId,
        status: providerSubscription.status,
        billing_interval: billingInterval,
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd.toISOString(),
        payment_provider_subscription_id: providerSubscription.id,
        payment_provider_customer_id: customerProviderId
      })
      .select()
      .single()

    if (subError) {
      // Rollback payment provider subscription if database fails
      await this.paymentService.cancelSubscription(providerSubscription.id)
      throw new Error(`Failed to create subscription: ${subError.message}`)
    }

    return {
      subscription_id: subscription.id,
      status: providerSubscription.status,
      client_secret: providerSubscription.client_secret,
      redirect_url: providerSubscription.redirect_url
    }
  }

  async cancelSubscription(companyId: string) {
    // Get current subscription
    const { data: subscription, error } = await this.supabase
      .from('COMPANY_SUBSCRIPTIONS')
      .select('*')
      .eq('company_id', companyId)
      .in('status', ['active', 'trialing'])
      .single()

    if (error) {
      throw new Error(`Subscription not found: ${error.message}`)
    }

    // Cancel with payment provider (at period end)
    if (subscription.payment_provider_subscription_id) {
      await this.paymentService.cancelSubscription(
        subscription.payment_provider_subscription_id,
        { at_period_end: true }
      )
    }

    // Update subscription status
    const { error: updateError } = await this.supabase
      .from('COMPANY_SUBSCRIPTIONS')
      .update({ 
        status: 'canceled',
        canceled_at: new Date().toISOString()
      })
      .eq('id', subscription.id)

    if (updateError) {
      throw new Error(`Failed to update subscription: ${updateError.message}`)
    }

    return { success: true }
  }
}
```

### Usage Service Implementation
```typescript
// lib/services/usage-service.ts
import { SupabaseClient } from '@supabase/supabase-js'

export class UsageService {
  constructor(private supabase: SupabaseClient) {}

  async getCurrentUsage(companyId: string) {
    const today = new Date().toISOString().split('T')[0]
    
    const { data: metrics, error } = await this.supabase
      .from('USAGE_METRICS')
      .select('*')
      .eq('company_id', companyId)
      .eq('metric_date', today)

    if (error) {
      throw new Error(`Failed to fetch usage metrics: ${error.message}`)
    }

    // If no metrics for today, return zero values
    const defaultMetrics = ['conversations', 'messages', 'users', 'storage_mb', 'api_calls']
    const result = defaultMetrics.map(type => {
      const metric = metrics?.find(m => m.metric_type === type)
      return {
        metric_type: type,
        current_value: metric?.current_value || 0,
        monthly_total: metric?.monthly_total || 0,
        daily_increment: metric?.daily_increment || 0
      }
    })

    return result
  }

  async incrementUsage(companyId: string, metricType: string, increment: number = 1) {
    const today = new Date().toISOString().split('T')[0]
    
    // Upsert usage metric for today
    const { error } = await this.supabase
      .rpc('increment_usage_metric', {
        p_company_id: companyId,
        p_metric_type: metricType,
        p_metric_date: today,
        p_increment: increment
      })

    if (error) {
      throw new Error(`Failed to increment usage: ${error.message}`)
    }

    return { success: true }
  }

  async checkUsageLimits(companyId: string, metricType: string): Promise<{ exceeded: boolean, limit: number, current: number }> {
    // Get current subscription and limits
    const { data: subscription } = await this.supabase
      .from('COMPANY_SUBSCRIPTIONS')
      .select(`
        plan_id,
        SUBSCRIPTION_LIMITS!inner(*)
      `)
      .eq('company_id', companyId)
      .eq('SUBSCRIPTION_LIMITS.metric_type', metricType)
      .in('status', ['active', 'trialing'])
      .single()

    if (!subscription) {
      return { exceeded: false, limit: 0, current: 0 }
    }

    const limit = subscription.SUBSCRIPTION_LIMITS[0]
    const usage = await this.getCurrentUsage(companyId)
    const currentMetric = usage.find(u => u.metric_type === metricType)
    const currentValue = currentMetric?.monthly_total || 0

    return {
      exceeded: limit.is_hard_limit && currentValue >= limit.limit_value,
      limit: limit.limit_value,
      current: currentValue
    }
  }
}
```

### Payment Provider Service Implementation
```typescript
// lib/services/payment-provider-service.ts
// Abstract payment provider service - implementación específica por definir

export interface PaymentProviderConfig {
  provider: 'stripe' | 'paypal' | 'mercadopago' | 'custom'
  apiKey: string
  webhookSecret: string
}

export interface CustomerData {
  name: string
  email: string
}

export interface SubscriptionData {
  customer_id: string
  plan_id: string
  billing_interval: 'monthly' | 'yearly'
  payment_method_id?: string
}

export interface ProviderSubscription {
  id: string
  status: 'active' | 'trialing' | 'incomplete' | 'canceled'
  client_secret?: string
  redirect_url?: string
}

export class PaymentProviderService {
  private config: PaymentProviderConfig

  constructor(config?: PaymentProviderConfig) {
    this.config = config || {
      provider: 'custom',
      apiKey: process.env.PAYMENT_PROVIDER_API_KEY || '',
      webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || ''
    }
  }

  async createCustomer(params: CustomerData): Promise<{ id: string }> {
    // TODO: Implementar según el proveedor seleccionado
    // Por ahora retorna mock data
    return {
      id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  async createSubscription(params: SubscriptionData): Promise<ProviderSubscription> {
    // TODO: Implementar según el proveedor seleccionado
    // Por ahora retorna mock data
    return {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: params.payment_method_id ? 'active' : 'incomplete',
      client_secret: params.payment_method_id ? undefined : `pi_${Math.random().toString(36).substr(2, 9)}`,
      redirect_url: params.payment_method_id ? undefined : '/payment/confirm'
    }
  }

  async cancelSubscription(subscriptionId: string, options: { at_period_end?: boolean } = {}): Promise<void> {
    // TODO: Implementar según el proveedor seleccionado
    console.log(`Canceling subscription ${subscriptionId}, at_period_end: ${options.at_period_end}`)
  }

  async retrieveInvoice(invoiceId: string): Promise<any> {
    // TODO: Implementar según el proveedor seleccionado
    return {
      id: invoiceId,
      status: 'paid',
      amount: 2900,
      currency: 'usd'
    }
  }

  // Factory method para crear instancia según proveedor
  static create(provider: PaymentProviderConfig['provider']): PaymentProviderService {
    const config: PaymentProviderConfig = {
      provider,
      apiKey: process.env[`${provider.toUpperCase()}_API_KEY`] || '',
      webhookSecret: process.env[`${provider.toUpperCase()}_WEBHOOK_SECRET`] || ''
    }
    
    return new PaymentProviderService(config)
  }
}
```

## Validation Schemas
```typescript
// lib/validations/billing.ts
import { z } from 'zod'

export const createSubscriptionSchema = z.object({
  plan_id: z.string().uuid('Invalid plan ID'),
  billing_interval: z.enum(['monthly', 'yearly']),
  payment_method_id: z.string().optional(),
  trial_days: z.number().min(0).max(30).optional()
})

export const usageQuerySchema = z.object({
  from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  metric_type: z.enum(['conversations', 'messages', 'users', 'storage_mb', 'api_calls']).optional()
})

export const invoicesQuerySchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
})
```

## Database Functions
```sql
-- Function to atomically increment usage metrics
CREATE OR REPLACE FUNCTION increment_usage_metric(
  p_company_id UUID,
  p_metric_type usage_metric_type,
  p_metric_date DATE,
  p_increment INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO USAGE_METRICS (company_id, metric_type, metric_date, current_value, daily_increment, monthly_total)
  VALUES (p_company_id, p_metric_type, p_metric_date, p_increment, p_increment, p_increment)
  ON CONFLICT (company_id, metric_type, metric_date)
  DO UPDATE SET 
    current_value = USAGE_METRICS.current_value + p_increment,
    daily_increment = USAGE_METRICS.daily_increment + p_increment,
    monthly_total = USAGE_METRICS.monthly_total + p_increment,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Testing Strategy
```typescript
// __tests__/api/billing/subscription.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/billing/subscription/route'

describe('/api/billing/subscription', () => {
  it('should return current subscription for authenticated user', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-jwt-token'
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.data).toHaveProperty('id')
    expect(data.data).toHaveProperty('plan')
    expect(data.data).toHaveProperty('usage')
  })

  it('should require authentication', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(401)
  })

  it('should enforce RBAC permissions', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer operador-jwt-token'
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(403)
  })
})
```

## Error Handling Strategy
```typescript
// Consistent error responses across all billing endpoints
export class BillingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'BillingError'
  }
}

export const handleBillingError = (error: any) => {
  if (error instanceof BillingError) {
    return NextResponse.json(
      { 
        error: error.message, 
        code: error.code,
        details: error.details 
      },
      { status: error.statusCode }
    )
  }

  console.error('Unexpected billing error:', error)
  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
}
```

## Webhook Implementation
```typescript
// app/api/billing/webhooks/payment/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/service'
import { PaymentProviderService } from '@/lib/services/payment-provider-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('webhook-signature')!
    
    // TODO: Implementar verificación de webhook según proveedor seleccionado
    const event = await verifyWebhookSignature(body, signature)

    switch (event.type) {
      case 'payment.succeeded':
        await handlePaymentSucceeded(event.data)
        break
      case 'payment.failed':
        await handlePaymentFailed(event.data)
        break
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data)
        break
      case 'subscription.deleted':
        await handleSubscriptionDeleted(event.data)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}

async function verifyWebhookSignature(body: string, signature: string) {
  // TODO: Implementar verificación específica del proveedor
  // Por ahora retorna mock event
  return {
    type: 'payment.succeeded',
    data: JSON.parse(body)
  }
}

async function handlePaymentSucceeded(data: any) {
  const supabase = createClient()
  
  // Update billing record
  await supabase
    .from('BILLING_RECORDS')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString()
    })
    .eq('payment_provider_invoice_id', data.invoice_id)
}
```

## Performance Optimizations
```typescript
// Caching strategy for frequently accessed data
import { cache } from 'react'

export const getCachedSubscriptionPlans = cache(async () => {
  const supabase = createClient()
  const { data: plans } = await supabase
    .from('SUBSCRIPTION_PLANS')
    .select(`
      *,
      SUBSCRIPTION_LIMITS(*)
    `)
    .eq('is_active', true)
    .eq('is_public', true)
    .order('sort_order')

  return plans
})

// Usage metrics with Redis caching for high-traffic scenarios
export const getCachedUsageMetrics = async (companyId: string) => {
  const cacheKey = `usage:${companyId}:${new Date().toISOString().split('T')[0]}`
  
  // Try Redis first
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  // Fallback to database
  const usageService = new UsageService(supabase)
  const metrics = await usageService.getCurrentUsage(companyId)
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(metrics))
  
  return metrics
}
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- API endpoints: 13 billing endpoints implementados con Stripe integration
- Services created: BillingService, StripeService, UsageService
- RBAC enforcement: owner/admin para billing, supervisor para usage metrics
- Next frontend task: TASK-P1E5-05c (Plans pricing UI)
- Stripe integration: webhooks, subscriptions, invoices configurados
- Usage tracking: atomic increments, limit checking implementado
```

---
*API task para implementar sistema completo de billing y subscription management con Stripe*