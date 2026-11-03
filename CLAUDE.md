# Claude Code — Iglesias

Administración por iglesia aprobada: ver docs/ADMINISTRACION.md y contrato; interfaz según rol/iglesia de sesión, nunca concedidos por navegador.

Fase 2 aprobada (30/10/2026): ocho iglesias/ tres estados. Para selector y campos/rutas definitivos ver docs/CONTRATO_API.md y docs/CATALOGO_FASE_2.md; sustituye los supuestos previos de cuatro iglesias.

Ruta del usuario: /home/miguel/Proyectos/ProgrmacionUniversidadUTM/iglesias. Estas instrucciones se aplican al proyecto completo junto con AGENTS.md.

- Comunica siempre en español. Lee AGENTS.md, docs/CONTEXTO_PROYECTO.md y docs/RESUMEN_CONTINUIDAD_CLAUDE_CODE.md al iniciar; consulta docs/CONTRATO_API.md para implementar integraciones y docs/TAREAS.md para continuar. No releas todos los documentos en cada turno.
- Tu responsabilidad: frontend y estructura sencilla del proyecto. Codex implementará backend y base de datos. No escribas su implementación ni cambies unilateralmente el contrato de API.
- Usa JavaScript, React + Vite, CSS normal, React Router y fetch. BD en Neon, proyecto iglesias existente (decisión 25 octubre 2026). Better Auth de servidor aprobado y login confirmado por Miguel: no instalar clientes de identidad ni activar otro Auth. No añadas TypeScript, frameworks de estilos, gestores de estado globales ni herramientas arquitectónicas sin una necesidad concreta y autorización.
- Reutiliza una pantalla por función para las ocho iglesias mediante datos y slug. No generes aplicaciones por iglesia ni copias completas de los componentes.
- Primero propone una estructura breve y las dependencias exactas; espera autorización antes de instalar. Después trabaja por incrementos completos.
- Implementa el diseño directamente en el navegador usando las especificaciones del contexto. Figma está incompleto y bloqueado; no gastes llamadas intentando completar el diseño allí.
- Mocks solo temporales, aislados y explícitos. Nunca sustituir silenciosamente una API fallida por datos ficticios. El selector de PDF será una simulación permanente y deliberada de esta beta.
- Conservar autenticación y autorización de servidor ya aprobadas con Better Auth/Neon. Nunca guardes contraseñas en código, documentación o variables VITE. DATABASE_URL y credenciales PostgreSQL son exclusivamente del backend; nunca entregarlas al navegador.
- Antes de entregar un incremento, ejecuta las comprobaciones afectadas y revisa el resultado móvil/escritorio cuando puedas. Informa exactamente qué ejecutaste y qué no pudiste comprobar.
- Mantén docs/TAREAS.md con un resumen corto, cambios, verificaciones y siguiente paso. No ejecutes subagentes ni procesos paralelos; sin Graphify.

