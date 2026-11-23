import { createContext } from 'react';
import type { ResultadoComando } from '../../types/comando_voz';

export type SeveridadAviso = 'info' | 'success' | 'warning' | 'error';

export interface ComandoVozContextValue {
  /**
   * Interpreta las alternativas que entendió el navegador (o un texto escrito) y ejecuta la primera que
   * corresponda a un comando: abre la pantalla y la registra en la bitácora.
   */
  ejecutar: (alternativas: string[]) => ResultadoComando;
  /** Muestra un aviso en la esquina inferior (escuchando, error del micrófono, etc.). */
  avisar: (texto: string, severidad?: SeveridadAviso) => void;
  cerrarAviso: () => void;
}

export const ComandoVozContext = createContext<ComandoVozContextValue | null>(null);
