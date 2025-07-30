# TASK-P1E2-02E: Auth Context Provider

## Identificación
- **ID:** TASK-P1E2-02E
- **Título:** Auth Context Provider
- **Type:** Frontend State
- **Phase:** 1 - Foundation
- **Epic:** Auth & Multi-tenancy
- **Sprint:** Sprint 1.2 (Semanas 3-4, Febrero 2025)
- **Status:** ⏳ Pendiente
- **Tiempo Estimado:** 5 horas
- **Prioridad:** Crítica - Central para state management de auth

## Definición Técnica
Implementar React Context global para autenticación con Supabase, manejo de estado de usuario, company context, real-time session management, y helpers para RBAC.

## Referencias de Documentación NeurAnt
- **Auth State:** `docs/architecture/05-implementation-roadmap.md:105-106` (Tenant context provider)
- **RBAC Context:** `docs/architecture/10-modelo-datos-rbac-extendido.md:67-89` (Role-based context)

## Dependencias Técnicas
- **Requiere:**
  - [x] TASK-P1E2-02B ✅ (Auth API Endpoints)
  - [x] TASK-P1E2-02D ✅ (Dashboard Layout)
- **Bloquea:**
  - [ ] TASK-P1E2-02F (RBAC Middleware)
  - [ ] Todo componente que necesite auth state

## Criterios de Aceptación Específicos
- [ ] Auth context con user, profile, company state
- [ ] Real-time session updates con Supabase
- [ ] RBAC helpers (hasRole, canAccess)
- [ ] Auto-redirect on auth state changes
- [ ] Loading states durante auth operations

## Archivos a Crear/Modificar
```
contexts/auth-context.tsx
hooks/useAuth.ts
hooks/useRBAC.ts
providers/auth-provider.tsx
lib/auth/auth-utils.ts
```

## Implementation Structure
```tsx
// contexts/auth-context.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/supabase-auth-helpers/nextjs'
import type { User, Session } from '@supabase/supabase-js'
import type { UserProfile, Company, UserRole } from '@/types/auth'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  company: Company | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data: SignUpData) => Promise<void>
  signOut: () => Promise<void>
  hasRole: (role: UserRole) => boolean
  canAccess: (resource: string, action: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClientComponentClient()

  // Initialize auth state
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }
      
      setLoading(false)
    }

    getSession()
  }, [supabase.auth])

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setProfile(null)
          setCompany(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('id', userId)
        .single()

      if (error) throw error

      setProfile(data)
      setCompany(data.company)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
  }

  const signUp = async (data: SignUpData) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          company_name: data.companyName
        }
      }
    })
    
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!profile) return false
    
    const roleHierarchy = {
      'owner': 4,
      'admin': 3, 
      'supervisor': 2,
      'operador': 1
    }
    
    return roleHierarchy[profile.role] >= roleHierarchy[requiredRole]
  }

  const canAccess = (resource: string, action: string): boolean => {
    if (!profile) return false
    
    // Implement RBAC logic based on resource and action
    const permissions = {
      'owner': ['*'],
      'admin': ['users:*', 'chatbots:*', 'company:*'],
      'supervisor': ['chatbots:read', 'chatbots:update', 'conversations:*'],
      'operador': ['conversations:read', 'conversations:update']
    }
    
    const userPermissions = permissions[profile.role] || []
    return userPermissions.includes('*') || 
           userPermissions.includes(`${resource}:*`) ||
           userPermissions.includes(`${resource}:${action}`)
  }

  const value = {
    user,
    profile,
    company,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    canAccess
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

## Contexto de Sesión Post-Tarea
```markdown
# Actualizar current.md al completar:
- Auth Context: ✅ Global state management funcionando  
- Real-time: ✅ Session updates automáticos
- RBAC: ✅ Role checking y permissions
- Integration: ✅ Supabase auth helpers
- Siguiente tarea: TASK-P1E2-02F (RBAC Middleware)
```