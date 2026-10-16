import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { confirmarPagoQr, generarQrAnticipo } from '../../api/registrar_pago_anticipo/anticiposApi';
import ComprobanteAnticipo from '../../components/registrar_pago_anticipo/ComprobanteAnticipo';
import PagoQrAnticipo from '../../components/registrar_pago_anticipo/PagoQrAnticipo';
import type { PagoAnticipo } from '../../types/registrar_pago_anticipo';
import { horaDe } from '../../utils/solicitar_cita/solicitudForm';

/** CU14 flujo A: el cliente (con cuenta) paga por la web, con un QR, el anticipo de su cita. */
export default function PagoAnticipoPage() {
  const idReserva = Number(useParams().id);
  const navigate = useNavigate();
  // Al llegar recién solicitada la cita (CU12): su mensaje y la hora límite para pagar.
  const recien = useLocation().state as { mensaje?: string; pagarAntesDe?: string | null } | null;
  const [comprobante, setComprobante] = useState<PagoAnticipo | null>(null);

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Pagar anticipo
      </Typography>
      {!comprobante && recien?.mensaje && (
        <Stack spacing={2} sx={{ mb: 2, maxWidth: 720 }}>
          <Alert severity="success">{recien.mensaje}</Alert>
          {recien.pagarAntesDe && (
            <Alert severity="warning">
              Tiene hasta las <strong>{horaDe(recien.pagarAntesDe)}</strong> para pagar el anticipo. Si no lo paga,
              la cita se cancela automáticamente y el horario queda libre.
            </Alert>
          )}
        </Stack>
      )}
      {!comprobante && (
        <PagoQrAnticipo
          generar={() => generarQrAnticipo(idReserva)}
          confirmar={(referencia) => confirmarPagoQr(idReserva, { referencia })}
          onPagado={setComprobante}
          onSalir={() => navigate('/mis-citas')}
          textoSalir="Pagar más tarde"
        />
      )}
      {comprobante && <ComprobanteAnticipo pago={comprobante} onCerrar={() => navigate('/mis-citas')} />}
    </>
  );
}
