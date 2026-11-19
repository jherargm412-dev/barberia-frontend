import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarCatalogoProductos } from '../../api/consultar_catalogo_productos/catalogoProductosApi';
import type { ProductoCatalogo } from '../../types/consultar_catalogo_productos';
import ProductoCard from './ProductoCard';

/**
 * Sección de la portada con los productos del catálogo (CU23) en una fila que se desliza con el dedo,
 * la rueda o las flechas. Si no hay productos visibles (o falla la carga) la sección no se muestra.
 */
export default function CarruselProductos() {
  const navigate = useNavigate();
  const pista = useRef<HTMLDivElement>(null);
  const [productos, setProductos] = useState<ProductoCatalogo[]>([]);
  const [puedeIzq, setPuedeIzq] = useState(false);
  const [puedeDer, setPuedeDer] = useState(false);

  useEffect(() => {
    let vigente = true;
    listarCatalogoProductos()
      .then((data) => vigente && setProductos(data))
      .catch(() => vigente && setProductos([]));
    return () => {
      vigente = false;
    };
  }, []);

  // Habilita cada flecha solo si hay contenido hacia ese lado.
  const medir = useCallback(() => {
    const el = pista.current;
    if (!el) return;
    setPuedeIzq(el.scrollLeft > 4);
    setPuedeDer(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, [productos, medir]);

  function desplazar(direccion: 1 | -1) {
    const el = pista.current;
    if (el) el.scrollBy({ left: direccion * el.clientWidth * 0.85, behavior: 'smooth' });
  }

  if (productos.length === 0) return null;

  return (
    <Box component="section" aria-labelledby="portada-productos">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Typography id="portada-productos" variant="h4" component="h2" sx={{ fontWeight: 600 }}>
          Productos
        </Typography>
        <Typography color="text.secondary" sx={{ flex: 1, minWidth: 160 }}>
          De venta en la barbería.
        </Typography>
        <Button onClick={() => navigate('/catalogo/productos')}>Ver todos</Button>
        <IconButton aria-label="Productos anteriores" onClick={() => desplazar(-1)} disabled={!puedeIzq}>
          <ChevronLeftIcon />
        </IconButton>
        <IconButton aria-label="Más productos" onClick={() => desplazar(1)} disabled={!puedeDer}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Box
        ref={pista}
        onScroll={medir}
        tabIndex={0}
        aria-label="Productos, deslice para ver más"
        sx={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: { xs: '78%', sm: '42%', md: '30%', lg: '23%' },
          gap: 3,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollPaddingInline: 4,
          px: 0.5,
          pb: 2,
          // Barra discreta: se puede deslizar sin que ocupe espacio visual.
          scrollbarWidth: 'thin',
          '& > *': { scrollSnapAlign: 'start' },
        }}
      >
        {productos.map((p) => (
          <ProductoCard key={p.idProducto} producto={p} />
        ))}
      </Box>
    </Box>
  );
}
