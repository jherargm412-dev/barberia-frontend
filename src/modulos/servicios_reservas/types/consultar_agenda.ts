// Tipos de CU16 Consultar Agenda de Citas (copiados de los DTOs del backend: CitaAgendaResponse,
// CitaAgendaDetalle, CitaHistorial y BarberoAgenda).

export type EstadoAgenda = 'PENDIENTE' | 'CONFIRMADA' | 'ATENDIDA' | 'CANCELADA' | 'NO_ASISTIO';

export type CanalAgenda = 'PRESENCIAL' | 'TELEFONO' | 'WHATSAPP' | 'WEB';

/** Una cita de la agenda. Fechas "AAAA-MM-DD" y horas "HH:mm". */
export interface CitaAgenda {
  idReserva: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: EstadoAgenda;
  canal: CanalAgenda;
  montoAnticipo: number;
  cliente: { idCliente: number; nombre: string; telefono: string | null };
  servicio: { idServicio: number; nombre: string; precio: number };
  /** Null si la cita no tiene barbero asignado. */
  barbero: { idEmpleado: number; nombre: string } | null;
}

/** Otra cita del mismo cliente que el usuario puede ver (historial rápido del detalle). */
export interface CitaHistorial {
  idReserva: number;
  fecha: string;
  horaInicio: string;
  servicio: string;
  estado: EstadoAgenda;
}

export interface CitaAgendaDetalle {
  cita: CitaAgenda;
  historial: CitaHistorial[];
}

/** Barbero activo para el filtro de la agenda. */
export interface BarberoAgenda {
  idEmpleado: number;
  nombre: string;
}

/** Filtros aplicados. Vacío = sin filtro (barberoId solo lo usa Recepcionista y Administrador). */
export interface FiltrosAgenda {
  fecha: string;
  estado: EstadoAgenda | '';
  barberoId: number | '';
}
