/**
 * "2026-09-10T11:30:00" → "10/09/2026 11:30:00". Se arma a mano (sin new Date) porque el backend
 * ya manda la hora de Bolivia y no queremos que el navegador la convierta a otra zona.
 */
export function formatearFechaHora(fechaHora: string) {
  const [fecha, hora = ''] = fechaHora.split('T');
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio} ${hora.slice(0, 8)}`;
}

/** Datos anteriores/nuevos como texto legible (JSON con sangría). */
export function formatearDatos(datos: Record<string, unknown>) {
  return JSON.stringify(datos, null, 2);
}
