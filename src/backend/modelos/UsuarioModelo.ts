export interface UsuarioModelo {
  tabla: 'usuarios';
  columnas: {
    id: 'uuid';
    nombre: 'text';
    correo: 'text';
    telefono: 'text?';
    rol: 'empresa|cliente|admin';
    negocio_id: 'uuid?';
    activo: 'boolean';
    creado_en: 'timestamp';
  };
}
