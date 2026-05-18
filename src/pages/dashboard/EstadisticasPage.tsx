import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { BiCalendarCheck, BiTrendingUp, BiTime, BiUser } from 'react-icons/bi';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, type EstadoCita } from '@/lib/supabase';
import { InlineLoader } from '@/components/app/Spinner';
import { Avatar } from '@/components/app/Shared';

type RangoDias = 7 | 30 | 90;

interface CitaCargada {
  id: string;
  fecha: string;
  estado: EstadoCita;
  cliente_id: string | null;
  cliente_nombre: string;
  servicio_id: string;
  created_at: string;
  servicios: { nombre: string; precio_centimos: number; color: string | null } | null;
  cliente: { foto_url: string | null } | null;
}

interface ServicioStat {
  id: string;
  nombre: string;
  color: string;
  total: number;
  ingresos: number;
}

interface ClienteStat {
  id: string;
  nombre: string;
  total: number;
  foto_url: string | null;
}

function formatEuros(centimos: number): string {
  if (centimos === 0) return '0€';
  return `${(centimos / 100).toFixed(centimos % 100 === 0 ? 0 : 2)}€`;
}

export default function EstadisticasPage() {
  const { negocio } = useAuth();
  const [citas, setCitas] = useState<CitaCargada[]>([]);
  const [loading, setLoading] = useState(true);
  const [rango, setRango] = useState<RangoDias>(30);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!negocio) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const desde = format(subDays(new Date(), rango - 1), 'yyyy-MM-dd');
      const { data } = await supabase
        .from('citas')
        .select('id, fecha, estado, cliente_id, cliente_nombre, servicio_id, created_at, servicios(nombre, precio_centimos, color), cliente:usuarios!cliente_id(foto_url)')
        .eq('negocio_id', negocio.id)
        .gte('fecha', desde)
        .order('fecha');
      if (cancelled) return;
      setCitas(((data ?? []) as unknown) as CitaCargada[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [negocio, rango]);

  // Derivados
  const stats = useMemo(() => {
    const total = citas.length;
    const confirmadas = citas.filter(c => c.estado === 'confirmed').length;
    const canceladas = citas.filter(c => c.estado === 'cancelled').length;
    const pendientes = citas.filter(c => c.estado === 'pending' || c.estado === 'new').length;

    const tasaConfirmacion = total > 0 ? Math.round((confirmadas / total) * 100) : 0;
    const tasaCancelacion = total > 0 ? Math.round((canceladas / total) * 100) : 0;

    // Ingresos estimados: solo citas confirmadas (no canceladas)
    const ingresosCentimos = citas
      .filter(c => c.estado !== 'cancelled')
      .reduce((sum, c) => sum + (c.servicios?.precio_centimos ?? 0), 0);

    return { total, confirmadas, canceladas, pendientes, tasaConfirmacion, tasaCancelacion, ingresosCentimos };
  }, [citas]);

  // Datos para la gráfica diaria
  const serie = useMemo(() => {
    const desde = subDays(new Date(), rango - 1);
    const dias = eachDayOfInterval({ start: desde, end: new Date() });
    const map: Record<string, number> = {};
    citas.forEach(c => { map[c.fecha] = (map[c.fecha] ?? 0) + 1; });
    return dias.map(d => {
      const key = format(d, 'yyyy-MM-dd');
      return { fecha: key, label: format(d, 'd MMM', { locale: es }), valor: map[key] ?? 0 };
    });
  }, [citas, rango]);

  // Servicios: ranking
  const serviciosRanking = useMemo<ServicioStat[]>(() => {
    const acc = new Map<string, ServicioStat>();
    citas.filter(c => c.estado !== 'cancelled').forEach(c => {
      const sid = c.servicio_id;
      const nombre = c.servicios?.nombre ?? 'Servicio eliminado';
      const color = c.servicios?.color ?? '#648DFF';
      const precio = c.servicios?.precio_centimos ?? 0;
      const prev = acc.get(sid);
      if (prev) {
        prev.total += 1;
        prev.ingresos += precio;
      } else {
        acc.set(sid, { id: sid, nombre, color, total: 1, ingresos: precio });
      }
    });
    return Array.from(acc.values()).sort((a, b) => b.total - a.total);
  }, [citas]);

  const servicioMasPopular = serviciosRanking[0] ?? null;
  const servicioMenosPopular = serviciosRanking.length > 1
    ? serviciosRanking[serviciosRanking.length - 1]
    : null;

  // Clientes frecuentes
  const clientesFrecuentes = useMemo<ClienteStat[]>(() => {
    const acc = new Map<string, ClienteStat>();
    citas.filter(c => c.estado !== 'cancelled').forEach(c => {
      const key = c.cliente_id ?? c.cliente_nombre; // agrupar guest por nombre
      const prev = acc.get(key);
      if (prev) {
        prev.total += 1;
      } else {
        acc.set(key, {
          id: key,
          nombre: c.cliente_nombre,
          total: 1,
          foto_url: c.cliente?.foto_url ?? null,
        });
      }
    });
    return Array.from(acc.values()).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [citas]);

  // Distribución por estado para la barra horizontal
  const estados = useMemo(() => {
    const arr: { label: string; value: number; color: string }[] = [
      { label: 'Confirmadas', value: stats.confirmadas, color: '#22C55E' },
      { label: 'Pendientes',  value: stats.pendientes,  color: '#F59E0B' },
      { label: 'Canceladas',  value: stats.canceladas,  color: '#EF4444' },
    ];
    return arr.filter(e => e.value > 0);
  }, [stats]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--app-bg)' }}>
      <div style={{
        padding: '18px clamp(14px, 4vw, 28px)', borderBottom: '1px solid var(--app-border)',
        background: 'var(--app-bg-elevated)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--app-subtle)', marginBottom: 3 }}>
            Arkana &rsaquo; <span style={{ color: 'var(--app-muted)' }}>Estadísticas</span>
          </div>
          <div style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.01em', fontFamily: "'SF Pro Display','Inter',sans-serif" }}>
            Estadísticas
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--app-surface)', padding: 4, borderRadius: 9, border: '1px solid var(--app-border)' }}>
          {([7, 30, 90] as RangoDias[]).map(r => (
            <button
              key={r}
              onClick={() => setRango(r)}
              style={{
                padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                background: rango === r ? '#004AAD' : 'transparent',
                color: rango === r ? '#FAFAFA' : 'var(--app-muted)',
                transition: 'all 150ms ease',
              }}
            >
              {r === 7 ? '7 días' : r === 30 ? '30 días' : '90 días'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <InlineLoader label="Cargando estadísticas…" minHeight={320} />
      ) : (
        <div className="ark-page-fade" style={{ padding: 'clamp(16px, 3.5vw, 24px) clamp(14px, 4vw, 28px)', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>

          {/* Métricas top */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
            <MetricCard
              icon={<BiCalendarCheck size={18} />}
              value={stats.total}
              label="Citas totales"
              sub={`Últimos ${rango} días`}
              color="#648DFF"
            />
            <MetricCard
              icon={<BiTrendingUp size={18} />}
              value={`${stats.tasaConfirmacion}%`}
              label="Tasa confirmación"
              sub={`${stats.confirmadas} de ${stats.total} citas`}
              color="#22C55E"
            />
            <MetricCard
              icon={<BiTime size={18} />}
              value={stats.pendientes}
              label="Pendientes"
              sub={`${stats.tasaCancelacion}% canceladas`}
              color="#F59E0B"
            />
            <MetricCard
              icon={<BiUser size={18} />}
              value={formatEuros(stats.ingresosCentimos)}
              label="Ingresos estimados"
              sub="Sin contar canceladas"
              color="#A855F7"
            />
          </div>

          {/* Gráfica */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--app-text)' }}>Actividad diaria</div>
                <div style={{ fontSize: 11, color: 'var(--app-subtle)', marginTop: 2 }}>
                  Número de citas creadas por día
                </div>
              </div>
              {hoverIdx !== null && serie[hoverIdx] && (
                <div style={{
                  padding: '6px 12px', borderRadius: 7, background: 'rgba(100,141,255,0.12)',
                  border: '1px solid rgba(100,141,255,0.30)', fontSize: 12,
                }}>
                  <span style={{ color: 'var(--app-muted)' }}>{serie[hoverIdx].label}</span>
                  <span style={{ marginLeft: 8, color: '#648DFF', fontWeight: 700 }}>
                    {serie[hoverIdx].valor} {serie[hoverIdx].valor === 1 ? 'cita' : 'citas'}
                  </span>
                </div>
              )}
            </div>
            <InteractiveChart data={serie} hoverIdx={hoverIdx} onHover={setHoverIdx} />
          </Card>

          {/* Servicios + clientes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>

            <Card>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--app-text)', marginBottom: 4 }}>Servicio más popular</div>
              <div style={{ fontSize: 11, color: 'var(--app-subtle)', marginBottom: 14 }}>Por número de citas no canceladas</div>
              {servicioMasPopular ? (
                <ServicioDestacado servicio={servicioMasPopular} totalCitas={citas.filter(c => c.estado !== 'cancelled').length} variante="popular" />
              ) : (
                <Vacio>Sin datos suficientes</Vacio>
              )}

              {servicioMenosPopular && servicioMenosPopular.id !== servicioMasPopular?.id && (
                <>
                  <div style={{ height: 1, background: 'var(--app-border)', margin: '16px 0' }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--app-text)', marginBottom: 10 }}>
                    Menos popular
                  </div>
                  <ServicioDestacado servicio={servicioMenosPopular} totalCitas={citas.filter(c => c.estado !== 'cancelled').length} variante="impopular" />
                </>
              )}
            </Card>

            <Card>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--app-text)', marginBottom: 4 }}>Clientes frecuentes</div>
              <div style={{ fontSize: 11, color: 'var(--app-subtle)', marginBottom: 14 }}>Top 5 con más reservas</div>
              {clientesFrecuentes.length === 0 ? (
                <Vacio>Aún no hay clientes recurrentes</Vacio>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {clientesFrecuentes.map((c, i) => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 22, fontSize: 11, fontWeight: 700, color: 'var(--app-subtle)', textAlign: 'center',
                      }}>
                        #{i + 1}
                      </div>
                      {c.foto_url ? (
                        <img src={c.foto_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <Avatar name={c.nombre} size={36} bg="#648DFF" />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.nombre}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--app-subtle)', marginTop: 1 }}>
                          {c.total} {c.total === 1 ? 'cita' : 'citas'} en {rango} días
                        </div>
                      </div>
                      <div style={{
                        padding: '4px 9px', borderRadius: 6,
                        background: 'rgba(100,141,255,0.12)', color: '#648DFF',
                        fontSize: 12, fontWeight: 700,
                      }}>
                        {c.total}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

          </div>

          {/* Distribución por estado */}
          {estados.length > 0 && (
            <Card>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--app-text)', marginBottom: 4 }}>Distribución por estado</div>
              <div style={{ fontSize: 11, color: 'var(--app-subtle)', marginBottom: 14 }}>Cómo terminan tus citas</div>
              <StackedBar items={estados} total={stats.total} />
            </Card>
          )}

        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Subcomponentes
// ───────────────────────────────────────────────────────────

function Card({ children }: { children: ReactNode }) {
  return (
    <div style={{
      background: 'var(--app-surface)', border: '1px solid var(--app-border)',
      borderRadius: 12, padding: 'clamp(16px, 4vw, 22px)',
    }}>
      {children}
    </div>
  );
}

function MetricCard({ icon, value, label, sub, color }: {
  icon: ReactNode; value: string | number; label: string; sub: string; color: string;
}) {
  return (
    <div style={{
      background: 'var(--app-surface)', border: '1px solid var(--app-border)',
      borderRadius: 12, padding: '16px 18px',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9, background: `${color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: 12,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--app-text)', lineHeight: 1, marginBottom: 4, fontFamily: "'SF Pro Display','Inter',sans-serif" }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--app-muted)' }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--app-subtle)', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function Vacio({ children }: { children: ReactNode }) {
  return (
    <div style={{
      fontSize: 13, color: 'var(--app-subtle)',
      padding: '20px 0', textAlign: 'center',
    }}>
      {children}
    </div>
  );
}

function ServicioDestacado({ servicio, totalCitas, variante }: {
  servicio: ServicioStat; totalCitas: number; variante: 'popular' | 'impopular';
}) {
  const pct = totalCitas > 0 ? Math.round((servicio.total / totalCitas) * 100) : 0;
  const acento = variante === 'popular' ? servicio.color : 'var(--app-muted)';
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 12, height: 12, borderRadius: '50%', background: servicio.color, flexShrink: 0,
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--app-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {servicio.nombre}
          </div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: acento, fontFamily: "'SF Pro Display','Inter',sans-serif", lineHeight: 1 }}>
          {servicio.total}
        </div>
      </div>
      <div style={{
        position: 'relative', height: 6, borderRadius: 3,
        background: 'var(--app-border)', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0,
          width: `${pct}%`, background: servicio.color,
          transition: 'width 400ms ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--app-subtle)' }}>{pct}% del total</span>
        <span style={{ fontSize: 11, color: 'var(--app-subtle)' }}>{formatEuros(servicio.ingresos)} estimado</span>
      </div>
    </div>
  );
}

function StackedBar({ items, total }: { items: { label: string; value: number; color: string }[]; total: number }) {
  if (total === 0) return <Vacio>Sin citas en este período</Vacio>;
  return (
    <div>
      <div style={{
        display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden',
        background: 'var(--app-border)', marginBottom: 14,
      }}>
        {items.map(it => (
          <div
            key={it.label}
            style={{
              width: `${(it.value / total) * 100}%`, background: it.color,
              transition: 'width 400ms ease',
            }}
            title={`${it.label}: ${it.value}`}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {items.map(it => (
          <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: it.color }} />
            <span style={{ fontSize: 12, color: 'var(--app-muted)' }}>{it.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--app-text)' }}>{it.value}</span>
            <span style={{ fontSize: 11, color: 'var(--app-subtle)' }}>
              ({Math.round((it.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Gráfica interactiva (SVG + hover por barra)
// ───────────────────────────────────────────────────────────

interface ChartPoint { fecha: string; label: string; valor: number; }

function InteractiveChart({ data, hoverIdx, onHover }: {
  data: ChartPoint[]; hoverIdx: number | null; onHover: (i: number | null) => void;
}) {
  const w = 900;
  const h = 180;
  const padTop = 14;
  const padBottom = 24;
  const padLeft = 28;
  const padRight = 12;
  const innerW = w - padLeft - padRight;
  const innerH = h - padTop - padBottom;

  const max = Math.max(...data.map(d => d.valor), 1);

  const barW = innerW / data.length;
  const gap = Math.min(barW * 0.25, 4);
  const barInner = Math.max(barW - gap, 2);

  // Etiquetas eje X: ~6 ticks distribuidos
  const tickStep = Math.max(1, Math.floor(data.length / 6));
  const xTicks = data
    .map((d, i) => ({ d, i }))
    .filter(({ i }) => i % tickStep === 0 || i === data.length - 1);

  // Líneas de Y guía
  const yLines = [0.25, 0.5, 0.75, 1];

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: 200, display: 'block', userSelect: 'none' }}
        onMouseLeave={() => onHover(null)}
      >
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#648DFF" stopOpacity="1" />
            <stop offset="100%" stopColor="#648DFF" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="barGradActive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A855F7" stopOpacity="1" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        {/* Líneas guía horizontales */}
        {yLines.map(t => {
          const y = padTop + innerH - innerH * t;
          return (
            <line
              key={t}
              x1={padLeft} x2={w - padRight}
              y1={y} y2={y}
              stroke="var(--app-border)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
          );
        })}

        {/* Etiquetas del eje Y (valores) */}
        {yLines.map(t => {
          const y = padTop + innerH - innerH * t;
          const v = Math.round(max * t);
          return (
            <text
              key={`yl-${t}`}
              x={padLeft - 6}
              y={y + 3}
              textAnchor="end"
              style={{ fontSize: 9, fill: 'var(--app-subtle)' }}
            >
              {v}
            </text>
          );
        })}

        {/* Barras */}
        {data.map((d, i) => {
          const barH = (d.valor / max) * innerH;
          const x = padLeft + i * barW + gap / 2;
          const y = padTop + innerH - barH;
          const isHover = hoverIdx === i;
          return (
            <g
              key={d.fecha}
              onMouseEnter={() => onHover(i)}
              style={{ cursor: 'pointer' }}
            >
              {/* Zona invisible más ancha para captar el hover */}
              <rect
                x={padLeft + i * barW}
                y={padTop}
                width={barW}
                height={innerH}
                fill="transparent"
              />
              {d.valor > 0 ? (
                <rect
                  x={x}
                  y={y}
                  width={barInner}
                  height={barH}
                  rx={Math.min(2, barInner / 2)}
                  fill={isHover ? 'url(#barGradActive)' : 'url(#barGrad)'}
                  style={{ transition: 'fill 120ms ease' }}
                />
              ) : (
                // Marcador sutil para días con 0 citas
                <rect
                  x={x}
                  y={padTop + innerH - 1.5}
                  width={barInner}
                  height={1.5}
                  rx={0.75}
                  fill="var(--app-border)"
                />
              )}
            </g>
          );
        })}

        {/* Línea vertical de referencia en hover */}
        {hoverIdx !== null && (
          <line
            x1={padLeft + hoverIdx * barW + barW / 2}
            x2={padLeft + hoverIdx * barW + barW / 2}
            y1={padTop}
            y2={padTop + innerH}
            stroke="#A855F7"
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity="0.5"
          />
        )}

        {/* Etiquetas X */}
        {xTicks.map(({ d, i }) => (
          <text
            key={`x-${d.fecha}`}
            x={padLeft + i * barW + barW / 2}
            y={h - 6}
            textAnchor="middle"
            style={{ fontSize: 9, fill: 'var(--app-subtle)' }}
          >
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

