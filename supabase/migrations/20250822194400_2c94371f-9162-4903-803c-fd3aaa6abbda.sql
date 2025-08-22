-- Fix security issues from Part I migration

-- Fix 1: Enable RLS on UF table (it's a reference table, should be readable by all authenticated users)
ALTER TABLE public.uf ENABLE ROW LEVEL SECURITY;

-- Create policy for UF table to allow read access to authenticated users
CREATE POLICY "Allow read access to uf" ON public.uf FOR SELECT TO authenticated USING (true);

-- Fix 2: Set search_path for security definer function
DROP FUNCTION public.get_usuario_by_email(TEXT);

CREATE OR REPLACE FUNCTION public.get_usuario_by_email(user_email TEXT)
RETURNS TABLE(id UUID, email TEXT, nome TEXT, perfil_nome TEXT, municipio_id UUID)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT u.id, u.email, u.nome, p.nome as perfil_nome, u.municipio_id
    FROM public.usuario u
    JOIN public.perfil p ON u.perfil_id = p.id
    WHERE u.email = user_email;
$$;