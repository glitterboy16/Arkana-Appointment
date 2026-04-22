import { useEffect, useState } from 'react';

export type Tema = 'oscuro' | 'claro';
const STORAGE_KEY = 'arkana-tema';

function readInitial(): Tema {
  if (typeof window === 'undefined') return 'oscuro';
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'claro' ? 'claro' : 'oscuro';
}

function apply(t: Tema) {
  if (typeof document === 'undefined') return;
  if (t === 'claro') document.documentElement.setAttribute('data-theme', 'light');
  else document.documentElement.removeAttribute('data-theme');
}

apply(readInitial());

export function useTheme() {
  const [tema, setTema] = useState<Tema>(readInitial);

  useEffect(() => {
    apply(tema);
    localStorage.setItem(STORAGE_KEY, tema);
  }, [tema]);

  return { tema, setTema, toggle: () => setTema(t => t === 'oscuro' ? 'claro' : 'oscuro') };
}
