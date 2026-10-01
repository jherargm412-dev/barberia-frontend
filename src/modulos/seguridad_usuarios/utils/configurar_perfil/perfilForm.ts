import { cumplePoliticaContrasena, MENSAJE_POLITICA_CONTRASENA } from '../../../../shared/utils/politicaContrasena';
import type { ActualizarPerfilRequest, Perfil } from '../../types/configurar_perfil';

/** Valores del formulario de datos personales (todo como texto para los inputs). */
export interface DatosFormValores {
  nombre: string;
  telefono: string;
  fechaNacimiento: string;
}

export type ErroresDatos = Partial<Record<keyof DatosFormValores, string>>;

/** Valores del formulario de cambio de contraseña. */
export interface ContrasenaFormValores {
  contrasenaActual: string;
  contrasenaNueva: string;
  confirmacion: string;
}

export type ErroresContrasena = Partial<Record<keyof ContrasenaFormValores, string>>;

export const CONTRASENA_VACIA: ContrasenaFormValores = { contrasenaActual: '', contrasenaNueva: '', confirmacion: '' };

// Igual que ActualizarPerfilRequest.java: + opcional, empieza y termina en dígito; mínimo 7 dígitos.
const TELEFONO = /^\+?[0-9][0-9\s-]*[0-9]$/;

/** Mismas reglas que el backend (ActualizarPerfilRequest + PerfilService). */
export function validarDatos(v: DatosFormValores): ErroresDatos {
  const errores: ErroresDatos = {};
  if (!v.nombre.trim()) errores.nombre = 'El nombre es obligatorio';
  else if (v.nombre.trim().length > 80) errores.nombre = 'Máximo 80 caracteres';

  const telefono = v.telefono.trim();
  if (telefono) {
    if (telefono.length > 15) errores.telefono = 'Máximo 15 caracteres';
    else if (!TELEFONO.test(telefono)) errores.telefono = 'Solo dígitos, espacios, guiones y un + inicial';
    else if (telefono.replace(/\D/g, '').length < 7) errores.telefono = 'Debe tener al menos 7 dígitos';
  }

  // Comparamos texto "YYYY-MM-DD" para no depender de la zona horaria del navegador.
  const hoy = new Date().toLocaleDateString('en-CA');
  if (v.fechaNacimiento && v.fechaNacimiento > hoy) errores.fechaNacimiento = 'No puede ser una fecha futura';
  return errores;
}

/** Validación local del cambio de contraseña; la contraseña actual solo la puede verificar el backend. */
export function validarContrasena(v: ContrasenaFormValores): ErroresContrasena {
  const errores: ErroresContrasena = {};
  if (!v.contrasenaActual) errores.contrasenaActual = 'Ingrese su contraseña actual';
  if (!v.contrasenaNueva.trim()) errores.contrasenaNueva = 'Ingrese la nueva contraseña';
  else if (!cumplePoliticaContrasena(v.contrasenaNueva)) errores.contrasenaNueva = MENSAJE_POLITICA_CONTRASENA;
  else if (v.contrasenaNueva === v.contrasenaActual) errores.contrasenaNueva = 'Debe ser distinta de la actual';
  if (!v.confirmacion) errores.confirmacion = 'Confirme la nueva contraseña';
  else if (v.confirmacion !== v.contrasenaNueva) errores.confirmacion = 'No coincide con la nueva contraseña';
  return errores;
}

export function valoresDesdePerfil(p: Perfil): DatosFormValores {
  return { nombre: p.nombre, telefono: p.telefono ?? '', fechaNacimiento: p.fechaNacimiento ?? '' };
}

/** Convierte los valores del formulario al body que espera el backend (vacío → null). */
export function construirRequest(v: DatosFormValores): ActualizarPerfilRequest {
  return {
    nombre: v.nombre.trim(),
    telefono: v.telefono.trim() || null,
    fechaNacimiento: v.fechaNacimiento || null,
  };
}

/** "09:00:00" → "09:00" */
export function formatearHora(hora: string | null) {
  return hora ? hora.slice(0, 5) : '';
}
