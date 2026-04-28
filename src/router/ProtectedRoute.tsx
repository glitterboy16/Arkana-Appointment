import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore"; // Asegúrate de que la ruta a tu store sea correcta

function ProtectedRoute() {
   // Obtenemos el valor de isAuthenticated 
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    // Si no está autenticado, redirige al login
    return <Navigate to="/iniciarSesion" replace />;
  }

  // Si está autenticado, renderiza el contenido protegido (el Outlet)
  return <Outlet />;
}

export default ProtectedRoute;