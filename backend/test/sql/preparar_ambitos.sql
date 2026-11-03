-- SOLO clúster temporal; identidades no autenticables, ninguna credencial real.
CREATE SCHEMA prueba_ambitos;
INSERT INTO public.auth_user(id,name,email) VALUES ('general-prueba','Ejemplo','general@example.invalid');
INSERT INTO public.auth_account(id,"accountId","providerId","userId",password)
 VALUES ('credencial-prueba','general-prueba','credential','general-prueba','HASH_NO_AUTENTICABLE_SOLO_PRUEBA');
INSERT INTO public.auth_session(id,"expiresAt",token,"userId")
 VALUES ('sesion-prueba',now()+interval '8 hours','SESION_LOCAL_NO_USABLE','general-prueba');
INSERT INTO public.administrador(auth_user_id) VALUES ('general-prueba');
CREATE TABLE prueba_ambitos.general AS SELECT to_jsonb(t) AS fila FROM public.administrador t;
CREATE TABLE prueba_ambitos.datos AS SELECT nombre,contenido FROM (VALUES
 ('auth_user',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM public.auth_user t)),
 ('auth_account',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM public.auth_account t)),
 ('auth_session',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM public.auth_session t)),
 ('iglesias',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM public.iglesias t)),
 ('materiales',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM public.materiales t)),
 ('documentos',(SELECT jsonb_agg(to_jsonb(t) ORDER BY material_id) FROM public.documentos t)),
 ('paginas',(SELECT jsonb_agg(to_jsonb(t) ORDER BY material_id,numero) FROM public.paginas t))
 ) AS t(nombre,contenido);
CREATE TABLE prueba_ambitos.guias AS SELECT * FROM public.tramites;
INSERT INTO public.login_limite VALUES (repeat('a',64),now(),4);
