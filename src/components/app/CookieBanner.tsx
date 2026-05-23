import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'arkana.cookies.consent.v1';

type Consent = 'accepted' | 'rejected';

// Compacto en desktop (tarjeta esquina inferior derecha), full-width sólo en
// móviles estrechos donde apilar la columna ya es lo correcto. Evita que el
// banner tape submit-buttons que viven al pie de los formularios largos.

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let shouldShow = false;
    try {
      shouldShow = !localStorage.getItem(STORAGE_KEY);
    } catch {
      shouldShow = true;
    }
    if (!shouldShow) return;
    // Pequeño delay para no chocar con la animación de entrada del hero;
    // así el banner se posa cuando el resto del contenido ya está colocado.
    const t = window.setTimeout(() => { if (!cancelled) setVisible(true); }, 1100);
    return () => { cancelled = true; window.clearTimeout(t); };
  }, []);

  const persist = (value: Consent) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // localStorage bloqueado (modo privado): el banner volverá a aparecer
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="ark-cookie-banner"
    >
      <div className="ark-cookie-banner__copy">
        Usamos solo cookies técnicas necesarias para que la app funcione. No hay rastreo
        publicitario.{' '}
        <Link to="/privacidad" className="ark-cookie-banner__link">
          Más información
        </Link>
        .
      </div>
      <div className="ark-cookie-banner__actions">
        <button
          type="button"
          onClick={() => persist('rejected')}
          className="ark-cookie-banner__btn ark-cookie-banner__btn--ghost"
        >
          Solo necesarias
        </button>
        <button
          type="button"
          onClick={() => persist('accepted')}
          className="ark-cookie-banner__btn ark-cookie-banner__btn--primary"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
