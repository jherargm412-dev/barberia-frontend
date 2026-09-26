import { http } from '../../../../shared/api/httpClient';
import type { LoginRequest, LoginResponse, UsuarioSesion } from '../../types/iniciar_sesion';

// Endpoints de /api/v1/auth (AuthController.java).

export async function login(datos: LoginRequest): Promise<LoginResponse> {
  const respuesta = await http.post<LoginResponse>('/auth/login', datos);
  return respuesta.data;
}

export async function obtenerSesion(): Promise<UsuarioSesion> {
  const respuesta = await http.get<UsuarioSesion>('/auth/me');
  return respuesta.data;
}

export async function logout(): Promise<void> {
  await http.post('/auth/logout');
}
