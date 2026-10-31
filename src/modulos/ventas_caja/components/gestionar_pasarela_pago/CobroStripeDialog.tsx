import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { useState, type FormEvent } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { confirmarCobroStripe, iniciarCobroStripe } from '../../api/gestionar_pasarela_pago/pasarelaPagoApi';
import { confirmarCobroTarjetaVenta, iniciarCobroTarjetaVenta } from '../../api/registrar_venta/ventasApi';
import type { CobroStripeIniciado, CobroTarjeta, EstadoStripe } from '../../types/gestionar_pasarela_pago';
import { moneda } from '../../utils/gestionar_caja/formato';

// Stripe.js se descarga una sola vez por clave pública.
const cargados = new Map<string, Promise<Stripe | null>>();
function stripePara(clavePublica: string) {
  if (!cargados.has(clavePublica)) cargados.set(clavePublica, loadStripe(clavePublica));
  return cargados.get(clavePublica)!;
}

interface Props {
  pasarela: EstadoStripe;
  onCerrar: () => void;
  onCobrado: (cobro: CobroTarjeta) => void;
  concepto?: string;
  monto?: number;
}

/** Venta con tarjeta: 1) concepto y monto, 2) datos de la tarjeta en el formulario seguro de Stripe. */
export default function CobroStripeDialog({ pasarela, onCerrar, onCobrado, concepto: conceptoFijo, monto: montoFijo }: Props) {
  const [concepto, setConcepto] = useState(conceptoFijo ?? '');
  const [monto, setMonto] = useState(montoFijo === undefined ? '' : montoFijo.toFixed(2));
  const [cobro, setCobro] = useState<CobroStripeIniciado | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const esVenta = conceptoFijo !== undefined && montoFijo !== undefined;

  async function preparar(evento: FormEvent) {
    evento.preventDefault();
    if (!concepto.trim() || !/^\d+(?:\.\d{1,2})?$/.test(monto) || Number(monto) <= 0) {
      setError('Ingrese un concepto y un monto válido'); return;
    }
    setProcesando(true); setError('');
    try {
      const iniciar = esVenta ? iniciarCobroTarjetaVenta : iniciarCobroStripe;
      setCobro(await iniciar(concepto.trim(), Number(monto)));
    }
    catch (err) { setError(obtenerError(err).mensaje); }
    finally { setProcesando(false); }
  }

  return (
    <Dialog open onClose={procesando || cobro ? undefined : onCerrar} fullWidth maxWidth="sm">
      <DialogTitle>Cobrar con tarjeta (Stripe)</DialogTitle>
      {!cobro ? (
        <Box component="form" onSubmit={preparar}>
          <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {esVenta ? (
              <Typography>{concepto} · {moneda(Number(monto))}</Typography>
            ) : <>
              <TextField autoFocus label="Concepto" value={concepto} onChange={(e) => setConcepto(e.target.value)}
                slotProps={{ htmlInput: { maxLength: 100 } }} required />
              <TextField label={`Monto (${pasarela.moneda ?? 'BOB'})`} type="number" value={monto}
                onChange={(e) => setMonto(e.target.value)} slotProps={{ htmlInput: { min: '0.01', step: '0.01' } }} required />
            </>}
          </Stack></DialogContent>
          <DialogActions>
            <Button onClick={onCerrar} disabled={procesando}>Cancelar</Button>
            <Button type="submit" variant="contained" loading={procesando}>Continuar al pago</Button>
          </DialogActions>
        </Box>
      ) : (
        <Elements stripe={stripePara(cobro.clavePublica)} options={{ clientSecret: cobro.clientSecret }}>
          <PagoConTarjeta cobro={cobro} resumen={`${concepto.trim()} · ${moneda(Number(monto))}`}
            confirmar={esVenta ? confirmarCobroTarjetaVenta : confirmarCobroStripe}
            modoPrueba={pasarela.modo !== 'PRODUCCION'} onCerrar={onCerrar} onCobrado={onCobrado} />
        </Elements>
      )}
    </Dialog>
  );
}

interface PropsPago {
  cobro: CobroStripeIniciado;
  resumen: string;
  confirmar: (paymentIntentId: string) => Promise<CobroTarjeta>;
  modoPrueba: boolean;
  onCerrar: () => void;
  onCobrado: (cobro: CobroTarjeta) => void;
}

/** Stripe cobra la tarjeta; luego el backend verifica el pago y lo registra en la caja. */
function PagoConTarjeta({ cobro, resumen, confirmar, modoPrueba, onCerrar, onCobrado }: PropsPago) {
  const stripe = useStripe();
  const elements = useElements();
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  // Si Stripe ya cobró pero falló el registro, solo se reintenta el registro (nunca un segundo cobro).
  const [pagado, setPagado] = useState(false);

  async function registrar() {
    try { onCobrado(await confirmar(cobro.paymentIntentId)); }
    catch (err) { setError(`El pago se cobró, pero no se pudo registrar en la caja: ${obtenerError(err).mensaje}`); }
  }

  async function pagar(evento: FormEvent) {
    evento.preventDefault();
    if (!stripe || !elements) return;
    setProcesando(true); setError('');
    try {
      if (!pagado) {
        const resultado = await stripe.confirmPayment({ elements, redirect: 'if_required' });
        if (resultado.error) { setError(resultado.error.message ?? 'El pago con tarjeta no se completó'); return; }
        if (resultado.paymentIntent.status !== 'succeeded') { setError('El pago con tarjeta no se completó'); return; }
        setPagado(true);
      }
      await registrar();
    } finally { setProcesando(false); }
  }

  return (
    <Box component="form" onSubmit={pagar}>
      <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
        <Typography color="text.secondary">{resumen}</Typography>
        {modoPrueba && <Alert severity="info">Modo prueba: use la tarjeta 4242 4242 4242 4242, cualquier fecha futura y cualquier CVC.</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        {!pagado && <PaymentElement />}
      </Stack></DialogContent>
      <DialogActions>
        {!pagado && <Button onClick={onCerrar} disabled={procesando}>Cancelar</Button>}
        <Button type="submit" variant="contained" loading={procesando} disabled={!stripe}>
          {pagado ? 'Reintentar registro' : 'Pagar'}
        </Button>
      </DialogActions>
    </Box>
  );
}
