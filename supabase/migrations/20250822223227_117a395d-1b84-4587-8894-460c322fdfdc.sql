-- Corrigir erros críticos de segurança: Habilitar RLS em todas as tabelas públicas
-- Isso é obrigatório para segurança básica

-- Verificar e habilitar RLS em todas as tabelas que não têm
ALTER TABLE public.municipio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escola ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turma ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aluno ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultado_avaliacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_importacao_aluno ENABLE ROW LEVEL SECURITY;

-- As políticas já existentes continuam funcionando:
-- "Service role can manage X" - permite operações admin
-- "Authenticated users can read X" - permite leitura para usuários autenticados
-- "Users can read own data" (usuario) - permite usuários verem seus próprios dados