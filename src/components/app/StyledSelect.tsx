import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { BiChevronDown } from 'react-icons/bi';

export interface StyledSelectOption {
  value: string;
  label: string;
}

interface StyledSelectProps {
  value: string;
  onChange: (next: string) => void;
  options: StyledSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  fullWidth?: boolean;
}

export default function StyledSelect({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar…',
  disabled = false,
  ariaLabel,
  fullWidth = true,
}: StyledSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);
  const display = selected?.label ?? placeholder;
  const isPlaceholder = !selected;

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
    if (active) active.scrollIntoView({ block: 'nearest' });
  }, [open]);

  const handleSelect = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'relative', display: fullWidth ? 'block' : 'inline-block', width: fullWidth ? '100%' : undefined }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(p => !p)}
        aria-label={ariaLabel ?? placeholder}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={btnStyle(disabled, open, fullWidth, isPlaceholder)}
      >
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {display}
        </span>
        <BiChevronDown size={16} style={{ opacity: 0.7, transition: 'transform 150ms', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50,
            minWidth: '100%', maxHeight: 260, overflowY: 'auto',
            background: 'var(--app-bg-elevated)',
            border: '1px solid var(--app-border)',
            borderRadius: 8,
            boxShadow: 'var(--shadow-lg)',
            padding: 4,
            animation: 'ark-fade-in 140ms ease-out both',
          }}
        >
          {options.map(opt => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                role="option"
                aria-selected={active}
                data-active={active}
                type="button"
                onClick={() => handleSelect(opt.value)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 12px', border: 'none', borderRadius: 6,
                  background: active ? 'rgba(100,141,255,0.15)' : 'transparent',
                  color: active ? '#648DFF' : 'var(--app-text)',
                  fontSize: 13, fontFamily: 'inherit', fontWeight: active ? 700 : 500,
                  cursor: 'pointer', transition: 'background 120ms',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--app-nav-hover)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const btnStyle = (disabled: boolean, open: boolean, fullWidth: boolean, isPlaceholder: boolean): CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  width: fullWidth ? '100%' : undefined,
  boxSizing: 'border-box',
  background: 'var(--app-input-bg)',
  border: `1px solid ${open ? '#648DFF' : 'var(--app-border)'}`,
  borderRadius: 8, padding: '10px 14px',
  color: isPlaceholder ? 'var(--app-subtle)' : 'var(--app-text)',
  fontSize: 13, fontFamily: 'inherit',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  transition: 'border-color 120ms',
  outline: 'none',
});
