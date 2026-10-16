// Tipos de CU13 Consultar Servicios (copiados de ServicioCatalogo.java).

/** Un servicio del catálogo público. {@code reservable}: algún barbero activo con horario lo presta. */
export interface ServicioCatalogo {
  idServicio: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  reservable: boolean;
}

/** Filtros del paso 2 tal como los escribe el usuario (texto; vacío = sin filtro). */
export interface FiltrosCatalogo {
  q: string;
  precioMin: string;
  precioMax: string;
}
