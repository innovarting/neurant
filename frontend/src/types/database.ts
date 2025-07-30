/**
 * Supabase Database Types
 * 
 * Tipos TypeScript generados para la base de datos de NeurAnt.
 * Este archivo será actualizado cuando se generen los tipos desde Supabase.
 */

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          role: 'admin' | 'manager' | 'agent' | 'user'
          company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'agent' | 'user'
          company_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'manager' | 'agent' | 'user'
          company_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          domain: string | null
          logo_url: string | null
          settings: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          domain?: string | null
          logo_url?: string | null
          settings?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          domain?: string | null
          logo_url?: string | null
          settings?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      chatbots: {
        Row: {
          id: string
          name: string
          description: string | null
          system_prompt: string | null
          model: string
          temperature: number
          max_tokens: number
          company_id: string
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          system_prompt?: string | null
          model: string
          temperature?: number
          max_tokens?: number
          company_id: string
          is_active?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          system_prompt?: string | null
          model?: string
          temperature?: number
          max_tokens?: number
          company_id?: string
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'manager' | 'agent' | 'user'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos de conveniencia
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
export type Chatbot = Database['public']['Tables']['chatbots']['Row']
export type UserRole = Database['public']['Enums']['user_role']

// Tipos para inserts
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type CompanyInsert = Database['public']['Tables']['companies']['Insert']
export type ChatbotInsert = Database['public']['Tables']['chatbots']['Insert']

// Tipos para updates
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']
export type CompanyUpdate = Database['public']['Tables']['companies']['Update']
export type ChatbotUpdate = Database['public']['Tables']['chatbots']['Update']