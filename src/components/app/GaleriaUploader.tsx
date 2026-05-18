import { useEffect, useRef, useState, type CSSProperties } from 'react';
import toast from 'react-hot-toast';
import { BiCamera, BiTrash, BiX } from 'react-icons/bi';
import { supabase } from '@/lib/supabase';
import { logError } from '@/lib/errorLogger';
import { Spinner } from './Spinner';

interface NegocioFoto {
  id: string;
  foto_url: string;
  orden: number;
}

interface GaleriaUploaderProps {
  negocioId: string;
  max?: number;
}

const MAX_BYTES = 5 * 1024 * 1024;

export default function GaleriaUploader({ negocioId, max = 6 }: GaleriaUploaderProps) {
  const [fotos, setFotos] = useState<NegocioFoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [slotActivo, setSlotActivo] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('negocio_fotos')
        .select('id, foto_url, orden')
        .eq('negocio_id', negocioId)
        .order('orden');
      if (cancelled) return;
      setFotos((data as NegocioFoto[]) ?? []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [negocioId]);

  const pickSlot = (slot: number) => {
    setSlotActivo(slot);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) { setSlotActivo(null); return; }

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      setSlotActivo(null);
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error('La imagen no debe superar 5 MB');
      setSlotActivo(null);
      return;
    }
    if (fotos.length >= max) {
      toast.error(`Máximo ${max} fotos`);
      setSlotActivo(null);
      return;
    }

    setSubiendo(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const path = `${negocioId}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('fotos-negocios')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (upErr) {
        await logError('galeria.upload', upErr, { negocioId });
        const hint = /bucket.*not.*found/i.test(upErr.message)
          ? ' (ejecuta la migración 010 en Supabase para crear el bucket)'
          : '';
        toast.error(`No se pudo subir: ${upErr.message}${hint}`);
        return;
      }

      const { data: urlData } = supabase.storage.from('fotos-negocios').getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      const orden = slotActivo ?? fotos.length;
      const { data: insertedRows, error: insErr } = await supabase
        .from('negocio_fotos')
        .insert({ negocio_id: negocioId, foto_url: publicUrl, orden })
        .select('id, foto_url, orden');

      if (insErr || !insertedRows || insertedRows.length === 0) {
        await logError('galeria.persist', insErr, { negocioId });
        toast.error(`Foto subida pero no se pudo registrar: ${insErr?.message ?? 'sin filas'}`);
        return;
      }

      setFotos(prev => [...prev, insertedRows[0] as NegocioFoto].sort((a, b) => a.orden - b.orden));
      toast.success('Foto añadida');
    } finally {
      setSubiendo(false);
      setSlotActivo(null);
    }
  };

  const handleRemove = async (foto: NegocioFoto) => {
    const { error } = await supabase.from('negocio_fotos').delete().eq('id', foto.id);
    if (error) {
      toast.error('No se pudo eliminar la foto');
      return;
    }
    setFotos(prev => prev.filter(f => f.id !== foto.id));
    toast.success('Foto eliminada');
    // Best-effort: borrar el objeto del bucket (no rompemos si falla)
    try {
      const url = new URL(foto.foto_url);
      const idx = url.pathname.indexOf('/fotos-negocios/');
      if (idx >= 0) {
        const objectPath = url.pathname.slice(idx + '/fotos-negocios/'.length);
        await supabase.storage.from('fotos-negocios').remove([objectPath]);
      }
    } catch {
      /* ignorar */
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--app-muted)', fontSize: 13 }}>
        <Spinner size={16} />
        Cargando galería…
      </div>
    );
  }

  const slots: Array<NegocioFoto | null> = Array.from({ length: max }).map((_, i) => fotos[i] ?? null);

  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--app-subtle)', marginBottom: 12 }}>
        Sube hasta {max} fotos de tu local, servicios o lo que quieras mostrar a tus clientes.
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10,
      }}>
        {slots.map((foto, i) => (
          <div key={i} style={cardStyle}>
            {foto ? (
              <>
                <img
                  src={foto.foto_url}
                  alt=""
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemove(foto)}
                  aria-label="Eliminar foto"
                  style={removeBtn}
                >
                  <BiX size={18} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => pickSlot(i)}
                disabled={subiendo}
                style={addBtn}
              >
                {subiendo && slotActivo === i ? (
                  <Spinner size={22} />
                ) : (
                  <>
                    <BiCamera size={26} />
                    <span style={{ fontSize: 11, fontWeight: 600, marginTop: 4 }}>Añadir foto</span>
                  </>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {fotos.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--app-subtle)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <BiTrash size={12} /> Click en la X para quitar una foto
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}

const cardStyle: CSSProperties = {
  position: 'relative',
  aspectRatio: '1 / 1',
  borderRadius: 12,
  background: 'var(--app-surface)',
  border: '1px solid var(--app-border)',
  overflow: 'hidden',
};

const addBtn: CSSProperties = {
  position: 'absolute', inset: 0,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  background: 'transparent', border: 'none',
  color: 'var(--app-muted)', cursor: 'pointer', fontFamily: 'inherit',
  transition: 'background 150ms, color 150ms',
};

const removeBtn: CSSProperties = {
  position: 'absolute', top: 6, right: 6,
  width: 28, height: 28, borderRadius: '50%',
  background: 'rgba(0,0,0,0.6)', color: '#FAFAFA', border: 'none',
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  backdropFilter: 'blur(4px)',
};
