import { useState } from 'react';
import { ArkanaIcons, Avatar, Badge, Btn, type AppointmentStatus } from '@/components/app/Shared';

interface Appointment {
  id: number;
  time: string;
  duration: string;
  client: string;
  service: string;
  price: string;
  status: AppointmentStatus;
  avatarBg: string;
  date: string;
}

interface RowProps {
  appt: Appointment;
}

function AppointmentRow({ appt }: RowProps) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.06)', transition: 'background 150ms ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ width: 52, flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#648DFF' }}>{appt.time}</div>
        <div style={{ fontSize: 11, color: 'rgba(250,250,250,0.35)', marginTop: 1 }}>{appt.duration}</div>
      </div>
      <Avatar name={appt.client} size={34} bg={appt.avatarBg} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA' }}>{appt.client}</div>
        <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.45)', marginTop: 1 }}>{appt.service}</div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(250,250,250,0.70)', width: 60, textAlign: 'right' }}>{appt.price}</div>
      <div style={{ width: 100, display: 'flex', justifyContent: 'flex-end' }}>
        <Badge status={appt.status} />
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button type="button" style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)',
          background: 'transparent', color: 'rgba(250,250,250,0.55)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
          Editar
        </button>
      </div>
    </div>
  );
}

const APPOINTMENTS: Appointment[] = [
  { id: 1, time: '09:00', duration: '45min', client: 'María García', service: 'Limpieza dental', price: '40€', status: 'confirmed', avatarBg: '#004AAD', date: 'Hoy' },
  { id: 2, time: '10:00', duration: '90min', client: 'Carlos Ruiz', service: 'Blanqueamiento', price: '120€', status: 'pending', avatarBg: '#648DFF', date: 'Hoy' },
  { id: 3, time: '12:00', duration: '30min', client: 'Ana Martínez', service: 'Revisión completa', price: '25€', status: 'confirmed', avatarBg: '#22C55E', date: 'Hoy' },
  { id: 4, time: '09:30', duration: '60min', client: 'Pedro López', service: 'Ortodoncia consulta', price: 'Gratis', status: 'new', avatarBg: '#F59E0B', date: 'Mañana' },
  { id: 5, time: '11:00', duration: '45min', client: 'Laura Sánchez', service: 'Limpieza dental', price: '40€', status: 'confirmed', avatarBg: '#5CB6F9', date: 'Mañana' },
  { id: 6, time: '15:30', duration: '90min', client: 'Javier Torres', service: 'Blanqueamiento', price: '120€', status: 'cancelled', avatarBg: '#EF4444', date: 'Mañana' },
];

type FilterId = 'all' | AppointmentStatus;

const TABS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'confirmed', label: 'Confirmadas' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'new', label: 'Nuevas' },
];

export default function CitasPage() {
  const [filter, setFilter] = useState<FilterId>('all');
  const filtered = filter === 'all' ? APPOINTMENTS : APPOINTMENTS.filter((a) => a.status === filter);
  const groups = filtered.reduce<Record<string, Appointment[]>>((acc, a) => {
    (acc[a.date] ||= []).push(a);
    return acc;
  }, {});

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: '#080C3E' }}>
      <div style={{ padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: '#050A30', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#FAFAFA',
            fontFamily: "'SF Pro Display','Inter',sans-serif" }}>Mis citas</div>
          <Btn variant="primary" size="sm">
            {ArkanaIcons.plus} Nueva cita
          </Btn>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setFilter(t.id)} style={{
              padding: '6px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 600, transition: 'all 150ms ease',
              background: filter === t.id ? 'rgba(100,141,255,0.15)' : 'transparent',
              color: filter === t.id ? '#648DFF' : 'rgba(250,250,250,0.45)',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflowY: 'auto' }}>
        {Object.entries(groups).map(([date, list]) => (
          <div key={date}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(250,250,250,0.40)',
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4 }}>
              {date}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, overflow: 'hidden' }}>
              {list.map((a) => <AppointmentRow key={a.id} appt={a} />)}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(250,250,250,0.30)' }}>
            <div style={{ fontSize: 14 }}>No hay citas en este filtro</div>
          </div>
        )}
      </div>
    </div>
  );
}
