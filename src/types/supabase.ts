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
      projects: {
        Row: {
          id: number
          session_id: string
          name: string
          content: string
          language: string
          created_at: string
        }
        Insert: {
          id?: number
          session_id: string
          name: string
          content: string
          language: string
          created_at?: string
        }
        Update: {
          id?: number
          session_id?: string
          name?: string
          content?: string
          language?: string
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          title: string
          messages: Json
          updated_at: number
          created_at: string
        }
        Insert: {
          id: string
          title: string
          messages: Json
          updated_at?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          messages?: Json
          updated_at?: number
          created_at?: string
        }
      }
      custom_models: {
        Row: {
          id: number
          name: string
          personality: string
          base_model: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          personality: string
          base_model: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          personality?: string
          base_model?: string
          created_at?: string
        }
      }
    }
  }
}
