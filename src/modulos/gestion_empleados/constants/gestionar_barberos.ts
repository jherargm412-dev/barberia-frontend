import type { EstadoBarbero, TipoContrato } from '../types/gestionar_barberos';

export const ESTADOS_BARBERO: { valor: EstadoBarbero; etiqueta: string }[] = [
  { valor: 'ACTIVO', etiqueta: 'Activo' },
  { valor: 'SUSPENDIDO', etiqueta: 'Suspendido' },
  { valor: 'INACTIVO', etiqueta: 'Inactivo' },
];

export const TIPOS_CONTRATO: Record<TipoContrato, string> = {
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
