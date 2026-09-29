// API pública del módulo gestion empleados (backend: modulos.gestion_empleados).
// El resto de la app importa SOLO desde aquí. Estructura: ver ../README.md

// CU16 Gestionar Barberos
export { default as BarberosListPage } from './pages/gestionar_barberos/BarberosListPage';
export { default as BarberoCrearPage } from './pages/gestionar_barberos/BarberoCrearPage';
export { default as BarberoEditarPage } from './pages/gestionar_barberos/BarberoEditarPage';
export { PERMISOS as PERMISOS_BARBEROS } from './constants/gestionar_barberos';
