import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './i18n';

import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import LandingLayout from './layouts/LandingLayout';

import ProtectedRoute from './router/ProtectedRoute';
import AdminRoute from './router/AdminRoute';
import PublicRoute from './router/PublicRoute';

import InicioArkanaPage from './pages/arkana/InicioArkanaPage';
import PerfilNegocioPage from './pages/arkana/PerfilNegocioPage';
import ReservarCitaPage from './pages/arkana/ReservarCitaPage';
import PanelEmpresaPage from './pages/arkana/PanelEmpresaPage';
import PanelAdminArkanaPage from './pages/arkana/PanelAdminArkanaPage';

import IniciarSesionPage from './pages/IniciarSesionPage';
import RegistroPage from './pages/RegistroPage';
import RecuperarPassPage from './pages/RecuperarPassPage';
import ModificarDatosPage from './pages/ModificarDatosPage';
import PerfilUsuarioPage from './pages/PerfilUsuarioPage';
import ActualizarClave from './utils/ActualizarClave';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        {/* Landing pública */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<InicioArkanaPage />} />
        </Route>

        {/* Auth — solo accesible sin sesión */}
        <Route element={<AuthLayout />}>
          <Route element={<PublicRoute />}>
            <Route path="/iniciarSesion" element={<IniciarSesionPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/recuperarPass" element={<RecuperarPassPage />} />
          </Route>
          <Route path="/actualizar-clave" element={<ActualizarClave />} />
        </Route>

        {/* App — rutas con layout completo */}
        <Route element={<AppLayout />}>
          {/* Públicas */}
          <Route path="/negocio/:codigoQr" element={<PerfilNegocioPage />} />
          <Route path="/reservar" element={<ReservarCitaPage />} />

          {/* Requieren autenticación */}
          <Route element={<ProtectedRoute />}>
            <Route path="/perfil" element={<PerfilUsuarioPage />} />
            <Route path="/modificar-datos" element={<ModificarDatosPage />} />
            <Route path="/empresa" element={<PanelEmpresaPage />} />
          </Route>

          {/* Solo admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<PanelAdminArkanaPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
