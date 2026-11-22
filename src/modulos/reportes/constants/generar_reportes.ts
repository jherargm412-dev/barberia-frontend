// Generar Reportes: permiso, catálogo de los 8 reportes y opciones fijas de sus filtros.

/** Solo el Administrador tiene este permiso (migración V2 del backend). */
export const PERMISO_REPORTES = 'REPORTE_GENERAR';

/** Filtros propios de cada reporte (el periodo es común a todos). Los nombres son los que espera el backend. */
export type ClaveFiltro =
  | 'empleadoId'
  | 'productoId'
  | 'usuarioId'
  | 'tipoVenta'
  | 'tipoMovimiento'
  | 'medioPago'
  | 'tipoProducto'
  | 'origen'
  | 'estadoComision'
  | 'soloStockBajo'
  | 'soloConDiferencia'
  | 'minVisitas'
  | 'diasInactividad';

export interface DefinicionReporte {
  /** Va en la URL: /reportes?tipo=ventas y /api/v1/reportes/ventas */
  clave: string;
  grupo: 'Operativos' | 'Gestión';
  titulo: string;
  descripcion: string;
  filtros: ClaveFiltro[];
}

/** RF29 (operativos) y RF30 (gestión). El orden es el de las tarjetas y las pestañas. */
export const REPORTES: DefinicionReporte[] = [
  {
    clave: 'ventas', grupo: 'Operativos', titulo: 'Ventas',
    descripcion: 'Servicios y productos vendidos por periodo y barbero',
    filtros: ['empleadoId', 'tipoVenta'],
  },
  {
    clave: 'ingresos-egresos', grupo: 'Operativos', titulo: 'Ingresos y egresos',
    descripcion: 'Movimientos de caja por tipo, concepto y medio de pago',
    filtros: ['tipoMovimiento', 'medioPago'],
  },
  {
    clave: 'cierres-caja', grupo: 'Operativos', titulo: 'Cierres de caja',
    descripcion: 'Arqueo de cada caja, resumen diario y acumulado mensual',
    filtros: ['usuarioId', 'soloConDiferencia'],
  },
  {
    clave: 'existencias', grupo: 'Operativos', titulo: 'Existencias',
    descripcion: 'Stock actual, valor del inventario y unidades que entraron y salieron',
    filtros: ['tipoProducto', 'soloStockBajo'],
  },
  {
    clave: 'movimientos-inventario', grupo: 'Operativos', titulo: 'Movimientos de inventario',
    descripcion: 'Compras, ventas, ajustes y movimientos que cambiaron el stock',
    filtros: ['productoId', 'tipoProducto', 'origen'],
  },
  {
    clave: 'comisiones', grupo: 'Gestión', titulo: 'Comisiones',
    descripcion: 'Comisiones por servicios y productos de cada barbero, liquidadas y pendientes',
    filtros: ['empleadoId', 'estadoComision'],
  },
  {
    clave: 'desempeno-barberos', grupo: 'Gestión', titulo: 'Desempeño de barberos',
    descripcion: 'Servicios atendidos por barbero, ingresos que generaron y asistencia de sus citas',
    filtros: ['empleadoId'],
  },
  {
    clave: 'visitas-clientes', grupo: 'Gestión', titulo: 'Visitas por cliente',
    descripcion: 'Cuántas veces vino cada cliente y quiénes dejaron de venir',
    filtros: ['minVisitas', 'diasInactividad'],
  },
];

export const GRUPOS_REPORTES = [
  { nombre: 'Operativos' as const, detalle: 'Ventas, caja e inventario' },
  { nombre: 'Gestión' as const, detalle: 'Barberos y clientes' },
];

export const PERIODOS = [
  { valor: 'DIARIO', etiqueta: 'Diario' },
  { valor: 'SEMANAL', etiqueta: 'Semanal' },
  { valor: 'MENSUAL', etiqueta: 'Mensual' },
  { valor: 'RANGO', etiqueta: 'Rango de fechas' },
];

/** Opciones de los filtros de lista fija. El valor vacío ('') es "Todos". */
export const OPCIONES_FIJAS: Partial<Record<ClaveFiltro, { valor: string; etiqueta: string }[]>> = {
  tipoVenta: [
    { valor: '', etiqueta: 'Servicios y productos' },
    { valor: 'SERVICIOS', etiqueta: 'Solo servicios' },
    { valor: 'PRODUCTOS', etiqueta: 'Solo productos' },
  ],
  tipoMovimiento: [
    { valor: '', etiqueta: 'Ingresos y egresos' },
    { valor: 'INGRESO', etiqueta: 'Solo ingresos' },
    { valor: 'EGRESO', etiqueta: 'Solo egresos' },
  ],
  medioPago: [
    { valor: '', etiqueta: 'Todos' },
    { valor: 'EFECTIVO', etiqueta: 'Efectivo' },
    { valor: 'QR', etiqueta: 'QR' },
    { valor: 'TARJETA', etiqueta: 'Tarjeta' },
  ],
  tipoProducto: [
    { valor: '', etiqueta: 'Productos de venta e insumos' },
    { valor: 'VENTA', etiqueta: 'Productos de venta' },
    { valor: 'INSUMO', etiqueta: 'Insumos' },
  ],
  origen: [
    { valor: '', etiqueta: 'Todos' },
    { valor: 'COMPRA', etiqueta: 'Compras' },
    { valor: 'VENTA', etiqueta: 'Ventas' },
    { valor: 'AJUSTE', etiqueta: 'Ajustes de stock' },
    { valor: 'MOVIMIENTO', etiqueta: 'Movimientos manuales' },
  ],
  estadoComision: [
    { valor: '', etiqueta: 'Liquidadas y pendientes' },
    { valor: 'PENDIENTE', etiqueta: 'Solo pendientes' },
    { valor: 'LIQUIDADA', etiqueta: 'Solo liquidadas' },
  ],
};

/** Etiqueta de cada filtro en el formulario. */
export const ETIQUETAS_FILTRO: Record<ClaveFiltro, string> = {
  empleadoId: 'Barbero',
  productoId: 'Ítem',
  usuarioId: 'Cerrada por',
  tipoVenta: 'Tipo',
  tipoMovimiento: 'Tipo',
  medioPago: 'Medio de pago',
  tipoProducto: 'Tipo de ítem',
  origen: 'Origen',
  estadoComision: 'Estado',
  soloStockBajo: 'Solo ítems con stock bajo',
  soloConDiferencia: 'Solo cierres con faltante o sobrante',
  minVisitas: 'Mínimo de visitas',
  diasInactividad: 'Inactivo después de (días)',
};

export const FORMATOS_EXPORTACION = [
  { valor: 'pdf' as const, etiqueta: 'PDF' },
  { valor: 'xlsx' as const, etiqueta: 'Excel' },
  { valor: 'html' as const, etiqueta: 'HTML' },
];

/** Filas por página de las tablas del resultado. */
export const FILAS_POR_PAGINA = [10, 25, 50];
