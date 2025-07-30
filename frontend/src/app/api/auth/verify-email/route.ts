/**
 * POST /api/auth/verify-email - Email Verification Endpoint
 */

import { NextRequest } from 'next/server'
import { verifyEmailSchema } from '@/lib/validations/auth'
import { AuthService } from '@/lib/services/auth-service'
import { handleAPIError, validateJsonContentType } from '@/lib/utils/api-errors'

export async function POST(request: NextRequest) {
  try {
    validateJsonContentType(request)
    
    const body = await request.json()
    const data = verifyEmailSchema.parse(body)
    
    const result = await AuthService.verifyEmail(data.token, data.type)
    
    return Response.json({
      message: 'Email verified successfully',
      user: result.user,
      session: result.session
    })
    
  } catch (error) {
    return handleAPIError(error)
  }
}