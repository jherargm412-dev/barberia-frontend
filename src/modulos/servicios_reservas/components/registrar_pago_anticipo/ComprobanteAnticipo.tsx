import PrintIcon from '@mui/icons-material/Print';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import GlobalStyles from '@mui/material/GlobalStyles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { ETIQUETAS_METODO } from '../../constants/registrar_pago_anticipo';
import type { PagoAnticipo } from '../../types/registrar_pago_anticipo';
import { formatearFecha, formatearMonto } from '../../utils/gestionar_citas/citaForm';
import EstadoCitaChip from '../gestionar_citas/EstadoCitaChip';

interface Props {
  pago: PagoAnticipo;
  onCerrar: () => void;
}

/** "2026-10-15T14:32:10" → "15/10/2026 14:32" */
function formatearFechaHora(iso: string) {
  const [fecha, hora = ''] = iso.split('T');
  return `${formatearFecha(fecha)} ${hora.slice(0, 5)}`;
}

/** Una línea del comprobante: etiqueta a la izquierda, valor a la derecha. */
function Fila({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
      <Typography variant="body2" color="text.secondary">
        {etiqueta}
      </Typography>
      <Typography variant="body2" component="div" sx={{ textAlign: 'right' }}>
        {children}
      </Typography>
    </Stack>
  );
}

/** CU14 paso final: comprobante del anticipo cobrado, para mostrar o imprimir. */
export default function ComprobanteAnticipo({ pago, onCerrar }: Props) {
  const { reserva } = pago;

  return (
    <Dialog open onClose={onCerrar} fullWidth maxWidth="xs">
      {/* Al imprimir, solo se ve el comprobante: se oculta todo lo demás de la página. */}
      <GlobalStyles
        styles={{
          '@media print': {
            'body *': { visibility: 'hidden' },
            '#comprobante-anticipo, #comprobante-anticipo *': { visibility: 'visible' },
            '#comprobante-anticipo': { position: 'fixed', left: 0, top: 0, width: '100%' },
          },
        }}
      />
      <DialogTitle>Anticipo registrado</DialogTitle>
      <DialogContent>
        <Box id="comprobante-anticipo">
          <Typography variant="h6">Comprobante de anticipo</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            N.º {pago.idPagoAnticipo} · {formatearFechaHora(pago.fechaPago)}
          </Typography>

          <Stack spacing={1}>
            <Fila etiqueta="Cliente">{reserva.cliente.nombre}</Fila>
            <Fila etiqueta="Servicio">{reserva.servicio.nombre}</Fila>
            <Fila etiqueta="Barbero">{reserva.barbero?.nombre ?? 'Sin asignar'}</Fila>
            <Fila etiqueta="Cita">
              {formatearFecha(reserva.fecha)} · {reserva.horaInicio}–{reserva.horaFin}
            </Fila>
            <Fila etiqueta="Estado">
              <EstadoCitaChip estado={reserva.estado} />
            </Fila>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1}>
            <Fila etiqueta="Método">{ETIQUETAS_METODO[pago.metodo]}</Fila>
            {pago.montoEfectivo > 0 && <Fila etiqueta="Efectivo">{formatearMonto(pago.montoEfectivo)}</Fila>}
            {pago.montoQr > 0 && <Fila etiqueta="QR">{formatearMonto(pago.montoQr)}</Fila>}
            {pago.referenciaQr && <Fila etiqueta="Referencia QR">{pago.referenciaQr}</Fila>}
            <Fila etiqueta="Anticipo cobrado">
              <strong>{formatearMonto(pago.montoTotal)}</strong>
            </Fila>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1}>
            <Fila etiqueta="Cobrado por">{pago.registradoPor}</Fila>
            <Fila etiqueta="Caja">N.º {pago.idCaja}</Fila>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button startIcon={<PrintIcon />} onClick={() => window.print()}>
          Imprimir
        </Button>
        <Button variant="contained" onClick={onCerrar}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}