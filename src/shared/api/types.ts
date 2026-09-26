// Tipos genéricos que devuelve el backend (copiados de los records de Java).

/** Formato estándar de error (ErrorApi.java). */
export interface ErrorApi {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  /** Errores por campo, ej: { correo: "El campo correo no tiene un formato válido" } */
  campos?: Record<string, string>;
}

/** Respuesta paginada (PaginaRespuesta.java). */
export interface PaginaRespuesta<T> {
  contenido: T[];
  pagina: number;
  tamano: number;
  totalElementos: number;
  totalPaginas: number;
}
