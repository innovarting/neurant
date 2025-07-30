/**
 * GET /api/auth/session - Get Current Session Endpoint
 */

import { NextRequest } from 'next/server'
import { AuthService } from '@/lib/services/auth-service'
import { getCurrentUser } from '@/lib/supabase/auth-helpers'
import { handleAPIError } from '@/lib/utils/api-errors'

export async function GET(request: NextRequest) {
  try {
    const session = await AuthService.getCurrentSession()
    
    if (!session) {
      return Response.json({
        data: {
          user: null,
          session: null
        }
      })
    }

    // Get full user context if session exists
    const currentUser = await getCurrentUser()
    
    return Response.json({
      data: {
        user: session.user,
        session: session,
        profile: currentUser?.profile || null,
        company: currentUser?.company || null
      }
    })
    
  } catch (error) {
    return handleAPIError(error)
  }
}