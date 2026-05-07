import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, type Usuario, type Negocio, type RolUsuario } from '@/lib/supabase';

export interface SignUpNegocioData {
  email: string;
  password: string;
  nombre: string;
  nombreNegocio: string;
}

export interface SignUpClienteData {
  email: string;
  password: string;
  nombre: string;
  telefono: string;
}

interface AuthCtx {
  session: Session | null;
  usuario: Usuario | null;
  negocio: Negocio | null;
  loading: boolean;
  signIn: (email: string, password: string, expectedRol: RolUsuario) => Promise<{ error: string | null; rol?: RolUsuario }>;
  signUpNegocio: (data: SignUpNegocioData) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  signUpCliente: (data: SignUpClienteData) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  refreshNegocio: () => Promise<void>;
  refreshUsuario: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

async function fetchUserData(userId: string) {
  const [{ data: usr }, { data: neg }] = await Promise.all([
    supabase.from('usuarios').select('*').eq('id', userId).single(),
    supabase.from('negocios').select('*').eq('usuario_id', userId).single(),
  ]);
  return { usuario: usr as Usuario | null, negocio: neg as Negocio | null };
}

function generarSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .concat('-', Math.random().toString(36).slice(2, 6));
}

interface DBError { code?: string; message: string; details?: string | null }

function traducirErrorBD(err: DBError, contexto: 'usuario' | 'negocio'): string {
  console.error(`[Supabase ${contexto}]`, err);
  const msg = err.message?.toLowerCase() ?? '';

  if (err.code === '23505' || msg.includes('duplicate key')) {
    return contexto === 'negocio'
      ? 'Ya existe un negocio con ese nombre. Prueba con otro.'
      : 'Ya tienes una cuenta con este email.';
  }
  if (err.code === '42501' || msg.includes('row-level security') || msg.includes('permission denied')) {
    return 'Permisos insuficientes en la base de datos. Avisa al administrador.';
  }
  if (err.code === '23503' || msg.includes('foreign key')) {
    return 'Error de integridad en los datos. Intenta de nuevo.';
  }
  if (err.code === '23502' || msg.includes('not-null')) {
    return 'Falta un dato obligatorio. Revisa el formulario.';
  }
  if (msg.includes('jwt') || msg.includes('not authenticated')) {
    return 'La sesión ha expirado. Recarga la página e intenta de nuevo.';
  }
  if (msg.includes('aborted') || msg.includes('signal')) {
    return 'La conexión se cortó. Vuelve a intentarlo.';
  }
  return `No se pudieron guardar tus datos: ${err.message}`;
}

// Reintenta cuando el cliente de Supabase aborta la request por carrera con el cambio de sesión
async function withRetry<T>(fn: () => Promise<{ data: T | null; error: DBError | null }>, maxIntentos = 3) {
  let lastResult: { data: T | null; error: DBError | null } = { data: null, error: null };
  for (let i = 0; i < maxIntentos; i++) {
    lastResult = await fn();
    const msg = lastResult.error?.message?.toLowerCase() ?? '';
    const fueAbortado = msg.includes('aborted') || msg.includes('signal') || msg.includes('failed to fetch');
    if (!lastResult.error || !fueAbortado) return lastResult;
    await new Promise(r => setTimeout(r, 200 * (i + 1)));
  }
  return lastResult;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [loading, setLoading] = useState(true);
  const isRegistering = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const { usuario, negocio } = await fetchUserData(session.user.id);
        setUsuario(usuario);
        setNegocio(negocio);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (!session) {
        setUsuario(null);
        setNegocio(null);
        return;
      }
      // skip during signup — state is set directly after inserts complete
      if (isRegistering.current) return;
      if (session.user) {
        const { usuario, negocio } = await fetchUserData(session.user.id);
        setUsuario(usuario);
        setNegocio(negocio);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, expectedRol: RolUsuario) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    const { data: usr } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', data.user.id)
      .single();

    const rolReal = (usr?.rol ?? 'negocio') as RolUsuario;

    if (rolReal !== expectedRol) {
      await supabase.auth.signOut();
      const real = rolReal === 'negocio' ? 'negocio' : 'cliente';
      return { error: `Esta cuenta es de ${real}. Cambia el selector arriba para entrar.` };
    }

    return { error: null, rol: rolReal };
  };

  // Intenta upsert + reintenta + verifica si la fila se guardó (tolera abortos del cliente Supabase)
  const upsertUsuario = async (row: Record<string, unknown>) => {
    const upsertResult = await withRetry<Usuario>(async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .upsert(row, { onConflict: 'id' })
        .select()
        .single();
      return { data: data as Usuario | null, error };
    });
    if (upsertResult.data) return upsertResult;

    // Si falló, comprobar si el dato sí se guardó (caso clásico de abort tras escritura exitosa)
    const verificacion = await withRetry<Usuario>(async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', row.id as string)
        .maybeSingle();
      return { data: data as Usuario | null, error };
    });
    if (verificacion.data) return { data: verificacion.data, error: null };
    return upsertResult;
  };

  const signUpNegocio = async ({ email, password, nombre, nombreNegocio }: SignUpNegocioData) => {
    isRegistering.current = true;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { isRegistering.current = false; return { error: error.message }; }
    if (!data.user) { isRegistering.current = false; return { error: 'No se pudo crear el usuario' }; }

    if (!data.session) {
      isRegistering.current = false;
      return { error: null, needsConfirmation: true };
    }

    const slug = generarSlug(nombreNegocio);

    const { data: newUsr, error: errUsr } = await upsertUsuario({
      id: data.user.id, email, nombre, rol: 'negocio',
    });

    if (errUsr || !newUsr) {
      isRegistering.current = false;
      return { error: errUsr ? traducirErrorBD(errUsr, 'usuario') : 'No se pudo crear el usuario' };
    }

    const negResult = await withRetry<Negocio>(async () => {
      const { data, error } = await supabase
        .from('negocios')
        .insert({ usuario_id: newUsr.id, nombre: nombreNegocio, slug })
        .select()
        .single();
      return { data: data as Negocio | null, error };
    });

    if (negResult.error || !negResult.data) {
      isRegistering.current = false;
      return { error: negResult.error ? traducirErrorBD(negResult.error, 'negocio') : 'No se pudo crear el negocio' };
    }

    setUsuario(newUsr);
    setNegocio(negResult.data);
    isRegistering.current = false;
    return { error: null };
  };

  const signUpCliente = async ({ email, password, nombre, telefono }: SignUpClienteData) => {
    isRegistering.current = true;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { isRegistering.current = false; return { error: error.message }; }
    if (!data.user) { isRegistering.current = false; return { error: 'No se pudo crear el usuario' }; }

    if (!data.session) {
      isRegistering.current = false;
      return { error: null, needsConfirmation: true };
    }

    const { data: newUsr, error: errUsr } = await upsertUsuario({
      id: data.user.id, email, nombre, rol: 'cliente', telefono: telefono || null,
    });

    if (errUsr || !newUsr) {
      isRegistering.current = false;
      return { error: errUsr ? traducirErrorBD(errUsr, 'usuario') : 'No se pudo crear el usuario' };
    }

    setUsuario(newUsr);
    setNegocio(null);
    isRegistering.current = false;
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshNegocio = async () => {
    if (!session?.user) return;
    const { data } = await supabase
      .from('negocios')
      .select('*')
      .eq('usuario_id', session.user.id)
      .single();
    if (data) setNegocio(data as Negocio);
  };

  const refreshUsuario = async () => {
    if (!session?.user) return;
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', session.user.id)
      .single();
    if (data) setUsuario(data as Usuario);
  };

  return (
    <AuthContext.Provider value={{ session, usuario, negocio, loading, signIn, signUpNegocio, signUpCliente, signOut, refreshNegocio, refreshUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
