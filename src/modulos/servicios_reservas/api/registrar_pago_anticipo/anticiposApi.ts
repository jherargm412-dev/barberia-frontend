import { http } from '../../../../shared/api/httpClient';
import type {
  ConfirmarPagoQrRequest,
  QrAnticipo,
  RegistrarAnticipoRequest,
  RespuestaPagoAnticipo,
} from '../../types/registrar_pago_anticipo';

// Endpoint de /api/v1/reservas para el anticipo (PagoAnticipoController.java).

/** Cobra el anticipo de la reserva {id} en mostrador (EFECTIVO, QR o MIXTO) y la deja CONFIRMADA. */
export async function registrarAnticipo(id: number, datos: RegistrarAnticipoRequest) {
  const respuesta = await http.post<RespuestaPagoAnticipo>(`/reservas/${id}/anticipo`, datos);
  return respuesta.data;
}

/** Flujo A, paso 2: el cliente pide el QR para pagar el anticipo de su propia reserva. */
export async function generarQrAnticipo(id: number) {
  const respuesta = await http.post<QrAnticipo>(`/reservas/${id}/anticipo/qr`);
  return respuesta.data;
}

/** Flujo A, pasos 4 a 7: el cliente confirma que pagó el QR; el backend lo verifica y confirma la reserva. */
export async function confirmarPagoQr(id: number, datos: ConfirmarPagoQrRequest) {
  const respuesta = await http.post<RespuestaPagoAnticipo>(`/reservas/${id}/anticipo/confirmar-qr`, datos);
  return respuesta.data;
}