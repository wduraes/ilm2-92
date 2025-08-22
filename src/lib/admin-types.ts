// Database entity types for admin operations
export interface UsuarioEntity {
  id: string;
  email: string;
  nome: string;
  municipio_id: string | null;
  perfil_id: string;
  created_at: string;
  updated_at: string;
}

export interface MunicipioEntity {
  id: string;
  nome: string;
  uf_sigla: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface EscolaEntity {
  id: string;
  nome: string;
  municipio_id: string;
  coord_inf_id: string | null;
  coord_fund_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TurmaEntity {
  id: string;
  nome: string;
  escola_id: string;
  ciclo_id: string;
  professora_id: string;
  auxiliar_id: string | null;
  created_at: string;
  updated_at: string;
  escola: {
    municipio_id: string;
  };
}

export interface AvaliacaoEntity {
  id: string;
  municipio_id: string;
  tipo_id: string;
  data_inicio: string;
  data_termino: string;
  created_at: string;
  updated_at: string;
}

export interface AlunoEntity {
  id: string;
  nome: string;
  municipio_id: string;
  escola_id: string | null;
  turma_id: string;
  is_inclusao: boolean;
  created_at: string;
  updated_at: string;
}