-- Revisar tras 010. UNA VEZ; conserva IDs, hashes y sesiones de la cuenta general.
BEGIN;
DROP INDEX public.auth_usuario_unico;
ALTER TABLE public.administrador
  DROP COLUMN unico,
  ADD COLUMN rol text NOT NULL DEFAULT 'general' CHECK (rol IN ('general','parroquial')),
  ADD COLUMN iglesia_id uuid REFERENCES public.iglesias(id) ON DELETE RESTRICT,
  ADD CONSTRAINT administrador_ambito_check CHECK (
    (rol='general' AND iglesia_id IS NULL) OR (rol='parroquial' AND iglesia_id IS NOT NULL));
CREATE UNIQUE INDEX administrador_general_unico ON public.administrador (rol) WHERE rol='general';
CREATE UNIQUE INDEX administrador_parroquial_unico ON public.administrador (iglesia_id) WHERE rol='parroquial';
COMMENT ON TABLE public.administrador IS 'Vínculo de identidad y ámbito. Un general, como máximo un parroquial por iglesia. Permisos comprobados por Express en cada operación.';
GRANT SELECT (id,slug) ON public.iglesias TO iglesias_provision;
CREATE POLICY provision_iglesias ON public.iglesias FOR SELECT TO iglesias_provision USING (true);
-- Runtime sigue sin INSERT/UPDATE de vínculos/cuentas. Operador de alta separado.
-- iglesias_gestion mantiene RLS amplia: NO es aislamiento PostgreSQL por usuario final.
COMMIT;
