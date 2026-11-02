export interface LiquidacionRequest {
  fechaInicio: string;
  fechaFin: string;
}

export interface ItemDesglose {
  tipo: 'SERVICIO' | 'PRODUCTO';
  concepto: string;
  monto: number;
}

export interface LiquidacionResponse {
  nombreEmpleado: string;
  totalServicios: number;
  totalProductos: number;
  totalPagar: number;
  desglose: ItemDesglose[];
}