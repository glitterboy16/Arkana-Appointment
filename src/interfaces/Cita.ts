export type EstadoCita = 'pendiente' | 'confirmada' | 'rechazada' | 'reprogramada' | 'cancelada';

export interface Cita {
  id: string;
  negocioId: string;
  servicioId: string;
  clienteId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: EstadoCita;
  notas?: string;
  creadaEn: string;
}
