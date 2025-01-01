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
      access_profiles: {
        Row: {
          access_level: string | null
          admin_ids: string[] | null
          application_type: string | null
          assignment_type: string | null
          availability: string
          created_at: string | null
          created_by: string | null
          description: string | null
          entitlements: Json | null
          icon: string | null
          icon_url: string | null
          id: string
          members: Json | null
          metadata: Json | null
          name: string
          organization_id: string | null
          owner_id: string | null
          owner_ids: string[] | null
          permissions: Json | null
          role_type: string | null
          type: string
        }
        Insert: {
          access_level?: string | null
          admin_ids?: string[] | null
          application_type?: string | null
          assignment_type?: string | null
          availability?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entitlements?: Json | null
          icon?: string | null
          icon_url?: string | null
          id?: string
          members?: Json | null
          metadata?: Json | null
          name: string
          organization_id?: string | null
          owner_id?: string | null
          owner_ids?: string[] | null
          permissions?: Json | null
          role_type?: string | null
          type: string
        }
        Update: {
          access_level?: string | null
          admin_ids?: string[] | null
          application_type?: string | null
          assignment_type?: string | null
          availability?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entitlements?: Json | null
          icon?: string | null
          icon_url?: string | null
          id?: string
          members?: Json | null
          metadata?: Json | null
          name?: string
          organization_id?: string | null
          owner_id?: string | null
          owner_ids?: string[] | null
          permissions?: Json | null
          role_type?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_profiles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      access_requests: {
        Row: {
          comments: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          profile_id: string | null
          request_for_id: string | null
          requester_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          profile_id?: string | null
          request_for_id?: string | null
          requester_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          profile_id?: string | null
          request_for_id?: string | null
          requester_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "access_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_request_for_id_fkey"
            columns: ["request_for_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "knowledge_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          deleted: boolean | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          task_id: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          deleted?: boolean | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          task_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          deleted?: boolean | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          task_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_members: {
        Row: {
          blocked_at: string | null
          blocked_by: string | null
          channel_id: string
          created_at: string | null
          id: string
          is_blocked: boolean | null
          is_muted: boolean | null
          role: string
          subscription_status: string | null
          user_id: string
        }
        Insert: {
          blocked_at?: string | null
          blocked_by?: string | null
          channel_id: string
          created_at?: string | null
          id?: string
          is_blocked?: boolean | null
          is_muted?: boolean | null
          role: string
          subscription_status?: string | null
          user_id: string
        }
        Update: {
          blocked_at?: string | null
          blocked_by?: string | null
          channel_id?: string
          created_at?: string | null
          id?: string
          is_blocked?: boolean | null
          is_muted?: boolean | null
          role?: string
          subscription_status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_blocked_by_fkey"
            columns: ["blocked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          dialog_text: string | null
          has_file_vault: boolean | null
          id: string
          is_private: boolean | null
          name: string
          organization_id: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          dialog_text?: string | null
          has_file_vault?: boolean | null
          id?: string
          is_private?: boolean | null
          name: string
          organization_id?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          dialog_text?: string | null
          has_file_vault?: boolean | null
          id?: string
          is_private?: boolean | null
          name?: string
          organization_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channels_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          completed: boolean | null
          created_at: string | null
          created_by: string | null
          id: string
          mentions: string[] | null
          position: number | null
          task_id: string | null
          title: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          mentions?: string[] | null
          position?: number | null
          task_id?: string | null
          title: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          mentions?: string[] | null
          position?: number | null
          task_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      help_desk_tickets: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          last_status_change: string | null
          metadata: Json | null
          organization_id: string | null
          priority: string
          status: string
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          last_status_change?: string | null
          metadata?: Json | null
          organization_id?: string | null
          priority?: string
          status?: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          last_status_change?: string | null
          metadata?: Json | null
          organization_id?: string | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_desk_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_desk_tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_desk_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_desk_tickets_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_articles: {
        Row: {
          author_name: string | null
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          organization_id: string | null
          slug: string
          status: Database["public"]["Enums"]["article_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_name?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          organization_id?: string | null
          slug: string
          status?: Database["public"]["Enums"]["article_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_name?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          organization_id?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["article_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_articles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_articles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string
          chat_type: string
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          sender_id: string
        }
        Insert: {
          chat_id: string
          chat_type: string
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          sender_id: string
        }
        Update: {
          chat_id?: string
          chat_type?: string
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          reference_id: string | null
          reference_name: string | null
          reference_type: string | null
          sender_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          reference_id?: string | null
          reference_name?: string | null
          reference_type?: string | null
          sender_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          reference_id?: string | null
          reference_name?: string | null
          reference_type?: string | null
          sender_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          invitation_status: string | null
          invitation_token: string | null
          is_enabled: boolean | null
          joined_at: string | null
          last_disabled_at: string | null
          last_enabled_at: string | null
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          invitation_status?: string | null
          invitation_token?: string | null
          is_enabled?: boolean | null
          joined_at?: string | null
          last_disabled_at?: string | null
          last_enabled_at?: string | null
          organization_id: string
          role: string
          user_id: string
        }
        Update: {
          invitation_status?: string | null
          invitation_token?: string | null
          is_enabled?: boolean | null
          joined_at?: string | null
          last_disabled_at?: string | null
          last_enabled_at?: string | null
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string | null
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id?: string | null
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_online: boolean | null
          organization_id: string | null
          organization_name: string | null
          organization_role: string | null
          status: Database["public"]["Enums"]["user_status"] | null
          title: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_online?: boolean | null
          organization_id?: string | null
          organization_name?: string | null
          organization_role?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          title?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_online?: boolean | null
          organization_id?: string | null
          organization_name?: string | null
          organization_role?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          title?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      project_metrics: {
        Row: {
          created_at: string | null
          id: string
          metric_name: string
          metric_type: string
          metric_value: number
          organization_id: string | null
          run_id: string | null
          scope_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_name: string
          metric_type: string
          metric_value: number
          organization_id?: string | null
          run_id?: string | null
          scope_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_name?: string
          metric_type?: string
          metric_value?: number
          organization_id?: string | null
          run_id?: string | null
          scope_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_metrics_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_metrics_scope_id_fkey"
            columns: ["scope_id"]
            isOneToOne: false
            referencedRelation: "scopes"
            referencedColumns: ["id"]
          },
        ]
      }
      runs: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          goals: string[] | null
          id: string
          metrics: Json | null
          name: string
          organization_id: string | null
          scope_id: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          goals?: string[] | null
          id?: string
          metrics?: Json | null
          name: string
          organization_id?: string | null
          scope_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          goals?: string[] | null
          id?: string
          metrics?: Json | null
          name?: string
          organization_id?: string | null
          scope_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "runs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "runs_scope_id_fkey"
            columns: ["scope_id"]
            isOneToOne: false
            referencedRelation: "scopes"
            referencedColumns: ["id"]
          },
        ]
      }
      scopes: {
        Row: {
          acceptance_criteria: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          features: string[] | null
          id: string
          name: string
          organization_id: string | null
          updated_at: string | null
          vision: string | null
        }
        Insert: {
          acceptance_criteria?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          name: string
          organization_id?: string | null
          updated_at?: string | null
          vision?: string | null
        }
        Update: {
          acceptance_criteria?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          features?: string[] | null
          id?: string
          name?: string
          organization_id?: string | null
          updated_at?: string | null
          vision?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scopes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scopes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      secrets: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      sprints: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          name: string
          organization_id: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          name: string
          organization_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sprints_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprints_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          organization_id: string | null
        }
        Insert: {
          color: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          organization_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tags_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignees: {
        Row: {
          assigned_at: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignees_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          organization_id: string
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          created_at: string | null
          created_by: string | null
          dependency_task_id: string
          dependency_type: string
          dependent_task_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          dependency_task_id: string
          dependency_type: string
          dependent_task_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          dependency_task_id?: string
          dependency_type?: string
          dependent_task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_dependency_task_id_fkey"
            columns: ["dependency_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_dependent_task_id_fkey"
            columns: ["dependent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_tags: {
        Row: {
          tag_id: string
          task_id: string
        }
        Insert: {
          tag_id: string
          task_id: string
        }
        Update: {
          tag_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_tags_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted: boolean | null
          description: string | null
          end_date: string | null
          id: string
          organization_id: string | null
          scope_id: string | null
          sprint_id: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted?: boolean | null
          description?: string | null
          end_date?: string | null
          id?: string
          organization_id?: string | null
          scope_id?: string | null
          sprint_id?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted?: boolean | null
          description?: string | null
          end_date?: string | null
          id?: string
          organization_id?: string | null
          scope_id?: string | null
          sprint_id?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_scope_id_fkey"
            columns: ["scope_id"]
            isOneToOne: false
            referencedRelation: "scopes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          ticket_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          ticket_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          ticket_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "help_desk_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheet_entries: {
        Row: {
          created_at: string | null
          daily_notes: Json | null
          hours: Json
          id: string
          organization_id: string
          project: string
          reviewed_at: string | null
          reviewer_id: string | null
          status: Database["public"]["Enums"]["timesheet_status"] | null
          total: number
          type: string
          updated_at: string | null
          user_id: string
          week_ending: string
          week_number: number
        }
        Insert: {
          created_at?: string | null
          daily_notes?: Json | null
          hours?: Json
          id?: string
          organization_id: string
          project: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["timesheet_status"] | null
          total?: number
          type: string
          updated_at?: string | null
          user_id: string
          week_ending: string
          week_number: number
        }
        Update: {
          created_at?: string | null
          daily_notes?: Json | null
          hours?: Json
          id?: string
          organization_id?: string
          project?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["timesheet_status"] | null
          total?: number
          type?: string
          updated_at?: string | null
          user_id?: string
          week_ending?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "timesheet_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_entries_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheet_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          last_organization_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_organization_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_organization_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_last_organization_id_fkey"
            columns: ["last_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_presence: {
        Row: {
          id: string
          last_seen: string | null
          metadata: Json | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          last_seen?: string | null
          metadata?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          last_seen?: string | null
          metadata?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      change_channel_member_role: {
        Args: {
          p_channel_id: string
          p_user_id: string
          p_new_role: string
          p_actor_id: string
        }
        Returns: boolean
      }
      check_channel_permission: {
        Args: {
          channel_id: string
          required_roles: string[]
        }
        Returns: boolean
      }
      create_organization: {
        Args: {
          org_name: string
          user_id: string
        }
        Returns: Json
      }
      generate_slug: {
        Args: {
          title: string
        }
        Returns: string
      }
      get_user_role: {
        Args: {
          org_id: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          org_id: string
          required_roles: string[]
        }
        Returns: boolean
      }
      toggle_member_status: {
        Args: {
          p_organization_id: string
          p_user_id: string
          p_is_enabled: boolean
        }
        Returns: undefined
      }
      update_user_presence: {
        Args: {
          p_user_id: string
          p_status: string
          p_metadata?: Json
        }
        Returns: undefined
      }
      update_user_status: {
        Args: {
          p_user_id: string
          p_status: string
        }
        Returns: undefined
      }
    }
    Enums: {
      article_status: "draft" | "published" | "archived"
      organization_role: "owner" | "admin" | "member" | "guest"
      timesheet_status:
        | "draft"
        | "submitted"
        | "approved"
        | "rejected"
        | "pending_revert"
      user_status: "offline" | "online" | "busy"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
