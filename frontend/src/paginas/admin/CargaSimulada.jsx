import { useEffect, useState } from 'react';
import { Campo } from '../../componentes/Formularios.jsx';
import { esPdf, formatoTamano, tituloSugerido } from './archivo.js';

// SIMULACIÓN PERMANENTE de la beta: elige un PDF local, pide título y descripción y muestra una vista previa temporal.
// No hace ninguna petición de red, no lee los bytes en JavaScript (solo un enlace temporal del navegador) y no guarda nada.
export default function CargaSimulada() {
  const [archivo, setArchivo] = useState(null); // el File elegido, solo en memoria
  const [datos, setDatos] = useState({ titulo: '', descripcion: '' });
  const [errores, setErrores] = useState({});
  const [vista, setVista] = useState(null); // { titulo, descripcion, nombre, tamano, url }
  const [aviso, setAviso] = useState(null);
  const [clave, setClave] = useState(0); // cambiar la clave vacía el selector nativo

  // El enlace temporal vive solo mientras se ve la vista previa; al cambiar o salir se libera.
  const url = vista?.url;
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const reiniciar = () => { setArchivo(null); setDatos({ titulo: '', descripcion: '' }); setErrores({}); setVista(null); setAviso(null); setClave((n) => n + 1); };
  const elegir = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!esPdf(f)) { reiniciar(); setAviso('Elige un archivo PDF.'); return; }
    setAviso(null);
    setVista(null);
    setArchivo(f);
    setDatos((d) => ({ ...d, titulo: d.titulo || tituloSugerido(f.name) }));
  };
  const generar = (e) => {
    e.preventDefault();
    const titulo = datos.titulo.trim();
    const descripcion = datos.descripcion.trim();
    const faltan = {};
    if (!titulo) faltan.titulo = 'Escribe un título.';
    if (!descripcion) faltan.descripcion = 'Escribe una descripción.';
    setErrores(faltan);
    if (Object.keys(faltan).length) return;
    setVista({ titulo, descripcion, nombre: archivo.name, tamano: archivo.size, url: URL.createObjectURL(archivo) });
  };
  const campo = (n) => ({ nombre: `demo-${n}`, valor: datos[n], onCambio: (x) => setDatos({ ...datos, [n]: x }), error: errores[n] });

  return (
    <section className="carga" aria-labelledby="t-carga">
      <h2 id="t-carga">Subir PDF</h2>
      <p className="aviso-ok" role="note">Demostración: el archivo no se sube ni se guarda. No crea un libro real.</p>

      <div className="campo">
        <label htmlFor="f-pdf">Elegir un PDF de tu equipo</label>
        <input key={clave} id="f-pdf" type="file" accept="application/pdf,.pdf" onChange={elegir} />
      </div>
      {aviso && <p className="aviso-error" role="alert">{aviso}</p>}

      {archivo && (
        <form className="carga-elegido" onSubmit={generar} noValidate>
          <p><strong>{archivo.name}</strong> · {formatoTamano(archivo.size)}</p>
          <Campo {...campo('titulo')} etiqueta="Título" maxLength={160} required />
          <Campo {...campo('descripcion')} etiqueta="Descripción" tipo="area" required />
          <div className="acciones">
            <button type="submit" className="boton boton-principal">Generar vista previa</button>
            <button type="button" className="boton" onClick={reiniciar}>Cancelar</button>
          </div>
        </form>
      )}

      {vista && (
        <article className="carga-vista" aria-labelledby="t-vista">
          <h3 id="t-vista">Vista previa temporal</h3>
          <p className="campo-ayuda">Así se vería la ficha. No existe en el catálogo y desaparece al salir de esta pantalla.</p>
          <p className="carga-vista-titulo">{vista.titulo}</p>
          <p>{vista.descripcion}</p>
          <p className="fila-meta">{vista.nombre} · {formatoTamano(vista.tamano)}</p>
          <object className="carga-pdf" data={vista.url} type="application/pdf" aria-label={`Vista previa del PDF ${vista.nombre}`}>
            <p>Tu navegador no puede mostrar el PDF aquí. La vista previa de título y descripción sigue siendo válida.</p>
          </object>
          <button type="button" className="boton" onClick={reiniciar}>Elegir otro archivo</button>
        </article>
      )}
    </section>
  );
}
