import { Link } from 'react-router-dom';

export const EstadoCarga = ({ texto = 'Cargando…' }) => (
  <p className="estado" role="status"><span className="aro" aria-hidden="true" />{texto}</p>
);

export const EstadoVacio = ({ texto }) => <p className="estado">{texto}</p>;

export function EstadoError({ error, onReintentar }) {
  const noEncontrado = error?.status === 404;
  return (
    <div className="estado estado-error" role="alert">
      <p>{noEncontrado ? 'No encontramos lo que buscas.' : (error?.message ?? 'Ocurrió un error inesperado.')}</p>
      {noEncontrado
        ? <Link className="boton" to="/">Volver al mapa</Link>
        : error?.status === 403 ? null : <button className="boton" onClick={onReintentar}>Intentar de nuevo</button>}
    </div>
  );
}
