import type {
  CalcularSaldoVentaRequest,
  ComprobanteVenta,
  LineaProductoVentaRequest,
  LineaServicioVentaRequest,
  PagoVentaRequest,
  RegistrarVentaRequest,
} from '../../types/registrar_venta';

export interface LineaServicioFormulario {
  clave: number;
  servicioId: number | '';
  empleadoId: number | '';
}

export interface LineaProductoFormulario {
  clave: number;
  productoId: number | '';
  cantidad: string;
  descripcion: string;
}

export interface LineaPagoFormulario {
  clave: number;
  metodoPagoId: number | '';
  monto: string;
  paymentIntentId?: string;
}

export function dineroCentavos(valor: number) {
  return Math.round((valor + Number.EPSILON) * 100);
}

export function formatearCentavos(centavos: number) {
  return (centavos / 100).toFixed(2);
}

export function construirDatosVenta(
  clienteId: number,
  reservaId: number | undefined,
  servicios: LineaServicioFormulario[],
  productos: LineaProductoFormulario[],
): CalcularSaldoVentaRequest {
  const lineasServicio: LineaServicioVentaRequest[] = servicios.map((linea) => ({
    servicioId: Number(linea.servicioId),
    empleadoId: Number(linea.empleadoId),
  }));
  const lineasProducto: LineaProductoVentaRequest[] = productos.map((linea) => ({
    productoId: Number(linea.productoId),
    cantidad: Number(linea.cantidad),
    ...(linea.descripcion.trim() ? { descripcion: linea.descripcion.trim() } : {}),
  }));
  return {
    clienteId,
    ...(reservaId === undefined ? {} : { reservaId }),
    servicios: lineasServicio,
    productos: lineasProducto,
  };
}

export function construirRequestVenta(
  clienteId: number,
  reservaId: number | undefined,
  servicios: LineaServicioFormulario[],
  productos: LineaProductoFormulario[],
  pagos: LineaPagoFormulario[],
): RegistrarVentaRequest {
  const datos = construirDatosVenta(clienteId, reservaId, servicios, productos);
  const pagosRequest: PagoVentaRequest[] = pagos.map((pago) => ({
    metodoPagoId: Number(pago.metodoPagoId),
    monto: Number(pago.monto),
    ...(pago.paymentIntentId ? { paymentIntentId: pago.paymentIntentId } : {}),
  }));
  return { ...datos, pagos: pagosRequest };
}

export function textoComprobante(comprobante: ComprobanteVenta) {
  return `Venta #${comprobante.idNotaVenta}`;
}
