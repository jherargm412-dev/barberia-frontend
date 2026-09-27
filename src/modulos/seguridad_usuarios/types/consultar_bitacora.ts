// Tipos de CU05 Consultar Bitácora (copiados de dto/consultar_bitacora del backend).

/** Usuario responsable de la acción (UsuarioBitacora.java). */
export interface UsuarioBitacora {
  idUsuario: number;
  nombre: string;
  correo: string;
}

/** Fila del listado (BitacoraResumen.java). No trae datos anteriores/nuevos ni IP. */
export interface BitacoraResumen {
  idBitacora: number;
  /** Fecha y hora de Bolivia, sin zona: "2026-09-10T11:30:00" */
  fechaHora: string;
  usuario: UsuarioBitacora;
  accion: string;
  detalle: string | null;
  tablaAfectada: string;
}

/** Detalle completo (BitacoraDetalle.java). null = sin datos (el frontend muestra "Sin datos"). */
export interface BitacoraDetalle extends BitacoraResumen {
  datosAnteriores: Record<string, unknown> | null;
  datosNuevos: Record<string, unknown> | null;
  ipOrigen: string | null;
}

/** Página del listado (PaginaBitacora.java): trae "No se encontraron registros" si está vacía. */
export interface PaginaBitacora {
  mensaje: string | null;
  contenido: BitacoraResumen[];
  pagina: number;
  tamano: number;
  totalElementos: number;
  totalPaginas: number;
}

/** Opciones de los filtros (OpcionesFiltroBitacora.java). */
export interface OpcionesFiltroBitacora {
  acciones: string[];
  tablas: string[];
}

/** Criterios del paso 4. Cadena vacía = sin ese filtro. */
export interface FiltrosBitacora {
  /** "AAAA-MM-DD" */
  fechaDesde: string;
  fechaHasta: string;
  usuarioId: number | '';
  accion: string;
  tablaAfectada: string;
}
