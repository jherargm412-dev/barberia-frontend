import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { AVISO_VERIFICAR_QR, MAX_REFERENCIA_QR, METODOS_PAGO } from '../../constants/registrar_pago_anticipo';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { useState, type FormEvent } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { registrarAnticipo } from '../../api/registrar_pago_anticipo/anticiposApi';
import type { Cita } from '../../types/gestionar_citas';
import type { MetodoPagoAnticipo, RespuestaPagoAnticipo } from '../../types/registrar_pago_anticipo';
import { formatearMonto } from '../../utils/gestionar_citas/citaForm';
import { faltanteMixto, prepararCobro } from '../../utils/registrar_pago_anticipo/anticipoForm';

interface Props {
  /** La página monta el diálogo solo mientras está abierto, así cada cobro empieza con el formulario limpio. */
  cita: Cita;
  onCerrar: () => void;
  /** Se llama con el comprobante cuando el backend registró el cobro. */
  onCobrado: (respuesta: RespuestaPagoAnticipo) => void;
}

/** CU14 flujo B: cobro del anticipo en mostrador (efectivo, QR o mixto). */
export default function RegistrarAnticipoDialog({ cita, onCerrar, onCobrado }: Props) {
  const [metodo, setMetodo] = useState<MetodoPagoAnticipo>('EFECTIVO');
  const [efectivo, setEfectivo] = useState('');
  const [qr, setQr] = useState('');
  const [referencia, setReferencia] = useState('');
  const [errores, setErrores] = useState<Record<string, string | undefined>>({});
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  /** Al cambiar de método se limpian los errores: los de un método no aplican al otro. */
  function cambiarMetodo(nuevo: MetodoPagoAnticipo) {
    setMetodo(nuevo);
    setErrores({});
    setError('');
  }

  async function cobrar(e: FormEvent) {
    e.preventDefault();
    setError('');
    const { errores: locales, pedido } = prepararCobro(cita.montoAnticipo, { metodo, efectivo, qr, referencia });
    setErrores(locales);
    if (!pedido) {
      setError(locales.monto ?? (Object.values(locales).find(Boolean) as string));
      return;
    }
    setGuardando(true);
    try {
      const respuesta = await registrarAnticipo(cita.idReserva, pedido);
      onCobrado(respuesta);
    } catch (err) {
      const { mensaje, campos } = obtenerError(err);
      setError(mensaje);
      setErrores(campos);
    } finally {
      setGuardando(false);
    }
  }

    // Solo en MIXTO: cuánto falta (o sobra) para llegar al anticipo, mientras se escribe.
  const faltante = metodo === 'MIXTO' ? faltanteMixto(cita.montoAnticipo, efectivo, qr) : null;
  
  return (
    <Dialog open onClose={onCerrar} fullWidth maxWidth="sm">
      <form onSubmit={cobrar} noValidate>
        <DialogTitle>Cobrar anticipo</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {cita.cliente.nombre} · {cita.servicio.nombre}. Anticipo a cobrar (20 %):{' '}
            <strong>{formatearMonto(cita.montoAnticipo)}</strong>.
          </DialogContentText>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              select
              label="Método de pago"
              value={metodo}
              onChange={(e) => cambiarMetodo(e.target.value as MetodoPagoAnticipo)}
              helperText={
                metodo === 'MIXTO'
                  ? 'Indique cuánto paga en efectivo y cuánto por QR'
                  : `Se cobrará ${formatearMonto(cita.montoAnticipo)} completo`
              }
            >
              {METODOS_PAGO.map((m) => (
                <MenuItem key={m.valor} value={m.valor}>
                  {m.etiqueta}
                </MenuItem>
              ))}
            </TextField>

            {metodo === 'MIXTO' && (
              <>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Efectivo (Bs)"
                    required
                    value={efectivo}
                    onChange={(e) => {
                      setEfectivo(e.target.value);
                      setErrores((x) => ({ ...x, montoEfectivo: undefined }));
                    }}
                    error={!!errores.montoEfectivo}
                    helperText={errores.montoEfectivo ?? ' '}
                    sx={{ flex: 1 }}
                    slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                  />
                  <TextField
                    label="QR (Bs)"
                    required
                    value={qr}
                    onChange={(e) => {
                      setQr(e.target.value);
                      setErrores((x) => ({ ...x, montoQr: undefined }));
                    }}
                    error={!!errores.montoQr}
                    helperText={errores.montoQr ?? ' '}
                    sx={{ flex: 1 }}
                    slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                  />
                </Stack>
                {faltante !== null && (
                  <Typography variant="body2" color={faltante === 0 ? 'success.main' : 'text.secondary'}>
                    {faltante === 0
                      ? 'El desglose cuadra con el anticipo'
                      : faltante > 0
                        ? `Faltan ${formatearMonto(faltante)}`
                        : `Sobran ${formatearMonto(-faltante)}`}
                  </Typography>
                )}
              </>
            )}

            {metodo !== 'EFECTIVO' && (
              <>
                <Alert severity="warning">{AVISO_VERIFICAR_QR}</Alert>
                <TextField
                  label="Referencia de la transacción (opcional)"
                  value={referencia}
                  onChange={(e) => {
                    setReferencia(e.target.value);
                    setErrores((x) => ({ ...x, referenciaQr: undefined }));
                  }}
                  error={!!errores.referenciaQr}
                  helperText={errores.referenciaQr ?? 'Número de la transacción del banco, para poder auditarla'}
                  slotProps={{ htmlInput: { maxLength: MAX_REFERENCIA_QR } }}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCerrar} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={guardando}>
            {guardando ? 'Registrando...' : 'Confirmar recepción del pago'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}