import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { ServicioResumen } from '../../types/gestionar_catalogo_servicios';

interface ServicioCardProps {
  /** Servicio a mostrar (viene del endpoint público). */
  servicio: ServicioResumen;
}

/**
 * CU13 paso 4: muestra nombre, descripción y precio de un servicio activo.
 * Solo lectura: no hay acciones (reservar requiere iniciar sesión → CU12).
 */
export default function ServicioCard({ servicio }: ServicioCardProps) {
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
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          {servicio.nombre}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, minHeight: 40 }}
        >
          {servicio.descripcion?.trim() || 'Sin descripción disponible.'}
        </Typography>

        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
          Bs. {servicio.precio.toFixed(2)}
        </Typography>
      </CardContent>
    </Card>
  );
}