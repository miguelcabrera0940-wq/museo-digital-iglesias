-- Generado desde data/iglesias-fase2.json. Revisar después de 009.
-- UNA VEZ, en transacción: un conflicto aborta, nunca sobrescribe datos existentes.
-- Información pendiente: texto vacío, teléfonos/fotos NULL, sin contenido histórico inventado.
BEGIN;
INSERT INTO public.iglesias (id,slug,estado,ciudad,nombre,latitud,longitud,fuente,descripcion,historia,direccion,telefono,foto_exterior,foto_interior,es_ejemplo) VALUES
  ('00000000-0000-4000-8000-000000000005','catedral-campeche','campeche','San Francisco de Campeche','Catedral de Nuestra Señora de la Purísima Concepción',19.84619,-90.53616,'Ubicación aprobada en MEJORAS_FASE_2.md: https://mapcarta.com/W160092168','','','',NULL,NULL,NULL,true),
  ('00000000-0000-4000-8000-000000000006','dulce-nombre-jesus','campeche','San Francisco de Campeche','Templo del Dulce Nombre de Jesús',19.84499,-90.53574,'Ubicación aprobada en MEJORAS_FASE_2.md: https://mapcarta.com/W552205116 ; https://catalogonacionalmhi.inah.gob.mx/consulta_publica/detalle/2226','','','',NULL,NULL,NULL,true),
  ('00000000-0000-4000-8000-000000000007','catedral-puebla','puebla','Puebla de Zaragoza','Catedral de Puebla',19.04285,-98.19839,'Ubicación aprobada en MEJORAS_FASE_2.md: https://mapcarta.com/W1113187115','','','',NULL,NULL,NULL,true),
  ('00000000-0000-4000-8000-000000000008','la-compania','puebla','Puebla de Zaragoza','Templo del Espíritu Santo (La Compañía)',19.04257,-98.1954,'Punto cartográfico del edificio, no entrada validada; consultado 2026-10-30: https://mapcarta.com/W525267034 ; https://www.wikidata.org/wiki/Q6141059 . Identidad/dirección: INAH I-0012104573, https://catalogonacionalmhi.inah.gob.mx/consulta_publica/detalle/54277 (índice de búsqueda; ficha directa 502).','','','',NULL,NULL,NULL,true);
-- Cuatro guías vacías para poder editarlas con PATCH existente; no requisitos inventados.
INSERT INTO public.tramites (iglesia_id,tipo,titulo,requisitos,fuente,estado_verificacion)
SELECT i.id,t.tipo,t.titulo,'{}'::text[],NULL,'por_confirmar'
FROM public.iglesias i CROSS JOIN (VALUES
  ('bautizos','Bautizos'),('bodas','Bodas'),('misas_difuntos','Misas por difuntos'),('otros','Otros')) AS t(tipo,titulo)
WHERE i.slug IN ('catedral-campeche','dulce-nombre-jesus','catedral-puebla','la-compania');
-- Materiales, documentos, páginas, horarios y actividades nuevos permanecen vacíos.
-- Sin UPDATE de Mérida, usuarios, cuenta global, sesiones, roles ni políticas.
COMMIT;
