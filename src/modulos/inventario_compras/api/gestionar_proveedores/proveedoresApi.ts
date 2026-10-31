import { http } from '../../../../shared/api/httpClient';
import type { PaginaRespuesta } from '../../../../shared/api/types';
import type { Proveedor, ProveedorRequest, RespuestaProveedor } from '../../types/gestionar_proveedores';

export async function listarProveedores(q: string, activo: boolean | undefined, page: number, size: number) {
  return (await http.get<PaginaRespuesta<Proveedor>>('/proveedores', { params: { q, activo, page, size } })).data;
}

export async function consultarProveedor(id: number) {
  return (await http.get<Proveedor>(`/proveedores/${id}`)).data;
}

export async function guardarProveedor(datos: ProveedorRequest, id?: number) {
  return id === undefined
    ? (await http.post<RespuestaProveedor>('/proveedores', datos)).data
    : (await http.put<RespuestaProveedor>(`/proveedores/${id}`, datos)).data;
}

export async function cambiarEstadoProveedor(id: number, activo: boolean) {
  return (await http.patch<RespuestaProveedor>(`/proveedores/${id}/estado`, { activo })).data;
}
