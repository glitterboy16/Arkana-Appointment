import { useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { CiDark, CiLight } from 'react-icons/ci';
import { BiCamera, BiTrash } from 'react-icons/bi';
import toast from 'react-hot-toast';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/app/Shared';
import { Spinner } from '@/components/app/Spinner';

const MAX_AVATAR_BYTES = 4 * 1024 * 1024; // 4 MB

export default function ConfiguracionPage() {
  const { tema, setTema } = useTheme();
  const { signOut, usuario, refreshUsuario } = useAuth();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !usuario) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecciona una imagen');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error('La imagen no debe superar 4 MB');
      return;
    }

    setSubiendo(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const path = `${usuario.id}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('avatares')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (upErr) {
        toast.error('No se pudo subir la imagen');
        return;
      }

      const { data: urlData } = supabase.storage.from('avatares').getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      const { error: updErr } = await supabase
        .from('usuarios')
        .update({ foto_url: publicUrl })
        .eq('id', usuario.id);

      if (updErr) {
        toast.error('Imagen subida pero no se pudo guardar en tu perfil');
        return;
      }

      await refreshUsuario();
      toast.success('Foto actualizada');
    } finally {
      setSubiendo(false);
    }
  };

  const handleRemoveFoto = async () => {
    if (!usuario) return;
    setSubiendo(true);
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ foto_url: null })
        .eq('id', usuario.id);
      if (error) {
        toast.error('No se pudo quitar la foto');
        return;
      }
      await refreshUsuario();
      toast.success('Foto eliminada');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="ark-page" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Configuración</h1>
        <p style={{ color: 'var(--app-muted)', fontSize: 15, marginTop: 8 }}>
          Preferencias de tu cuenta.
        </p>
      </div>

      <section style={cardStyle}>
        <h2 style={sectionTitleStyle}>Foto de perfil</h2>
        <p style={helperStyle}>Esta foto será visible para los negocios y otros clientes.</p>

        <div style={{
          marginTop: 16, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
        }}>
          <div style={{ position: 'relative' }}>
            {usuario?.foto_url ? (
              <img
                src={usuario.foto_url}
                alt=""
                style={{
                  width: 84, height: 84, borderRadius: '50%', objectFit: 'cover',
                  border: '2px solid var(--app-border)', display: 'block',
                }}
              />
            ) : (
              <Avatar name={usuario?.nombre ?? '?'} size={84} bg="#648DFF" />
            )}
            {subiendo && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Spinner size={26} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handlePickFile}
              disabled={subiendo}
              style={btnPrimary(subiendo)}
            >
              <BiCamera size={16} />
              {usuario?.foto_url ? 'Cambiar foto' : 'Subir foto'}
            </button>
            {usuario?.foto_url && (
              <button
                type="button"
                onClick={handleRemoveFoto}
                disabled={subiendo}
                style={btnGhost(subiendo)}
              >
                <BiTrash size={16} />
                Quitar
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={sectionTitleStyle}>Apariencia</h2>
        <p style={helperStyle}>Elige cómo quieres ver la aplicación.</p>

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          {(['oscuro', 'claro'] as const).map(t => {
            const active = tema === t;
            const Icon = t === 'oscuro' ? CiDark : CiLight;
            return (
              <button
                key={t}
                onClick={() => setTema(t)}
                style={{
                  flex: 1, padding: '14px 12px', borderRadius: 10, cursor: 'pointer',
                  background: active ? 'rgba(100,141,255,0.12)' : 'var(--app-surface)',
                  border: active ? '1px solid rgba(100,141,255,0.55)' : '1px solid var(--app-border)',
                  color: 'var(--app-text)', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  transition: 'all 150ms ease',
                }}
              >
                <Icon
                  size={26}
                  style={active
                    ? { color: '#648DFF', fill: 'currentColor', stroke: 'currentColor', strokeWidth: 0 }
                    : { color: 'var(--app-muted)', fill: 'none', stroke: 'currentColor', strokeWidth: 1 }
                  }
                />
                Modo {t === 'oscuro' ? 'oscuro' : 'claro'}
              </button>
            );
          })}
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={sectionTitleStyle}>Cuenta</h2>
        <p style={helperStyle}>Edita tus datos personales en la sección de Mi perfil.</p>
        <button onClick={handleLogout} style={btnDanger}>
          Cerrar sesión
        </button>
      </section>
    </div>
  );
}

const cardStyle: CSSProperties = {
  background: 'var(--app-surface)', border: '1px solid var(--app-border)',
  borderRadius: 14, padding: 24, marginBottom: 18,
};
const sectionTitleStyle: CSSProperties = {
  fontSize: 16, fontWeight: 700, color: 'var(--app-text)', margin: 0, letterSpacing: '-0.01em',
};
const helperStyle: CSSProperties = {
  fontSize: 13, color: 'var(--app-muted)', marginTop: 6, marginBottom: 0,
};
const btnDanger: CSSProperties = {
  marginTop: 16, padding: '11px 18px', borderRadius: 9, cursor: 'pointer',
  background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.30)',
  color: '#EF4444', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
};
const btnPrimary = (loading: boolean): CSSProperties => ({
  padding: '10px 16px', borderRadius: 9, cursor: loading ? 'not-allowed' : 'pointer',
  background: '#004AAD', color: '#FAFAFA', border: 'none',
  fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
  display: 'inline-flex', alignItems: 'center', gap: 6,
  opacity: loading ? 0.5 : 1,
});
const btnGhost = (loading: boolean): CSSProperties => ({
  padding: '10px 16px', borderRadius: 9, cursor: loading ? 'not-allowed' : 'pointer',
  background: 'transparent', color: 'var(--app-muted)',
  border: '1px solid var(--app-border)',
  fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
  display: 'inline-flex', alignItems: 'center', gap: 6,
  opacity: loading ? 0.5 : 1,
});
