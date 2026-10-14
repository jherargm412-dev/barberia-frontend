// API pública del módulo seguridad_usuarios: el resto de la app importa SOLO desde aquí.

// CU02 Iniciar Sesión
export { default as AuthProvider } from './context/iniciar_sesion/AuthProvider';
export { useAuth } from './context/iniciar_sesion/useAuth';
export { default as RutaProtegida } from './components/iniciar_sesion/RutaProtegida';
export { default as RequierePermiso } from './components/iniciar_sesion/RequierePermiso';
export { default as LoginPage } from './pages/iniciar_sesion/LoginPage';
export type { UsuarioSesion } from './types/iniciar_sesion';

// CU02 (05 §5.5) Recuperar contraseña
export { default as RecuperarContrasenaPage } from './pages/recuperar_contrasena/RecuperarContrasenaPage';

// CU01/CU17 Activar cuenta desde la invitación por correo
export { default as ActivarCuentaPage } from './pages/aceptar_invitacion/ActivarCuentaPage';

// CU01 Gestionar Usuarios
export { default as UsuariosListPage } from './pages/gestionar_usuarios/UsuariosListPage';
export { default as UsuarioCrearPage } from './pages/gestionar_usuarios/UsuarioCrearPage';
export { default as UsuarioEditarPage } from './pages/gestionar_usuarios/UsuarioEditarPage';
export { default as UsuarioDetallePage } from './pages/gestionar_usuarios/UsuarioDetallePage';
export { PERMISOS as PERMISOS_USUARIOS } from './constants/gestionar_usuarios';

// CU03 Gestionar Roles y Permisos
export { default as RolesListPage } from './pages/gestionar_roles_permisos/RolesListPage';
export { default as RolCrearPage } from './pages/gestionar_roles_permisos/RolCrearPage';
export { default as RolEditarPage } from './pages/gestionar_roles_permisos/RolEditarPage';
export { PERMISOS_ROLES } from './constants/gestionar_roles_permisos';

// CU04 Configurar Perfil Personal
export { default as PerfilPage } from './pages/configurar_perfil/PerfilPage';
export { PERMISOS_PERFIL } from './constants/configurar_perfil';

// CU05 Consultar Bitácora
export { default as BitacoraListPage } from './pages/consultar_bitacora/BitacoraListPage';
export { PERMISOS_BITACORA, MENSAJES_BITACORA } from './constants/consultar_bitacora';
