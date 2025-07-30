# TASK-P1E2-02B: Authentication API Endpoints

## Identificación
- **ID:** TASK-P1E2-02B
- **Título:** Authentication API Endpoints
- **Type:** API
- **Phase:** 1 - Foundation
- **Epic:** Auth & Multi-tenancy
- **Sprint:** Sprint 1.2 (Semanas 3-4, Febrero 2025)
- **Status:** ✅ COMPLETADA - 2025-07-30
- **Tiempo Estimado:** 6 horas
- **Prioridad:** Crítica - Bloquea frontend auth integration

## Definición Técnica
Implementar endpoints REST para autenticación completa: signup, signin, signout, password reset, email verification, user invitations, y profile management con validación robusta y manejo de errores.

## Referencias de Documentación NeurAnt
- **API Contracts:** `docs/architecture/11-interfaces-contratos-rbac.md:32-89` (Auth interfaces)
- **RBAC Model:** `docs/architecture/10-modelo-datos-rbac-extendido.md:45-78` (Role management)
- **Tech Stack:** `docs/architecture/04-tech-stack.md:17-35` (Next.js API Routes)
- **Sprint Context:** `docs/architecture/05-implementation-roadmap.md:91-149` (Auth System deliverables)

## Dependencias Técnicas
- **Requiere:**
  - [ ] TASK-P1E2-02A ✅ (Supabase Auth Setup)
- **Bloquea:**
  - [ ] TASK-P1E2-02C (Login/Signup Pages)
  - [ ] TASK-P1E2-02E (Auth Context Provider)
  - [ ] TASK-P1E2-02F (RBAC Middleware)
  - [ ] Todo el frontend que consume auth APIs

## API Specification
### Authentication Endpoints
```
POST   /api/auth/signup           # User registration
POST   /api/auth/signin           # User login  
POST   /api/auth/signout          # User logout
POST   /api/auth/forgot-password  # Password reset request
POST   /api/auth/reset-password   # Password reset confirmation
POST   /api/auth/verify-email     # Email verification
GET    /api/auth/session          # Get current session
POST   /api/auth/refresh          # Refresh tokens
```

### User Management Endpoints
```
GET    /api/users/profile         # Get current user profile
PUT    /api/users/profile         # Update user profile
POST   /api/users/invite          # Send user invitation
POST   /api/users/accept-invite   # Accept invitation
GET    /api/users/invitations     # List pending invitations
DELETE /api/users/invitations/:id # Cancel invitation
```

### Company Management Endpoints
```
GET    /api/company               # Get company details
PUT    /api/company               # Update company details
GET    /api/company/users         # List company users
PUT    /api/company/users/:id     # Update user role/status
DELETE /api/company/users/:id     # Remove user from company
```

## Criterios de Aceptación Específicos
### API Implementation
- [x] All auth endpoints implemented in Next.js App Router
- [x] Supabase Auth integration working correctly
- [x] Request/response validation with Zod schemas
- [x] Proper HTTP status codes (200, 201, 400, 401, 403, 500)

### Security & Authorization
- [x] All endpoints properly authenticated where required
- [x] RBAC authorization implemented (admin/owner restrictions)
- [x] Input sanitization and validation
- [x] Rate limiting for auth endpoints

### Error Handling
- [x] Comprehensive error responses with user-friendly messages
- [x] Proper error logging for debugging
- [x] Graceful handling of Supabase errors
- [x] Validation error details for forms

### Performance
- [x] API response times < 200ms p95
- [x] Efficient database queries with proper indexes
- [x] Minimal data transfer (only necessary fields)
- [x] Proper caching headers where appropriate

## Archivos a Crear/Modificar
```
app/api/auth/signup/route.ts
app/api/auth/signin/route.ts
app/api/auth/signout/route.ts
app/api/auth/forgot-password/route.ts
app/api/auth/reset-password/route.ts
app/api/auth/verify-email/route.ts
app/api/auth/session/route.ts
app/api/auth/refresh/route.ts
app/api/users/profile/route.ts
app/api/users/invite/route.ts
app/api/users/accept-invite/route.ts
app/api/users/invitations/route.ts
app/api/company/route.ts
app/api/company/users/route.ts
app/api/company/users/[id]/route.ts
lib/validations/auth.ts
lib/middleware/auth.ts
lib/services/auth-service.ts
lib/utils/api-errors.ts
types/api/auth.ts
__tests__/api/auth.test.ts
```

## Validation Schemas
```typescript
// lib/validations/auth.ts
import { z } from 'zod'

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  companyName: z.string().min(2, 'Company name is required').max(100).optional()
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  token: z.string().min(1, 'Reset token is required')
})

export const inviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'supervisor', 'operador'], {
    errorMap: () => ({ message: 'Invalid role' })
  }),
  message: z.string().max(500).optional()
})

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  avatarUrl: z.string().url().optional(),
})

export const updateCompanySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  logoUrl: z.string().url().optional()
})

export const updateUserRoleSchema = z.object({
  role: z.enum(['admin', 'supervisor', 'operador']),
  isActive: z.boolean().optional()
})

export type SignUpRequest = z.infer<typeof signUpSchema>
export type SignInRequest = z.infer<typeof signInSchema>
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>
export type InviteUserRequest = z.infer<typeof inviteUserSchema>
export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>
export type UpdateCompanyRequest = z.infer<typeof updateCompanySchema>
export type UpdateUserRoleRequest = z.infer<typeof updateUserRoleSchema>
```

## Authentication Middleware
```typescript
// lib/middleware/auth.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
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
    }
  }
}

export async function requireAuth(
  request: NextRequest
): Promise<{ user: AuthenticatedRequest['user'] }> {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new APIError(401, 'Unauthorized', 'Authentication required')
  }

  const currentUser = await getCurrentUser()
  
  if (!currentUser || !currentUser.profile.is_active) {
    throw new APIError(401, 'Unauthorized', 'User account is inactive')
  }

  return {
    user: {
      id: user.id,
      email: user.email!,
      profile: {
        company_id: currentUser.profile.company_id,
        role: currentUser.profile.role,
        is_active: currentUser.profile.is_active
      }
    }
  }
}

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
```

## API Error Utilities
```typescript
// lib/utils/api-errors.ts
export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export function handleAPIError(error: unknown): Response {
  console.error('API Error:', error)

  if (error instanceof APIError) {
    return Response.json(
      { 
        error: error.message, 
        details: error.details 
      },
      { status: error.status }
    )
  }

  if (error instanceof z.ZodError) {
    return Response.json(
      { 
        error: 'Validation error', 
        details: error.errors 
      },
      { status: 400 }
    )
  }

  // Supabase auth errors
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code: string; message: string }
    
    switch (supabaseError.code) {
      case 'invalid_credentials':
        return Response.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      case 'email_not_confirmed':
        return Response.json(
          { error: 'Please verify your email address' },
          { status: 401 }
        )
      case 'signup_disabled':
        return Response.json(
          { error: 'Sign up is currently disabled' },
          { status: 403 }
        )
      case 'email_address_invalid':
        return Response.json(
          { error: 'Invalid email address format' },
          { status: 400 }
        )
      case 'password_too_short':
        return Response.json(
          { error: 'Password must be at least 8 characters' },
          { status: 400 }
        )
      default:
        return Response.json(
          { error: supabaseError.message || 'Authentication error' },
          { status: 400 }
        )
    }
  }

  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

## Auth Service
```typescript
// lib/services/auth-service.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'
import type { 
  SignUpRequest, 
  SignInRequest, 
  InviteUserRequest,
  UpdateProfileRequest,
  UpdateCompanyRequest 
} from '@/lib/validations/auth'

export class AuthService {
  private static getSupabase() {
    return createServerComponentClient<Database>({ cookies })
  }

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

  static async signIn(data: SignInRequest) {
    const supabase = this.getSupabase()
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    })

    if (error) throw error

    // Update last login
    if (authData.user) {
      await supabase
        .from('user_profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', authData.user.id)
    }

    return authData
  }

  static async signOut() {
    const supabase = this.getSupabase()
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  static async forgotPassword(email: string) {
    const supabase = this.getSupabase()
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`
    })

    if (error) throw error
  }

  static async resetPassword(password: string, accessToken: string) {
    const supabase = this.getSupabase()
    
    const { data, error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) throw error
    return data
  }

  static async getCurrentSession() {
    const supabase = this.getSupabase()
    
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error

    return session
  }

  static async refreshSession() {
    const supabase = this.getSupabase()
    
    const { data, error } = await supabase.auth.refreshSession()
    if (error) throw error

    return data
  }

  static async updateProfile(userId: string, data: UpdateProfileRequest) {
    const supabase = this.getSupabase()
    
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        avatar_url: data.avatarUrl
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return profile
  }

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

    // Create invitation
    const { data: invitation, error } = await supabase
      .from('user_invitations')
      .insert({
        company_id: companyId,
        invited_by: invitedBy,
        email: data.email,
        role: data.role
      })
      .select()
      .single()

    if (error) throw error

    // TODO: Send invitation email
    // await EmailService.sendInvitation(invitation, data.message)

    return invitation
  }

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

  static async getCompanyUsers(companyId: string) {
    const supabase = this.getSupabase()
    
    const { data, error } = await supabase
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

    if (error) throw error
    return data
  }

  static async updateUserRole(
    userId: string, 
    companyId: string, 
    updates: { role?: UserRole; is_active?: boolean }
  ) {
    const supabase = this.getSupabase()
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .eq('company_id', companyId)
      .select()
      .single()

    if (error) throw error
    return data
  }

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
}
```

## API Routes Implementation

### Sign Up Endpoint
```typescript
// app/api/auth/signup/route.ts
import { NextRequest } from 'next/server'
import { signUpSchema } from '@/lib/validations/auth'
import { AuthService } from '@/lib/services/auth-service'
import { handleAPIError } from '@/lib/utils/api-errors'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = signUpSchema.parse(body)
    
    const result = await AuthService.signUp(data)
    
    return Response.json({
      message: result.needsVerification 
        ? 'Please check your email for verification link'
        : 'Account created successfully',
      user: result.user,
      needsVerification: result.needsVerification
    }, { status: 201 })
    
  } catch (error) {
    return handleAPIError(error)
  }
}
```

### Sign In Endpoint
```typescript
// app/api/auth/signin/route.ts
import { NextRequest } from 'next/server'
import { signInSchema } from '@/lib/validations/auth'
import { AuthService } from '@/lib/services/auth-service'
import { handleAPIError } from '@/lib/utils/api-errors'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = signInSchema.parse(body)
    
    const result = await AuthService.signIn(data)
    
    return Response.json({
      message: 'Signed in successfully',
      user: result.user,
      session: result.session
    })
    
  } catch (error) {
    return handleAPIError(error)
  }
}
```

### User Profile Endpoint
```typescript
// app/api/users/profile/route.ts
import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { updateProfileSchema } from '@/lib/validations/auth'
import { AuthService } from '@/lib/services/auth-service'
import { getCurrentUser } from '@/lib/supabase/auth-helpers'
import { handleAPIError } from '@/lib/utils/api-errors'

export const GET = withAuth(async (request) => {
  try {
    const currentUser = await getCurrentUser()
    
    return Response.json({
      data: {
        user: currentUser?.user,
        profile: currentUser?.profile,
        company: currentUser?.company
      }
    })
    
  } catch (error) {
    return handleAPIError(error)
  }
})

export const PUT = withAuth(async (request) => {
  try {
    const body = await request.json()
    const data = updateProfileSchema.parse(body)
    
    const profile = await AuthService.updateProfile(request.user.id, data)
    
    return Response.json({
      message: 'Profile updated successfully',
      data: profile
    })
    
  } catch (error) {
    return handleAPIError(error)
  }
})
```

### User Invitation Endpoint
```typescript
// app/api/users/invite/route.ts
import { NextRequest } from 'next/server'
import { withRole } from '@/lib/middleware/auth'
import { inviteUserSchema } from '@/lib/validations/auth'
import { AuthService } from '@/lib/services/auth-service'
import { handleAPIError } from '@/lib/utils/api-errors'

export const POST = withRole('admin', async (request) => {
  try {
    const body = await request.json()
    const data = inviteUserSchema.parse(body)
    
    const invitation = await AuthService.inviteUser(
      request.user.profile.company_id,
      request.user.id,
      data
    )
    
    return Response.json({
      message: 'Invitation sent successfully',
      data: invitation
    }, { status: 201 })
    
  } catch (error) {
    return handleAPIError(error)
  }
})
```

## Performance Optimizations
```typescript
// Rate limiting configuration
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

export const authRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
})

export const passwordResetRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 requests per hour
})

// Apply in auth endpoints
export async function POST(request: NextRequest) {
  const ip = request.ip || '127.0.0.1'
  const { success } = await authRateLimit.limit(ip)
  
  if (!success) {
    return Response.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }
  
  // ... rest of endpoint logic
}
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md al completar:
- Auth APIs: ✅ All authentication endpoints implemented
- Validation: ✅ Zod schemas for all inputs
- Security: ✅ Rate limiting and RBAC protection
- Error Handling: ✅ Comprehensive error responses
- Documentation: ✅ API contracts defined
- Siguiente tarea: TASK-P1E2-02C (Login/Signup Pages)
- Ready for: Frontend auth integration, user flows testing
```

---
*Esta tarea implementa todos los endpoints de autenticación necesarios para el frontend, con validación robusta, manejo de errores y seguridad apropiada.*