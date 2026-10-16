import { http } from '../../../../shared/api/httpClient';
import type {
  BarberoHorarioResumen,
  FiltrosHorarios,
  GuardarHorarioRequest,
  HorarioBarberoDetalle,
  RegistrarExcepcionRequest,
  RespuestaExcepcion,
  RespuestaHorario,
  VentanaAtencion,
} from '../../types/gestionar_horarios';

// Endpoints de /api/v1/horarios (HorarioController.java).
// El catálogo de turnos se reutiliza de CU17 (listarTurnos de gestion_empleados).

/** Paso 3: barberos activos con el estado de su horario (sin paginación). */
export async function listarBarberosHorario(filtros: FiltrosHorarios) {
  const params = {
    q: filtros.q || undefined,
    estadoHorario: filtros.estadoHorario || undefined,
  };
  const respuesta = await http.get<BarberoHorarioResumen[]>('/horarios/barberos', { params });
  return respuesta.data;
}

/** Pasos 5, 4a y 4g: horario guardado, o sugerido desde el turno base si aún no tiene. */
export async function obtenerHorario(idEmpleado: number) {
  const respuesta = await http.get<HorarioBarberoDetalle>(`/horarios/barberos/${idEmpleado}`);
  return respuesta.data;
}

/** Pasos 6–9 y 4a: asignar o modificar (reemplazo completo de la semana). */
export async function guardarHorario(idEmpleado: number, datos: GuardarHorarioRequest) {
  const respuesta = await http.put<RespuestaHorario>(`/horarios/barberos/${idEmpleado}`, datos);
  return respuesta.data;
}

/** 4b: registrar excepción. */
export async function registrarExcepcion(idEmpleado: number, datos: RegistrarExcepcionRequest) {
  const respuesta = await http.post<RespuestaExcepcion>(`/horarios/barberos/${idEmpleado}/excepciones`, datos);
  return respuesta.data;
}

/** 4h: eliminar una excepción vigente o futura. */
export async function eliminarExcepcion(idEmpleado: number, idExcepcion: number) {
  const respuesta = await http.delete<{ mensaje: string }>(
    `/horarios/barberos/${idEmpleado}/excepciones/${idExcepcion}`,
  );
  return respuesta.data;
}

/** Paso 5: horario de atención de la barbería por día. */
export async function obtenerHorarioAtencion() {
  const respuesta = await http.get<VentanaAtencion[]>('/horarios/atencion');
  return respuesta.data;
}
