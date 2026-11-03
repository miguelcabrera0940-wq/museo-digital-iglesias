import { Link } from 'react-router-dom';
import { Candado } from './Iconos.jsx';
import { tono } from './Portada.jsx';

// Variación fija de altura/ancho para que la hilera parezca una colección y no una rejilla.
const ALTOS = [0.86, 0.96, 0.78, 0.9, 1, 0.82, 0.93];
const ANCHOS = [64, 76, 60, 84, 70];

// shortcut: el lomo corta títulos de más de 48 caracteres (el completo va en `title` y en la ficha); ajustar con títulos reales.
export default function Estanteria({ slug, materiales }) {
  return (
    <ul className="estante sobre-oscuro">
      {materiales.map((m, i) => {
        const estilo = { '--alto': ALTOS[i % ALTOS.length], '--ancho': `${ANCHOS[(i * 3) % ANCHOS.length]}px` };
        const reservado = m.bloqueado;
        return (
          <li key={m.id} className="entra-lomo" style={{ '--i': i }}>
            <Link
              className={m.tipo === 'objeto' ? `objeto${m.imagen_publica && !reservado ? ' con-foto' : ''}` : `lomo tono-${tono(m.id)}`}
              data-reservado={reservado || undefined}
              style={estilo}
              title={m.titulo}
              to={`/iglesias/${slug}/museo/${m.id}`}
            >
              {reservado && <Candado />}
              {m.tipo === 'objeto' && m.imagen_publica && !reservado && <img className="objeto-foto" src={m.imagen_publica} alt="" loading="lazy" />}
              <span className="lomo-titulo">{m.titulo.length > 48 ? `${m.titulo.slice(0, 47)}…` : m.titulo}</span>
              {reservado && <span className="sr-solo">, acceso reservado</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
