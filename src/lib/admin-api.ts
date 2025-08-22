import { supabase } from '@/integrations/supabase/client';

// Base admin API functions with role validation
async function validateAdminRole() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Não autenticado');
  }
  
  // Get user profile to check role
  const { data: userData } = await supabase
    .from('usuario')
    .select('perfil:perfil_id(nome)')
    .eq('id', session.user.id)
    .single();
  
  if (userData?.perfil?.nome !== 'administrador') {
    throw new Error('Acesso negado: apenas administradores podem acessar esta funcionalidade');
  }
}

// Generic CRUD operations
export async function fetchWithPagination<T>(
  table: string,
  {
    page = 1,
    limit = 20,
    filters = {},
    orderBy = 'created_at',
    ascending = false,
    select = '*'
  }: {
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
    orderBy?: string;
    ascending?: boolean;
    select?: string;
  } = {}
): Promise<{ data: T[]; count: number; totalPages: number }> {
  await validateAdminRole();
  
  let query = (supabase as any)
    .from(table)
    .select(select, { count: 'exact' });
  
  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key.includes('ilike')) {
        query = query.ilike(key.replace('_ilike', ''), `%${value}%`);
      } else {
        query = query.eq(key, value);
      }
    }
  });
  
  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  query = query
    .order(orderBy, { ascending })
    .range(from, to);
  
  const { data, error, count } = await query;
  
  if (error) {
    throw new Error(`Erro ao buscar ${table}: ${error.message}`);
  }
  
  return {
    data: (data || []) as T[],
    count: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function createRecord<T>(table: string, data: Partial<T>): Promise<T> {
  await validateAdminRole();
  
  const { data: result, error } = await (supabase as any)
    .from(table)
    .insert(data)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Erro ao criar registro em ${table}: ${error.message}`);
  }
  
  return result as T;
}

export async function updateRecord<T>(
  table: string, 
  id: string, 
  data: Partial<T>
): Promise<T> {
  await validateAdminRole();
  
  const { data: result, error } = await (supabase as any)
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Erro ao atualizar registro em ${table}: ${error.message}`);
  }
  
  return result as T;
}

export async function deleteRecord(table: string, id: string): Promise<void> {
  await validateAdminRole();
  
  const { error } = await (supabase as any)
    .from(table)
    .delete()
    .eq('id', id);
  
  if (error) {
    throw new Error(`Erro ao excluir registro de ${table}: ${error.message}`);
  }
}

export async function fetchById<T>(table: string, id: string, select = '*'): Promise<T> {
  await validateAdminRole();
  
  const { data, error } = await (supabase as any)
    .from(table)
    .select(select)
    .eq('id', id)
    .single();
  
  if (error) {
    throw new Error(`Erro ao buscar registro em ${table}: ${error.message}`);
  }
  
  return data as T;
}

// Reference data fetchers (no pagination needed)
export async function fetchPerfis() {
  const { data, error } = await supabase
    .from('perfil')
    .select('id, nome')
    .order('nome');
  
  if (error) throw new Error(`Erro ao buscar perfis: ${error.message}`);
  return data || [];
}

export async function fetchMunicipios() {
  const { data, error } = await supabase
    .from('municipio')
    .select('id, nome, uf_sigla')
    .eq('ativo', true)
    .order('nome');
  
  if (error) throw new Error(`Erro ao buscar municípios: ${error.message}`);
  return data || [];
}

export async function fetchUFs() {
  const { data, error } = await supabase
    .from('uf')
    .select('sigla, nome')
    .order('nome');
  
  if (error) throw new Error(`Erro ao buscar UFs: ${error.message}`);
  return data || [];
}

export async function fetchCiclos() {
  const { data, error } = await supabase
    .from('ciclo')
    .select('id, nome')
    .order('nome');
  
  if (error) throw new Error(`Erro ao buscar ciclos: ${error.message}`);
  return data || [];
}

export async function fetchTiposAvaliacao() {
  const { data, error } = await supabase
    .from('tipo_avaliacao')
    .select('id, nome')
    .order('nome');
  
  if (error) throw new Error(`Erro ao buscar tipos de avaliação: ${error.message}`);
  return data || [];
}

export async function fetchEscolasByMunicipio(municipioId: string) {
  const { data, error } = await supabase
    .from('escola')
    .select('id, nome')
    .eq('municipio_id', municipioId)
    .order('nome');
  
  if (error) throw new Error(`Erro ao buscar escolas: ${error.message}`);
  return data || [];
}

export async function fetchTurmasByEscola(escolaId: string) {
  const { data, error } = await supabase
    .from('turma')
    .select('id, nome')
    .eq('escola_id', escolaId)
    .order('nome');
  
  if (error) throw new Error(`Erro ao buscar turmas: ${error.message}`);
  return data || [];
}

export async function fetchUsuariosByMunicipioAndPerfil(municipioId: string, perfilNome: string) {
  const { data, error } = await supabase
    .from('usuario')
    .select(`
      id, 
      nome, 
      email,
      perfil:perfil_id(nome)
    `)
    .eq('municipio_id', municipioId)
    .eq('perfil.nome', perfilNome)
    .order('nome');
  
  if (error) throw new Error(`Erro ao buscar usuários: ${error.message}`);
  return data || [];
}