import { useLocation } from 'react-router-dom';
import { USAR_MOCKS } from '../api/cliente.js';

export default function AvisoMocks() {
  const { pathname } = useLocation();
  if (!USAR_MOCKS || pathname.startsWith('/admin')) return null; // la administración nunca usa mocks
  return <p className="aviso" role="note">Datos de demostración: esta información no proviene del servidor.</p>;
}
