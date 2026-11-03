// DATOS DE DEMOSTRACIÓN. Solo se cargan con VITE_USAR_MOCKS=true; el backend aún no tiene este endpoint.
// Esquema de CONTRATO_API v1 (Trámite). Los requisitos son ficticios: estado_verificacion 'ejemplo'. Se retiran en la integración.
import { ErrorApi } from '../api/cliente.js';
import { IGLESIAS } from './iglesias.js';

const GUIAS = {
  bautizos: ['Guía de bautizos', ['Acta de nacimiento de la persona que se bautiza (ejemplo)', 'Datos de madre, padre y padrinos (ejemplo)', 'Plática previa con la parroquia (ejemplo)']],
  bodas: ['Guía de bodas', ['Actas de nacimiento de ambas personas (ejemplo)', 'Constancias de bautismo y confirmación (ejemplo)', 'Cursos o pláticas prematrimoniales (ejemplo)', 'Dos testigos por cada persona (ejemplo)']],
  misas_difuntos: ['Guía de misas por difuntos', ['Nombre de la persona fallecida (ejemplo)', 'Fecha y hora que se desea, sujeta a disponibilidad (ejemplo)']],
  otros: ['Guía de otros trámites', ['Constancias y certificados: consultar el documento solicitado (ejemplo)', 'Identificación de quien solicita (ejemplo)']],
  urnas_nichos: ['Guía de urnas y nichos', ['Constancia o datos del fallecimiento (ejemplo)', 'Consultar disponibilidad y condiciones con la parroquia (ejemplo)']],
};

export function tramitesDe(slug) {
  const c = IGLESIAS.findIndex((i) => i.slug === slug);
  if (c < 0) throw new ErrorApi(404, { code: 'NOT_FOUND', message: 'No se encontró la iglesia.' });
  const lista = Object.entries(GUIAS).map(([tipo, [titulo, requisitos]], k) => ({
    id: `40000000-0000-4000-8000-${String(c * 10 + k).padStart(12, '0')}`,
    iglesia_id: IGLESIAS[c].id,
    tipo,
    titulo,
    requisitos: c >= 4 ? [] : requisitos,
    fuente: null,
    estado_verificacion: c >= 4 ? 'por_confirmar' : 'ejemplo',
  }));
  // Solo para probar los estados de la pantalla (no representan datos reales):
  if (slug === 'santa-ana') Object.assign(lista[3], { requisitos: [], estado_verificacion: 'por_confirmar' }); // sin requisitos
  if (slug === 'santa-lucia') lista.splice(3, 1); // falta la guía «otros»
  return lista;
}
