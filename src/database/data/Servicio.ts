import type { Servicio } from '../../interfaces/Servicio';

export const serviciosMock: Servicio[] = [
  {
    id: 'srv_001',
    negocioId: 'neg_001',
    nombre: 'Corte clásico',
    descripcion: 'Corte tradicional con acabado a tijera.',
    duracionMinutos: 45,
    precio: 18,
    activo: true,
  },
  {
    id: 'srv_002',
    negocioId: 'neg_001',
    nombre: 'Corte + barba',
    duracionMinutos: 60,
    precio: 25,
    activo: true,
  },
];
