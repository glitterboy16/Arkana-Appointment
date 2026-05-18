import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { BiX } from 'react-icons/bi';
import { supabase, type Servicio, type Disponibilidad, type Negocio } from '@/lib/supabase';
import { Spinner } from './Spinner';
import { Btn } from './Shared';
import StyledSelect from './StyledSelect';
import { logError } from '@/lib/errorLogger';

interface NuevaCitaModalProps {
  negocio: Negocio;
  onClose: () => void;
  onCreated: () => void;
}

interface BloqueExcluido {
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

const HORA_MAX_DIAS_ADELANTE = 30;

function generarSlots(disp: Disponibilidad, duracion: number, bloques: BloqueExcluido[]): string[] {
  const slots: string[] = [];
  const [hI, mI] = disp.hora_inicio.split(':').map(Number);
  const [hF, mF] = disp.hora_fin.split(':').map(Number);
  const minI = hI * 60 + mI;
  const minF = hF * 60 + mF;

  for (let m = minI; m + duracion <= minF; m += duracion) {
    const slotStart = m;
    const slotEnd = m + duracion;
    // ¿Cae dentro de un bloque excluido?
    const dentroBloque = bloques.some(b => {
      const [bhI, bmI] = b.hora_inicio.split(':').map(Number);
      const [bhF, bmF] = b.hora_fin.split(':').map(Number);
      const bMinI = bhI * 60 + bmI;
      const bMinF = bhF * 60 + bmF;
      return slotStart < bMinF && slotEnd > bMinI;
    });
    if (dentroBloque) continue;
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
  }
  return slots;
}

export default function NuevaCitaModal({ negocio, onClose, onCreated }: NuevaCitaModalProps) {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad[]>([]);
  const [bloques, setBloques] = useState<BloqueExcluido[]>([]);
  const [diasBloqueados, setDiasBloqueados] = useState<string[]>([]);
  const [citasOcupadas, setCitasOcupadas] = useState<Array<{ fecha: string; hora_inicio: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [servicioId, setServicioId] = useState('');
  const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [hora, setHora] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    let cancelled = false;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    (async () => {
      const [svc, disp, bloq, exc, cit] = await Promise.all([
        supabase.from('servicios').select('*').eq('negocio_id', negocio.id).eq('activo', true).order('created_at'),
        supabase.from('disponibilidad').select('*').eq('negocio_id', negocio.id),
        supabase.from('disponibilidad_bloques_excluidos').select('dia_semana, hora_inicio, hora_fin').eq('negocio_id', negocio.id),
        supabase.from('disponibilidad_excepciones').select('fecha').eq('negocio_id', negocio.id),
        supabase.from('citas').select('fecha, hora_inicio').eq('negocio_id', negocio.id).neq('estado', 'cancelled'),
      ]);
      if (cancelled) return;
      setServicios((svc.data as Servicio[]) ?? []);
      setDisponibilidad((disp.data as Disponibilidad[]) ?? []);
      setBloques((bloq.data as BloqueExcluido[]) ?? []);
      setDiasBloqueados(((exc.data as Array<{ fecha: string }> | null) ?? []).map(e => e.fecha));
      setCitasOcupadas((cit.data as Array<{ fecha: string; hora_inicio: string }>) ?? []);
      if (svc.data && svc.data.length > 0) setServicioId((svc.data[0] as Servicio).id);
      setLoading(false);
    })();

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelled = true;
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [negocio.id, onClose]);

  const servicioSel = servicios.find(s => s.id === servicioId);

  // Día de la semana ISO (1=Lunes ... 7=Domingo)
  const diaSemanaIso = useMemo(() => {
    const [y, m, d] = fecha.split('-').map(Number);
    const js = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Dom ... 6=Sab
    return js === 0 ? 7 : js;
  }, [fecha]);

  const slotsDisponibles = useMemo(() => {
    if (!servicioSel) return [];
    if (diasBloqueados.includes(fecha)) return [];
    const disp = disponibilidad.find(d => d.dia_semana === diaSemanaIso && d.activo);
    if (!disp) return [];
    const bloquesDia = bloques.filter(b => b.dia_semana === diaSemanaIso);
    const todos = generarSlots(disp, servicioSel.duracion_min, bloquesDia);
    const ocupadosHoy = citasOcupadas.filter(c => c.fecha === fecha).map(c => c.hora_inicio.slice(0, 5));
    return todos.filter(s => !ocupadosHoy.includes(s));
  }, [servicioSel, fecha, disponibilidad, bloques, diasBloqueados, citasOcupadas, diaSemanaIso]);

  const fechasOpciones = useMemo(() => {
    const out: { value: string; label: string }[] = [];
    const today = new Date();
    for (let i = 0; i < HORA_MAX_DIAS_ADELANTE; i++) {
      const d = addDays(today, i);
      const value = format(d, 'yyyy-MM-dd');
      const label = i === 0
        ? `Hoy · ${format(d, "d 'de' MMMM", { locale: es })}`
        : i === 1
          ? `Mañana · ${format(d, "d 'de' MMMM", { locale: es })}`
          : format(d, "EEEE d 'de' MMM", { locale: es });
      out.push({ value, label });
    }
    return out;
  }, []);

  const submit = async () => {
    if (!servicioId || !fecha || !hora) {
      toast.error('Selecciona servicio, fecha y hora');
      return;
    }
    if (!clienteNombre.trim()) { toast.error('Introduce el nombre del cliente'); return; }
    if (!clienteTelefono.trim()) { toast.error('Introduce el teléfono del cliente'); return; }

    setSaving(true);
    const horaConSec = hora.length === 5 ? `${hora}:00` : hora;
    const { error } = await supabase.from('citas').insert({
      negocio_id: negocio.id,
      servicio_id: servicioId,
      cliente_id: null,
      cliente_nombre: clienteNombre.trim(),
      cliente_telefono: clienteTelefono.trim(),
      cliente_email: null,
      fecha,
      hora_inicio: horaConSec,
      estado: 'confirmed', // creada por el propio negocio → ya está confirmada
      notas: notas.trim() || null,
    });
    setSaving(false);

    if (error) {
      await logError('cita.create.manual', error, { negocio_id: negocio.id, servicio_id: servicioId, fecha, hora });
      toast.error(`No se pudo crear la cita: ${error.message}`);
      return;
    }

    toast.success('Cita creada');
    onCreated();
    onClose();
  };

  return createPortal(
    <div onClick={onClose} style={overlay}>
      <div onClick={(e) => e.stopPropagation()} style={modal}>
        <div style={modalHeader}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--app-text)' }}>Nueva cita manual</div>
          <button onClick={onClose} aria-label="Cerrar" style={closeBtn}><BiX size={20} /></button>
        </div>

        {loading ? (
          <div style={{ padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spinner size={28} />
          </div>
        ) : servicios.length === 0 ? (
          <div style={{ padding: 24, fontSize: 13, color: 'var(--app-muted)', textAlign: 'center' }}>
            Aún no has creado servicios. Ve a Perfil del negocio → Servicios y crea al menos uno.
          </div>
        ) : (
          <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Servicio">
              <StyledSelect
                value={servicioId}
                onChange={(v) => { setServicioId(v); setHora(''); }}
                options={servicios.map(s => ({
                  value: s.id,
                  label: `${s.nombre} · ${s.duracion_min} min · ${(s.precio_centimos / 100).toFixed(s.precio_centimos % 100 === 0 ? 0 : 2)}€`,
                }))}
                ariaLabel="Servicio"
              />
            </Field>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <Field label="Fecha">
                  <StyledSelect
                    value={fecha}
                    onChange={(v) => { setFecha(v); setHora(''); }}
                    options={fechasOpciones}
                    ariaLabel="Fecha"
                  />
                </Field>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <Field label="Hora">
                  {slotsDisponibles.length === 0 ? (
                    <div style={{ ...input, color: 'var(--app-subtle)', fontSize: 12 }}>
                      Sin slots libres para esta fecha
                    </div>
                  ) : (
                    <StyledSelect
                      value={hora}
                      onChange={setHora}
                      options={[
                        { value: '', label: '— Selecciona —' },
                        ...slotsDisponibles.map(s => ({ value: s, label: s })),
                      ]}
                      ariaLabel="Hora"
                    />
                  )}
                </Field>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <Field label="Nombre del cliente">
                  <input style={input} value={clienteNombre} onChange={(e) => setClienteNombre(e.target.value)} placeholder="Ej. Lucía García" />
                </Field>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <Field label="Teléfono del cliente">
                  <input style={input} value={clienteTelefono} onChange={(e) => setClienteTelefono(e.target.value)} placeholder="612345678" />
                </Field>
              </div>
            </div>

            <Field label="Notas (opcional)">
              <textarea
                style={{ ...input, resize: 'vertical', minHeight: 56, lineHeight: 1.5 }}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej. cliente prefiere mañanas"
              />
            </Field>
          </div>
        )}

        <div style={modalFooter}>
          <Btn variant="ghost" size="sm" onClick={onClose}>Cancelar</Btn>
          <Btn variant="primary" size="sm" onClick={submit} disabled={saving || loading || servicios.length === 0}>
            {saving && <Spinner size={12} color="#FAFAFA" trackColor="rgba(250,250,250,0.35)" />}
            {saving ? 'Guardando…' : 'Crear cita'}
          </Btn>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 11, color: 'var(--app-muted)', display: 'block', marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const overlay: CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 100,
  background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 16,
};
const modal: CSSProperties = {
  width: '100%', maxWidth: 520,
  background: 'var(--app-bg-elevated)', border: '1px solid var(--app-border)',
  borderRadius: 14, overflow: 'hidden',
  maxHeight: '92vh', display: 'flex', flexDirection: 'column',
};
const modalHeader: CSSProperties = {
  padding: '14px 18px', borderBottom: '1px solid var(--app-border)',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
};
const modalFooter: CSSProperties = {
  padding: '12px 18px', borderTop: '1px solid var(--app-border)',
  display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0,
};
const closeBtn: CSSProperties = {
  width: 30, height: 30, borderRadius: 8, border: 'none',
  background: 'transparent', color: 'var(--app-muted)', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0,
};
const input: CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'var(--app-input-bg)', border: '1px solid var(--app-border)',
  borderRadius: 8, padding: '10px 14px',
  color: 'var(--app-text)', fontSize: 13, fontFamily: 'inherit', outline: 'none',
};
