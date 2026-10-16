// Tipos de CU12 Solicitar Cita (copiados de los DTOs del backend).
import type { Cita, RespuestaCita } from './gestionar_citas';

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

/** Body de POST /publico/citas (SolicitarCitaInvitadoRequest.java): la cita + nombre y teléfono, sin cuenta. */
export interface SolicitarCitaInvitadoRequest extends SolicitarCitaRequest {
  nombre: string;
  telefono: string;
}

/** Respuesta de POST /publico/citas: mensaje, código del enlace del invitado y la cita PENDIENTE. */
export interface RespuestaCitaInvitado {
  mensaje: string;
  codigo: string;
  reserva: Cita;
}

/** Respuesta de POST /solicitudes-cita (RespuestaSolicitudCita.java): mensaje + la cita PENDIENTE. */
export type RespuestaSolicitudCita = RespuestaCita;