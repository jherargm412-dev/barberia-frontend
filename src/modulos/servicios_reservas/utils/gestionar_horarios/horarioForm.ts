import axios from 'axios';
import { DIAS, TIPOS_EXCEPCION } from '../../constants/gestionar_horarios';
import type { CitaAfectada, DiaHorario, DiaSemana, TipoExcepcion } from '../../types/gestionar_horarios';

/** "09:00:00" → "09:00" (lo que usa un <input type="time">). null → "". */
export function hhmm(hora: string | null | undefined) {
  return hora ? hora.slice(0, 5) : '';
}

/** Fecha de hoy como "AAAA-MM-DD" (el formato del <input type="date">), en la hora del navegador. */
export function hoyIso() {
  return new Date().toLocaleDateString('en-CA');
}

/** "2026-10-20" → "20/10/2026". Se arma a mano para que el navegador no cambie la zona horaria. */
export function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

export function etiquetaDia(dia: DiaSemana) {
  return DIAS.find((d) => d.valor === dia)?.etiqueta ?? dia;
}

export function etiquetaTipo(tipo: TipoExcepcion) {
  return TIPOS_EXCEPCION.find((t) => t.valor === tipo)?.etiqueta ?? tipo;
}

/** "Lunes 09:00 – 15:00" o "No trabaja". */
export function textoDia(dia: DiaHorario) {
  return dia.trabaja ? `${hhmm(dia.horaEntrada)} – ${hhmm(dia.horaSalida)}` : 'No trabaja';
}

/**
 * Lo que se envía en el PUT: los 7 días. Los días sin marcar van sin horas
 * (el backend los borra si existían).
 */
export function construirGuardar(dias: DiaHorario[]) {
  return {
    dias: dias.map((d) =>
      d.trabaja
        ? { ...d, horaEntrada: d.horaEntrada || null, horaSalida: d.horaSalida || null }
        : { ...d, horaEntrada: null, horaSalida: null },
    ),
  };
}

/**
 * Flujos 7c y 4f: el 409 trae la lista de citas que impiden guardar en "citasAfectadas".
 * obtenerError (shared) solo lee message y campos, por eso este caso de uso la lee aquí.
 */
export function obtenerCitasAfectadas(error: unknown): CitaAfectada[] {
  if (axios.isAxiosError<{ citasAfectadas?: CitaAfectada[] }>(error)) {
    return error.response?.data?.citasAfectadas ?? [];
  }
  return [];
}
