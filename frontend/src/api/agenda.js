import { pedir, USAR_MOCKS } from './cliente.js';

const mocks = () => import('../mocks/agenda.js');

export const listarHorarios = (slug) =>
  USAR_MOCKS ? mocks().then((m) => m.horariosDe(slug)) : pedir(`/iglesias/${encodeURIComponent(slug)}/horarios`);

// `fecha` es obligatoria en el contrato (AAAA-MM-DD, calendario local).
export const listarActividades = (slug, fecha) =>
  USAR_MOCKS
    ? mocks().then((m) => m.actividadesDe(slug, fecha))
    : pedir(`/iglesias/${encodeURIComponent(slug)}/actividades?fecha=${encodeURIComponent(fecha)}`);
