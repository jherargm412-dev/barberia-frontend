// Tipos de la activación por invitación (InvitacionController.java).

export interface DatosInvitacion {
  nombre: string;
  correo: string;
}

export interface AceptarInvitacionRequest {
  token: string;
  contrasena: string;
  confirmacion: string;
}

export interface RespuestaInvitacion {
  mensaje: string;
}
