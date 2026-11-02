import { Chip, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import ResponsiveTable from '../../../../shared/components/ResponsiveTable';
import type { LineaComision } from '../../types/consultar_comisiones';

import { monedaComision, fechaComision } from '../../utils/consultar_comisiones/formatoComisiones';

export default function ComisionesTabla({ lineas }: { lineas: LineaComision[] }) {
  const columnas = ['Fecha / venta', 'Concepto', 'Cantidad', 'Precio unitario', 'Regla aplicada', 'Comisión', 'Estado'];
  return <ResponsiveTable columns={columnas} size="small" aria-label="Detalle de comisiones">
    <TableHead><TableRow>{columnas.map(c => <TableCell key={c}>{c}</TableCell>)}</TableRow></TableHead>
    <TableBody>{lineas.map(l => <TableRow key={`${l.tipo}-${l.idDetalle}`}>
      <TableCell>{fechaComision(l.fecha)}<Typography variant="caption" component="div">Venta #{l.idVenta}</Typography></TableCell>
      <TableCell>{l.concepto}<Typography variant="caption" component="div" color="text.secondary">{l.tipo === 'SERVICIO' ? 'Servicio' : 'Producto'}</Typography></TableCell>
      <TableCell align="right">{l.cantidad}</TableCell><TableCell align="right">{monedaComision(l.precioUnitario)}</TableCell>
      <TableCell>{l.porcentaje !== null ? `${l.porcentaje} %` : `${monedaComision(l.montoFijo ?? 0)} / unidad`}</TableCell>
      <TableCell align="right">{monedaComision(l.comision)}</TableCell>
      <TableCell><Chip size="small" label={l.estado === 'LIQUIDADA' ? 'Liquidada' : 'Pendiente'} color={l.estado === 'LIQUIDADA' ? 'success' : 'warning'} variant="outlined" /></TableCell>
    </TableRow>)}</TableBody>
  </ResponsiveTable>;
}
