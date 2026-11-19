import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { FUENTE_TITULOS, sxPildora, sxPrecio, sxTarjetaPublica } from '../../../../shared/styles/publico';
import type { ServicioCatalogo } from '../../types/consultar_servicios';

interface ServicioCardProps {
  /** Servicio a mostrar (viene del endpoint público). */
  servicio: ServicioCatalogo;
  /** Paso 3: lleva a reservar este servicio (CU12 o CU11). Sin él (p. ej. un barbero) no hay acción. */
  onReservar?: (servicio: ServicioCatalogo) => void;
  /** Tarjeta grande con fondo dorado tenue (la portada destaca el servicio más completo). */
  destacado?: boolean;
}

/**
 * CU13 paso 1: nombre, descripción y precio de un servicio activo. Paso 3: "Reservar" solo si algún
 * barbero con horario lo presta; si no, se avisa que por ahora no se puede reservar.
 */
export default function ServicioCard({ servicio, onReservar, destacado = false }: ServicioCardProps) {
  const descripcion = servicio.descripcion?.trim();
  return (
    <Card
      sx={[
        sxTarjetaPublica,
        { p: { xs: 2.75, md: destacado ? 4 : 3.5 }, gap: 1.5 },
        destacado && ((theme) => ({
          borderColor: 'primary.main',
          background: `linear-gradient(135deg, rgba(201,164,92,0.16) 0%, ${(theme.vars ?? theme).palette.background.paper} 65%)`,
        })),
      ]}
    >
      {destacado && (
        <Box component="span" sx={{ alignSelf: 'flex-start', bgcolor: 'primary.main', color: 'primary.contrastText',
          fontSize: 11.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', px: 1.5, py: 0.6, borderRadius: 999 }}>
          Destacado
        </Box>
      )}
      <Typography component="h3" sx={destacado
        ? { fontFamily: FUENTE_TITULOS, fontWeight: 600, textTransform: 'uppercase', fontSize: { xs: 26, md: 32 }, lineHeight: 1.1 }
        : { fontWeight: 600, fontSize: 19, lineHeight: 1.35 }}>
        {servicio.nombre}
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: destacado ? 16 : 14.5, flexGrow: 1 }}>
        {descripcion || 'Pregunta por este servicio en la barbería.'}
      </Typography>

      <Box sx={{ mt: 1, pt: destacado ? 0 : 2, borderTop: destacado ? 0 : 1, borderColor: 'divider', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Typography sx={[sxPrecio, { fontSize: destacado ? { xs: 32, md: 40 } : 28, color: destacado ? 'primary.main' : 'text.primary' }]}>
          Bs {servicio.precio.toFixed(2)}
        </Typography>
        {onReservar && (servicio.reservable ? (
          <Button variant={destacado ? 'contained' : 'text'} onClick={() => onReservar(servicio)}
            sx={destacado ? sxPildora : { fontSize: 15 }}>
            Reservar
          </Button>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 170, textAlign: 'right' }}>
            Por ahora no hay barberos disponibles
          </Typography>
        ))}
      </Box>
    </Card>
  );
}
