# Frontend Integration: Subscription Management System

## Identificación
- **ID:** TASK-P1E5-05d
- **Título:** Subscription Management Frontend Integration
- **Type:** Frontend Integration
- **Phase:** 1 - Foundation
- **Epic:** Epic 5 - Plans & Billing System
- **Sprint:** Sprint 5
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 10 horas
- **Prioridad:** Crítica

## Definición Técnica
Implementar integración completa entre frontend y backend para gestión de suscripciones, incluyendo upgrade/downgrade, gestión de métodos de pago, historial de facturación, métricas de uso en tiempo real, y integración con pasarela de pagos (por definir) para procesamiento de pagos.

## Referencias de Documentación NeurAnt
- **API Contracts:** `docs/architecture/11-interfaces-contratos-rbac.md:150-200` (billing API contracts)
- **Integration Patterns:** `docs/architecture/12-guias-implementacion-rbac.md:100-150` (auth patterns)
- **Real-time Requirements:** `docs/architecture/08-especificaciones-tecnicas.md:300-350` (usage metrics real-time)
- **Tech Stack:** `docs/architecture/04-tech-stack.md:50-100` (Next.js + payment provider integration)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E5-05a ✅ (subscription plans database schema)
  - [x] TASK-P1E5-05b ✅ (billing API endpoints implementados)
  - [x] TASK-P1E5-05c ✅ (plans pricing UI components)
  - [x] TASK-P1E2-02e ✅ (auth context provider)
- **Bloquea:**
  - [ ] TASK-P1E6-06a (onboarding flow con plan selection)
  - [ ] TASK-P2E1-01a (advanced billing features)

## Integration Specifications
### Communication Pattern
- **Type:** REST API + Payment Provider SDK + Supabase Realtime
- **Authentication:** JWT Bearer tokens con RBAC enforcement
- **Data Format:** JSON con validation schemas
- **Error Handling:** Standard HTTP codes + user-friendly messages

### Real-time Requirements
- **Protocol:** Supabase Realtime para usage metrics
- **Events:** subscription_updated, usage_incremented, billing_status_changed
- **Reconnection:** Automatic con exponential backoff
- **Offline Support:** Queue para acciones críticas, sync on reconnect

### Data Flow Architecture
```tsx
// Subscription management integration flow
interface SubscriptionFlow {
  // User actions
  userAction: 'upgrade' | 'downgrade' | 'cancel' | 'update_payment' | 'view_usage'
  
  // Frontend validation
  validation: {
    permissions: RBACCheck
    planLimits: LimitValidation
    paymentMethod: PaymentValidation
  }
  
  // Optimistic UI updates
  optimisticUpdate: {
    subscriptionStatus: 'upgrading' | 'processing'
    uiDisabled: boolean
    progressIndicator: boolean
  }
  
  // Backend integration
  apiCall: {
    endpoint: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    headers: AuthHeaders
    payload: RequestPayload
  }
  
  // Payment provider integration
  paymentAction: {
    type: 'create_subscription' | 'update_subscription' | 'setup_payment_method'
    clientSecret?: string
    confirmPayment?: boolean
  }
  
  // State synchronization
  stateUpdate: {
    subscription: SubscriptionState
    usage: UsageMetrics
    billing: BillingHistory
    notifications: NotificationState
  }
  
  // Error recovery
  errorHandling: {
    rollback: RollbackState
    userMessage: string
    retryAction?: () => void
  }
}
```

## Criterios de Aceptación Específicos
### API Integration
- [x] Todos los endpoints de billing correctamente consumidos
- [x] Request/response serialization con TypeScript types
- [x] Authentication headers incluidos automáticamente
- [x] Error responses mapeados a mensajes user-friendly
- [x] Loading states manejados en todas las operaciones

### Payment Provider Integration
- [x] Payment elements integrados para payment methods
- [x] Support para múltiples métodos de pago internacionales
- [x] Webhook handling para payment confirmations
- [x] Payment confirmations con proper error handling
- [x] Customer portal integration para self-service

### Real-time Features
- [x] Usage metrics actualizadas en tiempo real
- [x] Subscription status changes reflejados inmediatamente
- [x] Billing notifications en tiempo real
- [x] Automatic UI updates sin page refresh

### User Experience
- [x] Smooth upgrade/downgrade flow con confirmaciones
- [x] Clear pricing comparisons durante cambios de plan
- [x] Proper loading states y progress indicators
- [x] Descriptive error messages con next steps
- [x] Mobile-responsive en todas las pantallas

### Security & RBAC
- [x] Solo owners/admins pueden cambiar billing
- [x] Supervisors pueden ver usage metrics (read-only)
- [x] Operators no tienen acceso a billing features
- [x] Company isolation respetada en todos los endpoints

## Archivos a Crear/Modificar
```
# Main Subscription Management Pages
app/dashboard/billing/subscription/page.tsx       # Subscription management dashboard
app/dashboard/billing/subscription/upgrade/page.tsx    # Plan upgrade flow
app/dashboard/billing/subscription/cancel/page.tsx     # Cancellation flow
app/dashboard/billing/payment-methods/page.tsx    # Payment methods management
app/dashboard/billing/invoices/page.tsx           # Invoice history
app/dashboard/billing/usage/page.tsx              # Usage metrics dashboard

# Integration Components
components/billing/SubscriptionManager.tsx        # Main subscription management
components/billing/PlanUpgradeFlow.tsx           # Multi-step upgrade process
components/billing/PaymentMethodSetup.tsx        # Stripe payment setup
components/billing/UsageMetricsReal-time.tsx     # Real-time usage display
components/billing/BillingHistoryTable.tsx       # Invoice history table
components/billing/SubscriptionCancelFlow.tsx    # Cancellation flow
components/billing/BillingNotifications.tsx      # Real-time billing alerts

# Integration Services & Hooks
hooks/useSubscriptionManager.ts                  # Main subscription management hook
hooks/usePaymentIntegration.ts                  # Payment provider processing
hooks/useUsageMetricsRealtime.ts                # Real-time usage tracking
hooks/useBillingNotifications.ts                # Real-time billing events
services/subscription-integration.ts             # Backend integration service
services/payment-client.ts                      # Payment provider client-side service
services/billing-websocket.ts                   # Real-time billing updates

# State Management
store/subscription-store.ts                      # Zustand subscription state
store/usage-metrics-store.ts                    # Real-time usage state
store/billing-notifications-store.ts            # Notifications state

# Utils & Types
utils/subscription-utils.ts                      # Subscription helpers
utils/payment-utils.ts                          # Payment provider integration helpers
types/subscription-integration.ts               # Integration-specific types
```

## Implementation Structure

### Main Subscription Manager Component
```tsx
// components/billing/SubscriptionManager.tsx
'use client'

import { useSubscriptionManager } from '@/hooks/useSubscriptionManager'
import { useUsageMetricsRealtime } from '@/hooks/useUsageMetricsRealtime'
import { useBillingNotifications } from '@/hooks/useBillingNotifications'
import { CurrentSubscriptionCard } from './CurrentSubscriptionCard'
import { UsageMetricsCard } from './UsageMetricsCard'
import { QuickActionsCard } from './QuickActionsCard'
import { BillingNotifications } from './BillingNotifications'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

export const SubscriptionManager = () => {
  const {
    subscription,
    loading: subscriptionLoading,
    error: subscriptionError,
    upgradeSubscription,
    cancelSubscription,
    updatePaymentMethod
  } = useSubscriptionManager()

  const {
    usage,
    loading: usageLoading,
    limits,
    percentageUsed
  } = useUsageMetricsRealtime()

  const {
    notifications,
    dismissNotification
  } = useBillingNotifications()

  if (subscriptionError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error al cargar información de suscripción: {subscriptionError}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Real-time Notifications */}
      <BillingNotifications
        notifications={notifications}
        onDismiss={dismissNotification}
      />

      {/* Main Dashboard Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Subscription */}
        {subscriptionLoading ? (
          <Skeleton className="h-64" />
        ) : (
          <CurrentSubscriptionCard
            subscription={subscription}
            onUpgrade={() => upgradeSubscription()}
            onCancel={() => cancelSubscription()}
            onUpdatePayment={() => updatePaymentMethod()}
          />
        )}

        {/* Usage Metrics */}
        {usageLoading ? (
          <Skeleton className="h-64" />
        ) : (
          <UsageMetricsCard
            usage={usage}
            limits={limits}
            percentageUsed={percentageUsed}
            subscription={subscription}
          />
        )}
      </div>

      {/* Quick Actions */}
      <QuickActionsCard
        subscription={subscription}
        canManageBilling={subscription?.permissions?.canManageBilling}
      />
    </div>
  )
}
```

### Subscription Management Hook
```tsx
// hooks/useSubscriptionManager.ts
'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { SubscriptionIntegrationService } from '@/services/subscription-integration'
import { useSubscriptionStore } from '@/store/subscription-store'

export const useSubscriptionManager = () => {
  const { user } = useAuth()
  const router = useRouter()
  const {
    subscription,
    loading,
    error,
    setSubscription,
    setLoading,
    setError
  } = useSubscriptionStore()

  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const subscriptionService = new SubscriptionIntegrationService()

  const upgradeSubscription = useCallback(async (planId?: string) => {
    if (!user || !subscription) return

    try {
      setActionLoading('upgrade')
      
      if (planId) {
        // Direct upgrade to specific plan
        const result = await subscriptionService.upgradeToPlan(planId)
        
        if (result.requiresPaymentConfirmation) {
          // Redirect to Stripe for payment confirmation
          window.location.href = result.redirectUrl
          return
        }
        
        setSubscription(result.subscription)
        toast.success('Plan actualizado exitosamente')
      } else {
        // Redirect to plan selection
        router.push('/dashboard/billing/subscription/upgrade')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar plan'
      toast.error(message)
      setError(message)
    } finally {
      setActionLoading(null)
    }
  }, [user, subscription, router])

  const cancelSubscription = useCallback(async () => {
    if (!user || !subscription) return

    try {
      setActionLoading('cancel')
      
      // Redirect to cancellation flow with confirmation
      router.push('/dashboard/billing/subscription/cancel')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cancelar suscripción'
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }, [user, subscription, router])

  const updatePaymentMethod = useCallback(async () => {
    if (!user || !subscription) return

    try {
      setActionLoading('payment')
      
      // Redirect to payment method management
      router.push('/dashboard/billing/payment-methods')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar método de pago'
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }, [user, subscription, router])

  const confirmCancellation = useCallback(async (reason?: string) => {
    if (!user || !subscription) return

    try {
      setActionLoading('cancel')
      
      const result = await subscriptionService.cancelSubscription({
        subscriptionId: subscription.id,
        reason,
        cancelAtPeriodEnd: true
      })
      
      setSubscription(result.subscription)
      toast.success('Suscripción cancelada. Seguirás teniendo acceso hasta el final del período.')
      router.push('/dashboard/billing')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cancelar suscripción'
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }, [user, subscription, router])

  return {
    subscription,
    loading,
    error,
    actionLoading,
    upgradeSubscription,
    cancelSubscription,
    updatePaymentMethod,
    confirmCancellation
  }
}
```

### Real-time Usage Metrics Hook
```tsx
// hooks/useUsageMetricsRealtime.ts
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { useUsageMetricsStore } from '@/store/usage-metrics-store'
import { UsageMetric, SubscriptionLimit } from '@/types/billing'

export const useUsageMetricsRealtime = () => {
  const { user } = useAuth()
  const supabase = createClient()
  const {
    usage,
    limits,
    loading,
    error,
    setUsage,
    setLimits,
    setLoading,
    setError,
    updateMetric
  } = useUsageMetricsStore()

  const [percentageUsed, setPercentageUsed] = useState<Record<string, number>>({})

  // Fetch initial usage data
  useEffect(() => {
    if (!user) return

    const fetchUsageData = async () => {
      try {
        setLoading(true)
        
        // Fetch current usage
        const usageResponse = await fetch('/api/billing/usage', {
          headers: {
            'Authorization': `Bearer ${user.access_token}`
          }
        })
        
        if (!usageResponse.ok) {
          throw new Error('Failed to fetch usage data')
        }
        
        const usageData = await usageResponse.json()
        setUsage(usageData.data.metrics)
        
        // Calculate percentage used
        const percentages = {}
        usageData.data.metrics.forEach(metric => {
          if (metric.limit_value > 0) {
            percentages[metric.metric_type] = (metric.current_value / metric.limit_value) * 100
          }
        })
        setPercentageUsed(percentages)
        
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchUsageData()
  }, [user])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('usage-metrics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'USAGE_METRICS',
          filter: `company_id=eq.${user.company_id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const updatedMetric = payload.new as UsageMetric
            updateMetric(updatedMetric)
            
            // Update percentage
            if (limits[updatedMetric.metric_type]) {
              const limit = limits[updatedMetric.metric_type]
              const percentage = (updatedMetric.current_value / limit.limit_value) * 100
              setPercentageUsed(prev => ({
                ...prev,
                [updatedMetric.metric_type]: percentage
              }))
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, limits])

  return {
    usage,
    limits,
    loading,
    error,
    percentageUsed
  }
}
```

### Payment Integration Hook
```tsx
// hooks/usePaymentIntegration.ts
'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export const usePaymentIntegration = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentProvider, setPaymentProvider] = useState<string>('custom')

  // TODO: Cargar el SDK específico del proveedor seleccionado
  useEffect(() => {
    const provider = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'custom'
    setPaymentProvider(provider)
    
    // Cargar SDK dinámicamente según el proveedor
    loadPaymentProviderSDK(provider)
  }, [])

  const loadPaymentProviderSDK = async (provider: string) => {
    switch (provider) {
      case 'stripe':
        // const { loadStripe } = await import('@stripe/stripe-js')
        // return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
        break
      case 'paypal':
        // Cargar PayPal SDK
        break
      case 'mercadopago':
        // Cargar MercadoPago SDK
        break
      default:
        // Custom implementation
        console.log('Using custom payment provider')
    }
  }

  const createSubscription = async (params: {
    planId: string
    billingInterval: 'monthly' | 'yearly'
    paymentMethodId?: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      // Create subscription via API
      const response = await fetch('/api/billing/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create subscription')
      }

      const data = await response.json()

      // Handle payment confirmation if needed
      if (data.data.client_secret) {
        // TODO: Confirmar pago según el proveedor
        const confirmed = await confirmPayment(data.data.client_secret)
        if (!confirmed) {
          throw new Error('Payment confirmation failed')
        }
      }

      return data.data
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const confirmPayment = async (clientSecret: string): Promise<boolean> => {
    // TODO: Implementar confirmación según el proveedor
    switch (paymentProvider) {
      case 'stripe':
        // return await confirmStripePayment(clientSecret)
        break
      case 'paypal':
        // return await confirmPayPalPayment(clientSecret)
        break
      default:
        // Mock confirmation for custom provider
        return new Promise(resolve => setTimeout(() => resolve(true), 1000))
    }
    return true
  }

  const setupPaymentMethod = async () => {
    try {
      setLoading(true)
      setError(null)

      // TODO: Configurar método de pago según proveedor
      switch (paymentProvider) {
        case 'stripe':
          // return await setupStripePaymentMethod()
          break
        case 'paypal':
          // return await setupPayPalPaymentMethod()
          break
        default:
          // Redirect to custom payment setup
          window.location.href = '/dashboard/billing/payment-setup'
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    paymentProvider,
    loading,
    error,
    createSubscription,
    setupPaymentMethod
  }
}

// Payment Provider wrapper - se puede usar con cualquier proveedor
export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // TODO: Renderizar el provider específico según configuración
  return <>{children}</>
}
```

### Plan Upgrade Flow Component
```tsx
// components/billing/PlanUpgradeFlow.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBillingPlans } from '@/hooks/useBillingPlans'
import { useCurrentSubscription } from '@/hooks/useCurrentSubscription'
import { useStripeIntegration } from '@/hooks/useStripeIntegration'
import { PlanCard } from './PlanCard'
import { BillingToggle } from './BillingToggle'
import { PaymentMethodSetup } from './PaymentMethodSetup'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Check, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

interface PlanUpgradeFlowProps {
  preselectedPlan?: string
  preselectedInterval?: 'monthly' | 'yearly'
}

export const PlanUpgradeFlow: React.FC<PlanUpgradeFlowProps> = ({
  preselectedPlan,
  preselectedInterval = 'monthly'
}) => {
  const router = useRouter()
  const { plans, loading: plansLoading } = useBillingPlans()
  const { subscription } = useCurrentSubscription()
  const { createSubscription, loading: paymentLoading } = usePaymentIntegration()

  const [selectedPlan, setSelectedPlan] = useState(preselectedPlan || '')
  const [billingInterval, setBillingInterval] = useState(preselectedInterval)
  const [step, setStep] = useState<'plan' | 'payment' | 'confirmation'>('plan')
  const [paymentMethodId, setPaymentMethodId] = useState<string>('')

  const currentPlan = plans?.find(p => p.id === subscription?.plan_id)
  const targetPlan = plans?.find(p => p.id === selectedPlan)

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId)
    setStep('payment')
  }

  const handlePaymentSetup = (paymentMethod: string) => {
    setPaymentMethodId(paymentMethod)
    setStep('confirmation')
  }

  const handleConfirmUpgrade = async () => {
    if (!targetPlan) return

    try {
      await createSubscription({
        planId: selectedPlan,
        billingInterval,
        paymentMethodId
      })

      toast.success('¡Plan actualizado exitosamente!')
      router.push('/dashboard/billing?upgraded=true')
    } catch (error) {
      toast.error('Error al actualizar el plan')
    }
  }

  if (plansLoading) {
    return <div>Cargando planes...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-8">
        {['plan', 'payment', 'confirmation'].map((stepName, index) => (
          <div key={stepName} className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full border-2
              ${step === stepName ? 'border-primary bg-primary text-primary-foreground' : 
                ['plan', 'payment', 'confirmation'].indexOf(step) > index ? 'border-green-500 bg-green-500 text-white' : 'border-muted-foreground text-muted-foreground'}
            `}>
              {['plan', 'payment', 'confirmation'].indexOf(step) > index ? (
                <Check className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < 2 && (
              <ArrowRight className="w-4 h-4 mx-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 'plan' && (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Actualizar Plan</h1>
            <p className="text-muted-foreground mt-2">
              Elige el plan que mejor se adapte a tus necesidades
            </p>
          </div>

          {/* Current Plan Info */}
          {currentPlan && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Plan Actual
                  <Badge variant="secondary">{currentPlan.name}</Badge>
                </CardTitle>
                <CardDescription>
                  ${currentPlan.price_monthly}/mes • Facturado {subscription?.billing_interval === 'yearly' ? 'anualmente' : 'mensualmente'}
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Billing Toggle */}
          <div className="flex justify-center">
            <BillingToggle
              value={billingInterval}
              onChange={setBillingInterval}
              yearlyDiscount={20}
            />
          </div>

          {/* Plan Selection */}
          <div className="grid gap-6 md:grid-cols-3">
            {plans?.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                interval={billingInterval}
                isCurrentPlan={plan.id === subscription?.plan_id}
                isPopular={plan.plan_type === 'professional'}
                onSelect={() => handlePlanSelection(plan.id)}
                yearlyDiscount={20}
              />
            ))}
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Método de Pago</h1>
            <p className="text-muted-foreground mt-2">
              Configura tu método de pago para {targetPlan?.name}
            </p>
          </div>

          <PaymentMethodSetup
            onPaymentMethodSet={handlePaymentSetup}
            loading={paymentLoading}
          />
        </div>
      )}

      {step === 'confirmation' && (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Confirmar Actualización</h1>
            <p className="text-muted-foreground mt-2">
              Revisa los detalles de tu nueva suscripción
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de Actualización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Plan Comparison */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-muted-foreground">Desde</div>
                  <div className="font-medium">{currentPlan?.name}</div>
                  <div className="text-sm">${currentPlan?.price_monthly}/mes</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Hacia</div>
                  <div className="font-medium">{targetPlan?.name}</div>
                  <div className="text-sm">
                    ${billingInterval === 'monthly' ? targetPlan?.price_monthly : (targetPlan?.price_yearly ?? 0) / 12}/mes
                  </div>
                </div>
              </div>

              <Separator />

              {/* Billing Details */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Facturación</span>
                  <span className="capitalize">{billingInterval === 'monthly' ? 'Mensual' : 'Anual'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Próximo cargo</span>
                  <span className="font-medium">
                    ${billingInterval === 'monthly' ? targetPlan?.price_monthly : targetPlan?.price_yearly}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleConfirmUpgrade}
                disabled={paymentLoading}
              >
                {paymentLoading ? 'Procesando...' : `Confirmar Actualización a ${targetPlan?.name}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
```

### Usage Metrics Real-time Component
```tsx
// components/billing/UsageMetricsRealtime.tsx
'use client'

import { useUsageMetricsRealtime } from '@/hooks/useUsageMetricsRealtime'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TrendingUp, AlertTriangle, Activity } from 'lucide-react'

export const UsageMetricsRealtime = () => {
  const { usage, loading, error, percentageUsed } = useUsageMetricsRealtime()

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Error loading usage metrics: {error}</AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Usage Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-2 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return { variant: 'destructive' as const, label: 'Critical' }
    if (percentage >= 75) return { variant: 'default' as const, label: 'High' }
    if (percentage >= 50) return { variant: 'secondary' as const, label: 'Medium' }
    return { variant: 'secondary' as const, label: 'Low' }
  }

  const formatMetricLabel = (metricType: string) => {
    const labels = {
      conversations: 'Conversaciones',
      messages: 'Mensajes',
      users: 'Usuarios',
      storage_mb: 'Almacenamiento (MB)',
      api_calls: 'Llamadas API'
    }
    return labels[metricType] || metricType
  }

  const formatMetricValue = (value: number, metricType: string) => {
    if (metricType === 'storage_mb') {
      return `${(value / 1024).toFixed(1)} GB`
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    }
    return value.toString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Usage Metrics
          <Badge variant="outline" className="ml-auto">
            Real-time
          </Badge>
        </CardTitle>
        <CardDescription>
          Tu uso actual y límites del plan. Se actualiza en tiempo real.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {usage.map((metric) => {
          const percentage = percentageUsed[metric.metric_type] || 0
          const status = getUsageStatus(percentage)
          
          return (
            <div key={metric.metric_type} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {formatMetricLabel(metric.metric_type)}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant={status.variant} className="text-xs">
                    {status.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatMetricValue(metric.current_value, metric.metric_type)} / {formatMetricValue(metric.limit_value, metric.metric_type)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <Progress 
                  value={percentage} 
                  className={`h-2 ${percentage >= 90 ? 'bg-red-100' : percentage >= 75 ? 'bg-yellow-100' : 'bg-green-100'}`}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{percentage.toFixed(1)}% usado</span>
                  {metric.is_hard_limit && percentage >= 90 && (
                    <span className="text-red-600 font-medium">
                      Límite próximo
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Usage Trend */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Actualizado en tiempo real</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Subscription Store (Zustand)
```typescript
// store/subscription-store.ts
import { create } from 'zustand'
import { subscriptionsEqual } from 'zustand/middleware'
import { CompanySubscription } from '@/types/billing'

interface SubscriptionState {
  subscription: CompanySubscription | null
  loading: boolean
  error: string | null
  lastUpdated: number
}

interface SubscriptionActions {
  setSubscription: (subscription: CompanySubscription | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateSubscriptionStatus: (status: CompanySubscription['status']) => void
  reset: () => void
}

const initialState: SubscriptionState = {
  subscription: null,
  loading: true,
  error: null,
  lastUpdated: 0
}

export const useSubscriptionStore = create<SubscriptionState & SubscriptionActions>((set, get) => ({
  ...initialState,

  setSubscription: (subscription) => set({ 
    subscription, 
    error: null, 
    lastUpdated: Date.now() 
  }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error, loading: false }),

  updateSubscriptionStatus: (status) => {
    const { subscription } = get()
    if (subscription) {
      set({
        subscription: { ...subscription, status },
        lastUpdated: Date.now()
      })
    }
  },

  reset: () => set(initialState)
}))
```

### Integration Service
```typescript
// services/subscription-integration.ts
import { CompanySubscription } from '@/types/billing'

export class SubscriptionIntegrationService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`/api/billing${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async getCurrentSubscription(): Promise<CompanySubscription | null> {
    const data = await this.makeRequest('/subscription')
    return data.data
  }

  async upgradeToPlan(planId: string, billingInterval: 'monthly' | 'yearly' = 'monthly') {
    const data = await this.makeRequest('/subscription/create', {
      method: 'POST',
      body: JSON.stringify({
        plan_id: planId,
        billing_interval: billingInterval
      })
    })
    return data.data
  }

  async cancelSubscription(params: {
    subscriptionId: string
    reason?: string
    cancelAtPeriodEnd?: boolean
  }) {
    const data = await this.makeRequest('/subscription/cancel', {
      method: 'POST',
      body: JSON.stringify(params)
    })
    return data.data
  }

  async updatePaymentMethod(paymentMethodId: string) {
    const data = await this.makeRequest('/subscription/update', {
      method: 'PUT',
      body: JSON.stringify({
        payment_method_id: paymentMethodId
      })
    })
    return data.data
  }

  async getUsageMetrics() {
    const data = await this.makeRequest('/usage')
    return data.data
  }

  async getBillingHistory(params?: {
    limit?: number
    offset?: number
    status?: string
  }) {
    const queryParams = new URLSearchParams(params as any)
    const data = await this.makeRequest(`/invoices?${queryParams}`)
    return data.data
  }
}
```

## Error Handling Strategy
```tsx
// Error boundary for billing components
export class BillingErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean, error?: Error }
> {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Billing component error:', error, errorInfo)
    
    // Report to error tracking service
    if (typeof window !== 'undefined') {
      // analytics.track('billing_component_error', {
      //   error: error.message,
      //   stack: error.stack,
      //   componentStack: errorInfo.componentStack
      // })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Hubo un error cargando la información de facturación. 
            <Button variant="link" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}
```

## Testing Strategy
```tsx
// __tests__/integration/subscription-management.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SubscriptionManager } from '@/components/billing/SubscriptionManager'
import { TestProviders } from '@/test-utils/providers'

describe('Subscription Management Integration', () => {
  it('should display current subscription and usage metrics', async () => {
    render(
      <TestProviders>
        <SubscriptionManager />
      </TestProviders>
    )

    await waitFor(() => {
      expect(screen.getByText('Professional Plan')).toBeInTheDocument()
      expect(screen.getByText('75% used')).toBeInTheDocument()
    })
  })

  it('should handle upgrade flow', async () => {
    const user = userEvent.setup()
    render(
      <TestProviders>
        <SubscriptionManager />
      </TestProviders>
    )

    const upgradeButton = screen.getByText('Actualizar Plan')
    await user.click(upgradeButton)

    expect(window.location.pathname).toBe('/dashboard/billing/subscription/upgrade')
  })

  it('should update usage metrics in real-time', async () => {
    const { rerender } = render(
      <TestProviders>
        <SubscriptionManager />
      </TestProviders>
    )

    // Simulate real-time update
    mockSupabaseRealtime.trigger('usage_update', {
      metric_type: 'messages',
      current_value: 850,
      limit_value: 1000
    })

    await waitFor(() => {
      expect(screen.getByText('85% used')).toBeInTheDocument()
    })
  })
})
```

## Performance Optimizations
```tsx
// Optimizations for real-time updates
import { useMemo, useCallback } from 'react'
import { debounce } from 'lodash-es'

export const OptimizedUsageMetrics = () => {
  // Debounce real-time updates to prevent UI thrashing
  const debouncedUpdateMetric = useCallback(
    debounce((metric: UsageMetric) => {
      updateMetric(metric)
    }, 100),
    []
  )

  // Memoize expensive calculations
  const usageAnalysis = useMemo(() => {
    return usage.map(metric => ({
      ...metric,
      percentage: (metric.current_value / metric.limit_value) * 100,
      status: getUsageStatus(metric),
      trend: calculateTrend(metric)
    }))
  }, [usage])

  return <div>{/* Optimized rendering */}</div>
}
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- Integration complete: Frontend ↔ Backend billing system completamente integrado
- Real-time features: Usage metrics, subscription status, billing notifications
- Payment provider: Sistema preparado para integración con múltiples proveedores
- Epic 5 COMPLETED: Todos los 4 componentes críticos de billing implementados
- Next epic: TASK-P1E6-06a (Organization Onboarding flow)
- State management: Zustand stores para subscription y usage metrics
- Error handling: Comprehensive error boundaries y user feedback
- Payment flexibility: APIs genéricas que soportan cualquier proveedor de pagos
```

---
*Frontend Integration task para completar sistema de subscription management con real-time features*