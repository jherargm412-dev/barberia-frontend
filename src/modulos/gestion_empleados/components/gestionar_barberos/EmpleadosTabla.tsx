import ContentCutIcon from '@mui/icons-material/ContentCut';
import EditIcon from '@mui/icons-material/Edit';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import RestoreIcon from '@mui/icons-material/Restore';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import PersonIdentity from '../../../../shared/components/PersonIdentity';
import { useNavigate } from 'react-router-dom';
import { ROL_BARBERO, TIPOS_CONTRATO } from '../../constants/gestionar_barberos';
import type { EmpleadoResumen } from '../../types/gestionar_barberos';
import EstadoEmpleadoChip from './EstadoEmpleadoChip';

interface Props {
  /** Oculta el estado vacío mientras carga o se muestra un error. */
  mostrarVacio?: boolean;
  empleados: EmpleadoResumen[];
  total: number;
  pagina: number;
  tamano: number;
  onCambiarPagina: (pagina: number) => void;
  onCambiarTamano: (tamano: number) => void;
  onServicios: (empleado: EmpleadoResumen) => void;
  /** Paso 5 (o reactivar): la página pide confirmación y llama al backend. */
  onCambiarEstado: (empleado: EmpleadoResumen) => void;
}

/** CU17 paso 1: datos de empleado combinados con los de su cuenta de usuario. */
export default function EmpleadosTabla({
  mostrarVacio = true,
  empleados,
  total,
  pagina,
  tamano,
  onCambiarPagina,
  onCambiarTamano,
  onServicios,
  onCambiarEstado,
}: Props) {
  const navigate = useNavigate();

  return (
    <Paper elevation={0}>
      <TableContainer>
        <Table sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              <TableCell>Empleado</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Especialidad</TableCell>
              <TableCell>Contrato</TableCell>
              <TableCell>Turno</TableCell>
              <TableCell align="right">Servicios</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {empleados.length === 0 && mostrarVacio && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No se encontraron empleados
                </TableCell>
              </TableRow>
            )}
            {empleados.map((e) => {
              const activo = e.estado === 'ACTIVO';
              const esBarbero = e.roles.includes(ROL_BARBERO);
              return (
                <TableRow key={e.idEmpleado} hover>
                  <TableCell>
                    <PersonIdentity name={e.nombre} secondary={e.correo} />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{e.telefono ?? '—'}</TableCell>
                  <TableCell>{e.roles.join(', ')}</TableCell>
                  <TableCell>{e.especialidad ?? '—'}</TableCell>
                  <TableCell>{TIPOS_CONTRATO.find((t) => t.valor === e.tipoContrato)?.etiqueta}</TableCell>
                  <TableCell>{e.turno ?? '—'}</TableCell>
                  <TableCell align="right">{esBarbero ? e.cantidadServicios : '—'}</TableCell>
                  <TableCell>
                    <EstadoEmpleadoChip estado={e.estado} />
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Editar">
                      <IconButton onClick={() => navigate(`/empleados/${e.idEmpleado}/editar`)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    {/* Paso 4: solo barberos con la cuenta activa. */}
                    {esBarbero && activo && (
                      <Tooltip title="Servicios habilitados">
                        <IconButton onClick={() => onServicios(e)}>
                          <ContentCutIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={activo ? 'Desvincular' : 'Reactivar'}>
                      <IconButton onClick={() => onCambiarEstado(e)} color={activo ? 'default' : 'success'}>
                        {activo ? <PersonOffIcon /> : <RestoreIcon />}
                      </IconButton>
                    </Tooltip>
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
        rowsPerPageOptions={[10, 20, 50]}
        onPageChange={(_, nuevaPagina) => onCambiarPagina(nuevaPagina)}
        onRowsPerPageChange={(ev) => onCambiarTamano(Number(ev.target.value))}
        labelRowsPerPage="Filas por página"
      />
    </Paper>
  );
}
