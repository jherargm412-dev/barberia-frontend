import { http } from '../../../../shared/api/httpClient';
import type { FiltrosCatalogo, ServicioCatalogo } from '../../types/consultar_servicios';

// Endpoints públicos de /api/v1/publico/servicios (ConsultarServiciosController.java).
// No requieren sesión.

/** CU13 pasos 1 y 2: servicios activos, del más caro al más barato, con filtros opcionales. */
export async function listarCatalogo(filtros?: FiltrosCatalogo) {
  const params: Record<string, string> = {};
  if (filtros?.q.trim()) params.q = filtros.q.trim();
  if (filtros?.precioMin) params.precioMin = filtros.precioMin;
  if (filtros?.precioMax) params.precioMax = filtros.precioMax;
  const respuesta = await http.get<ServicioCatalogo[]>('/publico/servicios', { params });
  return respuesta.data;
}
