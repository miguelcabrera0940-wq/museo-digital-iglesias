import { useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { usarAdmin } from '../../auth/SesionAdmin.jsx';
import { EstadoCarga, EstadoError, EstadoVacio } from '../../componentes/Estados.jsx';
import { AvisoError, AvisoOk, Campo, usarEnvio } from '../../componentes/Formularios.jsx';
import { GUIAS, listarTramites } from '../../api/tramites.js';
import { usarApi } from '../../api/usarApi.js';
import { diferencias, lineas } from './formularios.js';

const ESTADOS = [['ejemplo', 'Ejemplo (pendiente de confirmar con la parroquia)'], ['por_confirmar', 'Por confirmar con la parroquia'], ['verificado', 'Verificado por la parroquia']];
const valoresDe = (t) => ({ titulo: t.titulo, requisitos: t.requisitos.join('\n'), fuente: t.fuente ?? '', estado_verificacion: t.estado_verificacion });

function VerTramite({ guia }) {
  return (
    <article className="formulario">
      <p className="campo-ayuda">Esta guía es de consulta para tu cuenta. Si necesita cambios, pídelos a la administración general.</p>
      <h3>{guia.titulo}</h3>
      {guia.requisitos.length ? <ol className="requisitos">{guia.requisitos.map((r, i) => <li key={i}>{r}</li>)}</ol> : <p>Sin requisitos registrados.</p>}
      <p>Fuente: {guia.fuente ?? 'no indicada'}</p>
      <p>Estado de la información: {ESTADOS.find(([k]) => k === guia.estado_verificacion)?.[1] ?? guia.estado_verificacion}</p>
    </article>
  );
}

function FormTramite({ inicial }) {
  const { pedir } = usarAdmin();
  const [original, setOriginal] = useState(inicial);
  const [v, setV] = useState(valoresDe(inicial));
  const envio = usarEnvio();
  const campo = (n) => ({ nombre: n, valor: v[n], onCambio: (x) => setV({ ...v, [n]: x }), error: envio.error?.fields?.[n] });

  const guardar = async (e) => {
    e.preventDefault();
    const cambios = diferencias(original, { ...v, requisitos: lineas(v.requisitos) }, ['fuente']);
    if (!Object.keys(cambios).length) return envio.mostrar('No hay cambios que guardar.');
    const r = await envio.enviar(() => pedir(`/admin/tramites/${original.id}`, { method: 'PATCH', body: cambios }), 'Guía guardada.');
    if (r.ok) { setOriginal(r.datos); setV(valoresDe(r.datos)); }
  };

  return (
    <form className="formulario" onSubmit={guardar} noValidate>
      <Campo {...campo('titulo')} etiqueta="Título de la guía" maxLength={160} required />
      <Campo {...campo('requisitos')} etiqueta="Requisitos" tipo="area" rows={8} ayuda="Escribe un requisito por línea (máximo 30). Déjalo vacío si la guía aún no tiene requisitos." />
      <Campo {...campo('fuente')} etiqueta="Fuente (opcional)" ayuda="Quién o qué documento confirma estos requisitos." />
      <Campo {...campo('estado_verificacion')} etiqueta="Estado de la información" tipo="select" opciones={ESTADOS} ayuda="Marca «Verificado» solo si la parroquia confirmó los requisitos; el sitio público lo mostrará así." />
      <AvisoError error={envio.error} />
      <AvisoOk texto={envio.ok} />
      <button className="boton boton-principal" type="submit" disabled={envio.enviando}>{envio.enviando ? 'Guardando…' : 'Guardar guía'}</button>
    </form>
  );
}

export default function Tramites() {
  const { iglesia } = useOutletContext();
  const { rol } = usarAdmin();
  const [params, setParams] = useSearchParams();
  const tipo = GUIAS.some((g) => g.tipo === params.get('tipo')) ? params.get('tipo') : GUIAS[0].tipo;
  const { cargando, datos, error, reintentar } = usarApi(() => listarTramites(iglesia.slug), [iglesia.slug]);
  if (cargando) return <EstadoCarga texto="Cargando las guías…" />;
  if (error) return <EstadoError error={error} onReintentar={reintentar} />;

  const guia = datos.find((t) => t.tipo === tipo);
  return (
    <section>
      <h2>Trámites y celebraciones</h2>
      <div className="tramite-selector" role="group" aria-label="Guía a editar">
        {GUIAS.map((g) => (
          <button key={g.tipo} className="boton" aria-pressed={g.tipo === tipo} onClick={() => setParams({ tipo: g.tipo }, { replace: true })}>{g.nombre}</button>
        ))}
      </div>
      {guia ? (rol === 'parroquial' ? <VerTramite guia={guia} /> : <FormTramite key={guia.id} inicial={guia} />) : <EstadoVacio texto="Esta guía no existe todavía en los datos de la iglesia." />}
    </section>
  );
}
