import type { EstadoUsuario, TipoContrato } from '../types/gestionar_usuarios';

/**
 * Turnos fijos. Deben coincidir con los ids que inserta la migración
 * V2__catalogo_roles_permisos_turnos.sql del backend.
 */
export const TURNOS = [
  { id: 1, nombre: 'Mañana (09:00 - 15:00)' },
  { id: 2, nombre: 'Tarde (15:00 - 21:00)' },
  { id: 3, nombre: 'Completo (09:00 - 21:00)' },
];

export const TIPOS_CONTRATO: { valor: TipoContrato; etiqueta: string }[] = [
  { valor: 'COMISIONISTA', etiqueta: 'Comisionista' },
  { valor: 'ASALARIADO', etiqueta: 'Asalariado' },
];

export const ESTADOS: { valor: EstadoUsuario; etiqueta: string }[] = [
  { valor: 'ACTIVO', etiqueta: 'Activo' },
  { valor: 'INACTIVO', etiqueta: 'Inactivo' },
  { valor: 'SUSPENDIDO', etiqueta: 'Suspendido' },
];

/** Roles que exigen datos de empleado (tipo de contrato obligatorio). */
export const ROLES_EMPLEADO = ['Administrador', 'Recepcionista', 'Barbero'];

/** Permisos del backend que usa esta feature. */
export const PERMISOS = {
  GESTIONAR: 'USUARIO_GESTIONAR',
  ASIGNAR_ROL: 'ROL_ASIGNAR',
};
