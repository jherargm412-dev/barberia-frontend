/** Fecha de hoy en formato "AAAA-MM-DD", según el reloj del equipo. */
export function hoy() {
  return aFechaIso(new Date());
}

export function aFechaIso(d: Date) {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** "2026-10-13" + n días → "2026-10-14". */
export function sumarDias(fecha: string, dias: number) {
  const [a, m, d] = fecha.split('-').map(Number);
  return aFechaIso(new Date(a, m - 1, d + dias));
}

/** True solo si el texto es una fecha real en formato "AAAA-MM-DD" (rechaza 2026-13-45). */
export function esFechaValida(fecha: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const [a, m, d] = fecha.split('-').map(Number);
  const f = new Date(a, m - 1, d);
  return f.getFullYear() === a && f.getMonth() === m - 1 && f.getDate() === d;
}

/** "2026-10-13" → "13/10/2026" */
export function formatearFecha(fecha: string) {
  const [a, m, d] = fecha.split('-');
  return `${d}/${m}/${a}`;
}

/** "2026-10-13" → "martes, 13 de octubre de 2026" */
export function formatearFechaLarga(fecha: string) {
  const [a, m, d] = fecha.split('-').map(Number);
  return new Date(a, m - 1, d).toLocaleDateString('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** 6 → "Bs 6.00" */
export function formatearMonto(monto: number) {
  return `Bs ${monto.toFixed(2)}`;
}
