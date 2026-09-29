import { MENSAJES } from '../../constants/gestionar_barberos';
import type { Barbero, BarberoRequest, TipoContrato, TurnoOpcion } from '../../types/gestionar_barberos';

/** Valores del formulario tal como los maneja React (texto para los inputs). */
export interface BarberoFormValores {
  nombre: string;
  correo: string;
  contrasena: string;
  telefono: string;
  fechaNacimiento: string;
  tipoContrato: TipoContrato | '';
  especialidad: string;
  turnoId: number | '';
  /** Especialidades técnicas autorizadas (paso 5). */
  servicioIds: number[];
}

export type ErroresFormulario = Partial<Record<keyof BarberoFormValores, string>>;

export const VALORES_VACIOS: BarberoFormValores = {
  nombre: '',
  correo: '',
  contrasena: '',
  telefono: '',
  fechaNacimiento: '',
  tipoContrato: '',
  especialidad: '',
  turnoId: '',
  servicioIds: [],
};

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Mismo formato que CU01 para el teléfono: dígitos, +, espacios y guiones (máximo 15).
const TELEFONO = /^[0-9+\s-]{1,15}$/;

/**
 * Mismas reglas que el backend (CU16/04-reglas-negocio-CU16.md §1). Cualquier error muestra el mensaje
 * del flujo 6a. El correo repetido y los servicios inhabilitados solo los puede saber el backend.
 */
export function validarBarbero(
  v: BarberoFormValores,
  esRegistro: boolean,
): { mensaje: string; errores: ErroresFormulario } {
  const errores: ErroresFormulario = {};

  if (!v.nombre.trim()) errores.nombre = 'Obligatorio';
  else if (v.nombre.trim().length > 80) errores.nombre = 'Máximo 80 caracteres';

  const correo = v.correo.trim();
  if (!correo) errores.correo = 'Obligatorio';
  else if (correo.length > 100) errores.correo = 'Máximo 100 caracteres';
  else if (!CORREO.test(correo)) errores.correo = 'Formato no válido';

  if (esRegistro && !v.contrasena.trim()) errores.contrasena = 'Obligatorio';

  const telefono = v.telefono.trim();
  if (!telefono) errores.telefono = 'Obligatorio';
  else if (!TELEFONO.test(telefono) || !/\d/.test(telefono)) {
    errores.telefono = 'Solo dígitos, +, espacios y guiones (máximo 15)';
  }

  if (v.fechaNacimiento && new Date(v.fechaNacimiento) > new Date()) {
    errores.fechaNacimiento = 'No puede ser una fecha futura';
  }
  if (!v.tipoContrato) errores.tipoContrato = 'Obligatorio';
  if (v.especialidad.trim().length > 80) errores.especialidad = 'Máximo 80 caracteres';
  if (v.turnoId === '') errores.turnoId = 'Obligatorio';
  if (v.servicioIds.length === 0) errores.servicioIds = 'Debe marcar al menos una especialidad técnica';

  const mensaje = Object.keys(errores).length > 0 ? MENSAJES.ERROR_VALIDACION : '';
  return { mensaje, errores };
}

/**
 * Los detalles por campo del backend vienen en minúscula ("obligatorio", "ya registrado").
 * Se muestran con mayúscula inicial, igual que las validaciones locales.
 */
export function erroresDesdeBackend(campos: Record<string, string>): ErroresFormulario {
  const errores: ErroresFormulario = {};
  for (const [campo, detalle] of Object.entries(campos)) {
    errores[campo as keyof BarberoFormValores] = detalle.charAt(0).toUpperCase() + detalle.slice(1);
  }
  return errores;
}

/** 3a: llena el formulario con los datos actuales del barbero. */
export function valoresDesdeBarbero(b: Barbero): BarberoFormValores {
  return {
    nombre: b.nombre,
    correo: b.correo,
    contrasena: '',
    telefono: b.telefono ?? '',
    fechaNacimiento: b.fechaNacimiento ?? '',
    tipoContrato: b.tipoContrato,
    especialidad: b.especialidad ?? '',
    turnoId: b.turno?.idTurno ?? '',
    servicioIds: b.serviciosAutorizados.map((s) => s.idServicio),
  };
}

/** Convierte los valores del formulario al body del backend (vacío → null). Llamar después de validar. */
export function construirRequest(v: BarberoFormValores, esRegistro: boolean): BarberoRequest {
  return {
    nombre: v.nombre.trim(),
    correo: v.correo.trim(),
    ...(esRegistro ? { contrasena: v.contrasena } : {}),
    telefono: v.telefono.trim(),
    fechaNacimiento: v.fechaNacimiento || null,
    tipoContrato: v.tipoContrato as TipoContrato,
    especialidad: v.especialidad.trim() || null,
    turnoId: Number(v.turnoId),
    servicioIds: v.servicioIds,
  };
}

/** { nombre: "Mañana", horaEntrada: "09:00:00", horaSalida: "15:00:00" } → "Mañana (09:00 - 15:00)" */
export function formatearTurno(turno: TurnoOpcion) {
  return `${turno.nombre} (${turno.horaEntrada.slice(0, 5)} - ${turno.horaSalida.slice(0, 5)})`;
}
