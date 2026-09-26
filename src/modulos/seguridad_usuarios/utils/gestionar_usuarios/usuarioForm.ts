import { ROLES_EMPLEADO } from '../../constants/gestionar_usuarios';
import type { ActualizarUsuarioRequest, TipoContrato, UsuarioDetalle } from '../../types/gestionar_usuarios';

/** Valores del formulario tal como los maneja React (todo como texto para los inputs). */
export interface UsuarioFormValores {
  nombre: string;
  correo: string;
  contrasena: string;
  telefono: string;
  fechaNacimiento: string;
  roles: string[];
  tipoContrato: TipoContrato | '';
  especialidad: string;
  turnoId: number | '';
}

export type ErroresFormulario = Partial<Record<keyof UsuarioFormValores, string>>;

export function esEmpleado(roles: string[]) {
  return roles.some((rol) => ROLES_EMPLEADO.includes(rol));
}

/**
 * Mismas reglas que las anotaciones de CrearUsuarioRequest / ActualizarUsuarioRequest.
 * Devuelve un objeto vacío si todo está bien.
 */
export function validarUsuario(v: UsuarioFormValores, pedirContrasena: boolean): ErroresFormulario {
  const errores: ErroresFormulario = {};

  if (!v.nombre.trim()) errores.nombre = 'El nombre es obligatorio';
  else if (v.nombre.length > 80) errores.nombre = 'Máximo 80 caracteres';

  if (!v.correo.trim()) errores.correo = 'El correo es obligatorio';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.correo)) errores.correo = 'Formato de correo no válido';
  else if (v.correo.length > 100) errores.correo = 'Máximo 100 caracteres';

  if (pedirContrasena && !v.contrasena) errores.contrasena = 'La contraseña es obligatoria';

  if (!/^[0-9+\s-]{0,15}$/.test(v.telefono)) {
    errores.telefono = 'Solo dígitos, +, espacios y guiones (máximo 15)';
  }

  if (v.fechaNacimiento && new Date(v.fechaNacimiento) > new Date()) {
    errores.fechaNacimiento = 'No puede ser una fecha futura';
  }

  if (v.roles.length === 0) errores.roles = 'Debe asignar al menos un rol';

  if (esEmpleado(v.roles)) {
    if (!v.tipoContrato) errores.tipoContrato = 'Obligatorio para roles de empleado';
    if (v.especialidad.length > 80) errores.especialidad = 'Máximo 80 caracteres';
  }

  return errores;
}

/**
 * Traduce los nombres de campo del backend (ej: "empleado.tipoContrato")
 * a los del formulario (ej: "tipoContrato").
 */
export function mapearErroresBackend(campos: Record<string, string>): ErroresFormulario {
  const errores: ErroresFormulario = {};
  for (const [campo, mensaje] of Object.entries(campos)) {
    const clave = campo.replace('empleado.', '') as keyof UsuarioFormValores;
    errores[clave] = mensaje;
  }
  return errores;
}

export const VALORES_VACIOS: UsuarioFormValores = {
  nombre: '',
  correo: '',
  contrasena: '',
  telefono: '',
  fechaNacimiento: '',
  roles: [],
  tipoContrato: '',
  especialidad: '',
  turnoId: '',
};

/** Llena el formulario de edición a partir del usuario que devuelve el backend. */
export function valoresDesdeUsuario(u: UsuarioDetalle): UsuarioFormValores {
  return {
    nombre: u.nombre,
    correo: u.correo,
    contrasena: '',
    telefono: u.telefono ?? '',
    fechaNacimiento: u.fechaNacimiento ?? '',
    roles: u.roles.map((r) => r.nombre),
    tipoContrato: u.empleado?.tipoContrato ?? '',
    especialidad: u.empleado?.especialidad ?? '',
    turnoId: u.empleado?.turno?.idTurno ?? '',
  };
}

/** Convierte los valores del formulario al body que espera el backend (vacío → null). */
export function construirRequest(v: UsuarioFormValores): ActualizarUsuarioRequest {
  return {
    nombre: v.nombre.trim(),
    correo: v.correo.trim(),
    telefono: v.telefono.trim() || null,
    fechaNacimiento: v.fechaNacimiento || null,
    roles: v.roles,
    empleado:
      esEmpleado(v.roles) && v.tipoContrato
        ? {
            tipoContrato: v.tipoContrato,
            especialidad: v.especialidad.trim() || null,
            turnoId: v.turnoId === '' ? null : v.turnoId,
          }
        : null,
  };
}
