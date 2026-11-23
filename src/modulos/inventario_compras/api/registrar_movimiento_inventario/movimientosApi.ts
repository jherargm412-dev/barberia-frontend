import { http } from '../../../../shared/api/httpClient';
import type { PaginaRespuesta } from '../../../../shared/api/types';
import type {
  Kardex, MovimientoInventario, OpcionesMovimiento, RegistrarMovimientoRequest, RespuestaMovimiento, TipoMovimiento,
} from '../../types/registrar_movimiento_inventario';

const BASE = '/inventario/movimientos';

export interface FiltroMovimientos {
  desde: string;
  hasta: string;
  productoId?: number;
  tipo?: TipoMovimiento;
  page: number;
  size: number;
}

/** Productos activos y los tipos de movimiento permitidos al usuario. */
export async function opcionesMovimiento() {
  return (await http.get<OpcionesMovimiento>(`${BASE}/opciones`)).data;
}

export async function registrarMovimiento(datos: RegistrarMovimientoRequest) {
  return (await http.post<RespuestaMovimiento>(BASE, datos)).data;
}

export async function listarMovimientos({ desde, hasta, productoId, tipo, page, size }: FiltroMovimientos) {
  return (await http.get<PaginaRespuesta<MovimientoInventario>>(BASE, {
    params: { desde: desde || undefined, hasta: hasta || undefined, productoId, tipo, page, size },
  })).data;
}

export async function consultarKardex(productoId: number, desde: string, hasta: string) {
  return (await http.get<Kardex>(`${BASE}/kardex/${productoId}`, {
    params: { desde: desde || undefined, hasta: hasta || undefined },
  })).data;
}
