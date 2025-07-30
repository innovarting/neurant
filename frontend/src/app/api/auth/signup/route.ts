/**
 * POST /api/auth/signup - User Registration Endpoint
 */

import { NextRequest } from 'next/server'
import { signUpSchema } from '@/lib/validations/auth'
import { AuthService } from '@/lib/services/auth-service'
import { handleAPIError, validateJsonContentType } from '@/lib/utils/api-errors'

export async function POST(request: NextRequest) {
  try {
    validateJsonContentType(request)
    
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