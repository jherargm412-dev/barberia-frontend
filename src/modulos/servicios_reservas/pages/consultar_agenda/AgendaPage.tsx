import PageHeader from '../../../../shared/components/PageHeader';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../seguridad_usuarios';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { listarAgenda, listarBarberosAgenda } from '../../api/consultar_agenda/agendaApi';
import AgendaFiltros from '../../components/consultar_agenda/AgendaFiltros';
import AgendaLista from '../../components/consultar_agenda/AgendaLista';
import AgendaSemana from '../../components/consultar_agenda/AgendaSemana';
import CitaDetalleDialog from '../../components/consultar_agenda/CitaDetalleDialog';
import { MENSAJES_AGENDA, PERMISOS_AGENDA } from '../../constants/consultar_agenda';
import { PERMISOS_ANTICIPO } from '../../constants/registrar_pago_anticipo';
import type { BarberoAgenda, CitaAgenda, FiltrosAgenda } from '../../types/consultar_agenda';
import {
  capitalizar,
  formatearFechaLarga,
  formatearRangoSemana,
  hoy,
} from '../../utils/consultar_agenda/agendaFormato';

/** Lo que se muestra: las citas y los filtros con los que se obtuvieron. */
interface Resultado {
  filtros: FiltrosAgenda;
  citas: CitaAgenda[];
}

/**
 * CU16: agenda diaria (hoy por defecto) o semanal según el permiso del usuario. Solo lectura:
 * las citas se cambian desde CU11.
 */
export default function AgendaPage() {
  const navigate = useNavigate();
  const { tienePermiso } = useAuth();
  const verTodas = tienePermiso(PERMISOS_AGENDA.TODAS);
  const puedeVer = verTodas || tienePermiso(PERMISOS_AGENDA.PROPIA);

  const [filtros, setFiltros] = useState<FiltrosAgenda>({ fecha: hoy(), vista: 'DIA', estado: '', barberoId: '' });
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [barberos, setBarberos] = useState<BarberoAgenda[]>([]);
  const [cargando, setCargando] = useState(puedeVer);
  const [error, setError] = useState('');
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
      .then((citas) => {
        if (!vigente) return;
        setResultado({ filtros, citas });
        setError('');
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

  const mostrada = resultado?.filtros ?? filtros;
  const semana = mostrada.vista === 'SEMANA';
  const citas = resultado?.citas ?? [];

  return (
    <Stack spacing={2}>
      <PageHeader title="Agenda de Citas"
        description={semana ? `Semana ${formatearRangoSemana(mostrada.fecha)}` : capitalizar(formatearFechaLarga(mostrada.fecha))} />

      <AgendaFiltros
        valores={filtros}
        barberos={barberos}
        puedeFiltrarBarbero={verTodas}
        onBuscar={aplicar}
      />

      {cargando && <LinearProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {resultado && !cargando && !error && citas.length === 0 && (
        <Alert severity="info">{semana ? MENSAJES_AGENDA.SIN_CITAS_SEMANA : MENSAJES_AGENDA.SIN_CITAS}</Alert>
      )}
      {citas.length > 0 &&
        (semana ? (
          <AgendaSemana citas={citas} fecha={mostrada.fecha} mostrarBarbero={verTodas} onSeleccionar={setSeleccionada} />
        ) : (
          <AgendaLista citas={citas} agrupar={verTodas} onSeleccionar={setSeleccionada} />
        ))}

      {seleccionada !== null && (
        <CitaDetalleDialog
          key={seleccionada}
          idReserva={seleccionada}
          puedeGestionar={verTodas}
          puedeCobrar={tienePermiso(PERMISOS_ANTICIPO.COBRAR)}
          onCerrar={() => setSeleccionada(null)}
          onCambio={() => aplicar({ ...filtros })}
        />
      )}
    </Stack>
  );
}
