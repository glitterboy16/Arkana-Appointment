import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArkanaIcons, Avatar, Badge, Btn, type AppointmentStatus } from '@/components/app/Shared';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, type Cita } from '@/lib/supabase';
import { InlineLoader, Spinner } from '@/components/app/Spinner';

interface CitaConServicio extends Cita {
  servicios: { nombre: string; duracion_min: number; precio_centimos: number } | null;
}

function formatFechaGrupo(fecha: string): string {
  const d = parseISO(fecha);
  if (isToday(d)) return 'Hoy';
  if (isTomorrow(d)) return 'Mañana';
  return format(d, "EEEE d 'de' MMMM", { locale: es });
}

function formatPrecio(centimos: number): string {
  if (centimos === 0) return 'Gratis';
  return `${(centimos / 100).toFixed(centimos % 100 === 0 ? 0 : 2)}€`;
}

const AVATAR_COLORS = ['#004AAD', '#648DFF', '#22C55E', '#F59E0B', '#5CB6F9', '#EF4444', '#A855F7'];
function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function AppointmentRow({ cita, onStatusChange }: { cita: CitaConServicio; onStatusChange: (id: string, status: AppointmentStatus) => void }) {
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    setSaving(true);
    await onStatusChange(cita.id, 'confirmed');
    setSaving(false);
  };

  const handleCancel = async () => {
    setSaving(true);
    await onStatusChange(cita.id, 'cancelled');
    setSaving(false);
  };

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
        borderBottom: '1px solid var(--app-border)', transition: 'background 150ms ease',
        flexWrap: 'wrap',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--app-surface-hover)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ width: 52, flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#648DFF' }}>{cita.hora_inicio.slice(0, 5)}</div>
        <div style={{ fontSize: 11, color: 'var(--app-subtle)', marginTop: 1 }}>
          {cita.servicios ? `${cita.servicios.duracion_min}min` : '—'}
        </div>
      </div>
      <Avatar name={cita.cliente_nombre} size={34} bg={avatarColor(cita.cliente_nombre)} />
      <div style={{ flex: '1 1 160px', minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--app-text)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cita.cliente_nombre}</div>
        <div style={{ fontSize: 12, color: 'var(--app-subtle)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {cita.servicios?.nombre ?? '—'} · {cita.cliente_telefono}
        </div>
      </div>
      <div className="ark-hide-mobile" style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-muted)', minWidth: 50, textAlign: 'right' }}>
        {cita.servicios ? formatPrecio(cita.servicios.precio_centimos) : '—'}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Badge status={cita.estado as AppointmentStatus} />
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {saving && <Spinner size={12} />}
        {cita.estado === 'new' && (
          <button type="button" disabled={saving} onClick={handleConfirm} style={{
            padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.4)',
            background: 'rgba(34,197,94,0.10)', color: '#22C55E', fontSize: 11, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            opacity: saving ? 0.5 : 1,
          }}>
            Confirmar
          </button>
        )}
        {(cita.estado === 'new' || cita.estado === 'pending') && (
          <button type="button" disabled={saving} onClick={handleCancel} style={{
            padding: '5px 10px', borderRadius: 6, border: '1px solid var(--app-border)',
            background: 'transparent', color: 'var(--app-muted)', fontSize: 11, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            opacity: saving ? 0.5 : 1,
          }}>
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

type FilterId = 'all' | AppointmentStatus;

const TABS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'confirmed', label: 'Confirmadas' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'new', label: 'Nuevas' },
  { id: 'cancelled', label: 'Canceladas' },
];

export default function CitasPage() {
  const { negocio } = useAuth();
  const navigate = useNavigate();
  const [citas, setCitas] = useState<CitaConServicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterId>('all');

  useEffect(() => {
    if (!negocio) { setLoading(false); return; }

    const load = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data } = await supabase
        .from('citas')
        .select('*, servicios(nombre, duracion_min, precio_centimos)')
        .eq('negocio_id', negocio.id)
        .gte('fecha', today)
        .order('fecha')
        .order('hora_inicio');
      setCitas((data as CitaConServicio[]) ?? []);
      setLoading(false);
    };

    load();
  }, [negocio]);

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    const { error } = await supabase.from('citas').update({ estado: status }).eq('id', id);
    if (!error) {
      setCitas((prev) => prev.map((c) => c.id === id ? { ...c, estado: status } : c));
    }
  };

  const filtered = filter === 'all' ? citas : citas.filter((c) => c.estado === filter);
  const groups = filtered.reduce<Record<string, CitaConServicio[]>>((acc, c) => {
    (acc[c.fecha] ||= []).push(c);
    return acc;
  }, {});

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--app-bg)' }}>
      <div style={{ padding: '18px clamp(14px, 4vw, 28px)', borderBottom: '1px solid var(--app-border)', background: 'var(--app-bg-elevated)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.01em', fontFamily: "'SF Pro Display','Inter',sans-serif" }}>
            Mis citas
          </div>
          <Btn
            variant="primary"
            size="sm"
            onClick={() => negocio && navigate(`/n/${negocio.slug}?fromPanel=1`)}
            disabled={!negocio}
          >
            {ArkanaIcons.plus} Nueva cita
          </Btn>
        </div>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setFilter(t.id)} style={{
              padding: '7px 15px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 600, transition: 'all 150ms ease',
              background: filter === t.id ? 'rgba(100,141,255,0.15)' : 'transparent',
              color: filter === t.id ? '#648DFF' : 'var(--app-muted)',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div className="ark-page-fade" style={{ padding: '20px clamp(14px, 4vw, 28px)', display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <InlineLoader label="Cargando citas…" minHeight={240} />
        ) : Object.entries(groups).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--app-subtle)' }}>
            <div style={{ fontSize: 14 }}>No hay citas en este filtro</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>Las citas aparecerán aquí cuando los clientes reserven</div>
          </div>
        ) : (
          Object.entries(groups).map(([fecha, list]) => (
            <div key={fecha}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: 'var(--app-subtle)',
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 4,
              }}>
                {formatFechaGrupo(fecha)}
              </div>
              <div style={{
                background: 'var(--app-surface)', border: '1px solid var(--app-border)',
                borderRadius: 12, overflow: 'hidden',
              }}>
                {list.map((c) => (
                  <AppointmentRow key={c.id} cita={c} onStatusChange={handleStatusChange} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
