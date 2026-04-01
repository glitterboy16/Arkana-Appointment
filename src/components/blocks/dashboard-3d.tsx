import {
  CalendarCheck,
  Clock,
  DollarSign,
  Scissors,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Servicio = {
  nombre: string;
  duracion: string;
  precio: string;
  icon: React.ReactNode;
  badge?: string;
};

const servicios: Servicio[] = [
  {
    nombre: 'Corte de pelo + barba',
    duracion: '45 min',
    precio: '€25',
    icon: <Scissors className="size-4" />,
    badge: 'Más reservado',
  },
  {
    nombre: 'Limpieza facial premium',
    duracion: '60 min',
    precio: '€48',
    icon: <Sparkles className="size-4" />,
  },
  {
    nombre: 'Consulta de fisio',
    duracion: '30 min',
    precio: '€35',
    icon: <Stethoscope className="size-4" />,
  },
  {
    nombre: 'Manicura completa',
    duracion: '40 min',
    precio: '€22',
    icon: <Sparkles className="size-4" />,
  },
];

const stats = [
  { label: 'Citas hoy', value: '24', delta: '+12%', icon: <CalendarCheck className="size-4" /> },
  { label: 'Clientes activos', value: '186', delta: '+8%', icon: <Users className="size-4" /> },
  { label: 'Ingresos', value: '€1.240', delta: '+18%', icon: <DollarSign className="size-4" /> },
];

const agenda = [
  { hora: '09:00', cliente: 'María García', servicio: 'Corte + barba', estado: 'confirmada' },
  { hora: '10:30', cliente: 'Luis Fernández', servicio: 'Limpieza facial', estado: 'confirmada' },
  { hora: '12:00', cliente: 'Ana Ruiz', servicio: 'Manicura', estado: 'pendiente' },
  { hora: '13:30', cliente: 'Carlos Pérez', servicio: 'Consulta fisio', estado: 'confirmada' },
];

export function Dashboard3D() {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-20 md:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_60%,rgba(100,141,255,0.14),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            Vista del producto
          </span>
          <h2 className="bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text pb-2 text-3xl font-bold leading-[1.18] tracking-[-0.01em] text-transparent md:pb-3 md:text-5xl">
            Tu negocio en una sola pantalla
          </h2>
          <p className="max-w-xl text-base text-muted-foreground md:text-lg">
            Mira en tiempo real lo que verán tu equipo y tus clientes desde el momento en que escanean el QR.
          </p>
        </div>

        <div
          className="relative grid gap-6 md:grid-cols-5"
          style={{ perspective: '1800px' }}
        >
          <DashboardCard className="md:col-span-3" />
          <ServicesCard className="md:col-span-2" />
        </div>
      </div>
    </section>
  );
}

function DashboardCard({ className }: { className?: string }) {
  return (
    <div
      className={cn('relative', className)}
      style={{
        transform: 'rotateY(8deg) rotateX(6deg)',
        transformStyle: 'preserve-3d',
      }}
    >
      <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-brand/30 via-transparent to-brand/10 blur-2xl" />
      <div className="relative rounded-2xl border border-white/10 bg-[hsl(var(--background))]/95 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-red-400/70" />
            <span className="size-2.5 rounded-full bg-amber-400/70" />
            <span className="size-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            arkana-appointments.com / panel
          </span>
          <span className="text-xs text-muted-foreground">v1.0</span>
        </div>

        <div className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Hola, Lucía</p>
              <h3 className="text-lg font-semibold text-foreground">Resumen de hoy</h3>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <TrendingUp className="size-3" /> En racha
            </span>
          </div>

          <div className="mb-5 grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur"
              >
                <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                  {s.icon}
                  <span className="text-[11px]">{s.label}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-foreground">{s.value}</span>
                  <span className="text-[11px] font-semibold text-emerald-400">{s.delta}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-3 flex items-end justify-between">
            <span className="text-sm font-semibold text-foreground">Reservas por día</span>
            <span className="text-xs text-muted-foreground">Última semana</span>
          </div>
          <div className="mb-5 flex h-28 items-end gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
            {[40, 65, 50, 78, 60, 92, 72].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-md bg-gradient-to-t from-brand/80 to-brand/40"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'][i]}
                </span>
              </div>
            ))}
          </div>

          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Próximas citas</span>
            <span className="text-xs text-muted-foreground">{agenda.length} hoy</span>
          </div>
          <div className="space-y-2">
            {agenda.map((a) => (
              <div
                key={a.hora}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-md bg-brand/15 text-xs font-semibold text-brand-foreground">
                    {a.hora}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.cliente}</p>
                    <p className="text-xs text-muted-foreground">{a.servicio}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    a.estado === 'confirmada'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-amber-500/10 text-amber-400',
                  )}
                >
                  {a.estado}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ServicesCard({ className }: { className?: string }) {
  return (
    <div
      className={cn('relative', className)}
      style={{
        transform: 'rotateY(-8deg) rotateX(6deg)',
        transformStyle: 'preserve-3d',
      }}
    >
      <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-brand/20 via-transparent to-brand/30 blur-2xl" />
      <div className="relative h-full rounded-2xl border border-white/10 bg-[hsl(var(--background))]/95 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-brand/20">
              <Sparkles className="size-3.5 text-brand-foreground" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Vista del cliente</p>
              <p className="text-sm font-semibold text-foreground">Studio Arkana</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
            Abierto
          </span>
        </div>

        <div className="p-5">
          <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Reserva en</p>
            <p className="mt-0.5 text-2xl font-bold text-foreground">
              3 pasos · sin registrarte
            </p>
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Servicios disponibles
          </p>
          <div className="space-y-2">
            {servicios.map((s) => (
              <button
                key={s.nombre}
                type="button"
                className="group flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-left transition-all hover:border-brand/40 hover:bg-brand/10"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-brand/15 text-brand-foreground">
                    {s.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{s.nombre}</p>
                      {s.badge && (
                        <span className="rounded-full bg-brand/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand-foreground">
                          {s.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {s.duracion}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{s.precio}</p>
                  <p className="text-[10px] text-muted-foreground group-hover:text-brand-foreground">
                    Reservar →
                  </p>
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand/90"
          >
            Ver todos los servicios
          </button>
        </div>
      </div>
    </div>
  );
}
