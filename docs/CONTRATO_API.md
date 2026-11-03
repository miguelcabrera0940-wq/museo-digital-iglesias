# Contrato de API v1 — base común Claude/Codex

Especificación inicial de implementación, no API ya existente ni probada. Las rutas generales y funciones están aprobadas; los detalles de campos aquí concretan ese alcance. Ambos agentes deben usar esta misma versión y registrar ajustes coordinados.

Administración aprobada el 25 octubre 2026: Better Auth 1.7.13 y cookie de ocho horas.
Contrato definitivo para Claude en las secciones Autenticación/Administración de este archivo;
preparación y comprobaciones pendientes en [ADMINISTRACION.md](ADMINISTRACION.md).
Ampliación aprobada 30 octubre 2026: ocho iglesias en Yucatán, Campeche y Puebla. Se añaden estado/ciudad a Iglesia y filtro opcional por estado; las rutas existentes conservan su forma. Ver [CATALOGO_FASE_2.md](CATALOGO_FASE_2.md).

## Convenciones

Base /api. JSON UTF-8, nombres snake_case. IDs UUID para registros persistidos; identidad administrativa interna text de Better Auth (no expuesta en estas respuestas). Slugs únicos: catedral, tercera-orden, santa-lucia, santa-ana, catedral-campeche, dulce-nombre-jesus, catedral-puebla, la-compania. Códigos cat/jes/slu/san solo para diseños. Valores desconocidos opcionales: null; listas vacías: []. Campos no reconocidos en escrituras se rechazan. Fechas YYYY-MM-DD y horas HH:mm locales de America/Merida; dia_semana entero 0 domingo–6 sábado. No convertir una fecha de calendario a otro día por UTC.

Éxito de lectura/edición: {"data": objeto_o_lista}. Creación: 201 y data. Edición: 200 y data. Eliminación: 204 sin cuerpo. Error: {"error":{"code":"VALIDATION_ERROR","message":"Revisa los campos indicados.","fields":{"titulo":"Es obligatorio."}}}. fields se omite si no aplica.

Estados: 400 VALIDATION_ERROR; 401 UNAUTHENTICATED; 403 FORBIDDEN; 404 NOT_FOUND; 409 CONFLICT; 413 PAYLOAD_TOO_LARGE; 429 RATE_LIMITED (Retry-After en segundos); 500 INTERNAL_ERROR. Sin trazas ni errores SQL en respuestas. Listas de beta ordenadas de forma estable; no añadir paginación ni búsquedas complejas hasta ser necesarias. Limitar lecturas/escrituras y tamaño de cuerpos razonablemente en servidor, sin truncar listas silenciosamente.

## Autenticación

Better Auth en Express, sesiones persistidas en Neon: una cuenta general conservada y como máximo una parroquial por iglesia. Sin cuentas de visitantes. Modelo aprobado en ADMIN_POR_IGLESIA_Y_RENDIMIENTO.md; migraciones011–013 preparadas, no aplicadas por Codex.
Cookie de biblioteca HttpOnly, SameSite=Lax, Path=/, sin Domain; Secure en HTTPS, solo
localhost HTTP sin Secure. Caduca ocho horas después del login, sin renovación automática
ni caché de identidad en cookie. No Authorization Bearer, JWT propio ni SDK Auth frontend.
El servidor comprueba identidad contra administrador.auth_user_id, activo=true, rol y asignación
en cada solicitud protegida, y vuelve a comprobarlos en la transacción de negocio. La cuenta
general accede a las ocho iglesias; la parroquial solo a su iglesia y sus privados. Cambios de
rol/asignación o desactivación se respetan en la siguiente solicitud, sin confiar en la sesión antigua. No registro público,
recuperación, cambio de credenciales ni endpoint nativo/catch-all de Better Auth.

Mismo origen para frontend y /api (Vite conserva /api en proxy). Toda mutación requiere
Origin exactamente APP_ORIGIN y X-Iglesias-Admin: 1. Si hay cuerpo, Content-Type:
application/json. GET admin también exige X-Iglesias-Admin: 1. Sin CORS permisivo.
Todas las respuestas admin llevan Cache-Control: no-store, incluidos errores.

| Método y ruta | Entrada | Respuesta |
|---|---|---|
| POST /admin/login | {email,password}, solo esos campos; origen/cabecera anteriores | 200 {data:{administrador:true}} y Set-Cookie; luego GET sesion |
| GET /admin/sesion | Cookie y X-Iglesias-Admin: 1 | 200 {data:{administrador:true,rol,iglesia_id,iglesia_slug,expira_en,csrf_token}} |
| POST /admin/logout | Sin cuerpo; cookie, origen, X-Iglesias-Admin: 1, X-CSRF-Token | 204 sin cuerpo tras revocar sesión y borrar cookie |

expira_en es ISO 8601 UTC; csrf_token se conserva solo en memoria y se envía como
X-CSRF-Token en escrituras/logout. Es un HMAC ligado a la sesión, no un token de login.
Cookie y tokens internos de biblioteca nunca se devuelven en JSON ni se guardan en
localStorage/sessionStorage. Logout ya expirado/sin sesión es idempotente: mismo origen y
cabecera obligatorios, limpia cookie sin exigir CSRF de sesión inexistente. Una sesión
cuyo permiso se retiró también puede cerrar sesión con su CSRF.

Email trim/lowercase, válido hasta 254 caracteres; contraseña obligatoria, sin trim,
hasta 128 caracteres (la inicial se elige privadamente con al menos 12). Login máximo
4 KiB; negocio máximo 256 KiB. Credenciales incorrectas y email inexistente devuelven
401 UNAUTHENTICATED, «Correo o contraseña incorrectos.». Sesión ausente/caducada: 401;
sesión sin vínculo activo/ámbito válido: 403. Origin/CSRF inválido: 403 FORBIDDEN.

Límite persistido por correo normalizado (HMAC), sin IP/MAC ni baneo. Una secuencia de fallos
consecutivos de credenciales: fallos1–4 sin espera,5–9 imponen15segundos, desde10 imponen120
segundos por cada nuevo fallo permitido (contador saturado en10). El fallo permitido responde
401 genérico; las solicitudes siguientes durante la espera responden429 RATE_LIMITED con
Retry-After en segundos. Rechazos durante espera no incrementan ni prolongan la espera, ni
verifican contraseña. Éxito de credenciales reinicia;15min sin nuevo fallo expiran la secuencia.
Mismo comportamiento para correo válido inexistente. Fallos de BD/biblioteca no se cuentan
como contraseña incorrecta ni permiten login sin limitador:500 sin fallback. La decisión es
atómica en PostgreSQL con bloqueo de fila durante la verificación, compartida entre instancias;
no garantiza protección total contra bots o denegación de servicio. Sustituye los cupos anteriores.

rol es general o parroquial. Para general iglesia_id/iglesia_slug son null; para parroquial
contienen UUID y slug asignados por servidor. El navegador no envía rol/asignación en login ni
PATCH. GET /admin/iglesias devuelve las iglesias administrables:8 general,1 parroquial. Las
consultas públicas siguen accesibles sin sesión para todos los estados/iglesias.

No renovar sesión al expirar: limpiar privados y pedir login. Logout solo confirmado con
204; errores de red no certifican revocación. Cerrar sesión/401 limpia privados y CSRF del
estado del navegador; nunca caché offline. Las rutas públicas conservan su comportamiento
incluso con una cookie administrativa: documento privado público siempre devuelve 403.

## Campos

### Iglesia
id, slug, estado (yucatan|campeche|puebla), ciudad (string), nombre, descripcion, historia, direccion, latitud (número), longitud (número), telefono (string|null), foto_exterior (ruta pública|null), foto_interior (ruta pública|null), fuente (string|null), es_ejemplo (boolean).

estado/ciudad son metadatos de catálogo de solo lectura para la API. Las ciudades son Mérida,
San Francisco de Campeche y Puebla de Zaragoza, respectivamente. descripcion, historia y
direccion pueden ser "" si no hay información; nunca completar con hechos inventados.
telefono/fotos/fuente desconocidos siguen siendo null. Los campos anteriores de Mérida no se
borran ni se reescriben al migrar; es_ejemplo se conserva y no equivale a verificación oficial.

### Categoría fija
id (libros-documentos u objetos), nombre. Compartida por las ocho iglesias. En beta no hay endpoints CRUD: el frontend puede usar la lista documentada; el servidor valida pertenencia al conjunto. No crear tablas distintas por iglesia.

### Material (ficha pública)
id, iglesia_id, categoria_id, tipo (libro|documento|objeto), titulo, descripcion_publica, imagen_publica (ruta|null), visibilidad (publico|privado), fuente (string|null), es_ejemplo (boolean), bloqueado (boolean), tiene_documento (boolean).

En respuestas públicas, privado implica bloqueado:true y no incluye referencia_archivo, URL privada, contenido ni páginas. Portada/descripción deben ser deliberadamente aptas para publicación; no derivarlas del secreto. La ficha administrativa añade descripcion_interna opcional. Para material público puede existir tiene_documento:true. Un material privado no necesita revelar si tiene documento en respuesta pública: devolver false y reservar ese dato al admin.

### Documento
{material_id, titulo, es_ejemplo:boolean, paginas:[{numero:1, texto:string, imagen_url:string|null}]}. Mismos campos del lector existente. Las muestras ficticias conservan es_ejemplo:true; los cuadernos editoriales identificados como «Cuaderno informativo» usan false, sin equivaler a verificación parroquial ni a un documento original. Las imágenes de cuadernos referencian fotos públicas existentes en /imagenes/; los créditos permanecen en sus páginas y fuentes. No endpoint de upload ni descarga real arbitraria de PDFs.

Los documentos privados siguen sin imágenes públicas y exigen autorización para leer su texto. PATCH administrativo a privado de un material que contiene imágenes públicas devuelve409 CONFLICT: requiere retirada operativa previa de esas referencias. No se convierten imágenes en privadas por ocultar el botón.

Una marca interna retirado_publico excluye muestras sustituidas de listado, ficha y documento públicos (acceso directo404), conservando filas y visibilidad original. No aparece como campo nuevo de la API ni como archivo parroquial reservado; administración conserva su acceso y ámbito. Requiere014_cuadernos_informativos.sql antes de desplegar este backend.

### Horario
id, iglesia_id, dia_semana (0–6), hora (HH:mm), nota (string|null), es_ejemplo.

### Actividad
id, iglesia_id, tipo (misa|bautizo|boda|difuntos|visita|otro), titulo, fecha, hora_inicio, hora_fin (HH:mm|null), descripcion, nota_visitas (string|null), es_ejemplo. hora_fin no anterior a inicio; beta no maneja eventos de varios días.

### Trámite
id, iglesia_id, tipo (bodas|bautizos|misas_difuntos|otros|urnas_nichos), titulo, requisitos (array de strings), fuente (string|null), estado_verificacion (ejemplo|por_confirmar|verificado). Una guía por iglesia/tipo. No datos personales de solicitantes.

## Consultas públicas

| Método y ruta | Respuesta data |
|---|---|
| GET /iglesias | Las ocho iglesias, con estado y ciudad |
| GET /iglesias?estado=yucatan | Filtro opcional: yucatan (4), campeche (2), puebla (2) |
| GET /iglesias/:slug | Iglesia o 404 |
| GET /iglesias/:slug/materiales?categoria=libros-documentos | Lista de fichas públicas; categoria opcional y validada |
| GET /materiales/:id | Ficha pública, incluso privado bloqueado |
| GET /materiales/:id/documento | Documento público; 403 si privado; 404 si inexistente o retirado |
| GET /iglesias/:slug/horarios | Lista de Horario recurrente |
| GET /iglesias/:slug/actividades?fecha=2026-10-25 | Lista de Actividad para fecha; fecha obligatoria y válida |
| GET /iglesias/:slug/tramites | Lista de cinco guías |

Sin estado se devuelven las ocho; no se limita implícitamente a Yucatán. El frontend elige
yucatan inicialmente y puede usar las etiquetas Yucatán/Campeche/Puebla del catálogo fijo,
sin endpoint adicional de estados. estado vacío, desconocido, con mayúsculas o repetido:
400 VALIDATION_ERROR con fields.estado. Orden estable: Yucatán (las cuatro de Mérida en el
orden anterior), Campeche (catedral-campeche, dulce-nombre-jesus), Puebla (catedral-puebla,
la-compania). El filtro nunca incluye materiales/documentos ni cambia la autenticación.

Las ocho iglesias usan las mismas rutas /iglesias/:slug, /materiales, /horarios,
/actividades?fecha= y /tramites. Las nuevas tienen materiales/horarios/actividades=[] y
guías con requisitos:[], fuente:null y estado_verificacion:por_confirmar para editarlas
con el PATCH ya existente. No nuevos endpoints de creación de iglesia, categorías o archivos.
El selector administrativo usa GET /admin/iglesias según ámbito (general8/parroquial1);
permisos, CSRF y lectura privada siguen siendo comprobaciones del servidor.

El frontend consulta horarios y actividades por separado; deriva dia_semana de fecha local y muestra ambas secciones. Una lista vacía de actividades no elimina misas recurrentes ni implica cierre.

Ejemplo GET /iglesias/santa-lucia/actividades?fecha=2026-10-26:
```json
{"data":[]}
```

## Administración

Todas las rutas /admin de negocio requieren cookie de sesión y ámbito autorizado; las mutaciones también origen y CSRF. iglesia_id en cuerpos de creación refiere a una iglesia existente. Escrituras no permiten cambiar id, iglesia_id, slug, auth_user_id ni campos calculados por PATCH.

| Método y ruta | Entrada o resultado |
|---|---|
| GET /admin/iglesias | Iglesias administrables,8 general o1 parroquial |
| GET /admin/materiales/:id | Ficha administrativa individual |
| PATCH /admin/iglesias/:slug | Solo historia, descripcion, telefono |
| GET /admin/iglesias/:slug/materiales | Fichas administrativas de esa iglesia |
| POST /admin/materiales | iglesia_id, categoria_id, tipo, titulo, descripcion_publica, visibilidad; opcionales descripcion_interna, fuente; imagen_publica:null y es_ejemplo:true de servidor |
| PATCH /admin/materiales/:id | categoria_id, tipo, titulo, descripcion_publica, visibilidad, descripcion_interna, fuente; sin cambiar iglesia ni imagen/documento |
| GET /admin/materiales/:id/documento | Documento público o privado, siempre tras autorización |
| POST /admin/horarios | iglesia_id, dia_semana, hora, nota opcional |
| PATCH /admin/horarios/:id | dia_semana, hora, nota |
| DELETE /admin/horarios/:id | Eliminar horario; confirmación en frontend |
| POST /admin/actividades | iglesia_id, tipo, titulo, fecha, hora_inicio, descripcion; hora_fin y nota_visitas opcionales |
| PATCH /admin/actividades/:id | tipo, titulo, fecha, hora_inicio, hora_fin, descripcion, nota_visitas, es_ejemplo (boolean) |
| DELETE /admin/actividades/:id | Eliminar actividad; confirmación en frontend |
| PATCH /admin/tramites/:id | titulo, requisitos, fuente, estado_verificacion |

Permisos: general conserva todas las operaciones de la tabla. Parroquial gestiona materiales,
lector privado, horarios/actividades solo de su iglesia; PATCH iglesia **solo telefono**.
Trámites/requisitos, historia, descripcion y demás datos son de consulta para parroquial.
Campos conocidos pero fuera de su permiso→403 (también si se mezclan con telefono); campos
no admitidos como rol/usuario/iglesia_id/estado/ciudad→400. No se ignoran silenciosamente.
Slug de otra iglesia→403; UUID ajeno o inexistente en rutas administrativas→404 genérico para
no confirmar existencia. POST con iglesia_id ajena→403. DELETE/PATCH de UUID ajeno no modifica
filas. La cuenta general conserva404 de recurso inexistente. Permisos aplicados en servidor,
con filtros SQL de pertenencia incluso en rutas sin slug; no dependen de ocultar botones.

Urnas: tipo **urnas_nichos**, quinto tras otros; mismas rutas GET /iglesias/:slug/tramites y
PATCH /admin/tramites/:id (solo general). Guía inicial requisitos:[], fuente:null, por_confirmar.
El frontend muestra «Consulta disponibilidad y condiciones directamente con la parroquia» y
usa telefono de Iglesia para botón tel: cuando exista; si null, «Por confirmar». Sin precios,
cantidades, reservas, chat, pagos ni documentos/subida real. No inventar requisitos o teléfono.

Gestión de horarios y actividades lee mediante las rutas públicas documentadas; no duplicar endpoints idénticos sin motivo. No DELETE de iglesias/materiales ni CRUD de cuentas/categorías en este alcance.

Ficha administrativa: campos de Material v1 más descripcion_interna, bloqueado:false y
tiene_documento real incluso para privados. Lista administrativa ordenada por id.
Material nuevo por ficha tiene es_ejemplo:true, imagen_publica:null y no tiene documento; lectura solo si el backend tiene un ejemplo preasociado. Cambiar visibilidad exige proteger inmediatamente el documento asociado, no simplemente ocultar botón. No guardar el documento público en un recurso estático si será reclasificable como privado: servir los ejemplos a través del endpoint que consulta visibilidad.

Cache-Control: no-store en respuestas admin y documentos privados; no almacenar privados en service worker/localStorage. No implementar PWA/caché offline como función adicional.

Los POST de horarios/actividades requieren los campos indicados excepto los opcionales;
nota, hora_fin y nota_visitas omitidos quedan null y es_ejemplo:true lo fija el servidor.
POST material requiere los seis primeros campos indicados. PATCH es parcial, no vacío;
nullable: telefono, descripcion_interna, fuente, nota, hora_fin, nota_visitas. Para borrar
un opcional enviar null, no cadena vacía. Requisitos admite [] para una guía sin requisitos.
Categoría objetos solo con tipo objeto; libros-documentos solo con libro/documento.
Fecha/hora se mantienen locales de America/Merida, sin conversión UTC. Una hora_fin
anterior al inicio, incluso al cambiar solo un extremo, se rechaza con 400.
Referencias inexistentes al crear: 400 VALIDATION_ERROR; recurso a editar/borrar ausente:
404 NOT_FOUND; duplicado: 409 CONFLICT. Ninguna escritura acepta archivos, URLs nuevas,
páginas, identidad/rol, auth_user_id, id o campos calculados. En objetos la historia sigue
en descripcion_publica, fotografía en imagen_publica preincluida y fuente en fuente.
PDF simulado: elección local sin petición, subida, bytes persistidos ni registro de carga.

## Validaciones mínimas

Trim y longitud: titulo/nombre hasta 160; descripciones/historia hasta 10000; notas hasta 2000; teléfono hasta 40 (string, no número); fuente hasta 1000; requisitos hasta 30 elementos de 1000 caracteres. Requeridos no vacíos, excepto descripcion/historia de iglesia que permiten "" (también en PATCH), y direccion de catálogo sin información; fechas y horas válidas, enums estrictos, ids válidos, iglesia/categoría existentes. Texto plano renderizado sin HTML arbitrario. Incluir tests para campos no permitidos y referencias a iglesia inexistente.

## Modelo y datos iniciales

Iglesia 1:N Material, HorarioMisa, Actividad, GuiaTramite; Categoría fija 1:N Material; Material 1:0..1 DocumentoEjemplo. Administrador conserva UUID/auth_user_id UNIQUE FK/activo, añade rol y iglesia_id FK nullable: un general con iglesia_id:null y un parroquial como máximo por iglesia con asignación obligatoria, incluso si está inactivo. Se retira el singleton de auth_user sin alterar hashes/IDs/sesiones existentes. Alta operativa separada, nunca pública. El rol técnico compartido tiene RLS amplia: el aislamiento por usuario final lo comprueba Express, no una identidad individual de PostgreSQL. Guía única por (iglesia_id,tipo), slug único por iglesia. Representar DocumentoEjemplo mediante el mínimo mecanismo de servidor que proteja páginas y respete el contrato; no almacenamiento de archivos adicional obligatorio. No copiar secretos de otros proyectos.

Conservar las semillas y datos existentes de Mérida. Añadir las cuatro iglesias aprobadas de Campeche/Puebla y guías vacías por confirmar, sin inventar muestras de materiales, horarios o actividades para ellas. Todo contenido sintético tiene es_ejemplo:true o estado_verificacion:ejemplo. La cuenta admin se configura aparte con autorización del usuario.

## Pruebas de contrato prioritarias

- Visitante consulta ocho iglesias y filtro 4/2/2 por estado y fichas sin contenido privado.
- Documento privado devuelve 401 sin sesión en ruta admin y 403 por ruta pública; usuario autenticado no administrador recibe 403.
- Administrador accede al documento privado y modifica registros permitidos.
- Actividades filtra fecha/iglesia sin mezclar datos; misas recurrentes conservan su día correcto.
- Cambiar público→privado bloquea lectura pública del documento.
- Validación de campos, estados HTTP y respuesta de error coherentes.
- Carga PDF simulada no genera petición de upload ni guarda bytes.
