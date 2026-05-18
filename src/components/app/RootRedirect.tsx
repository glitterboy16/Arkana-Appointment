import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FullScreenLoader } from './Spinner';

/**
 * Decide a dónde mandar al usuario según su sesión y rol.
 * Se usa como fallback de rutas no encontradas (catch-all) y para
 * evitar que los usuarios logueados acaben en la landing pública sin querer.
 */
export default function RootRedirect() {
  const { session, usuario, loading } = useAuth();

  if (loading) return <FullScreenLoader />;
  if (!session || !usuario) return <Navigate to="/" replace />;
  if (usuario.rol === 'admin')   return <Navigate to="/admin" replace />;
  if (usuario.rol === 'negocio') return <Navigate to="/panel" replace />;
  if (usuario.rol === 'cliente') return <Navigate to="/app/buscar" replace />;
  return <Navigate to="/" replace />;
}
