// Reconocimiento de voz de CU28. Hay dos motores con la misma interfaz:
// - "navegador": el de Chrome, Edge y Safari (Web Speech API; el audio va al servicio de su fabricante).
// - "local": el propio de HOUSE OF CUT (Vosk en WebAssembly, ver reconocedorLocal.ts), para Firefox, Brave,
//   Opera y cualquier navegador cuyo servicio no responda. El audio no sale del equipo.
// TypeScript no trae los tipos de la Web Speech API, así que se declaran aquí solo las partes usadas.
import { ReconocedorLocal, reconocedorLocalDisponible } from './reconocedorLocal';

interface AlternativaVoz {
  transcript: string;
  confidence: number;
}

interface ResultadoVoz {
  readonly isFinal: boolean;
  readonly length: number;
  [indice: number]: AlternativaVoz;
}

export interface EventoResultadoVoz {
  readonly resultIndex: number;
  readonly results: { readonly length: number; [indice: number]: ResultadoVoz };
}

export interface EventoErrorVoz {
  readonly error: string;
}

export interface ReconocedorVoz {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((evento: EventoResultadoVoz) => void) | null;
  onerror: ((evento: EventoErrorVoz) => void) | null;
  onend: (() => void) | null;
  onaudiostart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type ConstructorReconocedor = new () => ReconocedorVoz;

function constructorDelNavegador(): ConstructorReconocedor | undefined {
  const w = window as unknown as { SpeechRecognition?: ConstructorReconocedor; webkitSpeechRecognition?: ConstructorReconocedor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export type MotorVoz = 'navegador' | 'local';

const CLAVE_MOTOR = 'house-of-cut.motor-voz';

/** Navegadores que exponen la Web Speech API pero cuyo servicio no funciona (responden "network"). */
function navegadorSinServicio() {
  const n = navigator as Navigator & { brave?: unknown };
  return n.brave !== undefined || /OPR\/|Opera|Vivaldi|YaBrowser/.test(navigator.userAgent);
}

function navegadorDescartado() {
  try {
    return sessionStorage.getItem(CLAVE_MOTOR) === 'local';
  } catch {
    return false;
  }
}

/** Motor que se usará: el del navegador si existe y funciona; si no, el propio. */
export function motorVoz(): MotorVoz | null {
  if (typeof window === 'undefined') return null;
  const nativo = constructorDelNavegador() !== undefined && !navegadorSinServicio() && !navegadorDescartado();
  if (nativo) return 'navegador';
  return reconocedorLocalDisponible() ? 'local' : null;
}

/**
 * El servicio del navegador falló (sin conexión a su servicio, bloqueado, o se cerró sin abrir el micrófono):
 * en esta sesión se usa el reconocedor propio. Devuelve true si hay a dónde cambiar.
 */
export function descartarMotorNavegador() {
  try {
    sessionStorage.setItem(CLAVE_MOTOR, 'local');
  } catch {
    // Sin almacenamiento (modo privado estricto): se intenta igual con el propio.
  }
  return reconocedorLocalDisponible();
}

/** true si hay algún motor de voz en este navegador. */
export function vozDisponible() {
  return motorVoz() !== null;
}

/** El micrófono solo se permite en páginas seguras (https o localhost); no al entrar por la IP del equipo. */
export function contextoSeguro() {
  return typeof window === 'undefined' || window.isSecureContext;
}

export function crearReconocedor(idioma: string): ReconocedorVoz | null {
  const motor = motorVoz();
  if (motor === 'local') return new ReconocedorLocal();
  const Constructor = constructorDelNavegador();
  if (!motor || !Constructor) return null;
  const reconocedor = new Constructor();
  reconocedor.lang = idioma;
  reconocedor.continuous = false;
  reconocedor.interimResults = true;
  reconocedor.maxAlternatives = 3;
  return reconocedor;
}

/** Texto parcial (mientras habla) y alternativas finales (cuando termina) de un evento. */
export function leerResultado(evento: EventoResultadoVoz) {
  let parcial = '';
  const finales: string[] = [];
  for (let i = evento.resultIndex; i < evento.results.length; i += 1) {
    const resultado = evento.results[i];
    if (resultado.isFinal) {
      for (let j = 0; j < resultado.length; j += 1) finales.push(resultado[j].transcript.trim());
    } else {
      parcial += resultado[0].transcript;
    }
  }
  return { parcial: parcial.trim(), finales: finales.filter(Boolean) };
}

/** Mensaje para el usuario según el código de error del navegador. */
export function mensajeErrorVoz(codigo: string) {
  switch (codigo) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'El navegador no tiene permiso para usar el micrófono. Habilítelo en el candado de la barra de direcciones.';
    case 'no-speech':
      return 'No se escuchó ningún comando. Presione el micrófono y hable de nuevo.';
    case 'audio-capture':
      return 'No se encontró un micrófono conectado.';
    case 'network':
      return 'No hay conexión con el servicio de reconocimiento de voz. Revise su internet.';
    case 'modelo-no-disponible':
      return 'No se pudo descargar el reconocedor de voz. Revise su conexión e intente de nuevo.';
    case 'aborted':
      return 'El navegador cortó el micrófono. Presione el micrófono e intente de nuevo.';
    default:
      return 'No se pudo reconocer la voz. Intente de nuevo.';
  }
}
