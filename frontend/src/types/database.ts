/**
 * Supabase Database Types - NeurAnt
 * 
 * Tipos TypeScript generados desde la base de datos de Supabase Cloud.
 * Actualizado: 2025-01-30 - Incluye roles RBAC y extensiones pgvector.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chatbots: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_tokens: number | null
          model: string | null
          name: string
          system_prompt: string | null
          temperature: number | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model?: string | null
          name: string
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model?: string | null
          name?: string
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbots_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      companies: {
        Row: {
          created_at: string
          domain: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          company_id: string
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          last_name: string | null
          role: 'owner' | 'admin' | 'supervisor' | 'operador' | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id: string
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          role?: 'owner' | 'admin' | 'supervisor' | 'operador' | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          role?: 'owner' | 'admin' | 'supervisor' | 'operador' | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          company_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          role: 'owner' | 'admin' | 'supervisor' | 'operador'
        }
        Insert: {
          accepted_at?: string | null
          company_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by: string
          role?: 'owner' | 'admin' | 'supervisor' | 'operador'
        }
        Update: {
          accepted_at?: string | null
          company_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          role?: 'owner' | 'admin' | 'supervisor' | 'operador'
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      // pgvector functions included
      vector_dims: {
        Args: { "": string }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string }
        Returns: unknown
      }
    }
    Enums: {
      user_role: 'owner' | 'admin' | 'supervisor' | 'operador'
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
export type UserInvitation = Database['public']['Tables']['user_invitations']['Row']
export type UserRole = Database['public']['Enums']['user_role']

// Tipos para inserts
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type CompanyInsert = Database['public']['Tables']['companies']['Insert']
export type ChatbotInsert = Database['public']['Tables']['chatbots']['Insert']
export type UserInvitationInsert = Database['public']['Tables']['user_invitations']['Insert']

// Tipos para updates
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']
export type CompanyUpdate = Database['public']['Tables']['companies']['Update']
export type ChatbotUpdate = Database['public']['Tables']['chatbots']['Update']
export type UserInvitationUpdate = Database['public']['Tables']['user_invitations']['Update']