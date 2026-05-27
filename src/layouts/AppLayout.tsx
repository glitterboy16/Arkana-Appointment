import { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '@/components/app/Sidebar';
import MobileTopBar from '@/components/app/MobileTopBar';
import { FullScreenLoader } from '@/components/app/Spinner';
import { useAuth } from '@/contexts/AuthContext';

export default function AppLayout() {
  const { session, usuario, negocio, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  if (loading) return <FullScreenLoader />;
  if (!session) return <Navigate to="/iniciarSesion" replace />;
  if (!session.user.email_confirmed_at) return <Navigate to={`/verificar-email?email=${encodeURIComponent(session.user.email ?? '')}`} replace />;
  if (usuario && usuario.rol === 'cliente') return <Navigate to="/app/buscar" replace />;
  if (usuario && usuario.rol === 'admin')   return <Navigate to="/admin" replace />;

  return (
    <div className="ark-app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className={`ark-mobile-overlay ark-only-mobile${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <main className="ark-main">
        <MobileTopBar onMenu={() => setSidebarOpen(true)} title={negocio?.nombre ?? 'Arkana'} />
        <Outlet />
      </main>
    </div>
  );
}
