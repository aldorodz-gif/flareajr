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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action_type: string
          company_name: string | null
          contact_name: string | null
          id: string
          logged_at: string
          notes: string | null
          prospect_id: string | null
          task_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          company_name?: string | null
          contact_name?: string | null
          id?: string
          logged_at?: string
          notes?: string | null
          prospect_id?: string | null
          task_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          company_name?: string | null
          contact_name?: string | null
          id?: string
          logged_at?: string
          notes?: string | null
          prospect_id?: string | null
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_log: {
        Row: {
          alert_key: string
          body: string | null
          id: string
          recipient: string | null
          sent_at: string
          subject: string | null
        }
        Insert: {
          alert_key: string
          body?: string | null
          id?: string
          recipient?: string | null
          sent_at?: string
          subject?: string | null
        }
        Update: {
          alert_key?: string
          body?: string | null
          id?: string
          recipient?: string | null
          sent_at?: string
          subject?: string | null
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          calls: number
          created_at: string
          error_code: string | null
          function_name: string | null
          id: string
          service: string
          success: boolean
        }
        Insert: {
          calls?: number
          created_at?: string
          error_code?: string | null
          function_name?: string | null
          id?: string
          service: string
          success: boolean
        }
        Update: {
          calls?: number
          created_at?: string
          error_code?: string | null
          function_name?: string | null
          id?: string
          service?: string
          success?: boolean
        }
        Relationships: []
      }
      bdr_mindsets: {
        Row: {
          bdr_id: string | null
          content: string
          created_at: string
          id: string
          label: string
          scope: string
          updated_at: string
        }
        Insert: {
          bdr_id?: string | null
          content: string
          created_at?: string
          id?: string
          label: string
          scope?: string
          updated_at?: string
        }
        Update: {
          bdr_id?: string | null
          content?: string
          created_at?: string
          id?: string
          label?: string
          scope?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bdr_mindsets_bdr_id_fkey"
            columns: ["bdr_id"]
            isOneToOne: false
            referencedRelation: "bdr_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bdr_profiles: {
        Row: {
          created_at: string
          excluded_markets: string[]
          id: string
          inventory_locations: Json
          markets: string[]
          name: string
          region: string | null
          target_verticals: string[]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          excluded_markets?: string[]
          id?: string
          inventory_locations?: Json
          markets?: string[]
          name: string
          region?: string | null
          target_verticals?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          excluded_markets?: string[]
          id?: string
          inventory_locations?: Json
          markets?: string[]
          name?: string
          region?: string | null
          target_verticals?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bdr_snapshots: {
        Row: {
          bdr_id: string
          created_at: string
          data: Json
          id: string
          refreshed_at: string
          refreshed_by: string | null
          source_filename: string | null
        }
        Insert: {
          bdr_id: string
          created_at?: string
          data: Json
          id?: string
          refreshed_at?: string
          refreshed_by?: string | null
          source_filename?: string | null
        }
        Update: {
          bdr_id?: string
          created_at?: string
          data?: Json
          id?: string
          refreshed_at?: string
          refreshed_by?: string | null
          source_filename?: string | null
        }
        Relationships: []
      }
      lead_feedback: {
        Row: {
          bdr_id: string
          company_name: string
          created_at: string
          id: string
          opportunity_id: string | null
          rating: string
          reason: string | null
        }
        Insert: {
          bdr_id: string
          company_name: string
          created_at?: string
          id?: string
          opportunity_id?: string | null
          rating: string
          reason?: string | null
        }
        Update: {
          bdr_id?: string
          company_name?: string
          created_at?: string
          id?: string
          opportunity_id?: string | null
          rating?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_feedback_bdr_id_fkey"
            columns: ["bdr_id"]
            isOneToOne: false
            referencedRelation: "bdr_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_feedback_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          active_intent: boolean
          assigned_bdr: string | null
          company: string
          confidence_label: string | null
          confidence_score: number
          contacts: Json
          created_at: string
          date_found: string
          description: string | null
          discovery_score: number
          distance_to_inventory: number | null
          estimated_stay: string | null
          housing_fit_score: number
          id: string
          key_talking_points: string[] | null
          last_verified: string
          market: string | null
          near_core_inventory: boolean | null
          nearest_inventory: string | null
          notes: string | null
          pitch_angle: string | null
          priority: string | null
          project: string | null
          review_status: string | null
          saved_by_bdr: string | null
          signal_type: string | null
          source_type: string | null
          source_url: string | null
          status: string
          suggested_contacts: string[] | null
          updated_at: string
          verified: boolean
          vertical: string | null
          why_it_matters: string | null
        }
        Insert: {
          active_intent?: boolean
          assigned_bdr?: string | null
          company: string
          confidence_label?: string | null
          confidence_score?: number
          contacts?: Json
          created_at?: string
          date_found?: string
          description?: string | null
          discovery_score?: number
          distance_to_inventory?: number | null
          estimated_stay?: string | null
          housing_fit_score?: number
          id?: string
          key_talking_points?: string[] | null
          last_verified?: string
          market?: string | null
          near_core_inventory?: boolean | null
          nearest_inventory?: string | null
          notes?: string | null
          pitch_angle?: string | null
          priority?: string | null
          project?: string | null
          review_status?: string | null
          saved_by_bdr?: string | null
          signal_type?: string | null
          source_type?: string | null
          source_url?: string | null
          status?: string
          suggested_contacts?: string[] | null
          updated_at?: string
          verified?: boolean
          vertical?: string | null
          why_it_matters?: string | null
        }
        Update: {
          active_intent?: boolean
          assigned_bdr?: string | null
          company?: string
          confidence_label?: string | null
          confidence_score?: number
          contacts?: Json
          created_at?: string
          date_found?: string
          description?: string | null
          discovery_score?: number
          distance_to_inventory?: number | null
          estimated_stay?: string | null
          housing_fit_score?: number
          id?: string
          key_talking_points?: string[] | null
          last_verified?: string
          market?: string | null
          near_core_inventory?: boolean | null
          nearest_inventory?: string | null
          notes?: string | null
          pitch_angle?: string | null
          priority?: string | null
          project?: string | null
          review_status?: string | null
          saved_by_bdr?: string | null
          signal_type?: string | null
          source_type?: string | null
          source_url?: string | null
          status?: string
          suggested_contacts?: string[] | null
          updated_at?: string
          verified?: boolean
          vertical?: string | null
          why_it_matters?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_assigned_bdr_fkey"
            columns: ["assigned_bdr"]
            isOneToOne: false
            referencedRelation: "bdr_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_saved_by_bdr_fkey"
            columns: ["saved_by_bdr"]
            isOneToOne: false
            referencedRelation: "bdr_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_items: {
        Row: {
          archived_at: string | null
          company_name: string
          connection_type: string | null
          contact_name: string | null
          contact_title: string | null
          created_at: string
          followup_count: number
          id: string
          last_followup_at: string | null
          meeting_booked_at: string | null
          meeting_type: string | null
          notes: string | null
          prospect_id: string | null
          stage: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          company_name: string
          connection_type?: string | null
          contact_name?: string | null
          contact_title?: string | null
          created_at?: string
          followup_count?: number
          id?: string
          last_followup_at?: string | null
          meeting_booked_at?: string | null
          meeting_type?: string | null
          notes?: string | null
          prospect_id?: string | null
          stage?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          company_name?: string
          connection_type?: string | null
          contact_name?: string | null
          contact_title?: string | null
          created_at?: string
          followup_count?: number
          id?: string
          last_followup_at?: string | null
          meeting_booked_at?: string | null
          meeting_type?: string | null
          notes?: string | null
          prospect_id?: string | null
          stage?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_items_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospects: {
        Row: {
          city: string | null
          company_name: string
          contact_name: string | null
          contact_title: string | null
          created_at: string
          generated_date: string | null
          id: string
          industry: string | null
          recommended_titles: string[] | null
          score: number | null
          signal_detail: string | null
          signal_type: string | null
          status: string | null
          use_case: string | null
          user_id: string
        }
        Insert: {
          city?: string | null
          company_name: string
          contact_name?: string | null
          contact_title?: string | null
          created_at?: string
          generated_date?: string | null
          id?: string
          industry?: string | null
          recommended_titles?: string[] | null
          score?: number | null
          signal_detail?: string | null
          signal_type?: string | null
          status?: string | null
          use_case?: string | null
          user_id: string
        }
        Update: {
          city?: string | null
          company_name?: string
          contact_name?: string | null
          contact_title?: string | null
          created_at?: string
          generated_date?: string | null
          id?: string
          industry?: string | null
          recommended_titles?: string[] | null
          score?: number | null
          signal_detail?: string | null
          signal_type?: string | null
          status?: string | null
          use_case?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scan_runs: {
        Row: {
          bdrs_scanned: number
          details: Json | null
          errors: number
          id: string
          leads_inserted: number
          ran_at: string
        }
        Insert: {
          bdrs_scanned?: number
          details?: Json | null
          errors?: number
          id?: string
          leads_inserted?: number
          ran_at?: string
        }
        Update: {
          bdrs_scanned?: number
          details?: Json | null
          errors?: number
          id?: string
          leads_inserted?: number
          ran_at?: string
        }
        Relationships: []
      }
      signal_sources: {
        Row: {
          active: boolean
          category: string
          created_at: string
          domain: string
          id: string
          label: string
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          domain: string
          id?: string
          label: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          domain?: string
          id?: string
          label?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      tasks: {
        Row: {
          company_name: string
          completed_at: string | null
          contact_name: string | null
          contact_title: string | null
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          prospect_id: string | null
          reason: string | null
          signal: string | null
          status: string
          task_type: string
          user_id: string
        }
        Insert: {
          company_name: string
          completed_at?: string | null
          contact_name?: string | null
          contact_title?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          prospect_id?: string | null
          reason?: string | null
          signal?: string | null
          status?: string
          task_type?: string
          user_id: string
        }
        Update: {
          company_name?: string
          completed_at?: string | null
          contact_name?: string | null
          contact_title?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          prospect_id?: string | null
          reason?: string | null
          signal?: string | null
          status?: string
          task_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          home_city: string
          home_state: string
          home_vertical: string
          id: string
          last_scan_at: string | null
          prompt_focus: string | null
          updated_at: string
          user_id: string
          weekly_goal_meetings: number
          weekly_goal_outreach: number
          weekly_goal_pipeline: number
        }
        Insert: {
          created_at?: string
          home_city?: string
          home_state?: string
          home_vertical?: string
          id?: string
          last_scan_at?: string | null
          prompt_focus?: string | null
          updated_at?: string
          user_id: string
          weekly_goal_meetings?: number
          weekly_goal_outreach?: number
          weekly_goal_pipeline?: number
        }
        Update: {
          created_at?: string
          home_city?: string
          home_state?: string
          home_vertical?: string
          id?: string
          last_scan_at?: string | null
          prompt_focus?: string | null
          updated_at?: string
          user_id?: string
          weekly_goal_meetings?: number
          weekly_goal_outreach?: number
          weekly_goal_pipeline?: number
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
      app_role: "admin" | "bdr"
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
      app_role: ["admin", "bdr"],
    },
  },
} as const
