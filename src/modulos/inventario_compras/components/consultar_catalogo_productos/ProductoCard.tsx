import ShoppingBagIcon from '@mui/icons-material/ShoppingBagOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { urlImagenProducto } from '../../api/consultar_catalogo_productos/catalogoProductosApi';
import type { ProductoCatalogo } from '../../types/consultar_catalogo_productos';

interface ProductoCardProps {
  /** Producto a mostrar (viene del endpoint público). */
  producto: ProductoCatalogo;
}

/** CU23 paso 1: imagen, nombre, descripción, precio y disponibilidad (sin revelar el stock exacto). */
export default function ProductoCard({ producto }: ProductoCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 2,
        borderRadius: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      {producto.imagenVersion !== null ? (
        <CardMedia
          component="img"
          image={urlImagenProducto(producto.idProducto, producto.imagenVersion)}
          alt={producto.nombre}
          loading="lazy"
          sx={{ aspectRatio: '4 / 3', objectFit: 'cover', bgcolor: 'action.hover' }}
        />
      ) : (
        <Box
          sx={{
            aspectRatio: '4 / 3',
            bgcolor: 'action.hover',
            color: 'text.disabled',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShoppingBagIcon sx={{ fontSize: 56 }} />
        </Box>
      )}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          {producto.nombre}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40, flexGrow: 1 }}>
          {producto.descripcion?.trim() || 'Sin descripción disponible.'}
        </Typography>

        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
          Bs. {producto.precioVenta.toFixed(2)}
        </Typography>

        <Chip
          size="small"
          label={producto.disponible ? 'Disponible' : 'Agotado'}
          color={producto.disponible ? 'success' : 'default'}
          variant={producto.disponible ? 'filled' : 'outlined'}
          sx={{ alignSelf: 'flex-start' }}
        />
      </CardContent>
    </Card>
  );
}
