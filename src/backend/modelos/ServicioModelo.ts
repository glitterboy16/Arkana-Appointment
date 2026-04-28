export interface ServicioModelo {
  tabla: 'servicios';
  columnas: {
    id: 'uuid';
    negocio_id: 'uuid';
    nombre: 'text';
    descripcion: 'text?';
    duracion_minutos: 'integer';
    precio: 'decimal';
    activo: 'boolean';
  };
}
