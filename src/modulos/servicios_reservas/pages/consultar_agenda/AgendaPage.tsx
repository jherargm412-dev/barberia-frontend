import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../seguridad_usuarios';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { listarAgenda, listarBarberosAgenda } from '../../api/consultar_agenda/agendaApi';
import AgendaFiltros from '../../components/consultar_agenda/AgendaFiltros';
import AgendaLista from '../../components/consultar_agenda/AgendaLista';
import CitaDetalleDialog from '../../components/consultar_agenda/CitaDetalleDialog';
import { MENSAJES_AGENDA, PERMISOS_AGENDA } from '../../constants/consultar_agenda';
import type { BarberoAgenda, CitaAgenda, FiltrosAgenda } from '../../types/consultar_agenda';
import { formatearFechaLarga, hoy } from '../../utils/consultar_agenda/agendaFormato';

/**
 * CU16: agenda del día (hoy por defecto) según el permiso del usuario. Solo lectura:
 * las citas se cambian desde CU11.
 */
export default function AgendaPage() {
  const navigate = useNavigate();
  const { tienePermiso } = useAuth();
  const verTodas = tienePermiso(PERMISOS_AGENDA.TODAS);
  const puedeVer = verTodas || tienePermiso(PERMISOS_AGENDA.PROPIA);

  const [filtros, setFiltros] = useState<FiltrosAgenda>({ fecha: hoy(), estado: '', barberoId: '' });
  const [citas, setCitas] = useState<CitaAgenda[]>([]);
  const [barberos, setBarberos] = useState<BarberoAgenda[]>([]);
  const [cargando, setCargando] = useState(puedeVer);
  const [error, setError] = useState('');
  const [consultada, setConsultada] = useState(false);
  const [seleccionada, setSeleccionada] = useState<number | null>(null);

  useEffect(() => {
    if (!verTodas) return;
    listarBarberosAgenda()
      .then(setBarberos)
      .catch(() => setBarberos([]));
  }, [verTodas]);

  useEffect(() => {
    if (!puedeVer) return;
    let vigente = true;
    listarAgenda(filtros)
      .then((lista) => {
        if (!vigente) return;
        setCitas(lista);
        setError('');
        setConsultada(true);
      })
      .catch((err) => {
        // Si falla (por ejemplo, una fecha que el backend rechaza), se conserva la última consulta.
        if (vigente) setError(obtenerError(err).mensaje);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [filtros, puedeVer]);

  function aplicar(nuevos: FiltrosAgenda) {
    setCargando(true);
    setFiltros(nuevos);
  }

  // Flujo 2a: sin permiso de agenda, mensaje y vuelta al menú (el backend responde 403 a cualquier consulta).
  if (!puedeVer) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">{MENSAJES_AGENDA.SIN_PERMISO}</Alert>
        <Button variant="outlined" onClick={() => navigate('/')} sx={{ alignSelf: 'flex-start' }}>
          Volver al menú
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5">Agenda de citas</Typography>
        <Typography color="text.secondary" sx={{ textTransform: 'capitalize' }}>
          {formatearFechaLarga(filtros.fecha)}
        </Typography>
      </Box>

      <AgendaFiltros
        valores={filtros}
        barberos={barberos}
        puedeFiltrarBarbero={verTodas}
        onBuscar={aplicar}
      />

      {cargando && <LinearProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!cargando && !error && consultada && citas.length === 0 && (
        <Alert severity="info">{MENSAJES_AGENDA.SIN_CITAS}</Alert>
      )}
      {citas.length > 0 && (
        <AgendaLista citas={citas} agrupar={verTodas} onSeleccionar={setSeleccionada} />
      )}

      {seleccionada !== null && (
        <CitaDetalleDialog
          key={seleccionada}
          idReserva={seleccionada}
          puedeGestionar={verTodas}
          onCerrar={() => setSeleccionada(null)}
        />
      )}
    </Stack>
  );
}
