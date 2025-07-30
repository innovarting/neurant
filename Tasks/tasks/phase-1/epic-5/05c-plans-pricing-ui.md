# Frontend UI: Plans & Pricing Pages

## Identificación
- **ID:** TASK-P1E5-05c
- **Título:** Plans & Pricing UI Components
- **Type:** Frontend UI
- **Phase:** 1 - Foundation
- **Epic:** Epic 5 - Plans & Billing System
- **Sprint:** Sprint 5
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 8 horas
- **Prioridad:** Crítica

## Definición Técnica
Implementar interfaz completa de planes y pricing con componentes reutilizables. Incluye página pública de pricing, comparador de planes, selector de billing interval (monthly/yearly), y CTA para upgrade. Responsive design con dark/light mode support.

## Referencias de Documentación NeurAnt
- **UI/UX Requirements:** `docs/architecture/08-especificaciones-tecnicas.md:200-250` (pricing page design)
- **Component Specs:** `docs/architecture/11-interfaces-contratos-rbac.md:150-200` (billing interfaces)
- **User Flow:** `docs/architecture/05-implementation-roadmap.md:180-220` (onboarding flow)
- **Tech Stack:** `docs/architecture/04-tech-stack.md:50-100` (Next.js + shadcn/ui)

## Referencias de Diseño Visual (GUIA_DISENO_VISUAL_NEURANT.md)
- **Cards y Layouts:** `GUIA_DISENO_VISUAL_NEURANT.md:698-738` (Dashboard Analytics - Cards para planes)
- **Formularios:** `GUIA_DISENO_VISUAL_NEURANT.md:277-342` (Input Fields, Labels, Validación para billing)
- **Botones:** `GUIA_DISENO_VISUAL_NEURANT.md:223-275` (Botón Primario para upgrade, Secundario para cambios)
- **Estados y Feedback:** `GUIA_DISENO_VISUAL_NEURANT.md:472-532` (Loading States, Toast para confirmaciones de pago)
- **Tipografía:** `GUIA_DISENO_VISUAL_NEURANT.md:116-149` (Jerarquías para pricing, testimonials)
- **Colores:** `GUIA_DISENO_VISUAL_NEURANT.md:53-114` (Verde éxito para confirmaciones, Rojo alerta para límites)
- **Responsive Design:** `GUIA_DISENO_VISUAL_NEURANT.md:824-867` (Mobile-first para pricing tables)
- **Accesibilidad:** `GUIA_DISENO_VISUAL_NEURANT.md:869-923` (WCAG 2.1 AA para transacciones críticas)
- **Recomendaciones Técnicas:** `GUIA_DISENO_VISUAL_NEURANT.md:1219-1235` (shadcn/ui componentes), `GUIA_DISENO_VISUAL_NEURANT.md:1367-1380` (React Hook Form para billing forms)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E5-05a ✅ (subscription plans database schema)
  - [x] TASK-P1E5-05b ✅ (billing API endpoints)
  - [x] TASK-P1E2-02d ✅ (dashboard layout base)
- **Bloquea:**
  - [ ] TASK-P1E5-05d (subscription management frontend)
  - [ ] TASK-P1E6-06a (onboarding flow que incluye plan selection)

## UI/UX Specifications
### Design Requirements
- **Layout:** Clean pricing cards with feature comparison matrix
- **Responsive:** Mobile-first con grid adaptativo (1 col mobile, 2 col tablet, 3 col desktop)
- **Theme:** Support completo para light/dark mode con pricing destacado
- **Accessibility:** WCAG 2.1 AA - keyboard navigation, screen readers, focus management

### Component Structure
```tsx
// Pricing page con plan selector
interface PricingPageProps {
  plans: SubscriptionPlan[]
  currentPlan?: CompanySubscription
  onSelectPlan: (planId: string, interval: 'monthly' | 'yearly') => void
}

// Individual plan card component
interface PlanCardProps {
  plan: SubscriptionPlan
  interval: 'monthly' | 'yearly'
  isCurrentPlan?: boolean
  isPopular?: boolean
  onSelect: () => void
}

// Feature comparison matrix
interface FeatureComparisonProps {
  plans: SubscriptionPlan[]
  features: string[]
}

// Usage metrics display
interface UsageDisplayProps {
  usage: UsageMetric[]
  limits: SubscriptionLimit[]
  compactView?: boolean
}
```

## Criterios de Aceptación Específicos
### Functional Requirements
- [x] Página pública `/pricing` con todos los planes disponibles
- [x] Toggle monthly/yearly con discount badge para yearly
- [x] Plan comparison matrix con features destacadas
- [x] CTA buttons que redirigen a signup/upgrade flow
- [x] Loading states durante fetch de planes desde API
- [x] Error handling si API falla con fallback UI

### Visual Requirements
- [x] Cards de pricing con shadow, border radius según design system
- [x] Popular plan destacado con badge y different styling
- [x] Feature icons usando Lucide React icons
- [x] Smooth animations para toggle monthly/yearly
- [x] Responsive design que funciona en mobile, tablet, desktop
- [x] Dark mode con contrasting colors para pricing destacado

### Accessibility Requirements
- [x] Semantic HTML - section, article, heading hierarchy
- [x] ARIA labels para pricing toggle y plan features
- [x] Keyboard navigation entre plan cards y buttons
- [x] Focus indicators claros en todos los interactive elements
- [x] Screen reader support con descriptive text

### Integration Requirements
- [x] Integration con `/api/billing/plans` endpoint
- [x] Auth-aware: diferentes CTAs para usuarios logged vs anonymous
- [x] Current plan highlighting si usuario tiene subscription activa
- [x] Usage metrics display si usuario está authenticated

## Archivos a Crear/Modificar
```
# Public Pricing Page
app/pricing/page.tsx                          # Public pricing page route
app/pricing/layout.tsx                        # Pricing page layout

# Protected Billing Dashboard
app/dashboard/billing/page.tsx                # Billing dashboard (protected)
app/dashboard/billing/plans/page.tsx          # Plan selection page (protected)

# Reusable Components
components/billing/PricingSection.tsx         # Main pricing component
components/billing/PlanCard.tsx               # Individual plan card
components/billing/FeatureComparison.tsx      # Feature matrix comparison
components/billing/BillingToggle.tsx          # Monthly/yearly toggle
components/billing/UsageDisplay.tsx           # Usage metrics with limits
components/billing/UpgradePrompt.tsx          # Upgrade CTA component

# Hooks & State
hooks/useBillingPlans.ts                      # Fetch plans data
hooks/useCurrentSubscription.ts               # Current user subscription
hooks/useUsageMetrics.ts                      # Usage data fetching

# Types & Utils
types/billing-ui.ts                           # Frontend-specific types
utils/billing-utils.ts                        # Price formatting, calculations
utils/plan-features.ts                        # Feature mapping utils
```

## Implementation Structure

### Main Pricing Page (Public)
```tsx
// app/pricing/page.tsx
import { Suspense } from 'react'
import { PricingSection } from '@/components/billing/PricingSection'
import { FeatureComparison } from '@/components/billing/FeatureComparison'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing - NeurAnt',
  description: 'Choose the perfect plan for your AI chatbot needs. Start free, scale as you grow.',
  openGraph: {
    title: 'NeurAnt Pricing - AI Chatbot Plans',
    description: 'Transparent pricing for AI-powered customer service. No hidden fees.',
  }
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Pricing que escala contigo
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            Comienza gratis y escala según crezcas. Sin costos ocultos, sin límites artificiales.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <Suspense fallback={<PricingSkeletonLoader />}>
        <PricingSection />
      </Suspense>

      {/* Feature Comparison */}
      <section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-center text-foreground mb-12">
          Compara características
        </h2>
        <Suspense fallback={<FeatureComparisonSkeleton />}>
          <FeatureComparison />
        </Suspense>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16 mx-auto max-w-4xl sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-center text-foreground mb-12">
          Preguntas frecuentes
        </h2>
        <div className="space-y-8">
          {/* FAQ items */}
        </div>
      </section>
    </div>
  )
}

const PricingSkeletonLoader = () => (
  <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
    <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      ))}
    </div>
  </div>
)
```

### Pricing Section Component
```tsx
// components/billing/PricingSection.tsx
'use client'

import { useState } from 'react'
import { useBillingPlans } from '@/hooks/useBillingPlans'
import { useCurrentSubscription } from '@/hooks/useCurrentSubscription'
import { PlanCard } from './PlanCard'
import { BillingToggle } from './BillingToggle'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export const PricingSection = () => {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  
  const { 
    plans, 
    loading: plansLoading, 
    error: plansError 
  } = useBillingPlans()
  
  const { 
    subscription, 
    loading: subscriptionLoading 
  } = useCurrentSubscription()

  if (plansError) {
    return (
      <div className="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No pudimos cargar los planes. Por favor intenta más tarde o{' '}
            <Button variant="link" className="p-0 h-auto">
              contacta soporte
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleSelectPlan = async (planId: string) => {
    // Redirect to signup/upgrade flow
    const currentPlanId = subscription?.plan?.id
    
    if (!subscription) {
      // Not authenticated - redirect to signup with plan preselected
      window.location.href = `/signup?plan=${planId}&interval=${billingInterval}`
    } else if (currentPlanId !== planId) {
      // Authenticated - redirect to upgrade flow
      window.location.href = `/dashboard/billing/upgrade?plan=${planId}&interval=${billingInterval}`
    }
  }

  const yearlyDiscount = 20 // 20% discount for yearly billing

  return (
    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <BillingToggle
          value={billingInterval}
          onChange={setBillingInterval}
          yearlyDiscount={yearlyDiscount}
        />
      </div>

      {/* Plan Cards Grid */}
      <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2">
        {plansLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-96 bg-muted rounded-lg border"></div>
            </div>
          ))
        ) : (
          plans?.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              interval={billingInterval}
              isCurrentPlan={subscription?.plan?.id === plan.id}
              isPopular={plan.plan_type === 'professional'}
              yearlyDiscount={yearlyDiscount}
              onSelect={() => handleSelectPlan(plan.id)}
              loading={subscriptionLoading}
            />
          ))
        )}
      </div>

      {/* Enterprise Contact CTA */}
      <div className="mt-16 text-center">
        <div className="rounded-lg border bg-card p-8">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            ¿Necesitas algo más?
          </h3>
          <p className="mt-4 text-muted-foreground">
            Para empresas grandes con necesidades específicas, ofrecemos planes personalizados.
          </p>
          <Button size="lg" className="mt-6">
            Contactar Ventas
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### Plan Card Component
```tsx
// components/billing/PlanCard.tsx
'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap } from 'lucide-react'
import { SubscriptionPlan } from '@/types/billing'
import { formatPrice } from '@/utils/billing-utils'

interface PlanCardProps {
  plan: SubscriptionPlan
  interval: 'monthly' | 'yearly'
  isCurrentPlan?: boolean
  isPopular?: boolean
  yearlyDiscount?: number
  onSelect: () => void
  loading?: boolean
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  interval,
  isCurrentPlan,
  isPopular,
  yearlyDiscount = 0,
  onSelect,
  loading
}) => {
  const price = interval === 'monthly' ? plan.price_monthly : plan.price_yearly
  const monthlyPrice = interval === 'yearly' ? price / 12 : price
  
  const features = [
    { key: 'chatbots', label: 'Chatbots', value: plan.features.chatbots },
    { key: 'messages', label: 'Mensajes/mes', value: formatNumber(plan.features.messages) },
    { key: 'users', label: 'Usuarios', value: plan.features.users },
    { key: 'support', label: 'Soporte', value: getSupportLabel(plan.features.support) },
    { key: 'analytics', label: 'Analytics', value: plan.features.analytics },
    { key: 'sso', label: 'SSO', value: plan.features.sso }
  ].filter(feature => feature.value)

  const getCtaText = () => {
    if (isCurrentPlan) return 'Plan Actual'
    if (plan.plan_type === 'starter') return 'Comenzar Gratis'
    return 'Actualizar Plan'
  }

  const getCtaVariant = () => {
    if (isCurrentPlan) return 'outline' as const
    if (isPopular) return 'default' as const
    return 'outline' as const
  }

  return (
    <div
      className={cn(
        'relative rounded-lg border bg-card p-8 shadow-sm transition-all hover:shadow-md',
        isPopular && 'border-primary shadow-lg scale-105',
        isCurrentPlan && 'border-green-500 bg-green-50 dark:bg-green-950'
      )}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge variant="default" className="px-3 py-1">
            <Zap className="w-3 h-3 mr-1" />
            Más Popular
          </Badge>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            Plan Actual
          </Badge>
        </div>
      )}

      {/* Plan Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground">
          {plan.name}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {plan.description}
        </p>
      </div>

      {/* Pricing */}
      <div className="mt-6 text-center">
        <div className="flex items-baseline justify-center">
          <span className="text-4xl font-bold tracking-tight text-foreground">
            ${formatPrice(monthlyPrice)}
          </span>
          <span className="ml-1 text-sm text-muted-foreground">/mes</span>
        </div>
        
        {interval === 'yearly' && yearlyDiscount > 0 && (
          <div className="mt-2">
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
              Ahorra {yearlyDiscount}% anual
            </span>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="mt-8">
        <Button
          className="w-full"
          variant={getCtaVariant()}
          onClick={onSelect}
          disabled={isCurrentPlan || loading}
        >
          {loading ? 'Cargando...' : getCtaText()}
        </Button>
      </div>

      {/* Features List */}
      <div className="mt-8">
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature.key} className="flex items-start">
              <Check className="flex-shrink-0 w-4 h-4 mt-0.5 text-green-500" />
              <span className="ml-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {feature.value}
                </span>{' '}
                {feature.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Helper functions
const formatNumber = (num: number | string) => {
  if (typeof num === 'string') return num
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return num.toString()
}

const getSupportLabel = (support: string) => {
  const labels = {
    email: 'Email',
    priority: 'Email Prioritario',
    dedicated: 'Soporte Dedicado'
  }
  return labels[support] || support
}
```

### Billing Toggle Component
```tsx
// components/billing/BillingToggle.tsx
'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface BillingToggleProps {
  value: 'monthly' | 'yearly'
  onChange: (value: 'monthly' | 'yearly') => void
  yearlyDiscount?: number
}

export const BillingToggle: React.FC<BillingToggleProps> = ({
  value,
  onChange,
  yearlyDiscount = 0
}) => {
  return (
    <div className="flex items-center space-x-4">
      <span className={cn(
        'text-sm font-medium transition-colors',
        value === 'monthly' ? 'text-foreground' : 'text-muted-foreground'
      )}>
        Mensual
      </span>
      
      <div className="relative">
        <button
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            value === 'yearly' ? 'bg-primary' : 'bg-muted'
          )}
          onClick={() => onChange(value === 'monthly' ? 'yearly' : 'monthly')}
          aria-label="Toggle billing frequency"
        >
          <span
            className={cn(
              'inline-block h-4 w-4 rounded-full bg-white transition-transform',
              value === 'yearly' ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <span className={cn(
          'text-sm font-medium transition-colors',
          value === 'yearly' ? 'text-foreground' : 'text-muted-foreground'
        )}>
          Anual
        </span>
        {yearlyDiscount > 0 && (
          <Badge variant="secondary" className="text-xs">
            -{yearlyDiscount}%
          </Badge>
        )}
      </div>
    </div>
  )
}
```

### Feature Comparison Component
```tsx
// components/billing/FeatureComparison.tsx
'use client'

import { useBillingPlans } from '@/hooks/useBillingPlans'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const FEATURES = [
  { key: 'chatbots', label: 'Número de Chatbots', category: 'Básico' },
  { key: 'messages', label: 'Mensajes por mes', category: 'Básico' },
  { key: 'users', label: 'Usuarios del team', category: 'Básico' },
  { key: 'storage', label: 'Almacenamiento', category: 'Básico' },
  { key: 'support', label: 'Tipo de soporte', category: 'Soporte' },
  { key: 'analytics', label: 'Analytics avanzados', category: 'Analytics' },
  { key: 'api_access', label: 'Acceso API', category: 'Integraciones' },
  { key: 'webhooks', label: 'Webhooks', category: 'Integraciones' },
  { key: 'sso', label: 'Single Sign-On', category: 'Seguridad' },
  { key: 'rbac', label: 'Control de roles', category: 'Seguridad' },
  { key: 'white_label', label: 'White Label', category: 'Personalización' },
  { key: 'priority_support', label: 'Soporte prioritario', category: 'Soporte' }
]

export const FeatureComparison = () => {
  const { plans, loading } = useBillingPlans()

  if (loading) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg"></div>
  }

  if (!plans?.length) {
    return null
  }

  const categories = [...new Set(FEATURES.map(f => f.category))]

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="py-4 px-6 text-left text-sm font-medium text-muted-foreground">
              Características
            </th>
            {plans.map((plan) => (
              <th key={plan.id} className="py-4 px-6 text-center text-sm font-medium text-foreground">
                <div className="space-y-1">
                  <div className="font-semibold">{plan.name}</div>
                  <div className="text-xs text-muted-foreground">
                    ${plan.price_monthly}/mes
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <React.Fragment key={category}>
              {/* Category Header */}
              <tr>
                <td colSpan={plans.length + 1} className="py-4 px-6 bg-muted/50">
                  <h4 className="font-medium text-sm text-foreground">{category}</h4>
                </td>
              </tr>
              
              {/* Features in Category */}
              {FEATURES.filter(f => f.category === category).map((feature) => (
                <tr key={feature.key} className="border-b border-border hover:bg-muted/20">
                  <td className="py-3 px-6 text-sm text-foreground">
                    {feature.label}
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="py-3 px-6 text-center">
                      <FeatureCell
                        feature={feature.key}
                        value={plan.features[feature.key]}
                        planType={plan.plan_type}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface FeatureCellProps {
  feature: string
  value: any
  planType: string
}

const FeatureCell: React.FC<FeatureCellProps> = ({ feature, value, planType }) => {
  if (value === true) {
    return <Check className="w-5 h-5 text-green-500 mx-auto" />
  }
  
  if (value === false || value === null || value === undefined) {
    return <X className="w-5 h-5 text-red-500 mx-auto" />
  }
  
  if (typeof value === 'string' || typeof value === 'number') {
    return (
      <span className="text-sm font-medium text-foreground">
        {value === 'unlimited' ? '∞' : value}
      </span>
    )
  }
  
  return <span className="text-sm text-muted-foreground">-</span>
}
```

### Custom Hooks
```tsx
// hooks/useBillingPlans.ts
'use client'

import { useState, useEffect } from 'react'
import { SubscriptionPlan } from '@/types/billing'

export const useBillingPlans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/billing/plans')
        
        if (!response.ok) {
          throw new Error('Failed to fetch plans')
        }
        
        const data = await response.json()
        setPlans(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  return { plans, loading, error }
}

// hooks/useCurrentSubscription.ts
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { CompanySubscription } from '@/types/billing'

export const useCurrentSubscription = () => {
  const { user, loading: authLoading } = useAuth()
  const [subscription, setSubscription] = useState<CompanySubscription | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !user) return

    const fetchSubscription = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/billing/subscription', {
          headers: {
            'Authorization': `Bearer ${user.access_token}`
          }
        })
        
        if (!response.ok) {
          if (response.status === 404) {
            setSubscription(null)
            return
          }
          throw new Error('Failed to fetch subscription')
        }
        
        const data = await response.json()
        setSubscription(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [user, authLoading])

  return { subscription, loading, error }
}
```

### Utils & Types
```typescript
// utils/billing-utils.ts
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

export const calculateYearlyDiscount = (monthlyPrice: number, yearlyPrice: number): number => {
  const yearlyMonthly = yearlyPrice / 12
  const discount = ((monthlyPrice - yearlyMonthly) / monthlyPrice) * 100
  return Math.round(discount)
}

export const formatFeatureValue = (value: any): string => {
  if (value === true) return '✓'
  if (value === false) return '✗'
  if (value === 'unlimited') return 'Ilimitado'
  if (typeof value === 'number' && value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`
  }
  return String(value)
}

// types/billing-ui.ts
export interface PricingPageState {
  selectedInterval: 'monthly' | 'yearly'
  selectedPlan: string | null
  loading: boolean
}

export interface PlanFeatureMap {
  [key: string]: {
    label: string
    description?: string
    category: 'basic' | 'advanced' | 'enterprise'
  }
}
```

## Protected Billing Dashboard
```tsx
// app/dashboard/billing/page.tsx
import { Suspense } from 'react'
import { CurrentSubscriptionCard } from '@/components/billing/CurrentSubscriptionCard'
import { UsageDisplay } from '@/components/billing/UsageDisplay'
import { BillingHistory } from '@/components/billing/BillingHistory'
import { UpgradePrompt } from '@/components/billing/UpgradePrompt'

export default function BillingDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Facturación y Suscripción
        </h1>
        <p className="text-muted-foreground">
          Gestiona tu plan, consulta tu uso y accede a tu historial de facturación.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Suspense fallback={<SkeletonCard />}>
          <CurrentSubscriptionCard />
        </Suspense>
        
        <Suspense fallback={<SkeletonCard />}>
          <UsageDisplay />
        </Suspense>
      </div>

      <Suspense fallback={<SkeletonCard />}>
        <UpgradePrompt />
      </Suspense>

      <Suspense fallback={<SkeletonCard />}>
        <BillingHistory />
      </Suspense>
    </div>
  )
}

const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="h-48 bg-muted rounded-lg border"></div>
  </div>
)
```

## Responsive Design Breakpoints
```css
/* Mobile First Approach */
.pricing-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .pricing-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .pricing-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Feature comparison table responsive */
.feature-table {
  overflow-x: auto;
  scrollbar-width: thin;
}

@media (max-width: 768px) {
  .feature-table table {
    min-width: 640px;
  }
}
```

## Testing Strategy
```tsx
// __tests__/components/billing/PricingSection.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PricingSection } from '@/components/billing/PricingSection'

// Mock hooks
jest.mock('@/hooks/useBillingPlans')
jest.mock('@/hooks/useCurrentSubscription')

describe('PricingSection', () => {
  it('renders pricing plans correctly', async () => {
    mockUseBillingPlans.mockReturnValue({
      plans: mockPlans,
      loading: false,
      error: null
    })

    render(<PricingSection />)

    await waitFor(() => {
      expect(screen.getByText('Starter')).toBeInTheDocument()
      expect(screen.getByText('Professional')).toBeInTheDocument()
      expect(screen.getByText('Enterprise')).toBeInTheDocument()
    })
  })

  it('toggles between monthly and yearly billing', async () => {
    const user = userEvent.setup()
    render(<PricingSection />)

    const toggle = screen.getByLabelText('Toggle billing frequency')
    await user.click(toggle)

    expect(screen.getByText('Ahorra 20% anual')).toBeInTheDocument()
  })

  it('highlights current plan for authenticated users', async () => {
    mockUseCurrentSubscription.mockReturnValue({
      subscription: { plan: { id: 'plan-1' } },
      loading: false
    })

    render(<PricingSection />)

    expect(screen.getByText('Plan Actual')).toBeInTheDocument()
  })
})
```

## Accessibility Features
```tsx
// Accessibility improvements
export const AccessiblePricingCard = ({ plan, ...props }) => {
  return (
    <div
      role="article"
      aria-labelledby={`plan-${plan.id}-title`}
      className="pricing-card"
    >
      <h3 id={`plan-${plan.id}-title`} className="sr-only">
        {plan.name} - ${plan.price_monthly} per month
      </h3>
      
      <Button
        aria-describedby={`plan-${plan.id}-features`}
        aria-label={`Select ${plan.name} plan for $${plan.price_monthly} per month`}
      >
        Select Plan
      </Button>
      
      <ul id={`plan-${plan.id}-features`} aria-label="Plan features">
        {/* Feature list */}
      </ul>
    </div>
  )
}
```

## Performance Optimizations
```tsx
// Lazy loading and code splitting
import dynamic from 'next/dynamic'

const FeatureComparison = dynamic(
  () => import('@/components/billing/FeatureComparison'),
  { 
    loading: () => <FeatureComparisonSkeleton />,
    ssr: false 
  }
)

// Image optimization for plan icons
import Image from 'next/image'

const PlanIcon = ({ src, alt }) => (
  <Image
    src={src}
    alt={alt}
    width={24}
    height={24}
    className="w-6 h-6"
    loading="lazy"
  />
)
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- UI Components: 6 componentes principales de pricing implementados
- Pages created: /pricing (public), /dashboard/billing (protected)
- Responsive design: Mobile-first con 3 breakpoints principales
- Next frontend task: TASK-P1E5-05d (Subscription management UI)
- Integration: API billing endpoints, auth-aware components
- Accessibility: WCAG 2.1 AA compliance con keyboard navigation
```

---
*Frontend UI task para implementar sistema completo de pricing y plan selection*