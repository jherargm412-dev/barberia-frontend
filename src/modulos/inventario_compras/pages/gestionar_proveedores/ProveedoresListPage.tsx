import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, MenuItem, Paper, Stack,
  TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Typography } from '@mui/material';
import PageHeader from '../../../../shared/components/PageHeader';
import ResponsiveTable from '../../../../shared/components/ResponsiveTable';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { cambiarEstadoProveedor, consultarProveedor, listarProveedores } from '../../api/gestionar_proveedores/proveedoresApi';
import type { Proveedor } from '../../types/gestionar_proveedores';

export default function ProveedoresListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mensaje, setMensaje] = useState((location.state as { mensaje?: string } | null)?.mensaje ?? '');
  const [filtro, setFiltro] = useState({ q: '', estado: '', page: 0, size: 20 });
  const [busqueda, setBusqueda] = useState('');
  const [lista, setLista] = useState<Proveedor[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [recarga, setRecarga] = useState(0);
  const [detalle, setDetalle] = useState<Proveedor | null>(null);
  const [consultando, setConsultando] = useState(false);
  const [seleccionado, setSeleccionado] = useState<Proveedor | null>(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    let vigente = true;
    listarProveedores(filtro.q, filtro.estado === '' ? undefined : filtro.estado === 'activo', filtro.page, filtro.size)
      .then((r) => { if (vigente) { setLista(r.contenido); setTotal(r.totalElementos); } })
      .catch((err) => { if (vigente) setError(obtenerError(err).mensaje); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [filtro, recarga]);

  function filtrar(cambios: Partial<typeof filtro>) {
    setCargando(true);
    setError('');
    setLista([]);
    setFiltro((prev) => ({ ...prev, ...cambios }));
  }

  async function ver(proveedor: Proveedor) {
    setConsultando(true);
    setError('');
    try { setDetalle(await consultarProveedor(proveedor.idProveedor)); }
    catch (err) { setError(obtenerError(err).mensaje); }
    finally { setConsultando(false); }
  }

  async function confirmar() {
    if (!seleccionado) return;
    setProcesando(true);
    setError('');
    setMensaje('');
    try {
      const r = await cambiarEstadoProveedor(seleccionado.idProveedor, !seleccionado.activo);
      setMensaje(r.mensaje);
      setSeleccionado(null);
      // Volver al inicio evita quedar en una página vacía al filtrar por estado.
      filtrar({ page: 0 });
    } catch (err) { setError(obtenerError(err).mensaje); setSeleccionado(null); }
    finally { setProcesando(false); }
  }

  return <>
    <PageHeader title="Proveedores" description="Administra las empresas que abastecen tus productos e insumos." action={
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/proveedores/nuevo')}>Nuevo proveedor</Button>
    } />
    {mensaje && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMensaje('')}>{mensaje}</Alert>}
    {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button onClick={() => { setCargando(true); setError(''); setRecarga((n) => n + 1); }}>Reintentar</Button>}>{error}</Alert>}
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack component="form" direction={{ xs: 'column', sm: 'row' }} spacing={2} onSubmit={(e) => { e.preventDefault(); filtrar({ q: busqueda.trim(), page: 0 }); }}>
        <TextField fullWidth label="Buscar proveedor" placeholder="Empresa, NIT o contacto" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        <TextField select label="Estado" value={filtro.estado} sx={{ minWidth: 160 }} onChange={(e) => filtrar({ estado: e.target.value, page: 0 })}>
          <MenuItem value="">Todos</MenuItem><MenuItem value="activo">Activos</MenuItem><MenuItem value="inactivo">Inactivos</MenuItem>
        </TextField>
        <Button type="submit" variant="outlined">Buscar</Button>
      </Stack>
    </Paper>
    {(cargando || consultando) && <LinearProgress aria-label="Cargando proveedores" />}
    <Paper sx={{ overflow: 'hidden' }}>
      <ResponsiveTable columns={['Empresa', 'NIT', 'Contacto', 'Teléfono', 'Estado', 'Acciones']}>
        <TableHead><TableRow>{['Empresa', 'NIT', 'Contacto', 'Teléfono', 'Estado', 'Acciones'].map((t) => <TableCell key={t}>{t}</TableCell>)}</TableRow></TableHead>
        <TableBody>
          {lista.map((p) => <TableRow key={p.idProveedor}>
            <TableCell><Typography sx={{ fontWeight: 600 }}>{p.empresa}</Typography></TableCell>
            <TableCell>{p.nit}</TableCell><TableCell>{p.nombre ?? '—'}</TableCell><TableCell>{p.telefono ?? '—'}</TableCell>
            <TableCell><Chip size="small" label={p.activo ? 'Activo' : 'Inactivo'} color={p.activo ? 'success' : 'default'} /></TableCell>
            <TableCell><Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
              <Button size="small" onClick={() => void ver(p)} disabled={consultando || cargando || procesando}>Ver</Button>
              <Button size="small" onClick={() => navigate(`/proveedores/${p.idProveedor}/editar`)} disabled={cargando || procesando}>Editar</Button>
              <Button size="small" color={p.activo ? 'warning' : 'primary'} onClick={() => setSeleccionado(p)} disabled={cargando || procesando}>{p.activo ? 'Deshabilitar' : 'Habilitar'}</Button>
            </Stack></TableCell>
          </TableRow>)}
          {!cargando && !error && lista.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}>
            <Typography color="text.secondary">{filtro.q || filtro.estado ? 'No hay proveedores que coincidan con los filtros.' : 'Todavía no hay proveedores registrados.'}</Typography>
          </TableCell></TableRow>}
        </TableBody>
      </ResponsiveTable>
      <TablePagination component="div" count={total} page={filtro.page} rowsPerPage={filtro.size} rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage="Filas por página" labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        onPageChange={(_, page) => filtrar({ page })} onRowsPerPageChange={(e) => filtrar({ size: Number(e.target.value), page: 0 })} />
    </Paper>
    <Dialog open={detalle !== null} onClose={() => setDetalle(null)} fullWidth maxWidth="sm" aria-labelledby="proveedor-detalle">
      <DialogTitle id="proveedor-detalle">Detalle del proveedor</DialogTitle>
      <DialogContent><Box component="dl" sx={{ m: 0, '& dt': { color: 'text.secondary', mt: 2 }, '& dd': { m: 0, overflowWrap: 'anywhere' } }}>
        {detalle && Object.entries({ Empresa: detalle.empresa, NIT: detalle.nit, Contacto: detalle.nombre, Teléfono: detalle.telefono, Correo: detalle.correo, Estado: detalle.activo ? 'Activo' : 'Inactivo' }).map(([k, v]) => <Box key={k}><Typography component="dt" variant="body2">{k}</Typography><Typography component="dd">{v ?? '—'}</Typography></Box>)}
      </Box></DialogContent><DialogActions><Button onClick={() => setDetalle(null)}>Cerrar</Button></DialogActions>
    </Dialog>
    <ConfirmDialog abierto={seleccionado !== null} titulo={seleccionado?.activo ? 'Deshabilitar proveedor' : 'Habilitar proveedor'}
      mensaje={seleccionado?.activo ? `“${seleccionado.empresa}” quedará inactivo. Se conservarán sus datos e historial.` : `“${seleccionado?.empresa ?? ''}” volverá a estar activo.`}
      textoConfirmar={seleccionado?.activo ? 'Deshabilitar' : 'Habilitar'} cargando={procesando} onConfirmar={() => void confirmar()} onCancelar={() => setSeleccionado(null)} />
  </>;
}
