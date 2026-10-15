import { http } from '../../../../shared/api/httpClient';
import type {
  AceptarInvitacionRequest,
  DatosInvitacion,
  RespuestaInvitacion,
} from '../../types/aceptar_invitacion';

// Endpoints públicos de /api/v1/auth/invitacion (InvitacionController.java). No llevan token de sesión.

/** Valida el enlace y devuelve a quién pertenece. */
export async function consultarInvitacion(token: string) {
  const respuesta = await http.get<DatosInvitacion>('/auth/invitacion', { params: { token } });
  return respuesta.data;
}

/** El invitado elige su contraseña. */
export async function aceptarInvitacion(datos: AceptarInvitacionRequest) {
  const respuesta = await http.post<RespuestaInvitacion>('/auth/invitacion', datos);
  return respuesta.data;
}
