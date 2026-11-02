import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { useEffect, useState, type FormEvent } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { CAMPO_PAGO_EN_BARBERIA, MENSAJES_PAGO_WEB } from '../../constants/registrar_pago_anticipo';
import type { AnticipoTarjeta, PagoAnticipo, RespuestaPagoAnticipo } from '../../types/registrar_pago_anticipo';
import { formatearMonto } from '../../utils/gestionar_citas/citaForm';

// Stripe.js se descarga una sola vez por clave pública.
const cargados = new Map<string, Promise<Stripe | null>>();
function stripePara(clavePublica: string) {
  if (!cargados.has(clavePublica)) cargados.set(clavePublica, loadStripe(clavePublica));
  return cargados.get(clavePublica)!;
}

interface Props {
  /** Prepara el cobro en Stripe (cliente con cuenta: por id de cita; invitado: por el código de su enlace). */
  iniciar: () => Promise<AnticipoTarjeta>;
  /** El backend verifica el cobro con Stripe y confirma la cita. */
  confirmar: (paymentIntentId: string) => Promise<RespuestaPagoAnticipo>;
  /** Se llama con el comprobante cuando el pago quedó registrado. */
  onPagado: (pago: PagoAnticipo) => void;
  /** "Pagar más tarde" / volver. */
  onSalir: () => void;
  textoSalir: string;
}

/** CU14 flujo A: el cliente paga el anticipo exacto con tarjeta en el formulario seguro de Stripe (CU29). */
export default function PagoTarjetaAnticipo({ iniciar, confirmar, onPagado, onSalir, textoSalir }: Props) {
  const [cobro, setCobro] = useState<AnticipoTarjeta | null>(null);
  const [error, setError] = useState('');
  const [preparando, setPreparando] = useState(true);
  // Anticipo menor al mínimo de la tarjeta: se paga en la barbería, así que reintentar no sirve.
  const [enBarberia, setEnBarberia] = useState(false);
  // Cada intento suma 1: al abrir (0) y al pulsar "Intentar de nuevo".
  const [pedido, setPedido] = useState(0);

  // Prepara el cobro. La bandera "vigente" descarta una respuesta vieja (p. ej. el doble montaje de StrictMode).
  useEffect(() => {
    let vigente = true;
    iniciar()
      .then((nuevo) => vigente && setCobro(nuevo))
      // Ej.: "El pago en línea no está disponible en este momento" (no hay caja abierta) o la cita no es pendiente.
      .catch((err) => {
        if (!vigente) return;
        const { mensaje, campos } = obtenerError(err);
        setError(mensaje);
        setEnBarberia(CAMPO_PAGO_EN_BARBERIA in campos);
      })
      .finally(() => vigente && setPreparando(false));
    return () => {
      vigente = false;
    };
    // "iniciar" cambia en cada render de la página; el cobro solo se vuelve a preparar con "pedido".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedido]);

  function reintentar() {
    setError('');
    setCobro(null);
    setPreparando(true);
    setPedido((n) => n + 1);
  }

  return (
    <>
      {error && (
        <Alert severity={enBarberia ? 'warning' : 'error'} sx={{ mb: 2, maxWidth: 720 }}>
          {error}
        </Alert>
      )}
      {preparando && <CircularProgress />}

      {!preparando && !cobro && (
        <Stack direction="row" spacing={2}>
          {!enBarberia && (
            <Button variant="contained" onClick={reintentar}>
              Intentar de nuevo
            </Button>
          )}
          <Button onClick={onSalir}>{textoSalir}</Button>
        </Stack>
      )}

      {cobro && (
        <Paper sx={{ p: 3, maxWidth: 720 }}>
          <Elements stripe={stripePara(cobro.clavePublica)} options={{ clientSecret: cobro.clientSecret }}>
            <FormularioTarjeta
              cobro={cobro}
              confirmar={confirmar}
              onPagado={onPagado}
              onSalir={onSalir}
              textoSalir={textoSalir}
            />
          </Elements>
        </Paper>
      )}
    </>
  );
}

interface PropsFormulario {
  cobro: AnticipoTarjeta;
  confirmar: (paymentIntentId: string) => Promise<RespuestaPagoAnticipo>;
  onPagado: (pago: PagoAnticipo) => void;
  onSalir: () => void;
  textoSalir: string;
}

/** Stripe cobra la tarjeta; luego el backend verifica el cobro y confirma la cita. */
function FormularioTarjeta({ cobro, confirmar, onPagado, onSalir, textoSalir }: PropsFormulario) {
  const stripe = useStripe();
  const elements = useElements();
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  // Si Stripe ya cobró pero falló el registro, solo se reintenta el registro (nunca un segundo cobro).
  const [pagado, setPagado] = useState(false);
  const modoPrueba = cobro.clavePublica.startsWith('pk_test_');

  async function registrar() {
    try {
      onPagado((await confirmar(cobro.paymentIntentId)).pago);
    } catch (err) {
      setError(`${MENSAJES_PAGO_WEB.COBRADO_SIN_REGISTRAR} ${obtenerError(err).mensaje}`);
    }
  }

  async function pagar(evento: FormEvent) {
    evento.preventDefault();
    if (!stripe || !elements) return;
    setProcesando(true);
    setError('');
    try {
      if (!pagado) {
        const resultado = await stripe.confirmPayment({ elements, redirect: 'if_required' });
        if (resultado.error) {
          setError(resultado.error.message ?? MENSAJES_PAGO_WEB.NO_COMPLETADO);
          return;
        }
        if (resultado.paymentIntent.status !== 'succeeded') {
          setError(MENSAJES_PAGO_WEB.NO_COMPLETADO);
          return;
        }
        setPagado(true);
      }
      await registrar();
    } finally {
      setProcesando(false);
    }
  }

  return (
    <Box component="form" onSubmit={pagar}>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {MENSAJES_PAGO_WEB.INSTRUCCION}
        </Typography>
        <Typography variant="h5">Monto a pagar: {formatearMonto(cobro.monto)}</Typography>
        {modoPrueba && <Alert severity="info">{MENSAJES_PAGO_WEB.MODO_PRUEBA}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        {!pagado && <PaymentElement />}
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
          {!pagado && (
            <Button onClick={onSalir} disabled={procesando}>
              {textoSalir}
            </Button>
          )}
          <Button type="submit" variant="contained" loading={procesando} disabled={!stripe}>
            {pagado ? 'Reintentar registro' : `Pagar ${formatearMonto(cobro.monto)}`}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
