import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import InicioArkanaPage from './pages/arkana/InicioArkanaPage';
import AuthPage from './pages/auth/AuthPage';
import ReservaPublicaPage from './pages/booking/ReservaPublicaPage';
import AppLayout from './layouts/AppLayout';
import PanelPage from './pages/dashboard/PanelPage';
import CitasPage from './pages/dashboard/CitasPage';
import PerfilNegocioPage from './pages/dashboard/PerfilNegocioPage';

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
          <Route path="perfil" element={<PerfilNegocioPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
