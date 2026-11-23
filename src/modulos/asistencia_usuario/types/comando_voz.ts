/** Códigos del catálogo de comandos. Deben coincidir con el enum ComandoVoz del backend. */
export type CodigoComando =
  | 'INICIO'
  | 'AYUDA'
  | 'ABRIR'
  | 'BUSCAR_CLIENTE'
  | 'BUSCAR_PRODUCTO'
  | 'STOCK_BAJO'
  | 'AGENDA'
  | 'CITAS'
  | 'NUEVA_CITA'
  | 'DISPONIBILIDAD'
  | 'REGISTRAR_VENTA'
  | 'COMISIONES'
  | 'REPORTE'
  | 'TEMA';

/** Fila de la tabla de ayuda ("Comandos de voz"). */
export interface DefinicionComando {
  codigo: CodigoComando;
  /** Cómo se dice, con las partes variables entre corchetes. */
  comando: string;
  ejemplos: string[];
  descripcion: string;
  /** Con cualquiera de estos permisos el comando aparece; sin lista, aparece para todos. */
  permisos?: string[];
}

/** Opción del menú que se puede abrir con "abrir …" (solo las que el usuario ya ve). */
export interface OpcionAbrible {
  texto: string;
  ruta: string;
}

/** Lo que el intérprete decidió hacer con la frase. */
export type ResultadoComando =
  | { tipo: 'navegar'; comando: CodigoComando; destino: string; mensaje: string }
  | { tipo: 'tema'; comando: 'TEMA'; modo: 'light' | 'dark'; mensaje: string }
  | { tipo: 'sin-permiso'; mensaje: string }
  | { tipo: 'no-entendido'; mensaje: string };

/** Datos del usuario y de la pantalla que el intérprete necesita. */
export interface ContextoComando {
  tienePermiso: (permiso: string) => boolean;
  opciones: OpcionAbrible[];
  /** Fecha de hoy (se recibe para poder probar "mañana", "el viernes", etc.). */
  hoy: Date;
}
