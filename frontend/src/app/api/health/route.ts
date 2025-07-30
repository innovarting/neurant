/**
 * Health Check API Route
 * 
 * Endpoint para verificar el estado del deployment, conectividad
 * con servicios externos y configuración de environment.
 */

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { getEnvironment, getEnvironmentInfo } from '@/lib/environment'
import { validateEnvironment } from '@/lib/validate-env'
import { appConfig } from '@/config/app'

export async function GET() {
  try {
    // Validar environment
    const envValidation = validateEnvironment()
    const envInfo = getEnvironmentInfo()
    
    if (!envValidation.isValid) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Environment configuration invalid',
          errors: envValidation.errors,
          warnings: envValidation.warnings,
          environment: envValidation.environment,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }

    // Test básico de conexión a Supabase
    const { error } = await supabase.auth.getSession()
    
    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Supabase connection failed',
          error: error.message,
          environment: envValidation.environment,
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }

    // Verificar database configuration
    const dbConfig = appConfig.supabase.project
    const isCorrectDb = (
      (envValidation.environment === 'production' && dbConfig.projectType === 'PROD') ||
      (envValidation.environment !== 'production' && dbConfig.projectType === 'DEV')
    )

    // Health check exitoso
    return NextResponse.json({
      status: 'healthy',
      message: 'NeurAnt API is running',
      
      // Environment information
      environment: {
        name: envValidation.environment,
        nodeEnv: process.env.NODE_ENV,
        isServer: envInfo.isServer,
        config: {
          debug: appConfig.development.debug,
          logLevel: appConfig.development.logLevel
        }
      },

      // Application information
      application: {
        name: appConfig.app.name,
        version: appConfig.app.version,
        url: appConfig.app.url,
        description: appConfig.app.description
      },

      // Database information
      database: {
        projectType: dbConfig.projectType,
        projectId: dbConfig.projectId,
        description: dbConfig.description,
        connected: true,
        isCorrectForEnvironment: isCorrectDb
      },

      // Feature flags
      features: {
        enableAuth: appConfig.features.enableAuth,
        enableChatbots: appConfig.features.enableChatbots,
        enableAnalytics: appConfig.features.enableAnalytics,
        showDebugInfo: appConfig.features.showDebugInfo
      },

      // Integration status
      integrations: {
        openai: appConfig.integrations.openai.enabled,
        n8n: appConfig.integrations.n8n.enabled,
        google: appConfig.integrations.google.enabled,
        sentry: appConfig.integrations.sentry.enabled
      },

      // Validation status
      validation: {
        isValid: envValidation.isValid,
        warnings: envValidation.warnings,
        totalRequiredVars: Object.keys(envValidation.requiredVars).length,
        totalFutureVars: Object.keys(envValidation.futureVars).length
      },

      // Runtime information
      runtime: {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version
      }
    })

  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
        environment: getEnvironment(),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Permitir GET method
export const runtime = 'edge'