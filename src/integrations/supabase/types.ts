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
      follow_ups: {
        Row: {
          completed: boolean
          created_at: string
          follow_up_type: string | null
          id: string
          notes: string | null
          scheduled_at: string
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          follow_up_type?: string | null
          id?: string
          notes?: string | null
          scheduled_at: string
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          follow_up_type?: string | null
          id?: string
          notes?: string | null
          scheduled_at?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      health_plans: {
        Row: {
          advice: Json | null
          created_at: string
          diet: Json | null
          exercise: Json | null
          generated_by: string | null
          id: string
          medication: Json | null
          monitoring: Json | null
          risk_level: string | null
          summary: string | null
          title: string
          user_id: string
        }
        Insert: {
          advice?: Json | null
          created_at?: string
          diet?: Json | null
          exercise?: Json | null
          generated_by?: string | null
          id?: string
          medication?: Json | null
          monitoring?: Json | null
          risk_level?: string | null
          summary?: string | null
          title: string
          user_id: string
        }
        Update: {
          advice?: Json | null
          created_at?: string
          diet?: Json | null
          exercise?: Json | null
          generated_by?: string | null
          id?: string
          medication?: Json | null
          monitoring?: Json | null
          risk_level?: string | null
          summary?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          created_at: string
          department: string | null
          doctor: string | null
          hospital: string | null
          id: string
          image_path: string | null
          notes: string | null
          ocr_text: string | null
          record_type: string
          status: string
          structured_data: Json | null
          title: string
          updated_at: string
          user_id: string
          visit_date: string | null
        }
        Insert: {
          created_at?: string
          department?: string | null
          doctor?: string | null
          hospital?: string | null
          id?: string
          image_path?: string | null
          notes?: string | null
          ocr_text?: string | null
          record_type: string
          status?: string
          structured_data?: Json | null
          title: string
          updated_at?: string
          user_id: string
          visit_date?: string | null
        }
        Update: {
          created_at?: string
          department?: string | null
          doctor?: string | null
          hospital?: string | null
          id?: string
          image_path?: string | null
          notes?: string | null
          ocr_text?: string | null
          record_type?: string
          status?: string
          structured_data?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
          visit_date?: string | null
        }
        Relationships: []
      }
      medication_reminders: {
        Row: {
          active: boolean
          created_at: string
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          medication_name: string
          notes: string | null
          start_date: string | null
          times: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          medication_name: string
          notes?: string | null
          start_date?: string | null
          times?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          medication_name?: string
          notes?: string | null
          start_date?: string | null
          times?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allergies: string | null
          birth_date: string | null
          blood_type: string | null
          chronic_conditions: string | null
          created_at: string
          emergency_contact: string | null
          emergency_phone: string | null
          family_history: string | null
          full_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          phone: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          allergies?: string | null
          birth_date?: string | null
          blood_type?: string | null
          chronic_conditions?: string | null
          created_at?: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          family_history?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id: string
          phone?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          allergies?: string | null
          birth_date?: string | null
          blood_type?: string | null
          chronic_conditions?: string | null
          created_at?: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          family_history?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          phone?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      questionnaire_responses: {
        Row: {
          answers: Json
          created_at: string
          id: string
          questionnaire_type: string
          result_summary: string | null
          score: number | null
          title: string
          user_id: string
        }
        Insert: {
          answers: Json
          created_at?: string
          id?: string
          questionnaire_type: string
          result_summary?: string | null
          score?: number | null
          title: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          questionnaire_type?: string
          result_summary?: string | null
          score?: number | null
          title?: string
          user_id?: string
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
