import { http } from '../../../../shared/api/httpClient';
import type { LiquidacionRequest, LiquidacionResponse } from '../../types/liquidar_comisiones';

export async function calcularLiquidacion(empleadoId: number, datos: LiquidacionRequest): Promise<LiquidacionResponse> {
  const respuesta = await http.post<LiquidacionResponse>(`/liquidaciones/calcular/${empleadoId}`, datos);
  return respuesta.data;
}

export async function pagarLiquidacion(empleadoId: number, cajaId: number, datos: LiquidacionRequest): Promise<string> {
  const respuesta = await http.post<string>(`/liquidaciones/pagar/${empleadoId}/caja/${cajaId}`, datos);
  return respuesta.data;
}

