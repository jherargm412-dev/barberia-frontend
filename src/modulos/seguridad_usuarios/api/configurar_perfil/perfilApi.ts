import { http } from '../../../../shared/api/httpClient';
import type {
  ActualizarPerfilRequest,
  CambiarContrasenaRequest,
  InicioSesionReciente,
  Perfil,
  RespuestaPerfil,
} from '../../types/configurar_perfil';

// Endpoints de /api/v1/perfil (PerfilController.java). Sin id: siempre el usuario del token.

/** Paso 1: consultar perfil. */
export async function consultarPerfil() {
  const respuesta = await http.get<Perfil>('/perfil');
  return respuesta.data;
}

/** Paso 2: editar nombre, teléfono y fecha de nacimiento. */
export async function actualizarPerfil(datos: ActualizarPerfilRequest) {
  const respuesta = await http.put<RespuestaPerfil>('/perfil', datos);
  return respuesta.data;
}

/** Paso 3: cambiar contraseña. */
export async function cambiarContrasena(datos: CambiarContrasenaRequest) {
  const respuesta = await http.patch<RespuestaPerfil>('/perfil/contrasena', datos);
  return respuesta.data;
}

/** Extra: últimos inicios de sesión. */
export async function listarSesionesRecientes() {
  const respuesta = await http.get<InicioSesionReciente[]>('/perfil/sesiones');
  return respuesta.data;
}
