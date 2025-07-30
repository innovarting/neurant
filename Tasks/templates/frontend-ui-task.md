# Template: Frontend UI Task

## Identificación
- **ID:** TASK-P{phase}E{epic}-{subtask}
- **Título:** [Componente o página específica]
- **Type:** Frontend UI
- **Phase:** {1-4} - {Nombre de Phase}
- **Epic:** {Nombre de Epic}
- **Sprint:** {Número de Sprint}
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** {X} horas
- **Prioridad:** {Crítica|Alta|Media|Baja}

## Definición Técnica
[Descripción específica del componente, página o interfaz que se implementará]

## Referencias de Documentación NeurAnt
- **UI/UX Requirements:** `docs/architecture/{documento}.md:{línea-inicio}-{línea-fin}` (diseño específico)
- **Component Specs:** `docs/architecture/{documento}.md:{línea-inicio}-{línea-fin}` (especificaciones UI)
- **User Flow:** `docs/architecture/{documento}.md:{línea-inicio}-{línea-fin}` (flujo de usuario)
- **Tech Stack:** `docs/architecture/04-tech-stack.md:{línea-inicio}-{línea-fin}` (frontend frameworks)

## Dependencias Técnicas
- **Requiere:**
  - [ ] TASK-ID-X ✅ (API endpoints necesarios)
  - [ ] TASK-ID-Y ✅ (schema/types definidos)
  - [ ] TASK-ID-Z ✅ (componentes base UI)
- **Bloquea:**
  - [ ] TASK-ID-W (componentes que dependen de este)
  - [ ] TASK-ID-V (páginas que usan este componente)

## UI/UX Specifications
### Design Requirements
- **Layout:** [Descripción del layout y estructura]
- **Responsive:** Mobile-first, breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)
- **Theme:** Support para light/dark mode
- **Accessibility:** WCAG 2.1 AA compliance

### Component Structure
```tsx
// Estructura del componente principal
interface {ComponentName}Props {
  // Props interface
  prop1: string
  prop2?: number
  onAction?: (data: ActionData) => void
}

export const {ComponentName}: React.FC<{ComponentName}Props> = ({
  prop1,
  prop2,
  onAction
}) => {
  // Component implementation
  return (
    <div className="responsive-container">
      {/* Component JSX */}
    </div>
  )
}
```

## Criterios de Aceptación Específicos
### Functional Requirements
- [ ] Componente renderiza correctamente en todos los breakpoints
- [ ] Interacciones de usuario funcionan según spec
- [ ] Estados loading, error y success manejados apropiadamente
- [ ] Validaciones cliente implementadas (si aplica)

### Visual Requirements
- [ ] Design system aplicado (colores, tipografía, espaciado)
- [ ] Componentes shadcn/ui utilizados apropiadamente
- [ ] Animations y transiciones según UX spec
- [ ] Dark/light mode funcional

### Accessibility Requirements
- [ ] Semantic HTML utilizado apropiadamente
- [ ] ARIA labels y roles implementados
- [ ] Keyboard navigation funcional
- [ ] Focus management correcto
- [ ] Screen reader friendly

### Performance Requirements
- [ ] Componente lazy-loaded si es apropiado
- [ ] Imágenes optimizadas y con alt text
- [ ] No memory leaks en useEffect cleanup
- [ ] Bundle size impact minimal

## Archivos a Crear/Modificar
```
components/{category}/{component-name}.tsx
components/{category}/{component-name}.stories.tsx
components/{category}/index.ts
types/{domain}.ts (si aplica)
hooks/use{HookName}.ts (si aplica)
app/{route}/page.tsx (si es página)
app/{route}/layout.tsx (si es layout)
__tests__/components/{component-name}.test.tsx
```

## Component Implementation

### Base Component Structure
```tsx
// components/{category}/{component-name}.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import type { {ComponentName}Props, {DataType} } from '@/types/{domain}'

export const {ComponentName}: React.FC<{ComponentName}Props> = ({
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  onAction,
  ...props
}) => {
  const [state, setState] = useState<{StateType}>({
    // Initial state
  })
  
  const [isLoading, setIsLoading] = useState(loading)
  const [error, setError] = useState<string | null>(null)

  // Event handlers
  const handleAction = useCallback(async (data: {DataType}) => {
    try {
      setIsLoading(true)
      setError(null)
      
      await onAction?.(data)
      
      // Success state updates
      setState(prev => ({ ...prev, /* updates */ }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [onAction])

  // Side effects
  useEffect(() => {
    // Component lifecycle logic
    return () => {
      // Cleanup
    }
  }, [])

  // Error state
  if (error) {
    return (
      <Card className={cn('border-destructive', className)}>
        <CardContent className="p-6">
          <p className="text-destructive text-sm">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setError(null)}
            className="mt-2"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn('min-h-[200px]', className)}>
        <CardContent className="flex items-center justify-center p-6">
          <LoadingSpinner size="lg" />
          <span className="ml-2 text-muted-foreground">Loading...</span>
        </CardContent>
      </Card>
    )
  }

  // Main render
  return (
    <Card className={cn(
      'transition-all duration-200',
      {
        'opacity-50 pointer-events-none': disabled,
      },
      className
    )}>
      <CardHeader>
        <CardTitle>{/* Component title */}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main component content */}
        <div className="space-y-4">
          {/* Component elements */}
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 mt-6">
          <Button 
            onClick={() => handleAction(/* data */)}
            disabled={disabled || isLoading}
            size={size}
          >
            {/* Button text */}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

{ComponentName}.displayName = '{ComponentName}'

export default {ComponentName}
```

### Custom Hook (si aplica)
```tsx
// hooks/use{HookName}.ts
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import type { {DataType} } from '@/types/{domain}'

export const use{HookName} = () => {
  const [data, setData] = useState<{DataType}[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/{endpoint}')
      if (!response.ok) throw new Error('Failed to fetch data')
      
      const result = await response.json()
      setData(result.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const mutateData = useCallback(async (newData: Partial<{DataType}>) => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/{endpoint}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      })
      
      if (!response.ok) throw new Error('Failed to save data')
      
      const result = await response.json()
      setData(prev => [...prev, result.data])
      toast.success('Data saved successfully')
      
      return result.data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate: mutateData
  }
}
```

## Responsive Design Implementation
```tsx
// Responsive utility classes and breakpoints
const responsiveStyles = {
  container: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6',
  card: 'p-4 sm:p-6 lg:p-8',
  text: 'text-sm sm:text-base lg:text-lg',
  button: 'px-3 py-2 sm:px-4 sm:py-2 lg:px-6 lg:py-3'
}

// Mobile-first media queries
const breakpoints = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px'
}
```

## Testing Implementation
```tsx
// __tests__/components/{component-name}.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { {ComponentName} } from '../{component-name}'

// Mock dependencies
jest.mock('@/hooks/use{HookName}', () => ({
  use{HookName}: () => ({
    data: mockData,
    loading: false,
    error: null,
    refetch: jest.fn(),
    mutate: jest.fn()
  })
}))

describe('{ComponentName}', () => {
  const defaultProps = {
    // Default test props
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<{ComponentName} {...defaultProps} />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('displays loading state', () => {
    render(<{ComponentName} {...defaultProps} loading={true} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('displays error state', () => {
    render(<{ComponentName} {...defaultProps} error="Test error" />)
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('handles user interactions', async () => {
    const onAction = jest.fn()
    render(<{ComponentName} {...defaultProps} onAction={onAction} />)
    
    const button = screen.getByRole('button', { name: /action/i })
    await userEvent.click(button)
    
    expect(onAction).toHaveBeenCalledWith(expect.any(Object))
  })

  it('is accessible', () => {
    render(<{ComponentName} {...defaultProps} />)
    
    // Check ARIA attributes
    expect(screen.getByRole('main')).toHaveAttribute('aria-label')
    
    // Check keyboard navigation
    const firstInteractive = screen.getByRole('button')
    firstInteractive.focus()
    expect(document.activeElement).toBe(firstInteractive)
  })

  it('supports dark mode', () => {
    const { container } = render(<{ComponentName} {...defaultProps} />)
    
    // Test theme classes are applied
    expect(container.firstChild).toHaveClass('dark:bg-slate-950')
  })
})
```

## Storybook Stories (si aplica)
```tsx
// components/{category}/{component-name}.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { {ComponentName} } from './{component-name}'

const meta: Meta<typeof {ComponentName}> = {
  title: 'Components/{Category}/{ComponentName}',
  component: {ComponentName},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Description of the component functionality'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'outline', 'ghost']
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg']
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Default story
export const Default: Story = {
  args: {
    // Default args
  }
}

// Variant stories
export const Loading: Story = {
  args: {
    loading: true
  }
}

export const WithError: Story = {
  args: {
    error: 'Something went wrong'
  }
}

export const Interactive: Story = {
  args: {
    onAction: (data) => console.log('Action:', data)
  }
}

// Dark mode story
export const DarkMode: Story = {
  args: {},
  parameters: {
    themes: {
      themeOverride: 'dark'
    }
  }
}
```

## Validation Rules
### Form Validation (si aplica)
```tsx
// lib/validations/{component-name}.ts
import { z } from 'zod'

export const {ComponentName}Schema = z.object({
  field1: z.string().min(1, 'Field is required').max(255, 'Too long'),
  field2: z.number().positive('Must be positive'),
  field3: z.boolean().optional(),
  email: z.string().email('Invalid email format'),
  url: z.string().url('Invalid URL format').optional()
})

export type {ComponentName}FormData = z.infer<typeof {ComponentName}Schema>

// React Hook Form integration
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export const use{ComponentName}Form = () => {
  return useForm<{ComponentName}FormData>({
    resolver: zodResolver({ComponentName}Schema),
    defaultValues: {
      // Default form values
    }
  })
}
```

## Performance Optimizations
```tsx
// Performance considerations
import { memo, useMemo, useCallback } from 'react'
import { lazy, Suspense } from 'react'

// Lazy loading for heavy components
const Heavy{ComponentName} = lazy(() => import('./heavy-{component-name}'))

// Memoized component for expensive renders
export const {ComponentName} = memo<{ComponentName}Props>(({
  data,
  onAction
}) => {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      computed: expensiveCalculation(item)
    }))
  }, [data])

  // Memoize callbacks to prevent unnecessary re-renders
  const handleAction = useCallback((id: string) => {
    onAction?.(id)
  }, [onAction])

  return (
    <div>
      {/* Component content */}
      <Suspense fallback={<LoadingSpinner />}>
        <Heavy{ComponentName} data={processedData} onAction={handleAction} />
      </Suspense>
    </div>
  )
})
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md:
- UI Component implemented: {ComponentName}
- Pages created: [lista de páginas]
- Responsive design: ✅ Mobile-first approach
- Accessibility: ✅ WCAG 2.1 AA compliant
- Testing: ✅ Unit tests passing
- Storybook: ✅ Stories documented
- Next UI task: TASK-ID-NEXT
- Integration ready for: [backend APIs needed]
```

## Troubleshooting Frontend
### Common Issues
- **Hydration Errors:** [Cliente vs server-side rendering mismatches]
- **Performance Issues:** [Bundle size, re-renders]
- **Accessibility Issues:** [Screen reader, keyboard navigation]
- **Responsive Issues:** [Breakpoint specific problems]

### Debugging Commands
```bash
# Next.js development
npm run dev
npm run build
npm run analyze # Bundle analyzer

# Testing
npm run test
npm run test:coverage
npm run test:watch

# Storybook
npm run storybook
npm run build-storybook

# Accessibility testing
npm run test:a11y
```

---
*Template específico para tareas de Frontend UI: componentes React, páginas, layouts, forms, y toda la interfaz de usuario.*