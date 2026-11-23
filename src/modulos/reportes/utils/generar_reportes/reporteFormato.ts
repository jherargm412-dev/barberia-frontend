import type { FiltrosReporte, FormatoExportacion, Reporte, TipoDato, ValorCelda } from '../../types/generar_reportes';

/** Hoy en Bolivia como "2026-11-21" (el formato en-CA de Intl ya es año-mes-día). */
export function hoyBolivia() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/La_Paz' }).format(new Date());
}

/** Filtros con los que se abre un reporte: el mes actual. */
export function filtrosIniciales(): FiltrosReporte {
  return { periodo: 'MENSUAL', fecha: hoyBolivia() };
}

const numero = (valor: number, decimales: number, minimo = decimales) =>
  valor.toLocaleString('en-US', { minimumFractionDigits: minimo, maximumFractionDigits: decimales });

/**
 * Valor de una celda como texto, igual que en el PDF: montos "Bs 1,234.50", fechas "21/11/2026" y
 * fecha-hora "21/11/2026 16:30".
 */
export function formatearValor(valor: ValorCelda, tipo: TipoDato): string {
  if (valor === null || valor === '') return '';
  switch (tipo) {
    case 'MONEDA':
      return `Bs ${numero(Number(valor), 2)}`;
    case 'ENTERO':
      return numero(Number(valor), 0);
    case 'DECIMAL':
      return numero(Number(valor), 2, 0);
    case 'FECHA': {
      const [a, m, d] = String(valor).split('-');
      return `${d}/${m}/${a}`;
    }
    case 'FECHA_HORA': {
      const [fecha, hora = ''] = String(valor).split('T');
      const [a, m, d] = fecha.split('-');
      return `${d}/${m}/${a} ${hora.slice(0, 5)}`;
    }
    default:
      return String(valor);
  }
}

/** Las columnas numéricas se alinean a la derecha. */
export function esNumerica(tipo: TipoDato) {
  return tipo === 'MONEDA' || tipo === 'ENTERO' || tipo === 'DECIMAL';
}

/** Mismo nombre que pone el backend: reporte-ventas_2026-11-01_2026-11-30.pdf */
export function nombreArchivo(reporte: Reporte, formato: FormatoExportacion) {
  return `reporte-${reporte.tipo}_${reporte.desde}_${reporte.hasta}.${formato}`;
}

/** Revisa el rango antes de pedirlo (el backend valida lo mismo). Devuelve los errores por campo. */
export function validarPeriodo(filtros: FiltrosReporte): Record<string, string> {
  const errores: Record<string, string> = {};
  if (filtros.periodo === 'RANGO') {
    if (!filtros.desde) errores.desde = 'Seleccione una fecha';
    if (!filtros.hasta) errores.hasta = 'Seleccione una fecha';
    if (filtros.desde && filtros.hasta && filtros.desde > filtros.hasta) {
      errores.desde = 'Debe ser anterior o igual a la fecha final';
    }
  } else if (!filtros.fecha) {
    errores.fecha = 'Seleccione una fecha';
  }
  return errores;
}

/** Deja solo los campos del periodo elegido (por ejemplo, desde/hasta solo en RANGO). */
export function limpiarPeriodo(filtros: FiltrosReporte): FiltrosReporte {
  const { desde = '', hasta = '', fecha = '', ...resto } = filtros;
  return filtros.periodo === 'RANGO' ? { ...resto, desde, hasta } : { ...resto, fecha };
}
