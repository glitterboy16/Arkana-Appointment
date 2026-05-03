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
import { BiRightArrowAlt } from 'react-icons/bi';
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
    <section className="relative overflow-hidden bg-background px-4 py-16 sm:py-20 md:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_60%,rgba(100,141,255,0.14),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col items-center gap-3 px-2 text-center md:mb-12">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            Tu negocio de un solo vistazo
          </span>
          <h2 className="bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text pb-2 text-[clamp(1.6rem,5.5vw,2rem)] font-bold leading-[1.18] tracking-[-0.01em] text-transparent md:pb-3 md:text-5xl">
            Tu negocio en una sola pantalla
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base md:text-lg">
            Mira en tiempo real lo que verán tu equipo y tus clientes desde el momento en que escanean el QR.
          </p>
        </div>

        <div className="dashboard-3d-stage relative grid gap-6 md:grid-cols-5">
          <DashboardCard className="dashboard-3d-card-left md:col-span-3" />
          <ServicesCard className="dashboard-3d-card-right md:col-span-2" />
        </div>
      </div>
    </section>
  );
}

function DashboardCard({ className }: { className?: string }) {
  return (
    <div className={cn('dashboard-3d-card relative min-w-0', className)}>
      <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand/30 via-transparent to-brand/10 blur-2xl sm:-inset-6" />
      <div className="relative rounded-2xl border border-white/10 bg-[hsl(var(--background))]/95 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5 sm:px-5 sm:py-3">
          <div className="flex flex-shrink-0 items-center gap-2">
            <span className="size-2.5 rounded-full bg-red-400/70" />
            <span className="size-2.5 rounded-full bg-amber-400/70" />
            <span className="size-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <span className="min-w-0 truncate text-[10px] font-medium text-muted-foreground sm:text-xs">
            arkana-appointments.com / panel
          </span>
          <span className="hidden flex-shrink-0 text-xs text-muted-foreground sm:inline">v1.0</span>
        </div>

        <div className="p-4 sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">Hola, Lucía</p>
              <h3 className="truncate text-base font-semibold text-foreground sm:text-lg">Resumen de hoy</h3>
            </div>
            <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-400 sm:px-3 sm:text-xs">
              <TrendingUp className="size-3" /> En racha
            </span>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2 sm:mb-5 sm:gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur sm:p-3"
              >
                <div className="mb-1 flex items-center gap-1 text-muted-foreground sm:gap-1.5">
                  <span className="flex-shrink-0">{s.icon}</span>
                  <span className="truncate text-[10px] sm:text-[11px]">{s.label}</span>
                </div>
                <div className="flex items-baseline justify-between gap-1">
                  <span className="truncate text-base font-bold text-foreground sm:text-xl">{s.value}</span>
                  <span className="flex-shrink-0 text-[10px] font-semibold text-emerald-400 sm:text-[11px]">{s.delta}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-3 flex items-end justify-between gap-2">
            <span className="truncate text-sm font-semibold text-foreground">Reservas por día</span>
            <span className="flex-shrink-0 text-xs text-muted-foreground">Última semana</span>
          </div>
          <div className="mb-4 flex h-24 items-end gap-1.5 rounded-xl border border-white/10 bg-white/5 p-2 sm:mb-5 sm:h-28 sm:gap-2 sm:p-3">
            {[40, 65, 50, 78, 60, 92, 72].map((h, i) => (
              <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
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

          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold text-foreground">Próximas citas</span>
            <span className="flex-shrink-0 text-xs text-muted-foreground">{agenda.length} hoy</span>
          </div>
          <div className="space-y-2">
            {agenda.map((a) => (
              <div
                key={a.hora}
                className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 sm:px-3"
              >
                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                  <span className="flex size-9 flex-shrink-0 items-center justify-center rounded-md bg-brand/15 text-xs font-semibold text-brand-foreground">
                    {a.hora}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{a.cliente}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.servicio}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    'flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
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
    <div className={cn('dashboard-3d-card relative min-w-0', className)}>
      <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand/20 via-transparent to-brand/30 blur-2xl sm:-inset-6" />
      <div className="relative h-full rounded-2xl border border-white/10 bg-[hsl(var(--background))]/95 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5 sm:px-5 sm:py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-7 flex-shrink-0 items-center justify-center rounded-md bg-brand/20">
              <Sparkles className="size-3.5 text-brand-foreground" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10px] text-muted-foreground sm:text-xs">Vista del cliente</p>
              <p className="truncate text-sm font-semibold text-foreground">Studio Arkana</p>
            </div>
          </div>
          <span className="flex-shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
            Abierto
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Reserva en</p>
            <p className="mt-0.5 text-[clamp(1.05rem,4.5vw,1.5rem)] font-bold leading-tight text-foreground">
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
                className="group flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5 text-left transition-all hover:border-brand/40 hover:bg-brand/10 sm:p-3"
              >
                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                  <span className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand-foreground">
                    {s.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <p className="truncate text-sm font-semibold text-foreground">{s.nombre}</p>
                      {s.badge && (
                        <span className="flex-shrink-0 rounded-full bg-brand/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand-foreground">
                          {s.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3 flex-shrink-0" />
                      {s.duracion}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold text-foreground">{s.precio}</p>
                  <p className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground group-hover:text-brand-foreground">
                    Reservar <BiRightArrowAlt className="size-3.5" />
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
