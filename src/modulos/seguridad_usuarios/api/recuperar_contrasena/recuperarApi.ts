import { http } from '../../../../shared/api/httpClient';
import type { RecuperarContrasenaRequest, RespuestaRecuperacion } from '../../types/recuperar_contrasena';

// Endpoints públicos de /api/v1/auth/recuperar (RecuperacionController.java). No llevan token.

/** Paso 1: pide un código de 6 dígitos al correo (responde lo mismo aunque el correo no exista). */
export async function solicitarCodigo(correo: string) {
  const respuesta = await http.post<RespuestaRecuperacion>('/auth/recuperar/codigo', { correo });
  return respuesta.data;
}

/** Paso 2: código + nueva contraseña. */
export async function recuperarContrasena(datos: RecuperarContrasenaRequest) {
  const respuesta = await http.post<RespuestaRecuperacion>('/auth/recuperar', datos);
  return respuesta.data;
}
