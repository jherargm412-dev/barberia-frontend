import type { AccionEstado, CanalCita, EstadoCita } from '../types/gestionar_citas';

/** Permisos del backend que usa CU11 (semilla V2: Administrador y Recepcionista los tienen todos). */
export const PERMISOS = {
  AGENDA: 'AGENDA_CONSULTAR',
  CREAR: 'RESERVA_CREAR',
  EDITAR: 'RESERVA_EDITAR',
  ATENDER: 'RESERVA_ATENDER',
  CANCELAR: 'RESERVA_CANCELAR',
  CLIENTE_CREAR: 'CLIENTE_CREAR',
  VENTA_REGISTRAR: 'VENTA_REGISTRAR',
};

/** Colores de CU16: Pendiente amarillo, Confirmada verde, Atendida azul, Cancelada/No asistió rojo/gris. */
export const ESTADOS_CITA: { valor: EstadoCita; etiqueta: string; color: 'warning' | 'success' | 'info' | 'error' | 'default' }[] = [
  { valor: 'PENDIENTE', etiqueta: 'Pendiente', color: 'warning' },
  { valor: 'CONFIRMADA', etiqueta: 'Confirmada', color: 'success' },
  { valor: 'ATENDIDA', etiqueta: 'Atendida', color: 'info' },
  { valor: 'CANCELADA', etiqueta: 'Cancelada', color: 'error' },
  { valor: 'NO_ASISTIO', etiqueta: 'No asistió', color: 'default' },
];

/** Canales que puede elegir la recepción (WEB no: es de CU12). */
export const CANALES_RECEPCION: { valor: CanalCita; etiqueta: string }[] = [
  { valor: 'PRESENCIAL', etiqueta: 'Presencial' },
  { valor: 'TELEFONO', etiqueta: 'Teléfono' },
  { valor: 'WHATSAPP', etiqueta: 'WhatsApp' },
];

export const ETIQUETAS_CANAL: Record<CanalCita, string> = {
  PRESENCIAL: 'Presencial',
  TELEFONO: 'Teléfono',
  WHATSAPP: 'WhatsApp',
  WEB: 'Web',
};

/** Estados finales: la cita ya no se reprograma ni cambia de estado. */
export const ESTADOS_FINALES: EstadoCita[] = ['ATENDIDA', 'CANCELADA', 'NO_ASISTIO'];

/** Minutos de espera antes de poder marcar "No asistió" (igual que el backend). */
export const TOLERANCIA_MINUTOS = 15;

/** Duración sugerida al elegir la hora de inicio (el servicio no guarda duración). */
export const DURACION_SUGERIDA_MINUTOS = 30;

/** Textos del diálogo de confirmación de cada cambio de estado. */
export const ACCIONES_ESTADO: Record<AccionEstado, { titulo: string; boton: string; permiso: string; mensaje: string }> = {
  confirmar: {
    titulo: 'Confirmar cita',
    boton: 'Confirmar',
    permiso: PERMISOS.EDITAR,
    mensaje: 'La cita pasará a Confirmada al cobrar su anticipo.',
  },
  atender: {
    titulo: 'Marcar como atendida',
    boton: 'Marcar atendida',
    permiso: PERMISOS.ATENDER,
    mensaje: 'La atención terminó: la cita pasará a Atendida y quedará lista para el cobro final en caja. Ya no se podrá modificar.',
  },
  'no-asistio': {
    titulo: 'Marcar No asistió',
    boton: 'Marcar No asistió',
    permiso: PERMISOS.ATENDER,
    mensaje: `El cliente no llegó pasados los ${TOLERANCIA_MINUTOS} minutos de tolerancia. La cita ya no se podrá modificar.`,
  },
  cancelar: {
    titulo: 'Cancelar cita',
    boton: 'Cancelar cita',
    permiso: PERMISOS.CANCELAR,
    mensaje: 'La cita pasará a Cancelada y el horario del barbero quedará libre. Si ya pagó el anticipo, no se devuelve. Ya no se podrá modificar.',
  },
};

export const MENSAJES = {
  CAMPOS_VACIOS: 'Debe completar todos los campos obligatorios',
  HORAS: 'La hora de fin debe ser posterior a la hora de inicio',
  PASADO: 'La fecha y hora de la cita no pueden estar en el pasado',
};
