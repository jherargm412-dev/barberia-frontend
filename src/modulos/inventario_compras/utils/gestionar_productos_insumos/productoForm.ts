import { MENSAJES, TIPOS_AJUSTE, TIPOS_PRODUCTO } from '../../constants/gestionar_productos_insumos';
import type { Producto, ProductoRequest, TipoAjusteStock, TipoProducto } from '../../types/gestionar_productos_insumos';

/** Valores del formulario tal como los maneja React (todo como texto para los inputs). */
export interface ProductoFormValores {
  tipo: TipoProducto | '';
  nombre: string;
  descripcion: string;
  costo: string;
  precioVenta: string;
  stockMinimo: string;
}

export type ErroresFormulario = Partial<Record<keyof ProductoFormValores, string>>;

export const VALORES_VACIOS: ProductoFormValores = {
  tipo: '',
  nombre: '',
  descripcion: '',
  costo: '',
  precioVenta: '',
  stockMinimo: '',
};

// Monto positivo con máximo 2 decimales. Se acepta coma o punto: "30", "30.5", "30,50".
// Hasta 8 dígitos enteros porque en la BD es NUMERIC(10,2).
const MONTO = /^\d{1,8}([.,]\d{1,2})?$/;
// Stock: número entero mayor o igual a 0.
const ENTERO = /^\d{1,9}$/;

/** "30,5" → 30.5 */
function aNumero(texto: string) {
  return Number(texto.trim().replace(',', '.'));
}

/**
 * Mismas reglas que el backend (ProductoService.validar), en el mismo orden:
 * primero campos vacíos (6a) y después valores no válidos.
 * El nombre repetido (6b) solo lo puede saber el backend.
 * Devuelve el mensaje general y los errores de cada campo.
 */
export function validarProducto(v: ProductoFormValores): { mensaje: string; errores: ErroresFormulario } {
  const errores: ErroresFormulario = {};
  let hayVacios = false;
  let hayInvalidos = false;

  if (!v.tipo) {
    errores.tipo = 'Obligatorio';
    hayVacios = true;
  }

  if (!v.nombre.trim()) {
    errores.nombre = 'Obligatorio';
    hayVacios = true;
  } else if (v.nombre.trim().length > 80) {
    errores.nombre = 'Máximo 80 caracteres';
    hayInvalidos = true;
  }

  if (v.descripcion.trim().length > 200) {
    errores.descripcion = 'Máximo 200 caracteres';
    hayInvalidos = true;
  }

  if (!v.costo.trim()) {
    errores.costo = 'Obligatorio';
    hayVacios = true;
  } else if (!MONTO.test(v.costo.trim())) {
    errores.costo = 'Debe ser un número mayor o igual a 0, con máximo 2 decimales';
    hayInvalidos = true;
  }

  // El precio de venta solo es obligatorio para productos de venta; un insumo no se vende.
  if (!v.precioVenta.trim()) {
    if (v.tipo !== 'INSUMO') {
      errores.precioVenta = 'Obligatorio';
      hayVacios = true;
    }
  } else if (!MONTO.test(v.precioVenta.trim())) {
    errores.precioVenta = 'Debe ser un número mayor o igual a 0, con máximo 2 decimales';
    hayInvalidos = true;
  }

  if (!v.stockMinimo.trim()) {
    errores.stockMinimo = 'Obligatorio';
    hayVacios = true;
  } else if (!ENTERO.test(v.stockMinimo.trim())) {
    errores.stockMinimo = 'Debe ser un número entero mayor o igual a 0';
    hayInvalidos = true;
  }

  let mensaje = '';
  if (hayVacios) mensaje = MENSAJES.CAMPOS_VACIOS;
  else if (hayInvalidos) mensaje = MENSAJES.VALOR_INVALIDO;
  return { mensaje, errores };
}

/** Llena el formulario de modificar con los datos actuales del ítem. */
export function valoresDesdeProducto(p: Producto): ProductoFormValores {
  return {
    tipo: p.tipo,
    nombre: p.nombre,
    descripcion: p.descripcion ?? '',
    costo: p.costo.toFixed(2),
    precioVenta: p.precioVenta.toFixed(2),
    stockMinimo: String(p.stockMinimo),
  };
}

/** Convierte los valores del formulario al body que espera el backend (vacío → null). */
export function construirRequest(v: ProductoFormValores): ProductoRequest {
  return {
    tipo: v.tipo as TipoProducto, // validarProducto ya comprobó que no está vacío
    nombre: v.nombre.trim(),
    descripcion: v.descripcion.trim() || null,
    costo: aNumero(v.costo),
    precioVenta: v.precioVenta.trim() ? aNumero(v.precioVenta) : null,
    stockMinimo: Number(v.stockMinimo.trim()),
  };
}

/** 30 → "Bs 30.00" */
export function formatearMonto(monto: number) {
  return `Bs ${monto.toFixed(2)}`;
}

/** 'VENTA' → "Producto" */
export function etiquetaTipo(tipo: TipoProducto) {
  return TIPOS_PRODUCTO.find((t) => t.valor === tipo)?.etiqueta ?? tipo;
}

/** Alerta de stock mínimo: el stock actual llegó o bajó del mínimo definido. */
export function stockBajo(p: Producto) {
  return p.stockActual <= p.stockMinimo;
}

/** 'PERDIDA' → { etiqueta: "Pérdida", suma: false } */
export function datosAjuste(tipo: TipoAjusteStock) {
  return TIPOS_AJUSTE.find((t) => t.valor === tipo) ?? { valor: tipo, etiqueta: tipo, suma: false };
}

/** "2026-10-29T12:04:31.37" → "29/10/2026 12:04" */
export function formatearFecha(fecha: string) {
  return new Date(fecha).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' });
}
