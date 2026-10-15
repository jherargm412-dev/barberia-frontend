// Tipos de CU14 Registrar Pago de Anticipo (copiados de los DTOs del backend).
import type { Cita } from './gestionar_citas';

/** Los tres métodos que acepta el backend (CHECK de pago_anticipo.metodo). */
export type MetodoPagoAnticipo = 'EFECTIVO' | 'QR' | 'MIXTO';

/**
 * Body de POST /reservas/{id}/anticipo (RegistrarAnticipoRequest.java). La reserva va en la URL y el total
 * lo calcula el backend. Con EFECTIVO solo va montoEfectivo, con QR solo montoQr y con MIXTO ambos.
 */
export interface RegistrarAnticipoRequest {
  metodo: MetodoPagoAnticipo;
  montoEfectivo: number | null;
  montoQr: number | null;
  referenciaQr: string | null;
}

/** El comprobante del anticipo (PagoAnticipoResponse.java). Fecha "AAAA-MM-DDTHH:mm:ss". */
export interface PagoAnticipo {
  idPagoAnticipo: number;
  metodo: MetodoPagoAnticipo;
  montoEfectivo: number;
  montoQr: number;
  montoTotal: number;
  referenciaQr: string | null;
  fechaPago: string;
  idCaja: number;
  /** Nombre de quien registró el cobro. */
  registradoPor: string;
  /** La cita ya CONFIRMADA. */
  reserva: Cita;
}

/** Respuesta del cobro: mensaje + el comprobante (RespuestaPagoAnticipo.java). */
export interface RespuestaPagoAnticipo {
  mensaje: string;
  pago: PagoAnticipo;
}

/** QR para pagar el anticipo por la web (QrAnticipoResponse.java). Vence en la fecha "AAAA-MM-DDTHH:mm:ss". */
export interface QrAnticipo {
  referencia: string;
  /** Texto que se dibuja como código QR. */
  contenido: string;
  monto: number;
  venceEn: string;
}

/** Body de POST /reservas/{id}/anticipo/confirmar-qr (ConfirmarPagoQrRequest.java). */
export interface ConfirmarPagoQrRequest {
  referencia: string;
}