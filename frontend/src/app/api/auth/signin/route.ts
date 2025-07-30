/**
 * POST /api/auth/signin - User Login Endpoint
 */

import { NextRequest } from 'next/server'
import { signInSchema } from '@/lib/validations/auth'
import { AuthService } from '@/lib/services/auth-service'
import { handleAPIError, validateJsonContentType } from '@/lib/utils/api-errors'

export async function POST(request: NextRequest) {
  try {
    validateJsonContentType(request)
    
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