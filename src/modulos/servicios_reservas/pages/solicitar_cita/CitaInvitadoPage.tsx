import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import {
  confirmarPagoQrInvitado,
  consultarCitaInvitado,
  generarQrInvitado,
} from '../../api/solicitar_cita/invitadoApi';
import BarraPublica from '../../components/consultar_servicios/BarraPublica';
import EstadoCitaChip from '../../components/gestionar_citas/EstadoCitaChip';
import ComprobanteAnticipo from '../../components/registrar_pago_anticipo/ComprobanteAnticipo';
import PagoQrAnticipo from '../../components/registrar_pago_anticipo/PagoQrAnticipo';
import type { Cita } from '../../types/gestionar_citas';
import type { PagoAnticipo } from '../../types/registrar_pago_anticipo';
import { formatearFecha, formatearMonto } from '../../utils/gestionar_citas/citaForm';
import { horaDe } from '../../utils/solicitar_cita/solicitudForm';

/**
 * "Mi cita" del invitado sin cuenta (pública): el enlace /mi-cita/:codigo es su única llave para ver la cita
 * y pagar el anticipo (CU14). Por eso se le pide guardarlo.
 */
export default function CitaInvitadoPage() {
  const codigo = useParams().codigo ?? '';
  const navigate = useNavigate();
  // Al llegar desde la reserva: su mensaje y el QR ya abierto para pagar.
  const estado = useLocation().state as { mensaje?: string; pagar?: boolean } | null;
  const mensajeInicial = estado?.mensaje ?? '';
  const [cita, setCita] = useState<Cita | null>(null);
  const [error, setError] = useState('');
  const [pagando, setPagando] = useState(estado?.pagar ?? false);
  const [comprobante, setComprobante] = useState<PagoAnticipo | null>(null);
  const [copiado, setCopiado] = useState(false);
  // Cambia tras pagar para volver a pedir la cita (queda Confirmada).
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vigente = true;
    consultarCitaInvitado(codigo)
      .then((c) => vigente && setCita(c))
      .catch((err) => vigente && setError(obtenerError(err).mensaje));
    return () => {
      vigente = false;
    };
  }, [codigo, version]);

  async function copiarEnlace() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  const porPagar = cita?.estado === 'PENDIENTE' && !cita.anticipoPagado;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <BarraPublica />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Mi cita
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {!cita && !error && <CircularProgress />}

        {cita && (
          <Stack spacing={2}>
            {/* "Pague el anticipo…" solo tiene sentido mientras falta pagar. */}
            {mensajeInicial && porPagar && <Alert severity="success">{mensajeInicial}</Alert>}
            <Alert
              severity="info"
              action={
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => void copiarEnlace()}
                >
                  {copiado ? 'Copiado' : 'Copiar enlace'}
                </Button>
              }
            >
              Guarde este enlace: es la única forma de volver a ver su cita y pagar el anticipo sin cuenta.
            </Alert>

            <Paper sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle1">
                  {cita.servicio.nombre} · {cita.barbero?.nombre ?? 'Sin asignar'}
                </Typography>
                <Typography variant="body2">
                  {formatearFecha(cita.fecha)} · {cita.horaInicio}–{cita.horaFin}
                </Typography>
                <Typography variant="body2">A nombre de: {cita.cliente.nombre} · tel. {cita.cliente.telefono}</Typography>
                <Typography variant="body2">
                  Anticipo: <strong>{formatearMonto(cita.montoAnticipo)}</strong> ·{' '}
                  {cita.anticipoPagado ? 'pagado' : 'sin pagar'}
                </Typography>
                <Box sx={{ alignSelf: 'flex-start' }}>
                  <EstadoCitaChip estado={cita.estado} />
                </Box>
              </Stack>
            </Paper>

            {porPagar && cita.pagarAntesDe && (
              <Alert severity="warning">
                Tiene hasta las <strong>{horaDe(cita.pagarAntesDe)}</strong> para pagar el anticipo. Si no lo paga, la
                cita se cancela automáticamente y el horario queda libre.
              </Alert>
            )}

            {porPagar && !pagando && (
              <Button variant="contained" sx={{ alignSelf: 'flex-start' }} onClick={() => setPagando(true)}>
                Pagar anticipo
              </Button>
            )}
            {porPagar && pagando && (
              <PagoQrAnticipo
                generar={() => generarQrInvitado(codigo)}
                confirmar={(referencia) => confirmarPagoQrInvitado(codigo, referencia)}
                onPagado={(pago) => {
                  setPagando(false);
                  setComprobante(pago);
                  setVersion((v) => v + 1);
                }}
                onSalir={() => setPagando(false)}
                textoSalir="Pagar más tarde"
              />
            )}

            <Button onClick={() => navigate('/')} sx={{ alignSelf: 'flex-start' }}>
              Volver al inicio
            </Button>
          </Stack>
        )}

        {comprobante && <ComprobanteAnticipo pago={comprobante} onCerrar={() => setComprobante(null)} />}
      </Container>
    </Box>
  );
}
