import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, type Usuario, type Negocio } from '@/lib/supabase';

export interface SignUpData {
  email: string;
  password: string;
  nombre: string;
  nombreNegocio: string;
}

interface AuthCtx {
  session: Session | null;
  usuario: Usuario | null;
  negocio: Negocio | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (data: SignUpData) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [loading, setLoading] = useState(true);

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
      if (session?.user) {
        const { usuario, negocio } = await fetchUserData(session.user.id);
        setUsuario(usuario);
        setNegocio(negocio);
      } else {
        setUsuario(null);
        setNegocio(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async ({ email, password, nombre, nombreNegocio }: SignUpData) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'No se pudo crear el usuario' };

    const slug = nombreNegocio
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .concat('-', Math.random().toString(36).slice(2, 6));

    const [{ error: errUsr }, { error: errNeg }] = await Promise.all([
      supabase.from('usuarios').insert({ id: data.user.id, email, nombre, rol: 'negocio' }),
      supabase.from('negocios').insert({ usuario_id: data.user.id, nombre: nombreNegocio, slug }),
    ]);

    if (errUsr || errNeg) {
      return { error: 'Error guardando datos. Intenta de nuevo.' };
    }

    if (!data.session) {
      return { error: null, needsConfirmation: true };
    }

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
    <AuthContext.Provider value={{ session, usuario, negocio, loading, signIn, signUp, signOut, refreshNegocio }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
