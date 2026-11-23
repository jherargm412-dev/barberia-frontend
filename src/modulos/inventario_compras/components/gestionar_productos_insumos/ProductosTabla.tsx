import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import InboxIcon from '@mui/icons-material/InboxOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import StorefrontIcon from '@mui/icons-material/StorefrontOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../../../shared/components/EmptyState';
import Table from '../../../../shared/components/ResponsiveTable';
import type { Producto } from '../../types/gestionar_productos_insumos';
import { etiquetaTipo, formatearMonto, stockBajo } from '../../utils/gestionar_productos_insumos/productoForm';
import EstadoProductoChip, { OcultoCatalogoChip } from './EstadoProductoChip';
import ImagenProductoPreview from './ImagenProductoPreview';

const COLUMNAS = ['Ítem', 'Tipo', 'Costo', 'Costo promedio', 'Precio de venta', 'Stock', 'Estado', 'Acciones'];

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
  /** Catálogo público (imagen, mostrar/ocultar): solo productos de venta. */
  onGestionarCatalogo: (producto: Producto) => void;
  /** Sin PRODUCTO_GESTIONAR (Recepcionista) solo se muestra el botón Ver. */
  soloLectura?: boolean;
}

/**
 * CU22 paso 2: ítems con miniatura, tipo, costo, precio, stock frente al mínimo y estado. Ver y Editar quedan a la
 * vista; Ajustar stock, Catálogo e imagen y Habilitar/Deshabilitar van en "Más acciones".
 */
export default function ProductosTabla({
  mostrarVacio = true, productos, onVer, onCambiarEstado, onAjustarStock, onGestionarCatalogo, soloLectura = false,
}: Props) {
  const navigate = useNavigate();
  const [menu, setMenu] = useState<{ producto: Producto; ancla: HTMLElement } | null>(null);

  function elegir(accion: (p: Producto) => void) {
    if (menu) accion(menu.producto);
    setMenu(null);
  }

  return (
    <Paper elevation={0}>
      <TableContainer>
        <Table columns={COLUMNAS} sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              <TableCell>Ítem</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell align="right">Costo</TableCell>
              <TableCell align="right">Costo promedio</TableCell>
              <TableCell align="right">Precio de venta</TableCell>
              <TableCell sx={{ width: 170 }}>Stock</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productos.length === 0 && mostrarVacio && (
              <TableRow>
                <TableCell colSpan={COLUMNAS.length} align="center">
                  <EmptyState icon={<InboxIcon />} title="No hay ítems para mostrar" description="Registra un producto o insumo con «Nuevo ítem», o cambia el filtro." />
                </TableCell>
              </TableRow>
            )}
            {productos.map((p) => {
              const bajo = p.activo && stockBajo(p);
              return (
                <TableRow key={p.idProducto} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <ImagenProductoPreview idProducto={p.idProducto} version={p.imagenVersion} nombre={p.nombre} alto={44} compacto />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.nombre}</Typography>
                        {p.descripcion && <Typography variant="body2" color="text.secondary">{p.descripcion}</Typography>}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{etiquetaTipo(p.tipo)}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>{formatearMonto(p.costo)}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatearMonto(p.costoPromedio ?? p.costo)}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{formatearMonto(p.precioVenta)}</TableCell>
                  <TableCell>
                    {/* Stock frente al mínimo; la alerta solo para ítems activos. */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                      <Typography component="span" variant="body2" sx={{ fontWeight: 600 }} color={bajo ? 'warning.main' : undefined}>
                        {p.stockActual}
                      </Typography>
                      <Typography component="span" variant="caption" color="text.secondary">mín. {p.stockMinimo}</Typography>
                    </Box>
                    <Tooltip title={bajo ? 'Stock en el mínimo o por debajo' : ''}>
                      <LinearProgress variant="determinate" color={bajo ? 'warning' : 'success'}
                        value={Math.min(100, (p.stockActual / Math.max(p.stockMinimo * 2, 1)) * 100)}
                        aria-label={`Stock ${p.stockActual}, mínimo ${p.stockMinimo}`} />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      <EstadoProductoChip activo={p.activo} />
                      {p.tipo === 'VENTA' && !p.enCatalogo && <OcultoCatalogoChip />}
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Ver">
                      <IconButton size="small" aria-label={`Ver ${p.nombre}`} onClick={() => onVer(p)}><VisibilityIcon /></IconButton>
                    </Tooltip>
                    {!soloLectura && (
                      <>
                        <Tooltip title="Editar">
                          <IconButton size="small" aria-label={`Editar ${p.nombre}`} onClick={() => navigate(`/productos/${p.idProducto}/editar`)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Más acciones">
                          <IconButton size="small" aria-label={`Más acciones para ${p.nombre}`} aria-haspopup="menu"
                            onClick={(e) => setMenu({ producto: p, ancla: e.currentTarget })}>
                            <MoreHorizIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={menu?.ancla} open={menu !== null} onClose={() => setMenu(null)}>
        {menu && [
          // Un ítem deshabilitado no se ajusta (el backend también lo rechaza).
          <MenuItem key="ajustar" disabled={!menu.producto.activo} onClick={() => elegir(onAjustarStock)}>
            <ListItemIcon><TuneIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Ajustar stock" secondary={menu.producto.activo ? undefined : 'Habilite el ítem primero'} />
          </MenuItem>,
          menu.producto.tipo === 'VENTA' && (
            <MenuItem key="catalogo" onClick={() => elegir(onGestionarCatalogo)}>
              <ListItemIcon><StorefrontIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Catálogo e imagen" />
            </MenuItem>
          ),
          <MenuItem key="estado" onClick={() => elegir(onCambiarEstado)}>
            <ListItemIcon>{menu.producto.activo ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" color="success" />}</ListItemIcon>
            <ListItemText primary={menu.producto.activo ? 'Deshabilitar' : 'Habilitar'} />
          </MenuItem>,
        ]}
      </Menu>
    </Paper>
  );
}
