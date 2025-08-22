-- Remove the problematic RLS policies that depend on auth.uid()
DROP POLICY IF EXISTS "Administrators can insert municipios" ON public.municipio;
DROP POLICY IF EXISTS "Administrators can update municipios" ON public.municipio;
DROP POLICY IF EXISTS "Administrators can delete municipios" ON public.municipio;

-- Remove the is_admin_user function since it depends on auth.uid()
DROP FUNCTION IF EXISTS public.is_admin_user();

-- The existing "Service role can manage municipios" policy should remain
-- and the "Authenticated users can read municipios" policy should remain
-- This allows the admin API to work with service role authentication
-- while the frontend validation handles admin permissions