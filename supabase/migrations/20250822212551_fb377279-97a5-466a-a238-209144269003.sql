-- P0: Fix RLS policies to allow admin access to all tables
-- Update policies to allow service role (admin APIs) to access all data

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Deny all access" ON public.aluno;
DROP POLICY IF EXISTS "Deny all access" ON public.avaliacao;
DROP POLICY IF EXISTS "Deny all access" ON public.escola;
DROP POLICY IF EXISTS "Deny all access" ON public.log_importacao_aluno;
DROP POLICY IF EXISTS "Deny all access" ON public.municipio;
DROP POLICY IF EXISTS "Deny all access" ON public.resultado_avaliacao;
DROP POLICY IF EXISTS "Deny all access" ON public.turma;

-- Create policies that allow service role to access all data (for admin APIs)
-- Regular users still have no access, only service role (admin APIs) can access

-- Município policies
CREATE POLICY "Service role can manage municipios" ON public.municipio
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read municipios" ON public.municipio
FOR SELECT USING (auth.role() = 'authenticated');

-- Escola policies  
CREATE POLICY "Service role can manage escolas" ON public.escola
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read escolas" ON public.escola
FOR SELECT USING (auth.role() = 'authenticated');

-- Turma policies
CREATE POLICY "Service role can manage turmas" ON public.turma
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read turmas" ON public.turma
FOR SELECT USING (auth.role() = 'authenticated');

-- Aluno policies
CREATE POLICY "Service role can manage alunos" ON public.aluno
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read alunos" ON public.aluno
FOR SELECT USING (auth.role() = 'authenticated');

-- Avaliacao policies
CREATE POLICY "Service role can manage avaliacoes" ON public.avaliacao
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read avaliacoes" ON public.avaliacao
FOR SELECT USING (auth.role() = 'authenticated');

-- Resultado avaliacao policies
CREATE POLICY "Service role can manage resultado_avaliacao" ON public.resultado_avaliacao
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read resultado_avaliacao" ON public.resultado_avaliacao
FOR SELECT USING (auth.role() = 'authenticated');

-- Log importacao policies
CREATE POLICY "Service role can manage log_importacao_aluno" ON public.log_importacao_aluno
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read log_importacao_aluno" ON public.log_importacao_aluno
FOR SELECT USING (auth.role() = 'authenticated');

-- Add helpful indexes for admin operations
CREATE INDEX IF NOT EXISTS idx_usuario_perfil_id ON public.usuario(perfil_id);
CREATE INDEX IF NOT EXISTS idx_usuario_municipio_id ON public.usuario(municipio_id);
CREATE INDEX IF NOT EXISTS idx_escola_municipio_id ON public.escola(municipio_id);
CREATE INDEX IF NOT EXISTS idx_turma_escola_id ON public.turma(escola_id);
CREATE INDEX IF NOT EXISTS idx_turma_ciclo_id ON public.turma(ciclo_id);
CREATE INDEX IF NOT EXISTS idx_turma_professora_id ON public.turma(professora_id);
CREATE INDEX IF NOT EXISTS idx_aluno_municipio_id ON public.aluno(municipio_id);
CREATE INDEX IF NOT EXISTS idx_aluno_escola_id ON public.aluno(escola_id);
CREATE INDEX IF NOT EXISTS idx_aluno_turma_id ON public.aluno(turma_id);
CREATE INDEX IF NOT EXISTS idx_aluno_is_inclusao ON public.aluno(is_inclusao);
CREATE INDEX IF NOT EXISTS idx_avaliacao_municipio_id ON public.avaliacao(municipio_id);
CREATE INDEX IF NOT EXISTS idx_avaliacao_tipo_id ON public.avaliacao(tipo_id);
CREATE INDEX IF NOT EXISTS idx_avaliacao_data_inicio ON public.avaliacao(data_inicio);
CREATE INDEX IF NOT EXISTS idx_avaliacao_data_termino ON public.avaliacao(data_termino);