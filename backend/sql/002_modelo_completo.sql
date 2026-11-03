-- REVISAR antes de aplicar. Ejecutar después de 001_iglesias.sql, una sola vez.
-- PostgreSQL estándar: no depende de un proveedor de autenticación ni conecta la API.
BEGIN;

CREATE TABLE public.categorias (
  id text PRIMARY KEY CHECK (id IN ('libros-documentos', 'objetos')),
  nombre text NOT NULL CHECK (char_length(btrim(nombre)) BETWEEN 1 AND 160)
);

CREATE TABLE public.materiales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iglesia_id uuid NOT NULL REFERENCES public.iglesias(id) ON DELETE RESTRICT,
  categoria_id text NOT NULL REFERENCES public.categorias(id) ON DELETE RESTRICT,
  tipo text NOT NULL CHECK (tipo IN ('libro', 'documento', 'objeto')),
  titulo text NOT NULL CHECK (char_length(btrim(titulo)) BETWEEN 1 AND 160),
  descripcion_publica text NOT NULL CHECK (char_length(btrim(descripcion_publica)) BETWEEN 1 AND 10000),
  descripcion_interna text CHECK (char_length(descripcion_interna) <= 10000),
  imagen_publica text CHECK (char_length(imagen_publica) <= 2000),
  visibilidad text NOT NULL CHECK (visibilidad IN ('publico', 'privado')),
  fuente text CHECK (char_length(fuente) <= 1000),
  es_ejemplo boolean NOT NULL DEFAULT true,
  CHECK ((tipo = 'objeto' AND categoria_id = 'objetos') OR
         (tipo IN ('libro', 'documento') AND categoria_id = 'libros-documentos'))
);
COMMENT ON COLUMN public.materiales.descripcion_publica IS
  'Descripción apta para publicación; en objetos contiene su historia, sin añadir campos a la API.';
COMMENT ON COLUMN public.materiales.imagen_publica IS
  'Fotografía/portada autorizada para publicación, nunca páginas o archivos privados.';
CREATE INDEX materiales_iglesia_categoria_idx ON public.materiales (iglesia_id, categoria_id, id);

CREATE TABLE public.documentos (
  material_id uuid PRIMARY KEY REFERENCES public.materiales(id) ON DELETE RESTRICT,
  titulo text NOT NULL CHECK (char_length(btrim(titulo)) BETWEEN 1 AND 160),
  es_ejemplo boolean NOT NULL DEFAULT true CHECK (es_ejemplo)
);
-- La visibilidad se obtiene siempre de materiales, sin duplicarla en documentos.
CREATE TABLE public.paginas (
  material_id uuid NOT NULL REFERENCES public.documentos(material_id) ON DELETE RESTRICT,
  numero integer NOT NULL CHECK (numero >= 1),
  texto text NOT NULL CHECK (char_length(btrim(texto)) BETWEEN 1 AND 10000),
  imagen_url text,
  PRIMARY KEY (material_id, numero),
  -- Beta de texto ficticio: evita enlaces públicos que evadan un cambio a privado.
  CHECK (imagen_url IS NULL)
);

CREATE TABLE public.horarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iglesia_id uuid NOT NULL REFERENCES public.iglesias(id) ON DELETE RESTRICT,
  dia_semana smallint NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora time without time zone NOT NULL CHECK (hora < time '24:00' AND extract(second FROM hora) = 0),
  nota text CHECK (char_length(nota) <= 2000),
  es_ejemplo boolean NOT NULL DEFAULT true
);
CREATE INDEX horarios_iglesia_dia_hora_idx ON public.horarios (iglesia_id, dia_semana, hora, id);

CREATE TABLE public.actividades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iglesia_id uuid NOT NULL REFERENCES public.iglesias(id) ON DELETE RESTRICT,
  tipo text NOT NULL CHECK (tipo IN ('misa', 'bautizo', 'boda', 'difuntos', 'visita', 'otro')),
  titulo text NOT NULL CHECK (char_length(btrim(titulo)) BETWEEN 1 AND 160),
  fecha date NOT NULL CHECK (fecha BETWEEN date '0001-01-01' AND date '9999-12-31'),
  hora_inicio time without time zone NOT NULL
    CHECK (hora_inicio < time '24:00' AND extract(second FROM hora_inicio) = 0),
  hora_fin time without time zone
    CHECK (hora_fin < time '24:00' AND extract(second FROM hora_fin) = 0),
  descripcion text NOT NULL CHECK (char_length(btrim(descripcion)) BETWEEN 1 AND 10000),
  nota_visitas text CHECK (char_length(nota_visitas) <= 2000),
  es_ejemplo boolean NOT NULL DEFAULT true,
  CHECK (hora_fin IS NULL OR hora_fin >= hora_inicio)
);
CREATE INDEX actividades_iglesia_fecha_hora_idx ON public.actividades (iglesia_id, fecha, hora_inicio, id);
COMMENT ON COLUMN public.actividades.fecha IS 'Fecha civil de America/Merida, sin conversión UTC.';
COMMENT ON COLUMN public.horarios.hora IS 'Hora civil HH:mm de America/Merida; dia_semana 0 domingo a 6 sábado.';

-- Función pura para validar cada elemento del array; sin SECURITY DEFINER ni acceso a datos.
CREATE FUNCTION public.requisitos_validos(valores text[]) RETURNS boolean
LANGUAGE sql IMMUTABLE SET search_path = pg_catalog AS $$
  SELECT valores IS NOT NULL AND cardinality(valores) <= 30
    AND (cardinality(valores) = 0 OR (array_ndims(valores) = 1 AND array_lower(valores, 1) = 1))
    AND NOT EXISTS (
      SELECT 1 FROM unnest(valores) AS elemento
      WHERE elemento IS NULL OR char_length(btrim(elemento)) = 0 OR char_length(elemento) > 1000
    );
$$;

CREATE TABLE public.tramites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iglesia_id uuid NOT NULL REFERENCES public.iglesias(id) ON DELETE RESTRICT,
  tipo text NOT NULL CHECK (tipo IN ('bautizos', 'bodas', 'misas_difuntos', 'otros')),
  titulo text NOT NULL CHECK (char_length(btrim(titulo)) BETWEEN 1 AND 160),
  requisitos text[] NOT NULL DEFAULT '{}' CHECK (public.requisitos_validos(requisitos)),
  fuente text CHECK (char_length(fuente) <= 1000),
  estado_verificacion text NOT NULL DEFAULT 'ejemplo'
    CHECK (estado_verificacion IN ('ejemplo', 'por_confirmar', 'verificado')),
  UNIQUE (iglesia_id, tipo)
);

CREATE TABLE public.administrador (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Columna interna: la constante única impide una segunda cuenta global.
  unico boolean NOT NULL DEFAULT true UNIQUE CHECK (unico)
);
COMMENT ON TABLE public.administrador IS
  'Reserva vacía para una cuenta global. Identidad y autenticación pendientes de adaptar; no concede acceso por sí sola.';

-- Sin permisos ni políticas implícitas. 004 añade exclusivamente lectura pública
-- para un rol PostgreSQL propio, sin acceso a notas internas o documentos privados.
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paginas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tramites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.administrador ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.iglesias, public.categorias, public.materiales,
  public.documentos, public.paginas, public.horarios, public.actividades,
  public.tramites, public.administrador FROM PUBLIC;
REVOKE ALL ON FUNCTION public.requisitos_validos(text[]) FROM PUBLIC;

COMMIT;
