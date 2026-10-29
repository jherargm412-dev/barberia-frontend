// API pública del módulo inventario compras (backend: modulos.inventario_compras).
// Exporta aquí las páginas y lo que otros módulos necesiten. Estructura: ver ../README.md

// CU22 Gestionar Productos e Insumos
export { default as ProductosListPage } from './pages/gestionar_productos_insumos/ProductosListPage';
export { default as ProductoCrearPage } from './pages/gestionar_productos_insumos/ProductoCrearPage';
export { default as ProductoEditarPage } from './pages/gestionar_productos_insumos/ProductoEditarPage';
export { PERMISOS as PERMISOS_PRODUCTOS } from './constants/gestionar_productos_insumos';
