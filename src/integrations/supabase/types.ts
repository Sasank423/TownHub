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
      book_copies: {
        Row: {
          book_id: string
          condition: string | null
          id: string
          location: string | null
          status: Database["public"]["Enums"]["book_status"]
        }
        Insert: {
          book_id: string
          condition?: string | null
          id?: string
          location?: string | null
          status?: Database["public"]["Enums"]["book_status"]
        }
        Update: {
          book_id?: string
          condition?: string | null
          id?: string
          location?: string | null
          status?: Database["public"]["Enums"]["book_status"]
        }
        Relationships: [
          {
            foreignKeyName: "book_copies_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          added_date: string
          author: string
          cover_image: string | null
          description: string | null
          genres: string[] | null
          id: string
          isbn: string | null
          language: string | null
          page_count: number | null
          publication_year: number | null
          publisher: string | null
          rating: number | null
          title: string
        }
        Insert: {
          added_date?: string
          author: string
          cover_image?: string | null
          description?: string | null
          genres?: string[] | null
          id?: string
          isbn?: string | null
          language?: string | null
          page_count?: number | null
          publication_year?: number | null
          publisher?: string | null
          rating?: number | null
          title: string
        }
        Update: {
          added_date?: string
          author?: string
          cover_image?: string | null
          description?: string | null
          genres?: string[] | null
          id?: string
          isbn?: string | null
          language?: string | null
          page_count?: number | null
          publication_year?: number | null
          publisher?: string | null
          rating?: number | null
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_reservation_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_reservation_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_reservation_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_reservation_id_fkey"
            columns: ["related_reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
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
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          created_at: string
          end_date: string
          id: string
          item_id: string
          item_type: Database["public"]["Enums"]["reservation_type"]
          notes: string | null
          start_date: string
          status: Database["public"]["Enums"]["reservation_status"]
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          item_id: string
          item_type: Database["public"]["Enums"]["reservation_type"]
          notes?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["reservation_status"]
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          item_id?: string
          item_type?: Database["public"]["Enums"]["reservation_type"]
          notes?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      room_availability: {
        Row: {
          date: string
          id: string
          room_id: string
          slots: Json
        }
        Insert: {
          date: string
          id?: string
          room_id: string
          slots: Json
        }
        Update: {
          date?: string
          id?: string
          room_id?: string
          slots?: Json
        }
        Relationships: [
          {
            foreignKeyName: "room_availability_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          amenities: Database["public"]["Enums"]["room_amenity"][]
          capacity: number
          description: string | null
          floor_map_position: Json | null
          id: string
          images: string[] | null
          location: string | null
          name: string
        }
        Insert: {
          amenities: Database["public"]["Enums"]["room_amenity"][]
          capacity: number
          description?: string | null
          floor_map_position?: Json | null
          id?: string
          images?: string[] | null
          location?: string | null
          name: string
        }
        Update: {
          amenities?: Database["public"]["Enums"]["room_amenity"][]
          capacity?: number
          description?: string | null
          floor_map_position?: Json | null
          id?: string
          images?: string[] | null
          location?: string | null
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_librarian_or_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_owner: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      book_status: "available" | "reserved" | "checked-out"
      reservation_status: "Pending" | "Approved" | "Declined" | "Completed"
      reservation_type: "book" | "room"
      room_amenity:
        | "wifi"
        | "projector"
        | "whiteboard"
        | "computers"
        | "videoconferencing"
        | "printer"
        | "study-pods"
        | "silence"
      user_role: "member" | "librarian" | "admin"
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
    Enums: {
      book_status: ["available", "reserved", "checked-out"],
      reservation_status: ["Pending", "Approved", "Declined", "Completed"],
      reservation_type: ["book", "room"],
      room_amenity: [
        "wifi",
        "projector",
        "whiteboard",
        "computers",
        "videoconferencing",
        "printer",
        "study-pods",
        "silence",
      ],
      user_role: ["member", "librarian", "admin"],
    },
  },
} as const
