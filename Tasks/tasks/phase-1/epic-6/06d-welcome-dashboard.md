# Frontend UI: Welcome Dashboard & Onboarding Completion

## Identificación
- **ID:** TASK-P1E6-06d
- **Título:** Welcome Dashboard & Onboarding Completion
- **Type:** Frontend UI
- **Phase:** 1 - Foundation
- **Epic:** Epic 6 - Organization Onboarding
- **Sprint:** Sprint 6
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 8 horas
- **Prioridad:** Crítica

## Definición Técnica
Implementar dashboard de bienvenida post-onboarding con checklist de próximos pasos, quick actions, overview de configuración completada, integración con tutoriales, y transición suave al dashboard principal. Incluye celebración de milestones y guidance para primeros usos.

## Referencias de Documentación NeurAnt
- **UI/UX Requirements:** `docs/architecture/08-especificaciones-tecnicas.md:500-550` (welcome dashboard design)
- **Component Specs:** `docs/architecture/11-interfaces-contratos-rbac.md:350-400` (dashboard interfaces)
- **User Flow:** `docs/architecture/05-implementation-roadmap.md:350-400` (post-onboarding experience)
- **Tech Stack:** `docs/architecture/04-tech-stack.md:50-100` (dashboard components)

## Referencias de Diseño Visual (GUIA_DISENO_VISUAL_NEURANT.md)
- **Dashboard Analytics:** `GUIA_DISENO_VISUAL_NEURANT.md:698-738` (KPIs overview, Cards con métricas iniciales)
- **Navegación:** `GUIA_DISENO_VISUAL_NEURANT.md:423-470` (Sidebar Navigation, breadcrumbs de welcome)
- **Botones:** `GUIA_DISENO_VISUAL_NEURANT.md:223-275` (CTAs para quick actions, primario para "Crear primer chatbot")
- **Estados y Feedback:** `GUIA_DISENO_VISUAL_NEURANT.md:472-532` (Success celebration, Progress bars para checklist)
- **Estados Vacío:** `GUIA_DISENO_VISUAL_NEURANT.md:978-999` (Empty states amigables para dashboard inicial)
- **Tipografía:** `GUIA_DISENO_VISUAL_NEURANT.md:116-149` (Display L para welcome, Heading XL para títulos principales)
- **Colores:** `GUIA_DISENO_VISUAL_NEURANT.md:53-114` (Naranja para elementos de celebration, Verde para completados)
- **Responsive Design:** `GUIA_DISENO_VISUAL_NEURANT.md:824-867` (Grid adaptativo para checklist y quick actions)
- **Accesibilidad:** `GUIA_DISENO_VISUAL_NEURANT.md:869-923` (WCAG 2.1 AA para transiciones post-onboarding)
- **Recomendaciones Técnicas:** `GUIA_DISENO_VISUAL_NEURANT.md:1219-1235` (shadcn/ui componentes), `GUIA_DISENO_VISUAL_NEURANT.md:1356-1363` (TanStack Query para dashboard data)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E6-06a ✅ (onboarding flow pages)
  - [x] TASK-P1E6-06b ✅ (company creation API)
  - [x] TASK-P1E6-06c ✅ (onboarding wizard UI)
  - [x] TASK-P1E2-02d ✅ (dashboard layout)
- **Bloquea:**
  - [ ] TASK-P2E3-03a (chatbot management dashboard)
  - [ ] TASK-P2E4-04a (conversation management)

## UI/UX Specifications
### Design Requirements
- **Layout:** Welcome hero section + progress cards + quick actions + next steps
- **Responsive:** Mobile-first, optimizado para desktop primary usage
- **Theme:** Celebratory y motivacional con clear CTAs
- **Accessibility:** WCAG 2.1 AA - keyboard navigation, screen readers, high contrast

### Component Structure
```tsx
// Main welcome dashboard
interface WelcomeDashboardProps {
  companyData: CompanyData
  onboardingData: OnboardingConfiguration
  onComplete: () => void
}

// Welcome sections
interface WelcomeHeroProps {
  companyName: string
  completedSteps: number
  totalSteps: number
}

interface OnboardingProgressProps {
  sections: OnboardingSection[]
  completedSections: string[]
  onSectionClick: (section: string) => void
}

interface QuickActionsProps {
  companyData: CompanyData
  enabledActions: string[]
  onActionClick: (action: string) => void
}

interface NextStepsProps {
  steps: NextStep[]
  onStepComplete: (stepId: string) => void
  onSkip: () => void
}
```

## Criterios de Aceptación Específicos
### Functional Requirements
- [x] Welcome hero con celebración de completion y company personalization
- [x] Progress summary mostrando configuración completada
- [x] Quick actions para tareas comunes (crear chatbot, ver analytics, etc.)
- [x] Next steps checklist con enlaces directos
- [x] Tutorial launcher integrado
- [x] Smooth transition a dashboard principal
- [x] Analytics tracking para onboarding completion

### Visual Requirements
- [x] Celebratory animations y visual feedback
- [x] Progress visualization con completion indicators
- [x] Card-based layout con hover interactions
- [x] Consistent branding con company personalization
- [x] Loading states para async data fetching
- [x] Success states para completed actions

### Accessibility Requirements
- [x] Heading hierarchy apropiada (h1, h2, h3)
- [x] ARIA landmarks para navigation sections
- [x] Keyboard navigation entre actions y steps
- [x] Screen reader friendly progress announcements
- [x] Focus indicators claros en todos los CTAs
- [x] Skip links para usuarios con prisa

### Integration Requirements
- [x] Company data integration para personalization
- [x] Onboarding configuration display
- [x] Quick actions routing a feature modules
- [x] Tutorial system integration
- [x] Analytics tracking integration
- [x] Dashboard navigation integration

## Archivos a Crear/Modificar
```
# Main Welcome Dashboard
app/dashboard/welcome/page.tsx                    # Welcome dashboard route
components/dashboard/welcome/WelcomeDashboard.tsx # Main welcome container

# Welcome Sections
components/dashboard/welcome/WelcomeHero.tsx          # Hero celebration section
components/dashboard/welcome/OnboardingProgress.tsx   # Configuration progress
components/dashboard/welcome/QuickActions.tsx         # Action cards
components/dashboard/welcome/NextSteps.tsx           # Checklist component
components/dashboard/welcome/CompanyOverview.tsx     # Company setup summary
components/dashboard/welcome/TutorialLauncher.tsx    # Tutorial integration

# Action Components
components/dashboard/welcome/actions/CreateChatbotAction.tsx  # Quick chatbot creation
components/dashboard/welcome/actions/ViewAnalyticsAction.tsx  # Analytics preview
components/dashboard/welcome/actions/InviteTeamAction.tsx     # Team invitation
components/dashboard/welcome/actions/ConfigureChannelsAction.tsx # Channel setup

# Tutorial Components
components/dashboard/welcome/tutorials/WelcomeTour.tsx        # Product tour
components/dashboard/welcome/tutorials/FeatureSpotlight.tsx   # Feature highlights
components/dashboard/welcome/tutorials/VideoPlayer.tsx       # Tutorial videos

# Hooks & State
hooks/useWelcomeDashboard.ts                     # Welcome dashboard state
hooks/useOnboardingProgress.ts                   # Progress tracking
hooks/useTutorialManager.ts                      # Tutorial state management
store/welcome-dashboard-store.ts                 # Zustand welcome state

# Utils & Data
utils/next-steps-generator.ts                    # Dynamic next steps
utils/quick-actions-config.ts                    # Available actions config
data/tutorial-content.ts                         # Tutorial content data
types/welcome-dashboard.ts                       # Welcome dashboard types
```

## Implementation Structure

### Main Welcome Dashboard Page
```tsx
// app/dashboard/welcome/page.tsx
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WelcomeDashboard } from '@/components/dashboard/welcome/WelcomeDashboard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bienvenido - NeurAnt Dashboard',
  description: 'Completa tu configuración y comienza a usar NeurAnt',
  robots: 'noindex'
}

interface WelcomePageProps {
  searchParams: {
    onboarding?: string
    tour?: string
  }
}

export default async function WelcomePage({ searchParams }: WelcomePageProps) {
  const supabase = createClient()
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Get company data and onboarding status
  const { data: companyData, error: companyError } = await supabase
    .from('COMPANIES')
    .select(`
      *,
      COMPANY_USERS!inner(role, is_active),
      COMPANY_SUBSCRIPTIONS(
        id,
        status,
        SUBSCRIPTION_PLANS(name)
      )
    `)
    .eq('COMPANY_USERS.user_id', user.id)
    .eq('COMPANY_USERS.is_active', true)
    .single()

  if (companyError || !companyData) {
    redirect('/signup')
  }

  // Get onboarding configuration
  const { data: onboardingConfig } = await supabase
    .from('ONBOARDING_CONFIGURATIONS')
    .select('*')
    .eq('company_id', companyData.id)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Suspense fallback={<WelcomeDashboardSkeleton />}>
        <WelcomeDashboard
          companyData={companyData}
          onboardingData={onboardingConfig}
          userRole={companyData.COMPANY_USERS[0].role}
          showTour={searchParams.tour === 'true'}
          isFromOnboarding={searchParams.onboarding === 'complete'}
        />
      </Suspense>
    </div>
  )
}

const WelcomeDashboardSkeleton = () => (
  <div className="container mx-auto px-4 py-8 space-y-8">
    <div className="animate-pulse">
      <div className="h-32 bg-muted rounded-lg mb-8"></div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-lg"></div>
        ))}
      </div>
    </div>
  </div>
)
```

### Main Welcome Dashboard Component
```tsx
// components/dashboard/welcome/WelcomeDashboard.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWelcomeDashboard } from '@/hooks/useWelcomeDashboard'
import { useTutorialManager } from '@/hooks/useTutorialManager'
import { WelcomeHero } from './WelcomeHero'
import { OnboardingProgress } from './OnboardingProgress'
import { QuickActions } from './QuickActions'
import { NextSteps } from './NextSteps'
import { CompanyOverview } from './CompanyOverview'
import { TutorialLauncher } from './TutorialLauncher'
import { WelcomeTour } from './tutorials/WelcomeTour'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRight, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

interface WelcomeDashboardProps {
  companyData: CompanyData
  onboardingData?: OnboardingConfiguration
  userRole: string
  showTour?: boolean
  isFromOnboarding?: boolean
}

export const WelcomeDashboard: React.FC<WelcomeDashboardProps> = ({
  companyData,
  onboardingData,
  userRole,
  showTour,
  isFromOnboarding
}) => {
  const router = useRouter()
  const [showCelebration, setShowCelebration] = useState(isFromOnboarding)
  
  const {
    progress,
    quickActions,
    nextSteps,
    loading,
    error,
    completeStep,
    dismissWelcome
  } = useWelcomeDashboard(companyData.id, onboardingData)

  const {
    startTour,
    tourActive,
    tourStep,
    nextTourStep,
    endTour
  } = useTutorialManager()

  // Trigger celebration animation
  useEffect(() => {
    if (isFromOnboarding) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
        toast.success('¡Bienvenido a NeurAnt! 🎉')
      }, 500)
    }
  }, [isFromOnboarding])

  // Auto-start tour if requested
  useEffect(() => {
    if (showTour && !tourActive) {
      setTimeout(() => startTour('welcome'), 1000)
    }
  }, [showTour])

  const handleGetStarted = () => {
    if (nextSteps.length > 0) {
      // Navigate to first next step
      const firstStep = nextSteps[0]
      if (firstStep.action) {
        router.push(firstStep.action)
      }
    } else {
      // Go to main dashboard
      dismissWelcome()
      router.push('/dashboard')
    }
  }

  const handleStartTour = () => {
    startTour('welcome')
  }

  const completionPercentage = progress.totalSteps > 0 
    ? Math.round((progress.completedSteps / progress.totalSteps) * 100)
    : 0

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Cargando tu dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Tour */}
      {tourActive && (
        <WelcomeTour
          step={tourStep}
          onNext={nextTourStep}
          onEnd={endTour}
          companyName={companyData.name}
        />
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Welcome Hero */}
      <WelcomeHero
        companyName={companyData.name}
        completedSteps={progress.completedSteps}
        totalSteps={progress.totalSteps}
        completionPercentage={completionPercentage}
        isFromOnboarding={isFromOnboarding}
        userRole={userRole}
      />

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Progress & Overview */}
        <div className="lg:col-span-1 space-y-6">
          <OnboardingProgress
            sections={progress.sections}
            completedSections={progress.completedSections}
            onSectionClick={(section) => {
              // Navigate to section configuration
              router.push(`/dashboard/settings/${section}`)
            }}
          />
          
          <CompanyOverview
            companyData={companyData}
            onboardingData={onboardingData}
          />
        </div>

        {/* Right Column - Actions & Next Steps */}
        <div className="lg:col-span-2 space-y-6">
          <QuickActions
            actions={quickActions}
            companyData={companyData}
            onActionClick={(action) => {
              // Track action click
              // analytics.track('welcome_quick_action_clicked', { action })
              
              if (action.route) {
                router.push(action.route)
              }
            }}
          />
          
          <NextSteps
            steps={nextSteps}
            onStepComplete={(stepId) => {
              completeStep(stepId)
              toast.success('¡Paso completado!')
            }}
            onSkip={() => {
              dismissWelcome()
              router.push('/dashboard')
            }}
          />
        </div>
      </div>

      {/* Bottom Actions */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                ¿Listo para comenzar?
              </h3>
              <p className="text-muted-foreground mt-1">
                Explora todas las características de NeurAnt y maximiza tu experiencia
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleStartTour}
                disabled={tourActive}
              >
                Ver Tour Guiado
              </Button>
              
              <Button
                onClick={handleGetStarted}
                className="min-w-32"
              >
                Comenzar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tutorial Launcher (Floating) */}
      <TutorialLauncher
        onStartTour={handleStartTour}
        completionPercentage={completionPercentage}
      />
    </div>
  )
}
```

### Welcome Hero Component
```tsx
// components/dashboard/welcome/WelcomeHero.tsx
'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Sparkles, Trophy } from 'lucide-react'

interface WelcomeHeroProps {
  companyName: string
  completedSteps: number
  totalSteps: number
  completionPercentage: number
  isFromOnboarding?: boolean
  userRole: string
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({
  companyName,
  completedSteps,
  totalSteps,
  completionPercentage,
  isFromOnboarding,
  userRole
}) => {
  const getWelcomeMessage = () => {
    if (isFromOnboarding) {
      return "¡Felicitaciones! Has completado la configuración inicial"
    }
    if (completionPercentage === 100) {
      return "¡Excelente! Tu configuración está completa"
    }
    if (completionPercentage >= 75) {
      return "¡Casi terminamos! Solo faltan algunos pasos"
    }
    return "¡Bienvenido! Vamos a completar tu configuración"
  }

  const getMotivationalMessage = () => {
    if (completionPercentage === 100) {
      return "Tu empresa está lista para aprovechar al máximo NeurAnt"
    }
    if (completionPercentage >= 75) {
      return "Estás muy cerca de tener todo configurado perfectamente"
    }
    return "Personaliza tu experiencia para obtener mejores resultados"
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-primary/10 to-secondary/5 border-primary/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
      </div>
      
      <CardContent className="relative p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left Side - Welcome Content */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <motion.div
                initial={isFromOnboarding ? { scale: 0, rotate: -180 } : false}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.6 }}
              >
                {completionPercentage === 100 ? (
                  <Trophy className="w-8 h-8 text-yellow-600" />
                ) : (
                  <Sparkles className="w-8 h-8 text-primary" />
                )}
              </motion.div>
              
              <div>
                <Badge variant="secondary" className="mb-2">
                  {getRoleBadge(userRole)}
                </Badge>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {getWelcomeMessage()}
                </h1>
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground max-w-2xl">
              Bienvenido a <span className="font-semibold text-primary">{companyName}</span> en NeurAnt. {getMotivationalMessage()}
            </p>

            {/* Progress Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Progreso de configuración
                </span>
                <span className="text-sm text-muted-foreground">
                  {completedSteps} de {totalSteps} completados
                </span>
              </div>
              
              <div className="space-y-2">
                <Progress value={completionPercentage} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span className="font-medium text-primary">
                    {completionPercentage}%
                  </span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Completion Status */}
          <div className="flex-shrink-0">
            <motion.div
              initial={isFromOnboarding ? { scale: 0, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center p-6 bg-background/50 rounded-lg border border-border/50"
            >
              <div className="relative">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                  completionPercentage === 100 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  {completionPercentage === 100 ? (
                    <CheckCircle className="w-10 h-10" />
                  ) : (
                    <span className="text-2xl font-bold">{completionPercentage}%</span>
                  )}
                </div>
                
                {isFromOnboarding && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                  >
                    <Sparkles className="w-3 h-3 text-yellow-800" />
                  </motion.div>
                )}
              </div>
              
              <div className="mt-3">
                <div className="font-semibold text-sm">
                  {completionPercentage === 100 ? '¡Completado!' : 'En progreso'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Configuración inicial
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Celebration Message */}
        {isFromOnboarding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                ¡Excelente! Has completado el proceso de onboarding exitosamente.
              </span>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

function getRoleBadge(role: string): string {
  const badges = {
    owner: '👑 Propietario',
    admin: '⚙️ Administrador',
    supervisor: '👥 Supervisor',
    operator: '🎧 Operador'
  }
  return badges[role] || '👤 Usuario'
}
```

### Quick Actions Component
```tsx
// components/dashboard/welcome/QuickActions.tsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Settings, 
  Phone,
  ArrowRight,
  Zap
} from 'lucide-react'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  route: string
  badge?: string
  enabled: boolean
  priority: 'high' | 'medium' | 'low'
}

interface QuickActionsProps {
  actions: QuickAction[]
  companyData: CompanyData
  onActionClick: (action: QuickAction) => void
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  companyData,
  onActionClick
}) => {
  // Sort actions by priority and enabled status
  const sortedActions = actions
    .sort((a, b) => {
      if (a.enabled !== b.enabled) return a.enabled ? -1 : 1
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
    .slice(0, 6) // Show max 6 actions

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Acciones Rápidas
          </h2>
          <p className="text-sm text-muted-foreground">
            Comienza con las tareas más importantes para {companyData.name}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedActions.map((action) => (
          <Card
            key={action.id}
            className={`group cursor-pointer transition-all duration-200 hover:shadow-lg ${
              action.enabled 
                ? 'hover:scale-[1.02] border-border hover:border-primary/50' 
                : 'opacity-60'
            }`}
            onClick={() => action.enabled && onActionClick(action)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg transition-colors ${
                  action.enabled 
                    ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {action.icon}
                </div>
                
                {action.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {action.badge}
                  </Badge>
                )}
              </div>
              
              <div>
                <CardTitle className="text-base group-hover:text-primary transition-colors">
                  {action.title}
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  {action.description}
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <Button
                variant={action.enabled ? "default" : "secondary"}
                size="sm"
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                disabled={!action.enabled}
              >
                {action.enabled ? 'Ir ahora' : 'Próximamente'}
                {action.enabled && <ArrowRight className="w-3 h-3 ml-2" />}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Default quick actions configuration
export const getDefaultQuickActions = (companyData: CompanyData, hasOnboarding: boolean): QuickAction[] => [
  {
    id: 'create-chatbot',
    title: 'Crear mi primer chatbot',
    description: 'Configura un asistente virtual para tu empresa',
    icon: <Bot className="w-5 h-5" />,
    route: '/dashboard/chatbots/create',
    badge: 'Recomendado',
    enabled: hasOnboarding,
    priority: 'high'
  },
  {
    id: 'view-analytics',
    title: 'Ver métricas',
    description: 'Analiza el rendimiento de tus chatbots',
    icon: <BarChart3 className="w-5 h-5" />,
    route: '/dashboard/analytics',
    enabled: hasOnboarding,
    priority: 'medium'
  },
  {
    id: 'invite-team',
    title: 'Invitar equipo',
    description: 'Añade miembros a tu organización',
    icon: <Users className="w-5 h-5" />,
    route: '/dashboard/team/invite',
    enabled: true,
    priority: 'high'
  },
  {
    id: 'test-conversation',
    title: 'Probar conversación',
    description: 'Simula una conversación con tu chatbot',
    icon: <MessageSquare className="w-5 h-5" />,
    route: '/dashboard/conversations/test',
    enabled: hasOnboarding,
    priority: 'medium'
  },
  {
    id: 'configure-channels',
    title: 'Configurar canales',
    description: 'Conecta WhatsApp, web chat y más',
    icon: <Phone className="w-5 h-5" />,
    route: '/dashboard/channels',
    enabled: true,
    priority: 'medium'
  },
  {
    id: 'customize-settings',
    title: 'Personalizar configuración',
    description: 'Ajusta la configuración de tu empresa',
    icon: <Settings className="w-5 h-5" />,
    route: '/dashboard/settings',
    enabled: true,
    priority: 'low'
  }
]
```

### Next Steps Component
```tsx
// components/dashboard/welcome/NextSteps.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  ArrowRight, 
  Target,
  ExternalLink
} from 'lucide-react'

export interface NextStep {
  id: string
  title: string
  description: string
  estimatedTime: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  action?: string
  external?: boolean
  category: 'setup' | 'content' | 'team' | 'launch'
}

interface NextStepsProps {
  steps: NextStep[]
  onStepComplete: (stepId: string) => void
  onSkip: () => void
}

export const NextSteps: React.FC<NextStepsProps> = ({
  steps,
  onStepComplete,
  onSkip
}) => {
  const [showAll, setShowAll] = useState(false)
  
  const prioritySteps = steps
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

  const visibleSteps = showAll ? prioritySteps : prioritySteps.slice(0, 5)
  const completedSteps = steps.filter(step => step.completed).length
  const completionPercentage = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      setup: '⚙️',
      content: '📝',
      team: '👥',
      launch: '🚀'
    }
    return icons[category] || '📋'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Próximos Pasos
            </CardTitle>
            <CardDescription>
              Completa estos pasos para aprovechar al máximo NeurAnt
            </CardDescription>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {completedSteps}/{steps.length}
            </div>
            <div className="text-xs text-muted-foreground">
              completados
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={completionPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(completionPercentage)}% completado</span>
            <span>Tiempo estimado: {getTotalEstimatedTime(steps)} min</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Steps List */}
        <div className="space-y-3">
          {visibleSteps.map((step) => (
            <div
              key={step.id}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                step.completed 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-background hover:bg-muted border-border'
              }`}
            >
              {/* Completion Checkbox */}
              <div className="flex-shrink-0 pt-1">
                {step.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <button
                    onClick={() => onStepComplete(step.id)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Circle className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{getCategoryIcon(step.category)}</span>
                  <h4 className={`font-medium ${step.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {step.title}
                  </h4>
                  <Badge variant="outline" className={`text-xs ${getPriorityColor(step.priority)}`}>
                    {step.priority}
                  </Badge>
                </div>
                
                <p className={`text-sm ${step.completed ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                  {step.description}
                </p>
                
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {step.estimatedTime}
                  </div>
                  
                  {step.action && !step.completed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => window.open(step.action, step.external ? '_blank' : '_self')}
                    >
                      Ir
                      {step.external ? (
                        <ExternalLink className="w-3 h-3 ml-1" />
                      ) : (
                        <ArrowRight className="w-3 h-3 ml-1" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Show More/Less */}
        {steps.length > 5 && (
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Mostrar menos' : `Ver ${steps.length - 5} pasos más`}
            </Button>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onSkip}
          >
            Omitir por ahora
          </Button>
          
          <div className="text-xs text-muted-foreground">
            Puedes completar estos pasos en cualquier momento
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getTotalEstimatedTime(steps: NextStep[]): number {
  return steps
    .filter(step => !step.completed)
    .reduce((total, step) => {
      const timeMatch = step.estimatedTime.match(/(\d+)/)
      return total + (timeMatch ? parseInt(timeMatch[1]) : 5)
    }, 0)
}

// Default next steps generator
export const generateNextSteps = (
  companyData: CompanyData, 
  onboardingData?: OnboardingConfiguration
): NextStep[] => {
  const steps: NextStep[] = []
  
  // Setup steps
  if (!onboardingData?.chatbot) {
    steps.push({
      id: 'create-first-chatbot',
      title: 'Crear tu primer chatbot',
      description: 'Configura un asistente virtual personalizado para tu empresa',
      estimatedTime: '10 min',
      priority: 'high',
      completed: false,
      action: '/dashboard/chatbots/create',
      category: 'setup'
    })
  }
  
  if (!onboardingData?.channels?.enabledChannels?.length) {
    steps.push({
      id: 'setup-channels',
      title: 'Configurar canales de comunicación',
      description: 'Conecta WhatsApp, web chat u otros canales',
      estimatedTime: '15 min',
      priority: 'high',
      completed: false,
      action: '/dashboard/channels/setup',
      category: 'setup'
    })
  }
  
  // Content steps
  steps.push({
    id: 'upload-knowledge-base',
    title: 'Subir base de conocimiento',
    description: 'Añade documentos y FAQ para respuestas más precisas',
    estimatedTime: '20 min',
    priority: 'medium',
    completed: false,
    action: '/dashboard/knowledge-base',
    category: 'content'
  })
  
  // Team steps
  if (companyData.members_count <= 1) {
    steps.push({
      id: 'invite-team-members',
      title: 'Invitar miembros del equipo',
      description: 'Añade colegas para colaborar en la gestión de chatbots',
      estimatedTime: '5 min',
      priority: 'medium',
      completed: false,
      action: '/dashboard/team/invite',
      category: 'team'
    })
  }
  
  // Launch steps
  steps.push({
    id: 'test-chatbot',
    title: 'Probar tu chatbot',
    description: 'Realiza una conversación de prueba antes del lanzamiento',
    estimatedTime: '5 min',
    priority: 'high',
    completed: false,
    action: '/dashboard/conversations/test',
    category: 'launch'
  })
  
  steps.push({
    id: 'review-analytics',
    title: 'Revisar configuración de analytics',
    description: 'Configura métricas y reportes para medir el éxito',
    estimatedTime: '10 min',
    priority: 'low',
    completed: false,
    action: '/dashboard/analytics/setup',
    category: 'launch'
  })
  
  return steps
}
```

### Welcome Dashboard Hook
```tsx
// hooks/useWelcomeDashboard.ts
'use client'

import { useState, useEffect } from 'react'
import { getDefaultQuickActions, type QuickAction } from '@/components/dashboard/welcome/QuickActions'
import { generateNextSteps, type NextStep } from '@/components/dashboard/welcome/NextSteps'

interface OnboardingProgress {
  completedSteps: number
  totalSteps: number
  sections: OnboardingSection[]
  completedSections: string[]
}

interface OnboardingSection {
  key: string
  title: string
  completed: boolean
  optional: boolean
}

export const useWelcomeDashboard = (companyId: string, onboardingData?: OnboardingConfiguration) => {
  const [progress, setProgress] = useState<OnboardingProgress>({
    completedSteps: 0,
    totalSteps: 0,
    sections: [],
    completedSections: []
  })
  const [quickActions, setQuickActions] = useState<QuickAction[]>([])
  const [nextSteps, setNextSteps] = useState<NextStep[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true)
        
        // Calculate onboarding progress
        const sections: OnboardingSection[] = [
          {
            key: 'chatbot',
            title: 'Configuración de Chatbot',
            completed: !!onboardingData?.chatbot,
            optional: false
          },
          {
            key: 'channels',
            title: 'Canales de Comunicación',
            completed: !!onboardingData?.channels?.enabledChannels?.length,
            optional: true
          },
          {
            key: 'notifications',
            title: 'Notificaciones',
            completed: !!onboardingData?.notifications,
            optional: true
          },
          {
            key: 'preferences',
            title: 'Preferencias',
            completed: !!onboardingData?.preferences,
            optional: true
          }
        ]

        const completedSections = sections.filter(s => s.completed).map(s => s.key)
        const requiredSections = sections.filter(s => !s.optional)
        const completedRequired = requiredSections.filter(s => s.completed).length

        setProgress({
          completedSteps: completedSections.length,
          totalSteps: sections.length,
          sections,
          completedSections
        })

        // Get company data for actions
        const companyResponse = await fetch(`/api/companies/${companyId}`)
        const companyData = await companyResponse.json()

        // Generate quick actions
        const actions = getDefaultQuickActions(companyData.data, !!onboardingData)
        setQuickActions(actions)

        // Generate next steps
        const steps = generateNextSteps(companyData.data, onboardingData)
        setNextSteps(steps)

      } catch (error) {
        console.error('Error initializing welcome dashboard:', error)
        setError('Error cargando dashboard')
      } finally {
        setLoading(false)
      }
    }

    initializeDashboard()
  }, [companyId, onboardingData])

  const completeStep = async (stepId: string) => {
    try {
      // Mark step as completed
      setNextSteps(prev => 
        prev.map(step => 
          step.id === stepId 
            ? { ...step, completed: true }
            : step
        )
      )

      // Track completion
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'welcome_step_completed',
          properties: { stepId, companyId }
        })
      })

    } catch (error) {
      console.error('Error completing step:', error)
    }
  }

  const dismissWelcome = async () => {
    try {
      // Mark welcome as dismissed
      await fetch(`/api/companies/${companyId}/welcome`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismissed: true })
      })

      // Track dismissal
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'welcome_dismissed',
          properties: { companyId }
        })
      })

    } catch (error) {
      console.error('Error dismissing welcome:', error)
    }
  }

  return {
    progress,
    quickActions,
    nextSteps,
    loading,
    error,
    completeStep,
    dismissWelcome
  }
}
```

### Tutorial Manager Hook
```tsx
// hooks/useTutorialManager.ts
'use client'

import { useState } from 'react'

export interface TutorialStep {
  id: string
  title: string
  content: string
  target?: string
  position: 'top' | 'bottom' | 'left' | 'right'
  action?: {
    label: string
    onClick: () => void
  }
}

export const useTutorialManager = () => {
  const [tourActive, setTourActive] = useState(false)
  const [tourStep, setTourStep] = useState(0)
  const [tourType, setTourType] = useState<string>('')

  const tutorials = {
    welcome: [
      {
        id: 'welcome-1',
        title: '¡Bienvenido a NeurAnt!',
        content: 'Te guiaremos por las características principales para que puedas comenzar rápidamente.',
        position: 'bottom' as const
      },
      {
        id: 'welcome-2',
        title: 'Tu Progreso',
        content: 'Aquí puedes ver el progreso de tu configuración inicial. Completa todos los pasos para una mejor experiencia.',
        target: '[data-tour="progress"]',
        position: 'right' as const
      },
      {
        id: 'welcome-3',
        title: 'Acciones Rápidas',
        content: 'Usa estas acciones para realizar las tareas más comunes de forma rápida.',
        target: '[data-tour="quick-actions"]',
        position: 'top' as const
      },
      {
        id: 'welcome-4',
        title: 'Próximos Pasos',
        content: 'Esta lista te ayuda a completar la configuración paso a paso. Puedes marcar elementos como completados.',
        target: '[data-tour="next-steps"]',
        position: 'left' as const
      }
    ]
  }

  const startTour = (type: string) => {
    setTourType(type)
    setTourStep(0)
    setTourActive(true)
  }

  const nextTourStep = () => {
    const currentTutorial = tutorials[tourType as keyof typeof tutorials] || []
    if (tourStep < currentTutorial.length - 1) {
      setTourStep(prev => prev + 1)
    } else {
      endTour()
    }
  }

  const previousTourStep = () => {
    if (tourStep > 0) {
      setTourStep(prev => prev - 1)
    }
  }

  const endTour = () => {
    setTourActive(false)
    setTourStep(0)
    setTourType('')
  }

  const getCurrentStep = (): TutorialStep | null => {
    const currentTutorial = tutorials[tourType as keyof typeof tutorials]
    return currentTutorial?.[tourStep] || null
  }

  return {
    tourActive,
    tourStep,
    tourType,
    startTour,
    nextTourStep,
    previousTourStep,
    endTour,
    getCurrentStep,
    totalSteps: tutorials[tourType as keyof typeof tutorials]?.length || 0
  }
}
```

## Performance & Analytics
```tsx
// Performance optimizations
import { memo, useMemo } from 'react'
import { IntersectionObserver } from '@/hooks/useIntersectionObserver'

export const OptimizedWelcomeSection = memo<WelcomeSectionProps>(({ data }) => {
  const { ref, inView } = useIntersectionObserver()
  
  // Only render when in view
  return (
    <div ref={ref}>
      {inView && <ExpensiveWelcomeComponent data={data} />}
    </div>
  )
})

// Analytics integration
export const trackWelcomeEvent = (eventName: string, properties: Record<string, any>) => {
  // analytics.track(`welcome_${eventName}`, {
  //   ...properties,
  //   timestamp: new Date().toISOString(),
  //   page: 'welcome_dashboard'
  // })
}
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- Welcome Dashboard: Sistema completo de bienvenida post-onboarding
- Components: 8 componentes principales con animations y celebrations
- Tutorial system: Guided tour con steps y tooltips
- Epic 6 COMPLETED: Todos los 4 componentes de onboarding implementados
- Phase 1 Foundation: ✅ COMPLETADA - 24/24 tareas definidas
- Next phase: Phase 2 - Core Features ready para iniciar
- Analytics integration: Event tracking para onboarding funnel
```

---
*Frontend UI task para completar el sistema de onboarding con welcome dashboard*