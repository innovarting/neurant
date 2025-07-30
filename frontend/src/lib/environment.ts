/**
 * Environment Detection and Utilities
 * 
 * Provides utilities for detecting the current environment
 * and environment-specific configurations.
 */

export type Environment = 'development' | 'preview' | 'production'

/**
 * Get the current environment from NEXT_PUBLIC_APP_ENV
 */
export const getEnvironment = (): Environment => {
  const env = process.env.NEXT_PUBLIC_APP_ENV as Environment
  
  // Validate environment value
  if (['development', 'preview', 'production'].includes(env)) {
    return env
  }
  
  // Fallback logic based on NODE_ENV
  if (process.env.NODE_ENV === 'production') {
    return 'production'
  }
  
  return 'development'
}

/**
 * Environment check utilities
 */
export const isDevelopment = (): boolean => getEnvironment() === 'development'
export const isPreview = (): boolean => getEnvironment() === 'preview'
export const isProduction = (): boolean => getEnvironment() === 'production'

/**
 * Runtime environment checks
 */
export const isServer = (): boolean => typeof window === 'undefined'
export const isClient = (): boolean => typeof window !== 'undefined'

/**
 * Get environment-specific configuration
 */
export const getEnvironmentConfig = () => {
  const env = getEnvironment()
  
  const configs = {
    development: {
      debug: true,
      apiTimeout: 30000,
      logLevel: 'debug' as const,
      enableDevTools: true,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    },
    preview: {
      debug: true,
      apiTimeout: 15000,
      logLevel: 'info' as const,
      enableDevTools: false,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL
    },
    production: {
      debug: false,
      apiTimeout: 10000,
      logLevel: 'error' as const,
      enableDevTools: false,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL
    }
  }
  
  return configs[env]
}

/**
 * Environment-specific feature flags
 */
export const getFeatureFlags = () => {
  const env = getEnvironment()
  
  return {
    // Development features
    showDebugInfo: env === 'development',
    enableHotReload: env === 'development',
    showDetailedErrors: env !== 'production',
    
    // Preview features  
    enablePreviewBanner: env === 'preview',
    allowTestData: env !== 'production',
    
    // Production features
    enableAnalytics: env === 'production',
    enableErrorReporting: env === 'production',
    enablePerformanceMonitoring: env === 'production'
  }
}

/**
 * Get database configuration based on environment
 */
export const getDatabaseConfig = () => {
  const env = getEnvironment()
  
  // Development and Preview use DEV database
  // Production uses PROD database
  const configs = {
    development: {
      projectId: 'wydcmmsxdhentmoxthnu',
      url: 'https://wydcmmsxdhentmoxthnu.supabase.co',
      description: 'DEV Database',
      projectType: 'DEV' as const
    },
    preview: {
      projectId: 'wydcmmsxdhentmoxthnu', 
      url: 'https://wydcmmsxdhentmoxthnu.supabase.co',
      description: 'DEV Database (Preview)',
      projectType: 'DEV' as const
    },
    production: {
      projectId: 'ewyyekypuzgurwgnouxp',
      url: 'https://ewyyekypuzgurwgnouxp.supabase.co', 
      description: 'PROD Database',
      projectType: 'PROD' as const
    }
  }
  
  return configs[env]
}

/**
 * Logging utility with environment-aware levels
 */
export const createLogger = (context: string) => {
  const config = getEnvironmentConfig()
  
  return {
    debug: (...args: unknown[]) => {
      if (config.logLevel === 'debug') {
        console.log(`[${context}]`, ...args)
      }
    },
    info: (...args: unknown[]) => {
      if (['debug', 'info'].includes(config.logLevel)) {
        console.info(`[${context}]`, ...args)
      }
    },
    warn: (...args: unknown[]) => {
      console.warn(`[${context}]`, ...args)
    },
    error: (...args: unknown[]) => {
      console.error(`[${context}]`, ...args)
    }
  }
}

/**
 * Environment information for debugging
 */
export const getEnvironmentInfo = () => {
  return {
    environment: getEnvironment(),
    nodeEnv: process.env.NODE_ENV,
    isServer: isServer(),
    isClient: isClient(),
    config: getEnvironmentConfig(),
    features: getFeatureFlags(),
    database: getDatabaseConfig(),
    timestamp: new Date().toISOString()
  }
}