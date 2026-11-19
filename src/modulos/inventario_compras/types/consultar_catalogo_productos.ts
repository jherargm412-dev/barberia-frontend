// Tipos de CU23 Consultar Catálogo de Productos (copiados de ProductoCatalogo.java).

/** Un producto de venta del catálogo público. {@code disponible}: hay al menos una unidad en stock. */
export interface ProductoCatalogo {
  idProducto: number;
  nombre: string;
  descripcion: string | null;
  precioVenta: number;
  disponible: boolean;
  /** null = sin imagen; si no, va como ?v= en la URL de la imagen. */
  imagenVersion: number | null;
}

/** Filtros del paso 2 tal como los escribe el usuario (texto; vacío = sin filtro). */
export interface FiltrosCatalogoProductos {
  q: string;
  precioMin: string;
  precioMax: string;
}
