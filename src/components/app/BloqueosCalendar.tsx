import { useMemo, useState, type CSSProperties } from 'react';
import {
  addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isBefore, startOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';

interface BloqueosCalendarProps {
  fechasBloqueadas: string[];          // ISO dates yyyy-MM-dd
  onToggle: (fecha: string) => void;
}

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function BloqueosCalendar({ fechasBloqueadas, onToggle }: BloqueosCalendarProps) {
  const [mesActual, setMesActual] = useState<Date>(startOfMonth(new Date()));
  const hoy = startOfDay(new Date());

  const dias = useMemo(() => {
    const inicio = startOfWeek(startOfMonth(mesActual), { weekStartsOn: 1 });
    const fin = endOfWeek(endOfMonth(mesActual), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: inicio, end: fin });
  }, [mesActual]);

  const setBloqueadas = new Set(fechasBloqueadas);
  const mesLabel = format(mesActual, 'MMMM yyyy', { locale: es });
  const mesLabelCap = mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1);

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <button
          type="button"
          onClick={() => setMesActual(m => subMonths(m, 1))}
          style={navBtn}
          aria-label="Mes anterior"
        >
          <BiChevronLeft size={18} />
        </button>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--app-text)' }}>
          {mesLabelCap}
        </div>
        <button
          type="button"
          onClick={() => setMesActual(m => addMonths(m, 1))}
          style={navBtn}
          aria-label="Mes siguiente"
        >
          <BiChevronRight size={18} />
        </button>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4,
        marginBottom: 6,
      }}>
        {DIAS_SEMANA.map(d => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 10, fontWeight: 700,
            color: 'var(--app-subtle)', padding: '4px 0', letterSpacing: '0.08em',
          }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4,
      }}>
        {dias.map(d => {
          const fechaIso = format(d, 'yyyy-MM-dd');
          const bloqueado = setBloqueadas.has(fechaIso);
          const enMes = isSameMonth(d, mesActual);
          const pasado = isBefore(d, hoy);
          return (
            <button
              key={fechaIso}
              type="button"
              disabled={pasado}
              onClick={() => onToggle(fechaIso)}
              style={diaBtn(bloqueado, enMes, pasado)}
              aria-pressed={bloqueado}
              title={bloqueado ? 'Click para desbloquear' : 'Click para bloquear'}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      <div style={{
        marginTop: 12, fontSize: 11, color: 'var(--app-subtle)',
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 12, height: 12, borderRadius: 4,
            background: 'rgba(239,68,68,0.25)',
            border: '1px solid rgba(239,68,68,0.5)',
          }} />
          Día bloqueado
        </span>
        <span>Toca cualquier día para bloquear o desbloquear</span>
      </div>
    </div>
  );
}

const navBtn: CSSProperties = {
  width: 30, height: 30, borderRadius: 8, border: '1px solid var(--app-border)',
  background: 'var(--app-surface)', color: 'var(--app-text)',
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};

const diaBtn = (bloqueado: boolean, enMes: boolean, pasado: boolean): CSSProperties => ({
  aspectRatio: '1 / 1',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
  borderRadius: 8,
  border: bloqueado
    ? '1px solid rgba(239,68,68,0.5)'
    : '1px solid transparent',
  background: bloqueado
    ? 'rgba(239,68,68,0.20)'
    : enMes
      ? 'var(--app-surface)'
      : 'transparent',
  color: bloqueado
    ? '#EF4444'
    : !enMes
      ? 'var(--app-subtle)'
      : pasado
        ? 'var(--app-subtle)'
        : 'var(--app-text)',
  cursor: pasado ? 'not-allowed' : 'pointer',
  opacity: pasado ? 0.4 : 1,
  transition: 'all 120ms',
});
