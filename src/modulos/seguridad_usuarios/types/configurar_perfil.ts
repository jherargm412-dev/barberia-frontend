// Tipos de CU04 Configurar Perfil Personal (copiados de los DTOs del backend).
import type { TipoContrato } from './gestionar_usuarios';

/** Datos laborales, solo lectura (PerfilEmpleado.java). */
export interface PerfilEmpleado {
  especialidad: string | null;
  tipoContrato: TipoContrato;
  turno: string | null;
  horaEntrada: string | null; // "09:00:00"
  horaSalida: string | null;
}

/** GET /perfil (PerfilResponse.java). */
export interface Perfil {
  idUsuario: number;
  nombre: string;
  correo: string;
  telefono: string | null;
  fechaNacimiento: string | null; // "YYYY-MM-DD"
  fechaCreacion: string;
  roles: string[];
  empleado: PerfilEmpleado | null;
}

/** Body de PUT /perfil. El correo no se edita desde aquí. */
export interface ActualizarPerfilRequest {
  nombre: string;
  telefono: string | null;
  fechaNacimiento: string | null;
}

/** Body de PATCH /perfil/contrasena. */
export interface CambiarContrasenaRequest {
  contrasenaActual: string;
  contrasenaNueva: string;
  confirmacion: string;
}

/** Respuesta de PUT y PATCH. En el cambio de contraseña `perfil` viene en null. */
export interface RespuestaPerfil {
  mensaje: string;
  perfil: Perfil | null;
}

/** GET /perfil/sesiones (InicioSesionReciente.java). */
export interface InicioSesionReciente {
  fechaHora: string;
  ipOrigen: string | null;
}
