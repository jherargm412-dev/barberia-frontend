/** Importe en bolivianos: "Bs 74.50". */
export const moneda = (valor: number) => `Bs ${valor.toFixed(2)}`;

/** Fecha y hora del backend (hora de Bolivia, sin zona) mostrada en hora de Bolivia. */
export const fecha = (valor: string) =>
  new Date(`${valor.replace(' ', 'T')}-04:00`).toLocaleString('es-BO', { timeZone: 'America/La_Paz' });

/** Resultado del arqueo: cuadrada, faltante (negativo) o sobrante (positivo). */
export function resultadoArqueo(diferencia: number | null): { texto: string; color: 'success' | 'error' | 'warning' } {
  if (diferencia === null || diferencia === 0) return { texto: 'Cuadrada', color: 'success' };
  return diferencia < 0
    ? { texto: `Faltante ${moneda(-diferencia)}`, color: 'error' }
    : { texto: `Sobrante ${moneda(diferencia)}`, color: 'warning' };
}

/** "AAAA-MM-DD" de hoy en Bolivia, para los filtros de fecha. */
export function hoyBolivia(desplazarDias = 0) {
  const d = new Date(Date.now() + desplazarDias * 86_400_000);
  return d.toLocaleDateString('en-CA', { timeZone: 'America/La_Paz' });
}
