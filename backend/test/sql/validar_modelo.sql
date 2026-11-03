-- Solo para la base temporal PostgreSQL del arnés local, sin proveedor de autenticación.
-- Los cambios de prueba se revierten al final. No es una migración de producción.
BEGIN;

DO $$
DECLARE tabla text; esperado integer; actual integer;
BEGIN
  FOR tabla, esperado IN SELECT * FROM (VALUES
    ('iglesias',4), ('categorias',2), ('materiales',36), ('documentos',20),
    ('paginas',140), ('horarios',58), ('actividades',12), ('tramites',16), ('administrador',0)
  ) AS cantidades(tabla, esperado) LOOP
    EXECUTE format('SELECT count(*) FROM public.%I', tabla) INTO actual;
    IF actual <> esperado THEN RAISE EXCEPTION 'Cantidad incorrecta en %: %', tabla, actual; END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM public.iglesias WHERE telefono IS NOT NULL OR NOT es_ejemplo)
    OR EXISTS (SELECT 1 FROM public.materiales WHERE NOT es_ejemplo)
    OR EXISTS (SELECT 1 FROM public.tramites WHERE estado_verificacion <> 'ejemplo')
  THEN RAISE EXCEPTION 'Semillas sin identificación de ejemplo o con teléfonos'; END IF;
  IF (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relkind='r' AND c.relrowsecurity) <> 9
    OR (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND cmd='SELECT' AND roles=ARRAY['iglesias_api']::name[]) <> 8
  THEN RAISE EXCEPTION 'RLS o políticas inesperadas'; END IF;
END;
$$;

DO $$
DECLARE sentencia text;
BEGIN
  -- Cada escritura debe fallar por su restricción específica, no por sintaxis/permisos.
  BEGIN
    UPDATE public.materiales SET iglesia_id=NULL;
    RAISE EXCEPTION 'Se permitió material sin iglesia';
  EXCEPTION WHEN not_null_violation THEN NULL; END;
  BEGIN
    UPDATE public.materiales SET iglesia_id='ffffffff-ffff-4fff-8fff-ffffffffffff';
    RAISE EXCEPTION 'Se permitió iglesia inexistente';
  EXCEPTION WHEN foreign_key_violation THEN NULL; END;
  BEGIN
    UPDATE public.materiales SET categoria_id='objetos' WHERE tipo='libro';
    RAISE EXCEPTION 'Se permitió categoría incompatible';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    INSERT INTO public.documentos VALUES ('ffffffff-ffff-4fff-8fff-ffffffffffff', 'Ejemplo', true);
    RAISE EXCEPTION 'Se permitió documento huérfano';
  EXCEPTION WHEN foreign_key_violation THEN NULL; END;
  BEGIN
    INSERT INTO public.paginas VALUES ('ffffffff-ffff-4fff-8fff-ffffffffffff', 1, 'Ejemplo', NULL);
    RAISE EXCEPTION 'Se permitió página huérfana';
  EXCEPTION WHEN foreign_key_violation THEN NULL; END;
  BEGIN
    UPDATE public.paginas SET imagen_url='https://example.invalid/privado';
    RAISE EXCEPTION 'Se permitió imagen de documento enlazada';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    INSERT INTO public.tramites (iglesia_id,tipo,titulo,requisitos)
      SELECT iglesia_id,tipo,titulo,requisitos FROM public.tramites LIMIT 1;
    RAISE EXCEPTION 'Se permitió guía duplicada';
  EXCEPTION WHEN unique_violation THEN NULL; END;
  FOREACH sentencia IN ARRAY ARRAY[
    'UPDATE public.horarios SET dia_semana=7',
    'UPDATE public.horarios SET hora=''24:00''',
    'UPDATE public.horarios SET hora=''10:00:01''',
    'UPDATE public.actividades SET hora_fin=''09:00''',
    'UPDATE public.actividades SET fecha=''infinity''',
    'UPDATE public.tramites SET estado_verificacion=''oficial''',
    'UPDATE public.tramites SET requisitos=ARRAY[NULL]::text[]',
    'UPDATE public.tramites SET requisitos=ARRAY[''   '']',
    'UPDATE public.tramites SET requisitos=ARRAY[repeat(''x'',1001)]',
    'UPDATE public.tramites SET requisitos=array_fill(''Ejemplo''::text,ARRAY[31])'
  ] LOOP
    BEGIN
      EXECUTE sentencia;
      RAISE EXCEPTION 'Restricción ausente: %', sentencia;
    EXCEPTION WHEN check_violation THEN NULL; END;
  END LOOP;
END;
$$;

-- Singleton reservado: no es una identidad autenticable ni concede acceso.
INSERT INTO public.administrador (id) VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
DO $$
BEGIN
  BEGIN
    INSERT INTO public.administrador (id) VALUES ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
    RAISE EXCEPTION 'Se permitió segundo administrador';
  EXCEPTION WHEN unique_violation THEN NULL; END;
END;
$$;

DO $$
DECLARE rol text; tabla text; cantidad integer;
BEGIN
  FOREACH rol IN ARRAY ARRAY['visitante_prueba'] LOOP
    FOREACH tabla IN ARRAY ARRAY['iglesias','categorias','materiales','documentos','paginas',
      'horarios','actividades','tramites','administrador'] LOOP
      EXECUTE format('SET LOCAL ROLE %I',rol);
      BEGIN
        EXECUTE format('SELECT count(*) FROM public.%I',tabla) INTO cantidad;
        RAISE EXCEPTION 'Acceso directo permitido a %.%',rol,tabla;
      EXCEPTION WHEN insufficient_privilege THEN NULL; END;
      RESET ROLE;
    END LOOP;
  END LOOP;
END;
$$;

-- No se prueba filtrado efectivo RLS en modo single: ese modo especial lo elude.
-- Arriba se verificaron metadatos RLS y denegaciones por GRANT del visitante.
-- El filtrado RLS debe comprobarse con validar_rls.sql en un servidor normal.

SET LOCAL ROLE iglesias_api;
DO $$
BEGIN
  IF (SELECT count(*) FROM public.iglesias) <> 4 THEN
    RAISE EXCEPTION 'Rol de API no puede consultar iglesias'; END IF;
  BEGIN
    PERFORM descripcion_interna FROM public.materiales;
    RAISE EXCEPTION 'Rol público puede leer notas internas';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM * FROM public.administrador;
    RAISE EXCEPTION 'Rol público puede leer administrador';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    UPDATE public.iglesias SET telefono=NULL;
    RAISE EXCEPTION 'Rol público puede escribir';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    UPDATE public.paginas SET texto='Cambio no permitido';
    RAISE EXCEPTION 'Rol público puede guardar páginas';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END;
$$;
RESET ROLE;
ROLLBACK;
SELECT 'MODELO_LOCAL_OK' AS resultado;
