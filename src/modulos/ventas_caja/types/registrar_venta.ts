export interface ServicioVenta {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  porcentajeComision: number;
}

export interface ProductoVenta {
  id: number;
  nombre: string;
  descripcion: string | null;
  precioVenta: number;
  stockActual: number;
}

export interface MetodoPagoVenta {
  id: number;
  nombre: string;
  proveedor: 'NINGUNO' | 'STRIPE';
  moneda: string;
}

export interface OpcionesFormularioVenta {
  cajaAbierta: boolean;
  cajaId: number | null;
  servicios: ServicioVenta[];
  productos: ProductoVenta[];
  metodosPago: MetodoPagoVenta[];
}

export interface ClienteVenta {
  idCliente: number;
  nombre: string;
  telefono: string | null;
}

export interface CitaParaCobro {
  idReserva: number;
  estado: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  cliente: ClienteVenta;
  servicioId: number;
  servicioNombre: string;
  precioServicio: number;
  empleadoId: number | null;
  barberoNombre: string | null;
  anticipoPagado: number;
}

export interface LineaServicioVentaRequest {
  servicioId: number;
  empleadoId: number;
}

export interface LineaProductoVentaRequest {
  productoId: number;
  cantidad: number;
  descripcion?: string;
}

export interface PagoVentaRequest {
  metodoPagoId: number;
  monto: number;
  paymentIntentId?: string;
}

export interface CalcularSaldoVentaRequest {
  clienteId: number;
  reservaId?: number;
  servicios: LineaServicioVentaRequest[];
  productos: LineaProductoVentaRequest[];
}

export interface CalculoSaldoVenta {
  subTotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  anticipoAplicado: number;
  saldoCobrar: number;
}

export interface RegistrarVentaRequest extends CalcularSaldoVentaRequest {
  pagos: PagoVentaRequest[];
}

export interface ComprobanteVenta {
  idNotaVenta: number;
  fecha: string;
  estado: string;
  clienteNombre: string;
  clienteTelefono: string | null;
  subTotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  anticipoAplicado: number;
  saldoCobrado: number;
  responsable: string;
  servicios: {
    idDetalleServicio: number;
    servicio: string;
    barbero: string;
    precioUnitario: number;
    porcentajeComision: number;
  }[];
  productos: {
    idDetalleNotaVenta: number;
    producto: string;
    descripcion: string | null;
    cantidad: number;
    precioUnitario: number;
    subTotal: number;
  }[];
  pagos: {
    idMovimientoCaja: number;
    medioPago: string;
    monto: number;
    referenciaExterna: string | null;
  }[];
}
