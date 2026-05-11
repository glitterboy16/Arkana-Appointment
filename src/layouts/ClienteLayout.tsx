import { Outlet, Navigate } from 'react-router-dom';
import ClienteSidebar from '@/components/app/ClienteSidebar';
import { useAuth } from '@/contexts/AuthContext';

export default function ClienteLayout() {
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

  if (!session) return <Navigate to="/iniciarSesion" replace />;
  if (usuario && usuario.rol !== 'cliente') return <Navigate to="/panel" replace />;

  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', background: 'var(--app-bg)', color: 'var(--app-text)' }}>
      <ClienteSidebar />
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
