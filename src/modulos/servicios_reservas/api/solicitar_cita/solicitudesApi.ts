import { http } from '../../../../shared/api/httpClient';
import type { BarberoDisponible } from '../../types/gestionar_citas';
import type { RespuestaSolicitudCita, SolicitarCitaRequest } from '../../types/solicitar_cita';

// Endpoints de /api/v1/solicitudes-cita (SolicitudCitaController.java). Exigen el permiso RESERVA_SOLICITAR.

/** Barberos que prestan el servicio elegido. */
export async function listarBarberosDelServicio(servicioId: number) {
  const respuesta = await http.get<BarberoDisponible[]>('/solicitudes-cita/barberos', { params: { servicioId } });
  return respuesta.data;
}

/** Crea la cita PENDIENTE del cliente logueado; el anticipo se paga después (CU14). */
export async function solicitarCita(datos: SolicitarCitaRequest) {
  const respuesta = await http.post<RespuestaSolicitudCita>('/solicitudes-cita', datos);
  return respuesta.data;
}