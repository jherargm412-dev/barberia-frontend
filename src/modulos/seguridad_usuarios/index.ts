// API pública del módulo seguridad_usuarios: el resto de la app importa SOLO desde aquí.

// CU02 Iniciar Sesión
export { default as AuthProvider } from './context/iniciar_sesion/AuthProvider';
export { useAuth } from './context/iniciar_sesion/useAuth';
export { default as RutaProtegida } from './components/iniciar_sesion/RutaProtegida';
export { default as RequierePermiso } from './components/iniciar_sesion/RequierePermiso';
export { default as LoginPage } from './pages/iniciar_sesion/LoginPage';
export type { UsuarioSesion } from './types/iniciar_sesion';

// CU01 Gestionar Usuarios
export { default as UsuariosListPage } from './pages/gestionar_usuarios/UsuariosListPage';
export { default as UsuarioCrearPage } from './pages/gestionar_usuarios/UsuarioCrearPage';
export { default as UsuarioEditarPage } from './pages/gestionar_usuarios/UsuarioEditarPage';
export { default as UsuarioDetallePage } from './pages/gestionar_usuarios/UsuarioDetallePage';
export { PERMISOS as PERMISOS_USUARIOS } from './constants/gestionar_usuarios';

// CU05 Consultar Bitácora
export { default as BitacoraListPage } from './pages/consultar_bitacora/BitacoraListPage';
export { PERMISOS_BITACORA, MENSAJES_BITACORA } from './constants/consultar_bitacora';
