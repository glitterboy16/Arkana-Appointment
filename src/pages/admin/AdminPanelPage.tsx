import { useEffect, useState } from 'react';
import { format, parseISO, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { BiUser, BiBuildings, BiCalendarPlus, BiErrorCircle, BiRefresh } from 'react-icons/bi';
import { supabase, type ErrorLog } from '@/lib/supabase';
import { InlineLoader } from '@/components/app/Spinner';

interface Stats {
  totalClientes: number;
  totalNegocios: number;
  totalUsuariosActivos: number;
  totalUsuariosEliminados: number;
  registrosUltimos30: { fecha: string; clientes: number; negocios: number }[];
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

export default function AdminPanelPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [errores, setErrores] = useState<ErrorLog[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingErrores, setLoadingErrores] = useState(true);
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
      const totalUsuariosEliminados = usuarios.filter(u => u.eliminado).length;

      // Registros por día en los últimos 30 días
      const hoy = new Date();
      const buckets: Record<string, { clientes: number; negocios: number }> = {};
      for (let i = 29; i >= 0; i--) {
        const fecha = format(subDays(hoy, i), 'yyyy-MM-dd');
        buckets[fecha] = { clientes: 0, negocios: 0 };
      }
      for (const u of usuarios) {
        if (!u.created_at) continue;
        const fecha = u.created_at.slice(0, 10);
        if (buckets[fecha]) {
          if (u.rol === 'cliente') buckets[fecha].clientes++;
          else if (u.rol === 'negocio') buckets[fecha].negocios++;
        }
      }
      const registrosUltimos30 = Object.entries(buckets).map(([fecha, v]) => ({ fecha, ...v }));

      setStats({
        totalClientes,
        totalNegocios,
        totalUsuariosActivos,
        totalUsuariosEliminados,
        registrosUltimos30,
      });
      setLoadingStats(false);
    };

    const loadErrores = async () => {
      setLoadingErrores(true);
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (cancelled) return;
      if (error) {
        console.error('[Admin] error cargando error_logs:', error);
        setErrores([]);
      } else {
        setErrores((data ?? []) as ErrorLog[]);
      }
      setLoadingErrores(false);
    };

    void loadStats();
    void loadErrores();

    return () => { cancelled = true; };
  }, [refreshKey]);

  const maxBar = stats ? Math.max(1, ...stats.registrosUltimos30.map(r => r.clientes + r.negocios)) : 1;

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
        {/* Cards de estadísticas */}
        {loadingStats || !stats ? (
          <InlineLoader label="Cargando estadísticas…" minHeight={140} />
        ) : (
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
              icon={<BiErrorCircle size={26} />}
              label="Eliminados (soft)"
              value={stats.totalUsuariosEliminados}
              color="#F59E0B"
            />
          </div>
        )}

        {/* Gráfico simple de altas en últimos 30 días */}
        {stats && (
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
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 120 }}>
              {stats.registrosUltimos30.map((r) => {
                const total = r.clientes + r.negocios;
                const totalH = (total / maxBar) * 100;
                const clientesH = total === 0 ? 0 : (r.clientes / total) * totalH;
                const negociosH = total === 0 ? 0 : (r.negocios / total) * totalH;
                return (
                  <div
                    key={r.fecha}
                    title={`${format(parseISO(r.fecha), "d 'de' MMM", { locale: es })} · ${r.clientes} clientes, ${r.negocios} negocios`}
                    style={{
                      flex: 1, height: '100%',
                      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                      borderRadius: 3, overflow: 'hidden',
                    }}
                  >
                    {negociosH > 0 && <div style={{ height: `${negociosH}%`, background: '#22C55E' }} />}
                    {clientesH > 0 && <div style={{ height: `${clientesH}%`, background: '#648DFF' }} />}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--app-subtle)', marginTop: 8 }}>
              <span>{format(parseISO(stats.registrosUltimos30[0].fecha), "d MMM", { locale: es })}</span>
              <span>Hoy</span>
            </div>
          </div>
        )}

        {/* Card larga de errores */}
        <div style={{
          background: 'var(--app-surface)', border: '1px solid var(--app-border)',
          borderRadius: 12, overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid var(--app-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BiErrorCircle size={20} style={{ color: '#EF4444' }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--app-text)' }}>
                Errores recientes
              </div>
              <span style={{
                padding: '2px 8px', borderRadius: 10, background: 'rgba(239,68,68,0.12)',
                color: '#EF4444', fontSize: 11, fontWeight: 700,
              }}>
                {errores.length}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--app-subtle)' }}>Últimos 50 eventos</div>
          </div>

          {loadingErrores ? (
            <InlineLoader label="Cargando errores…" minHeight={180} />
          ) : errores.length === 0 ? (
            <div style={{
              padding: '36px 20px', textAlign: 'center', color: 'var(--app-subtle)',
              fontSize: 13,
            }}>
              ✓ No hay errores registrados. Todo funcionando.
            </div>
          ) : (
            <div style={{ maxHeight: 480, overflowY: 'auto' }}>
              {errores.map(err => (
                <div key={err.id} style={{
                  padding: '12px 20px', borderBottom: '1px solid var(--app-border)',
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                }}>
                  <div style={{
                    minWidth: 80, fontSize: 11, color: 'var(--app-subtle)',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {format(parseISO(err.created_at), 'd MMM HH:mm', { locale: es })}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3, flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 6,
                        background: 'rgba(100,141,255,0.15)', color: '#648DFF',
                        fontSize: 11, fontWeight: 600, fontFamily: 'monospace',
                      }}>
                        {err.contexto}
                      </span>
                      {err.url && (
                        <span style={{ fontSize: 11, color: 'var(--app-subtle)', fontFamily: 'monospace' }}>
                          {err.url}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--app-text)', wordBreak: 'break-word', lineHeight: 1.5 }}>
                      {err.mensaje}
                    </div>
                    {err.detalle && (
                      <details style={{ marginTop: 6 }}>
                        <summary style={{ fontSize: 11, color: 'var(--app-muted)', cursor: 'pointer' }}>Detalle</summary>
                        <pre style={{
                          marginTop: 4, padding: 10, borderRadius: 6,
                          background: 'var(--app-input-bg)', fontSize: 11,
                          color: 'var(--app-muted)', overflow: 'auto', maxHeight: 200,
                        }}>
                          {JSON.stringify(err.detalle, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
