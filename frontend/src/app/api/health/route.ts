/**
 * Health Check API Route
 * 
 * Endpoint para verificar el estado del deployment y conectividad
 * con servicios externos como Supabase.
 */

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    // Verificar variables de entorno críticas
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing environment variables',
          missing: missingVars,
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
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }

    // Health check exitoso
    return NextResponse.json({
      status: 'healthy',
      message: 'NeurAnt API is running',
      environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        connected: true
      },
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
    })

  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Permitir GET method
export const runtime = 'edge'