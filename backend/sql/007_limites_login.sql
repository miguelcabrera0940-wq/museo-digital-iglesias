-- Sin IP/email en claro. Consumo de ambas claves bajo bloqueo en una transacción.
BEGIN;
CREATE TABLE public.login_limite (
  clave_hmac text NOT NULL CHECK (clave_hmac ~ '^[a-f0-9]{64}$'),
  ventana_inicio timestamptz NOT NULL,
  intentos integer NOT NULL DEFAULT 0 CHECK (intentos>=0),
  PRIMARY KEY (clave_hmac,ventana_inicio)
);
CREATE INDEX login_limite_antiguos ON public.login_limite (ventana_inicio);
ALTER TABLE public.login_limite ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.login_limite FROM PUBLIC;
COMMIT;
