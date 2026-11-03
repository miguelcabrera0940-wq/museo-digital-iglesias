import { Candado } from './Iconos.jsx';

// Tono de piel/lomo estable por material, para que la portada de la ficha coincida con su lomo.
export const tono = (id) => [...id].reduce((s, c) => s + c.charCodeAt(0), 0) % 4;

// Portada pública. Sin imagen se dibuja una cubierta de muestra con el título (no es una fotografía).
export default function Portada({ material }) {
  const { titulo, tipo, imagen_publica, bloqueado, id } = material;
  if (imagen_publica) return <img className={`portada-img ${tipo === 'objeto' ? 'portada-foto' : 'portada-tapa'}`} src={imagen_publica} alt={tipo === 'objeto' ? `Fotografía de ${titulo}` : `Portada de ${titulo}`} />;
  const clase = tipo === 'objeto' ? 'portada-objeto' : `portada-libro tono-${tono(id)}`;
  return (
    <div className={clase} role="img" aria-label={`Portada de muestra de ${titulo}`}>
      {bloqueado && <Candado />}
      <span>{titulo}</span>
    </div>
  );
}
