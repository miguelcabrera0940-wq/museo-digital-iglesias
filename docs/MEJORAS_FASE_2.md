# Mejoras de fase 2 — Museo Digital de Iglesias

## Propósito y uso

Decisiones aprobadas por Miguel el 30 de octubre de 2026. Colocar este archivo en `docs/MEJORAS_FASE_2.md` dentro del proyecto existente. Es un complemento del arnés actual, no un proyecto nuevo.

Antes de trabajar, leer `AGENTS.md`, `CLAUDE.md`, el contrato vigente y la última entrega pertinente de `docs/TAREAS.md`. Si las instrucciones anteriores limitan el sistema a cuatro iglesias de Mérida, esta fase amplía ese alcance a ocho iglesias en tres estados. Actualizar los documentos afectados de forma coordinada, sin mantener instrucciones contradictorias.

## Reparto del trabajo

- Claude Code: frontend, diseño y contenido público investigado con fuentes.
- Codex: backend, adaptación del modelo y API, migraciones y carga de datos.
- Miguel: decisiones de alcance y autorizaciones que exijan las reglas del proyecto.
- No editar simultáneamente documentos compartidos. Registrar cada entrega y los pendientes en `docs/TAREAS.md`.

## 1. Selector de estado

Reemplazar el botón «Ver las cuatro iglesias» por «Cambiar de estado».

Al activarlo se muestra un menú accesible con Yucatán, Campeche y Puebla. Al seleccionar un estado:

1. Actualizar la lista para mostrar solamente sus iglesias.
2. Ajustar el mapa para incluir todos sus marcadores.
3. Limpiar la iglesia seleccionada del estado anterior y cerrar su ficha.
4. Mostrar claramente el estado activo y cerrar el menú.

Yucatán será la selección inicial. El menú debe funcionar con clic, toque y teclado, mostrar foco visible y cerrarse con Escape. En móvil debe ser fácil de utilizar y no tapar permanentemente el mapa.

Reutilizar Leaflet y OpenStreetMap ya existentes. Mantener una instancia del mapa y cambiar sus datos/vista cuando corresponda; no añadir otro proveedor ni cargar mapas independientes por estado. Conservar la atribución cartográfica.

## 2. Iglesias elegidas

Mínimo dos iglesias por estado. La selección aprobada suma ocho:

| Estado | Ciudad | Iglesia | Latitud | Longitud |
| --- | --- | --- | --- | --- |
| Yucatán | Mérida | Catedral de San Ildefonso | Conservar registro actual | Conservar registro actual |
| Yucatán | Mérida | Iglesia de Jesús o Tercera Orden | Conservar registro actual | Conservar registro actual |
| Yucatán | Mérida | Iglesia de Santa Lucía | Conservar registro actual | Conservar registro actual |
| Yucatán | Mérida | Iglesia de Santa Ana | Conservar registro actual | Conservar registro actual |
| Campeche | San Francisco de Campeche | Catedral de Nuestra Señora de la Purísima Concepción | 19.84619 | -90.53616 |
| Campeche | San Francisco de Campeche | Templo del Dulce Nombre de Jesús | 19.84499 | -90.53574 |
| Puebla | Puebla de Zaragoza | Catedral de Puebla | 19.04285 | -98.19839 |
| Puebla | Puebla de Zaragoza | Templo del Espíritu Santo (La Compañía) | 19.04257 | -98.19540 |

Santo Domingo de Puebla quedó descartado y no debe incorporarse. Coordenadas de La Compañía contrastadas el 30/10/2026: punto cartográfico del edificio, no una entrada validada; fuentes y límites en docs/CATALOGO_FASE_2.md. No confundirla con otras localidades o templos del mismo nombre. Las coordenadas cartográficas anteriores sirven como referencia de implementación; revisar visualmente los marcadores sobre los edificios.

### Fuentes de ubicación

- Catedral de Campeche: https://mapcarta.com/W160092168
- Dulce Nombre de Jesús: https://mapcarta.com/W552205116
- Ubicación del Dulce Nombre de Jesús, INAH: https://catalogonacionalmhi.inah.gob.mx/consulta_publica/detalle/2226
- Catedral de Puebla: https://mapcarta.com/W1113187115
- La Compañía, INAH: https://catalogonacionalmhi.inah.gob.mx/consulta_publica/detalle/54277
- La Compañía, registro cartográfico para contrastar: https://mapcarta.com/W525267034

## 3. Mismas funciones para las ocho iglesias

La decisión más reciente reemplaza la idea inicial de que las cuatro iglesias nuevas solo serían referencias en el mapa. Todas deben poder utilizar las mismas funciones existentes:

- Marcador, ficha y acceso al interior.
- Historia, fotografías y fuentes.
- Museo y biblioteca: categorías, materiales, fichas y lector.
- Horarios de misa y actividades por fecha.
- Trámites y celebraciones.
- Gestión desde la cuenta administradora global y lectura autorizada de documentos privados.

Reutilizar componentes, rutas parametrizadas, validaciones y permisos. No duplicar pantallas por iglesia ni introducir clases o herencia solo para esta ampliación. Tener las mismas funciones no significa inventar contenido: las secciones sin datos deben mostrar sus estados vacíos o «Por confirmar».

### Adaptación del backend

Inspeccionar antes de editar: existen restricciones y supuestos sobre cuatro iglesias, tanto en SQL como en validaciones, datos y administración. No asumir que basta añadir cuatro entradas al frontend.

Preparar el cambio mínimo para representar estado y ciudad, asociar cada iglesia y permitir filtrar/listar por estado. Definir los slugs únicos de las nuevas iglesias y documentar la ampliación del contrato antes de integrarla. Conservar IDs y slugs de Mérida y la compatibilidad de sus rutas existentes.

Las migraciones nuevas deben conservar datos, relaciones y permisos. No volver a ejecutar migraciones iniciales ni borrar tablas para ampliar el catálogo. Revisar también el selector administrativo y cualquier comprobación que limite la cuenta global a cuatro iglesias. Mantener separados los roles de acceso público y administrativo.

## 4. Mejora visual del frontend

Usar la skill Impeccable ya instalada y el diseño existente como punto de partida. Buscar una presentación más cuidada, con identidad de museo histórico y buena jerarquía visual.

- Mejorar composición, espacios, tipografía, navegación y presentación de fotografías.
- Conservar la estantería de libros y el lector con su identidad visual.
- Mantener textos legibles, contraste suficiente, controles cómodos y navegación sencilla para adultos mayores.
- Revisar móvil y escritorio; evitar desbordamientos y elementos que oculten acciones.
- Evitar animaciones costosas, decoración excesiva y nuevas dependencias de diseño.

La mejora debe verse en las pantallas reales; no limitarse a cambiar un borde o aumentar un título. Conservar los flujos y la seguridad ya implementados.

## 5. Textos de los libros públicos

Revisar los títulos y páginas actuales para completar contenido coherente con cada libro público. Primero elaborar un inventario breve de lo disponible y lo que falta.

- Para textos reales, registrar autor, fuente y condiciones de reutilización; usar dominio público, licencia compatible o autorización.
- Si el material es una guía redactada para el proyecto, identificarla como elaboración propia con sus fuentes. No presentarla como transcripción de un libro histórico.
- No inventar documentos parroquiales, archivos secretos, hechos históricos ni la pertenencia de objetos a una iglesia.
- Conservar la identificación de ejemplos cuando corresponda y no convertirlos automáticamente en contenido verificado.
- No publicar páginas ni información interna de materiales privados.
- Preparar una carga revisable que respete el formato del lector y evite duplicados. Inspeccionar las capacidades del cargador existente: puede requerirse un procedimiento distinto para documentos y páginas.

## Límites que continúan vigentes

- React, Vite, CSS normal, Router, fetch, Leaflet, Express y PostgreSQL en Neon siguen siendo la base del proyecto.
- Una cuenta administradora global; sin registro público ni contraseñas por libro.
- La selección de PDF sigue siendo una simulación: no subir ni almacenar archivos.
- Sin pagos, donaciones, contabilidad ni reservas automáticas.
- El apartado de urnas queda fuera de esta fase.
- No inventar teléfonos, horarios, requisitos o disponibilidad; dejar lo desconocido por confirmar.
- Fotografías reales con permisos o licencias compatibles y atribuciones conservadas.
- No instalar dependencias, cambiar secretos ni ejecutar migraciones remotas fuera de las autorizaciones aplicables del proyecto.
- Nunca incluir credenciales en código, documentos, capturas o entregas.

## Orden de ejecución

1. Revisar el proyecto actual y localizar los supuestos de cuatro iglesias.
2. Completar la coordenada pendiente y acordar el cambio mínimo de modelo/contrato para estados y nuevas iglesias.
3. Codex prepara backend, migración y datos; Claude implementa el selector contra el contrato acordado.
4. Confirmar que las ocho iglesias pueden usar los mismos flujos y que cada estado filtra correctamente.
5. Mejorar el diseño y completar los textos públicos mediante entregas acotadas.
6. Ejecutar las comprobaciones pertinentes, registrar resultados y dejar preparado GitHub/despliegue como siguiente etapa.

## Criterios de aceptación

- «Cambiar de estado» sustituye el botón anterior y ofrece exactamente los tres estados aprobados.
- Yucatán muestra cuatro iglesias; Campeche dos; Puebla dos, con La Compañía en lugar de Santo Domingo.
- Mapa, lista y ficha se mantienen sincronizados al cambiar de estado.
- Las ocho iglesias utilizan los flujos existentes; los datos ausentes se indican sin inventarlos.
- Administración permite seleccionar las ocho iglesias y mantiene el aislamiento de sus datos.
- Los documentos privados siguen bloqueados para visitantes y accesibles solo mediante autorización del servidor.
- Los textos públicos tienen procedencia y los ejemplos siguen identificados.
- Build y pruebas pertinentes ejecutados; revisión visual y de interacción en móvil/escritorio. Indicar expresamente lo que no se pudo verificar.
- La ampliación no añade solicitudes repetidas innecesarias ni carga todas las fotografías y documentos al abrir el mapa.

## Entrega requerida a cada agente

Resumen breve: cambios hechos, archivos principales, comprobaciones realmente ejecutadas y pendientes concretos. Actualizar `docs/TAREAS.md` y los documentos afectados sin reescribir toda la historia del proyecto.
