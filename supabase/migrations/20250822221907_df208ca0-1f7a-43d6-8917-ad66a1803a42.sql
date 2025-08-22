-- Create security definer function to check if user is administrator
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.usuario u
    JOIN public.perfil p ON u.perfil_id = p.id
    WHERE u.id = auth.uid() 
    AND p.nome = 'administrador'
  );
$$;

-- Add RLS policy for INSERT on municipio table
CREATE POLICY "Administrators can insert municipios" 
ON public.municipio 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin_user());

-- Add RLS policy for UPDATE on municipio table
CREATE POLICY "Administrators can update municipios" 
ON public.municipio 
FOR UPDATE 
TO authenticated
USING (public.is_admin_user());

-- Add RLS policy for DELETE on municipio table
CREATE POLICY "Administrators can delete municipios" 
ON public.municipio 
FOR DELETE 
TO authenticated
USING (public.is_admin_user());