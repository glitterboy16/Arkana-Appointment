import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArkanaIcons, Btn } from '@/components/app/Shared';
import logoIcon from '@/assets/logo-icon.svg';

interface Service {
  id: number;
  name: string;
  duration: string;
  price: string;
  color: string;
}

const SERVICES: Service[] = [
  { id: 1, name: 'Limpieza dental', duration: '45 min', price: '40€', color: '#648DFF' },
  { id: 2, name: 'Blanqueamiento', duration: '90 min', price: '120€', color: '#5CB6F9' },
  { id: 3, name: 'Revisión completa', duration: '30 min', price: '25€', color: '#22C55E' },
  { id: 4, name: 'Ortodoncia (consulta)', duration: '60 min', price: 'Gratis', color: '#F59E0B' },
];

const DAYS = [
  { label: 'Lun', date: '28', month: 'Abr' },
  { label: 'Mar', date: '29', month: 'Abr' },
  { label: 'Mié', date: '30', month: 'Abr' },
  { label: 'Jue', date: '1', month: 'May' },
  { label: 'Vie', date: '2', month: 'May' },
];

const SLOTS = ['09:00', '09:45', '10:30', '11:15', '12:00', '16:00', '16:45', '17:30'];
const UNAVAILABLE = new Set(['10:30', '12:00', '16:00']);

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= rating ? '#F59E0B' : 'rgba(255,255,255,0.15)' }}>
          {ArkanaIcons.star}
        </span>
      ))}
    </div>
  );
}

interface TimeSlotProps {
  time: string;
  available: boolean;
  selected: boolean;
  onClick: () => void;
}

function TimeSlot({ time, available, selected, onClick }: TimeSlotProps) {
  return (
    <button type="button" onClick={available ? onClick : undefined} style={{
      padding: '10px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: available ? 'pointer' : 'default',
      border: selected ? '1px solid #648DFF' : '1px solid rgba(255,255,255,0.10)',
      background: selected ? 'rgba(100,141,255,0.18)' : available ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
      color: selected ? '#648DFF' : available ? '#FAFAFA' : 'rgba(250,250,250,0.25)',
      transition: 'all 150ms ease', fontFamily: 'inherit',
    }}>{time}</button>
  );
}

export default function ReservaPublicaPage() {
  const { slug } = useParams<{ slug: string }>();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState(2);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '' });

  const businessName = slug ? `Negocio ${slug}` : 'Clínica Dental Sonrisa';
  const service = SERVICES.find((s) => s.id === selectedService);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#050A30' }}>
      <div style={{ padding: '12px 20px', background: '#050A30', borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ width: 26, height: 26, background: '#004AAD', borderRadius: 7,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={logoIcon} alt="" style={{ width: 18, height: 18, objectFit: 'contain', filter: 'brightness(10)' }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#FAFAFA' }}>Arkana Appointments</span>
        <span style={{ fontSize: 11, color: 'rgba(250,250,250,0.35)', marginLeft: 'auto' }}>Vista pública</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: '#080C3E',
        display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '32px 16px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: '#004AAD',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <img src={logoIcon} alt="" style={{ width: 40, height: 40, objectFit: 'contain', filter: 'brightness(10)' }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#FAFAFA', fontFamily: "'SF Pro Display','Inter',sans-serif" }}>
              {businessName}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(250,250,250,0.50)', marginTop: 4 }}>Madrid · Lunes–Viernes 9:00–18:00</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
              <StarRating rating={5} />
              <span style={{ fontSize: 12, color: 'rgba(250,250,250,0.45)' }}>4.9 · 128 reseñas</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
            {['Servicio', 'Horario', 'Confirmar'].map((s, i) => (
              <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                <div style={{ height: 3, borderRadius: 9999, width: '100%',
                  background: step > i + 1 || step === i + 1 ? '#648DFF' : 'rgba(255,255,255,0.10)' }} />
                <span style={{ fontSize: 10, color: step >= i + 1 ? '#648DFF' : 'rgba(250,250,250,0.30)', fontWeight: 600 }}>{s}</span>
              </div>
            ))}
          </div>

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SERVICES.map((s) => (
                <div key={s.id} onClick={() => setSelectedService(s.id)} style={{
                  background: selectedService === s.id ? 'rgba(100,141,255,0.12)' : 'rgba(255,255,255,0.05)',
                  border: selectedService === s.id ? '1px solid rgba(100,141,255,0.50)' : '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 12, padding: '16px 18px', cursor: 'pointer', transition: 'all 150ms ease',
                  display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: `${s.color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                    {ArkanaIcons.calendar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA' }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.45)', marginTop: 2 }}>{s.duration}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.price}</div>
                </div>
              ))}
              <Btn variant="primary" size="lg" onClick={() => selectedService && setStep(2)}
                style={{ marginTop: 8, width: '100%', justifyContent: 'center', opacity: selectedService ? 1 : 0.4 }}>
                Continuar
              </Btn>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {DAYS.map((d, i) => (
                  <button key={d.date} type="button" onClick={() => setSelectedDay(i)} style={{
                    flex: 1, padding: '10px 4px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                    border: selectedDay === i ? '1px solid #648DFF' : '1px solid rgba(255,255,255,0.10)',
                    background: selectedDay === i ? 'rgba(100,141,255,0.15)' : 'rgba(255,255,255,0.05)',
                    color: selectedDay === i ? '#FAFAFA' : 'rgba(250,250,250,0.55)',
                    transition: 'all 150ms ease' }}>
                    <div style={{ fontSize: 10, marginBottom: 4 }}>{d.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{d.date}</div>
                    <div style={{ fontSize: 9, color: 'rgba(250,250,250,0.35)' }}>{d.month}</div>
                  </button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
                {SLOTS.map((t) => (
                  <TimeSlot key={t} time={t} available={!UNAVAILABLE.has(t)}
                    selected={selectedTime === t} onClick={() => setSelectedTime(t)} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn variant="ghost" size="lg" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center' }}>Atrás</Btn>
                <Btn variant="primary" size="lg" onClick={() => selectedTime && setStep(3)}
                  style={{ flex: 2, justifyContent: 'center', opacity: selectedTime ? 1 : 0.4 }}>
                  Continuar
                </Btn>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(250,250,250,0.40)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Resumen</div>
                {[
                  ['Servicio', service?.name ?? '—'],
                  ['Fecha', `${DAYS[selectedDay].label} ${DAYS[selectedDay].date} ${DAYS[selectedDay].month}`],
                  ['Hora', selectedTime ?? '—'],
                  ['Duración', service?.duration ?? '—'],
                  ['Precio', service?.price ?? '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: 'rgba(250,250,250,0.50)' }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(250,250,250,0.55)', display: 'block', marginBottom: 5 }}>Tu nombre</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre completo"
                    style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px 14px',
                      color: '#FAFAFA', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(250,250,250,0.55)', display: 'block', marginBottom: 5 }}>Teléfono</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+34 600 000 000"
                    style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px 14px',
                      color: '#FAFAFA', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn variant="ghost" size="lg" onClick={() => setStep(2)} style={{ flex: 1, justifyContent: 'center' }}>Atrás</Btn>
                <Btn variant="accent" size="lg" onClick={() => setStep(4)} style={{ flex: 2, justifyContent: 'center' }}>
                  Confirmar cita
                </Btn>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.15)',
                border: '2px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', color: '#22C55E', fontSize: 28 }}>
                {ArkanaIcons.check}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#FAFAFA', marginBottom: 8,
                fontFamily: "'SF Pro Display','Inter',sans-serif" }}>¡Cita confirmada!</div>
              <div style={{ fontSize: 14, color: 'rgba(250,250,250,0.55)', lineHeight: 1.6 }}>
                Recibirás una confirmación por SMS.<br />Hasta pronto en {businessName}.
              </div>
              <Btn variant="ghost" size="md" onClick={() => { setStep(1); setSelectedService(null); setSelectedTime(null); }}
                style={{ marginTop: 24, display: 'inline-flex' }}>
                Hacer otra reserva
              </Btn>
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
