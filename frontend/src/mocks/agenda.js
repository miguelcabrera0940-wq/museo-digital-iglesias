// DATOS DE DEMOSTRACIÓN. Solo se cargan con VITE_USAR_MOCKS=true; el backend aún no tiene estos endpoints.
// Esquema exacto de CONTRATO_API v1 (Horario y Actividad), todo `es_ejemplo: true`. Se retiran en la integración.
import { ErrorApi } from '../api/cliente.js';
import { IGLESIAS } from './iglesias.js';
import { diaSemana, esFechaValida } from '../fechas.js';

const idDe = (c, k) => `30000000-0000-4000-8000-${String(c * 1000 + k).padStart(12, '0')}`;
const iglesiaDe = (slug) => {
  const c = IGLESIAS.findIndex((i) => i.slug === slug);
  if (c < 0) throw new ErrorApi(404, { code: 'NOT_FOUND', message: 'No se encontró la iglesia.' });
  return [c, IGLESIAS[c]];
};

export function horariosDe(slug) {
  const [c, iglesia] = iglesiaDe(slug);
  if (c >= 4) return []; // iglesias nuevas: sin horarios inventados
  const tarde = ['19:00', '18:30', '18:00', '17:30'][c];
  const lista = [];
  const agregar = (dia, hora, nota = null) =>
    lista.push({ id: idDe(c, lista.length), iglesia_id: iglesia.id, dia_semana: dia, hora, nota, es_ejemplo: true });
  for (let dia = 1; dia <= 6; dia++) {
    if (c === 2 && dia === 1) continue; // Santa Lucía sin horario los lunes: prueba el estado «sin horario habitual»
    agregar(dia, '07:00');
    agregar(dia, tarde, dia === 6 ? 'Horario de ejemplo' : null);
  }
  ['08:00', '10:00', '12:00', tarde].forEach((h, k) => agregar(0, h, k === 1 ? 'Misa con coro (ejemplo)' : null));
  return lista;
}

export function actividadesDe(slug, fecha) {
  const [c, iglesia] = iglesiaDe(slug);
  if (!esFechaValida(fecha)) {
    throw new ErrorApi(400, { code: 'VALIDATION_ERROR', message: 'Revisa los campos indicados.', fields: { fecha: 'Debe tener el formato AAAA-MM-DD.' } });
  }
  if (c >= 4) return [];
  const dia = Number(fecha.slice(8));
  if ((dia + c) % 3 === 0) return []; // días sin actividades con fecha
  const base = { iglesia_id: iglesia.id, es_ejemplo: true };
  const lista = [{
    ...base, tipo: 'visita', titulo: 'Visita guiada de ejemplo', hora_inicio: '10:00', hora_fin: '12:00',
    descripcion: 'Recorrido de demostración por el templo. Contenido ficticio.',
    nota_visitas: 'Nota informativa de ejemplo: confirma la disponibilidad antes de ir.',
  }];
  if (diaSemana(fecha) === 6 || (dia + c) % 3 === 1) {
    lista.push({
      ...base, tipo: 'bautizo', titulo: 'Bautizos comunitarios de ejemplo', hora_inicio: '12:30', hora_fin: null,
      descripcion: 'Celebración de demostración. No hay inscripción ni datos personales en esta beta.', nota_visitas: null,
    });
  }
  if (diaSemana(fecha) === 0) {
    lista.push({
      ...base, tipo: 'difuntos', titulo: 'Misa por los fieles difuntos (ejemplo)', hora_inicio: '17:00', hora_fin: '18:00',
      descripcion: 'Actividad ficticia para probar la lista.', nota_visitas: null,
    });
  }
  return lista.map((a, k) => ({ id: idDe(c, 500 + (dia * 3 + k)), ...a }));
}
