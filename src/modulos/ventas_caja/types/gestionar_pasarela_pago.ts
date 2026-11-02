/** Una pasarela del catálogo; solo las externas (Stripe) se activan o desactivan. */
export interface PasarelaPago {
  idMetodoPago: number;
  nombre: string;
  descripcion: string | null;
  proveedor: 'NINGUNO' | 'STRIPE';
  apiKey: string | null;
  modo: 'PRUEBA' | 'PRODUCCION' | null;
  moneda: string;
  activo: boolean;
  configurada: boolean;
  editable: boolean;
}

/** Stripe disponible si está activa, tiene claves y hay una caja abierta donde entre el dinero. */
export interface EstadoStripe {
  disponible: boolean;
  clavePublica: string | null;
  moneda: string | null;
  modo: 'PRUEBA' | 'PRODUCCION' | null;
  idCajaAbierta: number | null;
}

/** Cobro preparado en Stripe; el clientSecret solo sirve para completar este pago. */
export interface CobroStripeIniciado {
  paymentIntentId: string;
  clientSecret: string;
  clavePublica: string;
}

/** Cobro con tarjeta registrado en una caja; referencia = id del PaymentIntent de Stripe. */
export interface CobroTarjeta {
  idMovimientoCaja: number;
  idCaja: number;
  concepto: string;
  monto: number;
  fecha: string;
  referencia: string;
  responsable: string;
}
