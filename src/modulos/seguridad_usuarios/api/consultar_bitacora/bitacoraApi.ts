import { http } from '../../../../shared/api/httpClient';
import type {
  BitacoraDetalle,
  FiltrosBitacora,
  OpcionesFiltroBitacora,
  PaginaBitacora,
} from '../../types/consultar_bitacora';

// Endpoints de /api/v1/bitacora (BitacoraController.java). Solo lectura: no hay POST/PUT/DELETE.

/** Pasos 3–8: listado del más reciente al más antiguo. */
export async function listarBitacora(filtros: FiltrosBitacora, page: number, size: number) {
  // Solo mandamos los filtros que tienen valor.
  const params = {
    fechaDesde: filtros.fechaDesde || undefined,
    fechaHasta: filtros.fechaHasta || undefined,
    usuarioId: filtros.usuarioId || undefined,
    accion: filtros.accion || undefined,
    tablaAfectada: filtros.tablaAfectada || undefined,
    page,
    size,
  };
  const respuesta = await http.get<PaginaBitacora>('/bitacora', { params });
  return respuesta.data;
}

/** Pasos 9–10: información completa de un registro. */
export async function consultarRegistroBitacora(id: number) {
  const respuesta = await http.get<BitacoraDetalle>(`/bitacora/${id}`);
  return respuesta.data;
}

/** Apoyo al paso 4: acciones y tablas que existen en la bitácora. */
export async function obtenerOpcionesFiltro() {
  const respuesta = await http.get<OpcionesFiltroBitacora>('/bitacora/filtros');
  return respuesta.data;
}
