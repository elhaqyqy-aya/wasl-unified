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
      absences: {
        Row: {
          approved_by: string | null
          created_at: string
          employee_id: string
          end_date: string
          id: string
          reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["absence_status"]
          type: Database["public"]["Enums"]["absence_type"]
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          employee_id: string
          end_date: string
          id?: string
          reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["absence_status"]
          type: Database["public"]["Enums"]["absence_type"]
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          employee_id?: string
          end_date?: string
          id?: string
          reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["absence_status"]
          type?: Database["public"]["Enums"]["absence_type"]
        }
        Relationships: [
          {
            foreignKeyName: "absences_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "absences_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_escalations: {
        Row: {
          created_at: string
          id: string
          prompt_excerpt: string
          role: string
          status: string
          topic: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          prompt_excerpt: string
          role: string
          status?: string
          topic: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          prompt_excerpt?: string
          role?: string
          status?: string
          topic?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          acknowledged: boolean
          created_at: string
          description: string | null
          id: string
          severity: Database["public"]["Enums"]["alert_severity"]
          target_id: string | null
          title: string
        }
        Insert: {
          acknowledged?: boolean
          created_at?: string
          description?: string | null
          id?: string
          severity?: Database["public"]["Enums"]["alert_severity"]
          target_id?: string | null
          title: string
        }
        Update: {
          acknowledged?: boolean
          created_at?: string
          description?: string | null
          id?: string
          severity?: Database["public"]["Enums"]["alert_severity"]
          target_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          body: string | null
          created_at: string
          id: string
          issued_at: string | null
          owner_id: string
          rejection_reason: string | null
          requested_by: string | null
          size_bytes: number | null
          status: Database["public"]["Enums"]["document_status"]
          storage_path: string | null
          title: string
          type: Database["public"]["Enums"]["document_type"]
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          body?: string | null
          created_at?: string
          id?: string
          issued_at?: string | null
          owner_id: string
          rejection_reason?: string | null
          requested_by?: string | null
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string | null
          title: string
          type: Database["public"]["Enums"]["document_type"]
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          body?: string | null
          created_at?: string
          id?: string
          issued_at?: string | null
          owner_id?: string
          rejection_reason?: string | null
          requested_by?: string | null
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string | null
          title?: string
          type?: Database["public"]["Enums"]["document_type"]
        }
        Relationships: [
          {
            foreignKeyName: "documents_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          measured_at: string
          pulse_note: string | null
          score: number
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          measured_at?: string
          pulse_note?: string | null
          score: number
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          measured_at?: string
          pulse_note?: string | null
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "engagement_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_articles: {
        Row: {
          audience: string
          category: string
          content: string
          created_at: string
          id: string
          language: string
          published: boolean
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string
          category?: string
          content: string
          created_at?: string
          id?: string
          language?: string
          published?: boolean
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          category?: string
          content?: string
          created_at?: string
          id?: string
          language?: string
          published?: boolean
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      offboarding: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step: string | null
          departure_date: string | null
          employee_id: string
          id: string
          knowledge_transfer: string | null
          progress: number
          started_at: string | null
          status: Database["public"]["Enums"]["offboarding_status"]
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step?: string | null
          departure_date?: string | null
          employee_id: string
          id?: string
          knowledge_transfer?: string | null
          progress?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["offboarding_status"]
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step?: string | null
          departure_date?: string | null
          employee_id?: string
          id?: string
          knowledge_transfer?: string | null
          progress?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["offboarding_status"]
        }
        Relationships: [
          {
            foreignKeyName: "offboarding_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step: string | null
          employee_id: string
          id: string
          progress: number
          started_at: string | null
          status: Database["public"]["Enums"]["onboarding_status"]
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step?: string | null
          employee_id: string
          id?: string
          progress?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["onboarding_status"]
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step?: string | null
          employee_id?: string
          id?: string
          progress?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["onboarding_status"]
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          country: string | null
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      presence: {
        Row: {
          anomaly: string | null
          check_in: string | null
          check_out: string | null
          created_at: string
          day: string
          device_id: string | null
          employee_id: string
          id: string
          method: string
          source: string
        }
        Insert: {
          anomaly?: string | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          day: string
          device_id?: string | null
          employee_id: string
          id?: string
          method?: string
          source?: string
        }
        Update: {
          anomaly?: string | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          day?: string
          device_id?: string | null
          employee_id?: string
          id?: string
          method?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "presence_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string
          hire_date: string | null
          id: string
          location: string | null
          manager_id: string | null
          organisation_id: string | null
          phone: string | null
          position: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email: string
          full_name?: string
          hire_date?: string | null
          id: string
          location?: string | null
          manager_id?: string | null
          organisation_id?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          hire_date?: string | null
          id?: string
          location?: string | null
          manager_id?: string | null
          organisation_id?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      compute_risk_alerts: {
        Args: never
        Returns: {
          inserted: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      absence_status: "pending" | "approved" | "rejected" | "cancelled"
      absence_type: "vacation" | "sick" | "remote" | "unpaid" | "training"
      alert_severity:
        | "info"
        | "warning"
        | "critical"
        | "low"
        | "medium"
        | "high"
      app_role: "admin" | "rh" | "manager" | "collab"
      document_status: "pending" | "approved" | "rejected" | "draft"
      document_type:
        | "contract"
        | "payslip"
        | "policy"
        | "certificate"
        | "id"
        | "other"
      offboarding_status: "in_progress" | "completed" | "cancelled"
      onboarding_status: "not_started" | "in_progress" | "completed"
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
      absence_status: ["pending", "approved", "rejected", "cancelled"],
      absence_type: ["vacation", "sick", "remote", "unpaid", "training"],
      alert_severity: ["info", "warning", "critical", "low", "medium", "high"],
      app_role: ["admin", "rh", "manager", "collab"],
      document_status: ["pending", "approved", "rejected", "draft"],
      document_type: [
        "contract",
        "payslip",
        "policy",
        "certificate",
        "id",
        "other",
      ],
      offboarding_status: ["in_progress", "completed", "cancelled"],
      onboarding_status: ["not_started", "in_progress", "completed"],
    },
  },
} as const
