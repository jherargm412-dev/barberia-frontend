import type { MetodoPagoAnticipo } from '../types/registrar_pago_anticipo';

/** Permisos del backend que usa CU14 (semillas V2 y V15). */
export const PERMISOS_ANTICIPO = {
  /** Cobro en mostrador: Administrador y Recepcionista. */
  COBRAR: 'CAJA_MOVIMIENTO_REGISTRAR',
  /** Pago web del anticipo de las propias reservas: solo el Cliente. */
  PAGAR_PROPIO: 'ANTICIPO_PAGAR_PROPIO',
};

/** Métodos que puede elegir la recepcionista al cobrar el anticipo. */
export const METODOS_PAGO: { valor: MetodoPagoAnticipo; etiqueta: string }[] = [
  { valor: 'EFECTIVO', etiqueta: 'Efectivo' },
  { valor: 'QR', etiqueta: 'QR' },
  { valor: 'MIXTO', etiqueta: 'Mixto (efectivo + QR)' },
];

/** Para mostrar el método en el comprobante. */
export const ETIQUETAS_METODO: Record<MetodoPagoAnticipo, string> = {
  EFECTIVO: 'Efectivo',
  QR: 'QR',
  MIXTO: 'Mixto (efectivo + QR)',
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

/** Textos de la pantalla de pago del cliente (flujo A). */
export const MENSAJES_PAGO_WEB = {
  INSTRUCCION: 'Escanee el código con la aplicación de su banco, pague el monto exacto y luego pulse "Confirmar pago".',
  QR_VENCIDO: 'El código QR venció. Genere uno nuevo para pagar.',
};