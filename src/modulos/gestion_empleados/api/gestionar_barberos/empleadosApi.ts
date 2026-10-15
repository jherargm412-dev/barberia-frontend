import { http } from '../../../../shared/api/httpClient';
import type { PaginaRespuesta } from '../../../../shared/api/types';
import type {
  ActualizarEmpleadoRequest,
  Empleado,
  EmpleadoResumen,
  FiltrosEmpleados,
  RegistrarEmpleadoRequest,
  RespuestaEmpleado,
  Turno,
} from '../../types/gestionar_barberos';

// Endpoints de /api/v1/empleados (EmpleadoController.java).

/** Paso 1: listado paginado. Solo mandamos los filtros que tienen valor. */
export async function listarEmpleados(filtros: FiltrosEmpleados) {
  const params = {
    q: filtros.q || undefined,
    rol: filtros.rol || undefined,
    estado: filtros.estado || undefined,
    tipoContrato: filtros.tipoContrato || undefined,
    page: filtros.page,
    size: filtros.size,
  };
  const respuesta = await http.get<PaginaRespuesta<EmpleadoResumen>>('/empleados', { params });
  return respuesta.data;
}

export async function consultarEmpleado(id: number) {
  const respuesta = await http.get<Empleado>(`/empleados/${id}`);
  return respuesta.data;
}

/** Paso 2: usuario + rol + empleado en una sola operación. */
export async function registrarEmpleado(datos: RegistrarEmpleadoRequest) {
  const respuesta = await http.post<RespuestaEmpleado>('/empleados', datos);
  return respuesta.data;
}

/** Paso 3: datos de acceso + información laboral. */
export async function actualizarEmpleado(id: number, datos: ActualizarEmpleadoRequest) {
  const respuesta = await http.put<RespuestaEmpleado>(`/empleados/${id}`, datos);
  return respuesta.data;
}

/** Paso 4: lista final de servicios habilitados (reemplaza a la anterior). */
export async function asignarServicios(id: number, servicios: number[]) {
  const respuesta = await http.put<RespuestaEmpleado>(`/empleados/${id}/servicios`, { servicios });
  return respuesta.data;
}

/** Paso 5: desvincular (la cuenta queda INACTIVA; el empleado se conserva). */
export async function desvincularEmpleado(id: number) {
  const respuesta = await http.patch<RespuestaEmpleado>(`/empleados/${id}/desvincular`);
  return respuesta.data;
}

export async function reactivarEmpleado(id: number) {
  const respuesta = await http.patch<RespuestaEmpleado>(`/empleados/${id}/reactivar`);
  return respuesta.data;
}

export async function listarTurnos() {
  const respuesta = await http.get<Turno[]>('/empleados/turnos');
  return respuesta.data;
}
