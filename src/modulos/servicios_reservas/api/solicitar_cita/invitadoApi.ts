import { http } from '../../../../shared/api/httpClient';
import type { ConsultaDisponibilidad, Disponibilidad } from '../../types/consultar_disponibilidad';
import type { BarberoDisponible, Cita } from '../../types/gestionar_citas';
import type { QrAnticipo, RespuestaPagoAnticipo } from '../../types/registrar_pago_anticipo';
import type { RespuestaCitaInvitado, SolicitarCitaInvitadoRequest } from '../../types/solicitar_cita';

// Endpoints públicos de /api/v1/publico (ReservaInvitadoController.java): reservar y pagar SIN cuenta.

/** Barberos que prestan el servicio. */
export async function listarBarberosPublico(servicioId: number) {
  const respuesta = await http.get<BarberoDisponible[]>(`/publico/servicios/${servicioId}/barberos`);
  return respuesta.data;
}

/** CU10: horas libres (sin "excluirReserva": eso es solo para reprogramar en recepción). */
export async function consultarDisponibilidadPublica(consulta: ConsultaDisponibilidad) {
  const { servicioId, fecha, empleadoId, duracion } = consulta;
  const respuesta = await http.get<Disponibilidad>('/publico/disponibilidad', {
    params: { servicioId, fecha, empleadoId, duracion },
  });
  return respuesta.data;
}

/** CU12 sin cuenta: crea la cita PENDIENTE y devuelve el código del enlace del invitado. */
export async function solicitarCitaInvitado(datos: SolicitarCitaInvitadoRequest) {
  const respuesta = await http.post<RespuestaCitaInvitado>('/publico/citas', datos);
  return respuesta.data;
}

/** La cita del invitado, por el código de su enlace. */
export async function consultarCitaInvitado(codigo: string) {
  const respuesta = await http.get<Cita>(`/publico/citas/${codigo}`);
  return respuesta.data;
}

/** CU14: QR para pagar el anticipo de la cita del invitado. */
export async function generarQrInvitado(codigo: string) {
  const respuesta = await http.post<QrAnticipo>(`/publico/citas/${codigo}/anticipo/qr`);
  return respuesta.data;
}

/** CU14: el invitado confirma que pagó el QR. */
export async function confirmarPagoQrInvitado(codigo: string, referencia: string) {
  const respuesta = await http.post<RespuestaPagoAnticipo>(`/publico/citas/${codigo}/anticipo/confirmar-qr`, {
    referencia,
  });
  return respuesta.data;
}
