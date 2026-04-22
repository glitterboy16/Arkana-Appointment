import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Faltan variables VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. ' +
      'Copia .env.example a .env.local y rellena con tus credenciales.',
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type RolUsuario = 'negocio' | 'cliente' | 'admin';
export type EstadoCita = 'new' | 'pending' | 'confirmed' | 'cancelled';

export interface Usuario {
  id: string;
  rol: RolUsuario;
  nombre: string;
  email: string;
  telefono: string | null;
  foto_url: string | null;
  created_at: string;
}

export interface Negocio {
  id: string;
  usuario_id: string;
  nombre: string;
  slug: string;
  categoria: string | null;
  descripcion: string | null;
  direccion: string | null;
  telefono: string | null;
  logo_url: string | null;
  rating: number;
  resenas: number;
  created_at: string;
}

export interface Servicio {
  id: string;
  negocio_id: string;
  nombre: string;
  duracion_min: number;
  precio_centimos: number;
  color: string;
  activo: boolean;
  created_at: string;
}

export interface Disponibilidad {
  id: string;
  negocio_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
}

export interface Cita {
  id: string;
  negocio_id: string;
  servicio_id: string;
  cliente_id: string | null;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email: string | null;
  fecha: string;
  hora_inicio: string;
  estado: EstadoCita;
  notas: string | null;
  created_at: string;
}
