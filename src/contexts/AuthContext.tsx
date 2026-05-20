import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, type Usuario, type Negocio, type RolUsuario } from '@/lib/supabase';

export interface SignUpNegocioData {
  email: string;
  password: string;
  nombre: string;
  nombreNegocio: string;
  telefono: string;
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
  emailVerificado: boolean;
  signIn: (email: string, password: string, expectedRol: RolUsuario) => Promise<{ error: string | null; rol?: RolUsuario }>;
  signUpNegocio: (data: SignUpNegocioData) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  signUpCliente: (data: SignUpClienteData) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  refreshNegocio: () => Promise<void>;
  refreshUsuario: () => Promise<void>;
  changeEmail: (newEmail: string) => Promise<{ error: string | null }>;
  changePassword: (newPassword: string) => Promise<{ error: string | null }>;
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>;
  resendVerification: () => Promise<{ error: string | null }>;
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

// Workaround: el cliente supabase-js entra en estado roto tras auth.signUp por un
// AbortError interno (issue conocido). Para guardar el perfil en /usuarios usamos
// fetch directo contra PostgREST, saltándonos el cliente roto.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

async function postgrest<T>(
  path: string,
  init: RequestInit,
  accessToken: string,
): Promise<{ data: T | null; error: DBError | null }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
    });
    const text = await res.text();
    const body = text ? JSON.parse(text) : null;
    if (!res.ok) {
      return { data: null, error: { message: body?.message ?? res.statusText, code: body?.code } };
    }
    const data = Array.isArray(body) ? (body[0] ?? null) : body;
    return { data: data as T | null, error: null };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error de red';
    return { data: null, error: { message } };
  }
}

function buildUsuarioLocal(row: {
  id: string; email: string; nombre: string; rol: RolUsuario; telefono?: string | null;
}): Usuario {
  return {
    id: row.id,
    email: row.email,
    nombre: row.nombre,
    rol: row.rol,
    telefono: row.telefono ?? null,
    foto_url: null,
    created_at: new Date().toISOString(),
  };
}

async function guardarUsuario(
  row: { id: string; email: string; nombre: string; rol: RolUsuario; telefono?: string | null },
  accessToken: string,
): Promise<{ data: Usuario | null; error: DBError | null }> {
  const updates = { email: row.email, nombre: row.nombre, rol: row.rol, telefono: row.telefono ?? null };
  if (import.meta.env.DEV) console.log('[Arkana] guardarUsuario - id:', row.id, 'rol:', row.rol);

  // 1. UPDATE (por si un trigger ya creó la fila con rol por defecto)
  const upd = await postgrest<Usuario>(`usuarios?id=eq.${row.id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }, accessToken);
  if (import.meta.env.DEV) console.log('[Arkana] PATCH:', { hayData: !!upd.data, error: upd.error });
  if (upd.data) return upd;

  // 2. INSERT
  const ins = await postgrest<Usuario>('usuarios', {
    method: 'POST',
    body: JSON.stringify(row),
  }, accessToken);
  if (import.meta.env.DEV) console.log('[Arkana] POST:', { hayData: !!ins.data, error: ins.error });
  if (ins.data) return ins;

  // 3. Si INSERT falla por duplicado, la fila YA existe (trigger fue más rápido).
  //    Reintentamos PATCH para corregir el rol y leer la fila.
  if (ins.error?.code === '23505') {
    const upd2 = await postgrest<Usuario>(`usuarios?id=eq.${row.id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }, accessToken);
    if (import.meta.env.DEV) console.log('[Arkana] PATCH retry:', { hayData: !!upd2.data, error: upd2.error });
    if (upd2.data) return { data: upd2.data, error: null };

    // 4. Aun sin lectura, sabemos que el usuario existe (por el 23505) y conocemos
    //    todos sus datos desde el formulario. Devolvemos el Usuario reconstruido
    //    en local para que el registro no falle por culpa de RLS/timing en la lectura.
    console.warn('[Arkana] usuario existe pero no se pudo leer; construyendo localmente');
    return { data: buildUsuarioLocal(row), error: null };
  }

  // 5. Último intento: leer
  const get = await postgrest<Usuario>(`usuarios?id=eq.${row.id}&select=*`, { method: 'GET' }, accessToken);
  if (get.data) return get;

  return { data: null, error: ins.error ?? upd.error ?? { message: 'No se pudieron guardar los datos.' } };
}

// Lecturas tras login/signup usan fetch directo (el cliente supabase-js queda
// roto tras operaciones de auth y aborta peticiones silenciosamente).
async function fetchUsuario(userId: string, accessToken?: string): Promise<Usuario | null> {
  if (accessToken) {
    const { data } = await postgrest<Usuario>(`usuarios?id=eq.${userId}&select=*`, { method: 'GET' }, accessToken);
    return data;
  }
  const { data } = await supabase.from('usuarios').select('*').eq('id', userId).maybeSingle();
  return (data as Usuario | null) ?? null;
}

async function fetchNegocio(userId: string, accessToken?: string): Promise<Negocio | null> {
  if (accessToken) {
    const { data } = await postgrest<Negocio>(`negocios?usuario_id=eq.${userId}&select=*`, { method: 'GET' }, accessToken);
    return data;
  }
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
        const token = session.access_token;
        const [usr, neg] = await Promise.all([
          fetchUsuario(session.user.id, token),
          fetchNegocio(session.user.id, token),
        ]);
        if (cancelled) return;
        setUsuario(usr);
        setNegocio(neg);
      }
      setLoading(false);
    })();

    // Sincroniza la sesión cuando cambia (logout en otra pestaña, refresh
    // de token, confirmación de email, recovery desde enlace mágico, etc).
    // Guardamos por access_token para no propagar re-renders cuando Supabase
    // emite el mismo token (typical INITIAL_SESSION justo después de getSession).
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (cancelled) return;
      setSession(prev => {
        if (prev?.access_token === newSession?.access_token) return prev;
        return newSession;
      });
      if (!newSession) {
        setUsuario(null);
        setNegocio(null);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, expectedRol: RolUsuario) => {
    if (import.meta.env.DEV) console.log('[Arkana] signIn - inicio para email:', email, 'esperado:', expectedRol);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('[Arkana] signIn - error auth:', error);
      return { error: error.message };
    }
    if (!data.user || !data.session) return { error: 'No se pudo iniciar sesión.' };

    const token = data.session.access_token;
    if (import.meta.env.DEV) console.log('[Arkana] signIn - auth OK, fetching usuario (vía REST) para id:', data.user.id);
    const usr = await fetchUsuario(data.user.id, token);
    if (import.meta.env.DEV) console.log('[Arkana] signIn - usuario en BD:', usr);

    if (!usr) {
      await supabase.auth.signOut();
      return { error: 'Tu cuenta existe pero no tiene perfil en la base de datos. Vuelve a registrarte.' };
    }

    const rolReal = usr.rol;

    // El admin es "invisible" en la UI: entra con cualquier selector (negocio o cliente).
    // Para los demás roles, exigimos que coincida con el selector escogido.
    if (rolReal !== 'admin' && rolReal !== expectedRol) {
      await supabase.auth.signOut();
      return { error: `Esta cuenta es de ${rolReal}. Cambia el selector arriba para entrar.` };
    }

    const neg = rolReal === 'negocio' ? await fetchNegocio(data.user.id, token) : null;
    setSession(data.session);
    setUsuario(usr);
    setNegocio(neg);
    if (import.meta.env.DEV) console.log('[Arkana] signIn - éxito, rol:', rolReal);
    return { error: null, rol: rolReal };
  };

  const signUpNegocio = async ({ email, password, nombre, nombreNegocio, telefono }: SignUpNegocioData) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'No se pudo crear el usuario.' };
    if (!data.session) return { error: null, needsConfirmation: true };

    const token = data.session.access_token;

    const { data: usr, error: errUsr } = await guardarUsuario(
      { id: data.user.id, email, nombre, rol: 'negocio', telefono: telefono || null },
      token,
    );
    if (errUsr || !usr) return { error: errUsr ? traducirErrorBD(errUsr, 'usuario') : 'No se pudo crear el usuario.' };

    const slug = generarSlug(nombreNegocio);
    const neg = await postgrest<Negocio>('negocios', {
      method: 'POST',
      body: JSON.stringify({
        usuario_id: data.user.id,
        nombre: nombreNegocio,
        slug,
        telefono: telefono || null,
      }),
    }, token);
    if (neg.error || !neg.data) return { error: neg.error ? traducirErrorBD(neg.error, 'negocio') : 'No se pudo crear el negocio.' };

    setSession(data.session);
    setUsuario(usr);
    setNegocio(neg.data);
    return { error: null };
  };

  const signUpCliente = async ({ email, password, nombre, telefono }: SignUpClienteData) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'No se pudo crear el usuario.' };
    if (!data.session) return { error: null, needsConfirmation: true };

    const token = data.session.access_token;

    const { data: usr, error: errUsr } = await guardarUsuario(
      { id: data.user.id, email, nombre, rol: 'cliente', telefono: telefono || null },
      token,
    );
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
    const neg = await fetchNegocio(session.user.id, session.access_token);
    setNegocio(neg);
  };

  const refreshUsuario = async () => {
    if (!session?.user) return;
    const usr = await fetchUsuario(session.user.id, session.access_token);
    setUsuario(usr);
  };

  const changeEmail = async (newEmail: string) => {
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) return { error: error.message };
    // Importante: Supabase no aplica el cambio hasta que el usuario confirma
    // desde el correo nuevo. Hasta entonces, la sesión sigue con el email
    // viejo. Por eso no actualizamos `usuario` aquí.
    return { error: null };
  };

  const changePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return { error: null };
  };

  const requestPasswordReset = async (email: string) => {
    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/recuperar-password`
      : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) return { error: error.message };
    return { error: null };
  };

  const resendVerification = async () => {
    if (!session?.user?.email) return { error: 'No hay sesión activa.' };
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: session.user.email,
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const emailVerificado = !!session?.user?.email_confirmed_at;

  return (
    <AuthContext.Provider value={{
      session, usuario, negocio, loading, emailVerificado,
      signIn, signUpNegocio, signUpCliente, signOut, refreshNegocio, refreshUsuario,
      changeEmail, changePassword, requestPasswordReset, resendVerification,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
