export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_providers: {
        Row: {
          api_key: string
          created_at: string
          endpoint_url: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          model_id: string
          name: string
          provider_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          api_key: string
          created_at?: string
          endpoint_url?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          model_id: string
          name: string
          provider_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string
          endpoint_url?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          model_id?: string
          name?: string
          provider_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bot_tokens: {
        Row: {
          bot_name: string | null
          bot_username: string | null
          created_at: string | null
          encrypted_token: string
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bot_name?: string | null
          bot_username?: string | null
          created_at?: string | null
          encrypted_token: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bot_name?: string | null
          bot_username?: string | null
          created_at?: string | null
          encrypted_token?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      channels: {
        Row: {
          bot_token_id: string | null
          channel_id: string
          channel_title: string | null
          channel_username: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bot_token_id?: string | null
          channel_id: string
          channel_title?: string | null
          channel_username?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bot_token_id?: string | null
          channel_id?: string
          channel_title?: string | null
          channel_username?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channels_bot_token_id_fkey"
            columns: ["bot_token_id"]
            isOneToOne: false
            referencedRelation: "bot_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      post_versions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          text_html: string | null
          text_markdown: string | null
          version_number: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          text_html?: string | null
          text_markdown?: string | null
          version_number: number
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          text_html?: string | null
          text_markdown?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_versions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          bot_token_id: string | null
          buttons: Json | null
          channel_id: string | null
          chosen_variant_id: string | null
          created_at: string | null
          edited_text_html: string | null
          edited_text_markdown: string | null
          error_message: string | null
          goal: string | null
          id: string
          idea_text: string
          length: Database["public"]["Enums"]["length_option"] | null
          logs: Json | null
          media: Json | null
          schedule_datetime: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["post_status"] | null
          system_prompt_id: string | null
          target_audience: string | null
          telegram_message_id: number | null
          timezone: string | null
          tone: Database["public"]["Enums"]["tone_option"] | null
          updated_at: string | null
          user_id: string
          variants: Json | null
        }
        Insert: {
          bot_token_id?: string | null
          buttons?: Json | null
          channel_id?: string | null
          chosen_variant_id?: string | null
          created_at?: string | null
          edited_text_html?: string | null
          edited_text_markdown?: string | null
          error_message?: string | null
          goal?: string | null
          id?: string
          idea_text: string
          length?: Database["public"]["Enums"]["length_option"] | null
          logs?: Json | null
          media?: Json | null
          schedule_datetime?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["post_status"] | null
          system_prompt_id?: string | null
          target_audience?: string | null
          telegram_message_id?: number | null
          timezone?: string | null
          tone?: Database["public"]["Enums"]["tone_option"] | null
          updated_at?: string | null
          user_id: string
          variants?: Json | null
        }
        Update: {
          bot_token_id?: string | null
          buttons?: Json | null
          channel_id?: string | null
          chosen_variant_id?: string | null
          created_at?: string | null
          edited_text_html?: string | null
          edited_text_markdown?: string | null
          error_message?: string | null
          goal?: string | null
          id?: string
          idea_text?: string
          length?: Database["public"]["Enums"]["length_option"] | null
          logs?: Json | null
          media?: Json | null
          schedule_datetime?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["post_status"] | null
          system_prompt_id?: string | null
          target_audience?: string | null
          telegram_message_id?: number | null
          timezone?: string | null
          tone?: Database["public"]["Enums"]["tone_option"] | null
          updated_at?: string | null
          user_id?: string
          variants?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_bot_token_id_fkey"
            columns: ["bot_token_id"]
            isOneToOne: false
            referencedRelation: "bot_tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_system_prompt_id_fkey"
            columns: ["system_prompt_id"]
            isOneToOne: false
            referencedRelation: "system_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      system_prompts: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          is_public: boolean | null
          name: string
          prompt_text: string
          updated_at: string | null
          user_id: string
          variables_template: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          name: string
          prompt_text: string
          updated_at?: string | null
          user_id: string
          variables_template?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          name?: string
          prompt_text?: string
          updated_at?: string | null
          user_id?: string
          variables_template?: Json | null
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
      button_type: "url" | "callback"
      length_option: "short" | "medium" | "long"
      media_type: "photo" | "video" | "gif" | "document"
      post_status:
        | "draft"
        | "scheduled"
        | "sending"
        | "sent"
        | "failed"
        | "cancelled"
      tone_option: "drive" | "info" | "promo" | "friendly" | "formal"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      button_type: ["url", "callback"],
      length_option: ["short", "medium", "long"],
      media_type: ["photo", "video", "gif", "document"],
      post_status: [
        "draft",
        "scheduled",
        "sending",
        "sent",
        "failed",
        "cancelled",
      ],
      tone_option: ["drive", "info", "promo", "friendly", "formal"],
    },
  },
} as const
