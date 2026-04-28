export interface NegocioModelo {
  tabla: 'negocios';
  columnas: {
    id: 'uuid';
    nombre_comercial: 'text';
    descripcion: 'text';
    direccion: 'text';
    telefono: 'text';
    correo_contacto: 'text';
    codigo_qr: 'text';
    propietario_id: 'uuid';
    activo: 'boolean';
    creado_en: 'timestamp';
  };
}
