import { useEffect, useState, type FormEvent } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { consultarKardex } from '../../api/registrar_movimiento_inventario/movimientosApi';
import { hoyBolivia, moneda } from '../../constants/registrar_compras';
import { fechaHora, ORIGENES_KARDEX } from '../../constants/registrar_movimiento_inventario';
import type { Kardex } from '../../types/registrar_movimiento_inventario';

interface Props {
  /** Producto cuyo kardex se muestra; null = cerrado. */
  productoId: number | null;
  onCerrar: () => void;
}

/**
 * CU26 paso 4: kardex del producto. Une compras, ventas, ajustes (CU22) y movimientos (CU26)
 * en orden cronológico con el saldo después de cada registro.
 * La página lo vuelve a montar (key) al cambiar de producto.
 */
export default function KardexDialog({ productoId, onCerrar }: Props) {
  const [escritos, setEscritos] = useState({ desde: hoyBolivia(-30), hasta: hoyBolivia() });
  const [filtro, setFiltro] = useState(escritos);
  const [kardex, setKardex] = useState<Kardex | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (productoId === null) return;
    let vigente = true;
    consultarKardex(productoId, filtro.desde, filtro.hasta)
      .then((r) => { if (vigente) { setKardex(r); setError(''); } })
      .catch((err) => { if (vigente) { setKardex(null); setError(obtenerError(err).mensaje); } })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [productoId, filtro]);

  function buscar(e: FormEvent) {
    e.preventDefault();
    setCargando(true);
    setFiltro({ ...escritos });
  }

  return <Dialog open={productoId !== null} onClose={onCerrar} fullWidth maxWidth="lg" aria-labelledby="kardex-titulo">
    <DialogTitle id="kardex-titulo">Kardex{kardex ? ` · ${kardex.producto}` : ''}</DialogTitle>
    <DialogContent>
      <Stack spacing={2}>
        <Stack component="form" onSubmit={buscar} noValidate direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
          <TextField type="date" label="Desde" value={escritos.desde} slotProps={{ inputLabel: { shrink: true } }}
            onChange={(e) => setEscritos({ ...escritos, desde: e.target.value })} />
          <TextField type="date" label="Hasta" value={escritos.hasta} slotProps={{ inputLabel: { shrink: true } }}
            onChange={(e) => setEscritos({ ...escritos, hasta: e.target.value })} />
          <Button type="submit" variant="outlined" startIcon={<SearchIcon />}>Consultar</Button>
        </Stack>
        {cargando && <LinearProgress aria-label="Cargando kardex" />}
        {error && <Alert severity="error">{error}</Alert>}
        {kardex && <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
            {Object.entries({
              'Saldo inicial': kardex.saldoInicial,
              Entradas: `+${kardex.totalEntradas}`,
              Salidas: `−${kardex.totalSalidas}`,
              'Saldo final': kardex.saldoFinal,
            }).map(([k, v]) => <Box key={k} sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
              <Typography variant="body2" color="text.secondary">{k}</Typography>
              <Typography variant="h6">{v}</Typography>
            </Box>)}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {kardex.tipoProducto === 'INSUMO' ? 'Insumo' : 'Producto de venta'}{kardex.activo ? '' : ' (deshabilitado)'}
            {' · '}Stock actual: {kardex.stockActual} · Mínimo: {kardex.stockMinimo} · Costo promedio: {moneda(kardex.costoPromedio)}
          </Typography>
          <TableContainer>
            <Table size="small" sx={{ minWidth: 820 }}>
              <TableHead><TableRow>
                <TableCell>Fecha</TableCell><TableCell>Origen</TableCell><TableCell>Detalle</TableCell>
                <TableCell align="right">Entrada</TableCell><TableCell align="right">Salida</TableCell>
                <TableCell align="right">Saldo</TableCell><TableCell align="right">Costo unit.</TableCell><TableCell>Usuario</TableCell>
              </TableRow></TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} sx={{ fontStyle: 'italic' }}>Saldo al inicio del {fechaHora(kardex.desde)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{kardex.saldoInicial}</TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
                {kardex.registros.map((r, i) => <TableRow key={`${r.origen}-${r.referencia}-${i}`}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{fechaHora(r.fecha)}</TableCell>
                  <TableCell>{ORIGENES_KARDEX[r.origen] ?? r.origen}{r.referencia ? ` #${r.referencia}` : ''}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{r.tipoEtiqueta}</Typography>
                    {r.detalle && <Typography variant="caption" color="text.secondary">{r.detalle}</Typography>}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>{r.entrada ? `+${r.entrada}` : ''}</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>{r.salida ? `−${r.salida}` : ''}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{r.saldo}</TableCell>
                  <TableCell align="right">{r.costoUnitario !== null ? moneda(r.costoUnitario) : '—'}</TableCell>
                  <TableCell>{r.usuario ?? '—'}</TableCell>
                </TableRow>)}
                {kardex.registros.length === 0 && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Sin movimientos en este período.</Typography>
                </TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </>}
      </Stack>
    </DialogContent>
    <DialogActions><Button onClick={onCerrar}>Cerrar</Button></DialogActions>
  </Dialog>;
}
