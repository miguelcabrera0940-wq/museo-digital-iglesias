# Contexto definitivo — Iglesias

Responsable: Miguel Angel Cabrera Ayuso. Ruta local: /home/miguel/Proyectos/ProgrmacionUniversidadUTM/iglesias.

## Objetivo y entrega

Museo Digital y Archivo Histórico de Iglesias: web multiiglesia para explorar historia, libros y objetos, consultar misas, actividades y requisitos. Motivación: preservar información ante deterioro de libros. La beta usa documentos ficticios y contenido público con fuentes; no contiene archivos parroquiales sensibles reales. No habrá entrevista. No inventar aprobaciones institucionales.

La entrega previamente registrada es 6 noviembre 2026, pero el usuario fijó una ventana de trabajo de cuatro días el 24 octubre: planificar el desarrollo en cuatro jornadas y confirmar cualquier fecha formal distinta cuando sea necesario. No crear recordatorios ni automatizaciones por esta nota.

Presupuesto $0; herramientas aprobadas: JavaScript, React + Vite, CSS normal, React Router, fetch, Node.js + Express, PostgreSQL en Neon, Vercel Hobby para beta universitaria no comercial, Leaflet y OpenStreetMap. Cambio aprobado el 25 octubre 2026: Neon sustituye Supabase; el proyecto iglesias ya existe y solo está activada la base de datos. Administración aprobada con Better Auth 1.7.13 (sesión 8h, CSRF y límites persistidos); backend preparado y biblioteca instalada/probada localmente; login general real confirmado por Miguel; migraciones011–013 y altas parroquiales pendientes de autorización/aplicación remota. No activar Neon Auth. Ver ADMINISTRACION.md. No instalar drivers sin autorización. Respetar cuotas y atribución del proveedor de teselas; no prometer disponibilidad ilimitada. No tocar Medirecorda.

## Iglesias aprobadas

Ampliación aprobada el 30/10/2026: ocho iglesias en Yucatán, Campeche y Puebla, con las
mismas funciones y un administrador general y cuentas parroquiales controladas. Los supuestos de cuatro iglesias siguientes
corresponden al catálogo original de Mérida; los reemplaza el catálogo completo de
[CATALOGO_FASE_2.md](CATALOGO_FASE_2.md). Backend y migraciones preparados, sin SQL remoto.
Claude hará el selector de estado y la adaptación del frontend con el contrato actualizado.

### Registros conservados de Mérida

| Código Figma | Slug API/ruta | Nombre | Latitud | Longitud |
|---|---|---|---:|---:|
| cat | catedral | Catedral de San Ildefonso | 20.96715 | -89.62254 |
| jes | tercera-orden | Iglesia de Jesús o Tercera Orden | 20.96878 | -89.62240 |
| slu | santa-lucia | Iglesia de Santa Lucía | 20.97103 | -89.62192 |
| san | santa-ana | Iglesia de Santa Ana | 20.97650 | -89.62097 |

Todas están en Centro Histórico de Mérida, Yucatán, México. Puntos contrastados con fichas cartográficas basadas en edificios OSM; no son necesariamente entradas. Una revisión visual al implementar basta, sin reabrir selección.

Referencias: https://mapcarta.com/es/W31296521 , https://mapcarta.com/es/W1152562033 , https://mapcarta.com/es/W1299189422 , https://mapcarta.com/es/W1300216009 .

## Recorrido público aprobado

Sin cuenta. Mapa real de Mérida con calles/nombres, mover/acercar, marcadores filtrados por estado y «Cambiar de estado» (Yucatán inicial). Cada marcador/tarjeta abre su iglesia; «Entrar» lleva a fotografía interior con botones superpuestos. Mantener identidad y navegación de regreso.

Secciones interiores:
- Museo y Biblioteca Digital unidos. Selector simple «Libros y documentos» / «Objetos». Estantería de madera oscura, libros vistos de lomo. Elegir material abre ficha con imagen, descripción, «Leer» cuando tenga documento y «Regresar». Objetos sin documento muestran imagen/descripción.
- Lector antiguo abierto: imagen y texto, dos páginas visuales en escritorio y una en móvil si ayuda, arrastre complementario y botones grandes Anterior/Siguiente, extremos deshabilitados. Se puede implementar con páginas de ejemplo (sin OCR ni motor PDF obligatorio). No prometer que cualquier PDF se convierte automáticamente.
- Material privado en espacio público: solo título/descripción pública y portada permitida, candado y «Acceso reservado». Nunca cuerpo privado, páginas o archivo.
- Horarios y actividades: «Actividades de hoy», «Elegir otro día», fechas grandes. Separar misas recurrentes del día y actividades con fecha. Si no hay actividades, decirlo sin afirmar que no hay misas ni que está cerrado. Disponibilidad de visita solo como nota informativa.
- Trámites y celebraciones: cuatro folletos, bodas/bautizos/misas por difuntos/otros; requisitos, fuente si existe y teléfono. Sin reservas ni solicitudes personales.

## Administración

Página/rutas separadas del sitio público. Una cuenta general conserva gestión global; cada parroquial se limita a su iglesia. Mismo login/sesión de8h, ámbito vigente comprobado por servidor. Miguel confirmó login general real y catálogo009/010 aplicado. La ampliación parroquial011–013 está preparada localmente, sin aplicar en Neon. Contrato definitivo en CONTRATO_API.md; pasos y entrega en ADMINISTRACION.md. Sin contraseña por libro. No incluir credenciales reales ni contraseña de demostración en el código/arnés. No implementar autenticación propia ni activar servicios de identidad sin autorización.

Puede editar historia, descripción y teléfono; crear/editar fichas, categoría y visibilidad; crear/editar/eliminar horarios y actividades; editar requisitos. Categorías fijas compartidas en beta (no CRUD de categorías) para mantenerlo sencillo; seleccionar categoría en la ficha. Si el usuario exige categorías editables, acordar ese cambio antes de ampliar.

Biblioteca privada y lector dentro del área admin. Documento de ejemplo protegido entregado por backend. Autorización real obligatoria aunque el contenido sea ficticio.

Carga PDF SIMULADA incluida en beta: elegir archivo local, mostrar nombre/tamaño, confirmar con «Carga de demostración completada. El archivo no se guardó ni se envió», cancelar y reiniciar. No upload, Storage, persistencia de bytes ni endpoint de carga. No crear una entrada guardada que dé a entender almacenamiento real.

## Diseño y accesibilidad

Pergamino #F5EDDC, tinta #1F1A17, madera oscura #2E1B10, madera media #4A2C17, piedra #E7DDCB, vino #6E1F2B, dorado #B8892B como acento (evitar texto dorado sobre pergamino). Verificar contraste real.

Títulos Lora y cuerpo Inter si se dispone de fuentes reutilizables; alternativa local legible si no. Texto 18 px móvil/20 escritorio de referencia, controles mínimo 56 px y separación 12 px, foco visible, etiquetas claras. No depender solo de color, hover o arrastrar. Sin emojis ni decoración genérica excesiva. Fotos interiores con contraste suficiente bajo botones. No incluir notas de desarrollo dentro de pantallas públicas; ejemplos y carga simulada sí deben identificarse honestamente.

## Contenido y límites

No hay títulos concretos de libros ni fotografías licenciadas aprobadas. Crear ejemplos ficticios identificados, sin datos personales reales. Fuente/autoría para contenido público reutilizado; no asumir permiso por estar en internet. Teléfonos, horarios y requisitos aún no verificados: mostrar ejemplo o «Por confirmar», no datos oficiales inventados.

Sin recaudación, pagos, donaciones, contabilidad, reserva, registro público, datos sensibles, IA, GPS de visitante, buscador de mapas, rutas, app nativa o Graphify.

## Estado y fuentes de diseño

FigJam https://www.figma.com/board/J5HzMfnkZz8U8I7Qk3TpLK
Wireframes https://www.figma.com/design/9ZY7N8sXPPzoj8pjUMY7B4
Visual vacío https://www.figma.com/design/wSJO2dEmAgafmsFxVsXklF

Planeación consolidada; Figma parcialmente completo, MCP bloqueado por cuota. Wireframes previos de Catedral/Tercera Orden/Santa Lucía; falta Santa Ana y aplicar nuevas conexiones/privados/carga simulada. FigJam desactualizado; diseño visual no iniciado. PARCHE_GENERADOR_FIGMA.js preparado y no ejecutado. No condicionar programación a terminar Figma. Las reglas de este contexto prevalecen sobre los archivos históricos que hablen de contraseña por libro, carga exclusivamente futura, coordenadas antiguas o iglesias provisionales.

