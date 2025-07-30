/**
 * POST /api/auth/signout - User Logout Endpoint
 */

import { NextRequest } from 'next/server'
import { AuthService } from '@/lib/services/auth-service'
import { handleAPIError } from '@/lib/utils/api-errors'

export async function POST(request: NextRequest) {
  try {
    await AuthService.signOut()
    
    return Response.json({
      message: 'Signed out successfully'
    })
    
  } catch (error) {
    return handleAPIError(error)
  }
}