import ShoppingBagIcon from '@mui/icons-material/ShoppingBagOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { sxPrecio, sxTarjetaPublica } from '../../../../shared/styles/publico';
import { urlImagenProducto } from '../../api/consultar_catalogo_productos/catalogoProductosApi';
import type { ProductoCatalogo } from '../../types/consultar_catalogo_productos';

interface ProductoCardProps {
  /** Producto a mostrar (viene del endpoint público). */
  producto: ProductoCatalogo;
}

/** Etiqueta pequeña tipo píldora. */
function Etiqueta({ children, tono }: { children: string; tono: 'disponible' | 'agotado' }) {
  return (
    <Box component="span" sx={tono === 'disponible'
      ? { fontSize: 12, fontWeight: 600, color: 'success.main', bgcolor: 'rgba(76,175,80,0.12)', px: 1.25, py: 0.5, borderRadius: 999 }
      : { fontSize: 12, fontWeight: 600, color: 'text.primary', bgcolor: 'background.paper', border: 1, borderColor: 'divider',
        px: 1.25, py: 0.5, borderRadius: 999 }}>
      {children}
    </Box>
  );
}

/** CU23 paso 1: imagen, nombre, descripción, precio y disponibilidad (sin revelar el stock exacto). */
export default function ProductoCard({ producto }: ProductoCardProps) {
  return (
    <Card sx={sxTarjetaPublica}>
      <Box sx={{ position: 'relative', aspectRatio: '4 / 3', bgcolor: 'action.hover' }}>
        {producto.imagenVersion !== null ? (
          <Box component="img" src={urlImagenProducto(producto.idProducto, producto.imagenVersion)} alt={producto.nombre}
            loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.disabled' }}>
            <ShoppingBagIcon sx={{ fontSize: 56 }} />
          </Box>
        )}
        {!producto.disponible && (
          <Box sx={{ position: 'absolute', top: 14, left: 14 }}>
            <Etiqueta tono="agotado">Agotado</Etiqueta>
          </Box>
        )}
      </Box>
      <Box sx={{ p: 2.75, display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>
        <Typography component="h3" sx={{ fontWeight: 600, fontSize: 18, lineHeight: 1.35 }}>
          {producto.nombre}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: 14, flexGrow: 1 }}>
          {producto.descripcion?.trim() || 'Pregunta por este producto en la barbería.'}
        </Typography>
        <Box sx={{ mt: 1, pt: 1.75, borderTop: 1, borderColor: 'divider', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 1 }}>
          <Typography sx={[sxPrecio, { fontSize: 26, color: 'primary.main' }]}>
            Bs {producto.precioVenta.toFixed(2)}
          </Typography>
          {producto.disponible && <Etiqueta tono="disponible">Disponible</Etiqueta>}
        </Box>
      </Box>
    </Card>
  );
}
