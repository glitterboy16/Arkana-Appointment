import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';
import { ArkanaIcons, Btn } from '@/components/app/Shared';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, type Servicio, type Disponibilidad } from '@/lib/supabase';
import { InlineLoader, Spinner } from '@/components/app/Spinner';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const HORAS_INICIO = ['06:00','07:00','08:00','09:00','10:00','11:00'];
const HORAS_FIN = ['14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'];

interface DiaState {
  activo: boolean;
  hora_inicio: string;
  hora_fin: string;
  id?: string;
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
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0',
      borderBottom: '1px solid var(--app-border)',
    }}>
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
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={state.hora_inicio}
            onChange={(e) => onChange(index, { hora_inicio: e.target.value })}
            style={{
              background: 'var(--app-input-bg)', border: '1px solid var(--app-border)',
              borderRadius: 6, padding: '5px 8px', color: 'var(--app-text)', fontSize: 12, fontFamily: 'inherit', outline: 'none',
            }}
          >
            {HORAS_INICIO.map((t) => <option key={t}>{t}</option>)}
          </select>
          <span style={{ color: 'var(--app-subtle)', fontSize: 12 }}>→</span>
          <select
            value={state.hora_fin}
            onChange={(e) => onChange(index, { hora_fin: e.target.value })}
            style={{
              background: 'var(--app-input-bg)', border: '1px solid var(--app-border)',
              borderRadius: 6, padding: '5px 8px', color: 'var(--app-text)', fontSize: 12, fontFamily: 'inherit', outline: 'none',
            }}
          >
            {HORAS_FIN.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      ) : (
        <span style={{ fontSize: 12, color: 'var(--app-subtle)' }}>Cerrado</span>
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
  const [horario, setHorario] = useState<DiaState[]>(
    DIAS.map((_, i) => ({ activo: i < 5, hora_inicio: '09:00', hora_fin: '18:00' }))
  );
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

    const load = async () => {
      const [{ data: svcs }, { data: disp }] = await Promise.all([
        supabase.from('servicios').select('*').eq('negocio_id', negocio.id).eq('activo', true).order('created_at'),
        supabase.from('disponibilidad').select('*').eq('negocio_id', negocio.id),
      ]);

      setServicios((svcs as Servicio[]) ?? []);

      if (disp && disp.length > 0) {
        setHorario(DIAS.map((_, i) => {
          const row = (disp as Disponibilidad[]).find((d) => d.dia_semana === i + 1);
          if (row) return { activo: row.activo, hora_inicio: row.hora_inicio, hora_fin: row.hora_fin, id: row.id };
          return { activo: i < 5, hora_inicio: '09:00', hora_fin: '18:00' };
        }));
      }

      setLoading(false);
    };

    load();
  }, [negocio]);

  const handleGuardar = async () => {
    if (!negocio) return;
    setSaving(true);
    try {
      const { error: errNeg } = await supabase
        .from('negocios')
        .update({
          nombre: info.nombre,
          categoria: info.categoria || null,
          descripcion: info.descripcion || null,
          telefono: info.telefono || null,
          direccion: info.direccion || null,
        })
        .eq('id', negocio.id);

      if (errNeg) { toast.error('Error guardando información'); return; }

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
          await supabase.from('disponibilidad').update(payload).eq('id', d.id);
        } else {
          const { data: inserted } = await supabase.from('disponibilidad').insert(payload).select().single();
          if (inserted) {
            setHorario((prev) => prev.map((h, idx) => idx === i ? { ...h, id: (inserted as Disponibilidad).id } : h));
          }
        }
      }

      await refreshNegocio();
      toast.success('Cambios guardados');
    } finally {
      setSaving(false);
    }
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

  const qrUrl = negocio ? `${window.location.origin}/n/${negocio.slug}` : '';

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

      <div className="ark-page-fade" style={{ padding: '20px clamp(14px, 4vw, 28px)', maxWidth: 720, width: '100%' }}>

        <ProfileSection title="Información general">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: 11, color: 'var(--app-muted)', display: 'block', marginBottom: 4 }}>Nombre del negocio</label>
                <input style={inputStyle} value={info.nombre} onChange={(e) => setInfo({ ...info, nombre: e.target.value })} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: 11, color: 'var(--app-muted)', display: 'block', marginBottom: 4 }}>Categoría</label>
                <select
                  style={{ ...inputStyle, appearance: 'none' }}
                  value={info.categoria}
                  onChange={(e) => setInfo({ ...info, categoria: e.target.value })}
                >
                  <option value="">Sin categoría</option>
                  <option value="Clínica dental">Clínica dental</option>
                  <option value="Salón de belleza">Salón de belleza</option>
                  <option value="Spa / Bienestar">Spa / Bienestar</option>
                  <option value="Peluquería">Peluquería</option>
                  <option value="Fisioterapia">Fisioterapia</option>
                  <option value="Consultoría">Consultoría</option>
                  <option value="Otro">Otro</option>
                </select>
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

        <ProfileSection title="Horario de atención">
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

        <ProfileSection title="Código QR">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{
              width: 96, height: 96, background: '#FAFAFA', borderRadius: 12, padding: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {qrUrl && <QRCode value={qrUrl} size={80} bgColor="#FAFAFA" fgColor="#050A30" />}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--app-text)', marginBottom: 6 }}>Tu QR único</div>
              <div style={{ fontSize: 12, color: 'var(--app-muted)', lineHeight: 1.5, marginBottom: 6 }}>
                {qrUrl}
              </div>
              <div style={{ fontSize: 12, color: 'var(--app-subtle)', lineHeight: 1.5, marginBottom: 12 }}>
                Comparte este código para que tus clientes reserven directamente sin registrarse.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="primary" size="sm" onClick={() => navigator.clipboard.writeText(qrUrl).then(() => toast.success('Enlace copiado'))}>
                  Copiar enlace
                </Btn>
                <Btn variant="ghost" size="sm" onClick={() => window.open(qrUrl, '_blank')}>
                  Abrir página
                </Btn>
              </div>
            </div>
          </div>
        </ProfileSection>
      </div>
    </div>
  );
}
