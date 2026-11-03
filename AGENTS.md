# Reglas compartidas y Codex — Iglesias

## Contexto y límites

Proyecto del usuario: /home/miguel/Proyectos/ProgrmacionUniversidadUTM/iglesias. Presupuesto incremental de infraestructura: $0 usando únicamente los planes gratuitos aprobados dentro de sus cuotas. No contratar, activar pruebas de pago, introducir tarjeta ni comprar dominio. No publicar ni crear GitHub hasta que Miguel lo indique. Este arnés no inicia implementación ni instala dependencias.

Miguel dirige y autoriza cambios de alcance, gastos e instalaciones. Claude Code: frontend y estructura. Codex: backend, datos, API y validaciones. ChatGPT: asesoría y revisión. La planeación de funciones está aprobada; no volver a preguntar decisiones ya documentadas.

## Lectura eficiente

- Al iniciar, lee docs/CONTEXTO_PROYECTO.md, el contrato y el estado de tareas; en turnos siguientes consulta solo lo pertinente.
- Usa rg para encontrar símbolos y abre fragmentos acotados. No leas node_modules, .git, dist, build, coverage, logs, lockfiles completos ni secretos sin necesidad.
- No vuelques tokens, contraseñas, archivos .env ni cadenas de conexión en salidas. Un .env.example solo contendrá placeholders.
- No subagentes, Graphify, análisis masivos, capas ceremoniales ni servicios extra. Respuestas y resúmenes breves, cambios pequeños.
- No realices compactación o rewind manual sin autorización del usuario. Si la plataforma compacta automáticamente, continúa con el resumen y el estado guardado.

## Estructura mínima propuesta

Una raíz con frontend/, backend/ y docs/. No microservicios, monorepo tooling, contenedores, repositorios genéricos, CQRS ni abstracciones sin caso real. Reutiliza componentes existentes. La estructura queda sujeta a la inspección inicial de Claude; evita borrar archivos existentes.

## Trabajo de Codex

- JavaScript y Express; PostgreSQL en Neon (cambio aprobado el 25 octubre 2026; proyecto iglesias ya creado, solo BD activa). API de docs/CONTRATO_API.md. Preparar backend compatible con funciones Vercel, sin depender de un proceso permanente ni disco persistente.
- Frontend consume Express para datos del negocio. Better Auth 1.7.13 aprobado, una cuenta general existente y como máximo una parroquial por iglesia (modelo aprobado en docs/ADMIN_POR_IGLESIA_Y_RENDIMIENTO.md); no activar Neon Auth ni implementar otro sistema. Fase2 amplía a ocho iglesias según docs/MEJORAS_FASE_2.md y contrato vigente.
- Al adaptar autenticación, verificar identidad y ámbito vigente en servidor antes de privados/escrituras. Nunca confiar en rol enviado por navegador ni en ocultar botones. Conservar la cuenta general y verificar rol, asignación y activo=true en servidor; no crear cuentas de demostración.
- Un administrador general conservado y como máximo uno parroquial por iglesia. Sin altas públicas; provisión operativa controlada. No endpoint público para registrarlo, conceder privilegios o cargar archivos.
- No exponer tablas de negocio directamente al navegador. Habilitar RLS y usar rol PostgreSQL restringido de servidor; nunca el propietario de Neon en la aplicación. Credencial de BD solo como secreto de backend. Express conserva proyección pública y rechazo de documentos privados; admin, escrituras y lectura privada exigen sesión verificada y ámbito activo autorizado.
- Proteger documentos privados en todas las rutas; no incluirlos en public/, bundles, respuestas públicas o enlaces estáticos. Servir ejemplos privados desde backend tras validar sesión y administrador.
- Preparar SQL/migraciones y datos ficticios revisables. Pide autorización antes de ejecutar SQL contra una BD remota o cambiar esquema, políticas de acceso, secretos o configuración Auth. El diseño de sesiones y ámbitos del documento ADMIN_POR_IGLESIA_Y_RENDIMIENTO.md está aprobado; la solicitud se refiere a ejecutar cambios externos o alterar ese diseño.
- Pide autorización antes de instalar dependencias. Escoge el mínimo y aprovecha capacidades existentes. No cambia el contrato unilateralmente: si hace falta, explica el problema y actualiza de forma coordinada con Claude.
- Valida entradas, usa consultas parametrizadas/cliente seguro, restringe campos editables y tamaños de petición, devuelve errores consistentes y no expongas trazas internas.
- Evita rehacer autenticación propia. No implementar recuperación de contraseña ni registro público en beta. No introducir CAPTCHA, correo transaccional, pagos o analítica sin aprobación.

## Verificación y cierre

Ejecuta pruebas afectadas y suite completa disponible antes de integrar; build del frontend cuando corresponda. Prioriza pruebas significativas de permisos, acceso a privados, escrituras y validación. No escribas pruebas que solo repiten constantes o decoración. Nunca declares que pasaron si no las ejecutaste. Documenta cualquier bloqueo y riesgo real.

No elimines trabajo ajeno ni hagas operaciones Git destructivas. Mantén docs/TAREAS.md actualizado con evidencia breve. La carga de PDF se simula expresamente: no reemplazarla por carga real durante integración.

