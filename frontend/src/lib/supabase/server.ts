/**
 * Supabase Server Client - Cliente para Server-Side Rendering
 * 
 * Este cliente se utiliza en Server Components, API Routes,
 * y middleware para operaciones del lado del servidor.
 */

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// Validar variables de entorno críticas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

/**
 * Cliente para Server Components (app directory)
 * Utiliza cookies para mantener la sesión del usuario
 */
export const createServerSupabaseClient = () => {
  return createServerComponentClient<Database>({
    cookies,
  })
}

/**
 * Cliente para API Routes y Route Handlers
 * Utiliza cookies para mantener la sesión del usuario
 */
export const createRouteHandlerSupabaseClient = () => {
  return createRouteHandlerClient<Database>({
    cookies,
  })
}

/**
 * Cliente administrativo con Service Role Key
 * USAR CON PRECAUCIÓN - Bypassa RLS
 */
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

/**
 * Helper para obtener la sesión del usuario en server components
 */
export async function getServerSession() {
  const supabase = createServerSupabaseClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting server session:', error)
      return null
    }
    
    return session
  } catch (error) {
    console.error('Server session error:', error)
    return null
  }
}

/**
 * Helper para obtener el usuario actual en server components
 */
export async function getServerUser() {
  const supabase = createServerSupabaseClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting server user:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Server user error:', error)
    return null
  }
}

/**
 * Test de conexión para el servidor
 */
export async function testServerConnection() {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist yet
      throw error
    }
    
    console.log('✅ Supabase server connection successful')
    return { success: true }
  } catch (error) {
    console.error('❌ Supabase server connection failed:', error)
    return { success: false, error }
  }
}