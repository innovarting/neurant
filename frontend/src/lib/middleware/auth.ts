/**
 * Authentication Middleware - NeurAnt
 * 
 * Middleware para autenticación y autorización en API routes.
 * Incluye validación de usuarios, roles y contexto multi-tenant.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, hasRole, type UserRole } from '@/lib/supabase/auth-helpers'
import { APIError } from '@/lib/utils/api-errors'
import type { Database } from '@/types/database'

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string
    email: string
    profile: {
      company_id: string
      role: UserRole
      is_active: boolean
      first_name: string | null
      last_name: string | null
    }
    company: {
      id: string
      name: string
      slug: string
    }
  }
}

// Base authentication check
export async function requireAuth(
  request: NextRequest
): Promise<{ user: AuthenticatedRequest['user'] }> {
  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
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
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new APIError(401, 'Unauthorized', 'Authentication required')
  }

  const currentUser = await getCurrentUser()
  
  if (!currentUser || !currentUser.profile.is_active) {
    throw new APIError(401, 'Unauthorized', 'User account is inactive')
  }

  if (!currentUser.company) {
    throw new APIError(400, 'Bad Request', 'User must belong to a company')
  }

  return {
    user: {
      id: user.id,
      email: user.email!,
      profile: {
        company_id: currentUser.profile.company_id,
        role: currentUser.profile.role,
        is_active: currentUser.profile.is_active!,
        first_name: currentUser.profile.first_name,
        last_name: currentUser.profile.last_name
      },
      company: {
        id: currentUser.company.id,
        name: currentUser.company.name,
        slug: currentUser.company.slug
      }
    }
  }
}

// Role-based authorization check
export async function requireRole(
  request: NextRequest,
  requiredRole: UserRole
): Promise<{ user: AuthenticatedRequest['user'] }> {
  const { user } = await requireAuth(request)
  
  if (!hasRole(user.profile.role, requiredRole)) {
    throw new APIError(
      403, 
      'Forbidden', 
      `Requires ${requiredRole} role or higher`
    )
  }

  return { user }
}

// HOC for authenticated routes
export function withAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const { user } = await requireAuth(request)
      const authenticatedRequest = Object.assign(request, { user })
      return await handler(authenticatedRequest)
    } catch (error) {
      if (error instanceof APIError) {
        return NextResponse.json(
          { error: error.message, details: error.details },
          { status: error.status }
        )
      }
      
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// HOC for role-based authorization
export function withRole(
  requiredRole: UserRole,
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const { user } = await requireRole(request, requiredRole)
      const authenticatedRequest = Object.assign(request, { user })
      return await handler(authenticatedRequest)
    } catch (error) {
      if (error instanceof APIError) {
        return NextResponse.json(
          { error: error.message, details: error.details },
          { status: error.status }
        )
      }
      
      console.error('Role middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// Company isolation check - ensure user can only access their company's data
export async function requireCompanyAccess(
  request: NextRequest,
  companyId: string
): Promise<{ user: AuthenticatedRequest['user'] }> {
  const { user } = await requireAuth(request)
  
  if (user.profile.company_id !== companyId) {
    throw new APIError(
      403,
      'Forbidden',
      'Access denied to company resources'
    )
  }

  return { user }
}

// Owner-only access check
export function withOwnerAccess(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withRole('owner', handler)
}

// Admin+ access check (owner or admin)
export function withAdminAccess(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withRole('admin', handler)
}

// Supervisor+ access check (owner, admin, or supervisor)
export function withSupervisorAccess(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withRole('supervisor', handler)
}

// Utility to extract user ID from URL params (for user management endpoints)
export function extractUserIdFromUrl(request: NextRequest): string | null {
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/')
  const userIndex = pathSegments.findIndex(segment => segment === 'users')
  
  if (userIndex !== -1 && pathSegments[userIndex + 1]) {
    return pathSegments[userIndex + 1]
  }
  
  return null
}

// Rate limiting helper (requires external rate limiting service)
export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: Date
}

export async function checkRateLimit(
  identifier: string,
  windowMs: number = 60000, // 1 minute
  maxRequests: number = 10
): Promise<RateLimitResult> {
  // TODO: Implement with Redis or similar
  // For now, always allow (rate limiting should be implemented at infrastructure level)
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - 1,
    reset: new Date(Date.now() + windowMs)
  }
}

// Content-Type validation for POST/PUT requests (moved to api-errors.ts)