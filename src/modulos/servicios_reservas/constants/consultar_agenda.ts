import type { CanalAgenda, EstadoAgenda } from '../types/consultar_agenda';

/** Permisos del backend que usa CU16 (semilla V2). */
export const PERMISOS_AGENDA = {
  /** Recepcionista y Administrador: todas las citas y filtro por barbero. */
  TODAS: 'AGENDA_CONSULTAR',
  /** Barbero: solo sus citas. */
  PROPIA: 'AGENDA_CONSULTAR_PROPIA',
  /** Recepcionista y Administrador: pueden pasar de la agenda a la gestión de la cita (CU11). */
  CREAR_CITA: 'RESERVA_CREAR',
};

/**
 * Colores de estado: los mismos que CU11 (gestionar_citas/constants). Si CU11 cambia un color, cambiarlo también aquí.
 */
export const ESTADOS_AGENDA: {
  valor: EstadoAgenda;
  etiqueta: string;
  color: 'warning' | 'success' | 'info' | 'error' | 'default';
}[] = [
  { valor: 'PENDIENTE', etiqueta: 'Pendiente', color: 'warning' },
  { valor: 'CONFIRMADA', etiqueta: 'Confirmada', color: 'success' },
  { valor: 'ATENDIDA', etiqueta: 'Atendida', color: 'info' },
  { valor: 'CANCELADA', etiqueta: 'Cancelada', color: 'error' },
  { valor: 'NO_ASISTIO', etiqueta: 'No asistió', color: 'default' },
];

export const ETIQUETAS_CANAL: Record<CanalAgenda, string> = {
  PRESENCIAL: 'Presencial',
  TELEFONO: 'Teléfono',
  WHATSAPP: 'WhatsApp',
  WEB: 'Web',
};

/** Textos fijos del flujo de CU16 (flujos 2a, 3a y 5a). */
export const MENSAJES_AGENDA = {
  SIN_PERMISO: 'No tiene permisos para acceder a la agenda',
  SIN_CITAS: 'No hay citas programadas para esta fecha',
  FECHA_INVALIDA: 'La fecha ingresada no es válida',
};
