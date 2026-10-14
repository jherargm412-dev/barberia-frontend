// Tipos de CU17 Gestionar Barbero (copiados de los DTOs del backend).

export type EstadoUsuario = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
export type TipoContrato = 'COMISIONISTA' | 'ASALARIADO';

/** Fila del listado (EmpleadoResumen.java). */
export interface EmpleadoResumen {
  idEmpleado: number;
  idUsuario: number;
  nombre: string;
  correo: string;
  telefono: string | null;
  roles: string[];
  especialidad: string | null;
  tipoContrato: TipoContrato;
  turno: string | null;
  estado: EstadoUsuario;
  cantidadServicios: number;
}

export interface Turno {
  idTurno: number;
  nombre: string;
  horaEntrada: string; // "09:00:00"
  horaSalida: string;
}

/** Servicio habilitado para el barbero (ServicioAsignado.java). */
export interface ServicioAsignado {
  idServicio: number;
  nombre: string;
  precio: number;
  /** false si el servicio se inhabilitó en el catálogo (CU08); la relación se conserva. */
  activoEnCatalogo: boolean;
}

/** Detalle (EmpleadoResponse.java). */
export interface Empleado {
  idEmpleado: number;
  idUsuario: number;
  nombre: string;
  correo: string;
  telefono: string | null;
  fechaNacimiento: string | null;
  fechaCreacion: string;
  estado: EstadoUsuario;
  roles: string[];
  especialidad: string | null;
  tipoContrato: TipoContrato;
  turno: Turno | null;
  servicios: ServicioAsignado[];
}

/** Body de PUT /empleados/{id}. */
export interface ActualizarEmpleadoRequest {
  nombre: string;
  correo: string;
  telefono: string | null;
  fechaNacimiento: string | null;
  especialidad: string | null;
  tipoContrato: TipoContrato;
  turnoId: number | null;
}

/** Body de POST /empleados: igual que actualizar, más contraseña y rol. */
export interface RegistrarEmpleadoRequest extends ActualizarEmpleadoRequest {
  /** Se omite cuando enviarInvitacion es true: el empleado la elige desde el correo. */
  contrasena: string | null;
  rol: string;
  enviarInvitacion: boolean;
}

export interface RespuestaEmpleado {
  mensaje: string;
  empleado: Empleado;
}

export interface FiltrosEmpleados {
  q: string;
  rol: string;
  estado: EstadoUsuario | '';
  tipoContrato: TipoContrato | '';
  page: number;
  size: number;
}
