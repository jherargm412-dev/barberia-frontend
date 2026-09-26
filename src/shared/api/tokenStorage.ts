// Guarda el JWT en localStorage para que la sesión sobreviva al recargar la página.

const CLAVE = 'barberia_token';

export const tokenStorage = {
  obtener: () => localStorage.getItem(CLAVE),
  guardar: (token: string) => localStorage.setItem(CLAVE, token),
  borrar: () => localStorage.removeItem(CLAVE),
};
