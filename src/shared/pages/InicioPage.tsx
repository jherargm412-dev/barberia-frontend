import Table from '../components/ResponsiveTable';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonthOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import ScheduleIcon from '@mui/icons-material/ScheduleOutlined';
import WalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import EventIcon from '@mui/icons-material/EventOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, Skeleton, Stack, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../modulos/seguridad_usuarios';
import { listarAgenda } from '../../modulos/servicios_reservas/api/consultar_agenda/agendaApi';
import type { CitaAgenda } from '../../modulos/servicios_reservas/types/consultar_agenda';
import EstadoAgendaChip from '../../modulos/servicios_reservas/components/consultar_agenda/EstadoAgendaChip';
import { obtenerError } from '../utils/obtenerError';
import EmptyState from '../components/EmptyState';
import MetricCard from '../components/MetricCard';

import { relojNegocio, resumirAgenda } from '../utils/resumenInicio';

/** Inicio consulta solo la API de agenda existente y respeta su alcance de permisos. */
export default function InicioPage() {
  const { usuario, tienePermiso } = useAuth();
  const puedeVerTodas = tienePermiso('AGENDA_CONSULTAR');
  const puedeVerAgenda = puedeVerTodas || tienePermiso('AGENDA_CONSULTAR_PROPIA');
  const [reloj, setReloj] = useState(() => relojNegocio());
  const [citas, setCitas] = useState<CitaAgenda[] | null>(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(puedeVerAgenda);
  const [revision, setRevision] = useState(0);

  // Actualiza el día y evita mostrar como próximas las citas con horario ya pasado.
  useEffect(() => {
    const intervalo = window.setInterval(() => {
      const siguiente = relojNegocio();
      if (siguiente.fecha !== reloj.fecha && puedeVerAgenda) setCargando(true);
      setReloj(siguiente);
    }, 60_000);
    return () => window.clearInterval(intervalo);
  }, [reloj.fecha, puedeVerAgenda]);
  useEffect(() => {
    if (!puedeVerAgenda) return;
    let vigente = true;
    listarAgenda({ fecha: reloj.fecha, vista: 'DIA', estado: '', barberoId: '' })
      .then((datos) => { if (vigente) { setCitas(datos); setError(''); } })
      .catch((err) => { if (vigente) { setCitas(null); setError(obtenerError(err).mensaje); } })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [puedeVerAgenda, reloj.fecha, revision]);

  function actualizar() { setCargando(true); setError(''); setRevision((actual) => actual + 1); }
  const { programadas, atendidos, pendientes, proximas } = resumirAgenda(cargando || error ? null : citas, reloj.fecha, reloj.hora);
  const alcance = puedeVerTodas ? 'Agenda de hoy' : puedeVerAgenda ? 'Solo tu agenda de hoy' : 'Sin permiso de consulta de agenda';
  const detalle = error ? 'No se pudo consultar la agenda' : alcance;
  const accesos = [
    { nombre: 'Ver citas', detalle: 'Gestionar las reservas', ruta: '/citas', permiso: puedeVerTodas, icono: <EventIcon /> },
    { nombre: 'Agenda de Citas', detalle: 'Consultar la planificación', ruta: '/agenda', permiso: puedeVerAgenda, icono: <CalendarMonthIcon /> },
    { nombre: 'Clientes', detalle: 'Consultar tus registros', ruta: '/clientes', permiso: tienePermiso('CLIENTE_CONSULTAR'), icono: <PeopleIcon /> },
    { nombre: 'Caja', detalle: 'Revisar la jornada', ruta: '/caja', permiso: tienePermiso('CAJA_CONSULTAR'), icono: <WalletIcon /> },
  ].filter((acceso) => acceso.permiso);

  return <Stack spacing={3.5}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { sm: 'center' } }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="overline" color="primary.main">Resumen de actividad</Typography>
        <Typography component="h1" variant="h4" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>Bienvenido, {usuario?.nombre}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Este es el resumen de actividad de HOUSE of CUT.</Typography>
      </Box>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0, color: 'text.secondary' }}>
        <CalendarMonthIcon sx={{ fontSize: 18 }} />
        <Typography variant="body2">{new Date(`${reloj.fecha}T12:00:00-04:00`).toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/La_Paz' })}</Typography>
      </Stack>
    </Box>
    {error && <Alert severity="error" action={<Button color="inherit" onClick={actualizar}>Reintentar</Button>}>{error}</Alert>}
    <Grid container spacing={2} aria-busy={cargando}>
      <Grid size={{ xs: 12, sm: 6, xl: 3 }}><MetricCard label="Citas programadas para hoy" value={programadas} icon={<CalendarMonthIcon />} loading={cargando} detail={detalle} /></Grid>
      <Grid size={{ xs: 12, sm: 6, xl: 3 }}><MetricCard label="Clientes atendidos hoy" value={atendidos} icon={<CheckCircleIcon />} loading={cargando} detail={detalle} /></Grid>
      <Grid size={{ xs: 12, sm: 6, xl: 3 }}><MetricCard label="Ingresos del día" value={null} icon={<WalletIcon />} detail="No hay un resumen diario consolidado disponible" /></Grid>
      <Grid size={{ xs: 12, sm: 6, xl: 3 }}><MetricCard label="Citas pendientes" value={pendientes} icon={<ScheduleIcon />} loading={cargando} detail={detalle} /></Grid>
    </Grid>
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Box><Typography component="h2" variant="h6">Próximas citas</Typography><Typography variant="body2" color="text.secondary">Las siguientes reservas de hoy · {puedeVerTodas ? 'Todos los barberos' : 'Tu agenda'}</Typography></Box>
        {puedeVerAgenda && <Stack direction="row" spacing={1}>
          <Button size="small" onClick={actualizar} disabled={cargando} startIcon={<RefreshIcon />}>Actualizar</Button>
          <Button component={Link} to="/agenda" size="small" endIcon={<ArrowForwardIcon />}>Ver agenda</Button>
        </Stack>}
      </CardContent>
      {cargando ? <Box sx={{ px: 3, pb: 3 }}><Skeleton height={48} /><Skeleton height={48} /><Skeleton height={48} /></Box>
        : !puedeVerAgenda ? <EmptyState icon={<CalendarMonthIcon />} title="Agenda no disponible" description="Tu perfil no tiene permiso para consultar la agenda." />
        : error ? <EmptyState icon={<RefreshIcon />} title="No se pudieron cargar las citas" description="Reintenta la consulta para mostrar la actividad actual." />
        : proximas.length === 0 ? <EmptyState icon={<CalendarMonthIcon />} title="No hay próximas citas para hoy" description="Las reservas pendientes o confirmadas aparecerán aquí según su horario." />
        : <TableContainer sx={{ border: 0, borderRadius: 0 }}><Table columns={["Cliente", "Servicio", "Barbero", "Fecha y hora", "Estado"]} sx={{ minWidth: 740 }} aria-label="Próximas citas de hoy">
          <TableHead><TableRow><TableCell>Cliente</TableCell><TableCell>Servicio</TableCell><TableCell>Barbero</TableCell><TableCell>Fecha y hora</TableCell><TableCell>Estado</TableCell></TableRow></TableHead>
          <TableBody>{proximas.map((cita) => <TableRow key={cita.idReserva}>
            <TableCell sx={{ fontWeight: 600 }}>{cita.cliente.nombre}</TableCell><TableCell>{cita.servicio.nombre}</TableCell><TableCell>{cita.barbero?.nombre ?? 'Sin asignar'}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{cita.fecha.split('-').reverse().join('/')} · {cita.horaInicio.slice(0, 5)}</TableCell><TableCell><EstadoAgendaChip estado={cita.estado} /></TableCell>
          </TableRow>)}</TableBody>
        </Table></TableContainer>}
    </Card>
    <Box component="section" aria-label="Accesos rápidos">
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>Accesos rápidos</Typography>
      <Grid container spacing={2}>{accesos.map((acceso) => <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={acceso.ruta}>
        <Button component={Link} to={acceso.ruta} color="inherit" variant="outlined" fullWidth sx={{ justifyContent: 'flex-start', p: 2, gap: 1.5, textAlign: 'left', bgcolor: 'background.paper', height: '100%' }}>
          <Box sx={{ color: 'text.secondary', display: 'flex' }}>{acceso.icono}</Box><Box sx={{ flexGrow: 1 }}><Typography component="span" variant="body2" sx={{ fontWeight: 600, display: 'block' }}>{acceso.nombre}</Typography><Typography component="span" variant="caption" color="text.secondary">{acceso.detalle}</Typography></Box><ArrowForwardIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        </Button>
      </Grid>)}</Grid>
      {accesos.length === 0 && <Alert severity="info">Los apartados disponibles para tu perfil se muestran en el menú de navegación.</Alert>}
    </Box>
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
      <Typography variant="caption" color="text.secondary">Sesión actual</Typography>{usuario?.roles.map((rol) => <Chip key={rol} size="small" variant="outlined" label={rol} />)}
    </Stack>
  </Stack>;
}
