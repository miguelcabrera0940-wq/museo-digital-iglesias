# Investigación de contenido público — ocho iglesias (31 octubre 2026)

Preparado por Claude Code. **No se cambió Neon, código ni contenido publicado.** Lote estructurado:
`backend/data/investigacion-contenido.json` (53 hallazgos, 9 fuentes, cada uno con iglesia, slug, valor,
nivel, URL, institución, fechas y observaciones). Sin contactar a nadie.

## Conclusión

**No hay ningún dato oficial nuevo** sobre teléfono parroquial, horarios ordinarios ni requisitos.
Las parroquias y diócesis consultadas no los publican en páginas accesibles: el sitio de la Arquidiócesis
de Yucatán solo trae su propio teléfono (9247777) y su directorio no cargó; no hallé sitio de la Diócesis de
Campeche ni de la Arquidiócesis de Puebla abierto (403/ sin resultados); Facebook no es accesible.
Lo encontrado es **secundario** (prensa y directorios privados) y por eso queda como «Por confirmar».
Codex no debe cargar nada de esto sin confirmación de Miguel o de la parroquia.

## 1. Datos respaldados por fuente oficial

| Dato | Valor | Fuente |
|---|---|---|
| Dirección de la arquidiócesis | Calle 60, Centro, 97000 Mérida | [S2](https://arquidiocesisdeyucatan.org.mx/catedral-de-merida/), Arquidiócesis de Yucatán, publicada 12/10/2016, consultada 31/10/2026 |
| Teléfono 9247777 | **Es de la arquidiócesis, no de la parroquia**: aparece igual en todas sus páginas | S2 |

## 2. Referencias secundarias (orientativas, no cargar)

**Teléfonos**

| Iglesia (slug) | Número | Fuente / observación |
|---|---|---|
| Catedral Mérida (`catedral`) | 01 999 255 8622 | [S1](https://www.yucatan.com.mx/imagen/2019/01/19/a-que-hora-hay-misa-en-el-centro-de-merida.html), Diario de Yucatán, 2019 (actualizada 12/2024). Listado de prensa |
| Jesús / Tercera Orden (`tercera-orden`) | 01 999 924 9712 | S1 («Rectoría El Jesús Tercera Orden») |
| Santa Lucía (`santa-lucia`) | 01 999 923 1056 | S1 (aparece en sus dos entradas) |
| Santa Ana (`santa-ana`) | 01 999 928 5371 | S1 |
| Catedral Puebla (`catedral-puebla`) | 222 232 3803 / 222 232 2316 | [S4](https://www.misas.info/) y [S3](https://weekdaymasses.org.uk/en/area/puebla/churches), directorios privados; no se sabe si es la oficina de la Catedral o la del Sagrario |
| La Compañía (`la-compania`) | 222 232 2375 | S4; el mismo número aparece en otra iglesia: posible error |
| Catedral Campeche, Dulce Nombre | — | Sin fuente. Los 891 816 0339 / 981 816 2524 son del archivo histórico diocesano, no de la catedral |

Un extracto de búsqueda atribuyó 923 1056 a la Catedral; al abrir S1 pertenece a Santa Lucía. Se descartó el extracto.

**Horarios ordinarios** (todos «Por confirmar»; S1 admite cambios por fiestas)

- Catedral Mérida (S1): lun–sáb 7:00, 8:15, 9:30, 11:15, 17:15, 18:30; dom 7:00, 8:15, 9:00 (inglés), 10:00, 11:00, 12:00, 13:00, 17:00, 18:30.
- Tercera Orden (S1): mar–vie 7:30 y 19:00; sáb solo bodas; dom 9:00, 10:30 (maya) y 12:00. Erratas y una línea sin días.
- Santa Lucía (S1): **dos bloques contradictorios** (mar–vie 18:30, sáb 18:00, dom 8:50 y 11:00 / lun–sáb 18:00, dom 9:00 y 10:00). No se eligió uno.
- Santa Ana (S1): mar–sáb 9:00 y 19:00; dom 11:00, 17:00 y 19:00.
- Catedral Puebla (S3, confirmado por S4): lun–vie 8, 9, 12, 19; sáb 8, 9; dom 8, 9, 10, 12, 13, 14, 18, 19.
- La Compañía (S4): lun–vie 12:00 y 19:00; otra línea sin días. Incompleto.
- Campeche (ambas): sin fuente.
- Los horarios de fin de año de [S5](https://www.poresto.com/yucatan/merida/2025/12/30/misas-de-ano-nuevo-en-merida-horarios-en-la-catedral-y-otras-iglesias-de-la-ciudad.html) (PorEsto!, 30/12/2025) son **celebraciones especiales** y no sustituyen los ordinarios.

**Requisitos**

- Solo existe una lista para **bodas en la Catedral de Mérida**, en una nota de prensa ([S6](https://www.poresto.com/yucatan/merida/2026/2/14/catedral-de-merida-sera-sede-de-una-boda-en-san-valentin-la-novia-revela-los-detalles.html), 14/02/2026) que no cita fuente: certificados de bautismo y confirmación, pláticas prematrimoniales, acta civil, identificación, presentación con dos testigos, y empezar seis meses antes. Costos y plazos son testimonio de una novia ([S7](https://www.poresto.com/yucatan/merida/2025/8/11/-yucateca-revela-cuanto-cuesta-casarse-en-la-catedral-de-merida-.html)). **No se copió a ninguna otra iglesia.**
- Bautizos, misas por difuntos y urnas/nichos: nada publicado hallado para ninguna iglesia. Ni disponibilidad ni precios de urnas.

## 3. Fotos interiores y objetos

- Fotos interiores pendientes: **Santa Ana y Dulce Nombre de Jesús** (sin foto libre en Commons).
- Objetos: 10 de 16 ya preparados en `backend/data/objetos-museo.json` (ver `docs/OBJETOS_MUSEO.md`). Sin hallazgo nuevo: Santa Lucía y Santa Ana (0), una pieza más de Tercera Orden y de Dulce Nombre de Jesús. Descartados en la Catedral de Mérida: Cristo de las Ampollas (la imagen original se destruyó en 1915; [S9](https://www.yucatan.com.mx/imagen/2026/09/18/el-santo-cristo-de-las-ampollas-patrimonio-de-fe-y-arte-en-yucatan.html) no aclara cuál se venera hoy) y Cristo de la Unidad (sin foto libre identificable). La pila bautismal y el confesionario de la Catedral tienen foto libre pero ninguna fuente que los describa.

## 4. Pendientes y paso siguiente

1. Confirmar por llamada o visita (lo hace Miguel o la parroquia, yo no contacté a nadie) teléfono, horarios y requisitos de las ocho parroquias; con eso, Codex puede integrar solo lo confirmado.
2. Revisar la Facebook oficial de cada parroquia (inaccesible desde aquí) y los sitios de las diócesis de Campeche y Puebla.
3. Si Miguel acepta datos secundarios, mostrarlos con aviso «según referencias no oficiales» y fecha; no recomiendo hacerlo para teléfonos.
