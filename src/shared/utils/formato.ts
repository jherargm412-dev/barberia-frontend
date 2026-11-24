// Formatos generales de montos y fechas (hora de Bolivia). Los usan caja, ventas y la pasarela de pago.

/** Importe en bolivianos: "Bs 74.50". */
export const moneda = (valor: number) => `Bs ${valor.toFixed(2)}`;

/** Fecha y hora del backend (hora de Bolivia, sin zona) mostrada en hora de Bolivia. */
export const fecha = (valor: string) =>
  new Date(`${valor.replace(' ', 'T')}-04:00`).toLocaleString('es-BO', { timeZone: 'America/La_Paz' });

/** "AAAA-MM-DD" de hoy en Bolivia, para los filtros de fecha. */
export function hoyBolivia(desplazarDias = 0) {
  const d = new Date(Date.now() + desplazarDias * 86_400_000);
  return d.toLocaleDateString('en-CA', { timeZone: 'America/La_Paz' });
}
