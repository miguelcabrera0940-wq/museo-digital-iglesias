# Lote de objetos del museo — entrega de Claude a Codex (31 octubre 2026)

**Aplicado en Neon por Codex (31/10/2026)**: proyecto divine-wildflower-50337376,
production/neondb,10 piezas nuevas y8 muestras retiradas sin borrado. Comparación y verificación
posterior de datos completadas. **Verificación final READ ONLY con iglesias_api aprobada**:
10 objetos públicos,0 retirados visibles,8 documentos/32 páginas y0 documentos privados;
sin acceso a notas internas. API HTTP local y revisión visual pendientes por EPERM.
Evidencia en TAREAS.md. No repetir la carga.
Archivo: `backend/data/objetos-museo.json`.
Imágenes en `frontend/public/imagenes/` con créditos en `ATRIBUCIONES.md` y `creditos.html`.
Los ocho cuadernos ya cargados no se tocaron.

## Contenido (10 objetos; objetivo era 16)

| Iglesia | Objetos confirmados | Foto |
|---|---|---|
| catedral | Cruz del atrio; Placa de la erección de la arquidiócesis | CC0; CC BY 2.0 |
| tercera-orden | Piedra labrada maya en el muro (1 de 2) | Dominio público |
| santa-lucia | **Ninguno** | — |
| santa-ana | **Ninguno** | — |
| catedral-campeche | Altar mayor y tabernáculo de plata; Portada principal | CC BY-SA 4.0; CC BY 4.0 (foto ya publicada) |
| dulce-nombre-jesus | Espadaña con campanas (1 de 2, descripción mínima) | CC BY-SA 4.0 |
| catedral-puebla | Altar de los Reyes; Altar mayor y ciprés | CC BY-SA 4.0 ×2 |
| la-compania | Lápida de Catarina de San Juan; Ábside y altar mayor | CC BY-SA 4.0 ×2 |

Faltantes: Santa Lucía y Santa Ana (sin pieza documentada con fotografía libre del propio templo),
una pieza más de Tercera Orden y del Dulce Nombre de Jesús. Cristo de la Unidad y Cristo de las
Ampollas (Catedral de Mérida) se descartaron: sin fotografía libre identificable y, para el Cristo
de las Ampollas, fuentes ambiguas sobre cuál imagen está hoy en la capilla (la original se destruyó en 1915).
Fotos interiores: **siguen pendientes Santa Ana y Dulce Nombre de Jesús** (no hay en Commons).

## Formato (mismo estilo que los cuadernos)

Cada elemento de `objetos`: `clave` (estable, única), `slug_iglesia`, `tipo:"objeto"`,
`categoria_id:"objetos"`, `titulo`, `descripcion_publica` (descripción + historia breve, como indica
CARGA_CONTENIDO.md), `imagen_publica` (ruta `/imagenes/…jpg`), `fuente` (fuentes + crédito de la foto),
`es_ejemplo:false`, `clase_contenido:"objeto_patrimonial"` y `creditos_imagen` (informativo).

## Lo que el contrato/cargador no soporta hoy (cambio necesario)

1. **Crear materiales y marcar `es_ejemplo:false`**: `cargar-contenido.js` solo actualiza UUID existentes y solo admite `es_ejemplo:true`. Hace falta un cargador análogo a `cargar-cuadernos.js` para `objetos-museo.json`.
2. **Identidad estable sin duplicados**: UUID determinista por `clave` (p. ej. namespace `iglesias/objeto-museo/v1`); repetir la carga no debe duplicar ni reescribir filas iguales. Abortar si el UUID existe como privado, de otra iglesia o con metadatos incompatibles.
3. **Créditos por imagen**: no hay campo; van dentro de `fuente`. `creditos_imagen` no se carga.
4. Validar que `imagen_publica` exista como archivo, no sea PDF/HTML y sea ruta `/imagenes/`, como en 014.

## Objetos ficticios públicos a sustituir (sin borrar)

Los siembra 003 solo en las cuatro iglesias de Mérida: `Cáliz de ejemplo` y `Campana de muestra`
(tipo objeto, público, `es_ejemplo:true`; 8 filas, offsets 006/007, 106/107, 206/207, 306/307 por
el patrón de CARGA_CUADERNOS.md — **confirmar por título/iglesia contra Neon**). Las otras cuatro
iglesias no tienen objetos de muestra. Recomendación, igual que con los cuadernos: marcarlos
`retirado_publico=true` solo si siguen coincidiendo con su contenido de demostración; conservar
filas, documentos y visibilidad. **No tocar** `Pieza reservada de ejemplo` (privada) ni otros materiales.
Santa Lucía y Santa Ana quedarían sin objetos públicos (la pantalla muestra «Todavía no hay objetos»);
si se prefiere conservar sus muestras con la etiqueta de ejemplo hasta tener piezas reales, es decisión de Miguel.

## Aplicación (única, por Neon MCP)

Ya realizada: **no repetir esta carga ni ejecutar migraciones**. El cargador existente
scripts/cargar-cuadernos.js ahora también reconoce el lote de objetos mediante --archivo;
comparte UUID determinista y validación de imágenes, con lógica específica en src/carga-objetos.js.
Créditos se contrastan con fuente, ATRIBUCIONES.md y creditos.html. El esquema014 basta.
Identidad por clave: namespace iglesias/objeto-museo/v1; sin documentos/páginas para las piezas.
El modo --vista-previa no conecta y --comparar es READ ONLY; --aplicar exige huella del archivo.
Huella cargada:2385233929c62b9e93d4b0b3a7bcd3a72828ad986e81c28d034e3d28e8a92d59.

Comparar primero (solo lectura), aplicar en una transacción SERIALIZABLE con guardia de huella,
verificar tras COMMIT conteos, igualdad exacta contra el lote y que cuadernos/privados/objetos ajenos
no cambiaron. Sin DELETE. No requiere cambios de frontend.
