-- Solo arnés temporal; jamás ejecutar en Neon.
DO $$
DECLARE t record; contenido jsonb;
BEGIN
  IF (SELECT count(*) FROM public.iglesias)<>8 OR
     (SELECT count(*) FROM public.iglesias WHERE estado='yucatan')<>4 OR
     (SELECT count(*) FROM public.iglesias WHERE estado='campeche')<>2 OR
     (SELECT count(*) FROM public.iglesias WHERE estado='puebla')<>2 THEN
    RAISE EXCEPTION 'Distribución de iglesias incorrecta'; END IF;
  IF EXISTS(SELECT 1 FROM prueba_fase2.iglesias a LEFT JOIN public.iglesias i ON i.id=a.id
    WHERE i.id IS NULL OR a.fila IS DISTINCT FROM to_jsonb(i)-'estado'-'ciudad' OR i.estado<>'yucatan' OR i.ciudad<>'Mérida') THEN
    RAISE EXCEPTION 'Se alteraron IDs, slugs o contenido de Mérida'; END IF;
  FOR t IN SELECT * FROM prueba_fase2.tablas LOOP
    IF t.nombre='tramites' THEN
      SELECT jsonb_agg(to_jsonb(g) ORDER BY g.id) INTO contenido FROM public.tramites g
        JOIN prueba_fase2.iglesias i ON g.iglesia_id=i.id;
    ELSE
      EXECUTE format('SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)),''[]''::jsonb) FROM public.%I t',t.nombre) INTO contenido;
      -- Comparar como conjuntos para no depender del orden de las claves UUID.
      IF EXISTS(SELECT value FROM jsonb_array_elements(contenido) EXCEPT SELECT value FROM jsonb_array_elements(t.contenido)) OR
        EXISTS(SELECT value FROM jsonb_array_elements(t.contenido) EXCEPT SELECT value FROM jsonb_array_elements(contenido)) THEN
        RAISE EXCEPTION 'Se alteró tabla protegida %',t.nombre; END IF;
      CONTINUE;
    END IF;
    IF contenido IS DISTINCT FROM t.contenido THEN RAISE EXCEPTION 'Se cambiaron trámites de Mérida'; END IF;
  END LOOP;
  IF EXISTS(SELECT * FROM prueba_fase2.politicas EXCEPT SELECT schemaname,tablename,policyname,roles,cmd,qual,with_check FROM pg_policies WHERE schemaname='public') OR
     (SELECT count(*) FROM prueba_fase2.politicas)<>(SELECT count(*) FROM pg_policies WHERE schemaname='public') THEN
    RAISE EXCEPTION 'Se cambiaron políticas RLS'; END IF;
  IF EXISTS(SELECT * FROM prueba_fase2.permisos EXCEPT SELECT table_schema,table_name,grantee,privilege_type FROM information_schema.role_table_grants WHERE table_schema='public') OR
     (SELECT count(*) FROM prueba_fase2.permisos)<>(SELECT count(*) FROM information_schema.role_table_grants WHERE table_schema='public') THEN
    RAISE EXCEPTION 'Se cambiaron permisos de tabla'; END IF;
  IF EXISTS(SELECT * FROM prueba_fase2.columnas EXCEPT SELECT table_schema,table_name,column_name,grantee,privilege_type FROM information_schema.role_column_grants WHERE table_schema='public' AND table_name='iglesias') THEN
    RAISE EXCEPTION 'Se perdieron permisos de columna anteriores'; END IF;
  IF (SELECT count(*) FROM public.tramites WHERE iglesia_id NOT IN (SELECT id FROM prueba_fase2.iglesias))<>16 OR
     EXISTS(SELECT 1 FROM public.tramites WHERE iglesia_id NOT IN (SELECT id FROM prueba_fase2.iglesias)
       AND (requisitos<>'{}'::text[] OR estado_verificacion<>'por_confirmar' OR fuente IS NOT NULL)) THEN
    RAISE EXCEPTION 'Faltan guías vacías o se inventaron requisitos'; END IF;
  IF EXISTS(SELECT 1 FROM public.iglesias WHERE estado<>'yucatan' AND
     (descripcion<>'' OR historia<>'' OR direccion<>'' OR telefono IS NOT NULL OR foto_interior IS NOT NULL OR foto_exterior IS NOT NULL OR NOT es_ejemplo)) THEN
    RAISE EXCEPTION 'Datos nuevos no vacíos'; END IF;
  IF EXISTS(SELECT 1 FROM public.iglesias WHERE slug='santo-domingo') THEN RAISE EXCEPTION 'Templo descartado'; END IF;
  BEGIN
    UPDATE public.iglesias SET estado='otro' WHERE slug='la-compania';
    RAISE EXCEPTION 'Estado fuera del catálogo permitido';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    UPDATE public.iglesias SET ciudad='Otra ciudad' WHERE slug='la-compania';
    RAISE EXCEPTION 'Ciudad incompatible permitida';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    UPDATE public.iglesias SET slug='santo-domingo' WHERE slug='la-compania';
    RAISE EXCEPTION 'Slug descartado permitido';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;
BEGIN;
SET LOCAL ROLE iglesias_api;
DO $$ BEGIN
  IF (SELECT count(*) FROM public.iglesias WHERE estado='puebla' AND ciudad='Puebla de Zaragoza')<>2 THEN
    RAISE EXCEPTION 'Faltan permisos de lectura de metadatos'; END IF;
  BEGIN
    SELECT descripcion_interna FROM public.materiales LIMIT 1;
    RAISE EXCEPTION 'Notas internas visibles';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SET LOCAL ROLE iglesias_gestion;
UPDATE public.iglesias SET descripcion='' WHERE slug='la-compania';
INSERT INTO public.materiales (iglesia_id,categoria_id,tipo,titulo,descripcion_publica,visibilidad)
 VALUES ('00000000-0000-4000-8000-000000000008','objetos','objeto','Ejemplo de prueba local','Ejemplo de prueba local','privado');
INSERT INTO public.horarios(iglesia_id,dia_semana,hora)
 VALUES ('00000000-0000-4000-8000-000000000008',1,'12:00');
INSERT INTO public.actividades(iglesia_id,tipo,titulo,fecha,hora_inicio,descripcion)
 VALUES ('00000000-0000-4000-8000-000000000008','otro','Ejemplo de prueba local','2026-10-30','12:00','Ejemplo de prueba local');
UPDATE public.tramites SET requisitos=ARRAY['Ejemplo de prueba local'] WHERE iglesia_id='00000000-0000-4000-8000-000000000008' AND tipo='otros';
DO $$ BEGIN
  BEGIN
    UPDATE public.iglesias SET estado='yucatan' WHERE slug='la-compania';
    RAISE EXCEPTION 'Se permitió cambiar metadatos por runtime';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
ROLLBACK;
-- Dejar las cuentas vacías para la integración Auth local posterior (sin alterar semillas remotas).
DELETE FROM public.administrador WHERE auth_user_id='fase2-no-autenticable';
DELETE FROM public.auth_user WHERE id='fase2-no-autenticable';
DROP SCHEMA prueba_fase2 CASCADE;
SELECT 'FASE2_LOCAL_OK' AS resultado;
