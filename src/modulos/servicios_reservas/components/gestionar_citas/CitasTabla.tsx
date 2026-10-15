import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState, type ReactNode } from 'react';
import { ETIQUETAS_CANAL, PERMISOS, TOLERANCIA_MINUTOS } from '../../constants/gestionar_citas';
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
  citas: Cita[];
  total: number;
  pagina: number;
  tamano: number;
  tienePermiso: (permiso: string) => boolean;
  onCambiarPagina: (pagina: number) => void;
  onCambiarTamano: (tamano: number) => void;
  onReprogramar: (cita: Cita) => void;
  /** La página pide confirmación y llama al backend. */
  onCambiarEstado: (cita: Cita, accion: AccionEstado) => void;
}

interface OpcionEstado {
  accion: AccionEstado;
  texto: string;
  icono: ReactNode;
  visible: boolean;
  /** Si no se puede todavía, el motivo (la opción se muestra deshabilitada). */
  motivo?: string;
}

/** Agenda del día en orden cronológico, con WhatsApp, reprogramar y cambio de estado por cita. */
export default function CitasTabla({
  citas,
  total,
  pagina,
  tamano,
  tienePermiso,
  onCambiarPagina,
  onCambiarTamano,
  onReprogramar,
  onCambiarEstado,
}: Props) {
  // Menú de estados abierto: la cita y el botón donde se ancla.
  const [menu, setMenu] = useState<{ cita: Cita; ancla: HTMLElement } | null>(null);

  function opcionesDe(cita: Cita): OpcionEstado[] {
    const abierta = !esFinal(cita);
    const opciones: OpcionEstado[] = [
      {
        accion: 'confirmar',
        texto: 'Confirmar',
        icono: <CheckCircleIcon fontSize="small" color="success" />,
        visible: cita.estado === 'PENDIENTE' && tienePermiso(PERMISOS.EDITAR),
      },
      {
        accion: 'atender',
        texto: 'Marcar atendida',
        icono: <DoneAllIcon fontSize="small" color="info" />,
        visible: abierta && tienePermiso(PERMISOS.ATENDER),
        motivo: puedeAtender(cita) ? undefined : 'Disponible cuando la cita comience',
      },
      {
        accion: 'no-asistio',
        texto: 'No asistió',
        icono: <PersonOffIcon fontSize="small" />,
        visible: abierta && tienePermiso(PERMISOS.ATENDER),
        motivo: puedeMarcarNoAsistio(cita) ? undefined : `Disponible ${TOLERANCIA_MINUTOS} min después del inicio`,
      },
      {
        accion: 'cancelar',
        texto: 'Cancelar cita',
        icono: <CancelIcon fontSize="small" color="error" />,
        visible: abierta && tienePermiso(PERMISOS.CANCELAR),
      },
    ];
    return opciones.filter((o) => o.visible);
  }

  return (
    <Paper>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Hora</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Servicio</TableCell>
              <TableCell>Barbero</TableCell>
              <TableCell>Canal</TableCell>
              <TableCell align="right">Anticipo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {citas.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  No hay citas para este día
                </TableCell>
              </TableRow>
            )}
            {citas.map((c) => {
              const whatsapp = enlaceWhatsApp(c);
              const opciones = opcionesDe(c);
              return (
                <TableRow key={c.idReserva} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {c.horaInicio}–{c.horaFin}
                  </TableCell>
                  <TableCell>
                    {c.cliente.nombre}
                    {c.cliente.telefono && (
                      <Typography variant="body2" color="text.secondary">
                        {c.cliente.telefono}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{c.servicio.nombre}</TableCell>
                  <TableCell>{c.barbero?.nombre ?? 'Sin asignar'}</TableCell>
                  <TableCell>{ETIQUETAS_CANAL[c.canal]}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {formatearMonto(c.montoAnticipo)}
                  </TableCell>
                  <TableCell>
                    <EstadoCitaChip estado={c.estado} />
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {whatsapp && (
                      <Tooltip title="Enviar recordatorio por WhatsApp">
                        <IconButton
                          component="a"
                          href={whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ color: '#25D366' }}
                        >
                          <WhatsAppIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {!esFinal(c) && tienePermiso(PERMISOS.EDITAR) && (
                      <Tooltip title="Reprogramar">
                        <IconButton onClick={() => onReprogramar(c)}>
                          <EditCalendarIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {opciones.length > 0 && (
                      <Tooltip title="Cambiar estado">
                        <IconButton onClick={(e) => setMenu({ cita: c, ancla: e.currentTarget })}>
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={pagina}
        rowsPerPage={tamano}
        rowsPerPageOptions={[20, 50, 100]}
        onPageChange={(_, nuevaPagina) => onCambiarPagina(nuevaPagina)}
        onRowsPerPageChange={(e) => onCambiarTamano(Number(e.target.value))}
        labelRowsPerPage="Filas por página"
      />

      <Menu anchorEl={menu?.ancla} open={menu !== null} onClose={() => setMenu(null)}>
        {menu &&
          opcionesDe(menu.cita).map((o) => (
            <MenuItem
              key={o.accion}
              disabled={!!o.motivo}
              onClick={() => {
                onCambiarEstado(menu.cita, o.accion);
                setMenu(null);
              }}
            >
              <ListItemIcon>{o.icono}</ListItemIcon>
              <ListItemText primary={o.texto} secondary={o.motivo} />
            </MenuItem>
          ))}
      </Menu>
    </Paper>
  );
}
