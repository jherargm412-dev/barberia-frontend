import type { TipoAjusteStock, TipoProducto } from '../types/gestionar_productos_insumos';

/** En la BD el tipo es VENTA o INSUMO; en pantalla se muestra con el vocabulario del CU22. */
export const TIPOS_PRODUCTO: { valor: TipoProducto; etiqueta: string }[] = [
  { valor: 'VENTA', etiqueta: 'Producto' },
  { valor: 'INSUMO', etiqueta: 'Insumo' },
];

/**
 * Motivos del ajuste de stock, para el historial y el diálogo "Ajustar stock".
 * - manual: se puede elegir en el diálogo. El inventario inicial se carga al crear el ítem.
 * - motivo: exige observación (las correcciones de conteo deben explicar qué pasó).
 * Las compras y ventas no pasan por aquí.
 */
export const TIPOS_AJUSTE: { valor: TipoAjusteStock; etiqueta: string; suma: boolean; manual: boolean; motivo: boolean }[] = [
  { valor: 'INVENTARIO_INICIAL', etiqueta: 'Inventario inicial', suma: true, manual: false, motivo: false },
  { valor: 'SOBRANTE', etiqueta: 'Corrección: sobrante', suma: true, manual: true, motivo: true },
  { valor: 'FALTANTE', etiqueta: 'Corrección: faltante', suma: false, manual: true, motivo: true },
  { valor: 'PERDIDA', etiqueta: 'Pérdida', suma: false, manual: true, motivo: false },
  { valor: 'VENCIDO', etiqueta: 'Vencido', suma: false, manual: true, motivo: false },
];

/** Permisos del backend que usa este caso de uso. CONSULTAR (Recepcionista) solo ve el catálogo. */
export const PERMISOS = {
  GESTIONAR: 'PRODUCTO_GESTIONAR',
  CONSULTAR: 'PRODUCTO_CONSULTAR',
};

/** Mensajes exactos del CU22 (flujo 6a), los mismos que devuelve el backend. */
export const MENSAJES = {
  CAMPOS_VACIOS: 'Ingrese los campos obligatorios',
  VALOR_INVALIDO: 'Revise los datos ingresados',
};
