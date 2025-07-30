# Frontend UI: Onboarding Wizard Configuration

## Identificación
- **ID:** TASK-P1E6-06c
- **Título:** Onboarding Wizard UI Components
- **Type:** Frontend UI
- **Phase:** 1 - Foundation
- **Epic:** Epic 6 - Organization Onboarding
- **Sprint:** Sprint 6
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 10 horas
- **Prioridad:** Crítica

## Definición Técnica
Implementar componentes de UI para el wizard de configuración inicial dentro del flujo de onboarding, incluyendo configuración de chatbot, canales, notificaciones, y preferencias de empresa. Componentes reutilizables con validación, preview en tiempo real, y integración con APIs backend.

## Referencias de Documentación NeurAnt
- **UI/UX Requirements:** `docs/architecture/08-especificaciones-tecnicas.md:450-500` (wizard configuration design)
- **Component Specs:** `docs/architecture/11-interfaces-contratos-rbac.md:300-350` (configuration interfaces)
- **User Flow:** `docs/architecture/05-implementation-roadmap.md:300-350` (onboarding wizard flow)
- **Tech Stack:** `docs/architecture/04-tech-stack.md:50-100` (React components + forms)

## Referencias de Diseño Visual (GUIA_DISENO_VISUAL_NEURANT.md)
- **🎯 PATRÓN CRÍTICO - Onboarding Ultra-Rápido:** `GUIA_DISENO_VISUAL_NEURANT.md:536-610` (5 pasos completos con especificaciones exactas)
- **Configuración de IA:** `GUIA_DISENO_VISUAL_NEURANT.md:612-642` (Panel entrenamiento, Estados procesamiento)
- **Formularios:** `GUIA_DISENO_VISUAL_NEURANT.md:277-342` (Input Fields, Labels, Validación para wizard steps)
- **Botones:** `GUIA_DISENO_VISUAL_NEURANT.md:223-275` (Botón Primario para "Continuar", Secundario para navegación)
- **Estados y Feedback:** `GUIA_DISENO_VISUAL_NEURANT.md:472-532` (Progress bars, Loading states, Success celebration)
- **Marketplace Integraciones:** `GUIA_DISENO_VISUAL_NEURANT.md:740-776` (Grid integraciones, Wizard instalación)
- **Responsive Design:** `GUIA_DISENO_VISUAL_NEURANT.md:824-867` (Mobile-first para wizard steps)
- **Accesibilidad:** `GUIA_DISENO_VISUAL_NEURANT.md:869-923` (WCAG 2.1 AA para flujos críticos de setup)
- **Recomendaciones Técnicas:** `GUIA_DISENO_VISUAL_NEURANT.md:1219-1235` (shadcn/ui componentes), `GUIA_DISENO_VISUAL_NEURANT.md:1367-1380` (React Hook Form para multi-step)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E6-06a ✅ (onboarding flow pages)
  - [x] TASK-P1E6-06b ✅ (company creation API)
  - [x] TASK-P1E2-02d ✅ (dashboard layout components)
- **Bloquea:**
  - [ ] TASK-P1E6-06d (welcome dashboard integration)
  - [ ] TASK-P2E3-03a (advanced chatbot configuration)

## UI/UX Specifications
### Design Requirements
- **Layout:** Multi-tab wizard con configuración por categorías
- **Responsive:** Mobile-first, optimizado para tablet onboarding experience
- **Theme:** Consistent design system con preview components
- **Accessibility:** WCAG 2.1 AA - form navigation, skip links, screen readers

### Component Structure
```tsx
// Main configuration wizard
interface OnboardingWizardProps {
  companyData: CompanyData
  onComplete: (config: InitialConfig) => void
  onBack: () => void
  loading?: boolean
}

// Configuration sections
interface ChatbotConfigProps {
  initialData?: ChatbotConfig
  onUpdate: (config: ChatbotConfig) => void
  preview?: boolean
}

interface ChannelsConfigProps {
  initialData?: ChannelsConfig
  onUpdate: (config: ChannelsConfig) => void
  companyIndustry: string
}

interface NotificationsConfigProps {
  initialData?: NotificationsConfig
  onUpdate: (config: NotificationsConfig) => void
  userEmail: string
}

interface PreferencesConfigProps {
  initialData?: PreferencesConfig
  onUpdate: (config: PreferencesConfig) => void
  companyTimezone: string
}
```

## Criterios de Aceptación Específicos
### Functional Requirements
- [x] 4-section configuration wizard: Chatbot → Channels → Notifications → Preferences
- [x] Tab navigation entre secciones con progress tracking
- [x] Real-time preview para chatbot configuration
- [x] Form validation con mensajes descriptivos en español
- [x] Auto-save draft configuration en localStorage
- [x] Skip options para configuración opcional
- [x] Integration con company creation APIs

### Visual Requirements
- [x] Tabbed interface clara con iconos descriptivos
- [x] Preview components para mostrar configuración en acción
- [x] Progress indicators específicos por sección
- [x] Consistent spacing y typography del design system
- [x] Loading states durante saves y updates
- [x] Success feedback tras completar cada sección

### Accessibility Requirements
- [x] Tab keyboard navigation entre secciones
- [x] ARIA labels para tab panels y controls
- [x] Focus management entre form fields
- [x] Skip links para saltar secciones opcionales
- [x] Screen reader announcements para progress updates
- [x] High contrast para preview components

### Integration Requirements
- [x] Company data pre-filled donde aplicable
- [x] Industry-specific defaults para chatbot y channels
- [x] Timezone-aware configuration para notifications
- [x] Backend API integration para save configuration
- [x] Error handling con retry mechanisms
- [x] Configuration validation antes de submit

## Archivos a Crear/Modificar
```
# Main Wizard Components
components/onboarding/wizard/OnboardingWizard.tsx       # Main wizard container
components/onboarding/wizard/WizardNavigation.tsx      # Tab navigation
components/onboarding/wizard/WizardProgress.tsx        # Progress tracking
components/onboarding/wizard/ConfigurationPreview.tsx  # Real-time preview

# Configuration Sections
components/onboarding/wizard/sections/ChatbotConfig.tsx      # Chatbot setup
components/onboarding/wizard/sections/ChannelsConfig.tsx     # Communication channels
components/onboarding/wizard/sections/NotificationsConfig.tsx # Notification preferences
components/onboarding/wizard/sections/PreferencesConfig.tsx  # Company preferences

# Preview Components
components/onboarding/wizard/previews/ChatbotPreview.tsx     # Chatbot conversation preview
components/onboarding/wizard/previews/ChannelPreview.tsx     # Channel integration preview
components/onboarding/wizard/previews/NotificationPreview.tsx # Notification sample

# Form Components
components/onboarding/wizard/forms/ChatbotForm.tsx          # Chatbot configuration form
components/onboarding/wizard/forms/ChannelSelectionForm.tsx # Channel selection
components/onboarding/wizard/forms/NotificationForm.tsx     # Notification settings
components/onboarding/wizard/forms/PreferencesForm.tsx      # Company preferences

# Hooks & State
hooks/useWizardConfiguration.ts                # Configuration state management
hooks/useConfigurationPreview.ts               # Preview data processing
hooks/useIndustryDefaults.ts                   # Industry-specific defaults
store/wizard-configuration-store.ts            # Zustand configuration store

# Utils & Validation
utils/wizard-validation.ts                     # Configuration validation schemas
utils/industry-defaults.ts                     # Default configurations by industry
utils/configuration-utils.ts                   # Helper functions
types/wizard-configuration.ts                  # Configuration type definitions
```

## Implementation Structure

### Main Onboarding Wizard Component
```tsx
// components/onboarding/wizard/OnboardingWizard.tsx
'use client'

import { useState, useEffect } from 'react'
import { useWizardConfiguration } from '@/hooks/useWizardConfiguration'
import { useIndustryDefaults } from '@/hooks/useIndustryDefaults'
import { WizardNavigation } from './WizardNavigation'
import { WizardProgress } from './WizardProgress'
import { ConfigurationPreview } from './ConfigurationPreview'
import { ChatbotConfig } from './sections/ChatbotConfig'
import { ChannelsConfig } from './sections/ChannelsConfig'
import { NotificationsConfig } from './sections/NotificationsConfig'
import { PreferencesConfig } from './sections/PreferencesConfig'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export type WizardSection = 'chatbot' | 'channels' | 'notifications' | 'preferences'

interface OnboardingWizardProps {
  companyData: CompanyData
  onComplete: (config: InitialConfig) => void
  onBack: () => void
  loading?: boolean
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  companyData,
  onComplete,
  onBack,
  loading
}) => {
  const [activeSection, setActiveSection] = useState<WizardSection>('chatbot')
  const [showPreview, setShowPreview] = useState(false)

  const {
    configuration,
    updateChatbotConfig,
    updateChannelsConfig,
    updateNotificationsConfig,
    updatePreferencesConfig,
    validateConfiguration,
    saveConfiguration,
    loading: configLoading,
    error
  } = useWizardConfiguration()

  const {
    getIndustryDefaults,
    loading: defaultsLoading
  } = useIndustryDefaults()

  // Initialize with industry defaults
  useEffect(() => {
    const initializeDefaults = async () => {
      try {
        const defaults = await getIndustryDefaults(companyData.industry)
        
        // Pre-fill configurations with industry-specific defaults
        if (defaults.chatbot) {
          updateChatbotConfig(defaults.chatbot)
        }
        if (defaults.channels) {
          updateChannelsConfig(defaults.channels)
        }
        if (defaults.notifications) {
          updateNotificationsConfig(defaults.notifications)
        }
        if (defaults.preferences) {
          updatePreferencesConfig(defaults.preferences)
        }
      } catch (error) {
        console.error('Error loading industry defaults:', error)
        // Continue with empty configuration
      }
    }

    initializeDefaults()
  }, [companyData.industry])

  const sections = [
    {
      key: 'chatbot' as const,
      title: 'Chatbot',
      description: 'Configura tu primer asistente virtual',
      icon: '🤖',
      required: false
    },
    {
      key: 'channels' as const,
      title: 'Canales',
      description: 'Conecta tus canales de comunicación',
      icon: '📱',
      required: false
    },
    {
      key: 'notifications' as const,
      title: 'Notificaciones',
      description: 'Configura alertas y notificaciones',
      icon: '🔔',
      required: false
    },
    {
      key: 'preferences' as const,
      title: 'Preferencias',
      description: 'Personaliza tu experiencia',
      icon: '⚙️',
      required: false
    }
  ]

  const handleSectionComplete = (section: WizardSection) => {
    const currentIndex = sections.findIndex(s => s.key === section)
    const nextSection = sections[currentIndex + 1]
    
    if (nextSection) {
      setActiveSection(nextSection.key)
    }
    
    toast.success(`${sections[currentIndex].title} configurado exitosamente`)
  }

  const handleComplete = async () => {
    try {
      const isValid = validateConfiguration(configuration)
      
      if (!isValid) {
        toast.error('Por favor completa la configuración requerida')
        return
      }

      await saveConfiguration(companyData.id, configuration)
      onComplete(configuration)
      
    } catch (error) {
      toast.error('Error guardando configuración')
    }
  }

  const completedSections = sections.filter(section => {
    const config = configuration[section.key]
    return config && Object.keys(config).length > 0
  }).length

  const progressPercentage = (completedSections / sections.length) * 100

  if (defaultsLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Cargando configuración inicial...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Configuración Inicial</h2>
        </div>
        <p className="text-muted-foreground">
          Personaliza tu experiencia con NeurAnt. Puedes modificar estas configuraciones más tarde.
        </p>
      </div>

      {/* Progress */}
      <WizardProgress
        sections={sections}
        activeSection={activeSection}
        completedSections={completedSections}
        progressPercentage={progressPercentage}
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {sections.find(s => s.key === activeSection)?.icon}
                  </span>
                  <div>
                    <CardTitle>
                      {sections.find(s => s.key === activeSection)?.title}
                    </CardTitle>
                    <CardDescription>
                      {sections.find(s => s.key === activeSection)?.description}
                    </CardDescription>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="hidden md:flex"
                >
                  {showPreview ? 'Ocultar' : 'Preview'}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Tab Navigation */}
              <WizardNavigation
                sections={sections}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                configuration={configuration}
              />

              {/* Section Content */}
              {activeSection === 'chatbot' && (
                <ChatbotConfig
                  companyData={companyData}
                  initialData={configuration.chatbot}
                  onUpdate={updateChatbotConfig}
                  onComplete={() => handleSectionComplete('chatbot')}
                />
              )}

              {activeSection === 'channels' && (
                <ChannelsConfig
                  companyData={companyData}
                  initialData={configuration.channels}
                  onUpdate={updateChannelsConfig}
                  onComplete={() => handleSectionComplete('channels')}
                />
              )}

              {activeSection === 'notifications' && (
                <NotificationsConfig
                  companyData={companyData}
                  initialData={configuration.notifications}
                  onUpdate={updateNotificationsConfig}
                  onComplete={() => handleSectionComplete('notifications')}
                />
              )}

              {activeSection === 'preferences' && (
                <PreferencesConfig
                  companyData={companyData}
                  initialData={configuration.preferences}
                  onUpdate={updatePreferencesConfig}
                  onComplete={() => handleSectionComplete('preferences')}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className={`${showPreview ? 'block' : 'hidden lg:block'}`}>
          <ConfigurationPreview
            activeSection={activeSection}
            configuration={configuration}
            companyData={companyData}
          />
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={loading || configLoading}
        >
          ← Atrás
        </Button>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {completedSections} de {sections.length} secciones configuradas
          </div>
          
          <Button
            onClick={handleComplete}
            disabled={loading || configLoading}
          >
            {loading || configLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              'Completar Configuración →'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### Wizard Navigation Component
```tsx
// components/onboarding/wizard/WizardNavigation.tsx
'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { WizardSection } from './OnboardingWizard'

interface WizardSection {
  key: WizardSection
  title: string
  description: string
  icon: string
  required: boolean
}

interface WizardNavigationProps {
  sections: WizardSection[]
  activeSection: WizardSection
  onSectionChange: (section: WizardSection) => void
  configuration: Record<string, any>
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  sections,
  activeSection,
  onSectionChange,
  configuration
}) => {
  const isSectionCompleted = (sectionKey: string) => {
    const config = configuration[sectionKey]
    return config && Object.keys(config).length > 0
  }

  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {sections.map((section) => {
          const isActive = activeSection === section.key
          const isCompleted = isSectionCompleted(section.key)
          
          return (
            <button
              key={section.key}
              onClick={() => onSectionChange(section.key)}
              className={cn(
                'flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-lg">{section.icon}</span>
              <span>{section.title}</span>
              {isCompleted && (
                <Check className="w-4 h-4 text-green-600" />
              )}
              {section.required && !isCompleted && (
                <span className="text-red-500 text-xs">*</span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
```

### Chatbot Configuration Section
```tsx
// components/onboarding/wizard/sections/ChatbotConfig.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChatbotForm } from '../forms/ChatbotForm'
import { ChatbotPreview } from '../previews/ChatbotPreview'
import { chatbotConfigSchema, type ChatbotConfig } from '@/utils/wizard-validation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Bot, MessageSquare, Settings, Sparkles } from 'lucide-react'

interface ChatbotConfigProps {
  companyData: CompanyData
  initialData?: Partial<ChatbotConfig>
  onUpdate: (config: ChatbotConfig) => void
  onComplete: () => void
}

export const ChatbotConfig: React.FC<ChatbotConfigProps> = ({
  companyData,
  initialData,
  onUpdate,
  onComplete
}) => {
  const [previewMode, setPreviewMode] = useState<'basic' | 'advanced'>('basic')

  const form = useForm<ChatbotConfig>({
    resolver: zodResolver(chatbotConfigSchema),
    defaultValues: {
      name: initialData?.name || `Asistente de ${companyData.name}`,
      description: initialData?.description || 'Asistente virtual para atención al cliente',
      welcomeMessage: initialData?.welcomeMessage || '¡Hola! ¿En qué puedo ayudarte hoy?',
      personality: initialData?.personality || 'friendly',
      language: initialData?.language || 'es',
      features: {
        humanHandoff: initialData?.features?.humanHandoff ?? true,
        knowledgeBase: initialData?.features?.knowledgeBase ?? false,
        analytics: initialData?.features?.analytics ?? true,
        customResponses: initialData?.features?.customResponses ?? false
      },
      ...initialData
    }
  })

  const formData = form.watch()

  // Update parent component when form changes
  React.useEffect(() => {
    if (form.formState.isValid) {
      onUpdate(formData)
    }
  }, [formData, form.formState.isValid])

  const handleSave = () => {
    if (form.formState.isValid) {
      onComplete()
    }
  }

  const personalityOptions = [
    {
      value: 'friendly',
      label: 'Amigable',
      description: 'Conversacional y cercano',
      emoji: '😊'
    },
    {
      value: 'professional',
      label: 'Profesional',
      description: 'Formal y directo',
      emoji: '💼'
    },
    {
      value: 'helpful',
      label: 'Servicial',
      description: 'Enfocado en resolver problemas',
      emoji: '🤝'
    },
    {
      value: 'expert',
      label: 'Experto',
      description: 'Técnico y detallado',
      emoji: '🎓'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Quick Setup vs Custom */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Configuración del Chatbot
          </h3>
          <p className="text-sm text-muted-foreground">
            Crea tu primer asistente virtual
          </p>
        </div>
        
        <Badge variant="secondary" className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          IA Integrada
        </Badge>
      </div>

      <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Configuración Básica
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Avanzado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          {/* Basic Configuration */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre del chatbot
                </label>
                <input
                  {...form.register('name')}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="ej. Asistente de Ventas"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Mensaje de bienvenida
                </label>
                <textarea
                  {...form.register('welcomeMessage')}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="¡Hola! ¿En qué puedo ayudarte hoy?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Personalidad
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {personalityOptions.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors',
                        form.watch('personality') === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-input hover:bg-muted'
                      )}
                    >
                      <input
                        type="radio"
                        value={option.value}
                        {...form.register('personality')}
                        className="sr-only"
                      />
                      <span className="text-lg">{option.emoji}</span>
                      <div>
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div>
              <ChatbotPreview
                config={formData}
                companyName={companyData.name}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          {/* Advanced Features */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Características Avanzadas
            </h4>
            
            <div className="grid gap-4 md:grid-cols-2">
              {/* Feature toggles */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Transferencia a Humano</CardTitle>
                  <CardDescription className="text-sm">
                    Permite transferir conversaciones complejas a agentes humanos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...form.register('features.humanHandoff')}
                      className="rounded"
                    />
                    <span className="text-sm">Habilitar transferencia</span>
                  </label>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Base de Conocimiento</CardTitle>
                  <CardDescription className="text-sm">
                    Usa documentos y FAQ para respuestas más precisas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...form.register('features.knowledgeBase')}
                      className="rounded"
                    />
                    <span className="text-sm">Habilitar knowledge base</span>
                  </label>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Analytics</CardTitle>
                  <CardDescription className="text-sm">
                    Recopila métricas de conversaciones y satisfacción
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...form.register('features.analytics')}
                      className="rounded"
                    />
                    <span className="text-sm">Habilitar analytics</span>
                  </label>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Respuestas Personalizadas</CardTitle>
                  <CardDescription className="text-sm">
                    Define respuestas específicas para tu industria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...form.register('features.customResponses')}
                      className="rounded"
                    />
                    <span className="text-sm">Habilitar respuestas custom</span>
                  </label>
                </CardContent>
              </Card>
            </div>

            {/* Model Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configuración del Modelo IA</CardTitle>
                <CardDescription>
                  Ajusta el comportamiento de la inteligencia artificial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Creatividad (Temperature)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      {...form.register('modelConfig.temperature', { valueAsNumber: true })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Conservador</span>
                      <span>Creativo</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Longitud de respuesta
                    </label>
                    <select
                      {...form.register('modelConfig.maxTokens', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    >
                      <option value={500}>Corta (500 tokens)</option>
                      <option value={1000}>Media (1000 tokens)</option>
                      <option value={2000}>Larga (2000 tokens)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" size="sm">
          Usar plantilla predefinida
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => form.reset()}>
            Restablecer
          </Button>
          <Button
            onClick={handleSave}
            disabled={!form.formState.isValid}
          >
            Guardar Configuración
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### Chatbot Preview Component
```tsx
// components/onboarding/wizard/previews/ChatbotPreview.tsx
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bot, User, Send } from 'lucide-react'
import type { ChatbotConfig } from '@/utils/wizard-validation'

interface ChatbotPreviewProps {
  config: Partial<ChatbotConfig>
  companyName: string
}

interface Message {
  id: string
  content: string
  sender: 'bot' | 'user'
  timestamp: Date
}

export const ChatbotPreview: React.FC<ChatbotPreviewProps> = ({
  config,
  companyName
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: config.welcomeMessage || '¡Hola! ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    const botResponse: Message = {
      id: (Date.now() + 1).toString(),
      content: generateBotResponse(inputValue, config),
      sender: 'bot',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage, botResponse])
    setInputValue('')
  }

  const personalityStyles = {
    friendly: 'text-blue-600',
    professional: 'text-gray-700',
    helpful: 'text-green-600',
    expert: 'text-purple-600'
  }

  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bot className={cn(
            'w-4 h-4',
            personalityStyles[config.personality as keyof typeof personalityStyles] || 'text-primary'
          )} />
          {config.name || 'Preview del Chatbot'}
        </CardTitle>
        <div className="text-xs text-muted-foreground">
          Personalidad: {getPersonalityLabel(config.personality)} • {companyName}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-2',
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.sender === 'bot' && (
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                  personalityStyles[config.personality as keyof typeof personalityStyles] || 'bg-primary text-primary-foreground'
                )}>
                  <Bot className="w-3 h-3" />
                </div>
              )}
              
              <div
                className={cn(
                  'max-w-[70%] px-3 py-2 rounded-lg text-sm',
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                )}
              >
                {message.content}
              </div>
              
              {message.sender === 'user' && (
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">
                  <User className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Escribe un mensaje de prueba..."
              className="flex-1 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function generateBotResponse(userInput: string, config: Partial<ChatbotConfig>): string {
  const personality = config.personality || 'friendly'
  
  const responses = {
    friendly: [
      "¡Perfecto! Estoy aquí para ayudarte con eso. 😊",
      "¡Excelente pregunta! Déjame ayudarte con la información que necesitas.",
      "¡Hola! Me da mucho gusto poder asistirte con eso."
    ],
    professional: [
      "Entendido. Le ayudo con su consulta de inmediato.",
      "Gracias por su mensaje. Le proporciono la información solicitada.",
      "Recibido. Procedo a brindarle la asistencia requerida."
    ],
    helpful: [
      "¡Por supuesto! Estoy aquí para resolver todas tus dudas.",
      "Perfecto, voy a ayudarte a encontrar la mejor solución.",
      "¡Claro! Déjame guiarte paso a paso."
    ],
    expert: [
      "Basándome en mi conocimiento especializado, puedo ayudarte con eso.",
      "Excelente consulta. Permíteme compartir la información técnica relevante.",
      "Como experto en el tema, te proporciono la respuesta detallada."
    ]
  }
  
  const personalityResponses = responses[personality as keyof typeof responses] || responses.friendly
  return personalityResponses[Math.floor(Math.random() * personalityResponses.length)]
}

function getPersonalityLabel(personality?: string): string {
  const labels = {
    friendly: 'Amigable',
    professional: 'Profesional',
    helpful: 'Servicial',
    expert: 'Experto'
  }
  return labels[personality as keyof typeof labels] || 'Amigable'
}
```

### Configuration Hook
```tsx
// hooks/useWizardConfiguration.ts
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { ChatbotConfig, ChannelsConfig, NotificationsConfig, PreferencesConfig } from '@/utils/wizard-validation'

export interface WizardConfiguration {
  chatbot?: ChatbotConfig
  channels?: ChannelsConfig
  notifications?: NotificationsConfig
  preferences?: PreferencesConfig
}

export const useWizardConfiguration = () => {
  const [configuration, setConfiguration] = useState<WizardConfiguration>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateChatbotConfig = (config: ChatbotConfig) => {
    setConfiguration(prev => ({ ...prev, chatbot: config }))
    setError(null)
  }

  const updateChannelsConfig = (config: ChannelsConfig) => {
    setConfiguration(prev => ({ ...prev, channels: config }))
    setError(null)
  }

  const updateNotificationsConfig = (config: NotificationsConfig) => {
    setConfiguration(prev => ({ ...prev, notifications: config }))
    setError(null)
  }

  const updatePreferencesConfig = (config: PreferencesConfig) => {
    setConfiguration(prev => ({ ...prev, preferences: config }))
    setError(null)
  }

  const validateConfiguration = (config: WizardConfiguration): boolean => {
    // At minimum, we need chatbot configuration
    if (!config.chatbot?.name || !config.chatbot?.welcomeMessage) {
      return false
    }
    return true
  }

  const saveConfiguration = async (companyId: string, config: WizardConfiguration) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/onboarding/configuration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company_id: companyId,
          configuration: config
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save configuration')
      }

      toast.success('Configuración guardada exitosamente')
      return true

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error saving configuration'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const resetConfiguration = () => {
    setConfiguration({})
    setError(null)
  }

  return {
    configuration,
    updateChatbotConfig,
    updateChannelsConfig,
    updateNotificationsConfig,
    updatePreferencesConfig,
    validateConfiguration,
    saveConfiguration,
    resetConfiguration,
    loading,
    error
  }
}
```

### Validation Schemas
```typescript
// utils/wizard-validation.ts
import { z } from 'zod'

export const chatbotConfigSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(50, 'Nombre muy largo'),
  description: z.string().max(200, 'Descripción muy larga').optional(),
  welcomeMessage: z.string().min(10, 'Mensaje debe ser más descriptivo').max(300, 'Mensaje muy largo'),
  personality: z.enum(['friendly', 'professional', 'helpful', 'expert']),
  language: z.string().default('es'),
  features: z.object({
    humanHandoff: z.boolean().default(true),
    knowledgeBase: z.boolean().default(false),
    analytics: z.boolean().default(true),
    customResponses: z.boolean().default(false)
  }),
  modelConfig: z.object({
    temperature: z.number().min(0).max(1).default(0.7),
    maxTokens: z.number().min(100).max(4000).default(1000)
  }).optional()
})

export const channelsConfigSchema = z.object({
  enabledChannels: z.array(z.enum(['web', 'whatsapp', 'telegram', 'email', 'api'])),
  webConfig: z.object({
    domain: z.string().url().optional(),
    theme: z.enum(['light', 'dark', 'auto']).default('light'),
    position: z.enum(['bottom-right', 'bottom-left']).default('bottom-right')
  }).optional(),
  whatsappConfig: z.object({
    phoneNumber: z.string().optional(),
    businessAccountId: z.string().optional()
  }).optional()
})

export const notificationsConfigSchema = z.object({
  email: z.object({
    enabled: z.boolean().default(true),
    newConversations: z.boolean().default(true),
    escalations: z.boolean().default(true),
    dailyReports: z.boolean().default(false)
  }),
  inApp: z.object({
    enabled: z.boolean().default(true),
    sound: z.boolean().default(true),
    desktop: z.boolean().default(true)
  }),
  webhooks: z.object({
    enabled: z.boolean().default(false),
    url: z.string().url().optional(),
    events: z.array(z.string()).default([])
  }).optional()
})

export const preferencesConfigSchema = z.object({
  timezone: z.string().default('America/Mexico_City'),
  language: z.string().default('es'),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).default('DD/MM/YYYY'),
  theme: z.enum(['light', 'dark', 'auto']).default('light'),
  autoAssignments: z.boolean().default(true),
  workingHours: z.object({
    enabled: z.boolean().default(false),
    start: z.string().default('09:00'),
    end: z.string().default('18:00'),
    timezone: z.string().default('America/Mexico_City')
  })
})

export type ChatbotConfig = z.infer<typeof chatbotConfigSchema>
export type ChannelsConfig = z.infer<typeof channelsConfigSchema>
export type NotificationsConfig = z.infer<typeof notificationsConfigSchema>
export type PreferencesConfig = z.infer<typeof preferencesConfigSchema>
```

### Industry Defaults Hook
```tsx
// hooks/useIndustryDefaults.ts
'use client'

import { useState } from 'react'
import type { WizardConfiguration } from './useWizardConfiguration'

export const useIndustryDefaults = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getIndustryDefaults = async (industry: string): Promise<WizardConfiguration> => {
    try {
      setLoading(true)
      setError(null)

      // Industry-specific configurations
      const defaults: Record<string, WizardConfiguration> = {
        technology: {
          chatbot: {
            name: 'Asistente Técnico',
            welcomeMessage: '¡Hola! Soy tu asistente técnico. ¿En qué puedo ayudarte con nuestros productos?',
            personality: 'expert',
            language: 'es',
            features: {
              humanHandoff: true,
              knowledgeBase: true,
              analytics: true,
              customResponses: true
            }
          },
          channels: {
            enabledChannels: ['web', 'api', 'email'],
            webConfig: {
              theme: 'dark',
              position: 'bottom-right'
            }
          }
        },
        healthcare: {
          chatbot: {
            name: 'Asistente de Salud',
            welcomeMessage: 'Hola, soy tu asistente virtual de salud. ¿Cómo puedo ayudarte hoy?',
            personality: 'professional',
            language: 'es',
            features: {
              humanHandoff: true,
              knowledgeBase: false,
              analytics: true,
              customResponses: false
            }
          },
          channels: {
            enabledChannels: ['web', 'whatsapp'],
            webConfig: {
              theme: 'light',
              position: 'bottom-right'
            }
          }
        },
        finance: {
          chatbot: {
            name: 'Asesor Financiero',
            welcomeMessage: '¡Bienvenido! Soy tu asesor financiero virtual. ¿En qué puedo asesorarte?',
            personality: 'professional',
            language: 'es',
            features: {
              humanHandoff: true,
              knowledgeBase: true,
              analytics: true,
              customResponses: true
            }
          },
          channels: {
            enabledChannels: ['web', 'email'],
            webConfig: {
              theme: 'light',
              position: 'bottom-right'
            }
          }
        },
        retail: {
          chatbot: {
            name: 'Asistente de Ventas',
            welcomeMessage: '¡Hola! Te ayudo a encontrar exactamente lo que buscas. ¿Qué necesitas?',
            personality: 'friendly',
            language: 'es',
            features: {
              humanHandoff: true,
              knowledgeBase: false,
              analytics: true,
              customResponses: false
            }
          },
          channels: {
            enabledChannels: ['web', 'whatsapp', 'telegram'],
            webConfig: {
              theme: 'light',
              position: 'bottom-right'
            }
          }
        }
      }

      // Return industry-specific defaults or generic defaults
      return defaults[industry] || {
        chatbot: {
          name: 'Asistente Virtual',
          welcomeMessage: '¡Hola! ¿En qué puedo ayudarte hoy?',
          personality: 'friendly',
          language: 'es',
          features: {
            humanHandoff: true,
            knowledgeBase: false,
            analytics: true,
            customResponses: false
          }
        },
        channels: {
          enabledChannels: ['web'],
          webConfig: {
            theme: 'light',
            position: 'bottom-right'
          }
        }
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error loading defaults'
      setError(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    getIndustryDefaults,
    loading,
    error
  }
}
```

## Performance & Accessibility Features
```tsx
// Performance optimizations
import { memo, useMemo, useCallback } from 'react'
import { debounce } from 'lodash-es'

export const OptimizedWizardSection = memo<WizardSectionProps>(({
  data,
  onUpdate
}) => {
  // Debounce updates to prevent excessive API calls
  const debouncedUpdate = useCallback(
    debounce((config) => onUpdate(config), 500),
    [onUpdate]
  )

  // Memoize expensive computations
  const processedConfig = useMemo(() => {
    return processConfiguration(data)
  }, [data])

  return <div>{/* Component JSX */}</div>
})

// Accessibility enhancements
export const AccessibleWizardTab = ({ section, isActive, onClick }) => {
  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${section.key}`}
      onClick={onClick}
      className="wizard-tab"
    >
      {section.title}
    </button>
  )
}
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- Wizard UI: 4-section configuration wizard completamente implementado
- Components: 8 componentes principales + forms + previews
- Real-time preview: Chatbot preview interactivo con personality styles
- Next task: TASK-P1E6-06d (Welcome dashboard)
- Industry defaults: Configuraciones predefinidas por industria
- Validation: Comprehensive Zod schemas con error handling
- Accessibility: WCAG 2.1 AA compliance con keyboard navigation
```

---
*Frontend UI task para implementar wizard completo de configuración inicial*