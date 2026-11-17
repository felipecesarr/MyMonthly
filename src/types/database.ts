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
      bank_accounts: {
        Row: {
          account_number_last4: string
          account_type: string
          agency_number: string
          archived_at: string | null
          balance: number
          bank_icon: string
          bank_name: string
          created_at: string
          id: string
          total_inflow: number
          total_outflow: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number_last4?: string
          account_type?: string
          agency_number?: string
          archived_at?: string | null
          balance?: number
          bank_icon?: string
          bank_name: string
          created_at?: string
          id?: string
          total_inflow?: number
          total_outflow?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number_last4?: string
          account_type?: string
          agency_number?: string
          archived_at?: string | null
          balance?: number
          bank_icon?: string
          bank_name?: string
          created_at?: string
          id?: string
          total_inflow?: number
          total_outflow?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          archived_at: string | null
          bold_color: string
          budget: number
          created_at: string
          emoji: string
          id: string
          income_amount: number
          is_default: boolean
          kind: string
          name: string
          primary_color: string
          secondary_color: string
          spent_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          bold_color?: string
          budget?: number
          created_at?: string
          emoji?: string
          id?: string
          income_amount?: number
          is_default?: boolean
          kind: string
          name: string
          primary_color?: string
          secondary_color?: string
          spent_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          bold_color?: string
          budget?: number
          created_at?: string
          emoji?: string
          id?: string
          income_amount?: number
          is_default?: boolean
          kind?: string
          name?: string
          primary_color?: string
          secondary_color?: string
          spent_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_cards: {
        Row: {
          archived_at: string | null
          bank_icon: string
          bank_name: string
          card_last4: string
          created_at: string
          credit_limit: number
          current_spend: number
          expiry_month: number | null
          expiry_year: number | null
          id: string
          total_inflow: number
          total_outflow: number
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          bank_icon?: string
          bank_name: string
          card_last4: string
          created_at?: string
          credit_limit?: number
          current_spend?: number
          expiry_month?: number | null
          expiry_year?: number | null
          id?: string
          total_inflow?: number
          total_outflow?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          bank_icon?: string
          bank_name?: string
          card_last4?: string
          created_at?: string
          credit_limit?: number
          current_spend?: number
          expiry_month?: number | null
          expiry_year?: number | null
          id?: string
          total_inflow?: number
          total_outflow?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          archived_at: string | null
          bold_color: string
          budget: number
          category_id: string
          created_at: string
          emoji: string
          id: string
          income_amount: number
          name: string
          primary_color: string
          secondary_color: string
          spent_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          bold_color?: string
          budget?: number
          category_id: string
          created_at?: string
          emoji?: string
          id?: string
          income_amount?: number
          name: string
          primary_color?: string
          secondary_color?: string
          spent_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          bold_color?: string
          budget?: number
          category_id?: string
          created_at?: string
          emoji?: string
          id?: string
          income_amount?: number
          name?: string
          primary_color?: string
          secondary_color?: string
          spent_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_owner_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string | null
          created_at: string
          credit_card_id: string | null
          description: string
          destination_account_id: string | null
          destination_card_id: string | null
          direction: string | null
          id: string
          name: string
          occurred_at: string
          payment_type: string | null
          source_account_id: string | null
          subcategory_id: string | null
          transfer_group_id: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category_id?: string | null
          created_at?: string
          credit_card_id?: string | null
          description?: string
          destination_account_id?: string | null
          destination_card_id?: string | null
          direction?: string | null
          id?: string
          name: string
          occurred_at: string
          payment_type?: string | null
          source_account_id?: string | null
          subcategory_id?: string | null
          transfer_group_id?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string | null
          created_at?: string
          credit_card_id?: string | null
          description?: string
          destination_account_id?: string | null
          destination_card_id?: string | null
          direction?: string | null
          id?: string
          name?: string
          occurred_at?: string
          payment_type?: string | null
          source_account_id?: string | null
          subcategory_id?: string | null
          transfer_group_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_destination_account_id_fkey"
            columns: ["destination_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_destination_card_id_fkey"
            columns: ["destination_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_source_account_id_fkey"
            columns: ["source_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_card_payment: {
        Args: {
          p_amount: number
          p_description: string
          p_destination_card_id: string
          p_name: string
          p_occurred_at: string
          p_source_account_id: string
        }
        Returns: {
          account_id: string | null
          amount: number
          category_id: string | null
          created_at: string
          credit_card_id: string | null
          description: string
          destination_account_id: string | null
          destination_card_id: string | null
          direction: string | null
          id: string
          name: string
          occurred_at: string
          payment_type: string | null
          source_account_id: string | null
          subcategory_id: string | null
          transfer_group_id: string | null
          type: string
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "transactions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      create_expense_transaction: {
        Args: {
          p_account_id: string
          p_amount: number
          p_category_id: string
          p_credit_card_id: string
          p_description: string
          p_name: string
          p_occurred_at: string
          p_payment_type: string
          p_subcategory_id: string
        }
        Returns: {
          account_id: string | null
          amount: number
          category_id: string | null
          created_at: string
          credit_card_id: string | null
          description: string
          destination_account_id: string | null
          destination_card_id: string | null
          direction: string | null
          id: string
          name: string
          occurred_at: string
          payment_type: string | null
          source_account_id: string | null
          subcategory_id: string | null
          transfer_group_id: string | null
          type: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_income_transaction: {
        Args: {
          p_account_id: string
          p_amount: number
          p_category_id: string
          p_credit_card_id: string
          p_description: string
          p_name: string
          p_occurred_at: string
          p_payment_type: string
          p_subcategory_id: string
        }
        Returns: {
          account_id: string | null
          amount: number
          category_id: string | null
          created_at: string
          credit_card_id: string | null
          description: string
          destination_account_id: string | null
          destination_card_id: string | null
          direction: string | null
          id: string
          name: string
          occurred_at: string
          payment_type: string | null
          source_account_id: string | null
          subcategory_id: string | null
          transfer_group_id: string | null
          type: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_transfer: {
        Args: {
          p_amount: number
          p_description: string
          p_destination_account_id: string
          p_destination_card_id: string
          p_destination_type: string
          p_name: string
          p_occurred_at: string
          p_source_account_id: string
        }
        Returns: {
          account_id: string | null
          amount: number
          category_id: string | null
          created_at: string
          credit_card_id: string | null
          description: string
          destination_account_id: string | null
          destination_card_id: string | null
          direction: string | null
          id: string
          name: string
          occurred_at: string
          payment_type: string | null
          source_account_id: string | null
          subcategory_id: string | null
          transfer_group_id: string | null
          type: string
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "transactions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      delete_financial_transaction: {
        Args: { p_transaction_id: string }
        Returns: undefined
      }
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
