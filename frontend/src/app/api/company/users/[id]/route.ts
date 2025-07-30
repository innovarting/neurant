/**
 * PUT/DELETE /api/company/users/[id] - Manage Specific User Endpoints (Admin+ only)
 */

import { NextRequest } from 'next/server'
import { withAdminAccess } from '@/lib/middleware/auth'
import { updateUserRoleSchema } from '@/lib/validations/auth'
import { AuthService } from '@/lib/services/auth-service'
import { handleAPIError, validateJsonContentType } from '@/lib/utils/api-errors'

interface RouteParams {
  params: {
    id: string
  }
}

// PUT update user role/status
export const PUT = withAdminAccess(async (request, { params }: RouteParams) => {
  try {
    validateJsonContentType(request)
    
    const body = await request.json()
    const data = updateUserRoleSchema.parse(body)
    const userId = params.id
    
    // Prevent users from modifying their own role
    if (userId === request.user.id) {
      return Response.json(
        { error: 'Cannot modify your own role' },
        { status: 400 }
      )
    }
    
    const updatedUser = await AuthService.updateUserRole(
      userId,
      request.user.profile.company_id,
      data
    )
    
    return Response.json({
      message: 'User updated successfully',
      data: updatedUser
    })
    
  } catch (error) {
    return handleAPIError(error)
  }
})

// DELETE remove user from company (soft delete)
export const DELETE = withAdminAccess(async (request, { params }: RouteParams) => {
  try {
    const userId = params.id
    
    // Prevent users from deleting themselves
    if (userId === request.user.id) {
      return Response.json(
        { error: 'Cannot remove yourself from the company' },
        { status: 400 }
      )
    }
    
    await AuthService.removeUserFromCompany(
      userId,
      request.user.profile.company_id
    )
    
    return Response.json({
      message: 'User removed from company successfully'
    })
    
  } catch (error) {
    return handleAPIError(error)
  }
})