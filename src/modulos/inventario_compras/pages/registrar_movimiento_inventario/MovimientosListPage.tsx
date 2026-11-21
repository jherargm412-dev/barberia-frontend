import { useEffect, useState, type FormEvent } from 'react';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import TimelineIcon from '@mui/icons-material/TimelineOutlined';
import { Alert, Button, LinearProgress, MenuItem, Paper, Stack, TableBody, TableCell, TableHead, TablePagination, TableRow,
  TextField, Typography } from '@mui/material';
import PageHeader from '../../../../shared/components/PageHeader';
import ResponsiveTable from '../../../../shared/components/ResponsiveTable';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { useAuth } from '../../../seguridad_usuarios';
import { listarMovimientos, opcionesMovimiento } from '../../api/registrar_movimiento_inventario/movimientosApi';
import KardexDialog from '../../components/registrar_movimiento_inventario/KardexDialog';
import MovimientoRegistrarDialog from '../../components/registrar_movimiento_inventario/MovimientoRegistrarDialog';
import { hoyBolivia, moneda } from '../../constants/registrar_compras';
import { fechaHora, PERMISOS_MOVIMIENTOS, TIPOS_MOVIMIENTO } from '../../constants/registrar_movimiento_inventario';
import type { MovimientoInventario, ProductoOpcion, RespuestaMovimiento, TipoMovimiento } from '../../types/registrar_movimiento_inventario';

const COLUMNAS = ['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Stock', 'Costo', 'Motivo', 'Registró', 'Kardex'];

/** CU26: historial de movimientos de inventario, registro de nuevos movimientos y kardex por producto. */
export default function MovimientosListPage() {
  const { tienePermiso } = useAuth();
  const puedeRegistrar = tienePermiso(PERMISOS_MOVIMIENTOS.AJUSTAR) || tienePermiso(PERMISOS_MOVIMIENTOS.CONSUMO);

  const [escritos, setEscritos] = useState({ desde: hoyBolivia(-30), hasta: hoyBolivia(), productoId: '', tipo: '' });
  const [filtro, setFiltro] = useState({ ...escritos, page: 0, size: 20 });
  const [productos, setProductos] = useState<ProductoOpcion[]>([]);
  const [lista, setLista] = useState<MovimientoInventario[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState<{ mensaje: string; alerta: string | null } | null>(null);
  // "vecesRegistro" vuelve a montar el diálogo para que empiece vacío y recargue el stock.
  const [registroAbierto, setRegistroAbierto] = useState(false);
  const [vecesRegistro, setVecesRegistro] = useState(0);
  const [kardexDe, setKardexDe] = useState<number | null>(null);

  // Lista de productos para el filtro (el endpoint de opciones exige permiso de registro).
  useEffect(() => {
    if (!puedeRegistrar) return;
    opcionesMovimiento().then((r) => setProductos(r.productos)).catch(() => setProductos([]));
  }, [puedeRegistrar, vecesRegistro]);

  useEffect(() => {
    let vigente = true;
    listarMovimientos({
      desde: filtro.desde, hasta: filtro.hasta,
      productoId: filtro.productoId ? Number(filtro.productoId) : undefined,
      tipo: (filtro.tipo || undefined) as TipoMovimiento | undefined,
      page: filtro.page, size: filtro.size,
    })
      .then((r) => { if (vigente) { setLista(r.contenido); setTotal(r.totalElementos); setError(''); } })
      .catch((err) => { if (vigente) { setLista([]); setError(obtenerError(err).mensaje); } })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [filtro]);

  function filtrar(cambios: Partial<typeof filtro>) {
    setCargando(true);
    setFiltro((prev) => ({ ...prev, ...cambios }));
  }

  function buscar(e: FormEvent) {
    e.preventDefault();
    filtrar({ ...escritos, page: 0 });
  }

  function abrirRegistro() {
    setVecesRegistro((n) => n + 1);
    setRegistroAbierto(true);
  }

  function registrado(respuesta: RespuestaMovimiento) {
    setRegistroAbierto(false);
    setAviso({
      mensaje: `${respuesta.mensaje}: ${respuesta.movimiento.tipoEtiqueta.toLowerCase()} de ${respuesta.movimiento.cantidad} `
        + `en '${respuesta.movimiento.producto}' (stock ${respuesta.movimiento.stockAnterior} → ${respuesta.stockActual}).`,
      alerta: respuesta.stockBajo ? respuesta.alertaStockBajo : null,
    });
    filtrar({ page: 0 });
  }

  return <>
    <PageHeader title="Movimientos de inventario"
      description="Entradas y salidas manuales, consumo interno de insumos, mermas y ajustes por conteo físico."
      action={<Stack direction="row" spacing={1}>
        <Button variant="outlined" startIcon={<TimelineIcon />} disabled={!escritos.productoId}
          onClick={() => setKardexDe(Number(escritos.productoId))}>Ver kardex</Button>
        {puedeRegistrar && <Button variant="contained" startIcon={<AddIcon />} onClick={abrirRegistro}>Registrar movimiento</Button>}
      </Stack>} />
    {aviso && <Alert severity="success" sx={{ mb: aviso.alerta ? 1 : 2 }} onClose={() => setAviso(null)}>{aviso.mensaje}</Alert>}
    {aviso?.alerta && <Alert severity="warning" sx={{ mb: 2 }}>{aviso.alerta}</Alert>}

    <Paper component="form" onSubmit={buscar} noValidate sx={{ p: 2, mb: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField type="date" label="Desde" value={escritos.desde} slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => setEscritos({ ...escritos, desde: e.target.value })} />
        <TextField type="date" label="Hasta" value={escritos.hasta} slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => setEscritos({ ...escritos, hasta: e.target.value })} />
        <TextField select label="Producto" value={escritos.productoId} sx={{ minWidth: 220 }}
          onChange={(e) => setEscritos({ ...escritos, productoId: e.target.value })}>
          <MenuItem value="">Todos</MenuItem>
          {productos.map((p) => <MenuItem key={p.idProducto} value={String(p.idProducto)}>{p.nombre}</MenuItem>)}
        </TextField>
        <TextField select label="Tipo" value={escritos.tipo} sx={{ minWidth: 220 }}
          onChange={(e) => setEscritos({ ...escritos, tipo: e.target.value })}>
          <MenuItem value="">Todos</MenuItem>
          {TIPOS_MOVIMIENTO.map((t) => <MenuItem key={t.valor} value={t.valor}>{t.etiqueta}</MenuItem>)}
        </TextField>
        <Button type="submit" variant="outlined" startIcon={<SearchIcon />}>Buscar</Button>
      </Stack>
    </Paper>

    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {cargando && <LinearProgress aria-label="Cargando movimientos" />}
    <Paper sx={{ overflow: 'hidden' }}>
      <ResponsiveTable columns={COLUMNAS}>
        <TableHead><TableRow>{COLUMNAS.map((t) =>
          <TableCell key={t} align={['Cantidad', 'Costo'].includes(t) ? 'right' : undefined}>{t}</TableCell>)}</TableRow></TableHead>
        <TableBody>
          {lista.map((m) => <TableRow key={m.idMovimientoInventario}>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{fechaHora(m.fecha)}</TableCell>
            <TableCell>
              <Typography sx={{ fontWeight: 600 }}>{m.producto}</Typography>
              {m.tipoProducto === 'INSUMO' && <Typography variant="caption" color="text.secondary">Insumo</Typography>}
            </TableCell>
            <TableCell>{m.tipoEtiqueta}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, color: m.cantidadConSigno > 0 ? 'success.main' : 'error.main' }}>
              {m.cantidadConSigno > 0 ? `+${m.cantidadConSigno}` : `−${m.cantidad}`}
            </TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{m.stockAnterior} → {m.stockNuevo}</TableCell>
            <TableCell align="right">{moneda(m.costoTotal)}</TableCell>
            <TableCell sx={{ maxWidth: 260, overflowWrap: 'anywhere' }}>{m.motivo ?? '—'}</TableCell>
            <TableCell>{m.registradoPor}</TableCell>
            <TableCell><Button size="small" onClick={() => setKardexDe(m.productoId)}>Kardex</Button></TableCell>
          </TableRow>)}
          {!cargando && !error && lista.length === 0 && <TableRow><TableCell colSpan={COLUMNAS.length} align="center" sx={{ py: 5 }}>
            <Typography color="text.secondary">No hay movimientos registrados en este período.</Typography>
          </TableCell></TableRow>}
        </TableBody>
      </ResponsiveTable>
      <TablePagination component="div" count={total} page={filtro.page} rowsPerPage={filtro.size} rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage="Filas por página" labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        onPageChange={(_, page) => filtrar({ page })} onRowsPerPageChange={(e) => filtrar({ size: Number(e.target.value), page: 0 })} />
    </Paper>

    {puedeRegistrar && <MovimientoRegistrarDialog key={vecesRegistro} abierto={registroAbierto}
      onCerrar={() => setRegistroAbierto(false)} onRegistrado={registrado} />}
    {kardexDe !== null && <KardexDialog key={kardexDe} productoId={kardexDe} onCerrar={() => setKardexDe(null)} />}
  </>;
}
