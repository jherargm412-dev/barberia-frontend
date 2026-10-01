// API pública del módulo gestion empleados (backend: modulos.gestion_empleados).
// Exporta aquí las páginas y lo que otros módulos necesiten. Estructura: ver ../README.md

// CU17 Gestionar Barbero (Empleado)
export { default as EmpleadosListPage } from './pages/gestionar_barberos/EmpleadosListPage';
export { default as EmpleadoCrearPage } from './pages/gestionar_barberos/EmpleadoCrearPage';
export { default as EmpleadoEditarPage } from './pages/gestionar_barberos/EmpleadoEditarPage';
export { PERMISOS_EMPLEADOS } from './constants/gestionar_barberos';
