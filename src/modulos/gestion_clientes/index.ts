// API pública del módulo gestion clientes (backend: modulos.gestion_clientes).
// Exporta aquí las páginas y lo que otros módulos necesiten. Estructura: ver ../README.md
// Punto de entrada del módulo: las rutas usan estas páginas y permisos.
export { default as ClientesListPage } from './pages/gestionar_clientes/ClientesListPage';
export { default as ClienteCrearPage } from './pages/gestionar_clientes/ClienteCrearPage';
export { default as ClienteEditarPage } from './pages/gestionar_clientes/ClienteEditarPage';
export { default as ClienteDetallePage } from './pages/gestionar_clientes/ClienteDetallePage';
export { PERMISOS_CLIENTES } from './constants/gestionar_clientes';
// Para CU11 (Gestionar Cita): buscar al cliente o registrar un walk-in desde el formulario de la cita.
export { listarClientes, registrarCliente } from './api/gestionar_clientes/clientesApi';
export type { Cliente } from './types/gestionar_clientes';
