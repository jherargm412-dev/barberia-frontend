// Tipos de CU14 Registrar Pago de Anticipo (copiados de los DTOs del backend).
import type { Cita } from './gestionar_citas';

/** Métodos del cobro en mostrador (flujo B). */
export type MetodoMostrador = 'EFECTIVO' | 'QR' | 'MIXTO';

/** Métodos de un anticipo cobrado (CHECK de pago_anticipo.metodo): mostrador o TARJETA por la web (V28). */
export type MetodoPagoAnticipo = MetodoMostrador | 'TARJETA';

/**
 * Body de POST /reservas/{id}/anticipo (RegistrarAnticipoRequest.java). La reserva va en la URL y el total
 * lo calcula el backend. Con EFECTIVO solo va montoEfectivo, con QR solo montoQr y con MIXTO ambos.
 */
export interface RegistrarAnticipoRequest {
  metodo: MetodoMostrador;
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
  montoTarjeta: number;
  montoTotal: number;
  referenciaQr: string | null;
  /** Id del cobro en Stripe (pi_...) cuando se pagó con tarjeta. */
  referenciaTarjeta: string | null;
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

/**
 * Cobro con tarjeta preparado en Stripe para el anticipo (AnticipoTarjetaResponse.java).
 * Con clientSecret y clavePublica el navegador cobra con Stripe.js; después se confirma con paymentIntentId.
 * pagarAntesDe es el plazo de la cita web ("AAAA-MM-DDTHH:mm:ss"), o null.
 */
export interface AnticipoTarjeta {
  paymentIntentId: string;
  clientSecret: string;
  clavePublica: string;
  monto: number;
  moneda: string;
  pagarAntesDe: string | null;
}
