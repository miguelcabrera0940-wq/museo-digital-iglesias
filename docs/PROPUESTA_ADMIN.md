> APROBADA por Miguel el 25 octubre 2026. Documento histórico del diseño; contrato
> definitivo en CONTRATO_API.md y estado real de implementación en ADMINISTRACION.md/TAREAS.md.
> Las frases «pendiente/no implementado» siguientes describen la propuesta original.

# Propuesta administrativa — pendiente de aprobación de Miguel

Fecha: 25 octubre 2026. Contrato administrativo propuesto como anexo a v1.
No implementado: no se modificó autenticación, dependencias, permisos, secretos o BD remota.
Claude hará exclusivamente frontend; Codex, backend y migraciones. Las respuestas públicas
actuales y las restricciones de documentos privados permanecen vigentes.

## Solución mínima recomendada

**Better Auth dentro de Express, con sesiones persistidas en el PostgreSQL de Neon existente.**
Una cuenta email/contraseña creada mediante un procedimiento local autorizado; una sesión
permite gestionar las cuatro iglesias y leer privados, sin iniciar sesión por iglesia/libro.
Sin registro público, recuperación de contraseña, proveedores sociales, correo transaccional
ni plugins de usuarios/organizaciones. No activar Neon Auth ni contratar otro servicio.

Dependencia directa nueva propuesta: **better-auth@1.7.13**, versión estable identificada
en sus [releases oficiales](https://github.com/better-auth/better-auth/releases/tag/v1.7.13).
Reutilizar Express 5 y pg 8 instalados. Sin ORM, express-session, cookie-parser, SDK frontend,
Redis, JWT propio, bcrypt adicional ni servicio externo de sesiones. Antes de instalar,
comprobar engines y árbol de la versión fijada con Node 24; no sustituirla silenciosamente
por otra versión. Su instalación y las migraciones requieren aprobación.

La biblioteca admite [pg.Pool](https://better-auth.com/docs/adapters/postgresql) y
[API de servidor](https://better-auth.com/docs/concepts/api). Ella verifica contraseñas,
crea/revoca sesiones y administra cookies. Express adapta sus respuestas al contrato y
decide si el usuario tiene permiso global. No reimplementar hashing, firma o tokens de sesión.
El [hash de contraseña](https://better-auth.com/docs/authentication/email-password) será
el de la biblioteca; no guardar contraseñas reversibles ni inventar una contraseña de ejemplo.

## Sesión, despliegue y acceso

- Cookie de sesión de la biblioteca: HttpOnly, Secure en HTTPS, SameSite=Lax, Path=/,
  sin Domain compartido. Solo en localhost HTTP se permite Secure=false. No devolver su
  valor/token en JSON ni guardarlo en localStorage/sessionStorage.
- Duración propuesta: **8 horas desde login**, sin renovación deslizante ni cookieCache.
  La biblioteca consulta la sesión persistida en cada solicitud protegida; logout la revoca.
  La [gestión de sesiones](https://better-auth.com/docs/concepts/session-management)
  permite configurar expiración, desactivar renovación y desactivar caché en cookie.
- Frontend y /api en el **mismo origen** de Vercel. En desarrollo, mantener proxy Vite
  localhost:5173 → Express:3001 conservando /api. APP_ORIGIN explícito por entorno, sin
  confiar en Host arbitrario ni aceptar todos los dominios *.vercel.app. Previews necesitan
  su propio origen autorizado antes de habilitar login.
- Estado persistido en Neon: sin MemoryStore, archivos locales, temporizadores o proceso
  permanente. Es un diseño compatible con funciones Node de Vercel; integración real de
  cookies, límites y sesiones entre instancias debe probarse antes de desplegar.
- Todas las respuestas /api/admin y documentos privados: Cache-Control: no-store.
  El navegador borra datos privados al cerrar sesión o recibir 401. Sin caché offline.

## Protección de login y solicitudes

Se expone únicamente la fachada Express indicada abajo. **No montar un catch-all público
de Better Auth**: no habrá rutas alternativas de signup, reset, cambio de email/contraseña,
JWT, perfiles o login que eludan nuestros límites. Configurar además disableSignUp:true.
No desactivar las protecciones de origen de la biblioteca.

La fachada llamará a auth.api.signInEmail/getSession/signOut; reenviará los Set-Cookie
individuales de la biblioteca y normalizará estado/JSON, descartando tokens/campos internos.
Es importante que el [limitador de Better Auth no cubre llamadas auth.api](https://better-auth.com/docs/concepts/rate-limit):
el límite de esta fachada se aplica **explícitamente antes** de verificar contraseñas.

Límite propuesto, activo también en desarrollo:

- **5 intentos por IP en 15 minutos** y **20 por email normalizado en 15 minutos**.
  Contar solicitudes admitidas, incluso credenciales incorrectas; ventana fija, sin
  bloqueo permanente ni prolongación de ventana al recibir otro intento rechazado.
- Contadores en PostgreSQL, compartidos entre instancias, consumo atómico de ambos cupos
  en una transacción con orden de claves fijo. No usar contadores de memoria ni un
  read-then-write sin bloqueo que permita superar el límite con concurrencia.
- Guardar claves HMAC de IP/email y fecha de ventana, no contraseña ni IP/email en claro.
  Usar crypto nativo con dominio separado para estas claves. Limpieza acotada de ventanas
  antiguas durante solicitudes; sin cron ni servicio adicional.
- En producción obtener la IP únicamente del encabezado que Vercel sobrescribe, con
  configuración de proxy explícita; no confiar en una cadena enviada por el cliente.
  [Encabezados de Vercel](https://vercel.com/docs/headers/request-headers). En local usar la
  dirección de socket; una IP no disponible usa un cupo compartido, no desactiva el límite.
- Agotado un cupo: 429 RATE_LIMITED y Retry-After en segundos. Sin indicar si el email
  existe. Un atacante que conozca el email puede agotar su cupo por hasta 15 minutos:
  es el coste de este límite global sencillo, sin CAPTCHA ni bloqueo permanente.
- Si falla Neon/contador, no continuar login sin límite: 500 INTERNAL_ERROR, sin fallback.

CSRF: login/logout/escrituras aceptan solo Origin igual a APP_ORIGIN, JSON cuando llevan
cuerpo y encabezado X-Iglesias-Admin: 1. Rechazar Origin ausente/inválido en mutaciones;
sin CORS permisivo. Esto protege también el login previo a tener una sesión.
Después de login, GET /admin/sesion devuelve csrf_token ligado a esa sesión. Se propone
derivarlo con HMAC y etiqueta propia sobre el id interno de la sesión, usando el secreto
del servidor y comparación de tiempo constante. No es un token de autenticación.
Exigirlo como X-CSRF-Token en logout y toda escritura autenticada. La sesión la sigue
verificando Better Auth. Claude conserva este token solo en memoria.

## Contrato de autenticación propuesto

Base /api, JSON y envolturas de v1. Estos endpoints usan **cookie**, no Authorization Bearer.
Se propone sustituir la redacción antigua de renovación de cliente Auth por el flujo de
expiración descrito aquí. No cambia la autenticación de ninguna ruta pública, que sigue abierta.

| Método y ruta | Entrada | Respuesta y conducta |
|---|---|---|
| POST /admin/login | {email,password}; X-Iglesias-Admin: 1 | 200 {data:{administrador:true}} y cookie. Luego pedir /admin/sesion. No devuelve token. |
| GET /admin/sesion | Cookie; X-Iglesias-Admin: 1 | 200 {data:{administrador:true,expira_en,csrf_token}}; expira_en ISO 8601 UTC de la sesión. |
| POST /admin/logout | Cookie, X-Iglesias-Admin: 1 y X-CSRF-Token; sin cuerpo | 204 sin cuerpo; revoca sesión y borra cookie. Idempotente si ya expiró/no existe sesión: valida origen y limpia cookie, sin exigir un CSRF de una sesión inexistente. |

Login solo admite email/password: email trim y normalizado para comparación; contraseña
sin trim. Email válido hasta 254 caracteres; password obligatorio hasta 128. La contraseña
inicial se elegirá privadamente con al menos 12 caracteres, no se prescribe aquí su valor.
Cuerpo login máximo 4 KiB; escrituras de negocio máximo 256 KiB, además de límites por campo.

Credenciales incorrectas/email inexistente: 401 UNAUTHENTICATED, mismo mensaje
«Correo o contraseña incorrectos.», sin revelar cuál falló. Sesión ausente/expirada/revocada:
401 UNAUTHENTICATED. Usuario autenticado sin vínculo global activo: 403 FORBIDDEN.
Si login verifica una cuenta sin permiso, revocar la sesión recién creada y no entregar
su cookie. Fallo de origen/CSRF: 403 FORBIDDEN. Entrada inválida: 400 VALIDATION_ERROR
con fields; cuerpo grande: 413 PAYLOAD_TOO_LARGE. Errores de biblioteca/DB se traducen
a errores de v1, sin trazas, cookies ni SQL. Se propone añadir **429 RATE_LIMITED** solo
para este límite administrativo, manteniendo {error:{code,message}} y Retry-After.

Logout solo se considera completado tras 204. Si falla la red/DB, limpiar datos privados
de la pantalla y mostrar el fallo/reintento; no afirmar que la sesión se revocó.
Con 401 durante uso: limpiar privados/csrf de memoria e ir a login, conservando únicamente
una ruta de retorno interna validada. No hay refresh endpoint ni reintento automático de
escrituras: al cumplirse ocho horas se vuelve a iniciar sesión.

## Comprobación de permisos en servidor

En **cada** operación administrativa: verificar la sesión con Better Auth, obtener su
user.id validado y consultar administrador por el vínculo de identidad y activo=true.
Nunca recibir el id de autorización, rol, administrador:true o iglesia autorizada del cliente.
La cuenta global sirve para las cuatro iglesias; no se pide otra contraseña para leer libros.
Las validaciones de negocio se ejecutan tras autenticar/autorizar, para no filtrar existencia
de privados a visitantes. La expiración/revocación y desactivación deben afectar a la siguiente
solicitud protegida; no cachear permisos por proceso o en el navegador.

Mantener dos credenciales técnicas, ambas limitadas y sin propiedad/BYPASSRLS:

- DATABASE_URL actual → iglesias_backend/iglesias_api: solo API pública. No ampliar sus permisos.
- DATABASE_URL_ADMIN nueva → iglesias_backend_admin, miembro de iglesias_auth y
  iglesias_gestion. Better Auth solo usa sus tablas; operaciones de negocio autorizadas
  usan transacción y SET LOCAL ROLE iglesias_gestion con lista explícita de columnas.
  No reutilizar el helper público READ ONLY ni elevar su conexión al recibir una cookie.

La conexión administrativa puede verificar sesión/permiso, pero no sirve contenido privado
ni ejecuta una escritura hasta pasar ambos controles. RLS concede a iglesias_gestion las
operaciones necesarias y a iglesias_auth solo acceso a sus tablas. Ningún rol de ejecución
puede añadir/quitar administradores, crear roles/tablas, cargar PDFs ni cambiar páginas.
Solo el procedimiento operativo autorizado realiza migraciones/alta inicial; no la API.

## Gestión de negocio: contrato propuesto para Claude

Todas las rutas siguientes exigen sesión y permiso global. Las mutaciones, además, CSRF.
Mantener 200 con data para lectura/PATCH, 201 con data al crear y 204 sin cuerpo al eliminar.
IDs UUID de negocio, referencias existentes, campos desconocidos o PATCH vacío rechazados.
Un PATCH nunca cambia id, iglesia_id ni slug. Los campos calculados no son editables.

| Método y ruta | Campos admitidos / resultado |
|---|---|
| GET /iglesias y GET /iglesias/:slug | Lecturas públicas actuales para selector/datos de iglesia; no duplicar rutas. |
| PATCH /admin/iglesias/:slug | historia, descripcion, telefono string o null. Devuelve Iglesia de v1. |
| GET /admin/iglesias/:slug/materiales | Lista administrativa de esa iglesia, orden por id. |
| GET /admin/materiales/:id | Ficha administrativa individual para abrir edición por enlace directo. Nuevo endpoint administrativo propuesto. |
| POST /admin/materiales | Requeridos iglesia_id,categoria_id,tipo,titulo,descripcion_publica,visibilidad; opcionales descripcion_interna,fuente. |
| PATCH /admin/materiales/:id | categoria_id,tipo,titulo,descripcion_publica,visibilidad,descripcion_interna,fuente. |
| GET /admin/materiales/:id/documento | Documento de ejemplo público o privado de v1; 404 si no hay documento. |
| POST /admin/horarios | iglesia_id,dia_semana,hora; nota opcional string/null. |
| PATCH /admin/horarios/:id | dia_semana,hora,nota. |
| DELETE /admin/horarios/:id | Eliminar horario; confirmación de Claude antes de enviar. |
| POST /admin/actividades | iglesia_id,tipo,titulo,fecha,hora_inicio,descripcion; hora_fin,nota_visitas opcionales/null. |
| PATCH /admin/actividades/:id | tipo,titulo,fecha,hora_inicio,hora_fin,descripcion,nota_visitas,es_ejemplo boolean si se envía, conforme al PATCH previsto por v1. |
| DELETE /admin/actividades/:id | Eliminar actividad; confirmación antes de enviar. |
| PATCH /admin/tramites/:id | titulo,requisitos[],fuente,estado_verificacion. |

Horarios/actividades/trámites se leen con las rutas públicas existentes, incluida fecha
obligatoria para actividades; siguen separados recurrentes y eventos con fecha. Para editar
un registro que no está en el estado actual, volver a consultar su iglesia/fecha; no añadir
lecturas administrativas duplicadas de esos recursos. No DELETE de materiales/iglesias,
CRUD de categorías, cuentas, documentos o páginas. Las cuatro guías siguen preincluidas.

Ficha administrativa: campos de Material v1 + descripcion_interna; bloqueado:false y
tiene_documento real, incluso si privado, porque el servidor ya autorizó al lector.
No devuelve páginas ni referencias de archivo dentro de la ficha. Material nuevo:
es_ejemplo:true, imagen_publica:null, sin documento, tiene_documento:false. No admitir
URLs o archivos nuevos desde el cliente; imágenes preincluidas permanecen de servidor.
En objetos usar descripcion_publica para historia, imagen_publica para foto y fuente.

Conservar enums/longitudes/fechas/horas/requisitos de v1 y coherencia categoría/tipo.
Errores 404 NOT_FOUND, 409 CONFLICT y demás según v1. Cambiar visibilidad debe bloquear
inmediatamente el documento por la ruta pública, también cuando el navegador conserva
una ficha previa. No invalidar esa protección porque haya una cookie de administrador:
la ruta pública seguirá dando 403 al documento privado y el admin usará su propia ruta.

## Migraciones necesarias propuestas — todavía no escritas/ejecutadas

| Archivo previsto | Cambio concreto |
|---|---|
| 006_auth_base.sql | Cuatro tablas Better Auth con prefijos auth_user, auth_session, auth_account, auth_verification, FK e índices según el esquema de la versión fijada; user.id interno text. Índice único de constante para permitir solo un usuario; proveedor de cuenta solo credential. Añadir administrador.auth_user_id text UNIQUE NOT NULL con FK a auth_user y activo boolean default true, manteniendo id UUID/singleton existentes. Abortar si la reserva administrativa no está vacía. |
| 007_limites_login.sql | Tabla login_limite con clave_hmac, ventana_inicio timestamptz, intentos no negativo y PK compuesta; índices/operación atómica y eliminación acotada de ventanas antiguas. Ningún dato secreto en semillas. |
| 008_roles_administrativos.sql | Roles PostgreSQL iglesias_auth/iglesias_gestion y login iglesias_backend_admin sin privilegios elevados. RLS y GRANT por tabla/columna; no tocar permisos de iglesias_api. Sin contraseñas en SQL. |

Auth runtime: SELECT de user/account; gestión de sesiones y contadores; no INSERT/DELETE
de usuarios, creación de cuentas o cambio de hashes. verification queda sin escritura
mientras no se usen flujos que la necesiten. Las columnas/DDL exactos se revisarán contra
la versión fijada antes de ejecutar; no usar migraciones automáticas contra Neon ni otorgar
DDL al runtime para que la biblioteca cree tablas al arrancar.

Gestión: SELECT de administrador, categorías y datos; UPDATE de columnas de iglesia,
INSERT/PATCH de fichas permitidos, CRUD autorizado de horarios/actividades, PATCH de guías,
SELECT de documentos/páginas privados. Sin INSERT/UPDATE/DELETE de administrador,
documentos/páginas, ni DELETE de materiales/iglesias. Las políticas no dependerán de un
auth.uid() externo ni de roles declarados por el navegador.

Alta inicial: script local de Codex, sin endpoint HTTP, usando la biblioteca para crear
usuario/cuenta y hash, autoSignIn:false y credenciales solicitadas de forma privada.
La capacidad de alta solo existe en ese proceso operativo, nunca en la configuración
del servidor desplegado. Conexión operativa autorizada y restringida a esa provisión,
separada de los logins runtime. Vincular después el id a administrador y comprobar el
permiso; si falla el vínculo, no habilitar sesión/acceso. Detenerse si ya existe una cuenta,
sin sobrescribir credenciales. No dejar contraseña, email real o tokens en migraciones,
semillas, argumentos de terminal, TAREAS o respuestas. No se configura esa cuenta ahora.

Variables propuestas, solo servidor: BETTER_AUTH_SECRET aleatorio de al menos 32 bytes,
APP_ORIGIN, DATABASE_URL_ADMIN; DATABASE_URL pública actual se conserva. No se genera ni
edita ningún secreto en esta propuesta. No dar al frontend la conexión o secreto de firma.

## Entrega y orden después de aprobación

1. Aprobar biblioteca/version, sesión cookie de ocho horas, límites de login, cambios
   administrativos indicados (sesión con csrf/expiración, 429 y detalle de material).
2. Codex instala únicamente lo autorizado, prepara los tres SQL exactos revisables y el
   script de provisión, e implementa backend con pruebas. Nueva autorización antes de
   ejecutar migraciones/roles/secretos en Neon; no repetir 001–005 ya aplicados.
3. Claude prepara exclusivamente UI y cliente fetch con credentials:'same-origin',
   X-Iglesias-Admin y CSRF en mutaciones; formularios usan whitelists de esta propuesta.
   Tras login obtiene /admin/sesion; mantiene sesión al cambiar iglesia; borra privados
   con logout/401. Sin SDK de autenticación adicional ni protección solo de botones.
   Mientras no se apruebe, esta especificación es borrador y no hay endpoints disponibles.
4. Probar con PostgreSQL/sesiones reales: cookie HttpOnly/Secure, origen/CSRF, login válido,
   mensajes de credenciales inválidas, 429 concurrente desde dos instancias, reinicio sin
   perder sesión/contadores, expiración/logout y vínculo desactivado con 403. Comprobar
   que una sesión válida sin administrador no obtiene datos; las escrituras/admin privados
   sin sesión dan 401 y las rutas públicas conservan sus campos/bloqueos.
5. Probar CRUD/validaciones/referencias y cambio público→privado; biblioteca privada solo
   por admin. Selección PDF no envía peticiones ni guarda bytes/entrada de carga. Suite
   completa y build del frontend con Claude; Vercel/same-origin/cookies se validan antes
   de publicar, con autorización de despliegue aparte.

Esta propuesta no da por comprobada ninguna de esas pruebas. El OK de check:neon fue
reportado por Miguel para la conexión pública actual, no certifica administración.
