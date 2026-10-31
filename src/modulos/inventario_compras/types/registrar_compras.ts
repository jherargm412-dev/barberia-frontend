export interface DetalleCompraRequest {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
}

export interface RegistrarCompraRequest {
  proveedorId: number;
  metodoPagoId: number;
  nroFact: string;
  /** "AAAA-MM-DD"; vacío = hoy. */
  fecha: string;
  detalles: DetalleCompraRequest[];
}

export interface DetalleCompra {
  idDetalleNotaCompra: number;
  productoId: number;
  producto: string;
  tipo: 'VENTA' | 'INSUMO';
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subTotal: number;
}

export interface Compra {
  idNotaCompra: number;
  fecha: string;
  nroFact: string | null;
  proveedorId: number;
  proveedor: string;
  nitProveedor: string;
  metodoPagoId: number | null;
  metodoPago: string | null;
  subTotal: number;
  /** Egreso en la caja; solo si se pagó en efectivo. */
  idMovimientoCaja: number | null;
  registradoPor: string;
  fechaRegistro: string;
  detalles: DetalleCompra[];
}

export interface CompraResumen {
  idNotaCompra: number;
  fecha: string;
  nroFact: string | null;
  proveedorId: number;
  proveedor: string;
  metodoPago: string | null;
  subTotal: number;
  registradoPor: string;
}

export interface RespuestaCompra {
  mensaje: string;
  compra: Compra;
}

export interface OpcionesCompra {
  proveedores: { idProveedor: number; empresa: string; nit: string }[];
  productos: { idProducto: number; nombre: string; tipo: 'VENTA' | 'INSUMO'; costo: number; stockActual: number }[];
  /** afectaCaja: el pago sale del efectivo de la caja abierta. */
  metodosPago: { idMetodoPago: number; nombre: string; afectaCaja: boolean }[];
}
