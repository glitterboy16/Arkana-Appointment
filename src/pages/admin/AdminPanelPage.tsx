import { useEffect, useState } from 'react';
import { format, parseISO, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { BiUser, BiBuildings, BiCalendarPlus, BiUserX, BiRefresh } from 'react-icons/bi';
import { supabase } from '@/lib/supabase';
import { InlineLoader } from '@/components/app/Spinner';

interface Stats {
  totalClientes: number;
  totalNegocios: number;
  totalUsuariosActivos: number;
  totalUsuariosDesactivados: number;
  registrosUltimos30: { fecha: string; etiqueta: string; clientes: number; negocios: number }[];
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  return (
    <div style={{
      background: 'var(--app-surface)', border: '1px solid var(--app-border)',
      borderRadius: 12, padding: '20px 22px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}22`, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, color: 'var(--app-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
        <div style={{
          fontSize: 28, fontWeight: 700, color: 'var(--app-text)', lineHeight: 1.1,
          fontFamily: "'SF Pro Display','Inter',sans-serif",
        }}>
          {value}
        </div>
      </div>
    </div>
  );
}

interface ChartTooltipPayload {
  payload: { etiqueta: string; clientes: number; negocios: number };
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: ChartTooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const { etiqueta, clientes, negocios } = payload[0].payload;
  return (
    <div style={{
      background: 'var(--app-bg-elevated)',
      border: '1px solid var(--app-border)',
      borderRadius: 8, padding: '8px 12px',
      fontSize: 12, color: 'var(--app-text)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{etiqueta}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: '#648DFF' }} />
        <span>{clientes} {clientes === 1 ? 'cliente' : 'clientes'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: '#22C55E' }} />
        <span>{negocios} {negocios === 1 ? 'negocio' : 'negocios'}</span>
      </div>
    </div>
  );
}

export default function AdminPanelPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      setLoadingStats(true);
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id, rol, eliminado, created_at');

      if (cancelled || !usuarios) { setLoadingStats(false); return; }

      const totalClientes = usuarios.filter(u => u.rol === 'cliente' && !u.eliminado).length;
      const totalNegocios = usuarios.filter(u => u.rol === 'negocio' && !u.eliminado).length;
      const totalUsuariosActivos = usuarios.filter(u => !u.eliminado).length;
      const totalUsuariosDesactivados = usuarios.filter(u => u.eliminado).length;

      // Registros por día en los últimos 30 días.
      // Usamos format(parseISO(...)) tanto para los buckets como para el día
      // del usuario, así ambos viven en la misma zona horaria (la local). El
      // bug previo nacía de comparar la fecha local del bucket con la fecha
      // UTC del slice de created_at.
      const hoy = new Date();
      const buckets: Record<string, { clientes: number; negocios: number }> = {};
      const orden: string[] = [];
      for (let i = 29; i >= 0; i--) {
        const fecha = format(subDays(hoy, i), 'yyyy-MM-dd');
        buckets[fecha] = { clientes: 0, negocios: 0 };
        orden.push(fecha);
      }
      for (const u of usuarios) {
        if (!u.created_at) continue;
        const fecha = format(parseISO(u.created_at), 'yyyy-MM-dd');
        if (buckets[fecha]) {
          if (u.rol === 'cliente') buckets[fecha].clientes++;
          else if (u.rol === 'negocio') buckets[fecha].negocios++;
        }
      }
      const registrosUltimos30 = orden.map((fecha) => ({
        fecha,
        etiqueta: format(parseISO(fecha), "d 'de' MMM", { locale: es }),
        ...buckets[fecha],
      }));

      setStats({
        totalClientes,
        totalNegocios,
        totalUsuariosActivos,
        totalUsuariosDesactivados,
        registrosUltimos30,
      });
      setLoadingStats(false);
    };

    void loadStats();

    return () => { cancelled = true; };
  }, [refreshKey]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--app-bg)' }}>
      <div style={{
        padding: '18px clamp(14px, 4vw, 28px)', borderBottom: '1px solid var(--app-border)',
        background: 'var(--app-bg-elevated)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--app-subtle)', marginBottom: 3 }}>
            Arkana &rsaquo; <span style={{ color: 'var(--app-muted)' }}>Dashboard de administración</span>
          </div>
          <div style={{
            fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 700, color: 'var(--app-text)',
            letterSpacing: '-0.01em', fontFamily: "'SF Pro Display','Inter',sans-serif",
          }}>
            Dashboard
          </div>
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          style={{
            padding: '8px 14px', borderRadius: 8, border: '1px solid var(--app-border)',
            background: 'var(--app-surface)', color: 'var(--app-muted)',
            fontFamily: 'inherit', fontSize: 13, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          <BiRefresh size={16} /> Refrescar
        </button>
      </div>

      <div className="ark-page-fade" style={{ padding: '20px clamp(14px, 4vw, 28px)', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {loadingStats || !stats ? (
          <InlineLoader label="Cargando estadísticas…" minHeight={140} />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <StatCard
                icon={<BiUser size={26} />}
                label="Clientes activos"
                value={stats.totalClientes}
                color="#648DFF"
              />
              <StatCard
                icon={<BiBuildings size={26} />}
                label="Negocios activos"
                value={stats.totalNegocios}
                color="#22C55E"
              />
              <StatCard
                icon={<BiCalendarPlus size={26} />}
                label="Total usuarios"
                value={stats.totalUsuariosActivos}
                color="#A855F7"
              />
              <StatCard
                icon={<BiUserX size={26} />}
                label="Desactivados"
                value={stats.totalUsuariosDesactivados}
                color="#F59E0B"
              />
            </div>

            <div style={{
              background: 'var(--app-surface)', border: '1px solid var(--app-border)',
              borderRadius: 12, padding: '20px 22px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--app-text)' }}>
                  Altas en los últimos 30 días
                </div>
                <div style={{ display: 'inline-flex', gap: 14, fontSize: 12, color: 'var(--app-muted)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: '#648DFF' }} /> Clientes
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: '#22C55E' }} /> Negocios
                  </span>
                </div>
              </div>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.registrosUltimos30} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" vertical={false} />
                    <XAxis
                      dataKey="fecha"
                      tick={{ fill: 'var(--app-subtle)', fontSize: 11 }}
                      tickFormatter={(v: string) => format(parseISO(v), 'd MMM', { locale: es })}
                      interval="preserveStartEnd"
                      minTickGap={28}
                      axisLine={{ stroke: 'var(--app-border)' }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: 'var(--app-subtle)', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={32}
                    />
                    <Tooltip cursor={{ fill: 'rgba(100,141,255,0.08)' }} content={<ChartTooltip />} />
                    <Bar dataKey="clientes" stackId="altas" fill="#648DFF" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="negocios" stackId="altas" fill="#22C55E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
