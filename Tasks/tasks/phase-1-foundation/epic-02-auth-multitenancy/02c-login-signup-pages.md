# TASK-P1E2-02C: Login/Signup Pages

## Identificación
- **ID:** TASK-P1E2-02C
- **Título:** Login/Signup Pages
- **Type:** Frontend UI
- **Phase:** 1 - Foundation
- **Epic:** Auth & Multi-tenancy
- **Sprint:** Sprint 1.2 (Semanas 3-4, Febrero 2025)
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 8 horas
- **Prioridad:** Crítica - Bloquea acceso usuario al sistema

## Definición Técnica
Implementar páginas de autenticación completas con diseño responsive, validación en tiempo real, estados de loading/error, y flujos de verificación de email/reset de password.

## Referencias de Documentación NeurAnt
- **Auth Flow:** `docs/architecture/05-implementation-roadmap.md:114-126` (Login/Signup pages con Supabase Auth)
- **UI Components:** `docs/architecture/05-implementation-roadmap.md:113-143` (Authentication Components)
- **User Experience:** `docs/architecture/08-onboarding-flow.md:15-67` (Onboarding completo)

## Referencias de Diseño Visual (GUIA_DISENO_VISUAL_NEURANT.md)
- **Formularios:** `GUIA_DISENO_VISUAL_NEURANT.md:277-342` (Input Fields, Labels, Validación, Select Dropdowns)
- **Botones:** `GUIA_DISENO_VISUAL_NEURANT.md:223-275` (Botón Primario, Secundario, Estados, Loading)
- **Tipografía:** `GUIA_DISENO_VISUAL_NEURANT.md:116-149` (Sistema tipográfico, jerarquías, pesos)
- **Colores:** `GUIA_DISENO_VISUAL_NEURANT.md:53-114` (Paleta completa, estados, modo claro/oscuro)
- **Estados y Feedback:** `GUIA_DISENO_VISUAL_NEURANT.md:472-532` (Loading, Toast notifications, Error states)
- **Responsive Design:** `GUIA_DISENO_VISUAL_NEURANT.md:824-867` (Mobile-first, breakpoints, componentes móviles)
- **Accesibilidad:** `GUIA_DISENO_VISUAL_NEURANT.md:869-923` (WCAG 2.1 AA, contraste, navegación por teclado)
- **Recomendaciones Técnicas:** `GUIA_DISENO_VISUAL_NEURANT.md:1219-1235` (shadcn/ui componentes), `GUIA_DISENO_VISUAL_NEURANT.md:1367-1380` (React Hook Form + Zod)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E2-02B ✅ (Auth API Endpoints)
- **Bloquea:**
  - [ ] TASK-P1E2-02D (Dashboard Layout)
  - [ ] TASK-P1E2-02E (Auth Context Provider)

## Criterios de Aceptación Específicos
### UI Implementation
- [ ] Login page (/login) con email/password
- [ ] Signup page (/signup) con company creation
- [ ] Forgot password page (/forgot-password)
- [ ] Reset password page (/reset-password)
- [ ] Email verification page (/verify-email)
- [ ] Invitation acceptance page (/accept-invite)

### Form Validation
- [ ] Real-time validation con react-hook-form + zod
- [ ] Error messages user-friendly
- [ ] Loading states durante API calls
- [ ] Success feedback post-actions

### Responsive Design
- [ ] Mobile-first approach
- [ ] Works on all screen sizes (320px+)
- [ ] Touch-friendly interactive elements
- [ ] Proper spacing y typography

## Archivos a Crear/Modificar
```
app/(auth)/login/page.tsx
app/(auth)/signup/page.tsx
app/(auth)/forgot-password/page.tsx
app/(auth)/reset-password/page.tsx
app/(auth)/verify-email/page.tsx
app/(auth)/accept-invite/page.tsx
app/(auth)/layout.tsx
components/auth/login-form.tsx
components/auth/signup-form.tsx
components/auth/forgot-password-form.tsx
components/auth/reset-password-form.tsx
hooks/useAuth.ts
lib/validations/auth-forms.ts
```

## Implementation Structure
```tsx
// app/(auth)/login/page.tsx
import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'
import { AuthLayout } from '@/components/auth/auth-layout'

export const metadata: Metadata = {
  title: 'Sign In | NeurAnt',
  description: 'Sign in to your NeurAnt account'
}

export default function LoginPage() {
  return (
    <AuthLayout 
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      <LoginForm />
    </AuthLayout>
  )
}

// components/auth/login-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icons } from '@/components/ui/icons'
import { signInSchema, type SignInFormData } from '@/lib/validations/auth-forms'
import { useAuth } from '@/hooks/useAuth'

export function LoginForm() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data: SignInFormData) => {
    try {
      setIsLoading(true)
      setError(null)
      
      await signIn(data)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...form.register('email')}
          disabled={isLoading}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          {...form.register('password')}
          disabled={isLoading}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        Sign In
      </Button>

      <div className="text-center text-sm">
        <Link href="/forgot-password" className="text-primary hover:underline">
          Forgot your password?
        </Link>
      </div>

      <div className="text-center text-sm">
        Don't have an account?{' '}
        <Link href="/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </form>
  )
}
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md al completar:
- Auth Pages: ✅ Login, Signup, Reset password implementadas
- Validation: ✅ Real-time form validation funcionando
- UX: ✅ Loading states y error handling
- Responsive: ✅ Mobile-first design
- Siguiente tarea: TASK-P1E2-02D (Dashboard Layout)
```