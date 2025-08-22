-- Solução mínima segura: Remover políticas RLS problemáticas das tabelas admin
-- Manter apenas as políticas que funcionam: "Service role can manage" e "Authenticated users can read"

-- ESCOLA: Remover políticas problemáticas que dependem de auth.uid()
DROP POLICY IF EXISTS "Administrators can insert escolas" ON public.escola;
DROP POLICY IF EXISTS "Administrators can update escolas" ON public.escola;
DROP POLICY IF EXISTS "Administrators can delete escolas" ON public.escola;

-- TURMA: Remover políticas problemáticas que dependem de auth.uid()
DROP POLICY IF EXISTS "Administrators can insert turmas" ON public.turma;
DROP POLICY IF EXISTS "Administrators can update turmas" ON public.turma;
DROP POLICY IF EXISTS "Administrators can delete turmas" ON public.turma;

-- ALUNO: Remover políticas problemáticas que dependem de auth.uid()
DROP POLICY IF EXISTS "Administrators can insert alunos" ON public.aluno;
DROP POLICY IF EXISTS "Administrators can update alunos" ON public.aluno;
DROP POLICY IF EXISTS "Administrators can delete alunos" ON public.aluno;

-- AVALIACAO: Remover políticas problemáticas que dependem de auth.uid()
DROP POLICY IF EXISTS "Administrators can insert avaliacoes" ON public.avaliacao;
DROP POLICY IF EXISTS "Administrators can update avaliacoes" ON public.avaliacao;
DROP POLICY IF EXISTS "Administrators can delete avaliacoes" ON public.avaliacao;

-- USUARIO: Criar política temporária para permitir operações admin
-- Nota: Esta tabela já tem política "Users can read own data", vamos adicionar uma para operações admin
CREATE POLICY "Service role can manage usuarios" 
ON public.usuario 
FOR ALL 
USING (auth.role() = 'service_role'::text);

-- Remover a função is_admin_user se existir em outras tabelas
DROP FUNCTION IF EXISTS public.is_admin_user();

-- Comentário: Esta solução temporária permite que:
-- 1. DEV_MODE bypass funcione completamente
-- 2. Em produção, apenas service_role pode fazer operações admin
-- 3. Usuários autenticados podem ler dados (políticas existentes mantidas)
-- 4. Validação adicional no código admin-api.ts (validateAdminRole)