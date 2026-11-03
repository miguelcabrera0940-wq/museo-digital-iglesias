import { denegado } from './seguridad.js';
export function validarAmbito(a) {
  if (!a || !((a.rol==='general' && a.iglesia_id===null) ||
      (a.rol==='parroquial' && typeof a.iglesia_id==='string' && a.iglesia_id.length>0))) throw denegado();
  return a;
}
export function permitirIglesia(ambito,id) {
  validarAmbito(ambito);
  if(ambito.rol!=='general' && ambito.iglesia_id!==id)throw denegado();
}
export function permitirCampos(ambito,tabla,campos) {
  validarAmbito(ambito);
  if(ambito.rol==='parroquial' && (tabla==='tramites' ||
      (tabla==='iglesias' && campos.some(c=>c!=='telefono'))))throw denegado();
}
