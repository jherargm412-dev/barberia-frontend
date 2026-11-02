import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, MenuItem, Paper, Stack, Tab, Tabs, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import PageHeader from '../../../../shared/components/PageHeader';
import ResponsiveTable from '../../../../shared/components/ResponsiveTable';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { useAuth } from '../../../seguridad_usuarios';
import { consultarComisiones, consultarDesglose, consultarLiquidaciones, listarBarberosComisiones } from '../../api/consultar_comisiones/comisionesApi';
import ComisionesTabla from '../../components/consultar_comisiones/ComisionesTabla';
import { fechaComision, monedaComision } from '../../utils/consultar_comisiones/formatoComisiones';
import type { BarberoComisiones, ConsultaComisiones, DesgloseComisiones, FiltrosComisiones, LiquidacionComisiones } from '../../types/consultar_comisiones';

function periodoInicial(): FiltrosComisiones {
  const partes = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/La_Paz', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const year = partes.find(p => p.type === 'year')!.value;
  const month = partes.find(p => p.type === 'month')!.value;
  const ultimo = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
  return { fechaInicio: `${year}-${month}-01`, fechaFin: `${year}-${month}-${ultimo}`, estado: 'TODAS' };
}

export default function ComisionesPage() {
  const { usuario, tienePermiso } = useAuth();
  const admin = usuario?.roles.includes('Administrador') ?? false;
  const permitido = tienePermiso('COMISION_CONSULTAR_PROPIA') && (admin || !!usuario?.roles.includes('Barbero'));
  const [barberos, setBarberos] = useState<BarberoComisiones[]>([]);
  const [cargandoBarberos, setCargandoBarberos] = useState(permitido && admin);
  const [errorBarberos, setErrorBarberos] = useState('');
  const [filtros, setFiltros] = useState<FiltrosComisiones>(periodoInicial);
  const [solicitud, setSolicitud] = useState<FiltrosComisiones>(periodoInicial);
  const [resultado, setResultado] = useState<ConsultaComisiones | null>(null);
  const [historial, setHistorial] = useState<LiquidacionComisiones[] | null>(null);
  const [cargando, setCargando] = useState(permitido && !admin);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const [errorHistorial, setErrorHistorial] = useState('');
  const [idPago, setIdPago] = useState<number | null>(null);
  const [desglose, setDesglose] = useState<DesgloseComisiones | null>(null);
  const [errorDesglose, setErrorDesglose] = useState('');
  const [recargaHistorial, setRecargaHistorial] = useState(0);
  const [recargaBarberos, setRecargaBarberos] = useState(0);

  useEffect(() => {
    if (!permitido || !admin) return;
    const abort = new AbortController();
    listarBarberosComisiones(abort.signal).then(data => {
      if (!abort.signal.aborted) { setBarberos(data); setErrorBarberos(''); }
    }).catch(err => {
      if (!abort.signal.aborted) setErrorBarberos(obtenerError(err).mensaje);
    }).finally(() => { if (!abort.signal.aborted) setCargandoBarberos(false); });
    return () => abort.abort();
  }, [admin, permitido, recargaBarberos]);

  useEffect(() => {
    if (!permitido || (admin && solicitud.empleadoId === undefined)) return;
    const abort = new AbortController();
    consultarComisiones(solicitud, abort.signal).then(data => {
      if (!abort.signal.aborted) { setResultado(data); setError(''); }
    }).catch(err => { if (!abort.signal.aborted) setError(obtenerError(err).mensaje); })
      .finally(() => { if (!abort.signal.aborted) setCargando(false); });
    return () => abort.abort();
  }, [solicitud, permitido, admin]);

  const empleadoMostrado = resultado?.barbero.idEmpleado;
  useEffect(() => {
    if (!permitido || tab !== 1 || empleadoMostrado === undefined) return;
    const abort = new AbortController();
    consultarLiquidaciones(admin ? empleadoMostrado : undefined, abort.signal).then(data => {
      if (!abort.signal.aborted) { setHistorial(data); setErrorHistorial(''); }
    }).catch(err => { if (!abort.signal.aborted) setErrorHistorial(obtenerError(err).mensaje); });
    return () => abort.abort();
  }, [tab, empleadoMostrado, admin, permitido, recargaHistorial]);

  useEffect(() => {
    if (idPago === null || empleadoMostrado === undefined) return;
    const abort = new AbortController();
    consultarDesglose(idPago, admin ? empleadoMostrado : undefined, abort.signal).then(data => {
      if (!abort.signal.aborted) setDesglose(data);
    }).catch(err => { if (!abort.signal.aborted) setErrorDesglose(obtenerError(err).mensaje); });
    return () => abort.abort();
  }, [idPago, empleadoMostrado, admin]);

  function buscar(e: FormEvent) {
    e.preventDefault();
    if (!filtros.fechaInicio || !filtros.fechaFin || filtros.fechaInicio > filtros.fechaFin) {
      setError('El rango de fechas no es válido'); return;
    }
    if (admin && filtros.empleadoId === undefined) { setError('Seleccione un barbero'); return; }
    if (resultado?.barbero.idEmpleado !== filtros.empleadoId && admin) setResultado(null);
    setError(''); setCargando(true); setSolicitud({ ...filtros });
    setHistorial(null); setErrorHistorial(''); setIdPago(null); setRecargaHistorial(n => n + 1);
  }

  if (!permitido) return <Stack spacing={2}><Alert severity="error">No tiene permiso para consultar comisiones</Alert><Button component={Link} to="/">Volver al menú principal</Button></Stack>;

  return <Stack spacing={2}>
    <PageHeader title="Comisiones" description="Consulta los servicios y productos que generaron comisiones y sus liquidaciones." />
    <Paper component="form" onSubmit={buscar} sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {admin && <TextField select label="Barbero" value={filtros.empleadoId ?? ''} required fullWidth
          onChange={e => setFiltros({ ...filtros, empleadoId: Number(e.target.value) })}>
          {barberos.map(b => <MenuItem value={b.idEmpleado} key={b.idEmpleado}>{b.nombre}</MenuItem>)}
        </TextField>}
        <TextField label="Fecha de inicio" type="date" value={filtros.fechaInicio} required fullWidth slotProps={{ inputLabel: { shrink: true } }} onChange={e => setFiltros({ ...filtros, fechaInicio: e.target.value })} />
        <TextField label="Fecha de fin" type="date" value={filtros.fechaFin} required fullWidth slotProps={{ inputLabel: { shrink: true } }} onChange={e => setFiltros({ ...filtros, fechaFin: e.target.value })} />
        <TextField select label="Estado" value={filtros.estado} fullWidth onChange={e => setFiltros({ ...filtros, estado: e.target.value })}>
          <MenuItem value="TODAS">Todos</MenuItem><MenuItem value="PENDIENTE">Pendiente</MenuItem><MenuItem value="LIQUIDADA">Liquidada</MenuItem>
        </TextField>
        <Button variant="contained" type="submit" disabled={cargando}>Buscar</Button>
      </Stack>
    </Paper>
    {cargandoBarberos && <LinearProgress aria-label="Cargando barberos" />}
    {admin && !cargandoBarberos && (errorBarberos || barberos.length === 0) && <Alert severity={errorBarberos ? 'error' : 'info'} action={<Button onClick={() => { setCargandoBarberos(true); setRecargaBarberos(n => n + 1); }}>Reintentar</Button>}>{errorBarberos || 'No hay barberos disponibles para seleccionar.'}</Alert>}
    {cargando && <LinearProgress aria-label="Consultando comisiones" />}
    {error && <Alert severity="error">{error}</Alert>}
    {!resultado && !error && admin && <Alert severity="info">Seleccione un barbero y presione Buscar.</Alert>}
    {resultado && <>
      <Typography variant="h6">{resultado.barbero.nombre}</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {([{ titulo: 'Hoy', resumen: resultado.dia }, { titulo: 'Mes en curso', resumen: resultado.mes }]).map(({ titulo, resumen }) => <Paper key={titulo} sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle2">{titulo} · {resumen.serviciosAtendidos} servicios atendidos</Typography>
          <Typography>Generada: {monedaComision(resumen.generada)}</Typography>
          <Typography variant="body2" color="text.secondary">Pendiente: {monedaComision(resumen.pendiente)} · Liquidada: {monedaComision(resumen.liquidada)}</Typography>
        </Paper>)}
      </Stack>
      <Typography variant="body2">Consulta del {fechaComision(resultado.fechaInicio)} al {fechaComision(resultado.fechaFin)} · {resultado.estado === 'TODAS' ? 'Todos los estados' : resultado.estado === 'PENDIENTE' ? 'Pendiente' : 'Liquidada'}</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        {[
          ['Comisión generada', monedaComision(resultado.periodo.generada)],
          ['Pendiente de liquidar', monedaComision(resultado.periodo.pendiente)],
          ['Ya liquidado', monedaComision(resultado.periodo.liquidada)],
          ['Servicios atendidos', resultado.periodo.serviciosAtendidos],
        ].map(([label, value]) => <Paper key={label} sx={{ p: 2 }}><Typography variant="body2" color="text.secondary">{label}</Typography><Typography variant="h5" sx={{ mt: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography></Paper>)}
      </Box>
      <Tabs value={tab} onChange={(_, value: number) => setTab(value)} aria-label="Consulta de comisiones" variant="scrollable">
        <Tab label="Detalle de comisiones" id="comisiones-tab" aria-controls="comisiones-panel" />
        <Tab label="Historial de liquidaciones" id="liquidaciones-tab" aria-controls="liquidaciones-panel" />
      </Tabs>
      {tab === 0 && <Paper role="tabpanel" id="comisiones-panel" aria-labelledby="comisiones-tab">
        {resultado.detalle.length ? <ComisionesTabla lineas={resultado.detalle} /> : <Alert severity="info">No tiene comisiones registradas en este período{resultado.estado !== 'TODAS' ? ' con el estado seleccionado' : ''}.</Alert>}
      </Paper>}
      {tab === 1 && <Stack role="tabpanel" id="liquidaciones-panel" aria-labelledby="liquidaciones-tab" spacing={1}>
        <Typography variant="body2" color="text.secondary">Historial completo del barbero. Los filtros de fechas y estado se aplican al detalle de comisiones.</Typography>
        {errorHistorial ? <Alert severity="error" action={<Button onClick={() => { setErrorHistorial(''); setRecargaHistorial(n => n + 1); }}>Reintentar</Button>}>{errorHistorial}</Alert> : historial === null ? <LinearProgress /> : historial.length === 0 ? <Alert severity="info">Aún no tiene liquidaciones registradas.</Alert> :
          <Paper><ResponsiveTable columns={['Liquidación', 'Fecha de pago', 'Servicios', 'Productos (unidades)', 'Monto pagado', 'Detalle']}>
            <TableHead><TableRow>{['Liquidación', 'Fecha de pago', 'Servicios', 'Productos (unidades)', 'Monto pagado', 'Detalle'].map(c => <TableCell key={c}>{c}</TableCell>)}</TableRow></TableHead>
            <TableBody>{historial.map(p => <TableRow key={p.idPago}><TableCell>#{p.idPago}</TableCell><TableCell>{fechaComision(p.fecha)}</TableCell><TableCell>{p.servicios}</TableCell><TableCell>{p.productos}</TableCell><TableCell>{monedaComision(p.montoTotal)}</TableCell><TableCell><Button onClick={() => { setDesglose(null); setErrorDesglose(''); setIdPago(p.idPago); }}>Ver desglose</Button></TableCell></TableRow>)}</TableBody>
          </ResponsiveTable></Paper>}
      </Stack>}
    </>}
    <Dialog open={idPago !== null} onClose={() => setIdPago(null)} fullWidth maxWidth="lg">
      <DialogTitle>Desglose de liquidación #{idPago}</DialogTitle>
      <DialogContent>{errorDesglose ? <Alert severity="error">{errorDesglose}</Alert> : !desglose ? <LinearProgress /> : <Stack spacing={2}>
        <Typography>{desglose.barbero.nombre} · {fechaComision(desglose.liquidacion.fecha)} · Total pagado: {monedaComision(desglose.liquidacion.montoTotal)}</Typography>
        <ComisionesTabla lineas={desglose.detalle} />
      </Stack>}</DialogContent>
      <DialogActions><Button onClick={() => setIdPago(null)}>Cerrar</Button></DialogActions>
    </Dialog>
    <Typography variant="caption" color="text.secondary">Consulta de solo lectura. Los pagos se registran desde Liquidaciones.</Typography>
  </Stack>;
}
