import { http } from '../../../../shared/api/httpClient';
import type { PaginaRespuesta } from '../../../../shared/api/types';
import type {
  Barbero,
  BarberoRequest,
  EstadoBarbero,
  FiltrosBarberos,
  OpcionesFormularioBarbero,
  RespuestaBarbero,
} from '../../types/gestionar_barberos';

// Endpoints de /api/v1/barberos (BarberoController.java).

/** Pasos 1–2: barberos activos e inactivos. */
export async function listarBarberos(filtros: FiltrosBarberos) {
  // Solo mandamos los filtros que tienen valor.
  const params = {
    q: filtros.q || undefined,
    estado: filtros.estado || undefined,
    page: filtros.page,
    size: filtros.size,
  };
  const respuesta = await http.get<PaginaRespuesta<Barbero>>('/barberos', { params });
  return respuesta.data;
}

/** Paso 4: turnos, servicios habilitados y tipos de contrato para el formulario. */
export async function obtenerOpcionesFormulario() {
  const respuesta = await http.get<OpcionesFormularioBarbero>('/barberos/opciones');
  return respuesta.data;
}

/** 3a: datos actuales para precargar el formulario de modificar. */
export async function consultarBarbero(idEmpleado: number) {
  const respuesta = await http.get<Barbero>(`/barberos/${idEmpleado}`);
  return respuesta.data;
}

export async function registrarBarbero(datos: BarberoRequest) {
  const respuesta = await http.post<RespuestaBarbero>('/barberos', datos);
  return respuesta.data;
}

export async function modificarBarbero(idEmpleado: number, datos: BarberoRequest) {
  const respuesta = await http.put<RespuestaBarbero>(`/barberos/${idEmpleado}`, datos);
  return respuesta.data;
}

/** 3b: se envía el estado destino (no un "alternar"), así un doble clic no lo revierte. */
export async function cambiarEstadoBarbero(idEmpleado: number, estado: EstadoBarbero) {
  const respuesta = await http.patch<RespuestaBarbero>(`/barberos/${idEmpleado}/estado`, { estado });
  return respuesta.data;
}
