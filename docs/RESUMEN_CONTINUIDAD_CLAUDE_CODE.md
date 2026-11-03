# Resumen de continuidad para Claude Code — Iglesias

> Actualización 25 octubre 2026: Neon reemplaza Supabase; proyecto iglesias ya creado,
> solo BD activa. Autenticación administrativa pendiente. Las referencias siguientes
> a cliente/instalación de Supabase, Auth y cupos son históricas y no deben ejecutarse.
> Consultar NEON.md, contexto, contrato y última entrega de TAREAS para el estado vigente.

Fecha: 24 octubre 2026. Proyecto: `/home/miguel/Proyectos/ProgrmacionUniversidadUTM/iglesias`.
Colocar este archivo en `docs/RESUMEN_CONTINUIDAD_CLAUDE_CODE.md`. Si algo contradice a `CLAUDE.md`, `AGENTS.md` o `docs/CONTRATO_API.md`, prevalecen esos tres.

## 1. Estado

- Solo existe el arnés (CLAUDE.md, AGENTS.md, LEEME.md, docs/). No hay `frontend/` ni `backend/`. No se instaló ni programó nada.
- La revisión de Claude web propone las dependencias de la sección 3, Leaflet directo (sin `react-leaflet`) y fuentes locales. Las tecnologías principales están aprobadas. Si no existe una autorización explícita de instalación en la sesión local, presentar la lista exacta una sola vez y solicitarla antes de instalar. No tomar el resumen previo como comprobante de una autorización con hora específica.
- Vitest: NO autorizado todavía. Se pedirá al preparar pruebas.
- Figma bloqueado e incompleto: no gastar llamadas. Se implementa el diseño directo en navegador con las especificaciones de `CONTEXTO_PROYECTO.md`.

## 2. Verificación previa obligatoria: Node de la computadora de Miguel

Claude web reportó estas versiones y requisitos. Este arnés no los verificó independientemente: comprobar disponibilidad y engines en npm desde el entorno local antes de fijarlos. El Node de la sesión en la nube NO cuenta: no es el de Miguel.

| Paquete | Versión | Node requerido | Publicada |
|---|---|---|---|
| react, react-dom | 19.3.1 | sin mínimo útil (`>=0.10`) | 2026-10-14 |
| react-router-dom | 7.18.4 | `>=20.0.0` | 2026-09-15 |
| leaflet | 1.9.4 | sin campo `engines` (solo navegador) | 2023-05-18 |
| @supabase/supabase-js | 2.118.0 | **`>=22.0.0`** | 2026-10-15 |
| vite (dev) | 8.3.5 | `^20.19.0 \|\| >=22.12.0` | 2026-10-21 |
| @vitejs/plugin-react (dev) | 6.1.2 | `^20.19.0 \|\| >=22.12.0`, peer `vite ^8` | 2026-10-05 |

Requisito combinado: **Node >= 22.12.0**. Supabase exige al menos 22 y la rama 22 de Vite exige 22.12+. Verificar los engines reales antes de instalar; no basta cualquier versión 22.

Primer paso de Claude Code, antes de `npm install`:

```
node -v && npm -v
```

- Si Node es compatible con los engines reales: continuar con la preparación; instalar solo cuando la autorización local esté clara. El entorno histórico del usuario tenía Node 24 con nvm, pero se debe comprobar.
- Si es menor: NO instalar. Informar a Miguel y ofrecer dos salidas para que él decida: actualizar Node (en Debian, por ejemplo con nvm o el paquete de la distribución) o buscar una versión de `@supabase/supabase-js` compatible con su Node y volver a verificar sus requisitos. No elegir una versión sin comprobar.
- Registrar el resultado en `docs/TAREAS.md` y fijarlo en `frontend/package.json` (`"engines": {"node": ">=22.12.0"}`) y en un `.nvmrc` o equivalente solo si Miguel lo quiere.
- Pendiente a confirmar con Codex: el Node que usará el backend/Vercel. Este resumen solo cubre el frontend.
- Vite 8.3.5 tiene pocos días de publicada. Si la instalación o el build dan problemas, informar antes de cambiar de versión.

## 3. Dependencias propuestas por Claude web

Tras verificar Node, disponibilidad y autorización, instalar dentro de `frontend/`, con versiones fijas (sin `^`):

```
npm install --save-exact react@19.3.1 react-dom@19.3.1 react-router-dom@7.18.4 leaflet@1.9.4 @supabase/supabase-js@2.118.0
npm install --save-dev --save-exact vite@8.3.5 @vitejs/plugin-react@6.1.2
```

Nada más: sin TypeScript, Tailwind, estado global, `react-leaflet`, Vitest ni paquetes de fuentes. Los peers opcionales de Vite y del plugin no se instalan.

Fuentes (sin dependencia npm): descargar Lora e Inter de su fuente oficial, en `woff2`, junto con sus archivos de licencia, a `frontend/public/fuentes/`. Declarar `@font-face` con `font-display: swap` y alternativa del sistema. Antes de usarlas, confirmar la licencia en el archivo incluido (según lo conocido es SIL OFL, no verificado en esta sesión) y registrarlo en `TAREAS.md`. Sin CDN.

## 4. Estructura propuesta

```
iglesias/
├─ CLAUDE.md  AGENTS.md  LEEME.md
├─ docs/                       (CONTEXTO_PROYECTO, CONTRATO_API, TAREAS, este resumen)
├─ backend/                    ← Codex; no tocar
└─ frontend/
   ├─ index.html  vite.config.js  package.json  .env.example
   ├─ public/
   │  ├─ fuentes/              (Lora, Inter + licencias)
   │  └─ muestras/             (fotos de muestra identificadas; nada privado)
   └─ src/
      ├─ main.jsx  App.jsx     (rutas)
      ├─ estilos/              (tokens.css: paleta y tamaños; global.css)
      ├─ api/                  (cliente.js: fetch, errores del contrato; iglesias.js, materiales.js,
      │                         horarios.js, actividades.js, tramites.js, admin.js)
      ├─ auth/                 (supabase.js, SesionAdmin.jsx, RutaProtegida.jsx)
      ├─ componentes/          (Mapa, TarjetaIglesia, Estanteria, Lector, Calendario, Folleto,
      │                         EstadoCarga, EstadoError, EstadoVacio)
      ├─ paginas/publico/      (Mapa, Interior, Museo, Ficha, Lector, Horarios, Tramites)
      ├─ paginas/admin/        (Login, Panel, Materiales, Horarios, Actividades, Tramites, CargaSimulada)
      └─ mocks/                (vacío por defecto; ver sección 6)
```

- Una pantalla por función, reutilizada por las cuatro iglesias con datos y slug. Nada de copias.
- Slugs de ruta y API: `catedral`, `tercera-orden`, `santa-lucia`, `santa-ana`. Los códigos `cat/jes/slu/san` son solo de Figma.
- Rutas sugeridas, con prefijo para que `/admin` no choque con un slug:
  - Público: `/` (mapa), `/iglesias/:slug`, `/iglesias/:slug/museo`, `/iglesias/:slug/museo/:materialId`, `/iglesias/:slug/museo/:materialId/leer`, `/iglesias/:slug/horarios`, `/iglesias/:slug/tramites`.
  - Admin: `/admin/login`, `/admin`, `/admin/:slug/...`.
- Desarrollo: en `vite.config.js`, proxy de `/api` al Express de Codex (puerto a acordar con Codex). Sin dependencias extra.
- Variables de navegador (`.env.example`, solo placeholders): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_API_BASE` (por omisión `/api`). Nunca `service_role`, secretos ni contraseñas en ninguna variable `VITE_`.

## 5. Primer incremento (Incremento 1 de `TAREAS.md`)

Mapa real de Mérida, cuatro iglesias, tarjetas e interior.

1. Verificar Node y registrar resultado. Instalar dependencias (sección 3). Crear `frontend/` y archivos de arranque.
2. `tokens.css`: pergamino #F5EDDC, tinta #1F1A17, madera oscura #2E1B10, madera media #4A2C17, piedra #E7DDCB, vino #6E1F2B, dorado #B8892B (acento, no texto sobre pergamino). Texto 18 px móvil / 20 px escritorio, controles mínimo 56 px, separación 12 px, foco visible.
3. Fuentes locales con licencias.
4. `Mapa` con Leaflet directo (envoltura pequeña con `useEffect`): teselas OpenStreetMap con **atribución visible**, mover y acercar, cuatro marcadores con las coordenadas aprobadas, botón «Ver las cuatro iglesias» (ajusta límites). Sin rutas, buscador ni GPS del visitante. Revisión visual de marcadores sobre calles. Los marcadores no son necesariamente las entradas. Respetar la política de uso de teselas.
5. Marcador o tarjeta abre `TarjetaIglesia` con «Entrar». `Interior`: fotografía de muestra con botones superpuestos legibles (contraste suficiente) y navegación de regreso.
6. Datos de iglesias: llamar a `GET /api/iglesias` y `GET /api/iglesias/:slug`. Si Codex aún no tiene API, usar mocks aislados (sección 6).
7. Estados de carga, error y vacío visibles. Comprobar `npm run build` y revisar a 390 px y 1440 px. Informar exactamente qué se ejecutó y qué no.
8. Actualizar `docs/TAREAS.md` (hecho, archivos, comprobaciones reales, bloqueos, siguiente acción).

Coordenadas aprobadas: Catedral de San Ildefonso 20.96715, -89.62254; Iglesia de Jesús o Tercera Orden 20.96878, -89.62240; Iglesia de Santa Lucía 20.97103, -89.62192; Iglesia de Santa Ana 20.97650, -89.62097.

## 6. Contrato y mocks

- `docs/CONTRATO_API.md` v1 es la base común. No cambiarlo por cuenta propia: si hay un problema, anotarlo en `TAREAS.md` para coordinarlo con Miguel y Codex.
- Respuestas `{"data": ...}`; errores `{"error": {"code", "message", "fields"?}}`. `cliente.js` debe convertirlos en errores con ese mismo formato. Fechas `YYYY-MM-DD`, `dia_semana` 0–6 derivado de la fecha local, sin pasar por UTC.
- Mocks: solo en `src/mocks/`, con el esquema exacto del contrato y `es_ejemplo: true`. Se activan **solo** con una bandera explícita (por ejemplo `VITE_USAR_MOCKS=true`) y muestran un aviso visible de «datos de demostración». Una API que falla nunca se sustituye en silencio por mocks: se muestra el error. Se retiran todos en la integración.
- Los privados nunca se muestran en el sitio público: solo título, descripción y portada públicas, candado y «Acceso reservado». Biblioteca y lector privados viven en `/admin`.
- El selector de PDF es una simulación permanente: nombre y tamaño, confirmación «Carga de demostración completada. El archivo no se guardó ni se envió», cancelar y reiniciar. Sin petición de red, sin guardar bytes, sin crear fichas que aparenten almacenamiento.
- Sin contraseñas en código, docs o variables VITE (tampoco la de demostración).

## 7. Pendientes

- Confirmar `node -v` de Miguel y el Node del backend/Vercel.
- Autorizar Vitest cuando se prepare la primera prueba (cliente de API y rutas protegidas).
- Licencias y archivos de Lora e Inter; fotos interiores reutilizables (usar muestras identificadas); fuentes históricas; teléfonos, horarios y requisitos oficiales (mostrar ejemplo o «Por confirmar»).
- Acordar con Codex puerto del backend y compatibilidad del contrato.
- Verificar visualmente los marcadores sobre el mapa.
- Figma: Santa Ana, conexiones, FigJam y diseño visual quedan fuera del camino crítico.
- GitHub, despliegue y secretos: solo cuando Miguel lo indique. Respetar cuotas gratuitas de Supabase y Vercel; confirmar el cupo de Supabase sin tocar el proyecto existente.
- Jornadas: 1 estructura/contrato e inicio; 2 funciones públicas; 3 integración, admin y pruebas; 4 correcciones, publicación y documentación.
