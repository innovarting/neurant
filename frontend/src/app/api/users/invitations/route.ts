/**
 * GET/DELETE /api/users/invitations - Manage User Invitations Endpoints (Admin+ only)
 */

import { NextRequest } from 'next/server'
import { withAdminAccess } from '@/lib/middleware/auth'
import { AuthService } from '@/lib/services/auth-service'
import { handleAPIError } from '@/lib/utils/api-errors'

// GET pending invitations for company
export const GET = withAdminAccess(async (request) => {
  try {
    const invitations = await AuthService.getPendingInvitations(
      request.user.profile.company_id
    )
    
    return Response.json({
      data: invitations
    })
    
  } catch (error) {
    return handleAPIError(error)
  }
})

// DELETE cancel invitation
export const DELETE = withAdminAccess(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get('id')
    
    if (!invitationId) {
      return Response.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      )
    }
    
    await AuthService.cancelInvitation(
      invitationId,
      request.user.profile.company_id
    )
    
    return Response.json({
      message: 'Invitation cancelled successfully'
    })
    
  } catch (error) {
    return handleAPIError(error)
  }
})