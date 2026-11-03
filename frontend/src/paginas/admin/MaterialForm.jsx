import { useState } from 'react';
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { usarAdmin } from '../../auth/SesionAdmin.jsx';
import { EstadoCarga, EstadoError } from '../../componentes/Estados.jsx';
import { AvisoError, AvisoOk, Campo, usarEnvio } from '../../componentes/Formularios.jsx';
import { usarApi } from '../../api/usarApi.js';
import CargaSimulada from './CargaSimulada.jsx';
import { diferencias, paraCrear } from './formularios.js';

const TIPOS = [['libro', 'Libro'], ['documento', 'Documento'], ['objeto', 'Objeto']];
const VISIBILIDAD = [['publico', 'Público: cualquier visitante la ve y puede leerla'], ['privado', 'Privado: solo se ve el título y un candado']];
const categoriaDe = (tipo) => (tipo === 'objeto' ? 'objetos' : 'libros-documentos');
const VACIO = { titulo: '', tipo: 'libro', descripcion_publica: '', visibilidad: 'publico', descripcion_interna: '', fuente: '' };
const NULABLES = ['descripcion_interna', 'fuente'];
const valoresDe = (m) => ({ titulo: m.titulo, tipo: m.tipo, descripcion_publica: m.descripcion_publica, visibilidad: m.visibilidad, descripcion_interna: m.descripcion_interna ?? '', fuente: m.fuente ?? '' });

function Formulario({ inicial, iglesia }) {
  const { pedir } = usarAdmin();
  const navegar = useNavigate();
  const { state } = useLocation();
  const [original, setOriginal] = useState(inicial);
  const [v, setV] = useState(inicial ? valoresDe(inicial) : VACIO);
  const envio = usarEnvio();
  const campo = (n) => ({ nombre: n, valor: v[n], onCambio: (x) => setV({ ...v, [n]: x }), error: envio.error?.fields?.[n] });
  const pasaAPrivado = original?.visibilidad === 'publico' && v.visibilidad === 'privado';

  const guardar = async (e) => {
    e.preventDefault();
    const actual = { ...v, categoria_id: categoriaDe(v.tipo) };
    if (!original) {
      const cuerpo = paraCrear({ iglesia_id: iglesia.id, ...actual }, NULABLES);
      const r = await envio.enviar(() => pedir('/admin/materiales', { method: 'POST', body: cuerpo }), 'Ficha creada.');
      if (r.ok) navegar(`/admin/${iglesia.slug}/materiales/${r.datos.id}`, { replace: true, state: { creada: true } });
      return;
    }
    const cambios = diferencias(original, actual, NULABLES);
    if (!Object.keys(cambios).length) return envio.mostrar('No hay cambios que guardar.');
    const r = await envio.enviar(() => pedir(`/admin/materiales/${original.id}`, { method: 'PATCH', body: cambios }), 'Cambios guardados.');
    if (r.ok) { setOriginal(r.datos); setV(valoresDe(r.datos)); }
  };

  return (
    <>
      <form className="formulario" onSubmit={guardar} noValidate>
        <h2>{original ? 'Editar ficha' : 'Nueva ficha'}</h2>
        {!original && <p className="campo-ayuda">Las fichas nuevas se crean como ejemplo, sin imagen ni documento.</p>}
        {state?.creada && !envio.ok && <AvisoOk texto="Ficha creada." />}
        <Campo {...campo('titulo')} etiqueta="Título" maxLength={160} required />
        <Campo {...campo('tipo')} etiqueta="Tipo" tipo="select" opciones={TIPOS} ayuda={`Categoría: ${categoriaDe(v.tipo) === 'objetos' ? 'Objetos' : 'Libros y documentos'}.`} />
        <Campo {...campo('descripcion_publica')} etiqueta="Descripción pública" tipo="area" ayuda="Lo que verá cualquier visitante. No escribas aquí información reservada." required />
        <Campo {...campo('visibilidad')} etiqueta="Visibilidad" tipo="select" opciones={VISIBILIDAD} />
        {pasaAPrivado && <p className="aviso-error" role="note">Al guardar, el documento de esta ficha dejará de poder leerse públicamente de inmediato.</p>}
        <Campo {...campo('descripcion_interna')} etiqueta="Nota interna (opcional)" tipo="area" ayuda="Solo la ve la administración." />
        <Campo {...campo('fuente')} etiqueta="Fuente (opcional)" ayuda="Libro, archivo o persona de donde proviene la información." />
        <AvisoError error={envio.error} />
        <AvisoOk texto={envio.ok} />
        <div className="acciones">
          <button className="boton boton-principal" type="submit" disabled={envio.enviando}>{envio.enviando ? 'Guardando…' : original ? 'Guardar cambios' : 'Crear ficha'}</button>
          <Link className="boton" to={`/admin/${iglesia.slug}/materiales`}>Volver a materiales</Link>
          {original?.tiene_documento && <Link className="boton" to={`/admin/${iglesia.slug}/materiales/${original.id}/leer`}>Leer el documento</Link>}
        </div>
      </form>
      <CargaSimulada />
    </>
  );
}

export default function MaterialForm() {
  const { materialId } = useParams();
  const { iglesia } = useOutletContext();
  const { pedir } = usarAdmin();
  const { cargando, datos, error, reintentar } = usarApi(() => (materialId ? pedir(`/admin/materiales/${materialId}`) : Promise.resolve(null)), [materialId]);
  if (cargando) return <EstadoCarga texto="Cargando la ficha…" />;
  if (error) return <EstadoError error={error} onReintentar={reintentar} />;
  if (datos && datos.iglesia_id !== iglesia.id) return <EstadoError error={{ status: 404 }} />;
  return <Formulario key={materialId ?? 'nuevo'} inicial={datos} iglesia={iglesia} />;
}
