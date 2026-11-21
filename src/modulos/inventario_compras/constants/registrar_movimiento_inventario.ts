import type { OrigenKardex, TipoMovimiento } from '../types/registrar_movimiento_inventario';

/** Permisos de CU26 (migración V32). STOCK_AJUSTAR registra todos los tipos; el consumo interno, solo insumos. */
export const PERMISOS_MOVIMIENTOS = {
  AJUSTAR: 'STOCK_AJUSTAR',
  CONSUMO: 'INVENTARIO_CONSUMO_REGISTRAR',
  CONSULTAR: 'INVENTARIO_MOVIMIENTO_CONSULTAR',
} as const;

/** Límites del backend (MovimientoInventarioService). */
export const MAX_CANTIDAD_MOVIMIENTO = 100_000;
export const MAX_MOTIVO = 200;

/** Etiquetas para los filtros (el backend también las envía en cada movimiento). */
export const TIPOS_MOVIMIENTO: { valor: TipoMovimiento; etiqueta: string; suma: boolean }[] = [
  { valor: 'ENTRADA_MANUAL', etiqueta: 'Entrada manual', suma: true },
  { valor: 'SALIDA_MANUAL', etiqueta: 'Salida manual', suma: false },
  { valor: 'CONSUMO_INTERNO', etiqueta: 'Consumo interno', suma: false },
  { valor: 'MERMA', etiqueta: 'Merma', suma: false },
  { valor: 'AJUSTE_SOBRANTE', etiqueta: 'Ajuste por conteo (sobrante)', suma: true },
  { valor: 'AJUSTE_FALTANTE', etiqueta: 'Ajuste por conteo (faltante)', suma: false },
];

export const ORIGENES_KARDEX: Record<OrigenKardex, string> = {
  COMPRA: 'Compra',
  VENTA: 'Venta',
  AJUSTE: 'Ajuste',
  MOVIMIENTO: 'Movimiento',
};

/** "2026-11-21T09:15:00" → "21/11/2026 09:15". */
export function fechaHora(valor: string) {
  const [fecha, hora = ''] = valor.split('T');
  const [a, m, d] = fecha.split('-');
  return `${d}/${m}/${a}${hora ? ` ${hora.slice(0, 5)}` : ''}`;
}
