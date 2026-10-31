/** Respuestas de CU21: el backend conserva los importes como decimales. */
export interface Caja {
  idCaja: number;
  estado: 'ABIERTA' | 'CERRADA';
  fechaApertura: string;
  fechaCierre: string | null;
  montoInicial: number;
  ingresosEfectivo: number;
  ingresosQr: number;
  ingresosTarjeta: number;
  egresosEfectivo: number;
  saldoEsperado: number;
  efectivoContado: number | null;
  diferencia: number | null;
  observacionCierre: string | null;
  responsableApertura: string;
  responsableCierre: string | null;
}

export interface MovimientoCaja {
  idMovimientoCaja: number;
  tipo: 'INGRESO' | 'EGRESO';
  concepto: string;
  monto: number;
  medioPago: 'EFECTIVO' | 'QR' | 'TARJETA';
  fecha: string;
  observaciones: string | null;
  responsable: string;
}
