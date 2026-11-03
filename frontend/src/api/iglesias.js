import { pedir, ErrorApi, USAR_MOCKS } from './cliente.js';

const mocks = () => import('../mocks/iglesias.js').then((m) => m.IGLESIAS);

// Sin `estado` devuelve las ocho (la administración las necesita todas).
export const listarIglesias = async (estado) => {
  if (!USAR_MOCKS) return pedir(estado ? `/iglesias?estado=${encodeURIComponent(estado)}` : '/iglesias');
  const todas = await mocks();
  return estado ? todas.filter((i) => i.estado === estado) : todas;
};

export async function obtenerIglesia(slug) {
  if (!USAR_MOCKS) return pedir(`/iglesias/${encodeURIComponent(slug)}`);
  const iglesia = (await mocks()).find((i) => i.slug === slug);
  if (!iglesia) throw new ErrorApi(404, { code: 'NOT_FOUND', message: 'No se encontró la iglesia.' });
  return iglesia;
}
