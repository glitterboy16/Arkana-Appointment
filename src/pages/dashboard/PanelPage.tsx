import type { ReactNode } from 'react';
import { ArkanaIcons, Avatar, Badge, Btn, type AppointmentStatus } from '@/components/app/Shared';

function MiniChart() {
  const points = [32, 40, 35, 50, 45, 58, 42, 55, 60, 48, 65, 52];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const w = 320;
  const h = 80;
  const pts = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h * 0.8 - h * 0.1;
    return `${x},${y}`;
  }).join(' ');
  const area = `M0,${h} L${pts.split(' ').join(' L')} L${w},${h} Z`;

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#648DFF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#648DFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#chartGrad)" />
      <polyline points={pts} fill="none" stroke="#648DFF" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

interface MetricCardProps {
  icon: ReactNode;
  delta: string;
  value: string;
  label: string;
  sub: string;
  color?: string;
}

function MetricCard({ icon, delta, value, label, sub, color = '#648DFF' }: MetricCardProps) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 12, padding: '18px 20px', flex: 1, minWidth: 140, position: 'relative',
      transition: 'all 200ms ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#22C55E', display: 'flex', alignItems: 'center', gap: 3 }}>
          {ArkanaIcons.arrowUp}{delta}
        </span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#FAFAFA', lineHeight: 1, marginBottom: 4,
        fontFamily: "'SF Pro Display','Inter',sans-serif" }}>{value}</div>
      <div style={{ fontSize: 13, color: 'rgba(250,250,250,0.65)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color: 'rgba(250,250,250,0.35)' }}>{sub}</div>
    </div>
  );
}

interface AppointmentRowProps {
  time: string;
  duration: string;
  name: string;
  service: string;
  status: AppointmentStatus;
}

function AppointmentRow({ time, duration, name, service, status }: AppointmentRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
      borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ width: 42, flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#648DFF' }}>{time}</div>
        <div style={{ fontSize: 10, color: 'rgba(250,250,250,0.35)', marginTop: 1 }}>{duration}</div>
      </div>
      <div style={{ width: 3, height: 34, borderRadius: 2, background: 'rgba(100,141,255,0.4)', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        <div style={{ fontSize: 11, color: 'rgba(250,250,250,0.45)', marginTop: 1 }}>{service}</div>
      </div>
      <Badge status={status} />
    </div>
  );
}

export default function PanelPage() {
  const months = ['May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: '#080C3E' }}>
      <div style={{ padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#050A30', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(250,250,250,0.35)', marginBottom: 2 }}>
            Arkana &rsaquo; Panel &rsaquo; <span style={{ color: 'rgba(250,250,250,0.60)' }}>Panel principal</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#FAFAFA', fontFamily: "'SF Pro Display','Inter',sans-serif" }}>Panel principal</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative', color: 'rgba(250,250,250,0.60)', cursor: 'pointer' }}>
            {ArkanaIcons.bell}
            <span style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: '50%',
              background: '#EF4444', border: '2px solid #050A30' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <Avatar name="Ramón Alonso" size={34} bg="#004AAD" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA' }}>Dr. Ramón Alonso</div>
              <div style={{ fontSize: 11, color: 'rgba(250,250,250,0.40)' }}>Empresa · Madrid</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <MetricCard icon={ArkanaIcons.calendar} delta="+2" value="3" label="Citas hoy" sub="3 confirmadas" />
          <MetricCard icon={ArkanaIcons.clock} delta="+15%" value="12" label="Citas esta semana" sub="De lunes a domingo" color="#5CB6F9" />
          <MetricCard icon={ArkanaIcons.user} delta="+3" value="8" label="Clientes nuevos" sub="Este mes de abril" color="#22C55E" />
          <MetricCard icon={ArkanaIcons.chart} delta="+8%" value="1820€" label="Ingresos (mes)" sub="Tasa cancelación: 13%" color="#F59E0B" />
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 320, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 12, padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#FAFAFA' }}>Tendencia de citas</div>
                <div style={{ fontSize: 11, color: 'rgba(250,250,250,0.40)', marginTop: 2 }}>Últimos 12 meses</div>
              </div>
              <span style={{ fontSize: 12, color: '#648DFF', cursor: 'pointer', fontWeight: 600 }}>Ver todo</span>
            </div>
            <div style={{ marginTop: 16 }}>
              <MiniChart />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              {months.map((m) => (
                <span key={m} style={{ fontSize: 9, color: 'rgba(250,250,250,0.30)', fontFamily: 'monospace' }}>{m}</span>
              ))}
            </div>
          </div>

          <div style={{ width: 260, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 12, padding: '20px 22px', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#FAFAFA' }}>Citas de hoy</div>
              <span style={{ fontSize: 12, color: '#648DFF', fontWeight: 600 }}>3 total</span>
            </div>
            <AppointmentRow time="09:00" duration="45min" name="María García" service="Limpieza" status="confirmed" />
            <AppointmentRow time="10:00" duration="90min" name="Carlos Ruiz" service="Blanqueamiento" status="pending" />
            <AppointmentRow time="12:00" duration="45min" name="Ana Martínez" service="Revisión" status="confirmed" />
            <Btn variant="ghost" size="sm" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}>
              Ver todas las citas
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
