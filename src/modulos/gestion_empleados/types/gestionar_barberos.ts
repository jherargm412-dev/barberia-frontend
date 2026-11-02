// Tipos compartidos del módulo gestion_empleados.
// Fusiona CU17 Gestionar Barbero (dev-jherar) y CU16 Gestionar Barberos (bastian).

/* ============================================================
 * Tipos base
 * ============================================================ */

export type EstadoUsuario = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
export type EstadoBarbero = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
export type TipoContrato = 'COMISIONISTA' | 'ASALARIADO';

/* ============================================================
 * CU17 Gestionar Barbero (Empleado) — rama dev-jherar
 * ============================================================ */

export interface Turno {
  idTurno: number;
  nombre: string;
  horaEntrada: string; // "09:00:00"
  horaSalida: string;
}

export interface ServicioAsignado {
  idServicio: number;
  nombre: string;
  precio: number;
  /** false si el servicio se inhabilitó en el catálogo (CU08); la relación se conserva. */
  activoEnCatalogo: boolean;
}

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
  tipoContrato: TipoContrato;
  turnoId: number | null;
  /**
   * Especialidades = ids de los servicios que realiza (solo Barbero). Quedan habilitados para citas
   * y la especialidad que se muestra se arma con sus nombres. null = no cambiar.
   */
  servicios: number[] | null;
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
  fechaNacimiento: string | null; // "YYYY-MM-DD"
}

/* ============================================================
 * CU16 Gestionar Barberos — rama bastian
 * ============================================================ */

/** Turno para el selector del formulario (TurnoOpcion.java). */
export interface TurnoOpcion {
  idTurno: number;
  nombre: string;
  horaEntrada: string;
  horaSalida: string;
}

/** Servicio que se marca como especialidad técnica autorizada (ServicioOpcion.java). */
export interface ServicioOpcion {
  idServicio: number;
  nombre: string;
}

/** Barbero del listado y del formulario de modificar (BarberoResponse.java). */
export interface Barbero {
  idEmpleado: number;
  idUsuario: number;
  nombre: string;
  correo: string;
  telefono: string | null;
  fechaNacimiento: string | null;
  fechaCreacion: string;
  estado: EstadoBarbero;
  roles: string[];
  especialidad: string | null;
  tipoContrato: TipoContrato;
  turno: TurnoOpcion | null;
  serviciosAutorizados: ServicioOpcion[];
}

/** Paso 4: opciones para armar el formulario (OpcionesFormularioBarbero.java). */
export interface OpcionesFormularioBarbero {
  turnos: TurnoOpcion[];
  servicios: ServicioOpcion[];
  tiposContrato: TipoContrato[];
}

/**
 * Body de POST /barberos y PUT /barberos/{id} (BarberoRequest.java).
 * La contraseña solo se usa al registrar; al modificar el backend la ignora.
 */
export interface BarberoRequest {
  nombre: string;
  correo: string;
  contrasena?: string;
  telefono: string;
  fechaNacimiento: string | null;
  tipoContrato: TipoContrato;
  especialidad: string | null;
  turnoId: number;
  servicioIds: number[];
}

/** Respuesta de POST, PUT y PATCH: mensaje del CU + el barbero guardado (RespuestaBarbero.java). */
export interface RespuestaBarbero {
  mensaje: string;
  barbero: Barbero;
}

export interface FiltrosBarberos {
  q: string;
  estado: EstadoBarbero | '';
  page: number;
  size: number;
}
