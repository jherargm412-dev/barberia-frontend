// Tipos de CU10 Consultar Disponibilidad (copiados de los DTOs del backend). Horas "HH:mm".

/** Hueco libre de la duración pedida (HoraLibre.java). */
export interface HoraLibre {
  horaInicio: string;
  horaFin: string;
}

/** Hora libre con los barberos que pueden atenderla (HorarioDisponible.java). */
export interface HorarioDisponible extends HoraLibre {
  barberos: { idEmpleado: number; nombre: string }[];
}

/** Agenda libre de un barbero ese día; motivo = por qué no atiende (DisponibilidadBarbero.java). */
export interface DisponibilidadBarbero {
  idEmpleado: number;
  nombre: string;
  jornadaInicio: string | null;
  jornadaFin: string | null;
  motivo: string | null;
  horasLibres: HoraLibre[];
}

/** Respuesta de GET /disponibilidad (DisponibilidadResponse.java). */
export interface Disponibilidad {
  servicioId: number;
  servicio: string;
  precio: number;
  fecha: string;
  dia: string;
  duracionMinutos: number;
  /** false si la barbería no abre ese día. */
  atiende: boolean;
  horaApertura: string | null;
  horaCierre: string | null;
  horarios: HorarioDisponible[];
  barberos: DisponibilidadBarbero[];
  /** Si no hay horas libres: siguiente día con al menos una (hasta 30 días). */
  proximaFechaDisponible: string | null;
}

export interface ConsultaDisponibilidad {
  servicioId: number;
  fecha: string;
  /** Sin barbero = cualquiera que preste el servicio. */
  empleadoId?: number;
  duracion?: number;
  /** Al reprogramar: la propia cita no ocupa su horario. */
  excluirReserva?: number;
}
