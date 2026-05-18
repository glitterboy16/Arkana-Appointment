import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArkanaIcons, Avatar, Badge, Btn, type AppointmentStatus } from '@/components/app/Shared';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, type Cita } from '@/lib/supabase';
import { InlineLoader } from '@/components/app/Spinner';
import NotificationsBell from '@/components/app/NotificationsBell';

interface CitaConServicio extends Cita {
  servicios: { nombre: string; duracion_min: number } | null;
  cliente?: { foto_url: string | null } | null;
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
      background: 'var(--app-surface)', border: '1px solid var(--app-border)',
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
      <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--app-text)', lineHeight: 1, marginBottom: 4, fontFamily: "'SF Pro Display','Inter',sans-serif" }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: 'var(--app-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--app-subtle)' }}>{sub}</div>
    </div>
  );
}

function AppointmentRow({ cita }: { cita: CitaConServicio }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
      borderBottom: '1px solid var(--app-border)',
    }}>
      <div style={{ width: 46, flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#648DFF' }}>{cita.hora_inicio.slice(0, 5)}</div>
        <div style={{ fontSize: 10, color: 'var(--app-subtle)', marginTop: 1 }}>
          {cita.servicios ? `${cita.servicios.duracion_min}min` : '—'}
        </div>
      </div>
      {cita.cliente?.foto_url ? (
        <img
          src={cita.cliente.foto_url}
          alt=""
          style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <div style={{ width: 3, height: 34, borderRadius: 2, background: 'rgba(100,141,255,0.4)', flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {cita.cliente_nombre}
        </div>
        <div style={{ fontSize: 11, color: 'var(--app-subtle)', marginTop: 1 }}>
          {cita.servicios?.nombre ?? '—'}
        </div>
      </div>
      <Badge status={cita.estado as AppointmentStatus} />
    </div>
  );
}

export default function PanelPage() {
  const { negocio, usuario } = useAuth();
  const navigate = useNavigate();
  const [citasHoy, setCitasHoy] = useState<CitaConServicio[]>([]);
  const [countSemana, setCountSemana] = useState(0);
  const [countMes, setCountMes] = useState(0);
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
      ] = await Promise.all([
        supabase
          .from('citas')
          .select('*, servicios(nombre, duracion_min), cliente:usuarios!cliente_id(foto_url)')
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
      ]);

      setCitasHoy(((hoy ?? []) as unknown) as CitaConServicio[]);
      setCountSemana(semana ?? 0);
      setCountMes(mes ?? 0);

      setLoadingData(false);
    };

    load();
  }, [negocio]);

  const todayLabel = format(new Date(), "EEEE d 'de' MMMM", { locale: es });
  const todayLabelCapitalized = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

  const confirmadas = citasHoy.filter((c) => c.estado === 'confirmed').length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--app-bg)' }}>
      <div style={{
        padding: '18px clamp(14px, 4vw, 28px)', borderBottom: '1px solid var(--app-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--app-bg-elevated)', flexShrink: 0, gap: 12, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--app-subtle)', marginBottom: 3 }}>
            Arkana &rsaquo; <span style={{ color: 'var(--app-muted)' }}>Panel principal</span>
          </div>
          <div style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.01em', fontFamily: "'SF Pro Display','Inter',sans-serif" }}>
            Panel principal
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="ark-hide-mobile">
            <NotificationsBell />
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer' }}>
            <Avatar name={usuario?.nombre ?? 'U'} size={40} bg="#004AAD" />
            <div className="ark-hide-mobile">
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--app-text)' }}>{usuario?.nombre ?? '—'}</div>
              <div style={{ fontSize: 12, color: 'var(--app-subtle)' }}>{negocio?.nombre ?? '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {loadingData ? (
        <InlineLoader label="Cargando datos del panel…" minHeight={320} />
      ) : (
        <div className="ark-page-fade" style={{ padding: 'clamp(16px, 3.5vw, 24px) clamp(14px, 4vw, 28px)', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--app-subtle)', marginBottom: -8 }}>{todayLabelCapitalized}</div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <MetricCard icon={ArkanaIcons.calendar} value={citasHoy.length} label="Citas hoy" sub={`${confirmadas} confirmada${confirmadas !== 1 ? 's' : ''}`} />
            <MetricCard icon={ArkanaIcons.clock} value={countSemana} label="Citas esta semana" sub="Lunes a domingo" color="#5CB6F9" />
            <MetricCard icon={ArkanaIcons.chart} value={countMes} label="Citas este mes" sub={format(new Date(), 'MMMM yyyy', { locale: es })} color="#F59E0B" />
          </div>

          <div style={{
            background: 'var(--app-surface)', border: '1px solid var(--app-border)',
            borderRadius: 12, padding: 'clamp(16px, 4vw, 22px)', maxWidth: 720,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--app-text)' }}>Citas de hoy</div>
                <div style={{ fontSize: 11, color: 'var(--app-subtle)', marginTop: 2 }}>
                  {citasHoy.length === 0 ? 'Sin reservas para hoy' : `${citasHoy.length} ${citasHoy.length === 1 ? 'cita' : 'citas'} programadas`}
                </div>
              </div>
              <Btn variant="ghost" size="sm" onClick={() => navigate('/panel/estadisticas')}>
                {ArkanaIcons.chart} Ver estadísticas
              </Btn>
            </div>
            {citasHoy.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--app-subtle)', fontSize: 13 }}>
                No hay citas para hoy
              </div>
            ) : (
              citasHoy.slice(0, 5).map((c) => <AppointmentRow key={c.id} cita={c} />)
            )}
            {citasHoy.length > 0 && (
              <Btn variant="ghost" size="sm" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}
                onClick={() => navigate('/panel/citas')}>
                Ver todas las citas
              </Btn>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
