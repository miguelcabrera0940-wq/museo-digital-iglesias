# Estado y tareas — Iglesias

Estado inicial del arnés: preparado el 24 octubre 2026. No se creó aplicación, no se instalaron dependencias ni se ejecutaron pruebas de producto. No hay GitHub requerido todavía.

## Tablero inicial

### Terminado (planeación)
- Cuatro iglesias/ubicación y coordenadas, experiencia pública y diseño conceptual.
- Presupuesto $0, tecnologías, reparto Claude/Codex, sesión única y privados.
- Carga PDF simulada; exclusión de economía, reservas y datos sensibles.
- Contrato inicial documentado en este arnés; aún no validado contra implementación.
- Resumen de continuidad incorporado: Debian, versiones npm pendientes de comprobación local, Leaflet directo y fuentes locales propuestas.

### Pendiente (orden de trabajo)
1. Claude inspecciona carpeta existente sin sobrescribir, propone árbol mínimo y dependencias exactas. No instalar hasta autorización.
2. Ambos revisan contrato v1: confirmar compatibilidad técnica y compartir cambios mediante este documento; no rediscutir requisitos aprobados.
3. Claude estructura frontend y sus capas de acceso a API; Codex prepara backend siguiendo mismo contrato. Trabajar en carpetas separadas, sin editar simultáneamente archivos compartidos.
4. Incremento 1: mapa real de Mérida, cuatro iglesias, tarjetas e interior.
5. Incremento 2: biblioteca/museo, fichas, lector público, bloqueo público de privados.
6. Incremento 3: horarios recurrentes, actividades por fecha, requisitos y teléfono.
7. Incremento 4: Supabase Auth y permiso admin, formularios persistentes, biblioteca/lector privado y selector PDF simulado.
8. Integración: retirar mocks de negocio, gestionar errores/carga/vacíos y comprobar permisos de servidor.
9. Validar móvil/escritorio, pruebas de API y permisos, build e instrucciones de ejecución.
10. Cuando Miguel autorice: GitHub y despliegue gratuito. Configurar secretos sin exponerlos y comprobar producción. Documentar evidencias reales.

Ventana objetivo: cuatro jornadas de trabajo. Jornada 1 estructura/contrato e inicio; 2 funciones públicas/backend; 3 integración/admin/pruebas; 4 correcciones/publicación/documentación. Ajustar por progreso real sin ampliar alcance.

## Pendientes de diseño no bloqueantes

Figma: Santa Ana, conexiones, leyenda y FigJam actualizados, diseño visual. No seguir intentando MCP con cuota agotada. Reutilizar especificaciones del contexto directamente en el frontend; no ejecutar PARCHE_GENERADOR_FIGMA.js como parte del proyecto web.

## Pendientes de contenido

Fotos reutilizables, fuentes históricas, teléfonos/horarios/requisitos oficiales. Sustituibles en beta por ejemplos identificados; no inventar datos oficiales. Verificar visualmente marcadores sobre mapa. No entrevista requerida.

## Registro breve al terminar cada sesión

- Hecho:
- Archivos afectados:
- Pruebas/comprobaciones realmente ejecutadas:
- Bloqueos y decisiones pendientes:
- Siguiente acción concreta:


## Sesión 24 octubre 2026 — Claude Code, Incremento 1 (preparación; instalación pendiente de autorización)

- Hecho: Arnés copiado a la raíz sin borrar `ARNES_IGLESIAS_ACTUALIZADO/` (el LEEME pide `CLAUDE.md`, `AGENTS.md` y `docs/` en la raíz; estaban en una subcarpeta). Escritos —sin instalar— `frontend/` con: arranque Vite, `tokens.css`/`global.css`, `api/cliente.js` (errores del contrato) + `iglesias.js` + `usarApi.js`, mocks aislados (`VITE_USAR_MOCKS=true`, con aviso visible), `Mapa` (Leaflet directo, atribución OSM, «Ver las cuatro iglesias», marcadores con coordenadas aprobadas), `TarjetaIglesia` con «Entrar», `Interior` con botones superpuestos, estados de carga/error/vacío y rutas `/`, `/iglesias/:slug` (museo/horarios/tramites muestran «estará disponible pronto»).
- Entorno local comprobado: Node v24.21.0, npm 11.19.0, Debian (Linux 6.12). Cumple todos los engines (Node >= 22.12.0). Puertos 3001 y 5173 libres. Firefox disponible.
- Versiones verificadas con `npm view` (existen y engines coinciden con el resumen): react/react-dom 19.3.1, react-router-dom 7.18.4 (>=20), leaflet 1.9.4 (sin engines), @supabase/supabase-js 2.118.0 (>=22), vite 8.3.5 y @vitejs/plugin-react 6.1.2 (^20.19 || >=22.12). `package.json` fija versiones exactas y `engines`.
- Comprobaciones realmente ejecutadas: `node --test` en `frontend/` → 6/6 pasan (cliente de API: data, 204, error del contrato con fields, error sin JSON, éxito sin `data`, fallo de red). Contrastes calculados: texto/pergamino 14,8; pergamino/madera oscura 14,1; pergamino/vino 9,5; tinta/dorado 5,5; borde dorado/madera oscura 5,2 (todos >= 4,5 salvo el borde, que cumple 3:1 de no-texto).
- NO ejecutado (requiere `npm install`): `npm run build`, `npm run dev`, revisión visual del mapa y de marcadores sobre calles, revisión a 390 px y 1440 px. El código de React/Leaflet aún no se ha compilado ni ejecutado: puede tener errores.
- Pendiente de autorización: instalar 4 dependencias + 2 de desarrollo (arriba). `@supabase/supabase-js` se difiere al Incremento 4 (no se usa antes).
- Fuentes Lora/Inter: no descargadas aún; `--fuente-titulo/cuerpo` usan Georgia/system-ui como alternativa. Al descargarlas se confirmará la licencia en el archivo incluido y se declarará `@font-face` solo entonces.
- Sin fotografías: `foto_interior` es null en los mocks y `Interior` muestra una textura de madera con «La fotografía interior se añadirá próximamente». No hay fotos licenciadas aprobadas.
- Mocks: `src/mocks/iglesias.js` (`es_ejemplo: true`); retirar en integración. Una API caída muestra error, nunca mocks.
- Para Codex: puerto propuesto 3001 (proxy de `/api` en `vite.config.js`). Contrato v1 sin cambios; el frontend usa solo `GET /api/iglesias` y `GET /api/iglesias/:slug`. Pedir al backend `foto_interior`/`foto_exterior` como rutas públicas o null.
- Siguiente acción: con autorización, `npm install`, `npm run build`, `npm run dev` con y sin mocks, captura a 390/1440 px en Firefox, descarga de fuentes y cierre del Incremento 1.

## Cierre del Incremento 1 — 24 octubre 2026 (Claude Code)

- Autorizado por Miguel: 4 dependencias + 2 de desarrollo, versiones exactas, instaladas en `frontend/`; `npm install` sin vulnerabilidades. Supabase diferido al Incremento 4.
- Fuentes: `Inter.woff2` y `Lora.woff2` (subconjunto latino, variables 400–700) descargadas de Google Fonts (`fonts.gstatic.com`) a `frontend/public/fuentes/`, con `OFL-lora.txt` y `OFL-inter.txt` (de `google/fonts`). Licencia verificada en los archivos: SIL OFL 1.1 ambas. `@font-face` en `src/estilos/fuentes.css`. Sin CDN en ejecución. Solo trazo normal: no hay cursiva real (el navegador la sintetiza en un texto).
- Corregido tras revisar capturas: hueco blanco entre aviso y cabecera; título del interior desalineado con los botones.
- Comprobaciones realmente ejecutadas:
  - `npm run build` → correcto (38 módulos; JS 413 kB / 127 kB gzip; CSS 19 kB), repetido tras las correcciones.
  - `node --test` → 6/6 (sesión previa; sin cambios en `cliente.js`).
  - Vite dev con `VITE_USAR_MOCKS=true`, capturas con Firefox 153 headless a 390 y 1440 px: mapa (cuatro marcadores, atribución «Leaflet | © colaboradores de OpenStreetMap», zoom, botón «Ver las cuatro iglesias», lista de iglesias), interior (botones superpuestos legibles, regreso, «Por confirmar» en teléfono), ruta inexistente (404 con «Volver al mapa»), `/iglesias/santa-ana/museo` («estará disponible pronto»), aviso de demostración, fuentes Lora/Inter aplicadas.
  - Sin mocks y sin backend: `GET /api/iglesias` por el proxy devuelve HTTP 502 (no hay Express en 3001). El cliente lo convierte en error (prueba unitaria); no hay sustitución por mocks.
- NO comprobado: (1) clic en marcadores, selección, «Entrar», «Ver las cuatro iglesias» y navegación por teclado: Firefox headless solo captura y no hay herramienta de automatización instalada; (2) mapa totalmente cargado: las capturas se tomaron con teselas a medio cargar (huecos grises), así que no se verificó la posición exacta de los marcadores sobre los edificios; (3) la pantalla de error con el backend caído (la captura salió en «Cargando…»); (4) accesibilidad con lector de pantalla; (5) el chunk de mocks (~1 kB) sigue en `dist` aunque la bandera esté desactivada.
- Cómo comprobarlo Miguel: `cd frontend && VITE_USAR_MOCKS=true npm run dev`, abrir http://localhost:5173 en Firefox, probar con F12 → vista adaptable a 390 y 1440 px: clic en cada marcador y en cada botón de la lista, «Entrar», los tres botones del interior, «Regresar al mapa», Tab para el foco. Sin la variable (`npm run dev`) y sin backend debe mostrar «Cargando…» y luego el error con «Intentar de nuevo».
- Pendiente de contenido: fotografías reales de interior/exterior (el interior muestra una textura con «La fotografía interior se añadirá próximamente»); historia, teléfonos y horarios verificados.

### Entrega a Codex (backend en puerto 3001)

- Frontend listo en `frontend/`; no tocar. Backend va en `backend/` (no existe aún).
- Express en `localhost:3001`; el proxy de Vite reenvía `/api` sin reescribir la ruta, así que las rutas deben vivir bajo `/api/...` (p. ej. `/api/iglesias`).
- Ya consume: `GET /api/iglesias` (lista de las cuatro, orden estable) y `GET /api/iglesias/:slug` (404 con el error del contrato si no existe). Campos de Iglesia según CONTRATO_API v1: usa hoy `slug, nombre, descripcion, direccion, telefono, latitud, longitud, foto_interior`; `latitud/longitud` deben ser números. `foto_interior` ruta pública o `null`; `null` es válido.
- El cliente exige éxito `{"data": ...}` o 204; cualquier otra cosa sin `data` se trata como error. Errores `{"error":{"code","message","fields"?}}`.
- CORS no hace falta en desarrollo (proxy). Contrato v1 sin cambios ni propuestas de cambio.
- Siguiente (Incremento 2, Claude): biblioteca/museo, fichas y lector público; necesitará `GET /api/iglesias/:slug/materiales`, `GET /api/materiales/:id` y `GET /api/materiales/:id/documento`.

## Refinamiento visual con Impeccable — 24 octubre 2026 (Claude Code)

- Impeccable sigue instalada (`~/.claude/skills/impeccable`); ofrece comandos de diseño (critique, polish, layout, typeset, etc.). No hay PRODUCT.md/DESIGN.md: se trató como ajuste acotado y no se creó ninguno.
- Alcance: solo `global.css`, `paginas/publico/Mapa.jsx` (textos/clases de la lista) e `Interior.jsx`. Lógica, rutas y componente `Mapa` sin cambios. Sin dependencias nuevas.
- Cambios: filete dorado en cabecera; título mayor; marco de madera/dorado en el mapa; lista de iglesias en Lora con punto igual al marcador; ficha con «Entrar» a ancho completo y mensaje guía antes de elegir; interior con placa legible, ícono SVG en lugar de «←», descripción en Lora y Dirección/Teléfono como lista de definición; una animación de entrada, desactivada con `prefers-reduced-motion`.
- Comprobado: `npm run build` correcto; `node --test` 6/6; detector de Impeccable sin hallazgos; capturas Firefox a 390 y 1440 px de inicio e interior (también con movimiento reducido).
- No comprobado: clics y teclado (igual que antes); el estado «sin iglesia elegida» solo se vio a 1440 px y la tarjeta seleccionada no se capturó.

## Backend Incremento 1 — 24 octubre 2026 (Codex; instalación pendiente)

- Inspección: leídos AGENTS.md, contexto, contrato y última entrega. Backend inexistente; confirmado proxy Vite que conserva `/api`. Frontend y contrato sin cambios.
- Preparado `backend/`: Express con `GET /api/iglesias` y `GET /api/iglesias/:slug`, envoltura `data`, errores JSON del contrato, 404 para slug/ruta desconocidos y escrituras no implementadas. Arranque local en 127.0.0.1:3001; app exportada separadamente sin escuchar puertos, reutilizable en una función Vercel. Sin publicación ni configuración de hosting.
- Datos locales preincluidos: exactamente las cuatro iglesias, UUID y coordenadas aprobados, orden catedral/tercera-orden/santa-lucia/santa-ana, campos del contrato y números para coordenadas. Textos ficticios con `es_ejemplo:true`; teléfonos, fotos y fuentes null. No hay conexión remota ni persistencia todavía.
- SQL revisable: `backend/sql/001_iglesias.sql`, tabla iglesias y mismas cuatro semillas, restricciones, RLS sin políticas de acceso de navegador, permisos anon/authenticated revocados y solo SELECT para service_role. Transacción de una sola aplicación; no ejecutada ni validada en PostgreSQL. Auth y tablas de incrementos posteriores quedan pendientes.
- Dependencias propuestas: **solo Express 5**, rango `^5.1.0`; ninguna de desarrollo (Node incluye watch, fetch y node:test). Autorización de instalación solicitada a Miguel; no se instaló nada. Versión resuelta y lockfile pendientes. No hacen falta CORS, dotenv ni SDK Supabase en este incremento.
- Verificación real: Node v24.21.0 encontrado en `~/.nvm/versions/node/v24.21.0/bin` (fuera del PATH inicial). `node --check` correcto para app.js, server.js y app.test.js. Suite frontend `node --test --test-reporter=tap`: salida exitosa, **1 archivo aprobado**; este entorno no desglosó los seis casos internos, por lo que no se afirma 6/6 en esta sesión.
- Suite backend `node --test`: **falló al cargar**, `ERR_MODULE_NOT_FOUND: express`; las cuatro pruebas HTTP preparadas no llegaron a ejecutarse. Cubren lista/detalles, campos públicos, rutas desconocidas/inyección, URL inválida y rechazo de escrituras. No se afirma que el servidor arranque ni que haya integración HTTP comprobada.
- Bloqueos: instalación pendiente de autorización según AGENTS.md. Consulta de metadatos `npm view express version engines` falló por DNS `EAI_AGAIN registry.npmjs.org`; no se verificó versión disponible. No se ejecutó build del frontend porque no se modificó.
- Siguiente: tras autorización y con acceso al registro, instalar Express en backend, generar lockfile, ejecutar suite HTTP y probar ambos endpoints en puerto 3001 mediante proxy Vite. Aplicar SQL remoto requiere autorización separada; no es necesario para probar estos datos locales.

## Reintento autorizado de Express — 24 octubre 2026 (Codex)

- Miguel autorizó instalar Express 5 como única dependencia directa en `backend/` y ordenó detenerse si persistía el fallo DNS, sin reinstalar Node ni usar sudo.
- Ejecutado con Node **v24.21.0** de nvm: `npm install --fetch-retries=0 --fetch-timeout=15000 --cache=/tmp/iglesias-npm-cache`, desde `backend/`.
- Resultado real: salida **1**, `npm error code EAI_AGAIN`; `request to https://registry.npmjs.org/express failed, reason: getaddrinfo EAI_AGAIN registry.npmjs.org`. Instalación no completada; trabajo detenido según la instrucción de Miguel.
- No se ejecutaron pruebas HTTP ni comprobaciones de los endpoints en puerto 3001: Express sigue sin instalarse. No se reinstaló Node, no se usó sudo ni se ejecutó SQL en Supabase. Frontend y contrato sin cambios.
- Siguiente: cuando se resuelva el acceso DNS al registro npm, reanudar la instalación ya autorizada, ejecutar las pruebas HTTP y comprobar lista/detalle en puerto 3001.

## Verificación tras instalación desde terminal de Miguel — 24 octubre 2026 (Codex)

- Miguel informó que `npm install` terminó correctamente en `backend/`. Se usó Node **v24.21.0** de nvm; Express ya se resuelve al importar la aplicación. No se reinstalaron dependencias.
- `npm test` en backend: salida **1**, archivo de pruebas fallido. Diagnóstico con `node --test --test-isolation=none --test-reporter=tap`: **0/4 aprobadas**, los cuatro casos bloqueados por el hook de inicio con `listen EPERM: operation not permitted 127.0.0.1`. El cierre también informa `ERR_SERVER_NOT_RUNNING` porque el servidor no llegó a escuchar. Esto no verifica el comportamiento de los endpoints ni demuestra un fallo de sus respuestas: el entorno impide abrir el socket local.
- `npm start` en backend: salida **1**, mensaje `No se pudo iniciar la API en el puerto 3001.` No quedó un servidor iniciado por esta sesión.
- Consultas reales con `curl --noproxy '*' --max-time 5 --include` a `http://127.0.0.1:3001/api/iglesias` y `http://127.0.0.1:3001/api/iglesias/santa-ana`: ambas terminaron con salida **7**, `Failed to connect ... Could not connect to server`. No se obtuvieron respuestas HTTP; integración en puerto 3001 pendiente.
- Suite completa disponible del frontend: `node --test --test-isolation=none --test-reporter=tap src/api/cliente.test.js` desde frontend, **6/6 aprobadas**. Sin cambios a frontend, contrato ni implementación del backend en esta sesión; solo se actualizó este registro. No se ejecutó SQL ni se accedió a Supabase.
- Siguiente: verificar desde una terminal que permita sockets locales: `cd backend && npm test`, luego `npm start` y, en otra terminal, `curl http://localhost:3001/api/iglesias` y `curl http://localhost:3001/api/iglesias/santa-ana`. Las pruebas HTTP y las respuestas en 3001 siguen pendientes de evidencia exitosa.

## Incremento 2 (frontend) — Museo y Biblioteca — 24 octubre 2026 (Claude Code)

- Estado: **frontend hecho solo contra mocks; NO integrado.** El backend actual responde 404 a `GET /api/iglesias/:slug/materiales`, `GET /api/materiales/:id` y `GET /api/materiales/:id/documento` (comprobado con curl en 3001). Sin `VITE_USAR_MOCKS=true` estas pantallas mostrarán el error real de la API (404); no se sustituye en silencio.
- Hecho (rutas nuevas): `/iglesias/:slug/museo` (estantería + selector Libros y documentos / Objetos con conteo, `?categoria=`), `/iglesias/:slug/museo/:materialId` (ficha), `/iglesias/:slug/museo/:materialId/leer` (lector). «Misas y actividades» y «Trámites» siguen en «estará disponible pronto».
- Composición (Impeccable, modo Experience): estantería de madera oscura con tablas continuas, lomos de altura/ancho variados con bandas doradas y texto vertical; objetos como nichos de arco; ficha con la portada de muestra (misma tonalidad que el lomo) sobre una «mesa» de madera; lector como libro abierto de cubierta vino con lomo central (dos páginas en ≥900 px, una en móvil), Anterior/Siguiente de 56 px con extremos deshabilitados, indicador «Páginas 1–2 de 7», flechas del teclado y arrastre horizontal complementario.
- Privados: lomo/nicho con candado, rayado y texto «acceso reservado» para lectores de pantalla; la ficha muestra solo título, descripción pública y «Acceso reservado», sin botón Leer. Si se pidiera el documento de un privado (403) se muestra el mensaje sin «Intentar de nuevo». Nunca se renderizan páginas privadas.
- Archivos: `src/api/materiales.js`, `src/mocks/materiales.js` (9 materiales por iglesia, 3 privados, `es_ejemplo:true`, esquema del contrato), `src/paginas/publico/{Museo,Ficha,Lector,paginacion}.js(x)`, `src/componentes/{Estanteria,Portada,Iconos}.jsx`, `src/estilos/museo.css`; `App.jsx` y `main.jsx` actualizados; `Estados.jsx` sin reintento en 403.
- Comprobado: `npm run build` correcto; `node --test` 9/9 (6 del cliente + 3 de paginación: móvil, pares en escritorio con última página impar, acotado y vacío); detector de Impeccable sin hallazgos; capturas Firefox headless con mocks a 390 y 1440 px de estantería (libros y objetos), ficha pública y reservada, lector (escritorio, móvil) y documento reservado (403).
- NO comprobado: clics, teclado, flechas y arrastre del lector (no hay automatización); lector de pantalla; la pantalla de error con el backend real (la captura salió en «Cargando…»); títulos reales largos; fotos reales (las portadas son cubiertas de muestra dibujadas, no fotografías); escritorio 900–1100 px intermedio.
- Aviso al contrato (sin cambiarlo): el frontend pide **todas** las fichas con `GET /iglesias/:slug/materiales` (sin `?categoria=`) y filtra por `categoria_id`; para ficha comprueba `iglesia_id` contra el id de la iglesia del slug. Espera `documento.paginas[].texto` en texto plano.
- Siguiente (Codex): implementar esos tres endpoints según CONTRATO_API v1 (privados: `bloqueado:true`, `tiene_documento:false`, 403 en `/documento`). Después, Claude retira los mocks de materiales y repite la revisión contra la API real.

## Incremento 2 (backend) — Museo y Biblioteca — 24 octubre 2026 (Codex)

- Leída la entrega anterior de Claude y las rutas/campos de contrato v1. Implementados `GET /api/iglesias/:slug/materiales`, `GET /api/materiales/:id` y `GET /api/materiales/:id/documento`, conservando `/api` y envoltura `data`. Lista completa por defecto, filtro opcional estricto `categoria=libros-documentos|objetos`, orden estable y aislamiento por iglesia. UUID inválido: 400; iglesia/material/documento público ausente: 404; errores según contrato.
- Datos ficticios solo en backend: nueve materiales por iglesia, tres privados; UUID compatibles con las muestras de Claude, `es_ejemplo:true`, imágenes/fuentes null y documentos de siete páginas de texto ficticio. No se importan archivos del frontend. Sin persistencia, Auth ni acceso administrativo todavía.
- Protección: ficha construida mediante lista explícita de campos públicos, sin documento, notas internas ni rutas privadas. Privados devuelven siempre `bloqueado:true`, `tiene_documento:false`. Leer su documento produce 403 FORBIDDEN, incluso si no tienen documento asociado. Visibilidad comprobada en cada lectura, sin rutas estáticas para los datos, `Cache-Control: no-store` en la ruta de documentos, incluidos errores.
- Archivos: `backend/data/materiales.js`, `backend/src/materiales.js`, `backend/src/app.js`, `backend/test/materiales.test.js`, `backend/test/app.test.js`, `backend/README.md` y este registro. Se actualizó el antiguo test que esperaba 404 para el listado de materiales. Hooks HTTP acotados a su suite; cierre del servidor solo si está escuchando.
- Verificación real con Node **v24.21.0** de nvm: sintaxis correcta para los módulos nuevos/modificados y suite HTTP. Pruebas sin sockets `node --test --test-isolation=none --test-reporter=tap test/materiales.test.js`: **5/5 aprobadas** (filtros/aislamiento, validaciones, proyección pública y privados, documentos públicos/ausentes, reclasificación público→privado inmediata).
- Suite completa backend `node --test --test-isolation=none --test-reporter=tap`: salida **1**, **5 aprobadas y 8 canceladas**; hook HTTP bloqueado por `listen EPERM: operation not permitted 127.0.0.1`. No se verificaron respuestas HTTP reales en esta sesión. Pruebas HTTP preparadas para listado/detalle/documentos, 403 sin contenido, no-store, entradas inválidas, 404 y ausencia de acceso estático.
- Suite completa disponible frontend, mismo comando desde `frontend/`: **9/9 aprobadas**. No se ejecutó build porque no se cambió frontend. No se instalaron dependencias, no se modificó contrato/frontend, no se ejecutó SQL local ni remoto y no se publicó.
- Siguiente: desde terminal con permiso de sockets, ejecutar `cd backend && npm test`; reiniciar el backend en puerto 3001 y revisar las nuevas pantallas sin mocks. Integración visual y respuestas HTTP siguen pendientes de evidencia; Auth/admin corresponden al incremento posterior.

## Incremento 3 (frontend) — Horarios y actividades — 24 octubre 2026 (Claude Code)

- Estado: **frontend hecho solo contra mocks; NO integrado.** El backend responde 404 a `GET /api/iglesias/:slug/horarios` y `GET /api/iglesias/:slug/actividades?fecha=…` (curl en 3001). Sin `VITE_USAR_MOCKS=true` la pantalla muestra el error real; no se sustituye por datos ficticios. Backend, contrato y demás pantallas sin cambios; sin dependencias nuevas.
- Ruta: `/iglesias/:slug/horarios` (botón «Misas y actividades» del interior, sin tocar) con `?fecha=AAAA-MM-DD` opcional; sin fecha o con fecha inválida/inexistente (p. ej. 2026-02-30) se usa hoy.
- Pantalla: «Actividades de hoy» y «Elegir otro día» (panel con 7 días «Hoy/Mañana/…» y selector nativo de fecha); fecha elegida visible como hoja de calendario + texto largo («Sábado 24 de octubre de 2026», «Hoy»); «Día anterior/Día siguiente». **Misas habituales del día** (de `/horarios`, filtradas por `dia_semana` de la fecha local) separadas de **Actividades con fecha** (de `/actividades?fecha=`), con textos que aclaran la diferencia; «Ver los horarios de toda la semana» (lunes→domingo, «Por confirmar» si no hay). Horas en «7:00 p. m.»; rango «De 10:00 a. m. a 12:00 p. m.»; `nota_visitas` solo como «Para visitantes» informativo. Sin actividades: «No hay actividades registradas para este día. Esto no significa que no haya misas ni que la iglesia esté cerrada.» Sin horario habitual ese día: «Todavía no tenemos registrado un horario habitual… Puede estar por confirmar.» Carga, error (con reintentar) y vacío por sección: horarios e iglesia cargan una vez; actividades se recargan al cambiar de día.
- Fechas: `src/fechas.js` trabaja con texto AAAA-MM-DD en hora local, sin UTC; `dia_semana` se deriva de la fecha local (0 domingo – 6 sábado).
- Archivos: `src/fechas.js(+test)`, `src/api/agenda.js`, `src/mocks/agenda.js` (horarios y actividades por iglesia, `es_ejemplo:true`, valida `fecha` como el contrato: 400 VALIDATION_ERROR), `src/paginas/publico/Horarios.jsx`, `src/estilos/horarios.css`; `App.jsx` y `main.jsx` registran ruta y estilos (Trámites sigue en «estará disponible pronto»).
- Diseño (Impeccable): continuidad con pergamino/madera/vino/dorado y Lora/Inter; horas grandes en Lora como lista tipográfica (sin tarjetas anidadas ni bordes laterales de color), controles de 56 px, textos ≥1rem (18/20 px), foco visible, un bloque por idea; tira de 7 días con el último ocupando el ancho completo en móvil para no dejar un botón huérfano.
- Comprobado: `npm run build` correcto; `node --test` 14/14 (6 cliente + 3 paginación + 5 de fechas; las 5 de fechas también con `TZ=America/Merida`, `UTC`, `Pacific/Kiritimati` y `Pacific/Pago_Pago`: sin desfase de día); detector de Impeccable sin hallazgos. Capturas Firefox headless con mocks en `docs/capturas/`: `horarios-hoy-390.png`, `horarios-hoy-1440.png`, `horarios-domingo-1440.png` (panel abierto + actividades), `horarios-vacio-390.png` (sin actividades), `horarios-sin-habitual-390.png` (Santa Lucía, lunes sin horario habitual), `horarios-fecha-invalida-1440.png`. Se corrigieron tras verlas: aviso «Horarios de ejemplo» estirado, «Día siguiente» partido en dos líneas, botón huérfano en la tira de días, rango de horas partido en escritorio.
- NO comprobado: clics, foco por teclado, Tab/Enter y el selector nativo de fecha (no hay automatización; solo capturas); lector de pantalla; la pantalla de error con el backend real (la captura salió en «Cargando…»; con el 404 actual el texto será «No encontramos lo que buscas» con «Volver al mapa», poco claro para este caso); medianoche con la página abierta (la fecha de «hoy» se calcula al renderizar); días intermedios entre 640 y 900 px; zonas horarias del navegador distintas a la de Mérida (las pruebas cubren la lógica, no la pantalla).
- Para Codex (sin cambiar contrato): `GET /iglesias/:slug/horarios` (lista, orden estable por `dia_semana` y `hora`) y `GET /iglesias/:slug/actividades?fecha=` (fecha obligatoria y válida; 400 con `fields.fecha`). El frontend solo usa `dia_semana`, `hora`, `nota`, `tipo`, `titulo`, `hora_inicio`, `hora_fin`, `descripcion`, `nota_visitas`, `es_ejemplo`, `id`. Horas `HH:mm`.
- Siguiente: Codex implementa ambos endpoints; luego Claude retira `mocks/agenda.js`, revisa contra la API real y mejora el mensaje de error 404 para esta pantalla. Después, Incremento de Trámites y celebraciones.

## Incremento 3 (backend) — Horarios y actividades — 24 octubre 2026 (Codex)

- Revisada la entrega de Claude y el contrato v1. Añadidos `GET /api/iglesias/:slug/horarios` (semana completa, orden por dia_semana/hora/id) y `GET /api/iglesias/:slug/actividades?fecha=YYYY-MM-DD` (solo eventos de esa fecha/iglesia, orden por hora_inicio/id), con envoltura `data` y errores del contrato. Slug exacto de iglesia existente o 404.
- Fecha obligatoria, real y de cuatro dígitos de año (0001–9999): validación gregoriana con años bisiestos, sin Date ni conversiones UTC. Formato incorrecto, fecha imposible, timestamp y query repetida devuelven 400 VALIDATION_ERROR con `fields.fecha`. Fechas/horas civiles de America/Merida, independientes de TZ del servidor.
- Datos preincluidos ficticios para las cuatro iglesias, UUID y `es_ejemplo:true`: horarios habituales y eventos concretos del 24/25 de octubre de 2026 en colecciones separadas. El 26 y otras fechas sin registros devuelven actividades `[]`; no cambian los horarios, no generan eventos ni añaden indicadores de cierre/ausencia de misas. Santa Lucía sin horario habitual de lunes permite revisar el caso por confirmar.
- Archivos: `backend/data/agenda.js`, `backend/src/agenda.js`, `backend/src/app.js`, `backend/src/errores.js`, `backend/src/materiales.js` (extracción de ErrorApi compartido), `backend/test/agenda.test.js`, `backend/test/app.test.js`, `backend/README.md` y este registro. Frontend y contrato intactos; sin instalaciones, publicación, SQL ni acceso remoto.
- Comprobaciones reales con Node **v24.21.0** de nvm: `node --check` correcto para app.js, agenda.js, errores.js, data/agenda.js y ambas pruebas modificadas/nuevas. Suite completa backend `node --test --test-isolation=none --test-reporter=spec`: salida **1**, **11 pruebas de lógica aprobadas**, **11 HTTP canceladas** al fallar el hook con `listen EPERM: operation not permitted 127.0.0.1`. No se dan por aprobadas respuestas HTTP ni integración en puerto 3001.
- Pruebas específicas `TZ=<zona> node --test --test-isolation=none --test-reporter=spec test/agenda.test.js`: **6/6 aprobadas en cada zona**, America/Merida, UTC, Pacific/Kiritimati y Pacific/Pago_Pago. Cubren contrato de respuestas, orden, aislamiento por iglesia/fecha, vacío sin afectar misas, validaciones/bisiestos y slug desconocido. Suite frontend, mismo comando completo desde frontend: **14/14 aprobadas**. Sin build porque no se modificó frontend.
- Pendiente en terminal de Miguel con sockets permitidos (reiniciar backend si sigue ejecutándose la versión anterior):

```sh
export PATH=/home/miguel/.nvm/versions/node/v24.21.0/bin:$PATH
cd /home/miguel/Proyectos/ProgrmacionUniversidadUTM/iglesias/backend
npm test
npm start
```

En otra terminal:

```sh
curl -i 'http://localhost:3001/api/iglesias/catedral/horarios'
curl -i 'http://localhost:3001/api/iglesias/catedral/actividades?fecha=2026-10-24'
curl -i 'http://localhost:3001/api/iglesias/catedral/actividades?fecha=2026-10-25'
curl -i 'http://localhost:3001/api/iglesias/catedral/actividades?fecha=2026-10-26'
curl -i 'http://localhost:3001/api/iglesias/catedral/actividades?fecha=2026-02-30'
curl -i 'http://localhost:3001/api/iglesias/catedral/actividades'
curl -i 'http://localhost:3001/api/iglesias/desconocida/horarios'
```

- Esperado (aún no comprobado por HTTP aquí): 200 horarios; 200 eventos distintos para 24/25; 200 `data:[]` para 26; 400 con fields.fecha para fecha imposible/ausente; 404 para iglesia desconocida. Después revisar `/iglesias/:slug/horarios` sin mocks con Claude; no aplicar SQL remoto como parte de esta comprobación.

## Incremento 4 (frontend) — Trámites y celebraciones — 24 octubre 2026 (Claude Code)

- Estado: **frontend hecho solo contra mocks; NO integrado.** `GET /api/iglesias/:slug/tramites` responde 404 en el backend actual (curl en 3001). Sin `VITE_USAR_MOCKS=true` la pantalla muestra el error real; no se sustituye por datos ficticios. Backend, contrato y pantallas aprobadas sin cambios; sin dependencias nuevas.
- Ruta: `/iglesias/:slug/tramites` (botón «Trámites y celebraciones» del interior, sin tocar), con `?tipo=bautizos|bodas|misas_difuntos|otros` (por omisión bautizos). Se eliminó `EnConstruccion.jsx` (ya sin uso).
- Pantalla: selector de las cuatro guías (siempre visibles, aunque falte una en los datos); cada guía como folleto: cabecera vino con el título, aviso de estado, **Requisitos** numerados, **Antes de ir** (indicaciones generales fijas) con doblez dorado entre columnas en escritorio, bloque de **teléfono de la parroquia** (botón «Llamar» con `tel:` si hay dígitos suficientes; si falta: «Por confirmar. Todavía no tenemos registrado un número de esta parroquia.») y pie «Fuente: …» («no indicada» si es null). Estados: carga, error (reintentar), guía ausente («Esta guía todavía no está disponible…») y requisitos vacíos.
- Honestidad: `estado_verificacion: ejemplo` → «Requisitos de ejemplo. Están pendientes de confirmar con la parroquia: no los uses como información oficial.»; `por_confirmar` → «Información por confirmar…»; `verificado` → sin aviso. Sin reservas, formularios personales ni pagos (se dice expresamente en la pantalla).
- Archivos: `src/api/tramites.js`, `src/mocks/tramites.js` (4 guías por iglesia, `ejemplo`), `src/telefono.js(+test)`, `src/paginas/publico/Tramites.jsx`, `src/estilos/tramites.css`; `App.jsx` y `main.jsx` actualizados.
- Mocks de prueba de estados (sin valor real): Santa Ana tiene la guía «otros» sin requisitos y `por_confirmar`; Santa Lucía no trae la guía «otros». En `mocks/iglesias.js` (solo mock) Santa Ana ahora lleva el teléfono ficticio `(999) 000-0000 (número de ejemplo)` para ver el caso «con teléfono»; por eso su interior ya muestra ese texto con mocks activos.
- Comprobado: `npm run build` correcto; `node --test` 16/16 (+2 de teléfono); detector de Impeccable sin hallazgos. Capturas Firefox headless con mocks en `docs/capturas/`: `tramites-bautizos-1440.png`, `tramites-bodas-390.png`, `tramites-telefono-390.png`, `tramites-sin-requisitos-1440.png`, `tramites-sin-guia-390.png`. Se corrigió tras verlas la sangría del listado de requisitos.
- NO comprobado: clics, foco y Tab/Enter, el enlace `tel:` en un teléfono real y lector de pantalla (solo capturas); pantalla de error con el backend real (en la captura salía «Cargando…»; con el 404 actual diría «No encontramos lo que buscas» con «Volver al mapa»); contraste calculado solo en las pantallas anteriores, no recalculado aquí (reutiliza la misma paleta); anchos entre 640 y 900 px.
- Para Codex (sin cambiar contrato): `GET /iglesias/:slug/tramites` debe devolver las cuatro guías (`bautizos`, `bodas`, `misas_difuntos`, `otros`) con `id, iglesia_id, tipo, titulo, requisitos[], fuente, estado_verificacion`; datos semilla con `estado_verificacion:"ejemplo"`. El frontend ordena y etiqueta por `tipo` (no depende del orden) y usa el `telefono` de `GET /iglesias/:slug`.
- Observación para Miguel/Codex (no se cambió el contrato): la guía no tiene campo de «indicaciones»; las de «Antes de ir» son texto general fijo de la pantalla. Si se quieren indicaciones por guía (p. ej. horario de atención), habría que añadir un campo coordinado.
- Siguiente: Codex implementa el endpoint; luego Claude retira `mocks/tramites.js`, repite la revisión con la API real y mejora el mensaje de error 404 de las pantallas con datos pendientes. Después: Incremento de administración (Supabase Auth, no iniciado).

## Incremento 4 (backend) — Trámites y celebraciones — 24 octubre 2026 (Codex)

- Revisados la última entrega de Claude y el contrato v1. Implementado `GET /api/iglesias/:slug/tramites` con envoltura `data`, exactamente cuatro guías por iglesia: bautizos, bodas, misas_difuntos y otros. Campos: id UUID, iglesia_id, tipo, titulo, requisitos[], fuente y estado_verificacion. Orden estable y aislamiento por iglesia; slug inexistente o no aprobado: 404 NOT_FOUND con el error habitual del contrato.
- Dieciséis guías ficticias preincluidas, todas con `estado_verificacion:"ejemplo"` y `fuente:null`. Cada requisito dice explícitamente «Ejemplo ficticio pendiente de confirmar». No se copiaron las guías ausentes/estados especiales de los mocks visuales: las cuatro iglesias reciben las cuatro guías de ejemplo del contrato. Sin teléfonos nuevos: el frontend usa Iglesia.telefono, que continúa null en backend. Sin requisitos presentados como oficiales ni reservas/formularios personales.
- Archivos: `backend/data/tramites.js`, `backend/src/tramites.js`, ruta en `backend/src/app.js`, `backend/test/tramites.test.js`, dos casos HTTP añadidos a `backend/test/app.test.js`, `backend/README.md` y este registro. Horarios y actividades sin cambios. Miguel confirmó que sus pruebas de horarios/actividades pasaron desde su terminal; esta confirmación no equivale a una nueva comprobación HTTP desde este entorno.
- Verificación real con Node **v24.21.0** de nvm: `node --check` correcto para app.js, src/tramites.js, data/tramites.js, test/tramites.test.js y test/app.test.js. Suite completa backend `node --test --test-isolation=none --test-reporter=spec`: salida **1**, **14 pruebas de lógica aprobadas** (incluidas **3/3 nuevas** de guías/campos/aislamiento, estados de ejemplo y slug inválido), **13 HTTP canceladas** por `listen EPERM: operation not permitted 127.0.0.1` en el hook. No se afirma éxito de respuestas HTTP de trámites.
- Suite frontend, mismo comando desde frontend: **16/16 aprobadas**. No se ejecutó build porque no se modificó frontend. Sin cambios al contrato, instalaciones, SQL remoto ni publicación.
- Pendiente en terminal de Miguel: con Node 24 de nvm, desde `backend/`, ejecutar `npm test` y reiniciar con `npm start`. En otra terminal:

```sh
curl -i 'http://localhost:3001/api/iglesias/catedral/tramites'
curl -i 'http://localhost:3001/api/iglesias/tercera-orden/tramites'
curl -i 'http://localhost:3001/api/iglesias/santa-lucia/tramites'
curl -i 'http://localhost:3001/api/iglesias/santa-ana/tramites'
curl -i 'http://localhost:3001/api/iglesias/desconocida/tramites'
```

- Esperado, pendiente de comprobar por HTTP: 200 con cuatro guías de ejemplo para cada iglesia y 404 con error JSON para slug desconocido. Después, Claude puede revisar la pantalla sin mocks contra la API real; no se cambió su frontend en esta sesión.

## Preparación de Supabase — esquema completo (Codex)

> Registro histórico superado el 25 octubre 2026: Miguel aprobó Neon. No ejecutar
> los pasos de Supabase siguientes; ver la última entrega y docs/NEON.md.

- Preparados SQL revisables: `backend/sql/002_modelo_completo.sql` (tras el 001 existente) y `backend/sql/003_semillas_ejemplo.sql`. El 001 conserva tabla/datos de iglesias; solo se precisó en su cabecera que no se ejecutó en Supabase. Nueve tablas: iglesias, categorias, materiales, documentos, paginas, horarios, actividades, tramites y administrador. FK obligatoria material→iglesia, categoría/tipo compatibles, un documento por material, páginas numeradas únicas, límites de textos/requisitos, fechas/horas locales, guía única iglesia/tipo y como máximo un administrador vinculado a auth.users. Índices para consultas públicas.
- RLS habilitada sin políticas de navegador; permisos anon/authenticated/PUBLIC revocados. service_role tiene lecturas y escrituras solo de columnas/operaciones del contrato; no puede asignar administrador, mover materiales, cargar documentos/páginas ni administrar categorías. **Express deberá verificar el token con Supabase Auth y comprobar auth_user_id en administrador antes de operaciones admin**; aún no se implementó ese middleware ni conexión remota. service_role elude RLS: el secreto no se entrega al navegador.
- Semillas: cuatro iglesias aprobadas en 001; 2 categorías, 36 materiales, 20 documentos ficticios, 140 páginas de texto, 58 horarios, 12 actividades y 16 guías en 003. Contenido identificado con es_ejemplo:true/estado ejemplo. Sin cuenta admin automática, teléfonos, historia real inventada ni PDF. Para objetos se reutiliza descripcion_publica como historia, imagen_publica como fotografía y fuente como procedencia; sin campos nuevos. Páginas con imagen_url null, sin rutas de archivos ni Storage. PDF sigue simulado sin subir/guardar bytes.
- Otros archivos: `backend/sql/generar_semillas.js` (solo genera texto SQL desde datos existentes), `backend/.env.example` (solo placeholders), `backend/test/sql/validar_modelo.sql`, `backend/test/validar_sql_local.py`, `docs/SUPABASE.md` (instrucciones completas y fuentes oficiales) y README backend actualizado. Sin modificaciones al frontend, contrato, servicios de la API ni dependencias.
- Verificación **ejecutada localmente**: `python3 backend/test/validar_sql_local.py` → salida 0 en PostgreSQL **17.11**, clúster temporal sin sockets ni red; 001/002/003 cargan y pasan las aserciones de conteos, FK, restricciones, singleton, GRANT y metadatos RLS. auth.users/roles son simulaciones locales. El modo single elude RLS; **no se comprobó filtrado RLS efectivo en sesiones normales**, Auth, JWT ni PostgREST. La prueba inicial que pretendía comprobarlo se corrigió para no atribuir a ese modo una garantía que no proporciona; también se confirmó EPERM al intentar un socket Unix local.
- Generador: `node --check backend/sql/generar_semillas.js` correcto. Comparación mediante Python/subprocess entre su salida y 003: idénticas. Un intento previo con spawnSync de Node quedó bloqueado por EPERM; la comparación final sí se ejecutó correctamente con Python.
- Suites completas con Node 24.21.0 de nvm: `node --test --test-isolation=none --test-reporter=spec`, desde backend → salida 1, **14 aprobadas y 13 HTTP canceladas**, hook `listen EPERM`; desde frontend → **16/16 aprobadas**. Sin build por no cambiar frontend. No se creó proyecto, configuró Auth/secreto ni ejecutó SQL remoto. Ninguna prueba local demuestra que la API ya lea Supabase.

### Pasos exactos pendientes para crear y conectar Supabase

La secuencia ampliada, consultas, cabeceras, comandos y límites de la verificación están en **[SUPABASE.md](SUPABASE.md)**. Los cambios externos de SQL, Auth y secretos requieren autorización antes de ejecutarse.

1. Dashboard: revisar cupo de organización Free para Iglesias, sin tocar Medirecorda. Si no hay cupo gratuito, detenerse; sin tarjeta, pruebas de pago, add-ons, pausas/borrados de otros proyectos ni dominio.
2. Tras autorizar creación: New project → organización Free → Iglesias → contraseña de BD privada elegida/generada por Miguel → región disponible → Free. Esperar estado listo y confirmar que se seleccionó Iglesias.
3. Tras autorizar ejecución remota: SQL Editor como postgres, aplicar **001_iglesias.sql → 002_modelo_completo.sql → 003_semillas_ejemplo.sql**, una vez por archivo. Si 001 ya se aplicó, verificar antes su estructura/datos y continuar por 002; ante divergencias detenerse, sin borrar ni sobrescribir datos.
4. Ejecutar las consultas de conteos/RLS de SUPABASE.md y registrar resultados reales: esperados 4/2/36/20/140/58/12/16/0 en las tablas indicadas. No ejecutar `backend/test/sql/validar_modelo.sql` en Supabase: depende de Auth ficticio local.
5. Tras autorizar Auth: desactivar altas públicas y acceso anónimo; conservar email/contraseña. Crear manualmente la única cuenta en Authentication → Users, verificar confirmación y copiar UUID. Revisar y ejecutar aparte el INSERT de administrador mostrado en SUPABASE.md sustituyendo el placeholder; sin contraseña/token en SQL ni semillas.
6. Tras autorizar configuración: Connect/Settings → API Keys, obtener URL, publishable y secret del proyecto Iglesias. Desde backend, copiar `.env.example` a `.env` solo si no existe y rellenarlo privadamente; secret solo en servidor, nunca VITE_ ni frontend. No leer/publicar secretos en salidas. No instalar dependencias.
7. Ejecutar desde backend el comando Node con `--env-file=.env` de SUPABASE.md para probar PostgREST sin imprimir claves: servidor espera 200 con 4 iglesias; visitante denegación 401/403. Comprobar también que un usuario Auth sin acceso administrativo no lea tablas directamente. **Pendiente: esas comprobaciones remotas no se han ejecutado.**
8. Integración de código todavía pendiente: reemplazar datos locales por consultas explícitas de servidor (fetch nativo es suficiente), formatear horas HH:mm y conservar errores/contrato. Middleware: verificar Bearer con Auth y buscar su id validado en administrador; 401 token ausente/inválido, 403 sin permiso. Mantener proyección pública de privados y revalidar visibilidad por lectura. La guía detalla esta implementación futura; configurar .env por sí solo no cambia la API actual.
9. Ejecutar pruebas HTTP/permisos desde terminal con sockets, revisar documentos privados y cambio publico→privado, rechazos de escrituras y simulación PDF sin peticiones de upload. Registrar evidencia antes de declarar integración completa o desplegar. No publicación autorizada ahora.

## Cambio aprobado a Neon — 25 octubre 2026 (Codex)

- Decisión de Miguel: PostgreSQL en Neon sustituye Supabase. Proyecto **iglesias** ya creado por Miguel, solo BD activa; no se creó otro proyecto ni se activó identidad. Autenticación de administrador **pendiente de adaptar**, sin implementar otro sistema. API pública, frontend y sus respuestas intactos; Express sigue usando datos locales hasta una integración posterior autorizada.
- SQL adaptado a PostgreSQL estándar: `backend/sql/001_iglesias.sql` y `002_modelo_completo.sql` sin auth.users, auth.uid(), claves o roles específicos del proveedor anterior. Administrador conserva singleton con id UUID interno, sin vínculo de identidad ni datos semilla. No autentica personas ni concede permisos por sí mismo. Relaciones de negocio, restricciones y datos aprobados se mantienen.
- `003_semillas_ejemplo.sql` regenerado desde `generar_semillas.js`, con mismos datos e identificadores (solo cabeceras adaptadas al propietario de Neon). Incluye 4 iglesias en 001 y, en 003: 2 categorías, 36 materiales, 20 documentos, 140 páginas, 58 horarios, 12 actividades y 16 guías. Teléfonos null; contenido ficticio identificado. Historia/foto/fuente de objetos en los campos existentes; PDF continúa simulado, sin bytes ni upload.
- Nuevo `backend/sql/004_acceso_publico.sql`: rol PostgreSQL propio **iglesias_api**, NOLOGIN y sin BYPASSRLS/propiedad. Solo lectura de datos públicos y columnas aptas de fichas, sin notas internas ni administrador. Ocho políticas RLS de lectura; documentos/páginas condicionados a visibilidad pública del material. Sin escrituras ni privilegios administrativos hasta adaptar autenticación. El futuro backend debe usar un login restringido con ese rol, no la credencial propietaria de Neon. Esto es control de permisos SQL, no un sistema nuevo de autenticación de usuarios.
- Documentación actualizada: `docs/NEON.md` es la guía vigente; `docs/SUPABASE.md` queda marcado como histórico no ejecutable. Contexto, secciones específicas de proveedor del contrato, AGENTS.md, CLAUDE.md, LEEME.md, aviso de continuidad y README backend reflejan la decisión. No se cambian campos/rutas/respuestas públicas de v1. `backend/.env.example` solo contiene DATABASE_URL ficticia; ningún .env real fue leído o modificado.
- Pruebas adaptadas: `backend/test/validar_sql_local.py` y `backend/test/sql/validar_modelo.sql` ya no simulan Auth ni roles del proveedor anterior. `python3 backend/test/validar_sql_local.py` → **salida 0**, PostgreSQL **17.11** temporal sin red/sockets: carga 001→004, verifica semillas, FK, restricciones, singleton, GRANT y metadatos RLS. Comparación exacta del generador con 003 correcta; búsqueda en todos los SQL confirma ausencia de dependencias anteriores. **Modo single no comprueba filtrado RLS efectivo** ni Neon remoto.
- Preparado `backend/test/sql/validar_rls.sql` para probar en una sesión normal con las semillas recién cargadas: 36 fichas, solo 12 documentos/84 páginas públicos, denegación de notas/administrador y cambio temporal público→privado; transacción con ROLLBACK. **No ejecutado**, requiere autorización si se usa en Neon. No ejecutar el arnés local ni validar_modelo.sql contra el proyecto remoto.
- Suites con Node 24.21.0 de nvm: `node --test --test-isolation=none --test-reporter=spec`, backend → **14 aprobadas, 13 HTTP canceladas** por `listen EPERM`, salida 1; frontend → **16/16 aprobadas**, salida 0. Sin cambios de frontend ni build. No se instalaron herramientas/dependencias, ejecutó SQL remoto, publicó ni configuró secretos/Auth.

### Archivos y orden de ejecución en Neon (pendiente de autorización remota)

En Neon Console → proyecto **iglesias** → SQL Editor: seleccionar rama/base existentes y rol propietario. Revisar primero que no existan las tablas/rol de esta aplicación (consultas en NEON.md). Si existen versiones anteriores, detenerse y revisar sin borrar/reaplicar automáticamente. Ejecutar completo cada archivo, uno por uno:

1. `backend/sql/001_iglesias.sql`
2. `backend/sql/002_modelo_completo.sql`
3. `backend/sql/003_semillas_ejemplo.sql`
4. `backend/sql/004_acceso_publico.sql`

Después de éxito y tras autorizar la verificación, `backend/test/sql/validar_rls.sql` puede comprobar RLS en el mismo SQL Editor y revertir sus cambios de prueba. Conexión de Express/driver y adaptación de autenticación se mantienen pendientes: no instalar un driver ni habilitar admin ahora. Instrucciones completas, límites y fuentes oficiales en [NEON.md](NEON.md).

## Conexión Express → Neon preparada — 25 octubre 2026 (Codex)

- Miguel confirmó ejecución correcta de **001, 002, 003 y 004 en Neon**, nueve tablas y semillas cargadas. No se repitieron ni se ejecutó SQL remoto en esta sesión. Autenticación administrativa, escrituras y lectura administrativa privada siguen sin implementar.
- Preparados `backend/src/db.js` y `src/lecturas.js`: todas las rutas públicas de app.js consultan PostgreSQL con parámetros separados ($1/$2), columnas explícitas, orden estable y proyección pública. Documento/visibilidad/páginas en una sola consulta para evitar una ventana entre autorización y lectura. Fichas privadas: bloqueado:true, tiene_documento:false; documento 403, sin páginas ni notas. Horarios HH:mm y fechas YYYY-MM-DD sin UTC. Frontend y contrato intactos.
- Conexión: pool pg pequeño con TLS y verificación de certificado; se rechaza login propietario o con privilegios/membresías elevados. Cada operación usa READ ONLY y SET LOCAL ROLE iglesias_api, rollback/liberación ante fallo. No se importa data/ desde producción ni se sustituyen errores de conexión por fixtures. Errores internos devuelven 500 INTERNAL_ERROR sin mensajes SQL, URL ni trazas.
- Los servicios previos con datos locales se conservan identificados como fixtures, utilizados solo por pruebas. Suite HTTP usa una inyección explícita de fixtures y no es una prueba de conexión a Neon. app.js exporta crearApp para probar sin activar una conexión real al importar. No se abre puerto ni se conecta al importar db.js.
- Dependencia mínima propuesta y **autorizada por Miguel: pg 8**, ninguna otra. `npm view pg version engines --json --fetch-retries=0 --fetch-timeout=10000` falló por DNS EAI_AGAIN. Tras autorización se intentó `npm install --save-exact pg@8 --cache=/tmp/iglesias-npm-cache --fetch-retries=0 --fetch-timeout=10000`, desde backend: **salida 1**, `getaddrinfo EAI_AGAIN registry.npmjs.org`. **pg no quedó instalado**. Manifest declara ^8.0.0; versión exacta resuelta y actualización de package-lock.json pendientes de instalación exitosa. No se instaló herramienta alternativa, dotenv ni otro SDK.
- Login revisable en **backend/sql/005_login_backend.sql**: iglesias_backend LOGIN INHERIT, sin SUPERUSER/CREATEDB/CREATEROLE/REPLICATION/BYPASSRLS; solo miembro de iglesias_api y CONNECT a la base actual. Sin contraseña en SQL. No es una cuenta de aplicación ni concede acceso admin. No ejecutado en Neon; validado en PostgreSQL temporal local.
- Secretos: `.env.example` solo contiene DATABASE_URL ficticia. Scripts start/dev cargan backend/.env con Node 24, sin dotenv. No se leyó ni modificó ningún .env real. `backend/.gitignore` ya contiene `.env`, `.env.*`, `!.env.example`.
- Git: `git check-ignore -v --no-index backend/.env` desde el proyecto falló con **not a git repository**. Se verificaron las mismas reglas en un repositorio temporal aislado bajo /tmp mediante check-ignore --quiet: .env/.env.local ignorados y .env.example no ignorado. No se creó repositorio en el proyecto ni GitHub. No se pudo comprobar si un .env está seguido por un repositorio real inexistente/no accesible aquí; revisar al inicializar Git, sin imprimir contenido.
- Pruebas nuevas `test/db.test.js` y `test/lecturas.test.js`: **9/9 aprobadas**, con cliente/resultados simulados; cubren rol restringido, rechazo de propietario, transacción/rollback, TLS, parámetros, proyección/privados/403, formatos, validaciones y error de conexión sin fallback. No equivalen a pruebas reales del driver o RLS.
- `python3 backend/test/validar_sql_local.py` → **salida 0**, PostgreSQL 17.11 temporal: 001–005, restricciones, GRANT, metadatos RLS y PREPARE/EXECUTE de las consultas reales del adaptador (capturadas por scripts/exportar-consultas-prueba.js). Modo single no demuestra filtrado RLS efectivo. `python3 backend/test/validar_sql_local.py --servidor` → **salida 1**, PostgreSQL no pudo crear socket Unix: Operation not permitted. RLS efectivo permanece pendiente; no se etiquetó como aprobado.
- Suites completas con Node 24.21.0 de nvm, `node --test --test-isolation=none --test-reporter=spec`: backend **23 aprobadas, 13 HTTP canceladas** por listen EPERM (salida 1); frontend **16/16 aprobadas** (salida 0). Syntax check de app.js, db.js, lecturas.js y verificar-neon.js correcto. Sin build por no cambiar frontend.
- Preparado **npm run check:neon** (`backend/scripts/verificar-neon.js`), pendiente de ejecutar por Miguel: lecturas con login restringido, cuatro iglesias, ningún documento/página privado visible, notas internas denegadas con 42501 y 403 de documentos privados. No imprime credenciales/contenido. **No ejecutado contra Neon**, por la prohibición de SQL remoto; faltan además pg y configuración local. La conexión efectiva, driver y filtrado RLS real no se dan por comprobados.

### Siguientes pasos exactos desde la terminal de Miguel

Guía ampliada actualizada en **[NEON.md](NEON.md)**. No repetir SQL 001–004.

1. Revisar y, cuando se autorice ese cambio remoto, ejecutar **solo 005_login_backend.sql** como propietario en SQL Editor de iglesias, rama/base correctas. Si el login ya existe, revisar sin borrarlo ni recrearlo automáticamente.
2. Asignar contraseña de forma privada: abrir psql con host/base/rol propietario, contraseña solicitada de forma interactiva; usar `\password iglesias_backend` y `\q`. Comando con placeholders e instrucciones en NEON.md. No introducir contraseña en archivos SQL, chat o historial; no crear el login mediante Add role, que puede heredar privilegios elevados.
3. Desde la raíz: `umask 077`, `cp -n backend/.env.example backend/.env`, `chmod 600 backend/.env`. Editar localmente DATABASE_URL con la conexión del rol iglesias_backend obtenida en Neon Connect; conservar TLS y codificar caracteres reservados si se arma manualmente. Nunca URL del propietario, nunca VITE_ ni frontend. No mostrar .env ni publicar.
4. Con Node 24 de nvm y desde backend, completar la instalación ya autorizada y las pruebas:

```sh
npm install --save-exact pg@8
npm test
npm run check:neon
npm start
```

5. En otra terminal, comprobar 200 de iglesias/materiales/documento público y 403 del privado (UUID de las semillas):

```sh
curl -i 'http://localhost:3001/api/iglesias'
curl -i 'http://localhost:3001/api/iglesias/catedral/materiales'
curl -i 'http://localhost:3001/api/materiales/20000000-0000-4000-8000-000000000000/documento'
curl -i 'http://localhost:3001/api/materiales/20000000-0000-4000-8000-000000000003/documento'
```

6. Registrar resultados reales del login, instalación, verificación y HTTP antes de dar por integrada la BD. Verificación de RLS con cambio temporal público→privado (`test/sql/validar_rls.sql`) sigue preparada para una sesión normal autorizada, no ejecutada aquí. Admin/PDF real continúan fuera de este incremento.

## Diagnóstico seguro de check:neon — 25 octubre 2026 (Codex)

- Miguel confirmó **pg instalado y backend/.env configurado**. No se reinstaló nada ni se inspeccionó/imprimió el contenido de .env; solo Node lo cargó internamente durante el verificador autorizado de lectura. No se modificaron credenciales, permisos, migraciones ni datos remotos.
- Causa del diagnóstico opaco: catch general del CLI sin etapa; además las comprobaciones de notas/documento absorbían errores no esperados, confundiendo errores de conexión/autenticación con fallos de RLS. Ahora solo se aceptan como esperados 42501 para notas y 403 FORBIDDEN para el documento privado; los demás errores se propagan.
- Archivos: `src/diagnostico-neon.js` (clasificación cerrada, nunca mensajes originales), `src/verificar-neon.js` (comprobaciones testeables), `scripts/verificar-neon.js` (carga segura de entorno y una sola línea JSON etapa/código), `src/db.js` (etapas/códigos de configuración, conexión y guardas de rol), script check:neon de package.json, pruebas de diagnóstico/db y documentación NEON.md/README. Contrato/frontend intactos.
- Verificador distingue configuración, DNS/red/TLS, autenticación PostgreSQL, permisos/rol, datos semilla y fallos RLS. No serializa error, causa, stack, mensajes, host, usuario, URL ni SQL. Códigos desconocidos se sustituyen por un código fijo; cierre no oculta el primer fallo. Los errores públicos de Express siguen siendo los del contrato.
- Ejecutado realmente desde backend con Node **24.21.0**: `npm run --silent check:neon` → **salida 1**, **`{"etapa":"conexion","codigo":"NET_EAI_AGAIN"}`**. El entorno no resolvió la conexión; no se pudieron comprobar autenticación, permisos o filtrado RLS reales. Este resultado local no permite afirmar cuál es el fallo en la terminal de Miguel.
- Pruebas afectadas `node --test --test-isolation=none --test-reporter=spec test/db.test.js test/diagnostico-neon.test.js`: **10/10 aprobadas**. Cubren categorías, AggregateError, ausencia de secretos en salida, denegaciones esperadas, RLS distinto de errores de red/autenticación y códigos de guardas de rol. Sintaxis del CLI correcta.
- Suites completas, mismo comando sin archivos: backend **29 aprobadas, 13 HTTP canceladas** por listen EPERM (salida 1); frontend **16/16 aprobadas** (salida 0). No se afirma éxito HTTP ni se ejecutó build por no cambiar frontend.
- Pendiente en la terminal de Miguel, desde backend con Node 24: **`npm run --silent check:neon`**. La salida debe ser un único JSON de etapa/código o completado/OK. Compartir solo ese JSON para precisar el diagnóstico, sin URL, contraseñas, .env ni logs originales. Interpretación de códigos en docs/NEON.md. No cambiar permisos o credenciales hasta conocer ese resultado.

## Propuesta de administración y entrega a Claude — 25 octubre 2026 (Codex)

- **Miguel confirmó check:neon con {"etapa":"completado","codigo":"OK"}.** Se registra como evidencia desde su terminal; no se repitieron consultas remotas desde Codex. La comprobación pública no certifica login, CRUD o lectura privada administrativa todavía inexistentes.
- Leídos AGENTS.md, contexto pertinente, contrato v1, última entrega, conexión/roles actuales. Propuesta concreta en **[PROPUESTA_ADMIN.md](PROPUESTA_ADMIN.md)**, pendiente de aprobación. El contrato vigente solo recibió un enlace al borrador: rutas/campos/respuestas públicas intactos.
- Recomendación: **Better Auth 1.7.13 dentro de Express**, PostgreSQL/pg existentes, una cuenta global email/contraseña y sesiones de biblioteca en Neon. Cookie HttpOnly/Secure/SameSite, ocho horas fijas, sin cookieCache ni renovación automática. Identidad de sesión y vínculo administrador activo comprobados por servidor en cada operación. Sin autenticación propia, JWT propio, servicio de identidad adicional, registro público, recuperación de contraseña, contraseñas por libro ni SDK frontend.
- Nueva dependencia directa propuesta: **better-auth@1.7.13**, release estable contrastada con fuente oficial; engines/árbol se verificarán antes de la eventual instalación con Node 24. Reutilizar express/pg; no ORM, dotenv, Redis o librería de sesiones adicional. **No instalada ni añadida a package.json** en esta entrega.
- Login mediante fachada /api/admin/login con auth.api de la biblioteca; /admin/sesion y /admin/logout definidos en el borrador. Solo esas rutas de autenticación, sin catch-all de rutas nativas. Como auth.api no aplica el rate limiter HTTP de Better Auth, se propone consumo atómico explícito en PostgreSQL: 5 intentos/IP y 20/email por ventana fija de 15 minutos, claves HMAC, 429 RATE_LIMITED/Retry-After y fallo cerrado si no se puede limitar. Sin MemoryStore ni dependencia de instancia Vercel. Riesgo del límite por cuenta: un tercero puede agotar ese cupo temporalmente; sin bloqueo permanente.
- CSRF/origen y estados del frontend especificados: JSON/cabecera de aplicación/origen exacto en login; token CSRF de sesión para escrituras/logout. Cookie no se expone en JSON; datos privados y csrf solo en memoria. La respuesta /admin/sesion propone expira_en/csrf_token además de administrador:true. 401 limpia estado y pide login; 403 niega acceso; logout solo confirmado con 204. La propuesta adapta el mecanismo administrativo, no el contrato público.
- Gestión definida: edición de iglesia; lista/ficha administrativa (nuevo GET /admin/materiales/:id propuesto), creación/edición de material y lectura del documento privado; altas/cambios/bajas de horarios y actividades; PATCH de las cuatro guías. Whitelists, respuestas 200/201/204, validaciones y errores detallados. Sin borrar iglesias/materiales, CRUD de cuentas/categorías, upload ni guardado de PDF. Objetos conservan historia en descripcion_publica y foto/fuente en campos actuales.
- Migraciones propuestas, **aún no creadas ni ejecutadas**: 006_auth_base.sql (cuatro tablas de biblioteca y vínculo único/activo de administrador, manteniendo id/singleton); 007_limites_login.sql (ventanas/contadores atómicos); 008_roles_administrativos.sql (roles propios de auth/gestión y login técnico limitado). Alta inicial mediante script local autorizado sin endpoint, usando hashing de la biblioteca y credenciales solicitadas privadamente. Sin contraseñas/tokens/email real en semillas o documentación.
- Mantener DATABASE_URL/iglesias_api pública sin permisos adicionales. Proponer DATABASE_URL_ADMIN para nuevo login restringido, roles auth/gestión con permisos mínimos y sin propiedad/BYPASSRLS. Migración/provisión separadas del runtime; la API no concede privilegios. Solo tras verificar sesión y vínculo activo se consulta privado o escribe. RLS y 403 públicos se conservan aun si el navegador tiene cookie administrativa.
- Compatibilidad propuesta con Vercel: mismo origen para sitio y /api, cookie segura, sesiones/contadores en Neon, sin disco o proceso persistente. No se validó despliegue ni se crearon archivos de hosting. Propuesta basada en documentación primaria de Better Auth y Vercel enlazada en el borrador; no se supone integración probada.
- **Para Claude:** frontend exclusivamente. Revisar el borrador; tras aprobación, preparar cliente fetch con cookies same-origin, cabeceras/CSRF y formularios según las whitelists; login → GET sesion, sesión global de cuatro iglesias, lectores privados solo mediante endpoint admin y limpieza de estado al salir/401. No instalar SDK, cambiar backend/SQL ni implementar autorización solo en UI. Mientras no se apruebe, no asumir que estas rutas existen. Ninguna contraseña de demostración.
- Verificación de esta entrega: revisión documental de API actual, esquema/roles y fuentes oficiales. **No se ejecutaron pruebas de autenticación, SQL, cambios de secretos, instalaciones ni pruebas de CRUD**, porque solo se propuso el diseño. No se modificaron implementación ni frontend; no se repitieron suites de producto sin cambios de código. El borrador contiene la batería necesaria (permisos, CSRF, expiración/logout, concurrencia de límites, dos instancias y no regresión pública) para la fase de implementación.
- Siguiente decisión de Miguel: aprobar o ajustar biblioteca/version, cookie de ocho horas, política de intentos, contrato administrativo propuesto y plan de migraciones. Aprobar la propuesta no implica ejecutar inmediatamente SQL remoto: primero Codex preparará migraciones exactas revisables y backend probado; los cambios externos de BD/roles/secretos requerirán autorización aparte.

## Administración aprobada: backend preparado — 25 octubre 2026 (Codex)

- Miguel aprobó Better Auth, sesión fija de ocho horas, CSRF y límites persistidos. Leídos AGENTS.md, contrato, contexto y última entrega. No se usaron subagentes/Graphify, cambiaron frontend/secretos reales ni ejecutó SQL remoto. La conexión pública check:neon OK continúa siendo evidencia reportada por Miguel, no se repitió.
- Dependencia **única nueva: better-auth@1.7.13**, fijada en backend/package.json. Contrastados versión/ESM/peer pg ^8.0.0 y ausencia de engines propio en el package.json oficial de esa etiqueta, compatible por configuración con Node 24.21.0 utilizado. `npm view better-auth@1.7.13 version engines peerDependencies --json --fetch-retries=0 --fetch-timeout=10000` y `npm install --save-exact better-auth@1.7.13 --cache=/tmp/iglesias-npm-cache --fetch-retries=0 --fetch-timeout=10000` → **salida 1, EAI_AGAIN registry.npmjs.org**. Biblioteca **no instalada**; árbol/transitivas y ejecución real pendientes. package-lock.json no actualizado: completar instalación antes de npm ci. Sin sudo, reinstalación de Node ni dependencias alternativas.
- Código nuevo en **backend/src/admin/{auth,db,seguridad,gestion,rutas}.js**, montaje en app.js. Fachada login/sesion/logout sin catch-all nativo, signup/recuperación o cambio de credenciales. Better Auth se importa al primer uso, sin impedir importar/usar la API pública cuando falta la biblioteca/config administrativa. Sesión persistida de 28800 segundos sin refresco/cookieCache; cookies HttpOnly/SameSite=Lax/Secure en HTTPS. API no devuelve token de biblioteca. Logout confirma ausencia de sesión antes de 204.
- Origin exacto + X-Iglesias-Admin, CSRF HMAC ligado a sesión en mutaciones, JSON 4 KiB login/256 KiB negocio y errores consistentes. Cupos 5/IP y 20/email/15min consumidos atómicamente en BD antes de contraseña: HMAC sin email/IP en claro, bloqueo en orden determinista, limpieza acotada, 429/Retry-After y fallo cerrado. IP de socket local; XFF solo en entorno Vercel. Sin contadores en memoria ni servicio extra.
- Todas las operaciones protegidas verifican sesión y vínculo administrador activo en servidor. Negocio revalida vínculo en su transacción SET LOCAL ROLE iglesias_gestion. Pool separado DATABASE_URL_ADMIN, guardas contra propietario/BYPASSRLS/membresías elevadas y parámetros separados. DATABASE_URL/rol/proyección públicos intactos: cookie admin no convierte en pública una lectura privada, notas internas siguen excluidas y documentos privados públicos continúan con 403. Sin fallback a ejemplos por fallo de BD.
- CRUD conforme a whitelists aprobadas: iglesia, lista/ficha/material nuevo o edición, documentos de ejemplo administrativos, horarios, actividades y cuatro guías. UUID/enums/longitudes/fecha real/horas locales/referencias y campos desconocidos validados. Historia de objetos en descripcion_publica; fotografía/fuente en campos existentes. Material nuevo es ejemplo, sin imagen/documento nuevo. **PDF sigue simulado: cero upload, bytes o entrada persistida de carga.**
- Migraciones revisables **006_auth_base.sql → 007_limites_login.sql → 008_roles_administrativos.sql** en backend/sql/. No repetir 001–005. Cuatro tablas Better Auth, singleton de cuenta, vínculo activo/FK, contadores, RLS/GRANT y login runtime iglesias_backend_admin con roles iglesias_auth/iglesias_gestion. No cambia permisos públicos. No runtime para altas/hash/vínculo, escribir documentos/páginas o borrar iglesias/materiales. 008 también prepara rol/login operativo separado iglesias_provision/iglesias_alta_admin, sin vínculo con runtime, para alta inicial; sin contraseñas en SQL.
- **backend/scripts/crear-administrador.js**, comando npm run admin:crear: alta local interactiva mediante biblioteca con autoSignIn:false, conexión operativa/email/password ocultos y sin argumentos/archivos. No ejecutado. No modifica cuenta existente; fallo de vínculo deja cuenta sin permiso y requiere revisión autorizada. Deshabilitar login operativo después de alta es paso remoto posterior documentado, no ejecutado.
- **Contrato administrativo definitivo en docs/CONTRATO_API.md**, reemplaza las secciones administrativas previas conforme a aprobación; consultas/campos/respuestas públicos se conservan. **docs/ADMINISTRACION.md** contiene archivos, permisos, orden exacto, secretos solo por editor privado, comandos pendientes y entrega concreta para Claude. PROPUESTA_ADMIN queda marcada histórica/aprobada; contexto, NEON.md y README enlazan estado nuevo. .env.example solo placeholders; .env real no leído/modificado. Git real no disponible (`not a git repository`); comprobación aislada en repositorio temporal confirmó .env/.env.local ignorados y .env.example permitido. Seguimiento Git real no comprobado.

### Resultados reales y pendientes

- Node **24.21.0** de nvm. Nuevas pruebas **14/14 aprobadas**: seguridad/controladores y Express con streams en memoria (sin sockets), permisos/CSRF antes de negocio, validaciones, 429/Retry-After, ausencia de ruta nativa de registro, tamaños/JSON, privados y rechazo de propietario. Biblioteca/driver/BD simulados en estas pruebas; **no equivalen a login/cookies reales**.
- Suite completa backend: `cd backend && node --test --test-isolation=none --test-reporter=spec` → **43 aprobadas, 13 HTTP canceladas por listen EPERM, 1 integración omitida**, salida 1. Ninguna HTTP de puerto se da por aprobada. Suite frontend con mismo comando desde frontend → **16/16**, salida 0; sin cambios/build frontend.
- `python3 backend/test/validar_sql_local.py` → **salida 0**, PostgreSQL 17.11 temporal sin sockets: 001–008, restricciones/FK/singleton/GRANT/RLS declarado, rechazos de escritura/privilegios y PREPARE/EXECUTE de consultas reales públicas y administrativas (incluido limitador). No demuestra filtrado RLS efectivo porque modo single elude RLS. Sintaxis JS nueva/modificada verificada con node --check.
- `python3 backend/test/validar_sql_local.py --servidor` → **salida 1**, no puede crear socket Unix: Operation not permitted. RLS efectivo, sesiones/cookies reales, hashes, expiración/revocación y concurrencia entre pools **NO comprobados**. Prueba preparada en test/admin.integracion.test.js se ejecuta únicamente con clúster temporal local, nunca con .env/Neon; el arnés la invoca en modo --servidor. Incluye login, sesión 8h, logout/expiración, permiso retirado, aislamiento de cuatro iglesias, CRUD/validaciones, privacidad y límites concurrentes compartidos. Por defecto npm test la omite expresamente.
- **Pendiente en terminal de Miguel**, comandos exactos y orden detallado en ADMINISTRACION.md: `nvm use 24`; desde backend `npm install --save-exact better-auth@1.7.13`, `npm ls --depth=0`, `npm test`; desde raíz `python3 backend/test/validar_sql_local.py` y `python3 backend/test/validar_sql_local.py --servidor`. Instalar sincroniza el lock y permite validar biblioteca real; sin esas pruebas no dar administración por integrada.
- **Pendiente externo, tras revisión/autorización**: ejecutar solo 006→007→008 en Neon, asignar contraseñas privadamente con psql, configurar DATABASE_URL_ADMIN/APP_ORIGIN/BETTER_AUTH_SECRET en .env privado (sin sustituir DATABASE_URL pública), `npm run admin:crear` con login operativo y deshabilitar ese login después. No usar propietario para servir API/provisionar la cuenta. Luego check:neon, npm start en 3001 y pruebas de navegador con Vite5173; cookies HTTPS/Vercel y despliegue siguen sin verificar. No publicar.
- **Entrega a Claude Code**: solo frontend, seguir CONTRATO_API.md y apartado de entrega de ADMINISTRACION.md: fetch/cookie same-origin, login→sesion, CSRF en memoria para mutaciones/logout, selector global de cuatro iglesias, biblioteca/lector privados por rutas admin, formularios limitados, manejo 400/401/403/409/413/429/500 y limpieza de privados al salir/401. Sin SDK Auth nuevo ni cambios de backend/SQL. PDF exclusivamente selección/simulación local. La UI puede prepararse con el contrato; no afirmar conexión administrativa disponible hasta completar pendientes.

## Incremento 5 (frontend) — Administración — 25 octubre 2026 (Claude Code)

- Estado: **pantallas hechas conforme a CONTRATO_API / ADMINISTRACION.md; NO integradas con el backend real.** `GET /api/admin/sesion` responde **404** en el proceso del puerto 3001 (curl con `X-Iglesias-Admin: 1`): ese proceso no sirve las rutas admin (o es anterior a ellas) y la configuración real (Better Auth, migraciones 006–008, `DATABASE_URL_ADMIN`, `APP_ORIGIN`, cuenta) sigue pendiente. **Ningún mock simula la autenticación dentro del proyecto**; con `VITE_USAR_MOCKS=true` `/admin` se bloquea con un aviso. No se tocó backend, SQL ni contrato; sin dependencias nuevas.
- Rutas: `/admin/login`; protegidas por `RutaProtegida` (pide `GET /admin/sesion` antes de pintar nada privado): `/admin` (selector de las cuatro iglesias), `/admin/:slug` (datos: descripción, historia, teléfono), `/admin/:slug/materiales`, `…/materiales/nuevo`, `…/materiales/:id` (editar + selector PDF simulado), `…/materiales/:id/leer` (lector privado, reutiliza `LectorDocumento`), `/horarios`, `/actividades?fecha=`, `/tramites?tipo=`.
- Sesión/seguridad según contrato: `fetch` con `credentials:'same-origin'`, `X-Iglesias-Admin: 1` en todas las rutas admin, `X-CSRF-Token` en toda mutación y en logout (el login no lo lleva; una mutación sin CSRF ni sale a la red), `Origin` lo pone el navegador. Estado, `csrf_token` y `expira_en` solo en memoria (React); nada en localStorage/sessionStorage/IndexedDB ni en bundles; la contraseña se vacía tras cada intento. 401 en cualquier llamada admin → limpia el estado, vuelve al login con aviso y regresa a la pantalla previa tras entrar; temporizador local con `expira_en`; sin renovación. Logout solo se da por hecho con 204; si falla, se informa y la sesión sigue abierta. 403 de sesión → «sin permiso» sin conceder nada en UI.
- Formularios: PATCH parcial y no vacío (solo campos cambiados; sin cambios no se envía nada), opcional vacío → `null`, POST omite opcionales vacíos (sin `es_ejemplo`/`imagen_publica`), requisitos una línea por requisito (`[]` si vacío), hora de fin anterior se rechaza en el cliente, `fields` del 400 junto a cada campo, mensajes para 409/413/429 (espera según `Retry-After`)/500 que nunca afirman que se guardó. DELETE (horarios, actividades) solo tras «Sí, eliminar» en confirmación en la página. Cambiar visibilidad público→privado avisa que el documento deja de ser público de inmediato. Lista admin muestra privados con candado y «Con documento» real; lectura privada solo por `/admin/materiales/:id/documento`. Selector PDF: nombre y tamaño, confirmar/cancelar/reiniciar, **sin leer bytes ni hacer ninguna petición** (verificado).
- Archivos: `src/api/admin.js(+test)`, `src/api/cliente.js` (cabeceras, `credentials`, `retryAfter`), `src/auth/{SesionAdmin,RutaProtegida}.jsx`, `src/componentes/Formularios.jsx`, `src/paginas/admin/{Login,Inicio,Panel,DatosIglesia,Materiales,MaterialForm,LeerPrivado,CargaSimulada,Horarios,Actividades,Tramites}.jsx`, `formularios.js`, `errores.js`, `archivo.js` (con pruebas), `src/estilos/admin.css`; `Lector.jsx` exporta `LectorDocumento` (el público no cambia); `AvisoMocks` se oculta en `/admin`; `App.jsx`/`main.jsx`. Diseño (Impeccable, modo Operate): barra vino «Administración» para distinguirla del sitio público, filas tipográficas, controles de 56 px, campos con etiqueta/ayuda/error asociados.
- Comprobado: `npm run build` correcto; `node --test` **30/30** (cliente y `Retry-After`, cabeceras/CSRF/logout, diferencias PATCH/POST, mensajes de error por estado, utilidades del PDF, más las anteriores); detector de Impeccable sin hallazgos. **Recorrido real en Firefox 153 (Marionette, clics y escritura) contra un servidor FALSO que imita el contrato**, guardado fuera del proyecto y con contraseña aleatoria: **14/14** (anónimo→login, 401, 429 con «Espera 2 minutos», login, selector, storage vacío, recarga, logout 204 y CSRF/Origin/cabecera enviados) y **35/35** (editar iglesia, materiales, lectura privada, 400 por campo, PDF simulado sin red, crear ficha, horarios con confirmación de borrado, actividades con cambio de fecha, trámites, 401 por caducidad con retorno a la pantalla previa). Capturas a 1440 y 390 px en `docs/capturas/admin-*.png`. Esto prueba la interfaz y el uso del contrato; **no** prueba Better Auth, cookies reales, CSRF/Origin del servidor ni RLS.
- NO comprobado: login/cookies/CSRF/8 h reales contra el backend (404 actual); `Origin` con el proxy de Vite frente a `APP_ORIGIN` real; 403 por permiso retirado a mitad de sesión; 409/413 reales; foco por teclado en toda la administración y lector de pantalla; la interfaz del selector de archivos aparece en el idioma del navegador; anchos 640–900 px; cookies Secure/HTTPS y Vercel.
- Riesgos conocidos: con la sesión caducada en el servidor, las pestañas que leen datos públicos (Horarios, Actividades, Trámites) siguen cargando; el 401 aparece al guardar o al abrir una ruta admin, y se pierde lo escrito en el formulario. Quien cierra sesión sin CSRF conocido (cuenta sin permiso) no tiene botón de salida: solo «Volver al sitio». El error 404 genérico de las pantallas públicas se mostrará si faltan rutas.
- Para Codex: `/api/admin/*` debe estar montado en el proceso de 3001 y responder según contrato; el frontend envía `{email,password}` solo en login y espera `fields.email|password` en 400; en mutaciones espera 201/200 con `data` (la edición de iglesia/trámite/horario/actividad/material devuelve el objeto completo) y 204 en DELETE/logout. Probar con `APP_ORIGIN=http://localhost:5173`.
- Siguiente: Miguel/Codex completan instalación y migraciones, y reinician el backend; luego comprobar en `localhost:5173` (sin `VITE_USAR_MOCKS`) login, CSRF, caducidad, 403, todas las operaciones y el PDF sin red, y registrar la verificación real aquí. Retirar entonces los mocks públicos.

## Revisión de integración administrativa frontend/backend — 25 octubre 2026 (Codex)

- Leída la entrega final de Claude (Incremento 5), CONTRATO_API.md y ADMINISTRACION.md. Las pruebas Firefox de Claude contra servidor **FALSO** certifican su interfaz, no autenticación/Neon. No se modificó ningún archivo de frontend, contrato público, SQL, secreto o configuración real. PDFs continúan simulados. Sin instalación nueva ni SQL remoto. El OK público de check:neon es el reportado por Miguel; no se repitió ni se extendió a administración.
- Instalación actual comprobada con Node **24.21.0** de nvm: `cd backend && npm ls --depth=0` → **salida 0**, Better Auth **1.7.13**, Express **5.3.0**, pg **8.23.1**. Importación de Better Auth correcta. El bloqueo DNS de la entrega anterior ya no describe el estado instalado; no se reinstaló/actualizó nada. Migraciones **006–008 y configuración/cuenta reales siguen pendientes**, no se presume su ejecución por el hecho de tener instalada la biblioteca.
- Revisión estática: app.js monta `/api/admin` antes del 404; server.js usa 3001; Vite conserva `/api` a `http://localhost:3001`; cliente frontend usa `/api`, credentials:same-origin, X-Iglesias-Admin y CSRF conforme al contrato. APP_ORIGIN de desarrollo esperado exactamente **http://localhost:5173**; comprobado con configuración sintética en pruebas, **no leído ni cambiado en .env real**. Cookies sin Domain/Path=/ sirven a localhost a través del proxy; no se añadió CORS ni se debilitó Origin.
- **Corrección backend** en src/admin/rutas.js: sesión sin cookie devuelve null antes de cargar biblioteca/conectar BD. GET /api/admin/sesion anónimo ahora da **401 UNAUTHENTICATED/no-store**, incluso sin configuración administrativa, en vez de intentar consultar Neon y terminar en 500. Nueva regresión en admin.rutas.test.js verifica que no se llama a auth/BD. No cambia la autorización de sesiones con cookie.
- El 404 del proceso 3001 observado por Claude no se reproduce en el app.js actual: pruebas Express confirman el montaje y 401, pero no se pudo inspeccionar el proceso vivo. Pruebas TCP sin enviar HTTP/SQL a **3001 y 5173** → **EPERM** en ambos; `ss` tampoco pudo abrir socket netlink. No se afirma que el proceso sea necesariamente antiguo: detenerlo con Ctrl+C en su terminal y arrancar la entrada actual es el siguiente paso. No se mataron procesos ajenos.
- **Nueva prueba local con biblioteca real** en test/admin.biblioteca.test.js: **3/3 aprobadas**. Better Auth 1.7.13 real (hash, firma, sesiones, cookies), Express en memoria y adaptador temporal de la propia biblioteca; credenciales aleatorias de prueba, sin .env/red/Neon. Verifica 8h fijas, HttpOnly/SameSite=Lax/Path=/, sin Domain/Secure en HTTP local, atributos Secure en configuración HTTPS, Origin5173 aceptado aunque Host sea3001, CSRF ligado a sesión y obligatorio, revocación/logout204→401, expiración, permiso retirado403 y login sin permiso sin entregar cookie. **Permiso, negocio y limitador simulados**: no comprueba RLS/persistencia PostgreSQL, HTTPS por red, política del navegador ni proxy real.
- **Prueba de proxy preparada**: scripts/verificar-proxy-admin.js y comando `npm run check:admin:proxy`. Carga la configuración Vite existente sin modificar frontend, usa Express del proyecto/Better Auth reales y almacenamiento/permiso/negocio temporales. Arranca solo si están libres 3001 y5173; no carga .env ni usa Neon. Comprueba prefijo/ruta, cookies reenviadas, Origin correcto/ausente/ajeno, CSRF, privados y logout. Fetch Node reenvía cookies manualmente: tampoco sustituye prueba de navegador. Ejecutado aquí desde backend → **salida 1**, **{"etapa":"backend_3001","codigo":"EPERM"}**. El flujo por red no llegó a ejecutarse; **proxy no aprobado**. EADDRINUSE en terminal indica detener manualmente procesos de desarrollo antes de esta prueba aislada, nunca mata procesos por sí mismo.
- Suites completas, `node --test --test-isolation=none --test-reporter=spec`: backend **47 aprobadas, 13 HTTP canceladas por listen EPERM y 1 integración PostgreSQL omitida**, salida 1; frontend **30/30 aprobadas**, salida 0. No se reconstruyó frontend sin cambios; su build exitoso permanece como evidencia de Claude. Sintaxis de rutas/script nuevo verificada.
- `python3 backend/test/validar_sql_local.py` → **salida 0**, SQL001–008/consultas/restricciones/GRANT/metadatos RLS en PostgreSQL17.11 temporal modo single; **no filtrado RLS efectivo**. `python3 backend/test/validar_sql_local.py --servidor` → **salida 1**, Unix socket Operation not permitted; integración Better Auth/pg real y límites concurrentes persistidos siguen pendientes. No se consultó Neon.
- **Guía vigente ampliada en ADMINISTRACION.md**: instalación ya comprobada (npm install exacto solo si falta), prueba de proxy aislada, 006→007→008 sin repetir 001–005, contraseñas con psql -W/\password sin argumentos secretos, variables en editor privado, alta interactiva con rol operativo separado y posterior NOLOGIN autorizado, reinicio de backend y Vite5173 con mocks desactivados y base /api. Incluye curl anónimo a /api/admin/sesion en ambos puertos (esperado401, sin cookie/SQL), comprobaciones de navegador y clasificación de límites. No usar rol propietario en la API ni en el alta de la cuenta.

### Orden pendiente en la terminal de Miguel (sin darlo por ejecutado)

1. `nvm use 24`; desde backend `npm ls --depth=0`, `npm test`; desde raíz `python3 backend/test/validar_sql_local.py --servidor`. Better Auth ya está instalado: **solo si falta**, `npm install --save-exact better-auth@1.7.13` (autorizado previamente). No herramientas/dependencias nuevas.
2. Con puertos3001/5173 libres: desde backend `npm run check:admin:proxy`. Éxito esperado **OK_LOCAL_MEMORIA**, explícitamente sin Neon/navegador. Aquí bloqueado por EPERM. Esta prueba no necesita variables ni migraciones reales.
3. Tras revisión/autorización del cambio remoto, en Neon iglesias/rama/base correctas ejecutar **backend/sql/006_auth_base.sql → 007_limites_login.sql → 008_roles_administrativos.sql** completos, uno por uno. No repetir 001–005; detenerse ante objetos ya existentes y revisar, sin borrar/reaplicar automáticamente.
4. En psql como operador de migraciones: `\password iglesias_backend_admin` y `\password iglesias_alta_admin`, contraseñas solicitadas privadamente. Editar backend/.env solo en editor privado: conservar DATABASE_URL pública; añadir DATABASE_URL_ADMIN del login **iglesias_backend_admin** (TLS), **APP_ORIGIN=http://localhost:5173** sin barra y BETTER_AUTH_SECRET aleatorio privado >=32bytes. No imprimirlo/generarlo en salidas, usar VITE_ ni guardar el propietario. Estos cambios reales están pendientes de autorización; no se hicieron aquí.
5. Desde backend `npm run admin:crear`: URL del login **iglesias_alta_admin**, email y contraseña (dos veces) pedidos sin eco; no usar propietario ni pasar secretos por argumentos. Confirmado el alta, operador ejecuta `ALTER ROLE iglesias_alta_admin NOLOGIN;` **solo con autorización remota**. No automatizar reintento si ya existe una cuenta/vínculo incompleto. No desplegar credencial operativa.
6. Terminal backend: Ctrl+C del proceso anterior y `npm start`. Terminal frontend desde frontend: `VITE_USAR_MOCKS=false VITE_API_BASE=/api npm run dev -- --host localhost --port 5173 --strictPort`. Desde otra terminal, curl anónimo con `-H 'X-Iglesias-Admin: 1'` a http://localhost:3001/api/admin/sesion y http://localhost:5173/api/admin/sesion → ambos401 (comandos completos en ADMINISTRACION.md). 404 requiere comprobar entrada/proceso, no ejecutar migraciones para corregir una ruta ausente.
7. Abrir **http://localhost:5173**: login, sesión global, edición/lector privado y logout. Comprobar atributos de cookie y cabeceras sin copiar sus valores; solo confirmar estados. Las pruebas con escrituras en Neon o cambios de permiso/caducidad por SQL requieren autorización aparte. No ejecutar SQL de test contra Neon. Mantener PDFs sin peticiones/bytes guardados. Cookies reales del navegador con Neon, RLS administrativo y Vercel siguen **NO verificados**.

## Corrección de validación de admin:crear — 25 octubre 2026 (Codex)

- Miguel reportó dos fallos con contraseña de 11 caracteres y comprobó entre ellos usuarios/cuentas/administradores en 0. Se registra como **evidencia de su terminal/Neon**; no se consultó el proyecto desde Codex ni se presupone su estado actual.
- El script anterior ya rechazaba menos de 12 antes de signUpEmail, pero el catch ocultaba esa causa con PROVISION_FAILED_NO_RETRY_AUTOMATICO. Se separó la operación local en **src/admin/alta.js** para validar y probar su orden: longitud 12–128, coincidencia exacta y correo antes incluso de obtener el pool/conectar, construir Auth o escribir. La contraseña conserva sus espacios; nunca se recorta o imprime.
- **scripts/crear-administrador.js** usa esa validación y muestra mensajes/códigos fijos: PASSWORD_LENGTH_INVALID («La contraseña debe tener entre 12 y 128 caracteres. No se inició el alta.»), PASSWORD_MISMATCH («Las contraseñas no coinciden. No se inició el alta.») y EMAIL_INVALID. Errores externos siguen siendo genéricos, sin mensajes SQL, URL, contraseñas o causas. No se ejecutó el script ni el alta real.
- Conservadas las guardas de rol restringido y cuenta/vínculo existentes; ahora se comprueban también las filas de auth_account antes de crear. No se añadieron dependencias, migraciones, cambios de credenciales, frontend ni consultas/escrituras remotas.
- **test/alta.test.js: 5/5 aprobadas**, solo dobles en memoria, sin llamadas reales a Auth/pg: longitudes 0/11/129 rechazadas sin conectar; confirmación distinta/ausente; límites 12/128 aceptados sin trim; correo inválido; diagnóstico sin entrada/mensajes externos y rechazo si cualquiera de las tres tablas ya tiene filas. Casos válidos invocan callbacks simulados, no una cuenta real.
- Suite completa backend con Node24.21.0: `node --test --test-isolation=none --test-reporter=spec` → **52 aprobadas, 13 HTTP canceladas por listen EPERM y 1 integración PostgreSQL omitida**, salida 1. Sintaxis del script verificada con node --check. No se dio por aprobada HTTP/Neon ni se ejecutó npm run admin:crear. Sin cambios de frontend, no se repitieron sus pruebas/build ni SQL ajeno a esta corrección.
- **ADMINISTRACION.md actualizado** con consulta SELECT de conteos de auth_user/auth_account/administrador para la misma rama/base del alta usando rol autorizado. **Pendiente para Miguel**: comprobar 0/0/0 antes de reintentar manualmente con 12–128 y confirmación idéntica; si alguna fila existe o falla la comprobación, detenerse sin borrar/actualizar/repetir a ciegas. Tras OK se espera 1/1/1. Esta consulta no expone identidades, hashes ni secretos y no fue ejecutada por Codex.

## Preparación de carga pública por lote — 25 octubre 2026 (Codex)

- Miguel confirmó **login administrativo funcionando**. No se revalidó el login ni se inspeccionaron sus credenciales. Revisado esquema001/002, permisos existentes y contrato. Sin instalaciones, modificaciones de frontend/esquema/permisos, cuentas o documentos. **Ninguna conexión/consulta/escritura a Neon** en esta preparación; PDFs continúan simulados.
- Archivo editable **backend/data/carga-publica.json**, versión1, con las cuatro iglesias por slug. informacion:{} y listas de materiales/horarios/tramites vacías: no se recibieron datos nuevos y no se inventó historia, teléfonos, requisitos, horarios, fuentes o contenido. **docs/CARGA_CONTENIDO.md** lista todos los campos admitidos, formato/tipos/límites, identificadores, pasos y alcance. Historia de objetos en descripcion_publica, fotografía en imagen_publica y fuente conservadas en sus campos existentes.
- **backend/scripts/cargar-contenido.js + src/carga-publica.js**: vista previa offline por defecto, comparación remota optativa READ ONLY y aplicación explícita con huellaSHA256 del archivo revisado. pg existente, sin .env ni cambios de secretos. Conexión operativa pedida sin eco solo en modos remotos; nunca se imprime/guarda. No reutiliza/eleva credenciales de la API. Operador necesita permisos ya existentes sobre los campos;42501 obliga a revisar acceso, sin cambiar permisos automáticamente.
- Este primer lote **actualiza únicamente registros existentes**: iglesias por slug, materiales/horarios por UUID más iglesia, trámites por tipo más iglesia. No INSERT/DELETE ni reemplazo de listas: no duplica iglesias/fichas, no borra lo omitido. IDs erróneos/cruzados/duplicados abortan. Campos desconocidos, estados verificado o es_ejemplo:false se rechazan; no promueve contenido ficticio a real/verificado. Lo omitido conserva su valor; ejemplos en registros previamente no ejemplares deben marcarse explícitamente true/ejemplo.
- Protecciones: materiales privados objetivo rechazan el lote completo; visibilidad, notas internas, pertenencia y documentos no editables. No consultas/escrituras a Auth/administrador/sesiones/documentos/páginas ni DDL/GRANT/REVOKE. Whitelists SQL y parámetros separados; locks/SERIALIZABLE, rollback ante fallo, solo actualiza valores distintos. Comparación REPEATABLE READ READ ONLY con antes/después de campos públicos, sin notas ni contenido privado.
- Vista previa ejecutada realmente: `node backend/scripts/cargar-contenido.js --vista-previa > docs/VISTA_PREVIA_CARGA.json` con Node24.21.0 → **salida0**, **0 registros propuestos**, cuatro slugs y huella del archivo; ninguna BD consultada ni valores anteriores inventados. Este resultado es una plantilla pendiente de completar/revisar, no contenido cargado.
- **test/carga-publica.test.js:8/8 aprobadas**, cliente/estado simulados: validaciones, duplicados, campos protegidos, promoción prohibida, imágenes/archivos, comparación sin UPDATE, valores parametrizados, idempotencia, rechazo privado con rollback total, separación por iglesia y diagnóstico cerrado. **No equivalen a carga/filtrado RLS reales**. Suite completa backend `node --test --test-isolation=none --test-reporter=spec` → **60 aprobadas,13 HTTP canceladas por listen EPERM,1 integración omitida**, salida1. Frontend sin cambios, no se repitió su build/suite.
- `python3 backend/test/validar_sql_local.py` → **salida0**, PostgreSQL17.11 temporal modo single:001–008, restricciones/permisos declarados y PREPARE/EXECUTE de las consultas nuevas capturadas por **scripts/exportar-consultas-carga-prueba.js**, dentro de transacción revertida. No demuestra RLS efectivo ni permisos/conexión del operador real ni ejecución en Neon.
- Comandos preparados en package.json: **contenido:preview**, **contenido:comparar**, **contenido:aplicar**. Se ejecutó preview y una prueba negativa CLI `--aplicar NO_ES_UNA_HUELLA` → salida1, HUELLA_NO_COINCIDE antes de solicitar conexión. No se ejecutó comparación ni aplicación remota, ni siquiera con rollback remoto. Vista/comparación reales y aplicación siguen pendientes de datos revisados y autorización de los pasos remotos.
- Orden documentado en **CARGA_CONTENIDO.md**: completar archivo → regenerar/revisar preview → autorizar lectura y `npm run --silent contenido:comparar` → revisar diferencias reales/destino → autorizar escritura y ejecutar **una sola vez** `npm run --silent contenido:aplicar -- --aplicar HUELLA_REVISADA`, desde backend, con conexión operativa privada. Después comprobar rutas públicas y conservar evidencia. Sin tabla de lotes nueva: no promete bloqueo permanente de reejecución; mismo archivo/mismo estado modifica0 y no duplica, pero repetir tras ediciones posteriores podría sobrescribirlas. No reintentar automáticamente.

## Contenido investigado y fotografías — 25 octubre 2026 (Claude Code)

- Alcance: se completó **solo** `backend/data/carga-publica.json` (sección `informacion` de las cuatro iglesias; `materiales`, `horarios` y `tramites` siguen en `[]`, comprobado por comparación con el original). No se tocaron scripts, esquema ni otros archivos del backend. **No se ejecutó nada contra Neon.** El contenido no existía previamente en el proyecto: se investigó el 25/10/2026 en Wikipedia (es), registro del INAH, Yucatán Today, Historical Marker Database y Wikimedia Commons; los textos están redactados con palabras propias.
- Campos cargados por iglesia: `descripcion`, `historia` (párrafos separados por línea en blanco), `direccion`, `foto_exterior`, `foto_interior` (Santa Ana: sin interior), `fuente`. No se tocaron nombre ni coordenadas.
- Vista previa local (`node backend/scripts/cargar-contenido.js --vista-previa`, salida 0): 4 registros propuestos, **huella SHA256 `02e9beb1576b3913afcaad49d1f07d3816125c6f6b96e54a78362219344b6077`** (cambia con cualquier edición del archivo). No sobrescribí `docs/VISTA_PREVIA_CARGA.json`; regenerarlo es decisión de Codex.
- Fotografías: 7 archivos de Wikimedia Commons en `frontend/public/imagenes/` (1280 px, sin editar), con autor, licencia y enlace en `ATRIBUCIONES.md` y en la página pública `/imagenes/creditos.html`. Licencias: CC0 (Inri), CC BY 4.0 (Gideonximi), CC BY 3.0 (Anagoria), CC BY 2.0 (Sharon Hahn Darlin), CC BY-SA 4.0 (Sárvol, Mario Morales Rubí), CC BY-SA 2.0 (Rubén Naíl). Cada imagen se revisó visualmente; se descartó una candidata que resultó ser un pedestal del Ayuntamiento. No tienen permiso expreso de las parroquias.
- Frontend: la pantalla del interior **no mostraba `historia` ni `fuente`**; se añadieron (Historia en párrafos, «Fuente: …» y enlace «Créditos de las fotografías» cuando hay foto), porque sin ello el texto investigado y los créditos CC no serían visibles. Sin otros cambios; `foto_exterior` aún no se muestra en ninguna pantalla.
- Comprobado: vista previa del script (salida 0); `npm run build` correcto; `node --test` 30/30; detector de Impeccable sin hallazgos; capturas con un servidor de prueba temporal (borrado) en `docs/capturas/carga-interior-*.png` y `carga-creditos-390.png` (las tres fotos interiores cargan a 1280 px; texto legible sobre la foto, historia, fuente y créditos).
- NO incluido a propósito (sin fuente oficial verificable): teléfonos, horarios de misa y de visita (solo hallé horarios en un blog turístico), requisitos de trámites, materiales y documentos históricos reales, actividades. `telefono` sigue `null` y se muestra «Por confirmar».
- Límites de las fuentes: la mayor parte de los datos históricos viene de Wikipedia y de sitios divulgativos, no de estudios académicos. El registro del INAH de la iglesia de Jesús **no pude abrirlo directamente** (error 503; solo vi su extracto en una búsqueda), por eso la fuente dice «consulta parcial»; el catálogo del INAH daba error de certificado. La reseña turística de Santa Ana mezclaba datos de otra iglesia y se descartó como fuente. Antes de publicar conviene que alguien con acceso a la parroquia o a la Biblioteca Yucatanense confirme fechas y nombres. Hay discrepancias: Santa Lucía (placa dice corredores de 1873 o 1875; no se usó) y fundador del colegio jesuita (Agustín/Martín del Palomar; no se usó).
- Para Codex (no modifiqué nada): (1) el script solo admite `es_ejemplo:true`, nunca `false`: las cuatro iglesias seguirán marcadas `es_ejemplo:true` aunque su texto ya no sea de demostración; hace falta un camino aprobado para pasarlas a `false`. (2) No hay campo para autor/licencia de cada foto: los créditos van en `fuente` (texto) y en `/imagenes/creditos.html`; si se quiere un campo estructurado habría que ampliar el contrato. (3) Las rutas `/imagenes/…` son relativas al sitio (Vite las sirve desde `public/`); en despliegue deben conservarse. (4) Si Neon limita `foto_*`/`direccion` a otro rol (42501), usar el operador autorizado indicado en CARGA_CONTENIDO.md.
- Siguiente: Codex revisa el archivo y la huella, y con autorización de Miguel ejecuta comparar → aplicar; después se verifican `/api/iglesias/:slug` y las cuatro pantallas de interior sin mocks, y se decide si se mostrará `foto_exterior` en la tarjeta del mapa.

## Revisión del lote de cuatro iglesias y aplicación autorizada — 25 octubre 2026 (Codex)

- Leída la última entrega de Claude «Contenido investigado y fotografías». Se respetó la instrucción de no investigar más: no se consultaron fuentes externas ni se ampliaron campos/alcance. No se modificó carga-publica.json, frontend, esquema, secretos, roles o permisos.
- Validación real del archivo con prepararCarga: **4 operaciones y solo tabla iglesias**, exactamente catedral, tercera-orden, santa-lucia y santa-ana, una por slug. Campos presentes: descripcion, historia, direccion, foto_exterior, foto_interior (omitida en Santa Ana) y fuente. materiales/horarios/tramites siguen vacíos; ningún campo de privados, documentos, cuenta o permisos se incluye. Los campos omitidos se conservan, incluida la foto interior actual de Santa Ana.
- **es_ejemplo está omitido en las cuatro operaciones y se conserva como esté en Neon**. Limitación aceptada por Miguel: si las filas siguen con es_ejemplo:true, continuarán etiquetadas como ejemplo aunque cambie el texto. No se cambió ese indicador ni se convirtió contenido en verificado; no se leyó su valor actual en remoto.
- Verificadas localmente las **7 rutas de fotografías** contra frontend/public: catedral-exterior/interior.jpg, tercera-orden-exterior/interior.jpg, santa-lucia-exterior/interior.jpg y santa-ana-exterior.jpg. Todas existen, son archivos no vacíos con firma JPEG, están dentro del directorio público y están referenciadas por nombre en /imagenes/creditos.html. No se modificaron fotos/créditos ni se hizo una nueva investigación histórica o de licencias.
- **docs/VISTA_PREVIA_CARGA.json regenerado** con el cargador actual: salida0, cuatro operaciones, sin conexión. Huella exacta del lote, coincidente con Claude: **02e9beb1576b3913afcaad49d1f07d3816125c6f6b96e54a78362219344b6077**. La vista sigue siendo local: no inventa valores anteriores ni certifica la comparación con Neon.
- Miguel autorizó aplicar este lote si coincidía con los cuatro registros; revisión conforme. Se intentó el procedimiento real: `node backend/scripts/cargar-contenido.js --aplicar 02e9beb1576b3913afcaad49d1f07d3816125c6f6b96e54a78362219344b6077` → **salida1, {"etapa":"conexion","codigo":"TERMINAL_INTERACTIVA_REQUERIDA"}**. Se detuvo antes de solicitar credenciales/conectar; **no hubo SQL remoto ni aplicación**. Este fallo es falta de terminal privada interactiva, no un diagnóstico DNS/autenticación/permisos de Neon. No se sustituyó la conexión operativa por credenciales del runtime ni se imprimieron secretos.
- Pruebas del cargador detectaron tres fallos de fixture: dependían de que el archivo editable permaneciera vacío. Se aisló la muestra de prueba en **test/carga-publica.test.js**, sin tocar el lote ni el cargador. Resultado final **8/8 aprobadas**. Suite backend completa con Node24.21.0, `node --test --test-isolation=none --test-reporter=spec`: **60 aprobadas,13 HTTP canceladas por listen EPERM,1 integración PostgreSQL omitida**, salida1. No se repitieron pruebas/build de frontend sin cambios. SQL/código del cargador permanecen como se revisaron en la entrega anterior.

### Comando exacto pendiente en la terminal de Miguel

Desde la raíz del proyecto, usando la autorización ya dada para este archivo revisado:

```sh
nvm use 24
cd backend
npm run --silent contenido:comparar > ../docs/COMPARACION_CARGA.json
npm run --silent contenido:aplicar -- --aplicar 02e9beb1576b3913afcaad49d1f07d3816125c6f6b96e54a78362219344b6077
```

Revisar la salida de comparación y ejecutar la última línea **solo si la comparación termina bien y confirma las cuatro iglesias previstas**. Ambos pasos piden conexión de operador autorizado sin eco; no pegarla en chat/argumentos ni cambiar las variables de la API. El modo aplicar verifica nuevamente la huella y actualiza solo los valores distintos en una transacción; no crea iglesias ni toca otras tablas. Si devuelve42501, detenerse sin modificar permisos. Si se editó el JSON, no reutilizar esta autorización/huella: regenerar vista y revisar el nuevo alcance. Tras éxito, conservar resultado y verificar las cuatro respuestas públicas/pantallas sin mocks. Esos resultados reales permanecen pendientes.

## Fase 2 — backend de ocho iglesias — 30 octubre 2026 (Codex)

- **Solo backend y documentación**, sin frontend, instalaciones, SQL remoto, secretos o publicación. Leídos AGENTS, CLAUDE, contexto, MEJORAS_FASE_2, contrato y entrega previa. Revisados CHECK de slugs, whitelist admin, contador de check:neon y cargador. Migraciones001–008 y contenido existente conservados.
- **Contrato definitivo para Claude**: Iglesia añade `estado` (`yucatan|campeche|puebla`) y `ciudad` (Mérida / San Francisco de Campeche / Puebla de Zaragoza). `GET /api/iglesias` lista8; `?estado=` filtra4/2/2; vacío/inválido/repetido→400 con fields.estado. Orden: Mérida original, Campeche, Puebla. Nuevos slugs **catedral-campeche, dulce-nombre-jesus, catedral-puebla, la-compania**, UUID terminados0005–0008. Estado/ciudad no editables por cliente. PATCH iglesia conserva historia/descripcion/telefono y admite "" para textos desconocidos. Todas usan rutas existentes de materiales/lector/horarios/actividades/trámites/admin.
- **La Compañía:19.04257,-98.19540**, punto cartográfico del edificio de Puebla, no entrada validada: Mapcarta/OSM525267034, contrastado con WikidataQ6141059 (unos18m) e identidad INAHI-0012104573/4Sur102. INAH directo502; extractos indexados de ficha/planoteca confirmaron nombre/domicilio, no coordenadas. Fuentes y límites en **docs/CATALOGO_FASE_2.md**; MEJORAS_FASE_2 actualizado. Santo Domingo excluido. No se inventó contenido histórico.
- SQL nuevo revisable **backend/sql/009_catalogo_estados.sql →010_iglesias_fase2.sql**, **no ejecutado en Neon**.009 añade ubicación y amplía restricciones sin cambiar datos anteriores;010 inserta4 iglesias y16 guías genéricas vacías (requisitos:[], fuente:null, por_confirmar). Materiales/horarios/actividades nuevos vacíos; telefono/fotos null, historia/descripcion/direccion="". es_ejemplo de Mérida intacto y nuevas:true por defecto. Sin modificar cuenta global, documentos/páginas, relaciones, privilegios o RLS. Datos: **backend/data/iglesias-fase2.json**; generador local sql/generar_catalogo_fase2.js reproduce exactamente010 (comprobado por CLI y prueba).
- Lecturas/app/admin devuelven metadatos y aceptan ocho. Globalidad de sesión y protección de privados sin cambios. check:neon actualizado a ocho slugs, **no ejecutado**. Cargador acepta subconjuntos1..8 y la BD ampliada; lote de Mérida no editado, misma huella. Preview indica solo slugs con operaciones. Campos de ubicación se asignan por migración. Guías/contexto/contrato actualizados para sustituir límites vigentes de cuatro; historial anterior conservado.
- **7/7 pruebas nuevas** en test/catalogo-fase2.test.js: filtro/errores, metadatos, regresión de Mérida, rutas/aislamiento de ocho, secciones vacías, admin global, flags/403 privados, cargador y SQL/datos. Son consultas/datos simulados y Express en memoria. Suite backend completa con Node24.21.0, `node --test --test-isolation=none --test-reporter=spec`: **67 aprobadas,13 HTTP canceladas por listen EPERM,1 integración PostgreSQL omitida**, salida1. Frontend existente **30/30**, sin cambios/build/revisión visual.
- `python3 backend/test/validar_sql_local.py` → **salida0**, PostgreSQL17.11 temporal modo single:001–010 y PREPARE/EXECUTE de consultas reales, incluido filtro. Snapshots comprueban preservación de todos los campos/IDs/slugs de Mérida, documentos/páginas, materiales, horarios/actividades, guías antiguas y cuenta/hash/sesión de prueba, más permisos/políticas. Pruebas de nuevos CHECK, guías vacías y escrituras con rol de gestión sobre nueva iglesia, revertidas. **No certifica filtrado RLS efectivo**. `--servidor` → **salida1, socket Unix Operation not permitted**. HTTP/pg/RLS efectivo y Neon siguen sin verificar.
- **Entrega concreta a Claude** en CONTRATO_API.md y CATALOGO_FASE_2.md: Yucatán inicial, filtro por claves ASCII y etiquetas visibles; limpiar selección al cambiar estado y reutilizar mapa/pantallas por slug. Selector admin consulta /iglesias completo, misma sesión/CSRF global; no autorización solo UI. Mostrar vacío/Por confirmar, no cierre ante [], y mantener PDF simulado. No textos nuevos de libros/urnas/despliegue en esta entrega.
- **Pendientes**: revisar y autorizar aplicación remota **solo009→010**, rama/base correctas, antes de integrar este backend que solicita las nuevas columnas. No repetir001–008 ni cambiar secretos/permisos. Si010 falla, revisar sin repetir009 ni borrar datos. Desde terminal con sockets: pruebas del arnés local --servidor y npm test. Después integrar frontend/Neon y comprobar marcadores con Claude. No se certifica estado remoto desde esta sesión.

## Selector «Cambiar de estado» — 30 octubre 2026 (Claude Code)

- **Resumen**: «Ver las cuatro iglesias» sustituido por «Cambiar de estado» (Yucatán inicial, Campeche, Puebla). Solo frontend; sin cambios de backend, SQL, auth, contrato ni dependencias.
- **Cambios**: `api/estados.js` (catálogo fijo), `listarIglesias(estado)` → `GET /iglesias?estado=`; `componentes/SelectorEstado.jsx` (botón con `aria-expanded`, opciones en línea que no tapan el mapa, Escape cierra y devuelve el foco, clic fuera cierra, botones de 56 px, estado activo visible); `Mapa` (una sola instancia, ya no se desmonta al cargar; `fitBounds` con `maxZoom 17` y sin marcadores no falla) y `paginas/publico/Mapa.jsx`. El estado va en `?estado=` para que «Regresar al mapa» del interior vuelva al mismo estado. Cambiar de estado limpia ficha y selección; la lista se filtra también por `i.estado === estado`, así que una respuesta atrasada no puede mostrar otro estado (y `usarApi` ya descarta respuestas obsoletas). Tarjeta e interior muestran ciudad y «Por confirmar» donde falta descripción/dirección/teléfono. Admin `Inicio` lista las ocho agrupadas por estado (consulta `/iglesias` completo). Cabecera: «Museo Digital de Iglesias». Mocks: las 4 iglesias nuevas sin materiales, horarios ni actividades y con guías vacías «por confirmar».
- **Con la API real** (backend local en :3001 contra Neon, solo GET; Firefox por Marionette, 1440 px): inicio Yucatán 4/4 marcadores; Campeche 2/2, Puebla 2/2, vuelta a Yucatán 4/4; ficha se limpia y menú se cierra en cada cambio; Escape cierra y devuelve el foco; interior de La Compañía con «Por confirmar»; museo/horarios/trámites de catedral-puebla con estados vacíos; carrera simulada (Puebla retrasada 2,5 s, cambio a Campeche) sin mezclar estados; `?estado=Puebla` → 400 confirmado con curl.
- **Con mocks** (`VITE_USAR_MOCKS=true`): filtro 4/2/2 y secciones vacías de La Compañía. Los mocks no prueban integración.
- **Comprobaciones**: `npm run build` correcto; `npm test` 30/30 (no hay pruebas nuevas: la lógica es de UI). Capturas `docs/capturas/estado-*.png`.
- **Sin comprobar**: administración `Inicio` (requiere sesión real; la configuración Better Auth sigue pendiente); posición de los marcadores sobre cada edificio (solo vistos en captura de Campeche/Puebla, no auditados uno a uno); ancho real de 390 px (Firefox headless limita la ventana a ~488 px); lectores de pantalla.
- **Siguiente paso**: revisar visualmente marcadores con Codex; después contenido de las nuevas iglesias.

## Administración por iglesia — backend y contrato — 30 octubre 2026 (Codex)

- Seguido ADMIN_POR_IGLESIA_Y_RENDIMIENTO.md: etapa funcional de backend, **sin frontend, instalaciones, SQL remoto o secretos**. Estado conocido actualizado: Miguel reportó009/010 aplicadas, catálogo4/2/2, login general real y auditoría npm0 desde su terminal; no se repitieron esos accesos ni actualizaciones. Rendimiento y revisión final previa a GitHub quedan después de integrar/verificar las funciones, sin publicar/rotar credenciales.
- SQL revisable **011_administradores_por_iglesia.sql →012_login_fallos_consecutivos.sql →013_urnas_nichos.sql**, no aplicado en Neon.011 conserva general/IDs/hashes/sesiones, retira singleton de auth_user y añade rol/iglesia_id con FK/coherencia y unicidad de general/parroquial por iglesia. Runtime no gana alta/cambio de roles. Provisión solo añade SELECT(id,slug) de iglesias.012 reutiliza login_limite y reinicia únicamente contadores técnicos obsoletos;013 añade guía vacía idempotente sin sobrescribir existentes.
- Permisos del servidor en src/admin/{permisos,db,gestion,rutas}.js: ámbito activo fresco por solicitud y transacción; UUIDs con filtro SQL de pertenencia, slug ajeno403/UUID ajeno404. Parroquial gestiona solo materiales/lector privado/horarios/actividades propios y PATCH iglesia **solo telefono**; historia/descripcion/trámites/requisitos403, rol/asignación/estado/ciudad/campos fuera de whitelist400. General conserva operaciones globales. Desactivación o reasignación se respeta en la siguiente solicitud. Público/privados, CSRF y cookies se conservan. **RLS del rol técnico de gestión sigue amplia: aislamiento por usuario final garantizado por Express/filtros, no identidad individual PostgreSQL**.
- Login persistente atómico por correo normalizado HMAC, sin IP/MAC: fallos1–4 sin espera,5–9→15s,desde10→120s. Durante espera429/Retry-After sin contar/verificar/prolongar; éxito reinicia,15min sin fallo expiran. Errores técnicos no se ocultan como credenciales. Bloqueo de fila durante verificación y limpieza acotada. Pool de gestión/contador2 y Auth1 (mismo total3 por instancia) evita agotamiento circular al verificar con fila bloqueada; **sin medición ni afirmación de optimización**.
- Alta operativa existente `npm run admin:crear` ampliada a general/parroquial+slug: validación antes de conectar, prompts ocultos, hashing de Better Auth, sin contraseñas por defecto. Rechaza correo/asignación existentes, nunca recrea general. No ejecutado. Activar/desactivar login operativo y crear cuentas requieren autorización externa; si falla vínculo, detenerse para revisión sin borrar/reintentar automáticamente. Procedimiento exacto en **ADMINISTRACION.md**.
- **Contrato definitivo para Claude** en CONTRATO_API.md: GET /api/admin/sesion añade **rol,iglesia_id,iglesia_slug** (null para general); nuevo **GET /api/admin/iglesias** devuelve8 general/1 parroquial. Mismo login/logout, sin rol elegido por navegador. Trámite nuevo **urnas_nichos**, quinto tras otros, requisitos:[],fuente:null,por_confirmar; GET público existente y PATCH solo general. Texto UI: «Consulta disponibilidad y condiciones directamente con la parroquia»; teléfono de Iglesia o Por confirmar, sin precios/disponibilidad/reservas ni uploads. PDF simulado intacto.
- Pruebas nuevas: permisos7, limitador con reloj controlado4 (incluye concurrencia/estado compartido simulado), provisión parroquial2 y error genérico Better Auth real1; sin cuentas reales. Suite conjunta desde raíz `node --test --test-isolation=none --test-reporter=spec`, Node24.21.0 → **110 aprobadas (incluye30 frontend existentes),13 HTTP canceladas por listen EPERM,1 integración omitida**, salida1. Sintaxis comprobada. Sin build/UI frontend; biblioteca real solo con almacén temporal en las pruebas correspondientes, no confundir con Neon.
- `python3 backend/test/validar_sql_local.py` → **salida0**, PostgreSQL17.11 temporal modo single,001–013/consultas parametrizadas y assertions: preserva general/hash/sesión/contenido, rechaza segundo general/parroquial y ámbitos incoherentes, permisos mínimos de provisión/runtime, guías de urnas vacías sin duplicar al repetir013. **Modo single no certifica filtrado RLS efectivo**. `--servidor` → **salida1, socket Unix Operation not permitted**. Preparada integración local pg/Better Auth con parroquiales y concurrencia entre pools, no ejecutada por ese bloqueo. No se probó contra Neon.

### Entrega breve a Claude y siguiente orden

1. **SQL pendiente011→012→013**, revisar/aplicar solo tras autorización remota; no repetir001–010. Provisionar parroquiales autorizados sin recrear general y reiniciar backend con columnas nuevas; cero cambios de secretos por Codex.
2. Claude: un mismo login; mostrar iglesia asignada/listado de GET /admin/iglesias, ocultar controles según rol, conservar CSRF/cookie/privados solo en memoria. Ante403/cambio de ámbito reconsultar sesión y limpiar contenido anterior; ante401 pedir login. UUID ajeno404 genérico. Mostrar Retry-After y añadir urnas_nichos con contacto telefónico. El servidor valida todo igualmente.
3. Desde terminal con sockets: suite local y `python3 backend/test/validar_sql_local.py --servidor`; después recorrido real general+dos parroquiales y cinco guías con Claude, sin archivos reales/PDF subido.
4. **Después de integrar/verificar**, medir navegación/API/render y revisar lentitud con evidencia. Luego revisión final de secretos/Git y procedimiento de rotación autorizado; no se adelantaron ni se dieron por completados.

## Administración por rol/iglesia y «Urnas y nichos» — 30 octubre 2026 (Claude Code)

- **Resumen**: el frontend usa el rol y la iglesia de `GET /admin/sesion` (guardados solo en memoria). `/admin/login` sirve a todas las cuentas. Solo frontend; sin cambios de backend, SQL, auth, contrato ni dependencias.
- **Cambios**:
  - `Inicio` admin consulta `GET /admin/iglesias`: el general ve las ocho agrupadas por estado; con una sola iglesia (parroquial) entra directo a ella.
  - Parroquial: sin «Cambiar de iglesia»; una URL de otra iglesia redirige a la propia, y el servidor sigue siendo quien rechaza. Edita solo el teléfono (`PATCH` solo con `telefono`; descripción e historia deshabilitadas). Materiales, horarios y actividades igual que antes. Trámites en solo lectura. La barra indica «Administración general/parroquial».
  - Cuenta sin permiso (403 en la sesión): pantalla con «Cerrar sesión». Tras un login válido sin permiso se muestra esa pantalla, no un error de login.
  - Login con 429: cuenta regresiva desde `Retry-After` (60 s si falta), botón deshabilitado y texto «Espera N…».
  - Guía pública «Urnas y nichos» (quinta): requisitos, teléfono con botón «Llamar» (o «Por confirmar») y «Consulta disponibilidad y condiciones directamente con la parroquia». El administrador general también la edita. Mocks actualizados.
- **API real** (backend local, solo lecturas): `catedral` y `la-compania` devuelven la guía `urnas_nichos` y la pantalla pública la muestra; `/admin/sesion` y `/admin/iglesias` sin cookie → 401.
- **Simulado** (servidor de contrato falso en el scratchpad, NO el backend real): login general/parroquial/sin permiso/429, selector de 8 y de 1, redirección, solo-teléfono (PATCH `{"telefono"}` con CSRF), trámites en lectura, cierre de sesión en cada caso y cuenta regresiva.
- **Comprobaciones**: `npm run build` correcto; `npm test` 30/30 (sin pruebas nuevas); Impeccable sin hallazgos. Capturas `docs/capturas/roles-*.png`.
- **Sin comprobar**: login real de ninguna cuenta (no se crearon cuentas ni se escribió en Neon); que el logout sin CSRF funcione con una sesión sin permiso real (el contrato lo permite, solo se probó contra el simulador); formato exacto de `/admin/iglesias` (se asumió lista de iglesias con `slug`, `nombre`, `estado`); aislamiento real de la parroquial en servidor; móvil de estas pantallas.
- **Siguiente paso**: probar con una cuenta general y otra parroquial reales (autorizadas por Miguel).

## Ocho cuentas parroquiales temporales autorizadas — 30 octubre 2026 (Codex)

- Autorización excepcional de Miguel para completar ocho cuentas ficticias, preservando las dos
  anteriores, general y contenido. Leídas las reglas y última entrega de Claude; no se modificó
  frontend, contrato, esquema, permisos, secretos ni dependencias. Ninguna contraseña de acceso
  se guardó en archivos, argumentos, SQL o logs. PDF simulado intacto.
- Preparado **backend/scripts/cuentas-demo.js**, `npm run admin:demo`, con mapa cerrado de los ocho
  correos/slugs autorizados. Reutiliza crearAdministrador y su comprobación de rol restringido,
  ahora compartida, más el mismo prompt oculto extraído a scripts/lib/prompt-privado.js. Revisión
  de todas las cuentas antes de altas (catedral/santa-ana primero); compara hashes mediante
  verifyPassword de Better Auth. Cuentas existentes coincidentes se conservan; contraseña
  diferente, inactividad o asignación incompatible se informan sin reparación. Solo faltantes
  pasan por signUpEmail y vínculo parroquial activo; fallo de alta detiene el lote sin reintento.
- Incluye **--revisar**, solo lecturas antes de decidir otro intento, y **--verificar**, sin altas.
  La verificación usa Express real localhost:3001, Origin5173/cookie/CSRF: sesión y listado de una
  iglesia; siete listados ajenos403 y PATCH teléfono ajeno403 (propone el mismo valor actual,
  sin contenido nuevo). Documentos privados ajenos admin404/público403 si existen materiales;
  sin muestra privada se informa parcial. Solo sesiones de prueba, con intento de logout final;
  nunca imprime cookies, tokens, páginas o cadenas de conexión. No usa la cuenta general.
- **Intento operativo real único:** desde backend, Node24.21.0,
  `npm run --silent admin:demo` → **salida1**, etapa configuracion,
  codigo **TERMINAL_INTERACTIVA_REQUERIDA**. Este entorno no dispone del prompt privado necesario;
  se detuvo antes de conectar. **Cero consultas/altas remotas y cero verificaciones HTTP reales**.
  No se probó DNS ni autenticación de Neon ni se sustituyó la conexión operativa por propietario
  o credenciales del runtime. No se repitió el intento. No se confirma aplicación de011–013.

| Correo | Iglesia | Resultado real |
|---|---|---|
| prueba.catedral@example.invalid | catedral | Sin consultar; conservación pendiente de verificar |
| prueba.santaana@example.invalid | santa-ana | Sin consultar; conservación pendiente de verificar |
| terceraorden@demo.invalid | tercera-orden | Sin consultar; alta/verificación pendientes |
| santalucia@demo.invalid | santa-lucia | Sin consultar; alta/verificación pendientes |
| catedralcampeche@demo.invalid | catedral-campeche | Sin consultar; alta/verificación pendientes |
| dulcenombrejesus@demo.invalid | dulce-nombre-jesus | Sin consultar; alta/verificación pendientes |
| catedralpuebla@demo.invalid | catedral-puebla | Sin consultar; alta/verificación pendientes |
| lacompania@demo.invalid | la-compania | Sin consultar; alta/verificación pendientes |

- **Pruebas locales:** `node --test --test-isolation=none --test-reporter=spec backend/test/cuentas-demo.test.js backend/test/alta.test.js`
  → **14/14 aprobadas**, salida0. Siete nuevas: revisión/conservación de dos, conflictos sin
  sobrescritura, validación/rol antes de lectura sensible, parada sin reintento, solo seis altas
  en escenario simulado y verificación HTTP positiva/negativa con logout. Criptografía real de
  Better Auth; SQL/HTTP simulados, **no Neon**. Sintaxis de ambos CLI comprobada con node --check.
- Suite conjunta desde raíz `node --test --test-isolation=none --test-reporter=spec` → **117 aprobadas,
  13 HTTP canceladas por listen EPERM,1 integración PostgreSQL omitida**, salida1. Ninguna HTTP
  bloqueada se da por aprobada. Sin cambios SQL, por lo que no se repitió el arnés de migraciones.
- Procedimiento completo en **docs/CUENTAS_DEMO.md**, enlazado desde ADMINISTRACION.md: comando,
  revisión tras fallo, restablecimiento futuro mediante requestPasswordReset/resetPassword de
  Better Auth sin enviar correo y con revocación; permisos de reset no disponibles actualmente,
  requieren autorización aparte, no se implementó recuperación pública ni edición manual de
  hashes. SQL de desactivación y revocación por esos ocho correos/rol parroquial preparado **solo
  como documentación**, no ejecutado; debe revisarse y ejecutarse con autorización antes de publicar.

### Comando pendiente en la terminal de Miguel

Desde raíz, en primera terminal: `nvm use 24`, `cd backend`, `npm start`.
Backend con configuración existente de la misma rama/base y APP_ORIGIN=http://localhost:5173.
En segunda terminal, desde raíz:

```sh
nvm use 24
cd backend
npm run --silent admin:demo
```

Introduce conexión operativa iglesias_alta_admin y contraseña/confirmación en prompts ocultos.
No pegar secretos en chat, argumentos o .env. Si falla conexión/alta, detenerse; comprobar antes
el estado con `npm run --silent admin:demo -- --revisar`. Si las altas terminaron y solo falló HTTP,
usar `npm run --silent admin:demo -- --verificar` con backend disponible. No habilitar roles,
aplicar migraciones o cambiar credenciales automáticamente. Compartir únicamente la salida de
resultados/códigos seguros; confirmar las ocho filas HTTP_OK antes de afirmar aislamiento real.

## Restablecimiento técnico y provisión en un comando — 30 octubre 2026 (Codex)

- Miguel autorizó cambiar **solo PASSWORD de iglesias_alta_admin** y completar el lote acordado.
  Preparado **backend/scripts/restablecer-demo.js**: dos prompts ocultos (conexión del operador
  autorizado y contraseña web acordada); reutiliza IGLESIAS_OPERADOR_URL solo si ya está disponible
  en el entorno del proceso. No escribe secretos ni modifica frontend, dependencias, esquema o
  permisos. No guarda ni incluye la contraseña web en código; la entrada privada es necesaria
  para que Better Auth genere/contraste sus hashes. General y conflictos se conservan.
- Comprueba misma rama/base de Neon que DATABASE_URL y DATABASE_URL_ADMIN, ocho slugs y general.
  **NOLOGIN produce parada antes de cambiar la contraseña**, sin habilitarlo. Inicia/reutiliza
  Express local en3001 con credenciales restringidas. Genera clave técnica aleatoria256 bits,
  la pasa como parámetro a un ajuste local de transacción y DO ejecuta ALTER ROLE únicamente
  PASSWORD. Comprueba atributos/membresías conservados; COMMIT. Cierra el operador y provisiona
  con iglesias_alta_admin usando las funciones existentes de admin:demo; clave solo en memoria.
  Neon exige contraseña original por TLS, no hash calculado por cliente (documentación oficial
  consultada https://neon.com/docs/manage/roles#manage-roles-with-sql). Sin recurrir a Roles UI
  ni al procedimiento de hash del cliente que Miguel reportó fallido.
- Sigue revisión de todas las cuentas, conservación de coincidentes y creación solo de faltantes;
  verificación HTTP de ámbito/privados/modificaciones ajenas y logout del lote anterior. No se
  modifica contenido parroquial. Para si falla, sin reintentos; un cambio técnico confirmado
  no se revierte si luego falla el lote. Otra ejecución rotaría de nuevo: no repetir a ciegas.
- **Estado real:** comprobación local de disponibilidad sin imprimir valores → acceso operativo
  disponible=false, terminal interactiva=false. Único intento:
  `node --env-file-if-exists=.env scripts/restablecer-demo.js` desde backend con Node24.21.0 →
  **salida1**, configuracion/TERMINAL_INTERACTIVA_REQUERIDA, antes de conectar. **Sin SQL remoto,
  cambio técnico, consulta de cuentas ni altas/verificaciones reales**. El estado de NOLOGIN,
  las ocho cuentas y las migraciones remotas siguen sin comprobar por Codex. Sin reintentos.
- **18/18 pruebas específicas aprobadas**, salida0:
  `node --test --test-isolation=none --test-reporter=spec backend/test/restablecer-demo.test.js backend/test/cuentas-demo.test.js backend/test/alta.test.js`.
  Cuatro nuevas comprueban NOLOGIN sin escrituras, aleatoriedad/PASSWORD exclusivo sin hash,
  rollback ante error o cambio de atributos y misma rama/base con endpoint directo/pooler.
  Son dobles SQL/HTTP, no Neon. `node --check backend/scripts/restablecer-demo.js` correcto.
- PostgreSQL17 temporal **single**, sin sockets: se ejecutó el DO extraído del script con clave
  ficticia local y se conservaron LOGIN/connlimit/atributos. Salida0; comprueba sintaxis SQL,
  **no compatibilidad efectiva con Neon ni RLS**. Suite conjunta completa desde raíz con Node24,
  `node --test --test-isolation=none --test-reporter=spec` → **121 aprobadas,13 canceladas por
  listen EPERM,1 integración PostgreSQL omitida**, salida1. No se aprueban las HTTP bloqueadas.
- Procedimiento en CUENTAS_DEMO.md. **Único paso imprescindible en la terminal de Miguel**, desde
  raíz (nvm cargado); no hace falta abrir otra terminal para arrancar backend:

```sh
cd backend && nvm exec 24 node --env-file-if-exists=.env scripts/restablecer-demo.js
```

Introducir la conexión del operador autorizado para alterar el rol en esa rama/base (no la
contraseña olvidada de iglesias_alta_admin) y la contraseña web ya acordada, ambas ocultas.
No guardar la conexión operativa en .env. Si devuelve NOLOGIN, informar antes de autorizar
cualquier habilitación; el script no la hace. Compartir solo resultados/códigos seguros.

## Cierre funcional solicitado: diagnóstico y bloqueo operativo — 30 octubre 2026 (Codex)

- **Estado confirmado por Miguel:** Neon; migraciones001–013 aplicadas; ocho iglesias y selector
  de estados integrados; frontend de roles parroquiales/permisos/urnas integrado. Esto actualiza
  las menciones históricas de migraciones pendientes, pero no certifica ejecución remota por
  Codex. Las cuentas demo siguen **sin confirmar**.
- Revisados los scripts existentes restablecer-demo.js/cuentas-demo y opcionesConexion; no se
  creó otro script ni se modificó código, frontend, dependencias, permisos, secretos o esquema.
  DATABASE_URL_INVALID se produce localmente al parsear la URL o faltar protocolo admitido,
  usuario, contraseña, host o base; por sí solo no indica un fallo de conexión/autenticación.
  La cadena operativa pegada anteriormente no está disponible para inspección: no se afirma
  que estuviese truncada ni se solicitan secretos por chat.
- Comprobación privada con Node24.21.0 y backend/.env, imprimiendo **solo etiquetas/resultados**:
  DATABASE_URL y DATABASE_URL_ADMIN → **VALIDO_SIN_CONECTAR**. Esto solo valida estructura/TLS
  configurado; no comprueba permisos, disponibilidad o estado de Neon. Terminal interactiva=false;
  conexión operativa disponible=false. **Parada en ese punto**, como pidió Miguel: sin repetir
  el intento bloqueado, sin consultas ni escritura remota, sin rotación técnica ni altas.
- Reutilizadas pruebas existentes:
  `node --test --test-isolation=none --test-reporter=spec backend/test/restablecer-demo.test.js backend/test/cuentas-demo.test.js backend/test/alta.test.js backend/test/permisos-iglesia.test.js`
  → **25/25 aprobadas**, salida0. Cubren conservación/conflictos/altas de faltantes, validación,
  NOLOGIN sin cambios, restablecimiento exclusivo de PASSWORD, ámbito/sesión, teléfono propio,
  materiales/horarios/actividades sin cruces, trámites parroquiales de lectura y urnas informativas.
  **SQL/HTTP simulados y criptografía real de Better Auth; no API real contra Neon.** Sin cambios
  de código no se repitió la suite completa ni build de frontend.
- **Pendiente real:** comprobar/provisionar las ocho cuentas; login, sesión, iglesias autorizadas,
  logout y aislamiento contra Neon. El comando existente realiza provisión y recorrido HTTP de
  sesión/listado/teléfono ajeno/privados; eso no reemplaza verificar en real todas las operaciones
  permitidas y prohibidas de materiales, horarios, actividades, trámites y urnas. No se certifica
  esa integración con las pruebas simuladas. No se encontró un fallo de frontend demostrado
  que requiera instrucción a Claude en esta sesión.
- **Rendimiento aplazado hasta cerrar funciones reales:** sin mediciones antes/después y sin
  optimizaciones especulativas. No se ampliaron herramientas ni se alteró contenido parroquial.

**Único siguiente comando**, desde cualquier directorio, en la terminal de Miguel con nvm cargado:

```sh
cd /home/miguel/Proyectos/ProgrmacionUniversidadUTM/iglesias/backend && nvm exec 24 node --env-file-if-exists=.env scripts/restablecer-demo.js
```

En el prompt oculto pegar **solo la URL PostgreSQL completa** del operador autorizado para alterar
el rol, con usuario/contraseña/host/base de la misma rama; después introducir la contraseña web
de demostración acordada en su prompt oculto. No pegarla en chat ni guardarla en archivos.
El script valida antes de conectar, conserva conflictos y general, y se detiene ante NOLOGIN
sin habilitarlo. Compartir únicamente la salida segura de resultados/códigos para continuar.

## Información pública de las ocho iglesias — 31 octubre 2026 (Claude Code)

- **Resumen**: `backend/data/carga-publica.json` ahora trae `informacion` de las ocho iglesias (las cuatro de Mérida sin cambios; añadidas catedral-campeche, dulce-nombre-jesus, catedral-puebla y la-compania). Solo descripción, historia, dirección, fotos y fuente; `materiales`, `horarios` y `tramites` siguen en `[]`. Santo Domingo excluido. **No se escribió en Neon** ni se tocaron scripts, esquema, auth o contrato.
- **Vista previa local** (`node scripts/cargar-contenido.js --vista-previa`): salida 0, 8 operaciones, huella `4e481b1ae5ef0730135011a94dca3d87e6ae0496fcf76f85b3b8942fed042b7f` (cambia con cualquier edición del archivo). Respaldo anterior en `trabajo-contenido/carga-publica.antes.json`.
- **Fotos nuevas** (7, Wikimedia Commons, 1280 px, sin editar) en `frontend/public/imagenes/`; autor, licencia y enlace en `ATRIBUCIONES.md` y en `/imagenes/creditos.html` (14 créditos). `dulce-nombre-jesus` no tiene interior libre y Santa Ana tampoco.
- **Teléfonos**: ninguno cargado. No hallé fuente parroquial, diocesana ni directorio oficial vigente; los candidatos de terceros están en `trabajo-contenido/NOTAS.md` como pendientes de confirmar. `telefono` sigue en `null` («Por confirmar»).
- **Fuentes**: casi todo sale de Wikipedia en español (consultada el 31/10/2026); Dulce Nombre de Jesús, además, de extractos de búsqueda del INAH, una placa histórica y reseñas turísticas (consulta parcial; origen y fechas sin confirmar). Direcciones de Campeche y Puebla provienen de esas mismas fuentes y de listados turísticos; no hay número exterior confirmado.
- **Comprobaciones**: vista previa del cargador (salida 0) y `npm run build` correcto. No hay pruebas de frontend afectadas y no se revisó visualmente en el navegador el interior de las cuatro iglesias nuevas con sus fotos.
- **Pendientes para Codex/Miguel**: el cargador no admite `es_ejemplo:false` (las ocho seguirán marcadas como ejemplo aunque su texto ya no lo sea) ni créditos por foto (van en `fuente` y en `creditos.html`). Antes de aplicar: `--comparar`, revisar huella y autorizar. Confirmar teléfonos con las parroquias y verificar historias con una fuente especializada. El mapa/tarjeta aún no usa `foto_exterior`.

## Museo y Biblioteca de la Catedral (slug `catedral`) — 31 octubre 2026 (Claude Code) — BLOQUEADO, sin cambios de datos

- **No se preparó ningún material ni página.** No pude abrir la fuente principal (BAGN, «Estado de la Catedral de Mérida de Yucatán, Año de 1807», art. 2465): `bagn.archivos.gob.mx` no resuelve DNS desde mi entorno (WebFetch y curl: `ENOTFOUND`/`Could not resolve host`; web.archive.org está bloqueado). Una búsqueda web no la indexa. Sin abrirla no puedo verificar texto, páginas, licencia ni derechos de reproducción, así que no redacté nada a partir de extractos. No se modificaron archivos de datos, frontend ni backend.
- **Cargador actual (`docs/CARGA_CONTENIDO.md`)**: solo actualiza materiales **existentes** por UUID (`categoria_id, tipo, titulo, descripcion_publica, imagen_publica, fuente, es_ejemplo`); no crea materiales, no escribe documentos ni páginas, no cambia `visibilidad` y solo admite `es_ejemplo:true`. Por tanto no sirve para: (1) crear fichas nuevas, (2) cargar páginas/texto/imágenes de documento, (3) marcar `es_ejemplo:false`, (4) retirar de la vista pública los ejemplos sin reemplazo. Para (4) existe `PATCH /admin/materiales/:id` con `visibilidad` (acción manual de la cuenta general, sin borrar), pero ocultar un material con documento exige que el servidor lo proteja (contrato).
- **Cambio necesario para Codex**: un lote de documentos reales requiere cargador o migración que admita, para `catedral`: material (alta o UUID existente), documento con `paginas:[{numero,texto,imagen_url}]`, tipo de contenido (transcripción literal / resumen editorial / original), crédito y licencia por página, `es_ejemplo:false` y `visibilidad`. El esquema actual de `DocumentoEjemplo` tiene `es_ejemplo:true` fijo y `imagen_url` solo pública.
- **Para continuar necesito**: el PDF o texto del artículo guardado dentro del proyecto (p. ej. `trabajo-contenido/bagn-2465/`) o acceso de red a ese host; y confirmar los derechos: el documento de 1807 es de dominio público, pero la edición de 1949 (transcripción, notas, paginación) puede tener derechos; hay que leer el aviso del BAGN.

## Cuadernos informativos de la biblioteca (ocho iglesias) — 31 octubre 2026 (Claude Code)

- **Preparado, NO aplicado en Neon**: `backend/data/cuadernos-informativos.json` (un solo formato común) con 8 cuadernos «Conoce [iglesia]», uno por slug, 4 páginas cada uno: Presentación, Historia, Arquitectura y patrimonio, Fuentes y créditos de imágenes. Cada página: `numero`, `texto`, `imagen_url` (ruta pública de las fotos ya acreditadas en `frontend/public/imagenes/` o `null`). Generador: `trabajo-contenido/generar_cuadernos.py` (reutiliza `descripcion/historia/direccion/fuente` de `carga-publica.json`; la arquitectura se redactó a mano). Sin cambios de frontend, scripts, esquema, auth ni contrato; no se ejecutó build porque el frontend no se tocó.
- **Naturaleza del contenido**: texto editorial propio, identificado en la página 1 y en `descripcion_publica` como «Cuaderno informativo»; no es transcripción, libro original ni documento de la parroquia. `clase_contenido: "cuaderno_informativo"`, `tipo: "documento"`, `categoria_id: "libros-documentos"`, `es_ejemplo: false`.
- **Fuentes**: las de `carga-publica.json` (Wikipedia en español, INAH en extracto, placa histórica, reseñas turísticas) y, para arquitectura, Wikipedia «Catedral de San Ildefonso (Mérida)», «Catedral de Campeche», «Catedral de Puebla» y «Templo de la Compañía (Puebla)» (31/10/2026). No existen artículos de Wikipedia para Jesús, Santa Lucía y Santa Ana de Mérida: sus páginas de arquitectura solo usan lo ya confirmado y dicen expresamente qué no se pudo confirmar (objetos, retablos, fechas). Dulce Nombre de Jesús tiene el contenido más débil. Se omitieron datos contradictorios (alturas de torres de Puebla, planta de la catedral de Mérida).
- **Imágenes**: solo las 13 fotos ya acreditadas (Commons, CC0/CC BY/CC BY-SA); créditos en la página 4 de cada cuaderno, `ATRIBUCIONES.md` y `/imagenes/creditos.html`. Sin imágenes de documentos.
- **Cargador actual (`CARGA_CONTENIDO.md`)**: no sirve para esto. Solo actualiza materiales existentes por UUID (sin crear, sin documentos/páginas, `es_ejemplo` solo `true`, sin `visibilidad`). **Paso mínimo para Codex**: cargador o migración revisable que, por `slug_iglesia`, (1) cree o reemplace el material (`titulo`, `descripcion_publica`, `imagen_publica`, `fuente`, `tipo`, `categoria_id`, `es_ejemplo:false`), (2) cree su documento con `paginas[{numero,texto,imagen_url}]` aceptando `es_ejemplo:false` en material y documento, y (3) retire de la vista pública los 6 ejemplos ficticios por iglesia sin borrarlos (p. ej. pasarlos a `visibilidad:'privado'` de forma explícita y revisable, sin tocar objetos ni materiales privados). Mantener las advertencias de ejemplo mientras haya texto ficticio. El lector actual ya muestra texto con saltos de línea e imagen por página.
- **Sin comprobar**: no se vio el cuaderno en el lector (no hay forma de cargarlo sin backend); no se contrastó con fuentes especializadas; el lote anterior del BAGN 2465 sigue sin hacerse (la carpeta `trabajo-contenido/bagn-2465/` no existe).

## Cuadernos informativos — cargador y lector backend — 31 octubre 2026 (Codex)

- Revisados AGENTS.md, contrato, esquema y última entrega de Claude. Integrado el lote existente
  **sin editar sus textos, fuentes, créditos o imágenes**:8 cuadernos,32 páginas, es_ejemplo:false,
  documento/libros-documentos y mención «Cuaderno informativo». Es contenido editorial, no
  transcripción original ni verificación parroquial. **BAGN queda excluido**. Sin frontend,
  nuevas dependencias, secretos, modificaciones de autenticación ni conexión remota.
- Único cargador **backend/scripts/cargar-cuadernos.js**, lógica en src/carga-cuadernos.js.
  Modos --vista-previa (por defecto, sin conexión), --comparar (READ ONLY) y --aplicar SHA256.
  Conexión solo mediante prompt oculto, sin .env ni argumentos secretos. Validación estricta
  de ocho slugs únicos, páginas1–4 y referencias de imagen. Aplicación SERIALIZABLE con bloqueos,
  COMMIT final/ROLLBACK completo ante conflicto/error; sin reintentos automáticos. Solo escribe
  materiales/documentos/páginas, nunca borra. Comparación devuelve antes/después y omitidas.
- UUID estable por namespace/slug, independiente de títulos/orden/fecha. Repetir el lote idéntico
  no duplica ni vuelve a escribir. Colisión con privado/otra iglesia/tipo incompatible o páginas
  adicionales aborta. Se conservan materiales privados, objetos y documentos/páginas anteriores,
  cuentas/sesiones y sus permisos; no se actualizan iglesias, horarios, actividades o trámites.
- **Migración mínima revisable014_cuadernos_informativos.sql**, después de013 y antes de desplegar
  este backend.002 imponía documentos.es_ejemplo=true e imagen_url=null:014 permite documentos
  no ficticios e imágenes locales de formatos permitidos; añade marca interna retirado_publico
  y filtros RLS. Protege imágenes contra inserción en privados y privatización posterior mediante
  triggers sin SECURITY DEFINER. Solo añade SELECT de la marca al rol público, sin notas internas,
  privilegios administrativos ni nuevas identidades. **Preparada, NO aplicada en Neon**. El cargador
  nunca ejecuta DDL ni concede permisos; requiere autorización separada para aplicar014.
- Retirada conservadora de las semillas públicas sustituidas:003 contiene **4 por iglesia original
  de Mérida,16 candidatas en total**, no6 por cada una de las8 como sugería la entrega. Identificadas
  por UUID conocido+slug+metadatos originales+es_ejemplo:true/publico; filas editadas se conservan
  y se informan. Las otras4 iglesias no tienen esas muestras en las semillas. Cambia exclusivamente
  retirado_publico=true, **manteniendo visibilidad='publico'**, documentos y páginas; no las etiqueta
  como archivo reservado. Listado público las excluye; ficha/documento directo404. Administración
  conserva acceso con los ámbitos existentes. No se afirma cuántas candidatas siguen en Neon.
- API conserva campos del lector: {material_id,titulo,es_ejemplo:false,paginas:[{numero,texto,
  imagen_url}]}. Fichas de cuaderno tiene_documento:true/bloqueado:false. Privados mantienen flags
  y403 público; notas internas no se proyectan. PATCH admin a privado con imágenes devuelve409
  CONFLICT antes de escribir; requiere retirar referencias operativamente para no dejar imágenes
  públicas en contenido privado. Contrato actualizado, sin nuevas rutas ni campos públicos.
- **docs/VISTA_PREVIA_CUADERNOS.json generado**, salida0:8 materiales/8 documentos/32 páginas,
  **14 imágenes distintas** existentes, no vacías, dentro de frontend/public y con firma válida
  (la entrega de Claude decía13; se mantuvieron todas las referencias originales). Huella:
  **3641ac226e7322ef42a02987e279b56277c716b7a9c69e0ff2d11a216b2e3477**. Es vista local,
  no comparación real con Neon. Procedimiento exacto en **docs/CARGA_CUADERNOS.md**.
- Pruebas específicas nuevas **6/6 aprobadas**, cliente SQL simulado/Express en memoria/archivos
  de imagen reales: identidad y preservación, validación, comparación sin escritura, idempotencia,
  conflicto y rollback tras escrituras previas, retiradas públicas404/privados403/objetos intactos,
  JSON exacto del lector para ocho documentos e imágenes y409 al privatizar ilustrados.
  `node --test --test-isolation=none --test-reporter=spec backend/test/cuadernos.test.js backend/test/catalogo-fase2.test.js backend/test/admin.test.js backend/test/permisos-iglesia.test.js`
  → **29/29 aprobadas**, salida0. Sintaxis de cargador y módulo correcta.
- El test antiguo del lote de Mérida dependía del JSON editable limitado a4; Claude ya lo amplió
  a8. Se aisló ese test al subconjunto original, conservando la comprobación de nuevas iglesias
  y sin tocar datos. Se adaptó el capturador SQL administrativo al nuevo chequeo de imágenes.
- Suite conjunta completa, Node24.21.0,
  `node --test --test-isolation=none --test-reporter=spec` → **128 aprobadas,13 HTTP canceladas
  por listen EPERM,1 integración PostgreSQL omitida**, salida1. Incluye frontend existente sin
  modificar/build/recorrido visual. No se dan las HTTP bloqueadas por aprobadas.
- `python3 backend/test/validar_sql_local.py` → **salida0**, PostgreSQL17.11 temporal single:
  SQL001–014, consultas parametrizadas reales, carga/repetición,32 páginas nuevas,16 retiradas,
  originales conservados, snapshots de cuentas/sesiones de prueba, CHECK/triggers de imágenes
  y rollback. **Single no certifica RLS efectivo ni driver pg**. `--servidor` → **salida1**, socket
  Unix Operation not permitted; se detuvo, sin repetir. RLS efectivo/HTTP con pg/Neon y lector en
  navegador siguen pendientes. No hubo consulta, migración o aplicación remota.

### Entrega para Claude y único comando de carga pendiente

El lector existente ya admite boolean es_ejemplo y paginas con numero/texto/imagen_url; consume
los UUID que recibe, sin hardcodear los nuevos. No requiere cambios de frontend. Después de
014 y carga autorizadas, verificar en5173 ocho cuadernos,4 páginas, fotografías/créditos y ausencia
de muestras retiradas. No presentar cuadernos como archivos originales o requisitos oficiales.

**Primero revisar y autorizar014**, aplicarla una vez antes de desplegar el backend que usa la
columna nueva; no repetir001–013. Después, desde raíz con nvm cargado, único comando de carga:

```sh
nvm exec 24 node backend/scripts/cargar-cuadernos.js --aplicar 3641ac226e7322ef42a02987e279b56277c716b7a9c69e0ff2d11a216b2e3477
```

Pide conexión completa del operador autorizado en oculto; no usar credencial propietaria en la
API ni guardar la conexión en .env. Cambiar el archivo exige regenerar/revisar la huella. Para
comparar sin escribir, usar el mismo cargador sustituyendo --aplicar y huella por --comparar.
No se ejecutó ese comando contra Neon; aplicación y verificación real pendientes.

## Carga autorizada por MCP Neon — 31 octubre 2026 (Codex): bloqueo de acceso

- Miguel confirma014 aplicada y autoriza cargar los8 cuadernos, comparando antes y deteniéndose
  ante conflictos/cambios ajenos. Alcance exclusivo: proyecto iglesias, rama production,
  base neondb; conservar objetos, privados, cuentas y permisos. No repetir014.
- Inspección del catálogo de herramientas de **esta sesión**: ninguna herramienta Neon ni
  cliente SQL/PostgreSQL MCP disponible. Consulta dirigida de recursos del servidor MCP neon:
  **no disponible**. La autorización comunicada no se interpreta como conexión comprobada.
  No se confirma proyecto, rama, base o estado remoto de014 desde esta sesión.
- Verificada de nuevo la huella local del lote:
  **3641ac226e7322ef42a02987e279b56277c716b7a9c69e0ff2d11a216b2e3477**, sin cambios.
  Se conserva el cargador ya validado; no se prepararon herramientas adicionales ni se alteró
  su lógica. Sin modificación de código, no se repitieron pruebas locales.
- **Parada antes de conectar/escribir**: no comparación remota, carga, retirada, migración,
  cambio de cuentas/permisos o verificación posterior por API. No se utilizaron credenciales
  del chat/.env como alternativa ni se pidió conexión técnica. No se declara integración real.
- Pendiente imprescindible: que el MCP de Neon esté disponible en esta sesión. La autorización
  de carga ya está dada; entonces confirmar iglesias/production/neondb y014 por lectura,
  comparar con la lógica existente y solo aplicar transaccionalmente si todo coincide;
  verificar después8 documentos/32 páginas y API pública si está disponible. No repetir014.

## Cuadernos aplicados y verificados en Neon MCP — 31 octubre 2026 (Codex)

- **Carga remota autorizada y completada**, exclusivamente proyecto
  **divine-wildflower-50337376 (iglesias)**, rama **production/br-plain-block-b52diza7**,
  base **neondb**. Destino confirmado por MCP y current_database(); no se consultaron otros
  proyectos ni se cambiaron credenciales, roles o configuración de autenticación.
- **014 ya aplicada, comprobada sin repetirla**: retirado_publico boolean NOT NULL DEFAULT false,
  ausencia del CHECK documentos.es_ejemplo=true, CHECK de rutas de imágenes, función y dos
  triggers esperados activos, RLS habilitado en las tres tablas, políticas públicas de retirada
  y SELECT de la marca disponibles. Sin migraciones nuevas, DDL o concesiones de permisos.
- Lote local revalidado con prepararCuadernos/comprobarImagenes existentes:8 cuadernos/32 páginas,
 14 imágenes existentes, huella
  **3641ac226e7322ef42a02987e279b56277c716b7a9c69e0ff2d11a216b2e3477**.
  Sin edición de textos, saltos, fuentes, créditos, fotos ni identificación «Cuaderno informativo».
- **Comparación previa con filas reales de Neon**:36 materiales,20 documentos,140 páginas;
  ocho UUID de destino libres y16 semillas públicas exactamente coincidentes. Se ejecutó la
  lógica original cargarCuadernos sobre esa lectura atómica mediante un adaptador temporal,
  reutilizando el cliente de pruebas existente para generar sus mismas consultas parametrizadas.
  Resultado: **8 crear,16 retirar,0 conflictos/omitidas**. No se implementó otro cargador ni se
  alteró el código de negocio para usar MCP.
- **Aplicación en una transacción MCP SERIALIZABLE**,64 escrituras del cargador:8 materiales,
  8 documentos,32 páginas y16 UPDATE exclusivos de retirado_publico. Literales escapados a partir
  de sus parámetros, standard_conforming_strings local; sin secretos ni conexión técnica en
  argumentos/archivos. Bloqueo de filas y guardia de huella antes de la primera escritura para
  abortar si cambió el estado desde la comparación. Guardia final del estado completo esperado,
  totales y fingerprints de protegidos; cualquier discrepancia habría causado rollback.
  Resultado final de transacción: **CUADERNOS_APLICADOS_Y_PROTEGIDOS_VERIFICADOS**. Sin DELETE.
- **Verificación independiente tras COMMIT**: coincide_estado_completo=true, **44 materiales,
  28 documentos,172 páginas**. Ocho cuadernos públicos/documento con es_ejemplo:false tanto en
  ficha como documento y cuatro páginas numeradas1–4 en cada iglesia. Igualdad exacta contra
  el lote, incluyendo texto/imágenes/fuentes/créditos; no solo recuentos. Las16 muestras siguen
  existiendo con visibilidad='publico' y retirado_publico=true; no son archivos reservados.
- Fingerprints antes/dentro/después conservados de materiales ajenos al lote (incluidos objetos
  y privados), todos los documentos/páginas anteriores, iglesias/categorías/horarios/actividades/
  trámites, administradores/usuarios/cuentas/sesiones, roles/membresías/políticas y privilegios
  de tablas/columnas. La consulta solo devuelve fingerprints, nunca hashes de contraseñas,
  tokens o contenido privado. **No se modificaron cuentas ni permisos**.
- **RLS efectivo comprobado ahora en Neon**, en transacción READ ONLY con SET LOCAL ROLE
  iglesias_api, rol sin superusuario ni BYPASSRLS:28 fichas visibles, **0 retiradas visibles,
  8 documentos/32 páginas públicas**,0 documentos privados visibles y permiso de SELECT sobre
  descripcion_interna=false. Cada uno de los8 cuadernos es visible con4 páginas y flagfalse.
  Esta comprobación sí usa la base real, a diferencia de las pruebas locales previas.
- Pruebas del cargador/lector existentes reejecutadas con Node24.21.0:
  `node --test --test-isolation=none --test-reporter=spec backend/test/cuadernos.test.js`
  → **6/6 aprobadas**, salida0. Sin cambios de código, instalaciones o frontend, ni repetición
  de la suite completa ya registrada en la entrega anterior. BAGN excluido.
- **API HTTP real pendiente**: único intento GET http://127.0.0.1:3001/api/iglesias desde este
  entorno → **EPERM**. No se afirma lectura HTTP ni revisión visual del lector. No se forzó
  otra conexión, publicación o servidor. El formato del lector se había verificado con Express
  en memoria; acceso público a datos/documentos se verificó por RLS real, no por HTTP.
- Se actualizó CARGA_CUADERNOS.md para marcar esta carga como aplicada. **No repetir014 ni volver
  a cargar este lote** para completar la etapa. Pendiente únicamente verificar desde el entorno
  local de Miguel la API en3001 y el lector en5173: ocho cuadernos/fotografías/créditos,404 de
  retirados y403 de documento privado. No se solicita otra autorización para la carga ya hecha.

## Objetos reales del museo (lote para Codex) — 31 octubre 2026 (Claude Code)

- **Preparado localmente, NO aplicado en Neon**: `backend/data/objetos-museo.json` (10 objetos, no 16), entrega e instrucciones para Codex en `docs/OBJETOS_MUSEO.md`, 9 fotos nuevas en `frontend/public/imagenes/` (más la foto de la portada de Campeche ya publicada), créditos actualizados en `ATRIBUCIONES.md` y `creditos.html` (las 23 imágenes figuran en ambos). Temporales y generador en `trabajo-contenido/` (`generar_objetos.py`, `meta-objetos.json`). Sin cambios de código, cuadernos, cuentas, permisos ni diseño; no se ejecutó build porque no se tocó el frontend.
- **Piezas confirmadas**: catedral (cruz del atrio; placa de la arquidiócesis), tercera-orden (piedra labrada maya), catedral-campeche (altar mayor y tabernáculo; portada), dulce-nombre-jesus (espadaña, descripción mínima), catedral-puebla (Altar de los Reyes; altar mayor y ciprés), la-compania (lápida de Catarina de San Juan; ábside y altar mayor). Cada foto se identificó por el título/descripción de Commons y por su contexto (inscripción legible en la placa de Mérida y en la lápida de Puebla).
- **Faltantes**: santa-lucia y santa-ana (0 objetos), una pieza de tercera-orden y otra de dulce-nombre-jesus. Cristo de la Unidad y Cristo de las Ampollas descartados (sin foto libre identificable; fuentes ambiguas sobre cuál imagen está hoy en la capilla).
- **Fotos interiores**: siguen pendientes Santa Ana y Dulce Nombre de Jesús; no hay en Commons.
- **Fuentes**: Wikipedia en español (catedrales de Mérida, Campeche, Puebla, La Compañía, Arquidiócesis de Yucatán), Wikipedia en inglés (Catarina de San Juan), Commons, Ryo y PorEsto!. Fuente principal divulgativa: conviene contrastar con una especializada. Se distinguen tradiciones de hechos (China Poblana, restos «supuestamente» sepultados).
- **Pendiente para Codex**: cargador de objetos (crear con UUID determinista, `es_ejemplo:false`, sin duplicados), retirar las 8 muestras `Cáliz de ejemplo`/`Campana de muestra` de Mérida con `retirado_publico` solo si siguen siendo demostración, sin tocar privados; no hay campo de créditos por imagen (van en `fuente`). Ver `docs/OBJETOS_MUSEO.md`.
- **Sin comprobar**: las páginas de objetos con estas fotos no se vieron en el navegador (no hay datos cargados); los textos no se contrastaron con fuentes especializadas.

## Diez objetos aplicados en Neon — 31 octubre 2026 (Codex)

- Leídos AGENTS.md, OBJETOS_MUSEO.md, contrato y entrega de Claude. Se reutilizó el **mismo CLI
  scripts/cargar-cuadernos.js**, que detecta objetos con --archivo, más src/carga-objetos.js.
  Comparación/aplicación transaccional, identidad por clave y namespace iglesias/objeto-museo/v1,
  parámetros SQL y es_ejemplo:false. Se comparte generación de UUID y comprobación de imágenes
  con cuadernos; sus UUID se conservan. Sin frontend, dependencias, migraciones o nuevas tablas.
- Revisión local:10 fotografías existentes, firma válida y rutas dentro de public; metadatos
  de crédito íntegros en fuente y coincidentes por fotografía con ATRIBUCIONES.md/creditos.html.
  No se añadió creditos_imagen al contrato ni a la base. Descripción/historia, fuente y foto
  se guardan en los campos existentes, sin acortar/reinventar textos. Las fuentes son divulgativas;
  no se afirma contraste histórico especializado. Intento adicional de consulta de Commons:
  la piedra maya de Inri sí abrió y muestra CC0/dominio público; las páginas de Catedral de
  Campeche09 y CryptChinaPoblana no estuvieron accesibles con web. No se afirma revalidación
  externa completa de todos los créditos. Se conservaron los créditos preparados y concordantes.
- Lote validado: **10 piezas**, huella
  **2385233929c62b9e93d4b0b3a7bcd3a72828ad986e81c28d034e3d28e8a92d59**.
  **6 pruebas nuevas de objetos aprobadas**, junto con6 de cuadernos→12/12, salida0: validación,
  fotos/créditos, identidad, comparación sin escritura, idempotencia, conflictos/rollback,
  conservación de privados/cuadernos y proyección pública. SQL/lecturas simulados, imágenes reales.
  Suite conjunta Node24.21.0: **134 aprobadas,13 HTTP canceladas por listen EPERM,1 integración
  omitida**, salida1. PostgreSQL local001–014/consultas/cuadernos→salida0, modo single; no certifica
  RLS efectivo. No se usaron pruebas simuladas como sustituto de la comprobación real cancelada.
- Destino real confirmado exclusivamente por MCP: proyecto **divine-wildflower-50337376**,
  rama **production/br-plain-block-b52diza7**, base **neondb**. Esquema existente suficiente.
  Comparación con filas reales usando cargarObjetos y el adaptador temporal de filas existente:
  **10 crear,8 retirar,0 conflictos**. Las ocho muestras seguían siendo Cáliz de ejemplo/Campana
  de muestra originales (iglesia, título, historia ficticia, categoría/tipo, fuente/foto nulas,
  público/es_ejemplo:true). Las diez identidades de destino estaban libres.
- **Carga confirmada en una transacción MCP SERIALIZABLE**,18 escrituras:10 INSERT/UPSERT de
  materiales y8 UPDATE únicamente de retirado_publico. Huella antes de escribir y guardia
  final de estado completo/fingerprints; discrepancia abortaría con rollback. Sin DELETE ni
  escrituras de documentos/páginas. Resultado **OBJETOS_APLICADOS_Y_PROTEGIDOS_VERIFICADOS**.
- **Consulta independiente después de COMMIT**: coincide_estado_completo=true;54 materiales,
  **28 documentos y172 páginas sin cambios**;8 muestras de objetos retiradas, aún públicas;
  ningún documento añadido a objetos. Distribución pública: catedral2,tercera-orden1,
  santa-lucia0,santa-ana0,catedral-campeche2,dulce-nombre-jesus1,catedral-puebla2,la-compania2.
  Las fichas privadas de muestra se conservan, también en Santa Lucía/Santa Ana; no se inventaron
  objetos para ellas. Igualdad exacta de nuevas fichas/fotos/fuentes contra el lote, no solo conteos.
- Fingerprints conservados antes/dentro/después: todos los materiales ajenos al lote (incluidos
  ocho cuadernos y privados), documentos/páginas completos, iglesias/categorías/horarios/
  actividades/trámites, cuentas/usuarios/administradores/sesiones/verificaciones/límites,
  roles/membresías/políticas y permisos de tablas/columnas/funciones. No se imprimieron secretos
  ni cuerpos privados; las comprobaciones retornan solo fingerprints e indicadores.
- **Pendiente: verificación con rol restringido.** La segunda transacción, enviada exclusivamente
  para READ ONLY + SET LOCAL ROLE iglesias_api + SELECT de recuentos/permisos, fue cancelada por
  Miguel antes de devolver resultados: **user cancelled MCP tool call**. Pidió mostrar el SQL
  antes de repetirla; no se repite ni se da por aprobada. **La carga ya se ejecutó y no debe
  repetirse**. No se modificaron roles/permisos mediante esa consulta de verificación.
- API HTTP local: único GET127.0.0.1:3001/api/iglesias→**EPERM**. Verificación HTTP y visual del
  museo pendientes; sin afirmar integración en navegador. Próximo paso: revisar el SQL de la
  comprobación pública, sin nuevas cargas. OBJETOS_MUSEO.md actualizado con el estado real.

## Entrega final de objetos: verificación pública real aprobada — 31 octubre 2026 (Codex)

- Miguel autorizó ejecutar el SQL de verificación mostrado. Ejecutado únicamente mediante
  Neon MCP en **divine-wildflower-50337376**, **production/br-plain-block-b52diza7**, **neondb**:
  transacción **READ ONLY**, SET LOCAL ROLE iglesias_api y SELECT de recuentos/permisos.
  **No se repitió la carga**, no hubo INSERT/UPDATE/DELETE, migraciones, cambio de permisos,
  cuentas o autenticación. SET LOCAL ROLE no concede privilegios ni persiste tras la transacción.
- **Resultados reales, todos los esperados confirmados**:

  | Comprobación | Resultado |
  |---|---:|
  | Rol efectivo | iglesias_api |
  | Superusuario / BYPASSRLS | false / false |
  | Fichas visibles totales | 30 |
  | Objetos públicos | 10 |
  | Fichas de objetos privados conservadas | 4 |
  | Materiales retirados visibles | 0 |
  | Documentos públicos visibles | 8 |
  | Páginas públicas visibles | 32 |
  | Documentos privados visibles | 0 |
  | Permiso SELECT de descripcion_interna | false |

- **Cerrada la verificación de datos y RLS real de la carga**. Los10 objetos,8 muestras retiradas,
  cuadernos/páginas, cuentas y permisos ya conservados por la comprobación posterior de la carga
  no requirieron otra escritura. OBJETOS_MUSEO.md actualizado; ningún cambio de código/frontend
  o dependencias en esta verificación, sin repetir pruebas simuladas para una consulta remota.
- **Pendiente únicamente HTTP y revisión visual en navegador**: la API local había devuelto EPERM;
  no se repitió ese intento ni se declara comprobado el museo/lector en5173. Esta limitación no
  invalida los recuentos y la protección RLS efectivamente comprobados en Neon.

## Investigación de contenido de las ocho iglesias — 31 octubre 2026 (Claude Code)

- **Solo investigación; sin Neon, código ni contenido publicado.** Informe `docs/INVESTIGACION_CONTENIDO.md` y lote `backend/data/investigacion-contenido.json` (53 hallazgos con iglesia, slug, valor, nivel, URL, institución, fechas y observaciones; 9 fuentes). Generador en `trabajo-contenido/generar_investigacion.py`. Archivos actuales conservados.
- **Resultado**: ningún dato oficial nuevo de teléfono parroquial, horarios ordinarios ni requisitos. Lo hallado es secundario (Diario de Yucatán 2019/2024, PorEsto!, directorios privados misas.info y weekdaymasses). El sitio de la Arquidiócesis de Yucatán solo da su propio teléfono (9247777) y dirección; su directorio no cargó. Sin sitio abierto de Campeche ni de la Arquidiócesis de Puebla; Facebook inaccesible.
- **Cobertura**: teléfonos candidatos para 6 de 8 (no cargar); horarios ordinarios candidatos para 6 de 8 (Santa Lucía contradictoria; La Compañía incompleto); requisitos solo bodas Catedral Mérida (prensa sin fuente); fotos interiores siguen pendientes en Santa Ana y Dulce Nombre; objetos sin cambio (10 de 16). Campeche: sin datos.
- **Para Codex**: no integrar nada de este lote sin confirmación; las ocho iglesias siguen con `telefono` en `null` y requisitos «por confirmar». Los objetos/fotos ya preparados siguen en `objetos-museo.json`.
- **Sin comprobar**: contenido de las páginas de Facebook, sitios de diócesis de Campeche/Puebla y el directorio de la arquidiócesis; no contacté a nadie.

## Imágenes de objetos, teléfonos y trámites — 31 octubre 2026 (Claude Code)

- **Terminado en el frontend (verificado con la API real en 3001 vía Vite 5173; no se detuvieron tus servidores)**:
  - Tarjetas de objeto con fotografía en la estantería (`object-fit: contain`, proporciones intactas) y fotografía en la ficha (alt «Fotografía de…», alto máximo 70 vh); la ficha enlaza `/imagenes/creditos.html` y envuelve la fuente con crédito.
  - Iglesias sin foto interior (Santa Ana, Dulce Nombre de Jesús): se muestra la exterior con la etiqueta visible «Vista exterior · la fotografía interior está pendiente»; sin ninguna foto, estado pendiente. Cuadernos y sus imágenes sin cambios.
  - Museo: nota «objetos documentados … pendientes» cuando solo quedan fichas reservadas (Santa Lucía, Santa Ana).
  - Trámites: encabezado «Qué consultar antes de acudir» con orientación general por tipo (bautizos, bodas, misas por difuntos, otros, urnas/nichos), identificada como orientación y sin afirmar requisitos de ninguna parroquia. Los requisitos con estado `ejemplo` (16 fichas de Mérida) ya no se muestran; los que tengan otro estado se muestran como «Requisitos informados (por confirmar)» o «Requisitos» si están verificados.
- **Comprobado con la API real**: las 8 iglesias y 10 objetos públicos devuelven 200 `image/jpeg` en cada ruta; cada objeto coincide en título, iglesia y ruta con `objetos-museo.json`; los 10 son `es_ejemplo:false`. Capturas `docs/capturas/objetos-*`, `interior-*`, `tramites-orientacion-*`. `npm run build` correcto; `npm test` 30/30 (sin pruebas nuevas: es presentación).
- **Preparado para cargar, NO cargado**: `backend/data/tramites-sin-muestras.json` (16 operaciones, huella `a60e2295…fb66`, vista previa salida 0) y `backend/data/telefonos-candidatos.json` (3 teléfonos con fuente y aviso). Instrucciones en `docs/ENTREGA_TELEFONOS_Y_TRAMITES.md`.
- **Pendiente**: teléfonos requieren campos nuevos en el contrato (`telefono_estado`, `telefono_fuente`); hoy todos los teléfonos siguen «Por confirmar». Cargar el lote de trámites cuando Codex lo revise. Santa Lucía y Santa Ana siguen sin objeto público documentado y las fichas privadas de muestra permanecen visibles como «acceso reservado».
- **Sin comprobar**: ancho real de 390 px (Firefox headless usa ≈488 px); lectores de pantalla; la carga de los lotes.

## Ajuste de la pantalla de trámites — 31 octubre 2026 (Claude Code)

- **Hecho (solo frontend, `paginas/publico/Tramites.jsx`)**: un único aviso breve por guía («Orientación general, no requisitos oficiales de esta parroquia…»); se quitaron los avisos repetidos (pie de fuente, párrafo bajo el encabezado y «Esta guía es solo informativa»). Las preguntas de «Qué consultar antes de acudir» se conservan con viñetas.
- **Sin teléfono** ya no se muestra «Llama a la parroquia» ni tarjeta vacía: aparece «Consulta en la oficina parroquial» con la dirección disponible (se omite si está vacía) y «Ver en Google Maps» (por coordenadas del catálogo, pestaña nueva). Con teléfono: número y «Llamar». Ningún teléfono nuevo ni dato cambiado en Neon.
- **Verificado** con la API real (Vite 5173): Santa Ana (urnas) y Catedral de Campeche (bodas), escritorio 1440 y móvil ≈500 px (Firefox headless no baja de ahí); sin desbordamiento, un solo aviso, enlace de Maps correcto. `npm run build` y `npm test` (30/30) correctos; detector de Impeccable sin hallazgos. Capturas `docs/capturas/tramites-limpio-*`.
- **Sin comprobar**: 390 px reales y lectores de pantalla; el enlace de Maps no se abrió.

## Rendimiento: diagnóstico preparado, medición HTTP bloqueada — 1 noviembre 2026 (Codex)

- Leídos AGENTS.md y entregas recientes, incluido el ajuste de trámites de Claude. **Sin detener,
  iniciar o reiniciar servidores del usuario**. No se tocaron rutas/contratos, RLS, permisos,
  sesiones, datos o cachés de la aplicación; no se repitieron cargas/migraciones ni se instalaron
  paquetes. Ocho cuadernos/diez objetos no se modificaron. Sin cambios de frontend/esquema remoto.
- **Medición antes de cambiar el comportamiento:** un único fetch GET
  http://127.0.0.1:3001/api/iglesias?estado=yucatan→**EPERM**, antes de una respuesta medible.
  Se detuvieron ahí las mediciones HTTP reales y no se hicieron reintentos bloqueados. No se
  atribuye la lentitud a localhost ni a Neon: EPERM evidencia una restricción de este entorno,
  no un tiempo de la aplicación. No se ejecutó MCP para sustituir esa medición por su latencia
  de herramienta, que no equivale a la API. No se usaron conexiones de propietario.

  | Medida real | Antes | Después |
  |---|---|---|
  | Primera carga HTTP de la API | No válida: EPERM | No se cambió el backend servido |
  | Navegación posterior/proxy Vite | No medida: parada por bloqueo | Pendiente de informe |
  | Adquisición de conexiones/ida-vuelta pg | No medida | Pendiente de informe |
  | Ejecución SQL en Neon | No medida | Pendiente de informe |
  | Render, fotos y Network del navegador | No medidos | Pendientes de Claude |

- **Única herramienta solicitada para la terminal:** backend/scripts/diagnosticar-rendimiento.js.
  No altera código servido ni DB; consulta solo datos públicos y genera un JSON con fecha en
  docs/diagnostico-rendimiento-*.json, sin sobrescribir informes previos. Registra huella de
  db.js/lecturas.js para comparar futuras ejecuciones. No guarda cuerpos, cookies, parámetros,
  SQL completo, conexiones o errores originales. Server-Timing, si existe, se limita a nombres
  y duraciones; no se guardan descripciones arbitrarias.
- Con los servidores existentes, el comando mide dos recorridos (primera observada/posterior)
  en API directa3001 y luego proxy5173. Mapa, iglesia, museo/biblioteca, ficha, lector, trámites
  y retorno al museo; respeta los Promise.all del frontend. Un cambio de pestaña del museo
  usa filtro local y no se inventa otra llamada de red. También mide las imágenes públicas
  referenciadas, sin simular la caché del navegador. Usa Catedral de Mérida como caso representativo;
  no afirma cobertura temporal de las ocho iglesias.
- Después mide el servicio público real con un **pool propio de diagnóstico**, DATABASE_URL
  existente, TLS verificado, mismas transacciones READ ONLY, control de rol/propiedad y SET LOCAL
  ROLE iglesias_api. Separa adquisición nueva/reutilizada (incluye conexión/TLS/autenticación si
  es nueva), comandos de guardia y consultas de negocio; cuenta repeticiones por huella. No
  identifica por separado DNS/TLS ni promete medir el pool del Express ya iniciado. El wrapper
  de seguridad rechaza propietario/BYPASSRLS antes de cualquier dato de negocio.
- Finalmente ejecuta EXPLAIN ANALYZE únicamente sobre esos SELECT públicos, bajo la misma
  transacción restringida, para separar planning/execution del tiempo driver (red+servidor).
  Los planes se toman **después** de los tiempos, sin contaminar los recorridos anteriores.
  No escribe ni modifica índices/esquema. Ante EPERM/EACCES se detiene la red afectada sin
  continuar con proxy/DB u otras imágenes. No introduce caché compartida ni consulta privados.
- Límites: primera observación no es arranque frío forzado; no se vacían pools ni se suspende
  Neon. El proxy se mide después de API directa y puede encontrar datos/conexiones calientes:
  no interpretar su diferencia como coste aislado del proxy. Es reproducción de peticiones,
  no captura real de React/Network ni prueba del render. Datos de un pool nuevo no certifican
  el estado de conexiones del servidor ajeno.

### Trabajo repetido encontrado por lectura de código, sin atribución temporal

- src/db.js: cada consulta de negocio hace **5 comandos secuenciales**: BEGIN, comprobarRolSql,
  SET LOCAL ROLE, SELECT, COMMIT. La seguridad es necesaria; no se eliminó ni cacheó el control.
- src/lecturas.js: listarMateriales/listarTramites primero leen la iglesia y luego sus filas,
  en **2 transacciones separadas**, mientras Museo.jsx/Tramites.jsx también piden la iglesia en
  paralelo al listado. Son consultas repetidas comprobables en código; su contribución en ms
  y el cuello de botella siguen **sin medir**. No se fusionaron consultas especulativamente.
- Recorrido estático mapa→interior→museo→ficha→lector→trámites:9 GET de datos (sin StrictMode
  ni imágenes),11 SELECT de negocio,55 comandos de transacción/guardia/lectura. El diagnóstico
  añade retorno al museo (2 GET). Son cuentas del código, **no tráfico de navegador observado**.

### Entrega concreta a Claude (frontend; no se modificó)

1. Capturar Network/Performance al repetir el recorrido, con tiempos por request, iniciador,
   número real de llamadas y carga de fotos/LCP. Separar datos/imagen/render; contrastar la
   navegación en desarrollo con build, sin atribuir al host lo que no se haya medido.
2. Revisar **src/api/usarApi.js:9**, **src/api/cliente.js:16** y **src/main.jsx:15**:
   cleanup solo descarta el resultado, no cancela fetch; no hay signal y existe StrictMode.
   Confirmar con Network posibles solicitudes abandonadas/duplicadas. Si se confirma, admitir
   AbortSignal en pedir y propagarlo desde el efecto y los loaders; cancelar solicitudes de
   consumidores desmontados sin romper reintentar, errores ni aislamiento administrativo.
   No quitar StrictMode como supuesto arreglo de rendimiento.
3. **src/api/iglesias.js**, **paginas/publico/{Interior,Museo,Ficha,Tramites}.jsx** vuelven a pedir
   la misma iglesia al cambiar de pantalla. Si Network muestra concurrencia duplicada, compartir
   solo la petición pública de iglesia **en vuelo**, liberarla al finalizar/error y gestionar
   consumidores/cancelación; sin caché de documentos o admin ni datos privados persistidos.
   Conservar la carga en acceso directo a URL y limpiar cualquier dato al cambiar de slug.
4. **Museo.jsx:14** depende solo de slug y filtra categoría localmente: conservar ese comportamiento,
   no añadir un refetch al cambiar libros/objetos. No rediseñar, cambiar contratos ni hacer
   optimizaciones de fotos sin evidencia del waterfall.

### Pruebas y siguiente paso imprescindible

- Sintaxis del diagnóstico correcta. **8/8 pruebas específicas** con rendimiento.test.js y
  db.test.js, salida0: separación de fases, datos públicos sin cuerpos exportados, parada única
  por EPERM/redacción de errores, READ ONLY y rechazo del propietario. SQL/HTTP simulados; sus
  tiempos de ejecución **no son benchmarks de Neon o de la aplicación**.
- Suite completa disponible con Node24.21.0, excluyendo expresamente la suite HTTP ya bloqueada
  para no repetir EPERM:
  `node --test --test-isolation=none --test-reporter=spec --test-skip-pattern='^API HTTP$'`
  → **138 aprobadas,0 fallidas/0 canceladas,1 integración PostgreSQL omitida**, salida0; suite
  HTTP no ejecutada por el patrón. Incluye pruebas de frontend existentes, sin cambios/build.
- **No se declara mejora de velocidad ni cierre del rendimiento.** Se corrigió la falta de una
  medición separada preparando el comando; las optimizaciones del backend quedan pendientes de
  causa temporal demostrada. No se ejecutó el diagnóstico real otra vez en este entorno.

Con los servidores de Miguel funcionando, único comando desde cualquier directorio (nvm cargado):

```sh
cd /home/miguel/Proyectos/ProgrmacionUniversidadUTM/iglesias/backend && nvm exec 24 node --env-file-if-exists=.env scripts/diagnosticar-rendimiento.js
```

Usa DATABASE_URL restringida ya configurada; no pide credenciales. Informa la ruta del JSON
generado en docs/. Compartir ese informe sin pegar .env para medir una corrección contra esta
línea base; no hace falta detener o reiniciar los servidores para obtenerla.

## Rendimiento: corrección del exceso de viajes a Neon — 1 noviembre 2026 (Codex)

- Informe real leído, sin repetir investigación ni cargas:
  **docs/diagnostico-rendimiento-2026-11-01T06-39-49-917Z.json**, ejecutado por Miguel con
  Node24.21.0/servidores reales, huella backend anterior
  04a7b2c8b13d275d495dafd3832bc627f7a99215f1f4660f9e8e8f76385cc2dd.
  Los tiempos de las pruebas unitarias no se usan como medidas de la aplicación.

### Causa demostrada con las mediciones anteriores

- Cada envío pg cuesta aproximadamente un viaje de red: medianas **BEGIN58,075 ms,
  comprobación de rol60,795 ms, SET LOCAL ROLE59,93 ms, consulta61,67 ms, COMMIT57,99 ms**.
  Las16 consultas del recorrido directo acumulan4884,92 ms de driver;3905,25 ms (~80%) son
  preparación/guardias/cierre. Esto no indica que sobren las guardias: sobran los envíos separados.
- Ejecución de SELECT en EXPLAIN: **0,049–0,186 ms**, planning0,062–0,205 ms (plan caliente,
  tomado después del recorrido). Esos SELECT no son el coste dominante observado. No se añaden
  índices ni se cambia el esquema por suposiciones.
- Pool del diagnóstico: primera adquisición nueva **399,46 ms**, posteriores **0,02–0,16 ms**,
  ninguna esperando en cola. Primera API de mapa1329,41 ms y posterior299,57 ms. El pool del
  diagnóstico es otro: no atribuir toda la diferencia inicial de la API a esos399,46 ms ni
  cambiar idleTimeout/tamaño de pool sin medir el servidor. El pool existente se conserva.
- API directa posterior: iglesia299,52 ms; museo/biblioteca599,20 ms; ficha292,76 ms;
  lector290,53 ms; trámites606,07 ms; retorno al museo589,89 ms. Listados hacen dos transacciones.
  Proxy posterior: iglesia298,86; museo591,79; lector291,03; trámites584,68 ms. No hay evidencia
  de que localhost/Vite sean la causa dominante; el proxy se midió más tarde, con posible calor.
- Fotografías medidas: catedral-interior206611 bytes,3,77/5,11 ms; exterior440950 bytes,
  3,88/3,91 ms. No se optimizan estas fotos ni el frontend basándose en sospechas: render/LCP
  del navegador no están medidos por este script.

### Cambios de backend aplicados al código, sin cambios remotos

- **src/db.js:** se conservan BEGIN READ ONLY, comprobaciones de contexto/membresía/privilegios/
  propiedad, SET LOCAL ROLE iglesias_api, consulta parametrizada y COMMIT/ROLLBACK. Preparación
  agrupada en **un envío SQL fijo**: BEGIN; DO con el mismo comprobarRolSql; SET LOCAL ROLE.
  El DO aborta antes de cambiar de rol si no pasa la guardia. No crea funciones persistentes,
  no interpola parámetros de negocio, no cachea permisos ni usa propietario para servir datos.
  Códigos SQLSTATE P1001–P1004 se traducen a los mismos errores seguros existentes.
- **src/lecturas.js:** materiales y trámites usan un SELECT parametrizado con LEFT JOIN para
  validar iglesia y obtener filas en una sola instantánea/transacción. Iglesia inexistente404,
  iglesia sin filas[], orden/categorías/errores conservados (también precedencia404/400 en
  categoría inválida). Marcador interno iglesia_encontrada excluido de respuestas. Se conservan
  proyecciones explícitas, retirado_publico y403 de documentos privados; sin tocar sus lecturas
  o las rutas administrativas. No caché compartida, nuevas rutas o campos públicos.
- **Reducción comprobada de envíos del driver, no de tiempos todavía**:

  | Ruta/operación | Antes | Código nuevo |
  |---|---:|---:|
  | Catálogo, iglesia, ficha y lector | 5 envíos | 3 envíos |
  | Listado museo/biblioteca | 10 envíos / 2 SELECT negocio | 3 envíos / 1 SELECT negocio |
  | Listado trámites | 10 envíos / 2 SELECT negocio | 3 envíos / 1 SELECT negocio |

  Las sentencias de seguridad siguen existiendo: agrupación reduce viajes, no elimina controles.
  En el diagnóstico, preparacion_segura representa ese envío de tres sentencias; el campo
  comandos contabiliza llamadas del driver. Totales de ruta, adquisición y EXPLAIN conservan
  el método y formato de medida; solo se reconoce la fase agrupada nueva.
- No se cambiaron credenciales, sesiones/Better Auth, RLS/permisos, ocho cuadernos, diez objetos
  ni ninguna fila de producción. Sin instalaciones, nuevas migraciones, cargas o cambios de
  frontend. No se usó MCP para ejecutar cambios en el esquema ni medir su latencia como si
  fuera latencia de la API. No se detuvieron/iniciaron servidores del usuario.

### Comparación real antes/después y bloqueo

Se ejecutó **el mismo diagnóstico** una vez después de editar el backend:
`node --env-file-if-exists=.env scripts/diagnosticar-rendimiento.js`, desde backend con Node24.
Salida1; **NET_EPERM** en la primera petición. No se hicieron otros intentos ni conexiones pg.
Informe preservado: **docs/diagnostico-rendimiento-2026-11-01T06-50-41-989Z.json**,
huella backend eec5177244c707e9a96976d72ee1567cc90aaf26f081432bf5665e1af2ddab04.

| API directa (ms) | Antes: primera / posterior | Después real |
|---|---:|---|
| Mapa | 1329,41 / 299,57 | No medible: EPERM |
| Iglesia | 311,43 / 299,52 | No medible |
| Museo/biblioteca | 980,99 / 599,20 | No medible |
| Ficha | 299,55 / 292,76 | No medible |
| Lector | 308,05 / 290,53 | No medible |
| Trámites | 667,98 / 606,07 | No medible |
| Retorno al museo | 587,79 / 589,89 | No medible |

**No se declara mejora porcentual ni en milisegundos**, tampoco se presenta una estimación
por viajes evitados como resultado real. Pendiente nueva medición desde la terminal de Miguel.

### Validación y entrega

- **16/16 pruebas afectadas**, db.test.js/lecturas.test.js/rendimiento.test.js, salida0. Añadidas
  pruebas de permisos frescos entre transacciones, fallo de preparación/rollback, iglesia
  vacía/inexistente en un SELECT, prioridad de errores y ausencia del marcador interno.
  Adaptados solo los clientes simulados/exportadores SQL a la nueva forma de consulta.
- Suite disponible completa con Node24, excluyendo HTTP ya bloqueada para no repetir intentos:
  `node --test --test-isolation=none --test-reporter=spec --test-skip-pattern='^API HTTP$'`
  → **141 aprobadas,0 fallidas/0 canceladas,1 integración PostgreSQL omitida**, salida0. Incluye
  permisos, privados, objetos/cuadernos y pruebas existentes de frontend; sin build/UI.
- `python3 backend/test/validar_sql_local.py`→**salida0**, PostgreSQL17 temporal single. Además
  de consultas001–014/fixtures locales existentes, se ejecuta el prefijo real nuevo: transacción
  READ ONLY y rol efectivoapi, vuelta al login tras COMMIT, denegación real P1001(contexto),
  P1002(sin membresía), P1003(privilegios elevados), P1004(propietario de tabla de negocio).
  Los cambios de roles/propiedad de prueba viven solo en ese clúster temporal y se revierten;
  **nada en Neon**. Single no certifica RLS efectivo o latencia real pg/HTTP. No se repitió el
  arranque de sockets bloqueado; las respuestas/errores también están cubiertas en memoria.
- Frontend: la causa dominante demostrada es backend. El informe sí muestra la petición de
  iglesia repetida al montar Interior/Museo/Ficha/Trámites/retorno; no requiere rediseño para
  estas correcciones. Claude puede reducir peticiones públicas en vuelo desde api/iglesias.js
  y revisar cancelación en usarApi.js/cliente.js, según la entrega anterior. **No desactivar
  StrictMode, no cachear documentos o admin ni atribuir a React un tiempo no medido.** El
  render/cancelación real sigue requiriendo Network/Performance del navegador.

**Siguiente paso imprescindible:** comprobar que Express esté usando el código actualizado.
Si se inició con npm start (sin watcher), Miguel debe reiniciarlo; Codex no lo detuvo ni lo
reinició. Después, ejecutar el mismo comando, que preserva el informe anterior:

```sh
cd /home/miguel/Proyectos/ProgrmacionUniversidadUTM/iglesias/backend && nvm exec 24 node --env-file-if-exists=.env scripts/diagnosticar-rendimiento.js
```

Comparar el nuevo JSON con06-39-49-917Z: mismas rutas, primera/posterior, adquisición, envíos y
planes. Verificar también las respuestas vacías/404 y los bloqueos privados en el recorrido
habitual. Hasta obtener ese informe, la corrección está validada localmente pero la velocidad
posterior en el entorno real sigue pendiente.

## Rendimiento: comparación real antes/después confirmada — 1 noviembre 2026 (Codex)
- Informes: **diagnostico-rendimiento-2026-11-01T06-39-49-917Z.json** (anterior) y **diagnostico-rendimiento-2026-11-01T06-59-10-447Z.json** (nuevo, después del reinicio de Express confirmado por Miguel). Ambos con Nodev24.21.0. Solo lectura de informes y actualización de este documento; sin cambios de código, datos, frontend, configuración, servidores o base remota. No se repitieron pruebas, diagnósticos ni cargas.
- **Huellas confirmadas:** anterior `04a7b2c8b13d275d495dafd3832bc627f7a99215f1f4660f9e8e8f76385cc2dd`, coincide con la registrada antes de la corrección; nueva `eec5177244c707e9a96976d72ee1567cc90aaf26f081432bf5665e1af2ddab04`, coincide con SHA256(db.js + salto de línea + lecturas.js) recalculado de los archivos actuales. La huella identifica fuentes leídas por el diagnóstico, no inspecciona la memoria de Express; el reinicio comunicado y las mediciones son coherentes con el código nuevo.
- Comprobadas las mismas rutas/orden en ambas vueltas y orígenes: **44 peticiones HTTP por informe, todas200, mismos tamaños en bytes**. Ningún error de recorrido/Neon. Tamaño igual no sustituye una comparación semántica de cuerpos ni una auditoría adicional de permisos. No se comparó la primera muestra bloqueada por EPERM como si fuera una medida válida.

### API directa3001 — tiempos por paso
Valores en milisegundos. Cada celda indica **antes → después**; pasos con Promise.all usan el total de pared del paso, no la suma de sus peticiones.
| Ruta/paso | Primera observación (ms) | Navegación posterior (ms) | Reducción posterior |
|---|---:|---:|---:|
| Mapa / catálogo | 1329,41 → 2862,41 | 299,57 → 182,61 | 39,04% |
| Iglesia | 311,43 → 298,81 | 299,52 → 176,59 | 41,04% |
| Museo y biblioteca | 980,99 → 560,64 | 599,20 → 173,42 | 71,06% |
| Ficha de cuaderno | 299,55 → 204,13 | 292,76 → 173,02 | 40,90% |
| Lector | 308,05 → 193,13 | 290,53 → 179,99 | 38,05% |
| Trámites | 667,98 → 180,51 | 606,07 → 173,80 | 71,32% |
| Retorno al museo | 587,79 → 174,29 | 589,89 → 173,23 | 70,63% |

### Proxy Vite5173 — tiempos por paso
Valores en milisegundos. Cada celda indica **antes → después**; pasos con Promise.all usan el total de pared del paso, no la suma de sus peticiones.
| Ruta/paso | Primera observación (ms) | Navegación posterior (ms) | Reducción posterior |
|---|---:|---:|---:|
| Mapa / catálogo | 309,18 → 185,75 | 293,79 → 179,50 | 38,90% |
| Iglesia | 297,83 → 175,45 | 298,86 → 178,61 | 40,24% |
| Museo y biblioteca | 610,04 → 176,69 | 591,79 → 177,82 | 69,95% |
| Ficha de cuaderno | 311,90 → 183,70 | 319,60 → 176,33 | 44,83% |
| Lector | 293,88 → 177,26 | 291,03 → 176,23 | 39,45% |
| Trámites | 587,52 → 173,99 | 584,68 → 177,35 | 69,67% |
| Retorno al museo | 594,17 → 175,68 | 583,92 → 177,32 | 69,63% |

### Interpretación y límites
- **Mejora real en navegación posterior:** API directa reduce39,04–41,04% en mapa/iglesia/ficha/lector; museo/biblioteca71,06%, trámites71,32%, retorno al museo70,63%. Vite confirma el patrón:38,90–44,83% en lecturas simples y69,63–69,95% en los pasos de listados. Son reducciones de estas observaciones, no percentiles/SLA ni garantía para todas las iglesias.
- **Primera petición al mapa empeoró:**1329,41→2862,41 ms (**+115,31%**). Primera iglesia311,43→298,81 ms (solo4,05% menos), primer museo980,99→560,64 ms. No se ocultan esas muestras: el coste inicial sigue pendiente de explicar. No hubo control de arranque frío, suspensión de Neon o estado previo del pool de Express; no atribuir ese pico a localhost, al SQL o a un componente concreto sin desglose adicional. No se hicieron cambios nuevos.
- **Pool separado del diagnóstico:** adquisición nueva399,46→383,88 ms; posteriores antes0,02–0,16 y ahora0,03–0,14 ms, sin cola observada. No son medidas del pool interno de Express y no explican por sí solas los2862,41 ms de la primera API.
- **Confirma la reducción de viajes:** recorrido pg completo80→36 llamadas del driver, adquisiciones16→12. Cada operación simple pasa5→3 envíos y museo/trámites10→3. La fase preparacion_segura agrupa tres sentencias; esos números cuentan envíos, no guardias eliminadas. Misma consulta del catálogo/iglesia/ficha/lector por huella SQL; cambian las de listados por los LEFT JOIN. No se utiliza ni se añade caché.
- Medidas directas con conexión reutilizada: iglesia297,29→180,33 ms; museo587,27→183,00 ms; ficha300,84→194,86 ms; lector305,45→181,09 ms; trámites605,16→180,55 ms. Los planes siguen rápidos: ejecución0,049–0,186 ms antes y0,043–0,184 ms después. La mejora concuerda con evitar viajes/consultas repetidas; no con acelerar de forma sustancial el motor SQL.
- Imágenes sin cambios de bytes: interior206611, antes3,77/5,11 ms y después2,60/2,53 ms; exterior440950, antes3,88/3,91 y después2,82/3,25 ms. Continúan pequeñas frente a las esperas de API observadas; no son medidas de decodificación, render o LCP.
- Primera observación no equivale a frío estandarizado. Vite se midió después de la API directa; no usar su diferencia como coste aislado del proxy. Recorrido representativo de Catedral de Mérida, no captura real del navegador ni cobertura temporal de todas las iglesias. Una observación por ruta/fase/informe; variación y significación estadística no evaluadas.
- **Resultado final:** mejora de navegación posterior demostrada con los servidores reales; queda pendiente el pico de la primera petición y la experiencia/render en navegador. No se ejecuta otra modificación en esta entrega, conforme a la instrucción de Miguel.

## Pico inicial del mapa: diagnóstico repetido preparado, HTTP bloqueado — 1 noviembre 2026 (Codex)

- Continuado desde la mejora comprobada, **sin repetir la comparación anterior**, investigaciones
  de contenido o cargas. Leídos AGENTS.md y última entrega. Un único GET a3001/api/iglesias?estado=yucatan
  volvió a devolver **EPERM antes de respuesta medible**. No hubo otro intento HTTP ni medición
  repetida real desde este entorno. **La reproducibilidad del pico sigue sin determinarse**;
  una observación de2862 ms no demuestra regresión por sí sola. No se atribuye a localhost.
- No se aplicó una nueva optimización: faltan datos para demostrar otra causa. Se conservaron
  preparación agrupada de3 envíos, guardias frescas, READ ONLY/rol restringido/rollback y los
  listados con LEFT JOIN. Sin cambios de frontend, contratos JSON, contenido, cuentas, permisos,
  RLS o esquema remoto. No se usó MCP ni se consultó/modificó Neon en esta sesión. Sin instalaciones,
  migraciones o cargas. No se detuvo/inició/reinició ningún servidor del usuario.

### Instrumentación mínima para medir el pool de Express, no confundirlo con el del diagnóstico

- Añadido src/medicion-mapa.js (AsyncLocalStorage nativo, sin dependencias), conectado al catálogo
  público GET /api/iglesias en app.js y a los tiempos de db.js. Solo activa **Server-Timing numérico**
  si la petición viene de loopback y lleva X-Iglesias-Diagnostico:mapa. No hay cabecera en las
  peticiones habituales ni instrumentación de rutas administrativas/privadas. Respuestas JSON,
  autenticación y proyecciones se conservan. El contexto de cada petición se aísla, sin cachear datos.
- Métricas de la petición real del servidor: **db_init** (obtener/inicializar pool, incluida primera
  importación del driver), **pool** (adquisición), **pool_nueva/pool_reutilizada** (según conexión
  registrada por el pool en ese intervalo), **pool_queue** (adquisición cuando había cola o el pool
  lleno), **db_guard** (envío agrupado BEGIN/guardia/SET ROLE), **sql_driver**, **commit**, **api**.
  El WeakMap solo guarda el momento de creación de clientes, no roles/permisos/datos ni secretos.
- Límites de interpretación: pool_nueva/reutilizada y pool_queue **solapan pool**, no sumarlos;
  pool_queue es duración de adquisición cuando se observó espera, no separación de DNS/TLS.
  db_guard incluye ida/vuelta y preparación, **no CPU pura de la guardia**. sql_driver también
  incluye red; la ejecución SQL se contrasta con EXPLAIN ANALYZE en la muestra de pool propio.
  API no incluye render ni todo el envío/serialización HTTP. No hay tiempos reales nuevos aún.

### Un único comando, ampliando el diagnóstico existente

- scripts/diagnosticar-rendimiento.js conserva su modo anterior y añade **--mapa-inicial**.
  Hace6 muestras consecutivas por API directa/Vite; después4 rondas con pausa de12s, alternando
  cuál origen pide primero, seguido de repetición inmediata y el otro origen. **24 muestras**
  con cabeceras de fases, min/mediana/max por grupo; sin reiniciar ni forzar suspensión de Neon.
  Pausa supera idleTimeoutMillis10000 del pool actual, pero es inactividad solo del diagnóstico:
  navegador/otros clientes pueden mantener el pool activo. No se cambia ese timeout.
- Si no aparece db_guard, aborta con **BACKEND_INSTRUMENTATION_REQUIRED** para no medir el backend
  anterior como si estuviera instrumentado. Ante EPERM/EACCES para tras esa llamada, sin más red.
- Después hace únicamente GET para comprobar404 inexistentes/retirados, lista vacía de actividades,
  ocho cuadernos públicos de4 páginas, diez fichas reales de objetos con fuente/foto/sin documento,
  documentos privados403 y admin sin cookie401. No se registran cuerpos (tampoco si un privado
  fuera expuesto por error), cookies o conexiones. No envía PATCH/POST ni cambia contenido.
- Finalmente repite4 muestras con **pools propios nuevos**, cada una seguida de conexión reutilizada,
  y EXPLAIN ANALYZE del SELECT público del catálogo. Mismas comprobaciones de credencial restringida
  y READ ONLY; ningún propietario sirve datos. Cierra solo esos pools propios del diagnóstico,
  nunca los del Express existente. Esta sección se etiqueta como pool propio y no como el servidor.
- **Aislamiento administrativo con identidad parroquial real sigue pendiente:** el GET sin cookie
  solo prueba401. No se crean sesiones ni se piden credenciales. Los rechazos entre parroquias y
  de escrituras se verificaron aquí con las pruebas existentes simuladas, no contra cuentas reales.
- El JSON nuevo queda en docs/diagnostico-mapa-*.json y no sobrescribe informes. Puede tardar
  alrededor de1–2min por las pausas. No se ejecutó desde este entorno tras el bloqueo inicial.

### Pruebas realmente ejecutadas

- Siete pruebas nuevas de instrumentación/muestreo: opt-in/loopback y cabeceras habituales intactas,
  separación nueva/reutilizada/cola con cliente simulado, contextos concurrentes aislados,
  alternancia y pausas, rechazo de backend sin instrumentación, parada por EPERM, comprobaciones
  públicas positivas y fallos sin guardar contenido reservado. **7/7 aprobadas**, salida0.
- Antes se ejecutó el grupo de41 pruebas de medición/DB/lecturas/permisos/cuadernos/objetos,
  salida0; los casos públicos vacíos/404, documentos, flags y aislamiento parroquial son
  **SQL/HTTP simulados/Express en memoria**, no verificaciones reales nuevas.
- Suite completa disponible final, Node24.21.0:
  `node --test --test-isolation=none --test-reporter=spec --test-skip-pattern='^API HTTP$'`
  → **148 aprobadas,0 fallidas/0 canceladas,1 integración PostgreSQL omitida**, salida0. La suite
  HTTP bloqueada se excluye expresamente para no insistir; frontend existente sin cambios/build.
  Sintaxis de ambos archivos de diagnóstico correcta. No se hicieron consultas o cambios remotos.

**Siguiente paso imprescindible:** Miguel debe **reiniciar únicamente backend** para cargar la
instrumentación (si el watcher ya la recargó, no hace falta otro reinicio). Codex no lo detuvo.
Frontend no requiere reinicio. Para observar la primera solicitud tras ese reinicio, ejecutar
el comando antes de navegar; no llamarla frío estandarizado. Con ambos servidores disponibles:

```sh
cd /home/miguel/Proyectos/ProgrmacionUniversidadUTM/iglesias/backend && nvm exec 24 node --env-file-if-exists=.env scripts/diagnosticar-rendimiento.js --mapa-inicial
```

No pide conexiones ni modifica secretos; usa DATABASE_URL restringida existente. Compartir el
informe resultante para decidir si el pico se reproduce y qué fase lo explica. **No se declara
solucionado el pico ni cerrada la verificación HTTP/administrativa real.**

## Pico del mapa: causa acotada y una corrección del pool público — 1 noviembre 2026 (Codex)

- Analizado únicamente **diagnostico-mapa-2026-11-01T07-29-31-993Z.json**, generado por Miguel
  después de reiniciar backend.24 muestras reales HTTP200, sin errores de diagnóstico. Huella
  **6fd9ac0339e15b4936326ede55de3fcc16fff84dbfa34a8e5768ffe50013b755**: se comprobó que coincidía
  con db.js/lecturas.js antes de esta corrección. No se repitió la comparación de versiones anterior,
  investigación de contenido, cargas o consultas MCP.

### Dónde se concentra el tiempo

| Muestra | Total HTTP ms | Inicialización ms | Adquirir conexión ms | Guardia+viaje ms | SELECT+viaje ms | COMMIT+viaje ms |
|---|---:|---:|---:|---:|---:|---:|
| Primera API tras reinicio | 2413,62 | 9,322 | 1962,905 | 71,952 | 127,192 | 206,222 |
| Tras pausa12s, API ronda1 | 1521,56 | 0,050 | 768,769 | 220,712 | 328,621 | 200,025 |
| Tras pausa12s, Vite ronda2 | 541,27 | 0,024 | 366,217 | 57,464 | 57,723 | 54,077 |
| Tras pausa12s, API ronda3 | 1424,89 | 0,026 | 785,433 | 211,816 | 112,670 | 312,480 |
| Tras pausa12s, Vite ronda4 | 1589,93 | 0,044 | 970,599 | 102,216 | 285,535 | 226,048 |

- Las **5 muestras con conexión nueva** (inicial+4 pausas) tardan541,27–2413,62 ms, mediana1521,56.
  Las **19 con conexión reutilizada** tardan166,21–620,03 ms, mediana174,75. En las24 muestras,
  **pool_queue=0**: no hay evidencia de saturación/espera de cola ni motivo para aumentar max.
- La primera dedica **1962,905 ms (~81,33% del total)** a adquirir una conexión nueva; solo9,322 ms
  a inicializar el pool/driver. En reutilizadas, adquisición0,025–0,139 ms e inicialización
  0,024–0,079 ms. No es evidencia de que la importación del código sea la causa dominante.
- Guardias, SELECT y COMMIT conservan latencia variable: en reutilizadas medianas57,339/57,920/
  54,284 ms y máximos260,265/205,032/299,521 ms. Son tiempos de driver **incluyen red**, no CPU
  de SQL. Explican que algunas respuestas reutilizadas aún tarden357/620 ms; no prometer que
  toda variación desaparecerá al conservar conexiones.
- EXPLAIN del catálogo en los cuatro pools propios: ejecución **0,052–0,074 ms**, planificación
  0,069–0,087 ms. Son planes calientes posteriores, **no** desglose de CPU de cada pico HTTP.
  Los pools propios abren conexión en353,92–373,18 ms, frente a0,05–0,13 ms al reutilizar;
  no sustituir con esos valores los del pool real de Express.
- **Reproducible en estas condiciones:** las4 pausas de12s desembocaron en conexión nueva y
  respuesta elevada; ocurre por API directa y por Vite cuando es el primer origen. El valor
  exacto2862 ms no se repitió (nuevo máximo2413,62), pero sí el fenómeno de demora al abrir
  conexión. Esto no demuestra por sí solo una regresión entre versiones ni identifica DNS,
  TCP/TLS/autenticación, variación de red o reactivación de Neon por separado. No se culpa a
  localhost ni se modificó configuración de Neon.

### Única causa corregida en código

- **Rotación prematura del pool público tras inactividad breve:** el límite de10s vigente
  explica que cada pausa de12s cerrase la conexión y obligase a abrir otra. Se cambia únicamente
  la construcción del pool público en **src/db.js** a **idleTimeoutMillis:60000**.
- Retención acotada de60s; max3, allowExitOnIdle, TLS, timeouts de conexión/consulta, READ ONLY,
  guardias frescas,3 envíos agrupados y LEFT JOIN se conservan. **No** se cambia opcionesConexion
  global: pools administrativos/provisión mantienen sus valores anteriores. No hay caché de
  datos/permisos, consultas de mantenimiento, precalentamiento, servidores nuevos o cambios
  en Better Auth/sesiones. Retener conexión no evita comprobar el permiso en cada transacción.
- No elimina el coste de la primera conexión tras arrancar, después de más de60s o ante cierres
  externos, ni garantiza resolver los picos de red de guardia/commit. **La mejora posterior
  de este cambio no está medida aún.** No se atribuye el pico de todos los componentes a esta
  sola causa ni se añaden cambios especulativos.
- El diagnóstico conserva las mismas24 muestras y pausas de12s para comparar sin cambiar el
  ensayo; solo se actualizó su comentario sobre el timeout. Huella backend tras esta corrección:
  **b4f381ec8c032c94fbb557ea34befc0d9ef32025ea1a72f7dca38f8a7fc73149**. No se modificaron app.js, frontend, contenido, cuentas, permisos, RLS o esquema.

### Comprobaciones públicas reales del informe y pruebas limitadas

- **45 comprobaciones HTTP reales previas a este ajuste, todas correctas:** ocho cuadernos
  de4 páginas, diez fichas públicas de objetos, doce documentos privados rechazados403,
  listas vacías válidas, recursos inexistentes/retirados404 y administración sin cookie401.
  Es evidencia real del backend instrumentado con timeout anterior, no una nueva verificación
  posterior al cambio de60s. El informe indica expresamente que **no prueba aislamiento con
  identidad parroquial real**; esa comprobación sigue pendiente.
- No se repitieron suites ya aprobadas ni benchmarks simulados. Por tocar db.js se ejecutó
  únicamente **backend/test/db.test.js:5/5 aprobadas**, salida0 (guardias, propietario, rollback,
  TLS y permisos frescos entre transacciones). Son dobles SQL, **no una prueba temporal del pool**.
  Sintaxis de db.js y diagnóstico correcta. No hay nuevas mediciones de producción tras editar.
- No se detuvieron/reiniciaron servidores ni se intentó de nuevo HTTP en el entorno que ya
  bloqueaba con EPERM. No hubo conexiones o escrituras remotas, instalaciones, migraciones,
  cargas de contenido o modificación de los informes originales.

### Pendientes concretos para cerrar backend

1. Miguel reinicia **solo backend** para cargar la retención de60s (o confirma recarga del watcher).
   Repite el mismo diagnóstico: tras las pausas de12s debería verse reutilización cuando no
   haya cierre externo. Comparar métricas reales, sin dar por validada esa expectativa todavía.
2. Aceptar/medir el coste inevitable de apertura inicial según entorno; queda sin separar
   DNS/TLS/reactivación/red. No hace falta introducir otra corrección sin evidencia adicional.
3. Verificar aislamiento administrativo con **identidades parroquiales reales** (propio/ajeno,
   privados y operaciones autorizadas), preservando contenido. Las pruebas simuladas existentes
   y el401 sin cookie no cierran esta parte. Sin altas/cambios de cuenta en esta tarea.

Único comando, con los servidores existentes y el backend actualizado, desde cualquier directorio:

```sh
cd /home/miguel/Proyectos/ProgrmacionUniversidadUTM/iglesias/backend && nvm exec 24 node --env-file-if-exists=.env scripts/diagnosticar-rendimiento.js --mapa-inicial
```

Genera otro docs/diagnostico-mapa-*.json sin sobrescribir el de07-29-31-993Z. No se declara resuelto
por completo el pico ni cerrado todo backend antes de esa medición y del aislamiento real.

## 2026-11-01 — Pool60s comprobado y verificación parroquial sin escrituras de negocio

Comparados únicamente los informes mapa de **07-29-31-993Z** y **20-40-03-133Z**; no se ejecutó otro diagnóstico ni se añadieron optimizaciones.

- Huella anterior: `6fd9ac0339e15b4936326ede55de3fcc16fff84dbfa34a8e5768ffe50013b755`.
  Se reproduce exactamente al reconstruir en memoria db.js anterior: retirar los dos comentarios
  del ajuste y volver a `new Pool(opciones)` (timeout predeterminado10000). Sin modificar archivos.
- Huella nueva: `b4f381ec8c032c94fbb557ea34befc0d9ef32025ea1a72f7dca38f8a7fc73149`.
  Coincide con SHA256(db.js + salto de línea + lecturas.js) actuales, pool público60000.
  Ambas huellas corresponden al cambio esperado; no identifican el frontend ni todo el backend.
- Cada informe contiene24 muestras del mapa, todas200,7167bytes. Conexiones nuevas: **5→0**;
  reutilizadas: **19→24**. Espera por cola del pool: **0 en todas las muestras**.

| Primera petición tras pausa12s, origen | Antes10s, HTTP ms | Después60s, HTTP ms |
|---|---:|---:|
| Ronda1, API |1521,56|246,52|
| Ronda2, Vite |541,27|184,00|
| Ronda3, API |1424,89|423,64|
| Ronda4, Vite |1589,93|729,42|

- Mediana de esas cuatro peticiones: **1473,23→335,08ms** (aprox.77% menor).
  Adquisición del pool: **366,217–970,599→0,042–0,062ms**. Antes las cuatro conexiones
  eran nuevas; después las cuatro reutilizadas. Esta evidencia valida la retención durante
  pausas12s, sin garantizar ausencia de actividad de otros clientes durante el ensayo.
- Primera observación:2413,62→213,67ms, pero la nueva YA reutiliza conexión y su inicialización
  es0,062ms frente a9,322ms anteriores. **No son dos arranques en frío comparables**; no afirmar
  mejora del coste de apertura inicial ni retención más allá de60s.
- La serie inmediata no mejora globalmente: mediana API173,59→288,905ms; Vite171,505→253,51ms.
  El mayor pico nuevo729,42ms tiene pool0,042ms, guardia197,580ms, SQLdriver218,843ms y
  commit307,074ms: persiste variación en las idas/vueltas. Esos tiempos incluyen red/servidor,
  no miden exclusivamente CPU SQL. Sin evidencia de otro fallo, no se cambia más código de API.
- Los dos informes aportan45 comprobaciones públicas correctas cada uno (incluidos ocho
  cuadernos, diez objetos, privados403, vacíos/404 y admin sin sesión401). No equivalen a
  aislamiento con identidad parroquial real.

### Verificador existente adaptado al alcance autorizado

- `backend/scripts/cuentas-demo.js --verificar` ahora entra directamente en verificación HTTP:
  pide **solo la contraseña web mediante prompt oculto**, sin conexión operativa, revisión de
  hashes, provisión, restablecimiento ni altas. Conserva los otros modos fuera de este recorrido.
- `backend/scripts/lib/cuentas-demo.js`: retirados los PATCH de teléfono de prueba. Los únicos
  POST son login/logout autorizados; todo acceso de negocio es GET. Comprueba sesión parroquial,
  listado de una iglesia y rechazos403 de materiales administrativos de cada una de las otras
  siete; documentos ajenos admin404/público403. No descarga ni imprime contenido privado.
- Después de logout204 exige401 tanto en sesión como en listado usando **la cookie anterior**.
  Si el servidor mantiene la sesión válida, falla. No guarda cookie, CSRF ni contraseña.
  Esto comprueba aislamiento de lectura; no certifica escrituras, que no se prueban en esta tarea.
- Actualizada `docs/CUENTAS_DEMO.md` para describir ese modo y eliminar la prueba PATCH anterior.
- Pruebas locales Node24.21.0: `node --test --test-isolation=none backend/test/cuentas-demo.test.js`:
  **8/8 correctas**, con HTTP/SQL simulados y hashes Better Auth reales. Incluye cero escrituras
  de negocio, rechazo de lectura ajena y detección de logout que no revoca. Sintaxis CLI correcta.
- Suite disponible desde backend: `node --test --test-isolation=none --test-reporter=spec --test-skip-pattern='^API HTTP$'`:
  **119 aprobadas,1 omitida,0 fallos**. Se excluyó API HTTP por el bloqueo conocido de listen
  de este entorno. No confundir pruebas simuladas con verificación remota de las ocho cuentas.

### Pendiente real: autenticación y aislamiento de ocho cuentas

**No se completó verificación real de cuentas en esta ejecución**: la entrada estándar del
entorno no es una terminal interactiva (`stdin.isTTY=false`); falta introducir la contraseña
privadamente en el prompt existente. No se utilizó la contraseña del historial ni se ejecutó
provisión/restablecimiento, SQL remoto o escrituras de negocio. No se certifican login, sesión,
logout o aislamiento reales de ninguna de las ocho cuentas. No se repitieron sondeos HTTP
bloqueados ni se detuvieron servidores. No hace falta reiniciar backend por estos cambios de CLI.

Único comando pendiente, con backend3001 ya encendido; introducir la contraseña web en el
prompt oculto, nunca como argumento. El verificador se detiene ante fallo sin reintento:

```sh
cd /home/miguel/Proyectos/ProgrmacionUniversidadUTM/iglesias/backend && nvm exec 24 node --env-file-if-exists=.env scripts/cuentas-demo.js --verificar
```

Solo ocho resultados `HTTP_OK_7_AJENAS_PRIVADOS_RECHAZADOS` y salida0 acreditarán el recorrido
completo real, incluida revocación. Un resultado parcial o un fallo mantiene la cuenta pendiente;
no crearla ni cambiar su contraseña/asignación para forzar aprobación.

## Mejora visual y de movimiento del frontend — 1 noviembre 2026 (Claude Code)

**Hecho (solo frontend; sin cambios en backend, SQL, secretos ni dependencias):**
- Cabecera de madera con marca dibujada y **interruptor «Reducir animaciones»** (`componentes/ControlMovimiento.jsx`, `movimiento.js`): guarda la elección en `localStorage`
  (con try/catch) y respeta `prefers-reduced-motion` (si el sistema lo pide, queda activado y bloqueado). Leaflet también deja de animar el desplazamiento.
- `estilos/movimiento.css` (nuevo) y tokens `--mov`/`--dur`: entrada de pantalla, aparición escalonada (lista de iglesias, categorías, trámites, estante),
  revelado de fotografías, cubierta de libro que se abre en la ficha, **giro de hoja en el lector** (doble página en escritorio, deslizamiento en móvil),
  respuesta de botones/lomos/objetos por ratón, teclado y toque, carga discreta (aparece a los 300 ms), tarjeta/marcador al elegir iglesia. Solo `transform` y `opacity`.
- Composición: fondo crema con viñeta, títulos mayores con filete dorado, hero del interior más alto con título grande, datos en panel, capitular en la historia,
  fotos de objetos más grandes, estante con veta, enlaces en vino. Etiquetas «Vista exterior», créditos, avisos y selector PDF intactos.
- Capturas en `docs/capturas/antes-*` y `despues-*` (1440 y 500 px; incluye apertura de ficha, giro del lector, entrada del museo y selección de iglesia).

**Comprobado:** `npm run build` ✓; `npm test` 30/30; detector Impeccable sin hallazgos nuevos (solo el aviso previo de la tipografía Inter);
Firefox headless con API real (3001/5173 sin detenerlos) a 1440 px y ≈500 px; interruptor probado (`data-movimiento=reducido`, `--mov: 0`, guardado).
**Sin comprobar:** panel de administración autenticado (sin sesión real; solo el login); 390 px reales; lectores de pantalla; rendimiento en móviles reales; Safari/Chrome.
No existe una skill «Taste» instalada en este equipo; se usó Impeccable.

## Nueva dirección visual (nogal, vino, oro, marfil) e Inicio con portada — 1 noviembre 2026 (Claude Code)

**Hecho (solo frontend; sin cambios en backend, SQL, secretos ni dependencias; sin cargas ni migraciones):**
- Inicio rehecho (`paginas/publico/Mapa.jsx`, `componentes/TarjetaIglesia.jsx`, `estilos/inicio.css`): portada con fotografía real (interior de La Compañía, Puebla, con crédito visible y enlace a Créditos), título, introducción y
  «Explorar iglesias» (ancla `#iglesias` en la misma página). Debajo: selector de estados (el existente), mapa Leaflet amplio, ficha de la iglesia elegida (foto, ubicación, «Entrar a la iglesia») y tarjetas con foto,
  nombre y marca «Seleccionada» (texto + icono, no solo color). En móvil las tarjetas son compactas y la ficha queda bajo el mapa. Leaflet, controles y atribuciones intactos.
- Paleta oscura global (`tokens.css`, `global.css`): carbón/nogal de base, vino y oro como acentos, marfil para texto y superficies de lectura (historia del interior, folleto de trámites, hojas del lector, tarjetas de la administración y formularios).
  Botones, estados activos (oro), enlaces (oro claro sobre oscuro, vino sobre marfil) y anillo de foco de dos tonos que se ve sobre oscuro y sobre marfil.
- Retirado el botón «Reducir animaciones» (y `ControlMovimiento`, almacenamiento local): todo se adapta con `prefers-reduced-motion` (`--mov: 0`, fundidos cortos; Leaflet sin animar el desplazamiento).
- Movimiento nuevo: entrada de la portada, tarjetas escalonadas al cambiar de estado, ficha de la iglesia al elegir, zoom suave de foto en tarjetas, además de lo anterior (libro, giro de hoja, lomos).

**Comprobado (Firefox headless con API real, servidores 3001/5173 sin detener):** `anim.py` mide animaciones en ejecución (`document.getAnimations`) a 1440 y ≈500 px, con y sin `prefers-reduced-motion`:
entrada, escalonado, cambio de estado/categoría, giro de hoja (`pasa-der` con transform 3D; en reducido, matriz identidad y solo `aparece`), selección de iglesia, teclado ← en el lector, botón Explorar → `#iglesias`,
sin desbordamiento horizontal, controles ≥56 px. `npm run build` ✓; `npm test` 30/30. Capturas `docs/capturas/nuevo-*` (estáticas; la prueba del movimiento es la medición anterior, no las imágenes).
**Sin comprobar:** panel de administración autenticado (sin sesión real: solo se vio el login); 390 px reales (mínimo del entorno ≈488 px); lectores de pantalla; rendimiento en móviles reales; Chrome/Safari;
contraste medido solo a ojo y por tokens, sin herramienta; la referencia de Muzli solo se pudo leer como resumen (sin imagen), la composición es adaptación propia.
Nota: no existe una skill «Taste» instalada; se usó Impeccable.

## Ajuste de portada y zona «Subir PDF» simulada — 2 noviembre 2026 (Claude Code)

**Portada:** se retiraron los dos textos superpuestos (título e introducción). Se conserva el `h1` oculto (`sr-solo`) para lectores de pantalla, el botón «Explorar iglesias», el crédito de la foto,
y su tamaño, encuadre y animaciones (altura 530 px en escritorio y 472 px a ≈500 px, sin cambio). Cabecera y resto de la página intactos.

**Subir PDF (demostración)** — `paginas/admin/CargaSimulada.jsx` (dentro de la ficha de materiales del panel; mismos permisos y diseño):
elegir un PDF local → título (propuesto desde el nombre del archivo) y descripción obligatorios → «Generar vista previa» (título, descripción, nombre/tamaño y el PDF mostrado con un enlace temporal del navegador, liberado al cambiar o salir).
Aviso permanente: «Demostración: el archivo no se sube ni se guarda. No crea un libro real.» No hay peticiones a la API, ni almacenamiento persistente, ni cambios en backend, Neon o catálogo. Pruebas nuevas: `tituloSugerido` en `archivo.test.js`.

**Comprobado:** `npm run build` ✓; `npm test` 31/31; detector Impeccable sin hallazgos. En Firefox, con un componente montado solo en un servidor temporal (5199, ya cerrado y archivos temporales borrados) y un PDF real de prueba:
rechazo de no-PDF, error de descripción vacía, vista previa con visor PDF, 0 peticiones fetch/XHR, 0 elementos en localStorage/sessionStorage, reinicio, y sin desbordamiento a ≈500 px (capturas `docs/capturas/pdf-demo-*`).
**Sin comprobar:** la pantalla dentro del panel autenticado real (sin sesión; el componente es el mismo, pero no se vio en su página); visor PDF en Chrome/Safari (en Firefox usa pdf.js); lectores de pantalla; 390 px reales.

## 2026-11-02 — Revisión de secretos y seguridad previa a GitHub

**Cambios locales, sin publicar ni tocar Neon:**

- Añadido `.gitignore` raíz: excluye secretos `.env*` (admite solo `.env.example`), claves,
  logs, volcados, dependencias/builds, configuración Vercel local, capturas no revisadas
  visualmente y carpetas locales de investigación/respaldo.17 casos probados en Git temporal:
  ejemplos, código, migraciones y lockfiles siguen admitidos. No se borró trabajo ajeno.
- Corregidos ejemplos de entorno: retirada referencia obsoleta a Supabase en frontend;
  backend aclara login restringido y variables de producción HTTPS. Solo placeholders.
- `backend/.env` tenía permisos de lectura para grupo/otros: restringido a600 sin modificar
  valores. Comprobado privadamente que sus dos conexiones usan los logins restringidos
  previstos, sin propietario. No se cambió ningún secreto.
- Preparado **[SEGURIDAD_PUBLICACION.md](SEGURIDAD_PUBLICACION.md)**: controles revisados,
  límites, configuración de producción y procedimiento privado de rotación del propietario
  comprometido, con referencia oficial de Neon. No se crearon scripts adicionales.

**Evidencia real:**

- Escaneo de archivos de texto de código, SQL, datos, documentación, lockfiles y compilación:
  sin secretos reales detectados fuera de backend/.env excluido. Coincidencias de URLs y
  contraseñas en ejemplos/tests verificadas como ficticias. No se imprimieron valores ni fragmentos.
- Sin variables VITE con conexiones/secretos; únicamente base pública y selector explícito de
  mocks. Build nuevo de Vite escaneado sin coincidencias con secretos locales ni claves/conexiones.
-132 capturas PNG: metadatos textuales sin patrones de credenciales; **píxeles no revisados
  exhaustivamente**, sin OCR disponible. Excluidas de Git hasta revisión. Sin logs localizados
  dentro del proyecto. `.git` vacío/no utilizable: no hay índice/historial disponible que auditar.
- Revisión de código mantiene hash scrypt de Better Auth, sesiones8h, cookies HttpOnly/SameSite
  y Secure en HTTPS, CSRF/Origin, límite persistido de login, logout con revocación, consultas
  parametrizadas/listas cerradas, guardias de rol/ámbito activo y bloqueo/proyección de privados.
  No hizo falta modificar lógica de API, autenticación, contratos ni frontend visual.
- **Miguel confirma que las ocho cuentas ya pasaron aislamiento real.** Evidencia aportada
  por el usuario: no se repitieron login, provisión, restablecimiento ni escrituras de negocio.
- Node24.21.0, desde raíz:
  `node --test --test-isolation=none --test-reporter=spec --test-skip-pattern='^API HTTP$'`:
  **150 aprobadas,1 omitida,0 fallos** (backend + frontend). HTTP por sockets excluido;
  integración pg/Better Auth por socket omitida sin clúster habilitado. Pruebas de permisos
  usan dobles, no certifican una nueva ejecución remota o HTTPS real.
- Frontend `npm test`:8 archivos aprobados (31 casos en ejecución sin aislamiento desde raíz);
  `npm run build`: correcto,82 módulos. Diseño/funciones/PDF simulado conservados.
- `python3 backend/test/validar_sql_local.py`: SQL001–014, consultas, restricciones, GRANT y
  metadatos aprobados en PostgreSQL **local efímero**. Sus fixtures no afectan Neon. Modo
  single no acredita filtrado RLS efectivo ni driver remoto. Sin repetir migraciones remotas.
- `npm audit` una vez por paquete: **bloqueado por EAI_AGAIN** en ambos. No se instalaron ni
  actualizaron paquetes y **no se verificaron vulnerabilidades vigentes**.

**Pendientes antes de publicar:**

1. Rotar **solo la contraseña técnica propietaria comprometida**, desde Neon Console en
   iglesias / divine-wildflower-50337376 / production / neondb, y actualizar los consumidores
   operativos que la guardaban. Procedimiento en SEGURIDAD_PUBLICACION.md. Los DATABASE_URL
   locales actuales son restringidos: no sustituirlos por propietario ni cambiar secretos Auth,
   contraseñas web, permisos o sesiones durante esta revisión. Rotación **no ejecutada**.
2. Repetir npm audit con acceso a npm y resolver hallazgos pertinentes con autorización de
   actualización; no declarar dependencias libres de vulnerabilidades por el fallo de consulta.
3. Antes de exposición pública, decidir/autorizar desactivación de cuentas temporales y
   revocación de sesiones según CUENTAS_DEMO.md; **sin invalidarlas ahora**.
4. Configurar destino HTTPS, función Express/rutas /api con mismo origen, secretos de backend,
   NODE_ENV/APP_ORIGIN y verificar cookies/CSRF/CDN reales. Sin despliegue preparado/probado aquí.
5. Revisar índice/historial cuando exista repositorio real y capturas antes de incluirlas;
   .gitignore no limpia archivos que ya estuvieran versionados en otra copia.

No se considera una garantía de seguridad completa. No hubo push/publicación, nuevas
cuentas, migraciones/cargas remotas, cambios de permisos/RLS, dependencias ni modificación de
contenido. Se conserva la simulación de PDF, sin endpoint de subida.

## 2026-11-02 — Reintento de npm audit y guía de rotación propietaria

- Leído SEGURIDAD_PUBLICACION.md. `npm audit --json --fetch-retries=0 --fetch-timeout=10000`
  reintentado una vez en backend y una en frontend con Node24. Ambos terminan con
  **EAI_AGAIN**, salida1: no se obtuvo informe de vulnerabilidades. No interpretar el bloqueo
  como cero vulnerabilidades. Sin --force, audit fix, instalaciones o actualizaciones;
  no se modificaron package.json ni package-lock.json.
- Pendiente ejecutar npm audit desde una terminal con acceso a npm en ambos directorios y
  revisar resultados antes de autorizar correcciones. No se repitieron pruebas funcionales
  aprobadas por esta consulta: no cambió código ejecutable.
- Guía entregada para rotar únicamente neondb_owner en Neon Console → iglesias /
  divine-wildflower-50337376 / production / neondb → Roles → Reset password. Guardar el
  resultado privadamente y actualizar consumidores operativos que realmente usen ese rol
  (cliente SQL, gestor de secretos/conexiones, herramientas/MCP o despliegue si aplica).
- Las conexiones locales previamente verificadas en backend/.env son los logins restringidos:
  no necesitan cambiar por esta rotación. No introducir allí el propietario ni cambiar
  BETTER_AUTH_SECRET, contraseñas web, permisos o cuentas. La autorización propia de un MCP
  no equivale necesariamente a una conexión SQL propietaria; comprobar su mecanismo antes.
- Comprobaciones posteriores propuestas, aún **no ejecutadas tras rotación**: nueva conexión
  propietaria privada en su cliente, `check:neon` desde backend con Node24, catálogo/museo/
  biblioteca/lector/trámites en navegador y login/sesión/logout de una cuenta existente sin
  guardar cambios. No repetir creación ni ocho verificaciones de aislamiento ya confirmadas.
  Una contraseña nueva no garantiza cerrar conexiones propietarias ya establecidas: revisar
  y autorizar separadamente su cierre, sin detener servidores o sesiones de la aplicación.
- **Rotación pendiente de Miguel**, no realizada por Codex. Sin acceso/escrituras remotas,
  migraciones, cargas, modificación de secretos, invalidación de cuentas o publicación.

## 2026-11-02 — Preparación del primer push privado, bloqueado por entorno y gh

Miguel autoriza crear el repositorio **PRIVADO museo-digital-iglesias** en su cuenta y hacer
el primer push, sin despliegue. La autorización no cambia credenciales, Neon, permisos o funciones.

- Leídos AGENTS.md y últimas entregas. Git no reconoce un repositorio: `.git` está vacío,
  sin historial, índice o remotos disponibles. Un único `git init -b main` falló por permiso
  denegado al escribir en ese directorio. No se cambió su protección ni se alteró otro Git.
- `gh` está instalado. `gh auth status` informa autenticación inválida; no se pudo identificar
  una cuenta autenticada válida. La consulta `gh api user` falló al conectar con GitHub.
  No se imprimieron tokens ni mensajes que pudieran contenerlos. La versión disponible de
  gh tampoco admite el formato JSON de estado consultado. No se creó repositorio ni se pudo
  comprobar si el nombre solicitado ya existe en la cuenta; no sobrescribirlo al retomar.
- Revisión concreta mediante Git con índice **temporal fuera del proyecto** (eliminado al
  terminar): **233 archivos, aprox.11,46MB**, byte por byte iguales a los archivos revisados.
  Incluye código, ambos lockfiles, los dos .env.example ficticios,14 migraciones, contenido
  público y25 archivos de fotos/créditos. No son233 archivos añadidos al Git real: su escritura
  está bloqueada. No hay commit ni hash de commit todavía.
- Escaneo del contenido candidato, además de verificar exclusiones: sin coincidencias con
  secretos locales, tokens de proveedor, claves privadas, contraseñas de demostración o
  conexiones reales autenticadas. Las URLs autenticadas detectadas pertenecen a placeholders
  de .env.example y fixtures ficticios ya revisados. No se publicaron valores ni fragmentos.
- Quedan fuera .env reales, logs, node_modules, compilación, temporales, capturas no revisadas,
  investigación local y respaldos del arnés. No hubo migraciones, cargas, instalaciones,
  cambios funcionales, nuevas pruebas HTTP o despliegues. Las pruebas de la entrega de
  seguridad anterior permanecen como evidencia previa, no se afirman ejecutadas nuevamente.
- **npm audit continúa pendiente por EAI_AGAIN en ambos paquetes. La contraseña propietaria
  expuesta sigue sin rotarse**, conforme al estado confirmado; el código preparado no la incluye.

**Siguiente paso imprescindible:** autenticar gh privadamente desde la terminal del usuario:
`gh auth login --hostname github.com --web --git-protocol https`.
No enviar tokens o contraseñas por chat. También hace falta una terminal con permiso de
escritura en el `.git` del proyecto. Al retomar: identificar cuenta, comprobar repositorio/remotos
existentes, volver a revisar el índice real, crear commit descriptivo y push normal únicamente
al repositorio privado autorizado. No usar force push ni habilitar despliegue. Esta entrega
no acredita creación del repositorio ni publicación del commit.

## 2026-11-02 — Continuación tras git init de Miguel

- Git ya reconoce el repositorio: rama main, cero commits y ningún remoto. No se sobrescribió
  historial o remoto alguno. Índice inicialmente vacío; archivos del proyecto sin versionar.
- `gh auth status` sigue indicando autenticación inválida en este entorno y `gh api user`
  vuelve a fallar por conexión. No se pudo confirmar cuenta ni existencia del repositorio remoto.
  No se repitieron intentos de red ni se solicitó compartir tokens.
- Se repite la revisión de archivos candidatos mediante índice temporal antes de intentar
  escribir en el índice real. Se conservan exclusiones de secretos, .env reales, contraseñas
  de demostración, logs, dependencias, builds, capturas y trabajo temporal; se incluyen
  ejemplos ficticios, código, lockfiles, migraciones y contenido público con créditos.
- npm audit sigue pendiente por EAI_AGAIN; la contraseña propietaria expuesta sigue sin rotar.
  Sin modificaciones de Neon, funciones, credenciales, permisos o despliegues.
- Resultado de la continuación:233 archivos revisados sin hallazgos de secretos; índice temporal
  comprobado byte a byte. `git add -- .` real falló con permiso denegado en .git (salida128).
  **No se creó commit, repositorio remoto o push**. Se entregan comandos para autenticación,
  comprobación de rama/historial/remotos, commit inicial y creación privada con push normal
  desde la terminal de Miguel. Si el nombre remoto existe, la creación debe fallar y detener
  el proceso; no reutilizarlo ni sobrescribirlo sin revisar. No cambiar archivos entre esta
  revisión y la preparación del índice real; si cambian, volver a revisar su contenido.
