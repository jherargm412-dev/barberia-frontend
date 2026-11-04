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
  /** Promedio ponderado del costo; se recalcula al registrar compras (CU25). */
  costoPromedio: number;
  precioVenta: number;
  comisionUnitaria: number;
  stockMinimo: number;
  stockActual: number;
  activo: boolean;
}

/**
 * Body de POST /productos y PUT /productos/{id} (ProductoRequestDTO.java).
 * No lleva stock actual ni estado: el estado cambia por PATCH /estado.
 * stockInicial solo se usa al registrar (0 si no se envía); al modificar el backend lo ignora.
 * precioVenta es opcional para INSUMO (el backend guarda 0).
 */
export interface ProductoRequest {
  tipo: TipoProducto;
  nombre: string;
  descripcion: string | null;
  costo: number;
  precioVenta: number | null;
  comisionUnitaria: number;
  stockMinimo: number;
  stockInicial?: number;
}

/** Respuesta de POST, PUT y PATCH: "Ítem registrado", "Ítem actualizado", etc. + el producto. */
export interface RespuestaProducto {
  mensaje: string;
  producto: Producto;
}

/**
 * Motivo del ajuste de stock (CHECK de la tabla ajuste_stock en V19 y V27).
 * INVENTARIO_INICIAL lo registra el alta del ítem; los demás se eligen en "Ajustar stock".
 */
export type TipoAjusteStock = 'INVENTARIO_INICIAL' | 'SOBRANTE' | 'FALTANTE' | 'PERDIDA' | 'VENCIDO';

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
