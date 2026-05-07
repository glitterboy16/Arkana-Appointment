import { useEffect, useState, type ReactNode } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArkanaIcons, Avatar, Badge, Btn, type AppointmentStatus } from '@/components/app/Shared';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, type Cita } from '@/lib/supabase';

interface CitaConServicio extends Cita {
  servicios: { nombre: string; duracion_min: number } | null;
}

interface MetricCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  sub: string;
  color?: string;
}

function MetricCard({ icon, value, label, sub, color = '#648DFF' }: MetricCardProps) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 12, padding: '18px 20px', flex: 1, minWidth: 140,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9, background: `${color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color,
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#FAFAFA', lineHeight: 1, marginBottom: 4, fontFamily: "'SF Pro Display','Inter',sans-serif" }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(250,250,250,0.65)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color: 'rgba(250,250,250,0.35)' }}>{sub}</div>
    </div>
  );
}

function AppointmentRow({ cita }: { cita: CitaConServicio }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ width: 46, flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#648DFF' }}>{cita.hora_inicio.slice(0, 5)}</div>
        <div style={{ fontSize: 10, color: 'rgba(250,250,250,0.35)', marginTop: 1 }}>
          {cita.servicios ? `${cita.servicios.duracion_min}min` : '—'}
        </div>
      </div>
      <div style={{ width: 3, height: 34, borderRadius: 2, background: 'rgba(100,141,255,0.4)', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {cita.cliente_nombre}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(250,250,250,0.45)', marginTop: 1 }}>
          {cita.servicios?.nombre ?? '—'}
        </div>
      </div>
      <Badge status={cita.estado as AppointmentStatus} />
    </div>
  );
}

function MiniChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const min = 0;
  const w = 320;
  const h = 80;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
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

export default function PanelPage() {
  const { negocio, usuario } = useAuth();
  const [citasHoy, setCitasHoy] = useState<CitaConServicio[]>([]);
  const [countSemana, setCountSemana] = useState(0);
  const [countMes, setCountMes] = useState(0);
  const [chartData, setChartData] = useState<number[]>(Array(12).fill(0));
  const [loadingData, setLoadingData] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

  useEffect(() => {
    if (!negocio) { setLoadingData(false); return; }

    const load = async () => {
      const [
        { data: hoy },
        { count: semana },
        { count: mes },
        { data: ultimas },
      ] = await Promise.all([
        supabase
          .from('citas')
          .select('*, servicios(nombre, duracion_min)')
          .eq('negocio_id', negocio.id)
          .eq('fecha', today)
          .order('hora_inicio'),
        supabase
          .from('citas')
          .select('id', { count: 'exact', head: true })
          .eq('negocio_id', negocio.id)
          .gte('fecha', weekStart)
          .lte('fecha', weekEnd),
        supabase
          .from('citas')
          .select('id', { count: 'exact', head: true })
          .eq('negocio_id', negocio.id)
          .gte('fecha', monthStart)
          .lte('fecha', monthEnd),
        supabase
          .from('citas')
          .select('fecha')
          .eq('negocio_id', negocio.id)
          .gte('fecha', format(subDays(new Date(), 11), 'yyyy-MM-dd'))
          .lte('fecha', today),
      ]);

      setCitasHoy((hoy as CitaConServicio[]) ?? []);
      setCountSemana(semana ?? 0);
      setCountMes(mes ?? 0);

      if (ultimas) {
        const counts: Record<string, number> = {};
        ultimas.forEach((c) => { counts[c.fecha] = (counts[c.fecha] ?? 0) + 1; });
        const last12: number[] = [];
        for (let i = 11; i >= 0; i--) {
          const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
          last12.push(counts[d] ?? 0);
        }
        setChartData(last12);
      }

      setLoadingData(false);
    };

    load();
  }, [negocio]);

  const todayLabel = format(new Date(), "EEEE d 'de' MMMM", { locale: es });
  const todayLabelCapitalized = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

  const confirmadas = citasHoy.filter((c) => c.estado === 'confirmed').length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: '#080C3E' }}>
      <div style={{
        padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#050A30', flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(250,250,250,0.35)', marginBottom: 2 }}>
            Arkana &rsaquo; <span style={{ color: 'rgba(250,250,250,0.60)' }}>Panel principal</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#FAFAFA', fontFamily: "'SF Pro Display','Inter',sans-serif" }}>
            Panel principal
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative', color: 'rgba(250,250,250,0.60)', cursor: 'pointer' }}>
            {ArkanaIcons.bell}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <Avatar name={usuario?.nombre ?? 'U'} size={34} bg="#004AAD" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA' }}>{usuario?.nombre ?? '—'}</div>
              <div style={{ fontSize: 11, color: 'rgba(250,250,250,0.40)' }}>{negocio?.nombre ?? '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {loadingData ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(250,250,250,0.35)', fontSize: 14 }}>
          Cargando datos…
        </div>
      ) : (
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
          <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.35)', marginBottom: -8 }}>{todayLabelCapitalized}</div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <MetricCard icon={ArkanaIcons.calendar} value={citasHoy.length} label="Citas hoy" sub={`${confirmadas} confirmada${confirmadas !== 1 ? 's' : ''}`} />
            <MetricCard icon={ArkanaIcons.clock} value={countSemana} label="Citas esta semana" sub="Lunes a domingo" color="#5CB6F9" />
            <MetricCard icon={ArkanaIcons.chart} value={countMes} label="Citas este mes" sub={format(new Date(), 'MMMM yyyy', { locale: es })} color="#F59E0B" />
          </div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div style={{
              flex: 1, minWidth: 320, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 12, padding: '20px 22px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#FAFAFA' }}>Actividad reciente</div>
                  <div style={{ fontSize: 11, color: 'rgba(250,250,250,0.40)', marginTop: 2 }}>Últimos 12 días</div>
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <MiniChart data={chartData} />
              </div>
            </div>

            <div style={{
              width: 280, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 12, padding: '20px 22px', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#FAFAFA' }}>Citas de hoy</div>
                <span style={{ fontSize: 12, color: '#648DFF', fontWeight: 600 }}>{citasHoy.length} total</span>
              </div>
              {citasHoy.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(250,250,250,0.30)', fontSize: 13 }}>
                  No hay citas para hoy
                </div>
              ) : (
                citasHoy.slice(0, 5).map((c) => <AppointmentRow key={c.id} cita={c} />)
              )}
              {citasHoy.length > 0 && (
                <Btn variant="ghost" size="sm" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}
                  onClick={() => window.location.href = '/panel/citas'}>
                  Ver todas las citas
                </Btn>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
