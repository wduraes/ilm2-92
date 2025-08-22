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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      aluno: {
        Row: {
          created_at: string
          escola_id: string | null
          id: string
          is_inclusao: boolean
          municipio_id: string
          nome: string
          turma_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          escola_id?: string | null
          id?: string
          is_inclusao?: boolean
          municipio_id: string
          nome: string
          turma_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          escola_id?: string | null
          id?: string
          is_inclusao?: boolean
          municipio_id?: string
          nome?: string
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aluno_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aluno_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "municipio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aluno_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turma"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_otp: {
        Row: {
          attempts: number
          code_hash: string
          created_at: string
          expires_at: string
          id: string
          usuario_id: string
        }
        Insert: {
          attempts?: number
          code_hash: string
          created_at?: string
          expires_at: string
          id?: string
          usuario_id: string
        }
        Update: {
          attempts?: number
          code_hash?: string
          created_at?: string
          expires_at?: string
          id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auth_otp_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacao: {
        Row: {
          created_at: string
          data_inicio: string
          data_termino: string
          id: string
          municipio_id: string
          tipo_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_inicio: string
          data_termino: string
          id?: string
          municipio_id: string
          tipo_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_inicio?: string
          data_termino?: string
          id?: string
          municipio_id?: string
          tipo_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacao_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "municipio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacao_tipo_id_fkey"
            columns: ["tipo_id"]
            isOneToOne: false
            referencedRelation: "tipo_avaliacao"
            referencedColumns: ["id"]
          },
        ]
      }
      ciclo: {
        Row: {
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      escola: {
        Row: {
          coord_fund_id: string | null
          coord_inf_id: string | null
          created_at: string
          id: string
          municipio_id: string
          nome: string
          updated_at: string
        }
        Insert: {
          coord_fund_id?: string | null
          coord_inf_id?: string | null
          created_at?: string
          id?: string
          municipio_id: string
          nome: string
          updated_at?: string
        }
        Update: {
          coord_fund_id?: string | null
          coord_inf_id?: string | null
          created_at?: string
          id?: string
          municipio_id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escola_coord_fund_id_fkey"
            columns: ["coord_fund_id"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escola_coord_inf_id_fkey"
            columns: ["coord_inf_id"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escola_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "municipio"
            referencedColumns: ["id"]
          },
        ]
      }
      log_importacao_aluno: {
        Row: {
          criado_em: string
          escola_id: string | null
          id: string
          municipio_id: string
          total_ignorados: number
          total_importados: number
          turma_id: string
          usuario_id: string
        }
        Insert: {
          criado_em?: string
          escola_id?: string | null
          id?: string
          municipio_id: string
          total_ignorados: number
          total_importados: number
          turma_id: string
          usuario_id: string
        }
        Update: {
          criado_em?: string
          escola_id?: string | null
          id?: string
          municipio_id?: string
          total_ignorados?: number
          total_importados?: number
          turma_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "log_importacao_aluno_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "log_importacao_aluno_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "municipio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "log_importacao_aluno_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turma"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "log_importacao_aluno_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      municipio: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          uf_sigla: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          uf_sigla: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          uf_sigla?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "municipio_uf_sigla_fkey"
            columns: ["uf_sigla"]
            isOneToOne: false
            referencedRelation: "uf"
            referencedColumns: ["sigla"]
          },
        ]
      }
      perfil: {
        Row: {
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      resultado_avaliacao: {
        Row: {
          aluno_id: string
          avaliacao_id: string
          ciclo_id: string
          created_at: string
          ei2_comp_frases: number | null
          ei2_nivel_escrita: number | null
          ei2_nivel_leitura: number | null
          f1_escreve_nome: boolean | null
          f1_nivel_escrita: number | null
          f1_nivel_leitura: number | null
          f1_nomes_letras: number | null
          f1_sons_letras: number | null
          id: string
          respondido_em: string | null
          turma_id: string
          updated_at: string
        }
        Insert: {
          aluno_id: string
          avaliacao_id: string
          ciclo_id: string
          created_at?: string
          ei2_comp_frases?: number | null
          ei2_nivel_escrita?: number | null
          ei2_nivel_leitura?: number | null
          f1_escreve_nome?: boolean | null
          f1_nivel_escrita?: number | null
          f1_nivel_leitura?: number | null
          f1_nomes_letras?: number | null
          f1_sons_letras?: number | null
          id?: string
          respondido_em?: string | null
          turma_id: string
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          avaliacao_id?: string
          ciclo_id?: string
          created_at?: string
          ei2_comp_frases?: number | null
          ei2_nivel_escrita?: number | null
          ei2_nivel_leitura?: number | null
          f1_escreve_nome?: boolean | null
          f1_nivel_escrita?: number | null
          f1_nivel_leitura?: number | null
          f1_nomes_letras?: number | null
          f1_sons_letras?: number | null
          id?: string
          respondido_em?: string | null
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resultado_avaliacao_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "aluno"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resultado_avaliacao_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resultado_avaliacao_ciclo_id_fkey"
            columns: ["ciclo_id"]
            isOneToOne: false
            referencedRelation: "ciclo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resultado_avaliacao_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turma"
            referencedColumns: ["id"]
          },
        ]
      }
      tipo_avaliacao: {
        Row: {
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      turma: {
        Row: {
          auxiliar_id: string | null
          ciclo_id: string
          created_at: string
          escola_id: string
          id: string
          nome: string
          professora_id: string
          updated_at: string
        }
        Insert: {
          auxiliar_id?: string | null
          ciclo_id: string
          created_at?: string
          escola_id: string
          id?: string
          nome: string
          professora_id: string
          updated_at?: string
        }
        Update: {
          auxiliar_id?: string | null
          ciclo_id?: string
          created_at?: string
          escola_id?: string
          id?: string
          nome?: string
          professora_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turma_auxiliar_id_fkey"
            columns: ["auxiliar_id"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turma_ciclo_id_fkey"
            columns: ["ciclo_id"]
            isOneToOne: false
            referencedRelation: "ciclo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turma_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turma_professora_id_fkey"
            columns: ["professora_id"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
        ]
      }
      uf: {
        Row: {
          nome: string
          sigla: string
        }
        Insert: {
          nome: string
          sigla: string
        }
        Update: {
          nome?: string
          sigla?: string
        }
        Relationships: []
      }
      usuario: {
        Row: {
          created_at: string
          email: string
          id: string
          municipio_id: string | null
          nome: string
          perfil_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          municipio_id?: string | null
          nome: string
          perfil_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          municipio_id?: string | null
          nome?: string
          perfil_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "municipio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfil"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_usuario_by_email: {
        Args: { user_email: string }
        Returns: {
          email: string
          id: string
          municipio_id: string
          nome: string
          perfil_nome: string
        }[]
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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
