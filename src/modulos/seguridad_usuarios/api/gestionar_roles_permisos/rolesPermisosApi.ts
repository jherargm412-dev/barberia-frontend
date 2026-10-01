import { http } from '../../../../shared/api/httpClient';
import type { Permiso, RespuestaRol, Rol, RolRequest } from '../../types/gestionar_roles_permisos';

// Endpoints de /api/v1/roles (RolController.java) y /api/v1/permisos (PermisoController.java).

/** Paso 1: todos los roles, activos e inactivos. */
export async function listarRolesGestion() {
  const respuesta = await http.get<Rol[]>('/roles');
  return respuesta.data;
}

/** Datos actuales para precargar el formulario de editar (o de clonar). */
export async function consultarRol(id: number) {
  const respuesta = await http.get<Rol>(`/roles/${id}`);
  return respuesta.data;
}

/** Paso 3: catálogo completo de permisos. */
export async function listarPermisos() {
  const respuesta = await http.get<Permiso[]>('/permisos');
  return respuesta.data;
}

export async function registrarRol(datos: RolRequest) {
  const respuesta = await http.post<RespuestaRol>('/roles', datos);
  return respuesta.data;
}

export async function modificarRol(id: number, datos: RolRequest) {
  const respuesta = await http.put<RespuestaRol>(`/roles/${id}`, datos);
  return respuesta.data;
}

/** Paso 4: se envía el estado destino (no un "alternar"), así un doble clic no lo revierte. */
export async function cambiarEstadoRol(id: number, activo: boolean) {
  const respuesta = await http.patch<RespuestaRol>(`/roles/${id}/estado`, { activo });
  return respuesta.data;
}
