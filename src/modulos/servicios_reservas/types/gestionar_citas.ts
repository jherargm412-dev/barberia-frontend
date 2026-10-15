// Tipos de CU11 Gestionar Cita (copiados de los DTOs del backend).

export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'ATENDIDA' | 'CANCELADA' | 'NO_ASISTIO';

/** WEB es exclusivo de CU12 (solicitud en línea); la recepción usa los otros tres. */
export type CanalCita = 'PRESENCIAL' | 'TELEFONO' | 'WHATSAPP' | 'WEB';

/** Una cita (ReservaResponse.java). Fechas "AAAA-MM-DD" y horas "HH:mm". */
export interface Cita {
  idReserva: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  canal: CanalCita;
  estado: EstadoCita;
  montoAnticipo: number;
  /** Si ya se cobró el anticipo (CU14). Solo así la cita queda Confirmada. */
  anticipoPagado: boolean;
  cliente: { idCliente: number; nombre: string; telefono: string | null };
  servicio: { idServicio: number; nombre: string; precio: number };
  /** Null si la cita no tiene barbero (posible en CU12). */
  barbero: { idEmpleado: number; nombre: string } | null;
}

/** Barbero activo con su turno (BarberoDisponible.java). El turno es null si no tiene. */
export interface BarberoDisponible {
  idEmpleado: number;
  nombre: string;
  turno: string | null;
  horaEntrada: string | null;
  horaSalida: string | null;
}

/** Body de POST /reservas (ReservaRequest.java). El anticipo lo calcula el backend; la cita nace Pendiente. */
export interface CitaRequest {
  clienteId: number;
  servicioId: number;
  empleadoId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  canal: CanalCita;
}

/** Datos con los que CU10 abre "Nueva cita" al elegir una hora libre (se pasan en el state de la ruta). */
export interface PrellenadoCita {
  servicioId: number;
  empleadoId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

/** Body de PUT /reservas/{id}/reprogramar (ReprogramarReservaRequest.java). */
export interface ReprogramarRequest {
  empleadoId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

/** Respuesta de toda escritura: mensaje + la cita como quedó. */
export interface RespuestaCita {
  mensaje: string;
  reserva: Cita;
}

/** Cambios de estado del paso 3; cada uno es su propio endpoint PATCH. */
export type AccionEstado = 'confirmar' | 'atender' | 'no-asistio' | 'cancelar';

export interface FiltrosCitas {
  fecha: string;
  empleadoId: number | '';
  estado: EstadoCita | '';
  q: string;
  page: number;
  size: number;
}
