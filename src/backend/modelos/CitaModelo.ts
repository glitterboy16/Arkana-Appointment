export interface CitaModelo {
  tabla: 'citas';
  columnas: {
    id: 'uuid';
    negocio_id: 'uuid';
    servicio_id: 'uuid';
    cliente_id: 'uuid';
    fecha: 'date';
    hora_inicio: 'time';
    hora_fin: 'time';
    estado: 'pendiente|confirmada|rechazada|reprogramada|cancelada';
    notas: 'text?';
    creado_en: 'timestamp';
  };
}
