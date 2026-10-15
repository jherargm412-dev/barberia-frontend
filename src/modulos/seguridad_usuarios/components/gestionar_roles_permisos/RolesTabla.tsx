import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { ROL_ADMINISTRADOR } from '../../constants/gestionar_roles_permisos';
import type { Rol } from '../../types/gestionar_roles_permisos';

interface Props {
  roles: Rol[];
  /** Paso 4: la página pide confirmación y llama al backend. */
  onCambiarEstado: (rol: Rol) => void;
}

/** CU03 paso 1: nombre, descripción, estado, permisos y usuarios de cada rol. */
export default function RolesTabla({ roles, onCambiarEstado }: Props) {
  const navigate = useNavigate();

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rol</TableCell>
              <TableCell align="right">Permisos</TableCell>
              <TableCell align="right">Usuarios</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No se encontraron roles
                </TableCell>
              </TableRow>
            )}
            {roles.map((r) => {
              const esAdmin = r.nombre === ROL_ADMINISTRADOR;
              return (
                <TableRow key={r.idRol} hover>
                  <TableCell>
                    {r.nombre}
                    {r.sistema && <Chip label="Sistema" size="small" variant="outlined" sx={{ ml: 1 }} />}
                    {r.descripcion && (
                      <Typography variant="body2" color="text.secondary">
                        {r.descripcion}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">{r.permisos.length}</TableCell>
                  <TableCell align="right">{r.cantidadUsuarios}</TableCell>
                  <TableCell>
                    <Chip
                      label={r.activo ? 'Activo' : 'Inactivo'}
                      color={r.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Editar datos y permisos">
                      <IconButton onClick={() => navigate(`/roles/${r.idRol}/editar`)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Clonar">
                      <IconButton onClick={() => navigate(`/roles/nuevo?clonar=${r.idRol}`)}>
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                    {/* El Administrador no se puede desactivar: el botón no aparece. */}
                    {!esAdmin && (
                      <Tooltip title={r.activo ? 'Desactivar' : 'Activar'}>
                        <IconButton onClick={() => onCambiarEstado(r)} color={r.activo ? 'default' : 'success'}>
                          {r.activo ? <BlockIcon /> : <CheckCircleIcon />}
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
    </Paper>
  );
}
