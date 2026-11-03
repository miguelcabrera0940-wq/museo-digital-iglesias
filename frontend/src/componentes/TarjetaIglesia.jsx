import { Link } from 'react-router-dom';

// Ficha de la iglesia elegida: fotografía, ubicación y entrada. Sin foto se dice, no se inventa.
export default function TarjetaIglesia({ iglesia }) {
  const ubicacion = [iglesia.ciudad, iglesia.direccion].filter(Boolean).join(' · ');
  return (
    <article className="panel-iglesia" aria-labelledby="panel-iglesia-titulo">
      {iglesia.foto_exterior
        ? <img className="panel-foto" src={iglesia.foto_exterior} alt={`Vista exterior de ${iglesia.nombre}`} />
        : <p className="panel-foto panel-sin-foto">Fotografía pendiente</p>}
      <div className="panel-texto">
        <h2 id="panel-iglesia-titulo">{iglesia.nombre}</h2>
        <p className="panel-ubicacion">{ubicacion}</p>
        <p>{iglesia.descripcion || 'Descripción por confirmar.'}</p>
        <Link className="boton boton-principal" to={`/iglesias/${iglesia.slug}`}>Entrar a la iglesia</Link>
      </div>
    </article>
  );
}
