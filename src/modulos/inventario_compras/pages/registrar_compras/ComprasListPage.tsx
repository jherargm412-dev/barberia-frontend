import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { Alert, Button, LinearProgress, MenuItem, Paper, Stack, TableBody, TableCell, TableHead, TablePagination, TableRow,
  TextField, Typography } from '@mui/material';
import PageHeader from '../../../../shared/components/PageHeader';
import ResponsiveTable from '../../../../shared/components/ResponsiveTable';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { consultarCompra, listarCompras, opcionesCompra } from '../../api/registrar_compras/comprasApi';
import CompraDetalleDialog from '../../components/registrar_compras/CompraDetalleDialog';
import { hoyBolivia, moneda } from '../../constants/registrar_compras';
import type { Compra, CompraResumen, OpcionesCompra } from '../../types/registrar_compras';

const COLUMNAS = ['N.º', 'Fecha', 'Proveedor', 'Factura', 'Pago', 'Total', 'Registró', 'Acciones'];

/** CU25: historial de compras con filtro por fecha y proveedor. */
export default function ComprasListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mensaje, setMensaje] = useState((location.state as { mensaje?: string } | null)?.mensaje ?? '');
  const [escritos, setEscritos] = useState({ desde: hoyBolivia(-30), hasta: hoyBolivia(), proveedorId: '' });
  const [filtro, setFiltro] = useState({ ...escritos, page: 0, size: 20 });
  const [proveedores, setProveedores] = useState<OpcionesCompra['proveedores']>([]);
  const [lista, setLista] = useState<CompraResumen[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [detalle, setDetalle] = useState<Compra | null>(null);
  const [consultando, setConsultando] = useState(false);

  useEffect(() => {
    opcionesCompra().then((r) => setProveedores(r.proveedores)).catch(() => setProveedores([]));
  }, []);

  useEffect(() => {
    let vigente = true;
    listarCompras(filtro.desde, filtro.hasta, filtro.proveedorId ? Number(filtro.proveedorId) : undefined, filtro.page, filtro.size)
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

  async function ver(id: number) {
    setConsultando(true);
    setError('');
    try { setDetalle(await consultarCompra(id)); }
    catch (err) { setError(obtenerError(err).mensaje); }
    finally { setConsultando(false); }
  }

  return <>
    <PageHeader title="Compras" description="Compras de productos e insumos a proveedores." action={
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/compras/nueva')}>Registrar compra</Button>
    } />
    {mensaje && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMensaje('')}>{mensaje}</Alert>}
    <Paper component="form" onSubmit={buscar} noValidate sx={{ p: 2, mb: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField type="date" label="Desde" value={escritos.desde} slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => setEscritos({ ...escritos, desde: e.target.value })} />
        <TextField type="date" label="Hasta" value={escritos.hasta} slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => setEscritos({ ...escritos, hasta: e.target.value })} />
        <TextField select label="Proveedor" value={escritos.proveedorId} sx={{ minWidth: 220 }}
          onChange={(e) => setEscritos({ ...escritos, proveedorId: e.target.value })}>
          <MenuItem value="">Todos</MenuItem>
          {proveedores.map((p) => <MenuItem key={p.idProveedor} value={String(p.idProveedor)}>{p.empresa}</MenuItem>)}
        </TextField>
        <Button type="submit" variant="outlined" startIcon={<SearchIcon />}>Buscar</Button>
      </Stack>
    </Paper>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {(cargando || consultando) && <LinearProgress aria-label="Cargando compras" />}
    <Paper sx={{ overflow: 'hidden' }}>
      <ResponsiveTable columns={COLUMNAS}>
        <TableHead><TableRow>{COLUMNAS.map((t) => <TableCell key={t} align={t === 'Total' ? 'right' : undefined}>{t}</TableCell>)}</TableRow></TableHead>
        <TableBody>
          {lista.map((c) => <TableRow key={c.idNotaCompra}>
            <TableCell>{c.idNotaCompra}</TableCell>
            <TableCell>{c.fecha}</TableCell>
            <TableCell><Typography sx={{ fontWeight: 600 }}>{c.proveedor}</Typography></TableCell>
            <TableCell>{c.nroFact ?? '—'}</TableCell>
            <TableCell>{c.metodoPago ?? '—'}</TableCell>
            <TableCell align="right">{moneda(c.subTotal)}</TableCell>
            <TableCell>{c.registradoPor}</TableCell>
            <TableCell><Button size="small" onClick={() => void ver(c.idNotaCompra)} disabled={consultando}>Ver</Button></TableCell>
          </TableRow>)}
          {!cargando && !error && lista.length === 0 && <TableRow><TableCell colSpan={COLUMNAS.length} align="center" sx={{ py: 5 }}>
            <Typography color="text.secondary">No hay compras registradas en este período.</Typography>
          </TableCell></TableRow>}
        </TableBody>
      </ResponsiveTable>
      <TablePagination component="div" count={total} page={filtro.page} rowsPerPage={filtro.size} rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage="Filas por página" labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        onPageChange={(_, page) => filtrar({ page })} onRowsPerPageChange={(e) => filtrar({ size: Number(e.target.value), page: 0 })} />
    </Paper>
    <CompraDetalleDialog compra={detalle} onCerrar={() => setDetalle(null)} />
  </>;
}
