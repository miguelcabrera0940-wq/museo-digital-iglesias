-- Fase 2. Revisar y ejecutar UNA VEZ tras 008, nunca reejecutar 001–008.
-- No cambia identidades, contenido, es_ejemplo, cuenta, sesiones, GRANT ni RLS.
BEGIN;
LOCK TABLE public.iglesias IN ACCESS EXCLUSIVE MODE;
ALTER TABLE public.iglesias ADD COLUMN estado text, ADD COLUMN ciudad text;
UPDATE public.iglesias SET estado='yucatan',ciudad='Mérida'
  WHERE slug IN ('catedral','tercera-orden','santa-lucia','santa-ana');
ALTER TABLE public.iglesias
  ALTER COLUMN estado SET NOT NULL, ALTER COLUMN ciudad SET NOT NULL,
  ADD CONSTRAINT iglesias_estado_ciudad_check CHECK (
    (estado='yucatan' AND ciudad='Mérida') OR
    (estado='campeche' AND ciudad='San Francisco de Campeche') OR
    (estado='puebla' AND ciudad='Puebla de Zaragoza')),
  DROP CONSTRAINT iglesias_slug_check,
  ADD CONSTRAINT iglesias_slug_check CHECK (slug IN (
    'catedral','tercera-orden','santa-lucia','santa-ana',
    'catedral-campeche','dulce-nombre-jesus','catedral-puebla','la-compania')),
  DROP CONSTRAINT iglesias_descripcion_check,
  ADD CONSTRAINT iglesias_descripcion_check CHECK (
    descripcion='' OR char_length(btrim(descripcion)) BETWEEN 1 AND 10000),
  DROP CONSTRAINT iglesias_historia_check,
  ADD CONSTRAINT iglesias_historia_check CHECK (
    historia='' OR char_length(btrim(historia)) BETWEEN 1 AND 10000),
  DROP CONSTRAINT iglesias_direccion_check,
  ADD CONSTRAINT iglesias_direccion_check CHECK (
    direccion='' OR char_length(btrim(direccion)) BETWEEN 1 AND 1000);
COMMENT ON COLUMN public.iglesias.estado IS 'Clave API: yucatan, campeche o puebla. Metadato de catálogo no editable por cliente.';
COMMENT ON COLUMN public.iglesias.ciudad IS 'Nombre de ciudad del catálogo aprobado. Metadato no editable por cliente.';
-- SELECT de iglesias_api/iglesias_gestion ya es por tabla y cubre las columnas nuevas.
-- UPDATE administrativo sigue limitado a historia, descripcion y telefono.
COMMIT;
