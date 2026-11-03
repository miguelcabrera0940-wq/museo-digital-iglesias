import { Link, useParams, useSearchParams } from 'react-router-dom';
import Estanteria from '../../componentes/Estanteria.jsx';
import { EstadoCarga, EstadoError, EstadoVacio } from '../../componentes/Estados.jsx';
import { Candado, Flecha } from '../../componentes/Iconos.jsx';
import { obtenerIglesia } from '../../api/iglesias.js';
import { CATEGORIAS, listarMateriales } from '../../api/materiales.js';
import { usarApi } from '../../api/usarApi.js';

export default function Museo() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const pedida = params.get('categoria');
  const categoria = CATEGORIAS.some((c) => c.id === pedida) ? pedida : CATEGORIAS[0].id;
  const { cargando, datos, error, reintentar } = usarApi(
    () => Promise.all([obtenerIglesia(slug), listarMateriales(slug)]),
    [slug],
  );

  if (cargando) return <main className="pagina"><EstadoCarga texto="Abriendo el museo…" /></main>;
  if (error) return <main className="pagina"><EstadoError error={error} onReintentar={reintentar} /></main>;

  const [iglesia, materiales] = datos;
  const visibles = materiales.filter((m) => m.categoria_id === categoria);
  const actual = CATEGORIAS.find((c) => c.id === categoria);

  return (
    <main className="pagina museo">
      <Link className="boton" to={`/iglesias/${slug}`}><Flecha /> Regresar a la iglesia</Link>
      <h1>Museo y Biblioteca Digital</h1>
      <p className="introduccion">{iglesia.nombre}. Elige un libro por su lomo, o un objeto, para ver su ficha.</p>

      <div className="selector-categoria escalona" role="group" aria-label="Categoría">
        {CATEGORIAS.map((c) => (
          <button
            key={c.id}
            className="boton"
            aria-pressed={c.id === categoria}
            onClick={() => setParams({ categoria: c.id }, { replace: true })}
          >
            {c.nombre} <span className="cuenta">{materiales.filter((m) => m.categoria_id === c.id).length}</span>
          </button>
        ))}
      </div>

      <div className="estante-marco">
        <div className="estante-cornisa" aria-hidden="true" />
        {visibles.length
          ? <Estanteria key={categoria} slug={slug} materiales={visibles} />
          : <EstadoVacio texto={`Todavía no hay ${actual.nombre.toLowerCase()} en esta iglesia.`} />}
      </div>

      {categoria === 'objetos' && visibles.every((m) => m.bloqueado) && (
        <p className="pendiente-objetos" role="note">Los objetos documentados de esta iglesia, con fotografía y fuentes, están pendientes.</p>
      )}

      <p className="nota-reservado"><Candado /> Los materiales con candado son de acceso reservado: aquí solo se muestran su título y descripción pública.</p>
    </main>
  );
}
