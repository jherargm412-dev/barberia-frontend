import type { EstadoUsuario, TipoContrato } from '../types/gestionar_barberos';

/** Permisos del backend que usa CU17 (no hay uno propio en el catálogo: se usan los de cuentas). */
export const PERMISOS_EMPLEADOS = {
  GESTIONAR: 'USUARIO_GESTIONAR',
  /** Registrar asigna un rol, por eso además exige ROL_ASIGNAR (igual que CU01). */
  REGISTRAR: 'ROL_ASIGNAR',
};

/** Roles que se pueden dar de alta desde CU17. El Administrador se crea en CU01. */
export const ROLES_ALTA = ['Barbero', 'Recepcionista'];

export const ROL_BARBERO = 'Barbero';

export const TIPOS_CONTRATO: { valor: TipoContrato; etiqueta: string }[] = [
  { valor: 'COMISIONISTA', etiqueta: 'Comisionista' },
  { valor: 'ASALARIADO', etiqueta: 'Asalariado' },
];

export const ESTADOS_EMPLEADO: { valor: EstadoUsuario; etiqueta: string }[] = [
  { valor: 'ACTIVO', etiqueta: 'Activo' },
  { valor: 'INACTIVO', etiqueta: 'Desvinculado' },
  { valor: 'SUSPENDIDO', etiqueta: 'Suspendido' },
];
