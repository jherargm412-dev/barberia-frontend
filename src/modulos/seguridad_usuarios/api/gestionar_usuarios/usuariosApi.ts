import { http } from '../../../../shared/api/httpClient';
import type { PaginaRespuesta } from '../../../../shared/api/types';
import type {
  ActualizarUsuarioRequest,
  CrearUsuarioRequest,
  FiltrosUsuarios,
  RespuestaRegistro,
  UsuarioDetalle,
  UsuarioResumen,
} from '../../types/gestionar_usuarios';

// Endpoints de /api/v1/usuarios (UsuarioController.java).

export async function listarUsuarios(filtros: FiltrosUsuarios) {
  // Solo mandamos los filtros que tienen valor.
  const params = {
    q: filtros.q || undefined,
    estado: filtros.estado || undefined,
    rol: filtros.rol || undefined,
    page: filtros.page,
    size: filtros.size,
  };
  const respuesta = await http.get<PaginaRespuesta<UsuarioResumen>>('/usuarios', { params });
  return respuesta.data;
}

export async function consultarUsuario(id: number) {
  const respuesta = await http.get<UsuarioDetalle>(`/usuarios/${id}`);
  return respuesta.data;
}

export async function registrarUsuario(datos: CrearUsuarioRequest) {
  const respuesta = await http.post<RespuestaRegistro>('/usuarios', datos);
  return respuesta.data;
}

export async function actualizarUsuario(id: number, datos: ActualizarUsuarioRequest) {
  const respuesta = await http.put<UsuarioDetalle>(`/usuarios/${id}`, datos);
  return respuesta.data;
}

/** Reenvía la invitación por correo (el enlace anterior deja de servir). */
export async function reenviarInvitacion(id: number) {
  const respuesta = await http.post<UsuarioDetalle>(`/usuarios/${id}/invitacion`);
  return respuesta.data;
}

export async function cambiarContrasena(id: number, contrasenaNueva: string) {
  await http.patch(`/usuarios/${id}/contrasena`, { contrasenaNueva });
}

export async function deshabilitarUsuario(id: number) {
  const respuesta = await http.patch<UsuarioDetalle>(`/usuarios/${id}/deshabilitar`);
  return respuesta.data;
}

export async function activarUsuario(id: number) {
  const respuesta = await http.patch<UsuarioDetalle>(`/usuarios/${id}/activar`);
  return respuesta.data;
}
