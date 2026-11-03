-- REVISAR. Después de 013, antes de desplegar las consultas que usan retirado_publico.
-- No carga contenido, no cambia cuentas/logins/permisos administrativos.
BEGIN;
ALTER TABLE public.materiales ADD COLUMN retirado_publico boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN public.materiales.retirado_publico IS
  'Retirado del catálogo y lector públicos; conserva visibilidad original y acceso administrativo.';
ALTER TABLE public.documentos DROP CONSTRAINT documentos_es_ejemplo_check;
ALTER TABLE public.paginas DROP CONSTRAINT paginas_imagen_url_check;
ALTER TABLE public.paginas ADD CONSTRAINT paginas_imagen_url_check CHECK (
  imagen_url IS NULL OR (char_length(imagen_url)<=2000 AND
    imagen_url ~ '^/imagenes/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$')
);
-- Sigue sin haber imágenes privadas ni subida de archivos.
CREATE FUNCTION public.proteger_imagenes_paginas() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog,public AS $$
BEGIN
  IF TG_TABLE_NAME='paginas' THEN
    IF NEW.imagen_url IS NOT NULL THEN
      -- El bloqueo impide insertar imagen a la vez que otro proceso hace privado el material.
      PERFORM 1 FROM public.materiales WHERE id=NEW.material_id AND visibilidad='publico' FOR UPDATE;
      IF NOT FOUND THEN RAISE EXCEPTION 'Las imágenes de páginas requieren material público' USING ERRCODE='23514'; END IF;
    END IF;
  ELSIF NEW.visibilidad='privado' AND EXISTS (
    SELECT 1 FROM public.paginas WHERE material_id=NEW.id AND imagen_url IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Retirar imágenes antes de hacer privado el material' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.proteger_imagenes_paginas() FROM PUBLIC;
CREATE TRIGGER paginas_imagenes_publicas BEFORE INSERT OR UPDATE ON public.paginas
  FOR EACH ROW EXECUTE FUNCTION public.proteger_imagenes_paginas();
CREATE TRIGGER materiales_imagenes_publicas BEFORE UPDATE OF visibilidad ON public.materiales
  FOR EACH ROW EXECUTE FUNCTION public.proteger_imagenes_paginas();

-- Solo se concede lectura de la nueva marca interna al rol público, nunca notas internas.
GRANT SELECT (retirado_publico) ON public.materiales TO iglesias_api;
ALTER POLICY materiales_ficha ON public.materiales USING (NOT retirado_publico);
ALTER POLICY documentos_publicos ON public.documentos USING (
  EXISTS(SELECT 1 FROM public.materiales m WHERE m.id=documentos.material_id
    AND m.visibilidad='publico' AND NOT m.retirado_publico)
);
ALTER POLICY paginas_publicas ON public.paginas USING (
  EXISTS(SELECT 1 FROM public.materiales m WHERE m.id=paginas.material_id
    AND m.visibilidad='publico' AND NOT m.retirado_publico)
);
COMMIT;
