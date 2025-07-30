# API Endpoints: Company Creation & Management

## Identificación
- **ID:** TASK-P1E6-06b
- **Título:** Company Creation API Endpoints
- **Type:** API
- **Phase:** 1 - Foundation
- **Epic:** Epic 6 - Organization Onboarding
- **Sprint:** Sprint 6
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 8 horas
- **Prioridad:** Crítica

## Definición Técnica
Implementar endpoints para creación y gestión de organizaciones durante el proceso de onboarding, incluyendo validación de datos, setup automático de estructura inicial, roles por defecto, y integración con sistema de billing. Multi-tenant ready con RBAC enforcement.

## Referencias de Documentación NeurAnt
- **API Contracts:** `docs/architecture/11-interfaces-contratos-rbac.md:250-300` (company management interfaces)
- **Database Schema:** `docs/architecture/13-diagrama-entidad-relacion.md:50-150` (company entities)
- **Implementation Guide:** `docs/architecture/12-guias-implementacion-rbac.md:150-200` (RBAC setup patterns)
- **Tech Stack:** `docs/architecture/04-tech-stack.md:80-120` (Next.js API routes)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E2-02a ✅ (Supabase auth setup)
  - [x] TASK-P1E6-06a ✅ (onboarding flow pages)
  - [x] TASK-P1E2-02f ✅ (RBAC middleware)
- **Bloquea:**
  - [ ] TASK-P1E6-06c (onboarding wizard backend integration)
  - [ ] TASK-P1E6-06d (welcome dashboard data)

## API Specification
### Endpoints Overview
```
# Company Management (Protected)
POST   /api/companies                        # Create new company during onboarding
GET    /api/companies/[id]                   # Get company details
PUT    /api/companies/[id]                   # Update company information
DELETE /api/companies/[id]                   # Delete company (owner only)

# Company Setup (Internal/Protected)
POST   /api/companies/[id]/setup             # Initialize company structure
GET    /api/companies/[id]/members           # List company members
POST   /api/companies/[id]/invite            # Invite new member
PUT    /api/companies/[id]/members/[userId]  # Update member role
DELETE /api/companies/[id]/members/[userId]  # Remove member

# Company Validation (Public/Protected)
GET    /api/companies/check-name             # Check if company name is available
GET    /api/companies/check-domain           # Validate company domain
```

### Authentication & RBAC
```
Auth: JWT required for protected endpoints
RBAC Levels:
- owner: Full company management, can delete company
- admin: Company management, member management, cannot delete company
- supervisor: Read company info, limited member management
- operator: Read-only company info
```

## Request/Response Schemas

### POST /api/companies
```typescript
// Request
interface CreateCompanyRequest {
  name: string
  industry: string
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  website?: string
  description?: string
  timezone?: string
  country?: string
  setupOptions?: {
    createSampleChatbot?: boolean
    inviteTeamMembers?: boolean
    setupBilling?: boolean
  }
}

// Response
interface CreateCompanyResponse {
  data: {
    id: string
    name: string
    industry: string
    size: string
    website: string | null
    description: string | null
    timezone: string
    country: string
    slug: string
    settings: Record<string, any>
    is_active: boolean
    created_at: string
    subscription?: {
      id: string
      plan_name: string
      status: string
    }
    user_role: 'owner'
    setup_completed: boolean
  }
}
```

### GET /api/companies/[id]
```typescript
// Response
interface GetCompanyResponse {
  data: {
    id: string
    name: string
    industry: string
    size: string
    website: string | null
    description: string | null
    timezone: string
    country: string
    slug: string
    settings: Record<string, any>
    is_active: boolean
    created_at: string
    updated_at: string
    members_count: number
    chatbots_count: number
    subscription?: {
      id: string
      plan_name: string
      status: string
      current_period_end: string
    }
    user_role: 'owner' | 'admin' | 'supervisor' | 'operator'
    permissions: string[]
  }
}
```

### POST /api/companies/[id]/setup
```typescript
// Request
interface CompanySetupRequest {
  setup_type: 'basic' | 'complete' | 'custom'
  options: {
    create_sample_chatbot?: boolean
    setup_default_channels?: boolean
    configure_analytics?: boolean
    invite_team_members?: string[] // email addresses
    enable_notifications?: boolean
  }
}

// Response
interface CompanySetupResponse {
  data: {
    company_id: string
    setup_completed: boolean
    created_resources: {
      chatbots?: string[]
      channels?: string[]
      invitations?: string[]
    }
    next_steps: string[]
  }
}
```

### GET /api/companies/check-name
```typescript
// Query params
interface CheckNameQuery {
  name: string
}

// Response
interface CheckNameResponse {
  data: {
    available: boolean
    suggested_names?: string[]
    slug_preview: string
  }
}
```

## Criterios de Aceptación Específicos
### API Implementation
- [x] 8 endpoints implementados en Next.js API Routes
- [x] Request validation con Zod schemas
- [x] Response format consistente con error handling
- [x] Proper HTTP status codes (201, 200, 400, 401, 403, 404, 409, 500)

### Security & Authorization
- [x] JWT authentication verificada en endpoints protegidos
- [x] RBAC authorization: owner para delete, admin para management
- [x] Multi-tenant isolation via company_id validation
- [x] Input sanitization y rate limiting en endpoints públicos

### Company Creation Logic
- [x] Unique company name validation
- [x] Automatic slug generation from company name
- [x] Owner role assignment automático al creator
- [x] Default company settings initialization
- [x] Optional initial structure setup (chatbots, channels)

### Database Integration
- [x] Atomic company creation con user assignment
- [x] RLS policies enforcement para multi-tenant isolation
- [x] Proper foreign key relationships y constraints
- [x] Transaction rollback en caso de errores

### Business Logic
- [x] Company size limits según plan de suscripción
- [x] Industry validation contra lista predefinida
- [x] Website URL validation y normalization
- [x] Timezone y country validation

## Archivos a Crear/Modificar
```
# API Routes (Next.js App Router)
app/api/companies/route.ts                    # Create company
app/api/companies/[id]/route.ts               # Get/Update/Delete company
app/api/companies/[id]/setup/route.ts         # Initialize company structure
app/api/companies/[id]/members/route.ts       # List/manage members
app/api/companies/[id]/members/[userId]/route.ts # Individual member management
app/api/companies/[id]/invite/route.ts        # Invite new members
app/api/companies/check-name/route.ts         # Name availability check
app/api/companies/check-domain/route.ts       # Domain validation

# Services & Business Logic
lib/services/company-service.ts               # Core company management logic
lib/services/company-setup-service.ts         # Company initialization logic
lib/services/member-invitation-service.ts    # Team invitation logic
lib/services/company-validation-service.ts   # Validation utilities

# Validations & Types
lib/validations/company.ts                    # Zod schemas
types/company.ts                              # Company TypeScript interfaces

# Utils
utils/company-utils.ts                        # Company helper functions
utils/slug-generator.ts                       # URL slug generation

# Tests
__tests__/api/companies/create.test.ts        # Company creation tests
__tests__/api/companies/management.test.ts    # Company management tests
__tests__/services/company-service.test.ts    # Service layer tests
```

## Implementation Structure

### Main Company Creation API
```typescript
// app/api/companies/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { verifyAuth } from '@/lib/auth/middleware'
import { CompanyService } from '@/lib/services/company-service'
import { createCompanySchema } from '@/lib/validations/company'
import { rateLimit } from '@/lib/utils/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for company creation
    const rateLimitResult = await rateLimit({
      key: `company-create-${request.ip}`,
      limit: 5,
      window: 3600000 // 1 hour
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many company creation attempts. Try again later.' },
        { status: 429 }
      )
    }

    // Verify authentication
    const { user } = await verifyAuth(request)
    const supabase = createClient()

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createCompanySchema.parse(body)

    // Check if user already owns a company (if business logic requires)
    const { data: existingMembership } = await supabase
      .from('COMPANY_USERS')
      .select('id, role')
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .eq('is_active', true)
      .single()

    if (existingMembership) {
      return NextResponse.json(
        { error: 'User already owns a company' },
        { status: 409 }
      )
    }

    // Create company using service
    const companyService = new CompanyService(supabase)
    const company = await companyService.createCompany({
      ...validatedData,
      created_by: user.id
    })

    // Set user as owner
    await companyService.addMember({
      company_id: company.id,
      user_id: user.id,
      role: 'owner',
      added_by: user.id
    })

    // Optional: Initialize company structure
    if (validatedData.setupOptions?.createSampleChatbot) {
      await companyService.initializeCompanyStructure(company.id, {
        createSampleChatbot: true,
        setupDefaultChannels: true
      })
    }

    // Return created company with user role
    const companyWithRole = await companyService.getCompanyWithUserRole(company.id, user.id)

    return NextResponse.json(
      { 
        data: companyWithRole,
        message: 'Company created successfully'
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating company:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid company data',
          details: error.errors
        },
        { status: 400 }
      )
    }

    if (error.code === '23505') { // PostgreSQL unique violation
      return NextResponse.json(
        { error: 'Company name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}
```

### Company Service Implementation
```typescript
// lib/services/company-service.ts
import { SupabaseClient } from '@supabase/supabase-js'
import { CompanySetupService } from './company-setup-service'
import { generateSlug } from '@/utils/slug-generator'
import { validateIndustry, validateCompanySize } from '@/utils/company-utils'

export interface CreateCompanyData {
  name: string
  industry: string
  size: string
  website?: string
  description?: string
  timezone?: string
  country?: string
  created_by: string
  setupOptions?: {
    createSampleChatbot?: boolean
    setupDefaultChannels?: boolean
    inviteTeamMembers?: boolean
  }
}

export interface AddMemberData {
  company_id: string
  user_id: string
  role: 'owner' | 'admin' | 'supervisor' | 'operator'
  added_by: string
}

export class CompanyService {
  constructor(
    private supabase: SupabaseClient,
    private setupService = new CompanySetupService(supabase)
  ) {}

  async createCompany(data: CreateCompanyData) {
    const {
      name,
      industry,
      size,
      website,
      description,
      timezone = 'America/Mexico_City',
      country = 'MX',
      created_by
    } = data

    // Validate business rules
    if (!validateIndustry(industry)) {
      throw new Error(`Invalid industry: ${industry}`)
    }

    if (!validateCompanySize(size)) {
      throw new Error(`Invalid company size: ${size}`)
    }

    // Generate unique slug
    const baseSlug = generateSlug(name)
    const slug = await this.generateUniqueSlug(baseSlug)

    // Default company settings
    const defaultSettings = {
      notifications: {
        email: true,
        inApp: true,
        webhook: false
      },
      features: {
        analytics: true,
        apiAccess: false,
        customBranding: false
      },
      security: {
        enforceSSO: false,
        sessionTimeout: 8, // hours
        ipWhitelist: []
      }
    }

    // Create company record
    const { data: company, error } = await this.supabase
      .from('COMPANIES')
      .insert({
        name,
        industry,
        company_size: size,
        website: website || null,
        description: description || null,
        timezone,
        country,
        slug,
        settings: defaultSettings,
        is_active: true,
        created_by
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create company: ${error.message}`)
    }

    return company
  }

  async getCompanyWithUserRole(companyId: string, userId: string) {
    const { data, error } = await this.supabase
      .from('COMPANIES')
      .select(`
        *,
        COMPANY_USERS!inner(role, is_active),
        COMPANY_SUBSCRIPTIONS(
          id,
          status,
          current_period_end,
          SUBSCRIPTION_PLANS(name)
        )
      `)
      .eq('id', companyId)
      .eq('COMPANY_USERS.user_id', userId)
      .eq('COMPANY_USERS.is_active', true)
      .single()

    if (error) {
      throw new Error(`Failed to get company: ${error.message}`)
    }

    // Get member and chatbot counts
    const [membersCount, chatbotsCount] = await Promise.all([
      this.getMembersCount(companyId),
      this.getChatbotsCount(companyId)
    ])

    // Get user permissions based on role
    const permissions = this.getRolePermissions(data.COMPANY_USERS[0].role)

    return {
      ...data,
      user_role: data.COMPANY_USERS[0].role,
      permissions,
      members_count: membersCount,
      chatbots_count: chatbotsCount,
      subscription: data.COMPANY_SUBSCRIPTIONS?.[0] ? {
        id: data.COMPANY_SUBSCRIPTIONS[0].id,
        plan_name: data.COMPANY_SUBSCRIPTIONS[0].SUBSCRIPTION_PLANS?.name || 'Free',
        status: data.COMPANY_SUBSCRIPTIONS[0].status,
        current_period_end: data.COMPANY_SUBSCRIPTIONS[0].current_period_end
      } : null
    }
  }

  async addMember({ company_id, user_id, role, added_by }: AddMemberData) {
    // Verify the user adding the member has permission
    const { data: adderRole } = await this.supabase
      .from('COMPANY_USERS')
      .select('role')
      .eq('company_id', company_id)
      .eq('user_id', added_by)
      .eq('is_active', true)
      .single()

    if (!adderRole || !['owner', 'admin'].includes(adderRole.role)) {
      throw new Error('Insufficient permissions to add member')
    }

    // Check if user is already a member
    const { data: existingMember } = await this.supabase
      .from('COMPANY_USERS')
      .select('id')
      .eq('company_id', company_id)
      .eq('user_id', user_id)
      .eq('is_active', true)
      .single()

    if (existingMember) {
      throw new Error('User is already a member of this company')
    }

    // Add member
    const { data: member, error } = await this.supabase
      .from('COMPANY_USERS')
      .insert({
        company_id,
        user_id,
        role,
        is_active: true,
        added_by,
        added_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add member: ${error.message}`)
    }

    return member
  }

  async initializeCompanyStructure(companyId: string, options: {
    createSampleChatbot?: boolean
    setupDefaultChannels?: boolean
  }) {
    return await this.setupService.initializeStructure(companyId, options)
  }

  async checkNameAvailability(name: string) {
    const slug = generateSlug(name)
    
    const { data, error } = await this.supabase
      .from('COMPANIES')
      .select('id')
      .eq('slug', slug)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw new Error(`Failed to check name availability: ${error.message}`)
    }

    const available = !data
    const suggestions = available ? [] : await this.generateNameSuggestions(name)

    return {
      available,
      suggested_names: suggestions,
      slug_preview: slug
    }
  }

  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug
    let counter = 1

    while (true) {
      const { data } = await this.supabase
        .from('COMPANIES')
        .select('id')
        .eq('slug', slug)
        .single()

      if (!data) {
        return slug
      }

      slug = `${baseSlug}-${counter}`
      counter++
    }
  }

  private async generateNameSuggestions(name: string): Promise<string[]> {
    const baseSlug = generateSlug(name)
    const suggestions = [
      `${name} Inc`,
      `${name} Co`,
      `${name} Solutions`,
      `${name} Labs`,
      `${name} Tech`
    ]

    // Check availability of suggestions
    const availableSuggestions: string[] = []
    
    for (const suggestion of suggestions) {
      const { available } = await this.checkNameAvailability(suggestion)
      if (available) {
        availableSuggestions.push(suggestion)
      }
      if (availableSuggestions.length >= 3) break
    }

    return availableSuggestions
  }

  private async getMembersCount(companyId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('COMPANY_USERS')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_active', true)

    if (error) {
      console.error('Error getting members count:', error)
      return 0
    }

    return count || 0
  }

  private async getChatbotsCount(companyId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('CHATBOTS')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('is_active', true)

    if (error) {
      console.error('Error getting chatbots count:', error)
      return 0
    }

    return count || 0
  }

  private getRolePermissions(role: string): string[] {
    const permissions = {
      owner: [
        'company:read', 'company:write', 'company:delete',
        'members:read', 'members:write', 'members:delete',
        'billing:read', 'billing:write',
        'chatbots:read', 'chatbots:write', 'chatbots:delete',
        'analytics:read', 'settings:write'
      ],
      admin: [
        'company:read', 'company:write',
        'members:read', 'members:write',
        'billing:read',
        'chatbots:read', 'chatbots:write', 'chatbots:delete',
        'analytics:read', 'settings:write'
      ],
      supervisor: [
        'company:read',
        'members:read',
        'chatbots:read', 'chatbots:write',
        'analytics:read'
      ],
      operator: [
        'company:read',
        'chatbots:read'
      ]
    }

    return permissions[role] || []
  }
}
```

### Company Setup Service
```typescript
// lib/services/company-setup-service.ts
import { SupabaseClient } from '@supabase/supabase-js'

export class CompanySetupService {
  constructor(private supabase: SupabaseClient) {}

  async initializeStructure(companyId: string, options: {
    createSampleChatbot?: boolean
    setupDefaultChannels?: boolean
  }) {
    const createdResources = {
      chatbots: [] as string[],
      channels: [] as string[]
    }

    try {
      // Create sample chatbot if requested
      if (options.createSampleChatbot) {
        const chatbot = await this.createSampleChatbot(companyId)
        createdResources.chatbots.push(chatbot.id)
      }

      // Setup default channels if requested
      if (options.setupDefaultChannels) {
        const channels = await this.setupDefaultChannels(companyId)
        createdResources.channels = channels.map(c => c.id)
      }

      return {
        success: true,
        created_resources: createdResources
      }
    } catch (error) {
      console.error('Error initializing company structure:', error)
      throw error
    }
  }

  private async createSampleChatbot(companyId: string) {
    const { data: chatbot, error } = await this.supabase
      .from('CHATBOTS')
      .insert({
        company_id: companyId,
        name: 'Mi Primer Chatbot',
        description: 'Chatbot de ejemplo para comenzar',
        system_prompt: 'Eres un asistente virtual útil y amigable.',
        model_config: {
          model: 'gpt-4-turbo',
          temperature: 0.7,
          max_tokens: 2000
        },
        status: 'draft',
        is_active: true
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create sample chatbot: ${error.message}`)
    }

    return chatbot
  }

  private async setupDefaultChannels(companyId: string) {
    const defaultChannels = [
      {
        name: 'Website',
        type: 'web',
        description: 'Canal principal del sitio web'
      },
      {
        name: 'WhatsApp',
        type: 'whatsapp',
        description: 'Atención por WhatsApp'
      }
    ]

    const channels = []
    for (const channelData of defaultChannels) {
      const { data: channel, error } = await this.supabase
        .from('CHANNELS')
        .insert({
          company_id: companyId,
          ...channelData,
          is_active: true
        })
        .select()
        .single()

      if (!error) {
        channels.push(channel)
      }
    }

    return channels
  }
}
```

### Name Availability Check API
```typescript
// app/api/companies/check-name/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { CompanyService } from '@/lib/services/company-service'
import { rateLimit } from '@/lib/utils/rate-limit'

const checkNameSchema = z.object({
  name: z.string().min(2).max(100)
})

export async function GET(request: NextRequest) {
  try {
    // Rate limiting for name checks
    const rateLimitResult = await rateLimit({
      key: `name-check-${request.ip}`,
      limit: 30,
      window: 60000 // 1 minute
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')

    if (!name) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    // Validate name
    const validatedData = checkNameSchema.parse({ name })
    
    const supabase = createClient()
    const companyService = new CompanyService(supabase)
    
    const result = await companyService.checkNameAvailability(validatedData.name)

    return NextResponse.json({ data: result })

  } catch (error) {
    console.error('Error checking company name:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid name format',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to check name availability' },
      { status: 500 }
    )
  }
}
```

### Validation Schemas
```typescript
// lib/validations/company.ts
import { z } from 'zod'

const VALID_INDUSTRIES = [
  'technology', 'healthcare', 'finance', 'education', 'retail',
  'manufacturing', 'consulting', 'media', 'nonprofit', 'government',
  'real-estate', 'automotive', 'food-beverage', 'travel', 'other'
] as const

const VALID_COMPANY_SIZES = [
  'startup', 'small', 'medium', 'large', 'enterprise'
] as const

export const createCompanySchema = z.object({
  name: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-&.,]+$/, 'Company name contains invalid characters'),
  
  industry: z.enum(VALID_INDUSTRIES, {
    errorMap: () => ({ message: 'Please select a valid industry' })
  }),
  
  size: z.enum(VALID_COMPANY_SIZES, {
    errorMap: () => ({ message: 'Please select a valid company size' })
  }),
  
  website: z.string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal('')),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  timezone: z.string()
    .default('America/Mexico_City'),
  
  country: z.string()
    .length(2, 'Country must be a 2-letter code')
    .default('MX'),
  
  setupOptions: z.object({
    createSampleChatbot: z.boolean().default(false),
    inviteTeamMembers: z.boolean().default(false),
    setupBilling: z.boolean().default(false)
  }).optional()
})

export const updateCompanySchema = createCompanySchema.partial()

export const addMemberSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  role: z.enum(['admin', 'supervisor', 'operator'], {
    errorMap: () => ({ message: 'Invalid role' })
  })
})

export type CreateCompanyData = z.infer<typeof createCompanySchema>
export type UpdateCompanyData = z.infer<typeof updateCompanySchema>
export type AddMemberData = z.infer<typeof addMemberSchema>
```

### Utility Functions
```typescript
// utils/company-utils.ts
const VALID_INDUSTRIES = [
  'technology', 'healthcare', 'finance', 'education', 'retail',
  'manufacturing', 'consulting', 'media', 'nonprofit', 'government',
  'real-estate', 'automotive', 'food-beverage', 'travel', 'other'
]

const VALID_COMPANY_SIZES = [
  'startup', 'small', 'medium', 'large', 'enterprise'
]

export const validateIndustry = (industry: string): boolean => {
  return VALID_INDUSTRIES.includes(industry)
}

export const validateCompanySize = (size: string): boolean => {
  return VALID_COMPANY_SIZES.includes(size)
}

export const getIndustryDisplayName = (industry: string): string => {
  const displayNames = {
    'technology': 'Tecnología',
    'healthcare': 'Salud',
    'finance': 'Finanzas',
    'education': 'Educación',
    'retail': 'Retail',
    'manufacturing': 'Manufactura',
    'consulting': 'Consultoría',
    'media': 'Medios',
    'nonprofit': 'Sin fines de lucro',
    'government': 'Gobierno',
    'real-estate': 'Bienes raíces',
    'automotive': 'Automotriz',
    'food-beverage': 'Alimentos y bebidas',
    'travel': 'Viajes',
    'other': 'Otro'
  }
  
  return displayNames[industry] || industry
}

export const getCompanySizeDisplayName = (size: string): string => {
  const displayNames = {
    'startup': '1-10 empleados (Startup)',
    'small': '11-50 empleados (Pequeña)',
    'medium': '51-200 empleados (Mediana)',
    'large': '201-1000 empleados (Grande)',
    'enterprise': '1000+ empleados (Empresa)'
  }
  
  return displayNames[size] || size
}

// utils/slug-generator.ts
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\s\-&.,]+/g, '-') // Replace spaces and common chars with hyphens
    .replace(/[^\w\-]/g, '') // Remove non-word characters except hyphens
    .replace(/\-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^\-|\-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50) // Limit length
}

export const validateSlug = (slug: string): boolean => {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}
```

### Error Handling Strategy
```typescript
// utils/api-errors.ts
export class CompanyError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'CompanyError'
  }
}

export const handleCompanyError = (error: any) => {
  if (error instanceof CompanyError) {
    return NextResponse.json(
      { 
        error: error.message, 
        code: error.code,
        details: error.details 
      },
      { status: error.statusCode }
    )
  }

  // Handle PostgreSQL errors
  if (error.code === '23505') { // Unique violation
    return NextResponse.json(
      { error: 'Company name already exists', code: 'DUPLICATE_NAME' },
      { status: 409 }
    )
  }

  if (error.code === '23503') { // Foreign key violation
    return NextResponse.json(
      { error: 'Invalid reference data', code: 'INVALID_REFERENCE' },
      { status: 400 }
    )
  }

  console.error('Unexpected company error:', error)
  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
}
```

### Testing Strategy
```typescript
// __tests__/api/companies/create.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/companies/route'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase
jest.mock('@/lib/supabase/server')

describe('/api/companies', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create company successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-jwt-token'
      },
      body: {
        name: 'Test Company',
        industry: 'technology',
        size: 'startup',
        website: 'https://test.com'
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(201)
    const data = JSON.parse(res._getData())
    expect(data.data).toHaveProperty('id')
    expect(data.data.name).toBe('Test Company')
    expect(data.data.user_role).toBe('owner')
  })

  it('should validate required fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-jwt-token'
      },
      body: {
        name: '', // Invalid
        industry: 'invalid-industry'
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Invalid company data')
    expect(data.details).toHaveLength(2)
  })

  it('should handle duplicate company names', async () => {
    // Mock database to return duplicate error
    mockSupabase.from().insert.mockRejectedValue({
      code: '23505',
      message: 'duplicate key value'
    })

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'Existing Company',
        industry: 'technology',
        size: 'startup'
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(409)
    expect(JSON.parse(res._getData()).error).toBe('Company name already exists')
  })
})
```

### Rate Limiting Implementation
```typescript
// lib/utils/rate-limit.ts
interface RateLimitOptions {
  key: string
  limit: number
  window: number // milliseconds
}

interface RateLimitResult {
  success: boolean
  reset: number
  remaining: number
}

// Simple in-memory rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; reset: number }>()

export async function rateLimit({ key, limit, window }: RateLimitOptions): Promise<RateLimitResult> {
  const now = Date.now()
  const windowStart = now - window
  
  // Clean expired entries
  for (const [k, v] of rateLimitStore.entries()) {
    if (v.reset < now) {
      rateLimitStore.delete(k)
    }
  }
  
  const current = rateLimitStore.get(key)
  
  if (!current) {
    rateLimitStore.set(key, { count: 1, reset: now + window })
    return { success: true, reset: now + window, remaining: limit - 1 }
  }
  
  if (current.count >= limit) {
    return { success: false, reset: current.reset, remaining: 0 }
  }
  
  current.count++
  return { success: true, reset: current.reset, remaining: limit - current.count }
}
```

## Performance Considerations
```typescript
// Database indexes for optimal performance
/*
CREATE INDEX CONCURRENTLY idx_companies_slug ON COMPANIES (slug);
CREATE INDEX CONCURRENTLY idx_companies_name_trgm ON COMPANIES USING gin (name gin_trgm_ops);
CREATE INDEX CONCURRENTLY idx_company_users_company_user ON COMPANY_USERS (company_id, user_id);
CREATE INDEX CONCURRENTLY idx_company_users_role ON COMPANY_USERS (company_id, role) WHERE is_active = true;
*/

// Caching strategy for frequently accessed data
import { cache } from 'react'

export const getCachedCompanyDetails = cache(async (companyId: string, userId: string) => {
  const companyService = new CompanyService(supabase)
  return await companyService.getCompanyWithUserRole(companyId, userId)
})
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- Company API: 8 endpoints implementados con full RBAC enforcement
- Services: CompanyService + CompanySetupService con business logic
- Validation: Comprehensive Zod schemas con error handling
- Next task: TASK-P1E6-06c (Onboarding wizard UI backend integration)
- Multi-tenant: Complete isolation con RLS policies
- Rate limiting: Protection contra abuse en endpoints públicos
- Setup automation: Optional company structure initialization
```

---
*API task para implementar sistema completo de company creation y management*