import type { RutaBackend } from './tipos';

export const rutasNegocios: RutaBackend[] = [
  {
    metodo: 'GET',
    ruta: '/api/negocios/:codigoQr/publico',
    descripcion: 'Devuelve el perfil público del negocio.',
  },
  {
    metodo: 'PATCH',
    ruta: '/api/negocios/:negocioId',
    descripcion: 'Actualiza datos de perfil del negocio.',
  },
  {
    metodo: 'GET',
    ruta: '/api/negocios/:negocioId/estadisticas',
    descripcion: 'Consulta métricas básicas para el panel empresa.',
  },
];
