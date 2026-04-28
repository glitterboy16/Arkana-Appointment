import type { RutaBackend } from './tipos';

export const rutasAuth: RutaBackend[] = [
  {
    metodo: 'POST',
    ruta: '/api/auth/registro-empresa',
    descripcion: 'Registra una nueva empresa en Arkana Appointments.',
  },
  {
    metodo: 'POST',
    ruta: '/api/auth/iniciar-sesion',
    descripcion: 'Inicia sesión para empresa, cliente o administrador.',
  },
  {
    metodo: 'POST',
    ruta: '/api/auth/cerrar-sesion',
    descripcion: 'Cierra la sesión activa del usuario autenticado.',
  },
];
