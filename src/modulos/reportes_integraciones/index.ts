// API pública del módulo reportes_integraciones (backend: modulos.reportes_integraciones).
// Paquete 7 del diagrama de paquetes. Exporta aquí las páginas y lo que otros módulos necesiten.
// Estructura: ver ../README.md

// CU27 Generar reportes
export { default as ReportesPage } from './pages/generar_reportes/ReportesPage';
export { PERMISO_REPORTES } from './constants/generar_reportes';

// CU28 Comando de voz
export { default as ComandosVozPage } from './pages/comando_voz/ComandosVozPage';
export { default as BotonComandoVoz } from './components/comando_voz/BotonComandoVoz';
export { default as ComandoVozProvider } from './context/comando_voz/ComandoVozProvider';
export type { EstadoNavegacionVoz } from './context/comando_voz/ComandoVozProvider';
export { PERMISO_VOZ } from './constants/comando_voz';

// CU29 Gestionar pasarela y métodos de pago
export { default as PasarelaPagoPage } from './pages/gestionar_pasarela_pago/PasarelaPagoPage';
export { PERMISOS_PASARELA } from './constants/gestionar_pasarela_pago';
// Para CU20 (Registrar venta): cobro con tarjeta por Stripe.
export { default as CobroStripeDialog } from './components/gestionar_pasarela_pago/CobroStripeDialog';
export type { FuncionesCobro } from './components/gestionar_pasarela_pago/CobroStripeDialog';
export type { CobroStripeIniciado, CobroTarjeta, EstadoStripe } from './types/gestionar_pasarela_pago';
