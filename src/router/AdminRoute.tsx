import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuthStore();

  // Si no está logueado, lo mandamos al login
  if (!isAuthenticated) return <Navigate to="/iniciarSesion" replace />;
  
  // Si está logueado pero NO es admin, lo mandamos al home
  if (!isAdmin) return <Navigate to="/" replace />;

  // Si pasa ambos filtros (es admin y está logueado), le mostramos la ruta
  return <Outlet />;
}