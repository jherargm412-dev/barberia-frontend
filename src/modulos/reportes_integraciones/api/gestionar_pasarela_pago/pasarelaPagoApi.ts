import { http } from '../../../../shared/api/httpClient';
import type { CobroStripeIniciado, CobroTarjeta, EstadoStripe, PasarelaPago } from '../../types/gestionar_pasarela_pago';

export async function listarPasarelas(): Promise<PasarelaPago[]> {
  const respuesta = await http.get<PasarelaPago[]>('/pasarela-pago');
  return respuesta.data;
}

export async function cambiarEstadoPasarela(id: number, activo: boolean): Promise<PasarelaPago> {
  const respuesta = await http.patch<PasarelaPago>(`/pasarela-pago/${id}/estado`, { activo });
  return respuesta.data;
}

export async function obtenerEstadoStripe(): Promise<EstadoStripe> {
  const respuesta = await http.get<EstadoStripe>('/pasarela-pago/stripe');
  return respuesta.data;
}

/** Cobros con tarjeta por fecha (sin fechas, los últimos 30 días). */
export async function listarCobrosTarjeta(desde: string, hasta: string): Promise<CobroTarjeta[]> {
  const respuesta = await http.get<CobroTarjeta[]>('/pasarela-pago/stripe/cobros', {
    params: { desde: desde || undefined, hasta: hasta || undefined },
  });
  return respuesta.data;
}

/** Paso 1: el backend crea el cobro en Stripe para la caja abierta; todavía no entra dinero. */
export async function iniciarCobroStripe(concepto: string, monto: number): Promise<CobroStripeIniciado> {
  const respuesta = await http.post<CobroStripeIniciado>('/pasarela-pago/stripe/cobros', { concepto, monto });
  return respuesta.data;
}

/** Paso 2: el backend verifica el pago con Stripe y lo registra en la caja como ingreso con tarjeta. */
export async function confirmarCobroStripe(paymentIntentId: string): Promise<CobroTarjeta> {
  const respuesta = await http.post<CobroTarjeta>(`/pasarela-pago/stripe/cobros/${paymentIntentId}/confirmacion`);
  return respuesta.data;
}
