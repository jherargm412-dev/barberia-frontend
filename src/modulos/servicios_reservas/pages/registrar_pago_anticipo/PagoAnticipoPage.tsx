import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { confirmarPagoQr, generarQrAnticipo } from '../../api/registrar_pago_anticipo/anticiposApi';
import ComprobanteAnticipo from '../../components/registrar_pago_anticipo/ComprobanteAnticipo';
import PagoQrAnticipo from '../../components/registrar_pago_anticipo/PagoQrAnticipo';
import type { PagoAnticipo } from '../../types/registrar_pago_anticipo';

/** CU14 flujo A: el cliente (con cuenta) paga por la web, con un QR, el anticipo de su cita. */
export default function PagoAnticipoPage() {
  const idReserva = Number(useParams().id);
  const navigate = useNavigate();
  const [comprobante, setComprobante] = useState<PagoAnticipo | null>(null);

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Pagar anticipo
      </Typography>
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
