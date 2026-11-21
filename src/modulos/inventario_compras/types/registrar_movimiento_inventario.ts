// CU26 Registrar Movimiento de Inventario (copiados de los records de Java en dto/registrar_movimiento_inventario).

export type TipoMovimiento =
  | 'ENTRADA_MANUAL'
  | 'SALIDA_MANUAL'
  | 'CONSUMO_INTERNO'
  | 'MERMA'
  | 'AJUSTE_SOBRANTE'
  | 'AJUSTE_FALTANTE';

export interface ProductoOpcion {
  idProducto: number;
  nombre: string;
  tipo: 'VENTA' | 'INSUMO';
  stockActual: number;
  stockMinimo: number;
  costoPromedio: number;
}

/** suma: aumenta el stock. pideCosto: entrada (costo unitario obligatorio). soloInsumos: consumo interno. */
export interface TipoOpcion {
  valor: TipoMovimiento;
  etiqueta: string;
  suma: boolean;
  pideCosto: boolean;
  pideMotivo: boolean;
  soloInsumos: boolean;
}

export interface OpcionesMovimiento {
  productos: ProductoOpcion[];
  /** Solo los tipos que el usuario puede registrar (la Recepcionista, solo CONSUMO_INTERNO). */
  tipos: TipoOpcion[];
}

export interface RegistrarMovimientoRequest {
  productoId: number;
  tipo: TipoMovimiento;
  /** Siempre positiva: el tipo decide si suma o resta. */
  cantidad: number;
  /** Solo en la entrada manual. */
  costoUnitario: number | null;
  motivo: string | null;
}

export interface MovimientoInventario {
  idMovimientoInventario: number;
  fecha: string;
  productoId: number;
  producto: string;
  tipoProducto: 'VENTA' | 'INSUMO';
  tipo: TipoMovimiento;
  tipoEtiqueta: string;
  cantidad: number;
  /** Positiva si sumó al stock, negativa si restó. */
  cantidadConSigno: number;
  stockAnterior: number;
  stockNuevo: number;
  costoUnitario: number;
  costoTotal: number;
  motivo: string | null;
  usuarioId: number;
  registradoPor: string;
}

export interface RespuestaMovimiento {
  mensaje: string;
  movimiento: MovimientoInventario;
  stockActual: number;
  stockBajo: boolean;
  alertaStockBajo: string | null;
}

export type OrigenKardex = 'COMPRA' | 'VENTA' | 'AJUSTE' | 'MOVIMIENTO';

export interface RegistroKardex {
  fecha: string;
  origen: OrigenKardex;
  tipo: string;
  tipoEtiqueta: string;
  referencia: number | null;
  entrada: number;
  salida: number;
  /** Stock después de este registro. */
  saldo: number;
  costoUnitario: number | null;
  detalle: string | null;
  usuario: string | null;
}

export interface Kardex {
  productoId: number;
  producto: string;
  tipoProducto: 'VENTA' | 'INSUMO';
  activo: boolean;
  stockActual: number;
  stockMinimo: number;
  costoPromedio: number;
  desde: string;
  hasta: string;
  saldoInicial: number;
  totalEntradas: number;
  totalSalidas: number;
  saldoFinal: number;
  registros: RegistroKardex[];
}
