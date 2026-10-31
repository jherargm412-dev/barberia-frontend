// API pública del módulo ventas caja (backend: modulos.ventas_caja).
export { default as CajaPage } from './pages/gestionar_caja/CajaPage';
export { default as CajaHistorialPage } from './pages/gestionar_caja/CajaHistorialPage';
export { PERMISOS_CAJA } from './constants/gestionar_caja';
export { default as PasarelaPagoPage } from './pages/gestionar_pasarela_pago/PasarelaPagoPage';
export { PERMISOS_PASARELA } from './constants/gestionar_pasarela_pago';
export { default as RegistrarVentaPage } from './pages/registrar_venta/RegistrarVentaPage';
export { PERMISO_VENTA_REGISTRAR } from './constants/registrar_venta';
// Exporta aquí las páginas y lo que otros módulos necesiten. Estructura: ver ../README.md
export {};
