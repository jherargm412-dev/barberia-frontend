import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type ReactNode } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { listarCatalogo } from '../../api/consultar_servicios/catalogoApi';
import { consultarDisponibilidadPublica, listarBarberosPublico } from '../../api/solicitar_cita/invitadoApi';
import { listarBarberosDelServicio } from '../../api/solicitar_cita/solicitudesApi';
import { consultarDisponibilidad } from '../../api/consultar_disponibilidad/disponibilidadApi';
import { DURACION_DEFECTO } from '../../constants/consultar_disponibilidad';
import { MENSAJES } from '../../constants/gestionar_citas';
import { MENSAJES_SOLICITUD, MINUTOS_PARA_PAGAR } from '../../constants/solicitar_cita';
import type { ServicioCatalogo } from '../../types/consultar_servicios';
import type { BarberoDisponible } from '../../types/gestionar_citas';
import type { SolicitarCitaRequest } from '../../types/solicitar_cita';
import {
  calcularAnticipo,
  formatearFechaLarga,
  formatearMonto,
  hoy,
  sumarDias,
} from '../../utils/gestionar_citas/citaForm';
import {
  aPedido,
  validarSolicitud,
  valoresInicialesSolicitud,
  type SolicitudValores,
} from '../../utils/solicitar_cita/solicitudForm';
import { resumenDia, useDiasDisponibles } from '../../utils/solicitar_cita/useDiasDisponibles';
import HorasLibresGrid from '../consultar_disponibilidad/HorasLibresGrid';

/** Nombre y teléfono de quien reserva sin cuenta (CU12 invitado). */
export interface ContactoInvitado {
  nombre: string;
  telefono: string;
}

// De dónde salen los datos: rutas públicas para el invitado, las de la sesión para el cliente con cuenta.
const FUENTES_CON_CUENTA = {
  barberos: listarBarberosDelServicio,
  disponibilidad: consultarDisponibilidad,
};
const FUENTES_INVITADO = {
  barberos: listarBarberosPublico,
  disponibilidad: consultarDisponibilidadPublica,
};

/** Días que se ven a la vez en la fila de fechas. */
const DIAS_VISIBLES = 14;

type Paso = 'servicio' | 'barbero' | 'fecha' | 'datos' | 'resumen';
const NOMBRES_PASO: Record<Paso, string> = {
  servicio: 'Servicio',
  barbero: 'Barbero',
  fecha: 'Fecha y hora',
  datos: 'Tus datos',
  resumen: 'Resumen y pago',
};

interface Props {
  /** Servicio ya elegido en el catálogo (CU13), si viene de ahí: se empieza por el barbero. */
  servicioInicial?: number;
  /**
   * Sin cuenta: agrega el paso de nombre y teléfono y usa las rutas públicas (barberos y horas libres).
   * Con cuenta (por defecto) el cliente se toma de la sesión.
   */
  invitado?: boolean;
  /** Sin cuenta: "Inicia sesión" del paso de datos. */
  onIniciarSesion?: () => void;
  /** Envía la solicitud al backend. Si lanza un error, el formulario lo muestra y conserva lo elegido. */
  onGuardar: (datos: SolicitarCitaRequest, contacto?: ContactoInvitado) => Promise<void>;
}

/** Tarjeta que se elige con un clic (servicio o barbero); la elegida queda con borde de color. */
function TarjetaOpcion({
  elegida,
  deshabilitada,
  onClick,
  children,
}: {
  elegida: boolean;
  deshabilitada?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: elegida ? 'primary.main' : 'divider',
        borderWidth: elegida ? 2 : 1,
        opacity: deshabilitada ? 0.5 : 1,
      }}
    >
      <CardActionArea onClick={onClick} disabled={deshabilitada} sx={{ p: 2, height: '100%' }}>
        {children}
      </CardActionArea>
    </Card>
  );
}

/** "Carlos Mamani" → "CM" */
function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

/** "2026-10-16" → { semana: "vie", dia: 16, mes: "oct" } */
function partesFecha(fecha: string) {
  const [a, m, d] = fecha.split('-').map(Number);
  const fechaLocal = new Date(a, m - 1, d);
  return {
    semana: fechaLocal.toLocaleDateString('es-BO', { weekday: 'short' }).replace('.', ''),
    dia: d,
    mes: fechaLocal.toLocaleDateString('es-BO', { month: 'short' }).replace('.', ''),
  };
}

function FilaResumen({ etiqueta, valor, fuerte }: { etiqueta: string; valor: string; fuerte?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1 }}>
      <Typography
        variant="body2"
        color={fuerte ? 'text.primary' : 'text.secondary'}
        sx={{ fontWeight: fuerte ? 600 : 400 }}
      >
        {etiqueta}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: fuerte ? 600 : 400, textAlign: 'right' }}>
        {valor}
      </Typography>
    </Box>
  );
}

/**
 * CU12 por pasos: servicio → barbero → fecha y hora libre (CU10) → [nombre y teléfono si no tiene cuenta] →
 * resumen con la política del anticipo. Al confirmar se crea la cita PENDIENTE y la página lleva al pago (CU14).
 * No se escriben horas a mano: solo se pueden pedir horarios que de verdad están libres.
 */
export default function SolicitudCitaForm({ servicioInicial, invitado = false, onIniciarSesion, onGuardar }: Props) {
  const fuentes = invitado ? FUENTES_INVITADO : FUENTES_CON_CUENTA;
  const pasos: Paso[] = invitado
    ? ['servicio', 'barbero', 'fecha', 'datos', 'resumen']
    : ['servicio', 'barbero', 'fecha', 'resumen'];

  const [indice, setIndice] = useState(servicioInicial ? 1 : 0);
  const [valores, setValores] = useState<SolicitudValores>(() => ({
    ...valoresInicialesSolicitud(),
    servicioId: servicioInicial ? String(servicioInicial) : '',
    fecha: '',
  }));
  const [contacto, setContacto] = useState<ContactoInvitado>({ nombre: '', telefono: '' });
  const [erroresContacto, setErroresContacto] = useState<Partial<ContactoInvitado>>({});
  const [servicios, setServicios] = useState<ServicioCatalogo[] | null>(null);
  // null = cargando (o sin servicio); [] = ningún barbero lo presta.
  const [barberos, setBarberos] = useState<BarberoDisponible[] | null>(null);
  const [desde, setDesde] = useState(hoy);
  const [version, setVersion] = useState(0);
  const [aceptaPolitica, setAceptaPolitica] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const paso = pasos[indice];

  // El catálogo público sirve igual con o sin sesión, y dice qué servicios se pueden reservar.
  useEffect(() => {
    listarCatalogo()
      .then((lista) => {
        setServicios(lista);
        // Un ?servicio= que no existe o no se puede reservar: se empieza eligiendo el servicio.
        if (servicioInicial && !lista.some((s) => s.idServicio === servicioInicial && s.reservable)) {
          setIndice(0);
          setValores((v) => ({ ...v, servicioId: '' }));
        }
      })
      .catch((err) => setErrorGeneral(obtenerError(err).mensaje));
    // Solo al montar: servicioInicial viene de la URL al abrir la página.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Barberos habilitados para el servicio elegido (CU17).
  useEffect(() => {
    if (!valores.servicioId) return;
    let vigente = true;
    fuentes
      .barberos(Number(valores.servicioId))
      .then((lista) => vigente && setBarberos(lista))
      .catch((err) => {
        if (!vigente) return;
        setBarberos([]);
        setErrorGeneral(obtenerError(err).mensaje);
      });
    return () => {
      vigente = false;
    };
  }, [valores.servicioId, fuentes]);

  // CU10 para cada día de la fila: cuántas horas libres tiene el barbero.
  const { dias, cargando: buscandoDias } = useDiasDisponibles(
    paso === 'fecha' && valores.servicioId && valores.empleadoId
      ? {
          servicioId: Number(valores.servicioId),
          empleadoId: Number(valores.empleadoId),
          desde,
          dias: DIAS_VISIBLES,
          version,
        }
      : null,
    fuentes.disponibilidad,
  );
  const diaElegido = dias.find((d) => d.fecha === valores.fecha);

  const servicio = servicios?.find((s) => String(s.idServicio) === valores.servicioId);
  const barbero = barberos?.find((b) => String(b.idEmpleado) === valores.empleadoId);

  function cambiar(cambios: Partial<SolicitudValores>) {
    setValores((anteriores) => ({ ...anteriores, ...cambios }));
    setErrorGeneral('');
  }

  function elegirServicio(id: number) {
    if (String(id) === valores.servicioId) return;
    setBarberos(null);
    cambiar({ servicioId: String(id), empleadoId: '', fecha: '', horaInicio: '', horaFin: '' });
  }

  function elegirBarbero(id: number) {
    if (String(id) === valores.empleadoId) return;
    cambiar({ empleadoId: String(id), fecha: '', horaInicio: '', horaFin: '' });
  }

  function moverDias(cantidad: number) {
    const nuevo = sumarDias(desde, cantidad);
    setDesde(nuevo < hoy() ? hoy() : nuevo);
    cambiar({ fecha: '', horaInicio: '', horaFin: '' });
  }

  function puedeContinuar() {
    if (paso === 'servicio') return !!valores.servicioId;
    if (paso === 'barbero') return !!valores.empleadoId;
    if (paso === 'fecha') return !!valores.horaInicio;
    if (paso === 'resumen') return aceptaPolitica;
    return true;
  }

  function continuar() {
    setErrorGeneral('');
    if (paso === 'datos') {
      const faltan: Partial<ContactoInvitado> = {};
      if (!contacto.nombre.trim()) faltan.nombre = 'Obligatorio';
      if (!contacto.telefono.trim()) faltan.telefono = 'Obligatorio';
      setErroresContacto(faltan);
      if (Object.keys(faltan).length > 0) {
        setErrorGeneral(MENSAJES.CAMPOS_VACIOS);
        return;
      }
    }
    if (paso === 'resumen') {
      void confirmar();
      return;
    }
    setIndice((i) => i + 1);
  }

  async function confirmar() {
    const { mensaje } = validarSolicitud(valores);
    if (mensaje) {
      setErrorGeneral(mensaje);
      return;
    }
    setEnviando(true);
    try {
      await onGuardar(aPedido(valores), invitado ? contacto : undefined);
    } catch (err) {
      const { mensaje: mensajeBackend, campos } = obtenerError(err);
      setErrorGeneral(mensajeBackend);
      if (campos.nombre || campos.telefono) {
        // Nombre o teléfono inválidos (o de un cliente con cuenta): se vuelve a ese paso.
        setErroresContacto({ nombre: campos.nombre, telefono: campos.telefono });
        setIndice(pasos.indexOf('datos'));
      } else {
        // Ej.: "El barbero ya tiene una cita en ese horario": se vuelve a elegir hora con datos frescos.
        cambiar({ horaInicio: '', horaFin: '' });
        setErrorGeneral(mensajeBackend);
        setVersion((v) => v + 1);
        setIndice(pasos.indexOf('fecha'));
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Paper variant="outlined" sx={{ maxWidth: 1000 }}>
      <Box sx={{ p: { xs: 2, sm: 3 }, overflowX: 'auto' }}>
        <Stepper activeStep={indice} alternativeLabel sx={{ minWidth: 520 }}>
          {pasos.map((p) => (
            <Step key={p}>
              <StepLabel>{NOMBRES_PASO[p]}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      <Divider />

      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {errorGeneral && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorGeneral}
          </Alert>
        )}

        {/* 1. Servicio */}
        {paso === 'servicio' && (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              ¿Qué servicio deseas?
            </Typography>
            {!servicios && !errorGeneral && <CircularProgress />}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              {servicios?.map((s) => (
                <TarjetaOpcion
                  key={s.idServicio}
                  elegida={String(s.idServicio) === valores.servicioId}
                  deshabilitada={!s.reservable}
                  onClick={() => elegirServicio(s.idServicio)}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {s.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                    {s.descripcion?.trim() || 'Sin descripción'}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Typography variant="caption" color="text.secondary">
                      {s.reservable
                        ? `Anticipo ${formatearMonto(calcularAnticipo(s.precio))}`
                        : 'Sin barberos disponibles'}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {formatearMonto(s.precio)}
                    </Typography>
                  </Box>
                </TarjetaOpcion>
              ))}
            </Box>
          </>
        )}

        {/* 2. Barbero */}
        {paso === 'barbero' && (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Elige tu barbero
            </Typography>
            {!barberos && <CircularProgress />}
            {barberos?.length === 0 && <Alert severity="info">{MENSAJES_SOLICITUD.SIN_BARBEROS}</Alert>}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              {barberos?.map((b) => (
                <TarjetaOpcion
                  key={b.idEmpleado}
                  elegida={String(b.idEmpleado) === valores.empleadoId}
                  onClick={() => elegirBarbero(b.idEmpleado)}
                >
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>{iniciales(b.nombre)}</Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {b.nombre}
                      </Typography>
                      {b.horaEntrada && b.horaSalida && (
                        <Typography variant="body2" color="text.secondary">
                          Atiende de {b.horaEntrada} a {b.horaSalida}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </TarjetaOpcion>
              ))}
            </Box>
          </>
        )}

        {/* 3. Fecha y hora (CU10) */}
        {paso === 'fecha' && (
          <>
            <Typography variant="h6">Fecha y hora</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {servicio?.nombre} con {barbero?.nombre}. Citas de {DURACION_DEFECTO} minutos.
            </Typography>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 3 }}>
              <IconButton
                aria-label="Días anteriores"
                onClick={() => moverDias(-DIAS_VISIBLES)}
                disabled={desde <= hoy()}
              >
                <ChevronLeftIcon />
              </IconButton>
              <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, flex: 1 }}>
                {buscandoDias && <CircularProgress size={28} sx={{ m: 2 }} />}
                {dias.map((d) => {
                  const { semana, dia, mes } = partesFecha(d.fecha);
                  const { texto, libres } = resumenDia(d);
                  const elegido = d.fecha === valores.fecha;
                  return (
                    <Button
                      key={d.fecha}
                      variant={elegido ? 'contained' : 'outlined'}
                      disabled={libres === 0}
                      onClick={() => cambiar({ fecha: d.fecha, horaInicio: '', horaFin: '' })}
                      sx={{ flexDirection: 'column', minWidth: 92, py: 1, lineHeight: 1.2, textTransform: 'none' }}
                    >
                      <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                        {d.fecha === hoy() ? 'Hoy' : semana}
                      </Typography>
                      <Typography variant="h6" component="span">
                        {dia}
                      </Typography>
                      <Typography variant="caption">
                        {mes} · {texto}
                      </Typography>
                    </Button>
                  );
                })}
              </Box>
              <IconButton aria-label="Días siguientes" onClick={() => moverDias(DIAS_VISIBLES)}>
                <ChevronRightIcon />
              </IconButton>
            </Stack>

            {!valores.fecha && !buscandoDias && (
              <Typography variant="body2" color="text.secondary">
                Selecciona un día para ver los horarios.
              </Typography>
            )}
            {diaElegido?.barbero && (
              <HorasLibresGrid
                horas={diaElegido.barbero.horasLibres}
                ocupadas={diaElegido.barbero.horasOcupadas}
                seleccionada={valores.horaInicio}
                textoVacio="El barbero no tiene horas libres este día. Prueba otra fecha"
                onSeleccionar={(h) => cambiar({ horaInicio: h.horaInicio, horaFin: h.horaFin })}
              />
            )}
            {valores.horaInicio && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                Elegiste: <strong>{formatearFechaLarga(valores.fecha)}</strong>, de{' '}
                <strong>
                  {valores.horaInicio} a {valores.horaFin}
                </strong>
              </Typography>
            )}
          </>
        )}

        {/* 4. Datos (solo sin cuenta) */}
        {paso === 'datos' && (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Tus datos
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ maxWidth: 720 }}>
              <TextField
                label="Nombre completo"
                required
                value={contacto.nombre}
                onChange={(e) => setContacto({ ...contacto, nombre: e.target.value })}
                error={!!erroresContacto.nombre}
                helperText={erroresContacto.nombre ?? ' '}
                slotProps={{ htmlInput: { maxLength: 80 } }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Teléfono / WhatsApp"
                required
                value={contacto.telefono}
                onChange={(e) => setContacto({ ...contacto, telefono: e.target.value })}
                error={!!erroresContacto.telefono}
                helperText={erroresContacto.telefono ?? 'Para avisarte de tu cita'}
                slotProps={{ htmlInput: { maxLength: 15, inputMode: 'tel' } }}
                sx={{ flex: 1 }}
              />
            </Stack>
            {onIniciarSesion && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                ¿Ya tienes cuenta?{' '}
                <Link component="button" type="button" variant="body2" onClick={onIniciarSesion}>
                  Inicia sesión
                </Link>{' '}
                para reservar con ella.
              </Typography>
            )}
          </>
        )}

        {/* 5. Resumen y política del anticipo */}
        {paso === 'resumen' && servicio && (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Resumen y pago
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Paper variant="outlined" sx={{ px: 2, py: 1 }}>
                <FilaResumen etiqueta="Servicio" valor={servicio.nombre} />
                <Divider />
                <FilaResumen etiqueta="Barbero" valor={barbero?.nombre ?? ''} />
                <Divider />
                <FilaResumen
                  etiqueta="Fecha y hora"
                  valor={`${formatearFechaLarga(valores.fecha)} · ${valores.horaInicio}`}
                />
                {invitado && (
                  <>
                    <Divider />
                    <FilaResumen etiqueta="A nombre de" valor={`${contacto.nombre} · ${contacto.telefono}`} />
                  </>
                )}
                <Divider />
                <FilaResumen etiqueta="Precio del servicio" valor={formatearMonto(servicio.precio)} />
                <Divider />
                <FilaResumen
                  etiqueta="Anticipo a pagar ahora (20 %)"
                  valor={formatearMonto(calcularAnticipo(servicio.precio))}
                  fuerte
                />
                <Divider />
                <FilaResumen
                  etiqueta="Saldo en la barbería"
                  valor={formatearMonto(servicio.precio - calcularAnticipo(servicio.precio))}
                />
              </Paper>
              <Box>
                <Alert severity="warning">
                  <AlertTitle>Política de anticipo</AlertTitle>
                  {MENSAJES_SOLICITUD.ANTICIPO} La cita queda <strong>Pendiente</strong> y tienes {MINUTOS_PARA_PAGAR}{' '}
                  minutos para pagarlo por QR; si no lo pagas a tiempo, se cancela sola y el horario queda libre. Una
                  vez pagado, <strong>el anticipo no se devuelve</strong> aunque se cancele la cita.
                </Alert>
                <FormControlLabel
                  sx={{ mt: 2 }}
                  control={<Checkbox checked={aceptaPolitica} onChange={(e) => setAceptaPolitica(e.target.checked)} />}
                  label="Acepto la política de anticipo"
                />
              </Box>
            </Box>
          </>
        )}
      </Box>

      <Divider />
      <Stack direction="row" sx={{ p: { xs: 2, sm: 3 }, justifyContent: 'space-between' }}>
        {indice > 0 ? (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              setErrorGeneral('');
              setIndice((i) => i - 1);
            }}
            disabled={enviando}
          >
            Atrás
          </Button>
        ) : (
          <span />
        )}
        <Button
          variant="contained"
          size="large"
          onClick={continuar}
          disabled={!puedeContinuar() || enviando}
          endIcon={paso === 'resumen' ? <QrCodeIcon /> : <ArrowForwardIcon />}
        >
          {paso !== 'resumen' && 'Continuar'}
          {paso === 'resumen' && (enviando ? 'Enviando...' : 'Confirmar y pagar anticipo')}
        </Button>
      </Stack>
    </Paper>
  );
}
