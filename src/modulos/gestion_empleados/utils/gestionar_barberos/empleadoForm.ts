import type {
  ActualizarEmpleadoRequest,
  Empleado,
  RegistrarEmpleadoRequest,
  TipoContrato,
} from '../../types/gestionar_barberos';

/** Valores del formulario tal como los maneja React (todo como texto para los inputs). */
export interface EmpleadoFormValores {
  nombre: string;
  correo: string;
  contrasena: string;
  telefono: string;
  fechaNacimiento: string;
  rol: string;
  especialidad: string;
  tipoContrato: TipoContrato | '';
  turnoId: number | '';
}

export type ErroresFormulario = Partial<Record<keyof EmpleadoFormValores, string>>;

export const VALORES_VACIOS: EmpleadoFormValores = {
  nombre: '',
  correo: '',
  contrasena: '',
  telefono: '',
  fechaNacimiento: '',
  rol: 'Barbero',
  especialidad: '',
  tipoContrato: '',
  turnoId: '',
};

// Igual que RegistrarEmpleadoRequest.java: + opcional, empieza y termina en dígito; mínimo 7 dígitos.
const TELEFONO = /^\+?[0-9][0-9\s-]*[0-9]$/;

/** Mismas reglas que el backend. {@code registrar} = pedir contraseña. */
export function validarEmpleado(v: EmpleadoFormValores, registrar: boolean): ErroresFormulario {
  const errores: ErroresFormulario = {};
  if (!v.nombre.trim()) errores.nombre = 'El nombre es obligatorio';
  else if (v.nombre.trim().length > 80) errores.nombre = 'Máximo 80 caracteres';

  if (!v.correo.trim()) errores.correo = 'El correo es obligatorio';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.correo.trim())) errores.correo = 'Formato de correo no válido';

  if (registrar && !v.contrasena.trim()) errores.contrasena = 'La contraseña es obligatoria';

  const telefono = v.telefono.trim();
  if (telefono) {
    if (telefono.length > 15) errores.telefono = 'Máximo 15 caracteres';
    else if (!TELEFONO.test(telefono)) errores.telefono = 'Solo dígitos, espacios, guiones y un + inicial';
    else if (telefono.replace(/\D/g, '').length < 7) errores.telefono = 'Debe tener al menos 7 dígitos';
  }

  const hoy = new Date().toLocaleDateString('en-CA'); // "YYYY-MM-DD" sin zona horaria
  if (v.fechaNacimiento && v.fechaNacimiento > hoy) errores.fechaNacimiento = 'No puede ser una fecha futura';

  if (v.especialidad.trim().length > 80) errores.especialidad = 'Máximo 80 caracteres';
  if (!v.tipoContrato) errores.tipoContrato = 'El tipo de contrato es obligatorio';
  return errores;
}

export function valoresDesdeEmpleado(e: Empleado): EmpleadoFormValores {
  return {
    nombre: e.nombre,
    correo: e.correo,
    contrasena: '',
    telefono: e.telefono ?? '',
    fechaNacimiento: e.fechaNacimiento ?? '',
    rol: e.roles[0] ?? '',
    especialidad: e.especialidad ?? '',
    tipoContrato: e.tipoContrato,
    turnoId: e.turno?.idTurno ?? '',
  };
}

export function construirActualizar(v: EmpleadoFormValores): ActualizarEmpleadoRequest {
  return {
    nombre: v.nombre.trim(),
    correo: v.correo.trim(),
    telefono: v.telefono.trim() || null,
    fechaNacimiento: v.fechaNacimiento || null,
    especialidad: v.especialidad.trim() || null,
    tipoContrato: v.tipoContrato as TipoContrato,
    turnoId: v.turnoId === '' ? null : v.turnoId,
  };
}

export function construirRegistrar(v: EmpleadoFormValores): RegistrarEmpleadoRequest {
  return { ...construirActualizar(v), contrasena: v.contrasena, rol: v.rol };
}

/** "09:00:00" → "09:00" */
export function formatearHora(hora: string) {
  return hora.slice(0, 5);
}
