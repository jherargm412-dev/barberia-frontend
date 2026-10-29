import type { TipoAjusteStock, TipoProducto } from '../types/gestionar_productos_insumos';

/** En la BD el tipo es VENTA o INSUMO; en pantalla se muestra con el vocabulario del CU22. */
export const TIPOS_PRODUCTO: { valor: TipoProducto; etiqueta: string }[] = [
  { valor: 'VENTA', etiqueta: 'Producto' },
  { valor: 'INSUMO', etiqueta: 'Insumo' },
];

/**
 * Motivos del ajuste manual de stock. El inventario inicial suma (una sola vez por ítem);
 * pérdida y vencido restan. Las compras y ventas no pasan por aquí.
 */
export const TIPOS_AJUSTE: { valor: TipoAjusteStock; etiqueta: string; suma: boolean }[] = [
  { valor: 'INVENTARIO_INICIAL', etiqueta: 'Inventario inicial', suma: true },
  { valor: 'PERDIDA', etiqueta: 'Pérdida', suma: false },
  { valor: 'VENCIDO', etiqueta: 'Vencido', suma: false },
];

/** Permisos del backend que usa este caso de uso. */
export const PERMISOS = {
  GESTIONAR: 'PRODUCTO_GESTIONAR',
};

/** Mensajes exactos del CU22 (flujo 6a), los mismos que devuelve el backend. */
export const MENSAJES = {
  CAMPOS_VACIOS: 'Ingrese los campos obligatorios',
  VALOR_INVALIDO: 'Revise los datos ingresados',
};
