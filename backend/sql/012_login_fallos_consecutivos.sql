-- Sustituye ventanas/cupos anteriores: aquellos contaban intentos, no fallos consecutivos.
-- Solo reinicia contadores técnicos obsoletos, nunca cuentas, contraseñas o sesiones.
BEGIN;
TRUNCATE public.login_limite;
ALTER TABLE public.login_limite DROP CONSTRAINT login_limite_pkey;
DROP INDEX public.login_limite_antiguos;
ALTER TABLE public.login_limite DROP COLUMN ventana_inicio;
ALTER TABLE public.login_limite RENAME COLUMN intentos TO fallos;
ALTER TABLE public.login_limite
  ADD PRIMARY KEY (clave_hmac),
  ADD COLUMN ultimo_fallo timestamptz,
  ADD COLUMN bloqueado_hasta timestamptz,
  ADD COLUMN actualizado_en timestamptz NOT NULL DEFAULT clock_timestamp(),
  ADD CONSTRAINT login_fallos_rango CHECK (fallos BETWEEN 0 AND 10),
  ADD CONSTRAINT login_secuencia_coherente CHECK (
    (fallos=0 AND ultimo_fallo IS NULL AND bloqueado_hasta IS NULL) OR
    (fallos BETWEEN 1 AND 4 AND ultimo_fallo IS NOT NULL AND bloqueado_hasta IS NULL) OR
    (fallos BETWEEN 5 AND 10 AND ultimo_fallo IS NOT NULL AND bloqueado_hasta>=ultimo_fallo AND bloqueado_hasta IS NOT NULL));
CREATE INDEX login_limite_limpieza ON public.login_limite(actualizado_en);
-- Mismos permisos/RLS de iglesias_auth, sin IP, correo en claro ni contraseñas.
COMMIT;
