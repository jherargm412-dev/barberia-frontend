import type { DiaSemana, EstadoHorario, TipoExcepcion } from '../types/gestionar_horarios';

/** Permiso del backend: el CU09 usa el mismo que CU17 (no hay uno propio de horarios). */
export const PERMISOS = {
  GESTIONAR: 'USUARIO_GESTIONAR',
};

/** Mensajes exactos del CU09 que el frontend muestra por su cuenta. */
export const MENSAJES = {
  SIN_PERMISO: 'No tiene permiso para gestionar horarios', // 2a
};

/** Los 7 días en orden, con el nombre para mostrar. */
export const DIAS: { valor: DiaSemana; etiqueta: string }[] = [
  { valor: 'LUNES', etiqueta: 'Lunes' },
  { valor: 'MARTES', etiqueta: 'Martes' },
  { valor: 'MIERCOLES', etiqueta: 'Miércoles' },
  { valor: 'JUEVES', etiqueta: 'Jueves' },
  { valor: 'VIERNES', etiqueta: 'Viernes' },
  { valor: 'SABADO', etiqueta: 'Sábado' },
  { valor: 'DOMINGO', etiqueta: 'Domingo' },
];

export const ESTADOS_HORARIO: { valor: EstadoHorario; etiqueta: string }[] = [
  { valor: 'ASIGNADO', etiqueta: 'Asignado' },
  { valor: 'SIN_ASIGNAR', etiqueta: 'Sin asignar' },
];

export const TIPOS_EXCEPCION: { valor: TipoExcepcion; etiqueta: string }[] = [
  { valor: 'VACACIONES', etiqueta: 'Vacaciones' },
  { valor: 'PERMISO', etiqueta: 'Permiso' },
  { valor: 'DIA_LIBRE', etiqueta: 'Día libre' },
  { valor: 'HORARIO_ESPECIAL', etiqueta: 'Horario especial' },
];
