import { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import ClienteSidebar from '@/components/app/ClienteSidebar';
import MobileTopBar from '@/components/app/MobileTopBar';
import { FullScreenLoader } from '@/components/app/Spinner';
import { useAuth } from '@/contexts/AuthContext';

export default function ClienteLayout() {
  const { session, usuario, loading } = useAuth();
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
  if (usuario && usuario.rol !== 'cliente') return <Navigate to="/panel" replace />;

  return (
    <div className="ark-app-shell">
      <ClienteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className={`ark-mobile-overlay ark-only-mobile${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <main className="ark-main">
        <MobileTopBar onMenu={() => setSidebarOpen(true)} title={usuario?.nombre ?? 'Mi cuenta'} />
        <Outlet />
      </main>
    </div>
  );
}
