import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Mapa from '../../componentes/Mapa.jsx';
import SelectorEstado from '../../componentes/SelectorEstado.jsx';
import TarjetaIglesia from '../../componentes/TarjetaIglesia.jsx';
import { EstadoCarga, EstadoError, EstadoVacio } from '../../componentes/Estados.jsx';
import { listarIglesias } from '../../api/iglesias.js';
import { ESTADOS, ESTADO_INICIAL, nombreEstado } from '../../api/estados.js';
import { usarApi } from '../../api/usarApi.js';
import { movimientoReducido } from '../../movimiento.js';

export default function PaginaMapa() {
  // El estado vive en la URL (?estado=) para que «Regresar al mapa» vuelva al mismo estado.
  const [params, setParams] = useSearchParams();
  const pedido = params.get('estado');
  const estado = ESTADOS.some((e) => e.clave === pedido) ? pedido : ESTADO_INICIAL;
  const nombre = nombreEstado(estado);
  const { cargando, datos, error, reintentar } = usarApi(() => listarIglesias(estado), [estado]);
  const [seleccion, setSeleccion] = useState(null);
  const panel = useRef(null);

  const cambiarEstado = (clave) => {
    setSeleccion(null);
    setParams(clave === ESTADO_INICIAL ? {} : { estado: clave });
  };
  // Desde una tarjeta, la ficha puede quedar fuera de pantalla (móvil): se acerca sin mover el foco.
  const elegirTarjeta = (slug) => {
    setSeleccion(slug);
    requestAnimationFrame(() => panel.current?.scrollIntoView({ block: 'nearest', behavior: movimientoReducido() ? 'auto' : 'smooth' }));
  };

  // Una respuesta atrasada (o un filtro ignorado) nunca muestra iglesias de otro estado.
  const iglesias = (datos ?? []).filter((i) => i.estado === estado);
  const elegida = iglesias.find((i) => i.slug === seleccion);

  return (
    <main className="inicio">
      <section className="hero" aria-labelledby="titulo-inicio">
        <img className="hero-foto" src="/imagenes/la-compania-interior.jpg" alt="Interior del Templo de La Compañía, en Puebla: columnas, retablo y candiles" />
        <div className="hero-contenido">
          <h1 id="titulo-inicio" className="sr-solo">Iglesias históricas de Yucatán, Campeche y Puebla</h1>
          <a className="boton boton-principal hero-boton entra" style={{ '--i': 0 }} href="#iglesias">Explorar iglesias</a>
        </div>
        <p className="hero-credito">Templo de La Compañía, Puebla · Fotografía de Burkhard Mücke (CC BY-SA 4.0) · <a href="/imagenes/creditos.html">Créditos</a></p>
      </section>

      <section id="iglesias" className="explorar pagina" aria-labelledby="titulo-explorar">
        <div className="explorar-cabecera">
          <h2 id="titulo-explorar" key={estado} className="entra">Iglesias de {nombre}</h2>
          <SelectorEstado activo={estado} onCambiar={cambiarEstado} />
        </div>
        <p className="introduccion">Elige una iglesia en el mapa o entre las tarjetas para conocerla.</p>

        <div className="explorar-cuerpo">
          <Mapa iglesias={iglesias} seleccion={seleccion} onSeleccion={setSeleccion} etiqueta={`Mapa de las iglesias de ${nombre}`} />
          <div ref={panel} className="panel-zona">
            {elegida
              ? <TarjetaIglesia key={elegida.slug} iglesia={elegida} />
              : <p className="pista">Al elegir una iglesia verás aquí su fotografía, su ubicación y el botón para entrar.</p>}
          </div>
        </div>

        <section aria-label={`Iglesias de ${nombre}`}>
          {cargando && <EstadoCarga texto="Cargando las iglesias…" />}
          {error && <EstadoError error={error} onReintentar={reintentar} />}
          {!cargando && !error && !iglesias.length && <EstadoVacio texto={`Todavía no hay iglesias para mostrar en ${nombre}.`} />}
          {iglesias.length > 0 && (
            <ul key={estado} className="tarjetas escalona">
              {iglesias.map((i) => (
                <li key={i.slug}>
                  <button className="tarjeta-iglesia" aria-pressed={i.slug === seleccion} onClick={() => elegirTarjeta(i.slug)}>
                    {i.foto_exterior
                      ? <img src={i.foto_exterior} alt="" loading="lazy" />
                      : <span className="tarjeta-sin-foto">Fotografía pendiente</span>}
                    <span className="tarjeta-texto">
                      <span className="tarjeta-nombre">{i.nombre}</span>
                      <span className="tarjeta-ciudad">{i.ciudad}</span>
                    </span>
                    {i.slug === seleccion && <span className="tarjeta-marca">Seleccionada</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
