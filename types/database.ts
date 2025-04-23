export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          updated_at: string | null
          notification_preferences: Json | null
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          updated_at?: string | null
          notification_preferences?: Json | null
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          updated_at?: string | null
          notification_preferences?: Json | null
        }
      }
      forums: {
        Row: {
          id: string
          title: string
          description: string
          tags: Json | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          tags?: Json | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          tags?: Json | null
          user_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          forum_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          forum_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          forum_id?: string
          user_id?: string
          created_at?: string
        }
      }
      forum_likes: {
        Row: {
          id: string
          forum_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          forum_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          forum_id?: string
          user_id?: string
          created_at?: string
        }
      }
      comment_likes: {
        Row: {
          id: string
          comment_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          comment_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          comment_id?: string
          user_id?: string
          created_at?: string
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

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Forum = Database["public"]["Tables"]["forums"]["Row"]
export type Comment = Database["public"]["Tables"]["comments"]["Row"]
export type ForumLike = Database["public"]["Tables"]["forum_likes"]["Row"]
export type CommentLike = Database["public"]["Tables"]["comment_likes"]["Row"]

export type NotificationPreferences = {
  email_notifications: boolean
}

export type ForumWithAuthor = Forum & {
  author: Profile
  _count?: {
    comments: number
    likes: number
  }
}

export type CommentWithAuthor = Comment & {
  author: Profile
  _count?: {
    likes: number
  }
}
