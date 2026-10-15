// Política de contraseña (05 §5.1). Es la misma regla que valida el backend en
// PoliticaContrasenaSegura.java: si se cambia una, hay que cambiar la otra.

export interface RequisitoContrasena {
  texto: string;
  cumple: (contrasena: string) => boolean;
}

export const REQUISITOS_CONTRASENA: RequisitoContrasena[] = [
  { texto: 'Al menos 8 caracteres', cumple: (c) => c.length >= 8 },
  { texto: 'Una letra mayúscula', cumple: (c) => /\p{Lu}/u.test(c) },
  { texto: 'Una letra minúscula', cumple: (c) => /\p{Ll}/u.test(c) },
  { texto: 'Un número', cumple: (c) => /\d/.test(c) },
  // Especial: cualquier carácter que no sea letra, número ni espacio (! @ # $ % & * …).
  { texto: 'Un carácter especial (! @ # $ % & *)', cumple: (c) => /[^\p{L}\p{N}\s]/u.test(c) },
];

/** Requisitos que la contraseña todavía no cumple (vacío = válida). */
export function requisitosFaltantes(contrasena: string): string[] {
  return REQUISITOS_CONTRASENA.filter((r) => !r.cumple(contrasena)).map((r) => r.texto);
}

export function cumplePoliticaContrasena(contrasena: string): boolean {
  return requisitosFaltantes(contrasena).length === 0;
}

/** Mensaje del campo cuando no cumple; el detalle lo muestra RequisitosContrasena debajo. */
export const MENSAJE_POLITICA_CONTRASENA = 'No cumple los requisitos de seguridad';
