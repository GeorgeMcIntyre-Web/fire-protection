import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig, isDemoMode as checkDemoMode } from './env'

// Get validated Supabase configuration
const config = getSupabaseConfig()

// Create Supabase client with validated config
export const supabase = createClient(config.url, config.anonKey)

// Export demo mode flag for components to use
export const DEMO_MODE = checkDemoMode()

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'manager' | 'technician'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'manager' | 'technician'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'manager' | 'technician'
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          client_id: string | null
          created_by: string
          created_at: string
          updated_at: string
          due_date: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          client_id?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          due_date?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          client_id?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
          due_date?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string | null
          status: 'pending' | 'in_progress' | 'completed'
          priority: 'low' | 'medium' | 'high'
          assigned_to: string | null
          created_by: string
          created_at: string
          updated_at: string
          due_date: string | null
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          priority?: 'low' | 'medium' | 'high'
          assigned_to?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          due_date?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          priority?: 'low' | 'medium' | 'high'
          assigned_to?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
          due_date?: string | null
        }
      }
      time_logs: {
        Row: {
          id: string
          task_id: string | null
          project_id: string | null
          user_id: string
          start_time: string
          end_time: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id?: string | null
          project_id?: string | null
          user_id: string
          start_time: string
          end_time?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string | null
          project_id?: string | null
          user_id?: string
          start_time?: string
          end_time?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      work_documentation: {
        Row: {
          id: string
          task_id: string | null
          project_id: string | null
          user_id: string
          photo_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id?: string | null
          project_id?: string | null
          user_id: string
          photo_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string | null
          project_id?: string | null
          user_id?: string
          photo_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          contact_person: string | null
          email: string | null
          phone: string | null
          address: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
