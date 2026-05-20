// Validadores compartidos entre AuthPage, RecuperarPasswordPage y
// CuentaSeguridadCard. Vivían duplicados en cada uno.

export const RE_EMAIL = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
export const RE_NOMBRE = /^[A-Za-zÀ-ÖØ-öø-ÿ' .\-]{2,60}$/;
export const RE_NEGOCIO = /^[\w\sÀ-ÖØ-öø-ÿ&'.,\-]{2,80}$/;
export const RE_TEL_ES = /^[6-9]\d{8}$/;
export const RE_TEL_INTL = /^\+\d{7,15}$/;

const RE_PASS_MIN = /.{8,}/;
const RE_PASS_LOWER = /[a-z]/;
const RE_PASS_UPPER = /[A-Z]/;
const RE_PASS_DIGIT = /\d/;

export const PASSWORD_REQUISITOS_MSG =
  'La contraseña debe tener 8+ caracteres, mayúscula, minúscula y número';

export interface ChecksContrasena {
  longitud: boolean;
  minuscula: boolean;
  mayuscula: boolean;
  numero: boolean;
}

export interface EvalContrasena {
  checks: ChecksContrasena;
  score: number;
  etiqueta: string;
  color: string;
}

export function evaluarContrasena(p: string): EvalContrasena {
  const checks: ChecksContrasena = {
    longitud: RE_PASS_MIN.test(p),
    minuscula: RE_PASS_LOWER.test(p),
    mayuscula: RE_PASS_UPPER.test(p),
    numero: RE_PASS_DIGIT.test(p),
  };
  const score = Object.values(checks).filter(Boolean).length;
  let etiqueta = 'Demasiado corta';
  let color = '#EF4444';
  if (score === 4) { etiqueta = 'Excelente'; color = '#22C55E'; }
  else if (score === 3) { etiqueta = 'Buena'; color = '#84CC16'; }
  else if (score === 2) { etiqueta = 'Aceptable'; color = '#F59E0B'; }
  return { checks, score, etiqueta, color };
}

export function contrasenaValida(p: string): boolean {
  return evaluarContrasena(p).score === 4;
}

export function emailValido(e: string): boolean {
  return RE_EMAIL.test(e);
}

export function telefonoValido(t: string): boolean {
  const norm = t.trim().replace(/\s/g, '');
  return RE_TEL_ES.test(norm) || RE_TEL_INTL.test(norm);
}
