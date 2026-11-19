import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarProductos } from '../../modulos/inventario_compras/api/gestionar_productos_insumos/productosApi';
import type { Producto } from '../../modulos/inventario_compras/types/gestionar_productos_insumos';

/** Ítems que se muestran; el resto, en Productos e insumos. */
const MAX = 4;

/**
 * Inicio: productos e insumos activos con el stock en el mínimo o por debajo (CU22). Solo se monta para quien
 * puede consultar el inventario. Si la consulta falla no muestra nada: es un aviso, no un dato crítico.
 */
export default function StockBajoCard() {
  const [items, setItems] = useState<Producto[] | null>(null);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    let vigente = true;
    listarProductos()
      .then((lista) => vigente && setItems(lista
        .filter((p) => p.activo && p.stockActual <= p.stockMinimo)
        .sort((a, b) => a.stockActual / Math.max(a.stockMinimo, 1) - b.stockActual / Math.max(b.stockMinimo, 1))))
      .catch(() => vigente && setFallo(true));
    return () => {
      vigente = false;
    };
  }, []);

  if (fallo) return null;

  return (
    <Card sx={items && items.length > 0 ? { boxShadow: 'none', border: 1, borderColor: 'warning.main' } : undefined}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography component="h2" variant="h6">Stock bajo</Typography>
          {items && items.length > 0 && (
            <Chip size="small" color="warning" variant="outlined" label={`${items.length} ${items.length === 1 ? 'ítem' : 'ítems'}`} />
          )}
        </Box>
        {!items && <><Skeleton height={36} /><Skeleton height={36} /></>}
        {items?.length === 0 && (
          <Typography variant="body2" color="text.secondary">Todo el inventario está por encima de su stock mínimo.</Typography>
        )}
        {items?.slice(0, MAX).map((p) => (
          <Box key={p.idProducto} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, fontSize: 14 }}>
              <Typography component="span" variant="body2" noWrap sx={{ fontWeight: 600 }}>{p.nombre}</Typography>
              <Typography component="span" variant="body2" color="warning.main" sx={{ whiteSpace: 'nowrap' }}>
                {p.stockActual} de {p.stockMinimo} mín.
              </Typography>
            </Box>
            <LinearProgress variant="determinate" color="warning"
              value={Math.min(100, (p.stockActual / Math.max(p.stockMinimo, 1)) * 100)}
              aria-label={`Stock de ${p.nombre}: ${p.stockActual} de un mínimo de ${p.stockMinimo}`} />
          </Box>
        ))}
        <Button component={Link} to="/productos" size="small" endIcon={<ArrowForwardIcon />} sx={{ alignSelf: 'flex-start' }}>
          Ir a productos
        </Button>
      </CardContent>
    </Card>
  );
}
