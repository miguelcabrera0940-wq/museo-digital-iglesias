# Administración por iglesia, seguridad y rendimiento

## Uso y alcance aprobado

Complemento del arnés actual para Codex. Guardar en `docs/ADMIN_POR_IGLESIA_Y_RENDIMIENTO.md`. Implementar el backend sobre el proyecto existente, manteniendo las funciones públicas. Claude Code realizará los cambios de interfaz contra la entrega de Codex.

Leer `AGENTS.md`, el contrato vigente, `docs/MEJORAS_FASE_2.md`, `docs/CATALOGO_FASE_2.md`, la documentación de administración y la última entrega pertinente de `docs/TAREAS.md`. Leer selectivamente y evitar repetir investigaciones o verificaciones ya cerradas salvo que los cambios las afecten.

Este documento sustituye la decisión anterior de tener únicamente una cuenta administradora global. También sustituye los umbrales anteriores de limitación del login. Actualizar las referencias contradictorias de los documentos activos; no borrar el historial de entregas.

## Estado conocido

- Frontend React/Vite; backend Express; PostgreSQL en Neon; Better Auth para autenticación administrativa.
- Existe una cuenta general y el acceso administrativo ya funcionó con una sesión real. No tratar Better Auth como una función aún inexistente.
- Las migraciones 009 y 010 fueron aplicadas por Miguel en Neon. Una consulta confirmó Yucatán 4 iglesias, Campeche 2 y Puebla 2. No repetirlas ni reejecutar 001–008.
- El selector de estados ya fue integrado por Claude y probado mediante lecturas contra la API real y Neon. La administración lista las ocho iglesias; su último recorrido con sesión real quedó pendiente.
- La revisión npm realizada desde la terminal de Miguel reportó cero vulnerabilidades en frontend y backend. Hay versiones posteriores de Better Auth y Router; no actualizarlas automáticamente por este documento.
- Las cuatro iglesias nuevas tienen secciones vacías o información por confirmar. La recopilación de historias, fotografías, santos y libros continúa como una tarea de contenido separada.

## 1. Acceso público y administrativo

Los visitantes consultan la web sin cuenta ni inicio de sesión. Mantener el sitio público y `/admin/login` como accesos separados dentro de la misma aplicación. No crear login, registro ni perfil para visitantes.

Todos los administradores utilizan el mismo formulario y los mismos endpoints de autenticación. La sesión determina su ámbito; el navegador no elige ni concede su propio rol o iglesia.

### Tipos de cuenta

- **Administrador general:** conservar la cuenta existente y su gestión global sobre las ocho iglesias.
- **Administrador parroquial:** una cuenta por iglesia, asociada a una sola iglesia. Gestiona únicamente su ámbito.
- Sin registro público. El alta inicial de cuentas parroquiales debe ser un proceso operativo controlado, reutilizando el mecanismo existente cuando sea posible. No agregar una interfaz de altas de usuarios ni recuperación por correo como funciones nuevas.

### Permisos acordados

| Recurso | Administrador parroquial | Administrador general |
| --- | --- | --- |
| Museo y biblioteca | Gestionar materiales de su iglesia con las operaciones existentes | Gestión global existente |
| Documentos privados | Leer únicamente los de su iglesia | Lectura global autorizada |
| Horarios de misa | Crear, modificar y borrar los de su iglesia según API existente | Gestión global existente |
| Actividades | Crear, modificar y borrar las de su iglesia según API existente | Gestión global existente |
| Teléfono parroquial | Modificar únicamente el teléfono de su iglesia | Gestión global existente |
| Trámites y requisitos | Solo consulta | Gestión global existente |
| Historia, descripción y otros datos de la iglesia | Solo consulta | Gestión global existente |
| Cuentas, roles y asignación de iglesia | Sin permiso | Sin nueva interfaz; provisión operativa controlada |

Gestionar museo y biblioteca significa reutilizar las operaciones ya disponibles; no añadir borrado de materiales, edición de páginas ni subida real de documentos si no existen en el contrato actual. La selección de PDF sigue simulada sin petición de upload ni almacenamiento de bytes.

## 2. Autorización obligatoria en servidor

Aplicar la sesión y el ámbito a cada lectura o escritura administrativa, incluido el lector privado. Ocultar opciones en el frontend no es control de acceso.

- Obtener la identidad, rol y asociación a iglesia desde datos confiables del servidor.
- Verificar la pertenencia del recurso a la iglesia autorizada aunque se consulte por UUID de material, documento, horario o actividad, sin slug en la URL.
- Rechazar intentos de modificar `iglesia_id`, rol, usuario, estado, ciudad u otros campos fuera de la lista permitida.
- En PATCH de iglesia de una cuenta parroquial admitir exclusivamente `telefono`. No ignorar silenciosamente campos prohibidos.
- Una sesión válida sin permiso sobre otra iglesia no debe devolver datos privados ni modificar filas. Usar el estado HTTP y formato de error definidos en el contrato, de forma coherente y sin filtrar datos internos.
- Una cuenta desactivada o cuya asignación cambie debe perder el permiso en las solicitudes siguientes; no confiar indefinidamente en datos antiguos de la sesión.
- Conservar la separación entre conexiones públicas y administrativas; no utilizar el propietario de Neon como conexión runtime.
- Mantener o adaptar los permisos SQL/RLS con el mínimo privilegio necesario. No afirmar aislamiento por usuario si el rol técnico compartido solo tiene políticas amplias: documentar qué garantiza la aplicación y qué garantiza PostgreSQL.

## 3. Modelo y migraciones

Inspeccionar las restricciones actuales de cuenta única: índice singleton de `auth_user`, reserva `administrador`, scripts de provisión y validaciones. Reutilizar las tablas existentes y preparar el cambio mínimo para conservar una cuenta general y asociar cada cuenta parroquial a su iglesia.

El modelo debe impedir asignaciones incoherentes y más de una cuenta parroquial por iglesia. Conservar IDs, hashes, sesiones válidas y contenido existente donde sea compatible; no reconstruir la base ni recrear la cuenta general.

Preparar una migración nueva posterior a 010 y un procedimiento de provisión revisable. No modificar migraciones ya aplicadas como si sus cambios fueran a actualizar Neon. No crear contraseñas por defecto ni cuentas con credenciales compartidas.

Este MD autoriza preparar e implementar los cambios locales necesarios de autenticación, permisos, esquema y pruebas. No autoriza ejecutar SQL remoto, cambiar credenciales reales ni crear cuentas remotas automáticamente. Entregar primero el SQL y los pasos concretos para su aplicación conforme a las reglas del proyecto.

## 4. Protección frente a intentos de login

Reutilizar el mecanismo persistente existente, sin implantar otro sistema paralelo.

### Decisión del usuario

- Tras **5 intentos consecutivos fallidos**, impedir nuevos intentos de esa cuenta durante **15 segundos**.
- Tras **10 intentos consecutivos fallidos**, impedir nuevos intentos de esa cuenta durante **2 minutos**.
- A partir del décimo fallo, mantener la espera de 2 minutos por cada nuevo intento fallido permitido, sin incrementar a bloqueos de días.
- No bloquear por MAC ni incorporar un baneo por IP. Sustituir el límite previo por IP de forma coordinada, sin eliminar las demás protecciones de autenticación.

### Semántica mínima para evitar ambigüedades

Aplicar el contador a la cuenta/correo normalizado en el servidor. Los rechazos ocurridos durante una espera activa no aumentan el contador ni prolongan la espera. Un login correcto reinicia la secuencia. Tras 15 minutos sin un nuevo fallo de credenciales, expirar la secuencia y limpiar el estado vencido de forma acotada.

Guardar el estado de forma atómica y persistente en PostgreSQL para que reinicios o varias instancias del despliegue no permitan saltarse el límite. No guardar IP ni contraseñas en estos contadores. Reutilizar HMAC de la clave del correo si ya está implementado.

Responder con 429 y `Retry-After` durante la espera. Mantener errores de credenciales genéricos, sin revelar si existe el correo, e idéntico comportamiento de limitación para entradas válidas de correos inexistentes. No bloquear cuentas mediante cambios permanentes de estado.

Estas esperas reducen los intentos contra una cuenta; no presentarlas como protección total frente a bots, ataques distribuidos o denegación de servicio. No añadir CAPTCHA, fingerprinting, servicios externos o detección avanzada de patrones en esta fase.

## 5. Urnas y nichos: información y contacto

Incluir «Urnas y nichos» dentro de «Trámites y celebraciones», reutilizando la presentación de guías. Mostrar requisitos confirmados y el teléfono de la parroquia, con el mensaje: «Consulta disponibilidad y condiciones directamente con la parroquia».

- Sin chat, reservas automáticas, pagos ni cantidad de urnas disponibles.
- Sin inventar precios, requisitos, teléfonos o disponibilidad.
- Las cuentas parroquiales pueden actualizar el teléfono de su iglesia; los requisitos son de consulta para ellas.
- El administrador general conserva la gestión informativa de las guías.
- Si el contrato y las restricciones SQL requieren un tipo nuevo, preparar una ampliación compatible para `urnas_nichos` y conservar los cuatro tipos anteriores. No renombrar ni sobrescribir una guía existente para evitar una migración.
- Preparar la guía vacía en estado «por confirmar» para cada iglesia cuando falte contenido, usando una carga idempotente y revisable.

Actualizar el contrato y dejar a Claude los campos/rutas para añadir la opción y el botón de llamada. No tocar frontend en esta entrega.

## 6. Credenciales y preparación para GitHub

El código no necesita cifrarse para subirlo a GitHub. Las contraseñas de usuarios deben seguir almacenadas mediante el hash que utiliza Better Auth; no inventar un cifrado propio.

- Verificar que `.env` y variantes con valores reales estén ignorados y no rastreados; `.env.example` debe contener solo ejemplos ficticios.
- Revisar código, SQL, documentación, pruebas, capturas seleccionadas y, si existe, el historial de Git para detectar credenciales sin imprimir sus valores.
- No pasar secretos al frontend ni a variables `VITE_*`. Mantener conexiones y secretos de sesión exclusivamente en backend y variables privadas del despliegue.
- Si hay exposición, informar solo del archivo o ubicación y del tipo de secreto; no reproducirlo.
- Las credenciales compartidas durante el desarrollo deben rotarse antes de publicar. Preparar el procedimiento sin ejecutar una rotación ni invalidar sesiones por cuenta propia.
- No subir a GitHub, hacer push ni desplegar como parte de esta tarea.

## 7. Lentitud al entrar a las opciones

Hacer esta revisión **después de terminar e integrar las funciones anteriores**. No suponer que localhost es la causa.

Primero medir una navegación representativa: entrada al interior, museo/biblioteca, horarios y trámites. Separar el tiempo de respuesta de la API del tiempo de carga/renderizado de la interfaz. Comparar primera petición y peticiones siguientes, sin exponer datos privados ni activar logs de secretos.

En backend, revisar conexiones/pool de PostgreSQL, reapertura de conexiones por solicitud, inicializaciones repetidas, comprobaciones de roles en cada consulta, consultas secuenciales innecesarias, consultas duplicadas y tamaño de respuesta. Revisar planes e índices solo si las mediciones señalan una consulta lenta. Considerar el arranque de Neon como hipótesis, no como diagnóstico confirmado.

Aplicar mejoras pequeñas justificadas por mediciones y conservar validación, sesión, CSRF y autorización. No cachear datos privados en respuestas públicas ni debilitar permisos para reducir tiempos. Cualquier caché debe considerar iglesia, ámbito y actualización/invalidez de permisos.

Si la causa es carga de imágenes, mapa o frontend, dejar un hallazgo concreto para Claude con la petición o pantalla afectada; no cambiar su diseño desde el backend. No añadir paquetes, servicios ni índices sin necesidad demostrada y las autorizaciones aplicables.

Entregar una comparación antes/después obtenida en condiciones similares y explicar las limitaciones de la medición. No afirmar «optimizado» solo porque compila. Si el entorno bloquea DNS o puertos, no repetir intentos indefinidamente: dejar el comando exacto para la terminal de Miguel y el diagnóstico pendiente.

## 8. Contrato, pruebas y entrega para Claude

Actualizar el contrato con rol/ámbito de sesión, permisos, códigos de error, limitación y nuevo tipo informativo. Mantener la compatibilidad pública salvo la ampliación documentada. Entregar a Claude instrucciones para mostrar la iglesia asignada, ocultar controles sin permiso, mostrar la espera de `Retry-After`, editar teléfono y presentar la guía de urnas.

Pruebas relevantes:

- Dos cuentas parroquiales de iglesias distintas: una no puede leer privados ni escribir recursos de la otra, incluso alterando slug/UUID/cuerpo.
- Cuenta general mantiene sus operaciones; cuenta parroquial no modifica requisitos, historia, roles ni asignación de iglesia.
- Desactivación o cambio de ámbito se respeta en la siguiente solicitud.
- Login: límites 5/15 s y 10/120 s, intento correcto, reinicio por inactividad y peticiones concurrentes. Usar reloj controlado, no esperas reales prolongadas.
- Rechazos durante la espera no la renuevan; errores no enumeran cuentas; persistencia entre instancias.
- SQL conserva cuenta general, datos de iglesias y documentos; permisos públicos y privados continúan correctos.
- Urnas: guía informativa con estado por confirmar y teléfono real o ausente, sin reservas ni carga de archivos.
- Pruebas públicas existentes y comprobaciones afectadas del backend. No afirmar que HTTP o Neon se comprobaron si el entorno los bloqueó.

## Orden y cierre

1. Inspeccionar el modelo existente y concretar el cambio mínimo de contrato y migración.
2. Implementar backend de cuentas por iglesia, permisos, teléfono, guía informativa y límite de intentos; ejecutar pruebas locales pertinentes.
3. Entregar SQL/provisión y contrato a Miguel y Claude. Registrar qué requiere aplicación remota, sin ejecutarla.
4. Tras integrar las funciones con Claude y verificar su funcionamiento, medir y corregir la lentitud.
5. Completar la revisión de secretos previa a GitHub y resumir pendientes de publicación.

Mantener las tareas acotadas; no crear subagentes ni repetir verificaciones ya aprobadas sin un cambio que lo justifique. Registrar cada entrega en `docs/TAREAS.md` con resultados ejecutados y pendientes. Priorizar un resumen breve y utilizable para evitar consumo innecesario de contexto.
