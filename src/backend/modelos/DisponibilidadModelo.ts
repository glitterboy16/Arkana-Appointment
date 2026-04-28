export interface DisponibilidadModelo {
  tabla: 'disponibilidad';
  columnas: {
    id: 'uuid';
    negocio_id: 'uuid';
    dia_semana: 'smallint';
    hora_inicio: 'time';
    hora_fin: 'time';
    activo: 'boolean';
  };
}
