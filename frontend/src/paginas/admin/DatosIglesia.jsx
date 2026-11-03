import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { usarAdmin } from '../../auth/SesionAdmin.jsx';
import { AvisoError, AvisoOk, Campo, usarEnvio } from '../../componentes/Formularios.jsx';
import { diferencias } from './formularios.js';

const valoresDe = (i) => ({ historia: i.historia ?? '', descripcion: i.descripcion ?? '', telefono: i.telefono ?? '' });

export default function DatosIglesia() {
  const { iglesia } = useOutletContext();
  const { pedir, rol } = usarAdmin();
  const soloTelefono = rol === 'parroquial'; // el servidor también lo exige: PATCH con otros campos → 403
  const [original, setOriginal] = useState(iglesia);
  const [v, setV] = useState(valoresDe(iglesia));
  const envio = usarEnvio();
  const campo = (n) => ({ nombre: n, valor: v[n], onCambio: (x) => setV({ ...v, [n]: x }), error: envio.error?.fields?.[n] });

  const guardar = async (e) => {
    e.preventDefault();
    const cambios = diferencias(original, v, ['telefono']);
    if (soloTelefono) for (const k of Object.keys(cambios)) if (k !== 'telefono') delete cambios[k];
    if (!Object.keys(cambios).length) return envio.mostrar('No hay cambios que guardar.');
    const r = await envio.enviar(() => pedir(`/admin/iglesias/${iglesia.slug}`, { method: 'PATCH', body: cambios }), 'Cambios guardados.');
    if (r.ok) { setOriginal(r.datos); setV(valoresDe(r.datos)); }
  };

  return (
    <form className="formulario" onSubmit={guardar} noValidate>
      <h2>Datos de la iglesia</h2>
      {soloTelefono && <p className="campo-ayuda">Tu cuenta puede cambiar el teléfono de la parroquia. La descripción y la historia son de consulta.</p>}
      <Campo {...campo('descripcion')} etiqueta="Descripción breve" tipo="area" disabled={soloTelefono} />
      <Campo {...campo('historia')} etiqueta="Historia" tipo="area" rows={10} disabled={soloTelefono} ayuda={soloTelefono ? undefined : 'Texto plano. Indica la fuente cuando uses información de un libro o archivo.'} />
      <Campo {...campo('telefono')} etiqueta="Teléfono de la parroquia" tipo="tel" ayuda="Déjalo vacío si todavía no está confirmado: se mostrará «Por confirmar»." autoComplete="off" />
      <AvisoError error={envio.error} />
      <AvisoOk texto={envio.ok} />
      <button className="boton boton-principal" type="submit" disabled={envio.enviando}>{envio.enviando ? 'Guardando…' : 'Guardar cambios'}</button>
    </form>
  );
}
