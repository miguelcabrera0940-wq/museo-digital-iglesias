-- SOLO arnés temporal. Datos ficticios transaccionales, jamás una cuenta utilizable.
BEGIN;
DO $$ BEGIN
  IF (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relkind='r' AND c.relrowsecurity) <> 14 THEN
    RAISE EXCEPTION 'Faltan tablas RLS administrativas'; END IF;
  IF pg_has_role('iglesias_backend','iglesias_gestion','MEMBER') OR
     has_schema_privilege('iglesias_backend_admin','public','CREATE') OR
     has_database_privilege('iglesias_backend_admin',current_database(),'CREATE') OR
     pg_has_role('iglesias_backend_admin','iglesias_provision','MEMBER') OR
     has_table_privilege('iglesias_backend_admin','public.auth_user','INSERT') OR
     has_table_privilege('iglesias_backend_admin','public.administrador','INSERT') OR
     has_table_privilege('iglesias_backend_admin','public.paginas','UPDATE') OR
     has_table_privilege('iglesias_backend_admin','public.documentos','INSERT') OR
     has_table_privilege('iglesias_backend_admin','public.materiales','DELETE') OR
     has_column_privilege('iglesias_backend_admin','public.iglesias','nombre','UPDATE') OR
     has_column_privilege('iglesias_backend_admin','public.materiales','imagen_publica','UPDATE') OR
     has_column_privilege('iglesias_backend','public.materiales','descripcion_interna','SELECT') THEN
    RAISE EXCEPTION 'Permisos excesivos'; END IF;
END $$;
INSERT INTO public.auth_user(id,name,email) VALUES ('prueba-no-autenticable','Ejemplo','ejemplo@example.invalid');
INSERT INTO public.administrador(auth_user_id) VALUES ('prueba-no-autenticable');
DO $$ BEGIN
  BEGIN
    INSERT INTO public.auth_user(id,name,email) VALUES ('segunda','Ejemplo','otra@example.invalid');
    RAISE EXCEPTION 'Se permitió una segunda cuenta';
  EXCEPTION WHEN unique_violation THEN NULL; END;
  BEGIN
    INSERT INTO public.auth_account(id,"accountId","providerId","userId",password)
      VALUES ('cuenta','prueba-no-autenticable','social','prueba-no-autenticable','NO_ES_UN_HASH');
    RAISE EXCEPTION 'Se permitió proveedor no credential';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;
SET LOCAL ROLE iglesias_gestion;
UPDATE public.iglesias SET telefono=NULL WHERE slug='catedral';
INSERT INTO public.horarios(iglesia_id,dia_semana,hora,nota)
 VALUES ('00000000-0000-4000-8000-000000000001',0,'12:00','Ejemplo de prueba');
UPDATE public.tramites SET requisitos=ARRAY['Ejemplo de prueba'] WHERE tipo='otros';
DO $$ BEGIN
  BEGIN
    UPDATE public.materiales SET iglesia_id='00000000-0000-4000-8000-000000000002';
    RAISE EXCEPTION 'Se permitió mover materiales';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    UPDATE public.administrador SET activo=false;
    RAISE EXCEPTION 'Runtime puede cambiar el vínculo';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
ROLLBACK;
SELECT 'ADMIN_LOCAL_OK' AS resultado;
