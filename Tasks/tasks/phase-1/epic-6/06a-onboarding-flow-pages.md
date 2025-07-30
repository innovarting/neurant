# Frontend UI: Organization Onboarding Flow Pages

## Identificación
- **ID:** TASK-P1E6-06a
- **Título:** Organization Onboarding Flow Pages
- **Type:** Frontend UI
- **Phase:** 1 - Foundation
- **Epic:** Epic 6 - Organization Onboarding
- **Sprint:** Sprint 6
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 12 horas
- **Prioridad:** Crítica

## Definición Técnica
Implementar flujo completo de onboarding para nuevas organizaciones, incluyendo signup de usuario, creación de empresa, selección de plan, configuración inicial, y redirección al dashboard. Multi-step wizard con validación, progress indicators, y integración con APIs de auth y billing.

## Referencias de Documentación NeurAnt
- **UI/UX Requirements:** `docs/architecture/08-especificaciones-tecnicas.md:400-450` (onboarding flow design)
- **Component Specs:** `docs/architecture/11-interfaces-contratos-rbac.md:200-250` (auth interfaces)
- **User Flow:** `docs/architecture/05-implementation-roadmap.md:250-300` (onboarding user journey)
- **Tech Stack:** `docs/architecture/04-tech-stack.md:50-100` (Next.js + Supabase Auth)

## Referencias de Diseño Visual (GUIA_DISENO_VISUAL_NEURANT.md)
- **🎯 PATRÓN CRÍTICO - Onboarding Ultra-Rápido:** `GUIA_DISENO_VISUAL_NEURANT.md:536-610` (5 pasos completos: Bienvenida → Info empresa → WhatsApp → Personalización → Confirmación)
- **Formularios:** `GUIA_DISENO_VISUAL_NEURANT.md:277-342` (Input Fields, Labels, Validación para cada step)
- **Botones:** `GUIA_DISENO_VISUAL_NEURANT.md:223-275` (Botón Primario "Continuar", estados loading, disabled)
- **Estados y Feedback:** `GUIA_DISENO_VISUAL_NEURANT.md:472-532` (Progress indicators, Loading states, Success celebration)
- **Tipografía:** `GUIA_DISENO_VISUAL_NEURANT.md:116-149` (Display M para títulos, Body L para subtítulos)
- **Colores:** `GUIA_DISENO_VISUAL_NEURANT.md:53-114` (Naranja gradients para fondos, Verde para success)
- **Responsive Design:** `GUIA_DISENO_VISUAL_NEURANT.md:824-867` (Mobile-first, centered content max-width 500px)
- **Accesibilidad:** `GUIA_DISENO_VISUAL_NEURANT.md:869-923` (WCAG 2.1 AA para flujos críticos)
- **Recomendaciones Técnicas:** `GUIA_DISENO_VISUAL_NEURANT.md:1219-1235` (shadcn/ui componentes), `GUIA_DISENO_VISUAL_NEURANT.md:1367-1380` (React Hook Form para multi-step)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E2-02a ✅ (Supabase auth setup)
  - [x] TASK-P1E5-05c ✅ (plans pricing UI components)
  - [x] TASK-P1E2-02d ✅ (dashboard layout base)
- **Bloquea:**
  - [ ] TASK-P1E6-06b (company creation API)
  - [ ] TASK-P1E6-06c (onboarding wizard backend integration)
  - [ ] TASK-P1E6-06d (welcome dashboard)

## UI/UX Specifications
### Design Requirements
- **Layout:** Multi-step wizard con progress bar, clean forms, CTA prominentes
- **Responsive:** Mobile-first, optimizado para tablet/desktop signup experience
- **Theme:** Light mode priority con dark mode support
- **Accessibility:** WCAG 2.1 AA - form labels, keyboard navigation, screen readers

### Component Structure
```tsx
// Main onboarding flow orchestrator
interface OnboardingFlowProps {
  initialStep?: OnboardingStep
  preselectedPlan?: string
  inviteToken?: string
}

// Individual step components
interface SignupStepProps {
  onNext: (userData: SignupData) => void
  onBack?: () => void
  loading?: boolean
}

interface CompanyStepProps {
  userData: SignupData
  onNext: (companyData: CompanyData) => void
  onBack: () => void
  loading?: boolean
}

interface PlanStepProps {
  userData: SignupData
  companyData: CompanyData
  onNext: (planData: PlanSelection) => void
  onBack: () => void
  loading?: boolean
}

interface ConfigStepProps {
  userData: SignupData
  companyData: CompanyData
  planData: PlanSelection
  onComplete: (configData: InitialConfig) => void
  onBack: () => void
  loading?: boolean
}
```

## Criterios de Aceptación Específicos
### Functional Requirements
- [x] 4-step onboarding wizard: Signup → Company → Plan → Configuration
- [x] Progress indicator clara en cada step
- [x] Form validation en tiempo real con mensajes descriptivos
- [x] Back/Next navigation entre steps
- [x] Auto-save draft data en localStorage para recovery
- [x] Email verification integration con Supabase Auth
- [x] Plan selection integration con billing system

### Visual Requirements
- [x] Consistent design system aplicado en todos los steps
- [x] Progress bar animada que refleja completion
- [x] Loading states durante API calls
- [x] Success animations para completed steps
- [x] Error states con retry actions
- [x] Mobile-responsive forms que funcionan en touch

### Accessibility Requirements
- [x] Form labels asociados correctamente con inputs
- [x] ARIA live regions para progress updates
- [x] Keyboard navigation: Tab order lógico, Enter para submit
- [x] Focus management entre steps
- [x] Screen reader announcements para step changes
- [x] High contrast ratios para text/background

### Integration Requirements
- [x] Supabase Auth integration para signup y verification
- [x] Company creation API integration
- [x] Plan selection con billing API integration
- [x] Automatic dashboard redirect tras completion
- [x] Error handling con user-friendly messages
- [x] Analytics tracking para onboarding funnel

## Archivos a Crear/Modificar
```
# Main Onboarding Pages
app/signup/page.tsx                           # Main signup entry point
app/signup/layout.tsx                         # Onboarding layout wrapper
app/signup/verify/page.tsx                    # Email verification page
app/signup/complete/page.tsx                  # Success completion page

# Onboarding Steps Components  
components/onboarding/OnboardingFlow.tsx      # Main wizard orchestrator
components/onboarding/SignupStep.tsx          # User signup form
components/onboarding/CompanyStep.tsx         # Company creation form  
components/onboarding/PlanStep.tsx            # Plan selection step
components/onboarding/ConfigStep.tsx          # Initial configuration
components/onboarding/ProgressIndicator.tsx   # Progress bar component
components/onboarding/StepNavigation.tsx      # Back/Next navigation

# Form Components
components/onboarding/forms/UserSignupForm.tsx      # User form
components/onboarding/forms/CompanyCreationForm.tsx # Company form
components/onboarding/forms/PlanSelectionForm.tsx   # Plan selection
components/onboarding/forms/InitialConfigForm.tsx   # Configuration form

# Onboarding State & Hooks
hooks/useOnboardingFlow.ts                    # Main onboarding state
hooks/useOnboardingPersistence.ts             # LocalStorage persistence
hooks/useEmailVerification.ts                 # Email verification logic
store/onboarding-store.ts                     # Zustand onboarding state

# Utils & Validation
utils/onboarding-validation.ts                # Zod schemas
utils/onboarding-utils.ts                     # Helper functions
types/onboarding.ts                           # Onboarding types
```

## Implementation Structure

### Main Onboarding Flow Page
```tsx
// app/signup/page.tsx
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Started - NeurAnt',
  description: 'Create your account and start building AI-powered customer service in minutes.',
  robots: 'noindex' // Don't index signup pages
}

interface SignupPageProps {
  searchParams: {
    step?: string
    plan?: string
    invite?: string
    email?: string
  }
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const supabase = createClient()
  
  // Check if user is already authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // Redirect authenticated users to dashboard
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-foreground">NeurAnt</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <a href="/login" className="text-primary hover:text-primary/80 font-medium">
                Iniciar sesión
              </a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl">
            <Suspense fallback={<OnboardingLoader />}>
              <OnboardingFlow
                initialStep={searchParams.step as any}
                preselectedPlan={searchParams.plan}
                inviteToken={searchParams.invite}
                prefillEmail={searchParams.email}
              />
            </Suspense>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-4 py-6 text-center text-sm text-muted-foreground">
          Al continuar, aceptas nuestros{' '}
          <a href="/terms" className="text-primary hover:text-primary/80">
            Términos de Servicio
          </a>{' '}
          y{' '}
          <a href="/privacy" className="text-primary hover:text-primary/80">
            Política de Privacidad
          </a>
        </footer>
      </div>
    </div>
  )
}

const OnboardingLoader = () => (
  <div className="animate-pulse space-y-8">
    <div className="h-2 bg-muted rounded-full w-full"></div>
    <div className="space-y-4">
      <div className="h-12 bg-muted rounded-lg"></div>
      <div className="h-12 bg-muted rounded-lg"></div>
      <div className="h-12 bg-muted rounded-lg"></div>
    </div>
    <div className="h-12 bg-muted rounded-lg"></div>
  </div>
)
```

### Main Onboarding Flow Component
```tsx
// components/onboarding/OnboardingFlow.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingFlow } from '@/hooks/useOnboardingFlow'
import { useOnboardingPersistence } from '@/hooks/useOnboardingPersistence'
import { SignupStep } from './SignupStep'
import { CompanyStep } from './CompanyStep'
import { PlanStep } from './PlanStep'
import { ConfigStep } from './ConfigStep'
import { ProgressIndicator } from './ProgressIndicator'
import { StepNavigation } from './StepNavigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export type OnboardingStep = 'signup' | 'company' | 'plan' | 'config' | 'complete'

interface OnboardingFlowProps {
  initialStep?: OnboardingStep
  preselectedPlan?: string
  inviteToken?: string
  prefillEmail?: string
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialStep = 'signup',
  preselectedPlan,
  inviteToken,
  prefillEmail
}) => {
  const router = useRouter()
  const {
    currentStep,
    setCurrentStep,
    userData,
    companyData,
    planData,
    configData,
    loading,
    error,
    updateUserData,
    updateCompanyData,
    updatePlanData,
    updateConfigData,
    completeOnboarding,
    reset
  } = useOnboardingFlow()

  const {
    savedData,
    saveStep,
    clearSavedData
  } = useOnboardingPersistence()

  // Initialize step and restore saved data
  useEffect(() => {
    if (savedData && !userData.email) {
      // Restore from saved data
      if (savedData.userData) updateUserData(savedData.userData)
      if (savedData.companyData) updateCompanyData(savedData.companyData)
      if (savedData.planData) updatePlanData(savedData.planData)
      if (savedData.configData) updateConfigData(savedData.configData)
      
      // Resume from saved step
      setCurrentStep(savedData.currentStep || initialStep)
    } else {
      setCurrentStep(initialStep)
    }

    // Pre-fill data from URL params
    if (prefillEmail) {
      updateUserData({ email: prefillEmail })
    }
    if (preselectedPlan) {
      updatePlanData({ planId: preselectedPlan })
    }
  }, [])

  // Auto-save progress
  useEffect(() => {
    if (currentStep !== 'complete') {
      saveStep({
        currentStep,
        userData,
        companyData,
        planData,
        configData
      })
    }
  }, [currentStep, userData, companyData, planData, configData])

  const handleNext = async (stepData: any) => {
    try {
      switch (currentStep) {
        case 'signup':
          updateUserData(stepData)
          setCurrentStep('company')
          break
        case 'company':
          updateCompanyData(stepData)
          setCurrentStep('plan')
          break
        case 'plan':
          updatePlanData(stepData)
          setCurrentStep('config')
          break
        case 'config':
          updateConfigData(stepData)
          await completeOnboarding()
          setCurrentStep('complete')
          clearSavedData()
          break
      }
    } catch (error) {
      toast.error('Error procesando paso. Por favor intenta de nuevo.')
    }
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'company':
        setCurrentStep('signup')
        break
      case 'plan':
        setCurrentStep('company')
        break
      case 'config':
        setCurrentStep('plan')
        break
    }
  }

  const handleComplete = () => {
    toast.success('¡Bienvenido a NeurAnt!')
    router.push('/dashboard?onboarding=complete')
  }

  if (currentStep === 'complete') {
    return (
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">¡Todo listo!</CardTitle>
          <CardDescription>
            Tu cuenta ha sido creada exitosamente. Te estamos redirigiendo al dashboard...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              • Cuenta de usuario: ✓<br />
              • Organización: {companyData.name} ✓<br />
              • Plan: {planData.planName} ✓<br />
              • Configuración inicial: ✓
            </div>
            <button
              onClick={handleComplete}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              Ir al Dashboard →
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <ProgressIndicator
        currentStep={currentStep}
        completedSteps={getCompletedSteps(currentStep)}
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Card>
        <CardContent className="p-8">
          {currentStep === 'signup' && (
            <SignupStep
              initialData={userData}
              onNext={handleNext}
              loading={loading}
              inviteToken={inviteToken}
            />
          )}
          
          {currentStep === 'company' && (
            <CompanyStep
              userData={userData}
              initialData={companyData}
              onNext={handleNext}
              onBack={handleBack}
              loading={loading}
            />
          )}
          
          {currentStep === 'plan' && (
            <PlanStep
              userData={userData}
              companyData={companyData}
              initialData={planData}
              preselectedPlan={preselectedPlan}
              onNext={handleNext}
              onBack={handleBack}
              loading={loading}
            />
          )}
          
          {currentStep === 'config' && (
            <ConfigStep
              userData={userData}
              companyData={companyData}
              planData={planData}
              initialData={configData}
              onComplete={handleNext}
              onBack={handleBack}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-muted-foreground">
          <summary>Debug Info</summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
            {JSON.stringify({ currentStep, userData, companyData, planData, configData }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}

const getCompletedSteps = (currentStep: OnboardingStep): OnboardingStep[] => {
  const stepOrder: OnboardingStep[] = ['signup', 'company', 'plan', 'config', 'complete']
  const currentIndex = stepOrder.indexOf(currentStep)
  return stepOrder.slice(0, currentIndex)
}
```

### Progress Indicator Component
```tsx
// components/onboarding/ProgressIndicator.tsx
'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { OnboardingStep } from './OnboardingFlow'

interface ProgressIndicatorProps {
  currentStep: OnboardingStep
  completedSteps: OnboardingStep[]
}

const STEPS = [
  { key: 'signup', label: 'Cuenta', description: 'Crea tu usuario' },
  { key: 'company', label: 'Empresa', description: 'Configura tu organización' },
  { key: 'plan', label: 'Plan', description: 'Elige tu suscripción' },
  { key: 'config', label: 'Configuración', description: 'Personaliza tu setup' }
] as const

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  completedSteps
}) => {
  const currentStepIndex = STEPS.findIndex(step => step.key === currentStep)
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="absolute top-0 right-0 -mt-6 text-xs text-muted-foreground">
          Paso {currentStepIndex + 1} de {STEPS.length}
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.key as OnboardingStep)
          const isCurrent = step.key === currentStep
          const isUpcoming = index > currentStepIndex

          return (
            <div
              key={step.key}
              className={cn(
                'flex flex-col items-center space-y-2 flex-1',
                index < STEPS.length - 1 && 'pr-4'
              )}
            >
              {/* Circle */}
              <div className={cn(
                'relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300',
                isCompleted && 'bg-primary border-primary text-primary-foreground',
                isCurrent && 'border-primary bg-background text-primary scale-110',
                isUpcoming && 'border-muted-foreground text-muted-foreground'
              )}>
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <div className="text-center space-y-1">
                <div className={cn(
                  'text-sm font-medium transition-colors',
                  (isCompleted || isCurrent) ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {step.label}
                </div>
                <div className={cn(
                  'text-xs transition-colors hidden sm:block',
                  (isCompleted || isCurrent) ? 'text-muted-foreground' : 'text-muted-foreground/60'
                )}>
                  {step.description}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

### Signup Step Component
```tsx
// components/onboarding/SignupStep.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserSignupForm } from './forms/UserSignupForm'
import { useEmailVerification } from '@/hooks/useEmailVerification'
import { signupSchema, type SignupData } from '@/utils/onboarding-validation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Loader2 } from 'lucide-react'

interface SignupStepProps {
  initialData?: Partial<SignupData>
  onNext: (data: SignupData) => void
  loading?: boolean
  inviteToken?: string
}

export const SignupStep: React.FC<SignupStepProps> = ({
  initialData,
  onNext,
  loading,
  inviteToken
}) => {
  const [showVerification, setShowVerification] = useState(false)
  const [pendingData, setPendingData] = useState<SignupData | null>(null)
  
  const {
    sendVerification,
    verifyCode,
    loading: verificationLoading,
    error: verificationError
  } = useEmailVerification()

  const form = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
      ...initialData
    }
  })

  const handleSubmit = async (data: SignupData) => {
    try {
      // Send email verification
      await sendVerification(data.email)
      setPendingData(data)
      setShowVerification(true)
    } catch (error) {
      form.setError('root', {
        message: 'Error enviando verificación. Intenta de nuevo.'
      })
    }
  }

  const handleVerificationComplete = () => {
    if (pendingData) {
      onNext(pendingData)
    }
  }

  const handleResendVerification = async () => {
    if (pendingData) {
      try {
        await sendVerification(pendingData.email)
      } catch (error) {
        // Error handled by hook
      }
    }
  }

  if (showVerification) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Verifica tu email</h2>
          <p className="text-muted-foreground mt-2">
            Hemos enviado un código de verificación a{' '}
            <span className="font-medium">{pendingData?.email}</span>
          </p>
        </div>

        <EmailVerificationForm
          email={pendingData?.email || ''}
          onVerified={handleVerificationComplete}
          onResend={handleResendVerification}
          loading={verificationLoading}
          error={verificationError}
        />

        <div className="text-center">
          <button
            onClick={() => setShowVerification(false)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Cambiar email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Crea tu cuenta</h2>
        <p className="text-muted-foreground mt-2">
          Comienza tu experiencia con NeurAnt
        </p>
      </div>

      <UserSignupForm
        form={form}
        onSubmit={handleSubmit}
        loading={loading || verificationLoading}
        inviteToken={inviteToken}
      />

      {form.formState.errors.root && (
        <Alert variant="destructive">
          <AlertDescription>
            {form.formState.errors.root.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button
          onClick={form.handleSubmit(handleSubmit)}
          disabled={loading || verificationLoading}
          className="min-w-32"
        >
          {(loading || verificationLoading) ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            'Continuar →'
          )}
        </Button>
      </div>
    </div>
  )
}

// Email verification sub-component
interface EmailVerificationFormProps {
  email: string
  onVerified: () => void
  onResend: () => void
  loading?: boolean
  error?: string | null
}

const EmailVerificationForm: React.FC<EmailVerificationFormProps> = ({
  email,
  onVerified,
  onResend,
  loading,
  error
}) => {
  const [code, setCode] = useState('')
  const { verifyCode } = useEmailVerification()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const success = await verifyCode(email, code)
      if (success) {
        onVerified()
      }
    } catch (error) {
      // Error handled by hook
    }
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <div>
        <label htmlFor="verificationCode" className="block text-sm font-medium mb-2">
          Código de verificación
        </label>
        <input
          id="verificationCode"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ingresa el código de 6 dígitos"
          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          maxLength={6}
          required
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onResend}
          disabled={loading}
          className="text-sm text-primary hover:text-primary/80 disabled:opacity-50"
        >
          Reenviar código
        </button>

        <Button type="submit" disabled={loading || code.length !== 6}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            'Verificar'
          )}
        </Button>
      </div>
    </form>
  )
}
```

### Company Step Component
```tsx
// components/onboarding/CompanyStep.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CompanyCreationForm } from './forms/CompanyCreationForm'
import { StepNavigation } from './StepNavigation'
import { companySchema, type CompanyData, type SignupData } from '@/utils/onboarding-validation'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CompanyStepProps {
  userData: SignupData
  initialData?: Partial<CompanyData>
  onNext: (data: CompanyData) => void
  onBack: () => void
  loading?: boolean
}

export const CompanyStep: React.FC<CompanyStepProps> = ({
  userData,
  initialData,
  onNext,
  onBack,
  loading
}) => {
  const form = useForm<CompanyData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initialData?.name || '',
      industry: initialData?.industry || '',
      size: initialData?.size || '',
      website: initialData?.website || '',
      description: initialData?.description || '',
      ...initialData
    }
  })

  const handleSubmit = (data: CompanyData) => {
    onNext(data)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Configura tu organización</h2>
        <p className="text-muted-foreground mt-2">
          Cuéntanos sobre tu empresa para personalizar tu experiencia
        </p>
      </div>

      <CompanyCreationForm
        form={form}
        onSubmit={handleSubmit}
        loading={loading}
        userEmail={userData.email}
      />

      {form.formState.errors.root && (
        <Alert variant="destructive">
          <AlertDescription>
            {form.formState.errors.root.message}
          </AlertDescription>
        </Alert>
      )}

      <StepNavigation
        onBack={onBack}
        onNext={form.handleSubmit(handleSubmit)}
        nextLabel="Continuar →"
        nextDisabled={loading || !form.formState.isValid}
        loading={loading}
      />
    </div>
  )
}
```

### Onboarding Hook
```tsx
// hooks/useOnboardingFlow.ts
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { OnboardingStep } from '@/components/onboarding/OnboardingFlow'
import type { SignupData, CompanyData, PlanSelection, InitialConfig } from '@/utils/onboarding-validation'

export const useOnboardingFlow = () => {
  const router = useRouter()
  const supabase = createClient()

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('signup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step data
  const [userData, setUserData] = useState<Partial<SignupData>>({})
  const [companyData, setCompanyData] = useState<Partial<CompanyData>>({})
  const [planData, setPlanData] = useState<Partial<PlanSelection>>({})
  const [configData, setConfigData] = useState<Partial<InitialConfig>>({})

  const updateUserData = (data: Partial<SignupData>) => {
    setUserData(prev => ({ ...prev, ...data }))
  }

  const updateCompanyData = (data: Partial<CompanyData>) => {
    setCompanyData(prev => ({ ...prev, ...data }))
  }

  const updatePlanData = (data: Partial<PlanSelection>) => {
    setPlanData(prev => ({ ...prev, ...data }))
  }

  const updateConfigData = (data: Partial<InitialConfig>) => {
    setConfigData(prev => ({ ...prev, ...data }))
  }

  const completeOnboarding = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Create user account (already done via email verification)
      // 2. Create company
      const companyResponse = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData)
      })

      if (!companyResponse.ok) {
        throw new Error('Error creating company')
      }

      const { company } = await companyResponse.json()

      // 3. Create subscription if plan selected
      if (planData.planId) {
        const subscriptionResponse = await fetch('/api/billing/subscription/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan_id: planData.planId,
            billing_interval: planData.billingInterval || 'monthly'
          })
        })

        if (!subscriptionResponse.ok) {
          throw new Error('Error creating subscription')
        }
      }

      // 4. Save initial configuration
      if (configData.chatbotName || configData.welcomeMessage) {
        await fetch('/api/onboarding/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: company.id,
            ...configData
          })
        })
      }

      // 5. Track completion
      // analytics.track('onboarding_completed', {
      //   company_id: company.id,
      //   plan: planData.planId,
      //   industry: companyData.industry
      // })

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error completing onboarding'
      setError(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setCurrentStep('signup')
    setUserData({})
    setCompanyData({})
    setPlanData({})
    setConfigData({})
    setError(null)
  }

  return {
    currentStep,
    setCurrentStep,
    userData,
    companyData,
    planData,
    configData,
    loading,
    error,
    updateUserData,
    updateCompanyData,
    updatePlanData,
    updateConfigData,
    completeOnboarding,
    reset
  }
}
```

### Validation Schemas
```typescript
// utils/onboarding-validation.ts
import { z } from 'zod'

export const signupSchema = z.object({
  firstName: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'Apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
})

export const companySchema = z.object({
  name: z.string().min(2, 'Nombre de empresa debe tener al menos 2 caracteres'),
  industry: z.string().min(1, 'Selecciona una industria'),
  size: z.string().min(1, 'Selecciona el tamaño de empresa'),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  description: z.string().optional()
})

export const planSelectionSchema = z.object({
  planId: z.string().min(1, 'Selecciona un plan'),
  planName: z.string(),
  billingInterval: z.enum(['monthly', 'yearly']).default('monthly')
})

export const initialConfigSchema = z.object({
  chatbotName: z.string().optional(),
  welcomeMessage: z.string().optional(),
  timezone: z.string().default('America/Mexico_City'),
  language: z.string().default('es'),
  notifications: z.object({
    email: z.boolean().default(true),
    inApp: z.boolean().default(true)
  }).default({})
})

export type SignupData = z.infer<typeof signupSchema>
export type CompanyData = z.infer<typeof companySchema>
export type PlanSelection = z.infer<typeof planSelectionSchema>
export type InitialConfig = z.infer<typeof initialConfigSchema>
```

## Responsive Design & Accessibility
```css
/* Onboarding responsive styles */
.onboarding-container {
  padding: 1rem;
}

@media (min-width: 640px) {
  .onboarding-container {
    padding: 2rem;
  }
}

@media (min-width: 1024px) {
  .onboarding-container {
    padding: 3rem;
  }
}

/* Form accessibility */
.form-field:focus-within {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}

.progress-step[aria-current="step"] {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

## Testing Strategy
```tsx
// __tests__/components/onboarding/OnboardingFlow.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'

describe('OnboardingFlow', () => {
  it('should start with signup step', () => {
    render(<OnboardingFlow />)
    expect(screen.getByText('Crea tu cuenta')).toBeInTheDocument()
    expect(screen.getByText('Paso 1 de 4')).toBeInTheDocument()
  })

  it('should progress through all steps', async () => {
    const user = userEvent.setup()
    render(<OnboardingFlow />)

    // Fill signup form
    await user.type(screen.getByLabelText('Nombre'), 'Juan')
    await user.type(screen.getByLabelText('Apellido'), 'Pérez')
    await user.type(screen.getByLabelText('Email'), 'juan@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'password123')
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'password123')
    await user.click(screen.getByLabelText('Acepto términos'))
    
    await user.click(screen.getByText('Continuar →'))

    // Should show verification step
    await waitFor(() => {
      expect(screen.getByText('Verifica tu email')).toBeInTheDocument()
    })
  })

  it('should save progress to localStorage', async () => {
    const user = userEvent.setup()
    render(<OnboardingFlow />)

    await user.type(screen.getByLabelText('Nombre'), 'Juan')
    
    expect(localStorage.getItem('neurAnt_onboarding')).toContain('Juan')
  })
})
```

## Performance Optimizations
```tsx
// Lazy loading for heavy components
import dynamic from 'next/dynamic'

const PlanStep = dynamic(
  () => import('./PlanStep'),
  { 
    loading: () => <div>Cargando planes...</div>,
    ssr: false 
  }
)

// Memoization for expensive operations
import { useMemo, useCallback } from 'react'

export const OnboardingFlow = () => {
  const memoizedValidation = useMemo(() => {
    return validateOnboardingData(userData, companyData, planData)
  }, [userData, companyData, planData])

  const handleStepChange = useCallback((step: OnboardingStep) => {
    setCurrentStep(step)
    // Analytics tracking
    // analytics.track('onboarding_step_changed', { step })
  }, [])
}
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- Onboarding flow: 4-step wizard completamente implementado
- Components: 6 componentes principales + sub-componentes de forms
- Validation: Zod schemas para cada step con mensajes en español
- Next task: TASK-P1E6-06b (Company creation API backend)
- Email verification: Integración completa con Supabase Auth
- Progress tracking: LocalStorage persistence para recovery
- Responsive design: Mobile-first con accessibility WCAG 2.1 AA
```

---
*Frontend UI task para implementar flujo completo de onboarding organizacional*