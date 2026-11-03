# Cuentas parroquiales temporales — operación autorizada

Miguel autorizó excepcionalmente estas ocho cuentas de demostración el 30/10/2026.
Identificadores ficticios, sin buzones, registro público ni envío de correos. La contraseña
autorizada no se incluye en archivos, argumentos, SQL, historial o logs.

## Restablecimiento técnico y lote en un solo comando

Miguel autorizó restablecer exclusivamente la contraseña de iglesias_alta_admin y completar
las cuentas. Desde la raíz, con nvm disponible:

```sh
cd backend && nvm exec 24 node --env-file-if-exists=.env scripts/restablecer-demo.js
```

Pide dos entradas ocultas: conexión del **operador con capacidad de alterar ese rol** en la
misma rama/base (su contraseña vigente, no la olvidada de iglesias_alta_admin) y contraseña
web de demostración acordada. No requiere copiar, generar o guardar la nueva clave técnica.
Si el entorno ya contiene IGLESIAS_OPERADOR_URL, reutiliza únicamente ese acceso operativo
expresamente facilitado; no añadir esa variable a .env. No busca conexiones en otros archivos.

Necesita la configuración pública/administrativa existente en backend/.env, con ambos logins
restringidos y APP_ORIGIN=http://localhost:5173. Compara host/rama/base con la conexión operativa;
comprueba catálogo y general. Si iglesias_alta_admin está en **NOLOGIN**, informa
IGLESIAS_ALTA_ADMIN_NOLOGIN_SIN_CAMBIOS y se detiene **antes de restablecer o habilitar nada**.

Comprueba/inicia automáticamente Express en127.0.0.1:3001 con sus credenciales restringidas;
si hay un servidor, lo reutiliza comprobando el catálogo. El acceso operativo elevado sirve
solo para la revisión y el cambio autorizado de PASSWORD; no se usa para servir Express ni
crear cuentas. Un servidor iniciado por el script se cierra al terminar.

Genera256 bits aleatorios en memoria. Neon requiere la contraseña original por TLS; se pasa
como parámetro a un ajuste local de transacción y un DO ejecuta ALTER ROLE exclusivamente
sobre PASSWORD. Verifica que atributos y membresías permanecen iguales y confirma. Se cierra
la conexión del operador y se usa la nueva conexión de iglesias_alta_admin únicamente en
memoria para el mismo revisarCuentas/completarCuentas/verificarCuenta de admin:demo.
La clave técnica no se imprime ni persiste en .env, documentación, argumentos o archivos.
El script solo emite códigos seguros; no serializa mensajes/contextos SQL del driver.
Referencia de compatibilidad: [Neon: contraseñas originales, hashes no admitidos](https://neon.com/docs/manage/roles#manage-roles-with-sql).

Cada fallo detiene la operación sin reintentos automáticos. Un restablecimiento confirmado
permanece aplicado aunque falle después el lote; su OK se emite antes de las altas. No repetir
el script a ciegas: otra ejecución volvería a rotar la clave. Si se interrumpe una alta, revisar
las filas emitidas y el estado remoto antes de actuar. No se sobrescriben conflictos ni se
cambia la cuenta general, permisos, LOGIN o contenido parroquial.

Restablecer una clave técnica **no** restablece las contraseñas web. La contraseña común
se solicita en oculto para evitar incluirla en el código; se usa para contrastar existentes y
para que Better Auth calcule los hashes de las faltantes. Las comprobaciones y limpieza antes
de publicar descritas más abajo siguen pendientes de ejecución real.

## Ejecutar desde la terminal de Miguel

Desde la raíz:

```sh
nvm use 24
cd backend
npm start
```

En otra terminal, desde la raíz:

```sh
nvm use 24
cd backend
npm run --silent admin:demo
```

Necesita el backend real en localhost:3001, APP_ORIGIN=http://localhost:5173 y la configuración
administrativa existente de esa misma rama/base. No usar mocks. No guardar la conexión
operativa en .env. Introducir **la conexión de iglesias_alta_admin**, contraseña autorizada y
confirmación únicamente en los prompts ocultos compartidos con admin:crear. Nunca utilizar
la conexión del propietario. El comando no habilita roles ni modifica permisos. Si el login
operativo está cerrado o faltan las migraciones011–013, detenerse; no aplicarlas ni habilitar
permisos automáticamente. Su estado remoto no ha sido confirmado por Codex.

El comando revisa primero catedral y santa-ana, luego las otras seis, **todo antes de escribir**.
Comprueba rol operativo restringido, existencia del general y de cada iglesia; consulta
usuario, credencial y asignación. Contrasta los hashes existentes con verifyPassword de
Better Auth sin devolverlos. Conserva las cuentas activas/parroquiales correctamente asignadas
y con contraseña coincidente. Contraseña distinta, inactividad, cuenta sin vínculo o iglesia
ocupada se informan como conflicto; no se sobrescriben. Las otras filas independientes pueden
completarse. No se modifica la cuenta general ni se reasignan cuentas.

Solo las faltantes pasan por crearAdministrador (procedimiento actual): signUpEmail de
Better Auth, autoSignIn:false y vínculo parroquial activo a una única iglesia. No guarda la
contraseña en texto plano. Si falla una alta se detiene: podría existir usuario sin vínculo;
revisar el estado antes de otro intento, sin borrar ni reparar automáticamente.

Variantes:

```sh
npm run --silent admin:demo -- --revisar
npm run --silent admin:demo -- --verificar
```

--revisar es solo lectura (incluye comparación de contraseñas); conserva los prompts operativos
y permite comprobar el estado después de un fallo antes de decidir reintentar.
--verificar pide únicamente la contraseña web mediante prompt oculto: no conecta directamente
a Neon, no consulta hashes, no crea cuentas ni ejecuta restablecimientos. Comprueba las ocho
identidades existentes por HTTP y crea/revoca únicamente sesiones de prueba. Se detiene ante
un fallo, sin reintentar ni sobrescribir conflictos. El servidor mantiene sus límites de login.

## Qué comprueba la API real

Para cada cuenta creada o coincidente: login, sesión parroquial, GET /api/admin/iglesias con
exactamente su iglesia; en **cada una de las siete ajenas**, listado de materiales admin403.
No se envían PATCH, PUT ni DELETE; los únicos POST son login y logout. No se crean materiales,
horarios, actividades o documentos de prueba. Se consultan metadatos públicos de materiales
privados ajenos y se exige documento admin404 y público403. Nunca se imprimen ni guardan cuerpos
de documentos. Sin material privado ajeno disponible se informa HTTP_PARCIAL, no aprobación.
Al terminar, incluso ante fallo de comprobación, intenta cerrar la sesión de prueba; un fallo
de logout también hace fallar la verificación. Después exige401 en sesión y listado administrativo
conservando la cookie anterior, para comprobar revocación real. Cookies y CSRF solo permanecen
en memoria. Este recorrido comprueba aislamiento de lectura; no prueba escrituras de negocio.

La salida JSON contiene correo, iglesia, resultado y verificación. CREADA solo acredita alta;
HTTP_OK_7_AJENAS_PRIVADOS_RECHAZADOS acredita las comprobaciones reales. No confundir esta salida
con las pruebas unitarias, que emplean SQL/HTTP simulados y criptografía real de Better Auth.
Ante error de conexión o alta, no hay reintento automático. Los avances ya emitidos permiten
distinguir cuentas conservadas/creadas de verificaciones pendientes.

## Restablecer contraseñas con Better Auth

No ejecutar ahora. No modificar hashes por SQL ni reutilizar admin:crear para cuentas existentes.
Las rutas públicas de recuperación siguen deshabilitadas; no se añade servicio de correo.
El login operativo actual solo puede leer/insertar usuarios y cuentas: **no puede restablecer**
contraseñas. El runtime tampoco tiene UPDATE de auth_account ni acceso a auth_verification.
Una herramienta operativa de restablecimiento requiere revisión/autorización separada de los
privilegios mínimos necesarios; no se concedieron en esta entrega.

Procedimiento para esa operación futura, usando Better Auth1.7.13 instalado:

1. Revisar identidad/correo y vínculo parroquial concreto; excluir siempre la cuenta general.
   Pedir nueva contraseña12–128 y confirmación en prompts ocultos antes de cualquier escritura.
2. Crear una instancia **solo operativa, sin montar handler HTTP**, con logger/telemetry apagados,
   los modelos existentes y disableSignUp:true. Configurar temporalmente en esa instancia
   emailAndPassword.sendResetPassword como callback que recoge token únicamente en memoria,
   **sin enviarlo, imprimirlo ni guardar URL**, y revokeSessionsOnPasswordReset:true.
3. Llamar auth.api.requestPasswordReset({body:{email}}); después
   auth.api.resetPassword({body:{token,newPassword}}), con el token privado capturado.
   Better Auth valida longitud, calcula el hash, consume el token y revoca las sesiones.
   Nunca asignar hashes manualmente. Destruir token/contraseña al cerrar el proceso.
4. Verificar que las sesiones anteriores ya no sirven y que solo cambió la cuenta solicitada.
   Si falla, consultar el estado sin reintentar automáticamente. No se ha ejecutado ni probado
   este flujo en Neon; no es un comando disponible de la aplicación actual.

## Desactivar y revocar antes de publicar

**Pendiente de ejecución autorizada antes de publicar**, desde Neon Console, misma rama/base,
con operador que ya tenga permisos de desactivación/revocación; no ampliar el runtime ni guardar
esa credencial en .env. SQL revisable siguiente afecta exclusivamente estos ocho identificadores
con rol parroquial; no borra usuarios ni iglesias ni cambia contraseñas o la cuenta general:

```sql
BEGIN;
WITH objetivo AS MATERIALIZED (
  SELECT a.auth_user_id FROM public.administrador a
  JOIN public.auth_user u ON u.id=a.auth_user_id
  WHERE a.rol='parroquial' AND u.email IN (
    'prueba.catedral@example.invalid','prueba.santaana@example.invalid',
    'terceraorden@demo.invalid','santalucia@demo.invalid',
    'catedralcampeche@demo.invalid','dulcenombrejesus@demo.invalid',
    'catedralpuebla@demo.invalid','lacompania@demo.invalid'
  ) FOR UPDATE OF a
), revocadas AS (
  DELETE FROM public.auth_session s USING objetivo o
  WHERE s."userId"=o.auth_user_id RETURNING 1
), inactivas AS (
  UPDATE public.administrador a SET activo=false FROM objetivo o
  WHERE a.auth_user_id=o.auth_user_id RETURNING 1
)
SELECT (SELECT count(*) FROM inactivas) AS cuentas_desactivadas,
       (SELECT count(*) FROM revocadas) AS sesiones_revocadas;
COMMIT;
```

Esperar ocho cuentas si todas existen. Si faltan, revisar sin crear/reasignar nada. Se eliminan
filas del almacén de sesiones de Better Auth, no hashes. CookieCache está deshabilitado; las
cookies anteriores dejan de identificar sesiones y activo=false bloquea nuevos logins en la
fachada de Express. Comprobar después login rechazado y acceso con cookie anterior401; confirmar
que el general conserva acceso. No publicar mientras falte esta limpieza/verificación.
