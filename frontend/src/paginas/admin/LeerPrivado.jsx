import { useParams } from 'react-router-dom';
import { usarAdmin } from '../../auth/SesionAdmin.jsx';
import { LectorDocumento } from '../publico/Lector.jsx';

// Lectura administrativa (público o privado) por la ruta protegida; el documento solo vive en el estado del componente.
export default function LeerPrivado() {
  const { slug, materialId } = useParams();
  const { pedir } = usarAdmin();
  return (
    <LectorDocumento
      clave={materialId}
      cargar={() => pedir(`/admin/materiales/${materialId}/documento`)}
      volver={`/admin/${slug}/materiales/${materialId}`}
      privado
    />
  );
}
