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
      users: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          subscription_tier: string | null
          primary_niche: string | null
          sub_niche: string | null
          connected_accounts: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: string | null
          primary_niche?: string | null
          sub_niche?: string | null
          connected_accounts?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: string | null
          primary_niche?: string | null
          sub_niche?: string | null
          connected_accounts?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      scheduled_posts: {
        Row: {
          id: string
          user_id: string
          platform: string
          scheduled_time: string
          caption: string
          media_url: string | null
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          scheduled_time: string
          caption: string
          media_url?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          scheduled_time?: string
          caption?: string
          media_url?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
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
      [_ in never]: never
    }
  }
}
