import axios from 'axios';
import type { ErrorApi } from '../api/types';

/**
 * Convierte cualquier error (de axios o no) en un mensaje y un mapa de errores por campo,
 * usando el formato ErrorApi del backend.
 */
export function obtenerError(error: unknown): { mensaje: string; campos: Record<string, string> } {
  if (axios.isAxiosError<ErrorApi>(error)) {
    if (!error.response) {
      return { mensaje: 'No se pudo conectar con el servidor', campos: {} };
    }
    return {
      mensaje: error.response.data?.message ?? 'Ocurrió un error inesperado',
      campos: error.response.data?.campos ?? {},
    };
  }
  return { mensaje: 'Ocurrió un error inesperado', campos: {} };
}
