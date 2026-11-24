// Reconocedor de voz propio de HOUSE OF CUT (CU28) para los navegadores que no traen uno o cuyo servicio
// no responde (Firefox, Brave, Opera…). Usa Vosk compilado a WebAssembly con un modelo pequeño de español:
// el audio se procesa dentro del navegador y nunca sale del equipo. Expone la misma interfaz que el
// reconocedor del navegador para que el botón del micrófono no distinga entre ambos.
import type { Model } from 'vosk-browser';
import type { EventoResultadoVoz, ReconocedorVoz } from './reconocimientoVoz';

/** Modelo servido desde public/ (~40 MB). Se descarga solo la primera vez que se usa. */
const RUTA_MODELO = `${import.meta.env.BASE_URL}modelos/vosk-model-small-es-0.42.tar.gz`;
/** Sin voz en este tiempo se da por terminado con "no-speech", como hace el reconocedor del navegador. */
const ESPERA_SIN_VOZ_MS = 8000;
/** Tope de una frase: los comandos son cortos. */
const DURACION_MAXIMA_MS = 15000;
/** Tras "dejar de escuchar", tiempo para recibir el resultado final de lo ya dicho. */
const ESPERA_RESULTADO_FINAL_MS = 1200;

let modelo: Model | null = null;
let modeloCargando: Promise<Model> | null = null;

function cargarModelo(): Promise<Model> {
  if (modelo) return Promise.resolve(modelo);
  modeloCargando ??= import('vosk-browser')
    .then(({ createModel }) => createModel(RUTA_MODELO))
    .then((cargado) => {
      modelo = cargado;
      return cargado;
    })
    .catch((error: unknown) => {
      modeloCargando = null;
      throw error;
    });
  return modeloCargando;
}

/** Empieza a descargar el modelo antes de que se necesite (al acercar el puntero al micrófono). */
export function precargarModeloLocal() {
  cargarModelo().catch(() => undefined);
}

type ConstructorAudio = typeof AudioContext;

function constructorAudio(): ConstructorAudio | undefined {
  const w = window as unknown as { AudioContext?: ConstructorAudio; webkitAudioContext?: ConstructorAudio };
  return w.AudioContext ?? w.webkitAudioContext;
}

/** true si este navegador puede usar el reconocedor propio (micrófono, audio y WebAssembly). */
export function reconocedorLocalDisponible() {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    typeof navigator.mediaDevices?.getUserMedia === 'function' &&
    typeof WebAssembly === 'object' &&
    typeof Worker === 'function' &&
    constructorAudio() !== undefined
  );
}

function evento(texto: string, final: boolean): EventoResultadoVoz {
  const resultado = { isFinal: final, length: 1, 0: { transcript: texto, confidence: 1 } };
  return { resultIndex: 0, results: { length: 1, 0: resultado } };
}

function codigoErrorMicrofono(error: unknown) {
  const nombre = error instanceof DOMException ? error.name : '';
  if (nombre === 'NotAllowedError' || nombre === 'SecurityError') return 'not-allowed';
  return 'audio-capture';
}

export class ReconocedorLocal implements ReconocedorVoz {
  lang = 'es';
  continuous = false;
  interimResults = true;
  maxAlternatives = 1;
  onresult: ReconocedorVoz['onresult'] = null;
  onerror: ReconocedorVoz['onerror'] = null;
  onend: ReconocedorVoz['onend'] = null;
  onaudiostart: ReconocedorVoz['onaudiostart'] = null;
  /** Solo el reconocedor propio: avisa que se está descargando el modelo (la primera vez tarda). */
  oncargando: (() => void) | null = null;

  private microfono: MediaStream | null = null;
  private audio: AudioContext | null = null;
  private procesador: ScriptProcessorNode | null = null;
  private kaldi: InstanceType<Model['KaldiRecognizer']> | null = null;
  private temporizadores: number[] = [];
  private oyoVoz = false;
  private terminado = false;

  start() {
    void this.iniciar();
  }

  /** Deja de escuchar y entrega lo que se alcanzó a decir. */
  stop() {
    if (this.terminado) return;
    if (!this.kaldi) {
      this.terminar();
      return;
    }
    this.kaldi.retrieveFinalResult();
    this.temporizadores.push(window.setTimeout(() => this.terminar(), ESPERA_RESULTADO_FINAL_MS));
  }

  /** Corta sin entregar resultado (p. ej. al cerrar sesión). */
  abort() {
    if (this.terminado) return;
    this.onerror?.({ error: 'aborted' });
    this.terminar();
  }

  private async iniciar() {
    try {
      this.microfono = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
    } catch (error) {
      this.fallar(codigoErrorMicrofono(error));
      return;
    }
    if (this.terminado) return this.terminar();

    let modeloListo: Model;
    try {
      if (!modelo) this.oncargando?.();
      modeloListo = await cargarModelo();
    } catch {
      this.fallar('modelo-no-disponible');
      return;
    }
    if (this.terminado) return this.terminar();

    const Audio = constructorAudio()!;
    this.audio = new Audio();
    // Algunos navegadores crean el audio "suspendido" si la descarga del modelo tardó tras el clic.
    await this.audio.resume().catch(() => undefined);

    const kaldi = new modeloListo.KaldiRecognizer(this.audio.sampleRate);
    this.kaldi = kaldi;
    kaldi.on('partialresult', (mensaje) => {
      if (mensaje.event !== 'partialresult') return;
      const parcial = mensaje.result.partial.trim();
      if (!parcial || this.terminado) return;
      this.oyoVoz = true;
      this.onresult?.(evento(parcial, false));
    });
    kaldi.on('result', (mensaje) => {
      if (mensaje.event !== 'result') return;
      const texto = mensaje.result.text.trim();
      // Vosk entrega resultados vacíos en los silencios antes de hablar: se ignoran.
      if (!texto || this.terminado) return;
      this.onresult?.(evento(texto, true));
      this.terminar();
    });

    const fuente = this.audio.createMediaStreamSource(this.microfono);
    // ScriptProcessor está obsoleto pero es el único nodo de audio que funciona igual en todos los navegadores.
    this.procesador = this.audio.createScriptProcessor(4096, 1, 1);
    this.procesador.onaudioprocess = (e) => {
      if (!this.terminado) kaldi.acceptWaveform(e.inputBuffer);
    };
    fuente.connect(this.procesador);
    this.procesador.connect(this.audio.destination);

    this.onaudiostart?.();
    this.temporizadores.push(
      window.setTimeout(() => {
        if (!this.oyoVoz) this.fallar('no-speech');
      }, ESPERA_SIN_VOZ_MS),
      window.setTimeout(() => this.stop(), DURACION_MAXIMA_MS),
    );
  }

  private fallar(codigo: string) {
    if (this.terminado) return;
    this.onerror?.({ error: codigo });
    this.terminar();
  }

  /** Suelta el micrófono y el audio, y avisa el fin una sola vez. */
  private terminar() {
    if (this.terminado && !this.microfono) return;
    const yaTerminado = this.terminado;
    this.terminado = true;
    this.temporizadores.forEach((t) => window.clearTimeout(t));
    this.temporizadores = [];
    if (this.procesador) this.procesador.onaudioprocess = null;
    this.procesador?.disconnect();
    this.microfono?.getTracks().forEach((pista) => pista.stop());
    this.microfono = null;
    void this.audio?.close().catch(() => undefined);
    this.audio = null;
    this.kaldi?.remove();
    this.kaldi = null;
    if (!yaTerminado) this.onend?.();
  }
}
