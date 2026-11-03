-- PENDIENTE. Solo sobre las semillas recién cargadas en PostgreSQL normal/Neon.
-- Requiere revisión/autorización si es remoto. NO usar en modo single.
-- Cambios de prueba dentro de transacción, revertidos al final.
BEGIN;
SET LOCAL ROLE iglesias_api;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.materiales) <> 36
    OR (SELECT count(*) FROM public.documentos) <> 12
    OR (SELECT count(*) FROM public.paginas) <> 84
  THEN RAISE EXCEPTION 'Filtrado RLS o semillas distintos a lo esperado'; END IF;
  IF EXISTS (
    SELECT 1 FROM public.paginas p JOIN public.materiales m ON m.id=p.material_id
    WHERE m.visibilidad='privado'
  ) THEN RAISE EXCEPTION 'Páginas privadas visibles'; END IF;
  BEGIN
    PERFORM descripcion_interna FROM public.materiales;
    RAISE EXCEPTION 'Notas internas visibles';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM * FROM public.administrador;
    RAISE EXCEPTION 'Administrador visible';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END;
$$;
RESET ROLE;
UPDATE public.materiales SET visibilidad='privado'
WHERE id='20000000-0000-4000-8000-000000000000';
SET LOCAL ROLE iglesias_api;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.documentos WHERE material_id='20000000-0000-4000-8000-000000000000')
    OR EXISTS (SELECT 1 FROM public.paginas WHERE material_id='20000000-0000-4000-8000-000000000000')
  THEN RAISE EXCEPTION 'Cambio público a privado no bloquea documento/páginas'; END IF;
END;
$$;
RESET ROLE;
ROLLBACK;
SELECT 'RLS_NORMAL_OK' AS resultado;
