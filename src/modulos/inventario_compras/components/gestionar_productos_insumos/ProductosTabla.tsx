import InboxIcon from '@mui/icons-material/InboxOutlined';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import TuneIcon from '@mui/icons-material/Tune';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../../../shared/components/EmptyState';
import Table from '../../../../shared/components/ResponsiveTable';
import type { Producto } from '../../types/gestionar_productos_insumos';
import { etiquetaTipo, formatearMonto, stockBajo } from '../../utils/gestionar_productos_insumos/productoForm';
import EstadoProductoChip from './EstadoProductoChip';

const COLUMNAS = ['Tipo', 'Nombre', 'Costo', 'Precio de venta', 'Stock actual', 'Stock mínimo', 'Estado', 'Acciones'];

interface Props {
  /** Oculta el estado vacío mientras carga o se muestra un error. */
  mostrarVacio?: boolean;
  productos: Producto[];
  /** Flujo Consultar: la página abre el detalle. */
  onVer: (producto: Producto) => void;
  /** Flujos Habilitar / Deshabilitar: la página pide confirmación y llama al backend. */
  onCambiarEstado: (producto: Producto) => void;
  /** Flujo Ajustar stock: la página abre el diálogo. */
  onAjustarStock: (producto: Producto) => void;
}

/**
 * CU22 paso 2: tipo, nombre, costo, precio de venta, stock mínimo y estado de cada ítem.
 * También el stock actual, con la alerta cuando llega al mínimo.
 */
export default function ProductosTabla({ mostrarVacio = true, productos, onVer, onCambiarEstado, onAjustarStock }: Props) {
  const navigate = useNavigate();

  return (
    <Paper elevation={0}>
      <TableContainer>
        <Table columns={COLUMNAS} sx={{ minWidth: 860 }}>
          <TableHead>
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell align="right">Costo</TableCell>
              <TableCell align="right">Precio de venta</TableCell>
              <TableCell align="right">Stock actual</TableCell>
              <TableCell align="right">Stock mínimo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productos.length === 0 && mostrarVacio && (
              <TableRow>
                <TableCell colSpan={COLUMNAS.length} align="center">
                  <EmptyState icon={<InboxIcon />} title="No hay ítems registrados" description="Registra el primer producto o insumo con el botón «Nuevo ítem»." />
                </TableCell>
              </TableRow>
            )}
            {productos.map((p) => (
              <TableRow key={p.idProducto} hover>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{etiquetaTipo(p.tipo)}</TableCell>
                <TableCell>
                  {p.nombre}
                  {p.descripcion && (
                    <Typography variant="body2" color="text.secondary">
                      {p.descripcion}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatearMonto(p.costo)}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatearMonto(p.precioVenta)}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  {/* Alerta de stock mínimo: solo para ítems activos. */}
                  {p.activo && stockBajo(p) && (
                    <Tooltip title="Stock en el mínimo o por debajo">
                      <WarningAmberIcon color="warning" fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                    </Tooltip>
                  )}
                  <Typography component="span" sx={{ fontWeight: 600 }} color={p.activo && stockBajo(p) ? 'warning.main' : undefined}>
                    {p.stockActual}
                  </Typography>
                </TableCell>
                <TableCell align="right">{p.stockMinimo}</TableCell>
                <TableCell>
                  <EstadoProductoChip activo={p.activo} />
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title="Ver">
                    <IconButton size="small" aria-label="Ver ítem" onClick={() => onVer(p)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Ajustar stock">
                    <IconButton size="small" aria-label="Ajustar stock" onClick={() => onAjustarStock(p)}>
                      <TuneIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton size="small" aria-label="Editar ítem" onClick={() => navigate(`/productos/${p.idProducto}/editar`)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={p.activo ? 'Deshabilitar' : 'Habilitar'}>
                    <IconButton
                      size="small"
                      aria-label={p.activo ? 'Deshabilitar ítem' : 'Habilitar ítem'}
                      onClick={() => onCambiarEstado(p)}
                      color={p.activo ? 'default' : 'success'}
                    >
                      {p.activo ? <BlockIcon /> : <CheckCircleIcon />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
