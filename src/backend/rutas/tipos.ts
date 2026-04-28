export type MetodoHttp = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface RutaBackend {
  metodo: MetodoHttp;
  ruta: string;
  descripcion: string;
}
