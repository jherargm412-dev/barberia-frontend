import { http } from '../../../../shared/api/httpClient';
import type { BarberoAgenda, CitaAgenda, CitaAgendaDetalle, FiltrosAgenda } from '../../types/consultar_agenda';

// Endpoints de /api/v1/agenda (AgendaController.java). Solo lectura.

/** Citas de un día o de su semana; el barbero lo fuerza el backend según el permiso del usuario. */
export async function listarAgenda(filtros: FiltrosAgenda) {
  const respuesta = await http.get<CitaAgenda[]>('/agenda', {
    params: {
      fecha: filtros.fecha,
      vista: filtros.vista,
      estado: filtros.estado || undefined,
      barberoId: filtros.barberoId === '' ? undefined : filtros.barberoId,
    },
  });
  return respuesta.data;
}

/** Detalle de una cita con el historial reciente de su cliente. */
export async function obtenerCitaAgenda(id: number) {
  const respuesta = await http.get<CitaAgendaDetalle>(`/agenda/${id}`);
  return respuesta.data;
}

/** Barberos activos para el filtro (solo Recepcionista y Administrador). */
export async function listarBarberosAgenda() {
  const respuesta = await http.get<BarberoAgenda[]>('/agenda/barberos');
  return respuesta.data;
}
