import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/app/Spinner';

export default function PerfilClientePage() {
  const { usuario, refreshUsuario } = useAuth();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre);
      setTelefono(usuario.telefono ?? '');
    }
  }, [usuario]);

  if (!usuario) return null;

  const handleSave = async () => {
    setMsg(null);
    if (!nombre.trim()) { setMsg({ type: 'err', text: 'El nombre no puede estar vacío' }); return; }
    const tel = telefono.trim().replace(/\s/g, '');
    if (tel && !/^[6-9]\d{8}$|^\+\d{7,15}$/.test(tel)) {
      setMsg({ type: 'err', text: 'Teléfono no válido (ej. 612345678 o +34612345678)' });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('usuarios')
      .update({ nombre: nombre.trim(), telefono: tel || null })
      .eq('id', usuario.id);
    setSaving(false);

    if (error) {
      setMsg({ type: 'err', text: `Error al guardar: ${error.message}` });
      return;
    }
    await refreshUsuario();
    setMsg({ type: 'ok', text: 'Perfil actualizado' });
  };

  const handleFile = async (file: File) => {
    setMsg(null);
    if (!file.type.startsWith('image/')) {
      setMsg({ type: 'err', text: 'Selecciona un archivo de imagen' });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setMsg({ type: 'err', text: 'La imagen debe pesar menos de 3 MB' });
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${usuario.id}/avatar-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('avatares')
      .upload(path, file, { upsert: true, cacheControl: '3600' });

    if (upErr) {
      setUploading(false);
      setMsg({ type: 'err', text: `Error al subir la imagen: ${upErr.message}` });
      return;
    }

    const { data: pub } = supabase.storage.from('avatares').getPublicUrl(path);
    const fotoUrl = pub.publicUrl;

    const { error: updErr } = await supabase
      .from('usuarios')
      .update({ foto_url: fotoUrl })
      .eq('id', usuario.id);

    setUploading(false);

    if (updErr) {
      setMsg({ type: 'err', text: `Imagen subida pero no se pudo guardar: ${updErr.message}` });
      return;
    }

    await refreshUsuario();
    setMsg({ type: 'ok', text: 'Foto actualizada' });
  };

  const handleRemoveFoto = async () => {
    if (!usuario.foto_url) return;
    setUploading(true);
    await supabase.from('usuarios').update({ foto_url: null }).eq('id', usuario.id);
    await refreshUsuario();
    setUploading(false);
    setMsg({ type: 'ok', text: 'Foto eliminada' });
  };

  return (
    <div className="ark-page" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Mi perfil</h1>
        <p style={{ color: 'var(--app-muted)', fontSize: 15, marginTop: 8 }}>
          Tus datos personales.
        </p>
      </div>

      {msg && (
        <div style={{
          background: msg.type === 'ok' ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.10)',
          border: `1px solid ${msg.type === 'ok' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
          borderRadius: 8, padding: '10px 14px', fontSize: 13,
          color: msg.type === 'ok' ? '#22C55E' : '#EF4444', marginBottom: 16,
        }}>
          {msg.text}
        </div>
      )}

      <section style={cardStyle}>
        <h2 style={sectionTitleStyle}>Foto de perfil</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
          {usuario.foto_url ? (
            <img src={usuario.foto_url} alt="" style={{
              width: 112, height: 112, borderRadius: '50%', objectFit: 'cover',
              border: '3px solid rgba(100,141,255,0.45)', flexShrink: 0,
              boxShadow: '0 6px 24px rgba(100,141,255,0.18)',
            }} />
          ) : (
            <div style={{
              width: 112, height: 112, borderRadius: '50%', background: 'linear-gradient(135deg, #004AAD 0%, #648DFF 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 44, fontWeight: 700, color: '#FAFAFA', flexShrink: 0,
              boxShadow: '0 6px 24px rgba(100,141,255,0.18)',
            }}>
              {usuario.nombre.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{ ...btnPrimary(uploading), display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              {uploading && <Spinner size={14} color="#FAFAFA" trackColor="rgba(250,250,250,0.35)" />}
              {uploading ? 'Subiendo…' : usuario.foto_url ? 'Cambiar foto' : 'Subir foto'}
            </button>
            {usuario.foto_url && (
              <button onClick={handleRemoveFoto} disabled={uploading} style={btnGhost}>
                Eliminar foto
              </button>
            )}
          </div>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={sectionTitleStyle}>Datos</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
          <div>
            <label style={labelStyle}>Nombre</label>
            <input style={inputStyle} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} value={usuario.email} disabled />
            <div style={{ fontSize: 11, color: 'var(--app-subtle)', marginTop: 4 }}>
              No se puede cambiar el email desde aquí.
            </div>
          </div>
          <div>
            <label style={labelStyle}>Teléfono</label>
            <input
              style={inputStyle}
              type="tel"
              inputMode="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="612345678"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ ...btnPrimary(saving), marginTop: 4, alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            {saving && <Spinner size={14} color="#FAFAFA" trackColor="rgba(250,250,250,0.35)" />}
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
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
const inputStyle: CSSProperties = {
  width: '100%', boxSizing: 'border-box', background: 'var(--app-input-bg)',
  border: '1px solid var(--app-border)', borderRadius: 9, padding: '12px 15px',
  color: 'var(--app-text)', fontSize: 15, fontFamily: 'inherit', outline: 'none',
};
const labelStyle: CSSProperties = {
  fontSize: 13, color: 'var(--app-muted)', display: 'block', marginBottom: 6, fontWeight: 500,
};
const btnPrimary = (disabled: boolean): CSSProperties => ({
  padding: '11px 20px', borderRadius: 9, border: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  background: '#004AAD', color: '#FAFAFA', fontSize: 14, fontWeight: 600,
  fontFamily: 'inherit', opacity: disabled ? 0.6 : 1,
});
const btnGhost: CSSProperties = {
  padding: '9px 15px', borderRadius: 8, cursor: 'pointer',
  background: 'transparent', color: 'var(--app-muted)',
  border: '1px solid var(--app-border)',
  fontSize: 13, fontFamily: 'inherit',
};
