import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import type { UsuarioResumen } from '../../types/gestionar_usuarios';
import EstadoChip from './EstadoChip';

interface Props {
  usuarios: UsuarioResumen[];
  total: number;
  pagina: number;
  tamano: number;
  puedeEditar: boolean;
  onCambiarPagina: (pagina: number) => void;
  onCambiarTamano: (tamano: number) => void;
}

export default function UsuariosTabla({
  usuarios,
  total,
  pagina,
  tamano,
  puedeEditar,
  onCambiarPagina,
  onCambiarTamano,
}: Props) {
  const navigate = useNavigate();

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            )}
            {usuarios.map((u) => (
              <TableRow key={u.idUsuario} hover>
                <TableCell>{u.nombre}</TableCell>
                <TableCell>{u.correo}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                    {u.roles.map((rol) => (
                      <Chip key={rol} label={rol} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  <EstadoChip estado={u.estado} />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Ver detalle">
                    <IconButton onClick={() => navigate(`/usuarios/${u.idUsuario}`)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  {puedeEditar && (
                    <Tooltip title="Editar">
                      <IconButton onClick={() => navigate(`/usuarios/${u.idUsuario}/editar`)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* El backend usa páginas desde 0, igual que TablePagination. */}
      <TablePagination
        component="div"
        count={total}
        page={pagina}
        rowsPerPage={tamano}
        rowsPerPageOptions={[10, 20, 50]}
        onPageChange={(_, nuevaPagina) => onCambiarPagina(nuevaPagina)}
        onRowsPerPageChange={(e) => onCambiarTamano(Number(e.target.value))}
        labelRowsPerPage="Filas por página"
      />
    </Paper>
  );
}
