import { http } from '../../../../shared/api/httpClient';
import type { ServicioResumen } from '../../types/gestionar_catalogo_servicios';

// Endpoints públicos de /api/v1/publico/servicios (ConsultarServiciosController.java).
// No requieren sesión.

/** CU13 pasos 2–6: servicios activos, del más caro al más barato. */
export async function listarCatalogo() {
  const respuesta = await http.get<ServicioResumen[]>('/publico/servicios');
  return respuesta.data;
}

/** CU13 flujo 7b: detalle de un servicio activo. */
export async function consultarDetalleServicio(id: number) {
  const respuesta = await http.get<ServicioResumen>(`/publico/servicios/${id}`);
  return respuesta.data;
}