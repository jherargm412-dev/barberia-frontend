import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography } from '@mui/material';
import { moneda } from '../../constants/registrar_compras';
import type { Compra } from '../../types/registrar_compras';

interface Props {
  compra: Compra | null;
  onCerrar: () => void;
}

export default function CompraDetalleDialog({ compra, onCerrar }: Props) {
  return <Dialog open={compra !== null} onClose={onCerrar} fullWidth maxWidth="md" aria-labelledby="compra-detalle">
    <DialogTitle id="compra-detalle">Compra #{compra?.idNotaCompra}</DialogTitle>
    <DialogContent>
      {compra && <Stack spacing={2}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          {Object.entries({
            Proveedor: `${compra.proveedor} (NIT ${compra.nitProveedor})`,
            Fecha: compra.fecha,
            'N.º de factura': compra.nroFact,
            'Método de pago': compra.metodoPago,
            'Egreso de caja': compra.idMovimientoCaja ? `Movimiento #${compra.idMovimientoCaja}` : 'No (no se pagó en efectivo)',
            'Registrado por': compra.registradoPor,
          }).map(([k, v]) => <Box key={k}>
            <Typography variant="body2" color="text.secondary">{k}</Typography>
            <Typography sx={{ overflowWrap: 'anywhere' }}>{v ?? '—'}</Typography>
          </Box>)}
        </Box>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 560 }}>
            <TableHead><TableRow>
              <TableCell>Producto</TableCell><TableCell align="right">Cantidad</TableCell><TableCell align="right">Precio unit.</TableCell>
              <TableCell align="right">Descuento</TableCell><TableCell align="right">Subtotal</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {compra.detalles.map((d) => <TableRow key={d.idDetalleNotaCompra}>
                <TableCell>{d.producto}{d.tipo === 'INSUMO' ? ' (insumo)' : ''}</TableCell>
                <TableCell align="right">{d.cantidad}</TableCell>
                <TableCell align="right">{moneda(d.precioUnitario)}</TableCell>
                <TableCell align="right">{moneda(d.descuento)}</TableCell>
                <TableCell align="right">{moneda(d.subTotal)}</TableCell>
              </TableRow>)}
              <TableRow>
                <TableCell colSpan={4} align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{moneda(compra.subTotal)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>}
    </DialogContent>
    <DialogActions><Button onClick={onCerrar}>Cerrar</Button></DialogActions>
  </Dialog>;
}
