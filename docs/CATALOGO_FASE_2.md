# Catálogo de ocho iglesias — entrega backend a Claude

30 octubre 2026. Implementación local; **009 y 010 aplicados por Miguel en Neon** (reporte posterior, catálogo4/2/2 confirmado). Sin frontend,
instalaciones, secretos, cambios de cuenta global ni publicación. Esta ampliación reemplaza
los límites antiguos de cuatro iglesias; las cuatro de Mérida conservan sus datos y rutas.

## Contrato definitivo

GET /api/iglesias devuelve ocho; GET /api/iglesias?estado=yucatan|campeche|puebla filtra4/2/2.
Estado ausente: todos. Vacío, repetido, desconocido o mayúsculas:400 con fields.estado.
Iglesia incorpora estado (clave ASCII) y ciudad (nombre visible); restantes campos conservados.
No tabla/endpoint extra de estados; mapa/lista y selector admin usan esta misma respuesta.

| Estado API / etiqueta | Ciudad | Slug | ID (últimos cuatro dígitos) |
|---|---|---|---|
| yucatan / Yucatán | Mérida | catedral | 0001 (sin cambio) |
| yucatan / Yucatán | Mérida | tercera-orden | 0002 (sin cambio) |
| yucatan / Yucatán | Mérida | santa-lucia | 0003 (sin cambio) |
| yucatan / Yucatán | Mérida | santa-ana | 0004 (sin cambio) |
| campeche / Campeche | San Francisco de Campeche | catedral-campeche | 0005 |
| campeche / Campeche | San Francisco de Campeche | dulce-nombre-jesus | 0006 |
| puebla / Puebla | Puebla de Zaragoza | catedral-puebla | 0007 |
| puebla / Puebla | Puebla de Zaragoza | la-compania | 0008 |

IDs completos de iglesias: prefijo 00000000-0000-4000-8000-00000000 + los cuatro dígitos
anteriores. Slugs son únicos; Santo Domingo no se incorpora. El orden de la tabla es el de
la API, incluido el orden original de Mérida. Estado/ciudad se asignan por migración y no son
editables en PATCH admin; su whitelist sigue historia, descripcion y telefono.

Las ocho usan rutas parametrizadas públicas/admin actuales (materiales, lector, horarios,
actividades por fecha y guías). La sesión global no depende del estado; un cambio de estado
no implica logout ni inicio por iglesia/libro. Las rutas públicas siguen bloqueando privados
incluso con cookie admin; notas internas no forman parte de la proyección pública.

Nuevas iglesias: descripcion/historia/direccion=""; telefono/fotos=null. fuente contiene solo
procedencia de ubicación. No hay historia, fotos, horarios, visitas, requisitos, materiales o
actividades inventados. Materiales/horarios/actividades=[]; se crean cuatro guías genéricas
(Bautizos, Bodas, Misas por difuntos, Otros) con requisitos:[], fuente:null y por_confirmar.
Así podrán editarse con PATCH sin añadir otro endpoint. IDs de guías los crea PostgreSQL;
obtenerlos de GET /iglesias/:slug/tramites. Cada iglesia nueva tiene es_ejemplo:true por defecto;
Mérida conserva el indicador existente. No marcar datos como verificados automáticamente.
PATCH de historia/descripcion permite "" para mantener estados vacíos; null sigue siendo inválido.

## Coordenada de La Compañía y fuentes

Se adopta **19.04257, -98.19540** del edificio de Puebla, OSM way525267034, no de un templo
homónimo ni de Santo Domingo. Fuentes consultadas el30/10/2026:

- [Mapcarta W525267034](https://mapcarta.com/W525267034): coordenadas citadas y correspondencia
  explícita con OSM525267034, junto al Carolino/centro de Puebla.
- [Wikidata Q6141059](https://www.wikidata.org/wiki/Q6141059): mismo elemento OSM y ubicación
  19°2′33.5″N,98°11′44.0″O (aprox.19.04264,-98.19556), a unos18m del punto adoptado. La
  propiedad de coordenada no tiene referencias propias: sirve como contraste, no levantamiento.
- [INAH, ficha54277](https://catalogonacionalmhi.inah.gob.mx/consulta_publica/detalle/54277):
  índice de búsqueda consultado identifica Templo del Espíritu Santo o de la Compañía de Jesús,
  I-0012104573, Puebla, calle4Sur102. Apertura directa devolvió502; no se atribuyen al INAH
  coordenadas que no se pudieron leer en esa ficha. Ficha en proceso de validación.
- [Planoteca INAH54277](https://catalogonacionalmhi.inah.gob.mx/consulta_publica/generarPdfPlanoteca/54277):
  el extracto indexado confirma nombre/domicilio. Solo ubicación, sin copiar imágenes o historia.

El contraste sitúa el marcador en el edificio aprobado; no es validación de entrada, accesibilidad
ni levantamiento topográfico. Claude debe comprobar visualmente los marcadores al adaptar Leaflet.
Las otras tres coordenadas nuevas se conservan de MEJORAS_FASE_2.md, con sus fuentes allí indicadas.

## Archivos de catálogo — ya aplicados por Miguel

Revisar como cambios nuevos sobre la base actual. No reejecutar001–008 ni borrar tablas.
009/010 ya fueron aplicadas según Miguel; se conservan aquí como referencia, no volver a ejecutarlas:

1. backend/sql/009_catalogo_estados.sql: añade estado/ciudad, asigna solo metadatos de Mérida,
   amplía CHECK de slugs y permite textos vacíos de información desconocida. No sobrescribe
   nombres, UUID, coordenadas, fuentes, fotos, historia, es_ejemplo ni relaciones existentes.
2. backend/sql/010_iglesias_fase2.sql: inserta las cuatro iglesias nuevas y sus16 guías vacías;
   conflicto de ID/slug aborta la transacción, nunca ON CONFLICT UPDATE ni borrado/recreación.

Ambos archivos transaccionales, una sola vez; si010 falla, no repetir009: revisar el error.
Ambos ya aplicados para el catálogo; no repetirlos. La siguiente ampliación es011–013 en ADMINISTRACION.md. En la entrega original se requerían antes de integrar: las lecturas ya solicitan estado/ciudad
(no fallback a datos locales si faltan las columnas). No alterar .env o logins de la API.
No cambian roles, privilegios o políticas; SELECT por tabla ya cubre las columnas nuevas.
El permiso global y RLS de documentos/páginas continúan como antes.

Datos revisables: backend/data/iglesias-fase2.json. SQL010 se reproduce localmente con:

```sh
nvm use 24
node backend/sql/generar_catalogo_fase2.js > /tmp/iglesias-fase2-revision.sql
```

No conectar a Neon desde el generador. No ejecutar SQL ni usar check:neon remoto en esta entrega.
check:neon ahora espera los ocho slugs; solo volverá a ser válido tras ambas migraciones.

El cargador público ya admite subconjuntos de1..8 iglesias, incluyendo el lote existente de
Mérida sin editarlo/cambiar su huella. Valida referencias contra los registros encontrados,
no exige que la base tenga exactamente cuatro. No crea nuevas iglesias: eso corresponde a010.
El preview muestra solo slugs con operaciones; no confundirlo con un listado del catálogo.

## Para Claude — solo frontend

- Leer CONTRATO_API.md: estado/ciudad nuevos, filtro opcional y slugs de esta tabla.
- Yucatán inicial; al cambiar estado pedir solo su lista, limpiar selección, cerrar ficha y
  ajustar mapa con la misma instancia Leaflet. No cargar documentos/fotos al listar el mapa.
- Selector admin usa GET /admin/iglesias:8 para general y1 para parroquial; conservar cliente,
  cookie/CSRF, formularios/whitelists y protección actual. No SDK/dependencias nuevos.
- Reutilizar pantallas por slug. Mostrar vacío/Por confirmar para textos/fotos/datos ausentes;
  las guías vacías no son requisitos oficiales. No inferir cierre ni ausencia de misas de [].
- No editar SQL/backend ni implementar aún otros apartados de fase2 (textos de libros, archivos,
  urnas, hosting). Los PDFs siguen simulados. Registrar la integración cuando SQL esté aplicado.

Comprobaciones locales y sus límites se registran en TAREAS.md; no equivalen a Neon ni despliegue.
