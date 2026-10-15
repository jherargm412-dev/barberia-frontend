// Tipos de CU12 Solicitar Cita (copiados de los DTOs del backend).
import type { RespuestaCita } from './gestionar_citas';

/**
 * Body de POST /solicitudes-cita (SolicitarCitaRequest.java). No lleva cliente, canal ni estado: el cliente
 * es el usuario logueado, el canal es WEB y la cita nace PENDIENTE hasta pagar el anticipo (CU14).
 * El anticipo lo calcula el backend. Fecha "AAAA-MM-DD" y horas "HH:mm".
 */
export interface SolicitarCitaRequest {
  servicioId: number;
  empleadoId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

/** Respuesta de POST /solicitudes-cita (RespuestaSolicitudCita.java): mensaje + la cita PENDIENTE. */
export type RespuestaSolicitudCita = RespuestaCita;