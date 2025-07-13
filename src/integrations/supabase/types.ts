export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      entities: {
        Row: {
          apps: Json | null
          average_rating: number | null
          can_reply_to_reviews: boolean | null
          category_tags: string[] | null
          claimed_by_business: boolean | null
          claimed_by_user_id: string | null
          contact: Json | null
          cover_image_url: string | null
          created_at: string
          custom_fields: Json | null
          description: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["entity_type"]
          flagged_for_review_fraud: boolean | null
          founded_year: number | null
          founders: string[] | null
          industry: string | null
          is_verified: boolean | null
          keywords: string[] | null
          legal_name: string | null
          location: Json | null
          logo_url: string | null
          media: Json | null
          name: string
          number_of_employees: string | null
          platform_score: number | null
          profile_completion: number | null
          registration_info: Json | null
          revenue_range: string | null
          review_count: number | null
          social_links: Json | null
          status: string | null
          sub_industry: string | null
          tagline: string | null
          trust_level: Database["public"]["Enums"]["trust_level"] | null
          updated_at: string
        }
        Insert: {
          apps?: Json | null
          average_rating?: number | null
          can_reply_to_reviews?: boolean | null
          category_tags?: string[] | null
          claimed_by_business?: boolean | null
          claimed_by_user_id?: string | null
          contact?: Json | null
          cover_image_url?: string | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["entity_type"]
          flagged_for_review_fraud?: boolean | null
          founded_year?: number | null
          founders?: string[] | null
          industry?: string | null
          is_verified?: boolean | null
          keywords?: string[] | null
          legal_name?: string | null
          location?: Json | null
          logo_url?: string | null
          media?: Json | null
          name: string
          number_of_employees?: string | null
          platform_score?: number | null
          profile_completion?: number | null
          registration_info?: Json | null
          revenue_range?: string | null
          review_count?: number | null
          social_links?: Json | null
          status?: string | null
          sub_industry?: string | null
          tagline?: string | null
          trust_level?: Database["public"]["Enums"]["trust_level"] | null
          updated_at?: string
        }
        Update: {
          apps?: Json | null
          average_rating?: number | null
          can_reply_to_reviews?: boolean | null
          category_tags?: string[] | null
          claimed_by_business?: boolean | null
          claimed_by_user_id?: string | null
          contact?: Json | null
          cover_image_url?: string | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["entity_type"]
          flagged_for_review_fraud?: boolean | null
          founded_year?: number | null
          founders?: string[] | null
          industry?: string | null
          is_verified?: boolean | null
          keywords?: string[] | null
          legal_name?: string | null
          location?: Json | null
          logo_url?: string | null
          media?: Json | null
          name?: string
          number_of_employees?: string | null
          platform_score?: number | null
          profile_completion?: number | null
          registration_info?: Json | null
          revenue_range?: string | null
          review_count?: number | null
          social_links?: Json | null
          status?: string | null
          sub_industry?: string | null
          tagline?: string | null
          trust_level?: Database["public"]["Enums"]["trust_level"] | null
          updated_at?: string
        }
        Relationships: []
      }
      entity_addition_requests: {
        Row: {
          created_at: string
          entity_name: string
          id: string
          requested_by: string | null
          sector: string
          status: string
          updated_at: string
          website_link: string | null
        }
        Insert: {
          created_at?: string
          entity_name: string
          id?: string
          requested_by?: string | null
          sector: string
          status?: string
          updated_at?: string
          website_link?: string | null
        }
        Update: {
          created_at?: string
          entity_name?: string
          id?: string
          requested_by?: string | null
          sector?: string
          status?: string
          updated_at?: string
          website_link?: string | null
        }
        Relationships: []
      }
      entity_registrations: {
        Row: {
          address: string | null
          category: string
          city: string | null
          contact_email: string
          contact_phone: string | null
          created_at: string
          description: string | null
          entity_name: string
          id: string
          owner_email: string | null
          owner_name: string | null
          registration_number: string | null
          rejection_reason: string | null
          reviewed_by: string | null
          state: string | null
          status: string
          submitted_by: string | null
          tax_id: string | null
          updated_at: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          category: string
          city?: string | null
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          entity_name: string
          id?: string
          owner_email?: string | null
          owner_name?: string | null
          registration_number?: string | null
          rejection_reason?: string | null
          reviewed_by?: string | null
          state?: string | null
          status?: string
          submitted_by?: string | null
          tax_id?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          city?: string | null
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          entity_name?: string
          id?: string
          owner_email?: string | null
          owner_name?: string | null
          registration_number?: string | null
          rejection_reason?: string | null
          reviewed_by?: string | null
          state?: string | null
          status?: string
          submitted_by?: string | null
          tax_id?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      problem_reports: {
        Row: {
          admin_notes: string | null
          category: string
          contact_email: string | null
          created_at: string
          description: string
          id: string
          priority: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          category: string
          contact_email?: string | null
          created_at?: string
          description: string
          id?: string
          priority?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string
          contact_email?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          aadhaar_mobile: string | null
          aadhaar_number: string | null
          avatar_url: string | null
          created_at: string
          display_name_preference: string | null
          email: string | null
          full_name: string | null
          full_name_pan: string | null
          id: string
          is_verified: boolean | null
          main_badge: string | null
          mobile: string | null
          pan_image_url: string | null
          pan_number: string | null
          phone: string | null
          pseudonym: string | null
          pseudonym_set: boolean | null
          rejection_reason: string | null
          tokens: number
          updated_at: string
        }
        Insert: {
          aadhaar_mobile?: string | null
          aadhaar_number?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name_preference?: string | null
          email?: string | null
          full_name?: string | null
          full_name_pan?: string | null
          id: string
          is_verified?: boolean | null
          main_badge?: string | null
          mobile?: string | null
          pan_image_url?: string | null
          pan_number?: string | null
          phone?: string | null
          pseudonym?: string | null
          pseudonym_set?: boolean | null
          rejection_reason?: string | null
          tokens?: number
          updated_at?: string
        }
        Update: {
          aadhaar_mobile?: string | null
          aadhaar_number?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name_preference?: string | null
          email?: string | null
          full_name?: string | null
          full_name_pan?: string | null
          id?: string
          is_verified?: boolean | null
          main_badge?: string | null
          mobile?: string | null
          pan_image_url?: string | null
          pan_number?: string | null
          phone?: string | null
          pseudonym?: string | null
          pseudonym_set?: boolean | null
          rejection_reason?: string | null
          tokens?: number
          updated_at?: string
        }
        Relationships: []
      }
      review_votes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          updated_at: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          updated_at?: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          updated_at?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          business_id: string
          business_response: string | null
          business_response_date: string | null
          content: string
          created_at: string
          custom_verification_tag: string | null
          downvotes: number | null
          id: string
          is_proof_submitted: boolean | null
          is_update: boolean | null
          is_verified: boolean | null
          parent_review_id: string | null
          proof_rejection_reason: string | null
          proof_remark: string | null
          proof_url: string | null
          proof_verified: boolean | null
          proof_verified_at: string | null
          proof_verified_by: string | null
          rating: number
          update_number: number | null
          updated_at: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          business_id: string
          business_response?: string | null
          business_response_date?: string | null
          content: string
          created_at?: string
          custom_verification_tag?: string | null
          downvotes?: number | null
          id?: string
          is_proof_submitted?: boolean | null
          is_update?: boolean | null
          is_verified?: boolean | null
          parent_review_id?: string | null
          proof_rejection_reason?: string | null
          proof_remark?: string | null
          proof_url?: string | null
          proof_verified?: boolean | null
          proof_verified_at?: string | null
          proof_verified_by?: string | null
          rating: number
          update_number?: number | null
          updated_at?: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          business_id?: string
          business_response?: string | null
          business_response_date?: string | null
          content?: string
          created_at?: string
          custom_verification_tag?: string | null
          downvotes?: number | null
          id?: string
          is_proof_submitted?: boolean | null
          is_update?: boolean | null
          is_verified?: boolean | null
          parent_review_id?: string | null
          proof_rejection_reason?: string | null
          proof_remark?: string | null
          proof_url?: string | null
          proof_verified?: boolean | null
          proof_verified_at?: string | null
          proof_verified_by?: string | null
          rating?: number
          update_number?: number | null
          updated_at?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_entity_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["entity_id"]
          },
          {
            foreignKeyName: "reviews_parent_review_id_fkey"
            columns: ["parent_review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      user_business_connections: {
        Row: {
          approved_at: string
          approved_by: string | null
          business_id: string
          connection_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          approved_at?: string
          approved_by?: string | null
          business_id: string
          connection_type: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          approved_at?: string
          approved_by?: string | null
          business_id?: string
          connection_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_business_connections_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["entity_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          entity_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          entity_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          entity_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["entity_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_roles: {
        Args: { check_user_id?: string }
        Returns: {
          role: Database["public"]["Enums"]["app_role"]
          entity_id: string
        }[]
      }
      has_role: {
        Args: {
          check_role: Database["public"]["Enums"]["app_role"]
          check_entity_id?: string
        }
        Returns: boolean
      }
      is_review_editable: {
        Args: { review_created_at: string }
        Returns: boolean
      }
      upsert_review_vote: {
        Args: { p_review_id: string; p_vote_type: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "super_admin" | "entity_admin" | "user"
      entity_type:
        | "business"
        | "service"
        | "movie_theatre"
        | "institution"
        | "learning_platform"
        | "ecommerce"
        | "product"
        | "other"
      trust_level: "basic" | "verified" | "trusted_partner"
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
      app_role: ["super_admin", "entity_admin", "user"],
      entity_type: [
        "business",
        "service",
        "movie_theatre",
        "institution",
        "learning_platform",
        "ecommerce",
        "product",
        "other",
      ],
      trust_level: ["basic", "verified", "trusted_partner"],
    },
  },
} as const
