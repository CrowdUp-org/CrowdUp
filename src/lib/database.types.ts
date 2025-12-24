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
          username: string
          display_name: string
          email: string
          password_hash: string
          avatar_url: string | null
          bio: string | null
          reputation_score: number
          reputation_level: string
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          display_name: string
          email: string
          password_hash: string
          avatar_url?: string | null
          bio?: string | null
          reputation_score?: number
          reputation_level?: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          email?: string
          password_hash?: string
          avatar_url?: string | null
          bio?: string | null
          reputation_score?: number
          reputation_level?: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          type: 'Bug Report' | 'Feature Request' | 'Complaint' | 'App Review Request'
          company: string
          company_color: string
          title: string
          description: string
          votes: number
          app_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'Bug Report' | 'Feature Request' | 'Complaint' | 'App Review Request'
          company: string
          company_color: string
          title: string
          description: string
          votes?: number
          app_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'Bug Report' | 'Feature Request' | 'Complaint' | 'App Review Request'
          company?: string
          company_color?: string
          title?: string
          description?: string
          votes?: number
          app_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          vote_type: 'up' | 'down'
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          vote_type: 'up' | 'down'
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          vote_type?: 'up' | 'down'
          created_at?: string
        }
      }
      connections: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      apps: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          app_url: string | null
          logo_url: string | null
          category: string
          average_rating: number
          total_reviews: number
          company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description: string
          app_url?: string | null
          logo_url?: string | null
          category: string
          average_rating?: number
          total_reviews?: number
          company_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          app_url?: string | null
          logo_url?: string | null
          category?: string
          average_rating?: number
          total_reviews?: number
          company_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      app_reviews: {
        Row: {
          id: string
          app_id: string
          user_id: string
          rating: number
          review_text: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          app_id: string
          user_id: string
          rating: number
          review_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          app_id?: string
          user_id?: string
          rating?: number
          review_text?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string | null
          logo_url: string | null
          website: string | null
          category: string | null
          owner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          category?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          category?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      company_members: {
        Row: {
          id: string
          company_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          verified: boolean
          verification_status: 'pending' | 'approved' | 'rejected' | null
          verification_date: string | null
          verification_documents: Json | null
          verification_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          verified?: boolean
          verification_status?: 'pending' | 'approved' | 'rejected' | null
          verification_date?: string | null
          verification_documents?: Json | null
          verification_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          verified?: boolean
          verification_status?: 'pending' | 'approved' | 'rejected' | null
          verification_date?: string | null
          verification_documents?: Json | null
          verification_notes?: string | null
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          participant1_id: string
          participant2_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant1_id: string
          participant2_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participant1_id?: string
          participant2_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          privacy_settings: Json
          notification_settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          privacy_settings?: Json
          notification_settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          privacy_settings?: Json
          notification_settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      reputation_history: {
        Row: {
          id: string
          user_id: string
          action_type: 'post_created' | 'post_upvoted' | 'post_downvoted' | 'post_acknowledged' | 'post_implemented' | 'comment_upvoted' | 'reported_content' | 'manual_adjustment'
          points_change: number
          related_post_id: string | null
          related_comment_id: string | null
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action_type: 'post_created' | 'post_upvoted' | 'post_downvoted' | 'post_acknowledged' | 'post_implemented' | 'comment_upvoted' | 'reported_content' | 'manual_adjustment'
          points_change: number
          related_post_id?: string | null
          related_comment_id?: string | null
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action_type?: 'post_created' | 'post_upvoted' | 'post_downvoted' | 'post_acknowledged' | 'post_implemented' | 'comment_upvoted' | 'reported_content' | 'manual_adjustment'
          points_change?: number
          related_post_id?: string | null
          related_comment_id?: string | null
          reason?: string | null
          created_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          requirement_type: 'posts_count' | 'upvotes_received' | 'reputation_score' | 'days_active' | 'implementations' | 'comments_count'
          requirement_value: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          requirement_type: 'posts_count' | 'upvotes_received' | 'reputation_score' | 'days_active' | 'implementations' | 'comments_count'
          requirement_value: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          requirement_type?: 'posts_count' | 'upvotes_received' | 'reputation_score' | 'days_active' | 'implementations' | 'comments_count'
          requirement_value?: number
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
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
