import type { FiltrosBitacora } from '../types/consultar_bitacora';

/** Permiso del backend que usa CU05 (solo lo tiene el Administrador). */
export const PERMISOS_BITACORA = {
  CONSULTAR: 'BITACORA_CONSULTAR',
};

/** Mensajes exactos del CU05 que muestra el frontend. */
export const MENSAJES_BITACORA = {
  SIN_PERMISO: 'No tiene permiso para consultar la bitácora', // 2a
  RANGO_INVALIDO: 'La fecha inicial no puede ser posterior a la fecha final', // 6a
  SIN_DATOS: 'Sin datos', // 10a
};

/** Paso 4a: sin filtros se muestran todos los registros. */
export const FILTROS_VACIOS: FiltrosBitacora = {
  fechaDesde: '',
  fechaHasta: '',
  usuarioId: '',
  accion: '',
  tablaAfectada: '',
};
