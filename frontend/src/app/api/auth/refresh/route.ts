/**
 * POST /api/auth/refresh - Refresh Session Endpoint
 */

import { NextRequest } from 'next/server'
import { AuthService } from '@/lib/services/auth-service'
import { handleAPIError } from '@/lib/utils/api-errors'

export async function POST(request: NextRequest) {
  try {
    const result = await AuthService.refreshSession()
    
    return Response.json({
      message: 'Session refreshed successfully',
      user: result.user,
      session: result.session
    })
    
  } catch (error) {
    return handleAPIError(error)
  }
}