/**
 * Supabase Client - Cliente para componentes React
 * 
 * Este cliente se utiliza en componentes del lado del cliente
 * y maneja automáticamente las cookies de sesión.
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

// Validar que las variables de entorno estén configuradas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Cliente para componentes React
export const supabase = createClientComponentClient<Database>()

// Configuración del cliente
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
}

// Helper para verificar la conexión
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist yet
      throw error
    }
    
    console.log('✅ Supabase client connection successful')
    return { success: true, environment: supabaseConfig.environment }
  } catch (error) {
    console.error('❌ Supabase client connection failed:', error)
    return { success: false, error }
  }
}