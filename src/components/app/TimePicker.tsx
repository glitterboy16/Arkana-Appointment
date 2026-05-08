import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { BiChevronDown } from 'react-icons/bi';

interface TimePickerProps {
  value: string;            // formato HH:MM o HH:MM:SS
  onChange: (next: string) => void;
  step?: number;            // minutos entre opciones (default 15)
  min?: string;             // hora mínima incluida (HH:MM)
  max?: string;             // hora máxima incluida (HH:MM)
  disabled?: boolean;
  ariaLabel?: string;
}

function toHHMM(v: string): string {
  return v.slice(0, 5);
}

function buildOptions(step: number, min: string, max: string): string[] {
  const [minH, minM] = min.split(':').map(Number);
  const [maxH, maxM] = max.split(':').map(Number);
  const start = minH * 60 + minM;
  const end = maxH * 60 + maxM;
  const out: string[] = [];
  for (let m = start; m <= end; m += step) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    out.push(`${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
  }
  return out;
}

export default function TimePicker({
  value,
  onChange,
  step = 15,
  min = '00:00',
  max = '23:45',
  disabled = false,
  ariaLabel,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const display = toHHMM(value);

  const options = buildOptions(step, min, max);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const active = listRef.current.querySelector<HTMLButtonElement>('[data-active="true"]');
    if (active) active.scrollIntoView({ block: 'center' });
  }, [open]);

  const handleSelect = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(p => !p)}
        aria-label={ariaLabel ?? 'Seleccionar hora'}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={btnStyle(disabled, open)}
      >
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{display}</span>
        <BiChevronDown size={14} style={{ opacity: 0.7 }} />
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50,
            minWidth: '100%', maxHeight: 220, overflowY: 'auto',
            background: 'var(--app-bg-elevated)',
            border: '1px solid var(--app-border)',
            borderRadius: 8,
            boxShadow: 'var(--shadow-lg)',
            padding: 4,
            animation: 'ark-fade-in 140ms ease-out both',
          }}
        >
          {options.map(opt => {
            const active = opt === display;
            return (
              <button
                key={opt}
                role="option"
                aria-selected={active}
                data-active={active}
                type="button"
                onClick={() => handleSelect(opt)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '6px 10px', border: 'none', borderRadius: 6,
                  background: active ? 'rgba(100,141,255,0.15)' : 'transparent',
                  color: active ? '#648DFF' : 'var(--app-text)',
                  fontSize: 12, fontFamily: 'inherit', fontWeight: active ? 700 : 500,
                  cursor: 'pointer', fontVariantNumeric: 'tabular-nums',
                  transition: 'background 120ms',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--app-nav-hover)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const btnStyle = (disabled: boolean, open: boolean): CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 5,
  background: 'var(--app-input-bg)',
  border: `1px solid ${open ? '#648DFF' : 'var(--app-border)'}`,
  borderRadius: 6, padding: '5px 8px',
  color: 'var(--app-text)', fontSize: 12, fontFamily: 'inherit',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  transition: 'border-color 120ms',
});
