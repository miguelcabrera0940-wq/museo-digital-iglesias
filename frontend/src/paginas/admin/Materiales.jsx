import { Link, useOutletContext } from 'react-router-dom';
import { usarAdmin } from '../../auth/SesionAdmin.jsx';
import { EstadoCarga, EstadoError, EstadoVacio } from '../../componentes/Estados.jsx';
import { Candado } from '../../componentes/Iconos.jsx';
import { CATEGORIAS } from '../../api/materiales.js';
import { usarApi } from '../../api/usarApi.js';

const TIPOS = { libro: 'Libro', documento: 'Documento', objeto: 'Objeto' };

export default function Materiales() {
  const { iglesia } = useOutletContext();
  const { pedir } = usarAdmin();
  const { cargando, datos, error, reintentar } = usarApi(() => pedir(`/admin/iglesias/${iglesia.slug}/materiales`), [iglesia.slug]);

  if (cargando) return <EstadoCarga texto="Cargando las fichas…" />;
  if (error) return <EstadoError error={error} onReintentar={reintentar} />;

  return (
    <section>
      <h2>Materiales</h2>
      <Link className="boton boton-principal" to={`/admin/${iglesia.slug}/materiales/nuevo`}>Nueva ficha</Link>
      {CATEGORIAS.map((c) => {
        const lista = datos.filter((m) => m.categoria_id === c.id);
        return (
          <div key={c.id} className="admin-grupo">
            <h3>{c.nombre} <span className="cuenta">{lista.length}</span></h3>
            {lista.length ? (
              <ul className="filas">
                {lista.map((m) => (
                  <li key={m.id}>
                    <div>
                      <p className="fila-titulo">{m.titulo}</p>
                      <p className="fila-meta">
                        {TIPOS[m.tipo]} · {m.visibilidad === 'privado' ? <><Candado /> Privado</> : 'Público'} · {m.tiene_documento ? 'Con documento' : 'Sin documento'}
                      </p>
                    </div>
                    <div className="acciones">
                      <Link className="boton" to={`/admin/${iglesia.slug}/materiales/${m.id}`}>Editar<span className="sr-solo"> {m.titulo}</span></Link>
                      {m.tiene_documento && <Link className="boton" to={`/admin/${iglesia.slug}/materiales/${m.id}/leer`}>Leer<span className="sr-solo"> {m.titulo}</span></Link>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : <EstadoVacio texto={`Todavía no hay ${c.nombre.toLowerCase()} en esta iglesia.`} />}
          </div>
        );
      })}
    </section>
  );
}
