import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../../shared/components/PageHeader';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { useAuth } from '../../../seguridad_usuarios';
import { listarMisCitas } from '../../api/solicitar_cita/solicitudesApi';
import EstadoCitaChip from '../../components/gestionar_citas/EstadoCitaChip';
import { PERMISOS_ANTICIPO } from '../../constants/registrar_pago_anticipo';
import { MENSAJES_SOLICITUD } from '../../constants/solicitar_cita';
import type { Cita } from '../../types/gestionar_citas';
import { formatearFecha, formatearMonto } from '../../utils/gestionar_citas/citaForm';
import { horaDe } from '../../utils/solicitar_cita/solicitudForm';

/** CU12 + CU14: las citas del cliente, para pagar el anticipo de las pendientes antes de que venzan. */
export default function MisCitasPage() {
  const navigate = useNavigate();
  const { tienePermiso } = useAuth();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listarMisCitas()
      .then(setCitas)
      .catch((err) => setError(obtenerError(err).mensaje))
      .finally(() => setCargando(false));
  }, []);

  const puedePagar = tienePermiso(PERMISOS_ANTICIPO.PAGAR_PROPIO);

  return (
    <>
      <PageHeader
        title="Mis citas"
        description="Sus citas y el estado del anticipo."
        action={
          <Button variant="contained" onClick={() => navigate('/solicitar-cita')}>
            Solicitar cita
          </Button>
        }
      />
      {cargando && <LinearProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!cargando && !error && citas.length === 0 && <Alert severity="info">{MENSAJES_SOLICITUD.SIN_CITAS}</Alert>}

      <Stack spacing={2} sx={{ maxWidth: 720 }}>
        {citas.map((c) => {
          const porPagar = c.estado === 'PENDIENTE' && !c.anticipoPagado;
          return (
            <Paper key={c.idReserva} sx={{ p: 2 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="subtitle1">
                    {c.servicio.nombre} · {c.barbero?.nombre ?? 'Sin asignar'}
                  </Typography>
                  <Typography variant="body2">
                    {formatearFecha(c.fecha)} · {c.horaInicio}–{c.horaFin}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Anticipo {formatearMonto(c.montoAnticipo)} · {c.anticipoPagado ? 'pagado' : 'sin pagar'}
                  </Typography>
                  {porPagar && c.pagarAntesDe && (
                    <Typography variant="body2" color="warning.main">
                      Pague antes de las {horaDe(c.pagarAntesDe)} o la cita se cancelará
                    </Typography>
                  )}
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <EstadoCitaChip estado={c.estado} />
                  {porPagar && puedePagar && (
                    <Button variant="contained" size="small" onClick={() => navigate(`/pagar-anticipo/${c.idReserva}`)}>
                      Pagar anticipo
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </>
  );
}
