-- REVISAR. Semillas ficticias; ejecutar una sola vez tras 001 y 002, como propietario de la base.

-- Generado desde datos locales: node backend/sql/generar_semillas.js

-- Iglesias ya incluidas en 001. Sin autenticación ni administrador. Sin archivos PDF.

BEGIN;

SET LOCAL standard_conforming_strings = on;

INSERT INTO public.categorias (id, nombre) VALUES
  ('libros-documentos', 'Libros y documentos'),
  ('objetos', 'Objetos');


INSERT INTO public.materiales (id, iglesia_id, categoria_id, tipo, titulo, descripcion_publica, descripcion_interna, imagen_publica, visibilidad, fuente, es_ejemplo) VALUES
  ('20000000-0000-4000-8000-000000000000', '00000000-0000-4000-8000-000000000001', 'libros-documentos', 'libro', 'Crónica ficticia de la parroquia', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'libros-documentos', 'libro', 'Registro de ejemplo de festividades', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'libros-documentos', 'documento', 'Carta ficticia de fundación', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'libros-documentos', 'libro', 'Libro reservado de ejemplo', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'privado', NULL, true),
  ('20000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', 'libros-documentos', 'libro', 'Álbum de muestra aún sin digitalizar', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000001', 'libros-documentos', 'documento', 'Documento reservado de ejemplo', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'privado', NULL, true),
  ('20000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000001', 'objetos', 'objeto', 'Cáliz de ejemplo', 'Historia de demostración de este objeto ficticio. No representa una pieza ni información histórica real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000001', 'objetos', 'objeto', 'Campana de muestra', 'Historia de demostración de este objeto ficticio. No representa una pieza ni información histórica real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000001', 'objetos', 'objeto', 'Pieza reservada de ejemplo', 'Historia de demostración de este objeto ficticio. No representa una pieza ni información histórica real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'privado', NULL, true),
  ('20000000-0000-4000-8000-000000000100', '00000000-0000-4000-8000-000000000002', 'libros-documentos', 'libro', 'Crónica ficticia de la parroquia', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000002', 'libros-documentos', 'libro', 'Registro de ejemplo de festividades', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000002', 'libros-documentos', 'documento', 'Carta ficticia de fundación', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000002', 'libros-documentos', 'libro', 'Libro reservado de ejemplo', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'privado', NULL, true),
  ('20000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000002', 'libros-documentos', 'libro', 'Álbum de muestra aún sin digitalizar', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000002', 'libros-documentos', 'documento', 'Documento reservado de ejemplo', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'privado', NULL, true),
  ('20000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000002', 'objetos', 'objeto', 'Cáliz de ejemplo', 'Historia de demostración de este objeto ficticio. No representa una pieza ni información histórica real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000002', 'objetos', 'objeto', 'Campana de muestra', 'Historia de demostración de este objeto ficticio. No representa una pieza ni información histórica real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000108', '00000000-0000-4000-8000-000000000002', 'objetos', 'objeto', 'Pieza reservada de ejemplo', 'Historia de demostración de este objeto ficticio. No representa una pieza ni información histórica real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'privado', NULL, true),
  ('20000000-0000-4000-8000-000000000200', '00000000-0000-4000-8000-000000000003', 'libros-documentos', 'libro', 'Crónica ficticia de la parroquia', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000003', 'libros-documentos', 'libro', 'Registro de ejemplo de festividades', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000003', 'libros-documentos', 'documento', 'Carta ficticia de fundación', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000003', 'libros-documentos', 'libro', 'Libro reservado de ejemplo', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'privado', NULL, true),
  ('20000000-0000-4000-8000-000000000204', '00000000-0000-4000-8000-000000000003', 'libros-documentos', 'libro', 'Álbum de muestra aún sin digitalizar', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000205', '00000000-0000-4000-8000-000000000003', 'libros-documentos', 'documento', 'Documento reservado de ejemplo', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'privado', NULL, true),
  ('20000000-0000-4000-8000-000000000206', '00000000-0000-4000-8000-000000000003', 'objetos', 'objeto', 'Cáliz de ejemplo', 'Historia de demostración de este objeto ficticio. No representa una pieza ni información histórica real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000207', '00000000-0000-4000-8000-000000000003', 'objetos', 'objeto', 'Campana de muestra', 'Historia de demostración de este objeto ficticio. No representa una pieza ni información histórica real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000208', '00000000-0000-4000-8000-000000000003', 'objetos', 'objeto', 'Pieza reservada de ejemplo', 'Historia de demostración de este objeto ficticio. No representa una pieza ni información histórica real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'privado', NULL, true),
  ('20000000-0000-4000-8000-000000000300', '00000000-0000-4000-8000-000000000004', 'libros-documentos', 'libro', 'Crónica ficticia de la parroquia', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000004', 'libros-documentos', 'libro', 'Registro de ejemplo de festividades', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000004', 'libros-documentos', 'documento', 'Carta ficticia de fundación', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000004', 'libros-documentos', 'libro', 'Libro reservado de ejemplo', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'privado', NULL, true),
  ('20000000-0000-4000-8000-000000000304', '00000000-0000-4000-8000-000000000004', 'libros-documentos', 'libro', 'Álbum de muestra aún sin digitalizar', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000305', '00000000-0000-4000-8000-000000000004', 'libros-documentos', 'documento', 'Documento reservado de ejemplo', 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'privado', NULL, true),
  ('20000000-0000-4000-8000-000000000306', '00000000-0000-4000-8000-000000000004', 'objetos', 'objeto', 'Cáliz de ejemplo', 'Historia de demostración de este objeto ficticio. No representa una pieza ni información histórica real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000307', '00000000-0000-4000-8000-000000000004', 'objetos', 'objeto', 'Campana de muestra', 'Historia de demostración de este objeto ficticio. No representa una pieza ni información histórica real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'publico', NULL, true),
  ('20000000-0000-4000-8000-000000000308', '00000000-0000-4000-8000-000000000004', 'objetos', 'objeto', 'Pieza reservada de ejemplo', 'Historia de demostración de este objeto ficticio. No representa una pieza ni información histórica real.', 'Nota interna ficticia, exclusiva del servidor.', NULL, 'privado', NULL, true);


INSERT INTO public.documentos (material_id, titulo, es_ejemplo) VALUES
  ('20000000-0000-4000-8000-000000000000', 'Crónica ficticia de la parroquia', true),
  ('20000000-0000-4000-8000-000000000001', 'Registro de ejemplo de festividades', true),
  ('20000000-0000-4000-8000-000000000002', 'Carta ficticia de fundación', true),
  ('20000000-0000-4000-8000-000000000003', 'Libro reservado de ejemplo', true),
  ('20000000-0000-4000-8000-000000000005', 'Documento reservado de ejemplo', true),
  ('20000000-0000-4000-8000-000000000100', 'Crónica ficticia de la parroquia', true),
  ('20000000-0000-4000-8000-000000000101', 'Registro de ejemplo de festividades', true),
  ('20000000-0000-4000-8000-000000000102', 'Carta ficticia de fundación', true),
  ('20000000-0000-4000-8000-000000000103', 'Libro reservado de ejemplo', true),
  ('20000000-0000-4000-8000-000000000105', 'Documento reservado de ejemplo', true),
  ('20000000-0000-4000-8000-000000000200', 'Crónica ficticia de la parroquia', true),
  ('20000000-0000-4000-8000-000000000201', 'Registro de ejemplo de festividades', true),
  ('20000000-0000-4000-8000-000000000202', 'Carta ficticia de fundación', true),
  ('20000000-0000-4000-8000-000000000203', 'Libro reservado de ejemplo', true),
  ('20000000-0000-4000-8000-000000000205', 'Documento reservado de ejemplo', true),
  ('20000000-0000-4000-8000-000000000300', 'Crónica ficticia de la parroquia', true),
  ('20000000-0000-4000-8000-000000000301', 'Registro de ejemplo de festividades', true),
  ('20000000-0000-4000-8000-000000000302', 'Carta ficticia de fundación', true),
  ('20000000-0000-4000-8000-000000000303', 'Libro reservado de ejemplo', true),
  ('20000000-0000-4000-8000-000000000305', 'Documento reservado de ejemplo', true);


INSERT INTO public.paginas (material_id, numero, texto, imagen_url) VALUES
  ('20000000-0000-4000-8000-000000000000', 1, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 1.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000000', 2, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 2.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000000', 3, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 3.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000000', 4, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 4.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000000', 5, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 5.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000000', 6, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 6.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000000', 7, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 7.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000001', 1, 'Texto público ficticio de «Registro de ejemplo de festividades», página 1.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000001', 2, 'Texto público ficticio de «Registro de ejemplo de festividades», página 2.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000001', 3, 'Texto público ficticio de «Registro de ejemplo de festividades», página 3.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000001', 4, 'Texto público ficticio de «Registro de ejemplo de festividades», página 4.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000001', 5, 'Texto público ficticio de «Registro de ejemplo de festividades», página 5.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000001', 6, 'Texto público ficticio de «Registro de ejemplo de festividades», página 6.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000001', 7, 'Texto público ficticio de «Registro de ejemplo de festividades», página 7.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000002', 1, 'Texto público ficticio de «Carta ficticia de fundación», página 1.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000002', 2, 'Texto público ficticio de «Carta ficticia de fundación», página 2.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000002', 3, 'Texto público ficticio de «Carta ficticia de fundación», página 3.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000002', 4, 'Texto público ficticio de «Carta ficticia de fundación», página 4.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000002', 5, 'Texto público ficticio de «Carta ficticia de fundación», página 5.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000002', 6, 'Texto público ficticio de «Carta ficticia de fundación», página 6.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000002', 7, 'Texto público ficticio de «Carta ficticia de fundación», página 7.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000003', 1, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 1.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000003', 2, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 2.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000003', 3, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 3.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000003', 4, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 4.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000003', 5, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 5.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000003', 6, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 6.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000003', 7, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 7.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000005', 1, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 1.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000005', 2, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 2.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000005', 3, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 3.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000005', 4, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 4.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000005', 5, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 5.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000005', 6, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 6.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000005', 7, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 7.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000100', 1, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 1.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000100', 2, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 2.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000100', 3, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 3.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000100', 4, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 4.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000100', 5, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 5.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000100', 6, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 6.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000100', 7, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 7.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000101', 1, 'Texto público ficticio de «Registro de ejemplo de festividades», página 1.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000101', 2, 'Texto público ficticio de «Registro de ejemplo de festividades», página 2.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000101', 3, 'Texto público ficticio de «Registro de ejemplo de festividades», página 3.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000101', 4, 'Texto público ficticio de «Registro de ejemplo de festividades», página 4.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000101', 5, 'Texto público ficticio de «Registro de ejemplo de festividades», página 5.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000101', 6, 'Texto público ficticio de «Registro de ejemplo de festividades», página 6.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000101', 7, 'Texto público ficticio de «Registro de ejemplo de festividades», página 7.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000102', 1, 'Texto público ficticio de «Carta ficticia de fundación», página 1.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000102', 2, 'Texto público ficticio de «Carta ficticia de fundación», página 2.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000102', 3, 'Texto público ficticio de «Carta ficticia de fundación», página 3.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000102', 4, 'Texto público ficticio de «Carta ficticia de fundación», página 4.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000102', 5, 'Texto público ficticio de «Carta ficticia de fundación», página 5.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000102', 6, 'Texto público ficticio de «Carta ficticia de fundación», página 6.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000102', 7, 'Texto público ficticio de «Carta ficticia de fundación», página 7.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000103', 1, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 1.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000103', 2, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 2.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000103', 3, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 3.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000103', 4, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 4.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000103', 5, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 5.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000103', 6, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 6.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000103', 7, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 7.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000105', 1, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 1.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000105', 2, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 2.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000105', 3, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 3.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000105', 4, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 4.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000105', 5, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 5.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000105', 6, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 6.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000105', 7, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 7.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000200', 1, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 1.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000200', 2, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 2.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000200', 3, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 3.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000200', 4, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 4.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000200', 5, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 5.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000200', 6, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 6.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000200', 7, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 7.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000201', 1, 'Texto público ficticio de «Registro de ejemplo de festividades», página 1.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000201', 2, 'Texto público ficticio de «Registro de ejemplo de festividades», página 2.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000201', 3, 'Texto público ficticio de «Registro de ejemplo de festividades», página 3.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000201', 4, 'Texto público ficticio de «Registro de ejemplo de festividades», página 4.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000201', 5, 'Texto público ficticio de «Registro de ejemplo de festividades», página 5.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000201', 6, 'Texto público ficticio de «Registro de ejemplo de festividades», página 6.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000201', 7, 'Texto público ficticio de «Registro de ejemplo de festividades», página 7.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000202', 1, 'Texto público ficticio de «Carta ficticia de fundación», página 1.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000202', 2, 'Texto público ficticio de «Carta ficticia de fundación», página 2.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000202', 3, 'Texto público ficticio de «Carta ficticia de fundación», página 3.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000202', 4, 'Texto público ficticio de «Carta ficticia de fundación», página 4.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000202', 5, 'Texto público ficticio de «Carta ficticia de fundación», página 5.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000202', 6, 'Texto público ficticio de «Carta ficticia de fundación», página 6.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000202', 7, 'Texto público ficticio de «Carta ficticia de fundación», página 7.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000203', 1, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 1.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000203', 2, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 2.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000203', 3, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 3.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000203', 4, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 4.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000203', 5, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 5.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000203', 6, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 6.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000203', 7, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 7.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000205', 1, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 1.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000205', 2, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 2.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000205', 3, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 3.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000205', 4, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 4.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000205', 5, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 5.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000205', 6, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 6.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000205', 7, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 7.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000300', 1, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 1.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000300', 2, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 2.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000300', 3, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 3.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000300', 4, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 4.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000300', 5, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 5.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000300', 6, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 6.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000300', 7, 'Texto público ficticio de «Crónica ficticia de la parroquia», página 7.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000301', 1, 'Texto público ficticio de «Registro de ejemplo de festividades», página 1.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000301', 2, 'Texto público ficticio de «Registro de ejemplo de festividades», página 2.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000301', 3, 'Texto público ficticio de «Registro de ejemplo de festividades», página 3.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000301', 4, 'Texto público ficticio de «Registro de ejemplo de festividades», página 4.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000301', 5, 'Texto público ficticio de «Registro de ejemplo de festividades», página 5.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000301', 6, 'Texto público ficticio de «Registro de ejemplo de festividades», página 6.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000301', 7, 'Texto público ficticio de «Registro de ejemplo de festividades», página 7.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000302', 1, 'Texto público ficticio de «Carta ficticia de fundación», página 1.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000302', 2, 'Texto público ficticio de «Carta ficticia de fundación», página 2.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000302', 3, 'Texto público ficticio de «Carta ficticia de fundación», página 3.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000302', 4, 'Texto público ficticio de «Carta ficticia de fundación», página 4.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000302', 5, 'Texto público ficticio de «Carta ficticia de fundación», página 5.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000302', 6, 'Texto público ficticio de «Carta ficticia de fundación», página 6.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000302', 7, 'Texto público ficticio de «Carta ficticia de fundación», página 7.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000303', 1, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 1.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000303', 2, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 2.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000303', 3, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 3.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000303', 4, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 4.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000303', 5, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 5.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000303', 6, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 6.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000303', 7, 'Contenido reservado ficticio de «Libro reservado de ejemplo», página 7.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000305', 1, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 1.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000305', 2, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 2.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000305', 3, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 3.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000305', 4, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 4.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000305', 5, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 5.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000305', 6, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 6.

Ejemplo de demostración sin datos parroquiales reales.', NULL),
  ('20000000-0000-4000-8000-000000000305', 7, 'Contenido reservado ficticio de «Documento reservado de ejemplo», página 7.

Ejemplo de demostración sin datos parroquiales reales.', NULL);


INSERT INTO public.horarios (id, iglesia_id, dia_semana, hora, nota, es_ejemplo) VALUES
  ('30000000-0000-4000-8000-000000000000', '00000000-0000-4000-8000-000000000001', 0, '08:00', 'Horario dominical de demostración, no verificado.', true),
  ('30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 0, '10:00', 'Horario dominical de demostración, no verificado.', true),
  ('30000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 0, '19:00', 'Horario dominical de demostración, no verificado.', true),
  ('30000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 1, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', 1, '19:00', NULL, true),
  ('30000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000001', 2, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000001', 2, '19:00', NULL, true),
  ('30000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000001', 3, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000001', 3, '19:00', NULL, true),
  ('30000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-000000000001', 4, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000001', 4, '19:00', NULL, true),
  ('30000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', 5, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000001', 5, '19:00', NULL, true),
  ('30000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-000000000001', 6, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000000001', 6, '19:00', NULL, true),
  ('30000000-0000-4000-8000-000000000100', '00000000-0000-4000-8000-000000000002', 0, '08:00', 'Horario dominical de demostración, no verificado.', true),
  ('30000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000002', 0, '10:00', 'Horario dominical de demostración, no verificado.', true),
  ('30000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000002', 0, '18:30', 'Horario dominical de demostración, no verificado.', true),
  ('30000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000002', 1, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000002', 1, '18:30', NULL, true),
  ('30000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000002', 2, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000002', 2, '18:30', NULL, true),
  ('30000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000002', 3, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000108', '00000000-0000-4000-8000-000000000002', 3, '18:30', NULL, true),
  ('30000000-0000-4000-8000-000000000109', '00000000-0000-4000-8000-000000000002', 4, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000110', '00000000-0000-4000-8000-000000000002', 4, '18:30', NULL, true),
  ('30000000-0000-4000-8000-000000000111', '00000000-0000-4000-8000-000000000002', 5, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000112', '00000000-0000-4000-8000-000000000002', 5, '18:30', NULL, true),
  ('30000000-0000-4000-8000-000000000113', '00000000-0000-4000-8000-000000000002', 6, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000114', '00000000-0000-4000-8000-000000000002', 6, '18:30', NULL, true),
  ('30000000-0000-4000-8000-000000000200', '00000000-0000-4000-8000-000000000003', 0, '08:00', 'Horario dominical de demostración, no verificado.', true),
  ('30000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000003', 0, '10:00', 'Horario dominical de demostración, no verificado.', true),
  ('30000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000003', 0, '18:00', 'Horario dominical de demostración, no verificado.', true),
  ('30000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000003', 2, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000204', '00000000-0000-4000-8000-000000000003', 2, '18:00', NULL, true),
  ('30000000-0000-4000-8000-000000000205', '00000000-0000-4000-8000-000000000003', 3, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000206', '00000000-0000-4000-8000-000000000003', 3, '18:00', NULL, true),
  ('30000000-0000-4000-8000-000000000207', '00000000-0000-4000-8000-000000000003', 4, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000208', '00000000-0000-4000-8000-000000000003', 4, '18:00', NULL, true),
  ('30000000-0000-4000-8000-000000000209', '00000000-0000-4000-8000-000000000003', 5, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000210', '00000000-0000-4000-8000-000000000003', 5, '18:00', NULL, true),
  ('30000000-0000-4000-8000-000000000211', '00000000-0000-4000-8000-000000000003', 6, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000212', '00000000-0000-4000-8000-000000000003', 6, '18:00', NULL, true),
  ('30000000-0000-4000-8000-000000000300', '00000000-0000-4000-8000-000000000004', 0, '08:00', 'Horario dominical de demostración, no verificado.', true),
  ('30000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000004', 0, '10:00', 'Horario dominical de demostración, no verificado.', true),
  ('30000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000004', 0, '17:30', 'Horario dominical de demostración, no verificado.', true),
  ('30000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000004', 1, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000304', '00000000-0000-4000-8000-000000000004', 1, '17:30', NULL, true),
  ('30000000-0000-4000-8000-000000000305', '00000000-0000-4000-8000-000000000004', 2, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000306', '00000000-0000-4000-8000-000000000004', 2, '17:30', NULL, true),
  ('30000000-0000-4000-8000-000000000307', '00000000-0000-4000-8000-000000000004', 3, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000308', '00000000-0000-4000-8000-000000000004', 3, '17:30', NULL, true),
  ('30000000-0000-4000-8000-000000000309', '00000000-0000-4000-8000-000000000004', 4, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000310', '00000000-0000-4000-8000-000000000004', 4, '17:30', NULL, true),
  ('30000000-0000-4000-8000-000000000311', '00000000-0000-4000-8000-000000000004', 5, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000312', '00000000-0000-4000-8000-000000000004', 5, '17:30', NULL, true),
  ('30000000-0000-4000-8000-000000000313', '00000000-0000-4000-8000-000000000004', 6, '07:00', NULL, true),
  ('30000000-0000-4000-8000-000000000314', '00000000-0000-4000-8000-000000000004', 6, '17:30', NULL, true);


INSERT INTO public.actividades (id, iglesia_id, tipo, titulo, fecha, hora_inicio, hora_fin, descripcion, nota_visitas, es_ejemplo) VALUES
  ('40000000-0000-4000-8000-000000000000', '00000000-0000-4000-8000-000000000001', 'visita', 'Visita guiada de ejemplo', '2026-10-24', '10:00', '12:00', 'Recorrido ficticio de demostración; no es una convocatoria real.', 'Nota de ejemplo: la disponibilidad de visita está por confirmar.', true),
  ('40000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'bautizo', 'Bautizos de demostración', '2026-10-24', '12:30', NULL, 'Celebración ficticia, sin inscripciones ni datos personales.', NULL, true),
  ('40000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'difuntos', 'Misa por difuntos de ejemplo', '2026-10-25', '17:00', '18:00', 'Evento ficticio con fecha concreta, independiente del horario habitual.', NULL, true),
  ('40000000-0000-4000-8000-000000000100', '00000000-0000-4000-8000-000000000002', 'visita', 'Visita guiada de ejemplo', '2026-10-24', '10:00', '12:00', 'Recorrido ficticio de demostración; no es una convocatoria real.', 'Nota de ejemplo: la disponibilidad de visita está por confirmar.', true),
  ('40000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000002', 'bautizo', 'Bautizos de demostración', '2026-10-24', '12:30', NULL, 'Celebración ficticia, sin inscripciones ni datos personales.', NULL, true),
  ('40000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000002', 'difuntos', 'Misa por difuntos de ejemplo', '2026-10-25', '17:00', '18:00', 'Evento ficticio con fecha concreta, independiente del horario habitual.', NULL, true),
  ('40000000-0000-4000-8000-000000000200', '00000000-0000-4000-8000-000000000003', 'visita', 'Visita guiada de ejemplo', '2026-10-24', '10:00', '12:00', 'Recorrido ficticio de demostración; no es una convocatoria real.', 'Nota de ejemplo: la disponibilidad de visita está por confirmar.', true),
  ('40000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000003', 'bautizo', 'Bautizos de demostración', '2026-10-24', '12:30', NULL, 'Celebración ficticia, sin inscripciones ni datos personales.', NULL, true),
  ('40000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000003', 'difuntos', 'Misa por difuntos de ejemplo', '2026-10-25', '17:00', '18:00', 'Evento ficticio con fecha concreta, independiente del horario habitual.', NULL, true),
  ('40000000-0000-4000-8000-000000000300', '00000000-0000-4000-8000-000000000004', 'visita', 'Visita guiada de ejemplo', '2026-10-24', '10:00', '12:00', 'Recorrido ficticio de demostración; no es una convocatoria real.', 'Nota de ejemplo: la disponibilidad de visita está por confirmar.', true),
  ('40000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000004', 'bautizo', 'Bautizos de demostración', '2026-10-24', '12:30', NULL, 'Celebración ficticia, sin inscripciones ni datos personales.', NULL, true),
  ('40000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000004', 'difuntos', 'Misa por difuntos de ejemplo', '2026-10-25', '17:00', '18:00', 'Evento ficticio con fecha concreta, independiente del horario habitual.', NULL, true);


INSERT INTO public.tramites (id, iglesia_id, tipo, titulo, requisitos, fuente, estado_verificacion) VALUES
  ('50000000-0000-4000-8000-000000000000', '00000000-0000-4000-8000-000000000001', 'bautizos', 'Guía de bautizos', ARRAY['Ejemplo ficticio pendiente de confirmar: consultar si se solicita una constancia de nacimiento.', 'Ejemplo ficticio pendiente de confirmar: consultar si hay una plática de preparación.']::text[], NULL, 'ejemplo'),
  ('50000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'bodas', 'Guía de bodas', ARRAY['Ejemplo ficticio pendiente de confirmar: consultar qué constancias se requieren para la celebración.', 'Ejemplo ficticio pendiente de confirmar: preguntar por las pláticas de preparación.']::text[], NULL, 'ejemplo'),
  ('50000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'misas_difuntos', 'Guía de misas por difuntos', ARRAY['Ejemplo ficticio pendiente de confirmar: consultar cómo indicar la intención de la misa.', 'Ejemplo ficticio pendiente de confirmar: preguntar por las fechas y horas disponibles.']::text[], NULL, 'ejemplo'),
  ('50000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'otros', 'Guía de otros trámites', ARRAY['Ejemplo ficticio pendiente de confirmar: consultar directamente cuál es el trámite necesario.', 'Ejemplo ficticio pendiente de confirmar: preguntar por los documentos que correspondan al trámite.']::text[], NULL, 'ejemplo'),
  ('50000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000002', 'bautizos', 'Guía de bautizos', ARRAY['Ejemplo ficticio pendiente de confirmar: consultar si se solicita una constancia de nacimiento.', 'Ejemplo ficticio pendiente de confirmar: consultar si hay una plática de preparación.']::text[], NULL, 'ejemplo'),
  ('50000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000002', 'bodas', 'Guía de bodas', ARRAY['Ejemplo ficticio pendiente de confirmar: consultar qué constancias se requieren para la celebración.', 'Ejemplo ficticio pendiente de confirmar: preguntar por las pláticas de preparación.']::text[], NULL, 'ejemplo'),
  ('50000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000002', 'misas_difuntos', 'Guía de misas por difuntos', ARRAY['Ejemplo ficticio pendiente de confirmar: consultar cómo indicar la intención de la misa.', 'Ejemplo ficticio pendiente de confirmar: preguntar por las fechas y horas disponibles.']::text[], NULL, 'ejemplo'),
  ('50000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-000000000002', 'otros', 'Guía de otros trámites', ARRAY['Ejemplo ficticio pendiente de confirmar: consultar directamente cuál es el trámite necesario.', 'Ejemplo ficticio pendiente de confirmar: preguntar por los documentos que correspondan al trámite.']::text[], NULL, 'ejemplo'),
  ('50000000-0000-4000-8000-000000000020', '00000000-0000-4000-8000-000000000003', 'bautizos', 'Guía de bautizos', ARRAY['Ejemplo ficticio pendiente de confirmar: consultar si se solicita una constancia de nacimiento.', 'Ejemplo ficticio pendiente de confirmar: consultar si hay una plática de preparación.']::text[], NULL, 'ejemplo'),
  ('50000000-0000-4000-8000-000000000021', '00000000-0000-4000-8000-000000000003', 'bodas', 'Guía de bodas', ARRAY['Ejemplo ficticio pendiente de confirmar: consultar qué constancias se requieren para la celebración.', 'Ejemplo ficticio pendiente de confirmar: preguntar por las pláticas de preparación.']::text[], NULL, 'ejemplo'),
  ('50000000-0000-4000-8000-000000000022', '00000000-0000-4000-8000-000000000003', 'misas_difuntos', 'Guía de misas por difuntos', ARRAY['Ejemplo ficticio pendiente de confirmar: consultar cómo indicar la intención de la misa.', 'Ejemplo ficticio pendiente de confirmar: preguntar por las fechas y horas disponibles.']::text[], NULL, 'ejemplo'),
  ('50000000-0000-4000-8000-000000000023', '00000000-0000-4000-8000-000000000003', 'otros', 'Guía de otros trámites', ARRAY['Ejemplo ficticio pendiente de confirmar: consultar directamente cuál es el trámite necesario.', 'Ejemplo ficticio pendiente de confirmar: preguntar por los documentos que correspondan al trámite.']::text[], NULL, 'ejemplo'),
  ('50000000-0000-4000-8000-000000000030', '00000000-0000-4000-8000-000000000004', 'bautizos', 'Guía de bautizos', ARRAY['Ejemplo ficticio pendiente de confirmar: consultar si se solicita una constancia de nacimiento.', 'Ejemplo ficticio pendiente de confirmar: consultar si hay una plática de preparación.']::text[], NULL, 'ejemplo'),
  ('50000000-0000-4000-8000-000000000031', '00000000-0000-4000-8000-000000000004', 'bodas', 'Guía de bodas', ARRAY['Ejemplo ficticio pendiente de confirmar: consultar qué constancias se requieren para la celebración.', 'Ejemplo ficticio pendiente de confirmar: preguntar por las pláticas de preparación.']::text[], NULL, 'ejemplo'),
  ('50000000-0000-4000-8000-000000000032', '00000000-0000-4000-8000-000000000004', 'misas_difuntos', 'Guía de misas por difuntos', ARRAY['Ejemplo ficticio pendiente de confirmar: consultar cómo indicar la intención de la misa.', 'Ejemplo ficticio pendiente de confirmar: preguntar por las fechas y horas disponibles.']::text[], NULL, 'ejemplo'),
  ('50000000-0000-4000-8000-000000000033', '00000000-0000-4000-8000-000000000004', 'otros', 'Guía de otros trámites', ARRAY['Ejemplo ficticio pendiente de confirmar: consultar directamente cuál es el trámite necesario.', 'Ejemplo ficticio pendiente de confirmar: preguntar por los documentos que correspondan al trámite.']::text[], NULL, 'ejemplo');


COMMIT;
