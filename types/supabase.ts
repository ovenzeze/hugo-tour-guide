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
      galleries: {
        Row: {
          created_at: string | null
          description: string | null
          floor_plan_coordinate: Json | null
          gallery_id: number
          gallery_number: string | null
          location_description: string | null
          museum_id: number
          name: string
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          floor_plan_coordinate?: Json | null
          gallery_id?: number
          gallery_number?: string | null
          location_description?: string | null
          museum_id: number
          name: string
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          floor_plan_coordinate?: Json | null
          gallery_id?: number
          gallery_number?: string | null
          location_description?: string | null
          museum_id?: number
          name?: string
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "galleries_museum_id_fkey"
            columns: ["museum_id"]
            isOneToOne: false
            referencedRelation: "museums"
            referencedColumns: ["museum_id"]
          },
        ]
      }
      guide_audios: {
        Row: {
          audio_guide_id: number
          audio_url: string
          duration_seconds: number | null
          gallery_id: number | null
          generated_at: string | null
          guide_text_id: number | null
          is_active: boolean | null
          is_latest_version: boolean | null
          language: string
          metadata: Json | null
          museum_id: number | null
          object_id: number | null
          persona_id: number
          version: number | null
        }
        Insert: {
          audio_guide_id?: number
          audio_url: string
          duration_seconds?: number | null
          gallery_id?: number | null
          generated_at?: string | null
          guide_text_id?: number | null
          is_active?: boolean | null
          is_latest_version?: boolean | null
          language: string
          metadata?: Json | null
          museum_id?: number | null
          object_id?: number | null
          persona_id: number
          version?: number | null
        }
        Update: {
          audio_guide_id?: number
          audio_url?: string
          duration_seconds?: number | null
          gallery_id?: number | null
          generated_at?: string | null
          guide_text_id?: number | null
          is_active?: boolean | null
          is_latest_version?: boolean | null
          language?: string
          metadata?: Json | null
          museum_id?: number | null
          object_id?: number | null
          persona_id?: number
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_guides_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["gallery_id"]
          },
          {
            foreignKeyName: "audio_guides_guide_text_id_fkey"
            columns: ["guide_text_id"]
            isOneToOne: false
            referencedRelation: "guide_texts"
            referencedColumns: ["guide_text_id"]
          },
          {
            foreignKeyName: "audio_guides_museum_id_fkey"
            columns: ["museum_id"]
            isOneToOne: false
            referencedRelation: "museums"
            referencedColumns: ["museum_id"]
          },
          {
            foreignKeyName: "audio_guides_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "objects"
            referencedColumns: ["object_id"]
          },
          {
            foreignKeyName: "audio_guides_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["persona_id"]
          },
        ]
      }
      guide_texts: {
        Row: {
          created_at: string | null
          gallery_id: number | null
          guide_text_id: number
          is_latest_version: boolean | null
          language: string
          museum_id: number | null
          object_id: number | null
          persona_id: number
          transcript: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          gallery_id?: number | null
          guide_text_id?: number
          is_latest_version?: boolean | null
          language: string
          museum_id?: number | null
          object_id?: number | null
          persona_id: number
          transcript: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          gallery_id?: number | null
          guide_text_id?: number
          is_latest_version?: boolean | null
          language?: string
          museum_id?: number | null
          object_id?: number | null
          persona_id?: number
          transcript?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "guide_texts_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["gallery_id"]
          },
          {
            foreignKeyName: "guide_texts_museum_id_fkey"
            columns: ["museum_id"]
            isOneToOne: false
            referencedRelation: "museums"
            referencedColumns: ["museum_id"]
          },
          {
            foreignKeyName: "guide_texts_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "objects"
            referencedColumns: ["object_id"]
          },
          {
            foreignKeyName: "guide_texts_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["persona_id"]
          },
        ]
      }
      museums: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          logo_url: string | null
          museum_id: number
          name: string
          opening_hours: Json | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          logo_url?: string | null
          museum_id?: number
          name: string
          opening_hours?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          logo_url?: string | null
          museum_id?: number
          name?: string
          opening_hours?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      objects: {
        Row: {
          artist_display_name: string | null
          classification: string | null
          created_at: string | null
          credit_line: string | null
          culture: string | null
          department: string | null
          description: string | null
          dimensions: string | null
          gallery_id: number | null
          image_url: string | null
          is_highlight: boolean | null
          is_public_domain: boolean | null
          link_resource: string | null
          medium: string | null
          metadata_date: string | null
          museum_id: number
          object_date: string | null
          object_id: number
          object_name: string | null
          object_number: string | null
          object_wikidata_url: string | null
          period: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          artist_display_name?: string | null
          classification?: string | null
          created_at?: string | null
          credit_line?: string | null
          culture?: string | null
          department?: string | null
          description?: string | null
          dimensions?: string | null
          gallery_id?: number | null
          image_url?: string | null
          is_highlight?: boolean | null
          is_public_domain?: boolean | null
          link_resource?: string | null
          medium?: string | null
          metadata_date?: string | null
          museum_id: number
          object_date?: string | null
          object_id: number
          object_name?: string | null
          object_number?: string | null
          object_wikidata_url?: string | null
          period?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          artist_display_name?: string | null
          classification?: string | null
          created_at?: string | null
          credit_line?: string | null
          culture?: string | null
          department?: string | null
          description?: string | null
          dimensions?: string | null
          gallery_id?: number | null
          image_url?: string | null
          is_highlight?: boolean | null
          is_public_domain?: boolean | null
          link_resource?: string | null
          medium?: string | null
          metadata_date?: string | null
          museum_id?: number
          object_date?: string | null
          object_id?: number
          object_name?: string | null
          object_number?: string | null
          object_wikidata_url?: string | null
          period?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["gallery_id"]
          },
          {
            foreignKeyName: "objects_museum_id_fkey"
            columns: ["museum_id"]
            isOneToOne: false
            referencedRelation: "museums"
            referencedColumns: ["museum_id"]
          },
        ]
      }
      personas: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          description: string | null
          is_active: boolean | null
          language_support: string[] | null
          name: string
          persona_id: number
          updated_at: string | null
          voice_description: string | null
          voice_model_identifier: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          is_active?: boolean | null
          language_support?: string[] | null
          name: string
          persona_id?: number
          updated_at?: string | null
          voice_description?: string | null
          voice_model_identifier?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          is_active?: boolean | null
          language_support?: string[] | null
          name?: string
          persona_id?: number
          updated_at?: string | null
          voice_description?: string | null
          voice_model_identifier?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
