import { http } from '../../../../shared/api/httpClient';
import type { PaginaRespuesta } from '../../../../shared/api/types';
import type {
  AccionEstado,
  BarberoDisponible,
  Cita,
  CitaRequest,
  FiltrosCitas,
  ReprogramarRequest,
  RespuestaCita,
} from '../../types/gestionar_citas';

// Endpoints de /api/v1/reservas (ReservaController.java).

/** Agenda de un día, con filtros opcionales por barbero, estado y cliente. */
export async function listarCitas(filtros: FiltrosCitas) {
  const params = {
    fecha: filtros.fecha || undefined,
    empleadoId: filtros.empleadoId === '' ? undefined : filtros.empleadoId,
    estado: filtros.estado || undefined,
    q: filtros.q || undefined,
    page: filtros.page,
    size: filtros.size,
  };
  const respuesta = await http.get<PaginaRespuesta<Cita>>('/reservas', { params });
  return respuesta.data;
}

/** Barberos activos: los que prestan el servicio o, sin servicio, todos (filtro de la agenda). */
export async function listarBarberos(servicioId?: number) {
  const respuesta = await http.get<BarberoDisponible[]>('/reservas/barberos', { params: { servicioId } });
  return respuesta.data;
}

/** Paso 1: crear cita presencial/manual. */
export async function registrarCita(datos: CitaRequest) {
  const respuesta = await http.post<RespuestaCita>('/reservas', datos);
  return respuesta.data;
}

/** Paso 2: nueva fecha, horas y barbero; el anticipo y el estado se conservan. */
export async function reprogramarCita(id: number, datos: ReprogramarRequest) {
  const respuesta = await http.put<RespuestaCita>(`/reservas/${id}/reprogramar`, datos);
  return respuesta.data;
}

/** Paso 3: confirmar, atendida, no asistió o cancelar. */
export async function cambiarEstadoCita(id: number, accion: AccionEstado) {
  const respuesta = await http.patch<RespuestaCita>(`/reservas/${id}/${accion}`);
  return respuesta.data;
}
