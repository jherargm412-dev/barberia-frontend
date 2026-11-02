import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type ReactNode } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { listarAjustes } from '../../api/gestionar_productos_insumos/productosApi';
import type { AjusteStock, Producto } from '../../types/gestionar_productos_insumos';
import {
  datosAjuste,
  etiquetaTipo,
  formatearFecha,
  formatearMonto,
  stockBajo,
} from '../../utils/gestionar_productos_insumos/productoForm';
import EstadoProductoChip from './EstadoProductoChip';

interface Props {
  /** null = diálogo cerrado. */
  producto: Producto | null;
  onCerrar: () => void;
}

/** Un dato del detalle: etiqueta arriba, valor abajo. */
function Dato({ etiqueta, children, ancho = false }: { etiqueta: string; children: ReactNode; ancho?: boolean }) {
  return (
    <Box sx={ancho ? { gridColumn: '1 / -1' } : undefined}>
      <Typography component="dt" variant="caption" color="text.secondary">{etiqueta}</Typography>
      <Box component="dd" sx={{ m: 0, overflowWrap: 'anywhere' }}>{children}</Box>
    </Box>
  );
}

/** Historial de ajustes de stock del ítem (inventario inicial, pérdidas y vencidos). */
function HistorialAjustes({ idProducto }: { idProducto: number }) {
  const [ajustes, setAjustes] = useState<AjusteStock[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    listarAjustes(idProducto)
      .then(setAjustes)
      .catch((err) => setError(obtenerError(err).mensaje));
  }, [idProducto]);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!ajustes) return <LinearProgress />;
  if (ajustes.length === 0) {
    return <Typography variant="body2" color="text.secondary">Sin ajustes de stock.</Typography>;
  }
  return (
    <List dense disablePadding>
      {ajustes.map((a) => {
        const { etiqueta, suma } = datosAjuste(a.tipo);
        return (
          <ListItem key={a.idAjusteStock} disableGutters>
            <ListItemText
              primary={`${etiqueta}: ${suma ? '+' : '−'}${a.cantidad} (${a.stockAnterior} → ${a.stockNuevo})`}
              secondary={`${formatearFecha(a.fecha)}${a.observacion ? ` · ${a.observacion}` : ''}`}
            />
          </ListItem>
        );
      })}
    </List>
  );
}

/** CU22 flujo Consultar: muestra todos los detalles del ítem y su historial de ajustes. */
export default function ProductoDetalleDialog({ producto, onCerrar }: Props) {
  return (
    <Dialog open={producto !== null} onClose={onCerrar} fullWidth maxWidth="sm" aria-labelledby="detalle-producto-titulo">
      {producto && (
        <>
          <DialogTitle id="detalle-producto-titulo">{producto.nombre}</DialogTitle>
          <DialogContent>
            {producto.activo && stockBajo(producto) && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                El stock actual ({producto.stockActual}) está en el mínimo o por debajo ({producto.stockMinimo}).
              </Alert>
            )}
            <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 2 }}>
              <Dato etiqueta="Tipo">{etiquetaTipo(producto.tipo)}</Dato>
              <Dato etiqueta="Estado"><EstadoProductoChip activo={producto.activo} /></Dato>
              <Dato etiqueta="Descripción" ancho>{producto.descripcion ?? '—'}</Dato>
              <Dato etiqueta="Costo">{formatearMonto(producto.costo)}</Dato>
              <Dato etiqueta="Precio de venta">{formatearMonto(producto.precioVenta)}</Dato>
              <Dato etiqueta="Stock actual">{producto.stockActual}</Dato>
              <Dato etiqueta="Stock mínimo">{producto.stockMinimo}</Dato>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Ajustes de stock</Typography>
            <HistorialAjustes idProducto={producto.idProducto} />
          </DialogContent>
          <DialogActions>
            <Button onClick={onCerrar}>Cerrar</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
