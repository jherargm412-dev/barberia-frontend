import CreditCardIcon from '@mui/icons-material/CreditCard';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../../shared/components/PageHeader';
import Table from '../../../../shared/components/ResponsiveTable';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { useAuth } from '../../../seguridad_usuarios';
import {
  cambiarEstadoPasarela, listarCobrosTarjeta, listarPasarelas, obtenerEstadoStripe,
} from '../../api/gestionar_pasarela_pago/pasarelaPagoApi';
import CobroStripeDialog from '../../components/gestionar_pasarela_pago/CobroStripeDialog';
import { PERMISOS_PASARELA } from '../../constants/gestionar_pasarela_pago';
import type { CobroTarjeta, EstadoStripe, PasarelaPago } from '../../types/gestionar_pasarela_pago';
import { fecha, hoyBolivia, moneda } from '../../utils/gestionar_caja/formato';

/** Muestra solo el inicio de la clave pública. */
const claveCorta = (clave: string | null) => (clave ? `${clave.slice(0, 12)}…` : '—');

/** CU Gestionar pasarela de pago: basta con poder cobrar o poder gestionar las pasarelas. */
export default function PasarelaPagoPage() {
  const { tienePermiso } = useAuth();
  if (!tienePermiso(PERMISOS_PASARELA.COBRAR) && !tienePermiso(PERMISOS_PASARELA.GESTIONAR)) {
    return <Alert severity="error">No tienes permiso para acceder a esta sección.</Alert>;
  }
  return <PasarelaPagoContenido />;
}

/** Catálogo de pasarelas, cobro con tarjeta (Stripe) y cobros realizados. */
function PasarelaPagoContenido() {
  const { tienePermiso } = useAuth();
  const navigate = useNavigate();
  const puedeGestionar = tienePermiso(PERMISOS_PASARELA.GESTIONAR);
  const puedeCobrar = tienePermiso(PERMISOS_PASARELA.COBRAR);
  const [pasarelas, setPasarelas] = useState<PasarelaPago[]>([]);
  const [stripe, setStripe] = useState<EstadoStripe | null>(null);
  const [cobros, setCobros] = useState<CobroTarjeta[]>([]);
  const [escritos, setEscritos] = useState({ desde: hoyBolivia(-30), hasta: hoyBolivia() });
  const [filtros, setFiltros] = useState(escritos);
  const [cargando, setCargando] = useState(true);
  const [cambiando, setCambiando] = useState<number | null>(null);
  const [cobrando, setCobrando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  // Cambia tras un cobro o al activar/desactivar, para recargar el estado de Stripe.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vigente = true;
    Promise.all([listarPasarelas(), obtenerEstadoStripe()])
      .then(([lista, estado]) => { if (vigente) { setPasarelas(lista); setStripe(estado); } })
      .catch((err) => { if (vigente) setError(obtenerError(err).mensaje); });
    return () => { vigente = false; };
  }, [version]);

  useEffect(() => {
    let vigente = true;
    listarCobrosTarjeta(filtros.desde, filtros.hasta)
      .then((lista) => { if (vigente) setCobros(lista); })
      .catch((err) => { if (vigente) { setCobros([]); setError(obtenerError(err).mensaje); } })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [filtros, version]);

  function buscar(e: FormEvent) {
    e.preventDefault();
    setCargando(true); setError('');
    setFiltros({ ...escritos });
  }

  async function cambiarEstado(pasarela: PasarelaPago, activo: boolean) {
    setCambiando(pasarela.idMetodoPago); setError(''); setMensaje('');
    try {
      await cambiarEstadoPasarela(pasarela.idMetodoPago, activo);
      setMensaje(`Pasarela ${pasarela.nombre} ${activo ? 'activada' : 'desactivada'}`);
      setVersion((v) => v + 1);
    } catch (err) { setError(obtenerError(err).mensaje); }
    finally { setCambiando(null); }
  }

  return <>
    <PageHeader title="Pasarela de pago" description="Cobros con tarjeta mediante Stripe; el dinero entra a la caja abierta."
      action={puedeCobrar && stripe?.disponible && stripe.idCajaAbierta !== null
        ? <Button variant="contained" startIcon={<CreditCardIcon />} onClick={() => { setMensaje(''); setCobrando(true); }}>
            Cobrar con tarjeta
          </Button>
        : undefined} />
    {mensaje && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMensaje('')}>{mensaje}</Alert>}
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {stripe && pasarelas.some((p) => p.proveedor === 'STRIPE' && !p.configurada) &&
      <Alert severity="warning" sx={{ mb: 2 }}>
        Stripe no tiene claves configuradas en el servidor (STRIPE_SECRET_KEY y STRIPE_PUBLISHABLE_KEY).
      </Alert>}
    {puedeCobrar && stripe?.disponible && stripe.idCajaAbierta === null &&
      <Alert severity="info" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={() => navigate('/caja')}>Ir a caja</Button>}>
        Abra una caja para poder cobrar con tarjeta.
      </Alert>}

    <Typography variant="h6" sx={{ mb: 1 }}>Pasarelas</Typography>
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Table columns={['Nombre', 'Descripción', 'Proveedor', 'Modo', 'Moneda', 'Clave pública', 'Estado']} sx={{ minWidth: 750 }}>
        <TableHead><TableRow>
          <TableCell>Nombre</TableCell><TableCell>Descripción</TableCell><TableCell>Proveedor</TableCell>
          <TableCell>Modo</TableCell><TableCell>Moneda</TableCell><TableCell>Clave pública</TableCell><TableCell>Estado</TableCell>
        </TableRow></TableHead>
        <TableBody>
          {pasarelas.map((p) => <TableRow key={p.idMetodoPago}>
            <TableCell>{p.nombre}</TableCell>
            <TableCell>{p.descripcion ?? '—'}</TableCell>
            <TableCell>{p.proveedor === 'NINGUNO' ? 'Interna' : p.proveedor}</TableCell>
            <TableCell>{p.modo ? <Chip size="small" variant="outlined" label={p.modo === 'PRUEBA' ? 'Prueba' : 'Producción'}
              color={p.modo === 'PRUEBA' ? 'warning' : 'success'} /> : '—'}</TableCell>
            <TableCell>{p.moneda}</TableCell>
            <TableCell sx={{ fontFamily: 'monospace' }}>{p.editable ? claveCorta(p.apiKey) : '—'}</TableCell>
            <TableCell>
              {p.editable && puedeGestionar
                ? <Switch checked={p.activo} disabled={cambiando === p.idMetodoPago}
                    onChange={(e) => cambiarEstado(p, e.target.checked)} slotProps={{ input: { 'aria-label': `Activar ${p.nombre}` } }} />
                : <Chip size="small" label={p.activo ? 'Activa' : 'Inactiva'} color={p.activo ? 'success' : 'default'} />}
            </TableCell>
          </TableRow>)}
        </TableBody>
      </Table>
    </TableContainer>

    <Typography variant="h6" sx={{ mb: 1 }}>Cobros con tarjeta</Typography>
    <Paper component="form" onSubmit={buscar} noValidate sx={{ p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <TextField type="date" label="Desde" value={escritos.desde}
        onChange={(e) => setEscritos({ ...escritos, desde: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
      <TextField type="date" label="Hasta" value={escritos.hasta}
        onChange={(e) => setEscritos({ ...escritos, hasta: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
      <Button type="submit" variant="contained" startIcon={<SearchIcon />}>Buscar</Button>
    </Paper>
    {cargando && <LinearProgress />}
    <TableContainer component={Paper}>
      <Table columns={['Fecha', 'Caja', 'Concepto', 'Monto', 'Referencia', 'Responsable']} sx={{ minWidth: 750 }}>
        <TableHead><TableRow>
          <TableCell>Fecha</TableCell><TableCell>Caja</TableCell><TableCell>Concepto</TableCell>
          <TableCell align="right">Monto</TableCell><TableCell>Referencia</TableCell><TableCell>Responsable</TableCell>
        </TableRow></TableHead>
        <TableBody>
          {!cargando && cobros.length === 0 && <TableRow><TableCell colSpan={6} align="center">No hay cobros con tarjeta en este rango</TableCell></TableRow>}
          {cobros.map((c) => <TableRow key={c.idMovimientoCaja}>
            <TableCell>{fecha(c.fecha)}</TableCell><TableCell>#{c.idCaja}</TableCell><TableCell>{c.concepto}</TableCell>
            <TableCell align="right">{moneda(c.monto)}</TableCell>
            <TableCell sx={{ fontFamily: 'monospace' }}>{c.referencia}</TableCell><TableCell>{c.responsable}</TableCell>
          </TableRow>)}
        </TableBody>
      </Table>
    </TableContainer>

    {cobrando && stripe && <CobroStripeDialog pasarela={stripe} onCerrar={() => setCobrando(false)}
      onCobrado={(c) => {
        setCobrando(false);
        setMensaje(`Cobro con tarjeta registrado en la caja #${c.idCaja}: ${moneda(c.monto)}`);
        setVersion((v) => v + 1);
      }} />}
  </>;
}
