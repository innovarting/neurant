/**
 * POST /api/auth/reset-password - Password Reset Confirmation Endpoint
 */

import { NextRequest } from 'next/server'
import { resetPasswordSchema } from '@/lib/validations/auth'
import { AuthService } from '@/lib/services/auth-service'
import { handleAPIError, validateJsonContentType } from '@/lib/utils/api-errors'

export async function POST(request: NextRequest) {
  try {
    validateJsonContentType(request)
    
    const body = await request.json()
    const data = resetPasswordSchema.parse(body)
    
    const result = await AuthService.resetPassword(data.password)
    
    return Response.json({
      message: 'Password reset successfully',
      user: result.user
    })
    
  } catch (error) {
    return handleAPIError(error)
  }
}