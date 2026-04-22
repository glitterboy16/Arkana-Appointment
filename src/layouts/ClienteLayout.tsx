import { Outlet, Navigate } from 'react-router-dom';
import ClienteSidebar from '@/components/app/ClienteSidebar';
import { useAuth } from '@/contexts/AuthContext';

export default function ClienteLayout() {
  const { session, usuario, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#050A30', color: 'rgba(250,250,250,0.45)', fontSize: 14,
        fontFamily: "'SF Pro Display','Inter',sans-serif",
      }}>
        Cargando…
      </div>
    );
  }

  if (!session) return <Navigate to="/iniciarSesion" replace />;
  if (usuario && usuario.rol !== 'cliente') return <Navigate to="/panel" replace />;

  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', background: '#050A30', color: '#FAFAFA' }}>
      <ClienteSidebar />
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
