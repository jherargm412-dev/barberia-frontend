export interface BarberoComisiones { idEmpleado: number; nombre: string }
export interface LineaComision {
  idDetalle: number; idVenta: number; fecha: string; tipo: 'SERVICIO' | 'PRODUCTO'; concepto: string;
  cantidad: number; precioUnitario: number; porcentaje: number | null; montoFijo: number | null;
  comision: number; estado: 'PENDIENTE' | 'LIQUIDADA'; idPago: number | null;
}
export interface ResumenComisiones { generada: number; pendiente: number; liquidada: number; serviciosAtendidos: number }
export interface FiltrosComisiones { fechaInicio: string; fechaFin: string; estado: string; empleadoId?: number }
export interface ConsultaComisiones extends FiltrosComisiones {
  barbero: BarberoComisiones; dia: ResumenComisiones; mes: ResumenComisiones;
  periodo: ResumenComisiones; detalle: LineaComision[];
}
export interface LiquidacionComisiones { idPago: number; fecha: string; montoTotal: number; servicios: number; productos: number }
export interface DesgloseComisiones { barbero: BarberoComisiones; liquidacion: LiquidacionComisiones; detalle: LineaComision[] }
