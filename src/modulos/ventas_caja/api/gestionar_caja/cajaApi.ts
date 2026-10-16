import { http } from '../../../../shared/api/httpClient';
import type { Caja, MovimientoCaja } from '../../types/gestionar_caja';

/** CU21 consulta la caja vigente; la respuesta vacía significa que se puede abrir otra. */
export async function obtenerCajaActual(): Promise<Caja | null> {
  const respuesta = await http.get<Caja | ''>('/caja/actual');
  return respuesta.data || null;
}

/** Historial: cajas cerradas con su arqueo, por fecha de apertura (sin fechas, los últimos 30 días). */
export async function listarCajasCerradas(desde: string, hasta: string): Promise<Caja[]> {
  const respuesta = await http.get<Caja[]>('/caja/cerradas', {
    params: { desde: desde || undefined, hasta: hasta || undefined },
  });
  return respuesta.data;
}

export async function listarMovimientos(idCaja: number): Promise<MovimientoCaja[]> {
  const respuesta = await http.get<MovimientoCaja[]>(`/caja/${idCaja}/movimientos`);
  return respuesta.data;
}

export async function abrirCaja(montoInicial: number): Promise<Caja> {
  const respuesta = await http.post<Caja>('/caja/aperturas', { montoInicial });
  return respuesta.data;
}

export async function registrarEgreso(idCaja: number, concepto: string, monto: number, observaciones: string): Promise<MovimientoCaja> {
  const respuesta = await http.post<MovimientoCaja>(`/caja/${idCaja}/egresos`, { concepto, monto, observaciones });
  return respuesta.data;
}

export async function cerrarCaja(idCaja: number, efectivoContado: number, observacion: string): Promise<Caja> {
  const respuesta = await http.post<Caja>(`/caja/${idCaja}/cierres`, { efectivoContado, observacion });
  return respuesta.data;
}
