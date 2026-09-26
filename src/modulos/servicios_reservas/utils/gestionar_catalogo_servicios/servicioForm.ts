import { MENSAJES } from '../../constants/gestionar_catalogo_servicios';
import type { Servicio, ServicioRequest } from '../../types/gestionar_catalogo_servicios';

/** Valores del formulario tal como los maneja React (todo como texto para los inputs). */
export interface ServicioFormValores {
  nombre: string;
  descripcion: string;
  precio: string;
  porcentajeComision: string;
}

export type ErroresFormulario = Partial<Record<keyof ServicioFormValores, string>>;

export const VALORES_VACIOS: ServicioFormValores = {
  nombre: '',
  descripcion: '',
  precio: '',
  porcentajeComision: '',
};

// Número positivo con máximo 2 decimales. Se acepta coma o punto: "30", "30.5", "30,50".
// El precio admite hasta 8 dígitos enteros porque en la BD es NUMERIC(10,2).
const PRECIO = /^\d{1,8}([.,]\d{1,2})?$/;
const PORCENTAJE = /^\d{1,3}([.,]\d{1,2})?$/;

/** "30,5" → 30.5 */
function aNumero(texto: string) {
  return Number(texto.trim().replace(',', '.'));
}

/**
 * Mismas reglas que el backend (04-reglas-negocio-CU08.md §1), en el mismo orden:
 * primero campos vacíos (8c) y después valores no válidos (8b).
 * El nombre repetido (8a) solo lo puede saber el backend.
 * Devuelve el mensaje general del CU y los errores de cada campo.
 */
export function validarServicio(v: ServicioFormValores): { mensaje: string; errores: ErroresFormulario } {
  const errores: ErroresFormulario = {};
  let hayVacios = false;
  let hayInvalidos = false;

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

  if (!v.precio.trim()) {
    errores.precio = 'Obligatorio';
    hayVacios = true;
  } else if (!PRECIO.test(v.precio.trim())) {
    errores.precio = 'Debe ser un número mayor o igual a 0, con máximo 2 decimales';
    hayInvalidos = true;
  }

  if (!v.porcentajeComision.trim()) {
    errores.porcentajeComision = 'Obligatorio';
    hayVacios = true;
  } else if (!PORCENTAJE.test(v.porcentajeComision.trim()) || aNumero(v.porcentajeComision) > 100) {
    errores.porcentajeComision = 'Debe estar entre 0 y 100, con máximo 2 decimales';
    hayInvalidos = true;
  }

  let mensaje = '';
  if (hayVacios) mensaje = MENSAJES.CAMPOS_VACIOS;
  else if (hayInvalidos) mensaje = MENSAJES.VALOR_INVALIDO;
  return { mensaje, errores };
}

/** Llena el formulario de modificar con los datos actuales del servicio (paso 5). */
export function valoresDesdeServicio(s: Servicio): ServicioFormValores {
  return {
    nombre: s.nombre,
    descripcion: s.descripcion ?? '',
    precio: s.precio.toFixed(2),
    porcentajeComision: s.porcentajeComision.toFixed(2),
  };
}

/** Convierte los valores del formulario al body que espera el backend (descripción vacía → null). */
export function construirRequest(v: ServicioFormValores): ServicioRequest {
  return {
    nombre: v.nombre.trim(),
    descripcion: v.descripcion.trim() || null,
    precio: aNumero(v.precio),
    porcentajeComision: aNumero(v.porcentajeComision),
  };
}

/** 30 → "Bs 30.00" */
export function formatearPrecio(precio: number) {
  return `Bs ${precio.toFixed(2)}`;
}

/** 40 → "40.00 %" */
export function formatearPorcentaje(porcentaje: number) {
  return `${porcentaje.toFixed(2)} %`;
}
