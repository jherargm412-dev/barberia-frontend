import { http } from '../../../../shared/api/httpClient';
import type { CobroStripeIniciado, CobroTarjeta, EstadoStripe } from '../../types/gestionar_pasarela_pago';
import type {
  CalcularSaldoVentaRequest,
  CalculoSaldoVenta,
  CitaParaCobro,
  ClienteVenta,
  ComprobanteVenta,
  OpcionesFormularioVenta,
  RegistrarVentaRequest,
} from '../../types/registrar_venta';

export async function cargarFormularioVenta(): Promise<OpcionesFormularioVenta> {
  const respuesta = await http.get<OpcionesFormularioVenta>('/ventas/formulario');
  return respuesta.data;
}

export async function obtenerCitaParaCobro(idReserva: number): Promise<CitaParaCobro> {
  const respuesta = await http.get<CitaParaCobro>(`/ventas/citas/${idReserva}`);
  return respuesta.data;
}

export async function obtenerClienteVenta(idCliente: number): Promise<ClienteVenta> {
  const respuesta = await http.get<ClienteVenta>(`/ventas/clientes/${idCliente}`);
  return respuesta.data;
}

export async function calcularSaldoVenta(datos: CalcularSaldoVentaRequest): Promise<CalculoSaldoVenta> {
  const respuesta = await http.post<CalculoSaldoVenta>('/ventas/saldo', datos);
  return respuesta.data;
}

export async function registrarVenta(datos: RegistrarVentaRequest): Promise<ComprobanteVenta> {
  const respuesta = await http.post<ComprobanteVenta>('/ventas', datos);
  return respuesta.data;
}

export async function obtenerStripeVenta(): Promise<EstadoStripe> {
  const respuesta = await http.get<EstadoStripe>('/pasarela-pago/stripe');
  return respuesta.data;
}

export async function iniciarCobroTarjetaVenta(concepto: string, monto: number): Promise<CobroStripeIniciado> {
  const respuesta = await http.post<CobroStripeIniciado>('/ventas/tarjeta', { concepto, monto });
  return respuesta.data;
}

export async function confirmarCobroTarjetaVenta(paymentIntentId: string): Promise<CobroTarjeta> {
  const respuesta = await http.post<CobroTarjeta>(`/ventas/tarjeta/${paymentIntentId}/confirmacion`);
  return respuesta.data;
}
