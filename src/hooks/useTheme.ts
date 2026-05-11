import { useEffect, useState, useSyncExternalStore } from 'react';

export type Tema = 'oscuro' | 'claro';
const STORAGE_KEY = 'arkana-tema';
const LEGACY_KEY = 'arkana-theme';
const EVENT = 'arkana-tema-change';

function readInitial(): Tema {
  if (typeof window === 'undefined') return 'oscuro';
  // Migración silenciosa desde la clave antigua del landing (arkana-theme: dark/light)
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy && !localStorage.getItem(STORAGE_KEY)) {
    const t: Tema = legacy === 'light' ? 'claro' : 'oscuro';
    localStorage.setItem(STORAGE_KEY, t);
    localStorage.removeItem(LEGACY_KEY);
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'claro' ? 'claro' : 'oscuro';
}

function apply(t: Tema) {
  if (typeof document === 'undefined') return;
  if (t === 'claro') document.documentElement.setAttribute('data-theme', 'light');
  else document.documentElement.removeAttribute('data-theme');
}

apply(readInitial());

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

function getSnapshot(): Tema {
  return (localStorage.getItem(STORAGE_KEY) === 'claro' ? 'claro' : 'oscuro');
}

function getServerSnapshot(): Tema {
  return 'oscuro';
}

export function useTheme() {
  const tema = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [, setTick] = useState(0);

  useEffect(() => { apply(tema); }, [tema]);

  const setTema = (t: Tema) => {
    localStorage.setItem(STORAGE_KEY, t);
    apply(t);
    window.dispatchEvent(new Event(EVENT));
    setTick(x => x + 1);
  };

  const toggle = () => setTema(tema === 'oscuro' ? 'claro' : 'oscuro');

  return { tema, setTema, toggle };
}
