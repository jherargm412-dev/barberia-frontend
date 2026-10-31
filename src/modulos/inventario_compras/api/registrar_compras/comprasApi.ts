import { http } from '../../../../shared/api/httpClient';
import type { PaginaRespuesta } from '../../../../shared/api/types';
import type { Compra, CompraResumen, OpcionesCompra, RegistrarCompraRequest, RespuestaCompra } from '../../types/registrar_compras';

export async function opcionesCompra() {
  return (await http.get<OpcionesCompra>('/compras/opciones')).data;
}

export async function listarCompras(desde: string, hasta: string, proveedorId: number | undefined, page: number, size: number) {
  return (await http.get<PaginaRespuesta<CompraResumen>>('/compras', { params: { desde, hasta, proveedorId, page, size } })).data;
}

export async function consultarCompra(id: number) {
  return (await http.get<Compra>(`/compras/${id}`)).data;
}

export async function registrarCompra(datos: RegistrarCompraRequest) {
  return (await http.post<RespuestaCompra>('/compras', {
    ...datos,
    nroFact: datos.nroFact.trim() || null,
    fecha: datos.fecha || null,
  })).data;
}
