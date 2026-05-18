import { supabase } from '@/lib/supabase';

/**
 * Inserta un registro en la tabla `error_logs` para que el admin pueda
 * verlo en su dashboard. Nunca lanza: si el log falla, simplemente
 * consologuea y sigue (no queremos romper el flow del usuario porque
 * el sistema de logs esté caído).
 *
 * Uso:
 *   await logError('perfil.save', err, { negocio_id: '...' });
 *   await logError('auth.signin', err);
 */
export async function logError(
  contexto: string,
  error: unknown,
  detalle?: Record<string, unknown>,
): Promise<void> {
  try {
    const mensaje = error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : JSON.stringify(error);

    const { data: { user } } = await supabase.auth.getUser();

    const url = typeof window !== 'undefined' ? window.location.pathname : null;

    await supabase.from('error_logs').insert({
      contexto,
      mensaje: mensaje.slice(0, 1000), // cap por si es enorme
      detalle: detalle ?? null,
      usuario_id: user?.id ?? null,
      url,
    });
  } catch (logErr) {
    console.warn('[Arkana] logError failed:', logErr);
  }
}
