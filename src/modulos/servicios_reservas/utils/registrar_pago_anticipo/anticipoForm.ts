import { MAX_REFERENCIA_QR, MENSAJES_ANTICIPO } from '../../constants/registrar_pago_anticipo';
import type { MetodoPagoAnticipo, RegistrarAnticipoRequest } from '../../types/registrar_pago_anticipo';

/** Lo que el usuario tiene escrito en el diálogo (todo texto, como lo entrega un input). */
export interface DatosCobro {
  metodo: MetodoPagoAnticipo;
  efectivo: string;
  qr: string;
  referencia: string;
}

type Errores = Record<string, string | undefined>;

/** "12.5" o "12,50" → 1250 centavos. Null si no es un importe válido (máximo 2 decimales). */
export function aCentavos(texto: string): number | null {
  const limpio = texto.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(limpio)) return null;
  return Math.round(Number(limpio) * 100);
}

/** Un campo vacío cuenta como 0 (mientras el usuario aún escribe); un texto inválido, como null. */
function centavosOCero(texto: string): number | null {
  return texto.trim() === '' ? 0 : aCentavos(texto);
}

/** Pago mixto: cuánto falta (positivo) o sobra (negativo) para llegar al anticipo. Null si hay un importe inválido. */
export function faltanteMixto(montoAnticipo: number, efectivo: string, qr: string): number | null {
  const e = centavosOCero(efectivo);
  const q = centavosOCero(qr);
  if (e === null || q === null) return null;
  return (Math.round(montoAnticipo * 100) - e - q) / 100;
}

/**
 * Valida lo escrito y arma el pedido para el backend. Con EFECTIVO o QR el importe es el anticipo completo
 * (no se escribe); con MIXTO se escriben los dos y deben sumar exactamente el anticipo. Si hay errores,
 * el pedido es null. El backend repite estas validaciones: aquí solo se ahorra un viaje al servidor.
 */
export function prepararCobro(
  montoAnticipo: number,
  datos: DatosCobro,
): { errores: Errores; pedido: RegistrarAnticipoRequest | null } {
  const errores: Errores = {};
  const anticipo = Math.round(montoAnticipo * 100);
  let efectivo = 0;
  let qr = 0;

  if (datos.metodo === 'EFECTIVO') {
    efectivo = anticipo;
  } else if (datos.metodo === 'QR') {
    qr = anticipo;
  } else {
    const e = aCentavos(datos.efectivo);
    const q = aCentavos(datos.qr);
    if (e === null) errores.montoEfectivo = MENSAJES_ANTICIPO.IMPORTE_INVALIDO;
    else if (e <= 0) errores.montoEfectivo = MENSAJES_ANTICIPO.IMPORTE_POSITIVO;
    if (q === null) errores.montoQr = MENSAJES_ANTICIPO.IMPORTE_INVALIDO;
    else if (q <= 0) errores.montoQr = MENSAJES_ANTICIPO.IMPORTE_POSITIVO;
    if (e !== null && q !== null && e > 0 && q > 0 && e + q !== anticipo) {
      errores.monto = MENSAJES_ANTICIPO.SUMA_INCORRECTA;
    }
    efectivo = e ?? 0;
    qr = q ?? 0;
  }

  const referencia = datos.referencia.trim();
  if (referencia.length > MAX_REFERENCIA_QR) errores.referenciaQr = MENSAJES_ANTICIPO.REFERENCIA_LARGA;

  if (Object.values(errores).some(Boolean)) return { errores, pedido: null };
  return {
    errores,
    pedido: {
      metodo: datos.metodo,
      montoEfectivo: efectivo > 0 ? efectivo / 100 : null,
      montoQr: qr > 0 ? qr / 100 : null,
      referenciaQr: qr > 0 && referencia ? referencia : null,
    },
  };
}