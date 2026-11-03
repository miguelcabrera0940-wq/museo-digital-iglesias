# Backend — Incrementos 1 a 4

> Fase2 (30/10/2026): catálogo de ocho, estado/ciudad y filtro GET /api/iglesias?estado=.
> 009→010 ya aplicadas por Miguel. Ahora011→012→013 pendientes: cuentas por iglesia, límite y urnas.
> Contrato y entrega: [CATALOGO_FASE_2.md](../docs/CATALOGO_FASE_2.md).


> Administración aprobada y preparada: ver [../docs/ADMINISTRACION.md](../docs/ADMINISTRACION.md). Better Auth ya instalado y probado localmente;
> migraciones/alta e integración con Neon siguen pendientes. Los apartados antiguos de admin describen el estado previo.


API pública de lectura preparada para Neon con consultas parametrizadas en
`src/lecturas.js`, conexión restringida en `src/db.js` y sin fallback a datos locales.
`data/` y los servicios anteriores se conservan para semillas/pruebas explícitas;
la aplicación de producción no los importa. Contenido de demostración identificado
mediante `es_ejemplo`/estado ejemplo, sin teléfonos inventados.

Express 5 ya instalado. Única dependencia nueva: **pg 8**, autorizada por Miguel;
Miguel confirmó su instalación y la configuración de backend/.env. La comprobación
desde este entorno sigue bloqueada por DNS; no se afirma integración remota aprobada.
Sin dependencias de desarrollo:
Node >=22.12 incluye watch, fetch y node:test. No necesita CORS con el proxy de Vite.

Desde `backend/`, una vez instaladas las dependencias y configurado `.env`:

```sh
npm start
# En otra terminal, desde backend/:
npm test
curl http://localhost:3001/api/iglesias
curl http://localhost:3001/api/iglesias/santa-ana
# Verifica rol real, filtrado RLS y exclusión de notas; hace lecturas remotas:
npm run check:neon
```

`npm start` y `npm run dev` cargan `.env` con Node (sin dotenv). El servidor escucha en 127.0.0.1:3001.
Si falta configuración/pg o falla la conexión, las lecturas devuelven 500 INTERNAL_ERROR
sin trazas; no se sustituyen por fixtures. El pool mantiene como máximo tres conexiones,
verifica TLS y rechaza logins propietarios/con privilegios elevados antes de consultar negocio.
Cada lectura usa transacción READ ONLY y SET LOCAL ROLE iglesias_api.
El verificador devuelve únicamente JSON con etapa/código seguro, sin URL ni mensajes SQL:
`npm run --silent check:neon`. Códigos e interpretación en docs/NEON.md.
Vite conserva `/api`: GET `/api/iglesias` devuelve `{data: [...]}` y
GET `/api/iglesias/:slug` devuelve `{data: {...}}` o 404 `NOT_FOUND`.
El frontend sin mocks puede consumirlo con su configuración actual.
No hay endpoints admin, upload ni escrituras en estos incrementos.

Museo y biblioteca consultan las tablas; sus semillas contienen nueve fichas por
iglesia (tres privadas), todas ficticias con `es_ejemplo:true`. No se importan mocks
del frontend. UUID compatibles con sus muestras. Endpoints adicionales:

- GET `/api/iglesias/:slug/materiales`: todas las fichas, o filtro opcional
  `?categoria=libros-documentos` / `?categoria=objetos`; categoría inválida devuelve 400.
- GET `/api/materiales/:id`: ficha pública; UUID inválido devuelve 400 y ausente 404.
- GET `/api/materiales/:id/documento`: páginas públicas de ejemplo, 404 sin documento
  y 403 si privado (incluso sin documento asociado). Respuestas `Cache-Control: no-store`.

Las fichas privadas exponen únicamente metadatos deliberadamente públicos,
`bloqueado:true` y `tiene_documento:false`. Nunca incluyen páginas, notas internas
ni referencias privadas. Los documentos viven solo en el backend, sin rutas estáticas.
La visibilidad se comprueba en cada lectura; no hay acceso administrativo todavía.

Las pruebas HTTP requieren permiso para abrir sockets locales. Para ejecutar solo
las pruebas de lógica y protección sin sockets: `node --test test/materiales.test.js`.

Agenda pública (semillas de `data/agenda.js`, todo `es_ejemplo:true`):

- GET `/api/iglesias/:slug/horarios`: semana habitual completa, ordenada por
  `dia_semana` (0 domingo–6 sábado), `hora` e id. No depende de una fecha consultada.
- GET `/api/iglesias/:slug/actividades?fecha=2026-10-24`: eventos de esa fecha
  e iglesia, ordenados por `hora_inicio` e id. Hay muestras el 24 y 25 de octubre
  de 2026 en las cuatro iglesias; el 26 devuelve `{data:[]}`. No se generan eventos
  para fechas arbitrarias ni se deduce cierre o ausencia de misas de una lista vacía.

Fecha obligatoria y real en formato `YYYY-MM-DD`, años 0001–9999; se rechazan
fechas imposibles, timestamps y parámetros fecha repetidos con 400 y `fields.fecha`.
Slug desconocido devuelve 404. Fechas y horas representan el calendario civil de
America/Merida; se comparan como texto, sin convertir a UTC ni depender de TZ.
Pruebas de agenda sin sockets: `node --test test/agenda.test.js`.

Trámites: GET `/api/iglesias/:slug/tramites` devuelve las cuatro guías
`bautizos`, `bodas`, `misas_difuntos`, `otros`, en orden estable, o 404 NOT_FOUND
si la iglesia no existe. Datos en `data/tramites.js`, una guía por iglesia/tipo,
con requisitos ficticios explícitamente pendientes de confirmar,
`estado_verificacion:"ejemplo"` y `fuente:null`. No son requisitos oficiales.
El teléfono sigue siendo el campo de Iglesia (null, por confirmar); no se añaden
números ni campos al contrato. Pruebas sin sockets: `node --test test/tramites.test.js`.

`src/app.js` exporta Express sin abrir puertos, para reutilizarlo como handler
en una función Vercel posterior. No se configura ni publica hosting ahora.

Base de datos preparada: aplicar `sql/001_iglesias.sql`, `sql/002_modelo_completo.sql`,
`sql/003_semillas_ejemplo.sql` y `sql/004_acceso_publico.sql` por orden, solo tras revisar y autorizar ejecución
remota. Incluyen las nueve tablas del contrato, relaciones, restricciones, RLS
con lectura restringida mediante el rol propio iglesias_api. No configuran autenticación
ni asignan administrador. La credencial de servidor nunca va al navegador.

Miguel confirmó 001–004 ejecutados en Neon. **No repetirlos**. Para crear el login
restringido revisar `sql/005_login_backend.sql` y la guía [docs/NEON.md](../docs/NEON.md).
Autenticación administrativa pendiente de adaptar; no se habilitan escrituras ni admin.
La puesta en marcha real requiere pg instalado y DATABASE_URL privada en backend/.env.
No se implementó upload ni persistencia PDF.

SQL validable sin conexiones remotas: desde raíz,
`python3 backend/test/validar_sql_local.py` (PostgreSQL 17 ya instalado).
Comprueba integridad, permisos y configuración RLS en base temporal; no prueba
filtrado RLS real, autenticación ni integración Express/Neon. Prueba normal de RLS preparada
en `test/sql/validar_rls.sql`, pendiente de ejecutar con autorización en un servidor normal.
`python3 backend/test/validar_sql_local.py --servidor` intenta esa prueba en un PostgreSQL
local normal por socket Unix; si el entorno lo bloquea, falla sin afirmar que RLS pasó.
