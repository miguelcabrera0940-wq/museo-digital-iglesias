-- REVISABLE: ejecutar una vez como propietario de Neon, solo con autorización.
-- Es un login técnico de BD, NO autenticación administrativa de la aplicación.
BEGIN;
CREATE ROLE iglesias_backend LOGIN INHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE
  NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 5;
GRANT iglesias_api TO iglesias_backend;
-- Sin contraseña en este archivo: asignarla privadamente con psql \password.
-- Conceder CONNECT a la base seleccionada sin asumir su nombre.
DO $$
BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO iglesias_backend', current_database());
END;
$$;
COMMIT;
