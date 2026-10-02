import { http } from '../../../../shared/api/httpClient';
import type { PaginaRespuesta } from '../../../../shared/api/types';
import type { Cliente, ClienteRequest, FiltrosClientes, RespuestaCliente } from '../../types/gestionar_clientes';

/** Envía al backend solo los filtros elegidos por la Recepcionista. */
export async function listarClientes(filtros: FiltrosClientes) {
  const { q, activo, page, size } = filtros;
  const respuesta = await http.get<PaginaRespuesta<Cliente>>('/clientes', {
    params: { q: q || undefined, activo: activo === '' ? undefined : activo, page, size },
  });
  return respuesta.data;
}
/** Recupera un cliente para mostrar su detalle o precargar la edición. */
export async function consultarCliente(id: number) {
  const respuesta = await http.get<Cliente>(`/clientes/${id}`);
  return respuesta.data;
}
/** Registra un nuevo cliente. */
export async function registrarCliente(datos: ClienteRequest) {
  const respuesta = await http.post<RespuestaCliente>('/clientes', datos);
  return respuesta.data;
}
/** Actualiza nombre y teléfono del cliente indicado. */
export async function modificarCliente(id: number, datos: ClienteRequest) {
  const respuesta = await http.put<RespuestaCliente>(`/clientes/${id}`, datos);
  return respuesta.data;
}
/** Desactiva el registro sin eliminar su historial. */
export async function desactivarCliente(id: number) {
  const respuesta = await http.patch<RespuestaCliente>(`/clientes/${id}/desactivar`);
  return respuesta.data;
}
/** Vuelve a activar un cliente desactivado. */
export async function activarCliente(id: number) {
  const respuesta = await http.patch<RespuestaCliente>(`/clientes/${id}/activar`);
  return respuesta.data;
}
