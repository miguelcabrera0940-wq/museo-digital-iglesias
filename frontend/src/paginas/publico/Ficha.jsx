import { Link, useParams } from 'react-router-dom';
import Portada from '../../componentes/Portada.jsx';
import { EstadoCarga, EstadoError } from '../../componentes/Estados.jsx';
import { Candado, Flecha } from '../../componentes/Iconos.jsx';
import { obtenerIglesia } from '../../api/iglesias.js';
import { obtenerMaterial } from '../../api/materiales.js';
import { usarApi } from '../../api/usarApi.js';
import { ErrorApi } from '../../api/cliente.js';

const TIPOS = { libro: 'Libro', documento: 'Documento', objeto: 'Objeto' };

export default function Ficha() {
  const { slug, materialId } = useParams();
  const { cargando, datos, error, reintentar } = usarApi(async () => {
    const [iglesia, material] = await Promise.all([obtenerIglesia(slug), obtenerMaterial(materialId)]);
    if (material.iglesia_id !== iglesia.id) throw new ErrorApi(404, { code: 'NOT_FOUND', message: 'No se encontró el material.' });
    return { iglesia, material };
  }, [slug, materialId]);

  if (cargando) return <main className="pagina"><EstadoCarga /></main>;
  if (error) return <main className="pagina"><EstadoError error={error} onReintentar={reintentar} /></main>;

  const { iglesia, material: m } = datos;
  return (
    <main className="pagina ficha">
      <div className="ficha-escena sobre-oscuro"><Portada material={m} /></div>
      <div className="ficha-texto escalona">
        <Link className="boton" to={`/iglesias/${slug}/museo?categoria=${m.categoria_id}`}><Flecha /> Regresar al museo</Link>
        <h1>{m.titulo}</h1>
        <p className="ficha-meta">{TIPOS[m.tipo]} · {iglesia.nombre}</p>
        <p>{m.descripcion_publica}</p>
        <p className="ficha-fuente">Fuente: {m.fuente ?? 'por confirmar'}</p>
        {m.imagen_publica && <p className="ficha-fuente"><a href="/imagenes/creditos.html">Créditos de las fotografías</a></p>}
        {m.es_ejemplo && <p className="etiqueta-ejemplo">Material de ejemplo, con datos ficticios.</p>}

        {m.bloqueado ? (
          <div className="reservado" role="note">
            <Candado />
            <div>
              <strong>Acceso reservado</strong>
              <p>Este material no puede leerse en el sitio público. Su contenido solo está disponible para la administración.</p>
            </div>
          </div>
        ) : m.tiene_documento ? (
          <Link className="boton boton-principal" to={`/iglesias/${slug}/museo/${m.id}/leer`}>Leer</Link>
        ) : (
          <p>Este material no tiene versión digital para leer.</p>
        )}
      </div>
    </main>
  );
}
