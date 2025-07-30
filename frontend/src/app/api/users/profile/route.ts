/**
 * GET/PUT /api/users/profile - User Profile Management Endpoints
 */

import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/middleware/auth'
import { updateProfileSchema } from '@/lib/validations/auth'
import { AuthService } from '@/lib/services/auth-service'
import { getCurrentUser } from '@/lib/supabase/auth-helpers'
import { handleAPIError, validateJsonContentType } from '@/lib/utils/api-errors'

// GET current user profile
export const GET = withAuth(async (request) => {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return Response.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }
    
    return Response.json({
      data: {
        user: currentUser.user,
        profile: currentUser.profile,
        company: currentUser.company
      }
    })
    
  } catch (error) {
    return handleAPIError(error)
  }
})

// PUT update user profile
export const PUT = withAuth(async (request) => {
  try {
    validateJsonContentType(request)
    
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