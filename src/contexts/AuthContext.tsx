import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
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

interface DBError { code?: string; message: string }

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
  return `No se pudieron guardar tus datos: ${err.message}`;
}

function esAborto(err: { message?: string } | null): boolean {
  const msg = err?.message?.toLowerCase() ?? '';
  return msg.includes('aborted') || msg.includes('signal') || msg.includes('failed to fetch');
}

// Patrón UPDATE-first: muchos proyectos Supabase tienen un trigger que crea la fila
// en `usuarios` automáticamente al hacer auth.signUp. Por eso intentamos primero
// actualizar la fila existente. Si no existía, hacemos INSERT.
// Reintenta hasta 3 veces ante el conocido AbortError de supabase-js.
async function guardarUsuario(row: { id: string; email: string; nombre: string; rol: RolUsuario; telefono?: string | null }): Promise<{ data: Usuario | null; error: DBError | null }> {
  const updates = { email: row.email, nombre: row.nombre, rol: row.rol, telefono: row.telefono ?? null };

  for (let intento = 0; intento < 3; intento++) {
    if (intento > 0) await new Promise(r => setTimeout(r, 250 * intento));

    // 1. UPDATE (si la fila ya existe gracias a un trigger)
    const upd = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', row.id)
      .select()
      .maybeSingle();

    if (upd.data) return { data: upd.data as Usuario, error: null };
    if (upd.error && esAborto(upd.error)) continue;
    if (upd.error) return { data: null, error: upd.error };

    // 2. UPDATE no afectó filas → INSERT
    const ins = await supabase
      .from('usuarios')
      .insert(row)
      .select()
      .maybeSingle();

    if (ins.data) return { data: ins.data as Usuario, error: null };
    if (ins.error && esAborto(ins.error)) continue;
    // Si el insert falla con duplicado tras un update sin filas (raro), volvemos al UPDATE en la siguiente iteración
    if (ins.error?.code === '23505') continue;
    if (ins.error) return { data: null, error: ins.error };
  }

  // Último recurso: leer la fila tal cual está en la BD. Si existe, devolvemos eso.
  const { data: existente } = await supabase.from('usuarios').select('*').eq('id', row.id).maybeSingle();
  if (existente) return { data: existente as Usuario, error: null };

  return { data: null, error: { message: 'No se pudieron guardar los datos tras varios intentos.' } };
}

async function fetchUsuario(userId: string): Promise<Usuario | null> {
  const { data } = await supabase.from('usuarios').select('*').eq('id', userId).maybeSingle();
  return (data as Usuario | null) ?? null;
}

async function fetchNegocio(userId: string): Promise<Negocio | null> {
  const { data } = await supabase.from('negocios').select('*').eq('usuario_id', userId).maybeSingle();
  return (data as Negocio | null) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(session);
      if (session?.user) {
        const [usr, neg] = await Promise.all([fetchUsuario(session.user.id), fetchNegocio(session.user.id)]);
        if (cancelled) return;
        setUsuario(usr);
        setNegocio(neg);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const signIn = async (email: string, password: string, expectedRol: RolUsuario) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (!data.user || !data.session) return { error: 'No se pudo iniciar sesión.' };

    const usr = await fetchUsuario(data.user.id);
    const rolReal = (usr?.rol ?? 'negocio') as RolUsuario;

    if (rolReal !== expectedRol) {
      await supabase.auth.signOut();
      return { error: `Esta cuenta es de ${rolReal}. Cambia el selector arriba para entrar.` };
    }

    const neg = rolReal === 'negocio' ? await fetchNegocio(data.user.id) : null;
    setSession(data.session);
    setUsuario(usr);
    setNegocio(neg);
    return { error: null, rol: rolReal };
  };

  const signUpNegocio = async ({ email, password, nombre, nombreNegocio }: SignUpNegocioData) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'No se pudo crear el usuario.' };
    if (!data.session) return { error: null, needsConfirmation: true };

    // Espera a que el cliente Supabase termine de actualizar su estado interno tras signUp.
    // Sin esto, la siguiente request se aborta (bug conocido de supabase-js).
    await new Promise(r => setTimeout(r, 200));

    const { data: usr, error: errUsr } = await guardarUsuario({
      id: data.user.id, email, nombre, rol: 'negocio',
    });
    if (errUsr || !usr) return { error: errUsr ? traducirErrorBD(errUsr, 'usuario') : 'No se pudo crear el usuario.' };

    const slug = generarSlug(nombreNegocio);
    const { data: neg, error: errNeg } = await supabase
      .from('negocios')
      .insert({ usuario_id: data.user.id, nombre: nombreNegocio, slug })
      .select()
      .maybeSingle();
    if (errNeg || !neg) return { error: errNeg ? traducirErrorBD(errNeg, 'negocio') : 'No se pudo crear el negocio.' };

    setSession(data.session);
    setUsuario(usr);
    setNegocio(neg as Negocio);
    return { error: null };
  };

  const signUpCliente = async ({ email, password, nombre, telefono }: SignUpClienteData) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'No se pudo crear el usuario.' };
    if (!data.session) return { error: null, needsConfirmation: true };

    await new Promise(r => setTimeout(r, 200));

    const { data: usr, error: errUsr } = await guardarUsuario({
      id: data.user.id, email, nombre, rol: 'cliente', telefono: telefono || null,
    });
    if (errUsr || !usr) return { error: errUsr ? traducirErrorBD(errUsr, 'usuario') : 'No se pudo crear el usuario.' };

    setSession(data.session);
    setUsuario(usr);
    setNegocio(null);
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUsuario(null);
    setNegocio(null);
  };

  const refreshNegocio = async () => {
    if (!session?.user) return;
    const neg = await fetchNegocio(session.user.id);
    setNegocio(neg);
  };

  const refreshUsuario = async () => {
    if (!session?.user) return;
    const usr = await fetchUsuario(session.user.id);
    setUsuario(usr);
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
