/**
 * Authentication and Authorization Types - NeurAnt
 * 
 * Tipos específicos para el sistema de autenticación RBAC con multi-tenancy.
 * Incluye interfaces para usuarios, roles, companies y invitaciones.
 */

import type { User } from '@supabase/supabase-js'
import type { UserProfile, Company, UserInvitation } from './database'

export type UserRole = 'owner' | 'admin' | 'supervisor' | 'operador'

export interface ExtendedUserProfile extends UserProfile {
  company?: Company
}

export interface AuthUser {
  user: User
  profile: ExtendedUserProfile
  company: Company
}

export interface SignUpData {
  email: string
  password: string
  first_name: string
  last_name: string
  company_name?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface InvitationData {
  email: string
  role: UserRole
  message?: string
}

export interface AuthSession {
  user: User
  profile: UserProfile
  company: Company
}

// Legacy interfaces (backward compatibility)
export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
  name: string
}
