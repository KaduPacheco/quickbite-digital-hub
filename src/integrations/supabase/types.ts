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
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          product_image: string | null
          product_name: string
          product_price: number
          quantity: number
          session_id: string
          user_id: string | null
          variations: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          product_image?: string | null
          product_name: string
          product_price: number
          quantity?: number
          session_id: string
          user_id?: string | null
          variations?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          product_image?: string | null
          product_name?: string
          product_price?: number
          quantity?: number
          session_id?: string
          user_id?: string | null
          variations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          created_at: string
          id: string
          lanchonete_id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lanchonete_id: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lanchonete_id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_lanchonete_id_fkey"
            columns: ["lanchonete_id"]
            isOneToOne: false
            referencedRelation: "lanchonetes"
            referencedColumns: ["id"]
          },
        ]
      }
      config_lanchonete: {
        Row: {
          aceita_pix: boolean
          chave_pix: string | null
          created_at: string
          id: string
          lanchonete_id: string
          updated_at: string
        }
        Insert: {
          aceita_pix?: boolean
          chave_pix?: string | null
          created_at?: string
          id?: string
          lanchonete_id: string
          updated_at?: string
        }
        Update: {
          aceita_pix?: boolean
          chave_pix?: string | null
          created_at?: string
          id?: string
          lanchonete_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "config_lanchonete_lanchonete_id_fkey"
            columns: ["lanchonete_id"]
            isOneToOne: true
            referencedRelation: "lanchonetes"
            referencedColumns: ["id"]
          },
        ]
      }
      entregadores: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          lanchonete_id: string
          nome: string
          telefone: string | null
          updated_at: string
          veiculo: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          lanchonete_id: string
          nome: string
          telefone?: string | null
          updated_at?: string
          veiculo?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          lanchonete_id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
          veiculo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entregadores_lanchonete_id_fkey"
            columns: ["lanchonete_id"]
            isOneToOne: false
            referencedRelation: "lanchonetes"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque: {
        Row: {
          alerta_baixo: number
          created_at: string
          id: string
          produto_id: string
          quantidade: number
          updated_at: string
        }
        Insert: {
          alerta_baixo?: number
          created_at?: string
          id?: string
          produto_id: string
          quantidade?: number
          updated_at?: string
        }
        Update: {
          alerta_baixo?: number
          created_at?: string
          id?: string
          produto_id?: string
          quantidade?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: true
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_pedido: {
        Row: {
          created_at: string
          id: string
          pedido_id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          updated_at: string
          variacoes: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          pedido_id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          updated_at?: string
          variacoes?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          pedido_id?: string
          preco_unitario?: number
          produto_id?: string
          quantidade?: number
          updated_at?: string
          variacoes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "itens_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pedido_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      lanchonetes: {
        Row: {
          created_at: string
          endereco: string | null
          horario_funcionamento: string | null
          id: string
          logo_url: string | null
          nome: string
          taxa_entrega: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          endereco?: string | null
          horario_funcionamento?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          taxa_entrega?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          endereco?: string | null
          horario_funcionamento?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          taxa_entrega?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          cliente_id: string | null
          created_at: string
          endereco_entrega: string
          id: string
          lanchonete_id: string
          status: Database["public"]["Enums"]["pedido_status"]
          total: number
          updated_at: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          endereco_entrega: string
          id?: string
          lanchonete_id: string
          status?: Database["public"]["Enums"]["pedido_status"]
          total: number
          updated_at?: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          endereco_entrega?: string
          id?: string
          lanchonete_id?: string
          status?: Database["public"]["Enums"]["pedido_status"]
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_lanchonete_id_fkey"
            columns: ["lanchonete_id"]
            isOneToOne: false
            referencedRelation: "lanchonetes"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean
          categoria_id: string | null
          created_at: string
          descricao: string | null
          id: string
          imagem_url: string | null
          lanchonete_id: string
          nome: string
          preco_base: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          lanchonete_id: string
          nome: string
          preco_base: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          lanchonete_id?: string
          nome?: string
          preco_base?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_lanchonete_id_fkey"
            columns: ["lanchonete_id"]
            isOneToOne: false
            referencedRelation: "lanchonetes"
            referencedColumns: ["id"]
          },
        ]
      }
      promocoes: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          id: string
          lanchonete_id: string
          tipo: Database["public"]["Enums"]["promocao_tipo"]
          titulo: string
          updated_at: string
          validade: string
          valor: number
          valor_minimo: number | null
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          id?: string
          lanchonete_id: string
          tipo: Database["public"]["Enums"]["promocao_tipo"]
          titulo: string
          updated_at?: string
          validade: string
          valor: number
          valor_minimo?: number | null
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          id?: string
          lanchonete_id?: string
          tipo?: Database["public"]["Enums"]["promocao_tipo"]
          titulo?: string
          updated_at?: string
          validade?: string
          valor?: number
          valor_minimo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "promocoes_lanchonete_id_fkey"
            columns: ["lanchonete_id"]
            isOneToOne: false
            referencedRelation: "lanchonetes"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          created_at: string
          email: string | null
          id: string
          lanchonete_id: string | null
          nome: string
          telefone: string | null
          tipo: Database["public"]["Enums"]["usuario_tipo"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          lanchonete_id?: string | null
          nome: string
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["usuario_tipo"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          lanchonete_id?: string | null
          nome?: string
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["usuario_tipo"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_lanchonete_id_fkey"
            columns: ["lanchonete_id"]
            isOneToOne: false
            referencedRelation: "lanchonetes"
            referencedColumns: ["id"]
          },
        ]
      }
      variacoes_produto: {
        Row: {
          adicional_preco: number
          created_at: string
          id: string
          nome: string
          produto_id: string
          updated_at: string
        }
        Insert: {
          adicional_preco?: number
          created_at?: string
          id?: string
          nome: string
          produto_id: string
          updated_at?: string
        }
        Update: {
          adicional_preco?: number
          created_at?: string
          id?: string
          nome?: string
          produto_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "variacoes_produto_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_lanchonete_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      pedido_status: "recebido" | "preparo" | "em_rota" | "entregue"
      promocao_tipo: "percentual" | "fixo"
      usuario_tipo: "admin" | "funcionario" | "cliente"
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
      pedido_status: ["recebido", "preparo", "em_rota", "entregue"],
      promocao_tipo: ["percentual", "fixo"],
      usuario_tipo: ["admin", "funcionario", "cliente"],
    },
  },
} as const
