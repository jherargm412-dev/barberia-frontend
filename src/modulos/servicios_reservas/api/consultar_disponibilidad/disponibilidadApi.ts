import { http } from '../../../../shared/api/httpClient';
import type { ConsultaDisponibilidad, Disponibilidad } from '../../types/consultar_disponibilidad';

// Endpoint de /api/v1/disponibilidad (DisponibilidadController.java).

/** CU10: horas libres para el servicio en la fecha, de un barbero o de cualquiera. */
export async function consultarDisponibilidad(consulta: ConsultaDisponibilidad) {
  const respuesta = await http.get<Disponibilidad>('/disponibilidad', { params: consulta });
  return respuesta.data;
}
