# Carga por lote de contenido público

Preparación local, sin consultar ni escribir en Neon. Miguel confirmó que el login funciona;
no se volvió a probar ni se cambió su cuenta. No se han entregado datos nuevos: la plantilla
está vacía, sin historia, teléfonos, requisitos u horarios inventados.

## Archivos y alcance

- **backend/data/carga-publica.json**: archivo JSON editable, iglesias por slug (el lote existente conserva solo las cuatro de Mérida).
- **backend/scripts/cargar-contenido.js**: vista previa local por defecto; comparación remota
  de solo lectura y aplicación transaccional exclusivamente con opciones explícitas.
- **docs/VISTA_PREVIA_CARGA.json**: vista inicial generada sin conexión, cero operaciones.

Este primer lote actualiza **registros existentes**. Iglesia por slug; materiales/horarios
por UUID y pertenencia a iglesia; trámite por tipo dentro de su iglesia. No crea ni borra:
no duplica al repetir. UUID inexistente o de otra iglesia aborta todo. [] significa «sin
cambios», nunca borrar lo que falta. Actividades con fecha quedan fuera de este lote.

## Formato editable y campos admitidos

Cada entrada conserva slug, informacion:{}, materiales:[], horarios:[] y tramites:[].
Fase2: lotes de1..8 entradas sin repetir, entre catedral, tercera-orden, santa-lucia, santa-ana, catedral-campeche, dulce-nombre-jesus, catedral-puebla y la-compania. estado/ciudad se asignan por migración y no los edita el cargador.
Añadir solo campos que se quieran actualizar; omitir conserva el valor. null borra un
opcional, nunca un requerido. Fase2 permite "" en descripcion/historia/direccion de iglesia para información ausente. No pegar marcadores de posición como contenido real.

| Sección / identificación | Campos admitidos en informacion o cambios |
|---|---|
| informacion, iglesia por slug | nombre, descripcion, historia, direccion, latitud, longitud, telefono, foto_exterior, foto_interior, fuente, es_ejemplo |
| materiales: {id: UUID existente, cambios:{…}} | categoria_id, tipo, titulo, descripcion_publica, imagen_publica, fuente, es_ejemplo |
| horarios: {id: UUID existente, cambios:{…}} | dia_semana, hora, nota, es_ejemplo |
| tramites: {tipo: tipo existente, cambios:{…}} | titulo, requisitos, fuente, estado_verificacion |

Copiar UUID públicos de /api/iglesias/:slug/materiales y /api/iglesias/:slug/horarios
usando el navegador. Elegir solo materiales con visibilidad:publico. Tipos de trámite:
bautizos, bodas, misas_difuntos, otros, urnas_nichos (tras013). Para editar una ficha, agregar en materiales un objeto
con id y cambios; dentro de cambios poner, por ejemplo, titulo/descripcion_publica/fuente
con valores revisados. No se necesita contraseña por documento.

Historia de objetos en descripcion_publica; fotografía en imagen_publica. No campo historia
extra de material. descripcion_interna está excluida de este archivo público.

Límites del esquema: nombre/titulo160; descripcion/historia/descripcion_publica10000;
direccion/fuente1000; telefono40; nota2000; requisitos hasta30 strings de hasta1000, sin
vacíos (admite []). telefono/fuente/fotos/imagen_publica/nota admiten null. Coordenadas
numéricas JSON: latitud -90..90, longitud -180..180. Categoría libros-documentos con
libro/documento; objetos con objeto. dia_semana entero0 domingo..6 sábado y hora HH:mm
local America/Merida, sin UTC/segundos/24:00. El texto se recorta en los extremos.

es_ejemplo se conserva si se omite; solo se admite enviar **true**, nunca false.
estado_verificacion se conserva si se omite; solo **ejemplo o por_confirmar**, nunca
verificado. No se infiere verificación de una fuente. Si se reemplaza contenido no ejemplar
por un ejemplo, indicarlo explícitamente con es_ejemplo:true/estado_verificacion:ejemplo.
La verificación real de contenido no forma parte de este lote.

Imágenes: null, ruta pública /… o URL http(s) de fotografía autorizada, hasta2000 caracteres;
no data:, credenciales en URL, rutas /api/ ni referencias .pdf/.html. Referencias ya publicables:
no se suben archivos ni guardan PDFs. Fuente es texto de hasta1000. Revisar información y
derechos de publicación antes de cargar; el script no inventa contenido ni descarga imágenes.

## Protección

- Material privado objetivo: rechazar el lote completo, nunca convertirlo en público.
  visibilidad, iglesia_id, descripcion_interna y campos de documento no son editables.
- Sin consultas/escrituras a contenido de documentos/páginas, Auth, sesiones o administrador.
  No INSERT/DELETE, DDL, GRANT/REVOKE ni cambios de secretos/permisos/esquema/contrato.
- Valores parametrizados, tablas/columnas de listas cerradas. Al aplicar: locks y transacción
  SERIALIZABLE; cualquier fallo revierte todo. Solo se actualizan valores distintos.
- Comparación: REPEATABLE READ READ ONLY y ROLLBACK. Antes/después de campos públicos,
  sin notas internas, hashes, cookies o credenciales.
- Aplicación requiere huella SHA256 del archivo exacto revisado. Editar incluso espacios
  cambia la huella: regenerar y revisar de nuevo.

## Vista previa inicial — ejecutada sin Neon

Desde la raíz:

```sh
nvm use 24
node backend/scripts/cargar-contenido.js --vista-previa > docs/VISTA_PREVIA_CARGA.json
```

Equivalente desde backend: `npm run --silent contenido:preview`.
La plantilla inicial histórica tenía **0 registros propuestos**; el lote actual de Mérida contiene cuatro cambios públicos preparados por Claude. Regenerar para ver su estado actual.
El resultado incluye huella_sha256 y operaciones; no inventa antes/después ni demuestra que
los UUID existan en Neon. Para otro archivo añadir `--archivo ruta/al/lote.json`, ruta relativa
a la terminal. Máximo512KiB y500 entradas por sección/iglesia; rechaza campos/IDs inválidos.

## Ejecutar una sola vez después de revisar — PENDIENTE

1. Rellenar la plantilla con datos y fuentes revisados. Lo desconocido se omite; no inventar
   teléfonos, requisitos, historia u horarios. Usar UUID públicos existentes.
2. Regenerar y revisar la vista local. Los modos de BD rechazan lote vacío antes de pedir conexión.
3. **Autorizada la lectura remota**, desde backend:

   ```sh
   npm run --silent contenido:comparar > ../docs/COMPARACION_CARGA.json
   ```

   Introducir conexión de un operador autorizado, solicitada **sin eco**, a la misma rama/base.
   No carga .env, no usa DATABASE_URL/DATABASE_URL_ADMIN ni guarda/imprime la conexión.
   El operador debe tener permisos ya existentes sobre esos campos. El login admin es limitado:
   nombre/coordenadas/fotos/es_ejemplo pueden devolver42501. No elevar permisos ni poner
   propietario en credenciales del runtime/API; si no hay operador autorizado, detenerse y
   acordar el acceso. El script no crea roles ni cambia permisos. No instalar herramientas.
4. Revisados archivo y diferencias reales, **autorizada expresamente la escritura remota**,
   ejecutar desde backend **una vez**, sustituyendo HUELLA_REVISADA por huella_sha256 de la vista:

   ```sh
   npm run --silent contenido:aplicar -- --aplicar HUELLA_REVISADA
   ```

   Pide privadamente la misma conexión. Verifica huella y existencia de cada iglesia/registro del lote;
   actualiza en una transacción y devuelve diferencias/total. Ante error no reintentar
   automáticamente. Para 40001/40P01 (conflicto concurrente), comparar y revisar de nuevo.
5. Verificar las rutas públicas, conservar vista/comparación/resultado como evidencia sin
   credenciales. Login y privados deben continuar protegidos. No hace falta reiniciar frontend.

No hay tabla nueva de lotes: sin cambiar el esquema no se promete un bloqueo permanente de
segunda ejecución. Repetir el mismo archivo sobre el mismo estado modifica cero filas y no
duplica; tras ediciones posteriores podría sobrescribirlas. Por eso ejecutar una vez y comparar
antes de cualquier reintento. **Ningún modo llegó a conectar a Neon** durante esta preparación;
permisos, destino y cambios reales siguen sin comprobar. PDFs siguen simulados.
