import { Link, useParams } from 'react-router-dom';
import { EstadoCarga, EstadoError } from '../../componentes/Estados.jsx';
import { obtenerIglesia } from '../../api/iglesias.js';
import { usarApi } from '../../api/usarApi.js';

const SECCIONES = [
  ['museo', 'Museo y Biblioteca'],
  ['horarios', 'Misas y actividades'],
  ['tramites', 'Trámites y celebraciones'],
];

export default function Interior() {
  const { slug } = useParams();
  const { cargando, datos: iglesia, error, reintentar } = usarApi(() => obtenerIglesia(slug), [slug]);

  if (cargando) return <main className="pagina"><EstadoCarga /></main>;
  if (error) return <main className="pagina"><EstadoError error={error} onReintentar={reintentar} /></main>;

  return (
    <main>
      <section className="interior sobre-oscuro" aria-label={`Interior de ${iglesia.nombre}`}>
        {iglesia.foto_interior ? (
          <img className="interior-foto" src={iglesia.foto_interior} alt={`Interior de ${iglesia.nombre}`} />
        ) : iglesia.foto_exterior ? (
          <>
            <img className="interior-foto" src={iglesia.foto_exterior} alt={`Vista exterior de ${iglesia.nombre}`} />
            <p className="interior-etiqueta">Vista exterior · la fotografía interior está pendiente</p>
          </>
        ) : <p className="interior-sin-foto"><span>La fotografía de esta iglesia está pendiente.</span></p>}
        <div className="interior-capa arriba">
          <Link className="boton" to={iglesia.estado === 'yucatan' ? '/' : `/?estado=${iglesia.estado}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4 6 10l6 6" /></svg>
            Regresar al mapa
          </Link>
        </div>
        <div className="interior-capa abajo">
          <div className="interior-cuerpo">
          <h1 className="entra">{iglesia.nombre}</h1>
          <nav className="interior-botones escalona" aria-label="Secciones de la iglesia">
            {SECCIONES.map(([ruta, texto]) => (
              <Link key={ruta} className="boton" to={`/iglesias/${iglesia.slug}/${ruta}`}>{texto}</Link>
            ))}
          </nav>
          </div>
        </div>
      </section>
      <section className="interior-datos">
        <div className="pagina">
          <p className="interior-descripcion">{iglesia.descripcion || 'La descripción de esta iglesia está por confirmar.'}</p>
          <dl>
            <dt>Ciudad</dt><dd>{iglesia.ciudad}</dd>
            <dt>Dirección</dt><dd>{iglesia.direccion || 'Por confirmar'}</dd>
            <dt>Teléfono</dt><dd>{iglesia.telefono ?? 'Por confirmar'}</dd>
          </dl>
          {iglesia.historia && (
            <section aria-labelledby="t-historia" className="interior-historia">
              <h2 id="t-historia">Historia</h2>
              {iglesia.historia.split('\n\n').map((parrafo, i) => <p key={i}>{parrafo}</p>)}
            </section>
          )}
          {iglesia.fuente && <p className="interior-fuente">Fuente: {iglesia.fuente}</p>}
          {(iglesia.foto_interior || iglesia.foto_exterior) && <p className="interior-fuente"><a href="/imagenes/creditos.html">Créditos de las fotografías</a></p>}
        </div>
      </section>
    </main>
  );
}
