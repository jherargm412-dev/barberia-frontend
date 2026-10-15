import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InboxIcon from '@mui/icons-material/InboxOutlined';
import EmptyState from '../../../../shared/components/EmptyState';
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
      <TableContainer sx={{ display: { xs: 'none', sm: 'block' } }}>
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
                <TableCell colSpan={5} align="center"><EmptyState icon={<InboxIcon />} title="No se encontraron servicios" description="Prueba con otros filtros o vuelve a consultar más tarde." /></TableCell>
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
                      <IconButton aria-label="Modificar servicio" onClick={() => navigate(`/servicios/${s.idServicio}/editar`)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={habilitado ? 'Inhabilitar' : 'Habilitar'}>
                      <IconButton aria-label={habilitado ? 'Inhabilitar servicio' : 'Habilitar servicio'} onClick={() => onCambiarEstado(s)} color={habilitado ? 'default' : 'success'}>
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
      {/* En celular cada tarjeta conserva todas las columnas y acciones de la tabla. */}
      <Stack component="ul" aria-label="Servicios" spacing={2} sx={{ display: { xs: 'flex', sm: 'none' }, listStyle: 'none', m: 0, p: 2 }}>
        {servicios.length === 0 && mostrarVacio && <Box component="li"><EmptyState icon={<InboxIcon />} title="No se encontraron servicios" description="Prueba con otros filtros o vuelve a consultar más tarde." /></Box>}
        {servicios.map((servicio) => {
          const habilitado = servicio.estado === 'HABILITADO';
          return <Box component="li" key={servicio.idServicio} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2, minWidth: 0 }}>
            <Typography component="h2" variant="subtitle1" sx={{ overflowWrap: 'anywhere', mb: 1 }}>{servicio.nombre}</Typography>
            {servicio.descripcion && <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere', mb: 2 }}>{servicio.descripcion}</Typography>}
            <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 2, mb: 2 }}>
              <Box><Typography component="dt" variant="caption" color="text.secondary">Precio</Typography><Typography component="dd" sx={{ m: 0, fontWeight: 600 }}>{formatearPrecio(servicio.precio)}</Typography></Box>
              <Box><Typography component="dt" variant="caption" color="text.secondary">Comisión</Typography><Typography component="dd" sx={{ m: 0 }}>{formatearPorcentaje(servicio.porcentajeComision)}</Typography></Box>
              <Box sx={{ gridColumn: '1 / -1' }}><Typography component="dt" variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>Estado</Typography><Box component="dd" sx={{ m: 0 }}><EstadoServicioChip estado={servicio.estado} /></Box></Box>
            </Box>
            <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 1, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => navigate(`/servicios/${servicio.idServicio}/editar`)}>Modificar</Button>
              <Button size="small" color={habilitado ? 'inherit' : 'success'} startIcon={habilitado ? <BlockIcon /> : <CheckCircleIcon />} onClick={() => onCambiarEstado(servicio)}>{habilitado ? 'Inhabilitar' : 'Habilitar'}</Button>
            </Stack>
          </Box>;
        })}
      </Stack>
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
