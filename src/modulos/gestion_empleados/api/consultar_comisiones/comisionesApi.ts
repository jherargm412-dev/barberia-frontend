import { http } from '../../../../shared/api/httpClient';
import type { BarberoComisiones, ConsultaComisiones, DesgloseComisiones, FiltrosComisiones, LiquidacionComisiones } from '../../types/consultar_comisiones';

export async function listarBarberosComisiones(signal?: AbortSignal) {
  return (await http.get<BarberoComisiones[]>('/comisiones/barberos', { signal })).data;
}
export async function consultarComisiones(params: FiltrosComisiones, signal?: AbortSignal) {
  return (await http.get<ConsultaComisiones>('/comisiones', { params, signal })).data;
}
export async function consultarLiquidaciones(empleadoId?: number, signal?: AbortSignal) {
  return (await http.get<LiquidacionComisiones[]>('/comisiones/liquidaciones', { params: { empleadoId }, signal })).data;
}
export async function consultarDesglose(id: number, empleadoId?: number, signal?: AbortSignal) {
  return (await http.get<DesgloseComisiones>(`/comisiones/liquidaciones/${id}`, { params: { empleadoId }, signal })).data;
}
