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
      activities: {
        Row: {
          audio_url: string | null
          created_at: string
          description: string | null
          id: string
          points: number
          station_id: string
          title: string
          type: Database["public"]["Enums"]["activity_type"]
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          station_id: string
          title: string
          type?: Database["public"]["Enums"]["activity_type"]
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          station_id?: string
          title?: string
          type?: Database["public"]["Enums"]["activity_type"]
        }
        Relationships: [
          {
            foreignKeyName: "activities_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_submissions: {
        Row: {
          activity_id: string
          answers: number[] | null
          content: string | null
          evaluated_at: string | null
          evaluated_by: string | null
          feedback: string | null
          id: string
          score: number | null
          submitted_at: string
          user_id: string
        }
        Insert: {
          activity_id: string
          answers?: number[] | null
          content?: string | null
          evaluated_at?: string | null
          evaluated_by?: string | null
          feedback?: string | null
          id?: string
          score?: number | null
          submitted_at?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          answers?: number[] | null
          content?: string | null
          evaluated_at?: string | null
          evaluated_by?: string | null
          feedback?: string | null
          id?: string
          score?: number | null
          submitted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_submissions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          criteria: string | null
          description: string | null
          icon: string
          id: string
          name: string
        }
        Insert: {
          criteria?: string | null
          description?: string | null
          icon: string
          id?: string
          name: string
        }
        Update: {
          criteria?: string | null
          description?: string | null
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          activity_id: string
          audio_url: string | null
          color: string | null
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_id: string
          audio_url?: string | null
          color?: string | null
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          audio_url?: string | null
          color?: string | null
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      journeys: {
        Row: {
          cover_image: string | null
          created_at: string
          description: string | null
          id: string
          intro_video_url: string | null
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          intro_video_url?: string | null
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          intro_video_url?: string | null
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      landing_sections: {
        Row: {
          content: string | null
          created_at: string
          cta_link: string | null
          cta_text: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_cta: boolean
          order_index: number
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_cta?: boolean
          order_index?: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_cta?: boolean
          order_index?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          activity_id: string
          correct_answer: number
          id: string
          options: string[]
          order_index: number
          question: string
        }
        Insert: {
          activity_id: string
          correct_answer: number
          id?: string
          options: string[]
          order_index?: number
          question: string
        }
        Update: {
          activity_id?: string
          correct_answer?: number
          id?: string
          options?: string[]
          order_index?: number
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number
          event_date: string
          id: string
          journey_id: string | null
          meeting_link: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          event_date: string
          id?: string
          journey_id?: string | null
          meeting_link?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          event_date?: string
          id?: string
          journey_id?: string | null
          meeting_link?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_events_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      stations: {
        Row: {
          audio_url: string | null
          card_image_url: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          journey_id: string
          order_index: number
          supplementary_url: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          audio_url?: string | null
          card_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          journey_id: string
          order_index?: number
          supplementary_url?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          audio_url?: string | null
          card_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          journey_id?: string
          order_index?: number
          supplementary_url?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stations_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          attachment_url: string | null
          created_at: string
          description: string
          id: string
          journey_id: string | null
          responded_at: string | null
          responded_by: string | null
          response: string | null
          station_id: string | null
          status: Database["public"]["Enums"]["support_ticket_status"]
          title: string
          type: Database["public"]["Enums"]["support_ticket_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          description: string
          id?: string
          journey_id?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          station_id?: string | null
          status?: Database["public"]["Enums"]["support_ticket_status"]
          title: string
          type?: Database["public"]["Enums"]["support_ticket_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          description?: string
          id?: string
          journey_id?: string | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          station_id?: string | null
          status?: Database["public"]["Enums"]["support_ticket_status"]
          title?: string
          type?: Database["public"]["Enums"]["support_ticket_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          action: string
          activity_id: string | null
          created_at: string
          id: string
          journey_id: string | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          station_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          activity_id?: string | null
          created_at?: string
          id?: string
          journey_id?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          station_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          activity_id?: string | null
          created_at?: string
          id?: string
          journey_id?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          station_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          activity_id: string | null
          completed: boolean
          completed_at: string | null
          id: string
          journey_id: string
          station_id: string | null
          step_type: string | null
          time_spent: number
          user_id: string
        }
        Insert: {
          activity_id?: string | null
          completed?: boolean
          completed_at?: string | null
          id?: string
          journey_id: string
          station_id?: string | null
          step_type?: string | null
          time_spent?: number
          user_id: string
        }
        Update: {
          activity_id?: string | null
          completed?: boolean
          completed_at?: string | null
          id?: string
          journey_id?: string
          station_id?: string | null
          step_type?: string | null
          time_spent?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      activity_type: "quiz" | "upload" | "essay" | "gamified" | "forum"
      app_role: "admin" | "professor" | "aluno"
      support_ticket_status: "open" | "in_progress" | "resolved" | "closed"
      support_ticket_type: "bug" | "improvement"
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
      activity_type: ["quiz", "upload", "essay", "gamified", "forum"],
      app_role: ["admin", "professor", "aluno"],
      support_ticket_status: ["open", "in_progress", "resolved", "closed"],
      support_ticket_type: ["bug", "improvement"],
    },
  },
} as const
