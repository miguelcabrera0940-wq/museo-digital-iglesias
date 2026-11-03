DO $$ BEGIN
  IF (SELECT count(*) FROM public.materiales WHERE es_ejemplo=false)<>8 OR
     (SELECT count(*) FROM public.documentos WHERE es_ejemplo=false)<>8 OR
     (SELECT count(*) FROM public.paginas p JOIN public.documentos d USING(material_id) WHERE d.es_ejemplo=false)<>32
  THEN RAISE EXCEPTION 'Cuadernos incompletos o duplicados'; END IF;
  IF (SELECT count(*) FROM public.materiales WHERE retirado_publico)<>16 OR EXISTS(
    SELECT 1 FROM public.materiales WHERE retirado_publico AND (visibilidad<>'publico' OR NOT es_ejemplo OR categoria_id<>'libros-documentos')
  ) THEN RAISE EXCEPTION 'Retirada incorrecta'; END IF;
  IF EXISTS(SELECT 1 FROM protegidos_cuadernos a JOIN public.materiales m USING(id) WHERE a.datos<>to_jsonb(m)) OR
     EXISTS(SELECT 1 FROM documentos_anteriores a JOIN public.documentos d USING(material_id) WHERE a.datos<>to_jsonb(d)) OR
     EXISTS(SELECT 1 FROM paginas_anteriores a JOIN public.paginas p USING(material_id,numero) WHERE a.datos<>to_jsonb(p))
  THEN RAISE EXCEPTION 'Se cambió contenido anterior'; END IF;
  IF (SELECT huella FROM administracion_anterior) IS DISTINCT FROM (
    SELECT md5(string_agg(datos::text,',' ORDER BY datos::text)) FROM (
      SELECT to_jsonb(a) AS datos FROM public.administrador a UNION ALL SELECT to_jsonb(u) FROM public.auth_user u
      UNION ALL SELECT to_jsonb(c) FROM public.auth_account c UNION ALL SELECT to_jsonb(s) FROM public.auth_session s
    ) x
  ) THEN RAISE EXCEPTION 'Se cambió administración'; END IF;
  BEGIN
    UPDATE public.materiales SET visibilidad='privado' WHERE NOT es_ejemplo;
    RAISE EXCEPTION 'Permitió privatizar imágenes públicas';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    INSERT INTO public.paginas(material_id,numero,texto,imagen_url)
      SELECT id,99,'Solo prueba local','/imagenes/catedral-exterior.jpg' FROM public.materiales
      WHERE visibilidad='privado' LIMIT 1;
    RAISE EXCEPTION 'Permitió imagen privada';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    INSERT INTO public.paginas(material_id,numero,texto,imagen_url)
      SELECT material_id,99,'Solo prueba local','/imagenes/../privado.html' FROM public.documentos
      WHERE es_ejemplo=false LIMIT 1;
    RAISE EXCEPTION 'Permitió ruta de imagen arbitraria';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;
-- En modo servidor comprobar RLS de cuadernos/retirados con un rol sin BYPASSRLS.
SET LOCAL ROLE iglesias_backend;
DO $$ BEGIN
  -- En modo single RLS se elude: no se hace esta aserción allí.
  IF current_setting('iglesias.prueba_rls',true)='servidor' AND (
     (SELECT count(*) FROM public.materiales WHERE retirado_publico)<>0 OR
     (SELECT count(*) FROM public.materiales)<>28 OR
     (SELECT count(*) FROM public.documentos)<>8 OR
     (SELECT count(*) FROM public.paginas)<>32
  ) THEN RAISE EXCEPTION 'RLS cuadernos incorrecto';
  END IF;
END $$;
RESET ROLE;
