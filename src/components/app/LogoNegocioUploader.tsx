import { useRef, useState, type CSSProperties } from 'react';
import toast from 'react-hot-toast';
import { BiCamera, BiTrash } from 'react-icons/bi';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from './Spinner';

interface LogoNegocioUploaderProps {
  negocioId: string;
  logoUrl: string | null;
  nombre: string;
}

const MAX_BYTES = 4 * 1024 * 1024;

export default function LogoNegocioUploader({ negocioId, logoUrl, nombre }: LogoNegocioUploaderProps) {
  const { usuario, refreshNegocio } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);

  const handlePick = () => fileInputRef.current?.click();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !usuario) return;

    if (!file.type.startsWith('image/')) { toast.error('Selecciona una imagen'); return; }
    if (file.size > MAX_BYTES) { toast.error('La imagen no debe superar 4 MB'); return; }

    setSubiendo(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      // Subimos en la carpeta del usuario dueño del negocio para cumplir la RLS
      // del bucket 'avatares' (auth.uid()::text = primer segmento del path).
      const path = `${usuario.id}/logo-negocio-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('avatares')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (upErr) {
        toast.error(`No se pudo subir: ${upErr.message}`);
        return;
      }

      const { data: urlData } = supabase.storage.from('avatares').getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      const { error: updErr } = await supabase
        .from('negocios')
        .update({ logo_url: publicUrl })
        .eq('id', negocioId);

      if (updErr) {
        toast.error(`Imagen subida pero no se pudo guardar: ${updErr.message}`);
        return;
      }

      await refreshNegocio();
      toast.success('Foto actualizada');
    } finally {
      setSubiendo(false);
    }
  };

  const handleRemove = async () => {
    setSubiendo(true);
    try {
      const { error } = await supabase.from('negocios').update({ logo_url: null }).eq('id', negocioId);
      if (error) { toast.error('No se pudo quitar la foto'); return; }
      await refreshNegocio();
      toast.success('Foto eliminada');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
      <div style={{ position: 'relative' }}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            style={{
              width: 96, height: 96, borderRadius: 18, objectFit: 'cover',
              border: '2px solid var(--app-border)', display: 'block',
            }}
          />
        ) : (
          <div style={{
            width: 96, height: 96, borderRadius: 18,
            background: 'linear-gradient(135deg, #004AAD 0%, #648DFF 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 38, fontWeight: 700, color: '#FAFAFA',
            boxShadow: '0 6px 24px rgba(100,141,255,0.18)',
          }}>
            {(nombre || '?').charAt(0).toUpperCase()}
          </div>
        )}
        {subiendo && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 18,
            background: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Spinner size={28} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button type="button" onClick={handlePick} disabled={subiendo} style={btnPrimary(subiendo)}>
          <BiCamera size={16} />
          {logoUrl ? 'Cambiar foto' : 'Subir foto'}
        </button>
        {logoUrl && (
          <button type="button" onClick={handleRemove} disabled={subiendo} style={btnGhost(subiendo)}>
            <BiTrash size={14} /> Quitar
          </button>
        )}
        <div style={{ fontSize: 11, color: 'var(--app-subtle)', marginTop: 2 }}>
          Esta es la foto que verán tus clientes.
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}

const btnPrimary = (loading: boolean): CSSProperties => ({
  padding: '10px 16px', borderRadius: 9, cursor: loading ? 'not-allowed' : 'pointer',
  background: '#004AAD', color: '#FAFAFA', border: 'none',
  fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
  display: 'inline-flex', alignItems: 'center', gap: 6,
  opacity: loading ? 0.5 : 1,
});
const btnGhost = (loading: boolean): CSSProperties => ({
  padding: '9px 14px', borderRadius: 9, cursor: loading ? 'not-allowed' : 'pointer',
  background: 'transparent', color: 'var(--app-muted)',
  border: '1px solid var(--app-border)',
  fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
  display: 'inline-flex', alignItems: 'center', gap: 6,
  opacity: loading ? 0.5 : 1,
});
