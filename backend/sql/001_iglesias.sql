-- Neon/PostgreSQL: requiere revisión y autorización antes de ejecución remota.
-- Incremento 1 solamente. No configura autenticación ni crea cuentas administrativas.
-- Migración de una sola aplicación: si ya existe la tabla, abortar y revisar.
BEGIN;

CREATE TABLE public.iglesias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug IN ('catedral', 'tercera-orden', 'santa-lucia', 'santa-ana')),
  nombre text NOT NULL CHECK (char_length(btrim(nombre)) BETWEEN 1 AND 160),
  descripcion text NOT NULL CHECK (char_length(btrim(descripcion)) BETWEEN 1 AND 10000),
  historia text NOT NULL CHECK (char_length(btrim(historia)) BETWEEN 1 AND 10000),
  direccion text NOT NULL CHECK (char_length(btrim(direccion)) BETWEEN 1 AND 1000),
  latitud double precision NOT NULL CHECK (latitud BETWEEN -90 AND 90),
  longitud double precision NOT NULL CHECK (longitud BETWEEN -180 AND 180),
  telefono text CHECK (telefono IS NULL OR char_length(telefono) <= 40),
  foto_exterior text,
  foto_interior text,
  fuente text CHECK (fuente IS NULL OR char_length(fuente) <= 1000),
  es_ejemplo boolean NOT NULL DEFAULT true
);

-- Sin políticas para navegador: denegación por defecto, aun si se otorga SELECT.
ALTER TABLE public.iglesias ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.iglesias FROM PUBLIC;
-- Los permisos del rol propio de la API se definen en 004_acceso_publico.sql.

-- Semillas ficticias; nombres y coordenadas aprobados. No hay datos privados.
INSERT INTO public.iglesias (id, slug, nombre, descripcion, latitud, longitud, historia, direccion, telefono, foto_exterior, foto_interior, fuente, es_ejemplo) VALUES
  ('00000000-0000-4000-8000-000000000001', 'catedral', 'Catedral de San Ildefonso', 'Descripción de demostración de la Catedral.', 20.96715, -89.62254, 'Texto de demostración. La historia verificada, con su fuente, se cargará desde la administración.', 'Centro Histórico, Mérida, Yucatán, México', NULL, NULL, NULL, NULL, true),
  ('00000000-0000-4000-8000-000000000002', 'tercera-orden', 'Iglesia de Jesús o Tercera Orden', 'Descripción de demostración de la Iglesia de Jesús.', 20.96878, -89.6224, 'Texto de demostración. La historia verificada, con su fuente, se cargará desde la administración.', 'Centro Histórico, Mérida, Yucatán, México', NULL, NULL, NULL, NULL, true),
  ('00000000-0000-4000-8000-000000000003', 'santa-lucia', 'Iglesia de Santa Lucía', 'Descripción de demostración de la Iglesia de Santa Lucía.', 20.97103, -89.62192, 'Texto de demostración. La historia verificada, con su fuente, se cargará desde la administración.', 'Centro Histórico, Mérida, Yucatán, México', NULL, NULL, NULL, NULL, true),
  ('00000000-0000-4000-8000-000000000004', 'santa-ana', 'Iglesia de Santa Ana', 'Descripción de demostración de la Iglesia de Santa Ana.', 20.9765, -89.62097, 'Texto de demostración. La historia verificada, con su fuente, se cargará desde la administración.', 'Centro Histórico, Mérida, Yucatán, México', NULL, NULL, NULL, NULL, true);

COMMIT;
