# Entrega a Codex: teléfonos candidatos y trámites sin muestras (31 octubre 2026)

**Preparado localmente; NADA de esto está cargado en Neon.**

## 1. Trámites: quitar las muestras ficticias

Las 16 guías de Mérida (`bautizos`, `bodas`, `misas_difuntos`, `otros` × 4 iglesias) siguen en Neon con
`estado_verificacion:'ejemplo'` y requisitos «Ejemplo ficticio…». El frontend **ya no los muestra** (muestra la orientación
«Qué consultar antes de acudir»), pero conviene limpiarlos de la base.

- Lote: `backend/data/tramites-sin-muestras.json`, mismo formato que `carga-publica.json`; solo `requisitos:[]` y
  `estado_verificacion:'por_confirmar'`. No toca otras iglesias, urnas ni requisitos verificados (no existe ninguno).
- Vista previa local: `node backend/scripts/cargar-contenido.js --vista-previa --archivo backend/data/tramites-sin-muestras.json`
  → salida 0, 16 operaciones, huella `a60e2295f894615a6de7f1a70c1064be66b580a6223d7a225fcedb33ff15fb66`.
- Cargador existente, sin cambios de código. Comparar (solo lectura) antes de aplicar y aplicar una vez, con autorización.

## 2. Teléfonos: cambio mínimo de contrato

Archivo: `backend/data/telefonos-candidatos.json` (3 preparados, 5 excluidos con motivo). Preparados: Tercera Orden
(01 999 924 9712), Santa Lucía (01 999 923 1056), Santa Ana (01 999 928 5371); fuente: Diario de Yucatán 2019-01-19
(actualizado 2024-12-18), bloque de cada iglesia, URL en el archivo. **No se cargan como `telefono`** porque hoy la API
mostraría «Teléfono» como dato confirmado y no hay dónde guardar la fuente ni el aviso.

Cambio mínimo propuesto (decisión de Codex): añadir a Iglesia dos campos de solo lectura para público, editables por la
cuenta general: `telefono_estado` (`null | 'externo_pendiente' | 'confirmado'`) y `telefono_fuente` (string|null, ≤1000).
El cargador debe admitirlos. Con eso el frontend mostrará el número con «Número publicado en directorio externo; pendiente
de confirmar» y la fuente (cambio de frontend pequeño que haré cuando el contrato lo exponga). Hasta entonces `telefono`
sigue `null` («Por confirmar»).

Excluidos: Catedral de Mérida (contradictorio), Catedral de Puebla (ambiguo), La Compañía (compartido), Campeche (sin fuente).

## 3. Frontend ya hecho (sin datos locales ni mocks)

Tarjetas y fichas de objetos con fotografía, «Vista exterior» donde falta el interior, estado pendiente de objetos y
orientación de trámites. Verificado contra la API real en 3001 (lecturas). Ver TAREAS.md.
