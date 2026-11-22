import { http } from '../../../../shared/api/httpClient';
import type { HistorialCliente } from '../../types/gestionar_clientes';

/** CU07: Obtiene el historial de citas de un cliente */
export async function consultarHistorialCliente(id: number) {
  const respuesta = await http.get<HistorialCliente[]>(`/clientes/${id}/historial`);
  return respuesta.data;
}