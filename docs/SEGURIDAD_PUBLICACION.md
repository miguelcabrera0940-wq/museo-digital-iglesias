# Revisión previa a GitHub — 2 noviembre 2026

Esta revisión prepara archivos; no publica, no crea un repositorio ni certifica seguridad
completa. No se cambiaron credenciales, cuentas, contenido, permisos o esquema remoto.
El diseño y las funciones permanecen intactos, incluido el PDF simulado sin subida.

## Hallazgos y correcciones locales

| Ubicación | Problema | Solución |
|---|---|---|
| Raíz | Faltaba `.gitignore`; las exclusiones del backend no protegían secretos creados en otras carpetas. | Exclusiones para `.env*` salvo `.env.example`, claves, registros, volcados, dependencias, compilaciones y `.vercel`. |
| `backend/.env` | Otros usuarios locales podían leer el archivo. | Permisos600, solo usuario propietario del archivo. Contenido sin modificar. Este propietario local no es el rol propietario de Neon. |
| `frontend/.env.example` | Comentarios antiguos proponían variables Supabase. | Retirados; solo `VITE_API_BASE=/api` y `VITE_USAR_MOCKS=false`, valores públicos ficticios/de configuración. |
| `backend/.env.example` | Comentario administrativo desactualizado. | Aclara login restringido y configuración HTTPS de producción. URLs y secreto son placeholders; no sirven para autenticar. |
| `docs/capturas/`, `trabajo-contenido/`, `ARNES_IGLESIAS_ACTUALIZADO/` | Capturas y trabajo local no deben incorporarse accidentalmente. | Excluidos en raíz sin borrarlos. Revisión visual completa pendiente antes de compartir capturas. |

Se comprobó `.gitignore` con17 casos en un repositorio temporal sin remotos: secretos,
logs, volcados, capturas y compilación excluidos; ejemplos, código, migraciones y ambos
package-lock siguen admitidos. Ignorar no retira archivos ya versionados.

## Qué se revisó y qué significa

- Archivos de texto de código, scripts, SQL, datos, documentación, ejemplos, lockfiles y
  compilación: búsqueda de conexiones autenticadas, tokens de proveedor, claves privadas,
  hashes comunes, literales de contraseña y coincidencias con secretos locales. Ningún
  secreto real detectado fuera del archivo local excluido. Las coincidencias de ejemplos
  y pruebas se revisaron como valores ficticios; no son credenciales operativas.
- `.git` existe como directorio vacío y no es un repositorio Git utilizable. No hay índice
  ni historial disponibles que auditar en esta copia. Esto no acredita otras copias,
  repositorios remotos, conversaciones o respaldos externos.
-132 PNG de `docs/capturas`: metadatos textuales revisados sin patrones de credenciales.
  No hay OCR instalado ni se hizo revisión visual exhaustiva de los píxeles. Las capturas
  quedan excluidas; no considerarlas autorizadas para publicar. No se borraron.
- No se localizaron archivos de log en el proyecto. Los registros temporales de esta
  revisión están fuera del proyecto; no se registraron valores de secretos.
- La compilación nueva de Vite fue escaneada tras `npm run build`: sin coincidencias de
  secretos locales, conexiones autenticadas o claves privadas. Las imágenes/fuentes
  corresponden a recursos públicos existentes. No hay PDF parroquial subido a `public/`.
- Variables `VITE_*`: únicamente base pública de API y activación explícita de mocks.
  No hay conexiones PostgreSQL ni secretos en variables del frontend. No poner jamás
  `DATABASE_URL*`, secretos Auth o conexiones operativas en `VITE_*`.
- Los JSON del backend contienen contenido público o ejemplos declarados; no sustituirlos
  por documentos parroquiales privados reales dentro del repositorio, aunque estén en backend.
- `npm audit` se intentó una vez en cada paquete, sin instalar ni actualizar. Ambos fallaron
  al consultar npm con `EAI_AGAIN`. Avisos/vulnerabilidades actuales **sin verificar**.
  Repetir `npm audit` desde backend y frontend con conexión operativa antes de publicar;
  revisar resultados y autorizar por separado cualquier actualización necesaria.

El escaneo por patrones no detecta toda forma posible de secreto ni evalúa visualmente
imágenes. Tampoco acredita que una credencial compartida fuera del proyecto siga siendo segura.

## Controles del backend conservados

- Las conexiones reales locales usan los logins previstos `iglesias_backend` y
  `iglesias_backend_admin`; no el propietario. La configuración de PostgreSQL está solo
  en backend y no se exporta al navegador. No se consultaron privilegios reales en Neon
  durante esta revisión. Las guardias de servidor verifican membresía, contexto y ausencia
  de privilegios elevados/propiedad; se mantienen TLS verificado y rol público READ ONLY.
- Better Auth1.7.13 calcula/verifica contraseñas mediante scrypt en su implementación Node.
  Los scripts de alta delegan el hash en la biblioteca; no escriben contraseñas en tablas,
  SQL, archivos o logs. No se inspeccionaron hashes reales de usuarios en Neon.
- Sesiones persistidas de8h, sin renovación ni caché de cookie de sesión. Cookies HttpOnly,
  SameSite=Lax, Path=/ y Secure al configurar origen HTTPS. Producción rechaza el origen HTTP
  de localhost. No se añadió registro público, correo ni recuperación de contraseña.
- Login/escrituras/logout exigen Origin exacto y cabecera administrativa; escrituras y
  logout exigen CSRF vinculado a sesión. Login limitado por fallos persistidos y transacciones
  en Neon. El handler nativo de Better Auth no está expuesto como ruta pública.
- Logout confirma revocación en el almacén antes de204. El verificador operativo conserva
  la cookie anterior y exige401 después. No se ejecutaron nuevos logins en esta revisión.
- Cada acceso comprueba sesión y ámbito activo en servidor; las operaciones de gestión
  vuelven a leer el ámbito dentro de su transacción. Rol/asignación enviados por navegador
  no conceden permisos. Valores SQL parametrizados; tablas/columnas/roles dinámicos proceden
  de listas internas cerradas. Campos, UUID, fechas, horas y tamaños JSON están restringidos.
- La proyección pública excluye notas internas. Un documento privado devuelve403 en ruta
  pública aun con cookie; administración requiere sesión/ámbito y limita IDs ajenos.
  Documentos públicos y toda administración envían no-store. No hay caché compartida privada.
- Miguel confirma que las ocho cuentas parroquiales ya pasaron la verificación real de
  aislamiento. Se registra como evidencia aportada por Miguel, sin repetir altas, login,
  restablecimiento o pruebas de escritura ni afirmar una nueva comprobación remota propia.

Las pruebas locales de permisos/privados son simuladas salvo la criptografía y la ejecución
SQL local indicadas abajo. No sustituyen un ensayo de HTTPS real ni una auditoría independiente.

## Rotación pendiente: credencial propietaria de Neon comprometida

La contraseña propietaria compartida en conversación se considera comprometida, aunque no se
haya encontrado en archivos publicables. **No se rotó durante esta revisión.** No recuperar,
repetir o pegar su valor en documentación, shell, incidencias, commits o logs.

Procedimiento pendiente para Miguel, sin cambiar privilegios ni la cuenta administradora web:

1. Abrir Neon Console de forma privada. Seleccionar proyecto **iglesias**
   (`divine-wildflower-50337376`), rama **production**, base **neondb**. Revisar que el rol
   objetivo sea exclusivamente **neondb_owner**; no seleccionar los logins restringidos.
2. En **Postgres database → Roles**, menú del rol → **Reset password**. Guardar el valor
   generado en un gestor privado y actualizar únicamente los consumidores operativos
   que usaban ese rol. Este paso es remoto y queda pendiente de ejecución autorizada;
   no usar `\password` ni crear roles nuevos o ampliar permisos como alternativa.
3. Revisar dónde se guardó la conexión propietaria: cliente SQL/gestor de conexiones,
   configuración local de herramientas/MCP si utiliza esa URL, gestor de secretos,
   `.pgpass`/servicios PostgreSQL, historial de terminal o registros exportados, respaldos
   y variables de despliegue si alguna vez se configuraron allí. No se accedió a esos
   almacenes externos. Si el MCP usa autorización de Neon independiente, no asumir que
   requiere la contraseña SQL ni rotar su autorización sin otra evidencia.
4. **No** introducir el propietario en `backend/.env`: los dos `DATABASE_URL*` locales
   actuales son de los logins restringidos y no necesitan cambiar por esta rotación.
   Tampoco cambiar `BETTER_AUTH_SECRET`, hashes, contraseñas web o sesiones por defecto;
   esta incidencia no demuestra exposición de esos secretos.
5. Comprobar privadamente una conexión operativa nueva con el rol rotado, sin imprimir URL
   ni contraseña. El reset invalida la clave anterior para conexiones nuevas; no garantiza
   cerrar conexiones ya establecidas. Revisar las sesiones de BD del rol comprometido y
   autorizar por separado su cierre si procede; no terminar conexiones de la aplicación
   ni invalidar cuentas web durante esta revisión. No volver a usar la clave comprometida.
6. En caso de otras ramas/cuentas donde se reutilizó la misma clave, inventariarlas y
   preparar su rotación con autorización; no se inspeccionaron ni modificaron aquí.
   Eliminar copias accidentales de la conversación/historial cuando sea posible no sustituye
   la rotación. Si aparecen commits antiguos con secretos en otra copia, detener publicación:
   rotar primero y preparar limpieza del historial sin ejecutar operaciones destructivas ahora.

Referencia oficial: [Neon: roles y restablecimiento](https://neon.com/docs/manage/roles),
[rotación de credenciales](https://neon.com/docs/manage/roles#reset-a-password).
No ejecutar SQL, migraciones o cargadores para esta rotación. No alterar propietarios/GRANT/RLS.

## Antes de un despliegue HTTPS

- Mantener frontend y fachada `/api` bajo el **mismo origen HTTPS**. El proxy de Vite solo
  sirve para desarrollo: el alojamiento debe enrutar `/api/*` a Express conservando el
  prefijo y el resto a la SPA. La función debe importar `backend/src/app.js`; no arrancar
  un servidor persistente ni publicar la carpeta backend como contenido estático.
  La configuración de alojamiento/rewrite aún no está preparada ni probada para un destino real.
- Variables solo de backend, mediante secretos del alojamiento: `DATABASE_URL` y
  `DATABASE_URL_ADMIN` con los logins restringidos, `BETTER_AUTH_SECRET` aleatorio y privado,
  `APP_ORIGIN=https://YOUR_APP_HOST` sin barra final y `NODE_ENV=production`. Los placeholders
  no son valores de producción. No depender de un `.env` incluido en el paquete publicado.
- Frontend: `VITE_API_BASE=/api`, `VITE_USAR_MOCKS=false`; no alojar `.env`, SQL, scripts de
  operación, logs o documentos reservados junto al resultado de `frontend/dist`.
  Los recursos estáticos admitidos son fotos/fuentes públicas y el build revisado.
- Probar en el origen definitivo Secure/HttpOnly/SameSite y Path de cookies, CSRF/Origin,
  login/sesión/logout revocado, ámbitos, errores y privados sin caché. Pendiente: no se ha
  hecho una prueba en HTTPS real ni de las reglas del alojamiento/CDN/encabezados del HTML.
  No introducir una CSP global sin probar Leaflet, imágenes, fuentes y el visor PDF simulado.
- Antes de exposición pública, decidir y ejecutar con autorización el retiro de las cuentas
  temporales compartidas de demostración y revocar sus sesiones; procedimiento existente en
  `CUENTAS_DEMO.md`. No se desactivaron ni cambiaron ahora; no repetir la provisión.
- Volver a revisar la lista preparada con `git diff --cached --name-only` cuando exista un
  repositorio real, **antes** de cualquier commit/push. No usar `git add -f` con exclusiones.
  Revisar el diff local sin copiar contenidos sensibles a tickets o conversaciones.

## Pruebas de esta revisión

- Node24.21.0, desde raíz: `node --test --test-isolation=none --test-reporter=spec --test-skip-pattern='^API HTTP$'`:
  **150 aprobadas,1 omitida,0 fallos** (backend y frontend). No ejecuta el grupo API HTTP;
  la integración pg/Better Auth real por socket queda omitida sin clúster temporal habilitado.
- Frontend: `npm test`:8 archivos aprobados (31 casos visibles al ejecutar desde raíz),
  `npm run build`: correcto,82 módulos. No se modificaron componentes, estilos ni flujo PDF.
- `python3 backend/test/validar_sql_local.py`: SQL001–014, constraints/GRANT/metadatos y
  consultas aprobados en PostgreSQL local efímero. Su carga de fixtures y prueba de repetición
  afectan solo ese clúster descartable, **no Neon** ni los datos existentes del proyecto.
  Modo single elude filtrado RLS: no acredita RLS efectivo remoto ni driver pg real.
-17 casos de exclusión Git correctos y escaneo posterior del build sin secretos detectados.
- Sin nuevas dependencias, sin publicaciones/push, sin altas ni cambios remotos.
