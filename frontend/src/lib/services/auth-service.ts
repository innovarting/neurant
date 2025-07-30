/**
 * Authentication Service - NeurAnt
 * 
 * Servicio centralizado para operaciones de autenticación.
 * Maneja signup, signin, password reset, invitaciones y gestión de usuarios.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import type { UserRole } from '@/types/auth'
import type { 
  SignUpRequest, 
  SignInRequest, 
  InviteUserRequest,
  UpdateProfileRequest,
  UpdateCompanyRequest,
  UpdateUserRoleRequest
} from '@/lib/validations/auth'

export class AuthService {
  private static getSupabase() {
    const cookieStore = cookies()
    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )
  }

  // User Registration
  static async signUp(data: SignUpRequest) {
    const supabase = this.getSupabase()
    
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          company_name: data.companyName
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify`
      }
    })

    if (error) throw error

    return {
      user: authData.user,
      session: authData.session,
      needsVerification: !authData.session
    }
  }

  // User Login
  static async signIn(data: SignInRequest) {
    const supabase = this.getSupabase()
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    })

    if (error) throw error

    // Update last login timestamp
    if (authData.user) {
      await supabase
        .from('user_profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', authData.user.id)
    }

    return authData
  }

  // User Logout
  static async signOut() {
    const supabase = this.getSupabase()
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Password Reset Request
  static async forgotPassword(email: string) {
    const supabase = this.getSupabase()
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`
    })

    if (error) throw error
  }

  // Password Reset Confirmation
  static async resetPassword(password: string) {
    const supabase = this.getSupabase()
    
    const { data, error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) throw error
    return data
  }

  // Email Verification
  static async verifyEmail(token: string, type: 'signup' | 'email_change' = 'signup') {
    const supabase = this.getSupabase()
    
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type
    })

    if (error) throw error
    return data
  }

  // Get Current Session
  static async getCurrentSession() {
    const supabase = this.getSupabase()
    
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error

    return session
  }

  // Refresh Session
  static async refreshSession() {
    const supabase = this.getSupabase()
    
    const { data, error } = await supabase.auth.refreshSession()
    if (error) throw error

    return data
  }

  // Update User Profile
  static async updateProfile(userId: string, data: UpdateProfileRequest) {
    const supabase = this.getSupabase()
    
    const updateData: any = {}
    if (data.firstName !== undefined) updateData.first_name = data.firstName
    if (data.lastName !== undefined) updateData.last_name = data.lastName
    if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
      .select(`
        *,
        company:companies(*)
      `)
      .single()

    if (error) throw error
    return profile
  }

  // Send User Invitation
  static async inviteUser(companyId: string, invitedBy: string, data: InviteUserRequest) {
    const supabase = this.getSupabase()
    
    // Check if user already exists in company
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', data.email)
      .eq('company_id', companyId)
      .single()

    if (existingUser) {
      throw new Error('User already exists in this company')
    }

    // Check if there's already a pending invitation
    const { data: existingInvitation } = await supabase
      .from('user_invitations')
      .select('id')
      .eq('email', data.email)
      .eq('company_id', companyId)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (existingInvitation) {
      throw new Error('Invitation already sent to this email')
    }

    // Create invitation
    const { data: invitation, error } = await supabase
      .from('user_invitations')
      .insert({
        company_id: companyId,
        invited_by: invitedBy,
        email: data.email,
        role: data.role
      })
      .select(`
        *,
        company:companies(*),
        inviter:user_profiles!user_invitations_invited_by_fkey(first_name, last_name, email)
      `)
      .single()

    if (error) throw error

    // TODO: Send invitation email via email service
    console.log('Invitation created:', invitation)

    return invitation
  }

  // Accept User Invitation
  static async acceptInvitation(token: string, userId: string) {
    const supabase = this.getSupabase()
    
    // Find and validate invitation
    const { data: invitation, error: fetchError } = await supabase
      .from('user_invitations')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('invitation_token', token)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (fetchError || !invitation) {
      throw new Error('Invalid or expired invitation')
    }

    // Update user profile with company and role
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        company_id: invitation.company_id,
        role: invitation.role
      })
      .eq('id', userId)

    if (updateError) throw updateError

    // Mark invitation as accepted
    const { error: acceptError } = await supabase
      .from('user_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id)

    if (acceptError) throw acceptError

    return invitation
  }

  // Get Company Users
  static async getCompanyUsers(companyId: string, search?: string) {
    const supabase = this.getSupabase()
    
    let query = supabase
      .from('user_profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        is_active,
        last_login_at,
        created_at
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  }

  // Get Pending Invitations
  static async getPendingInvitations(companyId: string) {
    const supabase = this.getSupabase()
    
    const { data, error } = await supabase
      .from('user_invitations')
      .select(`
        *,
        inviter:user_profiles!user_invitations_invited_by_fkey(first_name, last_name, email)
      `)
      .eq('company_id', companyId)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  // Cancel Invitation
  static async cancelInvitation(invitationId: string, companyId: string) {
    const supabase = this.getSupabase()
    
    const { error } = await supabase
      .from('user_invitations')
      .update({ expires_at: new Date().toISOString() })
      .eq('id', invitationId)
      .eq('company_id', companyId)

    if (error) throw error
  }

  // Update User Role
  static async updateUserRole(
    userId: string, 
    companyId: string, 
    updates: UpdateUserRoleRequest
  ) {
    const supabase = this.getSupabase()
    
    const updateData: any = {}
    if (updates.role !== undefined) updateData.role = updates.role
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Remove User from Company (soft delete)
  static async removeUserFromCompany(userId: string, companyId: string) {
    const supabase = this.getSupabase()
    
    // Soft delete by deactivating
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_active: false })
      .eq('id', userId)
      .eq('company_id', companyId)

    if (error) throw error
  }

  // Get Company Details
  static async getCompany(companyId: string) {
    const supabase = this.getSupabase()
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (error) throw error
    return data
  }

  // Update Company Details
  static async updateCompany(companyId: string, data: UpdateCompanyRequest) {
    const supabase = this.getSupabase()
    
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.email !== undefined) updateData.email = data.email
    if (data.logoUrl !== undefined) updateData.logo_url = data.logoUrl

    const { data: company, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', companyId)
      .select()
      .single()

    if (error) throw error
    return company
  }

  // Validate invitation token
  static async validateInvitationToken(token: string) {
    const supabase = this.getSupabase()
    
    const { data, error } = await supabase
      .from('user_invitations')
      .select(`
        *,
        company:companies(name, slug)
      `)
      .eq('invitation_token', token)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !data) {
      return null
    }

    return data
  }
}