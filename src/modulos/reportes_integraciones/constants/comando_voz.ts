import type { DefinicionComando } from '../types/comando_voz';

/** CU28: permiso para usar el micrófono (V33, los cuatro roles). */
export const PERMISO_VOZ = 'VOZ_USAR';

/** Idioma del reconocimiento: español de Bolivia (el navegador usa español latino si no lo tiene). */
export const IDIOMA_VOZ = 'es-BO';

/**
 * Catálogo de comandos de HOUSE OF CUT. Ninguno registra, modifica ni anula datos: solo abren
 * pantallas o aplican un filtro. Cada pantalla sigue exigiendo su propio permiso.
 */
export const COMANDOS_VOZ: DefinicionComando[] = [
  { codigo: 'INICIO', comando: 'inicio', ejemplos: ['ir al inicio'], descripcion: 'Vuelve al panel principal.' },
  {
    codigo: 'ABRIR', comando: 'abrir [opción del menú]', ejemplos: ['abrir proveedores', 'ir a caja'],
    descripcion: 'Abre cualquier opción del menú que su rol puede ver. "Abrir caja" solo abre la pantalla: no abre ni cierra el turno de caja.',
  },
  { codigo: 'AYUDA', comando: 'ayuda', ejemplos: ['qué puedo decir'], descripcion: 'Muestra esta lista.' },
  {
    codigo: 'BUSCAR_CLIENTE', comando: 'buscar cliente [nombre]', ejemplos: ['buscar cliente Pérez'],
    descripcion: 'Abre Clientes con la búsqueda aplicada.', permisos: ['CLIENTE_CONSULTAR'],
  },
  {
    codigo: 'BUSCAR_PRODUCTO', comando: 'buscar producto [nombre]', ejemplos: ['buscar producto cera', 'buscar insumo navajas'],
    descripcion: 'Abre Productos e insumos filtrado por ese nombre.', permisos: ['PRODUCTO_GESTIONAR', 'PRODUCTO_CONSULTAR'],
  },
  {
    codigo: 'STOCK_BAJO', comando: 'stock bajo', ejemplos: ['productos con stock bajo', 'inventario bajo'],
    descripcion: 'Muestra los productos e insumos que llegaron a su stock mínimo.', permisos: ['PRODUCTO_GESTIONAR', 'PRODUCTO_CONSULTAR'],
  },
  {
    codigo: 'AGENDA', comando: 'agenda de [día] / agenda de la semana', ejemplos: ['agenda de mañana', 'agenda del viernes', 'agenda de la semana'],
    descripcion: 'Abre la Agenda de Citas en ese día o en la vista semanal. El barbero ve solo sus citas.',
    permisos: ['AGENDA_CONSULTAR', 'AGENDA_CONSULTAR_PROPIA'],
  },
  {
    codigo: 'CITAS', comando: 'citas de [día]', ejemplos: ['citas de hoy', 'citas de mañana'],
    descripcion: 'Abre Citas filtrado por ese día, para confirmar, reprogramar o cobrar el anticipo desde la pantalla.',
    permisos: ['AGENDA_CONSULTAR'],
  },
  {
    codigo: 'NUEVA_CITA', comando: 'nueva cita', ejemplos: ['agendar cita', 'reservar cita'],
    descripcion: 'Abre el registro de una cita (recepción) o la solicitud de cita (cliente). Nada se guarda hasta confirmar en pantalla.',
    permisos: ['RESERVA_CREAR', 'RESERVA_SOLICITAR'],
  },
  {
    codigo: 'DISPONIBILIDAD', comando: 'disponibilidad de [servicio] [día]', ejemplos: ['disponibilidad de corte para mañana', 'horas libres de barba'],
    descripcion: 'Muestra los barberos y las horas libres de ese servicio.', permisos: ['RESERVA_CREAR'],
  },
  {
    codigo: 'REGISTRAR_VENTA', comando: 'registrar venta', ejemplos: ['nueva venta'],
    descripcion: 'Abre el registro de venta. La venta se guarda solo al confirmarla en pantalla.', permisos: ['VENTA_REGISTRAR'],
  },
  {
    codigo: 'COMISIONES', comando: 'mis comisiones', ejemplos: ['ver mis comisiones'],
    descripcion: 'Abre sus comisiones del día y del mes, con el historial de liquidaciones.', permisos: ['COMISION_CONSULTAR_PROPIA'],
  },
  {
    codigo: 'REPORTE', comando: 'reporte de [tipo]', ejemplos: ['reporte de ventas', 'reporte de comisiones'],
    descripcion: 'Genera ese reporte del mes actual: ventas, ingresos y egresos, cierres de caja, existencias, movimientos de inventario, comisiones, desempeño de barberos o visitas.',
    permisos: ['REPORTE_GENERAR'],
  },
  { codigo: 'TEMA', comando: 'modo oscuro / modo claro', ejemplos: ['modo oscuro'], descripcion: 'Cambia los colores de la pantalla.' },
];

/**
 * Otras formas de nombrar cada opción del menú al decir "abrir …". La clave es la ruta; el texto del
 * menú ya cuenta como nombre.
 */
export const SINONIMOS_MENU: Record<string, string[]> = {
  '/': ['inicio', 'panel', 'panel principal', 'pantalla principal'],
  '/empleados': ['barberos', 'empleados', 'personal'],
  '/liquidaciones': ['liquidaciones', 'liquidacion', 'pago de comisiones'],
  '/comisiones': ['comisiones', 'mis comisiones'],
  '/agenda': ['agenda', 'agenda de citas'],
  '/disponibilidad': ['disponibilidad', 'horas libres', 'horarios libres'],
  '/horarios': ['horarios', 'horarios de los barberos'],
  '/solicitar-cita': ['solicitar cita', 'reservar'],
  '/catalogo': ['catalogo de servicios', 'servicios disponibles'],
  '/roles': ['roles', 'permisos'],
  '/bitacora': ['bitacora', 'auditoria'],
  '/ventas/registrar': ['venta', 'ventas', 'registrar venta'],
  '/pasarela-pago': ['pasarela', 'pasarela de pago', 'pagos con tarjeta', 'tarjeta'],
  '/productos': ['productos', 'insumos', 'productos e insumos', 'inventario de productos'],
  '/catalogo-productos': ['catalogo de productos'],
  '/inventario/movimientos': ['inventario', 'movimientos', 'kardex', 'movimientos de inventario'],
  '/perfil': ['perfil', 'mi perfil', 'mi cuenta'],
  '/comandos-voz': ['comandos', 'comandos de voz', 'ayuda de voz'],
};

/** "reporte de …": palabra dicha → clave del reporte (ver REPORTES de CU27). */
export const REPORTES_POR_PALABRA: [string, string][] = [
  ['movimiento', 'movimientos-inventario'],
  ['kardex', 'movimientos-inventario'],
  ['cierre', 'cierres-caja'],
  ['caja', 'cierres-caja'],
  ['ingreso', 'ingresos-egresos'],
  ['egreso', 'ingresos-egresos'],
  ['gasto', 'ingresos-egresos'],
  ['venta', 'ventas'],
  ['existencia', 'existencias'],
  ['stock', 'existencias'],
  ['inventario', 'existencias'],
  ['comision', 'comisiones'],
  ['desempeno', 'desempeno-barberos'],
  ['barbero', 'desempeno-barberos'],
  ['visita', 'visitas-clientes'],
  ['cliente', 'visitas-clientes'],
];
