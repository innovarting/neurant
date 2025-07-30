/**
 * Supabase Auth Helper Functions - NeurAnt
 * 
 * Funciones avanzadas para manejo de autenticación, autorización y multi-tenancy.
 * Incluye utilidades para RBAC, gestión de companies e invitaciones.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import type { 
  UserRole, 
  AuthUser, 
  SignUpData, 
  SignInData, 
  InvitationData 
} from '@/types/auth'

/**
 * Create Supabase server client for auth operations
 */
async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

/**
 * Obtener usuario actual con perfil y company
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createSupabaseServerClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return null

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('id', user.id)
    .single()

  if (profileError || !profile || !profile.company) return null

  return {
    user,
    profile,
    company: profile.company
  }
}

/**
 * Verificar si usuario tiene el rol requerido o superior
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    'owner': 4,
    'admin': 3,
    'supervisor': 2,
    'operador': 1
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Verificar si usuario puede acceder a una company específica
 */
export async function canAccessCompany(companyId: string): Promise<boolean> {
  const currentUser = await getCurrentUser()
  return currentUser?.profile.company_id === companyId
}

/**
 * Obtener rol de usuario actual
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const currentUser = await getCurrentUser()
  return currentUser?.profile.role as UserRole ?? null
}

/**
 * Verificar si usuario puede realizar una acción específica
 */
export async function canPerformAction(
  action: 'view' | 'create' | 'update' | 'delete',
  resource: 'chatbots' | 'users' | 'company' | 'invitations',
  targetUserId?: string
): Promise<boolean> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return false

  const userRole = currentUser.profile.role as UserRole

  // Lógica de permisos basada en roles y recursos
  switch (resource) {
    case 'company':
      return hasRole(userRole, 'admin')
    
    case 'chatbots':
      if (action === 'view') return hasRole(userRole, 'operador')
      return hasRole(userRole, 'supervisor')
    
    case 'users':
      if (action === 'view') return hasRole(userRole, 'supervisor')
      if (targetUserId === currentUser.user.id) return true // Usuario puede editar su propio perfil
      return hasRole(userRole, 'admin')
    
    case 'invitations':
      return hasRole(userRole, 'admin')
    
    default:
      return false
  }
}

/**
 * Crear invitación para nuevo usuario
 */
export async function createInvitation(
  invitationData: InvitationData
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    if (!hasRole(currentUser.profile.role as UserRole, 'admin')) {
      return { success: false, error: 'Permisos insuficientes para crear invitaciones' }
    }

    const { data, error } = await supabase
      .from('user_invitations')
      .insert({
        email: invitationData.email,
        role: invitationData.role,
        company_id: currentUser.profile.company_id,
        invited_by: currentUser.user.id
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Aceptar invitación usando token
 */
export async function acceptInvitation(
  token: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    
    const { data: invitation, error } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('invitation_token', token)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !invitation) {
      return { success: false, error: 'Invitación inválida o expirada' }
    }

    return { success: true, data: invitation }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Obtener invitaciones pendientes de la company
 */
export async function getPendingInvitations() {
  const supabase = await createSupabaseServerClient()
  const currentUser = await getCurrentUser()
  
  if (!currentUser) return []

  const { data, error } = await supabase
    .from('user_invitations')
    .select('*')
    .eq('company_id', currentUser.profile.company_id)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) return []
  return data || []
}

/**
 * Obtener usuarios de la company
 */
export async function getCompanyUsers() {
  const supabase = await createSupabaseServerClient()
  const currentUser = await getCurrentUser()
  
  if (!currentUser) return []

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('company_id', currentUser.profile.company_id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) return []
  return data || []
}

/**
 * Actualizar último login
 */
export async function updateLastLogin(): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await supabase
        .from('user_profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id)
    }
  } catch (error) {
    console.error('Error updating last login:', error)
  }
}

/**
 * Revocar invitación
 */
export async function revokeInvitation(
  invitationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    const currentUser = await getCurrentUser()
    
    if (!currentUser || !hasRole(currentUser.profile.role as UserRole, 'admin')) {
      return { success: false, error: 'Permisos insuficientes' }
    }

    const { error } = await supabase
      .from('user_invitations')
      .delete()
      .eq('id', invitationId)
      .eq('company_id', currentUser.profile.company_id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Actualizar rol de usuario
 */
export async function updateUserRole(
  userId: string, 
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    const currentUser = await getCurrentUser()
    
    if (!currentUser || !hasRole(currentUser.profile.role as UserRole, 'admin')) {
      return { success: false, error: 'Permisos insuficientes' }
    }

    // No permitir cambio de rol owner
    if (newRole === 'owner') {
      return { success: false, error: 'No se puede asignar el rol de owner' }
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .eq('company_id', currentUser.profile.company_id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}