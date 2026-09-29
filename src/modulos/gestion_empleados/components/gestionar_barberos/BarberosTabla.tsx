import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
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
import { TIPOS_CONTRATO } from '../../constants/gestionar_barberos';
import type { Barbero, ServicioOpcion } from '../../types/gestionar_barberos';
import EstadoBarberoChip from './EstadoBarberoChip';

/** Cuántas especialidades se muestran como chip; el resto va en un "+N" con tooltip. */
const MAX_CHIPS = 2;

interface Props {
  barberos: Barbero[];
  total: number;
  pagina: number;
  tamano: number;
  onCambiarPagina: (pagina: number) => void;
  onCambiarTamano: (tamano: number) => void;
  /** 3b: la página pide confirmación y llama al backend. */
  onCambiarEstado: (barbero: Barbero) => void;
}

function Especialidades({ servicios }: { servicios: ServicioOpcion[] }) {
  if (servicios.length === 0) {
    // Barberos creados desde Gestionar Usuarios (CU01) todavía sin especialidades.
    return (
      <Typography variant="body2" color="text.secondary">
        Sin asignar
      </Typography>
    );
  }
  const visibles = servicios.slice(0, MAX_CHIPS);
  const resto = servicios.slice(MAX_CHIPS);
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {/* Los nombres largos se recortan con "…"; el tooltip muestra el nombre completo. */}
      {visibles.map((s) => (
        <Tooltip key={s.idServicio} title={s.nombre}>
          <Chip label={s.nombre} size="small" variant="outlined" sx={{ maxWidth: 150 }} />
        </Tooltip>
      ))}
      {resto.length > 0 && (
        <Tooltip title={resto.map((s) => s.nombre).join(', ')}>
          <Chip label={`+${resto.length}`} size="small" />
        </Tooltip>
      )}
    </Box>
  );
}

/** CU16 paso 2: registros de los barberos activos e inactivos. */
export default function BarberosTabla({
  barberos,
  total,
  pagina,
  tamano,
  onCambiarPagina,
  onCambiarTamano,
  onCambiarEstado,
}: Props) {
  const navigate = useNavigate();

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Barbero</TableCell>
              <TableCell>Trabajo</TableCell>
              <TableCell>Especialidades técnicas</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {barberos.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No se encontraron barberos
                </TableCell>
              </TableRow>
            )}
            {barberos.map((b) => {
              const activo = b.estado === 'ACTIVO';
              return (
                <TableRow key={b.idEmpleado} hover>
                  <TableCell>
                    {b.nombre}
                    <Typography variant="body2" color="text.secondary">
                      {b.correo}
                      {b.telefono && ` · ${b.telefono}`}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {b.turno?.nombre ?? 'Sin turno'}
                    <Typography variant="body2" color="text.secondary">
                      {TIPOS_CONTRATO[b.tipoContrato]}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 180, maxWidth: 240 }}>
                    <Especialidades servicios={b.serviciosAutorizados} />
                  </TableCell>
                  <TableCell>
                    <EstadoBarberoChip estado={b.estado} />
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Modificar">
                      <IconButton onClick={() => navigate(`/barberos/${b.idEmpleado}/editar`)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={activo ? 'Suspender' : 'Activar'}>
                      <IconButton onClick={() => onCambiarEstado(b)} color={activo ? 'default' : 'success'}>
                        {activo ? <BlockIcon /> : <CheckCircleIcon />}
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
