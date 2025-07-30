/**
 * Application Configuration
 * 
 * Central configuration file that combines environment variables
 * with application-specific settings and feature flags.
 */

import { getEnvironment, getEnvironmentConfig, getFeatureFlags, getDatabaseConfig } from '@/lib/environment'
import { getValidatedEnv } from '@/lib/validate-env'

// Get validated environment variables
const env = getValidatedEnv()
const envConfig = getEnvironmentConfig()
const features = getFeatureFlags()
const dbConfig = getDatabaseConfig()

/**
 * Application Configuration Object
 */
export const appConfig = {
  // Application Metadata
  app: {
    name: env.NEXT_PUBLIC_APP_NAME,
    version: env.NEXT_PUBLIC_APP_VERSION,
    url: env.NEXT_PUBLIC_APP_URL,
    environment: getEnvironment(),
    description: 'NeurAnt - AI-Powered Business Assistant'
  },

  // Supabase Configuration
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    project: dbConfig
  },

  // API Configuration
  api: {
    timeout: envConfig.apiTimeout,
    retries: envConfig.debug ? 1 : 3,
    baseUrl: env.NEXT_PUBLIC_APP_URL,
    version: 'v1'
  },

  // Development Configuration
  development: {
    debug: envConfig.debug,
    logLevel: envConfig.logLevel,
    enableDevTools: envConfig.enableDevTools,
    showDetailedErrors: features.showDetailedErrors,
    hotReload: features.enableHotReload
  },

  // Feature Flags
  features: {
    // Authentication
    enableAuth: true,
    enableOAuth: false, // Will be enabled later
    enableMagicLinks: false, // Will be enabled later
    
    // Core Features
    enableChatbots: true,
    enableConversations: true,
    enableAnalytics: true,
    
    // Advanced Features (Future)
    enableRAG: false,
    enableHITL: false,
    enableIntegrations: false,
    
    // UI Features
    enableThemeToggle: false, // Will be enabled later
    enableNotifications: false, // Will be enabled later
    enableRealtime: false, // Will be enabled later
    
    // Monitoring & Analytics
    enableAnalyticsTracking: features.enableAnalytics,
    enableErrorReporting: features.enableErrorReporting,
    enablePerformanceMonitoring: features.enablePerformanceMonitoring,
    
    // Development Features
    showDebugInfo: features.showDebugInfo,
    enablePreviewBanner: features.enablePreviewBanner,
    allowTestData: features.allowTestData
  },

  // External Integrations (Future)
  integrations: {
    openai: {
      apiKey: env.OPENAI_API_KEY,
      enabled: !!env.OPENAI_API_KEY,
      model: 'gpt-4-turbo',
      maxTokens: 4000
    },
    n8n: {
      webhookUrl: env.N8N_WEBHOOK_URL,
      enabled: !!env.N8N_WEBHOOK_URL,
      timeout: 30000
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      enabled: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
    },
    sentry: {
      dsn: env.SENTRY_DSN,
      enabled: !!env.SENTRY_DSN && getEnvironment() === 'production'
    }
  },

  // UI Configuration
  ui: {
    // Theme
    defaultTheme: 'light' as const,
    enableThemeToggle: false,
    
    // Layout
    sidebar: {
      defaultCollapsed: false,
      collapsible: true
    },
    
    // Navigation
    navigation: {
      enableBreadcrumbs: true,
      enableSearchShortcuts: true
    },
    
    // Data Display
    pagination: {
      defaultPageSize: 20,
      pageSizeOptions: [10, 20, 50, 100]
    },
    
    // Forms
    forms: {
      autoSave: false, // Will be enabled later
      validateOnChange: true,
      showFieldErrors: true
    }
  },

  // Security Configuration
  security: {
    // Session
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    refreshTokenThreshold: 5 * 60 * 1000, // 5 minutes
    
    // Rate Limiting (values for client-side logic)
    rateLimits: {
      apiCalls: 100, // per minute
      uploads: 10, // per minute
      auth: 5 // per minute
    },
    
    // Content Security
    allowedDomains: [
      env.NEXT_PUBLIC_APP_URL,
      env.NEXT_PUBLIC_SUPABASE_URL,
      'https://vercel.com'
    ],
    
    // File Upload
    upload: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/*', 'application/pdf', 'text/*'],
      maxFiles: 5
    }
  },

  // Performance Configuration
  performance: {
    // Caching
    cache: {
      queryStaleTime: 5 * 60 * 1000, // 5 minutes
      queryCacheTime: 10 * 60 * 1000, // 10 minutes
      enablePersistence: true
    },
    
    // Loading
    loadingStates: {
      minLoadingTime: 300, // Prevent flash
      maxLoadingTime: 30000, // 30 seconds timeout
      showSkeletons: true
    },
    
    // Images
    images: {
      enableOptimization: true,
      quality: 85,
      formats: ['webp', 'avif', 'jpeg']
    }
  },

  // Validation Status
  _meta: {
    validationStatus: env._validation,
    configCreatedAt: new Date().toISOString(),
    environment: getEnvironment()
  }
} as const

/**
 * Environment-specific configurations
 */
export const getAppConfig = () => appConfig

/**
 * Type-safe config access
 */
export type AppConfig = typeof appConfig

/**
 * Configuration validation
 */
export const validateAppConfig = () => {
  const validation = appConfig._meta.validationStatus
  
  if (!validation.isValid) {
    console.error('❌ Application configuration is invalid:', validation.errors)
    return false
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Application configuration warnings:', validation.warnings)
  }
  
  console.log(`✅ Application configuration loaded for ${validation.environment}`)
  return true
}

/**
 * Debug configuration (development only)
 */
export const debugAppConfig = () => {
  if (!appConfig.development.debug) {
    console.warn('Debug mode is disabled')
    return
  }
  
  console.group('🔧 Application Configuration Debug')
  console.log('Environment:', appConfig.app.environment)
  console.log('Features:', appConfig.features)
  console.log('Integrations:', Object.entries(appConfig.integrations).map(([key, config]) => ({
    [key]: { enabled: config.enabled }
  })))
  console.log('Performance:', appConfig.performance)
  console.groupEnd()
  
  return appConfig
}