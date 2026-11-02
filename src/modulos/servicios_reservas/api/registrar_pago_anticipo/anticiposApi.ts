import { http } from '../../../../shared/api/httpClient';
import type {
  AnticipoTarjeta,
  RegistrarAnticipoRequest,
  RespuestaPagoAnticipo,
} from '../../types/registrar_pago_anticipo';

// Endpoint de /api/v1/reservas para el anticipo (PagoAnticipoController.java).

/** Cobra el anticipo de la reserva {id} en mostrador (EFECTIVO, QR o MIXTO) y la deja CONFIRMADA. */
export async function registrarAnticipo(id: number, datos: RegistrarAnticipoRequest) {
  const respuesta = await http.post<RespuestaPagoAnticipo>(`/reservas/${id}/anticipo`, datos);
  return respuesta.data;
}

/** Flujo A, paso 2: el cliente prepara el pago con tarjeta (Stripe) del anticipo de su propia reserva. */
export async function iniciarPagoTarjeta(id: number) {
  const respuesta = await http.post<AnticipoTarjeta>(`/reservas/${id}/anticipo/tarjeta`);
  return respuesta.data;
}

/** Flujo A, pasos 4 a 7: tras cobrar con Stripe.js, el backend verifica el cobro y confirma la reserva. */
export async function confirmarPagoTarjeta(id: number, paymentIntentId: string) {
  const respuesta = await http.post<RespuestaPagoAnticipo>(
    `/reservas/${id}/anticipo/tarjeta/${paymentIntentId}/confirmacion`,
  );
  return respuesta.data;
}
