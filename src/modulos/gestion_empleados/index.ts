// API pública del módulo gestion_empleados (backend: modulos.gestion_empleados).
// Exporta aquí las páginas y lo que otros módulos necesiten. Estructura: ver ../README.md

/* ============================================================
 * CU17 Gestionar Barbero (Empleado) — rama dev-jherar
 * ============================================================ */
export { default as EmpleadosListPage } from './pages/gestionar_barberos/EmpleadosListPage';
export { default as EmpleadoCrearPage } from './pages/gestionar_barberos/EmpleadoCrearPage';
export { default as EmpleadoEditarPage } from './pages/gestionar_barberos/EmpleadoEditarPage';
export { PERMISOS_EMPLEADOS } from './constants/gestionar_barberos';
// Para CU09 (horarios): catálogo de turnos del selector del formulario.
export { listarTurnos } from './api/gestionar_barberos/empleadosApi';
/* ============================================================
 * CU16 Gestionar Barberos — rama bastian
 * ============================================================ */
export { default as BarberosListPage } from './pages/gestionar_barberos/BarberosListPage';
export { default as BarberoCrearPage } from './pages/gestionar_barberos/BarberoCrearPage';
export { default as BarberoEditarPage } from './pages/gestionar_barberos/BarberoEditarPage';
export { PERMISOS as PERMISOS_BARBEROS } from './constants/gestionar_barberos';
// Para CU01 (usuarios): especialidades del barbero = servicios del catálogo que realiza.
export { default as EspecialidadesSelector } from './components/gestionar_barberos/EspecialidadesSelector';

/* ============================================================
 * CU18 Registrar Liquidación de Comisiones — rama dev-eduardo
 * ============================================================ */
export { default as LiquidacionPage } from './pages/liquidar_comisiones/LiquidacionPage';
export * from './api/liquidar_comisiones/liquidacionApi';
export * from './types/liquidar_comisiones';