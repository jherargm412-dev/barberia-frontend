// Tipos de "¿Olvidaste tu contraseña?" (RecuperacionController.java, 05 §5.5).

export interface RecuperarContrasenaRequest {
  correo: string;
  codigo: string;
  contrasenaNueva: string;
  confirmacion: string;
}

export interface RespuestaRecuperacion {
  mensaje: string;
}
