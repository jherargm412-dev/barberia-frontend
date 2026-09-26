// Tipos de CU01 Gestionar Usuarios (copiados de los DTOs del backend).

export type EstadoUsuario = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
export type TipoContrato = 'COMISIONISTA' | 'ASALARIADO';

export interface RolResumen {
  idRol: number;
  nombre: string;
  descripcion: string;
}

/** Fila de la tabla (GET /usuarios). */
export interface UsuarioResumen {
  idUsuario: number;
  nombre: string;
  correo: string;
  estado: EstadoUsuario;
  roles: string[];
}

export interface EmpleadoDetalle {
  idEmpleado: number;
  tipoContrato: TipoContrato;
  especialidad: string | null;
  turno: { idTurno: number; nombre: string } | null;
}

export interface ClienteDetalle {
  idCliente: number;
  nombre: string;
  telefono: string | null;
  fechaRegistro: string;
}

/** Detalle completo (GET /usuarios/{id}). */
export interface UsuarioDetalle {
  idUsuario: number;
  nombre: string;
  correo: string;
  telefono: string | null;
  fechaNacimiento: string | null; // "YYYY-MM-DD"
  estado: EstadoUsuario;
  fechaCreacion: string;
  roles: RolResumen[];
  empleado: EmpleadoDetalle | null;
  cliente: ClienteDetalle | null;
}

export interface EmpleadoRequest {
  tipoContrato: TipoContrato;
  especialidad: string | null;
  turnoId: number | null;
}

/** Body de PUT /usuarios/{id}. */
export interface ActualizarUsuarioRequest {
  nombre: string;
  correo: string;
  telefono: string | null;
  fechaNacimiento: string | null;
  roles: string[];
  empleado: EmpleadoRequest | null;
}

/** Body de POST /usuarios: igual que actualizar, más la contraseña. */
export interface CrearUsuarioRequest extends ActualizarUsuarioRequest {
  contrasena: string;
}

export interface RespuestaRegistro {
  mensaje: string;
  usuario: UsuarioDetalle;
}

export interface FiltrosUsuarios {
  q: string;
  estado: EstadoUsuario | '';
  rol: string;
  page: number;
  size: number;
}
