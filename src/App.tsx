import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import InicioArkanaPage from './pages/arkana/InicioArkanaPage';
import AuthPage from './pages/auth/AuthPage';
import ReservaPublicaPage from './pages/booking/ReservaPublicaPage';
import AppLayout from './layouts/AppLayout';
import ClienteLayout from './layouts/ClienteLayout';
import PanelPage from './pages/dashboard/PanelPage';
import CitasPage from './pages/dashboard/CitasPage';
import PerfilNegocioPage from './pages/dashboard/PerfilNegocioPage';
import EstadisticasPage from './pages/dashboard/EstadisticasPage';
import QrPage from './pages/dashboard/QrPage';
import ConfiguracionNegocioPage from './pages/dashboard/ConfiguracionNegocioPage';
import BuscarNegociosPage from './pages/cliente/BuscarNegociosPage';
import MisCitasPage from './pages/cliente/MisCitasPage';
import NotificacionesPage from './pages/cliente/NotificacionesPage';
import PerfilClientePage from './pages/cliente/PerfilClientePage';
import ConfiguracionPage from './pages/cliente/ConfiguracionPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InicioArkanaPage />} />
        <Route path="/iniciarSesion" element={<AuthPage defaultMode="login" />} />
        <Route path="/registro" element={<AuthPage defaultMode="register" />} />
        <Route path="/n/:slug" element={<ReservaPublicaPage />} />
        <Route path="/panel" element={<AppLayout />}>
          <Route index element={<PanelPage />} />
          <Route path="citas" element={<CitasPage />} />
          <Route path="notificaciones" element={<NotificacionesPage />} />
          <Route path="perfil" element={<PerfilNegocioPage />} />
          <Route path="estadisticas" element={<EstadisticasPage />} />
          <Route path="qr" element={<QrPage />} />
          <Route path="configuracion" element={<ConfiguracionNegocioPage />} />
        </Route>
        <Route path="/app" element={<ClienteLayout />}>
          <Route index element={<Navigate to="/app/buscar" replace />} />
          <Route path="buscar" element={<BuscarNegociosPage />} />
          <Route path="citas" element={<MisCitasPage />} />
          <Route path="notificaciones" element={<NotificacionesPage />} />
          <Route path="perfil" element={<PerfilClientePage />} />
          <Route path="configuracion" element={<ConfiguracionPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
