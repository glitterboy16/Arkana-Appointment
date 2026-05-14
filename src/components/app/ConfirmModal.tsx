import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { BiX } from 'react-icons/bi';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
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

  if (!open) return null;

  const confirmBg = variant === 'danger' ? '#EF4444'  : '#004AAD';
  const confirmHover = variant === 'danger' ? '#DC2626' : '#0057CC';

  return createPortal(
    <div onClick={() => !loading && onCancel()} className="ark-modal-overlay">
      <div
        onClick={(e) => e.stopPropagation()}
        className="ark-confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          onClick={onCancel}
          disabled={loading}
          aria-label="Cerrar"
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 34, height: 34, borderRadius: '50%', border: 'none',
            background: 'var(--app-surface)', color: 'var(--app-muted)',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            opacity: loading ? 0.5 : 1,
          }}
        >
          <BiX size={20} />
        </button>

        <div style={{ padding: '28px 24px 8px' }}>
          <h3 style={{
            margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em',
            color: 'var(--app-text)', fontFamily: "'SF Pro Display','Inter',sans-serif",
            paddingRight: 28,
          }}>
            {title}
          </h3>
          <div style={{
            marginTop: 10, fontSize: 14, lineHeight: 1.55,
            color: 'var(--app-muted)',
          }}>
            {message}
          </div>
        </div>

        <div style={{
          padding: '14px 18px calc(14px + env(safe-area-inset-bottom, 0px))',
          borderTop: '1px solid var(--app-border)',
          display: 'flex', gap: 10, justifyContent: 'flex-end',
        }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '10px 18px', borderRadius: 10,
              background: 'transparent', border: '1px solid var(--app-border)',
              color: 'var(--app-muted)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '10px 18px', borderRadius: 10, border: 'none',
              background: confirmBg, color: '#FAFAFA',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 150ms ease',
              opacity: loading ? 0.7 : 1,
              minWidth: 110,
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = confirmHover; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = confirmBg; }}
          >
            {loading ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
