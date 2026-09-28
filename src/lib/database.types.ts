export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      favorites: {
        Row: {
          id: number
          created_at: string
          pokemon_id: number
          pokemon_name: string
          user_id: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          pokemon_id: number
          pokemon_name: string
          user_id?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          pokemon_id?: number
          pokemon_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
