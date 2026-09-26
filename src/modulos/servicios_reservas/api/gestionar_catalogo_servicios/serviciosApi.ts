import { http } from '../../../../shared/api/httpClient';
import type { PaginaRespuesta } from '../../../../shared/api/types';
import type {
  EstadoServicio,
  FiltrosServicios,
  RespuestaServicio,
  Servicio,
  ServicioRequest,
  ServicioResumen,
} from '../../types/gestionar_catalogo_servicios';

// Endpoints de /api/v1/servicios (ServicioController.java).

/** Paso 3: listado (incluye inhabilitados para poder rehabilitarlos). */
export async function listarServicios(filtros: FiltrosServicios) {
  // Solo mandamos los filtros que tienen valor.
  const params = {
    q: filtros.q || undefined,
    estado: filtros.estado || undefined,
    page: filtros.page,
    size: filtros.size,
  };
  const respuesta = await http.get<PaginaRespuesta<Servicio>>('/servicios', { params });
  return respuesta.data;
}

/** Paso 5: datos actuales para precargar el formulario de modificar. */
export async function consultarServicio(id: number) {
  const respuesta = await http.get<Servicio>(`/servicios/${id}`);
  return respuesta.data;
}

export async function registrarServicio(datos: ServicioRequest) {
  const respuesta = await http.post<RespuestaServicio>('/servicios', datos);
  return respuesta.data;
}

export async function modificarServicio(id: number, datos: ServicioRequest) {
  const respuesta = await http.put<RespuestaServicio>(`/servicios/${id}`, datos);
  return respuesta.data;
}

/** 4a: se envía el estado destino (no un "alternar"), así un doble clic no lo revierte. */
export async function cambiarEstadoServicio(id: number, estado: EstadoServicio) {
  const respuesta = await http.patch<RespuestaServicio>(`/servicios/${id}/estado`, { estado });
  return respuesta.data;
}

/** Para otros módulos (reservas, ventas): solo habilitados y sin porcentaje de comisión. */
export async function listarServiciosHabilitados() {
  const respuesta = await http.get<ServicioResumen[]>('/servicios/habilitados');
  return respuesta.data;
}
