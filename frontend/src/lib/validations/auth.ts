/**
 * Authentication Validation Schemas - NeurAnt
 * 
 * Esquemas Zod para validación de requests de autenticación.
 * Incluye validaciones para signup, signin, invitaciones y gestión de usuarios.
 */

import { z } from 'zod'

// Password validation regex patterns
const passwordRegex = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*(),.?":{}|<>]/
}

// Base password schema
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(passwordRegex.uppercase, 'Password must contain at least one uppercase letter')
  .regex(passwordRegex.lowercase, 'Password must contain at least one lowercase letter')
  .regex(passwordRegex.number, 'Password must contain at least one number')

// Sign up validation
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Company name too long').optional()
})

// Sign in validation
export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

// Forgot password validation
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

// Reset password validation
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  token: z.string().min(1, 'Reset token is required')
})

// Email verification validation
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
  type: z.enum(['signup', 'email_change']).optional()
})

// User invitation validation
export const inviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'supervisor', 'operador'], {
    errorMap: () => ({ message: 'Role must be admin, supervisor, or operador' })
  }),
  message: z.string().max(500, 'Message too long').optional()
})

// Accept invitation validation
export const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
  password: passwordSchema.optional() // For new users signing up via invitation
})

// Update profile validation
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name required').max(50, 'First name too long').optional(),
  lastName: z.string().min(1, 'Last name required').max(50, 'Last name too long').optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().nullable()
})

// Update company validation
export const updateCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Company name too long').optional(),
  email: z.string().email('Invalid email address').optional().nullable(),
  logoUrl: z.string().url('Invalid logo URL').optional().nullable()
})

// Update user role validation
export const updateUserRoleSchema = z.object({
  role: z.enum(['admin', 'supervisor', 'operador'], {
    errorMap: () => ({ message: 'Role must be admin, supervisor, or operador' })
  }).optional(),
  isActive: z.boolean().optional()
})

// Session refresh validation
export const refreshSessionSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
})

// Pagination schema for list endpoints
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional()
})

// Type exports for use in API handlers
export type SignUpRequest = z.infer<typeof signUpSchema>
export type SignInRequest = z.infer<typeof signInSchema>
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>
export type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>
export type InviteUserRequest = z.infer<typeof inviteUserSchema>
export type AcceptInviteRequest = z.infer<typeof acceptInviteSchema>
export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>
export type UpdateCompanyRequest = z.infer<typeof updateCompanySchema>
export type UpdateUserRoleRequest = z.infer<typeof updateUserRoleSchema>
export type RefreshSessionRequest = z.infer<typeof refreshSessionSchema>
export type PaginationRequest = z.infer<typeof paginationSchema>

// Validation helper function
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  try {
    const validData = schema.parse(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}