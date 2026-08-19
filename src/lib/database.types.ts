// TypeScript types for Supabase database
// Auto-generated types will go here
// For now, we'll use a simplified version

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
      workspaces: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          points: number
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          points?: number
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          points?: number
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          avatar_color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          avatar_color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          avatar_color?: string
          created_at?: string
          updated_at?: string
        }
      }
      epics: {
        Row: {
          id: string
          workspace_id: string
          title: string
          description: string
          status: string
          priority: string
          color: string
          labels: string[]
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          title: string
          description?: string
          status?: string
          priority?: string
          color?: string
          labels?: string[]
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          title?: string
          description?: string
          status?: string
          priority?: string
          color?: string
          labels?: string[]
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      stories: {
        Row: {
          id: string
          workspace_id: string
          epic_id: string
          title: string
          description: string
          status: string
          priority: string
          labels: string[]
          story_points: number | null
          assignee_id: string | null
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          epic_id: string
          title: string
          description?: string
          status?: string
          priority?: string
          labels?: string[]
          story_points?: number | null
          assignee_id?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          epic_id?: string
          title?: string
          description?: string
          status?: string
          priority?: string
          labels?: string[]
          story_points?: number | null
          assignee_id?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          workspace_id: string
          story_id: string
          title: string
          description: string
          status: string
          priority: string
          labels: string[]
          story_points: number | null
          assignee_id: string | null
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          story_id: string
          title: string
          description?: string
          status?: string
          priority?: string
          labels?: string[]
          story_points?: number | null
          assignee_id?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          story_id?: string
          title?: string
          description?: string
          status?: string
          priority?: string
          labels?: string[]
          story_points?: number | null
          assignee_id?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          workspace_id: string
          author_id: string
          story_id: string | null
          task_id: string | null
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          author_id: string
          story_id?: string | null
          task_id?: string | null
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          author_id?: string
          story_id?: string | null
          task_id?: string | null
          content?: string
          created_at?: string
        }
      }
      vouchers: {
        Row: {
          id: string
          workspace_id: string
          member_id: string
          type: 'coffee' | 'cappuccino'
          redeemed_at: string
          expires_at: string
          is_used: boolean
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          member_id: string
          type: 'coffee' | 'cappuccino'
          redeemed_at?: string
          expires_at: string
          is_used?: boolean
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          member_id?: string
          type?: 'coffee' | 'cappuccino'
          redeemed_at?: string
          expires_at?: string
          is_used?: boolean
          used_at?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          workspace_id: string
          recipient_id: string
          actor_id: string | null
          type: string
          message: string
          item_type: string | null
          item_id: string | null
          old_status: string | null
          new_status: string | null
          dismissed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          recipient_id: string
          actor_id?: string | null
          type: string
          message: string
          item_type?: string | null
          item_id?: string | null
          old_status?: string | null
          new_status?: string | null
          dismissed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          recipient_id?: string
          actor_id?: string | null
          type?: string
          message?: string
          item_type?: string | null
          item_id?: string | null
          old_status?: string | null
          new_status?: string | null
          dismissed?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_workspace_member: {
        Args: { workspace_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
