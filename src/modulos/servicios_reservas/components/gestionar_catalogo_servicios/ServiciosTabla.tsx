import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
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
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import type { Servicio } from '../../types/gestionar_catalogo_servicios';
import { formatearPorcentaje, formatearPrecio } from '../../utils/gestionar_catalogo_servicios/servicioForm';
import EstadoServicioChip from './EstadoServicioChip';

interface Props {
  /** Oculta el estado vacío mientras carga o se muestra un error. */
  mostrarVacio?: boolean;
  servicios: Servicio[];
  total: number;
  pagina: number;
  tamano: number;
  onCambiarPagina: (pagina: number) => void;
  onCambiarTamano: (tamano: number) => void;
  /** 4a: la página pide confirmación y llama al backend. */
  onCambiarEstado: (servicio: Servicio) => void;
}

/** CU08 paso 3: nombre, precio, porcentaje de comisión y estado de cada servicio. */
export default function ServiciosTabla({
  mostrarVacio = true,
  servicios,
  total,
  pagina,
  tamano,
  onCambiarPagina,
  onCambiarTamano,
  onCambiarEstado,
}: Props) {
  const navigate = useNavigate();

  return (
    <Paper elevation={0}>
      <TableContainer>
        <Table sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell>Servicio</TableCell>
              <TableCell align="right">Precio</TableCell>
              <TableCell align="right">Comisión</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {servicios.length === 0 && mostrarVacio && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No se encontraron servicios
                </TableCell>
              </TableRow>
            )}
            {servicios.map((s) => {
              const habilitado = s.estado === 'HABILITADO';
              return (
                <TableRow key={s.idServicio} hover>
                  <TableCell>
                    {s.nombre}
                    {/* La descripción es opcional: solo se muestra si existe. */}
                    {s.descripcion && (
                      <Typography variant="body2" color="text.secondary">
                        {s.descripcion}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {formatearPrecio(s.precio)}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {formatearPorcentaje(s.porcentajeComision)}
                  </TableCell>
                  <TableCell>
                    <EstadoServicioChip estado={s.estado} />
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Modificar">
                      <IconButton onClick={() => navigate(`/servicios/${s.idServicio}/editar`)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={habilitado ? 'Inhabilitar' : 'Habilitar'}>
                      <IconButton onClick={() => onCambiarEstado(s)} color={habilitado ? 'default' : 'success'}>
                        {habilitado ? <BlockIcon /> : <CheckCircleIcon />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
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
