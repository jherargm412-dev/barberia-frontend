// API pública del módulo asistencia_usuario (backend: modulos.asistencia_usuario).
// CU28 Comando de Voz. Estructura: ver ../README.md
export { default as ComandosVozPage } from './pages/comando_voz/ComandosVozPage';
export { default as BotonComandoVoz } from './components/comando_voz/BotonComandoVoz';
export { default as ComandoVozProvider } from './context/comando_voz/ComandoVozProvider';
export type { EstadoNavegacionVoz } from './context/comando_voz/ComandoVozProvider';
export { PERMISO_VOZ } from './constants/comando_voz';
