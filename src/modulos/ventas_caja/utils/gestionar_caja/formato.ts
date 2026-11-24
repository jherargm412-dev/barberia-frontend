import { moneda } from '../../../../shared/utils/formato';

// Los formatos generales viven en shared/utils/formato.ts; se reexportan para las pantallas de caja y venta.
export { fecha, hoyBolivia, moneda } from '../../../../shared/utils/formato';

/** Resultado del arqueo: cuadrada, faltante (negativo) o sobrante (positivo). */
export function resultadoArqueo(diferencia: number | null): { texto: string; color: 'success' | 'error' | 'warning' } {
  if (diferencia === null || diferencia === 0) return { texto: 'Cuadrada', color: 'success' };
  return diferencia < 0
    ? { texto: `Faltante ${moneda(-diferencia)}`, color: 'error' }
    : { texto: `Sobrante ${moneda(diferencia)}`, color: 'warning' };
}

