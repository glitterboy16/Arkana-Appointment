export interface BloqueHorario {
  horaInicio: string;
  horaFin: string;
}

export interface Disponibilidad {
  id: string;
  negocioId: string;
  diaSemana: number;
  bloques: BloqueHorario[];
  activo: boolean;
}
