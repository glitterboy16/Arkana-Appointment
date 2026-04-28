import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface ModalProps {
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, isOpen, onClose }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'var(--app-overlay)' }} onClick={onClose}>
      <div className="app-modal max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[var(--app-border)] px-6 py-4">
          <h2 className="text-xl-title font-bold">{title}</h2>
          <button onClick={onClose} className="app-muted text-2xl leading-none transition hover:text-primary-600" aria-label={t('common.close')}>
            ×
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
