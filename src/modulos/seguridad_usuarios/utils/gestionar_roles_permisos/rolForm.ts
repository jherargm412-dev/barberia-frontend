import { GRUPOS_PERMISOS, MENSAJES } from '../../constants/gestionar_roles_permisos';
import type { Permiso, Rol, RolRequest } from '../../types/gestionar_roles_permisos';

/** Valores del formulario tal como los maneja React. */
export interface RolFormValores {
  nombre: string;
  descripcion: string;
  permisos: string[];
}

export type ErroresFormulario = Partial<Record<keyof RolFormValores, string>>;

export const VALORES_VACIOS: RolFormValores = { nombre: '', descripcion: '', permisos: [] };

/** Mismas reglas que el backend (RolService.validar). El nombre repetido solo lo sabe el backend. */
export function validarRol(v: RolFormValores): { mensaje: string; errores: ErroresFormulario } {
  const errores: ErroresFormulario = {};
  if (!v.nombre.trim()) {
    errores.nombre = 'Obligatorio';
    return { mensaje: MENSAJES.CAMPOS_VACIOS, errores };
  }
  if (v.nombre.trim().length > 30) errores.nombre = 'Máximo 30 caracteres';
  if (v.descripcion.trim().length > 150) errores.descripcion = 'Máximo 150 caracteres';
  return { mensaje: Object.keys(errores).length ? 'Revise los campos marcados' : '', errores };
}

/** Llena el formulario de editar con los datos actuales del rol. */
export function valoresDesdeRol(r: Rol): RolFormValores {
  return { nombre: r.nombre, descripcion: r.descripcion ?? '', permisos: r.permisos };
}

/** Clonar: mismos permisos y descripción, nombre sugerido "Copia de …" (recortado a 30). */
export function valoresClonados(r: Rol): RolFormValores {
  return { nombre: `Copia de ${r.nombre}`.slice(0, 30), descripcion: r.descripcion ?? '', permisos: r.permisos };
}

/** Convierte los valores del formulario al body que espera el backend (descripción vacía → null). */
export function construirRequest(v: RolFormValores): RolRequest {
  return { nombre: v.nombre.trim(), descripcion: v.descripcion.trim() || null, permisos: v.permisos };
}

/** Agrupa el catálogo según GRUPOS_PERMISOS; lo que no encaja va a "Otros". */
export function agruparPermisos(permisos: Permiso[]): { titulo: string; permisos: Permiso[] }[] {
  const grupos = GRUPOS_PERMISOS.map((g) => ({ titulo: g.titulo, prefijos: g.prefijos, permisos: [] as Permiso[] }));
  const otros: Permiso[] = [];
  for (const p of permisos) {
    const prefijo = p.accion.split('_')[0];
    const grupo = grupos.find((g) => g.prefijos.includes(prefijo));
    if (grupo) grupo.permisos.push(p);
    else otros.push(p);
  }
  const resultado = grupos.filter((g) => g.permisos.length > 0).map(({ titulo, permisos }) => ({ titulo, permisos }));
  if (otros.length > 0) resultado.push({ titulo: 'Otros', permisos: otros });
  return resultado;
}
