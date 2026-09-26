import type { EstadoServicio } from '../types/gestionar_catalogo_servicios';

export const ESTADOS_SERVICIO: { valor: EstadoServicio; etiqueta: string }[] = [
  { valor: 'HABILITADO', etiqueta: 'Habilitado' },
  { valor: 'INHABILITADO', etiqueta: 'Inhabilitado' },
];

/** Permisos del backend que usa este caso de uso. */
export const PERMISOS = {
  GESTIONAR: 'SERVICIO_GESTIONAR',
  CONSULTAR: 'SERVICIO_CONSULTAR',
};

/** Mensajes exactos del CU08 (flujos 8b y 8c), los mismos que devuelve el backend. */
export const MENSAJES = {
  CAMPOS_VACIOS: 'Debe completar todos los campos obligatorios',
  VALOR_INVALIDO: 'El valor ingresado no es válido',
};
