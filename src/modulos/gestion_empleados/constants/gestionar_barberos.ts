import type { EstadoUsuario, EstadoBarbero, TipoContrato } from '../types/gestionar_barberos';

/* ============================================================
 * CU17 Gestionar Barberos (rama dev-jherar)
 * ============================================================ */

/** Permisos del backend que usa CU17 (no hay uno propio en el catálogo: se usan los de cuentas). */
export const PERMISOS_EMPLEADOS = {
  GESTIONAR: 'USUARIO_GESTIONAR',
  /** Registrar asigna un rol, por eso además exige ROL_ASIGNAR (igual que CU01). */
  REGISTRAR: 'ROL_ASIGNAR',
};

/** Roles que se pueden dar de alta desde CU17. El Administrador se crea en CU01. */
export const ROLES_ALTA = ['Barbero', 'Recepcionista'];

export const ROL_BARBERO = 'Barbero';

/** Array de opciones para selects de MUI. */
export const TIPOS_CONTRATO: { valor: TipoContrato; etiqueta: string }[] = [
  { valor: 'COMISIONISTA', etiqueta: 'Comisionista' },
  { valor: 'ASALARIADO', etiqueta: 'Asalariado' },
];

export const ESTADOS_EMPLEADO: { valor: EstadoUsuario; etiqueta: string }[] = [
  { valor: 'ACTIVO', etiqueta: 'Activo' },
  { valor: 'INACTIVO', etiqueta: 'Desvinculado' },
  { valor: 'SUSPENDIDO', etiqueta: 'Suspendido' },
];

/* ============================================================
 * CU16 Gestionar Barberos alternativo (rama bastian)
 * ============================================================ */

export const ESTADOS_BARBERO: { valor: EstadoBarbero; etiqueta: string }[] = [
  { valor: 'ACTIVO', etiqueta: 'Activo' },
  { valor: 'SUSPENDIDO', etiqueta: 'Suspendido' },
  { valor: 'INACTIVO', etiqueta: 'Inactivo' },
];

/** Mapa tipo→etiqueta (antes se llamaba TIPOS_CONTRATO en bastian). */
export const TIPOS_CONTRATO_LABEL: Record<TipoContrato, string> = {
  COMISIONISTA: 'Comisionista',
  ASALARIADO: 'Asalariado',
};

/** Permisos del backend que usa este caso de uso (igual que CU01). */
export const PERMISOS = {
  GESTIONAR: 'USUARIO_GESTIONAR',
  /** Registrar asigna el rol Barbero (paso 6). */
  ASIGNAR_ROL: 'ROL_ASIGNAR',
};

/** Mensajes exactos del CU16, los mismos que devuelve el backend. */
export const MENSAJES = {
  /** Flujo 6a. */
  ERROR_VALIDACION: 'Error de validación: Datos incorrectos o duplicados',
};
