/**
 * POST /api/auth/forgot-password - Password Reset Request Endpoint
 */

import { NextRequest } from 'next/server'
import { forgotPasswordSchema } from '@/lib/validations/auth'
import { AuthService } from '@/lib/services/auth-service'
import { handleAPIError, validateJsonContentType } from '@/lib/utils/api-errors'

export async function POST(request: NextRequest) {
  try {
    validateJsonContentType(request)
    
    const body = await request.json()
    const data = forgotPasswordSchema.parse(body)
    
    await AuthService.forgotPassword(data.email)
    
    return Response.json({
      message: 'Password reset email sent. Please check your inbox.'
    })
    
  } catch (error) {
    return handleAPIError(error)
  }
}