import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { MENSAJES_PAGO_WEB } from '../../constants/registrar_pago_anticipo';
import type { PagoAnticipo, QrAnticipo, RespuestaPagoAnticipo } from '../../types/registrar_pago_anticipo';
import { formatearMonto } from '../../utils/gestionar_citas/citaForm';

/** "07:05" a partir de 425 segundos. */
function formatearTiempo(segundos: number) {
  const m = String(Math.floor(segundos / 60)).padStart(2, '0');
  const s = String(segundos % 60).padStart(2, '0');
  return `${m}:${s}`;
}

interface Props {
  /** Pide un QR nuevo (cliente con cuenta: por id de cita; invitado: por el código de su enlace). */
  generar: () => Promise<QrAnticipo>;
  /** El backend verifica el pago del QR y confirma la cita. */
  confirmar: (referencia: string) => Promise<RespuestaPagoAnticipo>;
  /** Se llama con el comprobante cuando el pago quedó registrado. */
  onPagado: (pago: PagoAnticipo) => void;
  /** "Pagar más tarde" / volver. */
  onSalir: () => void;
  textoSalir: string;
}

/** CU14 flujo A: QR con el monto exacto, cuenta regresiva y confirmación del pago. */
export default function PagoQrAnticipo({ generar, confirmar, onPagado, onSalir, textoSalir }: Props) {
  const [qr, setQr] = useState<QrAnticipo | null>(null);
  const [error, setError] = useState('');
  const [generando, setGenerando] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [ahora, setAhora] = useState(() => Date.now());
  // Cada pedido de QR suma 1: al abrir (0) y cuando el anterior venció o falló.
  const [pedido, setPedido] = useState(0);

  // Pide el QR. La bandera "vigente" descarta una respuesta vieja (p. ej. el doble montaje de StrictMode).
  useEffect(() => {
    let vigente = true;
    generar()
      .then((nuevo) => vigente && setQr(nuevo))
      // Ej.: "El pago en línea no está disponible en este momento" (no hay caja abierta) o la cita no es pendiente.
      .catch((err) => vigente && setError(obtenerError(err).mensaje))
      .finally(() => vigente && setGenerando(false));
    return () => {
      vigente = false;
    };
    // "generar" cambia en cada render de la página; el QR solo se vuelve a pedir con "pedido".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedido]);

  // Mientras hay un QR vigente, se actualiza el reloj cada segundo para la cuenta regresiva.
  useEffect(() => {
    if (!qr) return;
    const temporizador = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(temporizador);
  }, [qr]);

  function nuevoQr() {
    setError('');
    setQr(null);
    setGenerando(true);
    setPedido((n) => n + 1);
  }

  // venceEn llega en hora de Bolivia sin zona: se le agrega -04:00 para que la cuenta sea correcta en cualquier navegador.
  const segundosRestantes = qr
    ? Math.max(0, Math.floor((new Date(`${qr.venceEn}-04:00`).getTime() - ahora) / 1000))
    : 0;
  const vencido = qr !== null && segundosRestantes === 0;

  /** Flujo A, pasos 4 a 7: el cliente dice que pagó; el backend verifica el QR y confirma la cita. */
  async function confirmarPago() {
    if (!qr) return;
    setError('');
    setConfirmando(true);
    try {
      onPagado((await confirmar(qr.referencia)).pago);
    } catch (err) {
      // Ej.: "El pago no ha sido confirmado. Verifique la transacción e intente nuevamente" (flujo 5a).
      setError(obtenerError(err).mensaje);
    } finally {
      setConfirmando(false);
    }
  }

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2, maxWidth: 720 }}>
          {error}
        </Alert>
      )}
      {generando && <CircularProgress />}

      {!generando && !qr && (
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={nuevoQr}>
            Intentar de nuevo
          </Button>
          <Button onClick={onSalir}>{textoSalir}</Button>
        </Stack>
      )}

      {qr && (
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
              <Button onClick={onSalir} disabled={confirmando}>
                {textoSalir}
              </Button>
              {vencido ? (
                <Button variant="contained" onClick={nuevoQr}>
                  Generar nuevo QR
                </Button>
              ) : (
                <Button variant="contained" onClick={() => void confirmarPago()} disabled={confirmando}>
                  {confirmando ? 'Verificando...' : 'Confirmar pago'}
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      )}
    </>
  );
}
