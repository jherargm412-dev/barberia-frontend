import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { confirmarPagoQr, generarQrAnticipo } from '../../api/registrar_pago_anticipo/anticiposApi';
import type { PagoAnticipo, QrAnticipo } from '../../types/registrar_pago_anticipo';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { QRCodeSVG } from 'qrcode.react';
import ComprobanteAnticipo from '../../components/registrar_pago_anticipo/ComprobanteAnticipo';
import { MENSAJES_PAGO_WEB } from '../../constants/registrar_pago_anticipo';
import { formatearMonto } from '../../utils/gestionar_citas/citaForm';

/** "07:05" a partir de 425 segundos. */
function formatearTiempo(segundos: number) {
  const m = String(Math.floor(segundos / 60)).padStart(2, '0');
  const s = String(segundos % 60).padStart(2, '0');
  return `${m}:${s}`;
}

/** CU14 flujo A: el cliente paga por la web, con un QR, el anticipo de la cita que acaba de solicitar. */
export default function PagoAnticipoPage() {
  const { id } = useParams();
  const idReserva = Number(id);
  const navigate = useNavigate();

  const [qr, setQr] = useState<QrAnticipo | null>(null);
  const [error, setError] = useState('');
  const [generando, setGenerando] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [comprobante, setComprobante] = useState<PagoAnticipo | null>(null);
  const [ahora, setAhora] = useState(() => Date.now());

  /** Pide un QR nuevo. Sirve tanto al abrir la pantalla como cuando el anterior venció. */
  const generar = useCallback(async () => {
    setError('');
    setGenerando(true);
    setQr(null);
    try {
      setQr(await generarQrAnticipo(idReserva));
    } catch (err) {
      // Ej.: "El pago en línea no está disponible en este momento" (no hay caja abierta) o la cita no es pendiente.
      setError(obtenerError(err).mensaje);
    } finally {
      setGenerando(false);
    }
  }, [idReserva]);

  // Al abrir la pantalla se pide el QR.
  useEffect(() => {
    void generar();
  }, [generar]);

  // Mientras hay un QR vigente, se actualiza el reloj cada segundo para la cuenta regresiva.
  useEffect(() => {
    if (!qr) return;
    const temporizador = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(temporizador);
  }, [qr]);

  const segundosRestantes = qr ? Math.max(0, Math.floor((new Date(qr.venceEn).getTime() - ahora) / 1000)) : 0;
  const vencido = qr !== null && segundosRestantes === 0;

  /** Flujo A, pasos 4 a 7: el cliente dice que pagó; el backend verifica el QR y confirma la cita. */
  async function confirmar() {
    if (!qr) return;
    setError('');
    setConfirmando(true);
    try {
      const respuesta = await confirmarPagoQr(idReserva, { referencia: qr.referencia });
      setComprobante(respuesta.pago);
    } catch (err) {
      // Ej.: "El pago no ha sido confirmado. Verifique la transacción e intente nuevamente" (flujo 5a).
      setError(obtenerError(err).mensaje);
    } finally {
      setConfirmando(false);
    }
  }

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Pagar anticipo
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2, maxWidth: 720 }}>
          {error}
        </Alert>
      )}
      {generando && <CircularProgress />}

      {!generando && !qr && (
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={() => void generar()}>
            Intentar de nuevo
          </Button>
          <Button onClick={() => navigate('/')}>Volver al inicio</Button>
        </Stack>
      )}

      {qr && !comprobante && (
        <Paper sx={{ p: 3, maxWidth: 720 }}>
          <Stack spacing={2} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              {MENSAJES_PAGO_WEB.INSTRUCCION}
            </Typography>
            <Typography variant="h5">Monto a pagar: {formatearMonto(qr.monto)}</Typography>
            <QRCodeSVG value={qr.contenido} size={220} style={{ opacity: vencido ? 0.2 : 1 }} />
            <Typography variant="caption" color="text.secondary">
              Referencia {qr.referencia}
            </Typography>
            {vencido ? (
              <Alert severity="warning">{MENSAJES_PAGO_WEB.QR_VENCIDO}</Alert>
            ) : (
              <Typography variant="body2">
                El código vence en <strong>{formatearTiempo(segundosRestantes)}</strong>
              </Typography>
            )}
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button onClick={() => navigate('/')} disabled={confirmando}>
                Pagar más tarde
              </Button>
              {vencido ? (
                <Button variant="contained" onClick={() => void generar()}>
                  Generar nuevo QR
                </Button>
              ) : (
                <Button variant="contained" onClick={() => void confirmar()} disabled={confirmando}>
                  {confirmando ? 'Verificando...' : 'Confirmar pago'}
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      )}

      {comprobante && <ComprobanteAnticipo pago={comprobante} onCerrar={() => navigate('/')} />}
    </>
  );
}