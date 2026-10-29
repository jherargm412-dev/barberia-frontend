import { http } from '../../../../shared/api/httpClient';
import type {
  AjusteStock,
  AjusteStockRequest,
  Producto,
  ProductoRequest,
  RespuestaProducto,
} from '../../types/gestionar_productos_insumos';

// Endpoints de /api/v1/productos (ProductoController.java).

/** Paso 2: listado ordenado por nombre (incluye inactivos para poder habilitarlos). */
export async function listarProductos() {
  const respuesta = await http.get<Producto[]>('/productos');
  return respuesta.data;
}

/** Flujos Consultar y Modificar: datos actuales del ítem. */
export async function consultarProducto(id: number) {
  const respuesta = await http.get<Producto>(`/productos/${id}`);
  return respuesta.data;
}

export async function registrarProducto(datos: ProductoRequest) {
  const respuesta = await http.post<RespuestaProducto>('/productos', datos);
  return respuesta.data;
}

export async function modificarProducto(id: number, datos: ProductoRequest) {
  const respuesta = await http.put<RespuestaProducto>(`/productos/${id}`, datos);
  return respuesta.data;
}

/** Habilitar / Deshabilitar: se envía el estado destino (no un "alternar"), así un doble clic no lo revierte. */
export async function cambiarEstadoProducto(id: number, activo: boolean) {
  const respuesta = await http.patch<RespuestaProducto>(`/productos/${id}/estado`, { activo });
  return respuesta.data;
}

/** Ajustar stock: inventario inicial (suma) o pérdida / vencido (restan). Devuelve "Stock actualizado". */
export async function ajustarStock(id: number, datos: AjusteStockRequest) {
  const respuesta = await http.post<RespuestaProducto>(`/productos/${id}/ajustes`, datos);
  return respuesta.data;
}

/** Historial de ajustes de stock del ítem, del más reciente al más antiguo. */
export async function listarAjustes(id: number) {
  const respuesta = await http.get<AjusteStock[]>(`/productos/${id}/ajustes`);
  return respuesta.data;
}
