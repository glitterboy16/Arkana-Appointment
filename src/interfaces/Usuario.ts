export type RolUsuario = 'empresa' | 'cliente' | 'admin';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  rol: RolUsuario;
  negocioId?: string;
  activo: boolean;
  fechaCreacion: string;
}
