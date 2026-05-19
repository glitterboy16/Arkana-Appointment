import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { BiRightArrowAlt, BiPlus, BiTrash } from 'react-icons/bi';
import { ArkanaIcons, Btn } from '@/components/app/Shared';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, type Servicio, type Disponibilidad } from '@/lib/supabase';
import { InlineLoader, Spinner } from '@/components/app/Spinner';
import TimePicker from '@/components/app/TimePicker';
import BloqueosCalendar from '@/components/app/BloqueosCalendar';
import GaleriaUploader from '@/components/app/GaleriaUploader';
import LogoNegocioUploader from '@/components/app/LogoNegocioUploader';
import StyledSelect from '@/components/app/StyledSelect';
import MapPicker from '@/components/app/MapPicker';
import { logError } from '@/lib/errorLogger';

const CATEGORIAS = [
  { value: '', label: 'Sin categoría' },
  { value: 'Clínica dental', label: 'Clínica dental' },
  { value: 'Salón de belleza', label: 'Salón de belleza' },
  { value: 'Spa / Bienestar', label: 'Spa / Bienestar' },
  { value: 'Peluquería', label: 'Peluquería' },
  { value: 'Fisioterapia', label: 'Fisioterapia' },
  { value: 'Consultoría', label: 'Consultoría' },
  { value: 'Otro', label: 'Otro' },
];

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

interface TramoExcluido {
  id?: string;       // id en BD si ya estaba guardado
  hora_inicio: string;
  hora_fin: string;
}

interface DiaState {
  activo: boolean;
  hora_inicio: string;
  hora_fin: string;
  id?: string;
  tramos: TramoExcluido[];
}

interface BloqueoExcluidoRow {
  id: string;
  negocio_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

interface ExcepcionFechaRow {
  id: string;
  negocio_id: string;
  fecha: string;
  motivo: string | null;
}

function ProfileSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{
      background: 'var(--app-surface)', border: '1px solid var(--app-border)',
      borderRadius: 12, overflow: 'hidden', marginBottom: 14,
    }}>
      <div style={{
        padding: '14px 18px', borderBottom: '1px solid var(--app-border)',
        fontSize: 13, fontWeight: 700, color: 'var(--app-muted)', letterSpacing: '0.03em',
      }}>
        {title}
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  );
}

function ScheduleRow({ dia, index, state, onChange }: { dia: string; index: number; state: DiaState; onChange: (i: number, s: Partial<DiaState>) => void }) {
  const addTramo = () => {
    onChange(index, {
      tramos: [...state.tramos, { hora_inicio: '14:00', hora_fin: '15:00' }],
    });
  };
  const updateTramo = (idx: number, patch: Partial<TramoExcluido>) => {
    onChange(index, {
      tramos: state.tramos.map((t, i) => i === idx ? { ...t, ...patch } : t),
    });
  };
  const removeTramo = (idx: number) => {
    onChange(index, {
      tramos: state.tramos.filter((_, i) => i !== idx),
    });
  };

  return (
    <div style={{
      padding: '12px 0',
      borderBottom: '1px solid var(--app-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ width: 90, fontSize: 13, color: state.activo ? 'var(--app-text)' : 'var(--app-subtle)' }}>{dia}</div>
        <div
          onClick={() => onChange(index, { activo: !state.activo })}
          style={{
            width: 36, height: 20, borderRadius: 10, cursor: 'pointer', transition: 'all 200ms ease',
            background: state.activo ? '#648DFF' : 'var(--app-border)', position: 'relative', flexShrink: 0,
          }}
        >
          <div style={{
            width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute',
            top: 2, left: state.activo ? 18 : 2, transition: 'left 200ms ease',
          }} />
        </div>
        {state.activo ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <TimePicker
              value={state.hora_inicio}
              onChange={(v) => onChange(index, { hora_inicio: v })}
              ariaLabel={`${dia} hora de apertura`}
            />
            <span style={{ color: 'var(--app-subtle)', display: 'inline-flex', alignItems: 'center' }}><BiRightArrowAlt size={16} /></span>
            <TimePicker
              value={state.hora_fin}
              onChange={(v) => onChange(index, { hora_fin: v })}
              ariaLabel={`${dia} hora de cierre`}
            />
            <button
              type="button"
              onClick={addTramo}
              style={{
                marginLeft: 'auto', padding: '4px 10px', borderRadius: 6,
                border: '1px dashed var(--app-border)', background: 'transparent',
                color: 'var(--app-muted)', fontSize: 11, fontFamily: 'inherit',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
            >
              <BiPlus size={12} /> Añadir pausa
            </button>
          </div>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--app-subtle)' }}>Cerrado</span>
        )}
      </div>

      {state.activo && state.tramos.length > 0 && (
        <div style={{
          marginTop: 10, marginLeft: 104, display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {state.tramos.map((tramo, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
              padding: '6px 10px', borderRadius: 8,
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.20)',
            }}>
              <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 700, letterSpacing: '0.05em' }}>PAUSA</span>
              <TimePicker
                value={tramo.hora_inicio}
                onChange={(v) => updateTramo(i, { hora_inicio: v })}
                ariaLabel="Inicio de pausa"
              />
              <span style={{ color: 'var(--app-subtle)' }}><BiRightArrowAlt size={14} /></span>
              <TimePicker
                value={tramo.hora_fin}
                onChange={(v) => updateTramo(i, { hora_fin: v })}
                ariaLabel="Fin de pausa"
              />
              <button
                type="button"
                onClick={() => removeTramo(i)}
                aria-label="Quitar pausa"
                style={{
                  marginLeft: 'auto', width: 26, height: 26, borderRadius: 6,
                  border: 'none', background: 'transparent',
                  color: 'var(--app-muted)', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <BiTrash size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceTag({ servicio, onEdit }: { servicio: Servicio; onEdit: (s: Servicio) => void }) {
  const precio = servicio.precio_centimos === 0
    ? 'Gratis'
    : `${(servicio.precio_centimos / 100).toFixed(servicio.precio_centimos % 100 === 0 ? 0 : 2)}€`;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
      background: 'var(--app-surface)', border: '1px solid var(--app-border)',
      borderRadius: 9, marginBottom: 8,
    }}>
      <div style={{
        width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
        background: servicio.color ?? '#648DFF',
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text)' }}>{servicio.nombre}</div>
        <div style={{ fontSize: 11, color: 'var(--app-subtle)', marginTop: 1 }}>{servicio.duracion_min} min</div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#648DFF' }}>{precio}</div>
      <button
        type="button"
        onClick={() => onEdit(servicio)}
        style={{
          padding: '4px 10px', borderRadius: 6, border: '1px solid var(--app-border)',
          background: 'transparent', color: 'var(--app-muted)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        Editar
      </button>
    </div>
  );
}

interface ServicioFormState {
  nombre: string;
  duracion_min: string;
  precio_centimos: string;
  color: string;
}

const DEFAULT_COLORES = ['#648DFF', '#5CB6F9', '#22C55E', '#F59E0B', '#EF4444', '#A855F7', '#EC4899'];

export default function PerfilNegocioPage() {
  const { negocio, refreshNegocio } = useAuth();

  const [info, setInfo] = useState({ nombre: '', categoria: '', descripcion: '', telefono: '', direccion: '' });
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null);
  const [horario, setHorario] = useState<DiaState[]>(
    DIAS.map((_, i) => ({ activo: i < 5, hora_inicio: '09:00', hora_fin: '18:00', tramos: [] }))
  );
  const [fechasBloqueadas, setFechasBloqueadas] = useState<string[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showServicioForm, setShowServicioForm] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [servicioForm, setServicioForm] = useState<ServicioFormState>({ nombre: '', duracion_min: '30', precio_centimos: '0', color: '#648DFF' });

  const inputStyle: CSSProperties = {
    width: '100%', boxSizing: 'border-box', background: 'var(--app-input-bg)',
    border: '1px solid var(--app-border)', borderRadius: 8, padding: '10px 14px',
    color: 'var(--app-text)', fontSize: 13, fontFamily: 'inherit', outline: 'none',
  };

  useEffect(() => {
    if (!negocio) { setLoading(false); return; }

    setInfo({
      nombre: negocio.nombre ?? '',
      categoria: negocio.categoria ?? '',
      descripcion: negocio.descripcion ?? '',
      telefono: negocio.telefono ?? '',
      direccion: negocio.direccion ?? '',
    });
    setUbicacion(
      negocio.lat != null && negocio.lng != null ? { lat: negocio.lat, lng: negocio.lng } : null
    );

    const load = async () => {
      const [
        { data: svcs },
        { data: disp },
        { data: bloques },
        { data: excepciones },
      ] = await Promise.all([
        supabase.from('servicios').select('*').eq('negocio_id', negocio.id).eq('activo', true).order('created_at'),
        supabase.from('disponibilidad').select('*').eq('negocio_id', negocio.id),
        supabase.from('disponibilidad_bloques_excluidos').select('*').eq('negocio_id', negocio.id),
        supabase.from('disponibilidad_excepciones').select('*').eq('negocio_id', negocio.id),
      ]);

      setServicios((svcs as Servicio[]) ?? []);

      const bloquesRows = (bloques as BloqueoExcluidoRow[] | null) ?? [];
      if (disp && disp.length > 0) {
        setHorario(DIAS.map((_, i) => {
          const row = (disp as Disponibilidad[]).find((d) => d.dia_semana === i + 1);
          const tramosDia = bloquesRows
            .filter(b => b.dia_semana === i + 1)
            .map(b => ({ id: b.id, hora_inicio: b.hora_inicio, hora_fin: b.hora_fin }));
          if (row) return { activo: row.activo, hora_inicio: row.hora_inicio, hora_fin: row.hora_fin, id: row.id, tramos: tramosDia };
          return { activo: false, hora_inicio: '09:00', hora_fin: '18:00', tramos: tramosDia };
        }));
      } else if (bloquesRows.length > 0) {
        setHorario(prev => prev.map((h, i) => ({
          ...h,
          tramos: bloquesRows
            .filter(b => b.dia_semana === i + 1)
            .map(b => ({ id: b.id, hora_inicio: b.hora_inicio, hora_fin: b.hora_fin })),
        })));
      }

      setFechasBloqueadas(((excepciones as ExcepcionFechaRow[] | null) ?? []).map(e => e.fecha));

      setLoading(false);
    };

    load();
  }, [negocio]);

  const handleGuardar = async () => {
    if (!negocio) return;

    // Validación: tramos de pausa deben caer dentro del horario y tener hora_fin > hora_inicio
    for (let i = 0; i < DIAS.length; i++) {
      const d = horario[i];
      if (!d.activo) continue;
      if (d.hora_fin <= d.hora_inicio) {
        toast.error(`${DIAS[i]}: la hora de cierre debe ser posterior a la apertura`);
        return;
      }
      for (const t of d.tramos) {
        if (t.hora_fin <= t.hora_inicio) {
          toast.error(`${DIAS[i]}: una pausa tiene hora de fin igual o anterior al inicio`);
          return;
        }
        if (t.hora_inicio < d.hora_inicio || t.hora_fin > d.hora_fin) {
          toast.error(`${DIAS[i]}: una pausa cae fuera del horario del día`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const baseUpdate = {
        nombre: info.nombre,
        categoria: info.categoria || null,
        descripcion: info.descripcion || null,
        telefono: info.telefono || null,
        direccion: info.direccion || null,
      };

      // Primer intento con lat/lng. Si las columnas no existen (migración 007
      // sin correr), reintentamos sin ellas para no bloquear el guardado.
      let errNeg = (await supabase
        .from('negocios')
        .update({ ...baseUpdate, lat: ubicacion?.lat ?? null, lng: ubicacion?.lng ?? null })
        .eq('id', negocio.id)).error;

      // Detección amplia de "columna no existe":
      // - 42703: error de Postgres directo (CREATE/ALTER fail-fast)
      // - PGRST204: PostgREST no encuentra la columna en su schema cache
      // - regex: por si Supabase cambia formato
      const colMissing =
        errNeg && (
          errNeg.code === '42703' ||
          errNeg.code === 'PGRST204' ||
          /column .* does not exist/i.test(errNeg.message) ||
          /could not find the .* column/i.test(errNeg.message)
        );

      if (colMissing) {
        // Reintento sin lat/lng. Avisamos al final para que Angel corra la migración.
        const retry = await supabase.from('negocios').update(baseUpdate).eq('id', negocio.id);
        errNeg = retry.error;
        if (!errNeg) {
          toast('Ubicación no guardada: ejecuta la migración 007 en Supabase.', { icon: '⚠️', duration: 6000 });
        }
      }

      if (errNeg) {
        console.error('[Arkana] error guardando negocio:', errNeg);
        await logError('perfil.negocio.save', errNeg, { negocio_id: negocio.id });
        toast.error(`Error guardando: ${errNeg.message}`);
        return;
      }

      // 1. Disponibilidad por día. Cada error sube un toast y aborta para que
      // el usuario sepa qué pasó en vez de ver "guardado" sin que se guardara.
      for (let i = 0; i < DIAS.length; i++) {
        const d = horario[i];
        const payload = {
          negocio_id: negocio.id,
          dia_semana: i + 1,
          activo: d.activo,
          hora_inicio: d.hora_inicio,
          hora_fin: d.hora_fin,
        };
        if (d.id) {
          const { error } = await supabase.from('disponibilidad').update(payload).eq('id', d.id);
          if (error) {
            console.error('[Arkana] error guardando disponibilidad:', error);
            toast.error(`Error en horario de ${DIAS[i]}: ${error.message}`);
            return;
          }
        } else {
          const { data: inserted, error } = await supabase.from('disponibilidad').insert(payload).select().single();
          if (error) {
            console.error('[Arkana] error insertando disponibilidad:', error);
            toast.error(`Error en horario de ${DIAS[i]}: ${error.message}`);
            return;
          }
          if (inserted) {
            setHorario((prev) => prev.map((h, idx) => idx === i ? { ...h, id: (inserted as Disponibilidad).id } : h));
          }
        }
      }

      // 2. Tramos excluidos: borramos todos y reinsertamos (más simple que diff)
      const delBloques = await supabase.from('disponibilidad_bloques_excluidos').delete().eq('negocio_id', negocio.id);
      if (delBloques.error) {
        console.error('[Arkana] error borrando bloques:', delBloques.error);
        toast.error(`Error guardando pausas: ${delBloques.error.message}`);
        return;
      }
      const nuevosBloques = horario.flatMap((d, i) =>
        d.activo
          ? d.tramos.map(t => ({
              negocio_id: negocio.id,
              dia_semana: i + 1,
              hora_inicio: t.hora_inicio,
              hora_fin: t.hora_fin,
            }))
          : [],
      );
      if (nuevosBloques.length > 0) {
        const insBloques = await supabase.from('disponibilidad_bloques_excluidos').insert(nuevosBloques);
        if (insBloques.error) {
          console.error('[Arkana] error insertando bloques:', insBloques.error);
          toast.error(`Error guardando pausas: ${insBloques.error.message}`);
          return;
        }
      }

      // 3. Días bloqueados: mismo enfoque (delete + insert)
      const delExc = await supabase.from('disponibilidad_excepciones').delete().eq('negocio_id', negocio.id);
      if (delExc.error) {
        console.error('[Arkana] error borrando excepciones:', delExc.error);
        toast.error(`Error guardando días bloqueados: ${delExc.error.message}`);
        return;
      }
      if (fechasBloqueadas.length > 0) {
        const insExc = await supabase.from('disponibilidad_excepciones').insert(
          fechasBloqueadas.map(f => ({ negocio_id: negocio.id, fecha: f })),
        );
        if (insExc.error) {
          console.error('[Arkana] error insertando excepciones:', insExc.error);
          toast.error(`Error guardando días bloqueados: ${insExc.error.message}`);
          return;
        }
      }

      await refreshNegocio();
      toast.success('Cambios guardados');
    } finally {
      setSaving(false);
    }
  };

  const toggleFechaBloqueada = (fecha: string) => {
    setFechasBloqueadas(prev =>
      prev.includes(fecha) ? prev.filter(f => f !== fecha) : [...prev, fecha],
    );
  };

  const openNewServicio = () => {
    setEditingServicio(null);
    setServicioForm({ nombre: '', duracion_min: '30', precio_centimos: '0', color: '#648DFF' });
    setShowServicioForm(true);
  };

  const openEditServicio = (s: Servicio) => {
    setEditingServicio(s);
    setServicioForm({
      nombre: s.nombre,
      duracion_min: String(s.duracion_min),
      precio_centimos: String(s.precio_centimos / 100),
      color: s.color ?? '#648DFF',
    });
    setShowServicioForm(true);
  };

  const handleSaveServicio = async () => {
    if (!negocio) return;
    const payload = {
      negocio_id: negocio.id,
      nombre: servicioForm.nombre.trim(),
      duracion_min: parseInt(servicioForm.duracion_min, 10),
      precio_centimos: Math.round(parseFloat(servicioForm.precio_centimos) * 100),
      color: servicioForm.color,
      activo: true,
    };

    if (!payload.nombre) { toast.error('El nombre es obligatorio'); return; }

    if (editingServicio) {
      const { error } = await supabase.from('servicios').update(payload).eq('id', editingServicio.id);
      if (error) { toast.error('Error guardando servicio'); return; }
      setServicios((prev) => prev.map((s) => s.id === editingServicio.id ? { ...s, ...payload } : s));
    } else {
      const { data, error } = await supabase.from('servicios').insert(payload).select().single();
      if (error) { toast.error('Error creando servicio'); return; }
      setServicios((prev) => [...prev, data as Servicio]);
    }

    setShowServicioForm(false);
    toast.success(editingServicio ? 'Servicio actualizado' : 'Servicio creado');
  };

  const handleDeleteServicio = async (id: string) => {
    const { error } = await supabase.from('servicios').update({ activo: false }).eq('id', id);
    if (!error) setServicios((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', background: 'var(--app-bg)' }}>
        <InlineLoader label="Cargando perfil del negocio…" minHeight="60vh" />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--app-bg)' }}>
      <div style={{
        padding: '18px clamp(14px, 4vw, 28px)', borderBottom: '1px solid var(--app-border)',
        background: 'var(--app-bg-elevated)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.01em', fontFamily: "'SF Pro Display','Inter',sans-serif" }}>
          Perfil del negocio
        </div>
        <Btn variant="primary" size="sm" onClick={handleGuardar} disabled={saving}>
          {saving && <Spinner size={12} color="#FAFAFA" trackColor="rgba(250,250,250,0.35)" />}
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </Btn>
      </div>

      <div className="ark-page-fade ark-perfil-grid" style={{ padding: '20px clamp(14px, 4vw, 28px)', width: '100%' }}>

        <div className="ark-perfil-col-left">

        <ProfileSection title="Foto del negocio">
          {negocio ? (
            <LogoNegocioUploader negocioId={negocio.id} logoUrl={negocio.logo_url} nombre={info.nombre || negocio.nombre} />
          ) : null}
        </ProfileSection>

        <ProfileSection title="Información general">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: 11, color: 'var(--app-muted)', display: 'block', marginBottom: 4 }}>Nombre del negocio</label>
                <input style={inputStyle} value={info.nombre} onChange={(e) => setInfo({ ...info, nombre: e.target.value })} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: 11, color: 'var(--app-muted)', display: 'block', marginBottom: 4 }}>Categoría</label>
                <StyledSelect
                  value={info.categoria}
                  onChange={(v) => setInfo({ ...info, categoria: v })}
                  options={CATEGORIAS}
                  placeholder="Sin categoría"
                  ariaLabel="Categoría del negocio"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: 11, color: 'var(--app-muted)', display: 'block', marginBottom: 4 }}>Teléfono</label>
                <input style={inputStyle} value={info.telefono} onChange={(e) => setInfo({ ...info, telefono: e.target.value })} placeholder="+34 600 000 000" />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: 11, color: 'var(--app-muted)', display: 'block', marginBottom: 4 }}>Dirección</label>
                <input style={inputStyle} value={info.direccion} onChange={(e) => setInfo({ ...info, direccion: e.target.value })} placeholder="Calle, ciudad" />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--app-muted)', display: 'block', marginBottom: 4 }}>Descripción</label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: 72, lineHeight: 1.5 }}
                value={info.descripcion}
                onChange={(e) => setInfo({ ...info, descripcion: e.target.value })}
                placeholder="Describe tu negocio brevemente"
              />
            </div>
          </div>
        </ProfileSection>

        <ProfileSection title="Ubicación en el mapa">
          <div style={{ fontSize: 12, color: 'var(--app-subtle)', marginBottom: 12, lineHeight: 1.5 }}>
            Busca tu dirección o pulsa el mapa para colocar el pin exacto. Esta es la ubicación que verán tus clientes.
          </div>
          <MapPicker
            value={ubicacion}
            onChange={setUbicacion}
            direccionInicial={info.direccion}
          />
        </ProfileSection>

        <ProfileSection title="Horario de atención">
          <div style={{ fontSize: 12, color: 'var(--app-subtle)', marginBottom: 6, lineHeight: 1.5 }}>
            Pulsa cualquier hora para elegir una distinta. Puedes añadir pausas dentro de cada día.
          </div>
          {DIAS.map((dia, i) => (
            <ScheduleRow
              key={dia}
              dia={dia}
              index={i}
              state={horario[i]}
              onChange={(idx, partial) => setHorario((prev) => prev.map((h, j) => j === idx ? { ...h, ...partial } : h))}
            />
          ))}
        </ProfileSection>

        </div>{/* /col-left */}

        <div className="ark-perfil-col-right">

        <ProfileSection title="Galería">
          {negocio ? <GaleriaUploader negocioId={negocio.id} max={6} /> : null}
        </ProfileSection>

        <ProfileSection title="Días que no trabajas">
          <div style={{ fontSize: 12, color: 'var(--app-subtle)', marginBottom: 14, lineHeight: 1.5 }}>
            Marca días puntuales (vacaciones, festivos…) en los que tu negocio estará cerrado. Los clientes no podrán reservar en esos días.
          </div>
          <BloqueosCalendar
            fechasBloqueadas={fechasBloqueadas}
            onToggle={toggleFechaBloqueada}
          />
        </ProfileSection>

        <ProfileSection title="Servicios">
          {servicios.length === 0 && !showServicioForm && (
            <div style={{ fontSize: 13, color: 'var(--app-subtle)', marginBottom: 12 }}>
              Aún no tienes servicios. Añade uno para que tus clientes puedan reservar.
            </div>
          )}
          {servicios.map((s) => (
            <ServiceTag key={s.id} servicio={s} onEdit={openEditServicio} />
          ))}

          {showServicioForm && (
            <div style={{
              background: 'var(--app-surface-hover)', border: '1px solid var(--app-border)',
              borderRadius: 10, padding: '16px', marginBottom: 10,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--app-text)', marginBottom: 12 }}>
                {editingServicio ? 'Editar servicio' : 'Nuevo servicio'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--app-muted)', display: 'block', marginBottom: 4 }}>Nombre</label>
                  <input style={inputStyle} value={servicioForm.nombre} onChange={(e) => setServicioForm({ ...servicioForm, nombre: e.target.value })} placeholder="Ej. Corte de pelo" />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: 'var(--app-muted)', display: 'block', marginBottom: 4 }}>Duración (min)</label>
                    <input style={inputStyle} type="number" min="5" step="5" value={servicioForm.duracion_min} onChange={(e) => setServicioForm({ ...servicioForm, duracion_min: e.target.value })} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: 'var(--app-muted)', display: 'block', marginBottom: 4 }}>Precio (€)</label>
                    <input style={inputStyle} type="number" min="0" step="0.5" value={servicioForm.precio_centimos} onChange={(e) => setServicioForm({ ...servicioForm, precio_centimos: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--app-muted)', display: 'block', marginBottom: 8 }}>Color</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {DEFAULT_COLORES.map((c) => (
                      <div
                        key={c}
                        onClick={() => setServicioForm({ ...servicioForm, color: c })}
                        style={{
                          width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer',
                          border: servicioForm.color === c ? '2px solid var(--app-text)' : '2px solid transparent',
                          transition: 'border 150ms',
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <Btn variant="primary" size="sm" onClick={handleSaveServicio}>Guardar</Btn>
                  {editingServicio && (
                    <Btn variant="ghost" size="sm" onClick={() => { if (editingServicio) handleDeleteServicio(editingServicio.id); setShowServicioForm(false); }}>
                      Eliminar
                    </Btn>
                  )}
                  <Btn variant="ghost" size="sm" onClick={() => setShowServicioForm(false)}>Cancelar</Btn>
                </div>
              </div>
            </div>
          )}

          {!showServicioForm && (
            <Btn variant="ghost" size="sm" style={{ marginTop: 6 }} onClick={openNewServicio}>
              {ArkanaIcons.plus} Añadir servicio
            </Btn>
          )}
        </ProfileSection>

        </div>{/* /col-right */}
      </div>
    </div>
  );
}
