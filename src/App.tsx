import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ClienteLayout from './layouts/ClienteLayout';
import AdminLayout from './layouts/AdminLayout';
import RootRedirect from './components/app/RootRedirect';
import ErrorBoundary from './components/app/ErrorBoundary';
import CookieBanner from './components/app/CookieBanner';
import { FullScreenLoader } from './components/app/Spinner';

// Landing y auth — entradas comunes, se cargan en chunks separados
const InicioArkanaPage = lazy(() => import('./pages/arkana/InicioArkanaPage'));
const AuthPage = lazy(() => import('./pages/auth/AuthPage'));
const ReservaPublicaPage = lazy(() => import('./pages/booking/ReservaPublicaPage'));

// Panel del negocio
const PanelPage = lazy(() => import('./pages/dashboard/PanelPage'));
const CitasPage = lazy(() => import('./pages/dashboard/CitasPage'));
const PerfilNegocioPage = lazy(() => import('./pages/dashboard/PerfilNegocioPage'));
const EstadisticasPage = lazy(() => import('./pages/dashboard/EstadisticasPage'));
const QrPage = lazy(() => import('./pages/dashboard/QrPage'));
const ConfiguracionNegocioPage = lazy(() => import('./pages/dashboard/ConfiguracionNegocioPage'));

// Portal cliente
const BuscarNegociosPage = lazy(() => import('./pages/cliente/BuscarNegociosPage'));
const MisCitasPage = lazy(() => import('./pages/cliente/MisCitasPage'));
const NotificacionesPage = lazy(() => import('./pages/cliente/NotificacionesPage'));
const PerfilClientePage = lazy(() => import('./pages/cliente/PerfilClientePage'));
const ConfiguracionPage = lazy(() => import('./pages/cliente/ConfiguracionPage'));

// Admin
const AdminPanelPage = lazy(() => import('./pages/admin/AdminPanelPage'));
const AdminUsuariosPage = lazy(() => import('./pages/admin/AdminUsuariosPage'));

// Legal
const PrivacidadPage = lazy(() => import('./pages/legal/PrivacidadPage'));
const TerminosPage = lazy(() => import('./pages/legal/TerminosPage'));

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary contexto="app">
        <Suspense fallback={<FullScreenLoader />}>
          <Routes>
            <Route path="/" element={<InicioArkanaPage />} />
            <Route path="/iniciarSesion" element={<AuthPage defaultMode="login" />} />
            <Route path="/registro" element={<AuthPage defaultMode="register" />} />
            <Route path="/n/:slug" element={<ReservaPublicaPage />} />
            <Route path="/privacidad" element={<PrivacidadPage />} />
            <Route path="/terminos" element={<TerminosPage />} />

            <Route
              path="/panel"
              element={
                <ErrorBoundary contexto="panel">
                  <AppLayout />
                </ErrorBoundary>
              }
            >
              <Route index element={<PanelPage />} />
              <Route path="citas" element={<CitasPage />} />
              <Route path="notificaciones" element={<NotificacionesPage />} />
              <Route path="perfil" element={<PerfilNegocioPage />} />
              <Route path="estadisticas" element={<EstadisticasPage />} />
              <Route path="qr" element={<QrPage />} />
              <Route path="configuracion" element={<ConfiguracionNegocioPage />} />
            </Route>

            <Route
              path="/app"
              element={
                <ErrorBoundary contexto="cliente">
                  <ClienteLayout />
                </ErrorBoundary>
              }
            >
              <Route index element={<Navigate to="/app/buscar" replace />} />
              <Route path="buscar" element={<BuscarNegociosPage />} />
              <Route path="citas" element={<MisCitasPage />} />
              <Route path="notificaciones" element={<NotificacionesPage />} />
              <Route path="perfil" element={<PerfilClientePage />} />
              <Route path="configuracion" element={<ConfiguracionPage />} />
            </Route>

            <Route
              path="/admin"
              element={
                <ErrorBoundary contexto="admin">
                  <AdminLayout />
                </ErrorBoundary>
              }
            >
              <Route index element={<AdminPanelPage />} />
              <Route path="usuarios" element={<AdminUsuariosPage />} />
            </Route>

            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <CookieBanner />
    </BrowserRouter>
  );
}
