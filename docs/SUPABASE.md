# Histórico: Supabase descartado

**NO EJECUTAR los pasos de este documento.** El 25 octubre 2026 Miguel aprobó PostgreSQL
en Neon y confirmó que iglesias ya existe, solo con BD activa. La guía vigente es
[NEON.md](NEON.md). Autenticación administrativa pendiente de adaptar; no configurar
claves, tablas de Auth ni proveedores siguiendo esta guía anterior.

El contenido siguiente se conserva como registro de la propuesta sustituida.

Estado: archivos preparados y comprobaciones locales descritas en TAREAS.md.
No se creó proyecto, ejecutó SQL remoto, configuró Auth ni conectó Express.
La API sigue leyendo `backend/data/`. Configurar variables **no la conecta todavía**.

## Archivos y orden de aplicación

1. `backend/sql/001_iglesias.sql`: tabla y cuatro iglesias aprobadas, sin historia
   verificada ni teléfonos inventados. Es el archivo existente, sin reescribirlo.
2. `backend/sql/002_modelo_completo.sql`: categorías, materiales, documentos, páginas,
   horarios, actividades, trámites, administrador, relaciones, validaciones, índices,
   RLS y permisos mínimos de servidor. Actualiza los permisos de iglesias del 001.
3. `backend/sql/003_semillas_ejemplo.sql`: 2 categorías, 36 materiales, 20 documentos,
   140 páginas, 58 horarios, 12 actividades y 16 guías. Administrador vacío.

Aplicar una sola vez, por orden, en SQL Editor del proyecto Iglesias como `postgres`,
**solo después de autorizar la ejecución remota**. Cada archivo tiene transacción.
No usar `IF NOT EXISTS`, `ON CONFLICT` ni borrar tablas para ocultar divergencias.
Si 001 ya se aplicó, verificar su estructura y cuatro registros y continuar por 002;
si hay cualquier diferencia, detener la migración y revisar, sin perder datos existentes.
Un fallo revierte ese archivo, no los archivos previamente confirmados.

Las semillas se pueden regenerar localmente, sin conectar a ninguna BD:

```sh
export PATH=/home/miguel/.nvm/versions/node/v24.21.0/bin:$PATH
node backend/sql/generar_semillas.js > backend/sql/003_semillas_ejemplo.sql
python3 backend/test/validar_sql_local.py
```

El generador conserva UUID de los datos actuales. Solo las descripciones de objetos
se adaptan en las semillas para decir «Historia de demostración», sin inventar historia.

## Modelo y protección

Cada material tiene `iglesia_id NOT NULL` y FK. Categoría/tipo compatibles:
libro/documento → libros-documentos, objeto → objetos. Un material tiene cero o un
documento; cada página pertenece a un documento y su número es único dentro de él.
En objetos, **descripcion_publica guarda su historia**, **imagen_publica su fotografía**
y **fuente su procedencia**. Son los campos existentes: no se añade `historia` al material.
Las descripciones y fotografías públicas deben aprobarse como aptas para publicación,
incluso para fichas privadas; no extraer resúmenes de notas o páginas privadas.

`bloqueado` y `tiene_documento` no se almacenan: Express los calcula. Si privado,
`bloqueado:true` y `tiene_documento:false`; el documento público da 403. Al consultar
páginas, revisar de nuevo la visibilidad actual del material. Las lecturas administrativas
requieren token válido y autorización global, con `Cache-Control: no-store`.

Las nueve tablas tienen RLS habilitada, sin políticas de acceso de navegador.
Se revocan permisos de PUBLIC, anon y authenticated. Ni siquiera un administrador
autenticado consulta negocio directamente desde el navegador: pasa por Express.
La clave secret del servidor utiliza service_role, que elude RLS; por tanto la
comprobación de administrador en Express es obligatoria, no la sustituye RLS.
Esta distinción sigue la [documentación de RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
y [claves de API](https://supabase.com/docs/guides/getting-started/api-keys).

Los GRANT de service_role permiten solo operaciones del contrato y columnas editables:
no mover materiales entre iglesias, cambiar slugs, administrar cuentas/categorías,
guardar páginas, subir documentos ni eliminar iglesias/materiales. La tabla
`administrador` admite como máximo un auth_user_id de `auth.users`; ninguna alta
Auth genera automáticamente esa fila. Crear ese vínculo es una operación manual aparte.
La marca interna `unico` solo impone la cuenta global; no amplía la respuesta de la API.

Documentos/páginas contienen texto ficticio protegido, sin enlaces estáticos ni bytes
de PDF. `imagen_url` en páginas queda null mediante CHECK en esta beta; las fotografías
de fichas usan imagen_publica. Ampliar a imágenes de páginas requerirá una ruta protegida
y una migración revisada. No crear buckets, Storage ni endpoints de upload.
La selección de PDF sigue siendo una simulación que no envía ni guarda archivos.

Horarios: día 0 domingo–6 sábado y hora local sin segundos. Actividades: fecha civil
y horas de America/Merida sin UTC, fin no anterior al inicio. El adaptador de datos debe
formatear `time` PostgreSQL `HH:mm:ss` como `HH:mm` al devolver la API. No filtrar horarios
por ausencia de actividades. Requisitos text[]: máximo 30, sin null/vacíos, 1000 caracteres
por elemento; todas las guías sintéticas tienen estado `ejemplo`.

## Crear el proyecto, cuando Miguel lo autorice

1. En el Dashboard de Supabase revisar organización **Free**, proyectos activos y cuota.
   El plan gratuito contempla dos proyectos activos según la [documentación de facturación](https://supabase.com/docs/guides/platform/billing-on-supabase).
   Confirmar cupo para Iglesias sin tocar Medirecorda. Si no hay cupo gratuito, detenerse;
   no pausar/borrar otros proyectos, contratar, activar pruebas de pago ni introducir tarjeta.
2. `New project`: organización Free, nombre `Iglesias`, contraseña de BD generada y guardada
   privadamente por Miguel, región disponible apropiada y plan Free. No add-ons ni dominio.
   Esperar estado listo y comprobar que el proyecto seleccionado es Iglesias.
3. Abrir SQL Editor y aplicar 001 → 002 → 003, solo tras autorización para ese proyecto.
   No ejecutar `backend/test/sql/validar_modelo.sql` en Supabase: usa fixtures de Auth locales.
4. Revisar conteos, RLS y grants mediante las consultas siguientes; guardar únicamente resultados
   sin secretos en TAREAS.md. Esto comprueba BD, no endpoints de Express ni acceso con JWT.

```sql
SELECT 'iglesias' AS tabla, count(*) AS filas FROM public.iglesias
UNION ALL SELECT 'categorias', count(*) FROM public.categorias
UNION ALL SELECT 'materiales', count(*) FROM public.materiales
UNION ALL SELECT 'documentos', count(*) FROM public.documentos
UNION ALL SELECT 'paginas', count(*) FROM public.paginas
UNION ALL SELECT 'horarios', count(*) FROM public.horarios
UNION ALL SELECT 'actividades', count(*) FROM public.actividades
UNION ALL SELECT 'tramites', count(*) FROM public.tramites
UNION ALL SELECT 'administrador', count(*) FROM public.administrador;

SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname='public' ORDER BY tablename;
SELECT * FROM pg_policies WHERE schemaname='public'; -- sin políticas de navegador
```

## Auth y único administrador, con autorización separada

1. Authentication → configuración de usuarios/proveedores: conservar email/contraseña,
   desactivar `Allow new users to sign up` y accesos anónimos. No introducir proveedores
   sociales, recuperación de contraseña, CAPTCHA, SMTP ni altas públicas en la beta.
   [Configuración oficial de Auth](https://supabase.com/docs/guides/auth/general-configuration).
2. Authentication → Users → Add user/Create user: crear manualmente la única cuenta de
   Miguel con las credenciales que él elija conforme a los requisitos mostrados; sin invitación
   por correo ni contraseña en código/SQL. Verificar su estado de confirmación para poder
   iniciar sesión. Esta operación no otorga privilegios de negocio por sí sola.
3. Copiar el UUID de ese usuario (no su contraseña/token). Tras revisar y autorizar el vínculo,
   sustituir el placeholder y ejecutar como postgres:

```sql
INSERT INTO public.administrador (auth_user_id)
VALUES ('UUID_AUTH_ADMIN_REVISADO'::uuid);
```

No incluir este INSERT en las semillas automáticas. La FK exige que el usuario exista;
la restricción única rechaza un segundo administrador. No hay endpoint para otorgar privilegios.

## Preparar variables y probar conectividad, después de autorizar configuración

1. En `Connect` obtener la URL del proyecto; en Settings → API Keys obtener la clave
   publishable y la secret exclusiva del servidor. Seguir los [tipos y cabeceras oficiales](https://supabase.com/docs/guides/getting-started/api-keys).
   No usar claves de Medirecorda. No compartir capturas ni pegar valores en TAREAS.md.
2. Desde backend, copiar `.env.example` a `.env` y editarlo localmente. Las tres variables
   son `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SECRET_KEY`.
   `.env` está ignorado. La clave secret no tendrá prefijo VITE_, no irá a frontend ni bundles.
   Para el futuro login, Claude configurará URL/publishable en el cliente Auth; la secret
   se mantiene solo en el entorno de Express. No se modificó frontend ahora.
3. Desde backend, con Node 24, prueba de lectura remota **pendiente de ejecutar**, sin imprimir claves:

```sh
node --env-file=.env --input-type=module <<'JS'
const { SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_PUBLISHABLE_KEY } = process.env;
for (const [rol, key] of [['servidor', SUPABASE_SECRET_KEY], ['visitante', SUPABASE_PUBLISHABLE_KEY]]) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/iglesias?select=id,slug&order=slug`, {
    headers: { apikey: key }, signal: AbortSignal.timeout(10000),
  });
  console.log(rol, 'HTTP', res.status);
  if (rol === 'servidor' && res.ok) {
    const filas = await res.json();
    console.log('Iglesias recibidas:', filas.length); // esperado: 4
  }
}
JS
```

Esperado: lectura servidor 200 con cuatro iglesias; visitante acceso denegado
(401/403). No interpretar un resultado exitoso como autorización de un administrador.
La key secret va en `apikey`; no es un JWT para `Authorization: Bearer`.

## Integración de Express pendiente de implementación

La preparación de BD no modifica los servicios actuales ni finge persistencia.
Para completar la conexión de la aplicación en el siguiente cambio:

1. Implementar el acceso a PostgREST desde servidor con `fetch` de Node (sin dependencias
   nuevas) usando URL/secret, o acordar el cliente si se necesita. Cargar variables con
   `node --env-file=.env src/server.js`. No degradar a datos locales si Supabase falla.
2. Sustituir lecturas de datos preincluidos en los servicios actuales por consultas de tablas
   con columnas explícitas, filtros seguros y orden estable; conservar el contrato y HH:mm.
   La ficha pública nunca debe incluir notas internas, documentos, páginas ni URLs privadas.
3. Implementar el middleware admin: recibir Bearer del usuario, verificarlo con Supabase Auth
   (`GET /auth/v1/user`, apikey publishable + Authorization Bearer del usuario), obtener su id
   validado y consultar administrador por auth_user_id usando el cliente de servidor.
   Token ausente/inválido: 401; válido sin fila: 403. No confiar en JWT decodificado sin verificar,
   rol, email, iglesia, permisos ni auth_user_id enviados por el navegador. No reutilizar el
   Bearer del usuario como credencial de consultas service_role ni aceptar filtros arbitrarios.
4. Proteger lecturas de documentos privados y escrituras antes de usar el secreto. Mantener
   una sesión Auth global para las cuatro iglesias, sin contraseñas por libro ni autenticación propia.
5. Ejecutar pruebas de permisos reales: visitante y usuario Auth no admin sin acceso directo
   a tablas/páginas, admin autorizado vía Express, lectura pública de privado 403 y admin sin
   token 401, cambio publico→privado inmediato, rechazos de campos y referencias inválidas.
   Confirmar que la simulación PDF no hace petición de upload ni guarda bytes o metadatos de carga.
6. Reiniciar API, comprobar todas las rutas con y sin sesión y dejar evidencia de resultados.
   Las pruebas HTTP locales actuales requieren sockets; pasar datos locales no prueba Supabase.

## Alcance de la validación local

`python3 backend/test/validar_sql_local.py` crea un clúster temporal PostgreSQL 17 y lo
ejecuta en modo single sin red ni sockets. Simula **solo localmente** auth.users y los roles.
Comprueba carga SQL/semillas, FK, unicidad, validaciones, singleton, grants y metadatos RLS.
No ejecuta funciones Auth reales. El modo single elude el filtrado de RLS, por lo que **no**
se certifican aquí sus efectos en sesiones normales, PostgREST, claves, JWT ni la API remota.
No instalar PostgreSQL para ejecutar esta prueba si no está disponible: registrar el bloqueo.
