export interface Servicio {
  id: string;
  negocioId: string;
  nombre: string;
  descripcion?: string;
  duracionMinutos: number;
  precio: number;
  activo: boolean;
}
