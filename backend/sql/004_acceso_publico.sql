-- Neon/PostgreSQL: aplicar una vez después de 001, 002 y 003, como propietario.
-- Rol de permisos SQL, NO sistema de autenticación de usuarios de la aplicación.
-- No crea login, contraseña, usuario administrador ni acceso de escritura.
BEGIN;

CREATE ROLE iglesias_api NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
GRANT iglesias_api TO CURRENT_USER;
GRANT USAGE ON SCHEMA public TO iglesias_api;

GRANT SELECT ON public.iglesias, public.categorias, public.horarios,
  public.actividades, public.tramites, public.documentos, public.paginas TO iglesias_api;
GRANT SELECT (id, iglesia_id, categoria_id, tipo, titulo, descripcion_publica,
  imagen_publica, visibilidad, fuente, es_ejemplo) ON public.materiales TO iglesias_api;

CREATE POLICY iglesias_lectura ON public.iglesias FOR SELECT TO iglesias_api USING (true);
CREATE POLICY categorias_lectura ON public.categorias FOR SELECT TO iglesias_api USING (true);
CREATE POLICY materiales_ficha ON public.materiales FOR SELECT TO iglesias_api USING (true);
CREATE POLICY horarios_lectura ON public.horarios FOR SELECT TO iglesias_api USING (true);
CREATE POLICY actividades_lectura ON public.actividades FOR SELECT TO iglesias_api USING (true);
CREATE POLICY tramites_lectura ON public.tramites FOR SELECT TO iglesias_api USING (true);

CREATE POLICY documentos_publicos ON public.documentos FOR SELECT TO iglesias_api USING (
  EXISTS (SELECT 1 FROM public.materiales m
          WHERE m.id = documentos.material_id AND m.visibilidad = 'publico')
);
CREATE POLICY paginas_publicas ON public.paginas FOR SELECT TO iglesias_api USING (
  EXISTS (SELECT 1 FROM public.materiales m
          WHERE m.id = paginas.material_id AND m.visibilidad = 'publico')
);

-- Sin GRANT ni políticas de administrador/escrituras hasta adaptar autenticación.
-- Express debe usar un login restringido con este rol, no el propietario de Neon.
-- Además conserva el 403 de documento privado y los campos calculados de ficha.
COMMIT;
