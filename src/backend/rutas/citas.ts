import type { RutaBackend } from './tipos';

export const rutasCitas: RutaBackend[] = [
  {
    metodo: 'GET',
    ruta: '/api/negocios/:negocioId/disponibilidad',
    descripcion: 'Obtiene disponibilidad en tiempo real por negocio.',
  },
  {
    metodo: 'POST',
    ruta: '/api/citas',
    descripcion: 'Crea una solicitud de cita por parte del cliente.',
  },
  {
    metodo: 'PATCH',
    ruta: '/api/citas/:citaId/estado',
    descripcion: 'Permite confirmar, rechazar o reprogramar una cita.',
  },
  {
    metodo: 'DELETE',
    ruta: '/api/citas/:citaId',
    descripcion: 'Cancela una cita activa.',
  },
];
