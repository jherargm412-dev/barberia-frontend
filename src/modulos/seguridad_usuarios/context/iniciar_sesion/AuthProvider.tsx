import { useEffect, useState, type ReactNode } from 'react';
import { tokenStorage } from '../../../../shared/api/tokenStorage';
import * as authApi from '../../api/iniciar_sesion/authApi';
import type { LoginRequest, UsuarioSesion } from '../../types/iniciar_sesion';
import { AuthContext } from './AuthContext';

/** Envuelve la app y guarda quién está logueado. */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  // Solo hay algo que cargar si quedó un token guardado de una visita anterior.
  const [cargando, setCargando] = useState(() => tokenStorage.obtener() !== null);

  // Al abrir la app: si hay un token guardado, preguntamos al backend quién es el usuario.
  useEffect(() => {
    if (!tokenStorage.obtener()) return;
    authApi
      .obtenerSesion()
      .then(setUsuario)
      .catch(() => tokenStorage.borrar())
      .finally(() => setCargando(false));
  }, []);

  async function iniciarSesion(datos: LoginRequest) {
    const respuesta = await authApi.login(datos);
    tokenStorage.guardar(respuesta.token);
    setUsuario(respuesta.usuario);
  }

  async function cerrarSesion() {
    try {
      await authApi.logout();
    } finally {
      // Aunque falle la llamada, cerramos la sesión en el navegador.
      tokenStorage.borrar();
      setUsuario(null);
    }
  }

  function tienePermiso(permiso: string) {
    return usuario?.permisos.includes(permiso) ?? false;
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion, tienePermiso }}>
      {children}
    </AuthContext.Provider>
  );
}
