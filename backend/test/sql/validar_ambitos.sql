-- SOLO arnés local. No ejecutar contra Neon.
DO $$ DECLARE t record;contenido jsonb; BEGIN
  IF (SELECT count(*) FROM public.login_limite)<>0 THEN RAISE EXCEPTION 'Contadores antiguos no reiniciados'; END IF;
  IF EXISTS(SELECT 1 FROM public.administrador a CROSS JOIN prueba_ambitos.general g
    WHERE a.rol<>'general' OR a.iglesia_id IS NOT NULL OR (to_jsonb(a)-'rol'-'iglesia_id') IS DISTINCT FROM (g.fila-'unico')) THEN
    RAISE EXCEPTION 'Se alteró el administrador existente'; END IF;
  FOR t IN SELECT * FROM prueba_ambitos.datos LOOP
    EXECUTE format('SELECT jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)) FROM public.%I t',t.nombre) INTO contenido;
    IF EXISTS(SELECT value FROM jsonb_array_elements(t.contenido) EXCEPT SELECT value FROM jsonb_array_elements(contenido)) OR
       EXISTS(SELECT value FROM jsonb_array_elements(contenido) EXCEPT SELECT value FROM jsonb_array_elements(t.contenido)) THEN
      RAISE EXCEPTION 'Contenido o identidad modificados en %',t.nombre; END IF;
  END LOOP;
  IF EXISTS(SELECT * FROM prueba_ambitos.guias EXCEPT SELECT * FROM public.tramites) THEN
    RAISE EXCEPTION 'Guías anteriores alteradas'; END IF;
  IF (SELECT count(*) FROM public.tramites WHERE tipo='urnas_nichos')<>8 OR
     EXISTS(SELECT 1 FROM public.tramites WHERE tipo='urnas_nichos' AND
       (requisitos<>'{}'::text[] OR fuente IS NOT NULL OR estado_verificacion<>'por_confirmar')) THEN
    RAISE EXCEPTION 'Guías de urnas incorrectas'; END IF;
  IF (SELECT count(*) FROM public.tramites)<>40 THEN RAISE EXCEPTION 'Guías duplicadas'; END IF;
END $$;
BEGIN;
INSERT INTO public.auth_user(id,name,email) VALUES ('parroquial-a','Ejemplo','a@example.invalid'),('parroquial-b','Ejemplo','b@example.invalid'),('extra','Ejemplo','extra@example.invalid');
INSERT INTO public.administrador(auth_user_id,rol,iglesia_id) VALUES
 ('parroquial-a','parroquial','00000000-0000-4000-8000-000000000001'),
 ('parroquial-b','parroquial','00000000-0000-4000-8000-000000000002');
DO $$ BEGIN
  BEGIN
    INSERT INTO public.administrador(auth_user_id,rol) VALUES ('extra','general');
    RAISE EXCEPTION 'Segundo general permitido';
  EXCEPTION WHEN unique_violation THEN NULL; END;
  BEGIN
    INSERT INTO public.administrador(auth_user_id,rol,iglesia_id) VALUES ('extra','parroquial','00000000-0000-4000-8000-000000000001');
    RAISE EXCEPTION 'Segundo parroquial permitido';
  EXCEPTION WHEN unique_violation THEN NULL; END;
  BEGIN
    INSERT INTO public.administrador(auth_user_id,rol) VALUES ('extra','parroquial');
    RAISE EXCEPTION 'Parroquial sin iglesia permitido';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    INSERT INTO public.administrador(auth_user_id,rol,iglesia_id) VALUES ('extra','general','00000000-0000-4000-8000-000000000001');
    RAISE EXCEPTION 'General asociado a iglesia permitido';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;
SET LOCAL ROLE iglesias_gestion;
DO $$ BEGIN
  BEGIN
    UPDATE public.administrador SET rol='general',iglesia_id=NULL WHERE auth_user_id='parroquial-a';
    RAISE EXCEPTION 'Runtime puede conceder privilegios';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SET LOCAL ROLE iglesias_provision;
SELECT id,slug FROM public.iglesias LIMIT 1;
DO $$ BEGIN
  BEGIN
    PERFORM nombre FROM public.iglesias;
    RAISE EXCEPTION 'Provisión puede consultar datos innecesarios';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
ROLLBACK;
-- Limpiar únicamente las identidades locales de esta prueba para el test Auth posterior.
DELETE FROM public.administrador WHERE auth_user_id='general-prueba';
DELETE FROM public.auth_user WHERE id='general-prueba';
DROP SCHEMA prueba_ambitos CASCADE;
SELECT 'AMBITOS_LOCAL_OK' AS resultado;
