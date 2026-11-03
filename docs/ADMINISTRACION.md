# Administración — general y parroquiales

Operación excepcional autorizada de ocho cuentas temporales: [CUENTAS_DEMO.md](CUENTAS_DEMO.md).
Incluye lote seguro, revisión sin escritura, verificación HTTP, restablecimiento y retirada.

Estado conocido según Miguel/documento ADMIN_POR_IGLESIA_Y_RENDIMIENTO: login real general
funcionando;009 y010 aplicadas en Neon (catálogo4/2/2) y selector frontend integrado. No se
repitieron esas consultas ni audit npm cerrado. Esta entrega prepara **011–013**, no ejecutadas.
Sustituye las antiguas restricciones de cuenta única y cupos por IP/ventanas. Historial en TAREAS.
Contrato definitivo en CONTRATO_API.md. Claude hará exclusivamente la interfaz.

## Modelo y permisos

Better Auth1.7.13 existente, cookie HttpOnly/SameSite=Lax, Secure en HTTPS,8h sin refresco
ni cookieCache. El general existente conserva ID, hash y sesiones. Como máximo un parroquial
por iglesia; incluso inactivo conserva su asignación única. Sin visitantes registrados,
registro público, recuperación por correo, interfaz de altas o cambio de rol desde navegador.

administrador: UUID existente, auth_user_id único, activo, rol general/parroquial y iglesia_id.
General requiere iglesia_id:null; parroquial requiere FK existente. Índices parciales impiden
segundo general o dos parroquiales en una iglesia. Se retira el singleton de auth_user.

GET /api/admin/sesion añade rol, iglesia_id e iglesia_slug a administrador/expira_en/csrf_token.
Para general ambos campos de iglesia son null. GET /api/admin/iglesias lista8 para general y1
para parroquial. El cliente no elige ni concede ámbito. La identidad proviene de Better Auth;
el vínculo activo se consulta otra vez por solicitud y en la transacción de negocio. Una
reasignación o desactivación afecta las solicitudes siguientes, no revoca retroactivamente
datos que el usuario ya leyó. No se invalida la sesión general durante la migración.

| Operación | Parroquial | General |
|---|---|---|
| Materiales/lista/ficha/lector privado | Solo su iglesia | Todas |
| Alta/edición de material, horario/actividad; DELETE horario/actividad | Solo su iglesia | Todas |
| PATCH iglesia | Solo telefono, exclusivamente | historia,descripcion,telefono |
| Trámites/requisitos, incluida urnas_nichos | Lectura pública | Edición existente |
| Cuentas/roles/asignación | Ninguna ruta HTTP | Provisión operativa, sin interfaz nueva |

Slug ajeno→403. UUID ajeno/inexistente en ruta admin→404 genérico. POST con iglesia_id ajena→403.
Campos fuera de whitelist (rol, usuario, iglesia_id en PATCH, estado, ciudad...)→400; campos
conocidos pero no permitidos para parroquial (historia/descripcion/requisitos...)→403. Mezclar
telefono con historia también se rechaza, no se ignora. Público conserva fichas bloqueadas,
notas excluidas y403 de documento privado, incluso con cookie administrativa.

**Límite de RLS:** la conexión técnica compartida iglesias_gestion tiene políticas amplias para
operaciones administrativas. PostgreSQL protege integridad, privilegios de tablas/columnas y
RLS público/privados; **no conoce al usuario final** de la sesión. Express garantiza el ámbito
por identidad activa y filtros de pertenencia SQL parametrizados en cada lectura/escritura.
No afirmar aislamiento por persona proporcionado solo por esas políticas amplias. Credencial
de BD nunca al navegador; DATABASE_URL pública y DATABASE_URL_ADMIN separadas, sin propietario.

## Login: política persistente aprobada

Misma fachada POST login/GET sesion/POST logout, sin handler nativo catch-all de Better Auth.
Origen exacto APP_ORIGIN, X-Iglesias-Admin siempre y CSRF de sesión en escrituras/logout;
JSON4KiB login/256KiB negocio. Todas las respuestas admin no-store. Sin cambios de sesión/hash.

- Correo normalizado, clave HMAC; no IP/MAC o baneo. Fallos1–4 sin espera;5–9→15s;
  desde10→120s por nuevo fallo permitido (contador saturado en10).
- El fallo permitido sigue devolviendo401 genérico. Durante la espera:429 RATE_LIMITED,
  Retry-After segundos; no verificar contraseña, aumentar fallos o prolongar espera.
- Éxito de credenciales reinicia;15min sin nuevo fallo expiran la secuencia. Correo inexistente
  válido sigue el mismo camino/errores. Errores técnicos/BD no cuentan como fallo ni admiten
  login sin limitador. No protección total frente a bots/distribución/DoS.
- Estado en login_limite, transacción con FOR UPDATE por correo durante la verificación;
  COMMIT del fallo antes de devolver401. Limpieza acotada100 filas antiguas con SKIP LOCKED.
- Pools separados con la misma credencial restringida:2 conexiones para gestión/contador y1
  para Better Auth. Evita que esperas del contador agoten conexiones que necesita Auth;
  total máximo por instancia3, como antes. No se midió ni se anuncia mejora de rendimiento.

012 reinicia solo los contadores antiguos: incluían intentos correctos e IP/ventanas y no
representan fallos consecutivos. No modifica cuentas, contraseñas, sesiones o asignaciones.

## Urnas y nichos

Tipo urnas_nichos, quinto tras otros, en GET /api/iglesias/:slug/tramites. Una guía vacía por
iglesia, requisitos:[], fuente:null, estado_verificacion:por_confirmar; carga idempotente sin
sobrescribir contenido existente. PATCH /api/admin/tramites/:id solo general. El frontend usa
telefono de Iglesia (tel: si existe; si null Por confirmar) y texto fijo:
«Consulta disponibilidad y condiciones directamente con la parroquia».
No inventar requisitos, precio, disponibilidad o teléfono. Sin chat, reservas, pagos o uploads.
PDF sigue siendo selección/simulación local, sin petición, bytes ni entrada de carga persistida.

## Migraciones y provisión — pendientes de autorización remota

Revisar en este orden en Neon Console/proyecto iglesias/rama y base correctas, con operador
de migraciones autorizado. No repetir001–010, ya aplicadas. Código nuevo necesita las nuevas
columnas antes de integrarse; no hay fallback a mocks si falta la migración.

1. backend/sql/011_administradores_por_iglesia.sql: conserva general y añade modelo/índices;
   provisión solo gana SELECT(id,slug) de iglesias para resolver la asignación.
2. backend/sql/012_login_fallos_consecutivos.sql: reutiliza login_limite para nueva política;
   reinicia contadores técnicos obsoletos. Mismos permisos/RLS del contador.
3. backend/sql/013_urnas_nichos.sql: enum y guías vacías. Puede repetirse sin duplicar ni
   sobrescribir esa guía;011/012 no se reaplican automáticamente.

Sin roles nuevos por usuario, cambios de hashes, secretos o rotación, ni recrear la cuenta general.
No ejecutar estos archivos remotamente sin autorización. Codex solo los probó en clúster temporal.

### Alta parroquial controlada

Reutiliza npm run admin:crear con elección general/parroquial y slug. **No elegir general**
para las nuevas cuentas: la cuenta ya existe y el script rechaza recrearla. Validación12–128,
confirmación y rol/slug antes de conectar; contraseña no se recorta, no se imprime/guarda.

Con autorización del cambio externo, el operador puede habilitar temporalmente el login
operativo existente, separado del runtime:

```sql
ALTER ROLE iglesias_alta_admin LOGIN;
```

No cambiar contraseñas ni DATABASE_URL_ADMIN; no guardar la conexión operativa en .env o
Vercel. Si no hay credencial operativa válida, detenerse y acordar el acceso sin imprimirla.
Desde backend con Node24:

```sh
nvm use 24
npm run admin:crear
```

Elegir parroquial; indicar slug exacto; introducir conexión operativa, correo, contraseña y
confirmación en prompts ocultos, nunca argumentos/historial/chat. Antes de escribir comprueba:
rol operativo sin propiedad/privilegios elevados, iglesia existente, general existente y ninguna
cuenta asignada a esa iglesia o al correo. Mejor hacerlo una cuenta por vez. La biblioteca crea
usuario/credencial con su hash y autoSignIn:false, después se inserta el vínculo.
Si el vínculo falla, queda una cuenta sin permiso; detenerse para revisión autorizada, no borrar,
reutilizar una identidad o reintentar automáticamente. Constraints previenen duplicar asignaciones.
El script no crea cuentas remotamente durante esta entrega ni dispone de endpoint de registro.

Al terminar las altas autorizadas, operador debe cerrar el login operativo (cambio externo):

```sql
ALTER ROLE iglesias_alta_admin NOLOGIN;
```

Consulta de revisión sin emails/hashes/tokens, en misma rama/base, por operador autorizado:

```sql
SELECT a.rol, i.slug, a.activo
FROM public.administrador a
LEFT JOIN public.iglesias i ON i.id=a.iglesia_id
ORDER BY a.rol,i.slug;
```

Esperar un general con slug null y como máximo un parroquial por iglesia. Esta lectura no fue
realizada por Codex contra Neon. No asignar permisos con datos enviados por el navegador.

## Pruebas locales y pasos de integración

Desde la raíz con Node24 (sin nuevas instalaciones):

```sh
node --test --test-isolation=none --test-reporter=spec
python3 backend/test/validar_sql_local.py
python3 backend/test/validar_sql_local.py --servidor
```

Primer comando: lógica, controladores/Express en memoria, Better Auth con almacén temporal,
clientes SQL simulados y suites públicas existentes. Las HTTP reales requieren sockets.
Segundo: PostgreSQL temporal modo single sin sockets, SQL001–013/constraints/GRANT/metadata;
**modo single elude filtrado RLS**. Tercero: servidor PostgreSQL temporal, RLS efectivo y
integración real pg/Better Auth/Express local, incluidas parroquiales y límite entre pools;
no usa .env ni Neon. No ejecutar archivos SQL de tests en Neon.

La integración frontend va después de aplicar SQL y provisionar cuentas autorizadas. Usar
localhost:5173→proxy /api→backend3001, APP_ORIGIN=http://localhost:5173. No se cambiaron secretos.
El verificador de proxy opcional usa cuenta temporal general y permisos/contador simulados;
no certifica esta política persistente ni aislamiento parroquial.

## Entrega a Claude y trabajo posterior

- Un mismo login. Consultar sesión; guardar ámbito/CSRF solo en memoria. Mostrar iglesia asignada
  al parroquial y selector global al general usando GET /admin/iglesias. Público sigue sin cuenta.
- Ocultar edición de historia/descripcion/requisitos al parroquial y habilitar telefono/materiales/
  horarios/actividades propios. Manejar403/404 sin dar por guardado. Servidor valida igualmente.
- Reconsultar sesión ante403/cambio de asignación, limpiar contenido privado anterior al cambiar
  ámbito y no persistirlo en storage. Ante401 limpiar y pedir login; logout solo tras204.
- Mostrar espera de Retry-After; login correcto permitido tras espera. Añadir urnas_nichos a las
  guías con mensaje fijo y botón de teléfono cuando exista. Sin SDK/dependencias nuevos.
- Integrar y verificar funciones antes de rendimiento. No se midió ni optimizó navegación; sigue
  pendiente API vs imágenes/render, primera/siguientes solicitudes. Revisión final de secretos,
  rotación planificada y GitHub van después de esa integración; no publicar ni rotar por cuenta propia.

Resultados reales y bloqueos de esta entrega en TAREAS.md; no confundir mocks con Neon.
