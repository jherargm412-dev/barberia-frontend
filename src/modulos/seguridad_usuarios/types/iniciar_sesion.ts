// Tipos de CU02 Iniciar Sesión (copiados de los DTOs LoginRequest, LoginResponse y UsuarioSesion).

export interface LoginRequest {
  correo: string;
  contrasena: string;
}

/** Usuario logueado, con sus roles y permisos efectivos. */
export interface UsuarioSesion {
  idUsuario: number;
  nombre: string;
  correo: string;
  roles: string[];
  permisos: string[];
}

export interface LoginResponse {
  token: string;
  tipo: string;
  expiraEn: number;
  usuario: UsuarioSesion;
}

