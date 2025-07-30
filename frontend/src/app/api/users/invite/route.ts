/**
 * POST /api/users/invite - Send User Invitation Endpoint (Admin+ only)
 */

import { NextRequest } from 'next/server'
import { withAdminAccess } from '@/lib/middleware/auth'
import { inviteUserSchema } from '@/lib/validations/auth'
import { AuthService } from '@/lib/services/auth-service'
import { handleAPIError, validateJsonContentType } from '@/lib/utils/api-errors'

export const POST = withAdminAccess(async (request) => {
  try {
    validateJsonContentType(request)
    
    const body = await request.json()
    const data = inviteUserSchema.parse(body)
    
    const invitation = await AuthService.inviteUser(
      request.user.profile.company_id,
      request.user.id,
      data
    )
    
    return Response.json({
      message: 'Invitation sent successfully',
      data: invitation
    }, { status: 201 })
    
  } catch (error) {
    return handleAPIError(error)
  }
})