import { MENSAJES } from '../../constants/gestionar_citas';
import type { SolicitarCitaRequest } from '../../types/solicitar_cita';
import { hoy, validarHorario } from '../gestionar_citas/citaForm';

/** Valores del formulario tal como los maneja React (los ids son texto porque vienen de selects). */
export interface SolicitudValores {
  servicioId: string;
  empleadoId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

export type ErroresSolicitud = Partial<Record<keyof SolicitudValores, string>>;

export function valoresInicialesSolicitud(): SolicitudValores {
  return { servicioId: '', empleadoId: '', fecha: hoy(), horaInicio: '', horaFin: '' };
}

/**
 * Mismas reglas que el backend (SolicitudCitaService): primero campos vacíos y después horas inválidas.
 * La hora se elige de la grilla de horas libres (CU10); si falta, se pide elegir una.
 */
export function validarSolicitud(v: SolicitudValores): { mensaje: string; errores: ErroresSolicitud } {
  const { errores: horario, hayVacios: horarioVacio } = validarHorario(v.fecha, v.horaInicio, v.horaFin);
  const errores: ErroresSolicitud = { ...horario };
  let hayVacios = horarioVacio;
  if (!v.servicioId) {
    errores.servicioId = 'Obligatorio';
    hayVacios = true;
  }
  if (!v.empleadoId) {
    errores.empleadoId = 'Obligatorio';
    hayVacios = true;
  }
  if (!v.horaInicio || !v.horaFin) errores.horaInicio = 'Elija una hora libre';
  let mensaje = '';
  if (hayVacios) mensaje = MENSAJES.CAMPOS_VACIOS;
  else if (Object.keys(errores).length > 0) mensaje = Object.values(errores)[0] ?? '';
  return { mensaje, errores };
}

/** Convierte lo escrito en el pedido para el backend (los ids pasan de texto a número). */
export function aPedido(v: SolicitudValores): SolicitarCitaRequest {
  return {
    servicioId: Number(v.servicioId),
    empleadoId: Number(v.empleadoId),
    fecha: v.fecha,
    horaInicio: v.horaInicio,
    horaFin: v.horaFin,
  };
}