import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { solicitarCita } from '../../api/solicitar_cita/solicitudesApi';
import EstadoCitaChip from '../../components/gestionar_citas/EstadoCitaChip';
import SolicitudCitaForm from '../../components/solicitar_cita/SolicitudCitaForm';
import type { RespuestaSolicitudCita, SolicitarCitaRequest } from '../../types/solicitar_cita';
import { formatearFecha, formatearMonto } from '../../utils/gestionar_citas/citaForm';

/** CU12: el cliente solicita su cita desde la web. Queda PENDIENTE hasta pagar el anticipo (CU14). */
export default function SolicitarCitaPage() {
  const navigate = useNavigate();
  // null = todavía no envió la solicitud; con valor = la cita ya se creó.
  const [solicitada, setSolicitada] = useState<RespuestaSolicitudCita | null>(null);

  async function guardar(datos: SolicitarCitaRequest) {
    setSolicitada(await solicitarCita(datos));
  }

  if (solicitada) {
    const { reserva } = solicitada;
    return (
      <>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Solicitar cita
        </Typography>
        <Stack spacing={2} sx={{ maxWidth: 720 }}>
          <Alert severity="success">{solicitada.mensaje}</Alert>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle1">Su cita</Typography>
              <Typography variant="body2">Servicio: {reserva.servicio.nombre}</Typography>
              <Typography variant="body2">Barbero: {reserva.barbero?.nombre ?? 'Sin asignar'}</Typography>
              <Typography variant="body2">
                Fecha: {formatearFecha(reserva.fecha)} · {reserva.horaInicio}–{reserva.horaFin}
              </Typography>
              <Typography variant="body2">
                Anticipo a pagar: <strong>{formatearMonto(reserva.montoAnticipo)}</strong>
              </Typography>
              <EstadoCitaChip estado={reserva.estado} />
            </Stack>
          </Paper>
          <Stack direction="row" spacing={2}>
            <Button onClick={() => setSolicitada(null)}>Solicitar otra cita</Button>
            <Button onClick={() => navigate('/')}>Pagar más tarde</Button>
            <Button
              variant="contained"
              onClick={() => navigate(`/pagar-anticipo/${reserva.idReserva}`)}
            >
              Pagar anticipo ahora
            </Button>
          </Stack>
        </Stack>
      </>
    );
  }

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Solicitar cita
      </Typography>
      <SolicitudCitaForm onGuardar={guardar} onCancelar={() => navigate('/')} />
    </>
  );
}