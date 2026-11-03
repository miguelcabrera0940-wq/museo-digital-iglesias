-- Revisar después de 006 y 007; NO modifica iglesias_api ni su login.
-- Asignar contraseña mediante \password, nunca escribirla en este archivo.
BEGIN;
CREATE ROLE iglesias_auth NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE ROLE iglesias_gestion NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE ROLE iglesias_backend_admin LOGIN INHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 5;
GRANT iglesias_auth, iglesias_gestion TO iglesias_backend_admin;
GRANT iglesias_auth, iglesias_gestion TO CURRENT_USER;
DO $$ BEGIN EXECUTE format('GRANT CONNECT ON DATABASE %I TO iglesias_backend_admin',current_database()); END $$;
GRANT USAGE ON SCHEMA public TO iglesias_auth, iglesias_gestion;
GRANT SELECT ON public.auth_user, public.auth_account TO iglesias_auth;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.auth_session, public.login_limite TO iglesias_auth;
CREATE POLICY auth_usuario_lectura ON public.auth_user FOR SELECT TO iglesias_auth USING (true);
CREATE POLICY auth_cuenta_lectura ON public.auth_account FOR SELECT TO iglesias_auth USING (true);
CREATE POLICY auth_sesiones ON public.auth_session TO iglesias_auth USING (true) WITH CHECK (true);
CREATE POLICY auth_limites ON public.login_limite TO iglesias_auth USING (true) WITH CHECK (true);
-- verification sin permisos: no hay verificación por correo/recuperación ni flujos asociados.
GRANT SELECT ON public.administrador, public.iglesias, public.categorias, public.materiales,
  public.documentos, public.paginas, public.horarios, public.actividades, public.tramites TO iglesias_gestion;
GRANT UPDATE (historia,descripcion,telefono) ON public.iglesias TO iglesias_gestion;
GRANT INSERT (iglesia_id,categoria_id,tipo,titulo,descripcion_publica,visibilidad,descripcion_interna,fuente),
  UPDATE (categoria_id,tipo,titulo,descripcion_publica,visibilidad,descripcion_interna,fuente)
  ON public.materiales TO iglesias_gestion;
GRANT INSERT (iglesia_id,dia_semana,hora,nota), UPDATE (dia_semana,hora,nota), DELETE ON public.horarios TO iglesias_gestion;
GRANT INSERT (iglesia_id,tipo,titulo,fecha,hora_inicio,hora_fin,descripcion,nota_visitas),
  UPDATE (tipo,titulo,fecha,hora_inicio,hora_fin,descripcion,nota_visitas,es_ejemplo), DELETE ON public.actividades TO iglesias_gestion;
GRANT UPDATE (titulo,requisitos,fuente,estado_verificacion) ON public.tramites TO iglesias_gestion;
GRANT EXECUTE ON FUNCTION public.requisitos_validos(text[]) TO iglesias_gestion;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['administrador','categorias','documentos','paginas'] LOOP
    EXECUTE format('CREATE POLICY gestion_lectura ON public.%I FOR SELECT TO iglesias_gestion USING (true)',t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['iglesias','materiales','horarios','actividades','tramites'] LOOP
    EXECUTE format('CREATE POLICY gestion_operaciones ON public.%I TO iglesias_gestion USING (true) WITH CHECK (true)',t);
  END LOOP;
END $$;
-- Políticas no conceden operaciones sin GRANT. Runtime no puede crear usuarios,
-- cambiar hashes/vínculos, borrar iglesias/materiales ni escribir documentos/páginas.

-- Alta inicial operativa separada. No conceder este rol a ningún login runtime.
CREATE ROLE iglesias_provision NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE ROLE iglesias_alta_admin LOGIN INHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 1;
GRANT iglesias_provision TO iglesias_alta_admin;
GRANT iglesias_provision TO CURRENT_USER;
DO $$ BEGIN EXECUTE format('GRANT CONNECT ON DATABASE %I TO iglesias_alta_admin',current_database()); END $$;
GRANT USAGE ON SCHEMA public TO iglesias_provision;
GRANT SELECT,INSERT ON public.auth_user,public.auth_account,public.administrador TO iglesias_provision;
CREATE POLICY provision_usuario ON public.auth_user TO iglesias_provision USING (true) WITH CHECK (true);
CREATE POLICY provision_cuenta ON public.auth_account TO iglesias_provision USING (true) WITH CHECK (true);
CREATE POLICY provision_vinculo ON public.administrador TO iglesias_provision USING (true) WITH CHECK (true);
-- autoSignIn:false, sin permiso de crear sesiones ni actualizar/borrar credenciales.
COMMIT;
