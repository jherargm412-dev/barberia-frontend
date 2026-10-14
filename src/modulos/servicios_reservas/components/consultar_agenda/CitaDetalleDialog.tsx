import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { obtenerCitaAgenda } from '../../api/consultar_agenda/agendaApi';
import { ETIQUETAS_CANAL } from '../../constants/consultar_agenda';
import type { CitaAgendaDetalle } from '../../types/consultar_agenda';
import { formatearFecha, formatearFechaLarga, formatearMonto } from '../../utils/consultar_agenda/agendaFormato';
import EstadoAgendaChip from './EstadoAgendaChip';

interface Props {
  /** Se monta con key = id de la cita: cada cita carga su propio detalle. */
  idReserva: number;
  /** Recepcionista y Administrador ven las acciones que llevan a CU11 y CU14. */
  puedeGestionar: boolean;
  onCerrar: () => void;
}

/** Ficha de la cita, con el historial reciente del cliente y los accesos a CU11 y CU14. */
export default function CitaDetalleDialog({ idReserva, puedeGestionar, onCerrar }: Props) {
  const navigate = useNavigate();
  const [detalle, setDetalle] = useState<CitaAgendaDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;
    obtenerCitaAgenda(idReserva)
      .then((d) => {
        if (vigente) setDetalle(d);
      })
      .catch((err) => {
        if (vigente) setError(obtenerError(err).mensaje);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [idReserva]);

  const cita = detalle?.cita;

  /** CU11 abre el día de la cita (mismo mecanismo que usa al volver de "Nueva cita"). */
  function gestionarCita() {
    if (!cita) return;
    onCerrar();
    navigate('/citas', { state: { fecha: cita.fecha } });
  }

  /** CU14 todavía no existe: la ruta queda preparada y mostrará "no encontrado" hasta que se implemente. */
  function registrarAnticipo() {
    if (!cita) return;
    onCerrar();
    navigate(`/reservas/${cita.idReserva}/anticipo`);
  }

  return (
    <Dialog open onClose={onCerrar} fullWidth maxWidth="sm">
      <DialogTitle>Detalle de la cita</DialogTitle>
      <DialogContent dividers>
        {cargando && <LinearProgress sx={{ mb: 2 }} />}
        {error && <Alert severity="error">{error}</Alert>}
        {cita && detalle && (
          <Stack spacing={2}>
            <Stack spacing={1.5}>
              <Fila etiqueta="Cliente">{cita.cliente.nombre}</Fila>
              <Fila etiqueta="Teléfono">{cita.cliente.telefono ?? 'No registrado'}</Fila>
              <Fila etiqueta="Servicio">
                {cita.servicio.nombre} ({formatearMonto(cita.servicio.precio)})
              </Fila>
              <Fila etiqueta="Barbero">{cita.barbero?.nombre ?? 'Sin asignar'}</Fila>
              <Fila etiqueta="Fecha">
                <Box component="span" sx={{ textTransform: 'capitalize' }}>
                  {formatearFechaLarga(cita.fecha)}
                </Box>
              </Fila>
              <Fila etiqueta="Horario">
                {cita.horaInicio} – {cita.horaFin}
              </Fila>
              <Fila etiqueta="Canal">{ETIQUETAS_CANAL[cita.canal]}</Fila>
              <Fila etiqueta="Estado">
                <EstadoAgendaChip estado={cita.estado} />
              </Fila>
              <Fila etiqueta="Anticipo">{formatearMonto(cita.montoAnticipo)}</Fila>
            </Stack>

            <Divider />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Otras citas de este cliente
              </Typography>
              {detalle.historial.length === 0 ? (
                <Typography color="text.secondary">Sin otras citas registradas.</Typography>
              ) : (
                <Stack spacing={1}>
                  {detalle.historial.map((h) => (
                    <Stack
                      key={h.idReserva}
                      direction="row"
                      spacing={1}
                      sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <Typography variant="body2">
                        {formatearFecha(h.fecha)} · {h.horaInicio} · {h.servicio}
                      </Typography>
                      <EstadoAgendaChip estado={h.estado} />
                    </Stack>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1, px: 3, pb: 2 }}>
        {puedeGestionar && cita?.estado === 'PENDIENTE' && (
          <Button onClick={registrarAnticipo}>Registrar anticipo</Button>
        )}
        {puedeGestionar && cita && <Button onClick={gestionarCita}>Gestionar cita</Button>}
        <Button onClick={onCerrar}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}

/** Fila etiqueta + valor: en celular apila los dos textos, en pantallas más anchas van en línea. */
function Fila({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.5} sx={{ alignItems: { sm: 'center' } }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 110 }}>
        {etiqueta}
      </Typography>
      <Typography component="div" sx={{ fontWeight: 500, overflowWrap: 'anywhere' }}>
        {children}
      </Typography>
    </Stack>
  );
}
