# Template: Testing Task

## Identificación
- **ID:** TASK-P{phase}E{epic}-{subtask}
- **Título:** [Tipo específico de testing]
- **Type:** Testing
- **Phase:** {1-4} - {Nombre de Phase}
- **Epic:** {Nombre de Epic}
- **Sprint:** {Número de Sprint}
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** {X} horas
- **Prioridad:** {Crítica|Alta|Media|Baja}

## Definición Técnica
[Descripción específica del testing: unit, integration, E2E, performance, security, etc.]

## Referencias de Documentación NeurAnt
- **Test Strategy:** `docs/architecture/{documento}.md:{línea-inicio}-{línea-fin}` (estrategia de testing)
- **User Flows:** `docs/architecture/{documento}.md:{línea-inicio}-{línea-fin}` (flujos críticos)
- **Requirements:** `docs/architecture/{documento}.md:{línea-inicio}-{línea-fin}` (requisitos a validar)
- **Tech Stack:** `docs/architecture/04-tech-stack.md:{línea-inicio}-{línea-fin}` (testing tools)

## Dependencias Técnicas
- **Requiere:**
  - [ ] TASK-ID-X ✅ (features implementadas para testing)
  - [ ] TASK-ID-Y ✅ (test infrastructure setup)
  - [ ] TASK-ID-Z ✅ (test data y fixtures)
- **Bloquea:**
  - [ ] TASK-ID-W (deployment que requiere tests passing)
  - [ ] TASK-ID-V (features que dependen de test validation)

## Testing Specifications
### Test Type & Scope
- **Type:** {Unit | Integration | E2E | Performance | Security | Accessibility}
- **Scope:** {Component | Page | Feature | API | Full Flow}
- **Coverage Target:** {Percentage or specific areas}
- **Browsers:** {Chrome, Firefox, Safari, Edge} (para E2E)

### Test Environment
- **Test Database:** {Local | Staging | Test-specific}
- **Test Data:** {Fixtures | Factories | Real data subset}
- **External Services:** {Mocked | Sandboxed | Real}
- **Authentication:** {Mock users | Test accounts}

### Quality Gates
```typescript
// Quality thresholds
interface QualityGates {
  coverage: {
    lines: number // e.g., 80%
    functions: number // e.g., 90%
    branches: number // e.g., 75%
    statements: number // e.g., 80%
  }
  performance: {
    loadTime: number // e.g., < 2000ms
    apiResponse: number // e.g., < 200ms
    bundleSize: number // e.g., < 1MB
  }
  accessibility: {
    wcagLevel: 'A' | 'AA' | 'AAA' // e.g., AA
    contrastRatio: number // e.g., 4.5:1
  }
}
```

## Criterios de Aceptación Específicos
### Test Implementation
- [ ] Test suite implementado según tipo especificado
- [ ] All critical user flows covered
- [ ] Edge cases y error scenarios included
- [ ] Test data y mocks apropiados configurados

### Test Quality
- [ ] Tests son deterministic (no flaky tests)
- [ ] Clear test descriptions y assertions
- [ ] Proper test isolation (no side effects)
- [ ] Performance within acceptable limits

### Coverage & Reporting
- [ ] Coverage targets alcanzados
- [ ] Test reports generados automáticamente
- [ ] Failed tests provide clear error messages
- [ ] CI/CD integration working

### Documentation
- [ ] Test strategy documented
- [ ] Test cases documented para complex scenarios
- [ ] Debugging guides para failed tests
- [ ] Maintenance procedures established

## Archivos a Crear/Modificar
```
__tests__/{domain}/{test-name}.test.{ts|tsx}
__tests__/fixtures/{domain}-fixtures.ts
__tests__/helpers/{test-helpers}.ts
__tests__/setup/{test-setup}.ts
e2e/{feature}/{test-name}.spec.ts
cypress/fixtures/{test-data}.json
jest.config.js (configuración)
playwright.config.ts (E2E config)
.github/workflows/test.yml (CI config)
```

## Testing Implementation Patterns

### Unit Testing (Jest + Testing Library)
```tsx
// __tests__/components/chatbot-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChatbotForm } from '@/components/chatbots/chatbot-form'
import { chatbotService } from '@/lib/services/chatbot-service'

// Mock external dependencies
jest.mock('@/lib/services/chatbot-service', () => ({
  chatbotService: {
    create: jest.fn(),
    update: jest.fn(),
    validate: jest.fn()
  }
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn()
  })
}))

// Test wrapper with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('ChatbotForm', () => {
  const defaultProps = {
    onSuccess: jest.fn(),
    onCancel: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Form Rendering', () => {
    it('renders all required form fields', () => {
      render(<ChatbotForm {...defaultProps} />, { wrapper: TestWrapper })

      expect(screen.getByLabelText(/chatbot name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/system prompt/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create chatbot/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('shows edit mode for existing chatbot', () => {
      const existingChatbot = {
        id: '1',
        name: 'Test Bot',
        description: 'Test Description',
        systemPrompt: 'You are a helpful assistant'
      }

      render(
        <ChatbotForm {...defaultProps} chatbot={existingChatbot} />, 
        { wrapper: TestWrapper }
      )

      expect(screen.getByDisplayValue('Test Bot')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /update chatbot/i })).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('shows validation errors for empty required fields', async () => {
      const user = userEvent.setup()
      render(<ChatbotForm {...defaultProps} />, { wrapper: TestWrapper })

      const submitButton = screen.getByRole('button', { name: /create chatbot/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/chatbot name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/system prompt is required/i)).toBeInTheDocument()
      })
    })

    it('validates name length limits', async () => {
      const user = userEvent.setup()
      render(<ChatbotForm {...defaultProps} />, { wrapper: TestWrapper })

      const nameInput = screen.getByLabelText(/chatbot name/i)
      await user.type(nameInput, 'a'.repeat(256)) // Exceed max length

      const submitButton = screen.getByRole('button', { name: /create chatbot/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/name must be less than 255 characters/i)).toBeInTheDocument()
      })
    })

    it('validates system prompt format', async () => {
      const user = userEvent.setup()
      ;(chatbotService.validate as jest.Mock).mockResolvedValue({
        valid: false,
        errors: ['Invalid prompt format']
      })

      render(<ChatbotForm {...defaultProps} />, { wrapper: TestWrapper })

      const nameInput = screen.getByLabelText(/chatbot name/i)
      const promptInput = screen.getByLabelText(/system prompt/i)
      
      await user.type(nameInput, 'Test Bot')
      await user.type(promptInput, 'Invalid prompt')

      const submitButton = screen.getByRole('button', { name: /create chatbot/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid prompt format/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('creates new chatbot successfully', async () => {
      const user = userEvent.setup()
      const mockChatbot = {
        id: '1',
        name: 'Test Bot',
        description: 'Test Description',
        systemPrompt: 'You are helpful'
      }

      ;(chatbotService.create as jest.Mock).mockResolvedValue(mockChatbot)

      render(<ChatbotForm {...defaultProps} />, { wrapper: TestWrapper })

      // Fill form
      await user.type(screen.getByLabelText(/chatbot name/i), 'Test Bot')
      await user.type(screen.getByLabelText(/description/i), 'Test Description')
      await user.type(screen.getByLabelText(/system prompt/i), 'You are helpful')

      // Submit
      await user.click(screen.getByRole('button', { name: /create chatbot/i }))

      await waitFor(() => {
        expect(chatbotService.create).toHaveBeenCalledWith({
          name: 'Test Bot',
          description: 'Test Description',
          systemPrompt: 'You are helpful'
        })
        expect(defaultProps.onSuccess).toHaveBeenCalledWith(mockChatbot)
      })
    })

    it('handles creation errors gracefully', async () => {
      const user = userEvent.setup()
      ;(chatbotService.create as jest.Mock).mockRejectedValue(
        new Error('Creation failed')
      )

      render(<ChatbotForm {...defaultProps} />, { wrapper: TestWrapper })

      // Fill form
      await user.type(screen.getByLabelText(/chatbot name/i), 'Test Bot')
      await user.type(screen.getByLabelText(/system prompt/i), 'You are helpful')

      // Submit
      await user.click(screen.getByRole('button', { name: /create chatbot/i }))

      await waitFor(() => {
        expect(screen.getByText(/creation failed/i)).toBeInTheDocument()
        expect(defaultProps.onSuccess).not.toHaveBeenCalled()
      })
    })

    it('shows loading state during submission', async () => {
      const user = userEvent.setup()
      ;(chatbotService.create as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      )

      render(<ChatbotForm {...defaultProps} />, { wrapper: TestWrapper })

      // Fill form
      await user.type(screen.getByLabelText(/chatbot name/i), 'Test Bot')
      await user.type(screen.getByLabelText(/system prompt/i), 'You are helpful')

      // Submit
      await user.click(screen.getByRole('button', { name: /create chatbot/i }))

      expect(screen.getByText(/creating.../i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /creating.../i })).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<ChatbotForm {...defaultProps} />, { wrapper: TestWrapper })

      const form = screen.getByRole('form')
      expect(form).toHaveAttribute('aria-labelledby')

      const nameInput = screen.getByLabelText(/chatbot name/i)
      expect(nameInput).toHaveAttribute('aria-required', 'true')
      expect(nameInput).toHaveAttribute('aria-describedby')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<ChatbotForm {...defaultProps} />, { wrapper: TestWrapper })

      const nameInput = screen.getByLabelText(/chatbot name/i)
      nameInput.focus()
      expect(document.activeElement).toBe(nameInput)

      await user.tab()
      expect(document.activeElement).toBe(screen.getByLabelText(/description/i))

      await user.tab()
      expect(document.activeElement).toBe(screen.getByLabelText(/system prompt/i))
    })

    it('announces errors to screen readers', async () => {
      const user = userEvent.setup()
      render(<ChatbotForm {...defaultProps} />, { wrapper: TestWrapper })

      await user.click(screen.getByRole('button', { name: /create chatbot/i }))

      await waitFor(() => {
        const errorElement = screen.getByText(/chatbot name is required/i)
        expect(errorElement).toHaveAttribute('role', 'alert')
        expect(errorElement).toHaveAttribute('aria-live', 'polite')
      })
    })
  })
})
```

### Integration Testing (API Routes)
```tsx
// __tests__/api/chatbots.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/chatbots/route'
import { supabase } from '@/lib/supabase/server'
import { testUser, testCompany } from '@/__tests__/fixtures/auth-fixtures'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
    auth: {
      getUser: jest.fn()
    }
  }
}))

const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('/api/chatbots', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/chatbots', () => {
    it('returns chatbots for authenticated user', async () => {
      const mockChatbots = [
        { id: '1', name: 'Bot 1', company_id: testCompany.id },
        { id: '2', name: 'Bot 2', company_id: testCompany.id }
      ]

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: testUser },
        error: null
      })

      mockSupabase.from().select().eq().mockResolvedValue({
        data: mockChatbots,
        error: null
      })

      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          authorization: `Bearer ${testUser.access_token}`
        }
      })

      await handler.GET(req)

      expect(mockSupabase.from).toHaveBeenCalledWith('chatbots')
      expect(res.statusCode).toBe(200)
      
      const responseData = JSON.parse(res._getData())
      expect(responseData.data).toEqual(mockChatbots)
    })

    it('returns 401 for unauthenticated requests', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      })

      await handler.GET(req)

      expect(res.statusCode).toBe(401)
    })

    it('filters chatbots by company_id (RLS)', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: testUser },
        error: null
      })

      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          authorization: `Bearer ${testUser.access_token}`
        }
      })

      await handler.GET(req)

      expect(mockSupabase.from().eq).toHaveBeenCalledWith('company_id', testUser.company_id)
    })
  })

  describe('POST /api/chatbots', () => {
    it('creates new chatbot successfully', async () => {
      const newChatbot = {
        name: 'New Bot',
        description: 'Test bot',
        system_prompt: 'You are helpful'
      }

      const createdChatbot = {
        id: '3',
        ...newChatbot,
        company_id: testCompany.id,
        created_at: '2023-01-01T00:00:00Z'
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: testUser },
        error: null
      })

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: createdChatbot,
        error: null
      })

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          authorization: `Bearer ${testUser.access_token}`,
          'content-type': 'application/json'
        },
        body: newChatbot
      })

      await handler.POST(req)

      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        ...newChatbot,
        company_id: testUser.company_id
      })
      expect(res.statusCode).toBe(201)
    })

    it('validates required fields', async () => {
      const invalidChatbot = {
        description: 'Missing name'
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: testUser },
        error: null
      })

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          authorization: `Bearer ${testUser.access_token}`,
          'content-type': 'application/json'
        },
        body: invalidChatbot
      })

      await handler.POST(req)

      expect(res.statusCode).toBe(400)
      const responseData = JSON.parse(res._getData())
      expect(responseData.error).toContain('name')
    })

    it('handles database errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: testUser },
        error: null
      })

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          authorization: `Bearer ${testUser.access_token}`,
          'content-type': 'application/json'
        },
        body: {
          name: 'Test Bot',
          system_prompt: 'You are helpful'
        }
      })

      await handler.POST(req)

      expect(res.statusCode).toBe(500)
    })
  })
})
```

### E2E Testing (Playwright)
```tsx
// e2e/chatbot-management.spec.ts
import { test, expect } from '@playwright/test'
import { loginAsAdmin, createTestChatbot, cleanupTestData } from './helpers/test-helpers'

test.describe('Chatbot Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test.afterEach(async ({ page }) => {
    await cleanupTestData(page)
  })

  test('should create a new chatbot', async ({ page }) => {
    // Navigate to chatbots page
    await page.goto('/dashboard/chatbots')
    await expect(page.locator('h1')).toContainText('Chatbots')

    // Click create button
    await page.click('[data-testid="create-chatbot-button"]')
    await expect(page.locator('[data-testid="chatbot-form"]')).toBeVisible()

    // Fill form
    await page.fill('[data-testid="chatbot-name"]', 'E2E Test Bot')
    await page.fill('[data-testid="chatbot-description"]', 'Created by E2E test')
    await page.fill('[data-testid="system-prompt"]', 'You are a helpful assistant for testing')

    // Submit form
    await page.click('[data-testid="submit-button"]')

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="chatbot-list"]')).toContainText('E2E Test Bot')
  })

  test('should edit existing chatbot', async ({ page }) => {
    // Create test chatbot first
    const chatbot = await createTestChatbot(page, {
      name: 'Original Bot',
      description: 'Original description'
    })

    // Navigate to edit
    await page.goto('/dashboard/chatbots')
    await page.click(`[data-testid="edit-chatbot-${chatbot.id}"]`)

    // Modify fields
    await page.fill('[data-testid="chatbot-name"]', 'Updated Bot')
    await page.fill('[data-testid="chatbot-description"]', 'Updated description')

    // Save changes
    await page.click('[data-testid="submit-button"]')

    // Verify updates
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="chatbot-list"]')).toContainText('Updated Bot')
  })

  test('should delete chatbot with confirmation', async ({ page }) => {
    // Create test chatbot
    const chatbot = await createTestChatbot(page, {
      name: 'To Delete Bot'
    })

    await page.goto('/dashboard/chatbots')

    // Click delete button
    await page.click(`[data-testid="delete-chatbot-${chatbot.id}"]`)

    // Confirm deletion in modal
    await expect(page.locator('[data-testid="confirm-delete-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="confirm-delete-modal"]')).toContainText('To Delete Bot')
    
    await page.click('[data-testid="confirm-delete-button"]')

    // Verify deletion
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="chatbot-list"]')).not.toContainText('To Delete Bot')
  })

  test('should validate form fields', async ({ page }) => {
    await page.goto('/dashboard/chatbots')
    await page.click('[data-testid="create-chatbot-button"]')

    // Try to submit empty form
    await page.click('[data-testid="submit-button"]')

    // Check validation errors
    await expect(page.locator('[data-testid="name-error"]')).toContainText('required')
    await expect(page.locator('[data-testid="prompt-error"]')).toContainText('required')

    // Form should not be submitted
    await expect(page.locator('[data-testid="chatbot-form"]')).toBeVisible()
  })

  test('should handle real-time updates', async ({ page, context }) => {
    // Open chatbots page in two tabs
    const page1 = page
    const page2 = await context.newPage()

    await page1.goto('/dashboard/chatbots')
    await page2.goto('/dashboard/chatbots')

    // Create chatbot in first tab
    await page1.click('[data-testid="create-chatbot-button"]')
    await page1.fill('[data-testid="chatbot-name"]', 'Real-time Test Bot')
    await page1.fill('[data-testid="system-prompt"]', 'Test prompt')
    await page1.click('[data-testid="submit-button"]')

    // Verify it appears in second tab (real-time update)
    await expect(page2.locator('[data-testid="chatbot-list"]'))
      .toContainText('Real-time Test Bot', { timeout: 5000 })
  })

  test('should be accessible', async ({ page }) => {
    await page.goto('/dashboard/chatbots')

    // Check page structure
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('main')).toHaveAttribute('role', 'main')

    // Check keyboard navigation
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="create-chatbot-button"]')).toBeFocused()

    // Check ARIA labels
    const createButton = page.locator('[data-testid="create-chatbot-button"]')
    await expect(createButton).toHaveAttribute('aria-label')

    // Test with screen reader simulation
    const announcement = await page.locator('[role="status"]')
    if (await announcement.isVisible()) {
      await expect(announcement).toHaveAttribute('aria-live')
    }
  })

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/dashboard/chatbots')

    // Mobile navigation should be visible
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()

    // Cards should stack vertically
    const chatbotCards = page.locator('[data-testid^="chatbot-card-"]')
    if (await chatbotCards.first().isVisible()) {
      const firstCard = chatbotCards.first()
      const secondCard = chatbotCards.nth(1)
      
      if (await secondCard.isVisible()) {
        const firstRect = await firstCard.boundingBox()
        const secondRect = await secondCard.boundingBox()
        
        // Second card should be below first card (stacked)
        expect(secondRect!.y).toBeGreaterThan(firstRect!.y + firstRect!.height)
      }
    }
  })
})
```

### Performance Testing
```tsx
// __tests__/performance/chatbot-performance.test.ts
import { test, expect } from '@playwright/test'

test.describe('Chatbot Performance', () => {
  test('chatbot list should load within 2 seconds', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/dashboard/chatbots')
    await expect(page.locator('[data-testid="chatbot-list"]')).toBeVisible()
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(2000)
  })

  test('form submission should respond within 1 second', async ({ page }) => {
    await page.goto('/dashboard/chatbots')
    await page.click('[data-testid="create-chatbot-button"]')
    
    await page.fill('[data-testid="chatbot-name"]', 'Performance Test Bot')
    await page.fill('[data-testid="system-prompt"]', 'Quick response test')
    
    const startTime = Date.now()
    await page.click('[data-testid="submit-button"]')
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    
    const responseTime = Date.now() - startTime
    expect(responseTime).toBeLessThan(1000)
  })

  test('should handle 50 concurrent chatbot renders', async ({ page }) => {
    // Mock API to return 50 chatbots
    await page.route('/api/chatbots', (route) => {
      const chatbots = Array.from({ length: 50 }, (_, i) => ({
        id: `bot-${i}`,
        name: `Chatbot ${i}`,
        description: `Description for chatbot ${i}`,
        created_at: new Date().toISOString()
      }))
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: chatbots })
      })
    })

    const startTime = Date.now()
    await page.goto('/dashboard/chatbots')
    
    // Wait for all cards to render
    await expect(page.locator('[data-testid^="chatbot-card-"]')).toHaveCount(50)
    
    const renderTime = Date.now() - startTime
    expect(renderTime).toBeLessThan(3000) // Should render 50 items in under 3 seconds
  })

  test('bundle size should be reasonable', async ({ page }) => {
    // Monitor network requests
    const requests: any[] = []
    page.on('request', request => {
      if (request.url().includes('.js') || request.url().includes('.css')) {
        requests.push(request)
      }
    })

    await page.goto('/dashboard/chatbots')
    await page.waitForLoadState('networkidle')

    // Calculate total bundle size
    const responses = await Promise.all(
      requests.map(req => req.response())
    )

    const totalSize = responses.reduce((total, response) => {
      if (response) {
        const contentLength = response.headers()['content-length']
        return total + (parseInt(contentLength) || 0)
      }
      return total
    }, 0)

    // Should be under 1MB total
    expect(totalSize).toBeLessThan(1024 * 1024)
  })
})
```

### Accessibility Testing
```tsx
// __tests__/accessibility/a11y.test.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('chatbot form should be accessible', async ({ page }) => {
    await page.goto('/dashboard/chatbots')
    await page.click('[data-testid="create-chatbot-button"]')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/dashboard/chatbots')

    // Tab through interactive elements
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="create-chatbot-button"]')).toBeFocused()

    await page.keyboard.press('Tab')
    const nextFocusedElement = await page.locator(':focus')
    await expect(nextFocusedElement).toBeVisible()
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/dashboard/chatbots')

    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    const headingLevels = await Promise.all(
      headings.map(h => h.evaluate(el => parseInt(el.tagName.charAt(1))))
    )

    // Should start with h1
    expect(headingLevels[0]).toBe(1)

    // No skipped levels
    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i - 1]
      expect(diff).toBeLessThanOrEqual(1)
    }
  })

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/dashboard/chatbots')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['color-contrast'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })
})
```

### Test Fixtures & Helpers
```tsx
// __tests__/fixtures/auth-fixtures.ts
export const testUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  company_id: 'test-company-id',
  role: 'admin',
  access_token: 'test-access-token'
}

export const testCompany = {
  id: 'test-company-id',
  name: 'Test Company',
  slug: 'test-company'
}

export const testChatbot = {
  id: 'test-chatbot-id',
  name: 'Test Chatbot',
  description: 'Test Description',
  system_prompt: 'You are a helpful assistant',
  company_id: 'test-company-id',
  is_active: true,
  created_at: '2023-01-01T00:00:00Z'
}

// __tests__/helpers/test-helpers.ts
import { Page } from '@playwright/test'

export async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.fill('[data-testid="email"]', 'admin@test.com')
  await page.fill('[data-testid="password"]', 'password123')
  await page.click('[data-testid="login-button"]')
  await page.waitForURL('/dashboard')
}

export async function createTestChatbot(
  page: Page, 
  data: { name: string; description?: string }
) {
  await page.goto('/dashboard/chatbots')
  await page.click('[data-testid="create-chatbot-button"]')
  
  await page.fill('[data-testid="chatbot-name"]', data.name)
  if (data.description) {
    await page.fill('[data-testid="chatbot-description"]', data.description)
  }
  await page.fill('[data-testid="system-prompt"]', 'Test prompt')
  
  await page.click('[data-testid="submit-button"]')
  await page.waitForSelector('[data-testid="success-message"]')
  
  // Return created chatbot ID (would get from API response in real test)
  return { id: 'created-chatbot-id' }
}

export async function cleanupTestData(page: Page) {
  // Clean up any test data created during tests
  await page.evaluate(() => {
    // Call cleanup API endpoints or reset test database
  })
}
```

## Test Configuration Files
```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- Testing implemented: {Test Type} for {Feature/Component}
- Coverage achieved: {X}% (lines/functions/branches)
- Test suites: ✅ {Unit|Integration|E2E|Performance|A11y}
- Quality gates: ✅ All thresholds met
- CI integration: ✅ Tests running on PR/push
- Next testing task: TASK-ID-NEXT
- Ready for deployment: ✅ All tests passing
```

## Troubleshooting Tests
### Common Issues
- **Flaky Tests:** [Non-deterministic behavior, timing issues]
- **Slow Tests:** [Database calls, network requests, large fixtures]
- **CI/CD Failures:** [Environment differences, resource limits]
- **Coverage Issues:** [Untested edge cases, complex branches]

### Debugging Commands
```bash
# Run specific test
npm run test -- --testNamePattern="should create chatbot"

# Run with coverage
npm run test:coverage

# Debug E2E tests
npm run e2e -- --debug

# Run accessibility tests
npm run test:a11y

# Performance profiling
npm run test -- --verbose --no-cache
```

---
*Template específico para tareas de Testing: unit tests, integration tests, E2E tests, performance testing, accessibility testing, etc.*