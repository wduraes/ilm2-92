-- Part I: Core schema creation with tables, indexes, and seeds

-- Create UF table and populate with Brazilian states
CREATE TABLE public.uf (
    sigla VARCHAR(2) PRIMARY KEY,
    nome VARCHAR(50) NOT NULL
);

-- Insert all Brazilian states
INSERT INTO public.uf (sigla, nome) VALUES
('AC', 'Acre'),
('AL', 'Alagoas'),
('AP', 'Amapá'),
('AM', 'Amazonas'),
('BA', 'Bahia'),
('CE', 'Ceará'),
('DF', 'Distrito Federal'),
('ES', 'Espírito Santo'),
('GO', 'Goiás'),
('MA', 'Maranhão'),
('MT', 'Mato Grosso'),
('MS', 'Mato Grosso do Sul'),
('MG', 'Minas Gerais'),
('PA', 'Pará'),
('PB', 'Paraíba'),
('PR', 'Paraná'),
('PE', 'Pernambuco'),
('PI', 'Piauí'),
('RJ', 'Rio de Janeiro'),
('RN', 'Rio Grande do Norte'),
('RS', 'Rio Grande do Sul'),
('RO', 'Rondônia'),
('RR', 'Roraima'),
('SC', 'Santa Catarina'),
('SP', 'São Paulo'),
('SE', 'Sergipe'),
('TO', 'Tocantins');

-- Create municipio table
CREATE TABLE public.municipio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(50) NOT NULL,
    uf_sigla VARCHAR(2) REFERENCES public.uf(sigla) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_municipio_nome ON public.municipio(nome);
CREATE INDEX idx_municipio_uf ON public.municipio(uf_sigla);

-- Create perfil table and populate
CREATE TABLE public.perfil (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert stable UUIDs for profiles
INSERT INTO public.perfil (id, nome) VALUES
('00000000-0000-0000-0000-000000000001', 'administrador'),
('00000000-0000-0000-0000-000000000002', 'ilm'),
('00000000-0000-0000-0000-000000000003', 'secretaria'),
('00000000-0000-0000-0000-000000000004', 'coordenacao'),
('00000000-0000-0000-0000-000000000005', 'professor');

-- Create usuario table
CREATE TABLE public.usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    perfil_id UUID REFERENCES public.perfil(id) NOT NULL,
    municipio_id UUID REFERENCES public.municipio(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_usuario_email ON public.usuario(email);
CREATE INDEX idx_usuario_perfil ON public.usuario(perfil_id);
CREATE INDEX idx_usuario_municipio ON public.usuario(municipio_id);

-- Create escola table
CREATE TABLE public.escola (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(50) NOT NULL,
    municipio_id UUID REFERENCES public.municipio(id) NOT NULL,
    coord_inf_id UUID REFERENCES public.usuario(id),
    coord_fund_id UUID REFERENCES public.usuario(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_escola_municipio ON public.escola(municipio_id);

-- Create ciclo table and populate
CREATE TABLE public.ciclo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert stable UUIDs for cycles
INSERT INTO public.ciclo (id, nome) VALUES
('10000000-0000-0000-0000-000000000001', 'ed_infantil_1'),
('10000000-0000-0000-0000-000000000002', 'ed_infantil_2'),
('10000000-0000-0000-0000-000000000003', 'fundamental_1'),
('10000000-0000-0000-0000-000000000004', 'fundamental_2');

-- Create turma table
CREATE TABLE public.turma (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(20) NOT NULL,
    escola_id UUID REFERENCES public.escola(id) NOT NULL,
    ciclo_id UUID REFERENCES public.ciclo(id) NOT NULL,
    professora_id UUID REFERENCES public.usuario(id) NOT NULL,
    auxiliar_id UUID REFERENCES public.usuario(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_turma_escola ON public.turma(escola_id);
CREATE INDEX idx_turma_ciclo ON public.turma(ciclo_id);

-- Create aluno table
CREATE TABLE public.aluno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(50) NOT NULL,
    municipio_id UUID REFERENCES public.municipio(id) NOT NULL,
    escola_id UUID REFERENCES public.escola(id),
    turma_id UUID REFERENCES public.turma(id) NOT NULL,
    is_inclusao BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_aluno_municipio ON public.aluno(municipio_id);
CREATE INDEX idx_aluno_turma ON public.aluno(turma_id);

-- Create tipo_avaliacao table and populate
CREATE TABLE public.tipo_avaliacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert stable UUIDs for evaluation types
INSERT INTO public.tipo_avaliacao (id, nome) VALUES
('20000000-0000-0000-0000-000000000001', 'avaliacao_1'),
('20000000-0000-0000-0000-000000000002', 'avaliacao_2'),
('20000000-0000-0000-0000-000000000003', 'avaliacao_3'),
('20000000-0000-0000-0000-000000000004', 'avaliacao_4');

-- Create avaliacao table
CREATE TABLE public.avaliacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipio_id UUID REFERENCES public.municipio(id) NOT NULL,
    tipo_id UUID REFERENCES public.tipo_avaliacao(id) NOT NULL,
    data_inicio DATE NOT NULL,
    data_termino DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_avaliacao_municipio ON public.avaliacao(municipio_id);
CREATE INDEX idx_avaliacao_tipo ON public.avaliacao(tipo_id);

-- Create resultado_avaliacao table with cycle-specific columns
CREATE TABLE public.resultado_avaliacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avaliacao_id UUID REFERENCES public.avaliacao(id) NOT NULL,
    turma_id UUID REFERENCES public.turma(id) NOT NULL,
    aluno_id UUID REFERENCES public.aluno(id) NOT NULL,
    ciclo_id UUID REFERENCES public.ciclo(id) NOT NULL,
    respondido_em TIMESTAMPTZ,
    -- Ed. Infantil 2 columns
    ei2_nivel_leitura SMALLINT CHECK (ei2_nivel_leitura IN (1,2,3)),
    ei2_nivel_escrita SMALLINT CHECK (ei2_nivel_escrita IN (1,2,3,4)),
    ei2_comp_frases SMALLINT CHECK (ei2_comp_frases IN (0,1,2,3,4,5)),
    -- Fundamental 1 columns
    f1_escreve_nome BOOLEAN,
    f1_sons_letras SMALLINT CHECK (f1_sons_letras IN (0,1,2)),
    f1_nomes_letras SMALLINT CHECK (f1_nomes_letras IN (0,1,2)),
    f1_nivel_leitura SMALLINT CHECK (f1_nivel_leitura IN (1,2,3)),
    f1_nivel_escrita SMALLINT CHECK (f1_nivel_escrita IN (1,2,3,4)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (avaliacao_id, aluno_id)
);

-- Add cycle consistency checks
ALTER TABLE public.resultado_avaliacao ADD CONSTRAINT chk_ei2_fields 
CHECK (
    CASE 
        WHEN ciclo_id = '10000000-0000-0000-0000-000000000002' THEN 
            (f1_escreve_nome IS NULL AND f1_sons_letras IS NULL AND f1_nomes_letras IS NULL AND f1_nivel_leitura IS NULL AND f1_nivel_escrita IS NULL 
             AND ei2_nivel_leitura IS NOT NULL AND ei2_nivel_escrita IS NOT NULL AND ei2_comp_frases IS NOT NULL)
        ELSE TRUE 
    END
);

ALTER TABLE public.resultado_avaliacao ADD CONSTRAINT chk_f1_fields 
CHECK (
    CASE 
        WHEN ciclo_id = '10000000-0000-0000-0000-000000000003' THEN 
            (ei2_nivel_leitura IS NULL AND ei2_nivel_escrita IS NULL AND ei2_comp_frases IS NULL 
             AND f1_escreve_nome IS NOT NULL AND f1_sons_letras IS NOT NULL AND f1_nomes_letras IS NOT NULL AND f1_nivel_leitura IS NOT NULL AND f1_nivel_escrita IS NOT NULL)
        ELSE TRUE 
    END
);

-- Create log_importacao_aluno table
CREATE TABLE public.log_importacao_aluno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuario(id) NOT NULL,
    municipio_id UUID REFERENCES public.municipio(id) NOT NULL,
    escola_id UUID REFERENCES public.escola(id),
    turma_id UUID REFERENCES public.turma(id) NOT NULL,
    total_importados INT NOT NULL,
    total_ignorados INT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create auth_otp table for MFA
CREATE TABLE public.auth_otp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuario(id) NOT NULL,
    code_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_auth_otp_usuario ON public.auth_otp(usuario_id);
CREATE INDEX idx_auth_otp_expires ON public.auth_otp(expires_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables with updated_at
CREATE TRIGGER update_municipio_updated_at BEFORE UPDATE ON public.municipio
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_perfil_updated_at BEFORE UPDATE ON public.perfil
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_usuario_updated_at BEFORE UPDATE ON public.usuario
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_escola_updated_at BEFORE UPDATE ON public.escola
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ciclo_updated_at BEFORE UPDATE ON public.ciclo
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_turma_updated_at BEFORE UPDATE ON public.turma
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aluno_updated_at BEFORE UPDATE ON public.aluno
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tipo_avaliacao_updated_at BEFORE UPDATE ON public.tipo_avaliacao
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_avaliacao_updated_at BEFORE UPDATE ON public.avaliacao
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resultado_avaliacao_updated_at BEFORE UPDATE ON public.resultado_avaliacao
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.municipio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escola ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ciclo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turma ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aluno ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipo_avaliacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultado_avaliacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_importacao_aluno ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_otp ENABLE ROW LEVEL SECURITY;

-- Create security definer function for auth lookup
CREATE OR REPLACE FUNCTION public.get_usuario_by_email(user_email TEXT)
RETURNS TABLE(id UUID, email TEXT, nome TEXT, perfil_nome TEXT, municipio_id UUID)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT u.id, u.email, u.nome, p.nome as perfil_nome, u.municipio_id
    FROM public.usuario u
    JOIN public.perfil p ON u.perfil_id = p.id
    WHERE u.email = user_email;
$$;

-- Insert Admin user
INSERT INTO public.usuario (email, nome, perfil_id) VALUES
('wduraes@institutolermais.com.br', 'Admin', '00000000-0000-0000-0000-000000000001');

-- Basic RLS policies for Part 1 (deny by default, minimal auth access)
-- Users can only read their own record for authentication
CREATE POLICY "Users can read own data" ON public.usuario
    FOR SELECT USING (id = auth.uid()::uuid);

-- All other tables are locked down for now
CREATE POLICY "Deny all access" ON public.municipio FOR ALL USING (false);
CREATE POLICY "Deny all access" ON public.escola FOR ALL USING (false);
CREATE POLICY "Deny all access" ON public.turma FOR ALL USING (false);
CREATE POLICY "Deny all access" ON public.aluno FOR ALL USING (false);
CREATE POLICY "Deny all access" ON public.avaliacao FOR ALL USING (false);
CREATE POLICY "Deny all access" ON public.resultado_avaliacao FOR ALL USING (false);
CREATE POLICY "Deny all access" ON public.log_importacao_aluno FOR ALL USING (false);

-- Auth OTP access only for authenticated users on their own records
CREATE POLICY "Users can manage own OTP" ON public.auth_otp
    FOR ALL USING (usuario_id = auth.uid()::uuid);

-- Allow read access to reference tables for authenticated users
CREATE POLICY "Allow read access to perfil" ON public.perfil FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to ciclo" ON public.ciclo FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to tipo_avaliacao" ON public.tipo_avaliacao FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to uf" ON public.uf FOR SELECT TO authenticated USING (true);