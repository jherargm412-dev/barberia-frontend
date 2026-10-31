export const PERMISOS_COMPRAS = { REGISTRAR: 'COMPRA_REGISTRAR' } as const;

/** Importe en bolivianos: "Bs 74.50". */
export const moneda = (valor: number) => `Bs ${valor.toFixed(2)}`;

/** "AAAA-MM-DD" de hoy en Bolivia (más o menos días), para la fecha de compra y los filtros. */
export function hoyBolivia(desplazarDias = 0) {
  return new Date(Date.now() + desplazarDias * 86_400_000).toLocaleDateString('en-CA', { timeZone: 'America/La_Paz' });
}
