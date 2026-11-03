import { pedir, USAR_MOCKS } from './cliente.js';

export const CATEGORIAS = [
  { id: 'libros-documentos', nombre: 'Libros y documentos' },
  { id: 'objetos', nombre: 'Objetos' },
];

const mocks = () => import('../mocks/materiales.js');

export const listarMateriales = (slug) =>
  USAR_MOCKS ? mocks().then((m) => m.materialesDe(slug)) : pedir(`/iglesias/${encodeURIComponent(slug)}/materiales`);

export const obtenerMaterial = (id) =>
  USAR_MOCKS ? mocks().then((m) => m.material(id)) : pedir(`/materiales/${encodeURIComponent(id)}`);

export const obtenerDocumento = (id) =>
  USAR_MOCKS ? mocks().then((m) => m.documento(id)) : pedir(`/materiales/${encodeURIComponent(id)}/documento`);
