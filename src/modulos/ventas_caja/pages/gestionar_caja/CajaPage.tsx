import PageHeader from '../../../../shared/components/PageHeader';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import LockIcon from '@mui/icons-material/Lock';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '../../../../shared/components/ResponsiveTable';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { useAuth } from '../../../seguridad_usuarios';
import { abrirCaja, cerrarCaja, listarMovimientos, obtenerCajaActual, registrarEgreso } from '../../api/gestionar_caja/cajaApi';
import { PERMISOS_CAJA } from '../../constants/gestionar_caja';
import type { Caja, MovimientoCaja } from '../../types/gestionar_caja';
import { fecha, moneda, resultadoArqueo } from '../../utils/gestionar_caja/formato';


/** Evita enviar importes negativos o con más de dos decimales. */
function importeValido(valor: string, aceptaCero: boolean) {
  return /^\d+(?:\.\d{1,2})?$/.test(valor) && Number.isFinite(Number(valor))
    && (aceptaCero ? Number(valor) >= 0 : Number(valor) > 0);
}

/** CU21: apertura, egresos y cierre; cada formulario conserva sus datos hasta confirmar o cancelar. */
export default function CajaPage() {
  const { tienePermiso } = useAuth();
  const navigate = useNavigate();
  const [caja, setCaja] = useState<Caja | null>(null);
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [dialogo, setDialogo] = useState<'abrir' | 'egreso' | 'cerrar' | null>(null);
  const [montoInicial, setMontoInicial] = useState('');
  const [concepto, setConcepto] = useState('');
  const [montoEgreso, setMontoEgreso] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [efectivoContado, setEfectivoContado] = useState('');
  const [observacionCierre, setObservacionCierre] = useState('');

  // Carga la caja vigente y sus movimientos al entrar; no necesita una petición para las cerradas.
  useEffect(() => {
    let vigente = true;
    obtenerCajaActual().then(async (actual) => {
      const lista = actual ? await listarMovimientos(actual.idCaja) : [];
      if (vigente) { setCaja(actual); setMovimientos(lista); }
    }).catch((err) => { if (vigente) setError(obtenerError(err).mensaje); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, []);

  async function refrescar(idCaja?: number) {
    const actual = await obtenerCajaActual();
    const cajaVisible = actual ?? (idCaja ? caja : null);
    setCaja(cajaVisible);
    setMovimientos(cajaVisible ? await listarMovimientos(cajaVisible.idCaja) : []);
  }

  function abrirDialogo(tipo: 'abrir' | 'egreso' | 'cerrar') {
    setError('');
    setMontoInicial(''); setConcepto(''); setMontoEgreso(''); setObservaciones('');
    setEfectivoContado(''); setObservacionCierre('');
    setDialogo(tipo);
  }

  /** Relee el saldo antes del arqueo por si hubo movimientos de otra sesión. */
  async function prepararCierre() {
    try {
      const actual = await obtenerCajaActual();
      if (!actual) { setError('La caja ya se encuentra cerrada'); setCaja(null); return; }
      setCaja(actual);
      setMovimientos(await listarMovimientos(actual.idCaja));
      abrirDialogo('cerrar');
    } catch (err) { setError(obtenerError(err).mensaje); }
  }

  // La diferencia se muestra antes de confirmar; una diferencia exige explicación.
  const diferencia = caja && importeValido(efectivoContado, true)
    ? Math.round((Number(efectivoContado) - caja.saldoEsperado) * 100) / 100 : null;

  async function confirmar(evento: FormEvent) {
    evento.preventDefault();
    if (!dialogo) return;
    if (dialogo === 'abrir' && !importeValido(montoInicial, true)) { setError('Ingrese un monto inicial válido'); return; }
    if (dialogo === 'egreso' && (!concepto.trim() || !importeValido(montoEgreso, false))) {
      setError('Ingrese un concepto y un monto de egreso válido'); return;
    }
    if (dialogo === 'cerrar' && (!importeValido(efectivoContado, true) || (diferencia !== 0 && !observacionCierre.trim()))) {
      setError(diferencia === null ? 'Ingrese un importe contado válido' : 'Explique el faltante o sobrante'); return;
    }
    setProcesando(true); setError('');
    try {
      if (dialogo === 'abrir') {
        const abierta = await abrirCaja(Number(montoInicial));
        setCaja(abierta); setMovimientos([]); setMensaje('Caja abierta correctamente');
      } else if (dialogo === 'egreso' && caja) {
        await registrarEgreso(caja.idCaja, concepto.trim(), Number(montoEgreso), observaciones.trim());
        await refrescar(caja.idCaja); setMensaje('Egreso registrado correctamente');
      } else if (dialogo === 'cerrar' && caja) {
        const cerrada = await cerrarCaja(caja.idCaja, Number(efectivoContado), observacionCierre.trim());
        setCaja(cerrada); setMensaje('Caja cerrada y arqueo guardado');
      }
      setDialogo(null);
    } catch (err) { setError(obtenerError(err).mensaje); }
    finally { setProcesando(false); }
  }

  return <>
    <PageHeader title="Caja" description="Controla la apertura, los egresos y el arqueo de la jornada."
      action={<Button startIcon={<HistoryIcon />} onClick={() => navigate('/caja/historial')}>Historial de cajas</Button>} />
    {mensaje && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMensaje('')}>{mensaje}</Alert>}
    {error && !dialogo && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {cargando && <LinearProgress />}
    {!cargando && !caja && <Paper sx={{ p: 3 }}>
      <Typography sx={{ mb: 2 }}>No hay una caja abierta.</Typography>
      {tienePermiso(PERMISOS_CAJA.ABRIR) && <Button variant="contained" startIcon={<AccountBalanceWalletIcon />}
        onClick={() => abrirDialogo('abrir')}>Abrir caja</Button>}
    </Paper>}
    {caja && <>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="h6">Caja #{caja.idCaja}</Typography>
            <Typography color="text.secondary">Abierta el {fecha(caja.fechaApertura)} por {caja.responsableApertura}</Typography>
          </Box>
          <Chip label={caja.estado === 'ABIERTA' ? 'Abierta' : 'Cerrada'} color={caja.estado === 'ABIERTA' ? 'success' : 'default'} />
        </Stack>
        <Stack sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))' }, gap: 2, mb: 3, '& > div': { bgcolor: 'action.hover', p: 2, borderRadius: 2 } }}>
          <Box><Typography color="text.secondary">Monto inicial</Typography><Typography variant="h6">{moneda(caja.montoInicial)}</Typography></Box>
          <Box><Typography color="text.secondary">Ingresos en efectivo</Typography><Typography variant="h6">{moneda(caja.ingresosEfectivo)}</Typography></Box>
          <Box><Typography color="text.secondary">Ingresos QR</Typography><Typography variant="h6">{moneda(caja.ingresosQr)}</Typography></Box>
          <Box><Typography color="text.secondary">Egresos en efectivo</Typography><Typography variant="h6">{moneda(caja.egresosEfectivo)}</Typography></Box>
          <Box><Typography color="text.secondary">Efectivo esperado</Typography><Typography variant="h6">{moneda(caja.saldoEsperado)}</Typography></Box>
        </Stack>
        {caja.estado === 'CERRADA' && <Alert severity="info" sx={{ mb: 2 }}>
          Contado: {moneda(caja.efectivoContado ?? 0)} · {resultadoArqueo(caja.diferencia).texto}
          {caja.observacionCierre && ` · ${caja.observacionCierre}`}
        </Alert>}
        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
          {caja.estado === 'ABIERTA' && tienePermiso(PERMISOS_CAJA.MOVIMIENTO) &&
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => abrirDialogo('egreso')}>Registrar egreso</Button>}
          {caja.estado === 'ABIERTA' && tienePermiso(PERMISOS_CAJA.CERRAR) &&
            <Button variant="contained" startIcon={<LockIcon />} onClick={prepararCierre}>Cerrar caja</Button>}
          {caja.estado === 'CERRADA' && tienePermiso(PERMISOS_CAJA.ABRIR) &&
            <Button variant="outlined" onClick={() => { setCaja(null); setMovimientos([]); abrirDialogo('abrir'); }}>Abrir nueva caja</Button>}
        </Stack>
      </Paper>
      <Typography variant="h6" sx={{ mb: 1 }}>Movimientos</Typography>
      <TableContainer component={Paper}><Table columns={["Fecha", "Tipo", "Concepto", "Método", "Monto", "Responsable"]} sx={{ minWidth: 650 }}><TableHead><TableRow>
        <TableCell>Fecha</TableCell><TableCell>Tipo</TableCell><TableCell>Concepto</TableCell>
        <TableCell>Método</TableCell><TableCell align="right">Monto</TableCell><TableCell>Responsable</TableCell>
      </TableRow></TableHead><TableBody>
        {movimientos.length === 0 && <TableRow><TableCell colSpan={6} align="center">No hay movimientos registrados</TableCell></TableRow>}
        {movimientos.map((m) => <TableRow key={m.idMovimientoCaja}>
          <TableCell>{fecha(m.fecha)}</TableCell><TableCell><Chip size="small" variant="outlined" color={m.tipo === 'INGRESO' ? 'success' : 'warning'} label={m.tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'} /></TableCell><TableCell>{m.concepto}</TableCell>
          <TableCell>{m.medioPago}</TableCell><TableCell align="right">{moneda(m.monto)}</TableCell><TableCell>{m.responsable}</TableCell>
        </TableRow>)}
      </TableBody></Table></TableContainer>
    </>}

    <Dialog open={dialogo !== null} onClose={procesando ? undefined : () => setDialogo(null)} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={confirmar}>
        <DialogTitle>{dialogo === 'abrir' ? 'Abrir caja' : dialogo === 'egreso' ? 'Registrar egreso' : 'Cerrar caja'}</DialogTitle>
        <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {dialogo === 'abrir' && <TextField autoFocus label="Monto inicial (Bs)" type="number" value={montoInicial}
            onChange={(e) => setMontoInicial(e.target.value)} slotProps={{ htmlInput: { min: 0, step: '0.01' } }} required />}
          {dialogo === 'egreso' && <>
            <TextField autoFocus label="Concepto" value={concepto} onChange={(e) => setConcepto(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 100 } }} required />
            <TextField label="Monto (Bs)" type="number" value={montoEgreso} onChange={(e) => setMontoEgreso(e.target.value)}
              slotProps={{ htmlInput: { min: '0.01', step: '0.01' } }} required />
            <TextField label="Observaciones (opcional)" value={observaciones} onChange={(e) => setObservaciones(e.target.value)}
              multiline rows={2} slotProps={{ htmlInput: { maxLength: 200 } }} />
          </>}
          {dialogo === 'cerrar' && <>
            <Alert severity="info">Efectivo esperado: {moneda(caja?.saldoEsperado ?? 0)}. Cuenta solo el dinero físico; QR se muestra aparte.</Alert>
            <TextField autoFocus label="Efectivo contado (Bs)" type="number" value={efectivoContado}
              onChange={(e) => setEfectivoContado(e.target.value)} slotProps={{ htmlInput: { min: 0, step: '0.01' } }} required />
            {diferencia !== null && <Alert severity={diferencia === 0 ? 'success' : 'warning'}>
              {diferencia === 0 ? 'Caja cuadrada' : diferencia > 0 ? `Sobrante: ${moneda(diferencia)}` : `Faltante: ${moneda(-diferencia)}`}
            </Alert>}
            {diferencia !== null && diferencia !== 0 && <TextField label="Observación de la diferencia" value={observacionCierre}
              onChange={(e) => setObservacionCierre(e.target.value)} multiline rows={2}
              slotProps={{ htmlInput: { maxLength: 300 } }} required />}
          </>}
        </Stack></DialogContent>
        <DialogActions><Button onClick={() => setDialogo(null)} disabled={procesando}>Cancelar</Button>
          <Button type="submit" variant="contained" loading={procesando}>Confirmar</Button></DialogActions>
      </Box>
    </Dialog>
  </>;
}
