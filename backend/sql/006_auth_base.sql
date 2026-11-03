-- Revisar y ejecutar UNA VEZ después de 005. No contiene identidades ni secretos.
-- Esquema Better Auth 1.7.13; nombres de columna canónicos entre comillas.
BEGIN;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM public.administrador) THEN
    RAISE EXCEPTION 'La reserva administrador debe estar vacía antes de 006';
  END IF;
END $$;
CREATE TABLE public.auth_user (
  id text PRIMARY KEY, name text NOT NULL, email text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false, image text,
  "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CHECK (email=lower(email) AND char_length(email)<=254)
);
CREATE UNIQUE INDEX auth_usuario_unico ON public.auth_user ((true));
CREATE TABLE public.auth_session (
  id text PRIMARY KEY, "expiresAt" timestamptz NOT NULL, token text NOT NULL UNIQUE,
  "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "ipAddress" text, "userAgent" text,
  "userId" text NOT NULL REFERENCES public.auth_user(id) ON DELETE CASCADE
);
CREATE INDEX auth_session_usuario ON public.auth_session ("userId");
CREATE INDEX auth_session_caducidad ON public.auth_session ("expiresAt");
CREATE TABLE public.auth_account (
  id text PRIMARY KEY, "accountId" text NOT NULL,
  "providerId" text NOT NULL CHECK ("providerId"='credential'),
  "userId" text NOT NULL REFERENCES public.auth_user(id) ON DELETE CASCADE,
  "accessToken" text, "refreshToken" text, "idToken" text,
  "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz,
  scope text, password text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("providerId","accountId"), UNIQUE ("userId"), CHECK ("accountId"="userId")
);
CREATE TABLE public.auth_verification (
  id text PRIMARY KEY, identifier text NOT NULL, value text NOT NULL,
  "expiresAt" timestamptz NOT NULL, "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX auth_verification_identificador ON public.auth_verification (identifier);
ALTER TABLE public.administrador
  ADD COLUMN auth_user_id text NOT NULL UNIQUE REFERENCES public.auth_user(id) ON DELETE RESTRICT,
  ADD COLUMN activo boolean NOT NULL DEFAULT true;
ALTER TABLE public.auth_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_account ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_verification ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.auth_user, public.auth_session, public.auth_account, public.auth_verification FROM PUBLIC;
COMMIT;
