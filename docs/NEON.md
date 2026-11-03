# Neon — PostgreSQL, decisión aprobada el 25 octubre 2026

> Fase2:009→010 aplicadas por Miguel. Siguiente cambio011→012→013 preparado, sin ejecutar por Codex.
> No repetir001–008. Campos/rutas y pasos en [CATALOGO_FASE_2.md](CATALOGO_FASE_2.md).


> Administración aprobada y preparada: ver [ADMINISTRACION.md](ADMINISTRACION.md). Better Auth ya instalado y probado localmente;
> migraciones/alta e integración con Neon siguen pendientes. Los apartados antiguos de admin describen el estado previo.


Miguel confirmó que el proyecto **iglesias** ya existe y solo tiene la base de datos
activada. No crear otro proyecto, activar Auth, Data API, Storage ni servicios adicionales.
Miguel confirmó que ejecutó 001–004 correctamente y cargó las nueve tablas/semillas. No se ejecutó SQL remoto ni se comprobó la configuración real del proyecto desde este entorno.
Presupuesto $0, sin instalaciones ni publicación en este cambio.

## Qué ejecutar y dónde

En Neon Console → proyecto **iglesias** → **SQL Editor**, seleccionar explícitamente
la rama y base de datos existentes que Miguel destine a la aplicación y el rol propietario.
La selección de rama/base en SQL Editor está descrita en la
[documentación oficial](https://neon.com/docs/get-started/query-with-neon-sql-editor).
La autorización actual prepara archivos: **no autoriza ejecutarlos remotamente**.

Antes de aplicar, revisar que estas tablas no existan en esa base. Si existen o ya se
aplicó una versión anterior, detenerse y revisar su estructura; no borrar, repetir
semillas ni intentar adaptar datos existentes con estos archivos de creación.

```sql
SELECT tablename FROM pg_tables WHERE schemaname='public'
AND tablename IN ('iglesias','categorias','materiales','documentos','paginas',
                 'horarios','actividades','tramites','administrador');
SELECT rolname FROM pg_roles WHERE rolname='iglesias_api';
```

**001–004 ya ejecutados por Miguel: no repetirlos.** La secuencia siguiente se conserva como referencia para una base vacía. Tras revisar y autorizar ejecución remota, copiar el contenido **completo de cada archivo**
en SQL Editor y ejecutarlo por separado en este orden, esperando éxito antes del siguiente:

1. [`backend/sql/001_iglesias.sql`](../backend/sql/001_iglesias.sql): iglesias y cuatro semillas aprobadas.
2. [`backend/sql/002_modelo_completo.sql`](../backend/sql/002_modelo_completo.sql): ocho tablas restantes, relaciones, restricciones y RLS.
3. [`backend/sql/003_semillas_ejemplo.sql`](../backend/sql/003_semillas_ejemplo.sql): categorías y muestras ficticias de materiales, documentos/páginas, horarios, actividades y guías.
4. [`backend/sql/004_acceso_publico.sql`](../backend/sql/004_acceso_publico.sql): rol SQL propio `iglesias_api`, permisos de lectura y políticas RLS públicas.

Cada archivo tiene transacción y está pensado para una sola aplicación. Un fallo revierte
ese archivo, no los anteriores. No se necesita extensión, esquema auth ni roles de otro
proveedor. Las restricciones de FK, categorías/tipos, longitudes, fechas/horas y requisitos
se conservan. No se ejecuta el arnés local de pruebas en Neon.

Conteos esperados al finalizar: iglesias **4**, categorías **2**, materiales **36**,
documentos **20**, páginas **140**, horarios **58**, actividades **12**, trámites **16**,
administrador **0**. La cuenta propietaria puede ver todos los datos: no es una prueba de RLS.
Contenido sintético marcado como ejemplo; teléfonos null. En objetos la historia sigue en
descripcion_publica, fotografía en imagen_publica y procedencia en fuente, sin campos nuevos.

## Acceso y documentos privados

`iglesias_api` es un rol PostgreSQL **NOLOGIN**, no propietario y sin BYPASSRLS.
Agrupa permisos de lectura para el futuro backend público; no es autenticación de personas.
No depende de roles gestionados por un proveedor. Tiene acceso a campos públicos de fichas,
incluidas las fichas reservadas, pero no a descripcion_interna, administrador o escrituras.
RLS filtra documentos y páginas usando la visibilidad actual del material. Cambiar a privado
debe bloquear la lectura desde la base además del control de Express.

El futuro adaptador debe consultar columnas explícitas: `SELECT *` de materiales fallará
por la columna interna no autorizada. Para devolver una ficha privada, Express sigue calculando
`bloqueado:true` y `tiene_documento:false`; el documento público sigue devolviendo 403.
Una fila filtrada por RLS no debe convertirse incorrectamente en un 404 de material privado:
consultar primero la ficha/visibilidad. Mantener no-store en documentos y permisos en servidor.
No devolver páginas como parte de un listado o ficha. PDFs siguen simulados, sin archivos,
URLs privadas públicas, buckets ni upload. Las páginas de ejemplo solo admiten texto e imagen_url null.

No usar la credencial propietaria de Neon en la aplicación: los roles creados por consola
pueden heredar privilegios que eluden RLS; los roles limitados deben crearse por SQL.
Véase [roles de Neon](https://neon.com/docs/manage/roles). El 004 concede el rol al ejecutor
para permitir pruebas con SET ROLE, sin cambiar quién es propietario de las tablas.
No se conceden permisos administrativos ni escrituras hasta adaptar autenticación.

## Validación disponible y pendiente

Desde la raíz, sin conexión remota ni instalaciones:

```sh
python3 backend/test/validar_sql_local.py
```

El arnés usa PostgreSQL 17 ya instalado, base temporal y modo single sin red/sockets.
Ejecuta 001→004, verifica semillas, integridad, restricciones, singleton, permisos y
metadatos de políticas. No crea esquema Auth ni roles específicos de proveedores.
Ese modo elude el filtrado RLS: **no prueba el efecto real de las políticas** ni Neon.

Para comprobar RLS de verdad, se preparó
[`backend/test/sql/validar_rls.sql`](../backend/test/sql/validar_rls.sql). No se ejecutó.
Tras autorizar esa comprobación remota, ejecutar completo en SQL Editor sobre las semillas
recién cargadas, como el propietario que aplicó 004. Abre una transacción, usa SET LOCAL ROLE
iglesias_api, espera 36 fichas/12 documentos públicos/84 páginas públicas, rechaza columnas
internas y administrador y prueba un cambio temporal público→privado. Termina en ROLLBACK;
el resultado final esperado es `RLS_NORMAL_OK`. Si falla, revertir con ROLLBACK antes de seguir.
No usar sobre contenido ya editado: las cantidades y UUID de prueba corresponden a estas semillas.

La suite HTTP actual de Express sigue siendo independiente de Neon y requiere sockets locales.
Consultar TAREAS.md para resultados reales; probar fixtures no demuestra conexión remota.

## Conexión preparada y puesta en marcha pendiente

Express ya usa `src/lecturas.js` y `src/db.js`, no `backend/data/`. Conserva contrato y
frontend. Si falta configuración o falla PostgreSQL, devuelve 500 INTERNAL_ERROR sin
trazas ni datos locales de sustitución. Las tablas de horarios/actividades mantienen
sus filtros; las consultas convierten fecha/hora en texto YYYY-MM-DD / HH:mm sin UTC.

Dependencia mínima: **pg 8** (node-postgres), autorizada por Miguel. Miguel confirmó
que ya instaló pg y configuró backend/.env. Sin dotenv ni otro SDK.
La aplicación carga `.env` con Node 24; el driver se importa al usar la primera consulta.

Cada conexión verifica que el login no sea propietario ni tenga/herede privilegios
superuser, BYPASSRLS, creación de roles/BD o lectura global, y que disponga de iglesias_api.
Cada consulta usa BEGIN READ ONLY → SET LOCAL ROLE iglesias_api → consulta parametrizada
→ COMMIT, con ROLLBACK/liberación ante error. TLS verifica certificados; el pool es pequeño
y reutilizable en una función Vercel. Referencias de [consultas parametrizadas](https://node-postgres.com/features/queries)
y [TLS](https://node-postgres.com/features/ssl). La consulta de documento lee visibilidad,
documento y páginas en una única instantánea, sin ventana entre validar y obtener páginas.

### 1. Crear solo el login técnico, no un administrador

Tras revisar y autorizar ese cambio remoto, como propietario en SQL Editor del proyecto
iglesias y la base correcta, ejecutar **solo**
[`backend/sql/005_login_backend.sql`](../backend/sql/005_login_backend.sql), una vez.
Crea iglesias_backend LOGIN INHERIT sin privilegios elevados, le concede iglesias_api
(sin ADMIN OPTION) y CONNECT a la base actual. No crea contraseña, tablas, Auth ni usuarios
de la aplicación. Si el nombre ya existe, detenerse y revisar; no borrar ni sustituirlo.
No crear este login mediante Add role en la consola: podría heredar neon_superuser.

Para asignar la contraseña sin escribirla en archivos, comandos o historial SQL,
abrir **desde tu terminal** una sesión psql del propietario con contraseña interactiva
(usando host, base y rol reales de Connect, sin pegarlos en esta documentación/chat):

```sh
PGSSLMODE=require psql -h HOST_NEON -U ROL_PROPIETARIO -d BASE
```

Dentro de psql:

```text
\password iglesias_backend
\q
```

psql solicita la nueva contraseña dos veces sin mostrarla. Guardarla privadamente.
Estos comandos remotos están **pendientes**, no se ejecutaron aquí. No instalar psql si
no está disponible sin acordarlo antes. No cambiar contraseñas del propietario ni otros proyectos.

### 2. Guardar DATABASE_URL sin exponer credenciales

En Neon → Connect, seleccionar la rama/base y el rol **iglesias_backend**. Conservar
los parámetros TLS proporcionados. Para la primera prueba puede usarse conexión directa;
la conexión pooled se revisará al integrar Vercel. No usar la URL del propietario.

Desde la raíz del proyecto:

```sh
umask 077
cp -n backend/.env.example backend/.env
chmod 600 backend/.env
```

Abrir backend/.env en un editor local y reemplazar solo su placeholder DATABASE_URL con la
URL privada del login restringido. Si se construye manualmente, codificar los caracteres
reservados de usuario/contraseña como URL. No usar echo con la URL, no mostrar cat .env,
no enviarla al navegador ni ponerla en variables VITE_. No se leyó ni editó un .env real aquí.

backend/.gitignore contiene `.env`, `.env.*` y la excepción `!.env.example`. Las reglas se
comprobaron en un repositorio temporal, sin copiar secretos. En este entorno el proyecto
no se reconoce como repositorio Git, por lo que no se pudo comprobar seguimiento real.
**Cuando exista un repositorio**, verificar desde la raíz:

```sh
git check-ignore -v backend/.env
git ls-files --error-unmatch backend/.env
```

El primero debe indicar la regla; el segundo debe terminar sin encontrar un archivo seguido
(salida 1). Si aparece seguido, no publicar y revisar su retirada del índice. Esta comprobación
no requiere imprimir contenido. No se creó repositorio Git/GitHub en el proyecto.

### 3. Instalar lo ya autorizado y comprobar desde tu terminal

Con Node 24 de nvm, cuando npm tenga acceso al registro:

```sh
export PATH=/home/miguel/.nvm/versions/node/v24.21.0/bin:$PATH
cd backend
npm install --save-exact pg@8
npm test
npm run check:neon
npm start
```

La instalación fija la versión 8 resuelta y actualiza package-lock.json; omitir ese paso
si ya se completó (Miguel confirmó pg instalado).
`check:neon` realiza **solo lecturas remotas** y transacciones de lectura, usando .env:
verifica rol no propietario, cuatro iglesias, cero documentos/páginas privados visibles,
notas internas denegadas con SQLSTATE 42501, y 403 para los materiales privados del servicio.
Requiere que las semillas tengan materiales privados y documentos públicos; una colección
vacía de documentos no se considera prueba aprobada. No imprime URL, notas ni páginas.
La ejecución intentada desde Codex quedó bloqueada por DNS, como se detalla abajo;
no llegó a comprobar acceso, autenticación o RLS del proyecto.

### Diagnóstico seguro del verificador

`npm run --silent check:neon` imprime una sola línea JSON con **etapa y código**,
sin mensajes del driver, URL, contraseña, host, usuario, contenido ni stack. En éxito:
`{"etapa":"completado","codigo":"OK"}`. En fallo, termina con salida 1.
Node carga .env internamente; los errores de carga también se convierten en códigos seguros.
El script npm ya no usa --env-file, para evitar diagnósticos sin filtrar antes del script.

| Etapa / código | Interpretación |
|---|---|
| configuracion / ENV_FILE_UNAVAILABLE | No se pudo cargar .env; solo se admite su ausencia si DATABASE_URL ya está definida |
| configuracion / DATABASE_URL_INVALID | Falta URL o su estructura es inválida |
| configuracion / TLS_MODE_INVALID | Modo TLS no admitido |
| configuracion / DRIVER_UNAVAILABLE | Falta el módulo pg |
| conexion / NET_EAI_AGAIN, NET_ENOTFOUND | Resolución DNS fallida |
| conexion / NET_ECONNREFUSED, NET_ETIMEDOUT, NET_EPERM | Conexión rechazada, agotada o bloqueada por el entorno |
| conexion / TLS_CERTIFICATE_INVALID | Error de validación de certificado TLS |
| autenticacion / PG_28P01, PG_28000 | PostgreSQL rechazó autenticación/autorización inicial |
| permisos / IGLESIAS_API_REQUIRED | Falta pertenencia heredable a iglesias_api |
| permisos / PRIVILEGED_LOGIN, OWNER_LOGIN | Login elevado o propietario, rechazado por el adaptador |
| permisos / PG_42501, PG_42704 | Permiso denegado o rol/objeto requerido inexistente |
| configuracion / PG_3D000, PG_42P01, PG_42703 | Base, tabla o columna no encontrada |
| rls_documentos / PRIVATE_ROWS_VISIBLE | Una consulta vio documentos/páginas privados |
| rls_documentos / PUBLIC_ROWS_EMPTY | No se ven documentos/páginas públicos esperados |
| permisos_notas / INTERNAL_NOTES_VISIBLE | La columna interna no quedó denegada |
| rls_fichas / PRIVATE_FLAGS_INVALID | La ficha privada no cumple el contrato |
| consulta / CONSULTA_FAILED | Error no reconocido; no se imprime su texto por seguridad |

El código 42501 es **esperado** únicamente al probar descripcion_interna; el 403 FORBIDDEN
es esperado al pedir un documento privado. Los demás errores se propagan con su categoría,
sin confundir una pérdida de conexión con un fallo de RLS. Este diagnóstico no altera permisos.

La ejecución desde el entorno de Codex terminó en `conexion / NET_EAI_AGAIN`: no llegó a
verificar credenciales, permisos o RLS. Eso no identifica el fallo de la terminal de Miguel.
Para obtener su etapa real, desde backend con Node 24:

```sh
npm run --silent check:neon
```

Compartir solo ese JSON, nunca .env, la URL ni logs completos del driver.

En otra terminal, con la API iniciada:

```sh
curl -i 'http://localhost:3001/api/iglesias'
curl -i 'http://localhost:3001/api/iglesias/catedral/materiales'
curl -i 'http://localhost:3001/api/materiales/20000000-0000-4000-8000-000000000000/documento'
curl -i 'http://localhost:3001/api/materiales/20000000-0000-4000-8000-000000000003/documento'
```

Con las semillas actuales: lista/datos públicos 200; el último documento privado 403 sin
contenido. Confirmar que las fichas no incluyen descripcion_interna/páginas y que los privados
muestran bloqueado:true y tiene_documento:false. Fallos de conexión deben mostrar un error
real sin respuesta de demostración. Estos resultados HTTP siguen pendientes.

### Autenticación administrativa

**Pendiente de adaptar.** No se activa Neon Auth ni se implementa autenticación alternativa,
contraseñas de personas, sesiones/JWT propios, registro, escrituras ni lectura administrativa.
La tabla administrador sigue vacía y sin identidad vinculada. El login iglesias_backend es
exclusivamente una credencial técnica restringida de PostgreSQL, no la cuenta de Miguel.
La selección de PDF sigue siendo una simulación sin subir ni guardar bytes.

SUPABASE.md y los registros antiguos de TAREAS son históricos y han quedado superados;
no ejecutar sus pasos ni configurar sus claves/proveedores.
