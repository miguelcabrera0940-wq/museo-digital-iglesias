import { pedir, USAR_MOCKS } from './cliente.js';

// Las cinco guías fijas del contrato (una por iglesia y tipo), en el orden en que se muestran.
export const GUIAS = [
  { tipo: 'bautizos', nombre: 'Bautizos' },
  { tipo: 'bodas', nombre: 'Bodas' },
  { tipo: 'misas_difuntos', nombre: 'Misas por difuntos' },
  { tipo: 'otros', nombre: 'Otros trámites' },
  { tipo: 'urnas_nichos', nombre: 'Urnas y nichos' },
];

// Orientación general (no son requisitos de ninguna parroquia): qué conviene preguntar en la oficina parroquial.
export const ORIENTACION = {
  bautizos: [
    'Qué documentos solicitan para registrar el bautizo y quién debe presentarlos.',
    'Si piden una plática o preparación previa a la familia o a los padrinos, y cómo inscribirse.',
    'En qué fechas y horarios se celebran los bautizos y si hace falta apartar la fecha.',
    'Días y horario de la oficina parroquial para entregar la documentación.',
  ],
  bodas: [
    'Qué documentación solicitan a cada persona y con cuánta anticipación conviene iniciar el trámite.',
    'Si piden pláticas o cursos de preparación, dónde se toman y cuánto duran.',
    'Fechas y horarios disponibles para la celebración y cómo se aparta una fecha.',
    'Días y horario de la oficina parroquial para entregar la documentación.',
  ],
  misas_difuntos: [
    'Cómo solicitar la misa y qué datos piden para anunciar la intención.',
    'Fechas y horarios disponibles, y con cuánta anticipación se pide.',
    'Días y horario de la oficina parroquial para hacer la solicitud.',
  ],
  otros: [
    'Cuál es el trámite que necesitas (por ejemplo, una constancia o un certificado) y a qué oficina corresponde.',
    'Qué documentación solicitan y cuánto tardan en entregarlo.',
    'Días y horario de la oficina parroquial para realizarlo.',
  ],
  urnas_nichos: [
    'Si la parroquia ofrece este servicio.',
    'Si hay disponibilidad y bajo qué condiciones.',
    'Qué documentación solicitan.',
    'Días y horario de la oficina parroquial para consultarlo.',
  ],
};

export const listarTramites = (slug) =>
  USAR_MOCKS
    ? import('../mocks/tramites.js').then((m) => m.tramitesDe(slug))
    : pedir(`/iglesias/${encodeURIComponent(slug)}/tramites`);
