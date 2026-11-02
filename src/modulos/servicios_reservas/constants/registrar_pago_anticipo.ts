import type { MetodoMostrador, MetodoPagoAnticipo } from '../types/registrar_pago_anticipo';

/** Permisos del backend que usa CU14 (semillas V2 y V15). */
export const PERMISOS_ANTICIPO = {
  /** Cobro en mostrador: Administrador y Recepcionista. */
  COBRAR: 'CAJA_MOVIMIENTO_REGISTRAR',
  /** Pago web del anticipo de las propias reservas: solo el Cliente. */
  PAGAR_PROPIO: 'ANTICIPO_PAGAR_PROPIO',
};

/** Métodos que puede elegir la recepcionista al cobrar el anticipo. */
export const METODOS_PAGO: { valor: MetodoMostrador; etiqueta: string }[] = [
  { valor: 'EFECTIVO', etiqueta: 'Efectivo' },
  { valor: 'QR', etiqueta: 'QR' },
  { valor: 'MIXTO', etiqueta: 'Mixto (efectivo + QR)' },
];

/** Para mostrar el método en el comprobante. */
export const ETIQUETAS_METODO: Record<MetodoPagoAnticipo, string> = {
  EFECTIVO: 'Efectivo',
  QR: 'QR',
  MIXTO: 'Mixto (efectivo + QR)',
  TARJETA: 'Tarjeta (en línea)',
};

/** Flujo B, paso 6: con QR o mixto, la recepcionista comprueba que el dinero llegó antes de confirmar. */
export const AVISO_VERIFICAR_QR = 'Verifique en la app del banco que la transferencia llegó antes de confirmar.';

/** Longitud máxima de la referencia del QR (igual que pago_anticipo.referencia_qr en la base). */
export const MAX_REFERENCIA_QR = 60;

/** Mensajes de validación del diálogo de cobro. */
export const MENSAJES_ANTICIPO = {
  IMPORTE_INVALIDO: 'Ingrese un importe válido (máximo 2 decimales)',
  IMPORTE_POSITIVO: 'El importe debe ser mayor a 0',
  SUMA_INCORRECTA: 'La suma de efectivo y QR debe ser exactamente el anticipo de la reserva',
  REFERENCIA_LARGA: `Máximo ${MAX_REFERENCIA_QR} caracteres`,
};

/**
 * Anticipo mínimo (Bs) para pagarlo con tarjeta en la web. Stripe rechaza cobros menores a ~0,50 EUR; el backend
 * usa el mismo valor (app.pagos.tarjeta.anticipo-minimo). Un anticipo menor se paga en la barbería.
 */
export const ANTICIPO_MINIMO_TARJETA = 10;

/** Campo del error del backend que indica que el anticipo se paga en la barbería (PagoAnticipoWebService). */
export const CAMPO_PAGO_EN_BARBERIA = 'pagoEnBarberia';

/** Textos de la pantalla de pago del cliente con tarjeta (flujo A, CU29 Stripe). */
export const MENSAJES_PAGO_WEB = {
  INSTRUCCION: 'Ingrese los datos de su tarjeta. El pago lo procesa Stripe de forma segura: la barbería no ve ni guarda su tarjeta.',
  MODO_PRUEBA: 'Modo prueba: use la tarjeta 4242 4242 4242 4242, cualquier fecha futura y cualquier CVC.',
  NO_COMPLETADO: 'El pago con tarjeta no se completó',
  COBRADO_SIN_REGISTRAR: 'El pago se cobró, pero no se pudo registrar. Pulse "Reintentar registro" (no se le cobrará otra vez).',
};