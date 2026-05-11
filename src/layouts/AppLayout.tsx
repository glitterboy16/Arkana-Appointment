import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '@/components/app/Sidebar';
import { useAuth } from '@/contexts/AuthContext';

export default function AppLayout() {
  const { session, usuario, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--app-bg)', color: 'var(--app-subtle)', fontSize: 14,
        fontFamily: "'SF Pro Display','Inter',sans-serif",
      }}>
        Cargando…
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/iniciarSesion" replace />;
  }

  if (usuario && usuario.rol === 'cliente') {
    return <Navigate to="/app/buscar" replace />;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', background: 'var(--app-bg)', color: 'var(--app-text)' }}>
      <Sidebar />
      <Outlet />
    </div>
  );
}
