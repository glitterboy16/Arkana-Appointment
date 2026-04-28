import type { Negocio } from '../../interfaces/Negocio';

export const negociosMock: Negocio[] = [
  {
    id: 'neg_001',
    nombreComercial: 'Arkana Barber & Style',
    descripcion: 'Barbería especializada en cortes y cuidado de barba.',
    direccion: 'Calle Mayor 100, Madrid',
    telefono: '+34 600 111 222',
    correoContacto: 'reservas@arkana.app',
    codigoQr: 'arkana-neg-001',
    propietarioId: 'usr_emp_001',
    activo: true,
    fechaCreacion: '2026-01-01T10:30:00.000Z',
  },
];
