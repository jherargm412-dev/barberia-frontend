// Tipos de CU22 Gestionar Productos e Insumos (copiados de los DTOs del backend).

/** 'VENTA' = producto de venta directa, 'INSUMO' = consumo interno (CHECK de la tabla producto). */
export type TipoProducto = 'VENTA' | 'INSUMO';

/** Producto o insumo completo (ProductoResponseDTO.java). */
export interface Producto {
  idProducto: number;
  tipo: TipoProducto;
  nombre: string;
  descripcion: string | null;
  costo: number;
  precioVenta: number;
  stockMinimo: number;
  stockActual: number;
  activo: boolean;
}

/**
 * Body de POST /productos y PUT /productos/{id} (ProductoRequestDTO.java).
 * No lleva stock actual ni estado: el stock empieza en 0 y el estado cambia por PATCH /estado.
 * precioVenta es opcional para INSUMO (el backend guarda 0).
 */
export interface ProductoRequest {
  tipo: TipoProducto;
  nombre: string;
  descripcion: string | null;
  costo: number;
  precioVenta: number | null;
  stockMinimo: number;
}

/** Respuesta de POST, PUT y PATCH: "Ítem registrado", "Ítem actualizado", etc. + el producto. */
export interface RespuestaProducto {
  mensaje: string;
  producto: Producto;
}

/** Motivo del ajuste manual de stock (CHECK de la tabla ajuste_stock en V19). */
export type TipoAjusteStock = 'INVENTARIO_INICIAL' | 'PERDIDA' | 'VENCIDO';

/** Body de POST /productos/{id}/ajustes (AjusteStockRequestDTO.java). La cantidad siempre es positiva. */
export interface AjusteStockRequest {
  tipo: TipoAjusteStock;
  cantidad: number;
  observacion: string | null;
}

/** Un ajuste del historial (AjusteStockResponseDTO.java). */
export interface AjusteStock {
  idAjusteStock: number;
  tipo: TipoAjusteStock;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  observacion: string | null;
  usuarioId: number;
  fecha: string;
}
