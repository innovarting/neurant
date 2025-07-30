/**
 * API Types for Authentication - NeurAnt
 * 
 * Tipos específicos para requests y responses de endpoints de autenticación.
 * Define contratos de API para frontend-backend communication.
 */

import type { User, Session } from '@supabase/supabase-js'
import type { UserProfile, Company, UserInvitation } from '@/types/database'
import type { UserRole } from '@/types/auth'

// Base API Response wrapper
export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
  details?: any
}

export interface ApiError {
  error: string
  details?: any
}

// Authentication Responses
export interface SignUpResponse {
  message: string
  user: User | null
  needsVerification: boolean
}

export interface SignInResponse {
  message: string
  user: User
  session: Session
}

export interface SessionResponse {
  data: {
    user: User | null
    session: Session | null
  }
}

export interface RefreshResponse {
  user: User
  session: Session
}

// User Profile Responses
export interface ProfileResponse {
  data: {
    user: User
    profile: UserProfile & {
      company?: Company
    }
    company: Company
  }
}

export interface UpdateProfileResponse {
  message: string
  data: UserProfile & {
    company?: Company
  }
}

// User Management Responses
export interface InviteUserResponse {
  message: string
  data: UserInvitation & {
    company?: Company
    inviter?: {
      first_name: string | null
      last_name: string | null
      email: string
    }
  }
}

export interface AcceptInviteResponse {
  message: string
  data: UserInvitation & {
    company?: Company
  }
}

export interface CompanyUsersResponse {
  data: Array<{
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    role: UserRole
    is_active: boolean | null
    last_login_at: string | null
    created_at: string
  }>
  total?: number
  page?: number
  limit?: number
}

export interface PendingInvitationsResponse {
  data: Array<UserInvitation & {
    inviter?: {
      first_name: string | null
      last_name: string | null
      email: string
    }
  }>
}

export interface UpdateUserRoleResponse {
  message: string
  data: UserProfile
}

// Company Management Responses
export interface CompanyResponse {
  data: Company
}

export interface UpdateCompanyResponse {
  message: string
  data: Company
}

// Request Headers for API calls
export interface AuthHeaders {
  'Content-Type': 'application/json'
  'Authorization'?: string
}

// Pagination for list endpoints
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
}

// Rate limiting headers
export interface RateLimitHeaders {
  'x-ratelimit-limit': string
  'x-ratelimit-remaining': string
  'x-ratelimit-reset': string
}

// Webhook payload types (for future email notifications)
export interface InvitationWebhookPayload {
  type: 'user.invited'
  data: {
    invitation: UserInvitation
    company: Company
    inviter: {
      first_name: string | null
      last_name: string | null
      email: string
    }
    invitation_url: string
  }
}

export interface UserSignupWebhookPayload {
  type: 'user.signed_up'
  data: {
    user: User
    profile: UserProfile
    company: Company
    is_first_user: boolean
  }
}

// API Client configuration
export interface ApiClientConfig {
  baseUrl: string
  defaultHeaders: Record<string, string>
  timeout: number
  retries: number
}

// Error code mappings for user-friendly messages
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'invalid_credentials': 'Invalid email or password',
  'email_not_confirmed': 'Please verify your email address',
  'signup_disabled': 'Sign up is currently disabled',
  'email_address_invalid': 'Invalid email address format',
  'password_too_short': 'Password must be at least 8 characters',
  'email_address_not_authorized': 'Email address not authorized',
  'too_many_requests': 'Too many requests. Please try again later',
  'user_not_found': 'User not found',
  'token_expired': 'Token has expired',
  'invalid_token': 'Invalid token',
  'company_not_found': 'Company not found',
  'invitation_expired': 'Invitation has expired',
  'invitation_already_accepted': 'Invitation has already been accepted',
  'user_already_exists': 'User already exists in this company',
  'insufficient_permissions': 'Insufficient permissions for this action'
}

// HTTP Status codes for API responses
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
} as const

export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS]