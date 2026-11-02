import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { ComprobanteVenta } from '../../types/registrar_venta';
import { fecha, moneda } from '../../utils/gestionar_caja/formato';

interface Props {
  comprobante: ComprobanteVenta;
  onCerrar: () => void;
}

export default function ComprobanteVentaDialog({ comprobante, onCerrar }: Props) {
  return (
    <Dialog open onClose={onCerrar} fullWidth maxWidth="md">
      <DialogTitle>Comprobante de venta #{comprobante.idNotaVenta}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Alert icon={<CheckCircleIcon />} severity="success">Venta registrada y pagada correctamente.</Alert>
          <Box>
            <Typography><strong>Fecha:</strong> {fecha(comprobante.fecha)}</Typography>
            <Typography><strong>Cliente:</strong> {comprobante.clienteNombre}</Typography>
            <Typography><strong>Responsable:</strong> {comprobante.responsable}</Typography>
          </Box>
          <Divider />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Servicios</Typography>
          <Table size="small">
            <TableHead><TableRow><TableCell>Servicio</TableCell><TableCell>Barbero</TableCell>
              <TableCell align="right">Precio</TableCell></TableRow></TableHead>
            <TableBody>{comprobante.servicios.map((linea) => (
              <TableRow key={linea.idDetalleServicio}>
                <TableCell>{linea.servicio}</TableCell><TableCell>{linea.barbero}</TableCell>
                <TableCell align="right">{moneda(linea.precioUnitario)}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
          {comprobante.productos.length > 0 && <>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Productos</Typography>
            <Table size="small">
              <TableHead><TableRow><TableCell>Producto</TableCell><TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Subtotal</TableCell></TableRow></TableHead>
              <TableBody>{comprobante.productos.map((linea) => (
                <TableRow key={linea.idDetalleNotaVenta}>
                  <TableCell>{linea.producto}{linea.descripcion ? ` · ${linea.descripcion}` : ''}</TableCell>
                  <TableCell align="right">{linea.cantidad}</TableCell>
                  <TableCell align="right">{moneda(linea.subTotal)}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </>}
          <Divider />
          <Stack spacing={0.5} sx={{ alignItems: 'flex-end' }}>
            <Typography>Subtotal: {moneda(comprobante.subTotal)}</Typography>
            {comprobante.descuento > 0 && <Typography>Descuento: −{moneda(comprobante.descuento)}</Typography>}
            {comprobante.impuesto > 0 && <Typography>Impuesto: {moneda(comprobante.impuesto)}</Typography>}
            <Typography variant="h6">Total: {moneda(comprobante.total)}</Typography>
            {comprobante.anticipoAplicado > 0 && <Typography>Anticipo aplicado: −{moneda(comprobante.anticipoAplicado)}</Typography>}
            <Typography>Saldo cobrado: {moneda(comprobante.saldoCobrado)}</Typography>
          </Stack>
          <Divider />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Medios de pago</Typography>
          {comprobante.pagos.length === 0
            ? <Typography>La venta quedó cubierta por el anticipo.</Typography>
            : comprobante.pagos.map((pago) => (
              <Typography key={pago.idMovimientoCaja}>
                {pago.medioPago}: {moneda(pago.monto)}
                {pago.referenciaExterna ? ` · Ref. ${pago.referenciaExterna}` : ''}
              </Typography>
            ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => window.print()}>Imprimir</Button>
        <Button variant="contained" onClick={onCerrar}>Finalizar</Button>
      </DialogActions>
    </Dialog>
  );
}
