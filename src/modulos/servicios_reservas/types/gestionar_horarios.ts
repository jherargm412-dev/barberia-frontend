// Tipos de CU09 Gestionar Horarios de Disponibilidad (copiados de los DTOs del backend).
// Las horas llegan como "09:00:00" y se pueden enviar como "09:00".

/** Mismos valores que la tabla horario (sin tildes). */
export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';

export type EstadoHorario = 'ASIGNADO' | 'SIN_ASIGNAR';

export type TipoExcepcion = 'VACACIONES' | 'PERMISO' | 'DIA_LIBRE' | 'HORARIO_ESPECIAL';

/** Turno asignado en CU17; aquí solo sirve para precargar el formulario (TurnoBase.java). */
export interface TurnoBase {
  idTurno: number;
  nombre: string;
  horaEntrada: string;
  horaSalida: string;
}

/** Fila del listado (BarberoHorarioResumen.java). */
export interface BarberoHorarioResumen {
  idEmpleado: number;
  nombre: string;
  turnoBase: TurnoBase | null;
  estadoHorario: EstadoHorario;
}

/** Un día del horario semanal (DiaHorario.java). Se usa al leer y al guardar. */
export interface DiaHorario {
  diaSemana: DiaSemana;
  trabaja: boolean;
  horaEntrada: string | null;
  horaSalida: string | null;
}

export interface Excepcion {
  idExcepcion: number;
  fechaInicio: string; // "2026-10-20"
  fechaFin: string;
  tipo: TipoExcepcion;
  motivo: string | null;
  horaEntrada: string | null;
  horaSalida: string | null;
}

/** GET /horarios/barberos/{id} (HorarioBarberoDetalle.java). */
export interface HorarioBarberoDetalle {
  idEmpleado: number;
  nombre: string;
  estadoHorario: EstadoHorario;
  turnoBase: TurnoBase | null;
  /** true = los días vienen precargados desde el turno base y todavía no están guardados. */
  sugerido: boolean;
  dias: DiaHorario[];
  excepciones: Excepcion[];
}

/** Horario de atención de la barbería para un día (VentanaAtencionResponse.java). */
export interface VentanaAtencion {
  diaSemana: DiaSemana;
  abierto: boolean;
  horaApertura: string | null;
  horaCierre: string | null;
}

/** Cita que impide guardar (flujos 7c y 4f). Viene dentro del error 409. */
export interface CitaAfectada {
  idReserva: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  cliente: string;
  servicio: string;
  estado: string;
}

/** Body de PUT /horarios/barberos/{id}: siempre los 7 días. */
export interface GuardarHorarioRequest {
  dias: DiaHorario[];
}

/** Body de POST /horarios/barberos/{id}/excepciones. */
export interface RegistrarExcepcionRequest {
  fechaInicio: string | null;
  fechaFin: string | null;
  tipo: TipoExcepcion | null;
  motivo: string | null;
  horaEntrada: string | null;
  horaSalida: string | null;
}

export interface RespuestaHorario {
  mensaje: string;
  horario: HorarioBarberoDetalle;
}

export interface RespuestaExcepcion {
  mensaje: string;
  excepcion: Excepcion;
}

export interface FiltrosHorarios {
  q: string;
  estadoHorario: EstadoHorario | '';
}
