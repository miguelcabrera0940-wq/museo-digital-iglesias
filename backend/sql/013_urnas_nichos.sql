-- Tras 012. Ampliación compatible/idempotente de guías, sin requisitos inventados.
BEGIN;
ALTER TABLE public.tramites DROP CONSTRAINT tramites_tipo_check;
ALTER TABLE public.tramites ADD CONSTRAINT tramites_tipo_check CHECK (
  tipo IN ('bautizos','bodas','misas_difuntos','otros','urnas_nichos'));
INSERT INTO public.tramites(iglesia_id,tipo,titulo,requisitos,fuente,estado_verificacion)
SELECT id,'urnas_nichos','Urnas y nichos','{}'::text[],NULL,'por_confirmar' FROM public.iglesias
ON CONFLICT (iglesia_id,tipo) DO NOTHING;
-- Guías anteriores y requisitos ya existentes no se reescriben. Sin reservas/pagos/uploads.
COMMIT;
