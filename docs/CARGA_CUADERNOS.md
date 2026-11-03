# Carga de los ocho cuadernos informativos

**Estado31/10/2026:014 comprobada y lote aplicado en Neon mediante MCP**, proyecto
divine-wildflower-50337376, rama production, base neondb. Ocho cuadernos/32 páginas y16 muestras
retiradas, sin borrado. Conservación y RLS público verificados; API local bloqueada por EPERM.
Evidencia en TAREAS.md. **No repetir014 ni cargar de nuevo para completar este paso.**
Las instrucciones siguientes conservan el procedimiento reproducible para comparar futuras
ediciones; no son pasos pendientes de esta carga. BAGN fuera de alcance.
Lote editable: backend/data/cuadernos-informativos.json. Único cargador:
backend/scripts/cargar-cuadernos.js, con validación/transacción en src/carga-cuadernos.js.
No instala dependencias, carga .env, altera iglesias, cuentas, autenticación o permisos.

## Revisión y orden

1. Revisar **backend/sql/014_cuadernos_informativos.sql**. Requiere001–013 ya aplicadas.
   La002 obliga documentos.es_ejemplo=true y paginas.imagen_url=null:014 retira esa limitación,
   restringe imágenes a rutas /imagenes de formatos permitidos y bloquea imágenes en privados.
   Añade retirado_publico=false a materiales y filtros RLS para listado/ficha/documento/páginas.
   Solo concede SELECT de esa marca interna al rol público; sin cambios de roles/cuentas o
   privilegios administrativos. Sin semillas ni cambios de visibilidad. **Ejecutar014 en Neon
   requiere aprobación separada; el cargador nunca lo hace.** No repetir001–013.
2. Aplicar014 autorizadamente antes de desplegar las nuevas consultas del backend. Sin014,
   las consultas fallan por columna ausente; no hay fallback local. Reiniciar el backend una
   vez esté lista la migración. No requiere cambios de frontend.
3. Revisar docs/VISTA_PREVIA_CUADERNOS.json y el JSON editable. Huella actual:
   **3641ac226e7322ef42a02987e279b56277c716b7a9c69e0ff2d11a216b2e3477**.
   Cualquier cambio del archivo invalida esa huella. La vista es local: no inventa filas anteriores.

## Único comando para aplicar el lote revisado

Desde la raíz, con nvm cargado y después de aplicar014 con autorización:

```sh
nvm exec 24 node backend/scripts/cargar-cuadernos.js --aplicar 3641ac226e7322ef42a02987e279b56277c716b7a9c69e0ff2d11a216b2e3477
```

Pide la **URL PostgreSQL completa del operador autorizado** en un prompt oculto. No pasar
credenciales en argumentos ni guardarlas en .env, SQL, documentación o archivos versionables.
No usa conexiones compartidas anteriormente en chat. El operador necesita SELECT en iglesias y
SELECT/INSERT/UPDATE en materiales/documentos/páginas; no necesita DELETE ni acceso a cuentas.
No usar el propietario como credencial del servidor Express. Si faltan permisos, detenerse;
el script no concede ninguno ni crea roles. Los errores solo emiten etapas/códigos seguros.

El flag --aplicar y la huella son la aplicación explícita. Ejecuta comparación y escrituras
en **una transacción SERIALIZABLE**, con bloqueos, COMMIT al final y ROLLBACK ante cualquier fallo.
No hay reintentos automáticos. Si se pierde conexión al confirmar, el resultado puede ser
incierto: consultar/comparar antes de decidir otro intento. La identificación estable permite
repetir sin duplicar ni volver a escribir datos que ya coinciden.

El mismo cargador ofrece --vista-previa (por defecto, sin conexión) y --comparar (con prompt,
transacción REPEATABLE READ READ ONLY, sin escrituras). Sustituir --aplicar y su huella por uno
de esos flags; --archivo permite indicar otro archivo con el mismo formato. La comparación
muestra antes/después de contenido público, retiradas propuestas y semillas modificadas omitidas.

## Identificación, conservación y retirada

- Un UUID determinista por slug y namespace fijo iglesias/cuaderno-informativo/v1: conserva
  identidad entre ediciones del lote. No depende del título, del orden o de la fecha.
- Ocho materiales públicos/documento/libros-documentos, ocho documentos,32 páginas1–4;
  es_ejemplo:false en material y documento. Guarda **exactamente** textos, saltos, fuentes,
  créditos y las menciones «Cuaderno informativo», sin convertirlos en transcripción original
  ni verificación parroquial. clase_contenido valida el lote; no añade un campo a la API.
- Fotos: **14 rutas distintas efectivamente referenciadas**, verificadas como archivos existentes,
  no vacíos y con firma de imagen. La entrega de Claude decía13; no se cambiaron las referencias,
  imágenes o créditos. Sin PDFs, archivos nuevos o subidas.
- Si el UUID reservado ya corresponde a material privado, otra iglesia o metadatos incompatibles,
  aborta y revierte. No sobrescribe ese conflicto. Páginas adicionales inesperadas también
  provocan conflicto; no se borra ninguna página para resolverlo.
- Las semillas reales de003 tienen **cuatro**, no seis, libros/documentos públicos por iglesia
  original de Mérida: offsets000/001/002/004,100/101/102/104,200/201/202/204,300/301/302/304.
  Las otras cuatro iglesias no tienen esas semillas. Máximo16 candidatas, sin asumir que aún
  existan en Neon. Solo se retiran si aún coinciden título/tipo/iglesia/categoría/descripcion
  de demostración, fuente/foto nulas, público y es_ejemplo:true. Una fila modificada se conserva
  y se informa como omitida. No se buscan muestras por títulos vagos ni se retiran todas por flag.
- La retirada cambia únicamente **retirado_publico=true**: filas, documentos, páginas y
  visibilidad='publico' se conservan. No se convierten en archivos reservados. Público listado
  las excluye y ficha/documento directo devuelve404; el administrador mantiene su acceso previo.
- Objetos y materiales privados existentes se conservan, con sus documentos, páginas y ámbito.
  Tampoco se cambian iglesias, horarios, actividades, trámites, cuentas, roles o sesiones.

## Lector y protección

Misma ruta GET /api/materiales/:id/documento y estructura:
{material_id,titulo,es_ejemplo:false,paginas:[{numero,texto,imagen_url}]}.
GET de materiales devuelve tiene_documento:true/bloqueado:false para los cuadernos. El lector
actual ya consume estas claves, respeta saltos de texto y dibuja imagen_url. No hardcodear IDs.
No se requiere nueva pantalla, endpoint de archivo ni carga de PDF.

Privados conservan bloqueado:true/tiene_documento:false y documento público403. La base impide
añadir imágenes públicas a páginas privadas o convertir un documento ilustrado a privado sin
retirar antes esas referencias operativamente. PATCH admin devuelve409 CONFLICT en ese caso;
no se ocultan imágenes con un botón ni se debilita el aislamiento entre iglesias.

## Verificación y límites

Seis pruebas específicas del lote y lector: preservación/validación, comparación sin escritura,
aplicación/repetición, conflictos/rollback, API Express en memoria y409 preventivo. Cliente SQL
simulado; archivos de imágenes reales. Pruebas existentes de permisos también ejecutadas.

Arnés backend/test/validar_sql_local.py ampliado a001–014 y sentencias reales del cargador,
capturadas y ejecutadas en PostgreSQL temporal; comprueba32 páginas, retirada16, repetición,
restricciones y conservación de objetos/privados/documentos anteriores/cuentas/sesiones de prueba.
Modo single **no certifica RLS efectivo, driver pg o Neon**. Modo --servidor añade comprobaciones
RLS de cuadernos y la integración local existente, sujeto a disponibilidad de sockets.

Tras la aplicación autorizada, verificar en la API real los ocho listados y documentos con
cuatro páginas/imágenes,404 de retirados y403 de privados; comprobar el lector desde5173 y sus
créditos. Esto y Neon siguen pendientes: las pruebas en memoria no acreditan integración real.
