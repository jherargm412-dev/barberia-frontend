import { http } from '../../../../shared/api/httpClient';
import type { FiltrosCatalogoProductos, ProductoCatalogo } from '../../types/consultar_catalogo_productos';

// Endpoints públicos de /api/v1/publico/productos (ConsultarCatalogoProductosController.java).
// No requieren sesión.

/** CU23 pasos 1 y 2: productos de venta activos, del más caro al más barato, con filtros opcionales. */
export async function listarCatalogoProductos(filtros?: FiltrosCatalogoProductos) {
  const params: Record<string, string> = {};
  if (filtros?.q.trim()) params.q = filtros.q.trim();
  if (filtros?.precioMin) params.precioMin = filtros.precioMin;
  if (filtros?.precioMax) params.precioMax = filtros.precioMax;
  const respuesta = await http.get<ProductoCatalogo[]>('/publico/productos', { params });
  return respuesta.data;
}

/**
 * URL pública de la imagen para un <img>. El ?v= cambia cuando el administrador la reemplaza,
 * así el navegador no muestra la anterior desde su caché.
 */
export function urlImagenProducto(idProducto: number, version: number) {
  return `${http.defaults.baseURL ?? ''}/publico/productos/${idProducto}/imagen?v=${version}`;
}

/** Detalle de un producto de venta activo (404 si está deshabilitado o es un insumo). */
export async function obtenerProductoCatalogo(id: number) {
  const respuesta = await http.get<ProductoCatalogo>(`/publico/productos/${id}`);
  return respuesta.data;
}
