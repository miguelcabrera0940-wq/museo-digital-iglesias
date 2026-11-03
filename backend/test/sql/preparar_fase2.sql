-- SOLO clúster temporal: simula contenido editado y cuenta existente, sin credenciales reales.
CREATE SCHEMA prueba_fase2;
UPDATE public.iglesias SET historia='Contenido de prueba que debe conservarse',
  foto_exterior='/imagenes/ejemplo-local.jpg',es_ejemplo=false WHERE slug='catedral';
INSERT INTO public.auth_user(id,name,email) VALUES ('fase2-no-autenticable','Ejemplo','fase2@example.invalid');
INSERT INTO public.auth_account(id,"accountId","providerId","userId",password)
 VALUES ('fase2-cuenta','fase2-no-autenticable','credential','fase2-no-autenticable','HASH_NO_AUTENTICABLE_SOLO_PRUEBA');
INSERT INTO public.auth_session(id,"expiresAt",token,"userId")
 VALUES ('fase2-sesion',now()+interval '8 hours','SESION_LOCAL_NO_USABLE','fase2-no-autenticable');
INSERT INTO public.administrador(auth_user_id) VALUES ('fase2-no-autenticable');
CREATE TABLE prueba_fase2.iglesias AS SELECT id,to_jsonb(i) AS fila FROM public.iglesias i;
CREATE TABLE prueba_fase2.tablas AS
 SELECT nombre,contenido FROM (VALUES
 ('materiales',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM public.materiales t)),
 ('documentos',(SELECT jsonb_agg(to_jsonb(t) ORDER BY material_id) FROM public.documentos t)),
 ('paginas',(SELECT jsonb_agg(to_jsonb(t) ORDER BY material_id,numero) FROM public.paginas t)),
 ('horarios',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM public.horarios t)),
 ('actividades',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM public.actividades t)),
 ('tramites',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM public.tramites t)),
 ('administrador',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM public.administrador t)),
 ('auth_user',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM public.auth_user t)),
 ('auth_account',(SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY id),'[]'::jsonb) FROM public.auth_account t)),
 ('auth_session',(SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY id),'[]'::jsonb) FROM public.auth_session t))
 ) AS t(nombre,contenido);
CREATE TABLE prueba_fase2.politicas AS SELECT schemaname,tablename,policyname,roles,cmd,qual,with_check FROM pg_policies WHERE schemaname='public';
CREATE TABLE prueba_fase2.permisos AS SELECT table_schema,table_name,grantee,privilege_type FROM information_schema.role_table_grants WHERE table_schema='public';
CREATE TABLE prueba_fase2.columnas AS SELECT table_schema,table_name,column_name,grantee,privilege_type FROM information_schema.role_column_grants WHERE table_schema='public' AND table_name='iglesias';
