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
  signIn: (email: string, password: string) => Promise<{ error: string | null; rol?: RolUsuario }>;
  signUpNegocio: (data: SignUpNegocioData) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  signUpCliente: (data: SignUpClienteData) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  refreshNegocio: () => Promise<void>;
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

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    const { data: usr } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', data.user.id)
      .single();

    return { error: null, rol: (usr?.rol ?? 'negocio') as RolUsuario };
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

    const { data: newUsr, error: errUsr } = await supabase
      .from('usuarios')
      .insert({ id: data.user.id, email, nombre, rol: 'negocio' })
      .select()
      .single();

    if (errUsr) { isRegistering.current = false; return { error: 'Error guardando datos del usuario.' }; }

    const { data: newNeg, error: errNeg } = await supabase
      .from('negocios')
      .insert({ usuario_id: data.user.id, nombre: nombreNegocio, slug })
      .select()
      .single();

    if (errNeg) { isRegistering.current = false; return { error: 'Error guardando datos del negocio.' }; }

    setUsuario(newUsr as Usuario);
    setNegocio(newNeg as Negocio);
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

    const { data: newUsr, error: errUsr } = await supabase
      .from('usuarios')
      .insert({ id: data.user.id, email, nombre, rol: 'cliente', telefono: telefono || null })
      .select()
      .single();

    if (errUsr) {
      isRegistering.current = false;
      return { error: 'Error guardando datos. Comprueba que el email no está ya registrado.' };
    }

    setUsuario(newUsr as Usuario);
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

  return (
    <AuthContext.Provider value={{ session, usuario, negocio, loading, signIn, signUpNegocio, signUpCliente, signOut, refreshNegocio }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
