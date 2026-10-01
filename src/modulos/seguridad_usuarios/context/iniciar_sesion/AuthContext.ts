import { createContext } from 'react';
import type { LoginRequest, UsuarioSesion } from '../../types/iniciar_sesion';

/** Lo que cualquier componente puede leer de la sesión con useAuth(). */
export interface AuthContextValue {
  usuario: UsuarioSesion | null;
  /** true mientras se verifica el token guardado al abrir la app. */
  cargando: boolean;
  iniciarSesion: (datos: LoginRequest) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  tienePermiso: (permiso: string) => boolean;
  /** Vuelve a pedir /auth/me (ej. tras editar el perfil, para actualizar el nombre de la barra). */
  refrescarSesion: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
