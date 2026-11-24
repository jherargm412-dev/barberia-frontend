// Tipos de Generar Reportes (RF29/RF30), copiados de los DTOs del backend (modulos.reportes_integraciones.dto.generar_reportes).

/** Cómo se muestra un valor; según esto se formatea (montos, fechas…) y se alinea. */
export type TipoDato = 'TEXTO' | 'ENTERO' | 'DECIMAL' | 'MONEDA' | 'FECHA' | 'FECHA_HORA';

/** Una celda: texto, número, fecha ("2026-11-02") o fecha-hora ("2026-11-02T10:30:00"); null si está vacía. */
export type ValorCelda = string | number | null;

export interface FiltroAplicado {
  etiqueta: string;
  valor: string;
}

export interface Indicador {
  etiqueta: string;
  valor: number;
  tipo: TipoDato;
  detalle: string | null;
}

export interface Grafico {
  titulo: string;
  etiquetas: string[];
  valores: number[];
  tipo: TipoDato;
}

export interface Columna {
  titulo: string;
  tipo: TipoDato;
}

export interface Tabla {
  titulo: string;
  descripcion: string | null;
  columnas: Columna[];
  /** Cada fila trae un valor por columna, en el mismo orden. */
  filas: ValorCelda[][];
  /** Fila de totales (null en las columnas sin total); null si la tabla no lleva totales. */
  totales: ValorCelda[] | null;
}

/** ReporteResponse: la estructura es la misma para los 8 reportes. */
export interface Reporte {
  tipo: string;
  titulo: string;
  descripcion: string;
  periodo: string;
  desde: string;
  hasta: string;
  filtros: FiltroAplicado[];
  indicadores: Indicador[];
  grafico: Grafico | null;
  tablas: Tabla[];
  generadoPor: string;
  generadoEn: string;
}

export interface Opcion {
  id: number;
  nombre: string;
}

/** Listas para los selectores de filtros (GET /reportes/opciones). */
export interface OpcionesReporte {
  barberos: Opcion[];
  productos: Opcion[];
  usuarios: Opcion[];
}

export type Periodo = 'DIARIO' | 'SEMANAL' | 'MENSUAL' | 'RANGO';

export type FormatoExportacion = 'pdf' | 'xlsx' | 'html';

/**
 * Filtros tal como viajan en la URL de la página y en la del backend, todos como texto:
 * { periodo: 'MENSUAL', fecha: '2026-11-01', empleadoId: '3' }. Un valor vacío significa "Todos".
 */
export type FiltrosReporte = Record<string, string>;
