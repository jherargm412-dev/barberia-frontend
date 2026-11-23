import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import InboxIcon from '@mui/icons-material/InboxOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PaymentsIcon from '@mui/icons-material/Payments';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useState, type ReactNode } from 'react';
import EmptyState from '../../../../shared/components/EmptyState';
import { FUENTE_TITULOS } from '../../../../shared/styles/publico';
import { ESTADOS_AGENDA } from '../../constants/consultar_agenda';
import { ETIQUETAS_CANAL, PERMISOS, TOLERANCIA_MINUTOS } from '../../constants/gestionar_citas';
import { PERMISOS_ANTICIPO } from '../../constants/registrar_pago_anticipo';
import type { AccionEstado, Cita } from '../../types/gestionar_citas';
import {
  enlaceWhatsApp,
  esFinal,
  formatearMonto,
  puedeAtender,
  puedeMarcarNoAsistio,
} from '../../utils/gestionar_citas/citaForm';
import EstadoCitaChip from './EstadoCitaChip';

interface Props {
  /** Evita confundir carga o error con un resultado vacío. */
  mostrarVacio?: boolean;
  citas: Cita[];
  total: number;
  pagina: number;
  tamano: number;
  tienePermiso: (permiso: string) => boolean;
  onCambiarPagina: (pagina: number) => void;
  onCambiarTamano: (tamano: number) => void;
  onReprogramar: (cita: Cita) => void;
  /** La página abre el diálogo de cobro del anticipo (CU14). */
  onCobrarAnticipo: (cita: Cita) => void;
  onCobrarVenta: (cita: Cita) => void;
  /** La página pide confirmación y llama al backend. */
  onCambiarEstado: (cita: Cita, accion: AccionEstado) => void;
}

interface Opcion {
  clave: string;
  texto: string;
  icono: ReactNode;
  /** Si no se puede todavía, el motivo (la opción se muestra deshabilitada). */
  motivo?: string;
  hacer: () => void;
}

const iniciales = (nombre: string) =>
  nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

/**
 * CU11: citas del día en tarjetas agrupadas en mañana y tarde. Cada tarjeta muestra el siguiente paso según su
 * estado (Confirmar = cobrar anticipo, o Atender) y el resto de acciones en "⋯". Mismos permisos que antes.
 */
export default function CitasLista({
  citas, mostrarVacio = true, total, pagina, tamano, tienePermiso, onCambiarPagina, onCambiarTamano,
  onReprogramar, onCobrarAnticipo, onCobrarVenta, onCambiarEstado,
}: Props) {
  const theme = useTheme();
  const [menu, setMenu] = useState<{ cita: Cita; ancla: HTMLElement } | null>(null);

  const colorEstado = (cita: Cita) => {
    const color = ESTADOS_AGENDA.find((e) => e.valor === cita.estado)?.color ?? 'default';
    return color === 'default' ? theme.palette.text.secondary : theme.palette[color].main;
  };

  const puedeConfirmar = (c: Cita) => c.estado === 'PENDIENTE' && !c.anticipoPagado && tienePermiso(PERMISOS_ANTICIPO.COBRAR);
  const puedeMarcar = (c: Cita) => !esFinal(c) && tienePermiso(PERMISOS.ATENDER);

  /** El siguiente paso de la cita, si lo hay y ya se puede hacer. */
  function accionPrincipal(c: Cita): { texto: string; hacer: () => void } | null {
    if (puedeConfirmar(c) && c.montoAnticipo > 0) return { texto: 'Confirmar', hacer: () => onCobrarAnticipo(c) };
    if (puedeMarcar(c) && puedeAtender(c)) return { texto: 'Atender', hacer: () => onCambiarEstado(c, 'atender') };
    return null;
  }

  function opcionesDe(c: Cita): Opcion[] {
    const opciones: Opcion[] = [];
    const whatsapp = enlaceWhatsApp(c);
    if (whatsapp) {
      opciones.push({ clave: 'whatsapp', texto: 'Recordatorio por WhatsApp', icono: <WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />,
        hacer: () => window.open(whatsapp, '_blank', 'noopener,noreferrer') });
    }
    if (puedeConfirmar(c)) {
      opciones.push({ clave: 'confirmar', texto: 'Confirmar (cobrar anticipo)', icono: <CheckCircleIcon fontSize="small" color="success" />,
        hacer: () => onCobrarAnticipo(c) });
    }
    if ((c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA') && tienePermiso(PERMISOS.VENTA_REGISTRAR)) {
      opciones.push({ clave: 'venta', texto: 'Cobrar venta', icono: <PaymentsIcon fontSize="small" color="primary" />, hacer: () => onCobrarVenta(c) });
    }
    if (!esFinal(c) && tienePermiso(PERMISOS.EDITAR)) {
      opciones.push({ clave: 'reprogramar', texto: 'Reprogramar', icono: <EditCalendarIcon fontSize="small" />, hacer: () => onReprogramar(c) });
    }
    if (puedeMarcar(c)) {
      opciones.push({ clave: 'atender', texto: 'Marcar atendida', icono: <DoneAllIcon fontSize="small" color="info" />,
        motivo: puedeAtender(c) ? undefined : 'Disponible cuando la cita comience', hacer: () => onCambiarEstado(c, 'atender') });
      opciones.push({ clave: 'no-asistio', texto: 'No asistió', icono: <PersonOffIcon fontSize="small" />,
        motivo: puedeMarcarNoAsistio(c) ? undefined : `Disponible ${TOLERANCIA_MINUTOS} min después del inicio`,
        hacer: () => onCambiarEstado(c, 'no-asistio') });
    }
    if (!esFinal(c) && tienePermiso(PERMISOS.CANCELAR)) {
      opciones.push({ clave: 'cancelar', texto: 'Cancelar cita', icono: <CancelIcon fontSize="small" color="error" />,
        hacer: () => onCambiarEstado(c, 'cancelar') });
    }
    return opciones;
  }

  const porHora = [...citas].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  const franjas = [
    { titulo: 'Mañana · antes de las 12:00', citas: porHora.filter((c) => c.horaInicio < '12:00') },
    { titulo: 'Tarde · desde las 12:00', citas: porHora.filter((c) => c.horaInicio >= '12:00') },
  ].filter((f) => f.citas.length > 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {mostrarVacio && citas.length === 0 && (
        <Paper sx={{ py: 2 }}>
          <EmptyState icon={<InboxIcon />} title="No hay citas para este día" description="Prueba con otros filtros o vuelve a consultar más tarde." />
        </Paper>
      )}

      {franjas.map((franja) => (
        <Box component="section" key={franja.titulo} aria-label={franja.titulo} sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Typography component="h2" sx={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'text.secondary' }}>
            {franja.titulo}
          </Typography>
          {franja.citas.map((c) => {
            const principal = accionPrincipal(c);
            const opciones = opcionesDe(c);
            return (
              <Paper key={c.idReserva} component="article"
                sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2.25 }, flexWrap: 'wrap', p: { xs: 2, sm: 2.25 },
                  borderLeft: `3px solid ${colorEstado(c)}`, borderRadius: 3 }}>
                <Box sx={{ minWidth: 76 }}>
                  <Typography sx={{ fontFamily: FUENTE_TITULOS, fontSize: 24, fontWeight: 500, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
                    {c.horaInicio.slice(0, 5)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">hasta {c.horaFin.slice(0, 5)}</Typography>
                </Box>

                <Box sx={{ flex: '1 1 220px', minWidth: 0, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'action.hover', color: 'text.secondary', fontSize: 13,
                    fontWeight: 600, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    {iniciales(c.cliente.nombre)}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{c.cliente.nombre}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                      {c.servicio.nombre} · {c.barbero?.nombre ?? 'Sin barbero'}
                      {c.cliente.telefono && ` · ${c.cliente.telefono}`}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Chip size="small" variant="outlined" label={ETIQUETAS_CANAL[c.canal]} />
                  {c.montoAnticipo > 0 && (
                    <Chip size="small" variant="outlined" color={c.anticipoPagado ? 'success' : 'default'}
                      label={c.anticipoPagado ? `Anticipo ${formatearMonto(c.montoAnticipo)} pagado` : `Anticipo ${formatearMonto(c.montoAnticipo)}`} />
                  )}
                  <EstadoCitaChip estado={c.estado} />
                </Box>

                <Box sx={{ display: 'flex', gap: 0.75, ml: 'auto' }}>
                  {principal && (
                    <Button variant="outlined" color="primary" onClick={principal.hacer} sx={{ borderRadius: 999, borderColor: 'primary.main' }}>
                      {principal.texto}
                    </Button>
                  )}
                  {opciones.length > 0 && (
                    <IconButton aria-label={`Más acciones para la cita de ${c.cliente.nombre}`} onClick={(e) => setMenu({ cita: c, ancla: e.currentTarget })}
                      sx={{ border: 1, borderColor: 'divider' }}>
                      <MoreHorizIcon />
                    </IconButton>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      ))}

      {total > 0 && (
        <Paper>
          <TablePagination component="div" count={total} page={pagina} rowsPerPage={tamano} rowsPerPageOptions={[20, 50, 100]}
            onPageChange={(_, nueva) => onCambiarPagina(nueva)} onRowsPerPageChange={(e) => onCambiarTamano(Number(e.target.value))}
            labelRowsPerPage="Citas por página" />
        </Paper>
      )}

      <Menu anchorEl={menu?.ancla} open={menu !== null} onClose={() => setMenu(null)}>
        {menu && opcionesDe(menu.cita).map((o, i, todas) => [
          // Separa las acciones de contacto/cobro de los cambios de estado.
          i > 0 && o.clave === 'atender' && todas[i - 1].clave !== 'atender' ? <Divider key={`div-${o.clave}`} /> : null,
          <MenuItem key={o.clave} disabled={!!o.motivo} onClick={() => { o.hacer(); setMenu(null); }}>
            <ListItemIcon>{o.icono}</ListItemIcon>
            <ListItemText primary={o.texto} secondary={o.motivo} />
          </MenuItem>,
        ])}
      </Menu>
    </Box>
  );
}
