# Arnés actualizado — Iglesias

Destino: `/home/miguel/Proyectos/ProgrmacionUniversidadUTM/iglesias`

Extrae el contenido del ZIP directamente en esa carpeta. CLAUDE.md, AGENTS.md y docs/ deben quedar en la raíz del proyecto, sin otra carpeta intermedia. El resumen de continuidad ya está incluido: no copies por separado una versión anterior. Si ya colocaste el arnés anterior, reemplaza solo los documentos equivalentes tras comprobar que no contienen cambios locales importantes; conserva código, secretos y otros archivos.

Este paquete contiene únicamente instrucciones y documentación. No instala ni ejecuta nada y no crea GitHub. Preparado para Debian; el entorno real se comprueba localmente.

## Primer mensaje a Claude Code

> Lee CLAUDE.md, AGENTS.md y docs/RESUMEN_CONTINUIDAD_CLAUDE_CODE.md; consulta el contexto y contrato según corresponda. Estás en el proyecto Iglesias. Inspecciona primero la carpeta sin sobrescribir trabajo existente. Verifica Node/npm, las versiones propuestas y su compatibilidad. Prepara una estructura mínima para el frontend y presenta las dependencias exactas una sola vez para autorizar su instalación si aún no están autorizadas en esta sesión. Después de autorización, completa el primer incremento: estilos, cliente de API, mapa real de Mérida, tarjetas e interior de las cuatro iglesias. Leaflet directo sin react-leaflet. Fuentes Lora/Inter locales con licencias o alternativa del sistema. Sigue el contrato y aísla mocks explícitos; no ocultes fallos de API. No implementes backend ni publiques. Sin Graphify ni subagentes. Registra resultados reales y la entrega a Codex en docs/TAREAS.md.

## Primer mensaje a Codex

> Lee AGENTS.md, docs/CONTEXTO_PROYECTO.md, docs/CONTRATO_API.md y el estado pertinente de docs/TAREAS.md. Tu responsabilidad es backend, base de datos, API y permisos. Inspecciona lo que dejó Claude y mantén su estructura; no cambies frontend ni contrato por tu cuenta. Verifica el entorno y presenta dependencias mínimas para autorizar la instalación. Luego prepara el backend local y SQL revisable. No ejecutes SQL remoto, cambies secretos o ajustes Auth externos sin autorización. PostgreSQL en Neon (proyecto iglesias existente), autenticación administrativa pendiente de adaptar, administrador global y documentos privados protegidos; carga PDF solo simulada, sin endpoint de upload. Presupuesto $0; sin publicar, Graphify ni subagentes. Deja verificaciones y siguientes pasos en docs/TAREAS.md.

## Coordinación

Claude implementa frontend/ y Codex backend/. Primero Claude establece la estructura; después Codex la inspecciona. No editar ambos documentos compartidos simultáneamente. Propuesta de puerto local backend: 3001, a registrar en TAREAS y proxy Vite; no es una dependencia externa. Usar mismo contrato y no copiar privados a public/.

El diseño visual pendiente se implementa directamente en navegador. Figma sigue incompleto; no es requisito volver a consultarlo. Las pruebas de producto todavía no se han ejecutado. Vitest sigue pendiente de autorización cuando se necesite; no confundir verificar el ZIP con probar la aplicación.

## Cambios de esta versión

- Resumen de continuidad incluido en docs/.
- Entorno Debian y comprobación real de Node.
- Versiones reportadas por Claude web tratadas como propuestas que deben verificarse, sin afirmar comprobaciones no realizadas.
- Autorizaciones de instalación explícitas sin atribuir al usuario una fecha/hora no comprobada.
- Mensajes de inicio para ambos agentes y traspaso de trabajo.

Se conservan el frontend aprobado, las cuatro iglesias y coordenadas, rutas API, administrador con una sola sesión, privados, PDF simulado, alcance sin economía y presupuesto $0.
