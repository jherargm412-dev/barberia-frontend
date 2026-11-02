import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { ServicioCatalogo } from '../../types/consultar_servicios';

interface ServicioCardProps {
  /** Servicio a mostrar (viene del endpoint público). */
  servicio: ServicioCatalogo;
  /** Paso 3: lleva a reservar este servicio (CU12 o CU11). Sin él (p. ej. un barbero) no hay acción. */
  onReservar?: (servicio: ServicioCatalogo) => void;
}

/**
 * CU13 paso 1: nombre, descripción y precio de un servicio activo. Paso 3: "Reservar" solo si algún
 * barbero con horario lo presta; si no, se avisa que por ahora no se puede reservar.
 */
export default function ServicioCard({ servicio, onReservar }: ServicioCardProps) {
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

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
          {servicio.descripcion?.trim() || 'Sin descripción disponible.'}
        </Typography>

        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
          Bs. {servicio.precio.toFixed(2)}
        </Typography>
      </CardContent>
      {onReservar && (
        <CardActions sx={{ px: 2, pb: 2 }}>
          {servicio.reservable ? (
            <Button variant="contained" fullWidth onClick={() => onReservar(servicio)}>
              Reservar
            </Button>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Por ahora no hay barberos disponibles para este servicio
            </Typography>
          )}
        </CardActions>
      )}
    </Card>
  );
}
