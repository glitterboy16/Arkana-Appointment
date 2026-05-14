import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { BiX } from 'react-icons/bi';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import TimePicker from './TimePicker';

interface ReagendarModalProps {
  open: boolean;
  citaInfo: { cliente_nombre: string; fecha: string; hora_inicio: string } | null;
  onConfirm: (fecha: string, hora: string) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ReagendarModal({ open, citaInfo, onConfirm, onCancel, loading = false }: ReagendarModalProps) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  useEffect(() => {
    if (open && citaInfo) {
      setFecha(citaInfo.fecha);
      setHora(citaInfo.hora_inicio.slice(0, 5));
    }
  }, [open, citaInfo]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !loading) onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, loading, onCancel]);

  if (!open || !citaInfo) return null;

  const fechaActualLabel = format(parseISO(citaInfo.fecha), "d 'de' MMMM", { locale: es });
  const hoy = format(new Date(), 'yyyy-MM-dd');

  return createPortal(
    <div onClick={() => !loading && onCancel()} className="ark-modal-overlay">
      <div
        onClick={(e) => e.stopPropagation()}
        className="ark-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Reagendar cita"
        style={{ maxWidth: 460 }}
      >
        <button
          onClick={onCancel}
          disabled={loading}
          aria-label="Cerrar"
          style={closeBtn(loading)}
        >
          <BiX size={20} />
        </button>

        <div style={{ padding: '28px 24px 8px' }}>
          <h3 style={{
            margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em',
            color: 'var(--app-text)', fontFamily: "'SF Pro Display','Inter',sans-serif",
            paddingRight: 28,
          }}>
            Reagendar cita
          </h3>
          <div style={{ marginTop: 6, fontSize: 13, color: 'var(--app-muted)' }}>
            Cliente: <strong style={{ color: 'var(--app-text)' }}>{citaInfo.cliente_nombre}</strong>
          </div>
          <div style={{ marginTop: 2, fontSize: 12, color: 'var(--app-subtle)' }}>
            Cita actual: {fechaActualLabel} a las {citaInfo.hora_inicio.slice(0, 5)}
          </div>

          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Nueva fecha</label>
              <input
                type="date"
                value={fecha}
                min={hoy}
                onChange={(e) => setFecha(e.target.value)}
                disabled={loading}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Nueva hora</label>
              <div>
                <TimePicker
                  value={hora}
                  onChange={setHora}
                  disabled={loading}
                  ariaLabel="Nueva hora"
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{
          padding: '14px 18px calc(14px + env(safe-area-inset-bottom, 0px))',
          borderTop: '1px solid var(--app-border)',
          marginTop: 12,
          display: 'flex', gap: 10, justifyContent: 'flex-end',
        }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={btnSec(loading)}
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(fecha, hora)}
            disabled={loading || !fecha || !hora}
            style={btnPrim(loading || !fecha || !hora)}
          >
            {loading ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const closeBtn = (loading: boolean): CSSProperties => ({
  position: 'absolute', top: 12, right: 12,
  width: 34, height: 34, borderRadius: '50%', border: 'none',
  background: 'var(--app-surface)', color: 'var(--app-muted)',
  cursor: loading ? 'not-allowed' : 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  opacity: loading ? 0.5 : 1,
});

const labelStyle: CSSProperties = {
  display: 'block', fontSize: 11, color: 'var(--app-muted)',
  marginBottom: 6, letterSpacing: '0.03em', textTransform: 'uppercase', fontWeight: 700,
};

const inputStyle: CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'var(--app-input-bg)',
  border: '1px solid var(--app-border)',
  borderRadius: 8, padding: '10px 12px',
  color: 'var(--app-text)', fontSize: 13, fontFamily: 'inherit', outline: 'none',
};

const btnSec = (disabled: boolean): CSSProperties => ({
  padding: '10px 18px', borderRadius: 10,
  background: 'transparent', border: '1px solid var(--app-border)',
  color: 'var(--app-muted)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
});

const btnPrim = (disabled: boolean): CSSProperties => ({
  padding: '10px 18px', borderRadius: 10, border: 'none',
  background: '#004AAD', color: '#FAFAFA',
  fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.6 : 1,
  minWidth: 130,
});
