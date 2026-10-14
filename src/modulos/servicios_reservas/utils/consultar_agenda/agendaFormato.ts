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

function aFecha(fecha: string) {
  const [a, m, d] = fecha.split('-').map(Number);
  return new Date(a, m - 1, d);
}

/** Lunes de la semana que contiene la fecha (misma regla que el backend). "2026-10-15" → "2026-10-12". */
export function inicioSemana(fecha: string) {
  const f = aFecha(fecha);
  const desdeLunes = (f.getDay() + 6) % 7; // getDay(): domingo = 0
  return sumarDias(fecha, -desdeLunes);
}

/** Los siete días, de lunes a domingo, de la semana que contiene la fecha. */
export function diasDeLaSemana(fecha: string) {
  const lunes = inicioSemana(fecha);
  return Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
}

/** "2026-10-15" → "del 12 de octubre al 18 de octubre de 2026" */
export function formatearRangoSemana(fecha: string) {
  const lunes = aFecha(inicioSemana(fecha));
  const domingo = aFecha(sumarDias(inicioSemana(fecha), 6));
  const inicio = lunes.toLocaleDateString('es-BO', { day: 'numeric', month: 'long' });
  const fin = domingo.toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' });
  return `del ${inicio} al ${fin}`;
}

/** "2026-10-12" → "lunes, 12 de octubre" */
export function formatearDiaSemana(fecha: string) {
  return aFecha(fecha).toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' });
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

/** "miércoles, 14 de octubre" → "Miércoles, 14 de octubre" (solo la primera letra; CSS capitalize pondría "De"). */
export function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** 6 → "Bs 6.00" */
export function formatearMonto(monto: number) {
  return `Bs ${monto.toFixed(2)}`;
}
