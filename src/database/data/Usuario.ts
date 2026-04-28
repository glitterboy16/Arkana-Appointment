import type { Usuario } from '../../interfaces/Usuario';

export const usuariosMock: Usuario[] = [
  {
    id: 'usr_emp_001',
    nombre: 'Arkana Studio',
    correo: 'contacto@arkana.app',
    telefono: '+34 600 000 000',
    rol: 'empresa',
    negocioId: 'neg_001',
    activo: true,
    fechaCreacion: '2026-01-01T10:00:00.000Z',
  },
  {
    id: 'usr_cli_001',
    nombre: 'Cliente Demo',
    correo: 'cliente@correo.com',
    rol: 'cliente',
    activo: true,
    fechaCreacion: '2026-01-02T09:00:00.000Z',
  },
];
