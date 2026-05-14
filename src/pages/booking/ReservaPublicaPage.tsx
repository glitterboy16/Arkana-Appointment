import { useEffect, useState, type CSSProperties, type MouseEvent } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';

const navBtnStyle: CSSProperties = {
  marginLeft: 'auto',
  fontSize: 12,
  fontWeight: 500,
  color: 'rgba(250,250,250,0.65)',
  textDecoration: 'none',
  padding: '6px 12px',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  transition: 'all 150ms ease',
};
const navBtnHover = (e: MouseEvent<HTMLAnchorElement>) => {
  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
  e.currentTarget.style.color = '#FAFAFA';
};
const navBtnLeave = (e: MouseEvent<HTMLAnchorElement>) => {
  e.currentTarget.style.background = 'transparent';
  e.currentTarget.style.color = 'rgba(250,250,250,0.65)';
};
import { format, addDays, getISODay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArkanaIcons, Btn, LogoArkana } from '@/components/app/Shared';
import { supabase, type Negocio, type Servicio, type Disponibilidad } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { FullScreenLoader } from '@/components/app/Spinner';

interface DayOption {
  date: Date;
  dateStr: string;
  dispo: Disponibilidad;
}

interface TramoExcluidoDay {
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

function hhmmToMin(h: string): number {
  const [hh, mm] = h.split(':').map(Number);
  return hh * 60 + mm;
}

function generateSlots(
  horaInicio: string,
  horaFin: string,
  duracionMin: number,
  tramosExcluidos: TramoExcluidoDay[] = [],
): string[] {
  const slots: string[] = [];
  const [sh, sm] = horaInicio.split(':').map(Number);
  const [eh, em] = horaFin.split(':').map(Number);
  let current = sh * 60 + sm;
  const end = eh * 60 + em;
  while (current + duracionMin <= end) {
    const slotEnd = current + duracionMin;
    // descartar si el slot pisa cualquier tramo excluido (pausa)
    const choca = tramosExcluidos.some(t => {
      const tIni = hhmmToMin(t.hora_inicio);
      const tFin = hhmmToMin(t.hora_fin);
      return current < tFin && slotEnd > tIni;
    });
    if (!choca) {
      slots.push(
        `${Math.floor(current / 60).toString().padStart(2, '0')}:${(current % 60).toString().padStart(2, '0')}`
      );
    }
    current += duracionMin;
  }
  return slots;
}

function getNextAvailableDays(
  disponibilidad: Disponibilidad[],
  fechasBloqueadas: Set<string>,
  count = 7,
): DayOption[] {
  const days: DayOption[] = [];
  const today = new Date();
  for (let i = 0; i < 60 && days.length < count; i++) {
    const date = addDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    if (fechasBloqueadas.has(dateStr)) continue;
    const isoDay = getISODay(date);
    const dispo = disponibilidad.find((d) => d.dia_semana === isoDay && d.activo);
    if (dispo) {
      days.push({ date, dateStr, dispo });
    }
  }
  return days;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#F59E0B' : 'rgba(255,255,255,0.15)' }}>
          {ArkanaIcons.star}
        </span>
      ))}
    </div>
  );
}

function TimeSlot({ time, available, selected, onClick }: { time: string; available: boolean; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={available ? onClick : undefined}
      style={{
        padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
        cursor: available ? 'pointer' : 'default',
        border: selected ? '1px solid #648DFF' : '1px solid rgba(255,255,255,0.10)',
        background: selected ? 'rgba(100,141,255,0.18)' : available ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
        color: selected ? '#648DFF' : available ? '#FAFAFA' : 'rgba(250,250,250,0.25)',
        transition: 'all 150ms ease', fontFamily: 'inherit',
      }}
    >
      {time}
    </button>
  );
}

type PageState = 'loading' | 'notfound' | 'booking' | 'done';

export default function ReservaPublicaPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  // Cuando el negocio entra a su propia página pública desde el botón
  // "Nueva cita" en Mis Citas, pasa ?fromPanel=1 para saltarse el bloqueo
  // de auto-reserva y poder agendarse una cita interna (walk-in, etc).
  const fromPanel = searchParams.get('fromPanel') === '1';
  const [pageState, setPageState] = useState<PageState>('loading');

  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [, setDisponibilidad] = useState<Disponibilidad[]>([]);
  const [tramosExcluidos, setTramosExcluidos] = useState<TramoExcluidoDay[]>([]);
  const [galeria, setGaleria] = useState<string[]>([]);
  const [availableDays, setAvailableDays] = useState<DayOption[]>([]);

  const [step, setStep] = useState(1);
  const [selectedServicio, setSelectedServicio] = useState<string | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<Set<string>>(new Set());
  const [slots, setSlots] = useState<string[]>([]);
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { usuario } = useAuth();

  useEffect(() => {
    if (usuario && usuario.rol === 'cliente') {
      setForm(f => ({
        nombre: f.nombre || usuario.nombre,
        telefono: f.telefono || usuario.telefono || '',
        email: f.email || usuario.email,
      }));
    }
  }, [usuario]);

  useEffect(() => {
    if (!slug) { setPageState('notfound'); return; }
    const load = async () => {
      const { data: neg } = await supabase
        .from('negocios')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!neg) { setPageState('notfound'); return; }
      setNegocio(neg as Negocio);

      const [{ data: svcs }, { data: disp }, { data: bloques }, { data: excepciones }, { data: fotos }] = await Promise.all([
        supabase.from('servicios').select('*').eq('negocio_id', neg.id).eq('activo', true).order('created_at'),
        supabase.from('disponibilidad').select('*').eq('negocio_id', neg.id).eq('activo', true),
        supabase.from('disponibilidad_bloques_excluidos').select('dia_semana, hora_inicio, hora_fin').eq('negocio_id', neg.id),
        supabase.from('disponibilidad_excepciones').select('fecha').eq('negocio_id', neg.id),
        supabase.from('negocio_fotos').select('foto_url').eq('negocio_id', neg.id).order('orden'),
      ]);

      const svcList = (svcs as Servicio[]) ?? [];
      const dispList = (disp as Disponibilidad[]) ?? [];
      const tramos = (bloques as TramoExcluidoDay[] | null) ?? [];
      const fechasBloqSet = new Set(((excepciones as { fecha: string }[] | null) ?? []).map(e => e.fecha));

      setServicios(svcList);
      setDisponibilidad(dispList);
      setTramosExcluidos(tramos);
      setGaleria(((fotos as { foto_url: string }[] | null) ?? []).map(f => f.foto_url));
      setAvailableDays(getNextAvailableDays(dispList, fechasBloqSet));
      setPageState('booking');
    };
    load();
  }, [slug]);

  useEffect(() => {
    if (!selectedServicio || availableDays.length === 0) return;
    const servicio = servicios.find((s) => s.id === selectedServicio);
    if (!servicio) return;

    const day = availableDays[selectedDayIdx];
    if (!day) return;

    const tramosDelDia = tramosExcluidos.filter(t => t.dia_semana === getISODay(day.date));
    const newSlots = generateSlots(day.dispo.hora_inicio, day.dispo.hora_fin, servicio.duracion_min, tramosDelDia);
    setSlots(newSlots);
    setSelectedTime(null);

    if (!negocio) return;
    supabase
      .from('citas')
      .select('hora_inicio')
      .eq('negocio_id', negocio.id)
      .eq('fecha', day.dateStr)
      .neq('estado', 'cancelled')
      .then(({ data }) => {
        setOccupiedSlots(new Set((data ?? []).map((c: { hora_inicio: string }) => c.hora_inicio.slice(0, 5))));
      });
  }, [selectedServicio, selectedDayIdx, availableDays, servicios, negocio, tramosExcluidos]);

  const handleConfirmar = async () => {
    if (!negocio || !selectedServicio || !selectedTime || !availableDays[selectedDayIdx]) return;
    if (!form.nombre.trim()) { setSubmitError('Introduce tu nombre'); return; }
    if (!form.telefono.trim()) { setSubmitError('Introduce tu teléfono'); return; }

    setSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.from('citas').insert({
      negocio_id: negocio.id,
      servicio_id: selectedServicio,
      cliente_id: usuario?.rol === 'cliente' ? usuario.id : null,
      cliente_nombre: form.nombre.trim(),
      cliente_telefono: form.telefono.trim(),
      cliente_email: form.email.trim() || null,
      fecha: availableDays[selectedDayIdx].dateStr,
      hora_inicio: `${selectedTime}:00`,
      estado: 'new',
    });

    setSubmitting(false);

    if (error) {
      setSubmitError('Error al confirmar la cita. Intenta de nuevo.');
      return;
    }

    setStep(4);
  };

  const servicio = servicios.find((s) => s.id === selectedServicio);
  const selectedDay = availableDays[selectedDayIdx];

  if (pageState === 'loading') {
    return <FullScreenLoader label="Cargando reserva…" />;
  }

  if (pageState === 'notfound') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: '#050A30', color: 'rgba(250,250,250,0.45)', gap: 12 }}>
        <div style={{ fontSize: 40 }}>404</div>
        <div style={{ fontSize: 16, color: '#FAFAFA' }}>Negocio no encontrado</div>
        <div style={{ fontSize: 13 }}>El enlace no es válido o el negocio no existe.</div>
      </div>
    );
  }

  // Bloqueo de auto-reserva: si el usuario es el dueño de este negocio y NO
  // viene desde el botón "Nueva cita" del panel, no puede reservarse a sí
  // mismo. Desde el panel (?fromPanel=1) sí está permitido para crear citas
  // internas/walk-in.
  const esDueno = !!(usuario && negocio && negocio.usuario_id === usuario.id);
  if (esDueno && !fromPanel) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: '#050A30', color: '#FAFAFA', gap: 16, padding: '32px 20px', textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: 'rgba(100,141,255,0.15)',
          border: '1px solid rgba(100,141,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#648DFF', fontSize: 28,
        }}>
          {ArkanaIcons.eye}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'SF Pro Display','Inter',sans-serif" }}>
          Estás viendo tu propio negocio
        </div>
        <div style={{ fontSize: 14, color: 'rgba(250,250,250,0.65)', maxWidth: 420, lineHeight: 1.5 }}>
          No puedes reservar una cita en tu propio negocio desde la vista pública.
          Si necesitas crear una cita manual (walk-in), entra al panel y usa el botón
          <strong style={{ color: '#FAFAFA' }}> Nueva cita</strong> en Mis Citas.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            to="/panel/citas"
            style={{
              padding: '10px 18px', borderRadius: 8, background: '#004AAD',
              color: '#FAFAFA', fontSize: 13, fontWeight: 600, textDecoration: 'none',
            }}
          >
            Ir a Mis citas
          </Link>
          <Link
            to="/"
            style={{
              padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(250,250,250,0.75)', fontSize: 13, fontWeight: 500, textDecoration: 'none',
            }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const formatPrecio = (centimos: number) =>
    centimos === 0 ? 'Gratis' : `${(centimos / 100).toFixed(centimos % 100 === 0 ? 0 : 2)}€`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#050A30' }}>
      <div style={{
        padding: '12px 20px', background: '#050A30', borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
      }}>
        <LogoArkana size={36} />
        <span style={{ fontSize: 15, fontWeight: 700, color: '#FAFAFA' }}>Arkana Appointments</span>
        {usuario?.rol === 'cliente' ? (
          <Link
            to="/app/citas"
            style={navBtnStyle}
            onMouseEnter={navBtnHover}
            onMouseLeave={navBtnLeave}
          >
            ← Mis citas
          </Link>
        ) : usuario?.rol === 'negocio' ? (
          <Link
            to="/panel"
            style={navBtnStyle}
            onMouseEnter={navBtnHover}
            onMouseLeave={navBtnLeave}
          >
            ← Volver al panel
          </Link>
        ) : (
          <Link
            to="/"
            style={navBtnStyle}
            onMouseEnter={navBtnHover}
            onMouseLeave={navBtnLeave}
          >
            ← Volver a inicio
          </Link>
        )}
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', background: '#080C3E',
        display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '32px 16px',
      }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '0 auto 12px' }}>
              <LogoArkana size={60} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#FAFAFA', fontFamily: "'SF Pro Display','Inter',sans-serif" }}>
              {negocio!.nombre}
            </div>
            {(negocio!.categoria || negocio!.direccion) && (
              <div style={{ fontSize: 13, color: 'rgba(250,250,250,0.50)', marginTop: 4 }}>
                {[negocio!.categoria, negocio!.direccion].filter(Boolean).join(' · ')}
              </div>
            )}
            {negocio!.rating != null && negocio!.rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
                <StarRating rating={negocio!.rating} />
                <span style={{ fontSize: 12, color: 'rgba(250,250,250,0.45)' }}>
                  {negocio!.rating.toFixed(1)} · {negocio!.resenas ?? 0} reseñas
                </span>
              </div>
            )}
          </div>

          {step < 4 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
              {['Servicio', 'Horario', 'Confirmar'].map((s, i) => (
                <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                  <div style={{
                    height: 3, borderRadius: 9999, width: '100%',
                    background: step >= i + 1 ? '#648DFF' : 'rgba(255,255,255,0.10)',
                  }} />
                  <span style={{ fontSize: 10, color: step >= i + 1 ? '#648DFF' : 'rgba(250,250,250,0.30)', fontWeight: 600 }}>{s}</span>
                </div>
              ))}
            </div>
          )}

          {step === 1 && galeria.length > 0 && (
            <div style={{
              display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 18,
              scrollSnapType: 'x mandatory', scrollbarWidth: 'thin',
            }}>
              {galeria.map((url, i) => (
                <img
                  key={url + i}
                  src={url}
                  alt=""
                  style={{
                    width: 160, height: 110, objectFit: 'cover', borderRadius: 12,
                    flexShrink: 0, scrollSnapAlign: 'start',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                />
              ))}
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {servicios.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(250,250,250,0.35)', fontSize: 14 }}>
                  Este negocio aún no tiene servicios disponibles.
                </div>
              ) : servicios.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedServicio(s.id)}
                  style={{
                    background: selectedServicio === s.id ? 'rgba(100,141,255,0.12)' : 'rgba(255,255,255,0.05)',
                    border: selectedServicio === s.id ? '1px solid rgba(100,141,255,0.50)' : '1px solid rgba(255,255,255,0.09)',
                    borderRadius: 12, padding: '16px 18px', cursor: 'pointer', transition: 'all 150ms ease',
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, background: `${s.color ?? '#648DFF'}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color ?? '#648DFF', flexShrink: 0,
                  }}>
                    {ArkanaIcons.calendar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA' }}>{s.nombre}</div>
                    <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.45)', marginTop: 2 }}>{s.duracion_min} min</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: s.color ?? '#648DFF' }}>
                    {formatPrecio(s.precio_centimos)}
                  </div>
                </div>
              ))}
              {servicios.length > 0 && (
                <Btn
                  variant="primary" size="lg"
                  onClick={() => selectedServicio && setStep(2)}
                  style={{ marginTop: 8, width: '100%', justifyContent: 'center', opacity: selectedServicio ? 1 : 0.4 }}
                >
                  Continuar
                </Btn>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              {availableDays.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(250,250,250,0.35)', fontSize: 14 }}>
                  No hay horario disponible en los próximos días.
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
                    {availableDays.map((d, i) => (
                      <button
                        key={d.dateStr}
                        type="button"
                        onClick={() => setSelectedDayIdx(i)}
                        style={{
                          flex: '0 0 auto', minWidth: 62, padding: '10px 8px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                          border: selectedDayIdx === i ? '1px solid #648DFF' : '1px solid rgba(255,255,255,0.10)',
                          background: selectedDayIdx === i ? 'rgba(100,141,255,0.15)' : 'rgba(255,255,255,0.05)',
                          color: selectedDayIdx === i ? '#FAFAFA' : 'rgba(250,250,250,0.55)',
                          transition: 'all 150ms ease',
                        }}
                      >
                        <div style={{ fontSize: 10, marginBottom: 4 }}>
                          {format(d.date, 'EEE', { locale: es }).toUpperCase()}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{format(d.date, 'd')}</div>
                        <div style={{ fontSize: 9, color: 'rgba(250,250,250,0.35)' }}>
                          {format(d.date, 'MMM', { locale: es }).toUpperCase()}
                        </div>
                      </button>
                    ))}
                  </div>

                  {slots.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(250,250,250,0.35)', fontSize: 13 }}>
                      No hay huecos disponibles este día
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
                      {slots.map((t) => (
                        <TimeSlot
                          key={t}
                          time={t}
                          available={!occupiedSlots.has(t)}
                          selected={selectedTime === t}
                          onClick={() => setSelectedTime(t)}
                        />
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10 }}>
                    <Btn variant="ghost" size="lg" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center' }}>Atrás</Btn>
                    <Btn
                      variant="primary" size="lg"
                      onClick={() => selectedTime && setStep(3)}
                      style={{ flex: 2, justifyContent: 'center', opacity: selectedTime ? 1 : 0.4 }}
                    >
                      Continuar
                    </Btn>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 3 && servicio && selectedDay && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(250,250,250,0.40)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Resumen
                </div>
                {[
                  ['Servicio', servicio.nombre],
                  ['Fecha', format(parseISO(selectedDay.dateStr), "EEEE d 'de' MMMM", { locale: es })],
                  ['Hora', selectedTime ?? '—'],
                  ['Duración', `${servicio.duracion_min} min`],
                  ['Precio', formatPrecio(servicio.precio_centimos)],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: 'rgba(250,250,250,0.50)' }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA', textTransform: 'capitalize' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { key: 'nombre', label: 'Tu nombre *', placeholder: 'Nombre completo', type: 'text' },
                  { key: 'telefono', label: 'Teléfono *', placeholder: '+34 600 000 000', type: 'tel' },
                  { key: 'email', label: 'Email (opcional)', placeholder: 'tu@email.com', type: 'email' },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <label style={{ fontSize: 12, color: 'rgba(250,250,250,0.55)', display: 'block', marginBottom: 5 }}>{label}</label>
                    <input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      style={{
                        width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px 14px',
                        color: '#FAFAFA', fontSize: 14, fontFamily: 'inherit', outline: 'none',
                      }}
                    />
                  </div>
                ))}
              </div>

              {submitError && (
                <div style={{
                  background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#EF4444',
                }}>
                  {submitError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <Btn variant="ghost" size="lg" onClick={() => setStep(2)} style={{ flex: 1, justifyContent: 'center' }}>Atrás</Btn>
                <Btn
                  variant="accent" size="lg"
                  onClick={handleConfirmar}
                  disabled={submitting}
                  style={{ flex: 2, justifyContent: 'center' }}
                >
                  {submitting ? 'Confirmando…' : 'Confirmar cita'}
                </Btn>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.15)',
                border: '2px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', color: '#22C55E', fontSize: 28,
              }}>
                {ArkanaIcons.check}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#FAFAFA', marginBottom: 8, fontFamily: "'SF Pro Display','Inter',sans-serif" }}>
                ¡Cita confirmada!
              </div>
              <div style={{ fontSize: 14, color: 'rgba(250,250,250,0.55)', lineHeight: 1.6 }}>
                Tu reserva ha sido registrada.<br />Hasta pronto en <strong style={{ color: '#FAFAFA' }}>{negocio!.nombre}</strong>.
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
                <Btn
                  variant="ghost" size="md"
                  onClick={() => { setStep(1); setSelectedServicio(null); setSelectedTime(null); setForm({ nombre: '', telefono: '', email: '' }); }}
                  style={{ display: 'inline-flex' }}
                >
                  Hacer otra reserva
                </Btn>
                {usuario?.rol === 'negocio' && (
                  <Link to="/panel/citas" style={{ textDecoration: 'none' }}>
                    <Btn variant="primary" size="md" style={{ display: 'inline-flex' }}>
                      Volver al panel
                    </Btn>
                  </Link>
                )}
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 32, fontSize: 11, color: 'rgba(250,250,250,0.25)' }}>
            Powered by <span style={{ color: '#648DFF', fontWeight: 600 }}>Arkana Appointments</span>
          </div>
        </div>
      </div>
    </div>
  );
}
