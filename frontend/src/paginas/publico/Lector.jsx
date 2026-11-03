import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EstadoCarga, EstadoError, EstadoVacio } from '../../componentes/Estados.jsx';
import { Flecha } from '../../componentes/Iconos.jsx';
import { obtenerDocumento } from '../../api/materiales.js';
import { usarApi } from '../../api/usarApi.js';
import { vista } from './paginacion.js';

const ESCRITORIO = '(min-width: 900px)';

function usarDoble() {
  const [doble, setDoble] = useState(() => window.matchMedia(ESCRITORIO).matches);
  useEffect(() => {
    const q = window.matchMedia(ESCRITORIO);
    const f = () => setDoble(q.matches);
    q.addEventListener('change', f);
    return () => q.removeEventListener('change', f);
  }, []);
  return doble;
}

const Hoja = ({ pagina, lado, dir }) =>
  pagina ? (
    <article className={`hoja hoja-${lado} pasa-${dir}`} aria-label={`Página ${pagina.numero}`}>
      {pagina.imagen_url && <img src={pagina.imagen_url} alt={`Imagen de la página ${pagina.numero}`} />}
      <p className="hoja-texto">{pagina.texto}</p>
      <span className="hoja-numero">{pagina.numero}</span>
    </article>
  ) : <div className={`hoja hoja-${lado} hoja-vacia pasa-${dir}`} aria-hidden="true" />;

// `clave` identifica el documento (recarga al cambiar); `cargar` lo pide; `volver` es la ruta de regreso.
export function LectorDocumento({ clave, cargar, volver, privado = false }) {
  const { cargando, datos: doc, error, reintentar } = usarApi(cargar, [clave]);
  const doble = usarDoble();
  const [inicio, setInicio] = useState(0);
  const [arrastre, setArrastre] = useState(null);
  const [dir, setDir] = useState('abre'); // sentido del último giro, para la animación de la hoja

  const total = doc?.paginas.length ?? 0;
  const v = vista(total, inicio, doble);
  const anterior = () => { if (v.hayAnterior) { setDir('ant'); setInicio(v.ini - v.paso); } };
  const siguiente = () => { if (v.haySiguiente) { setDir('sig'); setInicio(v.ini + v.paso); } };

  useEffect(() => {
    const tecla = (e) => {
      if (e.key === 'ArrowLeft') anterior();
      if (e.key === 'ArrowRight') siguiente();
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  });

  if (cargando) return <main className="pagina"><EstadoCarga texto="Abriendo el documento…" /></main>;
  if (error) {
    return (
      <main className="pagina">
        <EstadoError error={error} onReintentar={reintentar} />
        <p className="estado"><Link className="boton" to={volver}>Regresar a la ficha</Link></p>
      </main>
    );
  }

  const [izq, der] = v.indices.map((i) => doc.paginas[i]);
  const indicador = total === 0 ? '' : doble && der ? `Páginas ${izq.numero}–${der.numero} de ${total}` : `Página ${izq.numero} de ${total}`;

  return (
    <main className="lector sobre-oscuro">
      <div className="lector-barra">
        <Link className="boton" to={volver}><Flecha /> Regresar a la ficha</Link>
        <div>
          <h1>{doc.titulo}</h1>
          {privado && <p>Lectura privada: solo visible con la sesión de administración.</p>}
          {doc.es_ejemplo && <p>Documento de ejemplo: el texto es ficticio.</p>}
        </div>
      </div>

      {total === 0 ? <EstadoVacio texto="Este documento todavía no tiene páginas." /> : (
        <>
          <div
            className="libro"
            role="group"
            aria-label="Libro abierto"
            onPointerDown={(e) => setArrastre(e.clientX)}
            onPointerUp={(e) => {
              const dx = e.clientX - arrastre;
              setArrastre(null);
              if (arrastre !== null && Math.abs(dx) > 60) (dx > 0 ? anterior : siguiente)();
            }}
          >
            <Hoja key={`i${izq?.numero}`} pagina={izq} lado="izq" dir={dir} />
            {doble && <Hoja key={`d${der?.numero ?? 'v'}`} pagina={der} lado="der" dir={dir} />}
          </div>
          <nav className="lector-nav" aria-label="Pasar páginas">
            <button className="boton" disabled={!v.hayAnterior} onClick={anterior}><Flecha /> Anterior</button>
            <p aria-live="polite">{indicador}</p>
            <button className="boton" disabled={!v.haySiguiente} onClick={siguiente}>Siguiente <Flecha dir="der" /></button>
          </nav>
        </>
      )}
    </main>
  );
}

export default function Lector() {
  const { slug, materialId } = useParams();
  return (
    <LectorDocumento
      clave={materialId}
      cargar={() => obtenerDocumento(materialId)}
      volver={`/iglesias/${slug}/museo/${materialId}`}
    />
  );
}
