// API pública del módulo servicios_reservas (backend: modulos.servicios_reservas).
// El resto de la app importa SOLO desde aquí. Estructura: ver ../README.md

// CU08 Gestionar Catálogo de Servicios
export { default as ServiciosListPage } from './pages/gestionar_catalogo_servicios/ServiciosListPage';
export { default as ServicioCrearPage } from './pages/gestionar_catalogo_servicios/ServicioCrearPage';
export { default as ServicioEditarPage } from './pages/gestionar_catalogo_servicios/ServicioEditarPage';
export { PERMISOS as PERMISOS_SERVICIOS } from './constants/gestionar_catalogo_servicios';
// Para reservas y ventas: servicios habilitados (sin porcentaje de comisión).
export { listarServiciosHabilitados } from './api/gestionar_catalogo_servicios/serviciosApi';
export type { ServicioResumen } from './types/gestionar_catalogo_servicios';
