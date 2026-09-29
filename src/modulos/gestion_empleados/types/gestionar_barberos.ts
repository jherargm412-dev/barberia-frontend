// Tipos de CU16 Gestionar Barberos (copiados de los DTOs del backend: dto/gestionar_barberos).

export type EstadoBarbero = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
export type TipoContrato = 'COMISIONISTA' | 'ASALARIADO';

/** Turno de trabajo (TurnoOpcion.java). Las horas llegan como "09:00:00". */
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
  fechaNacimiento: string | null; // "YYYY-MM-DD"
  estado: EstadoBarbero;
  tipoContrato: TipoContrato;
  especialidad: string | null;
  turno: TurnoOpcion | null;
  serviciosAutorizados: ServicioOpcion[];
  fechaCreacion: string;
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
